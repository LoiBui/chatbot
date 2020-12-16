#!/usr/bin/python
# coding: utf-8

import os
import json
import logging
import webapp2
from google.appengine.api import taskqueue
#from google.appengine.api import backends
from google.appengine.api import namespace_manager
from google.appengine.api import memcache
from google.appengine.ext.db.metadata import Namespace
from ucf.utils.helpers import *
from ucf.utils.ucfutil import *
from ucf.utils.mailutil import UcfMailUtil
from ucf.utils.models import *
from ucf.sessions import delete_expired_sessions
import sateraito_inc
import sateraito_func
#import sateraito_black_list
import sateraito_db
from google.appengine.ext import blobstore


##############################
# Cron：TenantEntry情報更新タスク
##############################
class UpdateTenantEntryPage(CronHelper):

	def processOfRequest(self):

#		# cronからのコールかどうかを判定
#		if self.getServerVariables('X-AppEngine-Cron') != 'true':
#			logging.error('invalid access it does not accessed by any cron.')
#			return

#		target = backends.get_backend()
#		logging.info('backends_target=' + (str(target) if backends is not None else ''))

		# テナントごとにループ ※namespace_managerから取得できれば一番いいがとりあえずDomainEntryをループ
		tenant_entrys = sateraito_func.get_all_tenant_entry()
		for tenant_entry in tenant_entrys:
			###############################################
			# ドメイン確定＆ネームスペースセット（queueはキュー追加時点のネームスペースにて実行されるとのこともありここでセット）
			tenant = tenant_entry.tenant
			# 無効テナントは処理しない
			if sateraito_func.isTenantDisabled(tenant):
				pass
			else:
				# token作成
				token = UcfUtil.guid()
				# Save Number of GoogleApps domain user
				params = {
						'requestor': '',
						'type': 'start'
				}
				# taskに追加 まるごと
				import_q = taskqueue.Queue('tenant-set-queue')
				import_t = taskqueue.Task(
						url='/a/' + tenant + '/openid/' + token + '/regist_tenant_entry',
						params=params,
						#target='b1process',		# 365版はGAE側でタスク実行しないのでFrontEndsに変更 2015.03.09
						target='',
						countdown='5'
				)
				#logging.info('run task')
				import_q.add(import_t)


##############################
# Cron：不要セッションデータ削除
##############################
class DeleteExpiredSessionsPage(CronHelper):

	def processOfRequest(self):

#		# cronからのコールかどうかを判定
#		if self.getServerVariables('X-AppEngine-Cron') != 'true':
#			logging.error('invalid access it does not accessed by any cron.')
#			return

#		target = backends.get_backend()
#		logging.info('backends_target=' + (str(target) if backends is not None else ''))

		while not delete_expired_sessions():
			pass


##############################
# 古いログイン履歴を定期的に削除するバッチ
##############################
class DeleteLoginHistorysPage(CronHelper):

	def processOfRequest(self):
		# seek all namespace
		q = Namespace.all()
		tenant_list = []
		for row in q:
			if row.namespace_name != '':
				tenant_list.append(row.namespace_name)

		cnt = 0
		for tenant in tenant_list:
			namespace_manager.set_namespace(tenant)

			# Save Number of GoogleApps domain user
			params = {
			}
			import_q = taskqueue.Queue('clear-old-datas')
			import_t = taskqueue.Task(
					url='/tq/delete_login_history/' + tenant,
					params=params,
					target='b2process',
					countdown=(cnt * 5)
			)
			import_q.add(import_t)
			logging.info('run task... tenant=' + tenant)
			cnt += 1


##############################
# Cron：古いログイン履歴を定期的に削除するバッチ（ドメインごとの処理）
##############################
class TqDeleteLoginHistorysPage(CronHelper):

	def post(self, tenant):

		namespace_manager.set_namespace(tenant)

		# 店舗マスター取得
		query_dept = UCFMDLDeptMaster.all(keys_only=True)
		query_dept.filter('tenant = ', tenant)
		dept_entry = UCFMDLDeptMaster.getByKey(query_dept.get())

		# 保存期間を算出
		login_history_save_term = dept_entry.login_history_save_term if dept_entry is not None and dept_entry.login_history_save_term is not None else 0
		if login_history_save_term <= 0:
			login_history_save_term = 12				# ログイン履歴はデフォルトは１２ヶ月保存
		logging.info('login_history_save_term=' + str(login_history_save_term))

		now_date = UcfUtil.getNow()

		# 基準日…一応時分秒を00:00:00に合わせて期間前のデータを消さないように微調整
		threshold_date = UcfUtil.set_time(UcfUtil.add_months(now_date, -login_history_save_term), 0, 0, 0)
		logging.info('[now_date]' + str(now_date))
		logging.info('[threshold_date]' + str(threshold_date))

		#MAX_PAGES = 20		# とりあえず様子見で20000件ずつ
		MAX_PAGES = 200		# とりあえず様子見で200000件ずつ 2016.01.18
		NUM_PER_PAGE = 1000
		MAX_PROCESS_CNT = MAX_PAGES * NUM_PER_PAGE
		process_cnt = 0
		delete_cnt = 0
		last_check_date = None
		# ログイン履歴テーブルから古い順にデータを取得
		q = UCFMDLLoginHistory.query()
		q = q.order(UCFMDLLoginHistory.access_date)

		cnt = 0
		limit = NUM_PER_PAGE
		start_cursor = None
		for i in range(MAX_PAGES):

			if start_cursor is not None:
				each_rows, start_cursor, more = q.fetch_page(limit, start_cursor=start_cursor)
			else:
				each_rows, start_cursor, more = q.fetch_page(limit)

			is_break = False
			each_cnt = 0
			for entry in each_rows:

				last_check_date = entry.access_date
				# 日付チェック
				if entry.access_date < threshold_date:

					# ログイン履歴詳細を取得
					q_hd = UCFMDLLoginHistoryDetail.query()
					q_hd = q_hd.filter(UCFMDLLoginHistoryDetail.history_unique_id == entry.unique_id)
					detail_entry = UCFMDLLoginHistoryDetail.getByKey(q_hd.get(keys_only=True))
					# 削除
					if detail_entry is not None:
						detail_entry.key.delete()
					entry.key.delete()
					delete_cnt += 1
				else:
					is_break = True
					break
				process_cnt += 1
				each_cnt += 1
			each_rows = None

			if each_cnt < NUM_PER_PAGE or is_break:
				break
			if not more:
				break

		logging.info('[tenant]' + tenant + '[process_cnt]' + str(process_cnt) + '[delete_cnt]' + str(delete_cnt) + '[last_check_date]' + str(last_check_date))
		# 毎回最大件数処理されているということはデータが減っていっていないということなので一応警告を出す
		if MAX_PROCESS_CNT <= process_cnt:
			logging.warning('[tenant]' + tenant + '[msg]processing max process count data!!!')


##############################
# 古いオペレーションログを定期的に削除するバッチ
##############################
class DeleteOperationLogPage(CronHelper):
	def processOfRequest(self):
		# seek all namespace
		q = Namespace.all()
		domain_list = []
		for row in q:
			if row.namespace_name != '':
				domain_list.append(row.namespace_name)

		cnt = 0
		for domain_name in domain_list:
			namespace_manager.set_namespace(domain_name)

			# Save Number of GoogleApps domain user
			params = {
			}
			import_q = taskqueue.Queue('clear-old-datas')
			import_t = taskqueue.Task(
					url='/tq/delete_operation_log/' + domain_name,
					params=params,
					target='b2process',
					countdown=(cnt * 5)
			)
			import_q.add(import_t)
			logging.info('run task... domain=' + domain_name)
			cnt += 1


##############################
# Cron：古いオペレーションログを定期的に削除するバッチ（ドメインごとの処理）
##############################
class TqDeleteOperationLogPage(CronHelper):

	def post(self, tenant):

		namespace_manager.set_namespace(tenant)

		# 店舗マスター取得
		query_dept = UCFMDLDeptMaster.all(keys_only=True)
		query_dept.filter('tenant = ', tenant)
		dept_entry = UCFMDLDeptMaster.getByKey(query_dept.get())

		# 保存期間を算出
		operation_log_save_term = dept_entry.operation_log_save_term if dept_entry is not None and dept_entry.operation_log_save_term is not None else 0
		if operation_log_save_term <= 0:
			operation_log_save_term = 6				# デフォルトは６ヶ月保存
		logging.info('operation_log_save_term=' + str(operation_log_save_term))

		now_date = UcfUtil.getNow()

		# 基準日…一応時分秒を00:00:00に合わせて期間前のデータを消さないように微調整
		threshold_date = UcfUtil.set_time(UcfUtil.add_months(now_date, -operation_log_save_term), 0, 0, 0)
		logging.info('[now_date]' + str(now_date))
		logging.info('[threshold_date]' + str(threshold_date))


		MAX_PAGES = 20		# とりあえず様子見で20000件ずつ
		NUM_PER_PAGE = 1000
		MAX_PROCESS_CNT = MAX_PAGES * NUM_PER_PAGE
		process_cnt = 0
		delete_cnt = 0
		last_check_date = None
		# オペレーションログテーブルから古い順にデータを取得
		q = UCFMDLOperationLog.query()
		q = q.order(UCFMDLOperationLog.operation_date)
		start_cursor = None
		for i in range(MAX_PAGES):
			if start_cursor is not None:
				each_rows, start_cursor, more = q.fetch_page(NUM_PER_PAGE, start_cursor=start_cursor)
			else:
				each_rows, start_cursor, more = q.fetch_page(NUM_PER_PAGE)
			is_break = False
			for entry in each_rows:
				last_check_date = entry.operation_date
				# 日付チェック
				if entry.operation_date < threshold_date:
					#logging.info('[operation_date]' + str(entry.operation_date))
					entry.key.delete()
					delete_cnt += 1
				else:
					is_break = True
					break
				process_cnt += 1

			if not more or is_break:
				break

		logging.info('[tenant]' + tenant + '[process_cnt]' + str(process_cnt) + '[delete_cnt]' + str(delete_cnt) + '[last_check_date]' + str(last_check_date))
		# 毎回最大件数処理されているということはデータが減っていっていないということなので一応警告を出す
		if MAX_PROCESS_CNT <= process_cnt:
			logging.warning('[tenant]' + tenant + '[msg]processing max process count data!!!')


app = webapp2.WSGIApplication([
	('/cron/update_tenant_entry', UpdateTenantEntryPage),
	('/cron/delete_expired_sessions', DeleteExpiredSessionsPage),
	('/cron/delete_login_history', DeleteLoginHistorysPage),
	('/tq/delete_login_history/([^/]*)', TqDeleteLoginHistorysPage),
	('/cron/delete_operation_log', DeleteOperationLogPage),
	('/tq/delete_operation_log/([^/]*)', TqDeleteOperationLogPage)]
	, debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


