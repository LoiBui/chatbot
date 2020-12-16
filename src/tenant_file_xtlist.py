# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc
from ucf.pages.file import *

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

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])

			data_kind = UcfUtil.getHashStr(req, 'data_kind')

			# 検索
			gql = ''
			wheres = []
			if data_kind != '':
				#wheres.append("data_kind = '" + UcfUtil.escapeGql(data_kind) + "'")
				if data_kind == 'exportaccountcsv':
					wheres.append("data_kind IN (" + UcfUtil.listToGqlInQuery(['exportaccountcsv', 'exportcontactcsv', 'exportworkflowcsv']) + ")")
				else:
					wheres.append("data_kind = '" + UcfUtil.escapeGql(data_kind) + "'")
			# 委託管理者なら自分が触れるデータのみ対象
			if self.isOperator() and self.getLoginOperatorDelegateManagementGroups() != '':
				if data_kind == 'exportusercsv' or data_kind == 'exportgroupcsv' or data_kind == 'exportoperatorcsv':
					wheres.append("download_operator_unique_id = '" + UcfUtil.escapeGql(self.getLoginOperatorUniqueID()) + "'")
				elif data_kind == 'importusercsv' or data_kind == 'importgroupcsv' or data_kind == 'importoperatorcsv':
					wheres.append("upload_operator_unique_id = '" + UcfUtil.escapeGql(self.getLoginOperatorUniqueID()) + "'")

			gql += UcfUtil.getToGqlWhereQuery(wheres)
			models = UCFMDLFile.gql(gql)
			count = 0
			fetch_data = None
			if models:
				count = models.count()
				fetch_data = models.fetch(limit, start)
			result_list = []
			for model in fetch_data:
				vo = model.exchangeVo(self._timezone)
				FileUtils.editVoForSelect(self, vo)
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

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)