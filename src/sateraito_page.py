#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@nextset.co.jp>'


import os,sys,traceback
import jinja2
import webapp2
import base64
import json
import datetime, time
import logging
import random
#import socket
from google.appengine.api import memcache
from google.appengine.api import namespace_manager
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import taskqueue
#from google.appengine.api import search

import sateraito_db
import sateraito_inc
import sateraito_func
from sateraito_func import toShortLocalTime
from sateraito_func import toLocalTime
from sateraito_func import toShortLocalDate
from sateraito_func import toUtcTime
from sateraito_func import none2ZeroStr
from sateraito_func import escapeForCsv

from ucf.utils.ucfutil import UcfUtil

import urllib,urllib2,StringIO,gzip
from google.appengine.api import urlfetch
urlfetch.set_default_fetch_deadline(sateraito_inc.URLFETCH_TIMEOUT_SECOND)

MAX_AUTH_TOKEN_AGE_DAYS_FOR_NO_AUTO_LOGOUT_MODE = 14

#
# session module
# http://webapp-improved.appspot.com/api/webapp2_extras/sessions.html
#
# causion: version of webapp2 must be changed(2.5.2) not default version
#

MAX_OPENID_SESSION_AGE_DAYS = 14    # 14 days
OPENID_COOKIE_NAME = 'ucf_sid'
from webapp2_extras import sessions
config = {}
# config['webapp2_extras.sessions'] = {
# 	'secret_key': 'acd1da8160e04f75b4bfce35e005e068',
# 	'cookie_name': OPENID_COOKIE_NAME,
# 	#'session_max_age': None,
# 	'session_max_age': (60 * 60 * 24 * MAX_OPENID_SESSION_AGE_DAYS),
# 	'cookie_args': {
# 		#'max_age': None,
# 		'max_age': (60 * 60 * 24 * MAX_OPENID_SESSION_AGE_DAYS),
# 		'domain': None,
# 		'path': '/',
# 		'secure': True if not sateraito_inc.developer_mode else False,
# 		'httponly': True,
# 	}
# }

config['webapp2_extras.sessions']= {
	'secret_key': 'acd1da8160e04f75b4bfce35e005e068',
	'cookie_name': 'ucf_sid',
	'session_max_age': sateraito_inc.session_timeout,
	'cookie_arg': {
		'max_age': None,
		'domain': None,
		'path': '/',
		'secure': None,
		'httponly': None,
	},
	'default_backend': 'memcache'
}


#GETでリクエストして結果を取得
def HttpGetAccess(url):
	#socket.setdefaulttimeout(sateraito_inc.URLFETCH_TIMEOUT_SECOND)
	#from urllib import urlopen
	#return urlopen(url, timeout=sateraito_inc.URLFETCH_TIMEOUT_SECOND).read()
	response = urllib2.urlopen(url, timeout=sateraito_inc.URLFETCH_TIMEOUT_SECOND)
	return response.read()


#POSTでリクエストして結果を取得
def HttpPostAccess(url,values,headers):
	#値をURエンコード
	data = urllib.urlencode(values)
	req = urllib2.Request(url, data, headers)
	#response = urllib2.urlopen(req)
	response = urllib2.urlopen(req, timeout=sateraito_inc.URLFETCH_TIMEOUT_SECOND)
	return response.read()


#POSTでリクエストして結果を取得(クエリが ○○＝×× じゃなくて  △△△△△△ 状態の場合に使う)
def HttpPostAccessRow(url,values,headers):
	result = urlfetch.fetch(url=url, method=urlfetch.POST, payload=values, headers=headers, deadline=sateraito_inc.URLFETCH_TIMEOUT_SECOND)
	return result


class _BasePage(webapp2.RequestHandler):

	viewer_email_raw = None	# 大文字小文字をそのままにしたもの
	viewer_email = None			# 小文字統一のもの
	viewer_user_id = None
	opensocial_viewer_id = None		# 高速化オプション対応 2016.08.25
	user_object_id = None			# AzureADOIDCのID↑のどれかで流用してもよさそうだが...
	_mode = ''			# for Teams App

	# ワークフロー管理者かどうかを判定
	def isWorkflowAdmin(self, user_email, tenant):
		return sateraito_func.isWorkflowAdmin(user_email, tenant)

	def isOkToAccessDocId(self, user_email, doc_id, tenant):
		return sateraito_func.isOkToAccessDocId(user_email, doc_id, tenant)

	def isOkToAccessDocObj(self, user_email, workflow_doc, tenant, without_admin_ok=False):
		return sateraito_func.isOkToAccessDocObj(user_email, workflow_doc, tenant, without_admin_ok=without_admin_ok)

	def dispatch(self):
		# Get a session store for this request.
		self.session_store = sessions.get_store(request=self.request)
		try:
			# Dispatch the request.
			webapp2.RequestHandler.dispatch(self)
		finally:
			# Save all sessions.
			old_namespace = namespace_manager.get_namespace()
			namespace_manager.set_namespace('')
			self.session_store.save_sessions(self.response)
			namespace_manager.set_namespace(old_namespace)

	@webapp2.cached_property
	def session(self):
		# Returns a session using the default cookie key.
		old_namespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace('')
		session = self.session_store.get_session(backend='datastore')
		namespace_manager.set_namespace(old_namespace)
		return session

	def removeCookie(self, cookie_name):
		# set past date to cookie --> cookie will be deleted
		self.response.headers.add_header(
			'Set-Cookie',
			cookie_name + '=deleted; expires=Fri, 31-Dec-2000 23:59:59 GMT; path=/;')

	def setNamespace(self, tenant, app_id):
		"""	Args: tenant
					app_id
		Return: True is app_id is correct, false is not
		"""
		return sateraito_func.setNamespace(tenant, app_id)

	def setCookie(self, name, value, expires=None, path='/', secure='secure', domain='', living_sec=60):
		# set cookie
		if expires is None and living_sec > 0:
			expires = UcfUtil.add_seconds(UcfUtil.getNow(), living_sec).strftime('%a, %d-%b-%Y %H:%M:%S GMT')
		if expires is None:
			expires = UcfUtil.add_days(UcfUtil.getNow(), 1).strftime('%a, %d-%b-%Y %H:%M:%S GMT')
		self.response.headers.add_header('Set-Cookie', str(name) + '=' + value + ';' + 'expires=' + str(expires) + ';' + 'Path=' + str(path) + ';' + (('domain=' + str(domain) + ';') if domain != '' else '') + secure)

	def getUserEntryByToken(self, tenant, user_token):

		if user_token is None or user_token == '':
			return None

		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')

		# token check
		q = sateraito_db.UserEntry.all()
		q.filter('user_token =', user_token)
		user_entry = q.get()
		if user_entry is not None and user_entry.token_expire_date < datetime.datetime.now():
			user_entry = None
		namespace_manager.set_namespace(old_namespace)
		return user_entry

	def checkToken(self, tenant):

		## CSRFトークンチェック
		#if sateraito_func.checkCsrf(self.request) == False:
		#	logging.exception('Invalid token')
		#	self.response.set_status(403)
		#	return False

		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')
		# get parameter
		user_token = self.request.get('token')
		logging.info('token=' + user_token)
		# token check
		q = sateraito_db.UserEntry.all()
		q.filter('user_token =', user_token)
		user_entry = q.get()
		if user_entry is None:
			# user token not matched
			logging.warning('set_status=403')
			self.response.set_status(403)
			namespace_manager.set_namespace(old_namespace)
			return False
		if user_entry.token_expire_date < datetime.datetime.now():
			# token found, but expired
			logging.warning('set_status=403')
			self.response.set_status(403)
			namespace_manager.set_namespace(old_namespace)
			return False
		self.viewer_email = user_entry.user_email.lower() if user_entry.user_email is not None else None
		self.viewer_email_raw = user_entry.user_email
		self.viewer_user_id = user_entry.user_id
		namespace_manager.set_namespace(old_namespace)
		return True
	
	def checkGadgetRequest(self, tenant):

		# CSRFトークンチェック
		if sateraito_func.checkCsrf(self.request) == False:
			logging.exception('Invalid token')
			logging.warning('set_status=403')
			self.response.set_status(403)
			return False

		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')

		checker = sateraito_func.RequestChecker()
		if checker.checkContainerSign(self.request) == False:
			logging.exception('Illegal access')
			logging.warning('set_status=403')
			self.response.set_status(403)
			namespace_manager.set_namespace(old_namespace)
			return False
		# TODO O365 チェック強化
		## domain matching
		#if checker.google_apps_domain != tenant and checker.google_apps_domain_from_gadget_url != google_apps_domain:
		#	logging.exception('google_apps_domain does not match: user email domain=' + str(checker.google_apps_domain) + ' accessing domain=' + google_apps_domain)
		#	self.response.set_status(403)
		#	return False
		self.viewer_email = checker.viewer_email.lower() if checker.viewer_email is not None else None
		self.viewer_email_raw = checker.viewer_email
		self.viewer_user_id = checker.viewer_user_id
		namespace_manager.set_namespace(old_namespace)
		return True

	# 認証処理：OIDC認証、SharePoint認証自動判定
	# AzureOIDC対応：Apps版とできるだけ合わせてみる
	def oidAutoLogin(self, tenant, skip_domain_compatibility=False, with_error_page=False, is_force_auth=False, prompt='none', hl=None, add_querys=None):
		
		# テナント情報を取得
		tenant_row = sateraito_db.TenantEntry.getInstance(tenant, cache_ok=True)

		# AzureOIDC認証設定を取得
		enable_oidc_login = tenant_row is not None and tenant_row.enable_oidc_login
		logging.info('enable_oidc_login=' + str(enable_oidc_login))

		# AzureAD OIDC認証
		if enable_oidc_login:
			is_ok = self._OIDCAutoLogin(tenant, skip_domain_compatibility=skip_domain_compatibility, with_error_page=with_error_page, is_force_auth=is_force_auth, prompt=prompt, hl=hl, add_querys=add_querys)
		# 従来のSharePoint認証
		else:
			is_ok, user_entry = self.checkOidRequestAndGetUserEntry(tenant, is_without_error_response_status=True, is_use_request_token=False, is_check_with_sharepoint_auth_url=True, add_querys=add_querys)

		return is_ok

	# AzureOIDC対応：Apps版とできるだけ合わせてみる
	def _OIDCAutoLogin(self, tenant, skip_domain_compatibility=False, with_error_page=False, is_force_auth=False, prompt='none', hl=None, add_querys=None):
		"""
		  @return boolean True ... user already logged in
		                  False .. user not logged in, processing oid login
		  
		  true_redirecting --> not used now
		"""
		
		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')

		# 強制的に際認証をさせるためセッションを破棄（CookieのセッションIDの破棄ではなくセッションの値をそれぞれ個別に破棄） 2016.05.27

		if sateraito_inc.developer_mode:
			if self.request.get('uf') == 'user':
				self.session['viewer_email'] = 'yoshida@nextsetdemo.onmicrosoft.com'
				self.session['is_oidc_loggedin'] = True
				self.session['user_object_id'] = '991F541B-0C47-4252-9E47-630FE3EC0CB0'
			else:
				self.session['viewer_email'] = 'kuroda@nextsetdemo.onmicrosoft.com'
				self.session['is_oidc_loggedin'] = True
				self.session['user_object_id'] = '63e47cd1-2b81-45dc-8966-9fce8f04b89e'
				
		elif is_force_auth:
			logging.info('force remove auth sessions...')
			self.session['viewer_email'] = ''
			#self.session['opensocial_viewer_id'] = ''
			self.session['is_oidc_loggedin'] = False
			self.session['user_object_id'] = ''
			#self.session['is_oidc_need_show_signin_link'] = False
		
		# check openid connect login
		viewer_email = self.session.get('viewer_email')
		logging.info('viewer_email=' + str(viewer_email))
		#opensocial_viewer_id = self.session.get('opensocial_viewer_id')
		#logging.info('opensocial_viewer_id=' + str(opensocial_viewer_id))
		user_object_id = self.session.get('user_object_id')
		logging.info('user_object_id=' + str(user_object_id))
		is_oidc_loggedin = self.session.get('is_oidc_loggedin')
		logging.info('is_oidc_loggedin=' + str(is_oidc_loggedin))
		#is_oidc_need_show_signin_link = self.session.get('is_oidc_need_show_signin_link')
		#logging.info('is_oidc_need_show_signin_link=' + str(is_oidc_need_show_signin_link))

		## エラーが返る場合は画面上に「認証する」を出すためにFalseを返す 2016.04.03
		#if with_none_prompt and is_oidc_need_show_signin_link:
		#	return False
			
		logging.info('_OIDCAutoLogin viewer_email=' + str(viewer_email))
		
		if is_oidc_loggedin is None or not is_oidc_loggedin or viewer_email is None or viewer_email == '':
			# go login
			# サードパーティCookie無効時に403ではなくメッセージを出す対応（stateに情報を含めてoidccallback側で制御）
			if with_error_page:
				info = 'wep=1&hl=' + sateraito_func.getActiveLanguage('', hl=hl)
				info_base64 = UcfUtil.base64Encode(info)
				state = 'state-' + info_base64 + '-' + sateraito_func.dateString() + sateraito_func.randomString()
			else:
				state = 'state-' + sateraito_func.dateString() + sateraito_func.randomString()
			logging.info('state=' + state)
			self.session['state'] = state

			# 認証後にもどってくる用URLを設定	※ガジェット外での新規申請機能対応　2016.03.04
			url_to_go_after_oidc_login = self.request.url
			if add_querys is not None:
				for add_query in add_querys:
					url_to_go_after_oidc_login = UcfUtil.appendQueryString(url_to_go_after_oidc_login, add_query[0], add_query[1])
			logging.debug('url_to_go_after_oidc_login=%s' % (url_to_go_after_oidc_login))

			# set cookie
			expires = UcfUtil.add_hours(UcfUtil.getNow(), 1).strftime('%a, %d-%b-%Y %H:%M:%S GMT')
			self.setCookie('oidc_state', str(state), expires=expires)
			# セッションがいいのかCookieがいいのか....
			# for 'multiple iframe gadget in a page' case login
			#self.session['url_to_go_after_oidc_login'] = url_to_go_after_oidc_login
			# 30秒とかだとうまくいかないので.
			#self.setCookie(urllib.quote(state), str(url_to_go_after_oidc_login), living_sec=30)
			#self.setCookie(urllib.quote(state), str(url_to_go_after_oidc_login), living_sec=60)
			self.setCookie(urllib.quote(state), str(url_to_go_after_oidc_login), expires=expires)

			# Oauth認証用URLを作成
			#auth_uri = self.createOIDCAuthorizeUrl(state, url_to_go_after_oidc_login)
			query_params = {}
			query_params['state'] = state
			# セキュリティ強化対応（id_token検証処理の追加）とAPIコール回数削減（access_tokenを一気に取得）…response_typeを変更 2016.12.08
			#query_params['response_type'] = 'code id_token'		# oidccallback側でaccess_tokenの取得が不要なら「id_token」（「code+id_token」でもOK）でいいのだが....
			#query_params['response_type'] = 'token id_token'		# これでaccess_tokenも一気に取得できるがどう考えてもセキュリティ的にまずそうなので...
			query_params['response_type'] = 'code'							# ということで結局これに戻る....
			#query_params['response_mode'] = 'form_post'		# response_typeにid_tokenをセットしたので推奨されるPOST方式に変更→これもresponse_type=codeに戻ったのでGETに戻す... 2016.12.08
			# OIDCセキュリティ強化対応：nonceチェックを導入 2016.12.08
			nonce = UcfUtil.guid()
			self.session['nonce-' + state] = nonce
			query_params['nonce'] = nonce									# OIDCセキュリティ強化対応：nonceチェックを導入 2016.12.08
			# query_params['client_id'] = sateraito_inc.CLIENT_ID
			query_params['client_id'] = sateraito_inc.CLIENT_ID
			#query_params['redirect_uri'] = sateraito_inc.my_site_url + '/oidccallback'
			query_params['redirect_uri'] = sateraito_inc.custom_domain_my_site_url + '/oidccallback'
			logging.info(sateraito_inc.custom_domain_my_site_url + '/oidccallback')
			#query_params['resource'] = 'https://graph.microsoft.com/'
			#query_params['resource'] = 'https://webdir.online.lync.com'
			#query_params['scope'] = 'https://graph.microsoft.com/ https://webdir.online.lync.com'
			#query_params['scope'] = 'openid https://graph.microsoft.com/ https://webdir.online.lync.com'			# OIDC的にopenidは必須なので追加（ないとid_tokenの検証ができない） 2016.12.06
			query_params['scope'] = 'openid'				# ここでaccess_tokenをとるわけじゃないのでgraphapiなどのスコープは不要
			#query_params['prompt'] = 'none'			# サードパーティーCookieが無効な場合などにアドオン側でエラーメッセージなどを出せるように none をセットしておく
			if prompt is not None and prompt != '':	# None（'none'ではなく）や空の場合はパラメータのセット自体しない対応  2017.06.01
				query_params['prompt'] = prompt			# サードパーティーCookieが無効な場合などにアドオン側でエラーメッセージなどを出せるように none をセットしておく
			query_params['domain_hint'] = 'organizations'		# 個人Microsoftアカウントの選択肢をスキップ
			#tenant_id = 'organizations'		# v2endpointの場合はこれで個人Microsoftアカウントを除外できそう　参考：https://docs.microsoft.com/ja-JP/azure/active-directory/active-directory-v2-protocols
			#tenant_id = tenant + '.onmicrosoft.com' # 個人Microsoftアカウントを除外　→　でも結局効かなそうなのでcommonに戻す.... 2016.12.08
			tenant_id = 'common'
			#url_to_go = 'https://login.windows.net/' + tenant_id + '/oauth2/authorize?' + urllib.urlencode(query_params)
			url_to_go = 'https://login.microsoftonline.com/' + tenant_id + '/oauth2/authorize?' + urllib.urlencode(query_params)
			
			auth_uri = str(url_to_go)
			logging.info('auth_uri=' + str(auth_uri))
			
			# Microsoft Office文書内に「メールに張り付けられるリンク」を張った場合の動作対応（ワークフローでは今のところこの機能はないが実装しておく） 2015.09.02
			# 参考）
			#   ■ Office製品のハイパーリンクとログイン認証画面
			#     http://hajimesan.net/blog/?p=875
			#   ■ Office 文書内のハイパーリンクを開くと Cookie が紛失する - Microsoftサポート
			#     https://support.microsoft.com/ja-jp/kb/811929/ja

			#self.redirect(auth_uri)

			# check user-agent(Office)
			# sample)
			#   Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET CLR 1.1.4322; .NET4.0E; InfoPath.1; ms-office)
			user_agent = str(self.request.user_agent)
			logging.info(user_agent)
			is_opened_from_msoffice = False
			if 'ms-office' in user_agent and 'MSIE' in user_agent:
				is_opened_from_msoffice = True
			
			logging.info(12222)
			
			# go jump or redirect
			if is_opened_from_msoffice:
				logging.info('url opened by msoffice link click. jumping by html meta tag...')
				self.response.out.write('<html><head>')
				self.response.out.write('<meta http-equiv="refresh" content="1;URL=' + str(auth_uri) + '">')
				self.response.out.write('</head><body></body></html>')
			else:
				logging.info('prepare for redirect')
				self.redirect(auth_uri)
			namespace_manager.set_namespace(old_namespace)
			return False

		if not sateraito_func.isCompatibleDomain(sateraito_func.getDomainPart(viewer_email), tenant):
			#self.response.out.write('unmatched available domain and login user')
			logging.info('unmatched tenant "' + tenant + '" and login user "' + str(viewer_email) + '"')
			namespace_manager.set_namespace(old_namespace)
			return False

		self.viewer_email = str(viewer_email).lower()
		self.user_object_id = str(user_object_id)
		
		#self.opensocial_viewer_id = user_entry.opensocial_viewer_id		# 高速化オプション対応 2016.08.25
		namespace_manager.set_namespace(old_namespace)
		return True



	# 認証チェック（チェックのみ）：OIDC認証、SharePoint認証自動判定
	def checkOidRequest(self, tenant, is_without_error_response_status=False, is_use_request_token=False, is_without_check_csrf_token=False):

		tenant_row = sateraito_db.TenantEntry.getInstance(tenant, cache_ok=True)
		enable_oidc_login = tenant_row is not None and tenant_row.enable_oidc_login
		logging.info('enable_oidc_login=' + str(enable_oidc_login))

		# AzureADOIDC認証対応
		if enable_oidc_login:
			is_ok = self._checkOIDCRequest(tenant, is_without_error_response_status=is_without_error_response_status, is_without_check_csrf_token=is_without_check_csrf_token)
		# 従来のSharePoint認証
		else:
			is_ok, user_entry = self.checkOidRequestAndGetUserEntry(tenant, is_without_error_response_status=is_without_error_response_status, is_use_request_token=is_use_request_token, is_check_with_sharepoint_auth_url=False)
		return is_ok

	def _checkOIDCRequest(self, tenant, is_without_error_response_status=False, is_without_check_csrf_token=False):
		
		logging.debug(self.request)
		# CSRFトークンチェック
		if not is_without_check_csrf_token and sateraito_func.checkCsrf(self.request) == False:
			logging.error('Invalid token')
			self.response.set_status(403)
			return False

		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')
		
		# check if openid connect login
		viewer_email = self.session.get('viewer_email')
		logging.info('viewer_email=' + str(viewer_email))
		is_oidc_loggedin = self.session.get('is_oidc_loggedin')
		logging.info('is_oidc_loggedin=' + str(is_oidc_loggedin))

		#if is_oidc_loggedin is None or not is_oidc_loggedin or viewer_email is None:
		if is_oidc_loggedin is None or not is_oidc_loggedin or viewer_email is None or viewer_email == '':
			logging.error('_checkOIDCRequest:user not logged in')
			if not is_without_error_response_status:
				self.response.set_status(403)
			return False
		
		viewer_email_domain = sateraito_func.getDomainPart(viewer_email)
		if not sateraito_func.isCompatibleDomain(viewer_email_domain, tenant):
			logging.error('unmatched google apps domain and login user')
			self.response.out.write('unmatched google apps domain and login user')
			if not is_without_error_response_status:
				self.response.set_status(403)
			return False
		self.viewer_email = viewer_email.lower() if viewer_email is not None else None
		self.viewer_email_raw = viewer_email
		#self.viewer_user_id = user.user_id()
		namespace_manager.set_namespace(old_namespace)
		return True

	# SharePoint認証用
	# ※ガジェット外での新規申請機能対応（add_querys引数追加） 2016.03.04
	def checkOidRequestAndGetUserEntry(self, tenant, is_without_error_response_status=False, is_use_request_token=False, is_check_with_sharepoint_auth_url=False, add_querys=None):

		## CSRFトークンチェック
		#if sateraito_func.checkCsrf(self.request) == False:
		#	logging.exception('Invalid token')
		#	self.response.set_status(403)
		#	return False, None

		# このアプリケーションID環境の設定を取得（↓のnamespace設定の前に取得）
		other_setting = sateraito_db.AdminConsoleSetting.getInstance(auto_create=True)
		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')

		# 認証トークンを取得
		if not is_use_request_token:
			token = self.request.cookies.get('auth_token')
		else:
			token = self.request.get('token')
		logging.info('token=' + str(token))
		user_entry = self.getUserEntryByToken(tenant, token)

		if user_entry is None:
			logging.info('current user is None.')

			# 有効なトークンがない場合、SharePointアプリパーツ経由で認証を取る（擬似的OpenID）2015/02/15
			if is_check_with_sharepoint_auth_url and self.request.get('spauth') != '1':
				sharepoint_auth_url = other_setting.sharepoint_auth_url
				if sharepoint_auth_url is not None and sharepoint_auth_url != '':
					boolShowError = False
					# リダイレクト前に返ってくるべきURLをセッションに入れておく（パラメータを渡せないので苦肉の策）
					sharepoint_auth_redirect_url = UcfUtil.appendQueryString(self.request.url, 'spauth', '1')		# spauth…リダイレクトループ防止用
					# ※ガジェット外での新規申請機能対応…その他のクエリーも追加 2016.03.02
					if add_querys is not None:
						for add_query in add_querys:
							sharepoint_auth_redirect_url = UcfUtil.appendQueryString(sharepoint_auth_redirect_url, add_query[0], add_query[1])
					self.session['sharepoint_auth_redirect_url'] = sharepoint_auth_redirect_url
					# リダイレクト
					self.redirect(sharepoint_auth_url.encode('utf-8'))
					logging.info(sharepoint_auth_url.encode('utf-8'))
					return False, None

			logging.info('is_without_error_response_status=' + str(is_without_error_response_status))
			if not is_without_error_response_status:
				logging.warning('set_status=403')
				self.response.set_status(403)
			return False, None

		viewer_email = user_entry.user_email
		logging.info(viewer_email)

		if not sateraito_func.isCompatibleDomain(sateraito_func.getDomainPart(viewer_email), tenant):
			#self.response.out.write('unmatched available domain and login user')
			logging.info('unmatched tenant "' + tenant + '" and login user "' + str(viewer_email) + '"')
			if not is_without_error_response_status:
				logging.warning('set_status=403')
				self.response.set_status(403)
			namespace_manager.set_namespace(old_namespace)
			return False, None

		self.viewer_email = viewer_email.lower() if viewer_email is not None else None
		self.viewer_email_raw = viewer_email
		self.viewer_user_id = user_entry.user_id
		self.opensocial_viewer_id = user_entry.opensocial_viewer_id		# 高速化オプション対応 2016.08.25
		logging.info('user_entry.opensocial_viewer_id= ' + str(user_entry.opensocial_viewer_id))
		namespace_manager.set_namespace(old_namespace)
		return True, user_entry

	# スマホ版の認証チェック：Apps版と同様にmb_remote.pyに置いてもいい気がする...
	def checkOidRequestAndGetUserEntryMobile(self, tenant, is_without_error_response_status=False, is_use_request_token=False, is_check_with_sharepoint_auth_url=False, add_querys=None):

		## CSRFトークンチェック
		#if sateraito_func.checkCsrf(self.request) == False:
		#	logging.exception('Invalid token')
		#	self.response.set_status(403)
		#	return False, None

		# このアプリケーションID環境の設定を取得（↓のnamespace設定の前に取得）
		# other_setting = sateraito_db.AdminConsoleSetting.getInstance(auto_create=True)
		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')

		## 認証トークンを取得
		#if not is_use_request_token:
		#	token = self.request.cookies.get('auth_token')
		#else:
		#	token = self.request.get('token')
		#logging.info('token=' + str(token))

		#viewer_email = self.session['viewer_email']
		#is_oidc_loggedin = self.session['is_oidc_loggedin']
		viewer_email = self.session.get('viewer_email', None)
		is_oidc_loggedin = self.session.get('is_oidc_loggedin', None)
		if not is_oidc_loggedin:
			return False, None
		# user_entry = self.getUserEntryByToken(tenant, token)
		# if user_entry is None:
		# 	logging.info('current user is None.')
		# 	logging.info(self.request.url)
		# 	logging.info(self.request.get('spauth'))
		#
		# 	# 有効なトークンがない場合、SharePointアプリパーツ経由で認証を取る（擬似的OpenID）2015/02/15
		# 	# if is_check_with_sharepoint_auth_url and self.request.get('spauth') != '1':
		# 	# 	sharepoint_auth_url = other_setting.sharepoint_auth_url
		# 	# 	logging.info(sharepoint_auth_url)
		# 	# 	if sharepoint_auth_url is not None and sharepoint_auth_url != '':
		# 	# 		boolShowError = False
		# 	# 		# リダイレクト前に返ってくるべきURLをセッションに入れておく（パラメータを渡せないので苦肉の策）
		# 	# 		sharepoint_auth_redirect_url = UcfUtil.appendQueryString(self.request.url, 'spauth', '1')		# spauth…リダイレクトループ防止用
		# 	# 		# ※ガジェット外での新規申請機能対応…その他のクエリーも追加 2016.03.02
		# 	# 		if add_querys is not None:
		# 	# 			for add_query in add_querys:
		# 	# 				sharepoint_auth_redirect_url = UcfUtil.appendQueryString(sharepoint_auth_redirect_url, add_query[0], add_query[1])
		# 	# 		self.session['sharepoint_auth_redirect_url'] = sharepoint_auth_redirect_url
		# 	# 		# リダイレクト
		# 	# 		self.redirect(sharepoint_auth_url.encode('utf-8'))
		# 	# 		logging.info(sharepoint_auth_url.encode('utf-8'))
		# 	# 		return False, None
		#
		# 	logging.info('is_without_error_response_status=' + str(is_without_error_response_status))
		# 	if not is_without_error_response_status:
		# 		logging.warning('set_status=403')
		# 		self.response.set_status(403)
		# 	return False, None
		#
		# viewer_email = user_entry.user_email

		if not sateraito_func.isCompatibleDomain(sateraito_func.getDomainPart(viewer_email), tenant):
			#self.response.out.write('unmatched available domain and login user')
			logging.info('unmatched tenant "' + tenant + '" and login user "' + str(viewer_email) + '"')
			if not is_without_error_response_status:
				logging.warning('set_status=403')
				self.response.set_status(403)
			namespace_manager.set_namespace(old_namespace)
			return False, None

		self.viewer_email = viewer_email.lower() if viewer_email is not None else None
		self.viewer_email_raw = viewer_email
		# self.viewer_user_id = user_entry.user_id
		# self.opensocial_viewer_id = user_entry.opensocial_viewer_id		# 高速化オプション対応 2016.08.25
		# logging.info('user_entry.opensocial_viewer_id= ' + str(user_entry.opensocial_viewer_id))
		namespace_manager.set_namespace(old_namespace)
		return True, viewer_email


class _OidBasePage(_BasePage):
	pass

# SharePointガジェットの認証
#class _AuthSharePointGadget(webapp2.RequestHandler):
class _AuthSharePointGadget(_BasePage):

	#変数初期化
	_tenant = ''
	_tenant_id = ''
	_auth_url = ''
	_host_name = ''
	_sp_principal_id = ''
	_reflesh_token = ''
	_reflesh_token_expire = 0
	_site_url = ''
	_oauth_client_id = ''
	_oauth_client_secret = ''
	_token_type = ''
	_access_token = ''
	_access_token_expire = 0
	_app_principal_id = ''
	_authorization = ''
	_accept_encoding = ''
	_site_collection_host_name = ''
	_current_user_mail_address = ''
	_current_user_name_id = ''
	_current_user_is_admin = False

	def setNamespace(self, tenant, app_id):
		"""	Args: tenant
					app_id
		Return: True is app_id is correct, false is not
		"""
		return sateraito_func.setNamespace(tenant, app_id)

	# カスタムドメイン用アプリパーツを使用しているかを判断
	def judgeCustomDomainMode(self):
		url = self.request.url
		sp1 = url.split('?')
		sp = sp1[0].split('/')
		if len(sp) >= 3:
			request_fqdn = sp[2]
			logging.info('request_fqdn=' + request_fqdn)
			return request_fqdn.lower() == sateraito_inc.custom_domain_site_fqdn.lower()
		return False

	# OpenIDのかわりに印刷ウインドウなどで認証に使うCookieをセット（有効期限…とりあえず1日）
	def setTokenToCookie(self, token):
		name = 'auth_token'
		value = str(token)
		expires = UcfUtil.add_days(UcfUtil.getNow(), 1).strftime('%a, %d-%b-%Y %H:%M:%S GMT')
		path = '/'
		domain = ''
		secure = ''		# 'secure'
		self.response.headers.add_header('Set-Cookie', str(name) + '=' + value + ';' + 'expires=' + str(expires) + ';' + 'Path=' + str(path) + ';' + (('domain=' + str(domain) + ';') if domain != '' else '') + secure)

#	def _authSharePointGadget(self):
#
#		if sateraito_inc.developer_mode:
#			self._tenant = 'nextsetdemo'
#			self._host_name = 'http://nextsetdemo.sharepoint.com'
#			if self.request.get('uf') == 'user':
#				self._current_user_mail_address = 'yoshida@nextsetdemo.onmicrosoft.com'
#				self._current_user_name_id = '22222222222222222'
#				self._current_user_is_admin = False
#			else:
#				self._current_user_mail_address = 'kuroda@nextsetdemo.onmicrosoft.com'
#				self._current_user_name_id = '1234567890123457'
#				self._current_user_is_admin = True
#			return True
#
#		#RequestパラメータにSPAppToken が存在したら次の処理
#		valSPAppToken = self.request.get("SPAppToken")
#		if valSPAppToken == None or valSPAppToken == '':
#			self.response.out.write("No Token<br><br>")
#			logging.error('No Token')
#			return False
#		else:
#			logging.debug('valSPAppToken=' + valSPAppToken)
#			self.DecodeSPAppToken(valSPAppToken)
#			if self._tenant is None or self._tenant == '':
#				self.response.out.write("Invalid Tenant<br><br>")
#				logging.error('Invalid Tenant')
#				return False
#			self.getApplicationInfo()
#			self.getAccessControl()
#			self.getOAuthAccessToken()
#			self.getCurrentUser()
#
#		if self._current_user_mail_address == '':
#			self.response.out.write("Failed get authed email address.<br><br>")
#			logging.error('Failed get authed email address.')
#			return False
#
#
#		#self.response.out.write("EMailAddress : " + self._current_user_mail_address)
#		return True

	# _tenant と _host_name だけ取得（SPAppToken不要なので）
	def _authSharePointGadgetStep0(self):
		""" auth step 0. get tenant info from SPHostUrl and set
		"""
		if sateraito_inc.developer_mode:
			self._tenant = 'nextsetdemo'
			self._host_name = 'http://nextsetdemo.sharepoint.com'
			return True

		#Host名
		# 更新リンクからのリロードでPOSTデータが渡されてこないので「SPHostUrl」から取得するように変更 2017.08.11
		#self._host_name = str( self.request.get("SPSiteUrl").split("/")[2] )
		sphosturl = self.request.get("SPSiteUrl")
		if sphosturl == '':
			sphosturl = self.request.get("SPHostUrl")
		self._host_name = str( sphosturl.split("/")[2] )
		#Host名からテナント名を取得（Host名=サイトコレクションのURLだが、Publicページじゃない限りはカスタムURLにはできないのでここから取得してOK）
		self._tenant = self._host_name.replace('http://', '').replace('https://', '').split('.')[0].lower()

		logging.info("Local URL : " + self._host_name + "")
		logging.info("Tenant Name : " + self._tenant + "")

		if self._tenant is None or self._tenant == '':
			self.response.out.write("Invalid Tenant<br><br>")
			logging.error('Invalid Tenant')
			return False
		return True

	def _authSharePointGadgetStep1(self):
		""" auth step 1. get info from SPAppToken and set
		"""
		if sateraito_inc.developer_mode:
			#self._tenant = 'nextsetdemo'
			#self._host_name = 'http://nextsetdemo.sharepoint.com'
			if self.request.get('uf') == 'user':
				self._current_user_mail_address = 'yoshida@nextsetdemo.onmicrosoft.com'
				self._current_user_name_id = '22222222222222222'
				self._current_user_is_admin = False
			else:
				self._current_user_mail_address = 'kuroda@nextsetdemo.onmicrosoft.com'
				self._current_user_name_id = '1234567890123457'
				self._current_user_is_admin = True
			return True

		#RequestパラメータにSPAppToken が存在したら次の処理
		valSPAppToken = self.request.get("SPAppToken")
		if valSPAppToken == None or valSPAppToken == '':
			self.response.out.write("No Token<br><br>")
			logging.error('No Token')
			return False
		else:
			logging.debug('valSPAppToken=' + valSPAppToken)
			self.DecodeSPAppToken(valSPAppToken)
			#if self._tenant is None or self._tenant == '':
			#	self.response.out.write("Invalid Tenant<br><br>")
			#	logging.error('Invalid Tenant')
			#	return False
		return True
	
	def _authSharePointGadgetStep2(self):
		""" auth step 2. get user from SharePoint API using SPAppToken
		"""

		if sateraito_inc.developer_mode:
			return True

		self.getApplicationInfo()
		self.getAccessControl()
		self.getOAuthAccessToken()
		self.getCurrentUser()

		if self._current_user_mail_address == '':
			self.response.out.write("Failed get authed email address.<br><br>")
			logging.error('Failed get authed email address.')
			return False

		#self.response.out.write("EMailAddress : " + self._current_user_mail_address)
		return True


	#SharePointからリクエストされた情報の表示
	def PrintRequest(self):
		#メソッドとパス表示
		self.response.out.write("-------------- SharePoint to GAE Request --------------<br>")
		self.response.out.write("url : " + self.request.path + "<br>")
		#self.response.out.write("method : " + self._method + "<br>")
		self.response.out.write("<br>")

		#リクエスト値表示
		self.response.out.write("--------------     Request Parameter     --------------<br>")
		for val2 in self.request.arguments():
			for val in self.request.get_all(val2):
				self.response.out.write(val2 + " : " + val)
				self.response.out.write("<br>")
		self.response.out.write("<br>")

		#クッキー値表示
		self.response.out.write("--------------      Request Cookies      --------------<br>")
		for val4 in self.request.cookies:
			self.response.out.write(val4 + " : " + self.request.cookies.get(val4))
			self.response.out.write("<br>")
		self.response.out.write("<br>")

		#ヘッダー値表示
		self.response.out.write("--------------      Request Headers      --------------<br>")
		for val3 in self.request.headers:
			self.response.out.write(val3 + " : " + self.request.headers.get(val3))
			self.response.out.write("<br>")
		self.response.out.write("<br>")

		self.response.out.write("--------------------------------------------------------<br><br>")


	#SPAppTokenをBase64デコードしつつ必要な値取得
	def DecodeSPAppToken(self,SPAppToken):
		#リクエストの値をピリオドで分割した２個目の値をセット

		#SPAppTokenをピリオドで分割して２個目の値をベース64デコードしてJSON型にセット
		SPAppTokenEnc = SPAppToken.split(".")[1]
		if not SPAppTokenEnc.endswith('='):
			SPAppTokenEnc = SPAppTokenEnc + '=='
		SPAppTokenDec = base64.b64decode(SPAppTokenEnc)
		logging.debug(SPAppTokenDec)
		jdata = json.loads(SPAppTokenDec)

		logging.debug("--------------   SPAppToken Base64 Decode --------------")
		for jkey in jdata:
			logging.debug(jkey + " : " + str(jdata[jkey]) + "")
		logging.debug("--------------   Pincup Parameter --------------")

		#JSON型の変数から必要な項目をピックアップ
		#SharePointのプリンシパルID (appctxsenderの@で分割した左側)
		self._sp_principal_id = str(jdata["appctxsender"]).split("@")[0]
		# AzureOIDC認証対応：Host名とテナント名の取得をSPTokenの処理から分離 2016.10.27
		##Host名
		#self._host_name = str( self.request.get("SPSiteUrl").split("/")[2] )
		##Host名からテナント名を取得（Host名=サイトコレクションのURLだが、Publicページじゃない限りはカスタムURLにはできないのでここから取得してOK）
		#self._tenant = self._host_name.replace('http://', '').replace('https://', '').split('.')[0].lower()
		#テナントID (appctxsenderの@で分割した右側)
		self._tenant_id = str(jdata["appctxsender"]).split("@")[1]
		#サイトコレクションのURL
		# 全角（unicode）のURLもあるので
		#self.strSiteCollectionName = str(self.request.get("SPHostUrl"))
		self.strSiteCollectionName = self.request.get("SPHostUrl")
		#リフレッシュトークン(B64値)
		self._reflesh_token = str(jdata["refreshtoken"])
		#リフレッシュトークンの有効期限
		self._reflesh_token_expire = int(jdata["exp"])
		#アプリのプリンシパルID
		self._app_principal_id = str(jdata["aud"]).split("/")[0]


		logging.debug("Principal ID : " + self._sp_principal_id + "")
		#logging.debug("Local URL : " + self._host_name + "")
		#logging.debug("Tenant Name : " + self._tenant + "")
		logging.debug("Tenant ID : " + self._tenant_id + "")
		logging.debug("SiteCollection URL : " + self.strSiteCollectionName + "")
		logging.debug("Reflesh Token : " + self._reflesh_token + "")
		logging.debug("Reflesh Token Expire: " + str(self._reflesh_token_expire) + "")
		logging.debug("Client ID : " + self._oauth_client_id + "")
		logging.debug("Client Secret : " + self._oauth_client_secret + "")
		logging.debug("Apprication Principal ID : " + self._app_principal_id + "")

	# 管理者がセットしておいたOAuth関連情報を取得
	def getApplicationInfo(self):
		row = sateraito_db.ApplicationEntry.getInstanceByClientId(self._app_principal_id)
		if row is not None:
			# クライアントID（=プリンシパルID）
			self._oauth_client_id = row.client_id
			# クライアントシークレット
			self._oauth_client_secret = row.client_secret
		else:
			raise BaseException, 'Not ready.'

#	def LoggingRequest(self):
#		logging.info("-------------- SharePoint to GAE Request --------------")
#		logging.info("url : " + str(self.request.path))
#
#		logging.info("--------------     Request Parameter     --------------")
#		for val2 in self.request.arguments():
#			for val in self.request.get_all(val2):
#				logging.info(str(val2) + " : " + str(val))
#
#		logging.info("--------------      Request Cookies      --------------")
#		for val4 in self.request.cookies:
#			logging.info(str(val4) + " : " + str(self.request.cookies.get(val4)))
#
#		logging.info("--------------      Request Headers      --------------")
#		for val3 in self.request.headers:
#			logging.info(str(val3) + " : " + str(self.request.headers.get(val3)))
#
#		logging.info("--------------------------------------------------------")

	#OAuth認証用URLを取得
	def getAccessControl(self):

		# URLFetch せずにURLを固定で作成するように変更
		self._auth_url = 'https://accounts.accesscontrol.windows.net/' + self._tenant_id + '/tokens/OAuth/2'
		logging.debug("_auth_url : " + self._auth_url)
		return
		
#		strUrl = "https://accounts.accesscontrol.windows.net/metadata/json/1?realm=" + self._tenant_id
#
#		#GETで対象URLにアクセスして情報取得
#		logging.debug("--------------   AccessControl --------------")
#		logging.debug("Url:" + strUrl + "")
#
#		strReturn = HttpGetAccess(strUrl)
#
#		#結果をJSONにセット
#		try:
#			jdata = json.loads(strReturn)
#		except:
#			self.response.out.write("json load error<br><br>")
#
#		logging.debug("--------------   AccessControl Response --------------")
#		for jkey in jdata:
#			logging.debug(jkey + ":" + str(jdata[jkey]) + "")
#
#		#endpointを加工（そのままじゃロードできなかったから形式変換して無理やり値取得する）
#		jchange1 = str(jdata["endpoints"]).lstrip("[").rstrip("]")
#		jchange2 = jchange1.replace("'",'"').replace("}, {","}[sep]{")
#		jchange3 = jchange2.replace('{u"','{"').replace(', u"',', "').replace(': u"',': "')
#		JDataSep = jchange3.split("[sep]")
#
#		#OAuth2のURLを取得(見つけたらループ終了)
#		for jval in JDataSep:
#			JData = json.loads(jval)
#			if(JData["protocol"] == "OAuth2"):
#				self._auth_url = str(JData["location"])
#				break
#		logging.debug("--------------   Pincup Parameter --------------")
#		logging.debug("_auth_url : " + self._auth_url)



	#OAuthの認証
	def getOAuthAccessToken(self):


		memcache_key_access_token = 'oauth2_access_token?refresh_token=' + self._reflesh_token
		memcache_key_token_type = 'oauth2_token_type?refresh_token=' + self._reflesh_token

		# memcache からアクセストークンを取得するように対応（取得できなければ本来の処理）
		memcache_keys = [memcache_key_access_token, memcache_key_token_type]
		memcache_datas = memcache.get_multi(memcache_keys)

		access_token = memcache_datas.get(memcache_key_access_token)
		token_type = memcache_datas.get(memcache_key_token_type)
		if access_token is not None and token_type is not None:
			self._access_token = access_token
			self._token_type = token_type
			logging.debug("-------------- Get AccessToken by memcache --------------")
			logging.debug("_token_type : " + self._token_type + "")
			logging.debug("_access_token : " + self._access_token + "")
			return


		#POSTで対象URLにアクセスして情報取得
		#OAuthのURLをセット
		strUrl = self._auth_url
		#ポストする値をセット
		strValues = {"grant_type" : "refresh_token" , "client_id" : self._app_principal_id + "@" + self._tenant_id , "client_secret" : self._oauth_client_secret , "refresh_token" : self._reflesh_token , "resource" : self._sp_principal_id + "/" + self._host_name + "@" + self._tenant_id}
		#送信するヘッダーをセット
		strHeaders = {"Content-Type" : "application/x-www-form-urlencoded" , "Host" : self._auth_url.split("/")[2] , "Expect" : "100-continue" }

		logging.debug("--------------   OAuth2 Request --------------")
		logging.debug("url : " + self._auth_url + "")

		logging.debug("--------------   OAuth2 Request Parameters --------------")
		for jkey in strValues:
			logging.debug(jkey + " : " + strValues[jkey] + "")

		logging.debug("--------------   OAuth2 Request Headers --------------")
		for jkey in strHeaders:
			logging.debug(jkey + " : " + strHeaders[jkey] + "")


		#OAuth認証
		logging.debug('url=' + strUrl)
		strReturn = HttpPostAccess(strUrl,strValues,strHeaders)

		logging.debug("--------------   OAuth2 Response Value --------------")
		logging.debug(strReturn)

		#レスポンスから必要項目を取得
		strJson = json.loads(strReturn)
		self._access_token = strJson["access_token"]
		self._token_type = strJson["token_type"]
		self._access_token_expire = int(strJson["expires_on"])

		logging.debug("--------------   Pincup Parameter --------------")
		logging.debug("_token_type : " + self._token_type + "")
		logging.debug("_access_token : " + self._access_token + "")
		logging.debug("_access_token_expire : " + str(self._access_token_expire) + "")

		# memcacheにアクセストークンをセット
		# リフレッシュトークンとアクセストークンの短いほう - 10分（保険的に）をmemcacheの期限とする
		expire_unixtime = self._access_token_expire if self._access_token_expire < self._reflesh_token_expire else self._reflesh_token_expire
		memcache_expire = int(expire_unixtime - time.mktime(datetime.datetime.now().timetuple()) - 600)	
		# memcache期限がマイナスになる場合は１０分ひかない 2016.10.26
		if memcache_expire < 0:
			memcache_expire = int(expire_unixtime - time.mktime(datetime.datetime.now().timetuple()))	
		logging.debug('memcache_expire : ' + str(memcache_expire))
		if memcache_expire > 0:
			#datetime.datetime.fromtimestamp(unixtime)
			datas = {
				memcache_key_access_token:self._access_token,
				memcache_key_token_type:self._token_type
			}
			memcache.set_multi(datas, time=memcache_expire)
			logging.debug("Set access_token to memcache.")


	#SharePointから現在ログインしているユーザーを取得
	def getCurrentUser(self):
		#POSTで対象URLにアクセスして情報取得
		#strUrl = self.strSiteCollectionName + "/_vti_bin/client.svc/ProcessQuery"
		sp = self.strSiteCollectionName.split('/')
		strUrl = ''
		for i in range(len(sp)):
			v = sp[i]
			if i >= 3:		# FQDNより後ろを処理
				# 半角スペースが「+」に変換されるとエラーするので対応 2015.03.23
				#v = UcfUtil.urlEncode(v)
				v = UcfUtil.urlEncode(v, without_plus=True)
			strUrl += ('/' if i > 0 else '') + v
		strUrl = strUrl + "/_vti_bin/client.svc/ProcessQuery"

		#SharePoint上のデータを取得するクエリ（ログインしてるユーザー情報取得）をセット
		strValues = '<Request AddExpandoFieldTypeSuffix=\"true\" SchemaVersion=\"15.0.0.0\" LibraryVersion=\"15.0.0.0\" ApplicationName=\".NET Library\" xmlns=\"http://schemas.microsoft.com/sharepoint/clientquery/2009\"><Actions><ObjectPath Id=\"2\" ObjectPathId=\"1\" /><ObjectPath Id=\"4\" ObjectPathId=\"3\" /><Query Id=\"5\" ObjectPathId=\"3\"><Query SelectAllProperties=\"false\"><Properties><Property Name=\"CurrentUser\" SelectAll=\"true\"><Query SelectAllProperties=\"false\"><Properties /></Query></Property></Properties></Query></Query></Actions><ObjectPaths><StaticProperty Id=\"1\" TypeId=\"{3747adcd-a3c3-41b9-bfab-4a64dd2f1e0a}\" Name=\"Current\" /><Property Id=\"3\" ParentId=\"1\" Name=\"Web\" /></ObjectPaths></Request>'

		#ヘッダーをセット
		strHeaders = {"Authorization" : self._token_type + " " + self._access_token , "Host" : self._host_name , "Content-Type" : "text/xml" , "Expect" : "100-continue" , "Accept-Encoding" : "gzip, deflate"}

		logging.debug("--------------   Get SharePoint Data --------------")
		logging.debug("url " + strUrl + "")

		logging.debug("--------------   Get SharePoint Data Request Parameters--------------")
		logging.debug("Payload : " + strValues.replace("<","&lt;").replace(">","&gt;") + "")

		logging.debug("--------------   Get SharePoint Data Request Headers--------------")
		for jkey in strHeaders:
			logging.debug(str(jkey) + " : " + str(strHeaders[str(jkey)]) + "")

		#SharePointサーバーからデータ取得
		logging.debug('strValues=' + str(strValues))
		logging.debug('strHeaders=' + str(strHeaders))
		result = HttpPostAccessRow(strUrl, strValues, strHeaders)

		logging.debug("--------------   Get SharePoint Data Response Headers --------------")

		logging.debug("http_status_code :" + str(result.status_code) + "")
		is_gzip = False
		for strKey in result.headers.keys():
			logging.debug(strKey + ":" + result.headers[strKey] + "")
			if strKey == 'content-encoding' and result.headers[strKey] == 'gzip':
				is_gzip = True
		logging.debug("--------------   Get SharePoint Data Response Data --------------")

		#結果がgzipで圧縮されているので解凍
		#logging.debug(result.content)

		if is_gzip:
			# なぜかGZIPされてこないパターンがあるのでキャッチしてそのまま使う対応のまま、一応try、catchしておくが、is_gzipでちゃんと分岐できているはず
			try:
				sf = StringIO.StringIO(result.content)
				result_value = gzip.GzipFile(fileobj=sf).read()
			except IOError, e:
				logging.warning(e)
				result_value = result.content
		else:
			result_value = result.content

		#logging.debug(result_value)
		#クエリの結果からEメールアドレスを抽出
		logging.info('result_value=' + str(result_value))
		result_value_json = json.loads(result_value)

		for jdata_record in result_value_json:
			if isinstance(jdata_record, dict) and jdata_record.has_key('CurrentUser'):
				# example… {u'_ObjectType_': u'SP.Web', u'CurrentUser': {u'_ObjectType_': u'SP.User', u'LoginName': u'i:0#.f|membership|kuroda@nextsetdemo.onmicrosoft.com', u'IsSiteAdmin': False, u'Title': u'\u9ed2\u7530\u5b5d\u9ad8', u'_ObjectIdentity_': u'740c6a0b-85e2-48a0-a494-e0f1759d4aa7:site:d84a70cf-7afb-424a-af33-2625abf269f2:u:9', u'UserId': {u'_ObjectType_': u'SP.UserIdInfo', u'NameIdIssuer': u'urn:federation:microsoftonline', u'NameId': u'1003bffd85514b76'}, u'Email': u'kuroda@nextsetdemo.onmicrosoft.com', u'PrincipalType': 1, u'IsHiddenInUI': False, u'Id': 9}, u'_ObjectIdentity_': u'740c6a0b-85e2-48a0-a494-e0f1759d4aa7:site:d84a70cf-7afb-424a-af33-2625abf269f2:web:a2a0f6c2-2875-4fda-9fcc-9b64498bda5f'}
				current_user = jdata_record['CurrentUser']
				logging.debug(current_user)

				# Emailのほうは正しい認証アカウントが取得できない場合が発生したので、LoginNameを優先するように変更 2014.07.01
				#self._current_user_mail_address = current_user.get('Email', '')
				## Email から取得できない場合がなぜか時々あるのでその場合は、LoginName から取得
				#if self._current_user_mail_address is None or self._current_user_mail_address == '':
				#	login_name = current_user.get('LoginName', '')
				#	login_name_sp = login_name.split('|')
				#	self._current_user_mail_address = login_name_sp[len(login_name_sp) - 1]
				login_name = current_user.get('LoginName', '')
				login_name_sp = login_name.split('|')
				self._current_user_mail_address = login_name_sp[len(login_name_sp) - 1]
				if self._current_user_mail_address is None or self._current_user_mail_address == '':
					self._current_user_mail_address = current_user.get('Email', '')

				self._current_user_is_admin = current_user.get('IsSiteAdmin', False)
				user_id_dict = current_user.get('UserId', None)
				if user_id_dict is not None:
					#logging.debug(user_id_dict)
					self._current_user_name_id = user_id_dict.get('NameId', '')
				break

		if str(self._current_user_mail_address) == '':
			logging.debug(result_value_json)

		logging.info('current_user_mail_address=' + str(self._current_user_mail_address))
		logging.info('current_user_name_id=' + str(self._current_user_name_id))
		logging.info('current_user_is_admin=' + str(self._current_user_is_admin))



##############################################################
# CSV作成入口ページ：抽象クラス
##############################################################
class _ExportCsv(_BasePage):

	def _create_request_token(self):
		return UcfUtil.guid()

	# タスクキューレコードを追加
	def _createCsvTaskQueue(self, tenant, task_type):
		# リクエストトークン作成（このキーでJSから照会）
		request_token = self._create_request_token()
		logging.info('request_token=' + str(request_token))

		tq_entry = sateraito_db.CsvTaskQueue()
		tq_entry.request_token = request_token
		tq_entry.task_type = task_type
		tq_entry.status = ''
		tq_entry.deal_status = 'PROCESSING'
		tq_entry.download_url = ''
		tq_entry.expire_date = datetime.datetime.now() + datetime.timedelta(days=1)	# csv download expires in 24 hours
		tq_entry.put()

		return tq_entry

	# CSV作成キューを登録
	def _addCsvTaskQueue(self, task_url, task_params):

		namespace_name = namespace_manager.get_namespace()
		tenant_or_domain, app_id = sateraito_func.getTenantAndAppIdFromNamespaceName(namespace_name)

		default_q = taskqueue.Queue('csv-export-queue')
		t = taskqueue.Task(
			url=task_url,
			params=task_params,
			#target='b2process',
			target=sateraito_func.getBackEndsModuleName(tenant_or_domain),
			countdown=(1)
		)
		#default_q.add(t)
		# タスクキューの追加自体がエラーする場合があるのでリトライ対応 2018.09.12
		sateraito_func.addTaskQueue(default_q, t)


##############################################################
# CSV作成入口ページ：抽象クラス（申請書用）
##############################################################
class _ExportDocCsv(_ExportCsv):
	''' for workflow admin only
	'''

	def _getUTCTimesForSearchDoc(self, older_than, from_date_localtime_raw, to_date_localtime_raw, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		# from_date
		from_date_utc = None
		if from_date_localtime_raw.strip() != '':
			from_date_localtime = datetime.datetime.strptime(from_date_localtime_raw + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
			from_date_utc = toUtcTime(from_date_localtime, timezone=timezone)
		# to_date
		to_date_utc = None
		if to_date_localtime_raw.strip() != '':
			to_date_localtime = datetime.datetime.strptime(to_date_localtime_raw + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
			to_date_localtime = UcfUtil.add_days(to_date_localtime, 1)
			to_date_utc = toUtcTime(to_date_localtime, timezone=timezone)
		older_than_utc = None
		if older_than != '':
			older_than_splited = older_than.split('+')
			local_time_older_than = datetime.datetime.strptime(older_than_splited[0], '%Y-%m-%d %H:%M:%S.%f')
			older_than_utc = toUtcTime(local_time_older_than, timezone=timezone)

		return older_than_utc, from_date_utc, to_date_utc



##############################################################
# CSV作成処理タスクキュー：抽象クラス
##############################################################
class _TqExportCsv(_BasePage):

	def _getUTCTimesForSearchDoc(self, older_than, from_date_localtime_raw, to_date_localtime_raw, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		# from_date
		from_date_utc = None
		if from_date_localtime_raw.strip() != '':
			from_date_localtime = datetime.datetime.strptime(from_date_localtime_raw + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
			from_date_utc = toUtcTime(from_date_localtime, timezone=timezone)
		# to_date
		to_date_utc = None
		if to_date_localtime_raw.strip() != '':
			to_date_localtime = datetime.datetime.strptime(to_date_localtime_raw + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
			to_date_localtime = UcfUtil.add_days(to_date_localtime, 1)
			to_date_utc = toUtcTime(to_date_localtime, timezone=timezone)
		older_than_utc = None
		if older_than != '':
			older_than_splited = older_than.split('+')
			local_time_older_than = datetime.datetime.strptime(older_than_splited[0], '%Y-%m-%d %H:%M:%S.%f')
			older_than_utc = toUtcTime(local_time_older_than, timezone=timezone)

		return older_than_utc, from_date_utc, to_date_utc


	def createCsvDownloadId(self):
		''' create new csv download id string
		'''
		# create 8-length random string		
		s = 'abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
		random_string = ''
		for j in range(8):
			random_string += random.choice(s)
		# create date string
		dt_now = datetime.datetime.now()
		date_string = dt_now.strftime('%Y%m%d%H%M%S')
		# create send_id
		return date_string + random_string

	def _saveCsv(self, tenant, app_id, tq_entry, csv_download_id, csv_filename, csv_string, csv_fileencoding=None, is_api=False):

		### save csv data to datastore

		csv_fileencoding = sateraito_func.getFileEncoding(csv_fileencoding)

		#csv_string = str(csv_string)
		csv_string = csv_string.encode(csv_fileencoding)

		# devide csv data
		# CAUTION: Datastore entity can have only 1MB data per entity
		#					so you have to devide data if it is over 1MB
		csv_data_length = len(csv_string)
		csv_datas = []
		NUM_STRING_PER_ENTITY = 1000 * 800		# 800 KB
		number_of_entity = (csv_data_length // NUM_STRING_PER_ENTITY) + 1
		for i in range(0, number_of_entity):
			start_index = i * NUM_STRING_PER_ENTITY
			end_index = start_index + NUM_STRING_PER_ENTITY
			csv_datas.append(csv_string[start_index:end_index])
		
		# store data to datastore
		expire_date = datetime.datetime.now() + datetime.timedelta(days=1)	# csv download expires in 24 hours
		for i in range(0, number_of_entity):
			new_data = sateraito_db.CsvDownloadData()
			new_data.csv_data = csv_datas[i]
			new_data.csv_fileencoding = csv_fileencoding
			new_data.data_order = i
			new_data.csv_download_id = csv_download_id
			new_data.expire_date = expire_date
			new_data.csv_filename = csv_filename
			new_data.put()
		logging.info('number_of_entity=' + str(number_of_entity))

		# ダウンロードURL
		if is_api:
			download_url = sateraito_func.getMySiteURL(tenant, self.request.url) + '/' + tenant + '/' + app_id + '/api/exportcsv/' + csv_download_id
		else:
			download_url = sateraito_func.getMySiteURL(tenant, self.request.url) + '/' + tenant + '/' + app_id + '/exportcsv/' + csv_download_id

		tq_entry.status = 'SUCCESS'
		tq_entry.deal_status = 'FIN'
		tq_entry.download_url = download_url
		tq_entry.expire_date = expire_date
		tq_entry.csv_download_id = csv_download_id
		tq_entry.put()

		return download_url

	def _updateErrorStatus(self, tenant, tq_entry, err=None):
		if tq_entry is not None:
			tq_entry.status = 'FAILED'
			tq_entry.deal_status = 'FIN'
			tq_entry.log_text = str(err) if err is not None else ''
			#tq_entry.csv_download_id = csv_download_id
			tq_entry.put()

##############################################################
# CSV作成処理タスクキュー：抽象クラス（申請書用）
##############################################################
class _TqExportDocCsv(_TqExportCsv):
	def _exportDocHeader(self, column_list, csv_fileencoding=None):
		export_line = ''
		#export_line += '#created_date,template_name,author_name,author_email,status,doc_title'
		# 決裁者、決裁日時を追加
		#export_line += '#command,created_date,template_name,author_name,author_email,status,doc_no,doc_title'
		# 申請CSV項目追加：doc_id, submit_dateを追加 2017.09.06
		#export_line += '#command,created_date,template_name,author_name,author_email,status,final_approver_or_rejector_name,final_approver_or_rejector_email,final_approved_or_rejected_date,doc_no,doc_title'
		export_line += '#command,created_date,submit_date,template_name,author_name,author_email,status,final_approver_or_rejector_name,final_approver_or_rejector_email,final_approved_or_rejected_date,doc_id,doc_no,doc_title'
		for column_name in column_list:
			key = str(column_name)
			if key != 'doc_no' and key != 'doc_title':
				export_line += ',' + column_name
		export_line += '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line

	def _exportDocRow(self, row_doc, column_list, csv_fileencoding=None, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		export_lines = []
		# command
		export_lines.append('IU')
		# created_date
		export_lines.append(sateraito_func.toShortLocalTime(row_doc.created_date, timezone=timezone))
		# submit_date 追加 2017.09.06
		if row_doc.status == sateraito_db.DOC_STATUS_DRAFT:
			export_lines.append('')
		else:
			export_lines.append(sateraito_func.toShortLocalTime(row_doc.submit_date, timezone=timezone))
		# template_name
		export_lines.append(sateraito_func.escapeForCsv(row_doc.template_name))
		# author_name
		export_lines.append(sateraito_func.escapeForCsv(row_doc.author_name))
		# author_email
		export_lines.append(sateraito_func.escapeForCsv(row_doc.author_email))
		# status
		export_lines.append(sateraito_func.escapeForCsv(row_doc.status))
		# final_approver_or_rejector_name
		export_lines.append(sateraito_func.escapeForCsv(row_doc.final_approver_or_rejector_name))
		# final_approver_or_rejector_email
		export_lines.append(sateraito_func.escapeForCsv(row_doc.final_approver_or_rejector_email))
		# final_approved_or_rejected_date
		export_lines.append(sateraito_func.escapeForCsv(sateraito_func.toShortLocalTime(row_doc.final_approved_or_rejected_date, timezone=timezone) if row_doc.final_approved_or_rejected_date is not None else ''))
		# doc_id 追加 2017.09.06
		export_lines.append(sateraito_func.escapeForCsv(row_doc.doc_id))
		# doc_no
		export_lines.append(sateraito_func.escapeForCsv(row_doc.doc_no))
		# doc_title
		export_lines.append(sateraito_func.escapeForCsv(row_doc.doc_title))
		# other doc values
		doc_values = json.JSONDecoder().decode(row_doc.doc_values)
		for column_name in column_list:
			key = str(column_name)
			if key != 'doc_no' and key != 'doc_title':
				if doc_values.has_key(key):
					#export_line += ',' + sateraito_func.escapeForCsv(str(doc_values[key]))
					export_lines.append(sateraito_func.escapeForCsv(doc_values[key]))
				else:
					export_lines.append('')
				
		export_line = ','.join(export_lines) + '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line

##############################################################
# CSV作成処理タスクキュー：抽象クラス（ユーザ用）
##############################################################
class _TqExportUserCsv(_TqExportCsv):
	def _exportUserHeader(self, csv_fileencoding=None):
		export_line = sateraito_db.UserInfo.getExportCsvHeader()
		#export_line += '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line

	def _exportUserRow(self, row, csv_fileencoding=None):
		export_lines = []
		export_lines.append(u'IU')
		export_lines.append(sateraito_func.escapeForCsv(row.email))
		export_lines.append(sateraito_func.escapeForCsv(row.family_name))
		export_lines.append(sateraito_func.escapeForCsv(row.given_name))
		export_lines.append(sateraito_func.escapeForCsv(row.department_1))
		export_lines.append(sateraito_func.escapeForCsv(row.department_2))
		export_lines.append(sateraito_func.escapeForCsv(row.department_3))
		export_lines.append(sateraito_func.escapeForCsv(row.department_4))
		export_lines.append(sateraito_func.escapeForCsv(row.department_5))
		export_lines.append(sateraito_func.escapeForCsv(row.job_title))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_1))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_2))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_3))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_4))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_5))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_6))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_7))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_8))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_9))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_10))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_11))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_12))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_13))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_14))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_15))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_16))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_17))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_18))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_19))
		export_lines.append(sateraito_func.escapeForCsv(row.boss_email_20))
		export_lines.append(sateraito_func.escapeForCsv(row.employee_id))
		export_lines.append(sateraito_func.escapeForCsv(row.user_attribute_1))
		export_lines.append(sateraito_func.escapeForCsv(row.user_attribute_2))
		export_lines.append(sateraito_func.escapeForCsv(row.user_attribute_3))
		export_lines.append(sateraito_func.escapeForCsv(row.user_attribute_4))
		export_lines.append(sateraito_func.escapeForCsv(row.user_attribute_5))
		export_lines.append(sateraito_func.escapeForCsv(' '.join(row.workflow_groups)))
		export_lines.append(sateraito_func.escapeForCsv(' '.join(row.deputy_approvers)))
		export_lines.append(sateraito_func.escapeForCsv(' '.join(row.ghost_writers)))
		# 兼務対応（リリース時にコメントアウト外す）
		# 兼務対応
		export_lines.append(sateraito_func.escapeForCsv(' '.join(row.concurrent_users)))
		export_lines.append(sateraito_func.escapeForCsv(row.language))
		export_lines.append(sateraito_func.escapeForCsv(row.timezone))
		export_lines.append(sateraito_func.escapeForCsv(row.primary_email))	# プライマリメールアドレス対応 2017.01.19
		export_line = ','.join(export_lines) + '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line

##############################################################
# 承認グループ対応：CSV作成処理タスクキュー：抽象クラス（承認グループ用）k
##############################################################
class _TqExportApproverGroupCsv(_TqExportCsv):
	def _exportApproverGroupHeader(self, csv_fileencoding=None):
		export_line = 'command,group_id,approvers,updated_date,comment'
		export_line += '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line

	def _exportApproverGroupRow(self, row, csv_fileencoding=None):
		export_lines = []
		export_lines.append(u'IU')
		export_lines.append(sateraito_func.escapeForCsv(row.group_id))
		export_lines.append(sateraito_func.escapeForCsv(' '.join(row.approvers)))
		export_lines.append(sateraito_func.escapeForCsv(str(sateraito_func.toLocalTime(row.updated_date))))
		export_lines.append(sateraito_func.escapeForCsv(row.comment))
		export_line = ','.join(export_lines) + '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line


##############################################################
# CSV作成処理タスクキュー：抽象クラス（マスター用）
##############################################################
class _TqExportMasterCsv(_TqExportCsv):
	def _exportMasterHeader(self, csv_fileencoding=None):
		export_line = 'command,master_code,data_key,attribute_1,attribute_2,attribute_3,attribute_4,attribute_5,attribute_6,attribute_7,attribute_8,attribute_9,attribute_10,attribute_11,attribute_12,attribute_13,attribute_14,attribute_15,attribute_16,attribute_17,attribute_18,attribute_19,attribute_20,attribute_21,attribute_22,attribute_23,attribute_24,attribute_25,attribute_26,attribute_27,attribute_28,attribute_29,attribute_30,attribute_31,attribute_32,attribute_33,attribute_34,attribute_35,attribute_36,attribute_37,attribute_38,attribute_39,attribute_40,attribute_41,attribute_42,attribute_43,attribute_44,attribute_45,attribute_46,attribute_47,attribute_48,attribute_49,attribute_50,comment'
		export_line += '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line

	def _exportMasterRow(self, row, csv_fileencoding=None):
		export_lines = []
		export_lines.append(u'IU')
		export_lines.append(sateraito_func.escapeForCsv(row.master_code))
		export_lines.append(sateraito_func.escapeForCsv(row.data_key))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_1))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_2))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_3))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_4))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_5))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_6))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_7))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_8))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_9))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_10))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_11))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_12))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_13))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_14))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_15))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_16))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_17))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_18))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_19))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_20))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_21))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_22))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_23))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_24))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_25))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_26))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_27))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_28))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_29))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_30))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_31))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_32))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_33))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_34))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_35))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_36))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_37))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_38))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_39))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_40))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_41))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_42))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_43))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_44))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_45))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_46))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_47))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_48))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_49))
		export_lines.append(sateraito_func.escapeForCsv(row.attribute_50))
		export_lines.append(sateraito_func.escapeForCsv(row.comment))
		export_line = ','.join(export_lines) + '\r\n'
		export_line = sateraito_func.washErrorChar(export_line, sateraito_func.getFileEncoding(csv_fileencoding))
		return export_line


class _APIPage(webapp2.RequestHandler):

	def create_request_token(self):
		return UcfUtil.guid()


#	def checkAccessIPAddress(self, accept_ip_address_list, deny_ip_address_list=None):
#		''' アクセスIPアドレスをチェック '''
#		return UcfUtil.isCheckIPAddressRange(self.getClientIPAddress(), accept_ip_address_list, deny_ip_address_list)


	# ドメイン情報取得＆チェックキーチェック
	def checkCheckKey(self, tenant):
		old_namespace = namespace_manager.get_namespace()
		sateraito_func.setNamespace(tenant, '')
		is_ok = False
		check_key = self.request.get('check_key')
		application_id = self.request.get('application_id')

		# テナントエントリー取得
		q = sateraito_db.TenantEntry.all()
		q.filter('tenant =', tenant.lower())
		tenant_row = q.get()
		if tenant_row is not None:

			# MD5SuffixKey
			md5_suffix_key = tenant_row.md5_suffix_key if tenant_row.md5_suffix_key is not None else ''

			# チェックキーチェック
			if tenant != '' and check_key != '' and md5_suffix_key != '':
				tenant = tenant.lower()
				domain_check_keys = []
				now = UcfUtil.getNow()	# 標準時
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -5).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -4).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -3).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -2).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -1).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + now.strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 1).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 2).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 3).strftime('%Y%m%d%H%M') + md5_suffix_key))
				domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 4).strftime('%Y%m%d%H%M') + md5_suffix_key))

				is_ok = False
				for domain_check_key in domain_check_keys:
					if domain_check_key.lower() == check_key.lower():
						is_ok = True
						break
		namespace_manager.set_namespace(old_namespace)
		return is_ok, tenant_row
		
	def outputErrorLog(self, e):
		try:
			logging.exception(e)
			exc_type, exc_value, exc_traceback = sys.exc_info()
			logging.error(repr(traceback.format_exception(exc_type, exc_value, exc_traceback)))
		except BaseException, ex:
			logging.exception(ex)
			logging.exception(e)



class _PublicAPIPage(webapp2.RequestHandler):

#	def checkAccessIPAddress(self, accept_ip_address_list, deny_ip_address_list=None):
#		''' アクセスIPアドレスをチェック '''
#		return UcfUtil.isCheckIPAddressRange(self.getClientIPAddress(), accept_ip_address_list, deny_ip_address_list)

	def outputResult(self, return_code, error_code, error_msg, params=None):
		results = {} if params is None else params
		results['code'] = return_code
		results['error_code'] = error_code
		results['error_msg'] = error_msg
		if return_code != 0:
			logging.info(results)
		self.response.out.write(json.JSONEncoder().encode(results))

	def outputErrorLog(self, e):
		try:
			logging.exception(e)
			exc_type, exc_value, exc_traceback = sys.exc_info()
			logging.error(repr(traceback.format_exception(exc_type, exc_value, exc_traceback)))
		except BaseException, ex:
			logging.exception(ex)
			logging.exception(e)

	# ワークフロー管理者かどうかを判定
	def isWorkflowAdmin(self, user_email, tenant):
		return sateraito_func.isWorkflowAdmin(user_email, tenant)

	# アクセストークンを作成
	def createNewAccessToken(self, tenant):

		# いくつか情報を含めつつ、BASE64エンコード（api_key、impersonate_emailはセキュリティを考慮してセットしない）
		access_token = UcfUtil.base64Encode(tenant) + sateraito_func.dateString() + sateraito_func.randomString()
		return UcfUtil.base64Encode(access_token)

	# アクセストークンをチェック（同時に利用回数をカウントアップ）
	def checkAccessToken(self, tenant, access_token):
		is_ok = False
		error_code = ''
		token_entry = sateraito_db.APIAccessToken.getInstance(tenant, access_token)
		if token_entry is None:
			is_ok = False
			error_code = 'invalid_access_token'
		elif token_entry.token_expire_date < datetime.datetime.now():
			error_code = 'access_token_expire'
			is_ok = False
		else:
			is_ok = True

		if token_entry is not None:
			if is_ok:
				token_entry.num_auth = token_entry.num_auth + 1
			else:
				token_entry.num_auth_failed = token_entry.num_auth_failed + 1
			token_entry.updated_date = datetime.datetime.now()
			token_entry.put()
		return is_ok, error_code

