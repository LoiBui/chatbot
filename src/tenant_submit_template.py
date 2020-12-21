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
			uidFile = ExcelTemplateFile.save(tenant, '11111111111111111111', self.request.get('filename'))

			sheet = json.loads(self.request.get('sheet'))
			for item in sheet:
				index = 0
				for i in item['question']:
					ExcelTemplateValue.save(uidFile, item['question'][index], item['location'][index], item['require'][index], item['value'][index], item['default'][index])
					index += 1

			jsondata = {
				'status': True
			}
			jsondata_str = json.JSONEncoder().encode(jsondata)
			self.response.out.write(jsondata_str)

		except BaseException as e:
			jsondata = {
				'status': False
			}
			jsondata_str = json.JSONEncoder().encode(jsondata)
			self.response.out.write(jsondata_str)
			pass

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/submit_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))