# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.config.ucfconfig import UcfConfig
import sateraito_inc
import sateraito_func

#############
# CSRF�΍�g�[�N���𔭍s�cJavaScript��POST����@�\�̂����A�t�@�C���A�b�v���[�h�n�̕����Ŏg�p
#
class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):

		try:
			# CSRF�΍�:�g�[�N�����s
			token = self.createAccessToken(UcfConfig.CSRF_GENERAL_TOKEN_KEY)
			# �I�y���[�V�������O�̂��߂Ƀg�[�N�����L�[��IP�A�h���X��ۑ����Ă����i�኱����̍�j2015.07.31
			self.setSession(UcfConfig.SESSIONKEY_CLIENTIP + '_' + token, self.getClientIPAddress())

			ret_value = {
				'token':token
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)