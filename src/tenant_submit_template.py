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
			# blobstore_url = sateraito_inc.my_site_url + '/tenant/blobstore/save'
			# logging.debug(blobstore_url)

			# content_type, body = sateraito_func.encode_multipart_formdata([], [('resourceName', 'linewoks_richmenu.xlsx', self.request.get('file'))])
			
			# responseBlobstore = urlfetch.fetch(
			# 	url=blobstore.create_upload_url(blobstore_url),
			# 	payload=body,
			# 	method=urlfetch.POST,
			# 	headers={'Content-Type': content_type},
			# 	deadline=3000
            # )
			# file_blobstore_id = responseBlobstore.content
			# logging.info(file_blobstore_id)

			# jsondata = {
			# 	'status': False
			# }
			# jsondata_str = json.JSONEncoder().encode(jsondata)
			# self.response.out.write(jsondata_str)

			uidFile = ExcelTemplateFile.save(tenant, '11111111111111111111', self.request.get('filename'))

			sheet = json.loads(self.request.get('sheet'))
			sheetName = json.loads(self.request.get('sheetName'))
			
			indexParent = 0
			for item in sheet:
				index = 0
				for i in item['question']:
					ExcelTemplateValue.save(uidFile, item['question'][index], item['location'][index], item['require'][index], item['value'][index], item['default'][index], str(indexParent), sheetName[indexParent][1])
					index += 1
				indexParent += 1

			jsondata = {
				'status': True
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

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/submit_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))