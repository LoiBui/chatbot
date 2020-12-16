# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from simplejson.encoder import JSONEncoder
import sateraito_inc
import sateraito_func
from ucf.pages.operator import *

# ダッシュボードに変更
#_gnaviid = 'ACCOUNT'
_gnaviid = 'DASHBOARD'
_leftmenuid = 'DETAIL'
class Page(TenantAppHelper):
	def processOfRequest(self, tenant):

		CSRF_TOKEN_KEY = 'operator'

		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# 権限チェック
			if self.isAdmin() == False and self.isOperator(target_function=UcfConfig.DELEGATE_FUNCTION_OPERATOR_CONFIG) == False:
#				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				self.redirect('/a/' + tenant + '/personal/')
				return

			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			if is_select_ok == False:
				return
			# パスワード次回変更フラグをチェック
			if self.checkForcePasswordChange() == False:
				return

			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)

			# チェックボックス値補正（TODO 本来はフロントからPOSTするようにExtJsなどで処理すべきが取り急ぎ）
			OperatorUtils.setNotPostValue(self, req)
			
			# 詳細
			edit_type = UcfUtil.getHashStr(req, UcfConfig.QSTRING_TYPE)
			# ユニークキー
			unique_id = UcfUtil.getHashStr(req, UcfConfig.QSTRING_UNIQUEID)
			if edit_type != UcfConfig.EDIT_TYPE_REFER:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
				return
			if unique_id == '':
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
				return

			ucfp = UcfTenantParameter(self)
			vo = {}
			entry_vo = {}

			entry = OperatorUtils.getData(self, unique_id)
			if entry is None:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
				return
			vo = entry.exchangeVo(self._timezone)					# 既存データをVoに変換
			OperatorUtils.editVoForSelect(self, vo, is_with_parent_group_info=True)		# データ加工（取得用）

			# 委託管理者の場合は自分がアクセスできる管理グループかをチェック
			if self.isOperator() and not ucffunc.isDelegateTargetManagementGroup(UcfUtil.getHashStr(vo, 'management_group'), UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())):
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
				return

			ucfp.voinfo.setVo(vo, OperatorViewHelper(), None, self)

			# CSRF対策:トークン発行
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY + unique_id)

			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATOR_HEADER')]
			ucfp.data[UcfConfig.QSTRING_TYPE] = UcfUtil.nvl(self.getRequest(UcfConfig.QSTRING_TYPE))

			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('operator_detail.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


