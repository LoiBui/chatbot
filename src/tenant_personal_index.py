# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
import sateraito_inc
import sateraito_func
from ucf.pages.operator import *
from ucf.pages.profile import ProfileUtils
from ucf.pages.mypagelink import MyPageLinkUtils

class Page(TenantAppHelper):

	def getSharePointURLPartsByMailAddress(self, mail_address):
		result = ''
		sp = mail_address.split('@')
		result = sp[0]
		if len(sp) >= 2:
			domain = sp[1]
			result = result + '_' + sp[1].replace('.', '_')
		return result

	def processOfRequest(self, tenant):
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

			if profile_vo is not None:
				ProfileUtils.editVoForSelect(self, profile_vo, with_expand_mypage_links=True)

			# �����J�ڐ�URL���w�肳��Ă����烊�_�C���N�g
			if ucffunc.redirectAutoRedirectURL(self, profile_vo):
				return

			ucfp = UcfTenantParameter(self)

			is_available_matrixauth = profile_vo is not None and profile_vo['login_type'] == 'DCARD'
			# �p�X���[�h�ύX�̃����N��\�����邩�ǂ���
			ucfp.data['is_available_password_change'] = not is_available_matrixauth and (profile_vo is None or profile_vo['passwordchange_unavailable_flag'] != 'UNAVAILABLE')
			# �����^�C���E�����_���p�X���[�h PIN�R�[�h�ύX�̃����N��\�����邩�ǂ���
			ucfp.data['is_available_matrixauth'] = is_available_matrixauth and (profile_vo is None or profile_vo['passwordchange_unavailable_flag'] != 'UNAVAILABLE')
			# �A�N�Z�X�\���̃����N��\�����邩�ǂ����i�܂��̓V���v���ɃA�N�Z�X���䂪�L���Ȃ�S�\���j
#			ucfp.data['is_available_access_apply'] = profile_vo and profile_vo['acsctrl_active_flag'] == 'ACTIVE' and profile_vo['device_check_flag'] == 'ACTIVE' and UcfUtil.getHashStr(vo, UcfConfig.REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY) == ''
			ucfp.data['is_available_access_apply'] = profile_vo and profile_vo['acsctrl_active_flag'] == 'ACTIVE'
			# �\���̃��[���A�h���X�̃����N��\�����邩�ǂ���
			ucfp.data['is_available_sub_mailaddress_regist'] = True
			# �T�[�r�XURL�ƕ\���t���O

			icon_info = []		# Nexus7�f�U�C���p�Ȃ̂�Apps�ňȊO�͕s�v...
			icon_cnt = 0
			mypage_links = {}
			custom_links = []

			if profile_vo is not None:
				if self._tenant.endswith('.my.salesforce.com'):
					mypage_links['mypage_links_ck_mydomain'] = profile_vo.get('mypage_links_ck_mydomain', False)
					mypage_links['mypage_links_lk_mydomain'] = 'https://' + self._tenant
					# �����N
					if profile_vo.get('mypage_links_ck_mydomain', False):
						icon_info.append({'link':True, 'icon':'mydomain', 'url':'https://' + self._tenant})
						icon_cnt += 1

				# �}�C�y�[�W�̃J�X�^�������N�ݒ���擾
				mypagelink_info = None
				mypagelink_unique_id = MyPageLinkUtils.DEFAULT_UNIQUE_ID
				mypagelink_entry = MyPageLinkUtils.getData(self, mypagelink_unique_id)
				if mypagelink_entry is not None:
					mypagelink_vo = mypagelink_entry.exchangeVo(self._timezone)					# �����f�[�^��Vo�ɕϊ�
					MyPageLinkUtils.editVoForSelect(self, mypagelink_vo)		# �f�[�^���H�i�擾�p�j
					link_info_json = UcfUtil.getHashStr(mypagelink_vo, 'link_info')
					if link_info_json != '':
						mypagelink_info = JSONDecoder().decode(link_info_json)
						for link_data in mypagelink_info:
							link = link_data.get('link')
							if profile_vo.get('mypage_links_ck_' + link.get('id', ''), False):
								custom_links.append({
										'name':link.get('name', ''),
										'url':link.get('url', ''),
										'icon':link.get('icon', ''),
									})

			logging.info(custom_links)

			# �p�X���[�h�ύX�A�C�R��
			if ucfp.data['is_available_password_change']:
				icon_info.append({'link':True, 'icon':'password', 'url':'/a/' + self._tenant + '/personal/password/'})
				icon_cnt += 1
			# �[���\���A�C�R���i�A�C�Y�lNexus7�A�g�Ȃ�\�����Ȃ��j
			if ucfp.data['is_available_access_apply'] and self.getDeptInfo()['hide_access_apply_link_flag'] != 'HIDDEN':
				icon_info.append({'link':True, 'icon':'accessapply', 'url':'/a/' + self._tenant + '/acs/apply'})
				icon_cnt += 1
			# �\���̃��[���A�h���X�o�^�A�C�R��
			if ucfp.data['is_available_sub_mailaddress_regist'] and self.getDeptInfo()['hide_regist_sub_mail_address_link_flag'] != 'HIDDEN':
				icon_info.append({'link':True, 'icon':'submailaddress', 'url':'/a/' + self._tenant + '/personal/minfo/'})
				icon_cnt += 1
			# �����^�C�������_���p�X���[�h PIN�R�[�h�ύX
			if ucfp.data['is_available_matrixauth']:
				icon_info.append({'link':True, 'icon':'matrixauth', 'url':'/a/' + self._tenant + '/personal/otp/'})
				icon_cnt += 1

						

			# 6 * 2 = 12 ���A��`
			for i in range(12 - icon_cnt):
				icon_info.append({'link':False, 'icon':'no', 'url':'#'})
				icon_cnt += 1

			# �Z�L�����e�B�u���E�U��\�����邩�ǂ����iPC�͕\�����Ȃ��A�X�}�z�ƃ^�u���b�g�͕\���j
			#ucfp.data['is_display_securitybrowser_link'] = self._design_type == 'sp' or self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET
			ucfp.data['is_display_securitybrowser_link'] = False
			# �Z�L�����e�B�u���E�U�����N
			ucfp.data['securitybrowser_link'] = ''
			if self._is_android:
				ucfp.data['securitybrowser_link'] = 'https://play.google.com/store/apps/details?id=xxxxxx'
			elif self._is_ios:
				ucfp.data['securitybrowser_link'] = 'https://itunes.apple.com/app/idxxxxxx'


			# nexus7���ǂ����iSalesforce�łł͂Ƃ肠�����Ή����Ȃ��j
			#is_nexus7 = self.getUserAgent().lower().find('nexus 7 ') >= 0
			is_nexus7 = False

			if (is_nexus7 or self.request.get('dtp') == 'nexus7') and self._design_type != 'm':
				template_vals = {
					'ucfp' : ucfp
					,'icon_info':icon_info
					,'mypage_links': mypage_links
					,'custom_links': custom_links
					,'exist_custom_links': custom_links is not None and len(custom_links) > 0
					,'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET		# �A�N�Z�X�\���p���O�C����ʂŃ^�u���b�g�̏ꍇ�͂��������o���Ȃ�
					
				}
				self.appendBasicInfoToTemplateVals(template_vals)
				self.render('personal_index_nexus7.html', self._design_type, template_vals)
			else:
				template_vals = {
					'ucfp' : ucfp
					,'mypage_links': mypage_links
					,'custom_links': custom_links
					,'exist_custom_links': custom_links is not None and len(custom_links) > 0
					,'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET		# �A�N�Z�X�\���p���O�C����ʂŃ^�u���b�g�̏ꍇ�͂��������o���Ȃ�
				}
				self.appendBasicInfoToTemplateVals(template_vals)
				self.render('personal_index.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)