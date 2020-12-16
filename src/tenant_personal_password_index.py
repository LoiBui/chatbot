# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.pages.operator import OperatorUtils
from ucf.pages.profile import ProfileUtils, PasswordChangeValidator

class Page(TenantAppHelper):
	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'personal_password'
		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# ���O�C�����̊e������擾���`�F�b�N
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			if is_select_ok == False:
				return

			# �p�X���[�h�ύX�������Ȃ��t���O�������Ă��Ȃ������`�F�b�N
			if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') == 'UNAVAILABLE':
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_UNAVAILABLE_PASSWORD_CHANGE')))
				return

			# �����J�ڐ�URL���w�肳��Ă����烊�_�C���N�g�i���̃y�[�W�ł͂��Ȃ��j
			if ucffunc.redirectAutoRedirectURL(self, is_no_redirect=True):
				return

			ucfp = UcfTenantParameter(self)

			# Request����vo�ɃZ�b�g
			req = UcfVoInfo.setRequestToVo(self)

			# �X�e�[�^�X
			edit_status = UcfUtil.getHashStr(req, UcfConfig.QSTRING_STATUS)
			vo = req
			if edit_status == UcfConfig.VC_CHECK:

				# CSRF�΍�F�g�[�N���`�F�b�N
				if not self.checkCSRFToken(CSRF_TOKEN_KEY, self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN)):
					self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_CSRF_CHECK')))
					return

				# ���̓`�F�b�N
				vc = PasswordChangeValidator('')
				vc.validate(self, vo, user_vo, profile_vo)
				ucfp.voinfo.validator = vc
				# ���̓G���[���Ȃ���Γo�^����
				if ucfp.voinfo.validator.total_count <= 0:

					is_password_change_success, password_change_error_code = ProfileUtils.changeUserPassword(self, req, user_vo, profile_vo, updater_name=UcfUtil.nvl(self.getLoginID()))
					if is_password_change_success:
						# �Z�b�V�����̃p�X���[�h�����ύX�t���O���N���A
						self.setLoginOperatorForcePasswordChangeFlag('')
						# ������ꗗ�y�[�W�ɑJ��
						self.redirect('/a/' + self._tenant + '/personal/password/thanks')
					return

				# ���̓G���[������Ή�ʂɖ߂�
				else:
					ucfp.voinfo.setVo(vo, None, None, self)
			else:
				pass

			# CSRF�΍�:�g�[�N�����s
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY)

			ucfp.data[UcfConfig.REQUESTKEY_RURL] = ''	# Google�ȊO��SAML SP����̃��N�G�X�g��z��
			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# �A�N�Z�X�\���p���O�C����ʂŃ^�u���b�g�̏ꍇ�͂��������o���Ȃ�

			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('personal_password_index.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


