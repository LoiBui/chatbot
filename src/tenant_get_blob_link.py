# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
from google.appengine.ext import blobstore
import json

_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'
class Page(TenantAppHelper):

	def get(self, tenant):
		try:
			blobstore_url = sateraito_inc.my_site_url + '/tenant/blobstore/save'
			url = blobstore.create_upload_url(blobstore_url)

			jsondata = {
				'status': True,
				'url': url
			}
			jsondata_str = json.JSONEncoder().encode(jsondata)
			self.response.out.write(jsondata_str)

		except BaseException as e:
			print(e)
			jsondata = {
				'status': False
			}
			jsondata_str = json.JSONEncoder().encode(jsondata)
			self.response.out.write(jsondata_str)
			pass

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/get_blob_link', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))