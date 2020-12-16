# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from simplejson.encoder import JSONEncoder
from ucf.utils.models import *
import sateraito_inc
import sateraito_func
import sateraito_db
from ucf.pages.group import *
from ucf.pages.search import *
#from ucf.pages.orgunit import *

class Page(TenantAppHelper):
    def processOfRequest(self, tenant):
        self._approot_path = os.path.dirname(__file__)
        try:
            if self.isValidTenant() == False:
                return

            ucfp = UcfTenantParameter(self)
            template_vals = {
                'ucfp' : ucfp,
            }
            self.appendBasicInfoToTemplateVals(template_vals)

            self.render('liff_profile.html', self._design_type, template_vals)
        except BaseException, e:
            self.outputErrorLog(e)
            self.response.set_status(404)
            return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


