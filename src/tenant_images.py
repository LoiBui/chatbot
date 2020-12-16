# coding: utf-8

import webapp2, logging, datetime, time
from google.appengine.api import memcache
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.pages.file import *
from ucf.config.ucfconfig import *
import sateraito_inc
import sateraito_func
import oem_func
from ucf.utils import ucffunc, loginfunc

class LoadImagesPage(TenantImageHelper):
    def processOfRequest(self, tenant, parent_folder, sub_folder):
        self._approot_path = os.path.dirname(__file__)
        try:
            # memcache����擾���Ȃ��t���O
            is_notuse_memcache = 'n' == self.getRequest('uc')

            if sub_folder is None or sub_folder == '':
                self.response.set_status(404)
                return

            logging.info(parent_folder)
            logging.info(sub_folder)

            file_name = '{0}.jpg'.format(sub_folder)
            content_type = 'image/jpeg'
            design_type = 'pc'

            #filepath = self.getImagesFilePath(os.path.join('dummy', parent_folder, sub_folder, file_name))
            filepath = self.getParamFilePath(os.path.join('images', design_type,'dummy',parent_folder,sub_folder, file_name))

            fp = open(filepath, 'rb')
            binary_data = fp.read()
            fp.close()
            last_modified = time.ctime(os.path.getmtime(filepath))

            self.responseImage(binary_data, content_type, file_name, last_modified, is_notuse_memcache)

        except BaseException, e:
            self.outputErrorLog(e)
            self.response.set_status(404)
            return


app = webapp2.WSGIApplication([
                                  ('/a/([^/]*)/images/([^/]+)/([^/]+)', LoadImagesPage),
                              ], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)