# coding: utf-8

import webapp2, logging
from google.appengine.api import images
#from google.appengine.api.images import Image
#from google.appengine.api.images import ImagesServiceFactory
from google.appengine.ext import db
from ucf.utils.helpers import *
from ucf.utils.models import *
#from PIL import Image
from ucf.utils import loginfunc
from ucf.utils import ucffunc
from ucf.config.ucfconfig import *
from ucf.pages.file import *
from ucf.pages.dept import *
import sateraito_inc
import sateraito_func


# ��Ƃ̔w�i�摜�Ȃǂ��A�b�v���[�h
class Page(TenantAjaxHelperWithFileUpload):
	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'UPLOAD'
		
		# �t�@�C���A�b�v���[�h�ł�����w�肷���NG�Ȃ̂ŃR�����g�A�E�g
		# self.response.headers['Content-Type'] = 'application/json'
		try:
			req = UcfVoInfo.setRequestToVo(self)
			logging.info(req)
			
			# CSRF�΍�F�g�[�N���`�F�b�N
			if not self.checkCSRFToken(CSRF_TOKEN_KEY, self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN), without_refresh_token=True):
				self._code = 403
				self._msg = self.getMsg('MSG_CSRF_CHECK')
				self.responseAjaxResult()
				return
		
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

			# �}�C�y�[�W��icon�A�b�v�@�\�̂��߂����̃`�F�b�N�͂Ȃ��Ƃ���i��ʕ\���Ő��䂵�Ă���̂Łj
			## �L���Ń`�F�b�N
			#if sateraito_func.isFreeMode(self._tenant):
			#	self._code = 403
				self.responseAjaxResult()
				return
			#	self._msg = self.getMsg('MSG_NOAVAILABLE_FREE_APP')
			#	self.responseAjaxResult()
			#	return

			if self.isAdmin() == False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return

			# �f�U�C���^�C�v
			design_type = UcfUtil.nvl(self.getRequest('dtp'))
			if design_type == '':
				design_type = UcfConfig.TEMPLATE_DEFAULT_DESIGN_TYPE

			# �摜ID
			picture_id = UcfUtil.nvl(self.getRequest('picture_id'))
			# �摜ID�`�F�b�N
			#if picture_id not in ['logo', 'mainbg01', 'mainbg02', 'mainbg03', 'mainbg04', 'mainbg05', 'mainbg06', 'mainbg07', 'mainbg08', 'mainbg09', 'mainbg10']:
			#if picture_id not in ['icon', 'logo', 'mainbg01', 'mainbg02', 'mainbg03', 'mainbg04', 'mainbg05', 'mainbg06', 'mainbg07', 'mainbg08', 'mainbg09', 'mainbg10']:
			if picture_id not in ['boticon', 'icon', 'logo', 'mainbg01', 'mainbg02', 'mainbg03', 'mainbg04', 'mainbg05', 'mainbg06', 'mainbg07', 'mainbg08', 'mainbg09', 'mainbg10']:
				self._code = 400
				self._msg = self.getMsg('MSG_INVALID_PARAMETER',('picture_id'))
				self.responseAjaxResult()
				return

			file_id = self.request.get('file_id') 	# custom_id
			blob_data = self.request.get(file_id)
			
			logging.info(blob_data)

			# �`���`�F�b�N
			try:
				im = images.Image(blob_data) 
				image_format = im.format
				if image_format != 0 and image_format != 1:	# png or jpg
					logging.info('fail in try')
					self._code = 500
					self._msg = self.getMsg('MSG_INVALID_PICTURE_FORMAT')
					self.responseAjaxResult()
					return
			except images.NotImageError, e:
				logging.info('fail in except')
				self._code = 500
				self._msg = self.getMsg('MSG_INVALID_PICTURE_FORMAT')
				self.responseAjaxResult()
				return

			# �T�C�Y�`�F�b�N
			logging.info('size=' + str(len(blob_data)))
			if len(blob_data) > 1024000 - 100:		# 1MB����x
				self._code = 500
				self._msg = self.getMsg('MSG_TOO_LARGE_PICTURE_SIZE')
				self.responseAjaxResult()
				return

			# ��ƃ}�X�^����Ώۂ̊����f�[�^�L�[���擾
			data_key_field = ''
			file_name = ''
			content_type = None
			last_modified = ''
			# ���S
			if picture_id == 'logo':
				data_key_field = 'logo_data_key'
				file_name = 'Logo.png'
				content_type = 'image/png'
#				if blob_data:
#					blob_data = images.resize(blob_data, 295, 44)
			# ���O�C����ʔw�i�摜
			elif picture_id == 'mainbg01':
				data_key_field =  'login_background_' + design_type + '1_data_key'
				file_name = '01.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg02':
				data_key_field =  'login_background_' + design_type + '2_data_key'
				file_name = '02.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg03':
				data_key_field =  'login_background_' + design_type + '3_data_key'
				file_name = '03.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg04':
				data_key_field =  'login_background_' + design_type + '4_data_key'
				file_name = '04.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg05':
				data_key_field =  'login_background_' + design_type + '5_data_key'
				file_name = '05.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg06':
				data_key_field =  'login_background_' + design_type + '6_data_key'
				file_name = '06.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg07':
				data_key_field =  'login_background_' + design_type + '7_data_key'
				file_name = '07.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg08':
				data_key_field =  'login_background_' + design_type + '8_data_key'
				file_name = '08.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg09':
				data_key_field =  'login_background_' + design_type + '9_data_key'
				file_name = '09.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'mainbg10':
				data_key_field =  'login_background_' + design_type + '10_data_key'
				file_name = '10.jpg'
				content_type = 'image/jpeg'
#				if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
#					blob_data = images.resize(blob_data, 956, 532)
#				elif design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
#					blob_data = images.resize(blob_data, 320, 356)
			elif picture_id == 'icon':
				pass
			elif picture_id == 'boticon':
				pass

			if picture_id not in ['icon', 'boticon']:
				data_key = UcfUtil.nvl(self.getDeptInfo(True)[data_key_field])
			else:
				data_key = self.request.get('data_key')

			file_entry = None
			file_vo = None
			if data_key != '':
				file_entry = FileUtils.getDataEntryByDataKey(self, data_key)

			#logging.info(db.Blob(blob_data))

			# ����΍����ւ�
			if file_entry is not None:
				file_entry.blob_data = db.Blob(blob_data)
				file_entry.last_upload_date = UcfUtil.getNow()
				file_entry.last_upload_operator_id = UcfUtil.nvl(self.getLoginID())
				file_entry.last_upload_operator_unique_id = UcfUtil.nvl(self.getLoginOperatorUniqueID())
#				file_vo['upload_operator_id'] = login_operator_id
#				file_vo['upload_operator_unique_id'] = login_operator_unique_id
				file_entry.updater_name = UcfUtil.nvl(self.getLoginID())
				file_entry.date_changed = UcfUtil.getNow()
				file_entry.put()

			# �f�[�^�L�[���Ȃ����A�t�@�C���G���g���[���Ȃ���ΐV�K�쐬
			elif file_entry is None:

				if picture_id not in ['icon', 'boticon']:
					dept = DeptUtils.getDeptEntryByUniqueID(self, UcfUtil.nvl(self.getDeptInfo(True)['unique_id']))
					dept_vo = dept.exchangeVo(self._timezone)
					DeptUtils.editVoForSelect(self, dept_vo)

				unique_id = UcfUtil.guid()
				data_key = UcfUtil.guid()	# data_key ���ꉞ�쐬���Ȃ���
				file_vo = {}
				file_vo['unique_id'] = unique_id
				file_vo['data_key'] = data_key
				file_vo['data_kind'] = 'picture'
				file_vo['data_type'] = 'BINARY'
				#file_vo['content_type'] = content_type
				file_vo['deal_status'] = ''
				file_vo['status'] = ''

				FileUtils.editVoForRegist(self, file_vo, UcfConfig.EDIT_TYPE_NEW)

				file_entry = UCFMDLFile(unique_id=unique_id,key_name=FileUtils.getKey(self, file_vo))
				file_entry.margeFromVo(file_vo, self._timezone)
				file_entry.blob_data = db.Blob(blob_data)
				file_entry.last_upload_date = UcfUtil.getNow()
				file_entry.last_upload_operator_id = UcfUtil.nvl(self.getLoginID())
				file_entry.last_upload_operator_unique_id = UcfUtil.nvl(self.getLoginOperatorUniqueID())
				file_entry.upload_operator_id = UcfUtil.nvl(self.getLoginID())
				file_entry.upload_operator_unique_id = UcfUtil.nvl(self.getLoginOperatorUniqueID())
				file_entry.updater_name = UcfUtil.nvl(self.getLoginID())
				file_entry.date_changed = UcfUtil.getNow()
				file_entry.creator_name = UcfUtil.nvl(self.getLoginID())
				file_entry.date_created = UcfUtil.getNow()
				file_entry.put()

				# ��ƃ}�X�^��data_key���Z�b�g
				if picture_id not in ['icon', 'boticon']:
					dept_vo[data_key_field] = data_key
					DeptUtils.editVoForRegist(self, dept_vo, None, UcfConfig.EDIT_TYPE_RENEW)
					dept.margeFromVo(dept_vo, self._timezone)
					dept.updater_name = UcfUtil.nvl(self.getLoginID())
					dept.date_changed = UcfUtil.getNow()
					dept.put()

			# ������memcache���X�V���邱�Ƃɂ��A�b�v�シ���ɔ��f�����悤�ɂ���Ɠ����ɁAmemcache�̎��Ԃ𒷂����ĂقƂ��DB�ɃA�N�Z�X����Ȃ��悤�ɂ���
			if picture_id in ['icon', 'boticon']:
				memcache_key = 'tenant_picture?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key
				memcache_key2 = 'tenant_picture2?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key
				memcache_key3 = 'tenant_picture3?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key
				memcache_key4 = 'tenant_picture4?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key
				memcache_time = 3600 * 24
				memcache.set(key=memcache_key, value=file_entry.blob_data, time=memcache_time)
				memcache.set(key=memcache_key2, value=content_type, time=memcache_time)
				memcache.set(key=memcache_key3, value=file_name, time=memcache_time)
				memcache.set(key=memcache_key4, value=str(file_entry.last_upload_date), time=memcache_time)
			else:
				memcache_key = 'tenant_picture?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache_key2 = 'tenant_picture2?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache_key3 = 'tenant_picture3?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache_key4 = 'tenant_picture4?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache_time = 3600 * 24
				memcache.set(key=memcache_key, value=file_entry.blob_data, time=memcache_time)
				memcache.set(key=memcache_key2, value=content_type, time=memcache_time)
				memcache.set(key=memcache_key3, value=file_name, time=memcache_time)
				memcache.set(key=memcache_key4, value=str(file_entry.last_upload_date), time=memcache_time)
				# memcache���X�V
				self.getDeptInfo(is_force_select=True)

			# �I�y���[�V�������O�o��
			operation_log_detail = {}
			operation_log_detail['design_type'] = design_type
			operation_log_detail['picture_id'] = picture_id
			UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_DASHBOARD, UcfConfig.OPERATION_TYPE_ADD_PICTURE, '', '', self.getClientIPAddress(), json.JSONEncoder().encode(operation_log_detail))

			self._code = 0
			self.responseAjaxResult(ret_value={'data_key':data_key})

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)