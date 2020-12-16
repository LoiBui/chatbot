# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc

class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		try:
			if self.isValidTenant(not_redirect=True) == False:
				self._code = 400
				self._msg = self.getMsg('MSG_NOT_INSTALLED', (self._tenant))
				self.responseAjaxResult()
				return

			if loginfunc.checkLogin(self, not_redirect=True) == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_redirect=True)
			if is_select_ok == False:
				self._code = 403
				self._msg = error_msg
				self.responseAjaxResult()
				return

#			if self.isAdmin() == False:
#				self._code = 403
#				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
#				self.responseAjaxResult(ret_value)
#				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			leftmenu_class = UcfUtil.nvl(self.getRequest('leftmenu_class'))

			# エラーを返す
			if leftmenu_class == '':
				self._code = 100
				self._msg = self.getMsg('MSG_INVALID_PARAMETER', ('leftmenu_class'))
				self.responseAjaxResult()
				return

			# Cookieにセット
			self.setCookie(UcfConfig.COOKIEKEY_LEFTMENUCLASS, leftmenu_class)
			self._code = 0
			self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)