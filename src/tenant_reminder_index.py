# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
import oem_func
from ucf.pages.operator import OperatorUtils
from ucf.pages.profile import ProfileUtils, PasswordChangeValidator
from ucf.utils.mailutil import UcfMailUtil
import sateraito_mail


class Page(TenantAppHelper):

	expire_minutes = 60	# �F�؃R�[�h�̗L��������60��

	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'reminder'
		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			#if loginfunc.checkLogin(self) == False:
			#	return

			## ���O�C�����̊e������擾���`�F�b�N
			#is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			#if is_select_ok == False:
			#	return

			# Request����vo�ɃZ�b�g
			req = UcfVoInfo.setRequestToVo(self)

			# STEP
			edit_step = UcfUtil.getHashStr(req, 'edit_step')
			if edit_step == '':
				edit_step = 'request'

			user_entry = None
			user_vo = None
			user_id = self.request.get('user_id')
			if user_id != '':
				user_entry = OperatorUtils.getUserEntryByOperatorID(self, user_id)
				if user_entry is not None:
					user_vo = user_entry.exchangeVo(self._timezone)
					OperatorUtils.editVoForSelect(self, user_vo)

			if user_vo is not None:
				profile_vo = loginfunc.getActiveProfile(self, user_vo)
			else:
				profile_vo = loginfunc.getDeptProfile(self)

			#logging.info('*** user_vo ****************************')
			#if user_vo is not None:
			#	logging.info(user_vo)

			#logging.info('*** profile_vo ****************************')
			#if profile_vo is not None:
			#	logging.info(profile_vo)

			## �p�X���[�h�ύX�������Ȃ��t���O�������Ă��Ȃ������`�F�b�N
			#if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') == 'UNAVAILABLE':
			#	self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_UNAVAILABLE_PASSWORD_CHANGE')))
			#	return

			## �����J�ڐ�URL���w�肳��Ă����烊�_�C���N�g�i���̃y�[�W�ł͂��Ȃ��j
			#if ucffunc.redirectAutoRedirectURL(self, is_no_redirect=True):
			#	return



			ucfp = UcfTenantParameter(self)


			# �X�e�[�^�X
			edit_status = UcfUtil.getHashStr(req, UcfConfig.QSTRING_STATUS)
			vo = req

			# �u���E�U�ɂ��autocomplete�̎����Z�b�g��h�~���邽�߁A��̏ꍇ�Ƀ_�~�[�̋󔒂��Z�b�g���Ă����i���׍H... ������Focus���ɃN���A�j 2016.05.30
			if self._design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
				if vo.has_key('Password1'):
					vo['Password1'] = vo['Password1'].strip()
				if vo.has_key('PasswordConfirm'):
					vo['PasswordConfirm'] = vo['PasswordConfirm'].strip()

			if edit_status == UcfConfig.VC_CHECK:

				# CSRF�΍�F�g�[�N���`�F�b�N
				if not self.checkCSRFToken(CSRF_TOKEN_KEY, self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN)):
					self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_CSRF_CHECK')))
					return

				# ���̓`�F�b�N
				vc = PasswordReminderValidator('')
				vc.validate(self, vo, user_vo, profile_vo, edit_step)
				ucfp.voinfo.validator = vc

				# ���̓`�F�b�N�i�p�X���[�h�p�j
				if ucfp.voinfo.validator.total_count <= 0 and edit_step == 'reset':
					vc = PasswordChangeValidator('')
					vc.validate(self, vo, user_vo, profile_vo)
					ucfp.voinfo.validator = vc

				# ���̓G���[���Ȃ���Ύ��̃y�[�W��\���i���邢�͓o�^�����j
				if ucfp.voinfo.validator.total_count <= 0:

					# ���̃X�e�b�v�ɍX�V
					if edit_step == '':
						edit_step = 'request'
					elif edit_step == 'request':
						edit_step = 'confirm'
					elif edit_step == 'confirm':
						edit_step = 'authcode'
					elif edit_step == 'authcode':
						edit_step = 'reset'
					elif edit_step == 'reset':
						edit_step = 'complete'

					# �Đݒ�R�[�h�����[�����M
					if edit_step == 'authcode':
						# �Đݒ�R�[�h��K�v�ɉ����Ĕ��s�����[�����M
						self.publishAndSendReminderAuthCode(user_entry)
						pass
					# �p�X���[�h���Z�b�g
					elif edit_step == 'complete':
						is_password_change_success, password_change_error_code = ProfileUtils.changeUserPassword(self, req, user_vo, profile_vo, updater_name=user_vo.get('operator_id', ''), with_reminder_key_reset=True)
						if is_password_change_success:
							self.redirect('/a/' + self._tenant + '/reminder/thanks')
						return
				# ���̓G���[������Ή�ʂɖ߂�
				else:
					ucfp.voinfo.setVo(vo, None, None, self)
			else:
				pass

			# �u���E�U�ɂ��autocomplete�̎����Z�b�g��h�~���邽�߁A��̏ꍇ�Ƀ_�~�[�̋󔒂��Z�b�g���Ă����i���׍H... ����Focus���ɃN���A�j 2016.05.30
			if self._design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
				if vo.get('Password1', '') == '':
					vo['Password1'] = '\t'
				if vo.get('PasswordConfirm', '') == '':
					vo['PasswordConfirm'] = '\t'

			ucfp.voinfo.setVo(vo, None, None, self)
			if user_vo is not None:
				ucfp.data['sub_mail_address_with_mask'] = self.createMaskedMailAddress(user_vo.get('sub_mail_address', ''))
			else:
				ucfp.data['sub_mail_address_with_mask'] = ''

			# CSRF�΍�:�g�[�N�����s
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY)

			#ucfp.data[UcfConfig.REQUESTKEY_RURL] = ''	# Google�ȊO��SAML SP����̃��N�G�X�g��z��
			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'edit_step':edit_step,
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# �^�u���b�g�̏ꍇ�͂��������o���Ȃ�

			}
			self.appendBasicInfoToTemplateVals(template_vals)
			self.render('reminder_index.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(self.getMsg('MSG_SYSTEM_ERROR'))
			return

	def createMaskedMailAddress(self, mail_address):

		sp = mail_address.split('@')
		if len(sp) < 2:
			return mail_address
		
		local_str = sp[0]
		domain_str = sp[1]
		local_str = (local_str[0:2] if len(local_str) > 2 else '') + '*******'
		return local_str + '@' + domain_str

	# �p�X���[�h���}�C���_�\�R�[�h��K�v�ɉ����Ĕ��s�����[�����M
	def publishAndSendReminderAuthCode(self, user_entry):
		logging.info('publishAndSendReminderAuthCode...')
		expire_minutes = self.expire_minutes
		# ���ݗL���ȃp�X���[�h���}�C���_�\�R�[�h���擾
		
		# �����s or �����؂�Ȃ甭�s�����[�����M
		if UcfUtil.nvl(user_entry.password_reminder_key) == '' or user_entry.password_reminder_expire is None or user_entry.password_reminder_expire < UcfUtil.getNow():
			user_entry.password_reminder_key = self.createNewReminderAuthCode()
			user_entry.password_reminder_expire = UcfUtil.add_minutes(UcfUtil.getNow(), expire_minutes)
			user_entry.date_changed = UcfUtil.getNow()
			user_entry.put()
			logging.info('publish new reminder auth code:' + str(user_entry.operator_id) + ':' + str(user_entry.password_reminder_key) + ':' + str(user_entry.password_reminder_expire))
			user_vo = user_entry.exchangeVo(self._timezone)
			OperatorUtils.editVoForSelect(self, user_vo)

			# �p�X���[�h���}�C���_�\�R�[�h�̒ʒm���[�����M
			self.sendReminderAuthCodeNotificationMail(user_vo)


	# �p�X���[�h���}�C���_�\�̔F�؃R�[�h���`�F�b�N
	def isValidReminderAuthCode(self, auth_code, user_vo):
		is_valid = False
		if user_vo.get('password_reminder_key', '') == auth_code and UcfUtil.getUTCTime(UcfUtil.getDateTime(UcfUtil.getHashStr(user_vo, 'password_reminder_expire')), self._timezone) >= UcfUtil.getNow():
			is_valid = True
		return is_valid

	# �p�X���[�h���}�C���_�\�R�[�h��V�K���s
	def createNewReminderAuthCode(self):
		s = '1234567890'
		token = ''
		for j in range(7):
			token += random.choice(s)
		return token

	# �p�X���[�h���}�C���_�\�̔F�؃R�[�h�����[���ł��ē�
	def sendReminderAuthCodeNotificationMail(self, user_vo):

		# ���[���������擾
		if oem_func.SP_CODE_WORKSMOBILE in self._sp_codes:
			mail_template_id = 'REMINDER_AUTH_CODE_NOTIFICATION_WORKSMOBILE'
		else:
			mail_template_id = 'REMINDER_AUTH_CODE_NOTIFICATION'

		if mail_template_id != '' and UcfUtil.getHashStr(user_vo, 'sub_mail_address') != '':

			# ���[���̌��������
			user_lang = None
			if user_vo.get('language', '') != '':
				user_lang = user_vo.get('language', '')
			if user_lang == '':
				user_lang = self.getDeptValue('language')
			mail_info = UcfMailUtil.getMailTemplateInfoByLanguageDef(self, mail_template_id, lang=user_lang)
			#mail_info = UcfMailUtil.getMailTemplateInfoByLanguageDef(self, mail_template_id)

			# ���o�l���Z�b�g
			mail_info['Sender'] = sateraito_inc.SENDER_EMAIL

			# �����ǉ�
			mail_info['To'] = UcfUtil.getHashStr(user_vo, 'sub_mail_address')
			mail_info['To'] = UcfUtil.getHashStr(mail_info, 'To').strip(',')
			mail_info['Cc'] = UcfUtil.getHashStr(mail_info, 'Cc').strip(',')
			mail_info['Bcc'] = UcfUtil.getHashStr(mail_info, 'Bcc').strip(',')

			# Reply-To�ɊǗ��҂̘A����A�h���X��ǉ�
			mail_info['ReplyTo'] = UcfUtil.getHashStr(mail_info, 'ReplyTo').strip(',') + ',' + self.getDeptValue('contact_mail_address')
			mail_info['ReplyTo'] = mail_info['ReplyTo'].strip(',')

			if UcfUtil.getHashStr(mail_info, 'To') != '' or UcfUtil.getHashStr(mail_info, 'Cc') != '' or UcfUtil.getHashStr(mail_info, 'Bcc') != '':
				# �������ݏ��쐬
				insert_vo = {}
				now = UcfUtil.getNowLocalTime(self._timezone)
				insert_vo['DATETIME'] = UcfUtil.nvl(now)
				insert_vo['DATE'] = now.strftime('%Y/%m/%d')
				insert_vo['TIME'] = now.strftime('%H:%M:%S')
				insert_vo['MASKED_MAIL_ADDRESS'] = self.createMaskedMailAddress(UcfUtil.getHashStr(user_vo, 'operator_id')).encode('utf8')
				insert_vo['REMINDER_AUTH_CODE'] = UcfUtil.getHashStr(user_vo, 'password_reminder_key').encode('utf8')
				# insert_vo['REMINDER_AUTH_CODE_EXPIRE_MINUTS'] = UcfUtil.getHashStr(user_vo, 'password_reminder_expire')
				insert_vo['REMINDER_AUTH_CODE_EXPIRE_MINUTS'] = UcfUtil.nvl(self.expire_minutes)
				
				# ���[�����M
				try:
					message_subject = UcfUtil.editInsertTag(UcfUtil.getHashStr(mail_info, 'Subject'), insert_vo, start_tag='[$$', end_tag='$$]')
					message_subject = message_subject.encode('utf8')
					message_body = UcfUtil.editInsertTag(UcfUtil.getHashStr(mail_info, 'Body'), insert_vo, start_tag='[$$', end_tag='$$]')
					message_body = message_body.encode('utf8')
					logging.info(mail_info)
					logging.info(UcfUtil.getHashStr(mail_info, 'Subject'))
					sateraito_mail.sendMail(to=UcfUtil.getHashStr(mail_info, 'To'), message_subject=message_subject,
											message_body=message_body, cc=UcfUtil.getHashStr(mail_info, 'Cc'),
											reply_to=UcfUtil.getHashStr(mail_info, 'ReplyTo'), is_html=True)
					logging.info('send reminder auth code notification mail. to ' + UcfUtil.getHashStr(mail_info, 'To'))
				#���O�����A�G���[�ɂ��Ȃ�
				except BaseException, e:
					self.outputErrorLog(e)



############################################################
## �p�X���[�h���}�C���_�\�p�o���f�[�V�����`�F�b�N�N���X 
############################################################
class PasswordReminderValidator(BaseValidator):

	_vc_error_code = ''
	_vc_error_sub_info = ''

	def validate(self, helper, vo, user_vo, profile_vo, edit_step):

		# ������
		self.init()

		check_name = ''
		check_key = ''
		check_value = ''
			

		if edit_step == 'request':

			########################
			check_name = helper.getMsg('VMSG_INPUT_REMINDER_USER_ID')
			check_key = 'user_id'
			check_value = UcfUtil.getHashStr(vo, check_key)
			# �K�{�`�F�b�N
			if not self.needValidator(check_value):
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
				self._vc_error_code = 'VC_NEED'
				self._vc_error_sub_info = ''

		elif edit_step == 'confirm':

			########################
			check_name = helper.getMsg('VMSG_INPUT_REMINDER_SUBMAILADDRESS')
			check_key = 'sub_mail_address'
			check_value = UcfUtil.getHashStr(vo, check_key)
			# �K�{�`�F�b�N
			if not self.needValidator(check_value):
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
				self._vc_error_code = 'VC_NEED'
				self._vc_error_sub_info = ''
			elif user_vo is not None and check_value.lower() != user_vo.get('sub_mail_address', '').lower():
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_INVALID_SUBMAILADDRESS_FOR_REMINDER')))
				self._vc_error_code = 'MSG_INVALID_SUBMAILADDRESS_FOR_REMINDER'
				self._vc_error_sub_info = ''

		elif edit_step == 'authcode':

			########################
			check_name = helper.getMsg('VMSG_INPUT_REMINDER_AUTHCODE')
			check_key = 'authcode'
			check_value = UcfUtil.getHashStr(vo, check_key)
			# �K�{�`�F�b�N
			if not self.needValidator(check_value):
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
				self._vc_error_code = 'VC_NEED'
				self._vc_error_sub_info = ''


		# ���ʃ`�F�b�N
		if self.total_count <= 0:
			if user_vo is None:
				check_name = helper.getMsg('VMSG_INPUT_REMINDER_USER_ID')
				check_key = 'user_id'
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_REMINDER_INVALID_USER_ID')))
				self._vc_error_code = 'MSG_REMINDER_INVALID_USER_ID'
				self._vc_error_sub_info = ''

			elif user_vo.get('sub_mail_address', '') == '':
				check_name = helper.getMsg('VMSG_INPUT_REMINDER_SUB_MAIL_ADDRESS')
				check_key = 'user_id'
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_EMPTY_SUBMAILADDRESS_FOR_REMINDER')))
				self._vc_error_code = 'EMPTY_SUBMAILADDRESS_FOR_REMINDER'
				self._vc_error_sub_info = ''

			# �p�X���[�h�ύX�������Ȃ��t���O�������Ă��Ȃ������`�F�b�N
			elif profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') == 'UNAVAILABLE':
				check_key = 'user_id'
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_UNAVAILABLE_PASSWORD_CHANGE')))
				self._vc_error_code = 'MSG_UNAVAILABLE_PASSWORD_CHANGE'
				self._vc_error_sub_info = ''

			# �Đݒ�R�[�h���`�F�b�N�i�l���Z�b�g����Ă���ꍇ���F�؃R�[�h���͈ȍ~�̉�ʑS�ĂŃ`�F�b�N�j
			elif UcfUtil.getHashStr(vo, 'authcode') != '' and not helper.isValidReminderAuthCode(UcfUtil.getHashStr(vo, 'authcode'), user_vo):
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_INVALID_AUTHCODE_FOR_REMINDER')))
				self._vc_error_code = 'MSG_INVALID_AUTHCODE_FOR_REMINDER'
				self._vc_error_sub_info = ''


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


