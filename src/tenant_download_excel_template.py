# coding: utf-8

import logging
import webapp2
from ucf.utils.helpers import *
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
from ucf.utils.models import *
import urllib2
from openpyxl import load_workbook
import StringIO
from openpyxl.writer.excel import save_virtual_workbook
import lineworks_func
from google.appengine.api import namespace_manager
import json

class Page(TenantAppHelper):

	def get(self):
		try:
			type = self.request.get("type").strip()
			tenant = self.request.get("tenant")
			self._tenant = tenant
			namespace_manager.set_namespace(tenant.lower())


			session = self.request.get("session")

			# get answer 
			q = AnswerUser.query()
			q = q.filter(AnswerUser.unique_id == session)

			answer = None

			for entry in q.iter(limit=20, offset=0):
				vo = entry.exchangeVo('Asia/Tokyo')
				list_vo = {}
				for k,v in vo.iteritems():
					if k in ['excel_blob', 'file_id', 'lineworks_id', 'pdf_blob', 'rule_id', 'value', 'sheet']:
						list_vo[k] = v
				answer = list_vo


			# get file 
			q = ExcelTemplateFile.query()
			q = q.filter(ExcelTemplateFile.unique_id == answer['file_id'])
			file = None

			for entry in q.iter(limit=20, offset=0):
				vo = entry.exchangeVo('Asia/Tokyo')
				list_vo = {}
				for k,v in vo.iteritems():
					if k in ['blob_store']:
						list_vo[k] = v
				file = list_vo

			if type == 'excel':
				data = urllib2.urlopen(sateraito_inc.my_site_url + "/tenant/template/download?blob_key="+file['blob_store'])
				xlsx = data.read()
				wb = load_workbook(StringIO.StringIO(xlsx))
				wb.active = int(answer['sheet'])
				ws = wb.active

				val = json.loads(answer['value'])
				for item in val:
					ques = lineworks_func.findQuestionByAlias(item)
					if ques['location'].strip() != '':
						ws[ques['location']] = val[item]
				
				
				self.response.headers['content-type'] = 'application/pdf'
				self.response.headers['Content-Disposition'] = 'attachment; filename=file.xlsx'
				self.response.out.write(save_virtual_workbook(wb))
			elif type == 'pdf':
				self.response.out.write('<h1 style="text-align: center;">Pending !!!</h1>')
		except:
			self.response.out.write('<h1 style="text-align: center;">Something went wrong !!!</h1>')	
		

app = ndb.toplevel(webapp2.WSGIApplication([('/tenant/template/download_excel', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))