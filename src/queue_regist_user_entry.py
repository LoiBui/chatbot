#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from google.appengine.api import taskqueue
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.ucfutil import *
from ucf.pages.dept import *
from ucf.utils import ucffunc
import sateraito_inc
import sateraito_func

##############################
# UserEntry更新タスク
##############################
class QueueRegistUserEntryPage(TenantTaskHelper):

	def processOfRequest(self, tenant, token):
		self._approot_path = os.path.dirname(__file__)

		## エラーが3回おきたら処理を終了する
		#if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 3):
		#	logging.error('error over_3_times. tenant is ' + tenant)
		#	return

		try:
			logging.info('tenant=' + str(tenant))
			#namespace_manager.set_namespace(tenant)
			user_email = self.request.get('user_email')
			is_admin = self.request.get('is_admin') == 'True'
			sateraito_func.registUserEntry(tenant, user_email, is_admin, False)

		except BaseException, e:
			logging.exception(e)
			pass

app = webapp2.WSGIApplication([('/a/([^/]*)/openid/([^/]*)/regist_user_entry', QueueRegistUserEntryPage)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)