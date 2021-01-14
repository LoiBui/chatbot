# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
from google.appengine.ext import blobstore

_gnaviid = 'TEMPLATE'
_leftmenuid = 'ADD'
class Page(TenantAppHelper):

  def processOfRequest(self, tenant):
		try:

			blobstore_url = sateraito_inc.my_site_url + '/tenant/blobstore/save'
			url = blobstore.create_upload_url(blobstore_url)

			ucfp = UcfTenantParameter(self)
			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATIONLOG_HEADER')]

			template_vals = {
				'ucfp' : ucfp,
				'url' : url
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('template_add.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/add_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))