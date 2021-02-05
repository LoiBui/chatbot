import logging
from google.appengine.ext.webapp import blobstore_handlers
import sateraito_inc
import sateraito_func
import webapp2
from google.appengine.api import namespace_manager
from ucf.utils.models import AnswerUser, ExcelTemplateFile


class DownloadFile(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, unique_id, extension, tenant):
        namespace_manager.set_namespace(tenant.lower())
        data = AnswerUser.getById(unique_id)
        if data is None:
            self.response.write('You have canceled your answer, so you cannot download this file')
        else:
            file = ExcelTemplateFile.getById(data.file_id)
            if (extension == 'pdf' and int(file.download_method) == 2) or (extension == 'excel' and int(file.download_method) == 1):
                self.response.write("You don't have permission download this file")
            else:
                content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                blob_key = data.excel_blob
                if extension == "pdf":
                    content_type = "application/pdf"
                    blob_key = data.pdf_blob
                    
                self.send_blob(blob_key, save_as='file.{}'.format(extension), content_type=content_type)

app = webapp2.WSGIApplication([
  ('/tenant/template/lineworks_download/([^/]*)/([^/]*)/([^/]*)', DownloadFile),
], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)