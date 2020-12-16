# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from simplejson.encoder import JSONEncoder
import sateraito_inc
import sateraito_func
from ucf.pages.operator import *

# �_�b�V���{�[�h�ɕύX
#_gnaviid = 'ACCOUNT'
_gnaviid = 'DASHBOARD'
_leftmenuid = 'DETAIL'
class Page(TenantAppHelper):
	def processOfRequest(self, tenant):

		CSRF_TOKEN_KEY = 'operator'

		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# �����`�F�b�N
			if self.isAdmin() == False and self.isOperator(target_function=UcfConfig.DELEGATE_FUNCTION_OPERATOR_CONFIG) == False:
#				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				self.redirect('/a/' + tenant + '/personal/')
				return

			# ���O�C�����̊e������擾���`�F�b�N
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			if is_select_ok == False:
				return
			# �p�X���[�h����ύX�t���O���`�F�b�N
			if self.checkForcePasswordChange() == False:
				return

			# Request����vo�ɃZ�b�g
			req = UcfVoInfo.setRequestToVo(self)

			# �`�F�b�N�{�b�N�X�l�␳�iTODO �{���̓t�����g����POST����悤��ExtJs�Ȃǂŏ������ׂ������}���j
			OperatorUtils.setNotPostValue(self, req)
			
			# �ڍ�
			edit_type = UcfUtil.getHashStr(req, UcfConfig.QSTRING_TYPE)
			# ���j�[�N�L�[
			unique_id = UcfUtil.getHashStr(req, UcfConfig.QSTRING_UNIQUEID)
			if edit_type != UcfConfig.EDIT_TYPE_REFER:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
				return
			if unique_id == '':
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
				return

			ucfp = UcfTenantParameter(self)
			vo = {}
			entry_vo = {}

			entry = OperatorUtils.getData(self, unique_id)
			if entry is None:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
				return
			vo = entry.exchangeVo(self._timezone)					# �����f�[�^��Vo�ɕϊ�
			OperatorUtils.editVoForSelect(self, vo, is_with_parent_group_info=True)		# �f�[�^���H�i�擾�p�j

			# �ϑ��Ǘ��҂̏ꍇ�͎������A�N�Z�X�ł���Ǘ��O���[�v�����`�F�b�N
			if self.isOperator() and not ucffunc.isDelegateTargetManagementGroup(UcfUtil.getHashStr(vo, 'management_group'), UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())):
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
				return

			ucfp.voinfo.setVo(vo, OperatorViewHelper(), None, self)

			# CSRF�΍�:�g�[�N�����s
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY + unique_id)

			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATOR_HEADER')]
			ucfp.data[UcfConfig.QSTRING_TYPE] = UcfUtil.nvl(self.getRequest(UcfConfig.QSTRING_TYPE))

			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('operator_detail.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


