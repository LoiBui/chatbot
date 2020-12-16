# coding: utf-8

import webapp2, logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
from ucf.utils.models import *
import sateraito_inc
import sateraito_func
import directcloudbox_func

_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'


class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		try:
			if not self.isValidTenant(not_redirect=True):
				self._code = 400
				self._msg = self.getMsg('MSG_NOT_INSTALLED', self._tenant)
				self.responseAjaxResult()
				return
			
			if not loginfunc.checkLogin(self, not_redirect=True):
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return
			
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_redirect=True)
			if not is_select_ok:
				self._code = 403
				self._msg = error_msg
				self.responseAjaxResult()
				return
			
			if not self.isAdmin():
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return
			
			# Javascriptから、パラメータ取得
			req = UcfVoInfo.setRequestToVo(self)
			
			unique_id = req['unique_id']
			if unique_id == '':
				unique_id = UcfUtil.guid()
				
			platform = req['platform']
			is_saved = True if req['is_saved'] == '1' else False
			
			if platform == 'directcloudbox':
				code = req['code']
				uid = req['uid']
				password = req['password']
				
				check_access_token = directcloudbox_func.checkAccessToken(unique_id, code, uid, password, is_saved)
				if check_access_token == 0:
					self._code = 401
					self._msg = self.getMsg('ERR_DIRECT_CLOUD_BOX_ACCOUNT_INVALID1')
					self.responseAjaxResult()
					return
				elif check_access_token == 1:
					self._code = 500
					self._msg = self.getMsg('ERR_FAILED_TO_CALL_API')
					self.responseAjaxResult()
					return
				elif check_access_token == 2:
					self._code = 500
					self._msg = self.getMsg('ERR_DIRECT_CLOUD_BOX_ACCOUNT_INVALID2')
					self.responseAjaxResult()
					return
			
			operation_log_detail = req
			UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(),
									  UcfConfig.SCREEN_DASHBOARD, UcfConfig.OPERATION_TYPE_MODIFY_DIRECTCLOUDBOX_CONFIG,
									  '', '', self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))
			
			self._code = 0
			ret_value = {
				'unique_id': unique_id
			}
			self.responseAjaxResult(ret_value)
		
		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode,
							  config=sateraito_func.wsgi_config)
