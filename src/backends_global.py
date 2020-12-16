#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from google.appengine.api import taskqueue
from google.appengine.api import namespace_manager
from google.appengine.api import memcache
from ucf.utils.helpers import *
#from ucf.pages.task import TaskUtils
import sateraito_inc
import sateraito_func

##############################
# 
##############################
class StartPage(webapp2.RequestHandler):

	def get(self):
		pass

class StopPage(webapp2.RequestHandler):

	def get(self):
		pass

app = webapp2.WSGIApplication([('/_ah/start', StartPage),('/_ah/stop', StopPage)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
