#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from google.appengine.api import users
from ucf.utils.helpers import *
from ucf.utils import ucffunc
from ucf.utils import loginfunc
import sateraito_inc
import sateraito_func

############################################################
## ログアウト処理
############################################################
class Page(TenantAppHelper):

	def processOfRequest(self, tenant):
		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			# 権限チェック 2011/04/08 不要な為、削除
			#if not self.checkAccessAuthority(_MENU_ID): return

			# RURLを取得
			strRURL = UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_RURL))

			# RURLが空のとき、リファラから取得
			if strRURL == '':
				 strRURL = UcfUtil.nvl(UcfUtil.getHashStr(os.environ, 'HTTP_REFERER'))

			loginfunc.logout(self)

			strLoginURL = '/a/' + self._tenant + '/login'
			if strRURL != '':
				strLoginURL = UcfUtil.appendQueryString(strLoginURL, UcfConfig.REQUESTKEY_RURL, strRURL)
			self.redirect(strLoginURL)
			return

		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = webapp2.WSGIApplication([('/a/([^/]*)/logout', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
