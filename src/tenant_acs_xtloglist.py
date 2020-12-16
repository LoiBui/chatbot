# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc
from ucf.pages.login_history import *

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

			sk_search_type = UcfUtil.getHashStr(req, 'sk_search_type')
			sk_login_id = UcfUtil.getHashStr(req, 'sk_login_id').lower()
			sk_operator_unique_id = UcfUtil.getHashStr(req, 'sk_operator_unique_id')

			sk_access_date_date_from = UcfUtil.getHashStr(req, 'sk_access_date_date_from')
			sk_access_date_time_from = UcfUtil.getHashStr(req, 'sk_access_date_time_from')
			sk_access_date_date_to = UcfUtil.getHashStr(req, 'sk_access_date_date_to')
			sk_access_date_time_to = UcfUtil.getHashStr(req, 'sk_access_date_time_to')

			#if tenant == 'nextsetdemo' and sateraito_inc.developer_mode:
			#	sk_access_date_date_from = '2016/09/06'
			#	sk_access_date_time_from = '19:24'
			#	sk_access_date_date_to = '2016/09/12'
			#	sk_access_date_time_to = '19:25'
			#	sk_search_type = 'access_date'

			if sk_search_type == '':
				sk_search_type = 'login_id'

			# 検索
			q = UCFMDLLoginHistory.query()
			# ユーザ詳細ページの検索
			if sk_operator_unique_id != '':
				q = q.filter(UCFMDLLoginHistory.operator_unique_id == sk_operator_unique_id)
			# 全体のログイン履歴一覧
			else:

				# 委託管理者なら自分が触れるデータのみ対象
				if self.isOperator() and self.getLoginOperatorDelegateManagementGroups() != '':
					q = q.filter(UCFMDLLoginHistory.management_group.IN(UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())))

				# ログインIDで検索
				if sk_search_type == 'login_id' and sk_login_id != '':
					q = q.filter(UCFMDLLoginHistory.login_id_lower >= sk_login_id)
					q = q.filter(UCFMDLLoginHistory.login_id_lower < sk_login_id + u'\uFFFD')

				# アクセス日時で検索
				elif sk_search_type == 'access_date' and (sk_access_date_date_from != '' or sk_access_date_date_to != ''):
					if sk_access_date_date_from != '':
						if sk_access_date_time_from != '':
							time_ary = sk_access_date_time_from.split(':')
							sk_access_date_from = sk_access_date_date_from + ' ' + time_ary[0] + ':' + time_ary[1] + ':00'
							sk_access_date_from_utc = UcfUtil.getUTCTime(UcfUtil.getDateTime(sk_access_date_from), self._timezone)
						else:
							sk_access_date_from = sk_access_date_date_from + ' 00:00:00'
							sk_access_date_from_utc = UcfUtil.getUTCTime(UcfUtil.getDateTime(sk_access_date_from), self._timezone)
						q = q.filter(UCFMDLLoginHistory.access_date >= sk_access_date_from_utc)
					if sk_access_date_date_to != '':
						if sk_access_date_time_to != '':
							time_ary = sk_access_date_time_to.split(':')
							sk_access_date_to = sk_access_date_date_to + ' ' + time_ary[0] + ':' + time_ary[1] + ':00'
							sk_access_date_to_utc = UcfUtil.getUTCTime(UcfUtil.getDateTime(sk_access_date_to), self._timezone)
						else:
							sk_access_date_to = sk_access_date_date_to + ' 00:00:00'
							sk_access_date_to_utc = UcfUtil.getUTCTime(UcfUtil.add_days(UcfUtil.getDateTime(sk_access_date_to), 1), self._timezone)
						q = q.filter(UCFMDLLoginHistory.access_date < sk_access_date_to_utc)
					q = q.order(-UCFMDLLoginHistory.access_date)


			# q.count() が非常に負荷、時間がかかるので暫定的に変更（将来は「もっと表示」方式、あるいはマウススクロールで次の情報を取る方式に変更したい） 2016.02.26
			#logging.info('before q.count()...')
			#count = q.count()
			#logging.info('after q.count() = ' + str(count) + '...')
			login_history_max_export_cnt = self.getDeptInfo().get('login_history_max_export_cnt')
			max_export_cnt = UcfUtil.toInt(login_history_max_export_cnt)		# 最大出力件数
			if max_export_cnt <= 0:
				max_export_cnt = 1000
			count = max_export_cnt
			result_list = []
			for model in q.iter(limit=limit, offset=start):
				vo = model.exchangeVo(self._timezone)
				# ログ詳細がある場合はそちらからログテキストを取得
				if model.is_exist_log_detail == True:
					q_d = UCFMDLLoginHistoryDetail.query()
					q_d = q_d.filter(UCFMDLLoginHistoryDetail.history_unique_id == model.unique_id)
					detail_entry = q_d.get()
					if detail_entry is not None and detail_entry.log_text is not None:
						vo['log_text'] = detail_entry.log_text
				LoginHistoryUtils.editVoForSelect(self, vo)
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