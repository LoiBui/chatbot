# coding: utf-8

import logging
import webapp2
from ucf.utils.helpers import *
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func
from ucf.utils.models import AnswerUser, ExcelTemplateFile
import urllib2
from openpyxl import load_workbook
import StringIO
from openpyxl.writer.excel import save_virtual_workbook
import lineworks_func
from google.appengine.api import namespace_manager
import json
import urlfetch
from google.appengine.ext import blobstore
import cloudstorage
from google.appengine.api import app_identity

class Page(TenantAppHelper):

	def get(self):
		# try:
			# type = self.request.get("type").strip()
			# if type == 'pdf':
			# 	url = 'https://788260b5cb47.ngrok.io/?url='+base64.b64decode(self.request.get("url"))
			# 	response = urllib2.urlopen(url)
			# 	html = response.read()
			# 	response = urllib2.urlopen(html)
			# 	html = response.read()

			# 	self.response.headers['content-type'] = 'application/pdf'
			# 	self.response.headers['Content-Disposition'] = 'attachment; filename=file.pdf'
			# 	self.response.out.write(html)
			# 	return 1

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
					if k in ['excel_blob', 'file_id', 'lineworks_id', 'pdf_blob', 'rule_id', 'value', 'sheet', 'unique_id']:
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
			
			
			bucket = app_identity.get_default_gcs_bucket_name()
			filename = '/{0}/{1}'.format(bucket, 'test222222')
			with cloudstorage.open(filename, 'w') as filehandle:
				filehandle.write(save_virtual_workbook(wb))

			# /gs/bucket/object
			blobstore_filename = '/gs{}'.format(filename)
			blob_key = blobstore.BlobKey(blobstore.create_gs_key(blobstore_filename))

			AnswerUser.update(answer['unique_id'], None, blob_key)

			self.response.headers['Content-Type'] = 'application/json'   
			obj = {
				'status': True, 
				'excel': str(blob_key),
				'pdf': None
			} 
			self.response.out.write(json.dumps(obj))
		# except BaseException as e:
		# 	print(e)
		# 	self.response.out.write('<h1 style="text-align: center;">Something went wrong !!!</h1>')	
		

app = ndb.toplevel(webapp2.WSGIApplication([('/tenant/template/download_excel', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))
