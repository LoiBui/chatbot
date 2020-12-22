# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
import json
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore



class Page(TenantAppHelper, blobstore_handlers.BlobstoreDownloadHandler):

	def post(self, tenant):
		try:
			blob_store = self.request.get('blob_store')
			blob_info = blobstore.BlobInfo.get(blob_store)
			self.send_blob(blob_info)

		except BaseException as e:
			print(e)
			jsondata = {
				'status': False
			}
			jsondata_str = json.JSONEncoder().encode(jsondata)
			self.response.out.write(jsondata_str)
			pass

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/get_file_blob', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))