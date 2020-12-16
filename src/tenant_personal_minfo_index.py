# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
from ucf.utils.mailutil import UcfMailUtil
import sateraito_inc
import sateraito_func
import oem_func
from ucf.pages.operator import OperatorUtils
from ucf.pages.profile import ProfileUtils

class Page(TenantAppHelper):
	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'minfo'
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

			if False:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_UNAVAILABLE_SUBMAILADDRESS')))
				return

			if user_vo is None:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_USER_FOR_SUBMAILADDRESS')))
				return


			# �����J�ڐ�URL���w�肳��Ă����烊�_�C���N�g
			if ucffunc.redirectAutoRedirectURL(self, is_no_redirect=False):
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
				vc = Validator('')
				vc.validate(self, vo, user_vo, profile_vo)
				ucfp.voinfo.validator = vc
				# ���̓G���[���Ȃ���Γo�^����
				if ucfp.voinfo.validator.total_count <= 0:

					sub_mail_address = UcfUtil.getHashStr(req, 'sub_mail_address')

					# ���߂ă��[�U�f�[�^���擾
					entry = OperatorUtils.getData(self, UcfUtil.getHashStr(user_vo, 'unique_id'))
					if entry is None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_LOGIN_ACCOUNT_DATA')))
						return
					user_vo = entry.exchangeVo(self._timezone)										# user_vo�����ւ�
					user_vo['sub_mail_address'] = sub_mail_address
					# Vo���烂�f���Ƀ}�[�W
					entry.margeFromVo(user_vo, self._timezone)
					# �X�V�����A�X�V�҂̍X�V
					entry.updater_name = UcfUtil.nvl(self.getLoginID())
					entry.date_changed = UcfUtil.getNow()
					entry.put()

					# �T���L���[���[�����M
					self.sendNotificationMail(user_vo)

					# ������ꗗ�y�[�W�ɑJ��
					self.redirect('/a/' + self._tenant + '/personal/minfo/thanks')
					return

				# ���̓G���[������Ή�ʂɖ߂�
				else:
					ucfp.voinfo.setVo(vo, None, None, self)
			else:
				pass

			# CSRF�΍�:�g�[�N�����s
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY)

			ucfp.data['sub_mail_address'] = UcfUtil.getHashStr(user_vo, 'sub_mail_address')
			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# �A�N�Z�X�\���p���O�C����ʂŃ^�u���b�g�̏ꍇ�͂��������o���Ȃ�
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('personal_minfo_index.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

	def sendNotificationMail(self, user_vo):

			# ���[���������擾
			mail_template_id = 'SUB_MAIL_ADDRESS_REGIST_NOTIFICATION'

			if mail_template_id != '':

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
				mail_info['Bcc'] = UcfUtil.getHashStr(user_vo, 'operator_id')
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
					insert_vo['MAIL_ADDRESS'] = UcfUtil.getHashStr(user_vo, 'operator_id')
					insert_vo['SUB_MAIL_ADDRESS'] = UcfUtil.getHashStr(user_vo, 'sub_mail_address')

					#���[�����M
					try:
						UcfMailUtil.sendOneMail(to=UcfUtil.getHashStr(mail_info, 'To'), cc=UcfUtil.getHashStr(mail_info, 'Cc'), bcc=UcfUtil.getHashStr(mail_info, 'Bcc'), reply_to=UcfUtil.getHashStr(mail_info, 'ReplyTo'), sender=UcfUtil.getHashStr(mail_info, 'Sender'), subject=UcfUtil.getHashStr(mail_info, 'Subject'), body=UcfUtil.getHashStr(mail_info, 'Body'), body_html=UcfUtil.getHashStr(mail_info, 'BodyHtml'), data=insert_vo)
					#���O�����A�G���[�ɂ��Ȃ�
					except BaseException, e:
						self.outputErrorLog(e)


############################################################
## �o���f�[�V�����`�F�b�N�N���X 
############################################################
class Validator(BaseValidator):

	def validate(self, helper, vo, user_vo, profile_vo):

		# ������
		self.init()

		check_name = ''
		check_key = ''
		check_value = ''

		########################
		check_name = helper.getMsg('FLD_NEW_SUBMAILADDRESS')
		check_key = 'sub_mail_address'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# �K�{�`�F�b�N
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# ���[���A�h���X�`���`�F�b�N
		elif not self.mailAddressValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAILADDRESS'), (check_name)))

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


