#!/usr/bin/python
# coding: utf-8

import webapp2,logging
from google.appengine.api import namespace_manager
from simplejson.decoder import JSONDecoder

from ucf.utils.helpers import *
from ucf.utils.models import UCFMDLOperator, UCFMDLProfile
from ucf.utils import loginfunc
from ucf.pages.operator import OperatorUtils
from ucf.pages.profile import ProfileUtils
import sateraito_inc
import sateraito_func

##############################
# ログイン関連：ユーザ情報を更新
##############################
class QueueUpdateUserForLoginPage(TenantTaskHelper):

	def processOfRequest(self, tenant, token):
		self._approot_path = os.path.dirname(__file__)

		# エラーが3回おきたら処理を終了する
		if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 3):
			logging.error('error over_3_times. tenant is ' + tenant)
			return

		# テナントの最終利用年月を更新（SSOの場合、DomainEntryはネームスペースなしなのでここで処理）
		is_updated = sateraito_func.updateDomainLastLoginMonth(tenant)

		namespace_manager.set_namespace(tenant)

		isLogin = UcfUtil.toBool(self.getRequest('isLogin'))
		isTemporaryLogin = UcfUtil.toBool(self.getRequest('isTemporaryLogin'))
		isAuthSuccess = UcfUtil.toBool(self.getRequest('isAuthSuccess'))
		isClearTwoFactorAuthInfo = UcfUtil.toBool(self.getRequest('isClearTwoFactorAuthInfo'))
		user_unique_id = self.getRequest('user_unique_id')
		profile_unique_id = self.getRequest('profile_unique_id')
		login_auth_type = self.getRequest('login_auth_type')
		is_auto_login = UcfUtil.toBool(self.getRequest('is_auto_login'))
		login_id = self.getRequest('login_id')
		login_name = self.getRequest('login_name')
		login_access_authority = self.getRequest('login_access_authority')
		login_email = self.getRequest('login_email')
		login_password = self.getRequest('login_password')
		is_set_next_auto_login = UcfUtil.toBool(self.getRequest('is_set_next_auto_login'))
		is_not_update_login_history = UcfUtil.toBool(self.getRequest('is_not_update_login_history'))
		mobile_device_id_deal_type = self.getRequest('mobile_device_id_deal_type')
		mobile_device_id = self.getRequest('mobile_device_id')
		use_access_apply_unique_id = self.getRequest('use_access_apply_unique_id')

		logging.info('login_id=' + login_id)
		logging.info('user_unique_id=' + user_unique_id)
		logging.info('isLogin=' + str(isLogin))
		logging.info('isAuthSuccess=' + str(isAuthSuccess))
		logging.info('login_auth_type=' + login_auth_type)
		logging.info('is_auto_login=' + str(is_auto_login))
		logging.info('isTemporaryLogin=' + str(isTemporaryLogin))
		logging.info('isClearTwoFactorAuthInfo=' + str(isClearTwoFactorAuthInfo))
		logging.info('use_access_apply_unique_id=' + use_access_apply_unique_id)

		profile_vo = None
		if profile_unique_id and profile_unique_id != '':
			query = UCFMDLProfile.all()
			query.filter('unique_id =', profile_unique_id)
			entry = query.get()
			if entry is not None:
				profile_vo = entry.exchangeVo(self._timezone)
				ProfileUtils.editVoForSelect(self, profile_vo)

		# ログイン回数情報などを更新
		if not isTemporaryLogin:
			loginfunc.updateUserForLogin(self, isLogin, isAuthSuccess, user_unique_id, profile_vo, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, is_not_update_login_history, mobile_device_id_deal_type, mobile_device_id, use_access_apply_unique_id)

		# 二要素認証コードをクリア
		if isClearTwoFactorAuthInfo:
			ucffunc.clearActiveTwoFactorAuthEntry(user_unique_id)

class QueueInsertLoginHistoryPage(TenantTaskHelper):

	def processOfRequest(self, tenant, token):
		self._approot_path = os.path.dirname(__file__)

		# エラーが3回おきたら処理を終了する
		if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 3):
			logging.error('error over_3_times. tenant is ' + tenant)
			return

		namespace_manager.set_namespace(tenant)

		isLogin = UcfUtil.toBool(self.getRequest('isLogin'))
		isAuthSuccess = UcfUtil.toBool(self.getRequest('isAuthSuccess'))
		user_unique_id = self.getRequest('user_unique_id')
		user_operator_id = self.getRequest('user_operator_id')
		profile_unique_id = self.getRequest('profile_unique_id')
		profile_id = self.getRequest('profile_profile_id')
		target_env = self.getRequest('profile_target_env')

		error_code = self.getRequest('error_code')
		log_text = self.getRequest('log_text')
		career_type = self.getRequest('career_type')
		x_forwarded_for_ipaddress = self.getRequest('x_forwarded_for_ipaddress')
		user_agent = self.getRequest('user_agent')
		client_ipaddress = self.getRequest('client_ipaddress')
		mobile_user_id = self.getRequest('mobile_user_id')
		mobile_device_id = self.getRequest('mobile_device_id')
		use_access_apply_unique_id = self.getRequest('use_access_apply_unique_id')
		management_group = self.getRequest('management_group')

		login_auth_type = self.getRequest('login_auth_type')
		is_auto_login = UcfUtil.toBool(self.getRequest('is_auto_login'))
		login_id = self.getRequest('login_id')
		login_name = self.getRequest('login_name')
		login_access_authority = self.getRequest('login_access_authority')
		login_email = self.getRequest('login_email')
		login_password = self.getRequest('login_password')
		is_set_next_auto_login = UcfUtil.toBool(self.getRequest('is_set_next_auto_login'))

		# クライアント証明書認証情報を追加
		client_cert_code = self.getRequest('client_cert_code')
		client_cert_subjectkey = self.getRequest('client_cert_subjectkey')
		client_cert_subject = self.getRequest('client_cert_subject')

		loginfunc.insertLoginHistory(self, isLogin, isAuthSuccess, error_code, log_text, career_type, x_forwarded_for_ipaddress, user_agent, client_ipaddress, mobile_user_id, mobile_device_id, use_access_apply_unique_id, user_unique_id, user_operator_id, profile_unique_id, profile_id, target_env, login_auth_type, is_auto_login, login_id, login_name, login_access_authority, login_email, login_password, is_set_next_auto_login, management_group, client_cert_code=client_cert_code, client_cert_subjectkey=client_cert_subjectkey, client_cert_subject=client_cert_subject)

app = webapp2.WSGIApplication([('/a/([^/]*)/openid/([^/]*)/update_user_for_login', QueueUpdateUserForLoginPage),('/a/([^/]*)/openid/([^/]*)/insert_login_history', QueueInsertLoginHistoryPage)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)