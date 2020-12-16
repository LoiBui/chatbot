# coding: utf-8

import webapp2,logging,gc
from ucf.utils.validates import BaseValidator
from ucf.utils.models import *
from ucf.utils.helpers import *
from ucf.utils.models import *
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
import sateraito_inc
import sateraito_func


############################################################
## オペレータグループテーブル用メソッド
############################################################
class OperatorGroupUtils():
	# 初期値用：データ加工
	def editVoForDefault(cls, helper, vo):
		pass
	editVoForDefault = classmethod(editVoForDefault)

	# チェックボックス値補正（TODO 本来はフロントからPOSTするようにExtJsなどで処理すべきが取り急ぎ）
	def setNotPostValue(cls, helper, req):
		# チェックボックス項目
		cbx_fields = [
			#,('is_nopublish_contact', '')
			#,('is_nopublish_shared_contact', '')
		]
		for field in cbx_fields:
			if not req.has_key(field[0]):
				req[field[0]] = field[1]
	setNotPostValue = classmethod(setNotPostValue)

	# 取得用：データ加工
	def editVoForSelect(cls, helper, vo, is_with_parent_group_info=False, is_with_belong_member_info=False):
		#vo['group_id_localpart'] = UcfUtil.getHashStr(vo, 'group_id').split('@')[0]
		#if UcfUtil.getHashStr(vo, 'group_auth_type') == '':
		#	vo['group_auth_type'] = 'Anyone'

		########################
		# 親グループ情報
		if is_with_parent_group_info:
			ParentGroupInfo = []
			if UcfUtil.getHashStr(vo, 'group_id_lower') != '':
				q = UCFMDLOperatorGroup.query()
				q = q.filter(UCFMDLOperatorGroup.belong_members == UcfUtil.getHashStr(vo, 'group_id_lower'))
				for entry in q:
					ParentGroupInfo.append({'UniqueID':UcfUtil.nvl(entry.unique_id),'MailAddress':UcfUtil.nvl(entry.group_id_lower),'Name':UcfUtil.nvl(entry.group_name)})
				vo['ParentGroupInfo'] = JSONEncoder().encode(ParentGroupInfo)

		belong_members = UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'belong_members'))

		# 所属メンバー数
		vo['belong_members_count'] = UcfUtil.nvl(len(belong_members))

		########################
		# 所属メンバー情報
		if is_with_belong_member_info:
			# BelongMemberInfo
			BelongMemberInfo = []
			group_owners = UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'group_owners'))

			# 負荷にはなるがDBからunique_idと名称、タイプを取得

			# 一件ずつだと効率悪そうなのでまとめて検索
			# 全部でxxxx件以上ある場合は、負荷が高すぎるので表示しない
			if len(belong_members) <= UcfConfig.MAX_MEMBER_CNT_FOR_GET_DETAIL_INFO:
				hit_mail_address = []
				# まずユーザを検索
				idx = 0
				while idx >= 0:
					current_belong_members = belong_members[idx:idx+30]
					if len(current_belong_members) >= 30:
						idx = idx + 30
					else:
						idx = -1
					if len(current_belong_members) > 0:
						q = UCFMDLOperator.query()
						q = q.filter(UCFMDLOperator.operator_id_lower.IN(current_belong_members))
						for entry in q:
							# セールスフォースはメールアドレスとユーザーIDは別なので
							#belong_member_email = UcfUtil.nvl(entry.mail_address).lower()
							belong_member_email = UcfUtil.nvl(entry.operator_id).lower()
							member_unique_id = UcfUtil.nvl(entry.unique_id)
							member_name = helper.getUserNameDisp(entry.last_name, entry.first_name)
							member_type = 'ACCOUNT'
							member_mail_address = belong_member_email
							member_owner_flag = 'OWNER' if (belong_member_email in group_owners) else ''
							BelongMemberInfo.append({'UniqueID':member_unique_id,'Name':member_name,'MailAddress':member_mail_address,'Type':member_type,'OwnerFlag':member_owner_flag})
							hit_mail_address.append(belong_member_email)

				# 次にユーザにいなかったメンバーだけグループを検索
				belong_members2 = []
				for belong_member in belong_members:
					if belong_member not in hit_mail_address and belong_member != '*':		# * はグループのほうからも削除したいがそのためだけにループするのも微妙なので。どうせヒットしないし
						belong_members2.append(belong_member)
				idx = 0
				while idx >= 0:
					current_belong_members = belong_members2[idx:idx+30]
					if len(current_belong_members) >= 30:
						idx = idx + 30
					else:
						idx = -1
					if len(current_belong_members) > 0:
						q = UCFMDLOperatorGroup.query()
						q = q.filter(UCFMDLOperatorGroup.group_id_lower.IN(current_belong_members))
						for entry in q:
							# セールスフォースはメールアドレスとグループIDは別なので
							#belong_member_email = UcfUtil.nvl(entry.mail_address).lower()
							belong_member_email = UcfUtil.nvl(entry.group_id).lower()
							member_unique_id = UcfUtil.nvl(entry.unique_id)
							member_name = UcfUtil.nvl(entry.group_name)
							member_type = 'GROUP'
							member_mail_address = belong_member_email
							member_owner_flag = 'OWNER' if (belong_member_email in group_owners) else ''
							BelongMemberInfo.append({'UniqueID':member_unique_id,'Name':member_name,'MailAddress':member_mail_address,'Type':member_type,'OwnerFlag':member_owner_flag})
							hit_mail_address.append(belong_member_email)

				# 最後に、* やグループ、ユーザマスタにも存在しないレコードを処理
				for belong_member in belong_members:
					if belong_member not in hit_mail_address:
						belong_member_email = belong_member.lower()
						member_unique_id = ''
						if belong_member == '*':
							member_name = UcfMessage.getMessage(helper.getMsg('VMSG_ALL_USERS_OF_DOMAIN'))
						else:
							member_name = ''
						member_type = 'MEMBER'
						member_mail_address = belong_member_email
						member_owner_flag = 'OWNER' if (belong_member_email in group_owners) else ''
						BelongMemberInfo.append({'UniqueID':member_unique_id,'Name':member_name,'MailAddress':member_mail_address,'Type':member_type,'OwnerFlag':member_owner_flag})
			# xxxx件以上所属メンバーがいる場合
			else:
				for belong_member_email in belong_members:
					member_mail_address = belong_member_email
					member_owner_flag = 'OWNER' if (belong_member_email in group_owners) else ''
					BelongMemberInfo.append({'MailAddress':member_mail_address,'OwnerFlag':member_owner_flag})

			# 一件ずつ取得する場合
	#		for belong_member_email in belong_members:
	#			member_unique_id = ''
	#			member_name = ''
	#			member_type = ''
	#			# 負荷にはなるがDBからunique_idと名称、タイプを取得
	#			is_hit = False
	#			# 特殊文字「*」判定
	#			if is_hit == False and belong_member_email == '*':
	#				member_name = UcfMessage.getMessage(helper.getMsg('VMSG_ALL_USERS_OF_DOMAIN'))
	#				is_hit = True
	#
	#			# なければユーザ検索
	#			if is_hit == False:
	#				query = UCFMDLOperator.gql("where operator_id_lower = :1", UcfUtil.escapeGql(belong_member_email))
	#				entry = query.get()
	#				if entry is not None:
	#					member_unique_id = UcfUtil.nvl(entry.unique_id)
	#					member_name = helper.getUserNameDisp(UcfUtil.nvl(entry.last_name), UcfUtil.nvl(entry.first_name))
	#					member_type = 'ACCOUNT'
	#					is_hit = True
	#			# グループ検索
	#			if is_hit == False:
	#				query = UCFMDLOperatorGroup.gql("where group_id_lower = :1", UcfUtil.escapeGql(belong_member_email))
	#				entry = query.get()
	#				if entry is not None:
	#					member_unique_id = UcfUtil.nvl(entry.unique_id)
	#					member_name = UcfUtil.nvl(entry.group_name)
	#					member_type = 'GROUP'
	#					is_hit = True
	#
	#			member_mail_address = belong_member_email
	#			member_owner_flag = 'OWNER' if (belong_member_email in group_owners) else ''
	#			BelongMemberInfo.append({'UniqueID':member_unique_id,'Name':member_name,'MailAddress':member_mail_address,'Type':member_type,'OwnerFlag':member_owner_flag})

	#		# サーバーサイドではなくAJAXで取得する場合
	#		for belong_member_email in belong_members:
	#			member_mail_address = belong_member_email
	#			member_owner_flag = 'OWNER' if (belong_member_email in group_owners) else ''
	#			BelongMemberInfo.append({'MailAddress':member_mail_address,'OwnerFlag':member_owner_flag})

			vo['BelongMemberInfo'] = JSONEncoder().encode(BelongMemberInfo)

	editVoForSelect = classmethod(editVoForSelect)

	# 取得用：データ加工（一覧用）
	def editVoForList(cls, helper, vo):
		#vo['group_id_localpart'] = UcfUtil.getHashStr(vo, 'group_id').split('@')[0]
		vo['belong_members_count'] = UcfUtil.nvl(len(UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'belong_members'))))
	editVoForList = classmethod(editVoForList)

	# 取得用：データ加工（同期用）
	def editVoForSync(cls, helper, vo):
		#if UcfUtil.getHashStr(vo, 'group_auth_type') == '':
		#	vo['group_auth_type'] = 'Anyone'
		## [sateraito-sso-sync]タグをセット
		#if vo['comment'].find(UcfConfig.TAG_SATERAITO_SSO_SYNC) < 0:
		#	vo['comment'] += UcfConfig.TAG_SATERAITO_SSO_SYNC
		pass
	editVoForSync = classmethod(editVoForSync)

	# 取得用：データ加工（CSV用）
	def editVoForCsv(cls, helper, vo):
		#if UcfUtil.getHashStr(vo, 'group_auth_type') == '':
		#	vo['group_auth_type'] = 'Anyone'
		pass
	editVoForCsv = classmethod(editVoForCsv)

	# 取得用：データ加工（API用）
	def editVoForAPI(cls, helper, vo):
		#if UcfUtil.getHashStr(vo, 'group_auth_type') == '':
		#	vo['group_auth_type'] = 'Anyone'

		# XMLにセットするのでエスケープ 2015.03.27
		for k,v in vo.iteritems():
			vo[k] = sateraito_func.encodeXMLText(v)

	editVoForAPI = classmethod(editVoForAPI)

	# 取得用：データ加工（組織ツリー用）
	def editVoForTree(cls, helper, vo):
		pass
	editVoForTree = classmethod(editVoForTree)

	# 取得用：データ加工（CSVインポート時の取得）
	def editVoForSelectCsvImport(cls, helper, vo):
		OperatorGroupUtils.editVoForSelect(helper, vo, is_with_belong_member_info=False)
	editVoForSelectCsvImport = classmethod(editVoForSelectCsvImport)


	# 更新用：データ加工
	def editVoForRegist(cls, helper, vo, entry_vo, edit_type):

		if edit_type == UcfConfig.EDIT_TYPE_NEW:
			vo['dept_id'] = UcfUtil.getHashStr(helper.getDeptInfo(), 'dept_id')
		#if vo.has_key('group_id_localpart'):
		#	vo['group_id'] = UcfUtil.getHashStr(vo, 'group_id_localpart') + '@' + UcfUtil.getHashStr(vo, 'federated_domain')		# メールアドレス
		vo['group_id_lower'] = vo['group_id'].lower()									# 小文字（検索、重複チェック用）
		if vo.has_key('main_group_id'):
			vo['main_group_id'] = UcfUtil.getHashStr(vo, 'main_group_id').lower()									# 小文字


		########################
		# トップグループフラグ ※ parent_groups がなくなったので、DBみて判定する必要あり
		vo['top_group_flag'] = 'TOP'

		query = UCFMDLOperatorGroup.query()
		query = query.filter(UCFMDLOperatorGroup.belong_members == vo.get('group_id_lower', ''))
		for key in query.fetch(keys_only=True):
			vo['top_group_flag'] = ''
			break


#		########################
#		# 所属メンバー＆オーナー
#		if is_deal_belong_group_info:
#			belong_members = []
#			group_owners = []
#			belong_member_info = OperatorGroupUtils._getBelongMemberInfoFromRequest(vo)
#			if belong_member_info is not None:
#				for member in belong_member_info:
#					belong_members.append(UcfUtil.getHashStr(member, 'MailAddress').lower())
#					if UcfUtil.getHashStr(member, 'OwnerFlag') == 'OWNER':
#						group_owners.append(UcfUtil.getHashStr(member, 'MailAddress').lower())
#			vo['belong_members'] = UcfUtil.listToCsv(belong_members)
#
#			# オーナーはbelong_memberに存在するもののみ
#			for owner in group_owners:
#				if owner not in belong_members:
#					group_owners.remove(owner)
#			vo['group_owners'] = UcfUtil.listToCsv(group_owners)
#		else:

		belong_members = UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'belong_members'))
		group_owners = UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'group_owners'))
		# オーナーはbelong_memberに存在するもののみ ⇒ db.put内でチェックするようにしたのでコメントアウト 2013.10.18
		#for owner in group_owners:
		#	if owner not in belong_members:
		#		group_owners.remove(owner)
		vo['group_owners'] = UcfUtil.listToCsv(group_owners).lower()
		vo['belong_members'] = UcfUtil.listToCsv(belong_members).lower()

	editVoForRegist = classmethod(editVoForRegist)

	# 更新用：データ加工（同期用）
	def editVoForRegistBySync(cls, helper, vo, entry_vo, edit_type):

		if edit_type == UcfConfig.EDIT_TYPE_NEW:
			vo['dept_id'] = UcfUtil.getHashStr(helper.getDeptInfo(), 'dept_id')

		########################
		vo['group_id_lower'] = vo['group_id'].lower()									# 小文字（検索、重複チェック用）
		# セールスフォースはグループIDとメールアドレスは別なので上書きしない
		#vo['mail_address'] = UcfUtil.getHashStr(vo, 'group_id')		# メールアドレス
		#vo['mail_address_lower'] = UcfUtil.getHashStr(vo, 'mail_address').lower()									# 小文字（検索、重複チェック用）

		belong_members = UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'belong_members'))
		group_owners = UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'group_owners'))
		# オーナーはbelong_memberに存在するもののみ ⇒ db.put内でチェックするようにしたのでコメントアウト 2013.10.18
		#for owner in group_owners:
		#	if owner not in belong_members:
		#		group_owners.remove(owner)
		vo['group_owners'] = UcfUtil.listToCsv(group_owners).lower()
		vo['belong_members'] = UcfUtil.listToCsv(belong_members).lower()


		########################
		# トップグループフラグ ※ parent_groups がなくなったので、DBみて判定する必要あり
		vo['top_group_flag'] = 'TOP'
		query = UCFMDLOperatorGroup.query()
		query = query.filter(UCFMDLOperatorGroup.belong_members == vo.get('group_id_lower', ''))
		for key in query.fetch(keys_only=True):
			vo['top_group_flag'] = ''
			break

	editVoForRegistBySync = classmethod(editVoForRegistBySync)

	# 既存データを取得
	def getData(cls, helper, unique_id):
		query = UCFMDLOperatorGroup.query()
		query = query.filter(UCFMDLOperatorGroup.unique_id == unique_id)
		entry = query.get()
		return entry
	getData = classmethod(getData)

	# キーに使用する値を取得
	def getKey(cls, helper, vo):
		# キーをユニークIDに変更 2017.03.08
		#return UcfUtil.getHashStr(vo, 'group_id_lower') + UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
		return UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
	getKey = classmethod(getKey)

	# コピー新規用に不要なデータをvoから削除
	def removeFromVoForCopyRegist(cls, helper, vo):
		vo['unique_id'] = ''
		vo['date_created'] = ''
		vo['date_changed'] = ''
		vo['creator_name'] = ''
		vo['updater_name'] = ''
		vo['updater_name'] = ''
	removeFromVoForCopyRegist = classmethod(removeFromVoForCopyRegist)

	def _getBelongMemberInfoFromRequest(cls, vo):
		belong_member_info = None
		if UcfUtil.getHashStr(vo, 'BelongMemberInfo') != '':
			belong_member_info = JSONDecoder().decode(UcfUtil.getHashStr(vo, 'BelongMemberInfo'))
		return belong_member_info
	_getBelongMemberInfoFromRequest = classmethod(_getBelongMemberInfoFromRequest)

	# 所属メンバーのトップグループフラグを下ろす処理（これは削除の際にも使えるのでメソッド化）
	# deal_type:REMOVE…親グループに所属されたので、TOPフラグがたっていたら下ろす処理
	#						SET…親グループが削除あるいは親グループから所属解除されたので、その親がトップだった場合は代わりにトップになる処理（他に親グループがいるかも要確認）
	def updateBelongMembersTopGroupFlag(cls, helper, target_parent_group_id, belong_members, deal_type, operator_id=''):
		if belong_members is not None and len(belong_members) > 0:
			
			# IN クエリーの最大要素は３０個のようなので、30個ずつに処理を分ける
			idx = 0
			while idx >= 0:
				current_belong_members = belong_members[idx:idx+30]
				if len(current_belong_members) >= 30:
					idx = idx + 30
				else:
					idx = -1
				if len(current_belong_members) > 0:

					q = UCFMDLOperatorGroup.query()
					q = q.filter(UCFMDLOperatorGroup.group_id_lower.IN(current_belong_members))
					for entry in q:
						is_update = False
						if entry.top_group_flag == 'TOP' and deal_type == 'REMOVE':
							entry.top_group_flag = ''
							is_update = True
						elif (entry.top_group_flag is None or entry.top_group_flag == '') and deal_type == 'SET':
							# 他に親グループがいない場合のみセット
							q2 = UCFMDLOperatorGroup.query()
							q2 = q2.filter(UCFMDLOperatorGroup.group_id_lower == entry.group_id_lower)
							is_other_parent_exist = False
							for entry2 in q2:
								if entry2.group_id_lower != target_parent_group_id.lower():
									is_other_parent_exist = True
									break
							if is_other_parent_exist == False:
								entry.top_group_flag = 'TOP'
								is_update = True

						if is_update:

							# 更新日時、更新者の更新
							entry.updater_name = operator_id if operator_id != '' else helper.getLoginID()
							entry.date_changed = UcfUtil.getNow()
							# 更新処理
							entry.put()

	updateBelongMembersTopGroupFlag = classmethod(updateBelongMembersTopGroupFlag)

	# グループたちにユーザを追加（追加済みでなければ）あるいは削除
	def setOneUserToBelongGroups(cls, helper, user_mail_address, parent_groups, operator_id=''):

		add_groups = []		# オペレーションログ用
		del_groups = []		# オペレーションログ用

		if user_mail_address != '':
			already_deal_groups = []

			# 該当ユーザを所属メンバーとして保持しているグループを取得
			q = UCFMDLOperatorGroup.query()
			q = q.filter(UCFMDLOperatorGroup.belong_members == user_mail_address.lower())
			for entry in q:
				group_vo = entry.exchangeVo(helper._timezone)
				belong_members = UcfUtil.csvToList(group_vo['belong_members'])
				# 今回更新する親グループに存在しなければ削除
				if not UcfUtil.getHashStr(group_vo, 'group_id_lower') in parent_groups:
					belong_members.remove(user_mail_address.lower())
					group_vo['belong_members'] = UcfUtil.listToCsv(belong_members)
					entry.margeFromVo(group_vo, helper._timezone)
					# 更新日時、更新者の更新
					entry.updater_name = operator_id if operator_id != '' else helper.getLoginID()
					entry.date_changed = UcfUtil.getNow()
					# 更新処理
					entry.put()
					del_groups.append(UcfUtil.getHashStr(group_vo, 'group_id_lower'))
				# チェック済みのグループをリストに追加（後続の処理で無駄にチェックしないため）
				already_deal_groups.append(UcfUtil.getHashStr(group_vo, 'group_id_lower'))

			# 今回追加すべきグループをチェックし、まだ追加されていなければユーザを追加
			if parent_groups is not None and len(parent_groups) > 0:
				# IN クエリーの最大要素は３０個のようなので、30個ずつに処理を分ける
				idx = 0
				while idx >= 0:
					current_parent_groups = parent_groups[idx:idx+30]
					if len(current_parent_groups) >= 30:
						idx = idx + 30
					else:
						idx = -1
					if len(current_parent_groups) > 0:
						q = UCFMDLOperatorGroup.query()
						q = q.filter(UCFMDLOperatorGroup.group_id_lower.IN(current_parent_groups))
						for entry in q:
							group_vo = entry.exchangeVo(helper._timezone)
							# 既にチェック済みならスキップ
							if UcfUtil.getHashStr(group_vo, 'group_id_lower') in already_deal_groups:
								pass
							else:
								belong_members = UcfUtil.csvToList(group_vo['belong_members'])
								if user_mail_address.lower() in belong_members:
									pass
								else:
									belong_members.append(user_mail_address.lower())
									group_vo['belong_members'] = UcfUtil.listToCsv(belong_members)
									entry.margeFromVo(group_vo, helper._timezone)
									# 更新日時、更新者の更新
									entry.updater_name = operator_id if operator_id != '' else helper.getLoginID()
									entry.date_changed = UcfUtil.getNow()
									# 更新処理
									entry.put()
									add_groups.append(UcfUtil.getHashStr(group_vo, 'group_id_lower'))

		return add_groups, del_groups		# オペレーションログ用に返す
		
	setOneUserToBelongGroups = classmethod(setOneUserToBelongGroups)

	# 指定メールアドレスを所属メンバーに持つグループからそのメールアドレスを削除
	def removeOneMemberFromBelongGroups(cls, helper, member_mail_address, operator_id=''):
		if member_mail_address != '':
			member_mail_address = member_mail_address.lower()
			# 対象グループ一覧を取得
			q = UCFMDLOperatorGroup.query()
			q = q.filter(UCFMDLOperatorGroup.belong_members == member_mail_address)
			for entry in q:
				group_vo = entry.exchangeVo(helper._timezone)
				belong_members = UcfUtil.csvToList(UcfUtil.getHashStr(group_vo, 'belong_members'))
				belong_members.remove(member_mail_address)
				group_vo['belong_members'] = UcfUtil.listToCsv(belong_members)
				entry.margeFromVo(group_vo, helper._timezone)
				# 更新日時、更新者の更新
				entry.updater_name = operator_id if operator_id != '' else helper.getLoginID()
				entry.date_changed = UcfUtil.getNow()
				# 更新処理
				entry.put()
	removeOneMemberFromBelongGroups = classmethod(removeOneMemberFromBelongGroups)

	# グループIDでグループを取得
	def getGroupByGroupID(cls, helper, group_id):
		group_vo = None
		if group_id and group_id != '':
			query = UCFMDLOperatorGroup.query()
			query = query.filter(UCFMDLOperatorGroup.group_id_lower == group_id.lower())
			entry = query.get()
			if entry is not None:
				group_vo = entry.exchangeVo(helper._timezone)
				OperatorGroupUtils.editVoForSelect(helper, group_vo, is_with_belong_member_info=False)
		return group_vo
	getGroupByGroupID = classmethod(getGroupByGroupID)

	# このグループをメイン組織に設定しているグループのメイン組織をクリア
	def removeGroupsTargetMainGroup(cls, helper, group_id, operator_id=''):
		if group_id != '':
			group_id = group_id.lower()
			query = UCFMDLOperatorGroup.query()
			query = query.filter(UCFMDLOperatorGroup.main_group_id == group_id)
			for entry in query:
				# メイン組織IDをクリア
#				vo = entry.exchangeVo(helper._timezone)
#				vo['main_group_id'] = ''
#				entry.margeFromVo(vo, helper._timezone)
				entry.main_group_id = ''
				# 更新日時、更新者の更新
				entry.updater_name = operator_id if operator_id != '' else helper.getLoginID()
				entry.date_changed = UcfUtil.getNow()
				# 更新処理
				entry.put()
	removeGroupsTargetMainGroup = classmethod(removeGroupsTargetMainGroup)

	# ２つのVOに変更点があるかどうかを判定
	def isDiff(cls, helper, vo1, vo2):
		is_diff = False
		diff_for_operation_log = []	# オペレーションログに出力する情報のため、keyはユーザーライクにCSV項目と合わせる（出力不要項目の場合はセットしない）

		key = 'comment'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'comment', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'group_id'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'group_id', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'mail_address'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'mail_address', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'group_name'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'group_name', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'access_authority'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'access_authority', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'management_group'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'management_group', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'top_group_flag'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			is_diff = True
		key = 'main_group_id'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'main_group', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		#key = 'profile_infos'		# 
		#if vo1.get(key, '').lower() != vo2.get(key, '').lower():
		#	diff_for_operation_log.append({'key':'profile_id', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
		#	is_diff = True
		#key = 'o365_sync_flag'		# 
		#if vo1.get(key, '') != vo2.get(key, ''):
		#	diff_for_operation_log.append({'key':'o365_sync', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
		#	is_diff = True
		key = 'contact_company'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'company', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_company_office'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'company_office', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_company_department'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'company_department', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_company_department2'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'company_department2', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_company_post'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'job_title', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_email1'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'email_work', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_email2'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'email_work_phone', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_tel_no1'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'phone_work', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_tel_no2'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'fax_work', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_tel_no3'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'mobile_phone', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_tel_no4'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'extension_number', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_tel_no5'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'pocketbell', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_postal_code'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'postal_code', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_postal_country'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'company_country', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_postal_prefecture'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'postal_prefecture', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_postal_city'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'postal_city', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'contact_postal_street_address'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'postal_street_address', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True
		key = 'data_federation_group'		# 
		if vo1.get(key, '') != vo2.get(key, ''):
			diff_for_operation_log.append({'key':'data_federation_group', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
			is_diff = True

		# オーナー一覧
		key = 'group_owners'
		list1 = UcfUtil.csvToList(vo1.get(key, ''))
		list2 = UcfUtil.csvToList(vo2.get(key, ''))
		if not sateraito_func.isSameMembers(list1, list2):
			is_diff = True
			diff_for_operation_log.append({'key':'owners', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
		# 所属メンバー一覧
		key = 'belong_members'
		list1 = UcfUtil.csvToList(vo1.get(key, ''))
		list2 = UcfUtil.csvToList(vo2.get(key, ''))
		if not sateraito_func.isSameMembers(list1, list2):
			is_diff = True
			diff_for_operation_log.append({'key':'members', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})

		return is_diff, diff_for_operation_log
	isDiff = classmethod(isDiff)

	# エクスポート用CSVを作成
	def createCsv(cls, helper, login_operator_entry=None):

		with_cursor = True
		csv_records = []
		# タイトル
		titles = OperatorGroupUtils.getCsvTitles(helper)
		csv_records.append(UcfUtil.createCsvRecordEx(titles))

		# データ一覧取得
		q = UCFMDLOperatorGroup.query()
		# 委託管理者なら自分が触れるデータのみ対象
		if ucffunc.isDelegateOperator(login_operator_entry) and login_operator_entry.delegate_management_groups is not None and len(login_operator_entry.delegate_management_groups) > 0:
			q = q.filter(UCFMDLOperatorGroup.management_group == login_operator_entry.delegate_management_groups)
			# 管理グループが複数ある場合はカーソル使えないので
			if len(login_operator_entry.delegate_management_groups) >= 2:
				with_cursor = False

		max_export_cnt = -1
		cnt = 0
		#start = 0
		#limit = 100
		limit = 1000					# 通常の、max_export_cnt == 1000 のドメインは1発で取れたほうがいいはずなので 1000 とする
		start_cursor = None
		while True:

			if with_cursor:
				if start_cursor is not None:
					each_rows, start_cursor, more = q.fetch_page(limit, start_cursor=start_cursor)
				else:
					each_rows, start_cursor, more = q.fetch_page(limit)
			else:
				each_rows = q.iter(limit=limit, offset=cnt)

			each_cnt = 0
			for entry in each_rows:

				vo = entry.exchangeVo(helper._timezone)
				OperatorGroupUtils.editVoForCsv(helper, vo)

				data = []
				data.append('IU')																						# command
				data.append(UcfUtil.getHashStr(vo, 'group_id'))					# group_id
				data.append(UcfUtil.getHashStr(vo, 'group_name'))					# group_name
				data.append(UcfUtil.getHashStr(vo, 'mail_address'))					# email
				#data.append(UcfUtil.getHashStr(vo, 'profile_infos'))					# profile_id
				data.append(UcfUtil.getHashStr(vo, 'management_group'))					# management_group
				#data.append(UcfUtil.getHashStr(vo, 'o365_sync_flag'))						# o365_sync
				#data.append(UcfUtil.getHashStr(vo, 'group_auth_type'))						# email_permission
				data.append(UcfUtil.getHashStr(vo, 'belong_members'))						# members
				data.append(UcfUtil.getHashStr(vo, 'group_owners'))						# owners
				data.append(UcfUtil.getHashStr(vo, 'main_group_id')) # main_group
				data.append(UcfUtil.getHashStr(vo, 'contact_company')) # company
				data.append(UcfUtil.getHashStr(vo, 'contact_company_office')) # company_office
				data.append(UcfUtil.getHashStr(vo, 'contact_company_department')) # company_department
				data.append(UcfUtil.getHashStr(vo, 'contact_company_department2')) # company_department2
				data.append(UcfUtil.getHashStr(vo, 'contact_company_post')) # job_title
				data.append(UcfUtil.getHashStr(vo, 'contact_email1')) # email_work
				data.append(UcfUtil.getHashStr(vo, 'contact_email2')) # email_work_phone
				data.append(UcfUtil.getHashStr(vo, 'contact_tel_no1')) # phone_work
				data.append(UcfUtil.getHashStr(vo, 'contact_tel_no2')) # fax_work
				data.append(UcfUtil.getHashStr(vo, 'contact_tel_no3')) # mobile_phone
				data.append(UcfUtil.getHashStr(vo, 'contact_tel_no4')) # extension_number
				data.append(UcfUtil.getHashStr(vo, 'contact_tel_no5')) # pocketbell
				data.append(UcfUtil.getHashStr(vo, 'contact_postal_country')) # postal_country
				data.append(UcfUtil.getHashStr(vo, 'contact_postal_code')) # postal_code
				data.append(UcfUtil.getHashStr(vo, 'contact_postal_prefecture')) # postal_prefecture
				data.append(UcfUtil.getHashStr(vo, 'contact_postal_city')) # postal_city
				data.append(UcfUtil.getHashStr(vo, 'contact_postal_street_address')) # postal_street_address
				#data.append(UcfUtil.getHashStr(vo, 'is_nopublish_contact')) # nopublish_to_contact
				#data.append(UcfUtil.getHashStr(vo, 'is_nopublish_shared_contact')) # nopublish_to_shared_contact
				data.append(UcfUtil.getHashStr(vo, 'data_federation_group')) # data_federation_group
				data.append(UcfUtil.getHashStr(vo, 'comment'))						# comment

				csv_records.append(UcfUtil.createCsvRecordEx(data))
				each_cnt += 1

				vo = None
				entry = None
				if each_cnt % 100 == 0:
					gc.collect()

			cnt += each_cnt
			logging.info(cnt)

			# 件数上限
			if with_cursor:
				if cnt >= max_export_cnt or not more:
					break
			else:
				if (max_export_cnt > 0 and cnt >= max_export_cnt) or each_cnt < limit:
					break

		csv_text = '\r\n'.join(csv_records)
		return csv_text
	createCsv = classmethod(createCsv)

	# csv_dataからマージ＆整備（editVoForSelectしてない生のvoにマージ）
	def margeVoFromCsvRecord(cls, helper, vo, csv_record, login_operator_entry):
		if csv_record.has_key('group_id'):
			vo['group_id'] = csv_record['group_id']
			#email_split = csv_record['group_id'].strip().split('@')
			#vo['group_id_localpart'] = email_split[0]
			#vo['federated_domain'] = email_split[1] if len(email_split) >= 2 else ''
		if csv_record.has_key('email'):
			vo['mail_address'] = csv_record['email'].strip()
		if csv_record.has_key('name'):
			vo['group_name'] = csv_record['name'].strip()
		#if csv_record.has_key('profile_id'):
		#	vo['profile_infos'] = csv_record['profile_id'].strip()
		if csv_record.has_key('management_group'):
			vo['management_group'] = csv_record['management_group'].strip()
		#if csv_record.has_key('o365_sync'):
		#	vo['o365_sync_flag'] = csv_record['o365_sync'].strip()
		#if csv_record.has_key('email_permission'):
		#	vo['group_auth_type'] = csv_record['email_permission'].strip()
		if csv_record.has_key('members'):
			vo['belong_members'] = csv_record['members'].replace(' ','').strip(',').lower()
		if csv_record.has_key('owners'):
			vo['group_owners'] = csv_record['owners'].replace(' ','').strip(',').lower()
		if csv_record.has_key('main_group'):
			vo['main_group_id'] = csv_record['main_group'].strip().lower()
		if csv_record.has_key('company'):
			vo['contact_company'] = csv_record['company'].strip()
		if csv_record.has_key('company_office'):
			vo['contact_company_office'] = csv_record['company_office'].strip()
		if csv_record.has_key('company_department'):
			vo['contact_company_department'] = csv_record['company_department'].strip()
		if csv_record.has_key('company_department2'):
			vo['contact_company_department2'] = csv_record['company_department2'].strip()
		if csv_record.has_key('job_title'):
			vo['contact_company_post'] = csv_record['job_title'].strip()
		if csv_record.has_key('email_work'):
			vo['contact_email1'] = csv_record['email_work'].strip()
		if csv_record.has_key('email_work_phone'):
			vo['contact_email2'] = csv_record['email_work_phone'].strip()
		if csv_record.has_key('phone_work'):
			vo['contact_tel_no1'] = csv_record['phone_work'].strip()
		if csv_record.has_key('fax_work'):
			vo['contact_tel_no2'] = csv_record['fax_work'].strip()
		if csv_record.has_key('mobile_phone'):
			vo['contact_tel_no3'] = csv_record['mobile_phone'].strip()
		if csv_record.has_key('extension_number'):
			vo['contact_tel_no4'] = csv_record['extension_number'].strip()
		if csv_record.has_key('pocketbell'):
			vo['contact_tel_no5'] = csv_record['pocketbell'].strip()
		if csv_record.has_key('postal_country'):
			vo['contact_postal_country'] = csv_record['postal_country'].strip()
		if csv_record.has_key('postal_code'):
			vo['contact_postal_code'] = csv_record['postal_code'].strip()
		if csv_record.has_key('postal_prefecture'):
			vo['contact_postal_prefecture'] = csv_record['postal_prefecture'].strip()
		if csv_record.has_key('postal_city'):
			vo['contact_postal_city'] = csv_record['postal_city'].strip()
		if csv_record.has_key('postal_street_address'):
			vo['contact_postal_street_address'] = csv_record['postal_street_address'].strip()
		#if csv_record.has_key('nopublish_to_contact'):
		#	vo['is_nopublish_contact'] = csv_record['nopublish_to_contact'].strip()
		#if csv_record.has_key('nopublish_to_shared_contact'):
		#	vo['is_nopublish_shared_contact'] = csv_record['nopublish_to_shared_contact'].strip()
		if csv_record.has_key('data_federation_group'):
			vo['data_federation_group'] = csv_record['data_federation_group']
		if csv_record.has_key('comment'):
			vo['comment'] = csv_record['comment']
	margeVoFromCsvRecord = classmethod(margeVoFromCsvRecord)

	def getCsvTitles(cls, helper):
		return ['command','group_id','name','email','management_group','members','owners','main_group','company','company_office','company_department','company_department2','job_title','email_work','email_work_phone','phone_work','fax_work','mobile_phone','extension_number','pocketbell','postal_country','postal_code','postal_prefecture','postal_city','postal_street_address','comment']
	getCsvTitles = classmethod(getCsvTitles)


############################################################
## バリデーションチェッククラス 
############################################################
class OperatorGroupValidator(BaseValidator):

	def validate(self, helper, vo):

		# 初期化
		self.init()
		# チェック TODO 未対応項目に対応

		check_name = ''
		check_key = ''
		check_value = ''

		########################
		# グループID
		check_name = helper.getMsg('FLD_GROUPID')
		#check_key = 'group_id_localpart'
		check_key = 'group_id'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 半角英数字チェック
		if not self.alphabetNumberValidator(check_value, except_str=['-','_','.']):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_ALPHABETNUMBER'), (check_name)))
		## 最大長チェック：64文字（Appsにあわせて）
		#if not self.maxLengthValidator(check_value, 64):
		#	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 64)))
		# 最大長チェック：255文字
		if not self.maxLengthValidator(check_value, 255):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 255)))

#		########################
#		# グループID（ドメイン部分）
#		check_name = helper.getMsg('FLD_DOMAIN')
#		check_key = 'federated_domain'
#		check_value = UcfUtil.getHashStr(vo, check_key)
#		# 必須チェック
#		if not self.needValidator(check_value):
#			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
#		# 半角英数字チェック
#		if not self.alphabetNumberValidator(check_value, except_str=['-','_','.']):
#			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_ALPHABETNUMBER'), (check_name)))
#		## 最大長チェック：255文字
#		#if not self.maxLengthValidator(check_value, 255):
#		#	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 255)))

#		# グループIDとドメインの長さはメールアドレス形式でまとめてチェック
#		check_value = UcfUtil.getHashStr(vo, 'group_id_localpart') + '@' + UcfUtil.getHashStr(vo, 'federated_domain')		# メールアドレス
#		check_name = helper.getMsg('FLD_GROUPID')
#		check_key = 'group_id_localpart'
#		# 最大長チェック：（Salesforce：80文字）
#		if not self.maxLengthValidator(check_value, 80):
#			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 80)))

		########################
		# メールアドレス
		check_name = helper.getMsg('FLD_MAILADDRESS')
		check_key = 'mail_address'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# メールアドレス形式チェック
		if not self.mailAddressValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAILADDRESS')))
#		# メールアドレスのドメインチェック
#		if len(check_value.split('@')) >= 2:
#			email_domain = check_value.split('@')[1].lower()
#			federated_domains = sateraito_func.getFederatedDomainList(helper._tenant, is_with_cache=True)
#			if email_domain not in federated_domains:
#				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_DOMAIN')))


		########################
		# 組織名称
		check_name = helper.getMsg('FLD_GROUPNAME')
		check_key = 'group_name'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 最大長チェック：100文字
		if not self.maxLengthValidator(check_value, 100):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 100)))

		########################
		# 説明
		check_name = helper.getMsg('FLD_COMMENT')
		check_key = 'comment'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 最大長チェック
		int_length = 1000
		if not self.maxLengthValidator(check_value, int_length):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, int_length)))

		group_id = ''
		#if vo.has_key('group_id_localpart'):
		#	group_id = UcfUtil.getHashStr(vo, 'group_id_localpart') + '@' + UcfUtil.getHashStr(vo, 'federated_domain')
		#else:
		#	group_id = UcfUtil.getHashStr(vo, 'group_id')
		group_id = UcfUtil.getHashStr(vo, 'group_id')

		########################
		# 管理グループ
		check_name = helper.getMsg('FLD_MANAGEMENT_GROUP')
		check_key = 'management_group'
		check_value = UcfUtil.getHashStr(vo, check_key)
		if self.is_check_management_group and (self.delegate_management_groups is not None and len(self.delegate_management_groups) > 0) and (check_value == '' or not self.listPatternValidator(check_value, self.delegate_management_groups)):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_OUTOF_DELEGATE_MANAGEMENT_GROUPS'), (check_name,UcfUtil.listToCsv(self.delegate_management_groups))))

#		########################
#		# データ連携管理グループ
#		check_name = helper.getMsg('FLD_DATA_FEDERATION_GROUP')
#		check_key = 'data_federation_group'
#		check_value = UcfUtil.getHashStr(vo, check_key)
#		if not self.maxLengthValidator(check_value, 255):
#			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 255)))

		# 重複チェック （グループID）
		if self.total_count == 0:
			unique_id = UcfUtil.getHashStr(vo, 'unique_id')

			###############################################
			# グループＩＤ
			q = UCFMDLOperatorGroup.query()
			q = q.filter(UCFMDLOperatorGroup.group_id_lower == group_id.lower())
			for model in q:
				# 新規以外の場合は対象のユニークＩＤ以外の場合のみエラーとする(GQLがノットイコールに対応していないため)
				if self.edit_type == UcfConfig.EDIT_TYPE_NEW or model.unique_id != unique_id:
					self.appendValidate('group_id', UcfMessage.getMessage(helper.getMsg('MSG_VC_ALREADY_EXIST'), ()))
					break

			q = UCFMDLOperator.query()
			q = q.filter(UCFMDLOperator.operator_id_lower == group_id.lower())
			for model in q:
				# 新規以外の場合は対象のユニークＩＤ以外の場合のみエラーとする(GQLがノットイコールに対応していないため)
				if self.edit_type == UcfConfig.EDIT_TYPE_NEW or model.unique_id != unique_id:
					self.appendValidate('group_id', UcfMessage.getMessage(helper.getMsg('MSG_VC_ALREADY_EXIST'), ()))
					break

		# 自分自身を所属グループとしてセットしてないかをチェック
		belong_members = UcfUtil.csvToList(UcfUtil.getHashStr(vo, 'belong_members'))

		if self.total_count == 0:
			for member in belong_members:
				if member.lower() == group_id.lower():
					self.appendValidate('belong_member_address', UcfMessage.getMessage(helper.getMsg('MSG_BELONG_SELF_GROUP'), (member)))
					break

		# 循環参照チェック
		if self.total_count == 0:
			member_mail_address_lowers = {}
			for member in belong_members:
				member_mail_address_lowers[member.lower()] = ''

			if len(member_mail_address_lowers) > 0:
				is_duplicate, duplidate_belong_members = OperatorGroupValidator._checkDuplicateBelong(self, helper, group_id.lower(), member_mail_address_lowers)
				if is_duplicate:
					self.appendValidate('belong_member_address', UcfMessage.getMessage(helper.getMsg('MSG_BELONG_DUPLICATE_GROUP'), (UcfUtil.listToCsv(duplidate_belong_members))))

					
	# 循環参照チェック
	def _checkDuplicateBelong(validator, helper, group_mail_address_lower, member_mail_address_lowers):

		is_duplicate = False
		duplidate_belong_members = []

		# グループを所属メンバーとして保持しているグループを取得（つまり直親グループを取得）
		q = UCFMDLOperatorGroup.query()
		q = q.filter(UCFMDLOperatorGroup.belong_members == group_mail_address_lower)
		for model in q:
			parent_group_mail_address_lower = UcfUtil.nvl(model.group_id_lower)
			# チェック
			if member_mail_address_lowers.has_key(parent_group_mail_address_lower):
				is_duplicate = True
				duplidate_belong_members.append(parent_group_mail_address_lower)

			# さらに親をチェック
			if is_duplicate == False:	# とりあえず一つあったら終了
				is_duplicate, duplidate_belong_members = OperatorGroupValidator._checkDuplicateBelong(validator, helper, parent_group_mail_address_lower, member_mail_address_lowers)
			
		return is_duplicate, duplidate_belong_members
	_checkDuplicateBelong = staticmethod(_checkDuplicateBelong)
	

############################################################
## バリデーションチェッククラス：所属メンバー用
############################################################
class OperatorGroupBelongMemberValidator(BaseValidator):

	def validate(self, helper, vo):

		self.init()
		if not self.needValidator(UcfUtil.getHashStr(vo, 'belong_member_address')):
			self.appendValidate('belong_member_address', UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (helper.getMsg('FLD_BELONG_MEMBERS'))))

	def validate_for_outofdomain(self, helper, vo):

		self.init()
		if not self.mailAddressValidator(UcfUtil.getHashStr(vo, 'belong_member_address')):
			self.appendValidate('belong_member_address', UcfMessage.getMessage(helper.getMsg('MSG_VC_MAILADDRESS'), (helper.getMsg('FLD_BELONG_MEMBERS'))))

	def validate_for_duplicate(self, helper, vo):
		self.init()
		belong_member_address = UcfUtil.getHashStr(vo, 'belong_member_address')
		belong_member_address_lower =  belong_member_address.lower()
		belong_member_type = UcfUtil.getHashStr(vo, 'belong_member_type')
		#self_id_lower = UcfUtil.getHashStr(vo, 'self_group_id_localpart').lower() + '@' + UcfUtil.getHashStr(vo, 'self_federated_domain').lower()
		self_id_lower = UcfUtil.getHashStr(vo, 'self_group_id').lower()

		# 自分自身を所属グループとしてセットしてないかをチェック
		if belong_member_address_lower == self_id_lower:
			self.appendValidate('belong_member_address', UcfMessage.getMessage(helper.getMsg('MSG_BELONG_SELF_GROUP'), (belong_member_address)))

		# 循環参照チェック
		member_mail_address_lowers = {}
		member_mail_address_lowers[belong_member_address_lower] = ''
		is_duplicate, duplidate_belong_members = OperatorGroupValidator._checkDuplicateBelong(self, helper, self_id_lower, member_mail_address_lowers)
		if is_duplicate:
			self.appendValidate('belong_member_address', UcfMessage.getMessage(helper.getMsg('MSG_BELONG_DUPLICATE_GROUP'), (UcfUtil.listToCsv(duplidate_belong_members))))

############################################################
## バリデーションチェッククラス：CSV用（レコードとしてのチェックはその後行う）
############################################################
class OperatorGroupCsvValidator(BaseValidator):

	def validate(self, helper, vo):

		# 初期化
		self.init()

		check_name = ''
		check_key = ''
		check_value = ''

		########################
		# まず必須項目チェック
		# command
		check_key = 'command'
		check_name = check_key
		check_value = UcfUtil.getHashStr(vo, check_key)
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# group_id
		check_key = 'group_id'
		check_name = check_key
		check_value = UcfUtil.getHashStr(vo, check_key)
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))

		#######################
		# 項目チェック（CSVカラムがある場合のみ）
		# command
		check_key = 'command'
		check_name = check_key
		if vo.has_key(check_key):
			# 候補
			check_value = UcfUtil.getHashStr(vo, check_key)
			if not self.listPatternValidator(check_value, ['I','U','D','IU']):
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MATCHING'), (check_name,'I,U,D,IU')))

		# group_id
		check_key = 'group_id'
		check_name = check_key
		if vo.has_key(check_key):
			check_value = UcfUtil.getHashStr(vo, check_key)
			if not self.mailAddressValidator(check_value):
				self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAILADDRESS')))
			else:
				#email_domain = ''
				#if len(check_value.split('@')) >= 2:
				#	email_domain = check_value.split('@')[1].lower()
				#	federated_domains = sateraito_func.getFederatedDomainList(helper._tenant, is_with_cache=True)
				#	if email_domain not in federated_domains:
				#		self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_DOMAIN')))
				pass

		# email
		check_key = 'email'
		check_name = check_key
		if vo.has_key(check_key):
			check_value = UcfUtil.getHashStr(vo, check_key)
			if check_value != '':
				if not self.mailAddressValidator(check_value):
					self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAILADDRESS')))
				else:
					#email_domain = ''
					#if len(check_value.split('@')) >= 2:
					#	email_domain = check_value.split('@')[1].lower()
					#	#federated_domains = UcfUtil.csvToList(helper.getDeptInfo()['federated_domains'])
					#	federated_domains = sateraito_func.getFederatedDomainList(helper._tenant, is_with_cache=True)
					#	if email_domain not in federated_domains:
					#		self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_DOMAIN')))
					pass



############################################################
## ビューヘルパー
############################################################
class OperatorGroupViewHelper(ViewHelper):

	def applicate(self, vo, helper):
		voVH = {}

		# ここで表示用変換を必要に応じて行うが、原則Djangoテンプレートのフィルタ機能を使う
		for k,v in vo.iteritems():
			voVH[k] = v	

		return voVH
