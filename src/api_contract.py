#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import os
import webapp2
import urllib
import csv
import random
import datetime
import logging
import json
from google.appengine.api import namespace_manager
from google.appengine.api import taskqueue
from google.appengine.api import memcache
from google.appengine.ext import db
from google.appengine.ext.db.metadata import Namespace
from google.appengine.api import urlfetch
import google.appengine.api.runtime
import sateraito_inc
import sateraito_func
#import sateraito_page
#import sateraito_db
import gc
from ucf.utils.ucfutil import *
from ucf.utils.models import *
from ucf.utils.helpers import *
import oem_func

'''
api_contract.py

@since: 2016-04-17
@version: 2016-04-17
@author: T.ASAO
'''

class _ContractPage(webapp2.RequestHandler):

	# 認証APIのMD5SuffixKey（サテライトサポート窓口アプリ）
	MD5_SUFFIX_KEY_APPSSUPPORT = '0234b04994db475facdc22e5a0351676'
	#ENCODE_KEY_APPSSUPPORT = '2a229fe1'
	#APPLICATIONID_APPSSUPPORT = 'APPSSUPPORT'

	def outputErrorLog(self, e):
		logging.exception(e)
		#try:
		#	exc_type, exc_value, exc_traceback = sys.exc_info()
		#	logging.error(repr(traceback.format_exception(exc_type, exc_value, exc_traceback)))
		#except BaseException, ex:
		#	logging.exception(e)
		#	logging.exception(ex)

	def checkCheckKey(self, check_key, addon_id):

		md5_suffix_key = self.MD5_SUFFIX_KEY_APPSSUPPORT

		is_ok = False
		# チェックキーチェック
		if check_key != '' and md5_suffix_key != '':

			check_keys = []
			now = UcfUtil.getNow()	# 標準時
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, -5).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, -4).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, -3).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, -2).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, -1).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(now.strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, 1).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, 2).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, 3).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))
			check_keys.append(UcfUtil.md5(UcfUtil.add_minutes(now, 4).strftime('%Y%m%d%H%M') + md5_suffix_key + addon_id))

			is_ok = False
			for ck in check_keys:
				if ck.lower() == check_key.lower():
					is_ok = True
					break

		return is_ok

	def outputResult(self, return_code, params=None):
		params = {} if params is None else params

		msg = ''
		if params.has_key('errors'):
			for err in params['errors']:
				if msg != '':
					msg += '\n'
				msg += err.get('message', '')

		result = {
			'code':str(return_code)
			,'msg':msg
		}
		logging.info(result)
		self.response.out.write(json.JSONEncoder().encode(result))


###########################################################
# API：導入テナント、ドメイン数＋ユーザー数を集計
###########################################################
class ContractAggregateGet(_ContractPage):

	def _process(self):

		return_code = 999
		params = {}
		params['errors'] = []
		try:


			check_key = self.request.get('ck')
			status_url = self.request.get('status_url')
			task_id = self.request.get('task_id')
			addon_id = self.request.get('addon_id')

			logging.info('addon_id=' + addon_id)
			logging.info('ck=' + check_key)
			logging.info('status_url=' + status_url)
			logging.info('task_id=' + task_id)

			# チェックキーチェック
			if self.checkCheckKey(check_key, addon_id) == False:
				return_code = 403
				params['errors'].append({'code':return_code, 'message': 'invalid check_key.', 'validate':''})
				self.outputResult(return_code, params)
				return

			params = {
				'addon_id':addon_id,
				'status_url':status_url,
				'task_id':task_id,
			}

			# taskに追加 まるごと
			import_q = taskqueue.Queue('contract-queue')
			import_t = taskqueue.Task(
					url='/api/contract/tq/aggregate/get',
					params=params,
					target='b2process',
					countdown='0'
			)
			logging.info('run task')
			import_q.add(import_t)

			return_code = 0
			self.outputResult(return_code, params)

		except BaseException, e:
			self.outputErrorLog(e)
			try:
				return_code = 999
				params['errors'].append({'code':return_code, 'message': 'System error occured.', 'validate':''})
				self.outputResult(return_code, params)
			except BaseException, e2:
				self.outputErrorLog(e2)
				return


	def get(self):
		self._process()

	def post(self):
		self._process()


##############################
# API：導入テナント、ドメイン数＋ユーザー数を集計（タスクキュー）
##############################
class TqContractAggregateGet(_ContractPage):

	_timezone = 'Asia/Tokyo'

	def post(self):

		# check retry count
		retry_cnt = self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']
		logging.info('retry_cnt=' + str(retry_cnt))
		if retry_cnt is not None:
			if(int(retry_cnt) > 10):
				logging.error('error over_10_times.')
				return

		# 実際の連携処理
		# サテライトサポート窓口への連携

		status_url = self.request.get('status_url')
		addon_id = self.request.get('addon_id')
		task_id = self.request.get('task_id')
		logging.info('addon_id=' + addon_id)
		logging.info('status_url=' + status_url)
		logging.info('task_id=' + task_id)

		datas = []
		num_domains = 0
		num_users_total = 0
		input_users_total = 0
		biggest_users_total = 0

		namespace_manager.set_namespace('')
		q = sateraito_func.TenantEntry.all()

		NUM_PER_PAGE = 1000
		MAX_PAGES = 1000
		for i in range(MAX_PAGES):
			rows = q.fetch(limit=NUM_PER_PAGE, offset=(i * NUM_PER_PAGE))
			if len(rows) == 0:
				break
			for model in rows:

				biggest_users = 0
				if model.num_users is not None and model.max_users is not None:
					biggest_users = model.num_users if model.num_users > model.max_users else model.max_users
				elif model.num_users is not None:
					biggest_users = model.num_users
				elif model.max_users is not None:
					biggest_users = model.max_users

				vo = {}
				vo['tenant_or_domain'] = UcfUtil.nvl(model.tenant)
				#vo['is_disable'] = UcfUtil.nvl(model.is_disable)
				#vo['is_free_mode'] = UcfUtil.nvl(model.is_free_mode)
				vo['num_users'] = UcfUtil.nvl(model.num_users)
				#vo['biggest_users'] = UcfUtil.nvl(model.max_users)
				vo['biggest_users'] = UcfUtil.nvl(biggest_users)
				vo['available_users'] = UcfUtil.nvl(model.available_users)
				if model.available_start_date is None or model.available_start_date == '':
					vo['available_start_date'] = ''
				else:
					vo['available_start_date'] = UcfUtil.getDateTime(model.available_start_date).strftime('%Y/%m/%d')
				if model.charge_start_date is None or model.charge_start_date == '':
					vo['charge_start_date'] = ''
				else:
					vo['charge_start_date'] = UcfUtil.getDateTime(model.charge_start_date).strftime('%Y/%m/%d')
				if model.cancel_date is None or model.cancel_date == '':
					vo['cancel_date'] = ''
				else:
					vo['cancel_date'] = UcfUtil.getDateTime(model.cancel_date).strftime('%Y/%m/%d')
				vo['last_login_month'] = UcfUtil.nvl(model.last_login_month)
				vo['created_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(model.created_date, self._timezone))
				#vo['updated_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(model.updated_date, self._timezone))
				datas.append(vo)


				num_users_total += model.num_users if model.num_users is not None else 0
				biggest_users_total += biggest_users
				num_domains += 1

		results = {
			'status':'ok',
			'msg':'',
			'summary':{
					'num_domains':num_domains,
					'num_users':num_users_total,
					'input_users':input_users_total,
					'biggest_users':biggest_users_total,
				},
			'datas':datas,
		}

		now = datetime.datetime.now()
		check_key = UcfUtil.md5(addon_id + now.strftime('%Y%m%d%H%M') + self.MD5_SUFFIX_KEY_APPSSUPPORT)
		url = status_url + '?addon_id=%s&ck=%s&task_id=%s' % (UcfUtil.urlEncode(addon_id), UcfUtil.urlEncode(check_key), UcfUtil.urlEncode(task_id))

		logging.info(results)
		payload = json.JSONEncoder().encode(results)
		headers={'Content-Type': 'application/json'}
		logging.info(url)
		result = urlfetch.fetch(url=url, payload=payload, headers=headers, method='post', deadline=30, follow_redirects=True)
		if result.status_code != 200:
			logging.error(result.status_code)
		else:
			jsondata = json.JSONDecoder().decode(result.content)
			logging.info(jsondata)
		#logging.info(result.content)
		logging.info('fin.')



###########################################################
# API：管理ユーザー一覧を取得
###########################################################
class ContractAdminUsersGet(_ContractPage):

	def _process(self):

		return_code = 999
		params = {}
		params['errors'] = []
		try:


			check_key = self.request.get('ck')
			status_url = self.request.get('status_url')
			task_id = self.request.get('task_id')
			addon_id = self.request.get('addon_id')

			logging.info('addon_id=' + addon_id)
			logging.info('ck=' + check_key)
			logging.info('status_url=' + status_url)
			logging.info('task_id=' + task_id)

			# チェックキーチェック
			if self.checkCheckKey(check_key, addon_id) == False:
				return_code = 403
				params['errors'].append({'code':return_code, 'message': 'invalid check_key.', 'validate':''})
				self.outputResult(return_code, params)
				return

			params = {
				'addon_id':addon_id,
				'status_url':status_url,
				'task_id':task_id,
			}

			# taskに追加 まるごと
			import_q = taskqueue.Queue('contract-queue')
			import_t = taskqueue.Task(
					url='/api/contract/tq/adminusers/get',
					params=params,
					target='b2process',
					countdown='0'
			)
			logging.info('run task')
			import_q.add(import_t)

			return_code = 0
			self.outputResult(return_code, params)

		except BaseException, e:
			self.outputErrorLog(e)
			try:
				return_code = 999
				params['errors'].append({'code':return_code, 'message': 'System error occured.', 'validate':''})
				self.outputResult(return_code, params)
			except BaseException, e2:
				self.outputErrorLog(e2)
				return


	def get(self):
		self._process()

	def post(self):
		self._process()


##############################
# API：管理ユーザー一覧を取得（タスクキュー）
##############################
class TqContractAdminUsersGet(_ContractPage):

	def post(self):

		# check retry count
		retry_cnt = self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']
		logging.info('retry_cnt=' + str(retry_cnt))
		if retry_cnt is not None:
			if(int(retry_cnt) > 10):
				logging.error('error over_10_times.')
				return

		# 実際の連携処理
		# サテライトサポート窓口への連携

		status_url = self.request.get('status_url')
		addon_id = self.request.get('addon_id')
		task_id = self.request.get('task_id')
		logging.info('addon_id=' + addon_id)
		logging.info('status_url=' + status_url)
		logging.info('task_id=' + task_id)

		# 各テナントがメルマガ対象のテナントかをまず判定（例：OEMのお客様には送らない、など）
		q = Namespace.all()
		tenant_list = []
		for row in q:
			if row.namespace_name != '':
				tenant_list.append(row.namespace_name)

		#target_tenants = []
		datas = []
		cnt = 0
		for tenant in tenant_list:
			namespace_manager.set_namespace(tenant)

			# 店舗マスター取得
			query_dept = UCFMDLDeptMaster.all(keys_only=True)
			query_dept.filter('tenant = ', tenant)
			dept_entry = UCFMDLDeptMaster.getByKey(query_dept.get())
			if dept_entry is not None and dept_entry.oem_company_code in oem_func.getMailMagazineTargetOEMCompanyCodes():
				#target_tenants.append(tenant)
				if dept_entry.contact_mail_address is not None and dept_entry.contact_mail_address.strip() != '':
					datas.append(dept_entry.contact_mail_address.strip().lower())

		# ダッシュボードの連絡先メールアドレスに送る（user_emailがメールアドレス形式ではないケースもあるので...）
		#datas = []
		#namespace_manager.set_namespace('')
		#q = sateraito_func.UserEntry.all()
		#q.filter('is_admin =', True)
		#NUM_PER_PAGE = 1000
		#MAX_PAGES = 1000
		#for i in range(MAX_PAGES):
		#	rows = q.fetch(limit=NUM_PER_PAGE, offset=(i * NUM_PER_PAGE))
		#	if len(rows) == 0:
		#		break
		#	for row_user in rows:
		#		# sateraitoのお客さんのみ対象とする
		#		if row_user.tenant in target_tenants:
		#			datas.append(row_user.user_email)

		results = {
			'status':'ok',
			'msg':'',
			'datas':datas,
		}

		now = datetime.datetime.now()
		check_key = UcfUtil.md5(addon_id + now.strftime('%Y%m%d%H%M') + self.MD5_SUFFIX_KEY_APPSSUPPORT)
		url = status_url + '?addon_id=%s&ck=%s&task_id=%s' % (UcfUtil.urlEncode(addon_id), UcfUtil.urlEncode(check_key), UcfUtil.urlEncode(task_id))

		logging.info(results)
		payload = json.JSONEncoder().encode(results)
		headers={'Content-Type': 'application/json'}
		logging.info(url)
		result = urlfetch.fetch(url=url, payload=payload, headers=headers, method='post', deadline=30, follow_redirects=True)
		if result.status_code != 200:
			logging.error(result.status_code)
		else:
			jsondata = json.JSONDecoder().decode(result.content)
			logging.info(jsondata)
		#logging.info(result.content)
		logging.info('fin.')


app = webapp2.WSGIApplication([
																		('/api/contract/aggregate/get', ContractAggregateGet),		# サテライトサポート窓口アプリからコール（ユーザ数などをまとめて返す）
																		('/api/contract/tq/aggregate/get', TqContractAggregateGet),
																		('/api/contract/adminusers/get', ContractAdminUsersGet),		# サテライトサポート窓口アプリからコール（管理者アドレス一覧を返す）
																		('/api/contract/tq/adminusers/get', TqContractAdminUsersGet),
															], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
