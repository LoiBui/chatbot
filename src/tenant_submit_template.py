# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
import json
from ucf.utils.models import ExcelTemplateFile, ExcelTemplateValue

_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'
class Page(TenantAppHelper):

	def post(self, tenant):
		self._tenant = tenant
		self.setTenant(tenant)

		try:
			uidFile = ExcelTemplateFile.save(tenant, self.request.get('file'), self.request.get('filename'), self.request.get('display_name'))
			vo = {}
			vo['display_name'] = self.request.get('display_name')
			vo['unique_id'] = uidFile
			ExcelTemplateFile.addBueinssFileToTextSearchIndex(vo)

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
			print(123454)
			print(e)
			jsondata = {
				'status': False
			}
			jsondata_str = json.JSONEncoder().encode(jsondata)
			self.response.out.write(jsondata_str)
			pass

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/submit_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))