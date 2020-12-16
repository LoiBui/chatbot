#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
import json
from google.appengine.api import users
from ucf.utils.helpers import *
import sateraito_inc
import sateraito_func
import oem_func


class Page(FrontHelper):
    def processOfRequest(self):
        try:
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

            ucfp = UcfFrontParameter(self)

            template_vals = {
                'oem_company_code': oem_func.OEM_COMPANY_CODE_DEFAULT,
                'ucfp': ucfp,
                'footer_message': self.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ()),
                'language_list': json.JSONEncoder().encode(language_list)
            }
            
            self.appendBasicInfoToTemplateVals(template_vals)
            self.render('index.html', self._design_type, template_vals)
        except BaseException, e:
            self.outputErrorLog(e)
            self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
            return


app = webapp2.WSGIApplication([(r'/', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
