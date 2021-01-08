from google.appengine.ext.webapp import blobstore_handlers
import sateraito_inc
import sateraito_func
import webapp2


class DownloadFile(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, blob_key, extension):
        if not blob_key:
            self.error(404)
        else:
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            if extension == "pdf":
                content_type = "application/pdf"
            self.send_blob(blob_key, save_as='file.{}'.format(extension), content_type=content_type)

app = webapp2.WSGIApplication([
  ('/tenant/template/download_cloudstorage/([^/]*)/([^/]*)', DownloadFile),
], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)