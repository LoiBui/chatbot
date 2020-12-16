# coding: utf-8

import webapp2, logging
from google.appengine.api import memcache
from ucf.utils import ucfutil
from ucf.utils.validates import BaseValidator
from ucf.utils.models import *
from ucf.utils.helpers import *
from ucf.pages.access_apply import AccessApplyUtils
from ucf.pages.operator import OperatorUtils
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
from google.appengine.api import taskqueue

import sateraito_inc
import sateraito_func
import sateraito_db

import json

# ###########################################################
# # EXPORT CSV
# ###########################################################
class ExportCsv():
	def create_request_token(cls):
		return UcfUtil.guid()

	create_request_token = classmethod(create_request_token)

	# タスクキューレコードを追加
	def createCsvTaskQueue(cls, task_type):
		# リクエストトークン作成（このキーでJSから照会）
		request_token = cls.create_request_token()
		logging.debug('request_token=' + str(request_token))

		tq_entry = sateraito_db.CsvTaskQueue()
		tq_entry.request_token = request_token
		tq_entry.task_type = task_type
		tq_entry.status = ''
		tq_entry.deal_status = 'PROCESSING'
		tq_entry.download_url = ''
		tq_entry.expire_date = datetime.datetime.now() + datetime.timedelta(days=1)  # csv download expires in 24 hours
		tq_entry.have_more_rows = True
		tq_entry.put()

		return tq_entry

	createCsvTaskQueue = classmethod(createCsvTaskQueue)

	# CSV作成キューを登録
	def addCsvTaskQueue(cls, task_url, task_params):
		default_q = taskqueue.Queue('default')
		t = taskqueue.Task(
			url=task_url,
			params=task_params,
			target='default',
			countdown=(1)
		)
		default_q.add(t)

	addCsvTaskQueue = classmethod(addCsvTaskQueue)

	def createCsvDownloadId(cls):
		''' create new csv download id string
'''
		# create 8-length random string
		s = 'abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
		random_string = ''
		for j in range(8):
			random_string += random.choice(s)
			# create date string
		dt_now = datetime.datetime.now()
		date_string = dt_now.strftime('%Y%m%d%H%M%S')
		# create send_id
		return date_string + random_string

	createCsvDownloadId = classmethod(createCsvDownloadId)

	def exportDocHeaderForUpdate(cls, isEnd=True):
		export_line = ''
		export_line += 'command,doc_id,user_id,line_id,store_id'
		if isEnd:
			export_line += '\r\n'
			export_line = sateraito_func.washShiftJISErrorChar(export_line)
		return export_line

	exportDocHeaderForUpdate = classmethod(exportDocHeaderForUpdate)

	def appendDocValueToHeader(cls, row):
		export_line = ''
		doc_values = json.JSONDecoder().decode(sateraito_func.noneToZeroStr(row.doc_values))
		logging.info(doc_values)
		for col in doc_values.keys():
			if col!='' and col not in sateraito_inc.FORM_DATA_TEMPLATE_FIELD_NAME_SKIP:
				export_line += ',' + col

		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)

		return export_line

	appendDocValueToHeader = classmethod(appendDocValueToHeader)


	def appendColumnListToHeader(cls, columns):
		export_line = ''
		logging.info(columns)
		for col in columns:
			if col != '' and col not in sateraito_inc.FORM_DATA_TEMPLATE_FIELD_NAME_SKIP:
				export_line += ',' + col

		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)

		return export_line

	appendColumnListToHeader = classmethod(appendColumnListToHeader)

	def appendFieldExportToHeader(cls, fieldsExport):
		export_line = ''
		columns = []
		for row in fieldsExport:
			col = row['field']
			if col != '' and col not in sateraito_inc.FORM_DATA_TEMPLATE_FIELD_NAME_SKIP:
				export_line += ',' + col
				columns.append(col)

		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)

		return export_line, columns

	appendFieldExportToHeader = classmethod(appendFieldExportToHeader)

	def appendDocValueToHeaderQA(cls):
		export_line = u'ユーザーID,LINEID,ブースID,文書ひな形名,設問番号,設問文字列,回答文字列,回答日時'
		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)

		return export_line

	appendDocValueToHeaderQA = classmethod(appendDocValueToHeaderQA)

	def checkColQA(cls, col):
		if col == '' or len(col) < 2:
			return False

		num = col[1:]
		if num.isdigit():
			return True

		return False

	checkColQA = classmethod(checkColQA)


	def exportStoreDataHeaderForUpdate(cls):
		export_line = ''
		export_line += 'command,store_id,store_name,user_id,last_name,first_name,mail_address,created_date'
		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)
		return export_line

	exportStoreDataHeaderForUpdate = classmethod(exportStoreDataHeaderForUpdate)

	def getUTCTimesForSearchDoc(cls, from_date_localtime_raw, to_date_localtime_raw):
		# from_date
		from_date_utc = None
		if from_date_localtime_raw.strip() != '':
			from_date_localtime_arr = from_date_localtime_raw.split(" ")
			if len(from_date_localtime_arr) == 1:
				from_date_localtime = datetime.datetime.strptime(from_date_localtime_arr[0] + ' 00:00:00',
					'%Y-%m-%d %H:%M:%S')
			else:
				from_date_localtime = datetime.datetime.strptime(
					from_date_localtime_arr[0] + ' ' + from_date_localtime_arr[1] + ':00', '%Y-%m-%d %H:%M:%S')
			from_date_utc = sateraito_func.toUtcTime(from_date_localtime)
			# to_date
		to_date_utc = None
		if to_date_localtime_raw.strip() != '':
			to_date_localtime_arr = to_date_localtime_raw.split(" ")
			if len(to_date_localtime_arr) == 1:
				to_date_localtime = datetime.datetime.strptime(to_date_localtime_arr[0] + ' 00:00:00',
					'%Y-%m-%d %H:%M:%S')
				to_date_localtime = UcfUtil.add_days(to_date_localtime, 1)
			else:
				to_date_localtime = datetime.datetime.strptime(
					to_date_localtime_arr[0] + ' ' + to_date_localtime_arr[1] + ':00', '%Y-%m-%d %H:%M:%S')
				to_date_localtime = UcfUtil.add_minutes(to_date_localtime, 1)
				# to_date_localtime = UcfUtil.add_days(to_date_localtime, 1)
			to_date_utc = sateraito_func.toUtcTime(to_date_localtime)
			# older_than_utc = None
			# if older_than != '':
		# older_than_splited = older_than.split('+')
		# local_time_older_than = datetime.datetime.strptime(older_than_splited[0], '%Y-%m-%d %H:%M:%S.%f')
		# older_than_utc = sateraito_func.toUtcTime(local_time_older_than)

		return from_date_utc, to_date_utc

	getUTCTimesForSearchDoc = classmethod(getUTCTimesForSearchDoc)

	def getMaxNumRowsExport(cls, tenant):
		if tenant in sateraito_inc.CSV_EXPORT_ALL_DOMAIN:
			return sateraito_inc.MAX_NUM_OF_ROWS_EXPORT_ALL
		else:
			return sateraito_inc.MAX_NUM_OF_ROWS_EXPORT

	getMaxNumRowsExport = classmethod(getMaxNumRowsExport)

	def getAuthorName(cls, author_name, doc_values):
		if 'author_name' in doc_values:
			if doc_values['author_name'].strip() != "" and doc_values['author_name'] != 'undefined':
				return doc_values['author_name'].strip()
		return author_name

	getAuthorName = classmethod(getAuthorName)

	def exportDocRowForUpdate(cls, row_doc, timezone=sateraito_inc.DEFAULT_TIMEZONE, columns=[]):
		author_name = ''
		author_email = ''
		line_id = ''
		user_info = sateraito_db.User.getUserInfo(row_doc.author_user_id)
		#logging.info(user_info)
		if user_info:
			author_name = '{0} {1}'.format(user_info['last_name'], user_info['first_name'])
			author_email = user_info['mail_address']
			line_id = user_info['line_id']

		export_line = ''
		# command
		export_line += 'IU'
		# doc_id
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.doc_id)
		# user_id
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.author_user_id)
		# line_id
		export_line += ',' + sateraito_func.escapeForCsv(line_id)
		# store_id
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.store_id)
		# #author_name
		# export_line += ',' + sateraito_func.escapeForCsv(author_name)
		# # author_email
		# export_line += ',' + sateraito_func.escapeForCsv(author_email)

		#export doc value
		doc_values = json.JSONDecoder().decode(sateraito_func.noneToZeroStr(row_doc.doc_values))
		keys = doc_values.keys()
		if (len(columns) > 0):
			for column in columns:
				if column in keys:
					export_line += ',' + sateraito_func.escapeForCsv(doc_values[column])
				else:
					export_line += ','
		else:
			for column in keys:
				if column != '':
					export_line += ',' + sateraito_func.escapeForCsv(doc_values[column])

		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)
		return export_line

	exportDocRowForUpdate = classmethod(exportDocRowForUpdate)

	def compareValue(cls, el1, el2):
		num1 = ucfutil.UcfUtil.toInt(el1['number'])
		num2 = ucfutil.UcfUtil.toInt(el2['number'])
		if num1 < num2: return -1
		if num1 > num2: return 1
		return 0

	compareValue = classmethod(compareValue)

	def exportDocRowForUpdateQA(cls, row_doc, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		line_id = ''
		user_info = sateraito_db.User.getUserInfo(row_doc.author_user_id)
		#logging.info(user_info)
		if user_info:
			line_id = user_info['line_id']

		#==============================
		#Parse Question & Answer
		if row_doc.contentQA is None:
			return ''

		content_values = json.JSONDecoder().decode(sateraito_func.noneToZeroStr(row_doc.contentQA))
		#logging.info(content_values)
		#sort list
		content_values_new = sorted(content_values, cmp=ExportCsv.compareValue)

		export_line = ''
		for item in content_values_new:
			logging.info(item)
			export_line_item = ''
			# command
			# export_line_item += 'IU'
			# user_id
			export_line_item += sateraito_func.escapeForCsv(row_doc.author_user_id)
			# line_id
			export_line_item += ',' + sateraito_func.escapeForCsv(line_id)
			#store_id
			export_line_item += ',' + sateraito_func.escapeForCsv(row_doc.store_id)
			# template_name
			export_line_item += ',' + sateraito_func.escapeForCsv(row_doc.template_name)
			#questtion number
			export_line_item += ',' + sateraito_func.escapeForCsv(str(item['number']))
			#questtion string
			export_line_item += ',' + sateraito_func.escapeForCsv(item['question'])
			#answer string:
			export_line_item += ',' + sateraito_func.escapeForCsv(item['answer'])
			# submit_date
			export_line_item += ',' + sateraito_func.toShortLocalTime(row_doc.submit_date, timezone=timezone)

			export_line_item += '\r\n'
			export_line_item = sateraito_func.washShiftJISErrorChar(export_line_item)

			export_line += export_line_item

		return export_line

	exportDocRowForUpdateQA = classmethod(exportDocRowForUpdateQA)

	def exportDocRowForUpdateQA2(cls, row_doc, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		line_id = ''
		user_info = sateraito_db.User.getUserInfo(row_doc.author_user_id)
		#logging.info(user_info)
		if user_info:
			line_id = user_info['line_id']

		#==============================
		#Parse Question & Answer
		QA_list = []
		num_list = []
		#export doc value
		doc_values = json.JSONDecoder().decode(sateraito_func.noneToZeroStr(row_doc.doc_values))
		logging.info(doc_values)
		for column in doc_values.keys():
			if ExportCsv.checkColQA(column):
				num = int(column[1:])
				if not num in num_list:
					num_list.append(num)
					question_field = sateraito_inc.QA_QUESTION_FORMAT.format(num)
					answer_field = sateraito_inc.QA_ANSWER_FORMAT.format(num)
					if doc_values.has_key(question_field) and doc_values.has_key(answer_field):
						QA_list.append({'num_index': num, 'question': question_field, 'answer': answer_field})

		if len(QA_list) > 0:
			QA_list_new = sorted(QA_list, key=lambda objeto: objeto['num_index'])
			QA_list = QA_list_new
			#logging.info('==========QA_new_list==============')
			#logging.info(QA_list_new)

		export_line = ''
		for item in QA_list:
			export_line_item = ''
			# command
			# export_line_item += 'IU'
			# line_id
			export_line_item += sateraito_func.escapeForCsv(line_id)
			#store_id
			export_line_item += ',' + sateraito_func.escapeForCsv(row_doc.store_id)
			# template_name
			export_line_item += ',' + sateraito_func.escapeForCsv(row_doc.template_name)
			#questtion number
			export_line_item += ',' + sateraito_func.escapeForCsv(str(item['num_index']))
			#questtion string
			export_line_item += ',' + sateraito_func.escapeForCsv(doc_values[item['question']])
			#answer string:
			export_line_item += ',' + sateraito_func.escapeForCsv(doc_values[item['answer']])
			# submit_date
			export_line_item += ',' + sateraito_func.toShortLocalTime(row_doc.submit_date, timezone=timezone)

			export_line_item += '\r\n'
			export_line_item = sateraito_func.washShiftJISErrorChar(export_line_item)

			export_line += export_line_item

		return export_line

	exportDocRowForUpdateQA2 = classmethod(exportDocRowForUpdateQA2)

	def exportStoreDataRowForUpdate(cls, row_doc, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		export_line = ''
		# command
		export_line += 'IU'
		# store_id
		export_line += ',' + sateraito_func.escapeForCsv(row_doc['store_id'])
		# store_name
		export_line += ',' + sateraito_func.escapeForCsv(row_doc['store_name'] if row_doc.has_key('store_name') else '')
		#user_id
		export_line += ',' + sateraito_func.escapeForCsv(row_doc['user_id'])
		# last_name
		export_line += ',' + sateraito_func.escapeForCsv(row_doc['last_name'])
		# first_name
		export_line += ',' + sateraito_func.escapeForCsv(row_doc['first_name'])
		# mail_address
		export_line += ',' + sateraito_func.escapeForCsv(row_doc['mail_address'])
		# created_date
		export_line += ',' + sateraito_func.escapeForCsv(row_doc['created_date'])
		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)
		return export_line

	exportStoreDataRowForUpdate = classmethod(exportStoreDataRowForUpdate)

	def saveCsv(cls, tenant, tq_entry, csv_download_id, csv_filename, csv_string, is_api=False, is_success=True,
							have_more_rows=False):
		# ## save csv data to datastore
		# csv_string = str(csv_string)
		csv_string = sateraito_func.washShiftJISErrorChar(csv_string)
		csv_string = csv_string.encode('cp932')  #Shift_JIS変換

		# devide csv data
		# CAUTION: Datastore entity can have only 1MB data per entity
		#					so you have to devide data if it is over 1MB
		csv_data_length = len(csv_string)
		csv_datas = []
		NUM_STRING_PER_ENTITY = 1000 * 900  # 900 KB
		number_of_entity = (csv_data_length // NUM_STRING_PER_ENTITY) + 1
		for i in range(0, number_of_entity):
			start_index = i * NUM_STRING_PER_ENTITY
			end_index = start_index + NUM_STRING_PER_ENTITY
			csv_datas.append(csv_string[start_index:end_index])
			# store data to datastore
		expire_date = datetime.datetime.now() + datetime.timedelta(days=1)  # csv download expires in 24 hours
		for i in range(0, number_of_entity):
			new_data = sateraito_db.CsvDownloadData()
			new_data.csv_data = csv_datas[i]
			new_data.data_order = i
			new_data.csv_download_id = csv_download_id
			new_data.expire_date = expire_date
			new_data.csv_filename = csv_filename
			new_data.put()

		# ダウンロードURL
		if is_api:
			download_url = sateraito_inc.my_site_url + '/a/' + tenant + '/formdata/exportcsvfile?id=' + csv_download_id
		else:
			download_url = sateraito_inc.my_site_url + '/a/' + tenant + '/formdata/exportcsvfile?id=' + csv_download_id

		if is_success:
			tq_entry.status = 'SUCCESS'
			tq_entry.deal_status = 'FIN'
		else:
			tq_entry.status = ''
			tq_entry.deal_status = 'PROCESSING'

		tq_entry.have_more_rows = have_more_rows
		tq_entry.download_url = download_url
		tq_entry.expire_date = expire_date
		tq_entry.csv_download_id = csv_download_id
		tq_entry.put()

		return download_url

	saveCsv = classmethod(saveCsv)

	def saveCsvStoreData(cls, tenant, tq_entry, csv_download_id, csv_filename, csv_string, is_api=False, is_success=True,
											 have_more_rows=False):
		# ## save csv data to datastore
		# csv_string = str(csv_string)
		csv_string = sateraito_func.washShiftJISErrorChar(csv_string)
		csv_string = csv_string.encode('cp932')  #Shift_JIS変換

		# devide csv data
		# CAUTION: Datastore entity can have only 1MB data per entity
		#					so you have to devide data if it is over 1MB
		csv_data_length = len(csv_string)
		csv_datas = []
		NUM_STRING_PER_ENTITY = 1000 * 900  # 900 KB
		number_of_entity = (csv_data_length // NUM_STRING_PER_ENTITY) + 1
		for i in range(0, number_of_entity):
			start_index = i * NUM_STRING_PER_ENTITY
			end_index = start_index + NUM_STRING_PER_ENTITY
			csv_datas.append(csv_string[start_index:end_index])
			# store data to datastore
		expire_date = datetime.datetime.now() + datetime.timedelta(days=1)  # csv download expires in 24 hours
		for i in range(0, number_of_entity):
			new_data = sateraito_db.CsvDownloadData()
			new_data.csv_data = csv_datas[i]
			new_data.data_order = i
			new_data.csv_download_id = csv_download_id
			new_data.expire_date = expire_date
			new_data.csv_filename = csv_filename
			new_data.put()

		# ダウンロードURL
		if is_api:
			download_url = sateraito_inc.my_site_url + '/a/' + tenant + '/storedata/exportcsvfile?id=' + csv_download_id
		else:
			download_url = sateraito_inc.my_site_url + '/a/' + tenant + '/storedata/exportcsvfile?id=' + csv_download_id

		if is_success:
			tq_entry.status = 'SUCCESS'
			tq_entry.deal_status = 'FIN'
		else:
			tq_entry.status = ''
			tq_entry.deal_status = 'PROCESSING'

		tq_entry.have_more_rows = have_more_rows
		tq_entry.download_url = download_url
		tq_entry.expire_date = expire_date
		tq_entry.csv_download_id = csv_download_id
		tq_entry.put()

		return download_url

	saveCsvStoreData = classmethod(saveCsvStoreData)

	def updateErrorStatus(self, tenant, tq_entry, err=None):
		if tq_entry is not None:
			tq_entry.status = 'FAILED'
			tq_entry.deal_status = 'FIN'
			tq_entry.log_text = str(err) if err is not None else ''
			# tq_entry.csv_download_id = csv_download_id
			tq_entry.put()

	updateErrorStatus = classmethod(updateErrorStatus)


	def exportStoreHeaderForUpdate(cls):
		export_line = ''
		export_line += 'command,store_id,scan_id,name,reply_message,qrcode_id,qrcode_url,form_template,memo'
		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)
		return export_line

	exportStoreHeaderForUpdate = classmethod(exportStoreHeaderForUpdate)


	def exportStoreRowForUpdate(cls, row_doc, template_name='', timezone=sateraito_inc.DEFAULT_TIMEZONE):
		export_line = ''
		# command
		export_line += 'IU'
		# store_id disp
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.store_id_disp)
		# store_id (scan id)
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.store_id)
		#name
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.name)
		# reply_message
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.reply_message)
		# qrcode_id
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.qrcode_id)
		# qrcode_url
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.qrcode_url)
		# reply_user
		# reply_user = row_doc.reply_user if row_doc.reply_user else []
		# export_line += ',' + sateraito_func.escapeForCsv(''.join(reply_user))
		# form_template
		export_line += ',' + sateraito_func.escapeForCsv(template_name)
		# memo
		export_line += ',' + sateraito_func.escapeForCsv(row_doc.memo)
		export_line += '\r\n'
		export_line = sateraito_func.washShiftJISErrorChar(export_line)
		return export_line

	exportStoreRowForUpdate = classmethod(exportStoreRowForUpdate)

