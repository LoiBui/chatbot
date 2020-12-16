# coding: utf-8

import os,sys,datetime,logging,random
import re,sre_constants
from ucf.utils.models import UCFMDLLoginHistory,UCFMDLLoginHistoryDetail
from ucf.utils.ucfutil import *
from ucf.config.ucfconfig import *
from ucf.utils.helpers import *
from ucf.pages.operator import OperatorUtils
from ucf.pages.operator_group import OperatorGroupUtils
from ucf.pages.profile import ProfileUtils, PasswordChangeValidator
from ucf.pages.access_apply import AccessApplyUtils
from ucf.pages.login_history import LoginHistoryUtils
import sateraito_func
import sateraito_inc
import oem_func
from simplejson.encoder import JSONEncoder
from google.appengine.api import taskqueue

#+++++++++++++++++++++++++++++++++++++++
#+++ ログイン認証
#+++++++++++++++++++++++++++++++++++++++
def authLogin(helper, login_user_domain, login_id, login_password, captcha_token=None, captcha_response=None, is_set_next_auto_login=False, is_auto_login=False, temporary_login_action_key=None, is_not_update_login_history=False, mobile_device_id_deal_type=None, mobile_device_id=None, is_nocheck_password=False, is_nocheck_two_factor_auth=False, two_factor_auth_code='', is_with_password_change=False, new_password='', matrixauth_random_key='', is_auth_with_client_certificate_cn=False, client_cert_code='', client_cert_subjectkey='', client_cert_subject=''):
  isLogin = False
  login_result = {}
  isAuthSuccess = False
  is_need_client_certificate = False

  login_id = UcfUtil.nvl(login_id)
  login_id = login_id.strip()
  login_password = UcfUtil.nvl(login_password)
  login_password = login_password.strip()
  login_email = ''
  login_immutable_id = ''
  login_name = ''
  login_access_authority = ''
  login_delegate_function = ''
  login_delegate_management_groups = ''

  if not is_auth_with_client_certificate_cn:
    login_id_split = login_id.split('@')
    if len(login_id_split) < 2 and login_user_domain != '':
      login_id_withdomain = login_id + '@' + login_user_domain
    else:
      login_id_withdomain = login_id
    login_id_withoutdomain = login_id_split[0]
  else:
    login_id_withdomain = login_id

  temporary_login_action_key = UcfUtil.nvl(temporary_login_action_key)

  ###########################################################

  ##################################################
  profile_vo = None
  user_vo = None
  login_auth_type = ''

  ##################################################
  # ユーザとプロファイルと認証タイプを確定する処理

  # デフォルトプロファイル取得
  dept_profile = getDeptProfile(helper)
  dept_profile_id = ''
  # デフォルトプロファイルからログインタイプを取得
  if dept_profile is not None:
    login_auth_type = dept_profile['login_type']
    # return False 時などにデフォルトプロファイルが適用されていなかったのでここで初期値としてセット 2012.11.26
    login_result['profile_vo'] = dept_profile
    profile_vo = dept_profile
    dept_profile_id = dept_profile['profile_id']
  else:
    login_auth_type = 'OPE'
    dept_profile_id = ''


  # まずはデフォルトプロファイルに基づいたログインタイプにてユーザ取得
  user_vo = {}
  is_user_type_1 = False
  is_user_type_2 = False
  is_user_type_cn = False

  # クライアント証明書認証（クライアント証明書のページから来た場合のみ）…ログインタイプによらずとりあえず取得
  if is_auth_with_client_certificate_cn:
    # プロファイルからクライアント証明書情報を取得
    user_id_by_cn = ''
    user_id_type = ''
    if profile_vo is not None:
      client_certificate_info = {}
      client_certificate_info_json = profile_vo.get('client_certificate_info', '')
      if client_certificate_info_json != '':
        client_certificate_info = JSONDecoder().decode(client_certificate_info_json)
      reg_pattern = client_certificate_info.get('login_type_cert_pattern', '')
      group_index = UcfUtil.toInt(client_certificate_info.get('login_type_cert_pattern_group_index', ''))
      user_id_type = client_certificate_info.get('login_type_cert_user_id_type', '')
      # コモンネーム（CN）から正規表現でメールアドレスあるいは社員IDを取得
      if reg_pattern != '' and user_id_type in ['mail_address', 'employee_id'] and group_index > 0:
        logging.info('reg_pattern=' + reg_pattern)
        logging.info('user_id_type=' + user_id_type)
        logging.info('group_index=' + str(group_index))
        logging.info('client_certificate_cn=' + login_id)
        try:
          m = re.search(reg_pattern, login_id.strip())
          if m != None:
            user_id_by_cn = m.group(group_index)
          else:
            logging.warning('no match!!')
        except IndexError, ex:
          logging.exception(ex)
        except sre_constants.error, ex:
          logging.exception(ex)
        #except Exception, ex:
        #	logging.exception(ex)
        logging.info('user_id_by_cn=' + user_id_by_cn)

    # メールアドレスで検索するパターン
    if user_id_by_cn != '' and user_id_type == 'mail_address':
      login_id = user_id_by_cn	# ログイン履歴用
      user_vo = OperatorUtils.getUserByOperatorID(helper, user_id_by_cn)
    ## 社員IDで検索するパターン
    #elif user_id_by_cn != '' and user_id_type == 'employee_id':
    #	login_id = user_id_by_cn	# ログイン履歴用
    #	user_vo = OperatorUtils.getUserByEmployeeID(helper, user_id_by_cn)
    # コモンネーム（CN）自体で検索するパターン
    else:
      user_vo = OperatorUtils.getUserByClientCertificateCN(helper, login_id)

    if user_vo is not None:
      is_user_type_cn = True
    # ここで取得できなければもうエラー確定でOK（証明書のCNが正しくないパターン）
    else:
      login_result['error_code'] = 'CLIENT_CERTIFICATE_CN_FAILED'
      isLogin = False
      # ログイン履歴インサート
      if temporary_login_action_key == '':
        insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
      return isLogin, login_result

  # デフォルト認証タイプ=CERT…is_auth_with_client_certificate_cn=False で認証タイプがCERTの場合はここからログインできないか、
  # ユーザーごとのプロファイルでヒモづいている別のログインタイプでの認証なのでここではユーザーIDか社員IDで取得しておく
  elif login_auth_type == 'CERT':
    #logging.info('get operator start.... login_auth_type=' + login_auth_type + ' login_id=' + login_id_withdomain)
    user_vo = OperatorUtils.getUserByOperatorID(helper, login_id_withdomain)
    #logging.info('get operator end.')
    if user_vo is not None:
      is_user_type_1 = True
    #else:
    #	#logging.info('get operator start.... login_auth_type=' + login_auth_type + ' login_id=' + login_id)
    #	user_vo = OperatorUtils.getUserByEmployeeID(helper, login_id)
    #	#logging.info('get operator end.')
    #	if user_vo is not None:
    #		is_user_type_2 = True

  # デフォルト認証タイプ=OPE
  # デフォルト認証タイプ=DCARD
  # ユーザID⇒社員IDの順にユーザを取得（取得できたほうを使って次のチェックへ）
  elif login_auth_type in ['OPE','DCARD']:
    #logging.info('get operator start.... login_auth_type=' + login_auth_type + ' login_id=' + login_id_withdomain)
    user_vo = OperatorUtils.getUserByOperatorID(helper, login_id_withdomain)
    #logging.info('get operator end.')
    if user_vo is not None:
      is_user_type_1 = True
    #else:
    #	# メールプロキシ社員ID認証対応…ドメインなし対応
    #	if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MAILPROXY:
    #		user_vo = OperatorUtils.getUserByEmployeeID(helper, login_id_withoutdomain)
    #	# それ以外のログイン
    #	else:
    #		user_vo = OperatorUtils.getUserByEmployeeID(helper, login_id)
    #	if user_vo is not None:
    #		is_user_type_2 = True

  ## デフォルト認証タイプ=OPE1
  ## 社員ID⇒ユーザIDの順にユーザを取得（取得できたほうを使って次のチェックへ）
  #elif login_auth_type == 'OPE1':
  #	# メールプロキシ社員ID認証対応…ドメインなし対応
  #	if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MAILPROXY:
  #		user_vo = OperatorUtils.getUserByEmployeeID(helper, login_id_withoutdomain)
  #	# それ以外のログイン
  #	else:
  #		user_vo = OperatorUtils.getUserByEmployeeID(helper, login_id)
  #	if user_vo is not None:
  #		is_user_type_2 = True
  #	else:
  #		#logging.info('get operator start.... login_auth_type=' + login_auth_type + ' login_id=' + login_id_withdomain)
  #		user_vo = OperatorUtils.getUserByOperatorID(helper, login_id_withdomain)
  #		#logging.info('get operator end.')
  #		if user_vo is not None:
  #			is_user_type_1 = True


  # 認証タイプがCERTじゃないのにユーザVoが取得できなければ認証失敗
  #if user_vo is None:
  if login_auth_type not in ['CERT'] and user_vo is None:
    login_result['error_code'] = 'ID_FAILED'
    isLogin = False
    # ログイン履歴インサート
    if temporary_login_action_key == '':
      insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
    return isLogin, login_result

  # 社員IDとオペレータIDが同じ場合の処理
  if user_vo is not None and (is_user_type_1 or is_user_type_2):
    operator_id_withdomain = user_vo.get('operator_id', '')
    operator_id = operator_id_withdomain.split('@')[0]
    employee_id = user_vo.get('employee_id', '')
    employee_id_withdomain = ''
    if employee_id != '':
      employee_id_split = employee_id.split('@')
      if len(employee_id_split) < 2 and login_user_domain != '':
        employee_id_withdomain = employee_id + '@' + login_user_domain
      else:
        employee_id_withdomain = employee_id
    if employee_id_withdomain == operator_id_withdomain:
      is_user_type_1 = True
      is_user_type_2 = True

  user_profile = None
  # ユーザにヒモづいたプロファイルを取得
  if user_vo is not None:
    user_profile = getActiveProfile(helper, user_vo)

    # ユーザプロファイルが取得できれば（デフォルトプロファイルと違う場合）改めてユーザデータ取得時のキーとログインタイプの整合性をチェック
    if user_profile is not None and user_profile.get('profile_id', '') != dept_profile_id:

      is_re_select = False
      # キーが違っていたらユーザデータを取得しなおし
      # 証明書認証時は↑でとっているので再取得はなしでOK（ユーザーがいないものはいない！ということ）
      if is_auth_with_client_certificate_cn:
        pass
      #elif not is_user_type_2 and UcfUtil.getHashStr(user_profile, 'login_type') == 'OPE1':
      #	# 社員IDでユーザを再取得
      #	# メールプロキシ社員ID認証対応…ドメインなし対応
      #	if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MAILPROXY:
      #		user_vo = OperatorUtils.getUserByEmployeeID(helper, login_id_withoutdomain)
      #	# それ以外のログイン
      #	else:
      #		user_vo = OperatorUtils.getUserByEmployeeID(helper, login_id)
      #	is_user_type_2 = True
      #	is_re_select = True
      elif not is_user_type_1 and UcfUtil.getHashStr(user_profile, 'login_type') in ['OPE','DCARD']:
        # ユーザIDでユーザを再取得
        #logging.info('get operator start.... login_auth_type=' + UcfUtil.getHashStr(user_profile, 'login_type') + ' login_id=' + login_id_withdomain)
        user_vo = OperatorUtils.getUserByOperatorID(helper, login_id_withdomain)
        #logging.info('get operator end.')
        is_user_type_1 = True
        is_re_select = True

      # 再取得施行時、取得できなければ認証失敗とする
      if is_re_select and user_vo is None:
        login_result['error_code'] = 'ID_FAILED'
        isLogin = False
        # ログイン履歴インサート
        if temporary_login_action_key == '':
          insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
        return isLogin, login_result

      # 再取得施行時、ユーザにヒモづいたプロファイルを改めて取得
      if is_re_select:
        user_profile = getActiveProfile(helper, user_vo)
        # プロファイルとユーザ取得キーの整合性チェック.合わなければユーザ取得失敗とする
        login_auth_type = ''
        if user_profile is not None:
          if not is_user_type_cn and UcfUtil.getHashStr(user_profile, 'login_type') == 'CERT':
            login_result['error_code'] = 'CLIENT_CERTIFICATE_CN_FAILED'
            isLogin = False
            # ログイン履歴インサート
            if temporary_login_action_key == '':
              insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
            return isLogin, login_result
          #elif not is_user_type_2 and UcfUtil.getHashStr(user_profile, 'login_type') == 'OPE1':
          #	login_result['error_code'] = 'ID_FAILED'
          #	isLogin = False
          #	# ログイン履歴インサート
          #	if temporary_login_action_key == '':
          #		insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
          #	return isLogin, login_result
          elif not is_user_type_1 and UcfUtil.getHashStr(user_profile, 'login_type') in ['OPE','DCARD']:
            login_result['error_code'] = 'ID_FAILED'
            isLogin = False
            # ログイン履歴インサート
            if temporary_login_action_key == '':
              insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
            return isLogin, login_result
        elif not is_user_type_1:	# プロファイルなし=OPE認証なので
          login_result['error_code'] = 'ID_FAILED'
          isLogin = False
          # ログイン履歴インサート
          if temporary_login_action_key == '':
            insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
          return isLogin, login_result

  ##################################################
  # プロファイル決定＆ユーザVo＆認証タイプ決定（profile_vo, user_vo, login_auth_type）
  if user_profile is not None:
    profile_vo = user_profile
  else:
    profile_vo = dept_profile
  if profile_vo is not None:
    login_auth_type = profile_vo['login_type']
  else:
    login_auth_type = 'OPE'
  # ユーザとプロファイルと認証タイプを確定する処理 End.
  ##################################################

  # ユーザIDタイプの最終チェック
  if not is_user_type_cn and login_auth_type == 'CERT':
    # ここにくるのはプロファイルの設定が正しくないのでメッセージ変更（デフォルトプロファイルではなくユーザーのプロファイルにてログインタイプ「CERT」を指定してしまっているパターン
    #login_result['error_code'] = 'CLIENT_CERTIFICATE_CN_FAILED'
    login_result['error_code'] = 'CLIENT_CERTIFICATE_FAILED'
    isLogin = False
    # ログイン履歴インサート
    if temporary_login_action_key == '':
      insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
    return isLogin, login_result
  #elif not is_user_type_2 and login_auth_type == 'OPE1':
  #	login_result['error_code'] = 'ID_FAILED'
  #	isLogin = False
  #	# ログイン履歴インサート
  #	if temporary_login_action_key == '':
  #		insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
  #	return isLogin, login_result
  elif not is_user_type_1 and login_auth_type in ['OPE','DCARD']:
    login_result['error_code'] = 'ID_FAILED'
    isLogin = False
    # ログイン履歴インサート
    if temporary_login_action_key == '':
      insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)
    return isLogin, login_result


#	logging.info('login_auth_type=' + login_auth_type)
#	logging.info(profile_vo)
#	logging.info(user_vo)
  isLogin = False
  isUserStatusNG = False

  # ユーザマスタ設定に基づくチェック （パスワード認証後からここに移動 2014.02.16）
  if user_vo is not None:
    # アカウント停止フラグ
    if UcfUtil.getHashStr(user_vo, 'account_stop_flag') == 'STOP':
      login_result['error_code'] = 'ACCOUNT_STOP'
      isUserStatusNG = True

    # ログインロック
    elif UcfUtil.getHashStr(user_vo, 'login_lock_flag') == 'LOCK':
      if UcfUtil.getHashStr(user_vo, 'login_lock_expire') != '' and UcfUtil.getDateTime(UcfUtil.getHashStr(user_vo, 'login_lock_expire')) >= UcfUtil.getNowLocalTime(helper._timezone):
        login_result['error_code'] = 'LOGIN_LOCK'
        isUserStatusNG = True


  # 自動ログインによるアクセスの場合に、プロファイルにより自動ログインしてよいかをチェック
  if not isUserStatusNG and is_auto_login:

    # SSOログインクライアントアプリなら
    if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_SSOLOGINCLIENT:
      # 自動ログイン禁止フラグをチェック 2014.11.12 T.ASAO
      if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'is_login_client_forbidden_auto_login') == 'FORBIDDEN':
        login_result['error_code'] = 'AUTOLOGIN_INVALID'
        isLogin = False
        isUserStatusNG = True
        isAuthSuccess = True		# 自動ログインでNGになったとしても、ID、パスワード認証だけは通ったフラグを立てておく（ログイン失敗回数を更新しないため）

    # セキュリティブラウザなら
    elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_SECURITYBROWSER:

      # 自動ログイン禁止フラグをチェック（セキュアブラウザモードの場合のみ） 2014.11.19 T.ASAO
      if profile_vo is not None and (helper._is_android or helper._is_ios):

        target_type = ''
        if helper._is_android:
          target_type = 'android'
        elif helper._is_ios:
          target_type = 'ios'

        ssoclient_security_browser_config_json = UcfUtil.getHashStr(profile_vo, 'ssoclient_security_browser_config')
        if ssoclient_security_browser_config_json != '':
          ssoclient_security_browser_config = JSONDecoder().decode(ssoclient_security_browser_config_json)
          ssoclient = ssoclient_security_browser_config.get(target_type, {})
          # セキュリティブラウザモードの場合のみ（O365版はそもそもセキュリティブラウザモード以外のこないけど）
          if ssoclient.get('is_use_webview_mode', '') == 'USE' and ssoclient.get('is_forbidden_auto_login', '') == 'FORBIDDEN':
            login_result['error_code'] = 'AUTOLOGIN_INVALID'
            isLogin = False
            isUserStatusNG = True
            isAuthSuccess = True		# 自動ログインでNGになったとしても、ID、パスワード認証だけは通ったフラグを立てておく（ログイン失敗回数を更新しないため）

    # それ以外
    else:
      # SSOログインアプリからの自動ログインアクセスの場合は、プロファイルの自動ログインの設定によらず自動ログイン処理を行わせる対応（これはApps版、すなわち画面遷移型の場合の対応。だが、一応残しておく...） 2013.05.15
      #if is_auto_login == True and profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'autologin_available_flag') != 'AVAILABLE':
      if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'autologin_available_flag') != 'AVAILABLE' and not ucffunc.isSSODeviceAuthLogin(helper):
        login_result['error_code'] = 'AUTOLOGIN_INVALID'
        isLogin = False
        isUserStatusNG = True
        isAuthSuccess = True		# 自動ログインでNGになったとしても、ID、パスワード認証だけは通ったフラグを立てておく（ログイン失敗回数を更新しないため）

  # これまでのチェックがOKならパスワードなどの認証
  if not isUserStatusNG:
    # SSOパスワード認証
    if login_auth_type == 'OPE':
      # パスワードチェック
      if not is_nocheck_password and UcfUtil.getHashStr(user_vo, 'password') != login_password:
        login_result['error_code'] = 'PASSWORD_FAILED'
        isLogin = False
      else:
        login_email = UcfUtil.getHashStr(user_vo, 'operator_id')
        login_immutable_id = UcfUtil.getHashStr(user_vo, 'immutable_id')
        login_name = helper.getUserNameDisp(UcfUtil.getHashStr(user_vo, 'last_name'), UcfUtil.getHashStr(user_vo, 'first_name'))
        login_access_authority = UcfUtil.getHashStr(user_vo, 'access_authority')
        login_delegate_function = UcfUtil.getHashStr(user_vo, 'delegate_function')
        login_delegate_management_groups = UcfUtil.getHashStr(user_vo, 'delegate_management_groups')
        isLogin = True

    ## 社員ID・SSOパスワード認証
    #elif login_auth_type == 'OPE1':
    #	# パスワードチェック
    #	if not is_nocheck_password and UcfUtil.getHashStr(user_vo, 'password') != login_password:
    #		login_result['error_code'] = 'PASSWORD_FAILED'
    #		isLogin = False
    #	else:
    #		login_email = UcfUtil.getHashStr(user_vo, 'operator_id')
    #		login_immutable_id = UcfUtil.getHashStr(user_vo, 'immutable_id')
    #		login_name = helper.getUserNameDisp(UcfUtil.getHashStr(user_vo, 'last_name'), UcfUtil.getHashStr(user_vo, 'first_name'))
    #		login_access_authority = UcfUtil.getHashStr(user_vo, 'access_authority')
    #		login_delegate_function = UcfUtil.getHashStr(user_vo, 'delegate_function')
    #		login_delegate_management_groups = UcfUtil.getHashStr(user_vo, 'delegate_management_groups')
    #		isLogin = True

    # ワンタイム・ランダムパスワード認証
    elif login_auth_type == 'DCARD':
      is_matrixauth_ok = False
      if is_nocheck_password:
        is_matrixauth_ok = True
      else:
        # マトリックスを生成
        matrixauth_matrix = makeMatrixAuthMatrix(helper, matrixauth_random_key)
        hash_matrix = {}
        for one_row in matrixauth_matrix:
          for one_item in one_row:
            alphabet = UcfUtil.subString(one_item, 0, 1)
            num = UcfUtil.subString(one_item, 1, 1)
            hash_matrix[alphabet.lower()] = num

        check_place_key_num = ''
        # 入力プレースキーからマトリックスの正解を抜き出す
        if len(UcfUtil.getHashStr(user_vo, 'matrixauth_place_key')) > 0:
          for alphabet in UcfUtil.getHashStr(user_vo, 'matrixauth_place_key'):
            check_place_key_num += UcfUtil.getHashStr(hash_matrix, alphabet.lower())
          if len(check_place_key_num) == len(UcfUtil.getHashStr(user_vo, 'matrixauth_place_key')):
            if check_place_key_num + UcfUtil.getHashStr(user_vo, 'matrixauth_pin_code') == login_password:
              is_matrixauth_ok = True

      if not is_matrixauth_ok:
        login_result['error_code'] = 'PASSWORD_FAILED'
        isLogin = False
      else:
        login_email = UcfUtil.getHashStr(user_vo, 'operator_id')
        login_immutable_id = UcfUtil.getHashStr(user_vo, 'immutable_id')
        login_name = helper.getUserNameDisp(UcfUtil.getHashStr(user_vo, 'last_name'), UcfUtil.getHashStr(user_vo, 'first_name'))
        login_access_authority = UcfUtil.getHashStr(user_vo, 'access_authority')
        login_delegate_function = UcfUtil.getHashStr(user_vo, 'delegate_function')
        login_delegate_management_groups = UcfUtil.getHashStr(user_vo, 'delegate_management_groups')
        isLogin = True

    # クライアント証明書認証
    elif login_auth_type == 'CERT':

      # プロファイルからクライアント証明書情報を取得
      client_certificate_info = {}
      client_certificate_info_json = profile_vo.get('client_certificate_info', '')
      if client_certificate_info_json != '':
        client_certificate_info = JSONDecoder().decode(client_certificate_info_json)

      logging.info('[subjectkey1]' + client_certificate_info.get('subject_key', '') + '[subjectkey2]' + client_cert_subjectkey)
      logging.info('[subject1]' + client_certificate_info.get('subject', '') + '[subject2]' + client_cert_subject)

      # 機関キー識別子チェック
      if client_certificate_info.get('subject_key', '') == '' or client_cert_subjectkey.strip().lower() != client_certificate_info.get('subject_key', '').strip().lower():
        login_result['error_code'] = 'CLIENT_CERTIFICATE_FAILED'
        isLogin = False
      # サブジェクトチェック（指定がある場合のみ）
      elif client_certificate_info.get('subject', '') != '' and client_cert_subject.find(client_certificate_info.get('subject', '')) < 0:
        login_result['error_code'] = 'CLIENT_CERTIFICATE_FAILED'
        isLogin = False
      else:
        login_email = UcfUtil.getHashStr(user_vo, 'operator_id')
        login_immutable_id = UcfUtil.getHashStr(user_vo, 'immutable_id')
        login_name = helper.getUserNameDisp(UcfUtil.getHashStr(user_vo, 'last_name'), UcfUtil.getHashStr(user_vo, 'first_name'))
        login_access_authority = UcfUtil.getHashStr(user_vo, 'access_authority')
        login_delegate_function = UcfUtil.getHashStr(user_vo, 'delegate_function')
        login_delegate_management_groups = UcfUtil.getHashStr(user_vo, 'delegate_management_groups')
        isLogin = True

  #logging.info('login_ok=' + str(isLogin))
  # これまでで認証OKなら
  if isLogin:

    # パスワード認証の前に移動 2014.02.16
    ## ユーザマスタ設定に基づくチェック
    #if user_vo is not None:
    #	# アカウント停止フラグ
    #	if isLogin and UcfUtil.getHashStr(user_vo, 'account_stop_flag') == 'STOP':
    #		login_result['error_code'] = 'ACCOUNT_STOP'
    #		isLogin = False
    #	# ログインロック
    #	if isLogin and UcfUtil.getHashStr(user_vo, 'login_lock_flag') == 'LOCK':
    #		if UcfUtil.getHashStr(user_vo, 'login_lock_expire') != '' and UcfUtil.getDateTime(UcfUtil.getHashStr(user_vo, 'login_lock_expire')) >= UcfUtil.getNowLocalTime(helper._timezone):
    #			login_result['error_code'] = 'LOGIN_LOCK'
    #			isLogin = False

    # ガラ携帯アプリAPIなら有効フラグと端末ＩＤをチェック　（ユーザ情報がなければガラ携帯アプリは使用させない）
    if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_FPAPP:
      # 有効フラグチェック
      if isLogin and (user_vo is None or UcfUtil.getHashStr(user_vo, 'fp_app_available_flag') != 'AVAILABLE'):
        login_result['error_code'] = 'NOT_AVAILABLE'
        isLogin = False
      # 端末ＩＤチェック
      if isLogin and mobile_device_id_deal_type == 'SET_OR_CHECK':
        if user_vo is None or (UcfUtil.getHashStr(user_vo, 'mobile_device_id') != '' and UcfUtil.getHashStr(user_vo, 'mobile_device_id') != mobile_device_id):
          login_result['error_code'] = 'MOBILE_DID_FAILED'
          isLogin = False

    # メールプロキシサーバーAPIなら有効フラグをチェック
    elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MAILPROXY:
      # 有効フラグチェック
      if isLogin and (user_vo is None or UcfUtil.getHashStr(user_vo, 'mailproxy_available_flag') != 'AVAILABLE'):
        login_result['error_code'] = 'NOT_AVAILABLE'
        isLogin = False


  # これまでで認証OKなら
  #isAuthSuccess = False
  if isLogin:

    isAuthSuccess = True		# アクセス制御でNGになったとしても、ID、パスワード認証だけは通ったフラグを立てておく（ログイン失敗回数を更新しないため）

    # プロファイルに基づいてアクセス制御などをチェック
    is_valid_access_control, access_control_error_code, access_control_check_info, use_access_apply_unique_id = ProfileUtils.isValidAccess(helper, profile_vo, user_vo, temporary_login_action_key == UcfConfig.TEMPLOGIN_ACTIONKEY_ACS_APPLY)
    login_result['use_access_apply_unique_id'] = use_access_apply_unique_id
    login_result['log_text'] = '[is_valid_access_control]' + str(is_valid_access_control) + '[access_control_error_code]' + access_control_error_code + '\n' + access_control_check_info
    if is_valid_access_control == False:
      if access_control_error_code != '':
        login_result['error_code'] = access_control_error_code
      elif temporary_login_action_key == UcfConfig.TEMPLOGIN_ACTIONKEY_ACS_APPLY:
        login_result['error_code'] = 'ACCESS_CONTROL_FOR_ACS_APPLY'
      else:
        login_result['error_code'] = 'ACCESS_CONTROL'
      isLogin = False


  # 二要素認証のチェック
  is_nooutput_log = False
  isSuccessTwoFactorAuth = False
  if isLogin:
    isAuthSuccess = True		# アクセス制御でNGになったとしても、ID、パスワード認証だけは通ったフラグを立てておく（ログイン失敗回数を更新しないため）
    if not is_nocheck_two_factor_auth and isActiveTwoFactorAuth(helper, profile_vo):

      # 二要素認証コードを必要に応じて発行＆メール送信
      ucffunc.publishAndSendTwoFactorAuthCode(helper, user_vo)
      # 二要素認証コード入力ボックスを不必要に表示しないように、ここを通った場合だけ表示するようにする 2015.06.24
      login_result['is_disp_two_factor_auth_code'] = True

      if two_factor_auth_code is None or two_factor_auth_code == '':
        login_result['error_code'] = 'TWO_FACTOR_AUTH_REQUIRED'
        isLogin = False
        #is_nooutput_log = not helper._is_api		# これはログインエラーではないので何もログを取らずにリターン（APIの場合はログ取っていい）
        is_nooutput_log = True
      elif not ucffunc.isValidTwoFactorAuthCode(helper, two_factor_auth_code, user_vo):
        login_result['error_code'] = 'TWO_FACTOR_AUTH_FAILED'
        isLogin = False
      else:
        isSuccessTwoFactorAuth = True

  # SSOログインアプリの場合、パスワード期限切れもエラーとする（アプリ側から変更させる対応のため） 2014.06.09
  # セキュリティブラウザも対象とする 2015.02.17
  #if isLogin and temporary_login_action_key == '' and helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_SSOLOGINCLIENT:
  if isLogin and temporary_login_action_key == '' and helper._is_api and helper._application_id in [UcfConfig.APPLICATIONID_SSOLOGINCLIENT, UcfConfig.APPLICATIONID_SECURITYBROWSER]:
    isAuthSuccess = True		# パスワード期限切れでNGになったとしても、ID、パスワード認証だけは通ったフラグを立てておく（ログイン失敗回数を更新しないため）
    is_password_change_force = False
    if user_vo is not None and (profile_vo is None or UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') != 'UNAVAILABLE'):		# プロファイルで「パスワードの変更をさせない」場合は、強制しない
      # 次回変更フラグと期限を見て決定
      if UcfUtil.getHashStr(user_vo, 'next_password_change_flag') == 'ACTIVE':
        is_password_change_force = True
      elif UcfUtil.getHashStr(user_vo, 'password_expire') != '' and UcfUtil.getNowLocalTime(helper._timezone) > UcfUtil.getDateTime(UcfUtil.getHashStr(user_vo, 'password_expire')):
        is_password_change_force = True

    if is_password_change_force:
      # パスワードをこのタイミングで変更する場合
      if is_with_password_change:
        pass

      # そうでない場合…エラーとする
      else:
        login_result['error_code'] = 'PASSWORD_EXPIRE'
        is_nooutput_log = True		# これはログインエラーではないので何もログを取らずにリターン
        isLogin = False

    if is_with_password_change:

      req = {
        'Password1':new_password,
        'PasswordConfirm':new_password,
      }
      # 入力チェック
      vc = PasswordChangeValidator('')
      vc.validate(helper, req, user_vo, profile_vo)
      # 入力エラーがなければパスワード変更処理
      if vc.total_count <= 0:
        is_password_change_success, password_change_error_code = ProfileUtils.changeUserPassword(helper, req, user_vo, profile_vo, updater_name=helper._application_id)
        # パスワード変更に失敗した場合
        if not is_password_change_success:
          login_result['error_code'] = 'PASSWORD_CHANGE_FAILED'
          login_result['password_change_error_code'] = password_change_error_code
          login_result['password_change_error_sub_info'] = ''
          is_nooutput_log = True		# これはログインエラーではないので何もログを取らずにリターン
          isLogin = False
      # 入力エラーがあれば
      else:
        login_result['error_code'] = 'PASSWORD_CHANGE_FAILED'
        login_result['password_change_error_code'] = vc._vc_error_code
        login_result['password_change_error_sub_info'] = vc._vc_error_sub_info
        is_nooutput_log = True		# これはログインエラーではないので何もログを取らずにリターン
        isLogin = False

  # 同様に、メールプロキシサーバーの場合、パスワード期限切れもエラーとする（プロファイルのオプションにより） 2015.04.09
  # WS-Federation Active認証の場合もパスワード期限切れはエラーとする（ブラウザからログインしてパスワードを変えればいいので） 2015.09.08
  #elif isLogin and helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MAILPROXY:
  elif isLogin and helper._is_api and helper._application_id in [UcfConfig.APPLICATIONID_MAILPROXY, UcfConfig.APPLICATIONID_WSTRUST]:
    #isAuthSuccess = True		# メールプロキシの場合はエラーはエラーなのでTrueにしなくてOK（どっちにしてもログイン履歴は出力していないが）. WS-Federationの場合は微妙...どっちでもいいがとりあえずエラー扱いとする
    is_password_change_force = False
    if user_vo is not None and profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'is_check_password_expire_for_mailproxy') == 'ACTIVE' and UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') != 'UNAVAILABLE':		# プロファイルでパスワード期限をチェックするオプションが有効の場合のみ（また、「パスワードの変更をさせない」場合は、強制しない）
      # 次回変更フラグと期限を見て決定
      if UcfUtil.getHashStr(user_vo, 'next_password_change_flag') == 'ACTIVE':
        is_password_change_force = True
      elif UcfUtil.getHashStr(user_vo, 'password_expire') != '' and UcfUtil.getNowLocalTime(helper._timezone) > UcfUtil.getDateTime(UcfUtil.getHashStr(user_vo, 'password_expire')):
        is_password_change_force = True
    # エラーとする
    if is_password_change_force:
      login_result['error_code'] = 'PASSWORD_EXPIRE'
      isLogin = False


  if isLogin:
    logout(helper, without_clear_cookie=True)
    #ログイン認証IDを新規発行
    setNewLoginAuthID(helper)

#		# マルチドメイン対応：ログイン時のドメインを親ドメインをキーとしてCookieにセット
#		setLoginDomainNameToCookie(helper)
    setLoginInfo(helper, is_set_next_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_delegate_function, login_delegate_management_groups, login_email, login_immutable_id, login_password, user_vo, profile_vo, temporary_login_action_key=temporary_login_action_key)

    if temporary_login_action_key == '':
      # クライアントログイン認証が必要かどうかのフラグ（ここでは認証自体はしないが、これによって↓の端末認証チェックをスキップするかは制御）
      is_need_client_certificate = (profile_vo.get('client_certificate_flag', '') == 'ACTIVE') if profile_vo is not None else False
      # クライアント証明書認証が必要かどうかをセッションにセット
      setIsNeedClientCertificate(helper, is_need_client_certificate)

  # SSOログインアプリからの自動ログインであることを示すセッションをクリア（ログインに失敗してもクリア）
  ucffunc.clearSSODeviceAuthLoginFlag(helper)

  if not is_nooutput_log:
    # ユーザ更新…ログイン回数、ログイン失敗回数、最終ログイン日時、ログインロックフラグ＆期限を更新
    if temporary_login_action_key != UcfConfig.TEMPLOGIN_ACTIONKEY_CHECKLOGINAUTH_MAILPROXY:
      isClearTwoFactorAuthInfo = isLogin and isSuccessTwoFactorAuth	# ログイン成功したら二要素認証コードをクリア
      isTemporaryLogin = temporary_login_action_key != ''
      is_delay_regist = not helper._is_api and isLogin and is_need_client_certificate	# ログイン成功時でクライアント認証が必要とされている場合はここではログイン情報を更新しない
      use_access_apply_unique_id = UcfUtil.getHashStr(login_result, 'use_access_apply_unique_id')
      updateUserForLoginAsync(helper, isLogin, isTemporaryLogin, isAuthSuccess, isClearTwoFactorAuthInfo, is_need_client_certificate, user_vo, profile_vo, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, is_not_update_login_history, mobile_device_id_deal_type, mobile_device_id, use_access_apply_unique_id, is_delay_regist=is_delay_regist)

    # ログイン履歴に1件インサート（一時ログインじゃない場合だけ）
    if temporary_login_action_key == '':
      is_delay_regist = not helper._is_api and isLogin and is_need_client_certificate	# ログイン成功時でクライアント認証が必要とされている場合はここではログイン履歴をセットしない
      insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id_withdomain if login_auth_type not in ['OPE1', 'CERT'] else login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject, is_delay_regist=is_delay_regist)

  if profile_vo is not None:
    login_result['profile_vo'] = profile_vo
  if user_vo is not None:
    login_result['user_vo'] = user_vo

  return isLogin, login_result

# ログインエラーコードからパスワードリマインダを表示するかどうかを判断する
def isDispPasswordReminderLink(helper, error_code):
  return error_code in ['ID_FAILED', 'PASSWORD_FAILED', 'LOGIN_LOCK', 'BAD_AUTHENTICATION', 'CAPTCHA_REQUIRED']


# 二要素認証が有効なプロファイル判定かどうか
def isActiveTwoFactorAuth(helper, profile_vo):
  if profile_vo is None:
    return False
  elif profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'two_factor_auth_flag') == 'ACTIVE':
    return True
  return False

# エラーコードからログインのエラーメッセージを返す
def getMessageByErrorCode(helper, error_code, login_type='', is_lock_indefinitely=False):
  msg = ''
  if error_code == 'ID_FAILED':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ID')
  elif error_code == 'PASSWORD_FAILED':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_PASSWORD')
  elif error_code == 'LOGIN_LOCK':
    # 無期限ロックの場合にメッセージ変える対応 2016.12.16
    if is_lock_indefinitely:
      msg = helper.getMsg('MSG_FAILED_LOGIN_BY_LOCK_INDEFINITELY')
    else:
      msg = helper.getMsg('MSG_FAILED_LOGIN_BY_LOCK')
  elif error_code == 'ACCOUNT_STOP':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ACCOUNT_STOP')
  elif error_code == 'CAPTCHA_REQUIRED':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_CAPTCHA_REQUIRED')
  elif error_code == 'BAD_AUTHENTICATION':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_BAD_AUTHENTICATION')
  elif error_code == 'TWO_FACTOR_AUTH_REQUIRED':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_TWO_FACTOR_AUTH_REQUIRED')
  elif error_code == 'TWO_FACTOR_AUTH_FAILED':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_TWO_FACTOR_AUTH_FAILED')
  elif error_code == 'ACCESS_CONTROL_USERAGENT':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ACCESS_CONTROL_USERAGENT')
  elif error_code == 'ACCESS_CONTROL_USERAGENT_FOR_ACS_APPLY':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ACCESS_CONTROL_USERAGENT_FOR_ACS_APPLY')
  elif error_code == 'ACCESS_CONTROL_DEVICE':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ACCESS_CONTROL_DEVICE')
  elif error_code == 'ACCESS_CONTROL_FOR_ACS_APPLY':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ACCESS_CONTROL_FOR_ACS_APPLY')
  elif error_code == 'ACCESS_CONTROL':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ACCESS_CONTROL')
  elif error_code == 'NO_REGIST_DEVICE_ID':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_NO_REGIST_DEVICE_ID')
  elif error_code == 'FAILED_AUTH_CLIENT_CERTIFICATE':
    msg = helper.getMsg('MSG_FAILED_AUTH_CLIENT_CERTIFICATE')
  elif error_code == 'CLIENT_CERTIFICATE_FAILED':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_CLIENT_CERTIFICATE')
  elif error_code == 'CLIENT_CERTIFICATE_CN_FAILED':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_CLIENT_CERTIFICATE_CN')
  elif error_code == 'ACCESS_CONTROL_ENVIRONMENT':
    msg = helper.getMsg('MSG_FAILED_LOGIN_BY_ACCESS_CONTROL_ENVIRONMENT')
  else:
    msg = helper.getMsg('MSG_FAILED_LOGIN')
  return msg

# ユーザ更新（非同期）…ログイン回数、ログイン失敗回数、最終ログイン日時、ログインロックフラグ＆期限を更新
def updateUserForLoginAsync(helper, isLogin, isTemporaryLogin, isAuthSuccess, isClearTwoFactorAuthInfo, is_need_client_certificate, user_vo, profile_vo, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, is_not_update_login_history, mobile_device_id_deal_type, mobile_device_id, use_access_apply_unique_id, is_delay_regist=False):

  user_unique_id = UcfUtil.getHashStr(user_vo, 'unique_id') if user_vo is not None else ''

  # Save Number of GoogleApps domain user
  params = {
      'isLogin': isLogin,
      'isTemporaryLogin':isTemporaryLogin,
      'user_unique_id': user_unique_id,
      'profile_unique_id': UcfUtil.getHashStr(profile_vo, 'unique_id') if profile_vo is not None else '',
      'login_auth_type': login_auth_type,
      'is_auto_login': is_auto_login,
      'login_id': login_id,
      'login_name': login_name,
      'login_access_authority': login_access_authority,
      'login_email': login_email,
      'login_password': login_password,
      'is_set_next_auto_login': is_set_next_auto_login,
      'is_not_update_login_history': is_not_update_login_history,
      'mobile_device_id_deal_type': mobile_device_id_deal_type,
      'mobile_device_id': mobile_device_id,
      'isAuthSuccess':isAuthSuccess,
      'isClearTwoFactorAuthInfo':isClearTwoFactorAuthInfo,
      'use_access_apply_unique_id':use_access_apply_unique_id,
      'requestor': ''
  }

  # クライアント認証が必要な設定の場合はここでログイン履歴はINSERTしない（そのかわり一時テーブルにデータをセットしておく）
  if is_delay_regist:
    entry = LoginHistoryUtils.putLoginInfoForDelay(helper, user_unique_id, login_email, params)
    # 遅延処理するためにセッションに処理すべきレコードIDをセット
    setLoginInfoForDelayUniqueID(helper, entry.unique_id)

  else:

    token = UcfUtil.guid()
    # taskに追加 まるごと
    import_q = taskqueue.Queue('process-login')
    import_t = taskqueue.Task(
        url='/a/' + helper._tenant + '/openid/' + token + '/update_user_for_login',
        params=params,
  #			target='b1process',				# BackEndsの使用リソース軽減のためFrontEndsに変更 2013.06.05
        countdown='0'
    )
    #logging.info('run task')
    #logging.info(os.environ['SERVER_SOFTWARE'])
    import_q.add(import_t)

# 遅延登録版：ユーザ更新（非同期）…ログイン回数、ログイン失敗回数、最終ログイン日時、ログインロックフラグ＆期限を更新
def delayUpdateUserForLogin(helper, is_failed_login=False):
  try:
    for_delay_unique_id = getLoginInfoForDelayUniqueID(helper)
    if for_delay_unique_id != '':
      entry = LoginHistoryUtils.getLoginInfoForDelay(helper, for_delay_unique_id)
      if entry is not None:
        if entry.operator_unique_id == helper.getLoginOperatorUniqueID():
          params = JSONDecoder().decode(entry.params) if entry.params != '' else None
          if params is not None:

            # params上書き
            if is_failed_login:
              params['isLogin'] = False

            token = UcfUtil.guid()
            # taskに追加 まるごと
            import_q = taskqueue.Queue('process-login')
            import_t = taskqueue.Task(
                url='/a/' + helper._tenant + '/openid/' + token + '/update_user_for_login',
                params=params,
          #			target='b1process',				# BackEndsの使用リソース軽減のためFrontEndsに変更 2013.06.05
                countdown='0'
            )
            #logging.info('run task')
            #logging.info(os.environ['SERVER_SOFTWARE'])
            import_q.add(import_t)
        # 処理したら削除する
        entry.key.delete()
        setLoginInfoForDelayUniqueID(helper, '')

  # ログイン履歴でエラーしたからといってログインできないのも嫌なので
  except BaseException, e:
  #except taskqueue.TaskToolLargeError, e:
    logging.warning(e)


# ユーザ更新…ログイン回数、ログイン失敗回数、最終ログイン日時、ログインロックフラグ＆期限を更新
def updateUserForLogin(helper, isLogin, isAuthSuccess, user_unique_id, profile_vo, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, is_not_update_login_history, mobile_device_id_deal_type, mobile_device_id, use_access_apply_unique_id):
  if user_unique_id is not None and user_unique_id != '':
    is_mobile_device_id_update = isLogin and (mobile_device_id_deal_type == 'SET_OR_CHECK' or mobile_device_id_deal_type == 'UPDATE')
    if is_not_update_login_history == False or is_mobile_device_id_update:
      entry = OperatorUtils.getData(helper, user_unique_id)
      if entry is not None:
        if is_not_update_login_history == False:
          # ログイン認証に成功したら
          if isLogin:
            entry.login_count = 1 if entry.login_count is None else entry.login_count + 1		# ログイン回数
            entry.last_login_date = UcfUtil.getNow()		# 最終ログイン日時（UTC）
            entry.login_lock_flag = ''		# ログインロックフラグクリア
      #			entry.login_lock_expire = ''		# ログインロック期限（は一応残しておく）
            entry.login_failed_count = 0		# 連続ログイン失敗回数（クリア）
            entry.login_password_length = len(login_password)		# 最終ログイン時のパスワード長
          # ID、パスワード認証には成功したが、アクセス制御ではじかれた場合、ログイン回数などの更新はしない
          elif isAuthSuccess:
            pass
          # 完全に失敗したら
          else:

            # 現在、ステータスとロック期限的にロック中かどうか
            is_current_lock_status = False
            if entry.login_lock_flag == 'LOCK' and entry.login_lock_expire is not None and entry.login_lock_expire >= UcfUtil.getNow():
              is_current_lock_status = True

            # プロファイルでログインロック機能が有効かとその場合の許容連続失敗回数
            is_lock_func_available = False
            login_lock_max_failed_count = 0
            if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'login_lock_available_flag') == 'AVAILABLE':
              is_lock_func_available = True
              login_lock_max_failed_count = 0 if profile_vo['login_lock_max_failed_count'] == '' else int(profile_vo['login_lock_max_failed_count'])

            # 現在のログイン失敗回数
            current_login_failed_count = 0 if entry.login_failed_count is None else entry.login_failed_count

            logging.info('is_current_lock_status=' + str(is_current_lock_status))
            logging.info('is_lock_func_available=' + str(is_lock_func_available))
            logging.info('login_lock_max_failed_count=' + str(login_lock_max_failed_count))
            logging.info('current_login_failed_count=' + str(current_login_failed_count))

            # セットするログイン失敗回数を決定
            login_failed_count = current_login_failed_count + 1
            # ログイン失敗回数が既にプロファイルで指定された最大失敗回数以上（すなわち前回のログイン施行時ロックされたあるいはされている状態だった）でかつ現状、ロックフラグがOFFあるいは期限が過ぎている場合、
            # ここでは再度１から回数を振りなおす対応 2014.02.17
            if not is_current_lock_status and is_lock_func_available:
              if current_login_failed_count >= login_lock_max_failed_count:
                login_failed_count = 1
            # 連続ログイン失敗回数をセット
            entry.login_failed_count = login_failed_count

            # 連続ログイン失敗がプロファイルによる設定回数を超えたらロックフラグと期限を設定（既にロックフラグがたっていれば期限を更新することはとりあえずしない）
            if is_lock_func_available and entry.login_lock_flag != 'LOCK' and login_failed_count >= login_lock_max_failed_count:
              entry.login_lock_flag = 'LOCK'		# ログインロックフラグセット
              entry.login_lock_expire = calculateLoginLockExpire(helper, profile_vo['login_lock_expire_info'])		# ログインロック期限セット（UTC算出）
            elif login_failed_count < login_lock_max_failed_count:
              # ログイン失敗時にロックフラグを解除することはないので変更（プロファイルの設定にかかわらず、ユーザ管理で直接ロックさせているケースもあるので） 2016.12.16
              #entry.login_lock_flag = ''
              pass

        if is_mobile_device_id_update:
          entry.mobile_device_id = mobile_device_id		# ガラ携帯アプリ用端末ＩＤ

        # 更新日時、更新者の更新
        entry.updater_name = 'SYSTEM(LoginProcess)'	# 決め打ち...
        entry.date_changed = UcfUtil.getNow()
        entry.put()

      # アクセス申請レコードに最終ログイン日時をセット 2017.02.10
      if use_access_apply_unique_id != '' and isLogin:
        access_apply_entry = AccessApplyUtils.getData(helper, use_access_apply_unique_id)
        if access_apply_entry is not None:
          access_apply_entry.last_login_date = UcfUtil.getNow()
          access_apply_entry.put()


# ログイン時の端末・環境情報を作成
def createLoginEnvInfo(helper):

  if helper._is_api and helper._device_mac_address_for_api != '':
    device_mac_address = helper._device_mac_address_for_api
  else:
    device_mac_address = ucffunc.getDeviceMacAddress(helper)
  if helper._is_api and helper._device_identifier_for_vendor_for_api != '':
    device_identifier_for_vendor = helper._device_identifier_for_vendor_for_api
  else:
    device_identifier_for_vendor = ucffunc.getDeviceIdentifierForVendor(helper)
  if helper._is_api and helper._device_distinguish_id_for_api != '':
    device_distinguish_id = helper._device_distinguish_id_for_api
  else:
    device_distinguish_id = ucffunc.getDeviceDistinguishID(helper)
  # クライアントIPアドレス（APIを考慮）
  if helper._is_api and helper._client_ip_for_api is not None and helper._client_ip_for_api != '':
    client_ip = helper._client_ip_for_api
  else:
    client_ip = helper.getClientIPAddress()

  logging.info('[createLoginEnvInfo]')
  logging.info(device_mac_address)
  logging.info(device_identifier_for_vendor)
  logging.info(device_distinguish_id)
  logging.info(client_ip)
  access_env_info = ''
  #access_env_info += '[ipaddress]' + helper.getClientIPAddress() + '[x-forwarded-for-ipaddress]' + helper.getSessionHttpHeaderXForwardedForIPAddress() + '\n'
  access_env_info += '[ipaddress]' + str(client_ip) + '[x-forwarded-for-ipaddress]' + helper.getSessionHttpHeaderXForwardedForIPAddress() + '\n'
  access_env_info += '[macaddress]' + str(device_mac_address) + '\n'
  access_env_info += '[device_distinguish_id]' + str(device_distinguish_id) + '\n'
  access_env_info += '[device_identifier_for_vendor]' + str(device_identifier_for_vendor) + '\n'
  access_env_info += '[useragent]' + helper.getUserAgent() + '\n'
  # MSアプリ系を追加 2015.09.11
  if helper.getRequestHeaders('X-Requested-With') != '':
    access_env_info += '[x-requested-with]' + helper.getRequestHeaders('X-Requested-With') + '\n'
  if helper.getRequestHeaders('X-Ms-Client-Application') != '':
    access_env_info += '[x-ms-client-application]' + helper.getRequestHeaders('X-Ms-Client-Application') + '\n'
  if helper.getRequestHeaders('X-Ms-Client-User-Agent') != '':
    access_env_info += '[x-ms-client-user-agent]' + helper.getRequestHeaders('X-Ms-Client-User-Agent') + '\n'
  if helper.getRequestHeaders('X-Ms-Forwarded-Client-Ip') != '':
    access_env_info += '[x-ms-forwarded-client-ip]' + helper.getRequestHeaders('X-Ms-Forwarded-Client-Ip') + '\n'
  for k,v in helper.request.environ.iteritems():
    if k == 'HTTP_COOKIE' or k == 'REQUEST_METHOD' or k == 'PATH_INFO' or k == 'QUERY_STRING' or k == 'HTTP_REFERER' or k == 'HTTP_ACCEPT' or k == 'HTTP_ACCEPT_LANGUAGE' or k == 'AUTH_DOMAIN':
      access_env_info += '[' + str(k) + ']' + str(v) + '\n'
  return '---------------------------------------\n' + access_env_info if access_env_info != '' else access_env_info

# ログイン履歴に1件インサート（非同期）
def insertLoginHistoryAsync(helper, isLogin, isAuthSuccess, is_need_client_certificate, login_result, user_vo, profile_vo, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, client_cert_code='', client_cert_subjectkey='', client_cert_subject='', is_delay_regist=False):

  error_code = UcfUtil.getHashStr(login_result, 'error_code')

  # str + unicode になるとエラーするので
  #log_text = UcfUtil.getHashStr(login_result, 'log_text') + '\n' + createLoginEnvInfo(helper) if UcfUtil.getHashStr(login_result, 'log_text') != '' else createLoginEnvInfo(helper)
  str1 = UcfUtil.getHashStr(login_result, 'log_text')
  str2 = createLoginEnvInfo(helper)
  if isinstance(str1, str):
    str1 = unicode(str1, 'utf-8')
  if isinstance(str2, str):
    str2 = unicode(str2, 'utf-8')
  log_text = str1 + '\n' + str2

  career_type = helper._application_id if (helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_FPAPP) else helper._career_type
  # APIの場合は本来のキャリアタイプをセット
  if helper._is_api and helper._career_type_for_api != '':
    career_type = helper._career_type_for_api

  x_forwarded_for_ipaddress = helper.getSessionHttpHeaderXForwardedForIPAddress()
  user_agent = helper.getUserAgent()
  # API経由の場合でIPアドレス指定がある場合はそちらをセット
  if helper._is_api and helper._client_ip_for_api is not None and helper._client_ip_for_api != '':
    client_ipaddress = helper._client_ip_for_api
  else:
    client_ipaddress = helper.getClientIPAddress()
  mobile_user_id = ''
  mobile_device_id = ''
  use_access_apply_unique_id = UcfUtil.getHashStr(login_result, 'use_access_apply_unique_id')
  user_unique_id = UcfUtil.getHashStr(user_vo, 'unique_id') if user_vo is not None else ''
  user_operator_id = UcfUtil.getHashStr(user_vo, 'operator_id') if user_vo is not None else ''
  profile_unique_id = UcfUtil.getHashStr(profile_vo, 'unique_id') if profile_vo is not None else ''
  profile_id = UcfUtil.getHashStr(profile_vo, 'profile_id') if profile_vo is not None else ''
  target_env = UcfUtil.getHashStr(profile_vo, 'target_env') if profile_vo is not None else ''
  management_group = UcfUtil.getHashStr(user_vo, 'management_group') if user_vo is not None else ''

  try:

    # Save Number of GoogleApps domain user
    params = {
        'isLogin': isLogin,
        'isAuthSuccess': isAuthSuccess,
        'user_unique_id': user_unique_id,
        'user_operator_id': user_operator_id,
        'profile_unique_id': profile_unique_id,
        'profile_profile_id': profile_id,
        'profile_target_env': target_env,
        'management_group': management_group,
        'error_code': error_code,
        'log_text': log_text,
        'use_access_apply_unique_id': use_access_apply_unique_id,
        'career_type': career_type,
        'x_forwarded_for_ipaddress': x_forwarded_for_ipaddress,
        'user_agent': user_agent,
        'client_ipaddress': client_ipaddress,
        'mobile_user_id': mobile_user_id,
        'mobile_device_id': mobile_device_id,
        'login_auth_type': login_auth_type,
        'is_auto_login': is_auto_login,
        'login_id': login_id,
        'login_name': login_name,
        'login_access_authority': login_access_authority,
        'login_email': login_email,
        'login_password': login_password,
        'is_set_next_auto_login': is_set_next_auto_login,
        'client_cert_code': client_cert_code,
        'client_cert_subjectkey': client_cert_subjectkey,
        'client_cert_subject': client_cert_subject,
        'requestor': ''
    }

    # クライアント認証が必要な設定の場合はここでログイン履歴はINSERTしない（そのかわり一時テーブルにデータをセットしておく）
    if is_delay_regist:
      entry = LoginHistoryUtils.putLoginHistoryForDelay(helper, user_unique_id, user_operator_id, params)
      # 遅延処理するためにセッションに処理すべきレコードIDをセット
      setLoginHistoryForDelayUniqueID(helper, entry.unique_id)

    else:
      token = UcfUtil.guid()
      # taskに追加 まるごと
      import_q = taskqueue.Queue('process-login')
      import_t = taskqueue.Task(
          url='/a/' + helper._tenant + '/openid/' + token + '/insert_login_history',
          params=params,
    #			target='b1process',				# BackEndsの使用リソース軽減のためFrontEndsに変更 2013.06.05
          countdown='0'
      )
      #logging.info('run task')
      import_q.add(import_t)

  # TaskToolLargeError が出ることがあるので、エラーした場合は同期処理でインサート
  # ログイン履歴取得でエラーしたからといってログインできないのも嫌なので
  except BaseException, e:
  #except taskqueue.TaskToolLargeError, e:
    logging.warning(e)
    insertLoginHistory(helper, isLogin, isAuthSuccess, error_code, log_text, career_type, x_forwarded_for_ipaddress, user_agent, client_ipaddress, mobile_user_id, mobile_device_id, use_access_apply_unique_id, user_unique_id, user_operator_id, profile_unique_id, profile_id, target_env, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, management_group)

# 遅延登録版：ログイン履歴に1件インサート
def delayInsertLoginHistory(helper, is_failed_login=False, error_code='', client_cert_code='', client_cert_subjectkey='', client_cert_subject=''):
  try:
    for_delay_unique_id = getLoginHistoryForDelayUniqueID(helper)
    if for_delay_unique_id != '':
      entry = LoginHistoryUtils.getLoginHistoryForDelay(helper, for_delay_unique_id)
      if entry is not None:
        if entry.operator_unique_id == helper.getLoginOperatorUniqueID():
          params = JSONDecoder().decode(entry.params) if entry.params != '' else None
          if params is not None:

            # params上書き
            if is_failed_login:
              params['isLogin'] = False
            if error_code != '':
              params['error_code'] = error_code

            # クライアント証明書認証の情報を追加
            params['client_cert_code'] = client_cert_code
            params['client_cert_subjectkey'] = client_cert_subjectkey
            params['client_cert_subject'] = client_cert_subject

            token = UcfUtil.guid()
            # taskに追加 まるごと
            import_q = taskqueue.Queue('process-login')
            import_t = taskqueue.Task(
                url='/a/' + helper._tenant + '/openid/' + token + '/insert_login_history',
                params=params,
          #			target='b1process',				# BackEndsの使用リソース軽減のためFrontEndsに変更 2013.06.05
                countdown='0'
            )
            #logging.info('run task')
            import_q.add(import_t)
        # 処理したら削除する
        entry.key.delete()
        setLoginHistoryForDelayUniqueID(helper, '')

  # ログイン履歴でエラーしたからといってログインできないのも嫌なので
  except BaseException, e:
  #except taskqueue.TaskToolLargeError, e:
    logging.warning(e)


# ログイン履歴に1件インサート
def insertLoginHistory(helper, isLogin, isAuthSuccess, error_code, log_text, career_type, x_forwarded_for_ipaddress, user_agent, client_ipaddress, mobile_user_id, mobile_device_id, use_access_apply_unique_id, user_unique_id, user_operator_id, profile_unique_id, profile_id, target_env, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, management_group, client_cert_code='', client_cert_subjectkey='', client_cert_subject=''):

  # log_text に証明書情報を追加（先頭に）
  if log_text is None:
    log_text = ''

  access_date = UcfUtil.nvl(UcfUtil.getNowLocalTime(helper._timezone))

  #############################################################
  # ログテキストの先頭に追加情報をセット（下のほうが上に来る）
  if client_cert_subject != '':
    log_text = '[client_cert_subject]' + client_cert_subject + '\n' + log_text
  if client_cert_subjectkey != '':
    log_text = '[client_cert_subjectkey]' + client_cert_subjectkey + '\n' + log_text
  if client_cert_code != '':
    log_text = '[client_cert_code]' + client_cert_code + '\n' + log_text
  log_text = '[login_id]' + login_id + '\n' + log_text
  log_text = '[error_code]' + error_code + '\n' + log_text
  log_text = '[access_date]' + access_date + '\n' + log_text
  #############################################################

  #vo = {}
  unique_id = UcfUtil.guid()
  #vo['unique_id'] = unique_id
  #vo['access_date'] = access_date
  #vo['dept_id'] = helper.getDeptInfo()['dept_id']
  #vo['operator_unique_id'] = user_unique_id
  #vo['operator_id'] = user_operator_id
  #vo['operator_id_lower'] = user_operator_id.lower()
  #vo['login_id'] = login_id
  #vo['login_id_lower'] = login_id.lower()
  #vo['login_password'] = login_password
  #vo['login_password_length'] = UcfUtil.nvl(len(login_password))
  #vo['login_type'] = login_auth_type
  #vo['login_result'] = 'SUCCESS' if isLogin else 'FAILED'
  #vo['log_code'] = error_code
  ## ログテキストは詳細テーブルに逃がす 2013.10.01
  ##vo['log_text'] = log_text
  #vo['is_exist_log_detail'] = str(log_text != '')
  #vo['user_agent'] = user_agent
  #vo['session_id'] = ''
  #vo['cookie_auth_id'] = ''
  #vo['client_ip'] = client_ipaddress
  #vo['client_x_forwarded_for_ip'] = x_forwarded_for_ipaddress
  #vo['target_career'] = career_type
  #vo['target_env'] = target_env
  #vo['use_profile_id'] = profile_id
  #vo['use_access_apply_unique_id'] = use_access_apply_unique_id
  #vo['management_group'] = management_group
  #vo['is_auto_login'] = 'AUTO' if is_auto_login else ''
  #vo['mobile_user_id'] = mobile_user_id
  #vo['mobile_device_id'] = mobile_device_id

  #LoginHistoryUtils.editVoForRegist(helper, vo, None, UcfConfig.EDIT_TYPE_NEW)
  entry = UCFMDLLoginHistory(unique_id=unique_id,id=LoginHistoryUtils.getKey(helper, unique_id))
  ## Voからモデルにマージ
  #entry.margeFromVo(vo, helper._timezone)

  entry.unique_id = unique_id
  entry.access_date = UcfUtil.getUTCTime(UcfUtil.getDateTime(access_date), helper._timezone)
  entry.dept_id = helper.getDeptInfo()['dept_id']
  entry.operator_unique_id = user_unique_id
  entry.operator_id = user_operator_id
  entry.operator_id_lower = user_operator_id.lower()
  entry.login_id = login_id
  entry.login_id_lower = login_id.lower()
  try:
    entry.login_password = helper.encryptoData(login_password, enctype='AES')		# パスワード暗号化
    entry.login_password_enctype = 'AES'
  except UnicodeEncodeError, e:
    entry.login_password = helper.encryptoData(UcfUtil.urlEncode(login_password), enctype='AES')		# パスワード暗号化（全角とかの場合はエラーしちゃうのでURLエンコードしてから暗号化）
    entry.login_password_enctype = 'AES'
  entry.login_password_length = len(login_password)

  entry.login_type = login_auth_type
  entry.login_result = 'SUCCESS' if isLogin else 'FAILED'
  entry.log_code = error_code
  # ログテキストは詳細テーブルに逃がす 2013.10.01
  #entry.log_text = log_text
  entry.is_exist_log_detail = log_text != ''
  entry.user_agent = user_agent
  entry.session_id = ''
  entry.cookie_auth_id = ''
  entry.client_ip = client_ipaddress
  entry.client_x_forwarded_for_ip = x_forwarded_for_ipaddress
  entry.target_career = career_type
  entry.target_env = target_env
  entry.use_profile_id = profile_id
  entry.use_access_apply_unique_id = use_access_apply_unique_id
  entry.management_group = management_group
  entry.is_auto_login = 'AUTO' if is_auto_login else ''
  entry.mobile_user_id = mobile_user_id
  entry.mobile_device_id = mobile_device_id

  entry.updater_name = 'SYSTEM(LoginProcess)'	# 決め打ち...
  entry.date_changed = UcfUtil.getNow()
  entry.creator_name = 'SYSTEM(LoginProcess)'	# 決め打ち...
  entry.date_created = UcfUtil.getNow()
  entry.put()

  # ログテキストは詳細テーブルに逃がす 2013.10.01
  if log_text != '':
    detail_unique_id = UcfUtil.guid()
    detail_entry = UCFMDLLoginHistoryDetail(unique_id=detail_unique_id)
    detail_entry.log_text = log_text
    detail_entry.history_unique_id = unique_id
    detail_entry.put()


# ログインロック期限を算出（UTCで算出）
def calculateLoginLockExpire(helper, login_lock_expire_info):
  login_lock_expire = UcfUtil.getNow()
  if login_lock_expire_info == '15MIN':
    login_lock_expire = UcfUtil.add_minutes(login_lock_expire, 15)
  elif login_lock_expire_info == '1HOUR':
    login_lock_expire = UcfUtil.add_hours(login_lock_expire, 1)
  elif login_lock_expire_info == '3HOUR':
    login_lock_expire = UcfUtil.add_hours(login_lock_expire, 3)
  elif login_lock_expire_info == '6HOUR':
    login_lock_expire = UcfUtil.add_hours(login_lock_expire, 6)
  elif login_lock_expire_info == '12HOUR':
    login_lock_expire = UcfUtil.add_hours(login_lock_expire, 12)
  elif login_lock_expire_info == '1DAY':
    login_lock_expire = UcfUtil.add_days(login_lock_expire, 1)
  elif login_lock_expire_info == '7DAY':
    login_lock_expire = UcfUtil.add_days(login_lock_expire, 7)
  elif login_lock_expire_info == 'PERMANENCE':
    login_lock_expire = UcfUtil.getDateTime('2999/12/31')
  return login_lock_expire



#+++++++++++++++++++++++++++++++++++++++
#+++ ログイン情報をセッションにセット
#+++++++++++++++++++++++++++++++++++++++
def setLoginInfo(helper, is_set_next_auto_login, login_id, login_name, access_authority, delegate_function, delegate_management_groups, mail_address, immutable_id, login_password, user_vo, profile_vo, temporary_login_action_key=None, without_clear_cookie=False):
  if helper._is_api:
    return

  temporary_login_action_key = UcfUtil.nvl(temporary_login_action_key)

  # 一時ログインではない場合は一時ログインのセッションにも全てセット
  action_keys = []
  if temporary_login_action_key == '':
    action_keys.append('')	# 本来のセッション
    action_keys.extend(UcfConfig.TEMPLOGIN_ACTIONKEY_LIST)
  else:
    action_keys.append(temporary_login_action_key)

  for action_key in action_keys:
    session_key_suffix = '|' + action_key if action_key != '' else ''
    # ログインＩＤをセッションにセット
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_ID + session_key_suffix, UcfUtil.getHashStr(user_vo, 'operator_id') if user_vo is not None else login_id)
    # ログインオペレータＩＤをセッションにセット
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_OPERATOR_ID + session_key_suffix, UcfUtil.getHashStr(user_vo, 'operator_id') if user_vo is not None else '')
    # ログインオペレータユニークＩＤをセッションにセット（user_voがない場合は空もあり得るので注意）
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_UNIQUE_ID + session_key_suffix, UcfUtil.getHashStr(user_vo, 'unique_id') if user_vo is not None else '')
    # ログインオペレータ名称をセッションにセット
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_NAME + session_key_suffix, login_name)
    # ログインオペレータ権限をセッションにセット
    helper.setSession(UcfConfig.SESSIONKEY_ACCESS_AUTHORITY + session_key_suffix, access_authority)
    # ログインオペレータの委託管理機能をセッションにセット
    helper.setSession(UcfConfig.SESSIONKEY_DELEGATE_FUNCTION + session_key_suffix, delegate_function)
    # ログインオペレータの委託管理する管理グループをセッションにセット
    helper.setSession(UcfConfig.SESSIONKEY_DELEGATE_MANAGEMENT_GROUPS + session_key_suffix, delegate_management_groups)
    # ログインオペレータメールアドレスをセッションにセット
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_MAIL_ADDRESS + session_key_suffix, mail_address)
    # ログインオペレータImmutableIDをセッションにセット
    #helper.setSession(UcfConfig.SESSIONKEY_LOGIN_IMMUTABLE_ID + session_key_suffix, immutable_id)
    # ログインオペレータドメインをセッションにセット
    #sp_mail_address = mail_address.split('@')
    #helper.setSession(UcfConfig.SESSIONKEY_LOGIN_FEDERATED_DOMAIN + session_key_suffix, sp_mail_address[1].lower() if len(sp_mail_address) >= 2 else '')
    # ログイン時の適用プロファイルユニークIDをセット
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_PROFILE_UNIQUE_ID + session_key_suffix, UcfUtil.getHashStr(profile_vo, 'unique_id') if profile_vo is not None else '')
    # ログイン時の適用対象環境種別（office, outside, sp, fp）をセット
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_TARGET_ENV + session_key_suffix, UcfUtil.getHashStr(profile_vo, 'target_env') if profile_vo is not None else '')
    # ログイン時のアプリケーションID
    helper.setSession(UcfConfig.SESSIONKEY_LOGIN_APPLICATION_ID + session_key_suffix, helper._application_id)

  # 以下は一時ログインじゃない場合だけ処理
  if temporary_login_action_key == '':

    # ログインユーザにパスワード変更を強制するフラグをセッションにセット
    # プロファイルで「パスワードの変更をさせない」場合は、強制しないように対応 2013.02.13
    is_password_change_force = False
    if user_vo is not None and (profile_vo is None or UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') != 'UNAVAILABLE'):
      # 次回変更フラグと期限を見て決定
      if UcfUtil.getHashStr(user_vo, 'next_password_change_flag') == 'ACTIVE':
        is_password_change_force = True
      elif UcfUtil.getHashStr(user_vo, 'password_expire') != '' and UcfUtil.getNowLocalTime(helper._timezone) > UcfUtil.getDateTime(UcfUtil.getHashStr(user_vo, 'password_expire')):
        is_password_change_force = True

    if is_password_change_force:
      if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'login_type') == 'DCARD':
        helper.setLoginOperatorForcePasswordChangeFlag('FORCE2')
        helper.setLoginOperatorRURLKey(helper.request.get('rurl_key'))
      else:
        helper.setLoginOperatorForcePasswordChangeFlag('FORCE')
        helper.setLoginOperatorRURLKey(helper.request.get('rurl_key'))
    else:
      helper.setLoginOperatorForcePasswordChangeFlag('')
      #helper.setLoginOperatorRURLKey('')

    if without_clear_cookie == False:
      # 自動ログイン対応 2009/07/28 T.ASAO
      # クッキーに自動ログインＦとログイン情報をセット
      if is_set_next_auto_login:
        setCookieLoginInfo(helper, True, login_id, login_password, mail_address)
      # クッキーから自動ログインＦとログイン情報をクリア
      else:
        setCookieLoginInfo(helper, False, '', '', '')


#+++++++++++++++++++++++++++++++++++++++
#+++ ログイン時の各種情報を取得＆チェック
#+++++++++++++++++++++++++++++++++++++++
def checkLoginInfo(helper, not_redirect=False, not_check_target_env=False):
  is_select_ok = False
  user_vo = None
  profile_vo = None
  # ログイン時のユーザユニークID
  unique_id = helper.getLoginOperatorUniqueID()
  # ユニークIDがあればユーザデータを取得
  if unique_id != '':
    user_entry = OperatorUtils.getData(helper, unique_id)
    if user_entry is None:
      if not not_redirect:
        helper.redirectError(UcfMessage.getMessage(helper.getMsg('MSG_NOT_EXIST_LOGIN_ACCOUNT_DATA')))
      return is_select_ok, user_vo, profile_vo, UcfMessage.getMessage(helper.getMsg('MSG_NOT_EXIST_LOGIN_ACCOUNT_DATA'))
    user_vo = user_entry.exchangeVo(helper._timezone)
    # ユーザー単位の言語設定を反映
    if user_vo.get('language', '') != '':
      helper._language = user_vo.get('language', '')

  #OperatorUtils.editVoForSelect(helper, user_vo)
  # ログイン時のプロファイルユニークID
  profile_unique_id = helper.getLoginOperatorProfileUniqueID()
  if profile_unique_id != '':
    # プロファイルユニークIDがあればデータを取得
    profile_entry = ProfileUtils.getData(helper, profile_unique_id)
    if profile_entry is None:
      if not not_redirect:
        helper.redirectError(UcfMessage.getMessage(helper.getMsg('MSG_NOT_EXIST_LOGIN_PROFILE_DATA')))
      return is_select_ok, user_vo, profile_vo, UcfMessage.getMessage(helper.getMsg('MSG_NOT_EXIST_LOGIN_PROFILE_DATA'))
    profile_vo = profile_entry.exchangeVo(helper._timezone)
    #ProfileUtils.editVoForSelect(helper, profile_vo)
    # 現在のネットワーク、ユーザエージェントに基づいてプロファイルを整備
    ProfileUtils.appendProfileInfoByNetwork(helper, profile_vo)
    # 現在のネットワーク、ユーザエージェントから算出された環境種別とログイン時の種別が違っていればエラー（セキュリティ対策）
    if not not_check_target_env and profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'target_env') != helper.getLoginOperatorTargetEnv():
      if not not_redirect:
        helper.redirectError(UcfMessage.getMessage(helper.getMsg('MSG_NOT_MATCH_LOGIN_TARGET_ENV')))
      return is_select_ok, user_vo, profile_vo, UcfMessage.getMessage(helper.getMsg('MSG_NOT_MATCH_LOGIN_TARGET_ENV'))

  is_select_ok = True
  return is_select_ok, user_vo, profile_vo, ''

#+++++++++++++++++++++++++++++++++++++++
#+++ 自動ログインＦを取得
#+++++++++++++++++++++++++++++++++++++++
def isAutoLogin(helper):
  return helper.getCookie(UcfConfig.COOKIE_KEY_AUTO_LOGIN) == UcfConfig.VALUE_AUTO_LOGIN

#+++++++++++++++++++++++++++++++++++++++
#+++ クッキーログインＩＤを取得
#+++++++++++++++++++++++++++++++++++++++
def getCookieLoginID(helper):
  return helper.getCookie(UcfConfig.COOKIE_KEY_LOGIN_ID)

#+++++++++++++++++++++++++++++++++++++++
#+++ クッキーログインパスワードを取得
#+++++++++++++++++++++++++++++++++++++++
def getCookiePassword(helper):
  return helper.getCookie(UcfConfig.COOKIE_KEY_LOGIN_PASSWORD)

#+++++++++++++++++++++++++++++++++++++++
#+++ クッキーログインメールアドレスを取得
#+++++++++++++++++++++++++++++++++++++++
def getCookieMailAddress(helper):
  return helper.getCookie(UcfConfig.COOKIE_KEY_LOGIN_MAIL_ADDRESS)

#+++++++++++++++++++++++++++++++++++++++
#+++ クッキー用にログイン用データをセット
#+++++++++++++++++++++++++++++++++++++++
def setCookieLoginInfo(helper, auto_login_flag, login_id, login_password, mail_address):
  # 自動ログインＦ
  helper.setCookie(UcfConfig.COOKIE_KEY_AUTO_LOGIN, UcfConfig.VALUE_AUTO_LOGIN if auto_login_flag else '', is_secure=True)
  # ログインＩＤ
  helper.setCookie(UcfConfig.COOKIE_KEY_LOGIN_ID, login_id, is_secure=True)
  # ログインパスワード
  helper.setCookie(UcfConfig.COOKIE_KEY_LOGIN_PASSWORD, login_password, is_secure=True)
  # ログインメールアドレス
  helper.setCookie(UcfConfig.COOKIE_KEY_LOGIN_MAIL_ADDRESS, mail_address, is_secure=True)

#+++++++++++++++++++++++++++++++++++++++
#+++ ログアウト
#+++++++++++++++++++++++++++++++++++++++
def logout(helper, without_clear_cookie=False):
  if helper._is_api:
    return

  # セッションクリア(とりあえず回しておこう) →別ドメインのセッションもクリアされちゃうので個別に対応に変更
#	helper.session().clear()
#	helper.clearSession()
  setLoginInfo(helper, False, '', '', '', '', '', '', '', '', None, None, temporary_login_action_key='', without_clear_cookie=without_clear_cookie)
  helper.setSession(UcfConfig.SESSIONKEY_ALREADY_DEAL_AUTO_REDIRECT_URL, '')
  helper.setSession(UcfConfig.SESSION_KEY_IS_NEED_CLIENT_CERTIFICATE, '')
  helper.setSession(UcfConfig.SESSION_KEY_AUTH_CLIENT_CERTIFICATE, '')

#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_ID, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_OPERATOR_ID, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_UNIQUE_ID, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_NAME, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_DEPT_ID, '')
#	helper.setSession(UcfConfig.SESSIONKEY_ACCESS_AUTHORITY, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_MAIL_ADDRESS, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_PROFILE_UNIQUE_ID, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_TARGET_ENV, '')
#	helper.setSession(UcfConfig.SESSIONKEY_LOGIN_FORCE_PASSWORD_CHANGE, '')
#	helper.setSession(UcfConfig.SESSIONKEY_AUTHID, '')
#	helper.setSession(UcfConfig.SESSIONKEY_RURL, '')

  if without_clear_cookie == False:
    setCookieLoginInfo(helper, False, '', '', '')
    # 認証IDをクリア
    clearLoginAuthID(helper)

#+++++++++++++++++++++++++++++++++++++++

# クライアント認証が必要かどうか…ログイン認証時（プロファイル確定時）にセット。各ページの「checkLogin」でこのフラグがたっていたら「isOKAuthClientCertificate」もみる
def setIsNeedClientCertificate(helper, is_need_client_certificate=False):
  logging.info('setIsNeedClientCertificate:' + str(is_need_client_certificate))
  helper.setSession(UcfConfig.SESSION_KEY_IS_NEED_CLIENT_CERTIFICATE, is_need_client_certificate)

# クライアント認証が必要かどうか…各ページの「checkLogin」でこのフラグがたっていたら「isOKAuthClientCertificate」もみる
def isNeedClientCertificate(helper):
  return helper.getSession(UcfConfig.SESSION_KEY_IS_NEED_CLIENT_CERTIFICATE)

# クライアント認証がOKというセッションをセット
def setClientCertificateAuthSessionOK(helper):
  logging.info('setClientCertificateAuthSessionOK')
  helper.setSession(UcfConfig.SESSION_KEY_AUTH_CLIENT_CERTIFICATE, UcfUtil.nvl(UcfUtil.getNowLocalTime(helper._timezone)))

# クライアント認証がNGというセッションをセット
def setClientCertificateAuthSessionNG(helper):
  logging.info('setClientCertificateAuthSessionNG')
  helper.setSession(UcfConfig.SESSION_KEY_AUTH_CLIENT_CERTIFICATE, 'ERROR');

# クライアント認証がOK(認証済み)かセッションをチェック
def isOKAuthClientCertificate(helper):
  return UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_AUTH_CLIENT_CERTIFICATE)) != '' and UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_AUTH_CLIENT_CERTIFICATE)) != 'ERROR'

# クライアント認証がNG(認証済み)かセッションをチェック
def isNGAuthClientCertificate(helper):
  return UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_AUTH_CLIENT_CERTIFICATE)) == 'ERROR'

# 遅延ログイン履歴ユニークIDをセット
def setLoginHistoryForDelayUniqueID(helper, unique_id):
  helper.setSession(UcfConfig.SESSION_KEY_LOGIN_HISTORY_FOR_DELAY_UNIQUE_ID, unique_id)

# 遅延ログイン履歴ユニークIDをゲット
def getLoginHistoryForDelayUniqueID(helper):
  return UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_LOGIN_HISTORY_FOR_DELAY_UNIQUE_ID))

# 遅延ログイン情報ユニークIDをセット
def setLoginInfoForDelayUniqueID(helper, unique_id):
  helper.setSession(UcfConfig.SESSION_KEY_LOGIN_INFO_FOR_DELAY_UNIQUE_ID, unique_id)

# 遅延ログイン情報ユニークIDをゲット
def getLoginInfoForDelayUniqueID(helper):
  return UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_LOGIN_INFO_FOR_DELAY_UNIQUE_ID))




# ログインチェック
def checkLogin(helper, add_querys=None, isStaticLogin=False, not_redirect=False, not_check_authid=False, isRURLUseSession=False, isForceHttpMethodGet=False, add_querys_for_rurl=None):
  u'''
  TITLE:アプリ用ログインチェック（GoogleMarketPlaceのOpenID認証などではなくアプリのセッション管理ログイン認証）
  PARAMETER:
    add_querys:ログイン画面に追加するクエリーのハッシュ
    isStaticLogin:静的なログインをするならTrue
  '''

  is_exist_login_session = UcfUtil.nvl(helper.getLoginID()) != ''
  logging.info('login_id=' + UcfUtil.nvl(helper.getLoginID()))
  # セッション判定でログインしていなければ（認証IDも見るように変更）
  if not is_exist_login_session or (not_check_authid == False and checkLoginAuthID(helper) == False):
    # 自動ログイン判定 2009/07/29 T.ASAO
    # 自動ログインフラグがたっていればクッキーの値によってログインを試みる
    if helper.getTemporaryLoginActionKey() == '' and isAutoLogin(helper):			# ※一時ログインでは自動ログインは実施しない
      login_id = getCookieLoginID(helper)
      login_password = getCookiePassword(helper)
#				dept_id = getCookieDeptID(helper)
#			mail_address = getCookieMailAddress(helper)

#			# ドメインが単一ドメインの場合のドメイン
#			federeated_domains = sateraito_func.getFederatedDomainList(helper._tenant, is_with_cache=True)
#			if len(federeated_domains) == 1:
#				single_federated_domain = federeated_domains[0]
#			else:
#				single_federated_domain = ''
      single_federated_domain = ''

      # ログイン認証
      isLogin, login_result = authLogin(helper, single_federated_domain, login_id, login_password, captcha_token='', captcha_response='', is_set_next_auto_login=True, is_auto_login=True)
    else:
      isLogin = False
    #logging.info('isLogin=' + str(isLogin))

    # ログインしていなければ
    if not isLogin:
      if not not_redirect:

        certauth_url = oem_func.getMySiteUrl(helper._oem_company_code) + '/a/' + helper._tenant + '/certauth_with_cn'

        # RURLの取得を行うか判定用 2011/04/08
        rurl_flag = False
        # page_type の取得を行うか判定用 2011/04/08
        page_type_flag = False

        is_auth_with_client_certificate_cn = False
        # デフォルトのプロファイルを取得してクライアント証明書認証かどうかを判定（ログイン前なのでデフォルトプロファイルで判断するしかない）
        dept_profile = getDeptProfile(helper)
        is_auth_with_client_certificate_cn = dept_profile is not None and dept_profile.get('login_type', '') == 'CERT'

        # 静的ログインなら
        url = ''
        if isStaticLogin:
          if is_auth_with_client_certificate_cn:
            url = certauth_url
          else:
            url = '/a/' + helper._tenant + '/login'
          # 静的ログインの場合、RURLの追加を行わない
          rurl_flag = True
        # 動的ログインなら
        else:
          # POST なら トップページに戻るように
          if not isForceHttpMethodGet and helper._request_type == UcfConfig.REQUEST_TYPE_POST:
            if is_auth_with_client_certificate_cn:
              url = certauth_url
            else:
              url = '/a/' + helper._tenant + '/login'
          # GET ならこのページ自体に戻るように
          else:
            if is_auth_with_client_certificate_cn:
              url = certauth_url
            else:
              url = '/a/' + helper._tenant + '/login'
            rurl = helper.request.url
            if add_querys_for_rurl is not None:
              for k,v in add_querys_for_rurl.iteritems():
                rurl = UcfUtil.appendQueryString(rurl, k, v)
            if isRURLUseSession:
              helper.setSession(UcfConfig.SESSIONKEY_RURL, rurl)
            else:
              helper.setSession(UcfConfig.SESSIONKEY_RURL, '')
              url = UcfUtil.appendQueryString(url, UcfConfig.REQUESTKEY_RURL, rurl)
            rurl_flag = True

        # クエリーを追加
        if add_querys != None:
          for k,v in add_querys.iteritems():
            url = UcfUtil.appendQueryString(url, k, v)
            if k == UcfConfig.REQUESTKEY_PAGETYPE:
              page_type_flag = True
            if k == UcfConfig.REQUESTKEY_RURL:
              rurl_flag = True
        # ページタイプが存在するとき、クエリーに追加 2011/04/08
        if helper._page_type and not page_type_flag:
          url = UcfUtil.appendQueryString(url, UcfConfig.REQUESTKEY_PAGETYPE, helper._page_type)
        # 一時ログインの場合はそのキーを追加 2012/02/27
        if helper.getTemporaryLoginActionKey() != '':
          url = UcfUtil.appendQueryString(url, UcfConfig.REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY, helper.getTemporaryLoginActionKey())
        # RURLを追加していない場合、追加 2011/04/08
        if not rurl_flag:
          # RURLを取得
          rurl = UcfUtil.nvl(helper.getSession(UcfConfig.SESSIONKEY_RURL))
          # RURLが空のとき、リファラから取得
          if rurl == '' and UcfUtil.nvl(UcfUtil.getHashStr(os.environ, 'HTTP_REFERER')) != '':
             rurl = UcfUtil.nvl(UcfUtil.getHashStr(os.environ, 'HTTP_REFERER'))
          if rurl != '' and add_querys_for_rurl is not None:
            for k,v in add_querys_for_rurl.iteritems():
              rurl = UcfUtil.appendQueryString(rurl, k, v)

          url = UcfUtil.appendQueryString(url, UcfConfig.REQUESTKEY_RURL, rurl)

        if is_auth_with_client_certificate_cn:
          # さらにそれを認証サーバーのクエリーに追加
          # クライアント証明書チェックサーバーURL
          if helper._tenant in []:
            api_url = 'https://sp.sateraito.jp/certificate_fortest/'
          else:
            api_url = sateraito_inc.client_certifiate_url
          api_url = UcfUtil.appendQueryString(api_url, UcfConfig.REQUESTKEY_RURL, url)
          logging.info(api_url)
          helper.redirect(api_url)
        else:
          helper.redirect(url)

        return False

  else:
    isLogin = True

  # クライアント証明書対応 2013.10.11
  # クライアント認証が必要な場合、ここまででログインOKと判断されたら、すでにクライアント認証が通っているかを判断し、通っていなければ、リダイレクトなどを行う
  if isLogin and isNeedClientCertificate(helper):
    logging.info('isNeedClientCertificate=True')
    # 認証済み（成功）の場合、スルー
    if isOKAuthClientCertificate(helper):
      logging.info('isOKAuthClientCertificate=True')
      # certauth.pyに移動
      ## ログイン履歴とログイン情報の遅延処理は行う
      #delayUpdateUserForLogin(helper)
      #delayInsertLoginHistory(helper)
      pass

    # 認証済み（失敗）の場合、リダイレクトしていい時だけエラーページに飛ぶ（クライアント証明書はブラウザを閉じないと再度チェックされないので再認証はしない）
    elif isNGAuthClientCertificate(helper):
      logging.info('isNGAuthClientCertificate=True')
      # certauth.pyに移動
      ## ログイン履歴とログイン情報の遅延処理は行う
      #delayUpdateUserForLogin(helper, is_failed_login=True)
      #delayInsertLoginHistory(helper, is_failed_login=True, error_code='FAILED_AUTH_CLIENT_CERTIFICATE')
      isLogin = False
      if not not_redirect:
        helper.redirectError(UcfMessage.getMessage(helper.getMsg('MSG_FAILED_AUTH_CLIENT_CERTIFICATE')))
        return False
    # まだ認証処理をしていない場合、認証ページにリダイレクト
    else:
      isLogin = False
      if not not_redirect:

        # POSTの場合はエラーページに飛ばして終了　→　POSTで遷移するように対応 2016.02.09
        if not isForceHttpMethodGet and helper._request_type == UcfConfig.REQUEST_TYPE_POST:
          logging.info('error because the method is not "GET".')
          helper.redirectError(UcfMessage.getMessage(helper.getMsg('MSG_FAILED_AUTH_CLIENT_CERTIFICATE')))
          return False

        # POSTの場合はPOSTで遷移 2016.02.09
        elif helper._request_type == UcfConfig.REQUEST_TYPE_POST:

          # クライアント証明書チェックサーバーURL
          if helper._tenant in []:
            api_url = 'https://sp.sateraito.jp/certificate_fortest/'
          else:
            api_url = sateraito_inc.client_certifiate_url

          post_items = []

          # 戻ってくるSSO側認証ページのURL（ここにPOSTする）
          sso_auth_url = oem_func.getMySiteUrl(helper._oem_company_code) + '/a/' + helper._tenant + '/certauth'
          post_items.append({'name':UcfConfig.REQUESTKEY_RURL, 'value':sso_auth_url})

          # POSTのかわりにクエリーにつけるパラメータを追加（「certauth」に付けてもらうPOSTパラメータ）
          # 本来の遷移先URL
          post_items.append({'name':UcfConfig.REQUESTKEY_POSTPREFIX + UcfConfig.REQUESTKEY_RURL, 'value':helper.request.url})
          # SAMLRequestなどのパラメータ
          if add_querys_for_rurl is not None:
            for k,v in add_querys_for_rurl.iteritems():
              post_items.append({'name':UcfConfig.REQUESTKEY_POSTPREFIX + k, 'value':v})
          ucfp = UcfTenantParameter(helper)
          ucfp.data['ActionUrl'] = api_url
          template_vals = {
            'ucfp' : ucfp
            ,'post_items':post_items
            ,'WaitMilliSeconds':0
          }
          helper.appendBasicInfoToTemplateVals(template_vals)
          helper.render('sso_general_post.html', helper._design_type, template_vals)
          return


        # GETの場合はリダイレクト
        else:
          # クライアント証明書チェックサーバーURL
          if helper._tenant in []:
            api_url = 'https://sp.sateraito.jp/certificate_fortest/'
          else:
            api_url = sateraito_inc.client_certifiate_url
          # 戻ってくるSSO側認証ページのURL（さらに本ページを本来のリダイレクトURLとして付ける）
          sso_auth_url = oem_func.getMySiteUrl(helper._oem_company_code) + '/a/' + helper._tenant + '/certauth'
          sso_auth_url = UcfUtil.appendQueryString(sso_auth_url, UcfConfig.REQUESTKEY_RURL, helper.request.url)
          # さらにそれを認証サーバーのクエリーに追加
          api_url = UcfUtil.appendQueryString(api_url, UcfConfig.REQUESTKEY_RURL, sso_auth_url)
          # リダイレクト
          helper.redirect(api_url)
          return


  return isLogin

#+++++++++++++++++++++++++++++++++++++++


#+++++++++++++++++++++++++++++++++++++++
# デフォルトプロファイル取得
def getDeptProfile(helper):
  if helper.getDeptInfo() is None:
    return None
  #logging.info('get default profile start...')
  profile_infos = UcfUtil.csvToList(UcfUtil.getHashStr(helper.getDeptInfo(), 'profile_infos'))
  profile_id = profile_infos[0] if len(profile_infos) > 0 else ''
  profile_vo = ProfileUtils.getProfileByProfileID(helper, profile_id, is_with_cache=True)
  ProfileUtils.appendProfileInfoByNetwork(helper, profile_vo)
  #logging.info('get default profile end.')
  return profile_vo

#+++++++++++++++++++++++++++++++++++++++
# ユーザIDからアクティブなプロファイル取得（メイン組織までさかのぼって取得.店舗もさかのぼる）
def getActiveProfile(helper, user_vo):
  #logging.info('get active profile start...')
  profile_vo = None
  # ユーザにヒモづくプロファイルを取得
  profile_infos = UcfUtil.csvToList(UcfUtil.getHashStr(user_vo, 'profile_infos'))
  profile_id = profile_infos[0] if len(profile_infos) > 0 else ''
  profile_vo = ProfileUtils.getProfileByProfileID(helper, profile_id, is_with_cache=True)

  # ユーザのプロファイルIDが未指定か、ヒモづくプロファイルがないなら、メイン親組織から取得
  if profile_vo is None:
    # メイン親グループを取得
    main_group_vo = OperatorGroupUtils.getGroupByGroupID(helper, UcfUtil.getHashStr(user_vo, 'main_group_id'))

    # メイン親グループのプロファイルを取得
    if main_group_vo is not None:
      profile_infos = UcfUtil.csvToList(UcfUtil.getHashStr(main_group_vo, 'profile_infos'))
      profile_id = profile_infos[0] if len(profile_infos) > 0 else ''
      profile_vo = ProfileUtils.getProfileByProfileID(helper, profile_id, is_with_cache=True)

  # メイン親グループのプロファイルIDが未指定か、ヒモづくプロファイルがないなら、デフォルトプロファイルを取得
  if profile_vo is None:
    profile_vo = getDeptProfile(helper)

  ProfileUtils.appendProfileInfoByNetwork(helper, profile_vo)
  #logging.info('get active profile end.')

  return profile_vo

#+++++++++++++++++++++++++++++++++++++++
# ログイン認証IDを新規発行
def setNewLoginAuthID(helper):
  # Cookieに認証IDをセット
  # 認証IDをセッションにもセット
  auth_id = UcfUtil.guid()
  helper.setCookie(UcfConfig.COOKIEKEY_AUTHID, auth_id, is_secure=True)
  helper.setSession(UcfConfig.SESSIONKEY_AUTHID, auth_id)

#+++++++++++++++++++++++++++++++++++++++
# ログイン認証IDをチェック
def checkLoginAuthID(helper):
  strCookieAuthID = UcfUtil.nvl(helper.getCookie(UcfConfig.COOKIEKEY_AUTHID))
  strSessionAuthID = UcfUtil.nvl(helper.getSession(UcfConfig.SESSIONKEY_AUTHID))
#	logging.info('check_login_auth_cookie=' + strCookieAuthID)
#	logging.info('check_login_auth_session=' + strSessionAuthID)
  return helper.isSSLPage() == False or strCookieAuthID == strSessionAuthID		# sslの時は必ずチェックとする

#+++++++++++++++++++++++++++++++++++++++
# ログイン認証IDをクリア
def clearLoginAuthID(helper):
  helper.clearCookie(UcfConfig.COOKIEKEY_AUTHID)
  helper.setSession(UcfConfig.SESSIONKEY_AUTHID, '')

#+++++++++++++++++++++++++++++++++++++++
# ワンタイムランダムパスワードのマトリックスキーを作成
def createMatrixAuthKey(helper):
  return UcfUtil.guid()

# ワンタイム・ランダムパスワード型パスワード：ランダムキーからマトリックス数字を生成
# current_matrixauth_key: マトリックス生成用ランダムキー：この値が同じ場合は同じマトリックスとなる
# return: (1,1)、(2,1)～～～(1,2)、(2,2)・・・（5,5）の順に表示文字列をセットした配列
def makeMatrixAuthMatrix(self, current_matrixauth_key):

  # 5×5のマトリックスをイメージ
  keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y' ]
  ary = []
  idx = 0
  for i in range(len(keys)):
    ary.append(idx)
    idx += 1
    if idx == 10:
      idx = 0

  # seedに基づいて配列をランダムソード
  sorted_ary = sortArrayRandom(ary, current_matrixauth_key)

  result_matrix = []
  one_row = None
  for i in range(len(sorted_ary)):
    if i % 5 == 0:
      one_row = []
      result_matrix.append(one_row)
    one_row.append(keys[i] + str(sorted_ary[i]))
  return result_matrix

# seedに基づいて配列をランダムソート
def sortArrayRandom(ary, seed):
  sorted_ary = []
  random.seed(seed)  # 明示的に初期化
  used_idx = {}
  while True:
    random_int = random.randint(0, len(ary) - 1)
    if not used_idx.has_key(random_int):
      sorted_ary.append(ary[random_int])
      used_idx[random_int] = ''
      if len(sorted_ary) >= len(ary):
        break
  random.seed()  # seedをリセット
  return sorted_ary
