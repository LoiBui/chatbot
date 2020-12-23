# !/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from google.appengine.api import users
from ucf.utils.helpers import *
import sateraito_inc
import oem_func
import json
import re
import sateraito_func
from google.appengine.api import urlfetch
import base64

from google.appengine.api import taskqueue
from ucf.utils.ucfutil import *

from google.appengine.ext import blobstore

from google.appengine.ext.webapp import blobstore_handlers

# class Page(TenantAppHelper):
class Process(blobstore_handlers.BlobstoreUploadHandler, blobstore_handlers.BlobstoreDownloadHandler):
	def post(self):
		oldBlob = self.request.get('oldBlobStore')
		if not oldBlob or oldBlob != 'null':
			blob_info = blobstore.BlobInfo.get(oldBlob)
			blob_info.delete()


		upload_files = self.get_uploads('file')
		blob_info = upload_files[0]
		self.response.out.write(blob_info.key())

app = webapp2.WSGIApplication([('/tenant/blobstore/save', Process)], debug=sateraito_inc.debug_mode,
							  config=sateraito_func.wsgi_config)











# import os
# import logging
# import webapp2
# from google.appengine.api import users
# from ucf.utils.helpers import *
# import sateraito_inc
# import oem_func
# import json
# import re
# import sateraito_func
# from google.appengine.api import urlfetch
# import base64

# from google.appengine.api import taskqueue
# from ucf.utils.ucfutil import *

# from google.appengine.ext import blobstore

# from google.appengine.ext.webapp import blobstore_handlers

# # class Page(TenantAppHelper):
# class Process(blobstore_handlers.BlobstoreUploadHandler, blobstore_handlers.BlobstoreDownloadHandler):
# 	def post(self):
# 		# logging.info(self.request)
# 		# upload_files = self.get_uploads('file')

# 		# logging.info(type(upload_files))
# 		# logging.info((upload_files))
# 		# blob_info = upload_files[0]
# 		# logging.info('Blob : ' + blob_info.filename)
# 		# logging.info(blob_info.key())
		
# 		blob_info = blobstore.BlobInfo.get('cz8h1npFuITslmxD-yDHWQ==')

# 		self.send_blob(blob_info)
# 		# self.response.out.write(blob_info)

# app = webapp2.WSGIApplication([('/tenant/blobstore/save', Process)], debug=sateraito_inc.debug_mode,
# 							  config=sateraito_func.wsgi_config)