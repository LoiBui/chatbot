# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc,ucffunc
from ucf.utils.models import *
import sateraito_inc, sateraito_func
from ucf.pages.operator import OperatorUtils
from ucf.pages.profile import ProfileUtils

class Page(TenantAppHelper):
	def processOfRequest(self, tenant):
		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			if is_select_ok == False:
				return

			# 自動遷移先URLが指定されていたらリダイレクト
			if ucffunc.redirectAutoRedirectURL(self, profile_vo, is_force_deal=True):
				return
			
			ucfp = UcfTenantParameter(self)

			template_vals = {
				'ucfp' : ucfp,
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# アクセス申請用ログイン画面でタブレットの場合はそもそも出さない

			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('personal_minfo_thanks.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


