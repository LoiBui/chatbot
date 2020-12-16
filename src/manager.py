#!/usr/bin/python
# coding: utf-8
import webapp2,os,logging
import urllib
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
from google.appengine.api import namespace_manager
from google.appengine.api import users
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.api import urlfetch
from ucf.config.ucfconfig import UcfConfig
from ucf.utils.ucfutil import *
from ucf.utils.models import *
from ucf.utils.helpers import *
from ucf.utils.validates import BaseValidator
from ucf.pages.file import *
from google.appengine.api import taskqueue
import sateraito_inc, sateraito_func
# 直接見るのではなくAPIを経由するように変更 2015.07.14
#import sateraito_mailmagazine_list

# sateraito_mailmagazine_list に当たるアドレス情報をAPIから取得
def retrieveSateraitoMailMagazineList(num_retry=0):

	API_URL = 'https://sateraito-apps-sso3.appspot.com/api/getmailmagazinelist'		# メルマガ配信除外アドレス一覧APIのURL
	MD5SUFFIX_KEY = '9eb4dd244d414f5b857e822f31b8e8c6'		# メルマガ配信除外アドレス一覧APIのMD5SuffixKey
	MAX_RETRY_CNT = 3		# リトライ回数
	ENCODE_KEY = '4d5f09ce'		# メルマガ配信除外アドレス一覧APIのEncodeキー

	not_send_addresses = []
	exchange_addresses = []

	try:

		now = datetime.datetime.now()	# 標準時
		check_key = UcfUtil.md5(now.strftime('%Y%m%d%H%M') + MD5SUFFIX_KEY)
		payload = {
			'ck':check_key
		}
		result = urlfetch.fetch(url=API_URL, method='post', payload=urllib.urlencode(payload), deadline=30, follow_redirects=True)
		if result.status_code != 200:
			if num_retry >= MAX_RETRY_CNT:
				logging.error(result.status_code)
				raise e
			else:
				return retrieveSateraitoMailMagazineList(num_retry=(num_retry+1))
		jsondata = JSONDecoder().decode(result.content)

		not_send_addresses = jsondata.get('not_send_addresses', [])
		exchange_addresses = jsondata.get('exchange_addresses', [])
		# アドレスのデコード（暗号化は時間が結構かかるがメールアドレスなので実施しておく）
		for i in range(len(not_send_addresses)):
			not_send_addresses[i] = UcfUtil.deCrypto(not_send_addresses[i], ENCODE_KEY)
		for i in range(len(exchange_addresses)):
			exchange_addresses[i] = [
					UcfUtil.deCrypto(exchange_addresses[i][0], ENCODE_KEY),
					UcfUtil.deCrypto(exchange_addresses[i][1], ENCODE_KEY)
				]
		logging.info(not_send_addresses)
		logging.info(exchange_addresses)

	except BaseException, e:
		logging.error('class name:' + e.__class__.__name__ + ' message=' +str(e) + ' num_retry=' + str(num_retry))
		if num_retry >= MAX_RETRY_CNT:
			raise e
		else:
			return retrieveSateraitoMailMagazineList(num_retry=(num_retry+1))

	return not_send_addresses, exchange_addresses


# 管理ログイン
#class LoginPage(ManageHelper):
#
#	def processOfRequest(self):
#		self._approot_path = os.path.dirname(__file__)
#
#		if self.checkAccessIPAddress() == False:
#			return
#
#		req = UcfVoInfo.setRequestToVo(self)
#		header_msg = []
#		# ステータス
#		edit_status = UcfUtil.getHashStr(req, UcfConfig.QSTRING_STATUS)
#
#		ucfp = UcfFrontParameter(self)
#		vo = {}
#		if edit_status == UcfConfig.VC_CHECK:
#
#			login_id = UcfUtil.getHashStr(req, 'login_id')
#			login_pwd = UcfUtil.getHashStr(req, 'login_pwd')
#			if login_id == sateraito_inc.SUPERVISOR_ID and login_pwd == sateraito_inc.SUPERVISOR_PWD:
#				self.setLoginID(login_id)
#				self.redirect('/manager/index')
#				return
#			else:
#				header_msg.append('Invalid Login.')
#
#		template_vals = {
#			'req' : req
#			,'header_msg': header_msg
#		}
#		self.appendBasicInfoToTemplateVals(template_vals)
#		self.render(os.path.join('manager', 'login.html'), self._design_type, template_vals)

# 管理エラー
class ErrorPage(ManageHelper):

	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)

		req = UcfVoInfo.setRequestToVo(self)
		header_msg = []

		ucfp = UcfFrontParameter(self)
		template_vals = {
			'req' : req
		}
		self.appendBasicInfoToTemplateVals(template_vals)
		self.render(os.path.join('manager', 'error.html'), self._design_type, template_vals)


# 管理ログアウト
class LogoutPage(ManageHelper):

	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)

#		if self.checkAccessIPAddress() == False:
#			return

		self.logout()
		return

# 管理トップ
class IndexPage(ManageHelper):

	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)

#		if self.checkAccessIPAddress() == False:
#			return

		is_login, user_email = self.checkLogin()
		if is_login == False:
			return

		req = UcfVoInfo.setRequestToVo(self)

		template_vals = {
			'req' : req
		}
		self.appendBasicInfoToTemplateVals(template_vals)
		self.render(os.path.join('manager', 'index.html'), self._design_type, template_vals)


class XtGetTenantEntrysPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
#		if self.checkAccessIPAddress() == False:
#			return
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])

			namespace_manager.set_namespace('')

			sk_tenant = UcfUtil.getHashStr(req, 'sk_tenant').lower()
			gql = ''
			wheres = []
			if sk_tenant != '':
				wheres.append("tenant >= '" + UcfUtil.escapeGql(sk_tenant) + "' and tenant < '" + UcfUtil.escapeGql(''.join(sk_tenant + u'\uFFE0')) + "'")
			gql += UcfUtil.getToGqlWhereQuery(wheres)
			models = sateraito_func.TenantEntry.gql(gql)
			count = 0
			fetch_data = None
			if models:
				count = models.count()
				fetch_data = models.fetch(limit, start)
			result_list = []
			for model in fetch_data:
				vo = {}
				vo['tenant'] = UcfUtil.nvl(model.tenant)
				vo['is_disable'] = UcfUtil.nvl(model.is_disable)
				vo['is_free_mode'] = UcfUtil.nvl(model.is_free_mode)
				vo['num_users'] = UcfUtil.nvl(model.num_users)
				vo['max_users'] = UcfUtil.nvl(model.max_users)
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
				vo['updated_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(model.updated_date, self._timezone))
				result_list.append(vo)

			ret_value = {
				 'all_count': str(count)
				,'records': result_list
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


class XtGetDeptMasterPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)
			target_tenant = UcfUtil.getHashStr(req, 'target_tenant')

			# 先にテナント情報を取得しておく
			namespace_manager.set_namespace('')
			tenant_entry = sateraito_func.getTenantEntry(target_tenant)

			namespace_manager.set_namespace(target_tenant)
			query = UCFMDLDeptMaster.gql("where tenant = :1", target_tenant)
			dept_entry = query.get()
			dept_vo = {}
			if dept_entry is not None:
				vo = dept_entry.exchangeVo(self._timezone)
				dept_vo['unique_id'] = vo['unique_id']
				dept_vo['tenant'] = vo['tenant']
				#dept_vo['federated_domains'] = UcfUtil.listToCsv(sateraito_func.getFederatedDomainList(target_tenant, is_with_cache=False))
				dept_vo['profile_infos'] = vo['profile_infos']
				dept_vo['login_history_max_export_cnt'] = vo['login_history_max_export_cnt']
				dept_vo['md5_suffix_key'] = vo['md5_suffix_key']
				dept_vo['deptinfo_encode_key'] = vo['deptinfo_encode_key']
				dept_vo['sso_private_key'] = vo['sso_private_key']
				dept_vo['sso_cert'] = vo['sso_cert']
				dept_vo['is_available_mailproxy'] = vo['is_available_mailproxy']
				dept_vo['is_education_mode'] = vo['is_education_mode']
				dept_vo['is_disable'] = UcfUtil.nvl(tenant_entry.is_disable)
				dept_vo['is_free_mode'] = UcfUtil.nvl(tenant_entry.is_free_mode)
				dept_vo['company_name'] = vo['company_name']
				dept_vo['tanto_name'] = vo['tanto_name']
				dept_vo['contact_mail_address'] = vo['contact_mail_address']
				dept_vo['contact_tel_no'] = vo['contact_tel_no']

			ret_value = {
				 'dept_vo': dept_vo
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

class XtRegistDeptMasterPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)
			target_tenant = UcfUtil.getHashStr(req, 'target_tenant')
			if target_tenant != '':

				# 先にテナント情報を更新
				namespace_manager.set_namespace('')
				tenant_entry = sateraito_func.getTenantEntry(target_tenant)
				if tenant_entry is not None:
					tenant_entry.is_disable = True if UcfUtil.getHashStr(req, 'is_disable') == 'True' else False
					tenant_entry.is_free_mode = True if UcfUtil.getHashStr(req, 'is_free_mode') == 'True' else False
					tenant_entry.put()

				namespace_manager.set_namespace(target_tenant)

				query = UCFMDLDeptMaster.gql("where tenant = :1", target_tenant)
				dept_entry = query.get()
				if dept_entry is not None:
					#dept_entry.federated_domains = UcfUtil.csvToList(UcfUtil.getHashStr(req, 'federated_domains'))
					dept_entry.profile_infos = UcfUtil.csvToList(UcfUtil.getHashStr(req, 'profile_infos'))
					dept_entry.login_history_max_export_cnt = UcfUtil.toInt(UcfUtil.getHashStr(req, 'login_history_max_export_cnt'))
					dept_entry.md5_suffix_key = UcfUtil.getHashStr(req, 'md5_suffix_key')
					dept_entry.deptinfo_encode_key = UcfUtil.getHashStr(req, 'deptinfo_encode_key')
					dept_entry.sso_private_key = UcfUtil.getHashStr(req, 'sso_private_key')
					dept_entry.sso_cert = UcfUtil.getHashStr(req, 'sso_cert')
					dept_entry.is_available_mailproxy = True if UcfUtil.getHashStr(req, 'is_available_mailproxy') == 'True' else False
					dept_entry.is_education_mode = True if UcfUtil.getHashStr(req, 'is_education_mode') == 'True' else False
					dept_entry.put()

				self._code = 0
				self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

# CSVエクスポート：非同期
class AsyncExportPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# キューキー
			data_kind = self.getRequest('data_kind')
			# UCFMDLFileのデータキーを作成
			data_key = UcfUtil.guid()

			# ステータス=CREATING にて 1レコード追加しておく（フロントからの判定制御などのため）
			file_entry = FileUtils.insertNewCreatingRecord(self, data_key, data_kind, user_email)

			try:
				# CSV作成タスクを追加
				token = UcfUtil.guid()
				params = {
									 'data_key': data_key
									,'data_kind':data_kind
									,'user_email':user_email
								 }
				import_q = taskqueue.Queue('csv-export-import')
				import_t = taskqueue.Task(
					url='/manager/' + token + '/queue_csv_export',
					params=params,
					target='b1process',
					countdown='1'
				)
				import_q.add(import_t)

				self._code = 0
				ret_value = {}
				ret_value['data_key'] = data_key
				self.responseAjaxResult(ret_value)
			
			except BaseException, e:
				file_entry.status = 'FAILED'
				file_entry.updater_name = user_email
				file_entry.date_changed = UcfUtil.getNow()
				file_entry.put()
				raise e

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

##############################
# キュー：CSVエクスポート
##############################
class QueueCsvExportPage(ManageTaskHelper):

	def processOfRequest(self, token):
		self._approot_path = os.path.dirname(__file__)

		# エラーが1回おきたら処理を終了する
		if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 1):
			logging.error('error over_1_times')
			return

		data_key = UcfUtil.nvl(self.getRequest('data_key'))
		data_kind = UcfUtil.nvl(self.getRequest('data_kind'))
		user_email = UcfUtil.nvl(self.getRequest('user_email'))

		if data_key == '':
			raise Exception(self.getMsg('MSG_INVALID_PARAMETER',('data_key')))
			return
		if data_kind == '':
			raise Exception(self.getMsg('MSG_INVALID_PARAMETER',('data_kind')))
			return

		# ファイルデータを取得（ステータス=CREATINGで作成済）
		file_entry = FileUtils.getDataEntryByDataKey(self, data_key)
		if file_entry is None:
			raise Exception(self.getMsg('MSG_NOTFOUND_TARGET_FILE',(data_key)))
			return

		try:
			datNow = UcfUtil.getLocalTime(UcfUtil.getNow(), self._timezone)
			data_name = ''
			csv_text = ''
			if data_kind == 'tenantlist':
				data_name = 'tenantlist_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = createCsvDomainEntry()
			elif data_kind == 'adminlist':
				data_name = 'adminlist_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = createCsvAdminUserEntry()
			elif data_kind == 'addonavailabledomainlist':
				data_name = 'addonavailabledomainlist_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = createCsvAddOnAvailableDomainEntry()
			else:
				raise Exception(self.getMsg('MSG_INVALID_PARAMETER',('data_kind')))
				return

			file_vo = file_entry.exchangeVo(self._timezone)
			FileUtils.editVoForSelect(self, file_vo)

			# CSVをファイルDBに格納
			file_vo['data_type'] = 'CSV'
			file_vo['content_type'] = 'text/csv'
#			file_vo['data_encoding'] = UcfConfig.DL_ENCODING
			file_encoding = 'SJIS'
			if file_encoding == '' or file_encoding == 'SJIS':
				file_vo['data_encoding'] = 'cp932'
			elif file_encoding == 'JIS':
				file_vo['data_encoding'] = 'jis'
			elif file_encoding == 'EUC':
				file_vo['data_encoding'] = 'euc-jp'
			elif file_encoding == 'UTF7':
				file_vo['data_encoding'] = 'utf-7'
			elif file_encoding == 'UTF8':
				file_vo['data_encoding'] = 'utf-8'
			elif file_encoding == 'UNICODE':
				file_vo['data_encoding'] = 'utf-16'
			else:
				file_vo['data_encoding'] = 'cp932'
			file_vo['deal_status'] = 'FIN'
			file_vo['status'] = 'SUCCESS'
			file_vo['text_data'] = csv_text
			file_vo['data_size'] = UcfUtil.nvl(len(csv_text))
			file_vo['expire_date'] = UcfUtil.add_months(datNow,1)	# 一ヶ月有効とする
			file_vo['data_name'] = data_name
			file_vo['download_count'] = '0'
#			file_vo['last_download_date'] = UcfUtil.nvl(datNow)
			file_vo['download_operator_id'] = user_email
			file_vo['download_operator_unique_id'] = ''
			file_vo['last_download_operator_id'] = user_email
			file_vo['last_download_operator_unique_id'] = ''
			FileUtils.editVoForRegist(self, file_vo, UcfConfig.EDIT_TYPE_NEW)

			# Voからモデルにマージ
			file_entry.margeFromVo(file_vo, self._timezone)
			# 更新
			file_entry.updater_name = user_email
			file_entry.date_changed = UcfUtil.getNow()
			file_entry.put()
		except Exception, e:
			file_entry.status = 'FAILED'
			file_entry.deal_status = 'FIN'
#			file_entry.log_text = 'system error.'
			file_entry.updater_name = user_email
			file_entry.date_changed = UcfUtil.getNow()
			file_entry.put()
			self.outputErrorLog(e)
			raise e

# ファイルチェック
class FileCheckPage(ManageAjaxHelper):
	def processOfRequest(self):
		namespace_manager.set_namespace('')
		self.response.headers['Content-Type'] = 'application/json'
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			data_key = self.getRequest('data_key')

			if data_key == '':
				self._code = 500
				self._msg = self.getMsg('MSG_INVALID_PARAMETER',('data_key'))
				self.responseAjaxResult()
				return

			# ファイルデータを取得
			file_vo, file_entry = FileUtils.getDataVoByDataKey(self, data_key)
			# レコードなし=エラー
			if file_vo is None:
				self._code = 500
				self._msg = self.getMsg('MSG_NOTFOUND_TARGET_FILE',(data_key))
				ret_value = {}
				ret_value['data_key'] = data_key
				self.responseAjaxResult(ret_value)
			# 作成確認
			elif UcfUtil.getHashStr(file_vo, 'deal_status') == 'FIN':
				self._code = 0
				ret_value = {}
				ret_value['data_key'] = data_key
				self.responseAjaxResult(ret_value)
			# 作成中
			elif UcfUtil.getHashStr(file_vo, 'deal_status') == 'CREATING':
				self._code = 404
				ret_value = {}
				ret_value['data_key'] = data_key
				self.responseAjaxResult(ret_value)
			# 期限切れ
			elif UcfUtil.getHashStr(file_vo, 'expire_date') == '' or UcfUtil.getDateTime(UcfUtil.getHashStr(file_vo, 'expire_date')) < UcfUtil.getNowLocalTime(self._timezone):
				self._code = 500
				self._msg = self.getMsg('MSG_EXPIRE_TARGET_FILE')
				ret_value = {}
				ret_value['data_key'] = data_key
				self.responseAjaxResult(ret_value)
			# その他エラー
			else:
				self._code = 500
				self._msg = self.getMsg('MSG_NOTFOUND_TARGET_FILE',(data_key))
				ret_value = {}
				ret_value['data_key'] = data_key
				self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

# ファイルダウンロード
class FileDownloadPage(blobstore_handlers.BlobstoreDownloadHandler, ManageHelper):
	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)

#		if self.checkAccessIPAddress() == False:
#			return

		is_login, user_email = self.checkLogin()
		if is_login == False:
			return

		try:
			data_key = self.getRequest('data_key')
			if data_key == '':
				self.redirectError(self.getMsg('MSG_INVALID_PARAMETER',('data_key')))
				return

			# ファイルデータを取得
			file_vo, file_entry = FileUtils.getDataVoByDataKey(self, data_key)
			if file_vo is None or UcfUtil.getHashStr(file_vo, 'deal_status') == 'CREATING' or UcfUtil.getHashStr(file_vo, 'expire_date') == '' or (UcfUtil.getDateTime(UcfUtil.getHashStr(file_vo, 'expire_date')) < UcfUtil.getNowLocalTime(self._timezone)):
				self.redirectError(self.getMsg('MSG_EXPIRE_TARGET_FILE',()))
				return

			# 出力
			if file_vo['data_type'] == 'CSV' and file_vo['data_encoding'] != '':
				self.response.charset = file_vo['data_encoding']
				self.setResponseHeaderForDownload(file_vo['data_name'], file_vo['data_encoding'])

			# CSVファイルが格納されていれば
			if file_vo['text_data'] != '':
				self.response.out.write(unicode(file_vo['text_data']).encode(file_vo['data_encoding']))
			# blob_key が指定されていれば
			elif file_vo['blob_key'] != '':
				blob_key = file_vo['blob_key']
				# BlobKeyを指定してファイルを取得
				blob_info = blobstore.BlobInfo.get(blob_key)
				# 結果をクライアントに返す
				self.send_blob(blob_info)

			# ダウンロード回数などを更新
			file_entry.download_count = file_entry.download_count + 1
			file_entry.last_download_date = UcfUtil.getNow()		# entryに直接セットなのでUTC
			file_entry.last_download_operator_id = user_email
			file_entry.last_download_operator_unique_id = ''
			file_entry.updater_name = user_email
			file_entry.date_changed = UcfUtil.getNow()
			file_entry.put()
			

		except BaseException, e:
			self.outputErrorLog(e)
#			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

class XtGetAdminUserEntrysPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
#		if self.checkAccessIPAddress() == False:
#			return
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])

			namespace_manager.set_namespace('')

			gql = ''
			wheres = []
			wheres.append("is_admin=True")
			gql += UcfUtil.getToGqlWhereQuery(wheres)
			models = sateraito_func.UserEntry.gql(gql)
			count = 0
			fetch_data = None
			if models:
				count = models.count()
				fetch_data = models.fetch(limit, start)
			result_list = []
			for model in fetch_data:
				vo = {}
				vo['tenant'] = UcfUtil.nvl(model.tenant)
				vo['user_email'] = UcfUtil.nvl(model.user_email)
				vo['created_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(model.created_date, self._timezone))
				result_list.append(vo)

			ret_value = {
				 'all_count': str(count)
				,'records': result_list
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


# エクスポート用CSVを作成：ドメイン一覧
def createCsvDomainEntry():
	namespace_manager.set_namespace('')
	csv_records = []
	# タイトル
	#titles = ['#created_date','#updated_date','tenant','is_free_mode','is_disable','available_users','num_users','max_users','last_login_month']
	#titles = ['#created_date','#updated_date','tenant','is_free_mode','is_disable','available_users','num_users','max_users','available_start_date','charge_start_date','cancel_date','last_login_month']
	titles = ['#created_date','#updated_date','tenant','num_users','max_users','biggest_users','available_users','available_start_date','charge_start_date','cancel_date','last_login_month']

	csv_records.append(UcfUtil.createCsvRecordEx(titles))

	# データ一覧取得
	start = 0
	limit = 1000
	entrys = []
	gql = ''
	wheres = []
	gql += UcfUtil.getToGqlWhereQuery(wheres)
	models = sateraito_func.TenantEntry.gql(gql)

	fetch_data = None
	if models:
		each_entrys = None
		while each_entrys is None or len(each_entrys) > 0:
			each_entrys = []
			fetch_data = models.fetch(limit, start)
			for entry in fetch_data:
				each_entrys.append(entry)
			entrys.extend(each_entrys)
			start += limit

	# データ
	for model in entrys:
		biggest_users = 0
		if model.num_users is not None and model.max_users is not None:
			biggest_users = model.num_users if model.num_users > model.max_users else model.max_users
		elif model.num_users is not None:
			biggest_users = model.num_users
		elif model.max_users is not None:
			biggest_users = model.max_users
		data = []
		data.append(UcfUtil.nvl(UcfUtil.getLocalTime(model.created_date, sateraito_inc.DEFAULT_TIMEZONE)))
		data.append(UcfUtil.nvl(UcfUtil.getLocalTime(model.updated_date, sateraito_inc.DEFAULT_TIMEZONE)))
		data.append(UcfUtil.nvl(model.tenant))
		#data.append(UcfUtil.nvl(model.is_free_mode))
		#data.append(UcfUtil.nvl(model.is_disable))
		data.append(str(model.num_users if model.num_users is not None else 0))
		data.append(str(model.max_users if model.max_users is not None else 0))
		data.append(str(biggest_users))
		data.append(str(model.available_users if model.available_users is not None else 0))
		data.append(model.available_start_date if model.available_start_date is not None else '')
		data.append(model.charge_start_date if model.charge_start_date is not None else '')
		data.append(model.cancel_date if model.cancel_date is not None else '')
		data.append(model.last_login_month if model.last_login_month is not None else '')

		csv_records.append(UcfUtil.createCsvRecordEx(data))

	csv_text = '\r\n'.join(csv_records)
	return csv_text

# エクスポート用CSVを作成：アドオン利用可能ドメイン一覧
def createCsvAddOnAvailableDomainEntry():
	namespace_manager.set_namespace('')
	csv_records = []
	# タイトル
	titles = ['#created_date','#updated_date','target_domain','company_name','available_expire','available_applications']
	csv_records.append(UcfUtil.createCsvRecordEx(titles))

	# データ一覧取得
	start = 0
	limit = 1000
	entrys = []
	gql = ''
	wheres = []
	gql += UcfUtil.getToGqlWhereQuery(wheres)
	models = sateraito_func.AddOnAvailableDomainEntry.gql(gql)

	fetch_data = None
	if models:
		each_entrys = None
		while each_entrys is None or len(each_entrys) > 0:
			each_entrys = []
			fetch_data = models.fetch(limit, start)
			for entry in fetch_data:
				each_entrys.append(entry)
			entrys.extend(each_entrys)
			start += limit

	# データ
	for model in entrys:
		data = []
		data.append(UcfUtil.nvl(UcfUtil.getLocalTime(model.created_date, sateraito_inc.DEFAULT_TIMEZONE)))
		data.append(UcfUtil.nvl(UcfUtil.getLocalTime(model.updated_date, sateraito_inc.DEFAULT_TIMEZONE)))
		data.append(UcfUtil.nvl(model.target_domain))
		data.append(UcfUtil.nvl(model.company_name))
		#data.append(UcfUtil.nvl(model.is_disable))
		data.append(UcfUtil.nvl(model.available_expire))
		data.append(UcfUtil.listToCsv(model.available_applications))

		csv_records.append(UcfUtil.createCsvRecordEx(data))
	csv_text = '\r\n'.join(csv_records)
	return csv_text



# エクスポート用CSVを作成:管理ユーザ一覧
def createCsvAdminUserEntry():

	# メルマガ配信リスト取得
	not_send_addresses, exchange_addresses_tmp = retrieveSateraitoMailMagazineList()

	namespace_manager.set_namespace('')
	csv_records = []
	# タイトル
	titles = ['#created_date','disable_user','tenant','is_admin','user_email']

	csv_records.append(UcfUtil.createCsvRecordEx(titles))
	

	# メルマガ宛先変換用ハッシュ作成
	exchange_addresses = {}
	#for item in sateraito_mailmagazine_list.EXCHANGE_ADDRESSES:
	for item in exchange_addresses_tmp:
		exchange_addresses[item[0].lower()] = item[1]


	# データ一覧取得
	start = 0
	limit = 1000
	entrys = []
	gql = ''
	wheres = []
	wheres.append("is_admin=True")
	gql += UcfUtil.getToGqlWhereQuery(wheres)
	models = sateraito_func.UserEntry.gql(gql)

	fetch_data = None
	if models:
		each_entrys = None
		while each_entrys is None or len(each_entrys) > 0:
			each_entrys = []
			fetch_data = models.fetch(limit, start)
			for entry in fetch_data:
				each_entrys.append(entry)
			entrys.extend(each_entrys)
			start += limit

	# データ
	for model in entrys:
		user_email = model.user_email
		# 除外アドレス判定処理
		#if str(user_email).lower() in sateraito_mailmagazine_list.NOT_SEND_ADDRESSES:
		if str(user_email).lower() in not_send_addresses:
			pass
		else:
			# アドレス変換処理
			if exchange_addresses.has_key(user_email.lower()):
				user_email = exchange_addresses[user_email.lower()]
			data = []
			data.append(UcfUtil.nvl(UcfUtil.getLocalTime(model.created_date, sateraito_inc.DEFAULT_TIMEZONE)))
			data.append(UcfUtil.nvl(model.disable_user))
			data.append(UcfUtil.nvl(model.tenant))
			data.append(UcfUtil.nvl(model.is_admin))
			data.append(UcfUtil.nvl(user_email))

			csv_records.append(UcfUtil.createCsvRecordEx(data))
	csv_text = '\r\n'.join(csv_records)
	return csv_text


# アドオン利用可能テナント管理ページ
class AddOnAvailableDomainsPage(ManageHelper):

	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)

#		if self.checkAccessIPAddress() == False:
#			return

		is_login, user_email = self.checkLogin()
		if is_login == False:
			return

		req = UcfVoInfo.setRequestToVo(self)

		template_vals = {
			'req' : req
		}
		self.appendBasicInfoToTemplateVals(template_vals)
		self.render(os.path.join('manager', 'availabledomains.html'), self._design_type, template_vals)


class XtGetAddOnAvailableDomainsPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
#		if self.checkAccessIPAddress() == False:
#			return
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])

			namespace_manager.set_namespace('')

			sk_target_domain = UcfUtil.getHashStr(req, 'sk_target_domain').lower()
			q = sateraito_func.AddOnAvailableDomainEntry.all()
			if sk_target_domain != '':
				q.filter('target_domain >= ', sk_target_domain)
				q.filter('target_domain < ', ''.join(sk_target_domain + u'\uFFE0'))
			count = 0
			fetch_data = None
			count = q.count()
			fetch_data = q.fetch(limit, start)
			result_list = []
			for entry in fetch_data:
				vo = {}
				vo['target_domain'] = UcfUtil.nvl(entry.target_domain)
				vo['company_name'] = UcfUtil.nvl(entry.company_name)
				vo['available_applications'] = UcfUtil.listToCsv(entry.available_applications)
				#vo['is_disable'] = UcfUtil.nvl(entry.is_disable)
				vo['available_expire'] = UcfUtil.nvl(entry.available_expire)
				vo['created_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(entry.created_date, self._timezone))
				vo['updated_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(entry.updated_date, self._timezone))
				result_list.append(vo)

			ret_value = {
				 'all_count': str(count)
				,'records': result_list
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

class XtGetAddOnAvailableDomainPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)
			target_domain = UcfUtil.getHashStr(req, 'target_domain')

			q = sateraito_func.AddOnAvailableDomainEntry.all()
			q.filter('target_domain =', target_domain.lower())
			entry = q.get()
			dept_vo = {}
			if entry is not None:
				dept_vo['target_domain'] = UcfUtil.nvl(entry.target_domain)
				dept_vo['company_name'] = UcfUtil.nvl(entry.company_name)
				dept_vo['available_applications'] = UcfUtil.listToCsv(entry.available_applications)
				#dept_vo['is_disable'] = str(entry.is_disable)
				dept_vo['available_expire'] = str(entry.available_expire)
				dept_vo['comment'] = UcfUtil.nvl(entry.comment)
				dept_vo['created_date'] = UcfUtil.nvl(entry.created_date)
				dept_vo['updated_date'] = UcfUtil.nvl(entry.updated_date)

			ret_value = {
				 'dept_vo': dept_vo
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

class XtRegistAddOnAvailableDomainPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)
			is_new = UcfUtil.getHashStr(req, 'is_new') == 'true'
			target_domain = UcfUtil.getHashStr(req, 'target_domain')
			target_domain = target_domain.strip().lower()
			logging.info(target_domain)

			vc = BaseValidator()
			if target_domain == '':
				self._code = 404
				self._msg = 'Not found the domain.'
				self.responseAjaxResult()
				return

			available_applications = UcfUtil.getHashStr(req, 'available_applications').replace(' ', '').replace('\r', '').replace('\n', '').replace('\t', '').strip(',')
			if not vc.alphabetNumberValidator(available_applications, except_str=[',']):
				self._code = 100	
				self._msg = self.getMsg('MSG_VC_ALPHABETNUMBER', (u'利用可能アプリ'))
				self.responseAjaxResult()
				return

			q = sateraito_func.AddOnAvailableDomainEntry.all(keys_only=True)
			q.filter('target_domain =', target_domain)
			entry = sateraito_func.AddOnAvailableDomainEntry.getByKey(q.get())

			if is_new and entry is not None:
				self._code = 400
				self._msg = 'The domain already exist.'
				self.responseAjaxResult()
				return
			elif not is_new and entry is None:
				self._code = 400
				self._msg = 'The domain is not found.'
				self.responseAjaxResult()
				return

			if is_new:
				key_name = UcfConfig.KEY_PREFIX + target_domain.lower()
				entry = sateraito_func.AddOnAvailableDomainEntry(key_name=key_name)
				entry.target_domain = target_domain
				entry.created_date = UcfUtil.getNow()
			
			entry.company_name = UcfUtil.getHashStr(req, 'company_name')
			entry.available_applications = UcfUtil.csvToList(available_applications.upper())
			entry.comment = UcfUtil.getHashStr(req, 'comment')
			#entry.is_disable = True if UcfUtil.getHashStr(req, 'is_disable') == 'True' else False
			entry.available_expire = UcfUtil.getHashStr(req, 'available_expire')
			entry.updated_date = UcfUtil.getNow()
			entry.put()

			self._code = 0
			self.responseAjaxResult()


		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

class XtGetAddOnHistorysPage(ManageAjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
#		if self.checkAccessIPAddress() == False:
#			return
		try:
			is_login, user_email = self.checkLogin(not_redirect=True)
			if is_login == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])

			namespace_manager.set_namespace('')

			sk_target_domain = UcfUtil.getHashStr(req, 'sk_target_domain').lower()
			q = sateraito_func.AddOnHistory.all()
			if sk_target_domain != '':
				q.filter('target_domain >= ', sk_target_domain)
				q.filter('target_domain < ', ''.join(sk_target_domain + u'\uFFE0'))
			count = 0
			fetch_data = None
			count = q.count()
			fetch_data = q.fetch(limit, start)
			result_list = []
			for entry in fetch_data:
				vo = {}
				vo['target_domain'] = UcfUtil.nvl(entry.target_domain)
				vo['application_id'] = UcfUtil.nvl(entry.application_id)
				vo['is_available'] = UcfUtil.nvl(entry.is_available)
				vo['reason'] = UcfUtil.nvl(entry.reason)
				vo['ip_address'] = UcfUtil.nvl(entry.ip_address)
				vo['user_id'] = UcfUtil.nvl(entry.user_id)
				vo['log_text'] = UcfUtil.nvl(entry.log_text)
				vo['user_agent'] = UcfUtil.nvl(entry.user_agent)
				#vo['result_code'] = UcfUtil.nvl(entry.result_code)
				#vo['result_message'] = UcfUtil.nvl(entry.result_message)
				vo['created_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(entry.created_date, self._timezone))
				vo['updated_date'] = UcfUtil.nvl(UcfUtil.getLocalTime(entry.updated_date, self._timezone))
				result_list.append(vo)

			ret_value = {
				 'all_count': str(count)
				,'records': result_list
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([
															 #('/manager/login', LoginPage),
															 ('/manager/error', ErrorPage),
															 ('/manager/logout', LogoutPage),
															 ('/manager/', IndexPage),
															 ('/manager/index', IndexPage),
 															 ('/manager/asynccsvexport', AsyncExportPage),
 															 ('/manager/file/check', FileCheckPage),
															 ('/manager/([^/]*)/queue_csv_export', QueueCsvExportPage),
															 ('/manager/file/download', FileDownloadPage),
															 ('/manager/tenant/xtgettenantentrys', XtGetTenantEntrysPage),
															 ('/manager/tenant/xtgetdeptmaster', XtGetDeptMasterPage),
															 ('/manager/tenant/xtregistdeptmaster', XtRegistDeptMasterPage),
															 ('/manager/tenant/xtgetadminuserentrys', XtGetAdminUserEntrysPage),
															 ('/manager/availabledomains', AddOnAvailableDomainsPage),
															 ('/manager/xtgetavailabledomains', XtGetAddOnAvailableDomainsPage),
															 ('/manager/xtregistaddonavailabledomain', XtRegistAddOnAvailableDomainPage),
															 ('/manager/xtgetaddonavailabledomain', XtGetAddOnAvailableDomainPage),
															 ('/manager/xtgetaddonhistorys', XtGetAddOnHistorysPage),
															], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
