# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.utils.models import *
from simplejson.encoder import JSONEncoder
import sateraito_inc
import sateraito_func
from ucf.pages.operator import *
from ucf.pages.operator_group import *

# ダッシュボードに変更
#_gnaviid = 'ACCOUNT'
_gnaviid = 'DASHBOARD'
_leftmenuid = 'REGIST'
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

			# ブラウザによる「employee_id」と「password」の自動セットを防止するため、「employee_id」が空の場合にダミーの空白をセットしておく（小細工... ここでクリア） 2015.09.01
			# 念のためTRIM
			#if req.get('employee_id', '') == '\t':
			#	req['employee_id'] = ''
			#if req.has_key('employee_id'):
			#	req['employee_id'] = req['employee_id'].strip()
			if req.has_key('federation_identifier'):
				req['federation_identifier'] = req['federation_identifier'].strip()

			# チェックボックス値補正（TODO 本来はフロントからPOSTするようにExtJsなどで処理すべきが取り急ぎ）
			OperatorUtils.setNotPostValue(self, req)
			
			# 新規 or 編集 or 削除
			edit_type = UcfUtil.getHashStr(req, UcfConfig.QSTRING_TYPE)
			# コピー新規
			edit_type2 = UcfUtil.getHashStr(req, UcfConfig.QSTRING_TYPE2)
			# ステータス
			edit_status = UcfUtil.getHashStr(req, UcfConfig.QSTRING_STATUS)
			# ユニークキー
			unique_id = UcfUtil.getHashStr(req, UcfConfig.QSTRING_UNIQUEID)
			if (edit_type == UcfConfig.EDIT_TYPE_RENEW or edit_type == UcfConfig.EDIT_TYPE_DELETE or edit_type2 == UcfConfig.EDIT_TYPE_COPYNEWREGIST) and unique_id == '':
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
				return

			ucfp = UcfTenantParameter(self)
			vo = {}
			entry_vo = {}
			if edit_status == UcfConfig.VC_CHECK:

				# CSRF対策：トークンチェック
				if not self.checkCSRFToken(CSRF_TOKEN_KEY + (unique_id if edit_type2 != UcfConfig.EDIT_TYPE_COPYNEWREGIST else ''), self.request.get(UcfConfig.REQUESTKEY_CSRF_TOKEN)):
					self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_CSRF_CHECK')))
					return

				# 削除処理の場合
				if edit_type == UcfConfig.EDIT_TYPE_DELETE:
					entry = OperatorUtils.getData(self, unique_id)
					if entry is None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
						return
					entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
					# 委託管理者の場合は自分がアクセスできる管理グループかをチェック
					if self.isOperator() and not ucffunc.isDelegateTargetManagementGroup(UcfUtil.getHashStr(entry_vo, 'management_group'), UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())):
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
						return

					# このユーザを所属メンバーに持つグループからメンバーを削除
					OperatorGroupUtils.removeOneMemberFromBelongGroups(self, UcfUtil.getHashStr(entry_vo, 'operator_id_lower'))
					## このユーザを所属メンバーに持つ組織からメンバーを削除
					#OrgUnitUtils.removeMemberFromBelongOrgUnits(self, [UcfUtil.getHashStr(entry_vo, 'operator_id_lower')], None)
					# 削除（※トランザクションは制約やデメリットが多いので使用しない）
					entry.delete()
					## ユーザー数キャッシュをクリア
					#UCFMDLOperator.clearActiveUserAmountCache(tenant)
					# オペレーションログ出力
					UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_OPERATOR, UcfConfig.OPERATION_TYPE_REMOVE, entry_vo.get('operator_id', ''), entry_vo.get('unique_id', ''), self.getClientIPAddress(), '')
					# 処理後一覧ページに遷移
					# ダッシュボードに遷移に変更
					#self.redirect('/a/' + self._tenant + '/operator/')
					self.redirect('/a/' + self._tenant + '/')
					return

				# 新規登録の場合
				elif edit_type == UcfConfig.EDIT_TYPE_NEW:
					# RequestからVoを作成
					UcfUtil.margeHash(vo, req)				# Requestからの情報をVoにマージ
					# パスワード更新フラグによってパスワード上書きするかどうかの制御
					if UcfUtil.getHashStr(vo, 'PasswordUpdateFlag') != 'UPDATE':
						vo['password'] = ''
					#if UcfUtil.getHashStr(vo, 'Password1UpdateFlag') != 'UPDATE':
					#	vo['password1'] = ''
					#if UcfUtil.getHashStr(vo, 'MatrixAuthPinCodeUpdateFlag') != 'UPDATE':
					#	vo['matrixauth_pin_code'] = ''

				# 編集の場合
				elif edit_type == UcfConfig.EDIT_TYPE_RENEW:
					entry = OperatorUtils.getData(self, unique_id)
					if entry is None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
						return

					entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
					OperatorUtils.editVoForSelect(self, entry_vo, is_with_parent_group_info=True)		# データ加工（取得用）
					UcfUtil.margeHash(vo, entry_vo)									# 既存データをVoにコピー
					UcfUtil.margeHash(vo, req)										# Requestからの情報をVoにマージ
					# パスワード更新フラグによってパスワード上書きするかどうかの制御
					if UcfUtil.getHashStr(vo, 'PasswordUpdateFlag') != 'UPDATE':
						vo['password'] = entry_vo['password']
					#if UcfUtil.getHashStr(vo, 'Password1UpdateFlag') != 'UPDATE':
					#	vo['password1'] = entry_vo['password1']
					#if UcfUtil.getHashStr(vo, 'MatrixAuthPinCodeUpdateFlag') != 'UPDATE':
					#	vo['matrixauth_pin_code'] = entry_vo['matrixauth_pin_code']

				else:
					# エラーページに遷移
					self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
					return

				# 入力チェック
				vc = OperatorValidator(edit_type, self.isOperator() and self.getLoginOperatorDelegateManagementGroups() != '', self.getLoginOperatorDelegateManagementGroups().split(',') if self.getLoginOperatorDelegateManagementGroups() != '' else None)
				# AD連携パスワード桁数制御撤廃対応：一環でパスワード更新時以外はパスワードチェックしないように対応 2017.03.17
				is_without_password_check = UcfUtil.getHashStr(vo, 'PasswordUpdateFlag') != 'UPDATE'
				vc.validate(self, vo, self.getLoginOperatorMailAddress(), is_without_password_check=is_without_password_check)
				ucfp.voinfo.validator = vc
				# 入力エラーがなければ登録処理
				if ucfp.voinfo.validator.total_count <= 0:

					# 更新日時チェック（編集時のみ）
					if edit_type == UcfConfig.EDIT_TYPE_RENEW and not self.checkDateChanged(entry):
						# エラーページに遷移
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_ALREADY_UPDATED_DATA')))
						return

					# オペレーションログ詳細用に更新フィールドを取得（加工前に比較しておく）
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						is_diff = True
						diff_for_operation_log = []
					else:
						is_diff, diff_for_operation_log = OperatorUtils.isDiff(self, vo, entry_vo)

					# 加工データ
					OperatorUtils.editVoForRegist(self, vo, entry_vo, edit_type)

					# 新規登録場合モデルを新規作成
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						unique_id = UcfUtil.guid()
						vo['unique_id'] = unique_id
						entry = UCFMDLOperator(unique_id=unique_id,id=OperatorUtils.getKey(self, vo))

					# Voからモデルにマージ
					entry.margeFromVo(vo, self._timezone)


					# 更新日時、更新者の更新
					entry.updater_name = UcfUtil.nvl(self.getLoginID())
					entry.date_changed = UcfUtil.getNow()

					# 新規登録場合ユニークＩＤを生成
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						# 作成日時、作成者の更新
						entry.creator_name = UcfUtil.nvl(self.getLoginID())
						entry.date_created = UcfUtil.getNow()

					########################
					# 親グループ
					parent_groups = []
					parent_group_info = OperatorUtils.getParentGroupInfoFromRequest(vo)
					if parent_group_info is not None:
						for member in parent_group_info:
							parent_groups.append(UcfUtil.getHashStr(member, 'MailAddress').lower())

					# 親グループ情報を更新
					add_groups, del_groups = OperatorGroupUtils.setOneUserToBelongGroups(self, UcfUtil.getHashStr(vo, 'operator_id_lower'), parent_groups)
					# 更新処理（※トランザクションは制約やデメリットが多いので使用しない）
					entry.put()
					# UserEntryにレコード追加
					sateraito_func.addUpdateUserEntryTaskQueue(tenant, entry)
					## ユーザー数キャッシュをクリア
					#if edit_type == UcfConfig.EDIT_TYPE_NEW:
					#	UCFMDLOperator.clearActiveUserAmountCache(tenant)

					# オペレーションログ出力
					operation_log_detail = {}
					if edit_type == UcfConfig.EDIT_TYPE_RENEW:
						operation_log_detail['fields'] = diff_for_operation_log
					operation_log_detail['add_groups'] = add_groups
					if edit_type == UcfConfig.EDIT_TYPE_RENEW:
						operation_log_detail['del_groups'] = del_groups
					UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_OPERATOR, UcfConfig.OPERATION_TYPE_ADD if edit_type == UcfConfig.EDIT_TYPE_NEW else UcfConfig.OPERATION_TYPE_MODIFY, vo.get('operator_id', ''), vo.get('unique_id', ''), self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))

					# 処理後一覧ページに遷移
					# ダッシュボードに遷移に変更
					#self.redirect('/a/' + self._tenant + '/operator/')
					self.redirect('/a/' + self._tenant + '/')
					return

				# 入力エラーがあれば画面に戻る
				else:

					for k,v in vc.msg.iteritems():
						logging.info(k)
						logging.info(v)



					ucfp.voinfo.setVo(vo, OperatorViewHelper(), None, self)

			# 初回表示
			else:
				# コピー新規
				if edit_type2 == UcfConfig.EDIT_TYPE_COPYNEWREGIST:
					entry = OperatorUtils.getData(self, unique_id)
					if entry is None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA')))
						return

					vo = entry.exchangeVo(self._timezone)					# 既存データをVoに変換
					OperatorUtils.editVoForSelect(self, vo, is_with_parent_group_info=True)	# データ加工（取得用）

					# コピー新規なので不要なデータを削除
					OperatorUtils.removeFromVoForCopyRegist(self, vo)

					ucfp.voinfo.setVo(vo, None, None, self)

				else:
					# 新規
					if edit_type == UcfConfig.EDIT_TYPE_NEW:
						OperatorUtils.editVoForDefault(self, vo)		# データ加工（初期値用）
					# 編集
					elif edit_type == UcfConfig.EDIT_TYPE_RENEW:
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

					else:
						# エラーページに遷移
						self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
						return

					ucfp.voinfo.setVo(vo, None, None, self)

			# ブラウザによる「employee_id」と「password」の自動セットを防止するため、「employee_id」が空の場合にダミーの空白をセットしておく（小細工... ↑とFocus時にクリア） 2015.09.01
			#if vo is not None and vo.get('employee_id', '') == '':
			#	vo['employee_id'] = '\t'
			#if vo is not None and vo.get('federation_identifier', '') == '':
			#	vo['federation_identifier'] = '\t'
			# CSRF対策:トークン発行
			ucfp.data['token'] = self.createCSRFToken(CSRF_TOKEN_KEY + (unique_id if edit_type2 != UcfConfig.EDIT_TYPE_COPYNEWREGIST else ''))

			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATOR_HEADER')]
			ucfp.data[UcfConfig.QSTRING_TYPE] = UcfUtil.nvl(self.getRequest(UcfConfig.QSTRING_TYPE))

			# マルチドメイン時のドメインリストを作成
			#domain_list = []
			#domain_list.extend(UcfUtil.csvToList(UcfUtil.getHashStr(self.getDeptInfo(), 'federated_domains')))
			#domain_list = sateraito_func.getFederatedDomainList(self._tenant, is_with_cache=True)

			# 言語一覧
			language_list = []
			for language in sateraito_func.ACTIVE_LANGUAGES:
				language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])

			template_vals = {
				'ucfp' : ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'is_exist_delegate_management_groups':True if len(UcfUtil.csvToList(self.getLoginOperatorDelegateManagementGroups())) > 0 else False,
				#'is_multidomain':True if len(domain_list) > 1 else False,
				#'domain_list':JSONEncoder().encode(domain_list),
				'language_list':JSONEncoder().encode(language_list)
			}
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('operator_regist.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


