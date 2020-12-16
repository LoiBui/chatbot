# coding: utf-8

import webapp2,logging
from ucf.utils import loginfunc
from ucf.utils.helpers import *
import sateraito_inc
import sateraito_func

class Page(TenantAppHelper):
	def processOfRequest(self, tenant):
		CSRF_TOKEN_KEY = 'UPLOAD'
		try:
			self._approot_path = os.path.dirname(__file__)

			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# 有償版チェック
			if sateraito_func.isFreeMode(self._tenant):
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOAVAILABLE_FREE_APP')))
				return

			# 権限チェック
			if self.isAdmin() == False:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				return

			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			if is_select_ok == False:
				return
			# パスワード次回変更フラグをチェック
			if self.checkForcePasswordChange() == False:
				return

			ucfp = UcfTenantParameter(self)
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_BGUPLOAD_HEADER')]

			ucfp.data['is_uploaded_mainbg01'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc1_data_key') != ''
			ucfp.data['is_uploaded_mainbg02'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc2_data_key') != ''
			ucfp.data['is_uploaded_mainbg03'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc3_data_key') != ''
			ucfp.data['is_uploaded_mainbg04'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc4_data_key') != ''
			ucfp.data['is_uploaded_mainbg05'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc5_data_key') != ''
			ucfp.data['is_uploaded_mainbg06'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc6_data_key') != ''
			ucfp.data['is_uploaded_mainbg07'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc7_data_key') != ''
			ucfp.data['is_uploaded_mainbg08'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc8_data_key') != ''
			ucfp.data['is_uploaded_mainbg09'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc9_data_key') != ''
			ucfp.data['is_uploaded_mainbg10'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_pc10_data_key') != ''
			ucfp.data['is_uploaded_mainbgsp01'] = UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_sp1_data_key') != ''

			default_bg_idx = self._getBgDefaultIdx()

			ucfp.data['BgDefaultIdx'] = {
				'01':default_bg_idx[0],
				'02':default_bg_idx[1],
				'03':default_bg_idx[2],
				'04':default_bg_idx[3],
				'05':default_bg_idx[4],
				'06':default_bg_idx[5],
				'07':default_bg_idx[6],
				'08':default_bg_idx[7],
				'09':default_bg_idx[8],
				'10':default_bg_idx[9]
			}
			# CSRF対策:トークン発行
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY)

			template_vals = {
				'ucfp' : ucfp,
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('bgupload.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
