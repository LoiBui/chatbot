# coding: utf-8

import webapp2, logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
from ucf.utils.models import *
import sateraito_inc
import sateraito_func

_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'


class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		try:
			if not self.isValidTenant(not_redirect=True):
				self._code = 400
				self._msg = self.getMsg('MSG_NOT_INSTALLED', (self._tenant))
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
			unique_id = req['more_config_unqid']
			ip_address = req['ip_address'].split(',')
			sort_order = req['sort_order']
			
			FAQMoreConfig.updateMoreConfig(unique_id, sort_order, ip_address)
			
			operation_log_detail = req
			UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(),
									  UcfConfig.SCREEN_DASHBOARD, UcfConfig.OPERATION_TYPE_MODIFY_MORE_CONFIG, '', '',
									  self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))
			
			self._code = 0
			self.responseAjaxResult()
		
		except BaseException, e:
			self.outputErrorLog(e)
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode,
							  config=sateraito_func.wsgi_config)
