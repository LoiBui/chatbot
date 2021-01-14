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
_gnaviid = 'TEMPLATE'
_leftmenuid = 'INDEX'
class Page(TenantAppHelper):

	def processOfRequest(self, tenant):
		self._tenant = tenant
		namespace_manager.set_namespace(tenant.lower())
		try:
			req = UcfVoInfo.setRequestToVo(self)
			unique_id = UcfUtil.getHashStr(req, UcfConfig.QSTRING_UNIQUEID)
			
			q = ExcelTemplateValue.query()
			q = q.filter(ExcelTemplateValue.file_id == unique_id.lower())

			fileValue = []

			for entry in q.iter(limit=20, offset=0):
				vo = entry.exchangeVo(self._timezone)
				list_vo = {}
				for k,v in vo.iteritems():
					if k in ['unique_id', 'default', 'file_id', 'location', 'question', 'require', 'sheet', 'value', 'created_date', 'sheet_name']:
						list_vo[k] = v
				fileValue.append(list_vo)

			
			q = ExcelTemplateFile.query()
			q = q.filter(ExcelTemplateFile.unique_id == unique_id.lower())

			file = []

			for entry in q.iter(limit=20, offset=0):
				vo = entry.exchangeVo(self._timezone)
				list_vo = {}
				for k,v in vo.iteritems():
					if k in ['blob_store', 'filename', 'display_name']:
						list_vo[k] = v
				file = list_vo

			if len(file) == 0:
				raise e


			ucfp = UcfTenantParameter(self)
			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATIONLOG_HEADER')]

			template_vals = {
				'ucfp' : ucfp,
				'fileValue': json.JSONEncoder().encode(fileValue),
				'file': json.JSONEncoder().encode(file),
				'unique_id': unique_id
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('template_edit.html', self._design_type, template_vals)
		except BaseException as e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/edit_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))