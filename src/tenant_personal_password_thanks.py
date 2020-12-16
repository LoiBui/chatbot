# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc,ucffunc
from ucf.utils.models import *
import sateraito_inc, sateraito_func
from ucf.pages.operator import OperatorUtils
from ucf.pages.profile import ProfileUtils
import oem_func

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

#			# パスワード変更をさせないフラグがたっていないかをチェック
#			if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') == 'UNAVAILABLE':
#				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_UNAVAILABLE_PASSWORD_CHANGE')))
#				return

			ucfp = UcfTenantParameter(self)

			rurl_key = UcfUtil.nvl(self.getRequest('rurl_key'))
			if rurl_key == '':
				rurl_key = UcfUtil.nvl(self.getLoginOperatorRURLKey())
			rurl = self.getOriginalProcessLinkFromSession(rurl_key)
			rurl_without_query = rurl.split('?')[0]
			if rurl_without_query == oem_func.getMySiteUrl(self._oem_company_code) + '/a/' + tenant + '/personal/otp/' or rurl_without_query == oem_func.getMySiteUrl(self._oem_company_code) + '/a/' + tenant + '/personal/otp/thanks' or rurl_without_query == oem_func.getMySiteUrl(self._oem_company_code) + '/a/' + tenant + '/personal/' or rurl_without_query == oem_func.getMySiteUrl(self._oem_company_code) + '/a/' + tenant + '/':
				rurl = ''

			# 自動遷移先URLが指定されていたらリダイレクト
			if rurl == '':
				if ucffunc.redirectAutoRedirectURL(self, profile_vo, is_force_deal=True):
					return
			
			# URLが長すぎる場合はPOSTで戻るように変更 2013.11.22
			if self._design_type != 'm' and len(rurl) >= 2000:
				sp_rurl = rurl.split('?')
				ucfp.data[UcfConfig.REQUESTKEY_RURL] = sp_rurl[0]
				ucfp.data['is_post'] = True
				toback_posts = []

				if len(sp_rurl) > 1 and sp_rurl[1] != '':
					query_string = sp_rurl[1]
					querys = query_string.split('&')
					for query in querys:
						one_query = query.split('=')
						toback_posts.append({'name':one_query[0], 'value':UcfUtil.urlDecode(one_query[1]) if len(one_query) > 1 else ''})
				ucfp.data['toback_posts'] = toback_posts
			else:
				ucfp.data[UcfConfig.REQUESTKEY_RURL] = rurl
				ucfp.data['is_post'] = False
			self.setLoginOperatorRURLKey('')

			template_vals = {
				'ucfp' : ucfp,
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# アクセス申請用ログイン画面でタブレットの場合はそもそも出さない

			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('personal_password_thanks.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


