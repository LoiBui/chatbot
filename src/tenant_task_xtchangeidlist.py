# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc
from ucf.pages.task import *

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

			if self.isAdmin() == False and self.isOperator(target_function=[UcfConfig.DELEGATE_FUNCTION_OPERATOR_CONFIG]) == False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])
			if limit <= 0:
				limit = 1000

			sk_task_type = UcfUtil.getHashStr(req, 'sk_task_type').lower()
			sk_target_unique_id = UcfUtil.getHashStr(req, 'sk_target_unique_id')
			
			# タスク検索
			gql = ''
			wheres = []
			wheres.append("task_type = '" + UcfUtil.escapeGql(sk_task_type) + "'")
			wheres.append("target_unique_id = '" + UcfUtil.escapeGql(sk_target_unique_id) + "'")
			gql += UcfUtil.getToGqlWhereQuery(wheres)
			models = UCFMDLTaskChangeID.gql(gql)
			count = 0
			fetch_data = None
			if models:
				count = models.count()
				fetch_data = models.fetch(limit, start)
			tasks_list = []
			for model in fetch_data:
				vo = model.exchangeVo(self._timezone)
				TaskChangeIDUtils.editVoForSelect(self, vo)
				tasks_list.append(vo)

			ret_value = {
				 'all_count': str(count)
				,'records': tasks_list
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)