# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from simplejson.encoder import JSONEncoder
import sateraito_inc
import sateraito_func
from ucf.pages.operator import *
from ucf.pages.task import TaskChangeIDUtils

class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):

		CSRF_TOKEN_KEY = 'operator_changeid'

		try:
			ret_value = {}
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

			if self.isAdmin() == False and self.isOperator(target_function=UcfConfig.DELEGATE_FUNCTION_OPERATOR_CONFIG) == False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)


			# ユニークキー
			unique_id = UcfUtil.getHashStr(req, UcfConfig.QSTRING_UNIQUEID)
			if unique_id == '':
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS')
				self.responseAjaxResult(ret_value)
				return
			logging.info('unique_id=' + unique_id)

			# CSRF対策：トークンチェック
			if not self.checkCSRFToken(CSRF_TOKEN_KEY + unique_id, self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN)):
				self._code = 400
				self._msg = self.getMsg('MSG_CSRF_CHECK')
				self.responseAjaxResult()
				return

			# 入力チェック
			vc = OperatorChangeIDValidator()
			vc.validate(self, req)
			# 入力エラーがあれば終了
			if vc.total_count > 0:
				self._code = 100
				ret_value['vcmsg'] = vc.msg
				self.responseAjaxResult(ret_value)
				return

			# 入力エラーがなければ登録処理
			else:

				entry = OperatorUtils.getData(self, unique_id)
				if entry is None:
					self._code = 400
					self._msg = UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA'))
					self.responseAjaxResult(ret_value)
					return

				src_email = UcfUtil.getHashStr(req, 'src_accountid')
				#dst_email = UcfUtil.getHashStr(req, 'dst_accountid_localpart') + '@' + UcfUtil.getHashStr(req, 'federated_domain')
				dst_email = UcfUtil.getHashStr(req, 'dst_accountid')
				logging.info('src_email=' + src_email)
				logging.info('dst_email=' + dst_email)
				# １アカウントの情報を更新
				result_code, result_msg, result_vcmsg, vo = OperatorUtils.changeOneOperatorID(self, src_email, dst_email, entry, self.isOperator(), UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups()), login_operator_id=UcfUtil.nvl(self.getLoginID()))
				if result_code != 0:
					self._code = result_code
					self._msg = result_msg
					ret_value['vcmsg'] = result_vcmsg
					self.responseAjaxResult(ret_value)
					return

				# オペレーションログ出力
				operation_log_detail = {}
				operation_log_detail['fields'] = [{'key':'email', 'before':src_email, 'after':dst_email}]
				UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_OPERATOR, UcfConfig.OPERATION_TYPE_CHANGEID, vo.get('operator_id', ''), vo.get('unique_id', ''), self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))

				self._code = result_code
				self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()



app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)