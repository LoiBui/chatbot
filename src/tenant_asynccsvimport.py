# coding: utf-8

import webapp2
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
from google.appengine.api import taskqueue
import csv
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils import loginfunc
from ucf.pages.file import *
import sateraito_inc
import sateraito_func

# CSV�C���|�[�g�F�񓯊�
class AsyncImportPage(blobstore_handlers.BlobstoreUploadHandler, TenantAjaxHelperWithFileUpload):
	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'GENERAL'
		# �t�@�C���A�b�v���[�h�ł�����w�肷���NG�Ȃ̂ŃR�����g�A�E�g �ˁ@BlobstoreUploadHandler�g���ꍇ�͑��v���ۂ�
		# IE��json�t�@�C�����_�E�����[�h����Ă��܂��̂ŕύX 2013.09.12
		#self.response.headers['Content-Type'] = 'application/json'
		self.response.headers['Content-Type'] = 'text/html'
		try:
		
			# CSRF�΍�F�g�[�N���`�F�b�N
			if not self.checkCSRFToken(CSRF_TOKEN_KEY, self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN)):
				self._code = 403
				self._msg = self.getMsg('MSG_CSRF_CHECK')
				self.responseAjaxResult()
				return
		
			if self.isValidTenant(not_redirect=True) == False:
				self._code = 400
				self._msg = self.getMsg('MSG_NOT_INSTALLED', (self._tenant))
				self.responseAjaxResult()
				return

			if loginfunc.checkLogin(self, not_redirect=True, not_check_authid=True) == False:			# not_check_authid=True�cBlobstoreUploadHandler�̉e����Cookie����l���擾�ł��Ȃ��̂ł��������̓`�F�b�N���Ȃ�
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# ���O�C�����̊e������擾���`�F�b�N
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_redirect=True, not_check_target_env=True)		# not_check_target_env=True�cBlobstoreUploadHandler�̉e�����A�N���C�A���gIP���ύX����Ă��܂����߃l�b�g���[�N����̃`�F�b�N�͂��Ȃ�
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

			file_id = self.getRequest('file_id')
			upload_files = self.get_uploads(file_id)  # 'file' is file upload field in the form
			if len(upload_files) <= 0:
				self._code = 500
				self._msg = self.getMsg('MSG_FAILED_FILE_IMPORT')
				self.responseAjaxResult()
				return

			# [0]�ɓ���Ă���o�C�i���f�[�^�擾
			blob_info = upload_files[0]
			blob_key = str(blob_info.key())

#			# �t�@�C�������邩�ȁ[
#			blob_reader = blobstore.BlobReader(blob_key)
#			csvfile = csv.reader(blob_reader, dialect=csv.excel)

			data_kind = self.getRequest('data_kind')
			# UCFMDLFile�̃f�[�^�L�[���쐬
			data_key = UcfUtil.guid()
			# �X�e�[�^�X=CREATING �ɂ� 1���R�[�h�ǉ����Ă����i�t�����g����̔��萧��Ȃǂ̂��߁j
			file_entry = FileUtils.insertNewCreatingRecord(self, data_key, data_kind)
			file_vo = file_entry.exchangeVo(self._timezone)
			file_vo['data_type'] = 'CSV'
			file_vo['content_type'] = blob_info.content_type
			file_vo['data_size'] = blob_info.size
			try:
				check_multibyte = unicode(blob_info.filename)
				file_vo['data_name'] = blob_info.filename
			except:
				file_vo['data_name'] = 'multi byte file name'					# TODO �}���`�o�C�g���Ή�...

			#file_vo['data_encoding'] = UcfConfig.DL_ENCODING
			file_encoding = UcfUtil.getHashStr(self.getDeptInfo(), 'file_encoding')
			if file_encoding == '' or file_encoding == 'SJIS':
				data_encoding = 'cp932'
			elif file_encoding == 'JIS':
				data_encoding = 'jis'
			elif file_encoding == 'EUC':
				data_encoding = 'euc-jp'
			elif file_encoding == 'UTF7':
				data_encoding = 'utf-7'
			elif file_encoding == 'UTF8':
				data_encoding = 'utf-8'
			elif file_encoding == 'UNICODE':
				data_encoding = 'utf-16'
			else:
				data_encoding = 'cp932'
			file_vo['data_encoding'] = data_encoding
			
			file_vo['blob_key'] = blob_key
			file_entry.margeFromVo(file_vo, self._timezone)
			file_entry.put()

			token = UcfUtil.guid()
			params = {
				 'key': blob_key
				,'data_key': data_key
				,'data_kind':data_kind
                ,'login_operator_id': self.getLoginOperatorID()
                ,'login_operator_unique_id': self.getLoginOperatorUniqueID()
                ,'login_operator_mail_address': self.getLoginOperatorMailAddress()
				,'login_operator_client_ip': self.getSession(UcfConfig.SESSIONKEY_CLIENTIP + '_' + self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN))
			}
			import_q = taskqueue.Queue('csv-export-import')
			import_t = taskqueue.Task(
				url='/a/' + tenant + '/' + token + '/queue_csv_import',
				params=params,
        target=sateraito_func.getBackEndsModuleName(tenant),
				countdown='1'
			)
			import_q.add(import_t)
			self._code = 0
			self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/asynccsvimport', AsyncImportPage)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)