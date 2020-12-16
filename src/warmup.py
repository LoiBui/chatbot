#!/usr/bin/python
# coding: utf-8

import os,sys,random,Cookie
import traceback
import logging
import jinja2
from google.appengine.api import memcache
#from google.appengine.api import users
import webapp2
from ucf.sessions import get_current_session
from ucf.utils.helpers import *
from ucf.utils.ucfutil import *
from ucf.config.ucfconfig import *
from ucf.config.ucfmessage import *
from ucf.utils.ucfxml import *
from google.appengine.api import namespace_manager
from ucf.utils import ucffunc,jinjacustomfilters
from simplejson.encoder import JSONEncoder
from ucf.pages.dept import *

import sateraito_inc
import sateraito_func

class Page(webapp2.RequestHandler):
	def get(self):
		logging.info('warmup instance.')

app = webapp2.WSGIApplication([
                               (r'/_ah/warmup', Page),
                              ], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
