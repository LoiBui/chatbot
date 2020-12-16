# coding: utf-8
import datetime                                                                                                                                         
import sateraito_inc
from ucf.sessions import SessionMiddleware
import os
from google.appengine.ext import vendor

# Add any libraries install in the "library" folder.
vendor.add(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'library'))

def webapp_add_wsgi_middleware(app):
	#app = SessionMiddleware(app, cookie_key="c2e1cff0f9e24880a1f476869e26b8c9", lifetime=datetime.timedelta(seconds=sateraito_inc.session_timeout), no_datastore=True, cookie_only_threshold=0)
	app = SessionMiddleware(app, cookie_key="f00dd71be2bf4d2d8f0e2245a01e4d1f", lifetime=datetime.timedelta(seconds=sateraito_inc.session_timeout), no_datastore=False, cookie_only_threshold=0)
	return app