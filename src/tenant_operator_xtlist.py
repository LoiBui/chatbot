# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc
from ucf.pages.operator import *

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

			if self.isAdmin() == False and self.isOperator(target_function=UcfConfig.DELEGATE_FUNCTION_OPERATOR_CONFIG) == False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])

			# 検索条件
			sk_keyword = UcfUtil.getHashStr(req, 'sk_keyword').strip()
			# 検索タイプ（メールアドレス、社員番号、キーワード）
			sk_search_type = UcfUtil.getHashStr(req, 'sk_search_type')

			# ユーザー検索
			users_list = []
			count = 0

			# フルテキスト検索
			if sk_search_type == 'fulltext' and sk_keyword != '':
				users_list = OperatorUtils.searchDocsByFullText(self, sk_keyword, limit, offset=start)
				for vo in users_list:
					OperatorUtils.editVoForList(self, vo)

			# 通常検索
			else:
				q = UCFMDLOperator.query()
				# フルテキスト検索でキーワードがない場合
				if sk_search_type == 'fulltext':
					pass
				# メールアドレス
				else:
					if sk_keyword != '':
						q = q.filter(UCFMDLOperator.operator_id_lower >= sk_keyword.lower())
						q = q.filter(UCFMDLOperator.operator_id_lower < ''.join(sk_keyword.lower() + u'\uFFE0'))
				# 委託管理者なら自分が触れるデータのみ対象
				if self.isOperator() and self.getLoginOperatorDelegateManagementGroups() != '':
					q = q.filter(UCFMDLOperator.management_group.IN(UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())))
				q = q.order(UCFMDLOperator.operator_id_lower)			# キーをユニークIDに変更したので 2017.03.09
				for entry in q.iter(limit=limit, offset=start):
					vo = entry.exchangeVo(self._timezone)
					OperatorUtils.editVoForList(self, vo)
					list_vo = {}
					# クライアントにフルで渡すのもセキュリティ、パフォーマンス的によくないので使う項目だけにする
					for k,v in vo.iteritems():
						#if k in ['unique_id','operator_id','mail_address','employee_id','display_name','federation_identifier','access_authority','account_stop_flag','login_lock_flag','profile_infos']:
						if k in ['unique_id','operator_id','mail_address','display_name','federation_identifier','access_authority','account_stop_flag','login_lock_flag']:
							list_vo[k] = v
					users_list.append(list_vo)

			ret_value = {
				 #'all_count': str(count),
				'all_count': str(1000),
				'records': users_list,
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()




app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)