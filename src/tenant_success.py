#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from google.appengine.api import users
from ucf.utils.helpers import *
import sateraito_inc
import sateraito_func

############################################################
## エラーページ
############################################################
class Page(TenantAppHelper):

	def processOfRequest(self, tenant):
		try:
			self._approot_path = os.path.dirname(__file__)
			#if self.isValidTenant() == False:
			#	return

			# 権限チェック 2011/04/08 不要な為、削除
			#if not self.checkAccessAuthority(_MENU_ID): return

			refist_info = self.getSession(UcfConfig.SESSIONKEY_REGIST_USER_INFO)
			ucfp = UcfTenantParameter(self)
			template_vals = {
				'ucfp' : ucfp,
				'success_info' : refist_info,
				'footer_message':self.getMsg('EXPLAIN_REGIST_USER_SUCCESS', ()),
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# アクセス申請用ログイン画面でタブレットの場合はそもそも出さない
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			# 強制デザイン変更対応 2017.02.20
			if self.request.get('dtp') != '':
				self._design_type = self.request.get('dtp')
			self.render('success_client.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			return

app = webapp2.WSGIApplication([('/a/([^/]*)/success', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
