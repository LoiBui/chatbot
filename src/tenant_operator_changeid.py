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
_leftmenuid = 'CHANGEID'
class Page(TenantAppHelper):
	def processOfRequest(self, tenant):

		CSRF_TOKEN_KEY = 'operator_changeid'

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

			# ユニークキー
			unique_id = UcfUtil.getHashStr(req, UcfConfig.QSTRING_UNIQUEID)
			if unique_id == '':
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
				return

			ucfp = UcfTenantParameter(self)
			entry_vo = {}
			entry = OperatorUtils.getData(self, unique_id)
			if entry is None:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
				return

			entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
			OperatorUtils.editVoForSelect(self, entry_vo, is_with_parent_group_info=False)		# データ加工（取得用）

			# 委託管理者の場合は自分がアクセスできる管理グループかをチェック
			if self.isOperator() and not ucffunc.isDelegateTargetManagementGroup(UcfUtil.getHashStr(entry_vo, 'management_group'), UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())):
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
				return

			ucfp.voinfo.setVo(entry_vo, None, None, self)

			# CSRF対策:トークン発行
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY + unique_id)

			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATOR_HEADER')]
			ucfp.data[UcfConfig.QSTRING_TYPE] = UcfUtil.nvl(self.getRequest(UcfConfig.QSTRING_TYPE))

			# ドメインリストを作成
			#domain_list = []
			#domain_list.extend(UcfUtil.csvToList(UcfUtil.getHashStr(self.getDeptInfo(), 'federated_domains')))
			#domain_list = sateraito_func.getFederatedDomainList(self._tenant, is_with_cache=True)

			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				#'is_multidomain':True if len(domain_list) > 1 else False,
				#'domain_list':JSONEncoder().encode(domain_list)
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('operator_changeid.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


