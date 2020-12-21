# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func

_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'
class Page(TenantAppHelper):

  def processOfRequest(self, tenant):
		try:

			ucfp = UcfTenantParameter(self)
			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATIONLOG_HEADER')]

			template_vals = {
				'ucfp' : ucfp,
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('template_add.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/add_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))