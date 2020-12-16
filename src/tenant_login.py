#!/usr/bin/python
# coding: utf-8

import logging
import webapp2
#from google.appengine.api import users
from ucf.utils.helpers import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
import sateraito_mini_pr
from ucf.utils import loginfunc
import oem_func

class Page(TenantAppHelper):

	def processOfRequest(self, tenant):
		try:
			self._approot_path = os.path.dirname(__file__)

			#logging.info('HTTP_COOKIE=' + str(os.environ.get('HTTP_COOKIE', None)))

			if self.isValidTenant() == False:
				return

			is_disp_language_combobox = self.getDeptInfo() is not None and self.getDeptValue('is_disp_login_language_combobox') == 'ACTIVE'
			# 言語を決定（Cookieの値を考慮）
			language_list = []
			if is_disp_language_combobox:
				hl_from_cookie = self.getCookie('hl')
				logging.info('hl_from_cookie=' + str(hl_from_cookie))
				if hl_from_cookie is not None and hl_from_cookie in sateraito_func.ACTIVE_LANGUAGES:
					self._language = hl_from_cookie
				# 言語一覧
				for language in sateraito_func.ACTIVE_LANGUAGES:
					language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])

			strRURL = self.getRequest(UcfConfig.REQUESTKEY_RURL)
			if strRURL is None or strRURL == '':
				strRURL = UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_RURL))
			
			validation_check = UcfUtil.nvl(self.getRequest(UcfConfig.QSTRING_STATUS))
			edit_type = UcfUtil.nvl(self.getRequest(UcfConfig.QSTRING_TYPE))

	#		# 権限チェック
	#		if not self.checkAccessAuthority(_MENU_ID): return

			header_msg = []
			login_result = {}
			profile_vo = None
			valid_vo = None
			ucfp = UcfTenantParameter(self)

			## ドメインが単一ドメインの場合のドメイン
			#federated_domains = sateraito_func.getFederatedDomainList(tenant, is_with_cache=True)
			#if len(federated_domains) == 1:
			#	single_federated_domain = federated_domains[0]
			#else:
			#	single_federated_domain = ''
			single_federated_domain = ''
			# Requestからvoにセット
			vo = UcfVoInfo.setRequestToVo(self)

			# ブラウザによるautocompleteの自動セットを防止するため、空の場合にダミーの空白をセットしておく（小細工... こことFocus時にクリア） 2015.12.01
			if vo.has_key('login_id'):
				vo['login_id'] = vo['login_id'].strip()
			if vo.has_key('login_password'):
				vo['login_password'] = vo['login_password'].strip()
			if vo.has_key('two_factor_auth_code'):
				vo['two_factor_auth_code'] = vo['two_factor_auth_code'].strip()

			# RURLを上書き
			vo[UcfConfig.REQUESTKEY_RURL] = strRURL
			if self.request.get('rurl_key') != '':
				rurl_key = self.request.get('rurl_key')
			else:
				rurl_key = UcfUtil.guid()
			#self.setSession(UcfConfig.SESSIONKEY_ORIGINAL_PROCESS_LINK_PREFIX + rurl_key, strRURL)
			self.setOriginalProcessLinkToSession(rurl_key, strRURL)
			ucfp.data['rurl_key'] = rurl_key

			is_current_access_validation_check = False
			# バリデーションチェックの場合
			if validation_check == UcfConfig.VC_CHECK:
				is_current_access_validation_check = True
				# HTTPメソッドチェック
				if self._request_type == UcfConfig.REQUEST_TYPE_GET:
					self.redirectError(self.getMsg('MSG_INVALID_ACCESS'))
					return
				
				# 画面表示制御のためデフォルトプロファイルを取得しておく
				profile_vo = loginfunc.getDeptProfile(self)

				# 入力チェック
				vc = LoginValidator(edit_type)
				vc.validate(self, vo, profile_vo)
				ucfp.voinfo.validator = vc

				# 入力エラーがなければログイン処理
				if ucfp.voinfo.validator.total_count <= 0:
					# ログイン認証
					isLogin, login_result = loginfunc.authLogin(self, UcfUtil.getHashStr(vo, 'login_domain') if UcfUtil.getHashStr(vo, 'login_domain') != '' else single_federated_domain, UcfUtil.getHashStr(vo, 'login_id'), UcfUtil.getHashStr(vo, 'login_password'), captcha_token=UcfUtil.getHashStr(vo, 'captcha_token'), captcha_response=UcfUtil.getHashStr(vo, 'captcha'), is_set_next_auto_login=UcfUtil.getHashStr(vo, 'auto_login_flag') != '', is_auto_login=False, temporary_login_action_key=UcfUtil.getHashStr(vo, UcfConfig.REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY), is_nocheck_two_factor_auth=False, two_factor_auth_code=UcfUtil.getHashStr(vo, 'two_factor_auth_code'), matrixauth_random_key=UcfUtil.getHashStr(vo, UcfConfig.REQUESTKEY_MATRIXAUTH_RANDOMKEY))
					if login_result.has_key('profile_vo'):
						profile_vo = login_result['profile_vo']
					else:
						profile_vo = None
					if isLogin:
						# 動的ログイン対応（トップページの場合、最後にスラッシュをつけないと認証IDCookieがRequestされてこず、ログインできないのでここで必ずつける）
						url = strRURL
						if url == '':
							url = '/a/' + self._tenant + '/'
						else:
							# URLとクエリーに分ける
							urltemp = url.split('?')
							urlpart = urltemp[0]
							urlquery = '?' + urltemp[1] if len(urltemp) > 1 else ''
							#logging.info('urlpart='+urlpart)
							#logging.info('urlquery='+urlquery)
							#logging.info(sateraito_inc.my_site_url + '/a/' + self._tenant)
							if urlpart == (oem_func.getMySiteUrl(self._oem_company_code) + '/a/' + self._tenant):
								url = urlpart + '/' + urlquery
								#logging.info('url='+url)
							elif urlpart.endswith('/a/' + self._tenant + UcfConfig.URL_ERROR):
								url = '/a/' + self._tenant + '/'
							elif urlpart.endswith('/a/' + self._tenant + UcfConfig.URL_LOGIN):
								url = '/a/' + self._tenant + '/'

							# クエリーが長い場合はPOSTに変更 
							if len(url) >= 2000:

								post_items = []
								spurl = url.split('?')
								query_string = spurl[1] if len(spurl) >= 2 else ''
								querys = query_string.split('&')
								for query in querys:
									one_query = query.split('=')
									post_items.append({'name':one_query[0], 'value':UcfUtil.urlDecode(one_query[1]) if len(one_query) > 1 else ''})
								ucfp = UcfTenantParameter(self)
								ucfp.data['ActionUrl'] = spurl[0]
								template_vals = {
									'ucfp' : ucfp
									,'post_items':post_items
									,'WaitMilliSeconds':0
								}
								self.appendBasicInfoToTemplateVals(template_vals)
								self.render('sso_general_post.html', self._design_type, template_vals)
								return

						#logging.info(url)
						# なんか大丈夫そうなので除外
						## リダイレクト時にSet-Cookieがされないことがあるようなので変更（特にスマホ） 
						#if self._design_type != UcfConfig.VALUE_DESIGN_TYPE_PC:
						#	template_vals = {
						#		'url':url
						#		}
						#	self.appendBasicInfoToTemplateVals(template_vals)
						#	self.render('login_redirect.html', self._design_type, template_vals)
						#else:
						#	self.redirect(str(url))
						self.redirect(str(url))
						return
					else:
						login_type = profile_vo.get('login_type', '') if profile_vo is not None else ''
						is_lock_indefinitely = profile_vo.get('login_lock_expire_info', '') == 'PERMANENCE' if profile_vo is not None else False		# 無期限の時はメッセージを分ける対応 2016.12.16
						header_msg.append(loginfunc.getMessageByErrorCode(self, UcfUtil.getHashStr(login_result, 'error_code'), login_type=login_type, is_lock_indefinitely=is_lock_indefinitely))

				# エラーがあればそれを表示
				else:
					# 上に移動
					## 画面表示制御のためデフォルトプロファイルを取得しておく
					#profile_vo = loginfunc.getDeptProfile(self)
					vo['login_tenant'] = tenant
					pass

			# バリデーションチェックではない場合
			else:
				validation_check = UcfConfig.VC_CHECK
				# 画面表示制御のためデフォルトプロファイルを取得しておく
				profile_vo = loginfunc.getDeptProfile(self)
				vo['login_tenant'] = tenant

				# WS-Federationで取得した「username」をログイン画面に初期セットしてみる
				if UcfUtil.getHashStr(vo, 'login_id') == '':
					vo['login_id'] = self.getUserNameFromQueryOfURL(strRURL)

			ucfp.voinfo.setVo(vo, LoginViewHelper(), None, self)

#			# ログイン画面にドメイン選択ボックスを表示するかどうか
#			is_disp_domain_combobox = self.getDeptValue('is_disp_login_domain_combobox') == 'ACTIVE' and len(federated_domains) > 1 and not (profile_vo and profile_vo.get('login_type') == 'OPE1')
#			# ドメイン選択ボックスに実際に表示するドメイン一覧を作成
#			domaincombobox_list = []
#			not_checked_domains = []
#			for domain_name in federated_domains:
#				not_checked_domains.append(domain_name.lower())
#			domaincombobox_config_text = self.getDeptValue('domaincombobox_config')
#			if domaincombobox_config_text is not None and domaincombobox_config_text != '':
#				domaincombobox_config = JSONDecoder().decode(domaincombobox_config_text)
#				for domaininfo in domaincombobox_config:
#					domain_name_lower = domaininfo.get('domain_name', '').lower()
#					#if not domaininfo.get('is_hidden', False):
#					if domain_name_lower in federated_domains and not domaininfo.get('is_hidden', False):
#						domaincombobox_list.append(domaininfo.get('domain_name', ''))
#					if domain_name_lower in not_checked_domains:
#						not_checked_domains.remove(domain_name_lower)
#			for domain_name in not_checked_domains:
#				domaincombobox_list.append(domain_name)
#
#			# ログイン画面にドメインコンボボックスを表示する場合で、入力ログインIDにドメインが含まれていたら分解
#			if is_disp_domain_combobox and UcfUtil.getHashStr(vo, 'login_id') != '':
#				sp = UcfUtil.getHashStr(vo, 'login_id').split('@')
#				if len(sp) > 1 and sp[len(sp)-1].lower() in domaincombobox_list:
#					vo['login_id'] = '@'.join(sp[0:len(sp)-1])
#					vo['login_domain'] = sp[len(sp)-1].lower()
#
#			# ログイン画面にワンタイムランダムパスワードボックスを表示するかどうか
#			is_disp_matrixauth = profile_vo is not None and profile_vo.get('login_type') == 'DCARD'
			is_disp_matrixauth = False
			# ブラウザによるautocompleteの自動セットを防止するため、空の場合にダミーの空白をセットしておく（小細工... ↑とFocus時にクリア） 2015.12.01
			# 「IDのみ」設定の際におかしくなってしまうのでパスワードにセット
			if vo.get('login_password', '') == '' and (not is_disp_matrixauth and self.getDeptValue('login_autocomplete_type') != 'BOTH'):
				vo['login_password'] = '\t'

			# 未使用の場合、破棄
			self.setSession('RURL',None)

			# 自動ログインチェックボックスを表示するかどうか
			if UcfUtil.getHashStr(vo, UcfConfig.REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY) != '':
				ucfp.data['is_available_auto_login'] = False
			else:
				if profile_vo is not None:
					ucfp.data['is_available_auto_login'] = profile_vo['autologin_available_flag'] == 'AVAILABLE'
				else:
					ucfp.data['is_available_auto_login'] = True


			# アクセス申請のリンクを表示するかどうか（まずはシンプルにアクセス制御が有効なら全表示）
			#ucfp.data['is_available_access_apply'] = (profile_vo is None or profile_vo['acsctrl_active_flag'] == 'ACTIVE') and UcfUtil.getHashStr(vo, UcfConfig.REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY) != UcfConfig.TEMPLOGIN_ACTIONKEY_ACS_APPLY
			ucfp.data['is_available_access_apply'] = False
			# 二要素コードの認証コードボックスを表示するかどうか
			#ucfp.data['is_disp_two_factor_auth_code'] = is_current_access_validation_check and loginfunc.isActiveTwoFactorAuth(self, profile_vo)
			ucfp.data['is_disp_two_factor_auth_code'] = login_result.get('is_disp_two_factor_auth_code', False)
			# ドメインが単一ドメインの場合のドメイン
			ucfp.data['single_federated_domain'] = single_federated_domain
#			# ログイン画面にドメイン選択ボックスを表示するかどうか
#			ucfp.data['is_disp_domain_combobox'] = is_disp_domain_combobox
#			# ログイン画面にワンタイムランダムパスワードボックスを表示するかどうか
#			ucfp.data['is_disp_matrixauth'] = is_disp_matrixauth
			# ログイン画面に言語選択ボックスを表示するかどうか
			ucfp.data['is_disp_language_combobox'] = is_disp_language_combobox
#			# 現在のワンタイム・ランダムパスワード型パスワードマトリックス作成キーを作成
#			# これは今回表示に使うものなので、POSTされてきた場合はPOST値を使用すること。
#			# 表示とその表示に基づいて入力されてきたPOSTを一致させるということ
#			current_matrixauth_key = loginfunc.createMatrixAuthKey(self)
#			ucfp.data['current_matrixauth_key'] = current_matrixauth_key
#			# マトリックス配列
#			ucfp.data['current_matrixauth_matrix'] = loginfunc.makeMatrixAuthMatrix(self, current_matrixauth_key)
			# パスワードリマインダのリンクを表示するかどうか
			ucfp.data['is_disp_password_reminder'] = not is_disp_matrixauth and (profile_vo is None or profile_vo['passwordchange_unavailable_flag'] != 'UNAVAILABLE') and loginfunc.isDispPasswordReminderLink(self, login_result.get('error_code', ''))
			# check if showing upgrade link is needed
			show_upgrade_link = sateraito_func.needToShowUpgradeLink(tenant)

			mini_pr = ''
			if sateraito_func.isFreeMode(self._tenant):
				mini_pr = sateraito_mini_pr.getMiniPr()

			template_vals = {
				'ucfp': ucfp,
				'data': ucfp.data,
				'voinfo': ucfp.voinfo,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'header_msg':header_msg,
				#'captcha_required':header_msg,
				'profile_vo':profile_vo,
				'login_result':login_result,
				'mini_pr':mini_pr,
				'show_upgrade_link':show_upgrade_link,
				#'federated_domains':federated_domains,
#				'domaincombobox_list':domaincombobox_list,
				'is_first_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# アクセス申請用ログイン画面でタブレットの場合はそもそも出さない
				'language_list':JSONEncoder().encode(language_list),
				'request_method': self._request_type,
				'footer_message': self.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ())
				}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('login.html', self._design_type, template_vals)
			return

		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

	# URLのQueryからusernameを取得
	def getUserNameFromQueryOfURL(self, url):
		username = ''
		sp_rurl = url.split('?')
		if len(sp_rurl) > 1 and sp_rurl[1] != '':
			query_string = sp_rurl[1]
			querys = query_string.split('&')
			for query in querys:
				one_query = query.split('=')
				if one_query[0] == 'username':
					username = UcfUtil.urlDecode(one_query[1]) if len(one_query) > 1 else ''
					break
		return username

############################################################
## バリデーションチェッククラス （ログイン用）
############################################################
class LoginValidator(BaseValidator):

	def validate(self, helper, vo, profile_vo):

		login_type = profile_vo.get('login_type', '') if profile_vo is not None else ''

		# 初期化
		self.init()
		if not self.needValidator(UcfUtil.getHashStr(vo, 'login_id')):
			self.appendValidate('login_id', UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (helper.getMsg('VMSG_LOGIN_USERID'))))
		if not self.needValidator(UcfUtil.getHashStr(vo, 'login_password')):
			self.appendValidate('login_password', UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (helper.getMsg('VMSG_LOGIN_PASSWORD'))))


############################################################
## ビューヘルパー
############################################################
class LoginViewHelper(ViewHelper):

	def applicate(self, vo, helper):
		voVH = {}

		# ここで表示用変換を必要に応じて行うが、原則Djangoテンプレートのフィルタ機能を使う
		for k,v in vo.iteritems():
			if k == 'login_password':
				voVH[k] = '************'
			else:
				voVH[k] = v	

		return voVH


app = webapp2.WSGIApplication([('/a/([^/]*)/login', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)