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

from google.appengine.api import images
import urllib, cStringIO

# BlobStore����t�@�C���_�E�����[�h
class Page(blobstore_handlers.BlobstoreDownloadHandler, TenantAppHelper):
  def processOfRequest(self, tenant):

    try:
      self._approot_path = os.path.dirname(__file__)
      if self.isValidTenant() == False:
        return

      # if loginfunc.checkLogin(self) == False:
      # 	return
      #
      # # �����`�F�b�N
      # if self.isAdmin() == False and self.isOperator() == False:
      # 	self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
      # 	return
      #
      # # ���O�C�����̊e������擾���`�F�b�N
      # is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_check_target_env=True)		# not_check_target_env=True�cBlobstoreUploadHandler�̉e�����A�N���C�A���gIP���ύX����Ă��܂����߃l�b�g���[�N����̃`�F�b�N�͂��Ȃ�
      # if is_select_ok == False:
      # 	return

      blob_key = self.request.get("key")
      logging.info(blob_key)
      # if blob_key:
      #   self.send_blob(blob_key, content_type="image/png")
      #   return
      #
      # self.error(404)

      img = images.Image(blob_key=blob_key)
      img.resize(width=300, height=300)
      img.im_feeling_lucky()
      img_png = img.execute_transforms(output_encoding=images.PNG)
      self.response.headers['Content-Type'] = 'image/png'
      self.response.out.write(img_png)
      return

    except BaseException, e:
      self.outputErrorLog(e)
#			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
      return


app = webapp2.WSGIApplication([('/a/([^/]*)/image/blob', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)