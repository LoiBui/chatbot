#!/usr/bin/python
# coding: utf-8

import os
import webapp2,logging
from ucf.utils.models import *
from ucf.utils.helpers import *
from ucf.utils.validates import BaseValidator
from ucf.utils.mailutil import UcfMailUtil
from ucf.pages.operator import OperatorUtils
import sateraito_inc
import sateraito_func
import oem_func

class _Page(webapp2.RequestHandler):

	def process(self, oem_company_code, sp_code):
		try:
		
			# ���������iCookie�̒l���l���j
			hl_from_cookie = self.getCookie('hl')
			logging.info('hl_from_cookie=' + str(hl_from_cookie))
			if hl_from_cookie is not None and hl_from_cookie in sateraito_func.ACTIVE_LANGUAGES:
				self._language = hl_from_cookie
			# ����ꗗ
			language_list = []
			for language in sateraito_func.ACTIVE_LANGUAGES:
				language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])

			ucfp = UcfFrontParameter(self)

			tenant = self.getRequest('tenant')
			tenant_top_url = oem_func.getMySiteUrl(oem_company_code) + '/a/' + tenant + '/'
			template_vals = {
				'oem_company_code':oem_company_code,
				'sp_code':sp_code,
				'ucfp' : ucfp,
				'tenant_top_url':tenant_top_url,
				'footer_message':self.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ()),
				'language_list':JSONEncoder().encode(language_list)
			}

			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('contract_thanks.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

class Page(ContractFrontHelper, _Page):
	def processOfRequest(self, oem_company_code):
		self._approot_path = os.path.dirname(__file__)

		# OEM�R�[�h�`�F�b�N
		if not oem_func.isValidOEMCompanyCode(oem_company_code):
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
			return

		self.process(oem_company_code, '')

class SPPage(ContractSPFrontHelper, _Page):
	def processOfRequest(self, oem_company_code, sp_code):
		self._approot_path = os.path.dirname(__file__)

		# OEM�R�[�h�`�F�b�N
		if not oem_func.isValidOEMCompanyCode(oem_company_code):
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
			return

		# SP�R�[�h�`�F�b�N
		if not oem_func.isValidSPCode(oem_company_code, sp_code):
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
			return

		self.process(oem_company_code, sp_code)

app = webapp2.WSGIApplication([
                               (r'/([^/]*)/contract/thanks', Page),
                               (r'/([^/]*)/([^/]*)/contract/thanks', SPPage),
                              ], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
