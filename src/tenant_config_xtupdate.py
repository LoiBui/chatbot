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

			# ���O�C�����̊e������擾���`�F�b�N
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

			# Request����vo�ɃZ�b�g
			req = UcfVoInfo.setRequestToVo(self)

#			logging.info(req)
#			self._code = 999
#			self._msg = self.getMsg('MSG_NOT_EXIST_DATA', ())
#			self.responseAjaxResult()
#			return

			# �����f�[�^���擾
			query = UCFMDLDeptMaster.gql("where tenant = :1", tenant)
			dept_entry = query.get()

			if dept_entry is None:
				self._code = 999
				self._msg = self.getMsg('MSG_NOT_EXIST_DATA', ())
				self.responseAjaxResult()
				return

#			vo = dept_entry.exchangeVo(self._timezone)					# �����f�[�^��Vo�ɕϊ�
#			UcfUtil.margeHash(vo, req)										# Request����̏���Vo�Ƀ}�[�W
			vo = {}
			entry_vo = dept_entry.exchangeVo(self._timezone)										# �����f�[�^��Vo�ɕϊ�
			DeptUtils.editVoForSelect(self, entry_vo)		# �f�[�^���H�i�擾�p�j
			UcfUtil.margeHash(vo, entry_vo)									# �����f�[�^��Vo�ɃR�s�[
			UcfUtil.margeHash(vo, req)										# Request����̏���Vo�Ƀ}�[�W

			# ���̓`�F�b�N
			ret_value = {}
			vc = DeptValidator('')
			vc.validate(self, req)
			if vc.total_count > 0:
				self._code = 100
				ret_value['vcmsg'] = vc.msg;
				self.responseAjaxResult(ret_value)
				return

			# �f�[�^���H�X�V�p
			DeptUtils.editVoForRegist(self, vo, None, UcfConfig.EDIT_TYPE_RENEW)

			dept_entry.margeFromVo(vo, self._timezone)
			dept_entry.updater_name = UcfUtil.nvl(self.getLoginID())
			dept_entry.date_changed = UcfUtil.getNow()
			dept_entry.put()

			# �����ň�x�L���b�V���ł͂Ȃ��ŐV�̏����擾���Ă���
			self.getDeptInfo(is_force_select=True)

			# �I�y���[�V�������O�o��
			operation_log_detail = {}
			UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_DASHBOARD, UcfConfig.OPERATION_TYPE_MODIFY, '', '', self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))

			self._code = 0
			self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()



app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)