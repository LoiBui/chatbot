# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils import loginfunc
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
from ucf.pages.file import *
import sateraito_inc
import sateraito_func

# BlobStore����t�@�C���_�E�����[�h
class Page(blobstore_handlers.BlobstoreDownloadHandler, TenantAppHelper):
	def processOfRequest(self, tenant):

		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# �����`�F�b�N
			if self.isAdmin() == False and self.isOperator() == False:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				return

			# ���O�C�����̊e������擾���`�F�b�N
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_check_target_env=True)		# not_check_target_env=True�cBlobstoreUploadHandler�̉e�����A�N���C�A���gIP���ύX����Ă��܂����߃l�b�g���[�N����̃`�F�b�N�͂��Ȃ�
			if is_select_ok == False:
				return

			blob_key = self.getRequest('key')

			blob_key = str(urllib.unquote(blob_key)) 

			# BlobKey���w�肵�ăt�@�C�����擾
			blob_info = blobstore.BlobInfo.get(blob_key)

			if blob_info.content_type == 'application/vnd.ms-excel':
				self.response.charset = UcfConfig.DL_ENCODING
				self.setResponseHeaderForDownload('test.csv', UcfConfig.DL_ENCODING)

			# ���ʂ��N���C�A���g�ɕԂ�
			self.send_blob(blob_info)

		except BaseException, e:
			self.outputErrorLog(e)
#			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/file/blob', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)