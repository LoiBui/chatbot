# coding: utf-8

import webapp2, logging, json
from ucf.utils import loginfunc
from ucf.config.ucfconfig import *
from ucf.utils.helpers import *
from ucf.utils.models import FileUpSettingConfig
import sateraito_inc
import sateraito_func
import sateraito_db
from ucf.pages.operator import *
import directcloudbox_func

_gnaviid = 'DASHBOARD'
_leftmenuid = 'INDEX'


class Page(TenantAppHelper):
	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'UPLOAD'
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

			# �p�X���[�h����ύX�t���O���`�F�b�N
			if self.checkForcePasswordChange() == False:
				return

			# �����`�F�b�N
			#if self.isAdmin() == False:
			if self.isAdmin() == False or self._design_type != UcfConfig.VALUE_DESIGN_TYPE_PC:
			#				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				# �����J�ڐ�URL���w�肳��Ă����烊�_�C���N�g�i�Ǘ��҂���Ȃ���΁j
				if ucffunc.redirectAutoRedirectURL(self, profile_vo, is_force_deal=True):
					return

				# ���̃y�[�W���g���w�肳���Ɩ������[�v�ɂȂ�̂ł��̏ꍇ�̓}�C�y�[�W�ɔ�΂��i�O�̂��߁j
				# �w��Ȃ��Ȃ�p�[�\�i���i�}�C�y�[�W�j�g�b�v�Ƀ��_�C���N�g
				#self.redirect('/a/' + self._tenant + '/personal/')
				ucffunc.routerURLPermission(self)
				return

			# �����ň�x�L���b�V���ł͂Ȃ��ŐV�̏����擾���Ă���
			self.getDeptInfo(is_force_select=True)

			# �e�i���g�����擾
			tenant_entry = sateraito_func.getTenantEntry(self._tenant)
			if tenant_entry is None or (tenant_entry.is_disable is not None and tenant_entry.is_disable == True):
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_TENANT'), ()))
				return

			available_users = tenant_entry.available_users
			charge_start_date = tenant_entry.charge_start_date if tenant_entry.charge_start_date is not None else ''
			cancel_date = tenant_entry.cancel_date if tenant_entry.cancel_date is not None else ''
			if charge_start_date != '':
				is_free_mode = UcfUtil.set_time(UcfUtil.getNowLocalTime(self._timezone), 0, 0, 0) < UcfUtil.set_time(
					UcfUtil.getDateTime(charge_start_date), 0, 0, 0)
			else:
				is_free_mode = True
			if cancel_date != '':
				is_canceled = UcfUtil.set_time(UcfUtil.getNowLocalTime(self._timezone), 0, 0, 0) >= UcfUtil.set_time(
					UcfUtil.getDateTime(cancel_date), 0, 0, 0)
			else:
				is_canceled = False

			cancel_date_str = ''
			if cancel_date != '':
				cancel_date_str = UcfUtil.add_seconds(UcfUtil.set_time(UcfUtil.getDateTime(cancel_date), 0, 0, 0), -1).strftime(
					'%Y/%m/%d')

			# ���p���[�U�[�����擾
			#active_users = UCFMDLOperator.getActiveUserAmount(self._tenant)
			active_users = sateraito_db.User.getActiveUserAmount(self._tenant)

			# ���C�Z���X���̏���ɋߕt���Ă���i���邢�͒����Ă���j�|�̌x�����o��
			is_disp_warning_about_license = False
			is_disp_error_about_license = False
			RATIO_OF_DISP_WARNING_ABOUT_LICENSE = 0.8        # ���C�Z���X����8���ɒB���Ă���x�����o��

			if available_users >= 0:
				if available_users < active_users:
					is_disp_error_about_license = True
				elif (available_users * RATIO_OF_DISP_WARNING_ABOUT_LICENSE) < active_users:
					is_disp_warning_about_license = True

			attentions = []
			vo = {}

			lineworks_config = FileUpSettingConfig.getSettingConfigByChannelKind('lineworksbot')
			if lineworks_config:
				lineworks_config = lineworks_config.exchangeVo(self._timezone)
				
			directcloudbox_config = FileServerSettingConfig.getConfig('directcloudbox')
			if directcloudbox_config:
				directcloudbox_config = directcloudbox_config.exchangeVo(self._timezone)
			logging.debug(directcloudbox_config)

			ucfp = UcfTenantParameter(self)

			# add data API
			logging.info(vo)
			ucfp.voinfo.setVo(vo, None, None, self)

			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('FILEUP_EXPLAIN_DASHBOARD_HEADER')]
			ucfp.data['attentions'] = attentions

			# ucfp.data['federated_domains'] = UcfUtil.listToCsv(sateraito_func.getFederatedDomainList(tenant, is_with_cache=True))
			# CSRF�΍�:�g�[�N�����s
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY)
			
			logging.info(ucfp.data['token'])

			# ����ꗗ
			language_list = []
			for language in sateraito_func.ACTIVE_LANGUAGES:
				language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])

			## �h���C���R���{�{�b�N�X���
			#federated_domains = sateraito_func.getFederatedDomainList(tenant, is_with_cache=True)
			#not_checked_domains = []
			#for domain_name in federated_domains:
			#	not_checked_domains.append(domain_name.lower())
			#domaincombobox_config_text = self.getDeptValue('domaincombobox_config')
			#domaincombobox_config = []
			#if domaincombobox_config_text is not None and domaincombobox_config_text != '':
			#	domaincombobox_config_datastore = JSONDecoder().decode(domaincombobox_config_text)
			#	for domaininfo in domaincombobox_config_datastore:
			#		if domaininfo.get('domain_name', '') in federated_domains:
			#			domaincombobox_config.append(domaininfo)
			#		if domaininfo.get('domain_name', '').lower() in not_checked_domains:
			#			not_checked_domains.remove(domaininfo.get('domain_name', '').lower())
			#else:
			#	domaincombobox_config = []
			#for domain_name in not_checked_domains:
			#	domaincombobox_config.append({
			#		'domain_name':domain_name,
			#		'is_hidden':False,
			#	})
			
			template_vals = {
				'ucfp': ucfp,
				'language_disp': self.getMsg(sateraito_func.LANGUAGES_MSGID.get(self._language, 'VMSG_LANG_DEFAULT')),
				'language_list': json.JSONEncoder().encode(language_list),
				# 'domaincombobox_config':JSONEncoder().encode(domaincombobox_config),
				'is_free_mode': is_free_mode,
				'is_canceled': is_canceled,
				'cancel_date': cancel_date_str,
				'charge_start_date': charge_start_date,
				'active_users': active_users,
				'available_users': available_users,
				'is_disp_warning_about_license': is_disp_warning_about_license,
				'is_disp_error_about_license': is_disp_error_about_license,
				'lineworks_config': lineworks_config,
				'directcloudbox_config': directcloudbox_config
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			# #fix run on PC
			# self._design_type = UcfConfig.VALUE_CAREER_TYPE_PC

			self.render('index.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/', Page), ('/a/([^/]*)', Page)], debug=sateraito_inc.debug_mode,
	config=sateraito_func.wsgi_config)
