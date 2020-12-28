# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
from ucf.utils.models import *
from google.appengine.api import namespace_manager
import json
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore


_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'
class Page(TenantAppHelper, blobstore_handlers.BlobstoreDownloadHandler):

	def get(self):
		try:
			# http://localhost:8080/tenant/template/download?blob_key=qfNpPCvyiFF2Jz3gOlWTJw==
			blob_key = self.request.get('blob_key')
			blob_info = blobstore.BlobInfo.get(blob_key)
			file_name = blob_info.filename
			self.send_blob(blob_info, save_as=file_name)
			print(1111111111111111)
		except:
			print(1111111111111111)
			return 11111111111111
			pass
		

app = ndb.toplevel(webapp2.WSGIApplication([('/tenant/template/download', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))