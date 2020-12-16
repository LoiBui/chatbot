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
import sateraito_db

##############################
# テナント更新タスク
##############################
class QueueRegistTenantEntryPage(TenantTaskHelper):

	def processOfRequest(self, tenant, token):
		self._approot_path = os.path.dirname(__file__)

		# エラーが3回おきたら処理を終了する
		if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 3):
			logging.error('error over_3_times. tenant is ' + tenant)
			return

		try:
			logging.info('tenant=' + str(tenant))
			namespace_manager.set_namespace(tenant)

			# DeptMasterからo365連携アカウントを取得
			dept_vo = ucffunc.getDeptVoByTenant(tenant, self)

			# 利用ユーザー数を集計して契約管理サーバーに返す（削除がなく全件取得すればOKなのでこれでよし） 2015.11.20
			# 通知サーバーは管理者ではなくユーザー管理のレコード数で判別すべきなので変更 2017.06.05
			#q = UCFMDLOperator.query()
			q = sateraito_db.User.query()
			active_users = q.count(limit=1000000)
			sateraito_func.setNumTenantUser(tenant, None, active_users)

		except BaseException, e:
			logging.error(str(e))
			pass

app = webapp2.WSGIApplication([('/a/([^/]*)/openid/([^/]*)/regist_tenant_entry', QueueRegistTenantEntryPage)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)