# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
import sateraito_inc
import sateraito_func
from ucf.pages.operator import OperatorUtils
from ucf.pages.profile import ProfileUtils, PasswordChangeValidator

class Page(TenantAppHelper):
	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'personal_password'
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

			# パスワード変更をさせないフラグがたっていないかをチェック
			if profile_vo is not None and UcfUtil.getHashStr(profile_vo, 'passwordchange_unavailable_flag') == 'UNAVAILABLE':
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_UNAVAILABLE_PASSWORD_CHANGE')))
				return

			# 自動遷移先URLが指定されていたらリダイレクト（このページではしない）
			if ucffunc.redirectAutoRedirectURL(self, is_no_redirect=True):
				return

			ucfp = UcfTenantParameter(self)

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			# ステータス
			edit_status = UcfUtil.getHashStr(req, UcfConfig.QSTRING_STATUS)
			vo = req
			if edit_status == UcfConfig.VC_CHECK:

				# CSRF対策：トークンチェック
				if not self.checkCSRFToken(CSRF_TOKEN_KEY, self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN)):
					self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_CSRF_CHECK')))
					return

				# 入力チェック
				vc = PasswordChangeValidator('')
				vc.validate(self, vo, user_vo, profile_vo)
				ucfp.voinfo.validator = vc
				# 入力エラーがなければ登録処理
				if ucfp.voinfo.validator.total_count <= 0:

					is_password_change_success, password_change_error_code = ProfileUtils.changeUserPassword(self, req, user_vo, profile_vo, updater_name=UcfUtil.nvl(self.getLoginID()))
					if is_password_change_success:
						# セッションのパスワード強制変更フラグをクリア
						self.setLoginOperatorForcePasswordChangeFlag('')
						# 処理後一覧ページに遷移
						self.redirect('/a/' + self._tenant + '/personal/password/thanks')
					return

				# 入力エラーがあれば画面に戻る
				else:
					ucfp.voinfo.setVo(vo, None, None, self)
			else:
				pass

			# CSRF対策:トークン発行
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY)

			ucfp.data[UcfConfig.REQUESTKEY_RURL] = ''	# Google以外のSAML SPからのリクエストを想定
			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET,		# アクセス申請用ログイン画面でタブレットの場合はそもそも出さない

			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('personal_password_index.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


