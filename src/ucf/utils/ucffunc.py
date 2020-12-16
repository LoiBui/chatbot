# coding: utf-8

import logging
from ucf.utils.models import *
from ucf.utils.ucfutil import *
from ucf.utils.mailutil import UcfMailUtil
from ucf.utils.ucfxml import UcfXml
from ucf.utils.numbering import *
from ucf.config.ucfconfig import *
import sateraito_inc
import sateraito_func
import oem_func
from google.appengine.api import memcache
from ucf.pages.dept import DeptUtils
import md5

# UCFMDLDeptMasterに1件登録（存在しない場合だけ）
def registDeptMaster(helper, tenant, company_name, tanto_name, contact_mail_address, contact_tel_no, oem_company_code, sp_code, default_language='', default_timezone='', default_encoding='', access_ip=''):
	tenant = tenant.lower()
	query_dept = UCFMDLDeptMaster.gql("where tenant = :1", tenant)
	dept_entry = query_dept.get()
	dept_vo = None
	if dept_entry is None:
		numbers = Numbering(_dept_id=UcfConfig.NUMBERING_NUMBER_ID_DEPT ,_number_id=UcfConfig.NUMBERING_NUMBER_ID_DEPT, _number_sub_id=UcfConfig.NUMBERING_NUMBER_SUB_ID_DEPT, _prefix=UcfConfig.NUMBERING_PREFIX_DEPT, _sequence_no_digit=UcfConfig.NUMBERING_SEQUENCE_NO_DIGIT_DEPT)
		number = numbers.countup()

		unique_id = UcfUtil.guid()
		dept_vo = {}
		DeptUtils.editVoForDefault(helper, dept_vo)
		dept_vo['tenant'] = tenant
		dept_vo['unique_id'] = unique_id
		dept_vo['dept_id'] = number
		dept_vo['md5_suffix_key'] = UcfUtil.guid()
		dept_vo['deptinfo_encode_key'] = UcfUtil.guid()[0:8]

		dept_vo['tenant'] = tenant
		dept_vo['company_name'] = company_name
		dept_vo['tanto_name'] = tanto_name
		dept_vo['contact_mail_address'] = contact_mail_address
		dept_vo['contact_tel_no'] = contact_tel_no

		#dept_vo['is_disable_fp'] = UcfUtil.nvl(True)		# 海外展開対応：ガラ携帯設定を無効に 2015.07.09
		dept_vo['is_disp_login_language_combobox'] = 'ACTIVE'		# ログイン画面の言語選択ボックスのデフォルトをONに 2015.07.10

		dept_vo['language'] = default_language
		dept_vo['file_encoding'] = default_encoding
		dept_vo['timezone'] = default_timezone
		dept_vo['username_disp_type'] = '' if default_language == 'ja' else 'ENGLISH'
		dept_vo['login_message'] = helper.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ())
		dept_vo['oem_company_code'] = oem_company_code.lower()
		if sp_code is not None and sp_code != '':
			dept_vo['sp_codes'] = sp_code.lower()
			
		new_dept_entry = UCFMDLDeptMaster(unique_id=unique_id,key_name=DeptUtils.getKey(helper, dept_vo))
		new_dept_entry.margeFromVo(dept_vo, helper._timezone)
		new_dept_entry.profile_infos = ['DEFAULT01']			# SSOパスワードがデフォルトなのと管理者はあらかじめ登録しておくのでここは一般ユーザー用プロファイルをセットしてOK
		new_dept_entry.creator_name = 'SYSTEM'
		new_dept_entry.updater_name = 'SYSTEM'
		new_dept_entry.put()

	else:
		_editDeptMaster(dept_entry)
		dept_vo = dept_entry.exchangeVo(helper._timezone)
	return dept_vo

def getDeptVoByTenant(tenant, helper):
	dept = None
	query_dept = UCFMDLDeptMaster.all(keys_only=True)
	query_dept.filter('tenant = ', tenant.lower())
	dept_entry = UCFMDLDeptMaster.getByKey(query_dept.get())
	if dept_entry is not None:
		if dept_entry.sp_codes is None:
			dept_entry.sp_codes = []
		if dept_entry.oem_company_code is None:
			dept_entry.oem_company_code = ''
		_editDeptMaster(dept_entry)
		dept = dept_entry.exchangeVo(helper._timezone)
	return dept

## 有効なドメインかどうか
#def isValidDomain(helper, domain, is_with_cache=False):
#	validdomainlist = sateraito_func.getFederatedDomainList(helper._tenant, is_with_cache)
#	return domain.lower() in validdomainlist

def _editDeptMaster(dept_entry):
	is_put = False
	#if dept_entry.hide_access_apply_link_flag is None:
	#	dept_entry.hide_access_apply_link_flag = ''
	#	is_put = True
	if is_put:
		dept_entry.put()


# SSOアプリからの自動ログインであることを示す情報をセッションにセット（プロファイルで自動ログインが無効になっていても自動ログインさせないといけないので...）
def setSSODeviceAuthLoginFlag(helper):
	helper.setSession(UcfConfig.SESSION_KEY_SSODEVICE_AUTHLOGIN_FLAG, 'on')

# SSOアプリからの自動ログインであることを示す情報をセッションからクリア
def clearSSODeviceAuthLoginFlag(helper):
	helper.setSession(UcfConfig.SESSION_KEY_SSODEVICE_AUTHLOGIN_FLAG, '')

# SSOアプリからの自動ログインであるかどうかをチェック
def isSSODeviceAuthLogin(helper):
	return 'on' == UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_SSODEVICE_AUTHLOGIN_FLAG))

# 端末のアクセスキーをセッションとCookieにセット
def setAccessKey(helper, access_key_id, access_key):
	if access_key_id != '':
		helper.setSession(access_key_id, access_key)
		helper.setCookie(access_key_id, access_key, is_secure=True)

# 端末のアクセスキーをセッションあるいはCookieから取得
def getAccessKey(helper, access_key_id):
	access_key = ''
	if access_key_id != '':
		access_key = UcfUtil.nvl(helper.getCookie(access_key_id))
		if access_key == '':
			access_key = UcfUtil.nvl(helper.getSession(access_key_id))
	return access_key

# 端末のMACアドレスをセッションにセット（Cookieにセットする必要はおそらくない）
# ⇒CookieにセットしないとSSOログインアプリからブラウザ起動後、SSOログアウト状態で再度申請が必要になってしまうため、Cookieにもセットするように変更 2014.01.04
def setDeviceMacAddress(helper, device_mac_address):
	helper.setSession(UcfConfig.SESSION_KEY_DEVICE_MAC_ADDRESS, device_mac_address)
	helper.setCookie(UcfConfig.COOKIE_KEY_DEVICE_MAC_ADDRESS, device_mac_address, is_secure=True, path='/')		# 端末識別子はパス共通でOK

# 端末のMACアドレスをセッションから取得
def getDeviceMacAddress(helper):
	device_mac_address = UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_DEVICE_MAC_ADDRESS))
	if device_mac_address == '':
		device_mac_address = UcfUtil.nvl(helper.getCookie(UcfConfig.COOKIE_KEY_DEVICE_MAC_ADDRESS))
	return device_mac_address

# 端末のIdentifierForVendorをセッション＆Cookieにセット
def setDeviceIdentifierForVendor(helper, device_identifier_for_vendor):
	helper.setSession(UcfConfig.SESSION_KEY_IDENTIFIER_FOR_VENDOR, device_identifier_for_vendor)
	helper.setCookie(UcfConfig.COOKIE_KEY_IDENTIFIER_FOR_VENDOR, device_identifier_for_vendor, is_secure=True, path='/')		# ベンダーIDはパス共通でOK

# 端末のIdentifierForVendorをセッション or Cookieから取得
def getDeviceIdentifierForVendor(helper):
	device_identifier_for_vendor = UcfUtil.nvl(helper.getSession(UcfConfig.SESSION_KEY_IDENTIFIER_FOR_VENDOR))
	if device_identifier_for_vendor == '':
		device_identifier_for_vendor = UcfUtil.nvl(helper.getCookie(UcfConfig.COOKIE_KEY_IDENTIFIER_FOR_VENDOR))
	return device_identifier_for_vendor


# 端末識別子をCookieにセット、上書き
def setDeviceDistinguishID(helper, device_distinguish_id):
	helper.setCookie(UcfConfig.COOKIE_KEY_DEVICE_DISTINGUISH_ID, device_distinguish_id, is_secure=True, path='/')		# 端末識別子はパス共通でOK

# 端末識別子をCookieから取得（with_setcookie…なければ新規発行してCookieにセット)
def getDeviceDistinguishID(helper, with_setcookie=False):
	device_distinguish_id = UcfUtil.nvl(helper.getCookie(UcfConfig.COOKIE_KEY_DEVICE_DISTINGUISH_ID))
	if with_setcookie and device_distinguish_id == '':
		device_distinguish_id = createNewDeviceDistinguishID(helper)
		setDeviceDistinguishID(helper, device_distinguish_id)
	return device_distinguish_id

# 端末識別子を新しく作成
def createNewDeviceDistinguishID(helper):
	return UcfUtil.guid()

def getUserNameDisp(helper, dept, last_name, first_name, middle_name=''):
	disp_name = ''
	username_disp_type = UcfUtil.getHashStr(dept, 'username_disp_type')
	# 名、姓の順
	if username_disp_type == 'ENGLISH':
		disp_name = first_name + ' ' + last_name
	# デフォルト：姓、名の順
	else:
		disp_name = last_name + ' ' + first_name
	return disp_name

# ログレコード作成：通常
def createLogRecord(helper, log_message):
	logging.info(log_message)
	return '[' + UcfUtil.nvl(UcfUtil.getNowLocalTime(helper._timezone)) + ']' + log_message + '\n'

# ログレコード作成：エラー
def createErrorLogRecord(helper, log_message, code, data_key):
	logging.info(log_message)
	return '[' + UcfUtil.nvl(UcfUtil.getNowLocalTime(helper._timezone)) + ']' + '[ERROR' + (':' if code != '' else '') + code + ']' + (('[' + data_key + ']') if data_key != '' else '') + log_message + '\n'

# ログレコード作成：警告
def createWarningLogRecord(helper, log_message, code, data_key):
	logging.info(log_message)
	return '[' + UcfUtil.nvl(UcfUtil.getNowLocalTime(helper._timezone)) + ']' + '[WARNING' + (':' if code != '' else '') + code + ']' + (('[' + data_key + ']') if data_key != '' else '') + log_message + '\n'

# 指定ドメインのSSOログアウトＵＲＬを作成（こっちはSSOのログアウト画面）
def getSSOLogoutURL(helper, tenant):
	redirect_other_tenant_url = oem_func.getMySiteUrl(helper._oem_company_code) + '/a/' + tenant + '/sso/logout'
	urlpart = helper.request.url.split('?')
	if len(urlpart) >= 2:
		redirect_other_tenant_url += '?' + urlpart[1]
	return redirect_other_tenant_url

# 指定ドメインのSSOパスワード変更ＵＲＬを作成（こっちはパスワード変更画面）
def getSSOPasswordURL(helper, tenant):
	redirect_other_tenant_url = oem_func.getMySiteUrl(helper._oem_company_code) + '/a/' + tenant + '/personal/password/'
	urlpart = helper.request.url.split('?')
	if len(urlpart) >= 2:
		redirect_other_tenant_url += '?' + urlpart[1]
	return redirect_other_tenant_url

# 指定があれば自動遷移先URLに飛ばす
def redirectAutoRedirectURL(helper, profile_vo=None, is_no_redirect=False, is_force_deal=False):
	# 一度処理したフラグをセッションに保持（ログインして最初のアクセスで処理したら後は処理しない）
	if is_force_deal or UcfUtil.nvl(helper.getSession(UcfConfig.SESSIONKEY_ALREADY_DEAL_AUTO_REDIRECT_URL)) != 'ALREADY':
		helper.setSession(UcfConfig.SESSIONKEY_ALREADY_DEAL_AUTO_REDIRECT_URL, 'ALREADY')
		if not is_no_redirect:
			redirect_url = getAutoRedirectURL(helper, profile_vo)
			if redirect_url != '' and redirect_url.strip().lower() != helper.request.url.split('?')[0].lower():
				# O365はSharePointで日本語URLが多い
				if isinstance(redirect_url, str):
					helper.redirect(redirect_url)
				elif isinstance(redirect_url, unicode):
					try:
						helper.redirect(str(redirect_url))
					except:
						sp_query = redirect_url.split('?')
						sp = sp_query[0].split('/')
						redirect_url = ''
						for i in range(len(sp)):
							v = sp[i]
							if i >= 3:		# FQDNより後ろを処理
								v = UcfUtil.urlEncode(v)
							redirect_url += ('/' if i > 0 else '') + v
						if len(sp_query) >= 2:
							redirect_url += '?' + sp_query[1]		# TODO クエリーもほんとはエンコードだがそこは自己責任で..
						logging.info(str(redirect_url))
						helper.redirect(str(redirect_url))

				return True
	return False

# 自動遷移先URL
def getAutoRedirectURL(helper, profile_vo=None):
	#return UcfUtil.nvl(helper.getDeptInfo()['auto_redirect_url'])
	if profile_vo is not None:
		return UcfUtil.nvl(UcfUtil.getHashStr(profile_vo, 'auto_redirect_url'))
	else:
		return ''

# 自動遷移タイプ
def getAutoRedirectActionType(helper, profile_vo=None):
	#return UcfUtil.nvl(helper.getDeptInfo()['auto_redirect_url_action_type'])
	if profile_vo is not None:
		return UcfUtil.nvl(UcfUtil.getHashStr(profile_vo, 'auto_redirect_url_action_type'))
	else:
		return ''

# 管理対象のデータかどうか
def isDelegateTargetManagementGroup(data_management_group, user_delegate_management_groups):
	if user_delegate_management_groups is None or len(user_delegate_management_groups) <= 0:
		# 「委託管理する管理グループ」が空の委託管理者は委託管理機能の全データにアクセス可能とする 2013.04.22
		return True
	if data_management_group is None or data_management_group == '':
		return False
	return data_management_group in user_delegate_management_groups

# 委任管理者かどうか
# login_operator_entry…オペレータEntitiy
def isDelegateOperator(login_operator_entry):
	return login_operator_entry is not None and UcfConfig.ACCESS_AUTHORITY_OPERATOR in login_operator_entry.access_authority

# 現在有効な二要素認証コードを取得
def getActiveTwoFactorAuthEntry(user_vo):
	if user_vo is not None:
		q = UCFMDLTwoFactorAuth.all()
		q.filter('operator_unique_id =', UcfUtil.getHashStr(user_vo, 'unique_id'))
		entry = q.get()
		# レコードがあって有効期限が切れていたら削除
		if entry is not None and entry.auth_code_expire < UcfUtil.getNow():
			entry.delete()
			entry = None
		return entry
	else:
		return None

# 指定ユーザの二要素認証コードをクリア（１ユーザ1レコード前提なので、該当ユーザのものを全て消せばOK）
def clearActiveTwoFactorAuthEntry(user_unique_id):
	if user_unique_id is not None and user_unique_id != '':
		q = UCFMDLTwoFactorAuth.all()
		q.filter('operator_unique_id =', user_unique_id)
		for entry in q:
			entry.delete()

# 二要素認証コードを必要に応じて発行＆メール送信（二要素認証が必要な場合で、セッションに認証コードがセットされていない場合は、メールも送られていないと判断して送信）
def publishAndSendTwoFactorAuthCode(helper, user_vo):

	expire_minutes = 10	# 認証コードの有効期限は10分
	# 現在有効な二要素認証コードを取得
	entry = getActiveTwoFactorAuthEntry(user_vo)

	if entry is not None:
		logging.info(str(entry.two_factor_auth_code) + ':' + str(entry.auth_code_expire))

	# 未発行なら発行＆メール送信
	if entry is None:
		two_factor_auth_code = createNewTwoFactorAuthCode()
		unique_id = UcfUtil.guid()
		key = UcfUtil.getHashStr(user_vo, 'unique_id') + UcfConfig.KEY_PREFIX + unique_id
		entry = UCFMDLTwoFactorAuth(unique_id=unique_id, key_name=key)
		entry.operator_unique_id = UcfUtil.getHashStr(user_vo, 'unique_id')
		entry.date_created = UcfUtil.getNow()
		entry.dept_id = UcfUtil.getHashStr(user_vo, 'dept_id')
		entry.two_factor_auth_code = two_factor_auth_code
		entry.auth_code_expire = UcfUtil.add_minutes(UcfUtil.getNow(), expire_minutes)
		entry.date_changed = UcfUtil.getNow()
#	else:
#		two_factor_auth_code = createNewTwoFactorAuthCode()
#		entry.two_factor_auth_code = two_factor_auth_code
#		entry.auth_code_expire = UcfUtil.add_minutes(UcfUtil.getNow(), expire_minutes)
#		entry.date_changed = UcfUtil.getNow()

		# 更新処理
		entry.put()
		# 二要素認証コードの通知メール送信
		sendTwoFactorAuthCodeNotificationMail(helper, user_vo, two_factor_auth_code, expire_minutes)

	logging.info(UcfUtil.getHashStr(user_vo, 'mail_address') + ':' + UcfUtil.getHashStr(user_vo, 'sub_mail_address') + ':' + str(entry.two_factor_auth_code))

# 二要素認証の認証コードをチェック
def isValidTwoFactorAuthCode(helper, two_factor_auth_code, user_vo):
	is_valid = False
	entry = getActiveTwoFactorAuthEntry(user_vo)
	if entry is not None and str(entry.two_factor_auth_code) == two_factor_auth_code:
		is_valid = True
	return is_valid

# 二要素認証コードを新規発行
def createNewTwoFactorAuthCode():
	s = '1234567890'
	token = ''
	for j in range(6):
		token += random.choice(s)
	return token

# 二要素認証の認証コードをメールでご案内
def sendTwoFactorAuthCodeNotificationMail(helper, user_vo, current_two_factor_auth_code, expire_minutes):

	# メール文書情報取得
	oem_company_code = oem_func.getValidOEMCompanyCode(helper.getDeptValue('oem_company_code'))
	mail_template_id = 'two_factor_auth_code_notification'

	if mail_template_id != '' and UcfUtil.getHashStr(user_vo, 'sub_mail_address') != '':

		#mail_info = UcfMailUtil.getMailTemplateInfo(helper, mail_template_id)
		mail_info = UcfMailUtil.getMailTemplateInfoByLanguageDef(helper, mail_template_id)

		# 差出人をセット
		mail_info['Sender'] = sateraito_inc.SENDER_EMAIL

		# 宛先を追加
		mail_info['To'] = UcfUtil.getHashStr(user_vo, 'sub_mail_address')
		mail_info['To'] = UcfUtil.getHashStr(mail_info, 'To').strip(',')
		mail_info['Cc'] = UcfUtil.getHashStr(mail_info, 'Cc').strip(',')
		mail_info['Bcc'] = UcfUtil.getHashStr(mail_info, 'Bcc').strip(',')

		# Reply-Toに管理者の連絡先アドレスを追加
		mail_info['ReplyTo'] = UcfUtil.getHashStr(mail_info, 'ReplyTo').strip(',') + ',' + helper.getDeptValue('contact_mail_address')
		mail_info['ReplyTo'] = mail_info['ReplyTo'].strip(',')

		if UcfUtil.getHashStr(mail_info, 'To') != '' or UcfUtil.getHashStr(mail_info, 'Cc') != '' or UcfUtil.getHashStr(mail_info, 'Bcc') != '':
			# 差し込み情報作成
			insert_vo = {}
			now = UcfUtil.getNowLocalTime(helper._timezone)
			insert_vo['DATETIME'] = UcfUtil.nvl(now)
			insert_vo['DATE'] = now.strftime('%Y/%m/%d')
			insert_vo['TIME'] = now.strftime('%H:%M:%S')
			insert_vo['MAIL_ADDRESS'] = UcfUtil.getHashStr(user_vo, 'operator_id')
			insert_vo['SUB_MAIL_ADDRESS'] = UcfUtil.getHashStr(user_vo, 'sub_mail_address')
			insert_vo['TWO_FACTOR_AUTH_CODE'] = current_two_factor_auth_code
			insert_vo['TWO_FACTOR_AUTH_CODE_EXPIRE_MINUTS'] = str(expire_minutes)

			#メール送信
			try:
				UcfMailUtil.sendOneMail(to=UcfUtil.getHashStr(mail_info, 'To'), cc=UcfUtil.getHashStr(mail_info, 'Cc'), bcc=UcfUtil.getHashStr(mail_info, 'Bcc'), reply_to=UcfUtil.getHashStr(mail_info, 'ReplyTo'), sender=UcfUtil.getHashStr(mail_info, 'Sender'), subject=UcfUtil.getHashStr(mail_info, 'Subject'), body=UcfUtil.getHashStr(mail_info, 'Body'), body_html=UcfUtil.getHashStr(mail_info, 'BodyHtml'), data=insert_vo)
			#ログだけ、エラーにしない
			except BaseException, e:
				helper.outputErrorLog(e)

def checkCheckKeyForUser(helper, uid, check_key, application_id):
	is_ok = False
	if uid != '' and check_key != '':
		uid_check_keys = []
		# その他
		if application_id == '':
			uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.getHashStr(helper.getDeptInfo(), 'deptinfo_encode_key')))

		is_ok = False
		for uid_check_key in uid_check_keys:
			if uid_check_key.lower() == check_key.lower():
				is_ok = True
				break
	if not is_ok:
		logging.info('[invalid check key]' + 'uid=' + str(uid) + ' check_key=' + str(check_key) + ' application_id=' + str(application_id))
	return is_ok

def createAccessToken(tenant):
	# MD5SuffixKey
	md5_suffix_key = sateraito_inc.MD5_SUFFIX_KEY

	#logging.debug(md5_suffix_key)

	tz_user_local = zoneinfo.gettz('Asia/Tokyo')
	tz_utc = zoneinfo.gettz('UTC')
	stamp_datetime_utc = datetime.datetime.now(tz_utc)
	stamp_datetime_localtime = stamp_datetime_utc.replace(tzinfo=tz.tzutc()).astimezone(tz_user_local)
	yyyymmddHM = stamp_datetime_localtime.strftime('%Y%m%d%H%M')
	# logging.debug(yyyymmddHM)
	# logging.debug(app_domain_export)

	return md5.new(tenant.lower() + yyyymmddHM + md5_suffix_key).hexdigest()

def checkAccessToken(tenant,token):
		return _checkCheckKey(tenant,token)

def _checkCheckKey(tenant,token):
			is_ok = False
			check_key = token

			# logging.debug('=============check_key===================')
			#logging.debug(check_key)

			# MD5SuffixKey
			md5_suffix_key = sateraito_inc.MD5_SUFFIX_KEY

			# logging.debug('=============md5_suffix_key===================')
			# logging.debug(md5_suffix_key)

			# チェックキーチェック
			if tenant != '' and check_key != '' and md5_suffix_key != '':
					tenant = tenant.lower()
					#logging.debug(google_apps_domain)
					tenant_check_keys = getPossibleCheckKeys(tenant, md5_suffix_key)

					is_ok = False
					for domain_check_key in domain_check_keys:
							#logging.debug(domain_check_key)
							if domain_check_key.lower() == check_key.lower():
									is_ok = True
									break
			return is_ok

def getPossibleCheckKeys(tenant, secret_key):
	possible_check_keys = []
	tz_user_local = zoneinfo.gettz('Asia/Tokyo')
	tz_utc = zoneinfo.gettz('UTC')
	stamp_datetime_utc = datetime.datetime.now(tz_utc)
	stamp_datetime_localtime = stamp_datetime_utc.replace(tzinfo=tz.tzutc()).astimezone(tz_user_local)
	for i in [-3, -2, -1, 0, 1, 2, 3]:
			yyyymmddHM = (stamp_datetime_localtime + datetime.timedelta(minutes=i)).strftime('%Y%m%d%H%M')
			#logging.debug(yyyymmddHM)
			possible_check_keys.append(md5.new(tenant + yyyymmddHM + secret_key).hexdigest())
	return possible_check_keys


def routerURLPermission(self):
	login_delegate_function = self.getLoginOperatorDelegateFunction().split(',')

	if 'USER' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/user/')
	elif 'GROUP' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/group/')
	elif 'POSTMESSAGE' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/postmessage/')
	elif 'FORM' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/form/')
	elif 'FORM_RESULT' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/formdata/')
	elif 'CHATBOT' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/chatbot/')
	elif 'STORE' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/store/')
	elif 'STORE_RESULT' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/storedata/')
	elif 'EMAILMAGAZINE' in login_delegate_function:
		self.redirect('/a/' + self._tenant + '/emailmagazine/')
	else:
		self.redirect('/a/' + self._tenant + '/personal/')


## デフォルトでいくつかプロファイルを作成する
## ProfileUtilsをimportすると循環参照なのか何なのかエラーするのでここで処理
#def registDefaultProfile(helper, dept_vo):
#
#	# DEFAULT01
#	profile_id = 'DEFAULT01'
#	query = UCFMDLProfile.gql("where profile_id_lower = :1", UcfUtil.escapeGql(profile_id.lower()))
#	entry = query.get()
#
#	if entry is None:
#		vo = {}
#
#		unique_id = UcfUtil.guid()
#		vo['unique_id'] = unique_id
#		vo['dept_id'] = UcfUtil.getHashStr(dept_vo, 'dept_id')
#		vo['profile_id'] = profile_id
#		vo['profile_id_lower'] = profile_id.lower()
#		vo['profile_name'] = helper.getMsg('VMSG_DEFAULT01_PROFILE_NAME')
#		vo['comment'] = helper.getMsg('VMSG_DEFAULT01_PROFILE_COMMENT')
#		vo['login_lock_available_flag'] = 'AVAILABLE'
#		vo['login_lock_max_failed_count'] = '5'
#		vo['login_lock_expire_info'] = '1HOUR'
#		vo['passwordchange_unavailable_flag'] = ''
#		vo['passwordchange_sync_flag'] = ''
#		vo['password_strength_minlength'] = '8'
#		vo['password_strength_options'] = 'WITH_NUMBER,WITH_LOWER'
#		vo['password_history_policy'] = '5'
#		vo['password_expire_info'] = '1MONTH'
#		vo['mypage_links'] = '{"mypage_links_ck": "MYDOMAIN"}'
#		vo['acsctrl_active_flag'] = 'ACTIVE'
#		vo['direct_approval_count'] = '3'
#		vo['is_use_sp_config_for_tablet'] = 'ACTIVE'
#		vo['is_use_spfp_config_via_office'] = ''
#		vo['is_direct_approval_by_mac_address'] = ''
#		vo['is_use_whole_ipaddresses_for_mailproxy'] = 'ACTIVE'
#		vo['mailproxy_ipaddresses'] = ''
#		vo['is_use_whole_ipaddresses'] = 'ACTIVE'
#		vo['office_ipaddresses'] = ''
#		vo['office_login_type'] = 'OPE'
#		vo['office_autologin_available_flag'] = 'AVAILABLE'
#		vo['office_auto_redirect_url'] = ''
#		vo['office_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['office_useragents'] = ''
#		vo['office_device_check_flag'] = ''
#		vo['office_two_factor_auth_flag'] = ''
#		vo['outside_login_type'] = 'OPE'
#		vo['outside_autologin_available_flag'] = ''
#		vo['outside_auto_redirect_url'] = ''
#		vo['outside_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['outside_useragents'] = ''
#		vo['outside_device_check_flag'] = 'ACTIVE'
#		vo['outside_two_factor_auth_flag'] = ''
#		vo['sp_login_type'] = 'OPE'
#		vo['sp_autologin_available_flag'] = 'AVAILABLE'
#		vo['sp_auto_redirect_url'] = ''
#		vo['sp_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['sp_useragents'] = ''
#		vo['sp_device_check_flag'] = 'ACTIVE'
#		vo['sp_two_factor_auth_flag'] = ''
#		vo['fp_login_type'] = 'OPE'
#		vo['fp_autologin_available_flag'] = 'AVAILABLE'
#		vo['fp_auto_redirect_url'] = ''
#		vo['fp_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['fp_useragents'] = 'DC,SB,AU'
#		vo['fp_device_check_flag'] = 'ACTIVE'
#		vo['fp_two_factor_auth_flag'] = ''
#		vo['salesforce_sso_user_id_field'] = 'operator_id'
#		vo['worksmobile_sso_user_id_field'] = 'federation_identifier'
#		vo['dropbox_sso_user_id_field'] = 'mail_address'
#		vo['facebook_sso_user_id_field'] = 'mail_address'
#		vo['sateraitoaddon_sso_user_id_field'] = 'mail_address'
#		vo['salesforce_sso_active_flag'] = 'ACTIVE'
#		vo['worksmobile_sso_active_flag'] = 'ACTIVE'
#		vo['dropbox_sso_active_flag'] = 'ACTIVE'
#		vo['facebook_sso_active_flag'] = 'ACTIVE'
#		vo['sateraitoaddon_sso_active_flag'] = 'ACTIVE'
#
#		key = UcfUtil.getHashStr(vo, 'profile_id_lower') + UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
#		entry = UCFMDLProfile(unique_id=unique_id,key_name=key)
#		entry.margeFromVo(vo, helper._timezone)
#		entry.updater_name = 'regist_default_profile'
#		entry.date_changed = UcfUtil.getNow()
#		entry.creator_name = 'regist_default_profile'
#		entry.date_created = UcfUtil.getNow()
#
#		# 更新処理
#		entry.put()
#
#	# ADMIN01
#	profile_id = 'ADMIN01'
#	query = UCFMDLProfile.gql("where profile_id_lower = :1", UcfUtil.escapeGql(profile_id.lower()))
#	entry = query.get()
#	if entry is None:
#		vo = {}
#
#		unique_id = UcfUtil.guid()
#		vo['unique_id'] = unique_id
#		vo['dept_id'] = UcfUtil.getHashStr(dept_vo, 'dept_id')
#		vo['profile_id'] = profile_id
#		vo['profile_id_lower'] = profile_id.lower()
#		vo['profile_name'] = helper.getMsg('VMSG_ADMIN01_PROFILE_NAME')
#		vo['comment'] = helper.getMsg('VMSG_ADMIN01_PROFILE_COMMENT')
#		vo['login_lock_available_flag'] = 'AVAILABLE'
#		vo['login_lock_max_failed_count'] = '5'
#		vo['login_lock_expire_info'] = '1HOUR'
#		vo['passwordchange_unavailable_flag'] = ''
#		vo['passwordchange_sync_flag'] = ''
#		vo['password_strength_minlength'] = '8'
#		vo['password_strength_options'] = ''
#		vo['password_history_policy'] = ''
#		vo['password_expire_info'] = ''
#		vo['mypage_links'] = '{"mypage_links_ck": "MYDOMAIN"}'
#		vo['acsctrl_active_flag'] = ''
#		vo['direct_approval_count'] = '0'
#		vo['is_use_sp_config_for_tablet'] = 'ACTIVE'
#		vo['is_use_spfp_config_via_office'] = ''
#		vo['is_direct_approval_by_mac_address'] = ''
#		vo['is_use_whole_ipaddresses_for_mailproxy'] = 'ACTIVE'
#		vo['mailproxy_ipaddresses'] = ''
#		vo['is_use_whole_ipaddresses'] = 'ACTIVE'
#		vo['office_ipaddresses'] = ''
#		vo['office_login_type'] = 'OPE'
#		vo['office_autologin_available_flag'] = 'AVAILABLE'
#		vo['office_auto_redirect_url'] = ''
#		vo['office_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['office_useragents'] = ''
#		vo['office_device_check_flag'] = ''
#		vo['office_two_factor_auth_flag'] = ''
#		vo['outside_login_type'] = 'OPE'
#		vo['outside_autologin_available_flag'] = ''
#		vo['outside_auto_redirect_url'] = ''
#		vo['outside_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['outside_useragents'] = ''
#		vo['outside_device_check_flag'] = ''
#		vo['outside_two_factor_auth_flag'] = ''
#		vo['sp_login_type'] = 'OPE'
#		vo['sp_autologin_available_flag'] = 'AVAILABLE'
#		vo['sp_auto_redirect_url'] = ''
#		vo['sp_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['sp_useragents'] = ''
#		vo['sp_device_check_flag'] = ''
#		vo['sp_two_factor_auth_flag'] = ''
#		vo['fp_login_type'] = 'OPE'
#		vo['fp_autologin_available_flag'] = 'AVAILABLE'
#		vo['fp_auto_redirect_url'] = ''
#		vo['fp_auto_redirect_url_action_type'] = 'DASHBOARD'
#		vo['fp_useragents'] = ''
#		vo['fp_device_check_flag'] = ''
#		vo['fp_two_factor_auth_flag'] = ''
#		vo['salesforce_sso_user_id_field'] = 'operator_id'
#		vo['worksmobile_sso_user_id_field'] = 'federation_identifier'
#		vo['dropbox_sso_user_id_field'] = 'mail_address'
#		vo['facebook_sso_user_id_field'] = 'mail_address'
#		vo['sateraitoaddon_sso_user_id_field'] = 'mail_address'
#		vo['salesforce_sso_active_flag'] = 'ACTIVE'
#		vo['worksmobile_sso_active_flag'] = 'ACTIVE'
#		vo['dropbox_sso_active_flag'] = 'ACTIVE'
#		vo['facebook_sso_active_flag'] = 'ACTIVE'
#		vo['sateraitoaddon_sso_active_flag'] = 'ACTIVE'
#
#		key = UcfUtil.getHashStr(vo, 'profile_id_lower') + UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
#		entry = UCFMDLProfile(unique_id=unique_id,key_name=key)
#		entry.margeFromVo(vo, helper._timezone)
#		entry.updater_name = 'regist_default_profile'
#		entry.date_changed = UcfUtil.getNow()
#		entry.creator_name = 'regist_default_profile'
#		entry.date_created = UcfUtil.getNow()
#
#		# 更新処理
#		entry.put()

