# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc,loginfunc
from ucf.pages.operator import *
import lineworks_func

class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		try:
			print(3245678)
			fileValue = lineworks_func.getQuestionFromFileByUniqueIdAndSheetName('1b89dcaa286f68d4cde6ff7d614839c8', 'Sateraito Sheet 1')
			print((fileValue))


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

			# ���O�C�����̊e������擾���`�F�b�N
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

			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])
			
			sk_keyword = UcfUtil.getHashStr(req, 'display_name').strip()
			template_list = []

			if sk_keyword != '':
				template_list = ExcelTemplateFile.searchDocsByFullText(self, sk_keyword, limit, offset=start)

			else:
				q = ExcelTemplateFile.query()
				q = q.order(-ExcelTemplateFile.created_date)
				
				for entry in q.iter(limit=limit, offset=start):
					vo = entry.exchangeVo(self._timezone)
					# OperatorUtils.editVoForList(self, vo)
					list_vo = {}
					for k,v in vo.iteritems():
						if k in ['blob_store', 'tenant', 'filename', 'unique_id', 'display_name']:
							list_vo[k] = v
					template_list.append(list_vo)
			ret_value = {
				 #'all_count': str(count),
				'all_count': str(1000),
				'records': template_list,
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()




app = webapp2.WSGIApplication([('/a/([^/]*)/xlist_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)