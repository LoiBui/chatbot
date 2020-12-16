# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils import loginfunc
from ucf.pages.file import *
import sateraito_inc
import sateraito_func

# ファイルチェック
class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		try:
			if self.isValidTenant(not_redirect=True) == False:
				self._code = 400
				self._msg = self.getMsg('MSG_NOT_INSTALLED', (self._tenant))
				self.responseAjaxResult()
				return

			if loginfunc.checkLogin(self, not_redirect=True) == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_redirect=True)
			if is_select_ok == False:
				self._code = 403
				self._msg = error_msg
				self.responseAjaxResult()
				return

			if self.isAdmin() == False and self.isOperator() == False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
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

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)