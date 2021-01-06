import logging
from google.appengine.ext.webapp import blobstore_handlers
import sateraito_inc
import sateraito_func
import webapp2


class DownloadFile(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, photo_key, extension):
        if not photo_key:
            self.error(404)
        else:
            self.send_blob(photo_key, save_as='file.{}'.format(extension))

app = webapp2.WSGIApplication([
  ('/tenant/template/download_cloudstorage/([^/]*)/([^/]*)', DownloadFile),
], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)