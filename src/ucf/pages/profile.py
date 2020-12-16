# coding: utf-8

import webapp2,logging
from google.appengine.api import memcache
from ucf.utils.validates import BaseValidator
from ucf.utils.models import *
from ucf.utils.helpers import *
from ucf.pages.access_apply import AccessApplyUtils
from ucf.pages.operator import OperatorUtils
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
import sateraito_inc
import sateraito_func


############################################################
## プロファイルテーブル用メソッド
############################################################
class ProfileUtils():
	# 初期値用：データ加工
	def editVoForDefault(cls, helper, vo):
		vo['password_strength_minlength'] = '8'
		vo['password_history_policy'] = '0'
		vo['office_login_type'] = 'OPE'
		vo['outside_login_type'] = 'OPE'
		vo['sp_login_type'] = 'OPE'
		vo['fp_login_type'] = 'OPE'
		vo['is_use_sp_config_for_tablet'] = 'ACTIVE'
		vo['is_use_whole_ipaddresses'] = 'ACTIVE'
		vo['is_use_whole_ipaddresses_for_mailproxy'] = 'ACTIVE'
		vo['office_autologin_available_flag'] = 'AVAILABLE'
		vo['outside_autologin_available_flag'] = 'AVAILABLE'
		vo['sp_autologin_available_flag'] = 'AVAILABLE'
		vo['fp_autologin_available_flag'] = 'AVAILABLE'
		vo['direct_approval_count'] = '0'
		vo['acsctrl_active_flag'] = 'ACTIVE'
		vo['salesforce_sso_user_id_field'] = 'operator_id'
		vo['worksmobile_sso_user_id_field'] = 'federation_identifier'
		vo['dropbox_sso_user_id_field'] = 'mail_address'
		vo['facebook_sso_user_id_field'] = 'mail_address'
		vo['sateraitoaddon_sso_user_id_field'] = 'mail_address'
		vo['salesforce_sso_active_flag'] = 'ACTIVE'
		vo['worksmobile_sso_active_flag'] = 'ACTIVE'
		vo['dropbox_sso_active_flag'] = 'ACTIVE'
		vo['facebook_sso_active_flag'] = 'ACTIVE'
		vo['sateraitoaddon_sso_active_flag'] = 'ACTIVE'
		vo['password_strength_options'] = ''

	editVoForDefault = classmethod(editVoForDefault)

	# チェックボックス値補正（TODO 本来はフロントからPOSTするようにExtJsなどで処理すべきが取り急ぎ）
	def setNotPostValue(cls, helper, req):
		# チェックボックス項目
		cbx_fields = [
			('passwordchange_unavailable_flag', '')
			,('passwordchange_sync_flag', '')
			,('password_strength_options', '')
			,('office_autologin_available_flag', '')
			,('office_device_check_flag', '')
			,('office_two_factor_auth_flag', '')
			,('office_auto_redirect_url_action_type', '')
			,('office_client_certificate_flag', '')
			,('is_use_sp_config_for_tablet', '')
			,('is_use_spfp_config_via_office', '')
			,('is_use_whole_ipaddresses', '')
			,('is_use_whole_ipaddresses_for_mailproxy', '')
			,('is_check_password_expire_for_mailproxy', '')
			,('mypage_links_ck', '')
			,('outside_autologin_available_flag', '')
			,('outside_device_check_flag', '')
			,('outside_two_factor_auth_flag', '')
			,('outside_auto_redirect_url_action_type', '')
			,('outside_client_certificate_flag', '')
			,('sp_autologin_available_flag', '')
			,('sp_device_check_flag', '')
			,('sp_two_factor_auth_flag', '')
			,('sp_auto_redirect_url_action_type', '')
			,('sp_client_certificate_flag', '')
			,('fp_autologin_available_flag', '')
			,('fp_device_check_flag', '')
			,('fp_two_factor_auth_flag', '')
			,('fp_auto_redirect_url_action_type', '')
			,('fp_client_certificate_flag', '')
			,('is_direct_approval_by_mac_address', '')
			
		]
		for field in cbx_fields:
			if not req.has_key(field[0]):
				req[field[0]] = field[1]
	setNotPostValue = classmethod(setNotPostValue)

	# 取得用：データ加工
	def editVoForSelect(cls, helper, vo, with_expand_mypage_links=False):

		if with_expand_mypage_links:
			# mypage_linksをチェックボックスとカスタマイズリンクに分割
			mypage_links_ck = ''
			mypage_links_json = UcfUtil.getHashStr(vo, 'mypage_links')
			if mypage_links_json != '':
				mypage_links = JSONDecoder().decode(mypage_links_json)
				mypage_links_ck = UcfUtil.getHashStr(mypage_links, 'mypage_links_ck')
			#vo['mypage_links_ck'] = mypage_links_ck
			#vo['mypage_links_ck_mydomain'] = UcfUtil.isContainCsv('MYDOMAIN', mypage_links_ck, isTrimSpace=True)
			mypage_links_ck_list = []
			if mypage_links_ck != '':
				mypage_links_ck_list = UcfUtil.csvToList(mypage_links_ck)
			for link_id in mypage_links_ck_list:
				if link_id == 'MYDOMAIN':
					vo['mypage_links_ck_' + 'mydomain'] = True
				else:
					vo['mypage_links_ck_' + link_id] = True

		# クライアント証明書条件
		office_client_certificate_info_json = UcfUtil.getHashStr(vo, 'office_client_certificate_info')
		office_client_certificate_info = {}
		if office_client_certificate_info_json != '':
			office_client_certificate_info = JSONDecoder().decode(office_client_certificate_info_json)
		vo['office_client_certificate_info_subject_key'] = office_client_certificate_info.get('subject_key', '')
		vo['office_client_certificate_info_subject'] = office_client_certificate_info.get('subject', '')
		vo['office_login_type_cert_pattern'] = office_client_certificate_info.get('login_type_cert_pattern', '')
		vo['office_login_type_cert_pattern_group_index'] = office_client_certificate_info.get('login_type_cert_pattern_group_index', '')
		vo['office_login_type_cert_user_id_type'] = office_client_certificate_info.get('login_type_cert_user_id_type', '')
		outside_client_certificate_info_json = UcfUtil.getHashStr(vo, 'outside_client_certificate_info')
		outside_client_certificate_info = {}
		if outside_client_certificate_info_json != '':
			outside_client_certificate_info = JSONDecoder().decode(outside_client_certificate_info_json)
		vo['outside_client_certificate_info_subject_key'] = outside_client_certificate_info.get('subject_key', '')
		vo['outside_client_certificate_info_subject'] = outside_client_certificate_info.get('subject', '')
		vo['outside_login_type_cert_pattern'] = outside_client_certificate_info.get('login_type_cert_pattern', '')
		vo['outside_login_type_cert_pattern_group_index'] = outside_client_certificate_info.get('login_type_cert_pattern_group_index', '')
		vo['outside_login_type_cert_user_id_type'] = outside_client_certificate_info.get('login_type_cert_user_id_type', '')
		sp_client_certificate_info_json = UcfUtil.getHashStr(vo, 'sp_client_certificate_info')
		sp_client_certificate_info = {}
		if sp_client_certificate_info_json != '':
			sp_client_certificate_info = JSONDecoder().decode(sp_client_certificate_info_json)
		vo['sp_client_certificate_info_subject_key'] = sp_client_certificate_info.get('subject_key', '')
		vo['sp_client_certificate_info_subject'] = sp_client_certificate_info.get('subject', '')
		vo['sp_login_type_cert_pattern'] = sp_client_certificate_info.get('login_type_cert_pattern', '')
		vo['sp_login_type_cert_pattern_group_index'] = sp_client_certificate_info.get('login_type_cert_pattern_group_index', '')
		vo['sp_login_type_cert_user_id_type'] = sp_client_certificate_info.get('login_type_cert_user_id_type', '')
		fp_client_certificate_info_json = UcfUtil.getHashStr(vo, 'fp_client_certificate_info')
		fp_client_certificate_info = {}
		if fp_client_certificate_info_json != '':
			fp_client_certificate_info = JSONDecoder().decode(fp_client_certificate_info_json)
		vo['fp_client_certificate_info_subject_key'] = fp_client_certificate_info.get('subject_key', '')
		vo['fp_client_certificate_info_subject'] = fp_client_certificate_info.get('subject', '')
		vo['fp_login_type_cert_pattern'] = fp_client_certificate_info.get('login_type_cert_pattern', '')
		vo['fp_login_type_cert_pattern_group_index'] = fp_client_certificate_info.get('login_type_cert_pattern_group_index', '')
		vo['fp_login_type_cert_user_id_type'] = fp_client_certificate_info.get('login_type_cert_user_id_type', '')

		# セールスフォース連携項目（デフォルトセット）
		if vo['salesforce_sso_user_id_field'] == '':
			vo['salesforce_sso_user_id_field'] = 'operator_id'

		# WorksMobile連携項目（デフォルトセット）
		if vo['worksmobile_sso_user_id_field'] == '':
			vo['worksmobile_sso_user_id_field'] = 'operator_id'

		# Dropbox連携項目（デフォルトセット）
		if vo['dropbox_sso_user_id_field'] == '':
			vo['dropbox_sso_user_id_field'] = 'operator_id'

		# Facebook連携項目（デフォルトセット）
		if vo['facebook_sso_user_id_field'] == '':
			vo['facebook_sso_user_id_field'] = 'operator_id'

		# サテライトアドオン連携項目（デフォルトセット）
		if vo['sateraitoaddon_sso_user_id_field'] == '':
			vo['sateraitoaddon_sso_user_id_field'] = 'operator_id'

	editVoForSelect = classmethod(editVoForSelect)

	# 更新用：データ加工
	def editVoForRegist(cls, helper, vo, entry_vo, edit_type):
		if edit_type == UcfConfig.EDIT_TYPE_NEW:
			vo['dept_id'] = UcfUtil.getHashStr(helper.getDeptInfo(), 'dept_id')
		vo['profile_id_lower'] = vo['profile_id'].lower()									# 小文字（検索、重複チェック用）

		# mypage_links
		mypage_links = {}
		mypage_links['mypage_links_ck'] = UcfUtil.getHashStr(vo, 'mypage_links_ck')
		vo['mypage_links'] = JSONEncoder().encode(mypage_links)

		# クライアント証明書条件
		office_client_certificate_info = {}
		office_client_certificate_info['subject_key'] = UcfUtil.getHashStr(vo, 'office_client_certificate_info_subject_key')
		office_client_certificate_info['subject'] = UcfUtil.getHashStr(vo, 'office_client_certificate_info_subject')
		office_client_certificate_info['login_type_cert_pattern'] = UcfUtil.getHashStr(vo, 'office_login_type_cert_pattern')
		office_client_certificate_info['login_type_cert_pattern_group_index'] = UcfUtil.getHashStr(vo, 'office_login_type_cert_pattern_group_index')
		office_client_certificate_info['login_type_cert_user_id_type'] = UcfUtil.getHashStr(vo, 'office_login_type_cert_user_id_type')
		vo['office_client_certificate_info'] = JSONEncoder().encode(office_client_certificate_info)
		outside_client_certificate_info = {}
		outside_client_certificate_info['subject_key'] = UcfUtil.getHashStr(vo, 'outside_client_certificate_info_subject_key')
		outside_client_certificate_info['subject'] = UcfUtil.getHashStr(vo, 'outside_client_certificate_info_subject')
		outside_client_certificate_info['login_type_cert_pattern'] = UcfUtil.getHashStr(vo, 'outside_login_type_cert_pattern')
		outside_client_certificate_info['login_type_cert_pattern_group_index'] = UcfUtil.getHashStr(vo, 'outside_login_type_cert_pattern_group_index')
		outside_client_certificate_info['login_type_cert_user_id_type'] = UcfUtil.getHashStr(vo, 'outside_login_type_cert_user_id_type')
		vo['outside_client_certificate_info'] = JSONEncoder().encode(outside_client_certificate_info)
		sp_client_certificate_info = {}
		sp_client_certificate_info['subject_key'] = UcfUtil.getHashStr(vo, 'sp_client_certificate_info_subject_key')
		sp_client_certificate_info['subject'] = UcfUtil.getHashStr(vo, 'sp_client_certificate_info_subject')
		sp_client_certificate_info['login_type_cert_pattern'] = UcfUtil.getHashStr(vo, 'sp_login_type_cert_pattern')
		sp_client_certificate_info['login_type_cert_pattern_group_index'] = UcfUtil.getHashStr(vo, 'sp_login_type_cert_pattern_group_index')
		sp_client_certificate_info['login_type_cert_user_id_type'] = UcfUtil.getHashStr(vo, 'sp_login_type_cert_user_id_type')
		vo['sp_client_certificate_info'] = JSONEncoder().encode(sp_client_certificate_info)
		fp_client_certificate_info = {}
		fp_client_certificate_info['subject_key'] = UcfUtil.getHashStr(vo, 'fp_client_certificate_info_subject_key')
		fp_client_certificate_info['subject'] = UcfUtil.getHashStr(vo, 'fp_client_certificate_info_subject')
		fp_client_certificate_info['login_type_cert_pattern'] = UcfUtil.getHashStr(vo, 'fp_login_type_cert_pattern')
		fp_client_certificate_info['login_type_cert_pattern_group_index'] = UcfUtil.getHashStr(vo, 'fp_login_type_cert_pattern_group_index')
		fp_client_certificate_info['login_type_cert_user_id_type'] = UcfUtil.getHashStr(vo, 'fp_login_type_cert_user_id_type')
		vo['fp_client_certificate_info'] = JSONEncoder().encode(fp_client_certificate_info)

	editVoForRegist = classmethod(editVoForRegist)

	# 既存データを取得
	def getData(cls, helper, unique_id):
		query = UCFMDLProfile.gql("where unique_id = :1", UcfUtil.escapeGql(unique_id))
		entry = query.get()
		return entry
	getData = classmethod(getData)

	# キーに使用する値を取得（※ucffunc.registDefaultProfileメソッドでも同様の処理をしているのでもし変更するならそちらも）
	def getKey(cls, helper, vo):
		return UcfUtil.getHashStr(vo, 'profile_id_lower') + UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
	getKey = classmethod(getKey)

	# コピー新規用に不要なデータをvoから削除
	def removeFromVoForCopyRegist(cls, helper, vo):
		vo['unique_id'] = ''
		vo['date_created'] = ''
		vo['date_changed'] = ''
		vo['creator_name'] = ''
		vo['updater_name'] = ''

	removeFromVoForCopyRegist = classmethod(removeFromVoForCopyRegist)

	# ブラウザ（ユーザエージェント）一覧
	def getAccessControlUserAgentList(cls, helper):
		list_useragent = []
		#list_useragent.append({'useragentid':'SATERAITOSECURITYBROWSER_WINDOWS', 'disp':helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_WINDOWS'),'target':('office','outside')})
		#list_useragent.append({'useragentid':'SATERAITOSECURITYBROWSER_MAC', 'disp':helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_MAC'),'target':('office','outside')})
		#list_useragent.append({'useragentid':'SATERAITOSECURITYBROWSER_ANDROID', 'disp':helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_ANDROID'),'target':('office','outside','sp')})
		#list_useragent.append({'useragentid':'SATERAITOSECURITYBROWSER_IOS', 'disp':helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_IOS'),'target':('office','outside','sp')})
		#list_useragent.append({'useragentid':'SSOCLIENT', 'disp':helper.getMsg('DEVICE_SSOCLIENT'),'target':('office','outside')})
		list_useragent.append({'useragentid':'EDGE', 'disp':helper.getMsg('DEVICE_EDGE') + ' ' + helper.getMsg('WHOLE'),'target':('office','outside','sp')})		# 「Microsoft Edge」対応 2015.07.17
		list_useragent.append({'useragentid':'IE', 'disp':helper.getMsg('DEVICE_IE') + ' ' + helper.getMsg('WHOLE'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'IE11', 'disp':helper.getMsg('DEVICE_IE') + ' ' + '11','target':('office','outside')})
		list_useragent.append({'useragentid':'IE10', 'disp':helper.getMsg('DEVICE_IE') + ' ' + '10','target':('office','outside')})
		list_useragent.append({'useragentid':'IE9', 'disp':helper.getMsg('DEVICE_IE') + ' ' + '9','target':('office','outside')})
		list_useragent.append({'useragentid':'IE8', 'disp':helper.getMsg('DEVICE_IE') + ' ' + '8','target':('office','outside')})
		list_useragent.append({'useragentid':'IE7', 'disp':helper.getMsg('DEVICE_IE') + ' ' + '7','target':('office','outside')})
		list_useragent.append({'useragentid':'IE6', 'disp':helper.getMsg('DEVICE_IE') + ' ' + '6','target':('office','outside')})
		list_useragent.append({'useragentid':'FF', 'disp':helper.getMsg('DEVICE_FF') + ' ' + helper.getMsg('WHOLE'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'CR', 'disp':helper.getMsg('DEVICE_CR') + ' ' + helper.getMsg('WHOLE'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'SF', 'disp':helper.getMsg('DEVICE_SF') + ' ' + helper.getMsg('WHOLE'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'OP', 'disp':helper.getMsg('DEVICE_OP') + ' ' + helper.getMsg('WHOLE'),'target':('office','outside')})
		list_useragent.append({'useragentid':'LS', 'disp':helper.getMsg('DEVICE_LS') + ' ' + helper.getMsg('WHOLE'),'target':('office','outside')})
		list_useragent.append({'useragentid':'ANDROID', 'disp':helper.getMsg('DEVICE_ANDROID'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'BLACKBERRY', 'disp':helper.getMsg('DEVICE_BLACKBERRY'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'WINDOWSPHONE', 'disp':helper.getMsg('DEVICE_WINDOWSPHONE'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'IPHONE', 'disp':helper.getMsg('DEVICE_IPHONE'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'IPAD', 'disp':helper.getMsg('DEVICE_IPAD'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'KAITO', 'disp':helper.getMsg('DEVICE_KAITO'),'target':('office','outside','sp')})
		# CLOMOセキュリティブラウザ 2013/10/16 追加
		list_useragent.append({'useragentid':'CLOMO', 'disp':helper.getMsg('DEVICE_CLOMO'),'target':('office','outside','sp')})
		# IIJセキュリティブラウザ 2013/12/05 追加
		list_useragent.append({'useragentid':'IIJSMB', 'disp':helper.getMsg('DEVICE_IIJSMB'),'target':('office','outside','sp')})
		# CACHATTOセキュリティブラウザ 2016/02/21 追加
		list_useragent.append({'useragentid':'CACHATTO', 'disp':helper.getMsg('DEVICE_CACHATTO'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'IPOD', 'disp':helper.getMsg('DEVICE_IPOD'),'target':('office','outside','sp')})
		list_useragent.append({'useragentid':'DC', 'disp':helper.getMsg('DEVICE_DC'),'target':('office','outside','fp')})
		list_useragent.append({'useragentid':'SB', 'disp':helper.getMsg('DEVICE_SB'),'target':('office','outside','fp')})
		list_useragent.append({'useragentid':'AU', 'disp':helper.getMsg('DEVICE_AU'),'target':('office','outside','fp')})
		list_useragent.append({'useragentid':'WILLCOM', 'disp':helper.getMsg('DEVICE_WILLCOM'),'target':('office','outside','fp')})
		return list_useragent
	getAccessControlUserAgentList = classmethod(getAccessControlUserAgentList)


	# 指定ユーザエージェント文字列が、指定ユーザエージェントIDに当てはまるかどうかを判定（※helperのjudgeTargetCareerメソッド、access_applyのgetUserAgentDispとも連動したい）
	def _judgeUserAgentToMatchUserAgentID(cls, helper, useragentid, useragent):
		strAgent = useragent.lower()
		strJphone = helper.getServerVariables("HTTP_X_JPHONE_MSNAME").lower()
		strAccept = helper.getServerVariables("HTTP_ACCEPT").lower()

		## サテライト・セキュリティブラウザ対応 2014/11/19 追加
		#if useragentid == 'SATERAITOSECURITYBROWSER_IOS':
		#	return strAgent.find('SateraitoSecurityBrowser'.lower())>=0 and ( (strAgent.find('iPhone OS 2_0'.lower())>=0 or strAgent.find('iPhone'.lower())>=0) or (strAgent.find('iPod'.lower())>=0) or (strAgent.find('iPad'.lower())>=0) )
		#if useragentid == 'SATERAITOSECURITYBROWSER_ANDROID':
		#	return strAgent.find('SateraitoSecurityBrowser'.lower())>=0 and strAgent.find('Android '.lower())>=0
		## Mac版セキュリティブラウザに対応 2016.04.13
		#if useragentid == 'SATERAITOSECURITYBROWSER_MAC':
		#	return strAgent.find('SateraitoSecurityBrowser'.lower())>=0 and strAgent.find('Mac OS X'.lower())>=0
		## SSOCLIENT
		#if useragentid == 'SSOCLIENT':
		#	return strAgent.find('SSOCLIENT'.lower())>=0
		# Blackberry
		if useragentid == 'BLACKBERRY':
			return strAgent.find('BlackBerry'.lower())>=0
		# WindowsPhone
		if useragentid == 'WINDOWSPHONE':
			return strAgent.find('IEMobile'.lower())>=0 or strAgent.find('Windows Phone'.lower())>=0
		# WILLCOM
		if useragentid == 'WILLCOM':
			return strAgent.find('WILLCOM'.lower())>=0 or strAgent.find('DDIPOCKET'.lower())>=0
		# SoftBank
		if useragentid == 'SB':
			return strJphone!='' or strAgent.find('j-phone'.lower())>=0 or strAgent.find('softbank'.lower())>=0 or strAgent.find('vodafone'.lower())>=0 or strAgent.find('mot-'.lower())>=0
		# au
		if useragentid == 'AU':
			return strAgent.find('kddi'.lower())>=0 or strAgent.find('up.browser'.lower())>=0 or strAccept.find('hdml'.lower())>=0
		# Docomo
		if useragentid == 'DC':
			return strAgent.find('docomo'.lower())>=0
		# KAITO
		if useragentid == 'KAITO':
			return strAgent.find('KAITO'.lower())>=0
		# CLOMOセキュリティブラウザ 2013/10/16 追加
		if useragentid == 'CLOMO':
			return strAgent.find('SecuredBrowser'.lower())>=0 and strAgent.find('.securedbrowser'.lower())>=0
		# IIJセキュリティブラウザ 2013/12/05 追加
		if useragentid == 'IIJSMB':
			#return strAgent.find('IIJsmb/'.lower())>=0
			return strAgent.find('IIJsmb'.lower())>=0
		# CACHATTOセキュリティブラウザ 2016/02/21 追加
		if useragentid == 'CACHATTO':
			return strAgent.find('Cachatto'.lower())>=0
		# iPhone
		if useragentid == 'IPHONE':
			# WindowsMobileにもiPhoneと含まれるケースがあるので除外 2015.12.24
			return strAgent.find('iPhone'.lower())>=0 and not strAgent.find('iPad'.lower())>=0 and not strAgent.find('Windows Phone'.lower())>=0
		# iPod
		if useragentid == 'IPOD':
			return strAgent.find('iPod'.lower())>=0
		# Android
		if useragentid == 'ANDROID':
			return strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())>=0
		# iPad
		if useragentid == 'IPAD':
			return strAgent.find('iPad'.lower())>=0
		# Microsoft Edge 追加 2015.07.17
		if useragentid == 'EDGE':
			return strAgent.find('Edge'.lower())>=0
		# IE
		if useragentid == 'IE':
			# IE系は「Cachatto for Windows」を除外 2016.02.21
			#return strAgent.find('MSIE'.lower())>=0 or strAgent.find('Trident'.lower())>=0
			return (strAgent.find('MSIE'.lower())>=0 or strAgent.find('Trident'.lower())>=0) and strAgent.find('Cachatto'.lower())<0
		# IE11
		if useragentid == 'IE11':
			# OEM版のIE11（MALC 文字列を含む）に対応 2015.07.10
			#return strAgent.find('Trident/7.0; rv:11'.lower())>=0 or strAgent.find('Trident/7.0; Touch; rv:11'.lower())>=0
			# IE系は「Cachatto for Windows」を除外 2016.02.21
			#return strAgent.find('Trident/7.0;'.lower())>=0 and strAgent.find(' rv:11'.lower())>=0
			return strAgent.find('Trident/7.0;'.lower())>=0 and strAgent.find(' rv:11'.lower())>=0 and strAgent.find('Cachatto'.lower())<0
		# IE10
		if useragentid == 'IE10':
			# IE系は「Cachatto for Windows」を除外 2016.02.21
			#return strAgent.find('MSIE 10'.lower())>=0
			return strAgent.find('MSIE 10'.lower())>=0 and strAgent.find('Cachatto'.lower())<0
		# IE9
		if useragentid == 'IE9':
			# IE系は「Cachatto for Windows」を除外 2016.02.21
			return strAgent.find('MSIE 9'.lower())>=0 and strAgent.find('Cachatto'.lower())<0
		# IE8
		if useragentid == 'IE8':
			# IE系は「Cachatto for Windows」を除外 2016.02.21
			return strAgent.find('MSIE 8'.lower())>=0 and strAgent.find('Cachatto'.lower())<0
		# IE7
		if useragentid == 'IE7':
			# IE系は「Cachatto for Windows」を除外 2016.02.21
			return strAgent.find('MSIE 7'.lower())>=0 and strAgent.find('Cachatto'.lower())<0
		# IE6
		if useragentid == 'IE6':
			# IE系は「Cachatto for Windows」を除外 2016.02.21
			return strAgent.find('MSIE 6'.lower())>=0 and strAgent.find('Cachatto'.lower())<0
		# FireFox
		if useragentid == 'FF':
			return strAgent.find('FireFox'.lower())>=0
		# Chrome
		if useragentid == 'CR':
			# iOSのChromeにも対応 2014.02.17
			#return strAgent.find('Chrome'.lower())>=0
			# Opera15以降でもChromeという文字が入っているので対応
			#return strAgent.find('Chrome'.lower())>=0 or strAgent.find('CriOS'.lower())>=0
			# Microsoft EdgeにもChromeという文字が入っているので対応 2015.07.17
			#return (strAgent.find('Chrome'.lower())>=0 and strAgent.find('OPR'.lower())<0) or strAgent.find('CriOS'.lower())>=0
			# 「Cachatto Secure Browser」を除外 2016.02.21
			#return (strAgent.find('Chrome'.lower())>=0 and strAgent.find('OPR'.lower())<0 and strAgent.find('Edge'.lower())<0) or strAgent.find('CriOS'.lower())>=0
			return ((strAgent.find('Chrome'.lower())>=0 and strAgent.find('OPR'.lower())<0 and strAgent.find('Edge'.lower())<0) or strAgent.find('CriOS'.lower())>=0) and strAgent.find('Cachatto'.lower())<0
		# Safari（ChromeにもSafariの文字が入っているのでそれははじく）
		if useragentid == 'SF':
			# iOSのChromeにも対応 2015.01.07
			#return strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0
			# Microsoft EdgeにもSafariという文字が入っているので対応 2015.07.17
			#return strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0 and strAgent.find('CriOS'.lower())<0
			# 「Cachatto Secure Browser」を除外 2016.02.21
			#return strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0 and strAgent.find('CriOS'.lower())<0 and strAgent.find('Edge'.lower())<0
			# Mac版セキュリティブラウザにも「Safari」の文字が入ってくるので対応 2016.04.13
			#return strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0 and strAgent.find('CriOS'.lower())<0 and strAgent.find('Edge'.lower())<0 and strAgent.find('Cachatto'.lower())<0
			return strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0 and strAgent.find('CriOS'.lower())<0 and strAgent.find('Edge'.lower())<0 and strAgent.find('Cachatto'.lower())<0 and strAgent.find('SateraitoSecurityBrowser'.lower())<0
		# Opera
		if useragentid == 'OP':
			# Opera15以降のChromimum化対応 2014.07.29
			#return strAgent.find('Opera'.lower())>=0
			return strAgent.find('Opera'.lower())>=0 or (strAgent.find('Chrome'.lower())>=0 and strAgent.find('OPR'.lower())>=0)
		# Lunascape
		if useragentid == 'LS':
			return strAgent.find('Lunascape'.lower())>=0

		return False
	_judgeUserAgentToMatchUserAgentID = classmethod(_judgeUserAgentToMatchUserAgentID)

	# プロファイルIDにて1件取得
	def getProfileByProfileID(cls, helper, profile_id, is_with_cache=False):

		profile_vo = None
		if profile_id is not None and profile_id != '':

			# ログインパフォーマンスチューニング…少しだけキャッシュ
			if is_with_cache:
				profile_vo = ProfileUtils.getProfileMemCache(helper, profile_id)

			if profile_vo is None:
				query = UCFMDLProfile.all(keys_only=True)
				query.filter('profile_id_lower = ', profile_id.lower())
				entry = UCFMDLProfile.getByKey(query.get())
				if entry is not None:
					profile_vo = entry.exchangeVo(helper._timezone)
					ProfileUtils.editVoForSelect(helper, profile_vo)
				# セットは、is_with_cacheによらずしてOK
				ProfileUtils.setProfileMemCache(helper, profile_id, profile_vo)

		return profile_vo
	getProfileByProfileID = classmethod(getProfileByProfileID)

	def getProfileMemCache(cls, helper, profile_id):
		memcache_key = 'profile?domain=' + helper._tenant + '&profile_id=' + profile_id
		return memcache.get(memcache_key)
	getProfileMemCache = classmethod(getProfileMemCache)

	def setProfileMemCache(cls, helper, profile_id, profile_vo):
		memcache_key = 'profile?domain=' + helper._tenant + '&profile_id=' + profile_id
		memcache.set(key=memcache_key, value=profile_vo, time=300)
	setProfileMemCache = classmethod(setProfileMemCache)


	# プロファイルvoから今回アクセスされたネットワークに基づいて使用する各種情報を返す
	def appendProfileInfoByNetwork(cls, helper, profile_vo):
		if profile_vo is not None:

			# DeptMasterの「is_disable_fp」フラグはU/A判定時に考慮しているのでここでは基本的には考慮不要 2015.07.09
			is_disable_fp = helper.getDeptInfo() is not None and helper.getDeptValue('is_disable_fp') == 'True'

			# 社内、社外、スマホ、ガラ携帯の判別
			target_env = ''	# office, outside, sp, fp

			check_career_type = helper._career_type
			# スマホ版セキュリティブラウザからのサインインAPI（checkauth3）アクセスの考慮を追加 2014.09.09
			if helper._career_type_for_api != '':
				check_career_type = helper._career_type_for_api

			# タブレットはＰＣではなくスマートフォン扱い
			is_use_sp_config_for_tablet = profile_vo.get('is_use_sp_config_for_tablet', '') == 'ACTIVE'
			# 社内アクセス時もスマートフォン、ガラ携帯の設定を優先する（タブレットをスマートフォン扱いとする場合も含む）
			is_use_spfp_config_via_office = profile_vo.get('is_use_spfp_config_via_office', '') == 'ACTIVE'

			# ガラ携帯アプリAPIの場合は、fp 固定とする（ガラ携帯の設定が無効な場合は除く）
			if not is_disable_fp and helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_FPAPP:
				target_env = 'fp'
			else:
				is_fix_target = False

				# アクセス制御に使用する有効なクライアントIPアドレスを一つ決定
				if helper._is_api and helper._client_ip_for_api is not None and helper._client_ip_for_api != '':
					target_client_ip = helper._client_ip_for_api
				else:
					target_client_ip = ProfileUtils._getValidClientIPAddressForAccessControl(helper, profile_vo)

				# まず社内かどうか判定
				if is_fix_target == False:
					# 複数クライアントIPアドレスに対応 2017.05.25
					#if UcfUtil.isCheckIPAddressRange(target_client_ip, ProfileUtils._getOfficeNetworkIPAddresses(helper, profile_vo)):
					is_in_office = False
					target_client_ips = target_client_ip.split(',')
					for client_ip in target_client_ips:
						if client_ip.strip() != '' and UcfUtil.isCheckIPAddressRange(client_ip, ProfileUtils._getOfficeNetworkIPAddresses(helper, profile_vo)):
							is_in_office = True
							break
					if is_in_office:
						# 社内アクセス時もスマートフォン、ガラ携帯の設定を優先する設定を適用
						if is_use_spfp_config_via_office and check_career_type in [UcfConfig.VALUE_CAREER_TYPE_SP, UcfConfig.VALUE_CAREER_TYPE_TABLET, UcfConfig.VALUE_CAREER_TYPE_MOBILE]:
							pass
						else:
							target_env = 'office'
							is_fix_target = True
				
				# 社外ガラ携帯判定
				if is_fix_target == False and check_career_type == UcfConfig.VALUE_CAREER_TYPE_MOBILE:
					target_env = 'fp'
					is_fix_target = True

				# 社外スマホ判定
				if is_fix_target == False and check_career_type == UcfConfig.VALUE_CAREER_TYPE_SP:
					target_env = 'sp'
					is_fix_target = True

				# タブレットをスマホ扱いにするオプション
				if is_fix_target == False and is_use_sp_config_for_tablet and check_career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET:
					target_env = 'sp'
					is_fix_target = True

				# 社外判定
				if is_fix_target == False:
					target_env = 'outside'
					is_fix_target = True


			
			# 決定したtargetから使用する情報一式を追加
			profile_vo['login_type'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'login_type')
			profile_vo['autologin_available_flag'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'autologin_available_flag')
#			profile_vo['acsctrl_active_flag'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'acsctrl_active_flag')			# ※プロファイル内共通設定になったのでコメントアウト
			profile_vo['useragents'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'useragents')
			profile_vo['device_check_flag'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'device_check_flag')
			profile_vo['two_factor_auth_flag'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'two_factor_auth_flag')
			profile_vo['client_certificate_flag'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'client_certificate_flag')
			profile_vo['client_certificate_info'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'client_certificate_info')
			profile_vo['auto_redirect_url'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'auto_redirect_url')
			profile_vo['auto_redirect_url_action_type'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'auto_redirect_url_action_type')
			profile_vo['access_by_network_type'] = UcfUtil.getHashStr(profile_vo, target_env + '_' + 'access_by_network_type')
			profile_vo['target_env'] = target_env

	appendProfileInfoByNetwork = classmethod(appendProfileInfoByNetwork)

	# プロファイルに基づいてアクセスコントロールチェック
	def isValidAccess(cls, helper, profile_vo, user_vo, is_for_access_apply=False):
		use_access_apply_unique_id = ''

		# プロファイル指定なしならOKを返して終了
		if profile_vo is None:
			return True, '', '', use_access_apply_unique_id

		# アクセス制御しないならOKを返して終了
		if UcfUtil.getHashStr(profile_vo, 'acsctrl_active_flag') != 'ACTIVE':
			return True, '', '', use_access_apply_unique_id

		# 登録された端末のみログインを許可する（SSOクライアントアプリ用）
		is_login_client_need_device_distinguish_id = UcfUtil.getHashStr(profile_vo, 'is_login_client_need_device_distinguish_id') == 'ACTIVE'
		# 登録された端末は端末申請なしでもログインを許可する（SSOクライアントアプリ用）
		is_login_client_accept_regist_device = UcfUtil.getHashStr(profile_vo, 'is_login_client_accept_regist_device') == 'ACTIVE'

		logging.info('is_login_client_need_device_distinguish_id=' + str(is_login_client_need_device_distinguish_id))
		logging.info('is_login_client_accept_regist_device=' + str(is_login_client_accept_regist_device))

		# ユーザやプロファイルに事前登録されたMACアドレス、Identifer For Vendor、UUID 一覧
		whitelist_device_distinguish_ids = []
		is_already_retrieve_whitelist_device_distinguish_ids = False

		# 端末のMACアドレス
		if helper._is_api and helper._device_mac_address_for_api != '':
			device_mac_address = helper._device_mac_address_for_api
		else:
			device_mac_address = ucffunc.getDeviceMacAddress(helper) 
		# 端末のIdentifierForVendor
		if helper._is_api and helper._device_identifier_for_vendor_for_api != '':
			device_identifier_for_vendor = helper._device_identifier_for_vendor_for_api
		else:
			device_identifier_for_vendor = ucffunc.getDeviceIdentifierForVendor(helper) 

		is_valid_env = False
		is_valid_useragent = False
		is_valid_device = False

		error_code = ''
		check_info = ''


		# プロファイルからセキュリティブラウザの設定を取得
		ssoclient = {}
		if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_SECURITYBROWSER:
			ssoclient_security_browser_config_json = UcfUtil.getHashStr(profile_vo, 'ssoclient_security_browser_config')
			logging.info(ssoclient_security_browser_config_json)
			if ssoclient_security_browser_config_json != '':
				ssoclient_security_browser_config = JSONDecoder().decode(ssoclient_security_browser_config_json)
				# Androidの場合
				if helper._is_android and device_mac_address != '':
					ssoclient = ssoclient_security_browser_config.get('android', {})
				# iOS版セキュリティブラウザの場合
				elif helper._is_ios and (device_identifier_for_vendor != '' or device_mac_address != ''):
					ssoclient = ssoclient_security_browser_config.get('ios', {})
			logging.info(ssoclient)

		# ユーザーとプロファイルから登録端末ID（MACアドレス、Identifier for Vendor）を取得
		if not is_already_retrieve_whitelist_device_distinguish_ids and (is_login_client_need_device_distinguish_id or is_login_client_accept_regist_device or ssoclient.get('is_accept_regist_device', '') == 'ACTIVE' or ssoclient.get('is_need_device_distinguish_id_for_login', '') == 'ACTIVE'):
			whitelist_device_distinguish_ids = ProfileUtils.getProfileAndUserDeviceDistinguishIDsForSearch(profile_vo, user_vo)
			is_already_retrieve_whitelist_device_distinguish_ids = True


		# ネットワーク、環境（社内、社外、スマホ）からのアクセス禁止オプションのチェック 2016.06.06
		if UcfUtil.getHashStr(profile_vo, 'access_by_network_type') == 'DENY':
			is_valid_env = False
			error_code = 'ACCESS_CONTROL_ENVIRONMENT'
		else:
			is_valid_env = True

		is_valid_device_distinguish_id = False
		if is_valid_env:
			is_valid_device_distinguish_id = True

			# 非Federatedドメイン用SSOクライアントアプリAPIでMACアドレスにより「登録された端末のみログインを許可する」のチェック（SSOクライアントアプリ、セキュリティブラウザ）
			# アクセス申請用のログインなら端末チェックは当然しない
			if not is_for_access_apply and helper._is_api:
				# SSOログインアプリ
				if helper._application_id == UcfConfig.APPLICATIONID_SSOLOGINCLIENT and (is_login_client_need_device_distinguish_id and not (ProfileUtils.isInTargetMacAddress(device_mac_address, whitelist_device_distinguish_ids) or ProfileUtils.isInTargetIdentifierForVendor(device_identifier_for_vendor, whitelist_device_distinguish_ids))):
					is_valid_device_distinguish_id = False
					error_code = 'NO_REGIST_DEVICE_ID'
				# セキュリティブラウザ
				elif helper._application_id == UcfConfig.APPLICATIONID_SECURITYBROWSER and ssoclient.get('is_need_device_distinguish_id_for_login', '') == 'ACTIVE':
					# Androidの場合
					if helper._is_android and device_mac_address != '' and not ProfileUtils.isInTargetMacAddress(device_mac_address, whitelist_device_distinguish_ids):
						is_valid_device_distinguish_id = False
						error_code = 'NO_REGIST_DEVICE_ID'
					# iOS版セキュリティブラウザの場合
					elif helper._is_ios and (device_identifier_for_vendor != '' and not ProfileUtils.isInTargetIdentifierForVendor(device_identifier_for_vendor, whitelist_device_distinguish_ids)) or (device_mac_address != '' and not ProfileUtils.isInTargetMacAddress(device_mac_address, whitelist_device_distinguish_ids)):
						is_valid_device_distinguish_id = False
						error_code = 'NO_REGIST_DEVICE_ID'

		# ブラウザチェック
		if is_valid_env and is_valid_device_distinguish_id:

			# ガラ携帯アプリAPIならブラウザチェックはスルー
			if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_FPAPP:
				is_valid_useragent = True
			# メールプロキシアプリAPIならブラウザチェックはスルー
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MAILPROXY:
				is_valid_useragent = True
			# メールチェッカーアプリAPIならブラウザチェックはスルー
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MCAPP:
				is_valid_useragent = True
			# 非Federatedドメイン用SSOクライアントアプリAPIならブラウザチェックはスルー
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_SSOLOGINCLIENT:
				is_valid_useragent = True
			# PC＆スマートフォンSSOログインアプリの端末申請処理ならブラウザチェックはスルー（セキュリティブラウザは「APPLICATIONID_SECURITYBROWSER」なのでここには入らない）
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_AUTHAPP:
				is_valid_useragent = True
			# 認証APIなら（組織カレンダーなどのスマホアプリ用）
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_CHECKAUTH2:
				is_valid_useragent = True
			# WS-Federation Active認証ならブラウザチェックはスル―
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_WSTRUST:
				is_valid_useragent = True
			else:
				useragentids = UcfUtil.csvToList(UcfUtil.getHashStr(profile_vo, 'useragents'))
				# 未指定なら無制限
				if len(useragentids) == 0:
					is_valid_useragent = True
				else:
					# ユーザエージェントが指定一覧にあればOK、なければNG
					# 定義されているユーザエージェントリストを取得
					list_useragent = ProfileUtils.getAccessControlUserAgentList(helper)
					# 今回使用する設定に関して判定処理
					useragentids.append('')	# 1件だけだと配列としてチェックしてくれないので空文字を追加して配列比較をするようにする...
					list_current_target_useragent = []
					for useragent in list_useragent:
						# 今回チェックする設定なら
						if useragent['useragentid'] in useragentids:
							if ProfileUtils._judgeUserAgentToMatchUserAgentID(helper, useragent['useragentid'], helper.getUserAgent()):
								is_valid_useragent = True
								break

					if is_valid_useragent == False:
						if is_for_access_apply:
							error_code = 'ACCESS_CONTROL_USERAGENT_FOR_ACS_APPLY'
						else:
							error_code = 'ACCESS_CONTROL_USERAGENT'

		if is_valid_env and is_valid_device_distinguish_id and is_valid_useragent == True:

			# ユーザーとプロファイルから登録端末ID（MACアドレス、Identifier for Vendor）を取得
			if not is_already_retrieve_whitelist_device_distinguish_ids and is_login_client_accept_regist_device:
				whitelist_device_distinguish_ids = ProfileUtils.getProfileAndUserDeviceDistinguishIDsForSearch(profile_vo, user_vo)
				is_already_retrieve_whitelist_device_distinguish_ids = True

			# 端末制御チェック
			# ガラ携帯アプリAPIなら端末チェックはスルー（ガラ携帯アプリからの自動ログイン連携の場合もこちら。↓ではなく）
			if helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_FPAPP:
				is_valid_device = True
			# メールプロキシアプリAPIなら端末チェックはスルー
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_MAILPROXY:
				is_valid_device = True
			# 非Federatedドメイン用SSOクライアントアプリAPIでMACアドレスにより端末申請をスキップしていい場合はスルー
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_SSOLOGINCLIENT and (is_login_client_accept_regist_device and (ProfileUtils.isInTargetMacAddress(device_mac_address, whitelist_device_distinguish_ids) or ProfileUtils.isInTargetIdentifierForVendor(device_identifier_for_vendor, whitelist_device_distinguish_ids))):
				is_valid_device = True
			# セキュリティブラウザAPIでMACアドレスにより端末申請をスキップしていい場合はスルー
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_SECURITYBROWSER and (ssoclient.get('is_accept_regist_device', '') == 'ACTIVE' and (ProfileUtils.isInTargetMacAddress(device_mac_address, whitelist_device_distinguish_ids) or ProfileUtils.isInTargetIdentifierForVendor(device_identifier_for_vendor, whitelist_device_distinguish_ids))):
				is_valid_device = True
			# SSO自動ログイン連携なら端末チェックはスルー
			elif helper._application_id in [UcfConfig.APPLICATIONID_SSOAUTOLOGIN001, UcfConfig.APPLICATIONID_SSOAUTOLOGIN002]:
				is_valid_device = True
			# 認証APIなら（組織カレンダーなどのスマホアプリ用）
			elif helper._application_id == UcfConfig.APPLICATIONID_CHECKAUTH2:
				is_valid_device = True
			# WS-Federation Active認証なら端末チェックはスルー
			elif helper._is_api and helper._application_id == UcfConfig.APPLICATIONID_WSTRUST:
				is_valid_device = True
			else:
				# アクセス申請用のログインなら端末チェックは当然しない
				if is_for_access_apply:
					is_valid_device = True
				# 制御しないなら無制限
				elif UcfUtil.getHashStr(profile_vo, 'device_check_flag') != 'ACTIVE':
					is_valid_device = True
				else:
					# 端末制御…該当ユーザの許可されている申請一覧を取得し、Cookieの値と照らし合わせて判定（端末IDも必要に応じてチェック）
					if user_vo is not None:
						
						# アクセス端末の許可された申請があるかどうかをチェックしその申請IDを返す
						valid_access_apply_unique_id, temp_check_info = ProfileUtils.getValidApprovedAccessApplyOfThisDevice(helper, user_vo)
						check_info += temp_check_info
						if valid_access_apply_unique_id != '':
							is_valid_device = True
							use_access_apply_unique_id = valid_access_apply_unique_id

					# profile_voはあるがuser_voがない場合はここに入ってくる（デフォルトプロファイル指定がある場合が該当）
					else:
						is_valid_device = True 	# Falseでもいいが誰もアクセスできなくなるパターンを減らすためここはTrue
					# 該当申請データがなければアクセスエラーとする
					if is_valid_device == False:
						error_code = 'ACCESS_CONTROL_DEVICE'

		logging.info(error_code)
		return is_valid_useragent and is_valid_device and is_valid_device_distinguish_id and is_valid_env, error_code, check_info, use_access_apply_unique_id

	isValidAccess = classmethod(isValidAccess)


	def getValidApprovedAccessApplyOfThisDevice(cls, helper, user_vo):
		use_access_apply_unique_id = ''
		check_info = ''

		# アクセスブラウザのユーザエージェントIDを決定
		useragentid = AccessApplyUtils.getAccessUserAgentIDForAccessControl(helper)
		# 該当ユーザの承認済みで有効な申請一覧を取得
		approval_apply_vos = AccessApplyUtils.getApprovalApplyVoListByUser(helper, user_vo['unique_id'])
		# 今回のアクセス端末用の設定があるかどうかを判定

		# O365版はブラウザをキックするパターンはきっとないので、セッションは使わない（Apps版と同じSSOログインアプリができたら面倒だけど）
		# 端末識別子
		if helper._is_api and helper._device_distinguish_id_for_api != '':
			device_distinguish_id = helper._device_distinguish_id_for_api
		else:
			device_distinguish_id = ucffunc.getDeviceDistinguishID(helper)

		# 端末のMACアドレス
		if helper._is_api and helper._device_mac_address_for_api != '':
			device_mac_address = helper._device_mac_address_for_api
		else:
			device_mac_address = ucffunc.getDeviceMacAddress(helper) 

		# 端末のIdentifierForVendor
		if helper._is_api and helper._device_identifier_for_vendor_for_api != '':
			device_identifier_for_vendor = helper._device_identifier_for_vendor_for_api
		else:
			device_identifier_for_vendor = ucffunc.getDeviceIdentifierForVendor(helper) 

		# アクセスキー
		if helper._is_api and helper._access_key_for_api != '':
			access_key = helper._access_key_for_api
		else:
			access_key = ucffunc.getAccessKey(helper, AccessApplyUtils.createCookieKeyForAccessKey(helper, user_vo['unique_id']))

		check_info += '[CLIENT_INFO]' + '\n'
		check_info += '[identifier_for_vendor]' + device_identifier_for_vendor + '[device_mac_address]' + device_mac_address + '[device_distinguish_id]' + device_distinguish_id + '[access_key]' + access_key + '[useragent_id]' + useragentid + '\n'
		#check_info += '[access_key_from_session_or_cookie]' + ucffunc.getAccessKey(helper, AccessApplyUtils.createCookieKeyForAccessKey(helper, user_vo['unique_id'])) + '\n'
		check_info += '[ACCESS_APPLY_INFO]' + '\n'
		for apply_vo in approval_apply_vos:
			device_distinguish_id_from_profile = UcfUtil.getHashStr(apply_vo, 'device_distinguish_id')
			device_mac_address_from_profile = UcfUtil.getHashStr(apply_vo, 'device_mac_address')
			device_identifier_for_vendor_from_profile = UcfUtil.getHashStr(apply_vo, 'device_identifier_for_vendor')
			access_key_from_profile = UcfUtil.getHashStr(apply_vo, 'access_key')
			useragent_id_from_profile = UcfUtil.getHashStr(apply_vo, 'useragent_id')
			target_career_from_profile = UcfUtil.getHashStr(apply_vo, 'target_career')
			# UserAgentIDが同じアクセス申請だけチェック（SSOログインアプリからの申請の場合は無条件でチェック） 2013.06.20
			# さらにアクセス申請のtarget_careerがAPIならiPhoneやAndroidのログインアプリからのアクセスと判断して無条件でチェック
			#if useragent_id_from_profile == UcfConfig.USERAGENTID_SSOCLIENT or useragentid == useragent_id_from_profile:
			# セキュリティブラウザ対応…従来の申請との互換性を考慮してセキュリティブラウザのアクセスでも従来のAndroidあるいはiOSの申請も対象とする。と同時に逆パターンも許容（セキュリティブラウザモードの申請を従来の別ウインドウモードのログインで見れるために） 2014/11/19
			if (target_career_from_profile == UcfConfig.VALUE_CAREER_TYPE_API or useragent_id_from_profile == UcfConfig.USERAGENTID_SSOCLIENT) or (useragentid == 'SATERAITOSECURITYBROWSER_ANDROID' and useragent_id_from_profile == 'ANDROID') or (useragentid == 'SATERAITOSECURITYBROWSER_IOS' and useragent_id_from_profile in ['IPAD','IPHONE', 'IPOD']) or (useragentid == 'ANDROID' and useragent_id_from_profile == 'SATERAITOSECURITYBROWSER_ANDROID') or (useragentid in ['IPAD','IPHONE', 'IPOD'] and useragent_id_from_profile == 'SATERAITOSECURITYBROWSER_IOS') or useragentid == useragent_id_from_profile:
				check_info += '[identifier_for_vendor]' + device_identifier_for_vendor_from_profile + '[mac_address]' + device_mac_address_from_profile + '[device_distinguish_id]' + device_distinguish_id_from_profile + '[access_key]' + access_key_from_profile + '[useragent_id]' + useragent_id_from_profile + '\n'
				# 端末識別ＩＤとアクセスキーのどちらもあってるデータがあればこの端末はアクセスＯＫとする
				# →端末識別ＩＤよりＭＡＣアドレスを優先してチェックに使用する（互換性のため申請データ側にMACアドレスがある場合のみ.逆にＭＡＣアドレスが申請側にセットされている場合は端末識別ＩＤはチェックしない） 2013.01.10 追加
				#if device_distinguish_id == device_distinguish_id_from_profile and access_key == access_key_from_profile:
				# MACアドレス複数対応 2013.01.26
				is_macaddress_ok = ProfileUtils.isInTargetMacAddress(device_mac_address, device_mac_address_from_profile)
				is_identifierforvendor_ok = ProfileUtils.isInTargetIdentifierForVendor(device_identifier_for_vendor, device_identifier_for_vendor_from_profile)

				#if ((device_mac_address_from_profile != '' and device_mac_address == device_mac_address_from_profile) or (device_mac_address_from_profile == '' and device_distinguish_id == device_distinguish_id_from_profile)) and access_key == access_key_from_profile:
				#if ((device_mac_address_from_profile != '' and is_macaddress_ok) or (device_mac_address_from_profile == '' and device_distinguish_id == device_distinguish_id_from_profile)) and access_key == access_key_from_profile:
				#if ((device_mac_address_from_profile != '' and is_macaddress_ok) or (device_mac_address_from_profile == '' and device_distinguish_id == device_distinguish_id_from_profile)) and access_key == access_key_from_profile:
				if ((device_identifier_for_vendor_from_profile != '' and is_identifierforvendor_ok) or (device_mac_address_from_profile != '' and is_macaddress_ok) or (device_identifier_for_vendor_from_profile == '' and device_mac_address_from_profile == '' and device_distinguish_id == device_distinguish_id_from_profile)) and access_key == access_key_from_profile:
					use_access_apply_unique_id = UcfUtil.getHashStr(apply_vo, 'unique_id')
					break

		return use_access_apply_unique_id, check_info

	getValidApprovedAccessApplyOfThisDevice = classmethod(getValidApprovedAccessApplyOfThisDevice)

	# プロファイルにヒモづいているMACアドレス情報を取得
	def getProfileDeviceDistinguishIDs(cls, profile_unique_id):

		q = UCFMDLDeviceDistinguishID.query()
		q = q.filter(UCFMDLDeviceDistinguishID.profile_unique_id == profile_unique_id)
		entry = UCFMDLDeviceDistinguishID.getByKey(q.get(keys_only=True))
		if entry is not None:
			device_distinguish_ids = list(entry.device_distinguish_ids_for_search)
		else:
			device_distinguish_ids = []

		return device_distinguish_ids
	getProfileDeviceDistinguishIDs = classmethod(getProfileDeviceDistinguishIDs)

	# プロファイルにヒモづいているMACアドレス情報を取得（テキストで）
	def getProfileDeviceDistinguishIDsText(cls, profile_unique_id):

		q = UCFMDLDeviceDistinguishID.query()
		q = q.filter(UCFMDLDeviceDistinguishID.profile_unique_id == profile_unique_id)
		entry = UCFMDLDeviceDistinguishID.getByKey(q.get(keys_only=True))
		if entry is not None:
			device_distinguish_ids_str = UcfUtil.nvl(entry.device_distinguish_ids_str)
		else:
			device_distinguish_ids_str = ''
		return device_distinguish_ids_str
	getProfileDeviceDistinguishIDsText = classmethod(getProfileDeviceDistinguishIDsText)


	# プロファイルとユーザー情報からアクセス端末との突き合わせ用の端末ID一覧を作成して返す
	def getProfileAndUserDeviceDistinguishIDsForSearch(cls, profile_vo, user_vo):
		whitelist_device_distinguish_ids = []
		# ユーザに事前登録されたMACアドレス一覧
		if user_vo is not None:
			user_device_mac_address_list = UcfUtil.csvToList(UcfUtil.getHashStr(user_vo, 'device_mac_address'))
			whitelist_device_distinguish_ids.extend(v.replace('\r', '').replace('\n', '').replace('\t', '').replace(' ', '').lower() for v in user_device_mac_address_list)
		# プロファイルに登録されたMACアドレス一覧（こちらはもともと加工済み）
		whitelist_device_distinguish_ids.extend(ProfileUtils.getProfileDeviceDistinguishIDs(profile_vo.get('unique_id', '')))
		return whitelist_device_distinguish_ids
	getProfileAndUserDeviceDistinguishIDsForSearch = classmethod(getProfileAndUserDeviceDistinguishIDsForSearch)


	def isInTargetMacAddress(cls, device_mac_address, target_device_mac_address):

		if device_mac_address == '':
			return False

		target_device_mac_address_list = None
		if type(target_device_mac_address) == str or type(target_device_mac_address) == unicode:
			target_device_mac_address_list = target_device_mac_address.lower().split(',')
		else:
			target_device_mac_address_list = target_device_mac_address

		device_mac_address_list = device_mac_address.lower().split(',')		# アクセス元端末のMACアドレス
		device_mac_address_list_dealed = []
		is_macaddress_ok = False
		for macaddr in device_mac_address_list:
			macaddr_for_search = macaddr
			if macaddr_for_search not in device_mac_address_list_dealed:
				#logging.info(macaddr_for_search)
				if macaddr_for_search in target_device_mac_address_list:
					is_macaddress_ok = True
					break
				device_mac_address_list_dealed.append(macaddr_for_search)
			macaddr_for_search = macaddr.replace(':', '-')
			if macaddr_for_search not in device_mac_address_list_dealed:
				#logging.info(macaddr_for_search)
				if macaddr_for_search in target_device_mac_address_list:
					is_macaddress_ok = True
					break
				device_mac_address_list_dealed.append(macaddr_for_search)
			macaddr_for_search = macaddr.replace('-', ':')
			if macaddr_for_search not in device_mac_address_list_dealed:
				#logging.info(macaddr_for_search)
				if macaddr_for_search in target_device_mac_address_list:
					is_macaddress_ok = True
					break
				device_mac_address_list_dealed.append(macaddr_for_search)
			macaddr_for_search = macaddr.replace('-', '').replace(':', '')
			if macaddr_for_search not in device_mac_address_list_dealed:
				#logging.info(macaddr_for_search)
				if macaddr_for_search in target_device_mac_address_list:
					is_macaddress_ok = True
					break
				device_mac_address_list_dealed.append(macaddr_for_search)

			if macaddr.find('-') < 0 and macaddr.find(':') < 0:
				macaddr_for_search_edit = ''
				idx = 0
				while True:
					str_add = macaddr[idx:idx+2]
					if str_add == '':
						break
					macaddr_for_search_edit += str_add + '-'
					idx += 2
				macaddr_for_search = macaddr_for_search_edit.strip('-')
				if macaddr_for_search not in device_mac_address_list_dealed:
					#logging.info(macaddr_for_search)
					if macaddr_for_search in target_device_mac_address_list:
						is_macaddress_ok = True
						break
					device_mac_address_list_dealed.append(macaddr_for_search)
				macaddr_for_search_edit = ''
				idx = 0
				while True:
					str_add = macaddr[idx:idx+2]
					if str_add == '':
						break
					macaddr_for_search_edit += str_add + ':'
					idx += 2
				macaddr_for_search = macaddr_for_search_edit.strip(':')
				if macaddr_for_search not in device_mac_address_list_dealed:
					#logging.info(macaddr_for_search)
					if macaddr_for_search in target_device_mac_address_list:
						is_macaddress_ok = True
						break
					device_mac_address_list_dealed.append(macaddr_for_search)

		#logging.info('is_macaddress_ok=' + str(is_macaddress_ok))
		return is_macaddress_ok
	isInTargetMacAddress = classmethod(isInTargetMacAddress)

	def isInTargetIdentifierForVendor(cls, device_identifier_for_vendor, target_identifier_for_vendor):

		if device_identifier_for_vendor == '':
			return False

		target_identifier_for_vendor_list = None
		if type(target_identifier_for_vendor) == str or type(target_identifier_for_vendor) == unicode:
			target_identifier_for_vendor_list = target_identifier_for_vendor.lower().split(',')
		else:
			target_identifier_for_vendor_list = target_identifier_for_vendor

		return device_identifier_for_vendor.lower() in target_identifier_for_vendor_list

	isInTargetIdentifierForVendor = classmethod(isInTargetIdentifierForVendor)


	# X-Forwarded-ForIPやその他情報からアクセス制御に使用する有効なクライアントIPアドレスを一つ決定
	def _getValidClientIPAddressForAccessControl(cls, helper, profile_vo):
		result_ip = ''

		client_ip = helper.getClientIPAddress()	# 通常のクライアントIPアドレス
		xff_ip = helper.getSessionHttpHeaderXForwardedForIPAddress()	# X-Forwarded-ForIPアドレス

		if UcfUtil.getHashStr(helper.getDeptInfo(), 'xforwardedfor_active_flag') == 'ACTIVE' and xff_ip != '':		# X-Forwarded-For を使用するかどうか
			# 通常のIPアドレスをwhiteListにてチェック（IP偽装防止のため）
			whitelist_ips = UcfUtil.csvToList(UcfUtil.getHashStr(helper.getDeptInfo(), 'xforwardedfor_whitelist'))
			is_valid_by_whitelist = False
			if whitelist_ips is None or len(whitelist_ips) == 0:
				is_valid_by_whitelist = True
			else:
				is_valid_by_whitelist = UcfUtil.isCheckIPAddressRange(client_ip, whitelist_ips)

			if is_valid_by_whitelist:
				result_ip = xff_ip

		# X-Forwarde-Forを使用しない、あるいはWhiteListの関係や、HTTPS等の関係で取得できなかった場合は、通常のIPを使用
		if result_ip == '':
			result_ip = client_ip
		
		return result_ip
	_getValidClientIPAddressForAccessControl = classmethod(_getValidClientIPAddressForAccessControl)


	# プロファイルや全体設定のIPアドレスから、今回社内ネットワークとして使用するIPアドレス群を取得
	def _getOfficeNetworkIPAddresses(cls, helper, profile_vo):
		office_ipaddresses = []
		# 全体設定を使用する場合、店舗マスタから設定を取得
		if UcfUtil.getHashStr(profile_vo, 'is_use_whole_ipaddresses') == 'ACTIVE':
			office_ipaddresses.extend(UcfUtil.csvToList(UcfUtil.getHashStr(helper.getDeptInfo(), 'office_ipaddresses')))
		# 続けてプロファイルによる設定を追加
		office_ipaddresses.extend(UcfUtil.csvToList(UcfUtil.getHashStr(profile_vo, 'office_ipaddresses')))
		return office_ipaddresses
	_getOfficeNetworkIPAddresses = classmethod(_getOfficeNetworkIPAddresses)

	# プロファイルや全体設定のIPアドレスから、メールプロキシサーバーとして利用可能なクライアントIPアドレス群を取得
	def getMailProxyAvailableNetworkIPAddresses(cls, helper, profile_vo):
		mailproxy_ipaddresses = []
		# 全体設定を使用する場合、店舗マスタから設定を取得
		if UcfUtil.getHashStr(profile_vo, 'is_use_whole_ipaddresses_for_mailproxy') == 'ACTIVE':
			mailproxy_ipaddresses.extend(UcfUtil.csvToList(UcfUtil.getHashStr(helper.getDeptInfo(), 'office_ipaddresses')))
		# 続けてプロファイルによる設定を追加
		mailproxy_ipaddresses.extend(UcfUtil.csvToList(UcfUtil.getHashStr(profile_vo, 'mailproxy_ipaddresses')))
		return mailproxy_ipaddresses
	getMailProxyAvailableNetworkIPAddresses = classmethod(getMailProxyAvailableNetworkIPAddresses)

	# パスワードの次回有効期限を算出（ローカル時間で算出）（ユーザのパスワード変更機能で使用予定）
	def calculateNextPasswordExpire(cls, helper, profile_vo):
		password_expire = ''	# プロファイルが指定されていなければ無期限扱いで空を返す

		now_datetime = UcfUtil.getNowLocalTime(helper._timezone)

		if profile_vo is not None:
			#（NOEXPIRE,1MONTH,2MONTH,3MONTH,6MONTH,1YEAR）
			password_expire_info = UcfUtil.getHashStr(profile_vo, 'password_expire_info')
			# 無期限、設定なし
			if password_expire_info == '' or password_expire_info == 'NOEXPIRE':
				password_expire = ''
			# １ヶ月後
			elif password_expire_info == '1MONTH':
				password_expire = UcfUtil.nvl(UcfUtil.add_months(now_datetime, 1))
			# ２ヶ月後
			elif password_expire_info == '2MONTH':
				password_expire = UcfUtil.nvl(UcfUtil.add_months(now_datetime, 2))
			# ３ヶ月後
			elif password_expire_info == '3MONTH':
				password_expire = UcfUtil.nvl(UcfUtil.add_months(now_datetime, 3))
			# ６ヶ月後
			elif password_expire_info == '6MONTH':
				password_expire = UcfUtil.nvl(UcfUtil.add_months(now_datetime, 6))
			# １年後
			elif password_expire_info == '1YEAR':
				password_expire = UcfUtil.nvl(UcfUtil.add_months(now_datetime, 12))

		return password_expire
	calculateNextPasswordExpire = classmethod(calculateNextPasswordExpire)


	########################################
	# ユーザーのパスワード変更
	########################################
	def changeUserPassword(cls, helper, req, user_vo, profile_vo, updater_name='', with_reminder_key_reset=False):

		is_update_password = False

		# どのパスワードを変更するかを決定
		if profile_vo is not None:

			# プロファイルが一元管理オプションを有効にしているかどうか
			if UcfUtil.getHashStr(profile_vo, 'passwordchange_sync_flag') == 'ACTIVE':
				is_update_password = True
			else:
				if user_vo is None:
					if not helper._is_api:
						helper.redirectError(UcfMessage.getMessage(helper.getMsg('MSG_NOT_EXIST_LOGIN_ACCOUNT_DATA')))
					return False, 'NOT_EXIST_LOGIN_ACCOUNT_DATA'
				is_update_password = True

		# プロファイルが存在しなければデフォルト（つまりパスワード）を更新
		else:
			is_update_password = True

		if is_update_password:

			new_password = UcfUtil.getHashStr(req, 'Password1')
			new_password_enctype = 'AES'
			enc_new_password = helper.encryptoData(new_password, enctype=new_password_enctype)		# 暗号化したパスワードを作成しておく

			# 改めてユーザデータを取得
			if user_vo is not None:
				entry = OperatorUtils.getData(helper, UcfUtil.getHashStr(user_vo, 'unique_id'))
				if entry is None:
					if not helper._is_api:
						helper.redirectError(UcfMessage.getMessage(helper.getMsg('MSG_NOT_EXIST_LOGIN_ACCOUNT_DATA')))
					return False, 'NOT_EXIST_LOGIN_ACCOUNT_DATA'
				user_vo = entry.exchangeVo(helper._timezone)										# user_vo差し替え

				# パスワード履歴に1件追加
				OperatorUtils.appendPasswordHistory(helper, user_vo, new_password)
				# パスワード変更日時を更新
				if is_update_password:
					OperatorUtils.updatePasswordChangeDate(helper, user_vo)
				# パスワード変更日時を更新（こちらはAppsパスワードなどでも更新）
				OperatorUtils.updateUserPasswordChangeDate(helper, user_vo)

				# パスワード有効期限算出＆設定
				user_vo['password_expire'] = UcfUtil.nvl(ProfileUtils.calculateNextPasswordExpire(helper, profile_vo))
				# パスワード次回更新フラグを下ろす
				user_vo['next_password_change_flag'] = ''

			# パスワード更新
			if is_update_password and user_vo is not None:
				user_vo['password'] = enc_new_password		# 暗号化パスワードをセット
				user_vo['password_enctype'] = new_password_enctype
				if with_reminder_key_reset:
					user_vo['password_reminder_key'] = ''

			if user_vo is not None:
				# Voからモデルにマージ
				entry.margeFromVo(user_vo, helper._timezone)

				# 更新日時、更新者の更新
				entry.updater_name = updater_name
				entry.date_changed = UcfUtil.getNow()
				# 更新処理
				entry.put()

		return True, ''

	changeUserPassword = classmethod(changeUserPassword)


############################################################
## バリデーションチェッククラス 
############################################################
class ProfileValidator(BaseValidator):

	def validate(self, helper, vo):

		# 初期化
		self.init()
		# チェック TODO 未対応項目に対応

		check_name = ''
		check_key = ''
		check_value = ''

		########################
		# プロファイルID
		check_name = helper.getMsg('FLD_PROFILEID')
		check_key = 'profile_id'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 半角英数字チェック
		if not self.alphabetNumberValidator(check_value, except_str=['-','_','.']):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_ALPHABETNUMBER'), (check_name)))
		# 最大長チェック：40文字（長すぎても微妙なので）
		if not self.maxLengthValidator(check_value, 40):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 40)))

		########################
		# プロファイル名称
		check_name = helper.getMsg('FLD_PROFILENAME')
		check_key = 'profile_name'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 最大長チェック：６０文字（なんとなく）
		if not self.maxLengthValidator(check_value, 60):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 60)))

		########################
		# 説明
		check_name = helper.getMsg('FLD_COMMENT')
		check_key = 'comment'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 最大長チェック：500文字（なんとなく）
		if not self.maxLengthValidator(check_value, 500):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 500)))

		########################
		# クライアント証明書情報
		# ログインタイプ=CERT、「クライアント証明書を要求する」チェックあり、の場合は機関キー識別子は必須
		target_envs = ['office', 'outside', 'sp', 'fp']
		for target_env in target_envs:
			if UcfUtil.getHashStr(vo, target_env + '_client_certificate_flag') == 'ACTIVE' or UcfUtil.getHashStr(vo, target_env + '_login_type') == 'CERT':
				check_name = helper.getMsg('FLD_ACSCTRL_CLIENT_CERTIFICATE_SUBJECTKEY')
				check_key = target_env + '_client_certificate_info_subject_key'
				check_value = UcfUtil.getHashStr(vo, check_key)
				# 必須チェック
				if not self.needValidator(check_value):
					self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		

		if self.total_count == 0:

			# 重複チェック （プロファイルID）
			unique_id = UcfUtil.getHashStr(vo, 'unique_id')

			###############################################
			# プロファイルＩＤ

			gql = ''
			# WHERE句
			wheres = []
			wheres.append("profile_id_lower='" + UcfUtil.escapeGql(UcfUtil.nvl(vo['profile_id']).lower()) + "'")
			gql += UcfUtil.getToGqlWhereQuery(wheres)
			models = UCFMDLProfile.gql(gql)

			for model in models:
				# 新規以外の場合は対象のユニークＩＤ以外の場合のみエラーとする(GQLがノットイコールに対応していないため)
				if self.edit_type == UcfConfig.EDIT_TYPE_NEW or model.unique_id != unique_id:
					self.appendValidate('profile_id', UcfMessage.getMessage(helper.getMsg('MSG_VC_ALREADY_EXIST'), ()))
					break

############################################################
## バリデーションチェッククラス （削除用）
############################################################
class ProfileValidatorForDelete(BaseValidator):

	def validate(self, helper, vo):

		# 初期化
		self.init()

		unique_id = UcfUtil.getHashStr(vo, 'unique_id')

		########################
		# このプロファイルが使用されているかどうかを判定

		# プロファイルID
		profile_id = UcfUtil.getHashStr(vo, 'profile_id_lower')

		# デフォルトプロファイルとして使用されていないかどうか
		if self.total_count == 0:
			dept = helper.getDeptInfo(no_memcache=True, is_force_select=True)
			if dept is not None and dept.has_key('profile_infos_lower'):
				profile_infos = UcfUtil.csvToList(dept.get('profile_infos_lower'))
				if profile_id in profile_infos:
					self.appendValidate('profile_id', UcfMessage.getMessage(helper.getMsg('MSG_FAILED_DELETE_PROFILE_BY_USED'), ()))

		# ユーザープロファイルとして使用されていないかどうか
		if self.total_count == 0:
			#q = UCFMDLOperator.all(keys_only=True)
			#q.filter('profile_infos_lower =', profile_id)
			#key = q.get()
			q = UCFMDLOperator.query()
			q = q.filter(UCFMDLOperator.profile_infos_lower.IN(profile_id))
			key = q.get(keys_only=True)
			if key is not None:
				self.appendValidate('profile_id', UcfMessage.getMessage(helper.getMsg('MSG_FAILED_DELETE_PROFILE_BY_USED'), ()))

		# グループプロファイルとして使用されていないかどうか
		if self.total_count == 0:
			#q = UCFMDLOperatorGroup.all(keys_only=True)
			#q.filter('profile_infos_lower =', profile_id)
			#key = q.get()
			q = UCFMDLOperatorGroup.query()
			q = q.filter(UCFMDLOperatorGroup.profile_infos_lower.IN(profile_id))
			key = q.get(keys_only=True)
			if key is not None:
				self.appendValidate('profile_id', UcfMessage.getMessage(helper.getMsg('MSG_FAILED_DELETE_PROFILE_BY_USED'), ()))



############################################################
## ビューヘルパー
############################################################
class ProfileViewHelper(ViewHelper):

	def applicate(self, vo, helper):
		voVH = {}

		# ここで表示用変換を必要に応じて行うが、原則Djangoテンプレートのフィルタ機能を使う
		for k,v in vo.iteritems():
			voVH[k] = v	

		return voVH


############################################################
## パスワード変更用バリデーションチェッククラス 
############################################################
class PasswordChangeValidator(BaseValidator):

	_vc_error_code = ''
	_vc_error_sub_info = ''

	def validate(self, helper, vo, user_vo, profile_vo):

		# 初期化
		self.init()

		check_name = ''
		check_key = ''
		check_value = ''
			

		########################
		check_name = helper.getMsg('VMSG_INPUT_PASSWORD_CHANGE')
		check_key = 'Password1'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
			self._vc_error_code = 'VC_NEED'
			self._vc_error_sub_info = ''
		# 半角チェック
		if not self.hankakuValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_HANKAKU'), (check_name)))
			self._vc_error_code = 'VC_HANKAKU'
			self._vc_error_sub_info = ''
		# 半角スペースもはじく 2017.01.23
		if check_value.find(' ') >= 0:
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_SPACE'), (check_name)))
			self._vc_error_code = 'VC_INVALID_SPACE'
			self._vc_error_sub_info = ''
		# バックスラッシュとして「a5」が使われている場合ははじく（Appsパスワードとして使えないので）
		if check_value.find(u'\xa5') >= 0:
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_BACKSLASH_A5'), (check_name)))
			self._vc_error_code = 'VC_BACKSLASH_A5'
			self._vc_error_sub_info = ''
		# 最大長チェック：100文字（Appsに合わせて）
		if not self.maxLengthValidator(check_value, 100):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 100)))
			self._vc_error_code = 'VC_STRENGTH_MAXLENGTH'
			self._vc_error_sub_info = '100'
		# 最小長チェック：8文字（Appsに合わせて）
		is_already_check_min_length = False
#		if not self.minLengthValidator(check_value, 8):
#			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MINLENGTH'), (check_name, 8)))
#			is_already_check_min_length = True

		########################
		# パスワード（確認用）
		check_name = helper.getMsg('VMSG_CONFIRM_PASSWORD_CHANGE')
		check_key = 'PasswordConfirm'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
			self._vc_error_code = 'VC_NEED'
			self._vc_error_sub_info = ''
		# 「パスワード」との一致チェック
		if UcfUtil.getHashStr(vo, 'Password1') != check_value:
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NOT_MATCH_CONFIRM_PASSWORD'), ()))
			self._vc_error_code = 'VC_NOT_MATCH_CONFIRM_PASSWORD'
			self._vc_error_sub_info = ''

		# 全角が混ざっているとencryptoDataでエラーするので
		if self.total_count <= 0:

			dec_new_password = UcfUtil.getHashStr(vo, 'Password1')
			if profile_vo is not None and dec_new_password != '':

				check_name = helper.getMsg('VMSG_INPUT_PASSWORD_CHANGE')
				check_key = 'Password1'

				# パスワード強度オプションに伴うチェック
				password_strength_options = UcfUtil.csvToList(UcfUtil.getHashStr(profile_vo, 'password_strength_options'))

				# 最低長チェック
				password_strength_minlength = 0
				if UcfUtil.getHashStr(profile_vo, 'password_strength_minlength') != '':
					password_strength_minlength = int(UcfUtil.getHashStr(profile_vo, 'password_strength_minlength'))
				if password_strength_minlength > 0 and len(dec_new_password) < password_strength_minlength:
					self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MINLENGTH'), (check_name, str(password_strength_minlength))))
					is_already_check_min_length = True
					self._vc_error_code = 'VC_STRENGTH_MINLENGTH'
					self._vc_error_sub_info = str(password_strength_minlength)

				# 半角数字
				if 'WITH_NUMBER' in password_strength_options:
					if not self.numberIncludeValidator(dec_new_password):
						self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INCLUDE_NUMERIC'), (check_name)))
						self._vc_error_code = 'VC_STRENGTH_WITH_NUMBER'
						self._vc_error_sub_info = ''
				# 英字(大文字)
				if 'WITH_UPPER' in password_strength_options:
					if not self.alphabetUpperIncludeValidator(dec_new_password):
						self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INCLUDE_ALPHABET_UPPER'), (check_name)))
						self._vc_error_code = 'VC_STRENGTH_WITH_UPPER'
						self._vc_error_sub_info = ''
				# 英字(小文字)
				if 'WITH_LOWER' in password_strength_options:
					if not self.alphabetLowerIncludeValidator(dec_new_password):
						self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INCLUDE_ALPHABET_LOWER'), (check_name)))
						self._vc_error_code = 'VC_STRENGTH_WITH_LOWER'
						self._vc_error_sub_info = ''
				# 記号
				if 'WITH_MARK' in password_strength_options:
					if not self.markIncludeValidator(dec_new_password):
						self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INCLUDE_MARK'), (check_name)))
						self._vc_error_code = 'VC_STRENGTH_WITH_MARK'
						self._vc_error_sub_info = ''
				# ユーザーIDを含むパスワードを禁止する
				if 'PROHIBIT_INCLUDE_USERID' in password_strength_options:
					if user_vo is not None:
						operator_id_lower = UcfUtil.getHashStr(user_vo, 'operator_id_lower')
						#operator_id_local_lower = UcfUtil.getHashStr(user_vo, 'operator_id_lower').split('@')[0]
						#employee_id_lower = UcfUtil.getHashStr(user_vo, 'employee_id_lower')
						mail_address_lower = UcfUtil.getHashStr(user_vo, 'mail_address').lower()
						mail_address_local_lower = UcfUtil.getHashStr(user_vo, 'mail_address').lower().split('@')[0]

						# 「メールアドレスの@前」、「メールアドレス全体」、「社員ID」をチェック
						#for user_id_for_check in [operator_id_lower, employee_id_lower, mail_address_lower, mail_address_local_lower]:
						for user_id_for_check in [operator_id_lower, mail_address_lower, mail_address_local_lower]:
							if (user_id_for_check != '' and dec_new_password.lower().find(user_id_for_check) >= 0):
								#self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_PROHIBIT_INCLUDE_USERID'), (check_name, user_id_for_check)))
								self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_PROHIBIT_INCLUDE_USERID'), (user_id_for_check)))
								self._vc_error_code = 'VC_STRENGTH_PROHIBIT_INCLUDE_USERID'
								self._vc_error_sub_info = ''
								break



				# パスワードの何世代前までさかのぼってそのパスワードにはさせない設定対応
				password_history_policy = UcfUtil.getHashStr(profile_vo, 'password_history_policy')
				if user_vo is not None and password_history_policy != '':
					int_check_index = int(password_history_policy)
					password_history = UcfUtil.csvToList(UcfUtil.getHashStr(user_vo, 'password_history'))
					enc_new_password_des = helper.encryptoData(dec_new_password, enctype='DES')
					enc_new_password_aes = helper.encryptoData(dec_new_password, enctype='AES')
					for idx in range(len(password_history)):
						i = len(password_history) - idx - 1
						if idx < int_check_index:	# チェックする世代なら
							if password_history[i] in [enc_new_password_des, enc_new_password_aes]:
								self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NOT_MATCH_PASSWORD_HISTORY'), ()))
								self._vc_error_code = 'VC_INVALID_WITH_HISTORY'
								self._vc_error_sub_info = ''
								break
						else:		# チェック世代を超えたらそのあとはスキップ
							break

			# 強度設定で最少値チェックをして、既にエラーをはいている場合はここではチェックしない
			if not is_already_check_min_length and not self.minLengthValidator(check_value, 8):
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MINLENGTH'), (check_name, 8)))
				is_already_check_min_length = True
				self._vc_error_code = 'VC_STRENGTH_MINLENGTH'
				self._vc_error_sub_info = '8'


