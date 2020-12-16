#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from google.appengine.api import users
from ucf.utils.helpers import *
import sateraito_inc

class Page(FrontHelper):
    def processOfRequest(self):
        self._approot_path = os.path.dirname(__file__)

        # ���������iCookie�̒l���l���j
        hl_from_cookie = self.getCookie('hl')
        logging.info('hl_from_cookie=' + str(hl_from_cookie))
        if hl_from_cookie is not None and hl_from_cookie in sateraito_func.ACTIVE_LANGUAGES:
            self._language = hl_from_cookie
        # ����ꗗ
        language_list = []
        for language in sateraito_func.ACTIVE_LANGUAGES:
            language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])

        error_info = self.getSession(UcfConfig.SESSIONKEY_ERROR_INFO)
        logging.info(error_info)

        template_vals = {
            'error_info':error_info,
            'footer_message':self.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ()),
            'language_list':JSONEncoder().encode(language_list)
        }
        self.appendBasicInfoToTemplateVals(template_vals)
        self.render('error.html', self._design_type, template_vals)

app = webapp2.WSGIApplication([
                               (r'/error', Page),
                              ], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
