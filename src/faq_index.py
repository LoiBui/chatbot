# coding: utf-8
import webapp2, json, logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from google.appengine.api import namespace_manager
import sateraito_inc
import sateraito_func
import sateraito_page
import master_helper
import oem_func


class Page(sateraito_page._BasePage):
	def processOfRequest(self):
		try:
			# set namespace
			logging.debug(namespace_manager.get_namespace())
			key = UcfUtil.md5('') + 'tenant'
			logging.debug(key)
			# tenant = self.getSession(key)
			tenant = self.session.get(key)
		
			logging.debug(tenant)
		
			# namespace_manager.set_namespace(tenant.lower())
			#
			# self._approot_path = os.path.dirname(__file__)
			# if not self.isValidTenant():
			# 	return
			#
			# ucfp = UcfTenantParameter(self)
			#
			# list_category = CategoryMaster.getListCategory(self._timezone)
			# list_faq = FAQMaster.getListFAQ(self._timezone)
			#
			# vo = {
			# 	'list_category': master_helper.json_encode(list_category),
			# 	'list_faq': master_helper.json_encode(list_faq)
			# }
			#
			# ucfp.voinfo.setVo(vo, None, None, self)
			#
			# template_vals = {
			# 	'ucfp': ucfp
			# }
			#
			# self.appendBasicInfoToTemplateVals(template_vals)
			# self.render('faq_index.html', self._design_type, template_vals)
		
		except BaseException, e:
			self.error(str(e))
			# self.outputErrorLog(e)
			# self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return
		
	def get(self):
		self.processOfRequest()

	def post(self):
		self.processOfRequest()


app = webapp2.WSGIApplication([('/faq/index', Page)], debug=sateraito_inc.debug_mode,
							  config=sateraito_func.wsgi_config)
