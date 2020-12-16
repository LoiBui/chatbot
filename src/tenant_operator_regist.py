# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from simplejson.encoder import JSONEncoder
import sateraito_inc
import sateraito_func
from ucf.pages.operator import *
from ucf.pages.operator_group import *

# �_�b�V���{�[�h�ɕύX
#_gnaviid = 'ACCOUNT'
_gnaviid = 'DASHBOARD'
_leftmenuid = 'REGIST'
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

			# �u���E�U�ɂ��uemployee_id�v�Ɓupassword�v�̎����Z�b�g��h�~���邽�߁A�uemployee_id�v����̏ꍇ�Ƀ_�~�[�̋󔒂��Z�b�g���Ă����i���׍H... �����ŃN���A�j 2015.09.01
			# �O�̂���TRIM
			#if req.get('employee_id', '') == '\t':
			#	req['employee_id'] = ''
			#if req.has_key('employee_id'):
			#	req['employee_id'] = req['employee_id'].strip()
			if req.has_key('federation_identifier'):
				req['federation_identifier'] = req['federation_identifier'].strip()

			# �`�F�b�N�{�b�N�X�l�␳�iTODO �{���̓t�����g����POST����悤��ExtJs�Ȃǂŏ������ׂ������}���j
			OperatorUtils.setNotPostValue(self, req)
			
			# �V�K or �ҏW or �폜
			edit_type = UcfUtil.getHashStr(req, UcfConfig.QSTRING_TYPE)
			# �R�s�[�V�K
			edit_type2 = UcfUtil.getHashStr(req, UcfConfig.QSTRING_TYPE2)
			# �X�e�[�^�X
			edit_status = UcfUtil.getHashStr(req, UcfConfig.QSTRING_STATUS)
			# ���j�[�N�L�[
			unique_id = UcfUtil.getHashStr(req, UcfConfig.QSTRING_UNIQUEID)
			if (edit_type == UcfConfig.EDIT_TYPE_RENEW or edit_type == UcfConfig.EDIT_TYPE_DELETE or edit_type2 == UcfConfig.EDIT_TYPE_COPYNEWREGIST) and unique_id == '':
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
				return

			ucfp = UcfTenantParameter(self)
			vo = {}
			entry_vo = {}
			if edit_status == UcfConfig.VC_CHECK:

				# CSRF�΍�F�g�[�N���`�F�b�N
				if not self.checkCSRFToken(CSRF_TOKEN_KEY + (unique_id if edit_type2 != UcfConfig.EDIT_TYPE_COPYNEWREGIST else ''), self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN)):
					self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_CSRF_CHECK')))
					return

				# �폜�����̏ꍇ
				if edit_type == UcfConfig.EDIT_TYPE_DELETE:
					entry = OperatorUtils.getData(self, unique_id)
					if entry is None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
						return
					entry_vo = entry.exchangeVo(self._timezone)										# �����f�[�^��Vo�ɕϊ�
					# �ϑ��Ǘ��҂̏ꍇ�͎������A�N�Z�X�ł���Ǘ��O���[�v�����`�F�b�N
					if self.isOperator() and not ucffunc.isDelegateTargetManagementGroup(UcfUtil.getHashStr(entry_vo, 'management_group'), UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())):
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
						return

					# ���̃��[�U�����������o�[�Ɏ��O���[�v���烁���o�[���폜
					OperatorGroupUtils.removeOneMemberFromBelongGroups(self, UcfUtil.getHashStr(entry_vo, 'operator_id_lower'))
					## ���̃��[�U�����������o�[�Ɏ��g�D���烁���o�[���폜
					#OrgUnitUtils.removeMemberFromBelongOrgUnits(self, [UcfUtil.getHashStr(entry_vo, 'operator_id_lower')], None)
					# �폜�i���g�����U�N�V�����͐����f�����b�g�������̂Ŏg�p���Ȃ��j
					entry.delete()
					## ���[�U�[���L���b�V�����N���A
					#UCFMDLOperator.clearActiveUserAmountCache(tenant)
					# �I�y���[�V�������O�o��
					UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_OPERATOR, UcfConfig.OPERATION_TYPE_REMOVE, entry_vo.get('operator_id', ''), entry_vo.get('unique_id', ''), self.getClientIPAddress(), '')
					# ������ꗗ�y�[�W�ɑJ��
					# �_�b�V���{�[�h�ɑJ�ڂɕύX
					#self.redirect('/a/' + self._tenant + '/operator/')
					self.redirect('/a/' + self._tenant + '/')
					return

				# �V�K�o�^�̏ꍇ
				elif edit_type == UcfConfig.EDIT_TYPE_NEW:
					# Request����Vo���쐬
					UcfUtil.margeHash(vo, req)				# Request����̏���Vo�Ƀ}�[�W
					# �p�X���[�h�X�V�t���O�ɂ���ăp�X���[�h�㏑�����邩�ǂ����̐���
					if UcfUtil.getHashStr(vo, 'PasswordUpdateFlag') != 'UPDATE':
						vo['password'] = ''
					#if UcfUtil.getHashStr(vo, 'Password1UpdateFlag') != 'UPDATE':
					#	vo['password1'] = ''
					#if UcfUtil.getHashStr(vo, 'MatrixAuthPinCodeUpdateFlag') != 'UPDATE':
					#	vo['matrixauth_pin_code'] = ''

				# �ҏW�̏ꍇ
				elif edit_type == UcfConfig.EDIT_TYPE_RENEW:
					entry = OperatorUtils.getData(self, unique_id)
					if entry is None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
						return

					entry_vo = entry.exchangeVo(self._timezone)										# �����f�[�^��Vo�ɕϊ�
					OperatorUtils.editVoForSelect(self, entry_vo, is_with_parent_group_info=True)		# �f�[�^���H�i�擾�p�j
					UcfUtil.margeHash(vo, entry_vo)									# �����f�[�^��Vo�ɃR�s�[
					UcfUtil.margeHash(vo, req)										# Request����̏���Vo�Ƀ}�[�W
					# �p�X���[�h�X�V�t���O�ɂ���ăp�X���[�h�㏑�����邩�ǂ����̐���
					if UcfUtil.getHashStr(vo, 'PasswordUpdateFlag') != 'UPDATE':
						vo['password'] = entry_vo['password']
					#if UcfUtil.getHashStr(vo, 'Password1UpdateFlag') != 'UPDATE':
					#	vo['password1'] = entry_vo['password1']
					#if UcfUtil.getHashStr(vo, 'MatrixAuthPinCodeUpdateFlag') != 'UPDATE':
					#	vo['matrixauth_pin_code'] = entry_vo['matrixauth_pin_code']

				else:
					# �G���[�y�[�W�ɑJ��
					self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
					return

				# ���̓`�F�b�N
				vc = OperatorValidator(edit_type, self.isOperator() and self.getLoginOperatorDelegateManagementGroups() != '', self.getLoginOperatorDelegateManagementGroups().split(',') if self.getLoginOperatorDelegateManagementGroups() != '' else None)
				# AD�A�g�p�X���[�h��������P�p�Ή��F��Ńp�X���[�h�X�V���ȊO�̓p�X���[�h�`�F�b�N���Ȃ��悤�ɑΉ� 2017.03.17
				is_without_password_check = UcfUtil.getHashStr(vo, 'PasswordUpdateFlag') != 'UPDATE'
				vc.validate(self, vo, self.getLoginOperatorMailAddress(), is_without_password_check=is_without_password_check)
				ucfp.voinfo.validator = vc
				# ���̓G���[���Ȃ���Γo�^����
				if ucfp.voinfo.validator.total_count <= 0:

					# �X�V�����`�F�b�N�i�ҏW���̂݁j
					if edit_type == UcfConfig.EDIT_TYPE_RENEW and not self.checkDateChanged(entry):
						# �G���[�y�[�W�ɑJ��
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_ALREADY_UPDATED_DATA')))
						return

					# �I�y���[�V�������O�ڍחp�ɍX�V�t�B�[���h���擾�i���H�O�ɔ�r���Ă����j
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						is_diff = True
						diff_for_operation_log = []
					else:
						is_diff, diff_for_operation_log = OperatorUtils.isDiff(self, vo, entry_vo)

					# ���H�f�[�^
					OperatorUtils.editVoForRegist(self, vo, entry_vo, edit_type)

					# �V�K�o�^�ꍇ���f����V�K�쐬
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						unique_id = UcfUtil.guid()
						vo['unique_id'] = unique_id
						entry = UCFMDLOperator(unique_id=unique_id,id=OperatorUtils.getKey(self, vo))

					# Vo���烂�f���Ƀ}�[�W
					entry.margeFromVo(vo, self._timezone)


					# �X�V�����A�X�V�҂̍X�V
					entry.updater_name = UcfUtil.nvl(self.getLoginID())
					entry.date_changed = UcfUtil.getNow()

					# �V�K�o�^�ꍇ���j�[�N�h�c�𐶐�
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						# �쐬�����A�쐬�҂̍X�V
						entry.creator_name = UcfUtil.nvl(self.getLoginID())
						entry.date_created = UcfUtil.getNow()

					########################
					# �e�O���[�v
					parent_groups = []
					parent_group_info = OperatorUtils.getParentGroupInfoFromRequest(vo)
					if parent_group_info is not None:
						for member in parent_group_info:
							parent_groups.append(UcfUtil.getHashStr(member, 'MailAddress').lower())

					# �e�O���[�v�����X�V
					add_groups, del_groups = OperatorGroupUtils.setOneUserToBelongGroups(self, UcfUtil.getHashStr(vo, 'operator_id_lower'), parent_groups)
					# �X�V�����i���g�����U�N�V�����͐����f�����b�g�������̂Ŏg�p���Ȃ��j
					entry.put()
					# UserEntry�Ƀ��R�[�h�ǉ�
					sateraito_func.addUpdateUserEntryTaskQueue(tenant, entry)
					## ���[�U�[���L���b�V�����N���A
					#if edit_type == UcfConfig.EDIT_TYPE_NEW:
					#	UCFMDLOperator.clearActiveUserAmountCache(tenant)

					# �I�y���[�V�������O�o��
					operation_log_detail = {}
					if edit_type == UcfConfig.EDIT_TYPE_RENEW:
						operation_log_detail['fields'] = diff_for_operation_log
					operation_log_detail['add_groups'] = add_groups
					if edit_type == UcfConfig.EDIT_TYPE_RENEW:
						operation_log_detail['del_groups'] = del_groups
					UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_OPERATOR, UcfConfig.OPERATION_TYPE_ADD if edit_type == UcfConfig.EDIT_TYPE_NEW else UcfConfig.OPERATION_TYPE_MODIFY, vo.get('operator_id', ''), vo.get('unique_id', ''), self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))

					# ������ꗗ�y�[�W�ɑJ��
					# �_�b�V���{�[�h�ɑJ�ڂɕύX
					#self.redirect('/a/' + self._tenant + '/operator/')
					self.redirect('/a/' + self._tenant + '/')
					return

				# ���̓G���[������Ή�ʂɖ߂�
				else:

					for k,v in vc.msg.iteritems():
						logging.info(k)
						logging.info(v)



					ucfp.voinfo.setVo(vo, OperatorViewHelper(), None, self)

			# ����\��
			else:
				# �R�s�[�V�K
				if edit_type2 == UcfConfig.EDIT_TYPE_COPYNEWREGIST:
					entry = OperatorUtils.getData(self, unique_id)
					if entry is None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
						return

					vo = entry.exchangeVo(self._timezone)					# �����f�[�^��Vo�ɕϊ�
					OperatorUtils.editVoForSelect(self, vo, is_with_parent_group_info=True)	# �f�[�^���H�i�擾�p�j

					# �R�s�[�V�K�Ȃ̂ŕs�v�ȃf�[�^���폜
					OperatorUtils.removeFromVoForCopyRegist(self, vo)

					ucfp.voinfo.setVo(vo, None, None, self)

				else:
					# �V�K
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						OperatorUtils.editVoForDefault(self, vo)		# �f�[�^���H�i�����l�p�j
					# �ҏW
					elif edit_type == UcfConfig.EDIT_TYPE_RENEW:
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

					else:
						# �G���[�y�[�W�ɑJ��
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
						return

					ucfp.voinfo.setVo(vo, None, None, self)

			# �u���E�U�ɂ��uemployee_id�v�Ɓupassword�v�̎����Z�b�g��h�~���邽�߁A�uemployee_id�v����̏ꍇ�Ƀ_�~�[�̋󔒂��Z�b�g���Ă����i���׍H... ����Focus���ɃN���A�j 2015.09.01
			#if vo is not None and vo.get('employee_id', '') == '':
			#	vo['employee_id'] = '\t'
			#if vo is not None and vo.get('federation_identifier', '') == '':
			#	vo['federation_identifier'] = '\t'
			# CSRF�΍�:�g�[�N�����s
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY + (unique_id if edit_type2 != UcfConfig.EDIT_TYPE_COPYNEWREGIST else ''))

			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATOR_HEADER')]
			ucfp.data[UcfConfig.QSTRING_TYPE] = UcfUtil.nvl(self.getRequest(UcfConfig.QSTRING_TYPE))

			# �}���`�h���C�����̃h���C�����X�g���쐬
			#domain_list = []
			#domain_list.extend(UcfUtil.csvToList(UcfUtil.getHashStr(self.getDeptInfo(), 'federated_domains')))
			#domain_list = sateraito_func.getFederatedDomainList(self._tenant, is_with_cache=True)

			# ����ꗗ
			language_list = []
			for language in sateraito_func.ACTIVE_LANGUAGES:
				language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])

			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'is_exist_delegate_management_groups':True if len(UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())) > 0 else False,
				#'is_multidomain':True if len(domain_list) > 1 else False,
				#'domain_list':JSONEncoder().encode(domain_list),
				'language_list':JSONEncoder().encode(language_list)
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('operator_regist.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


