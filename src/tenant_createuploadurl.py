# coding: utf-8

import webapp2,logging
from google.appengine.ext import blobstore
from ucf.utils.helpers import *
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc

class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		try:
			upload_url = blobstore.create_upload_url(self.getRequest('upload_url'))

			ret_value = {
				'url':upload_url
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)