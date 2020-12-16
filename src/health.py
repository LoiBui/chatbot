#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from ucf.utils.helpers import *
import sateraito_inc

class Page(FrontHelper):
	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)
		template_vals = {
		}
		self.appendBasicInfoToTemplateVals(template_vals)
		#self.render('index.html', self._design_type, template_vals)
		self.response.out.write('CHECK OK')

app = webapp2.WSGIApplication([
                               (r'/health', Page),
                              ], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
