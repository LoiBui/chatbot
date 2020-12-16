# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc
from ucf.pages.dept import *

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

			if self.isAdmin() == False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

#			logging.info(req)
#			self._code = 999
#			self._msg = self.getMsg('MSG_NOT_EXIST_DATA', ())
#			self.responseAjaxResult()
#			return

			# 既存データを取得
			query = UCFMDLDeptMaster.gql("where tenant = :1", tenant)
			dept_entry = query.get()

			if dept_entry is None:
				self._code = 999
				self._msg = self.getMsg('MSG_NOT_EXIST_DATA', ())
				self.responseAjaxResult()
				return

#			vo = dept_entry.exchangeVo(self._timezone)					# 既存データをVoに変換
#			UcfUtil.margeHash(vo, req)										# Requestからの情報をVoにマージ
			vo = {}
			entry_vo = dept_entry.exchangeVo(self._timezone)										# 既存データをVoに変換
			DeptUtils.editVoForSelect(self, entry_vo)		# データ加工（取得用）
			UcfUtil.margeHash(vo, entry_vo)									# 既存データをVoにコピー
			UcfUtil.margeHash(vo, req)										# Requestからの情報をVoにマージ

			# 入力チェック
			ret_value = {}
			vc = DeptValidator('')
			vc.validate(self, req)
			if vc.total_count > 0:
				self._code = 100
				ret_value['vcmsg'] = vc.msg;
				self.responseAjaxResult(ret_value)
				return

			# データ加工更新用
			DeptUtils.editVoForRegist(self, vo, None, UcfConfig.EDIT_TYPE_RENEW)

			dept_entry.margeFromVo(vo, self._timezone)
			dept_entry.updater_name = UcfUtil.nvl(self.getLoginID())
			dept_entry.date_changed = UcfUtil.getNow()
			dept_entry.put()

			# ここで一度キャッシュではなく最新の情報を取得しておく
			self.getDeptInfo(is_force_select=True)

			# オペレーションログ出力
			operation_log_detail = {}
			UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_DASHBOARD, UcfConfig.OPERATION_TYPE_MODIFY, '', '', self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))

			self._code = 0
			self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()



app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)