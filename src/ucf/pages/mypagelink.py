# coding: utf-8

import webapp2,logging
from google.appengine.api import memcache
from ucf.utils.validates import BaseValidator
from ucf.utils.models import *
from ucf.utils.helpers import *
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
import sateraito_inc
import sateraito_func


############################################################
## マイページのカスタムリンク関連メソッド
############################################################
class MyPageLinkUtils():

	DEFAULT_LINK_ID = 'default'
	DEFAULT_UNIQUE_ID = '3498181626464be99a8e4daa35d6c6b7'

	# 初期値用：データ加工
	def editVoForDefault(cls, helper, vo):
		pass
	editVoForDefault = classmethod(editVoForDefault)

	# チェックボックス値補正（TODO 本来はフロントからPOSTするようにExtJsなどで処理すべきが取り急ぎ）
	def setNotPostValue(cls, helper, req):
		# チェックボックス項目
		cbx_fields = [
		]
		for field in cbx_fields:
			if not req.has_key(field[0]):
				req[field[0]] = field[1]
	setNotPostValue = classmethod(setNotPostValue)

	# 取得用：データ加工
	def editVoForSelect(cls, helper, vo):
		pass
	editVoForSelect = classmethod(editVoForSelect)

	# 取得用：データ加工
	def editVoForList(cls, helper, vo):
		pass
	editVoForList = classmethod(editVoForList)

	# 更新用：データ加工
	def editVoForRegist(cls, helper, vo, entry_vo, edit_type):
		if edit_type == UcfConfig.EDIT_TYPE_NEW:
			vo['dept_id'] = UcfUtil.getHashStr(helper.getDeptInfo(), 'dept_id')

		vo['link_id_lower'] = vo.get('link_id', '').lower()
		
		# リンク数を算出
		link_info_json = UcfUtil.getHashStr(vo, 'link_info')
		if link_info_json != '':
			link_info = JSONDecoder().decode(link_info_json)

			# 各リンクにidを付与（未設定の場合だけ）
			for link_data in link_info:
				link = link_data.get('link')
				if not link.has_key('id') or link['id'] == '':
					link['id'] = UcfUtil.guid()
			vo['link_info'] = JSONEncoder().encode(link_info)
			vo['link_count'] = str(len(link_info))
		else:
			vo['link_count'] = str(len(0))

	editVoForRegist = classmethod(editVoForRegist)

	# 既存データを取得
	def getData(cls, helper, unique_id):
		query = UCFMDLMyPageLink.gql("where unique_id = :1", UcfUtil.escapeGql(unique_id))
		entry = query.get()
		return entry
	getData = classmethod(getData)

	# キーに使用する値を取得
	def getKey(cls, helper, vo):
		return UcfUtil.getHashStr(vo, 'link_id').lower() + UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
	getKey = classmethod(getKey)

	# コピー新規用に不要なデータをvoから削除
	def removeFromVoForCopyRegist(cls, helper, vo):
		vo['unique_id'] = ''
		vo['date_created'] = ''
		vo['date_changed'] = ''
		vo['creator_name'] = ''
		vo['updater_name'] = ''

	removeFromVoForCopyRegist = classmethod(removeFromVoForCopyRegist)

	# にて1件取得
	def getMyPageLinkByLinkID(cls, helper, link_id, is_with_cache=False):

		link_vo = None
		if link_id is not None and link_id != '':

			# ログインパフォーマンスチューニング…少しだけキャッシュ
			if is_with_cache:
				link_vo = MyPageLinkUtils.getMyPageLinkMemCache(helper, link_id)

			if link_vo is None:
				query = UCFMDLMyPageLink.all()
				query.filter('link_id_lower = ', link_id.lower())
				entry = query.get()
				if entry is not None:
					link_vo = entry.exchangeVo(helper._timezone)
					MyPageLinkUtils.editVoForSelect(helper, link_vo)
				# セットは、is_with_cacheによらずしてOK
				MyPageLinkUtils.setMyPageLinkMemCache(helper, link_id, link_vo)

		# Json展開
		if link_vo is not None:
			link_info = []
			link_info_json = UcfUtil.getHashStr(link_vo, 'link_info')
			if link_info_json != '':
				link_info = JSONDecoder().decode(link_info_json)
			link_vo['link_info'] = link_info
		return link_vo
	getMyPageLinkByLinkID = classmethod(getMyPageLinkByLinkID)

	def getMyPageLinkMemCache(cls, helper, link_id):
		memcache_key = 'mypagelink?tenant=' + helper._tenant + '&link_id=' + link_id
		return memcache.get(memcache_key)
	getMyPageLinkMemCache = classmethod(getMyPageLinkMemCache)

	def setMyPageLinkMemCache(cls, helper, link_id, link_vo):
		memcache_key = 'mypagelink?tenant=' + helper._tenant + '&link_id=' + link_id
		memcache.set(key=memcache_key, value=link_vo, time=300)
	setMyPageLinkMemCache = classmethod(setMyPageLinkMemCache)


############################################################
## バリデーションチェッククラス 
############################################################
class MyPageLinkValidator(BaseValidator):

	def validate(self, helper, vo):

		# 初期化
		self.init()
		# チェック TODO 未対応項目に対応

		check_name = ''
		check_key = ''
		check_value = ''

		########################
		# リンクID
		check_name = helper.getMsg('FLD_MYPAGELINK_LINK_ID')
		check_key = 'link_id'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 半角英数字チェック
		if not self.alphabetNumberValidator(check_value, except_str=['-','_','.']):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_ALPHABETNUMBER'), (check_name)))
		# 最大長チェック：40文字（長すぎても微妙なので）
		if not self.maxLengthValidator(check_value, 40):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 40)))

		#########################
		## リンク設定名称
		#check_name = helper.getMsg('FLD_MYPAGELINK_LINK_NAME')
		#check_key = 'link_name'
		#check_value = UcfUtil.getHashStr(vo, check_key)
		## 必須チェック
		#if not self.needValidator(check_value):
		#	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		## 最大長チェック：６０文字（なんとなく）
		#if not self.maxLengthValidator(check_value, 60):
		#	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 60)))

		#########################
		## 説明
		#check_name = helper.getMsg('FLD_COMMENT')
		#check_key = 'comment'
		#check_value = UcfUtil.getHashStr(vo, check_key)
		## 最大長チェック：500文字（なんとなく）
		#if not self.maxLengthValidator(check_value, 500):
		#	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 500)))

		# 重複チェック
		if self.total_count == 0:
			unique_id = UcfUtil.getHashStr(vo, 'unique_id')

			###############################################
			# リンクID

			gql = ''
			# WHERE句
			wheres = []
			wheres.append("link_id_lower='" + UcfUtil.escapeGql(UcfUtil.nvl(vo['link_id']).lower()) + "'")
			gql += UcfUtil.getToGqlWhereQuery(wheres)
			models = UCFMDLMyPageLink.gql(gql)

			for model in models:
				# 新規以外の場合は対象のユニークＩＤ以外の場合のみエラーとする(GQLがノットイコールに対応していないため)
				if self.edit_type == UcfConfig.EDIT_TYPE_NEW or model.unique_id != unique_id:
					self.appendValidate('link_id', UcfMessage.getMessage(helper.getMsg('MSG_VC_ALREADY_EXIST'), ()))
					break


############################################################
## ビューヘルパー
############################################################
class MyPageLinkViewHelper(ViewHelper):

	def applicate(self, vo, helper):
		voVH = {}

		# ここで表示用変換を必要に応じて行うが、原則Djangoテンプレートのフィルタ機能を使う
		for k,v in vo.iteritems():
			voVH[k] = v	

		return voVH
