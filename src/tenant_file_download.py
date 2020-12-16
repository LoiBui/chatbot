# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils import loginfunc
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
from ucf.pages.file import *
import sateraito_inc
import sateraito_func

# ファイルダウンロード
class Page(blobstore_handlers.BlobstoreDownloadHandler, TenantAppHelper):
	def processOfRequest(self, tenant):

		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# 権限チェック
			if self.isAdmin() == False and self.isOperator() == False:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				return

			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_check_target_env=True)		# not_check_target_env=True…BlobstoreUploadHandlerの影響か、クライアントIPが変更されてしまうためネットワークや環境のチェックはしない
			if is_select_ok == False:
				return
#			# パスワード次回変更フラグをチェック
#			if self.checkForcePasswordChange() == False:
#				return

			data_key = self.getRequest('data_key')
			if data_key == '':
				self.redirectError(self.getMsg('MSG_INVALID_PARAMETER',('data_key')))
				return

			# ファイルデータを取得
			file_vo, file_entry = FileUtils.getDataVoByDataKey(self, data_key)
			if file_vo is None or UcfUtil.getHashStr(file_vo, 'deal_status') == 'CREATING' or UcfUtil.getHashStr(file_vo, 'expire_date') == '' or (UcfUtil.getDateTime(UcfUtil.getHashStr(file_vo, 'expire_date')) < UcfUtil.getNowLocalTime(self._timezone)):
#				self.redirectError(self.getMsg('MSG_NOTFOUND_TARGET_FILE',(data_key)))
				self.redirectError(self.getMsg('MSG_EXPIRE_TARGET_FILE',()))
				return

			# 出力
			if file_vo['data_type'] == 'CSV' and file_vo['data_encoding'] != '':
				self.response.charset = file_vo['data_encoding']
				self.setResponseHeaderForDownload(file_vo['data_name'], file_vo['data_encoding'])

			# CSVファイルが格納されていれば
			if file_vo['text_data'] != '':
				#encoded_data = unicode(file_vo['text_data'], errors='ignore')
				#self.response.out.write(encoded_data.encode(file_vo['data_encoding']))
				encoded_data = file_vo['text_data'].encode(file_vo['data_encoding'], 'ignore')
				self.response.out.write(encoded_data)
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
			file_entry.last_download_operator_id = self.getLoginOperatorID()
			file_entry.last_download_operator_unique_id = self.getLoginOperatorUniqueID()
			file_entry.updater_name = self.getLoginID()
			file_entry.date_changed = UcfUtil.getNow()
			file_entry.put()
			

		except BaseException, e:
			self.outputErrorLog(e)
#			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)