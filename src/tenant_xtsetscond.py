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

			# ���O�C�����̊e������擾���`�F�b�N
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

			# Request����vo�ɃZ�b�g
			req = UcfVoInfo.setRequestToVo(self)
			logging.info(req)

			# �Z�b�V�����L�[
			session_key = UcfUtil.nvl(self.getRequest(UcfConfig.REQUESTKEY_SESSION_SCID))

			# �G���[��Ԃ�
			if session_key == '':
				self._code = 100
				self._msg = self.getMsg('MSG_INVALID_PARAMETER', (UcfConfig.REQUESTKEY_SESSION_SCID))
				self.responseAjaxResult()
				return

			scond = req	# TODO

			# �����������Z�b�g
			self.setSession(UcfConfig.SESSIONKEY_PREFIX_SEARCHCOND + session_key, scond)
			self._code = 0
			self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)