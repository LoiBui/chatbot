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

			# Request����vo�ɃZ�b�g
			req = UcfVoInfo.setRequestToVo(self)

			start = int(req['start'])
			limit = int(req['limit'])

			# ��������
			sk_keyword = UcfUtil.getHashStr(req, 'sk_keyword').strip()
			# �����^�C�v�i���[���A�h���X�A�Ј��ԍ��A�L�[���[�h�j
			sk_search_type = UcfUtil.getHashStr(req, 'sk_search_type')

			# ���[�U�[����
			users_list = []
			count = 0

			# q = ExcelTemplateFile()
			# q = q.order(-ExcelTemplateFile.created_datetime)

			q = ExcelTemplateFile.query()
			# q = q.filter(UCFMDLOperator.operator_id_lower >= sk_keyword.lower())
			
			for entry in q.iter(limit=limit, offset=start):
				vo = entry.exchangeVo(self._timezone)
				# OperatorUtils.editVoForList(self, vo)
				list_vo = {}
				for k,v in vo.iteritems():
					if k in ['url', 'tenant', 'filename', 'unique_id']:
						list_vo[k] = v
				users_list.append(list_vo)
			logging.info(users_list)
			ret_value = {
				 #'all_count': str(count),
				'all_count': str(1000),
				'records': users_list,
			}

			self._code = 0
			self.responseAjaxResult(ret_value)

		except BaseException, e:
			print(e)
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()




app = webapp2.WSGIApplication([('/a/([^/]*)/xlist_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)