# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
import json
from ucf.utils.models import ExcelTemplateFile, ExcelTemplateValue
import cloudstorage
from google.appengine.api import urlfetch, app_identity
from ucf.utils.ucfutil import UcfUtil
from google.appengine.ext import blobstore


_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'
class Page(TenantAppHelper):

	def post(self, tenant):
		self._tenant = tenant
		self.setTenant(tenant)

		try:

			unique_id = self.request.get('unique_id')
			print(unique_id)
			ExcelTemplateFile.deleteByUniqueId(unique_id)
			ExcelTemplateValue.deleteByFileId(unique_id)

			jsondata = {
				'status': True,
				'unique_id': unique_id
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

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/delete_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))