#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import json
import datetime, logging, time
from dateutil import zoneinfo, tz
from google.appengine.ext import db
from google.appengine.ext import ndb
from google.appengine.api import memcache
from google.appengine.api import namespace_manager
from google.appengine.api import search
from ucf.utils.ucfutil import UcfUtil
import sateraito_func
import sateraito_inc

from google.appengine.ext import blobstore
from simplejson.encoder import JSONEncoder

'''
sateraito_db.py

@since: 2012-01-23
@version: 2012-03-13
@author: T.ASAO
'''

# メモリ使いすぎ感があるので...
#NDB_MEMCACHE_TIMEOUT = (60 * 60 * 24 * 2)
NDB_MEMCACHE_TIMEOUT = (60 * 60 * 1)
DICT_MEMCACHE_TIMEOUT = (60 * 60 * 24 * 2)
#DICT_MEMCACHE_TIMEOUT = (60 * 60 * 24)


############################################################
## ビジネスルール
############################################################
class BusinessRule(ndb.Model):
	unique_id = ndb.StringProperty(required=True)  # 内部ユニークID
	rule_id = ndb.StringProperty()        # ルールID（webhookのURLにも入るので半角英数字）※TODO unique_idを使ったほうがいいかも。その場合不要　⇒　ランダム英数字を自動発行
	rule_name = ndb.StringProperty()      # 管理用名称
	comment = ndb.TextProperty()        # 管理メモ
	management_group = ndb.StringProperty()      # 管理グループ

	trigger_channel_kind = ndb.StringProperty()    # トリガー用のチャネル種別（lineworksbotなど）
	trigger_channel_config = ndb.TextProperty()    # トリガー（INPUT）用のチャネル設定詳細（JSON.当面１つ）
	logic_config = ndb.TextProperty()              # ロジック情報（JSON）
	action_channel_config = ndb.TextProperty()    # アクション（OUTPUT）用のチャネル設定詳細（JSON.最大１０アクション）

	send_grid_api_key = ndb.StringProperty()      #sendgrid api key

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)
	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	@classmethod
	def getInstance(cls, rule_id):
		q = cls.query()
		q = q.filter(cls.rule_id == rule_id)
		key = q.get(keys_only=True)
		rule_row = key.get() if key is not None else None

		if rule_row is None and sateraito_inc.developer_mode:
			# TODO 開発用にダミーデータ作成（本来はGUI上でユーザーがチャネルパネルごとにパラメータをセットして保存）
			rule_row = BusinessRule()

			###################
			# トリガー

			# LINE WORKS BOT
			if False:
				rule_row.trigger_channel_kind = 'lineworksbot'
				trigger_channel_config = {
					# INPUTJSONデータのどのキー（設定が必要な項目はチャネルごとに違うがうまく設定画面で指定させる）
					# /で始まるものはJSONのパス、それ以外は固定値を表すものとする
					'data_mapping': {
						'sender': '/source/account',
						# チャットボット送り元ユーザーのLINE WORKS IDを含むキー（サブ階層の場合はxpathライクに「/」区切り.）　※テキストボックスに入力させる or チャネルによっては固定
						'sender_type': 'lineworks_id',
						# senderが通知サーバーユーザーマスターの何にあたるか（operator_id,employee_id,lineworks_id,mail_address,,,）※プルダウンで選択させる or チャネルによっては固定
					},
					'open_api_id': 'jp1rzViwVrOew',
					'bot_no': 480,

					}
				# FACEBOOK WORKPLACE BOT
			if False:
				rule_row.trigger_channel_kind = 'facebookworkplacebot'
				trigger_channel_config = {
					'data_mapping': {
						'sender': '/sender/email',
						'sender_type': 'facebookworkplace_id',
						},
					'app_id': '',
					'app_secret': '',
					'access_token': '',
					'verify_token': ''
				}
				# REST
			if False:
				rule_row.trigger_channel_kind = 'rest'
				trigger_channel_config = {
					# INPUTJSONデータのどのキー（設定が必要な項目はチャネルごとに違うがうまく設定画面で指定させる）
					# /で始まるものはJSONのパス、それ以外は固定値を表すものとする
					'data_mapping': {
						'sender': '/xxxx', # メッセージの送信元IDを含むキー（サブ階層の場合はxpathライクに「/」区切り.）　※テキストボックスに入力させる or チャネルによっては固定
						'sender_type': 'xxxx',
						# senderが通知サーバーユーザーマスターの何にあたるか（operator_id,employee_id,lineworks_id,mail_address,,,）※プルダウンで選択させる or チャネルによっては固定
					},
					'content_kind': '',
					}
				# サテライトアドオン（ワークフローなど）
			if True:
				rule_row.trigger_channel_kind = 'sateraitoaddon'
				trigger_channel_config = {
					# INPUTJSONデータのどのキー（設定が必要な項目はチャネルごとに違うがうまく設定画面で指定させる）
					# /で始まるものはJSONのパス、それ以外は固定値を表すものとする
					'data_mapping': {
						'sender': '/sender', # メッセージの送信元IDを含むキー（サブ階層の場合はxpathライクに「/」区切り.）　※テキストボックスに入力させる or チャネルによっては固定
						'sender_type': 'operator_id',
						# senderが通知サーバーユーザーマスターの何にあたるか（operator_id,employee_id,lineworks_id,mail_address,,,）※プルダウンで選択させる or チャネルによっては固定
					},
					'addon_kind': 'SATERAITO_WORKFLOW',
					}
			rule_row.trigger_channel_config = json.JSONEncoder().encode(trigger_channel_config)

			###################
			# TODO ビジネスルール

			###################
			# アクション

			# LINE WORKS BOT
			if True:
				action_channel_config = [
						{
						'__channel_title__': 'LINE WORKS BOT',
						'__channel_kind__': 'lineworksbot',
						# TODO アクション実行タイミング（朝の７：００以降とか）
						'__schedule__': {},
						# contentsデータと本チャネルで使用する項目マッピング（設定が必要な項目はチャネルごとに違うがうまく設定画面で指定させる）
						# /で始まるものはJSONのパス、それ以外は固定値を表すものとする
						#↓はトリガーがサテライトアドオンのイメージ
						'data_mapping': {
							'to': '/email', # チャットボット送り先ユーザーIDを含む項目キー
							#'to':	'__sender__', # __sender__ 予約語. トリガーで指定されたsenderに送り返すイメージ
							'to_type': 'operator_id',
							# toが通知サーバーユーザーマスターの何にあたるか（operator_id,employee_id,lineworks_id,mail_address,,,）※プルダウンで選択させる or チャネルによっては固定

							'message_type': 'link', # チャットメッセージタイプ（link or image or text... デフォルト=text. imageは未対応）
							'message_body': '/body',
							'link_url': '/detail_url',
							'link_text': '/abstract',
							},
						'open_api_id': 'jp1pODnyTtwxk',
						'bot_no': '485',
						'consumer_key': 'oy3osR7z2umMkMfYRUp7',
						#'server_token': 'AAAA7XOPrm0oie/tNNokK0ytRFNkE4UzT3v7pzAyt7zWccIAxdR9w+qgclDUXNXEG47+c30WDN4kz3JqzpkniI+A6hTmz3OeYx0M1yqy5xYBlqoxEXoVU72RZvZuHsMAC9w8BcHXLJB51RDFq6jAhQvziaNy+1k+IU/5Kc+L8Hb6AvSbQkWnXzRcrN5ftcW2nuHT9CYfc/5H0itUcBFKr1A0SqGwl9T8+cup+1nokngzJCq2ppmFaA8S8ceElmgnxw49X3FLePO44oKm7qgP0szYYCLTYGjv5AY2SkVqguLoPWbC7e3rwrq3MdZeuuAPY2OxmA==',
						'server_id': '9fc28d64ef3c478dbab48e3c4265d09a',
						'priv_key': '''-----BEGIN RSA PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDUMhURM/4/58+P
3T4qdaqG3nSBwn7raZC5acp8/kpPg2+OL7OxX17XWRZwzyNeo0+bnrxnuIOOL2Gw
QyAi12W78ZIFJbznLgotbFnaGvKu11AR92NS0FNXi/w5+UB7i9e0rf7DWeS5bbsT
cctypzzJ+xpkq74iLtWuSfvbaJLDiQBiPucgktjKHLVou22M7Bq4y7ARnrEhOoaA
TIHNEFl2zFt2ExLr3g2Kvn9JtYwvPo3Yrrcn4WrOpLy0aACOO0gl8u5Ua+zSDfik
TYudXq+zJBGrjHDUDTtWPG3QYVWEQmRaP03YBhxhQ8k7JkbsufODgFSX4Xn2Kmin
KX68rKMHAgMBAAECggEBAIIZFquOeiLKSIsG9Zdovx2jhEEOc2x4M8BKKVjLO9pW
Vm4RtxVXyLk1qLmPdjsO278o6pCZIydoy3cbILfb4kcBzCoVwiTnKFxDIy/C9+nU
nwX07FOY4JA7hnAw7qUQzza6uwkgs0gxC9LXIQpxmKapqrvwREmG94G9YIpcKidx
WRU9cXyfqAQH+TmBDT9vHZ8UCNB2TEY48ojMdoWZcjzBPJvFY5mUDxxp4K81ACOn
9adqrljFT06TLtZNmOnMwEkyu3ZPwvqXD/8oJAv644L7hFtOCkEEKGJr40mrGE8j
m/0qYetEkqWnmRL1OzDbtadPDHWd+ejgan8VcnA+QbkCgYEA7CvtMj+tSwQsmRl2
TeRrl0JgK6pbVIe/XBxcaZdT5YMH1D8bQHRFLJQ87ZsXPHlbpfcGdcZ2HRkNrc0F
9VQJifpD6pbVmEgHnCnELQWbCe9m+YsfpcsbH5z7fI//vvRiyT/xFWFF4DZRcaBE
nGGsxGfljHH5UR7ifFB0/6aqzW0CgYEA5gLWNaOxvujfAjxbzn4miHtY21J0RLx2
u5jrqH9WCzV6F2t0Knjsr+biU9FHknG+/VFsr7uSyqRxL3N4Me39qhOHyhtP5SS0
MELnFO231q7q4BSiwn2oFeJLhtlyNe3RH5YYU4fkgbOGHEkumn5d/H7BMfGId7Km
qP4DKhCOLcMCgYARvLLRxUqEicm3rdveubsC3y9N2DuHu7I5fr/KBl18rTyXSi4H
xzOyx2dUCQPTvOGPM2A+1CrmwIzwcqdx51/YBv22zqE4EKDRr6lWIEemlV5Me5Bi
6UAePbH9husUMlKA/tZiXq3ayvmO6RR+Ei/hiFQLGjw5RXKJF5nR4XiOeQKBgCe9
V7s+xAgC/fzJ5ua/XvL3tLt3/ISftzfkTNr43SnknGqNcy2fZO1jS7lFkEMaCfCE
b+3Qz6TZUoDrR1oBD3GiHDTsERq7A7LO7FPuWnPqFsSObCyEP1VAmuH6kcQFibsW
WK+d6/oIxWP/tOCWcrCcSc7SN0zO/gJ2mJ9c6uO3AoGBAL5hMz+sIkRTBQADJ89B
LrpG8W9DwmJQIST1qYnGmTsEyvnqSAmqiAVc13hd8BmAzLnNBa8DT85aPixA2q+Q
kgg2p2CFaALTUHG6riupElOP4hb78sCmsj4efJ5dCyVq4sDd+s9U3exXpCi/8saK
OywvrXG1avsxM+fslNDbCsly
-----END RSA PRIVATE KEY-----''',
						# ↓は通知サーバーからBOT自体を作成するインタフェースを用意する場合は必要だが、それはチャネル単位に保持する必要はないはず（同じボットに送るチャネルを複数登録するケースもあるはずなので）
						#'bot_name': u'サテライトオフィス・ワークフロー',
						#'bot_icon_url':'https://workflow.sateraito.jp/images/chatbot_icon.png',
						#'adminuser': 'oka@sateraito',
					}
				]
			rule_row.action_channel_config = json.JSONEncoder().encode(action_channel_config)

			# ToDo test config for Facebook Workplace bot

		return rule_row

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'rule_id': UcfUtil.nvl(self.rule_id),
			'rule_name': UcfUtil.nvl(self.rule_name),
			'comment': UcfUtil.nvl(self.comment),
			'management_group': UcfUtil.nvl(self.management_group),
			'trigger_channel_kind': UcfUtil.nvl(self.trigger_channel_kind),
			'trigger_channel_config': UcfUtil.nvl(self.trigger_channel_config),
			'logic_config': UcfUtil.nvl(self.logic_config),
			'action_channel_config': UcfUtil.nvl(self.action_channel_config),
		  'send_grid_api_key': UcfUtil.nvl(self.send_grid_api_key),
			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.rule_id = vo.get('rule_id', '')
		self.rule_name = vo.get('rule_name', '')
		self.comment = vo.get('comment', '')
		self.management_group = vo.get('management_group', '')
		self.trigger_channel_kind = vo.get('trigger_channel_kind', '')
		self.trigger_channel_config = vo.get('trigger_channel_config', '')
		self.logic_config = vo.get('logic_config', '')
		self.action_channel_config = vo.get('action_channel_config', '')
		self.send_grid_api_key = vo.get('send_grid_api_key', '')
		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')

	@classmethod
	def getChannelAccessToken(cls):
		channel_access_token = ''
		q = cls.query()
		key = q.get(keys_only=True)
		rule_row = key.get() if key is not None else None
		if rule_row:
			channel_config = None
			if rule_row.trigger_channel_config is not None and rule_row.trigger_channel_config != '':
				channel_config = json.JSONDecoder().decode(rule_row.trigger_channel_config)
			if channel_config:
				channel_access_token = channel_config.get('channel_access_token', '')

		return channel_access_token

############################################################
## ビジネストリガー（履歴用）
############################################################
class BusinessTrigger(ndb.Model):
	unique_id = ndb.StringProperty(required=True)  # 内部ユニークID
	businessrule_unique_id = ndb.StringProperty()
	rule_id = ndb.StringProperty()        # ルールID
	channel_kind = ndb.StringProperty()    # テスト実行の場合は空
	is_test_execution = ndb.BooleanProperty()
	contents = ndb.TextProperty()            # 受け渡された＆ビジネスルールで加工したデータ
	access_datetime = ndb.DateTimeProperty()
	status = ndb.StringProperty()
	client_ip = ndb.StringProperty()
	user_agent = ndb.TextProperty()
	log_text = ndb.TextProperty()
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def getInstance(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		return row

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'businessrule_unique_id': UcfUtil.nvl(self.businessrule_unique_id),
			'rule_id': UcfUtil.nvl(self.rule_id),
			'is_test_execution': self.is_test_execution if self.is_test_execution is not None else False,
			'channel_kind': UcfUtil.nvl(self.channel_kind),
			'contents': UcfUtil.nvl(self.contents),
			'access_datetime': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.access_datetime, timezone)) if self.access_datetime is not None else '',
			'status': UcfUtil.nvl(self.status),
			'client_ip': UcfUtil.nvl(self.client_ip),
			'user_agent': UcfUtil.nvl(self.user_agent),
			'log_text': UcfUtil.nvl(self.log_text),
			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			}
		return vo


############################################################
## アクション（スケジュール実行もあるしログの意味も含めて必ずレコード登録）
############################################################
class BusinessAction(ndb.Model):
	unique_id = ndb.StringProperty(required=True)  # 内部ユニークID
	businessrule_unique_id = ndb.StringProperty()
	trigger_unique_id = ndb.StringProperty()
	rule_id = ndb.StringProperty()        # ルールID
	is_test_execution = ndb.BooleanProperty()
	channel_kind = ndb.StringProperty()
	channel_config = ndb.TextProperty()    # チャネル設定詳細
	estimated_datetime = ndb.DateTimeProperty()  # 実行予定時刻
	execute_datetime = ndb.DateTimeProperty()    # 実行日時
	target_user_ids = ndb.StringProperty(repeated=True)    # 送信するユーザーのID一覧（sateraito_db.Userのuser_id）
	contents = ndb.TextProperty()            # 受け渡された＆ビジネスルールで加工したデータ
	status = ndb.StringProperty()
	log_text = ndb.TextProperty()
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def getInstance(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		return row

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'rule_id': UcfUtil.nvl(self.rule_id),
			'is_test_execution': self.is_test_execution if self.is_test_execution is not None else False,
			'businessrule_unique_id': UcfUtil.nvl(self.businessrule_unique_id),
			'trigger_unique_id': UcfUtil.nvl(self.trigger_unique_id),
			'channel_kind': UcfUtil.nvl(self.channel_kind),
			'channel_config': UcfUtil.nvl(self.channel_config),
			'estimated_datetime': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.estimated_datetime, timezone)) if self.estimated_datetime is not None else '',
			'execute_datetime': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.execute_datetime, timezone)) if self.execute_datetime is not None else '',
			'target_user_ids': UcfUtil.listToCsv(self.target_user_ids) if self.target_user_ids is not None else '',
			'contents': UcfUtil.nvl(self.contents),
			'status': UcfUtil.nvl(self.status),
			'log_text': UcfUtil.nvl(self.log_text),
			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			}
		return vo

############################################################
## EVENTS MEMO CHAT
############################################################
class EventChatMemo(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	user_id = ndb.StringProperty()
	memo = ndb.TextProperty()
	creater_by = ndb.StringProperty()
	date_due = ndb.StringProperty(default='')
	date_due_query = ndb.DateTimeProperty()
	status = ndb.StringProperty(default='NONE')   #DONE , NONE

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)
	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

############################################################
## EVENTS UNREAD CHAT
############################################################
class EventChatUnread(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	user_id = ndb.StringProperty()
	unread = ndb.IntegerProperty(default=0)

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)
	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	@classmethod
	def updateUnread(cls, user_id, isIncrease=False):
		"""
                 Return str
                """
		q = cls.query()
		q = q.filter(cls.user_id == user_id)
		key = q.get(keys_only=True)

		@ndb.transactional(propagation=ndb.TransactionOptions.INDEPENDENT)
		def countup(key):
			unread = 0
			if key:
				row = key.get(memcache_timeout=NDB_MEMCACHE_TIMEOUT)
				if isIncrease:
					unread = row.unread + 1
				else:
					unread = row.unread - 1

				if unread < 0:
					unread = 0
				row.unread = unread
			else:
				unread = 1
				row = cls()
				row.unique_id = UcfUtil.guid()
				row.user_id = user_id
				row.unread = unread

			row.put()
			return str(unread)

		return countup(key)


############################################################
## EVENTS CHAT
############################################################
class EventChat(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	user_id = ndb.StringProperty()
	event_type = ndb.StringProperty()
	event_text = ndb.StringProperty()
	event_json = ndb.TextProperty()
	user_reply = ndb.StringProperty(default='')
	read_flag = ndb.BooleanProperty(default=False)
	reply_flag = ndb.BooleanProperty(default=False)

	#data
	blob_key = ndb.TextProperty(default='')

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)
	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	def put(self, without_update_fulltext_index=False, update_read_flag=False, read_flag='1'):
		if not without_update_fulltext_index:
			try:
				# update full-text indexes.
				EventChat.addEventToTextSearchIndex(self)
			except Exception, e:
				logging.info('failed update event full-text index. unique_id=' + self.unique_id)
				logging.exception(e)

		if update_read_flag:
			try:
				# update full-text indexes.
				EventChat.updateReadFlagEventToTextSearchIndex(self, read_flag=read_flag)
			except Exception, e:
				logging.info('failed update event full-text index. unique_id=' + self.unique_id)
				logging.exception(e)

		ndb.Model.put(self)

	def delete(self):
		try:
			EventChat.removeEventFromIndex(self.unique_id)
		except Exception, e:
			logging.info('failed delete event full-text index. unique_id=' + self.unique_id)
			logging.exception(e)
			#ndb.Model.delete(self)
		self.key.delete()

	@classmethod
	def updateReadFlagEventToTextSearchIndex(cls, entry, read_flag='1'):
		index = search.Index(name='event_chat_index')
		doc = index.get(doc_id=entry.unique_id)
		if doc:
			fields = []
			for field in doc.fields:
				if field.name == 'read_flag':
					fields.append(search.TextField(name=field.name, value=read_flag))
				elif field.name == 'created_date':
					fields.append(search.DateField(name=field.name, value=field.value))
				elif field.name == 'chat_date':
					fields.append(search.NumberField(name=field.name, value=field.value))
				else:
					fields.append(search.TextField(name=field.name, value=field.value))

			#Renew document index
			search_document = search.Document(doc_id=entry.unique_id, fields=fields)
			index.put(search_document)


	# ユーザーを全文検索用インデックスに追加する関数
	@classmethod
	def addEventToTextSearchIndex(cls, entry):
		vo = entry.exchangeVo(sateraito_inc.DEFAULT_TIMEZONE)  # 日付関連の項目はインデックスしないのでデフォルトタイムゾーンでOKとする

		#logging.info(vo)

		# 検索用のキーワードをセット
		keyword = ''
		keyword += ' ' + vo.get('user_id', '')
		keyword += ' ' + vo.get('event_type', '')
		keyword += ' ' + vo.get('event_text', '')
		keyword += ' ' + vo.get('event_json', '')
		keyword += ' ' + vo.get('user_reply', '')

		read_flag = vo.get('read_flag', False)
		read_flag_str = '1' if read_flag else '0'

		reply_flag = vo.get('reply_flag', False)
		reply_flag_str = '1' if reply_flag else '0'

		chat_date_unixtime = sateraito_func.datetimeToMyUnixtime(UcfUtil.getNow())

		search_document = search.Document(
			doc_id=entry.unique_id,
			fields=[
				search.TextField(name='unique_id', value=vo.get('unique_id', '')), # キー
				search.TextField(name='user_id', value=vo.get('user_id', '')), # 検索用
				search.TextField(name='event_type', value=vo.get('event_type', '')),
				search.TextField(name='event_text', value=vo.get('event_text', '')),
				search.TextField(name='event_json', value=vo.get('event_json', '')),
				search.TextField(name='user_reply', value=vo.get('user_reply', '')),
				search.TextField(name='read_flag', value=read_flag_str),
				search.TextField(name='reply_flag', value=reply_flag_str),
				search.TextField(name='text', value=keyword), # 検索
				search.DateField(name='created_date', value=UcfUtil.getNow()),
				search.NumberField(name='chat_date', value=chat_date_unixtime),
				search.TextField(name='blob_key', value=vo.get('blob_key', '')),
				])

		index = search.Index(name='event_chat_index')
		index.put(search_document)

	# 全文検索用インデックスより指定されたunique_idを持つインデックスを削除する関数
	@classmethod
	def removeEventFromIndex(cls, unique_id):
		# remove text search index
		index = search.Index(name='event_chat_index')
		index.delete(unique_id)

	@classmethod
	def getDictFromTextSearchIndex(cls, ft_result, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		dict = {}
		for field in ft_result.fields:
			if field.name in ['chat_date']:
				pass
			elif field.name in ['event_text']:
				strValue = field.value.strip('#')
				dict[field.name] = UcfUtil.parseURLToLink(strValue)
			elif field.name in ['event_json']:
				event_json_str = field.value.strip('#')
				dict[field.name] = event_json_str

				event_json = json.JSONDecoder().decode(event_json_str)

				#Get message reply (Location)
				if event_json.has_key('message'):
					dict['message_content'] = event_json['message']
				else:
					dict['message_content'] = {}

				#push_location
				if event_json.has_key('action_type'):
					if event_json['action_type'] == 'push_location':
						dict['message_content'] = event_json

				#Get stickerId post
				if event_json.has_key('stickerId'):
					dict['stickerId'] = '{0}_{1}'.format(event_json['stickerId'], event_json['packageId'])
				else:
					dict['stickerId'] = '' #set default

			elif field.name in ['user_reply']:
				strValue = field.value.strip('#')
				dict[field.name] = strValue
				dict['prefix_name'] = strValue[0] if len(strValue) > 0 else ''
			elif field.name in ['event_text']:
				dict[field.name] = field.value.strip('#').replace('\r\n', '<br>').replace('\n', '<br>')
			elif field.name in ['created_date']:
				if field.value:
					create_date = UcfUtil.getLocalTime(field.value, timezone)
					dict[field.name] = create_date.strftime('%Y%m%d')
					dict['create_time'] = create_date.strftime('%I:%M %p')
				else:
					dict[field.name] = ''
					dict['create_time'] = ''
					#logging.info(create_date)
					#dict['create_time'] = UcfUtil.nvl(UcfUtil.getLocalTime(field.value, timezone)) if field.value is not None else '',
			else:
				dict[field.name] = field.value.strip('#')
		return dict

	# フルテキストカタログから一覧用の取得フィールドを返す
	@classmethod
	def getReturnedFieldsForTextSearch(cls):
		return ['unique_id', 'user_id', 'event_type', 'event_text', 'user_reply', 'read_flag', 'reply_flag', 'created_date',
						'blob_key', 'message_content']

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'user_id': UcfUtil.nvl(self.user_id),
			'event_type': UcfUtil.nvl(self.event_type),
			'event_text': UcfUtil.nvl(self.event_text),
			'event_json': UcfUtil.nvl(self.event_json),
			'user_reply': UcfUtil.nvl(self.user_reply),
			'read_flag': self.read_flag if self.read_flag is not None else False,
			'reply_flag': self.reply_flag if self.reply_flag is not None else False,
			'blob_key': UcfUtil.nvl(self.blob_key),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.user_id = vo.get('user_id', '')
		self.event_type = vo.get('event_type', '')
		self.event_text = vo.get('event_text', '')
		self.event_json = vo.get('event_json', '')
		self.user_reply = vo.get('user_reply', '')
		self.read_flag = vo.get('read_flag', False)
		self.reply_flag = vo.get('reply_flag', False)
		self.blob_key = vo.get('blob_key', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')


############################################################
## モデル：ユーザ
############################################################
class User(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	comment = ndb.TextProperty()

	user_id = ndb.StringProperty()                # ユーザID
	user_id_lower = ndb.StringProperty()          # ユーザID（小文字）
	employee_id = ndb.StringProperty()
	employee_id_lower = ndb.StringProperty()        # 小文字のみ
	mail_address = ndb.StringProperty()
	mail_address_lower = ndb.StringProperty()      # 小文字のみ
	lineworks_id = ndb.StringProperty()                # LINE WORKS ID
	lineworks_id_lower = ndb.StringProperty()                # LINE WORKS ID（小文字のみ）
	line_id = ndb.StringProperty(default='')
	line_id_lower = ndb.StringProperty()
	facebookworkplace_id = ndb.StringProperty()
	facebookworkplace_id_lower = ndb.StringProperty()
	facebook_id = ndb.StringProperty()
	facebook_id_lower = ndb.StringProperty()

	last_name = ndb.StringProperty()
	first_name = ndb.StringProperty()
	last_name_kana = ndb.StringProperty()
	first_name_kana = ndb.StringProperty()

	birthday = ndb.StringProperty()   #Birthday
	picture_url = ndb.StringProperty(default='')

	management_group = ndb.StringProperty()      # 管理グループ（例：営業部門）…この管理グループの管理を委託された委託管理者がこのデータを管理できるようになる
	main_group_id = ndb.StringProperty()              # 小文字のみ
	language = ndb.StringProperty()  # 言語設定

	# 連絡先・組織アドレス帳・ワークフロー関連項目
	contact_company = ndb.StringProperty()                # 会社名
	contact_company_office = ndb.StringProperty()                # 事業所
	contact_company_department = ndb.StringProperty()                # 部署
	contact_company_department2 = ndb.StringProperty()                # 課・グループ
	contact_company_post = ndb.StringProperty()                # 役職
	contact_email1 = ndb.StringProperty()                # メールアドレス（仕事）
	contact_email2 = ndb.StringProperty()                # メールアドレス（携帯）
	contact_tel_no1 = ndb.StringProperty()                # 電話番号
	contact_tel_no2 = ndb.StringProperty()                # FAX番号
	contact_tel_no3 = ndb.StringProperty()                # 携帯番号
	contact_tel_no4 = ndb.StringProperty()                # 内線
	contact_tel_no5 = ndb.StringProperty()                # ポケットベル
	contact_postal_country = ndb.StringProperty()                # 国、地域
	contact_postal_code = ndb.StringProperty()                # 郵便番号
	contact_postal_prefecture = ndb.StringProperty()                # 住所（都道府県）
	contact_postal_city = ndb.StringProperty()                # 住所（市区町村）
	contact_postal_street_address = ndb.TextProperty()                # 住所（番地）

	# custom_attribute1 = ndb.StringProperty()                # 追加属性1 ※汎用SSOシステム等で使用する
	# custom_attribute2 = ndb.StringProperty()                # 追加属性2
	# custom_attribute3 = ndb.StringProperty()                # 追加属性3
	# custom_attribute4 = ndb.StringProperty()                # 追加属性4
	# custom_attribute5 = ndb.StringProperty()                # 追加属性5
	# custom_attribute6 = ndb.StringProperty()                # 追加属性6
	# custom_attribute7 = ndb.StringProperty()                # 追加属性7
	# custom_attribute8 = ndb.StringProperty()                # 追加属性8
	# custom_attribute9 = ndb.StringProperty()                # 追加属性9
	# custom_attribute10 = ndb.StringProperty()                # 追加属性10
	#
	# custom_attribute11 = ndb.StringProperty()                # 追加属性11
	# custom_attribute12 = ndb.StringProperty()                # 追加属性12
	# custom_attribute13 = ndb.StringProperty()                # 追加属性13
	# custom_attribute14 = ndb.StringProperty()                # 追加属性14
	# custom_attribute15 = ndb.StringProperty()                # 追加属性15
	# custom_attribute16 = ndb.StringProperty()                # 追加属性16
	# custom_attribute17 = ndb.StringProperty()                # 追加属性17
	# custom_attribute18 = ndb.StringProperty()                # 追加属性18
	# custom_attribute19 = ndb.StringProperty()                # 追加属性19
	# custom_attribute20 = ndb.StringProperty()                # 追加属性20
	#
	# custom_attribute21 = ndb.StringProperty()                # 追加属性21
	# custom_attribute22 = ndb.StringProperty()                # 追加属性22
	# custom_attribute23 = ndb.StringProperty()                # 追加属性23
	# custom_attribute24 = ndb.StringProperty()                # 追加属性24
	# custom_attribute25 = ndb.StringProperty()                # 追加属性25
	# custom_attribute26 = ndb.StringProperty()                # 追加属性26
	# custom_attribute27 = ndb.StringProperty()                # 追加属性27
	# custom_attribute28 = ndb.StringProperty()                # 追加属性28
	# custom_attribute29 = ndb.StringProperty()                # 追加属性29
	# custom_attribute30 = ndb.StringProperty()                # 追加属性30

	flag_user = ndb.StringProperty(default='LINEWORKS')			# LINE|LINEWORKS|FACEBOOK|FACEBOOKWORKPLACE
	flag_leave = ndb.IntegerProperty(default=0)

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)
	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	def put(self, without_update_fulltext_index=False):
		if not without_update_fulltext_index:
			try:
				# update full-text indexes.
				User.addUserToTextSearchIndex(self)
			except Exception, e:
				logging.info('failed update user full-text index. unique_id=' + self.unique_id)
				logging.exception(e)

		#clear cache user info
		self.clearCacheUserInfo(self.user_id)

		ndb.Model.put(self)

	def delete(self):
		try:
			User.removeUserFromIndex(self.unique_id)
		except Exception, e:
			logging.info('failed delete user full-text index. unique_id=' + self.unique_id)
			logging.exception(e)
			#ndb.Model.delete(self)
		self.key.delete()

	# ユーザーマスターの利用数を取得
	@classmethod
	def getActiveUserAmount(cls, tenant):
		memcache_key = 'getactiveuseramount?tenant=' + tenant
		active_users = memcache.get(memcache_key)
		if active_users is not None:
			return active_users

		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace(tenant.lower())
		try:
			# 利用ユーザー数を返す（たまたま物理削除がなく全件取得すればOKなのでこれでよし）
			q = cls.query()
			active_users = q.count(limit=1000000)
			memcache.set(key=memcache_key, value=active_users, time=3600)
			return active_users
		finally:
			namespace_manager.set_namespace(strOldNamespace)

	# ユーザーマスターの利用数のキャッシュをクリア（ユーザー登録、削除時など）
	@classmethod
	def clearActiveUserAmountCache(cls, tenant):
		memcache_key = 'getactiveuseramount?tenant=' + tenant
		memcache.delete(memcache_key)

	@classmethod
	def clearCacheUserInfo(cls, user_id):
		memcache_key = 'getuserinfo?user_id=' + user_id
		memcache.delete(memcache_key)

	@classmethod
	def getDict(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		entry = key.get() if key is not None else None
		if entry:
			row_dict = entry.to_dict()
			row_dict['id'] = entry.key.id()
			return row_dict
		return None

	#User Info
	@classmethod
	def getUserInfo(cls, user_id):
		if user_id is None or user_id == '':
			return None

		memcache_key = 'getuserinfo?user_id=' + user_id
		entry = memcache.get(memcache_key)
		if entry is not None:
			#logging.info('Found memcahce UserInfo')
			return entry

		query = cls.query()
		query = query.filter(cls.user_id == user_id)
		key = query.get(keys_only=True)
		entry = key.get() if key is not None else None
		if entry is None:
			return None
		row_dict = entry.to_dict()
		row_dict['id'] = entry.key.id()
		memcache.set(key=memcache_key, value=row_dict, time=3600)

		return row_dict

	@classmethod
	def getUserByLineID(cls, line_id):
		entry = None
		if line_id and line_id != '':
			query = cls.query()
			query = query.filter(cls.line_id == line_id)
			key = query.get(keys_only=True)
			entry = key.get() if key is not None else None
		return entry

	@classmethod
	def getUserByUserID(cls, user_id):
		logging.info(user_id)
		entry = None
		if user_id and user_id != '':
			query = cls.query()
			query = query.filter(cls.user_id == user_id)
			key = query.get(keys_only=True)
			entry = key.get() if key is not None else None
		return entry

	@classmethod
	def getUniqueIdByUserID(cls, user_id):
		entry = cls.getUserByUserID(user_id)
		if entry:
			return entry.unique_id

		return ''

	@classmethod
	def getUserNameByUserID(cls, user_id):
		entry = cls.getUserByUserID(user_id)
		if entry:
			return u'{0} {1}'.format(entry.last_name ,entry.first_name)

		return ''

	@classmethod
	def getUserName(cls, user_id,author_name=''):
		author_name = UcfUtil.nvl(author_name)
		if author_name=='':
			entry = cls.getUserByUserID(user_id)
			if entry:
				return u'{0} {1}'.format(entry.last_name ,entry.first_name)
			else:
				entry = cls.getUserByLineID(user_id)
				if entry:
					return u'{0} {1}'.format(entry.last_name ,entry.first_name)
		else:
			return author_name

	@classmethod
	def getUserNameFixID(cls, user_id,author_name=''):
		author_name = UcfUtil.nvl(author_name)
		author_id = user_id
		if author_name=='':
			entry = cls.getUserByUserID(user_id)
			if entry:
				author_name = u'{0} {1}'.format(entry.last_name ,entry.first_name)
			else:
				entry = cls.getUserByLineID(user_id)
				if entry:
					author_id = entry.user_id
					author_name = u'{0} {1}'.format(entry.last_name ,entry.first_name)

		return author_name, author_id

	# フルテキストカタログから一覧用の取得フィールドを返す
	@classmethod
	def getReturnedFieldsForTextSearch(cls):
			return ['unique_id', 'user_id', 'mail_address', 'employee_id', 'lineworks_id', 'line_id', 'facebookworkplace_id',
						'facebook_id', 'first_name', 'last_name', 'first_name_kana', 'last_name_kana', 'birthday', 'picture_url',
						'flag_leave']

	@classmethod
	def getReturnedFieldsNotForTextSearch(cls):
			return ['is_regist','flag_leave','date_created', 'date_changed','created_date','change_date']

	# フルテキストインデックスからハッシュデータ化して返す
	@classmethod
	def getDictFromTextSearchIndexFullInfo(cls, ft_result):
		dict = {}
		for field in ft_result.fields:
			if not field.name in cls.getReturnedFieldsNotForTextSearch():
				dict[field.name] = UcfUtil.nvl(field.value.strip('#'))
		return dict

	# フルテキストインデックスからハッシュデータ化して返す
	@classmethod
	def getDictFromTextSearchIndex(cls, ft_result):
		dict = {}
		for field in ft_result.fields:
			if field.name in cls.getReturnedFieldsForTextSearch():
				dict[field.name] = field.value.strip('#')
		return dict

	@classmethod
	def getDictFromTextSearchIndex2(cls, ft_result, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		dict = {}
		for field in ft_result.fields:
			if field.name in ['is_regist']:
				dict[field.name] = field.value
			elif field.name in ['created_date']:
				dict[field.name] = UcfUtil.nvl(UcfUtil.getLocalTime(field.value, timezone)) if field.value is not None else ''
			elif field.name in ['change_date']:
				logging.info(field.value)
			else:
				dict[field.name] = field.value.strip('#')
		return dict


	@classmethod
	def updateUserToTextSearchIndex(cls, entry):
		logging.info('==============updateUserToTextSearchIndex============')
		index = search.Index(name='user_index')
		doc = index.get(doc_id=entry.unique_id)

		change_date_unixtime = sateraito_func.datetimeToMyUnixtime(UcfUtil.getNow())

		if doc:
			fields = []
			for field in doc.fields:
				if field.name == 'change_date':
					fields.append(search.NumberField(name=field.name, value=change_date_unixtime))
				elif field.name == 'is_regist':
					fields.append(search.NumberField(name=field.name, value=field.value))
				elif field.name == 'created_date':
					fields.append(search.DateField(name=field.name, value=UcfUtil.getNow()))
				else:
					fields.append(search.TextField(name=field.name, value=field.value))

			#Renew document index
			search_document = search.Document(doc_id=entry.unique_id, fields=fields)
			index.put(search_document)
			
		
	# ユーザーを全文検索用インデックスに追加する関数
	@classmethod
	def addUserToTextSearchIndex(cls, entry):
		vo = entry.exchangeVo(sateraito_inc.DEFAULT_TIMEZONE)  # 日付関連の項目はインデックスしないのでデフォルトタイムゾーンでOKとする

		#logging.info(vo)

		# 検索用のキーワードをセット
		keyword = ''
		keyword += ' ' + vo.get('comment', '')
		keyword += ' ' + vo.get('user_id', '')
		keyword += ' ' + vo.get('mail_address', '')
		keyword += ' ' + vo.get('employee_id', '')
		keyword += ' ' + vo.get('lineworks_id', '')
		keyword += ' ' + vo.get('line_id', '')
		keyword += ' ' + vo.get('facebookworkplace_id', '')
		keyword += ' ' + vo.get('facebook_id', '')
		keyword += ' ' + vo.get('last_name', '')
		keyword += ' ' + vo.get('first_name', '')
		keyword += ' ' + vo.get('last_name_kana', '')
		keyword += ' ' + vo.get('first_name_kana', '')
		keyword += ' ' + vo.get('birthday', '')
		keyword += ' ' + vo.get('contact_company', '')
		keyword += ' ' + vo.get('contact_company_office', '')
		keyword += ' ' + vo.get('contact_company_department', '')
		keyword += ' ' + vo.get('contact_company_department2', '')
		keyword += ' ' + vo.get('contact_company_post', '')
		keyword += ' ' + vo.get('contact_email1', '')
		keyword += ' ' + vo.get('contact_email2', '')
		keyword += ' ' + vo.get('contact_tel_no1', '')
		keyword += ' ' + vo.get('contact_tel_no2', '')
		keyword += ' ' + vo.get('contact_tel_no3', '')
		keyword += ' ' + vo.get('contact_tel_no4', '')
		keyword += ' ' + vo.get('contact_tel_no5', '')
		keyword += ' ' + vo.get('contact_postal_code', '')
		keyword += ' ' + vo.get('contact_postal_prefecture', '')
		keyword += ' ' + vo.get('contact_postal_city', '')
		keyword += ' ' + vo.get('contact_postal_street_address', '')
		# keyword += ' ' + vo.get('custom_attribute1', '')
		# keyword += ' ' + vo.get('custom_attribute2', '')
		# keyword += ' ' + vo.get('custom_attribute3', '')
		# keyword += ' ' + vo.get('custom_attribute4', '')
		# keyword += ' ' + vo.get('custom_attribute5', '')
		# keyword += ' ' + vo.get('custom_attribute6', '')
		# keyword += ' ' + vo.get('custom_attribute7', '')
		# keyword += ' ' + vo.get('custom_attribute8', '')
		# keyword += ' ' + vo.get('custom_attribute9', '')
		# keyword += ' ' + vo.get('custom_attribute10', '')
		# keyword += ' ' + vo.get('custom_attribute11', '')
		# keyword += ' ' + vo.get('custom_attribute22', '')
		# keyword += ' ' + vo.get('custom_attribute13', '')
		# keyword += ' ' + vo.get('custom_attribute14', '')
		# keyword += ' ' + vo.get('custom_attribute15', '')
		# keyword += ' ' + vo.get('custom_attribute16', '')
		# keyword += ' ' + vo.get('custom_attribute17', '')
		# keyword += ' ' + vo.get('custom_attribute18', '')
		# keyword += ' ' + vo.get('custom_attribute19', '')
		# keyword += ' ' + vo.get('custom_attribute20', '')
		# keyword += ' ' + vo.get('custom_attribute21', '')
		# keyword += ' ' + vo.get('custom_attribute22', '')
		# keyword += ' ' + vo.get('custom_attribute23', '')
		# keyword += ' ' + vo.get('custom_attribute24', '')
		# keyword += ' ' + vo.get('custom_attribute25', '')
		# keyword += ' ' + vo.get('custom_attribute26', '')
		# keyword += ' ' + vo.get('custom_attribute27', '')
		# keyword += ' ' + vo.get('custom_attribute28', '')
		# keyword += ' ' + vo.get('custom_attribute29', '')
		# keyword += ' ' + vo.get('custom_attribute30', '')
		keyword += ' ' + vo.get('flag_user', '')

		is_regist = 0
		# line_id = vo.get('line_id', '')
		# if (line_id != ''): is_regist = 1
		if vo.get('lineworks_id', '') != '':
			is_regist = 1
		
		change_date_unixtime = sateraito_func.datetimeToMyUnixtime(UcfUtil.getNow())

		search_document = search.Document(
			doc_id=entry.unique_id,
			fields=[
				search.TextField(name='unique_id', value=vo.get('unique_id', '')), # キー
				search.TextField(name='user_id', value=vo.get('user_id', '')), # 検索用
				search.TextField(name='user_id_lower', value=vo.get('user_id_lower', '')), # 検索用
				search.TextField(name='mail_address', value=vo.get('mail_address', '')), # 表示用
				search.TextField(name='employee_id', value=vo.get('employee_id', '')), # 表示用
				search.TextField(name='lineworks_id', value=vo.get('lineworks_id', '')), # 表示用
				search.TextField(name='line_id', value=vo.get('line_id', '')),
				search.TextField(name='facebookworkplace_id', value=vo.get('facebookworkplace_id', '')),
				search.TextField(name='facebook_id', value=vo.get('facebook_id', '')),
				search.TextField(name='first_name', value=vo.get('first_name', '')), # 表示用
				search.TextField(name='last_name', value=vo.get('last_name', '')),
				search.TextField(name='last_name_kana', value=vo.get('last_name_kana', '')),
				search.TextField(name='first_name_kana', value=vo.get('first_name_kana', '')), # 表示用
				search.TextField(name='management_group', value='#' + vo.get('management_group', '') + '#'), # 検索用

				search.TextField(name='contact_company', value=vo.get('contact_company', '')),
				search.TextField(name='contact_company_office', value=vo.get('contact_company_office', '')), # 表示用
				search.TextField(name='contact_company_department', value=vo.get('contact_company_department', '')),
				search.TextField(name='contact_company_department2', value=vo.get('contact_company_department2', '')),
				search.TextField(name='contact_email1', value=vo.get('contact_email1', '')),
				search.TextField(name='contact_email2', value=vo.get('contact_email2', '')),
				search.TextField(name='contact_tel_no1', value=vo.get('contact_tel_no1', '')),
				search.TextField(name='contact_tel_no2', value=vo.get('contact_tel_no2', '')),
				search.TextField(name='contact_tel_no3', value=vo.get('contact_tel_no3', '')),
				search.TextField(name='contact_tel_no4', value=vo.get('contact_tel_no4', '')),
				search.TextField(name='contact_tel_no5', value=vo.get('contact_tel_no5', '')),
				search.TextField(name='contact_postal_country', value=vo.get('contact_postal_country', '')),
				search.TextField(name='contact_postal_code', value=vo.get('contact_postal_code', '')),
				search.TextField(name='contact_postal_city', value=vo.get('contact_postal_city', '')),
				search.TextField(name='contact_postal_street_address', value=vo.get('contact_postal_street_address', '')),
				search.TextField(name='contact_postal_prefecture', value=vo.get('contact_postal_prefecture', '')), # 表示用
				search.TextField(name='text', value=keyword), # 検索
				search.NumberField(name='is_regist', value=is_regist), #user regist profile LINE
				search.DateField(name='created_date', value=UcfUtil.getNow()),
				search.TextField(name='birthday', value=vo.get('birthday', '')),
				search.TextField(name='flag_user', value=vo.get('flag_user', '')),
				search.TextField(name='comment', value=vo.get('comment', '')),
				search.TextField(name='flag_user', value=vo.get('flag_user', '')),
				search.TextField(name='picture_url', value=vo.get('picture_url', '')),
				search.TextField(name='flag_leave', value=vo.get('flag_leave', '')),


				# search.TextField(name='custom_attribute1', value=vo.get('custom_attribute1', '')),
				# search.TextField(name='custom_attribute2', value=vo.get('custom_attribute2', '')),
				# search.TextField(name='custom_attribute3', value=vo.get('custom_attribute3', '')),
				# search.TextField(name='custom_attribute4', value=vo.get('custom_attribute4', '')),
				# search.TextField(name='custom_attribute5', value=vo.get('custom_attribute5', '')),
				# search.TextField(name='custom_attribute6', value=vo.get('custom_attribute6', '')),
				# search.TextField(name='custom_attribute7', value=vo.get('custom_attribute7', '')),
				# search.TextField(name='custom_attribute8', value=vo.get('custom_attribute8', '')),
				# search.TextField(name='custom_attribute9', value=vo.get('custom_attribute9', '')),
				# search.TextField(name='custom_attribute10', value=vo.get('custom_attribute10', '')),
				# search.TextField(name='custom_attribute11', value=vo.get('custom_attribute11', '')),
				# search.TextField(name='custom_attribute12', value=vo.get('custom_attribute12', '')),
				# search.TextField(name='custom_attribute13', value=vo.get('custom_attribute13', '')),
				# search.TextField(name='custom_attribute14', value=vo.get('custom_attribute14', '')),
				# search.TextField(name='custom_attribute15', value=vo.get('custom_attribute15', '')),
				# search.TextField(name='custom_attribute16', value=vo.get('custom_attribute16', '')),
				# search.TextField(name='custom_attribute17', value=vo.get('custom_attribute17', '')),
				# search.TextField(name='custom_attribute18', value=vo.get('custom_attribute18', '')),
				# search.TextField(name='custom_attribute19', value=vo.get('custom_attribute19', '')),
				# search.TextField(name='custom_attribute20', value=vo.get('custom_attribute20', '')),
				# search.TextField(name='custom_attribute21', value=vo.get('custom_attribute21', '')),
				# search.TextField(name='custom_attribute22', value=vo.get('custom_attribute22', '')),
				# search.TextField(name='custom_attribute23', value=vo.get('custom_attribute23', '')),
				# search.TextField(name='custom_attribute24', value=vo.get('custom_attribute24', '')),
				# search.TextField(name='custom_attribute25', value=vo.get('custom_attribute25', '')),
				# search.TextField(name='custom_attribute26', value=vo.get('custom_attribute26', '')),
				# search.TextField(name='custom_attribute27', value=vo.get('custom_attribute27', '')),
				# search.TextField(name='custom_attribute28', value=vo.get('custom_attribute28', '')),
				# search.TextField(name='custom_attribute29', value=vo.get('custom_attribute29', '')),
				# search.TextField(name='custom_attribute30', value=vo.get('custom_attribute30', '')),
				search.NumberField(name='change_date', value=change_date_unixtime)
				])

		index = search.Index(name='user_index')
		index.put(search_document)

	# 全文検索用インデックスより指定されたunique_idを持つインデックスを削除する関数
	@classmethod
	def removeUserFromIndex(cls, unique_id):
		# remove text search index
		index = search.Index(name='user_index')
		index.delete(unique_id)


	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'comment': UcfUtil.nvl(self.comment),
			'user_id': UcfUtil.nvl(self.user_id),
			'user_id_lower': UcfUtil.nvl(self.user_id_lower),
			'employee_id': UcfUtil.nvl(self.employee_id),
			'employee_id_lower': UcfUtil.nvl(self.employee_id_lower),
			'lineworks_id': UcfUtil.nvl(self.lineworks_id),
			'lineworks_id_lower': UcfUtil.nvl(self.lineworks_id_lower),
			'line_id': UcfUtil.nvl(self.line_id),
			'line_id_lower': UcfUtil.nvl(self.line_id_lower),
			'facebookworkplace_id': UcfUtil.nvl(self.facebookworkplace_id),
			'facebookworkplace_id_lower': UcfUtil.nvl(self.facebookworkplace_id_lower),
			'facebook_id': UcfUtil.nvl(self.facebook_id),
			'facebook_id_lower': UcfUtil.nvl(self.facebook_id_lower),
			'mail_address': UcfUtil.nvl(self.mail_address),
			'mail_address_lower': UcfUtil.nvl(self.mail_address_lower),

			'last_name': UcfUtil.nvl(self.last_name),
			'first_name': UcfUtil.nvl(self.first_name),
			'last_name_kana': UcfUtil.nvl(self.last_name_kana),
			'first_name_kana': UcfUtil.nvl(self.first_name_kana),

			'birthday': UcfUtil.nvl(self.birthday),
			'picture_url': UcfUtil.nvl(self.picture_url),

			'flag_leave': UcfUtil.nvl(self.flag_leave),

			'management_group': UcfUtil.nvl(self.management_group),
			'main_group_id': UcfUtil.nvl(self.main_group_id),
			'language': UcfUtil.nvl(self.language),

			'contact_company': UcfUtil.nvl(self.contact_company),
			'contact_company_office': UcfUtil.nvl(self.contact_company_office),
			'contact_company_department': UcfUtil.nvl(self.contact_company_department),
			'contact_company_department2': UcfUtil.nvl(self.contact_company_department2),
			'contact_company_post': UcfUtil.nvl(self.contact_company_post),
			'contact_email1': UcfUtil.nvl(self.contact_email1),
			'contact_email2': UcfUtil.nvl(self.contact_email2),
			'contact_tel_no1': UcfUtil.nvl(self.contact_tel_no1),
			'contact_tel_no2': UcfUtil.nvl(self.contact_tel_no2),
			'contact_tel_no3': UcfUtil.nvl(self.contact_tel_no3),
			'contact_tel_no4': UcfUtil.nvl(self.contact_tel_no4),
			'contact_tel_no5': UcfUtil.nvl(self.contact_tel_no5),
			'contact_postal_country': UcfUtil.nvl(self.contact_postal_country),
			'contact_postal_code': UcfUtil.nvl(self.contact_postal_code),
			'contact_postal_prefecture': UcfUtil.nvl(self.contact_postal_prefecture),
			'contact_postal_city': UcfUtil.nvl(self.contact_postal_city),
			'contact_postal_street_address': UcfUtil.nvl(self.contact_postal_street_address),
			# 'custom_attribute1': UcfUtil.nvl(self.custom_attribute1),
			# 'custom_attribute2': UcfUtil.nvl(self.custom_attribute2),
			# 'custom_attribute3': UcfUtil.nvl(self.custom_attribute3),
			# 'custom_attribute4': UcfUtil.nvl(self.custom_attribute4),
			# 'custom_attribute5': UcfUtil.nvl(self.custom_attribute5),
			# 'custom_attribute6': UcfUtil.nvl(self.custom_attribute6),
			# 'custom_attribute7': UcfUtil.nvl(self.custom_attribute7),
			# 'custom_attribute8': UcfUtil.nvl(self.custom_attribute8),
			# 'custom_attribute9': UcfUtil.nvl(self.custom_attribute9),
			# 'custom_attribute10': UcfUtil.nvl(self.custom_attribute10),
			# 'custom_attribute11': UcfUtil.nvl(self.custom_attribute11),
			# 'custom_attribute12': UcfUtil.nvl(self.custom_attribute12),
			# 'custom_attribute13': UcfUtil.nvl(self.custom_attribute13),
			# 'custom_attribute14': UcfUtil.nvl(self.custom_attribute14),
			# 'custom_attribute15': UcfUtil.nvl(self.custom_attribute15),
			# 'custom_attribute16': UcfUtil.nvl(self.custom_attribute16),
			# 'custom_attribute17': UcfUtil.nvl(self.custom_attribute17),
			# 'custom_attribute18': UcfUtil.nvl(self.custom_attribute18),
			# 'custom_attribute19': UcfUtil.nvl(self.custom_attribute19),
			# 'custom_attribute20': UcfUtil.nvl(self.custom_attribute20),
			# 'custom_attribute21': UcfUtil.nvl(self.custom_attribute21),
			# 'custom_attribute22': UcfUtil.nvl(self.custom_attribute22),
			# 'custom_attribute23': UcfUtil.nvl(self.custom_attribute23),
			# 'custom_attribute24': UcfUtil.nvl(self.custom_attribute24),
			# 'custom_attribute25': UcfUtil.nvl(self.custom_attribute25),
			# 'custom_attribute26': UcfUtil.nvl(self.custom_attribute26),
			# 'custom_attribute27': UcfUtil.nvl(self.custom_attribute27),
			# 'custom_attribute28': UcfUtil.nvl(self.custom_attribute28),
			# 'custom_attribute29': UcfUtil.nvl(self.custom_attribute29),
			# 'custom_attribute30': UcfUtil.nvl(self.custom_attribute30),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.comment = vo.get('comment', '')
		self.user_id = vo.get('user_id', '')
		self.user_id_lower = vo.get('user_id_lower', '')
		self.employee_id = vo.get('employee_id', '')
		self.employee_id_lower = vo.get('employee_id_lower', '')
		self.mail_address = vo.get('mail_address', '')
		self.mail_address_lower = vo.get('mail_address_lower', '')
		self.lineworks_id = vo.get('lineworks_id', '')
		self.lineworks_id_lower = vo.get('lineworks_id_lower', '')
		self.line_id = vo.get('line_id', '')
		self.line_id_lower = vo.get('line_id_lower', '')
		self.facebookworkplace_id = vo.get('facebookworkplace_id', '')
		self.facebookworkplace_id_lower = vo.get('facebookworkplace_id_lower', '')
		self.facebook_id = vo.get('facebook_id', '')
		self.facebook_id_lower = vo.get('facebook_id_lower', '')

		self.last_name = vo.get('last_name', '')
		self.first_name = vo.get('first_name', '')
		self.last_name_kana = vo.get('last_name_kana', '')
		self.first_name_kana = vo.get('first_name_kana', '')

		self.birthday = vo.get('birthday', '')
		self.picture_url = vo.get('picture_url', '')

		self.management_group = vo.get('management_group', '')
		self.main_group_id = vo.get('main_group_id', '')
		self.language = vo.get('language', '')

		self.contact_company = vo.get('contact_company', '')
		self.contact_company_office = vo.get('contact_company_office', '')
		self.contact_company_department = vo.get('contact_company_department', '')
		self.contact_company_department2 = vo.get('contact_company_department2', '')
		self.contact_company_post = vo.get('contact_company_post', '')
		self.contact_email1 = vo.get('contact_email1', '')
		self.contact_email2 = vo.get('contact_email2', '')
		self.contact_tel_no1 = vo.get('contact_tel_no1', '')
		self.contact_tel_no2 = vo.get('contact_tel_no2', '')
		self.contact_tel_no3 = vo.get('contact_tel_no3', '')
		self.contact_tel_no4 = vo.get('contact_tel_no4', '')
		self.contact_tel_no5 = vo.get('contact_tel_no5', '')
		self.contact_postal_country = vo.get('contact_postal_country', '')
		self.contact_postal_code = vo.get('contact_postal_code', '')
		self.contact_postal_prefecture = vo.get('contact_postal_prefecture', '')
		self.contact_postal_city = vo.get('contact_postal_city', '')
		self.contact_postal_street_address = vo.get('contact_postal_street_address', '')
		# self.custom_attribute1 = vo.get('custom_attribute1', '')
		# self.custom_attribute2 = vo.get('custom_attribute2', '')
		# self.custom_attribute3 = vo.get('custom_attribute3', '')
		# self.custom_attribute4 = vo.get('custom_attribute4', '')
		# self.custom_attribute5 = vo.get('custom_attribute5', '')
		# self.custom_attribute6 = vo.get('custom_attribute6', '')
		# self.custom_attribute7 = vo.get('custom_attribute7', '')
		# self.custom_attribute8 = vo.get('custom_attribute8', '')
		# self.custom_attribute9 = vo.get('custom_attribute9', '')
		# self.custom_attribute10 = vo.get('custom_attribute10', '')
		# self.custom_attribute11 = vo.get('custom_attribute11', '')
		# self.custom_attribute12 = vo.get('custom_attribute12', '')
		# self.custom_attribute13 = vo.get('custom_attribute13', '')
		# self.custom_attribute14 = vo.get('custom_attribute14', '')
		# self.custom_attribute15 = vo.get('custom_attribute15', '')
		# self.custom_attribute16 = vo.get('custom_attribute16', '')
		# self.custom_attribute17 = vo.get('custom_attribute17', '')
		# self.custom_attribute18 = vo.get('custom_attribute18', '')
		# self.custom_attribute19 = vo.get('custom_attribute19', '')
		# self.custom_attribute20 = vo.get('custom_attribute20', '')
		# self.custom_attribute21 = vo.get('custom_attribute21', '')
		# self.custom_attribute22 = vo.get('custom_attribute22', '')
		# self.custom_attribute23 = vo.get('custom_attribute23', '')
		# self.custom_attribute24 = vo.get('custom_attribute24', '')
		# self.custom_attribute25 = vo.get('custom_attribute25', '')
		# self.custom_attribute26 = vo.get('custom_attribute26', '')
		# self.custom_attribute27 = vo.get('custom_attribute27', '')
		# self.custom_attribute28 = vo.get('custom_attribute28', '')
		# self.custom_attribute29 = vo.get('custom_attribute29', '')
		# self.custom_attribute30 = vo.get('custom_attribute30', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')


############################################################
## ユーザーグループ
############################################################
class Group(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	comment = ndb.TextProperty()
	group_id = ndb.StringProperty()                # グループメールアドレス
	group_id_lower = ndb.StringProperty()          # グループメールアドレス（小文字）
	mail_address = ndb.StringProperty()
	group_name = ndb.StringProperty()
	management_group = ndb.StringProperty()      # 管理グループ（例：営業部門）…この管理グループの管理を委託された委託管理者がこのデータを管理できるようになる
	belong_members = ndb.StringProperty(repeated=True)    # 小文字のみ
	group_owners = ndb.StringProperty(repeated=True)    # 小文字のみ
	top_group_flag = ndb.StringProperty()
	main_group_id = ndb.StringProperty()              # 小文字のみ

	# 連絡先関連項目
	contact_company = ndb.StringProperty()                # 会社名
	contact_company_office = ndb.StringProperty()                # 事業所
	contact_company_department = ndb.StringProperty()                # 部署
	contact_company_department2 = ndb.StringProperty()                # 課・グループ
	contact_company_post = ndb.StringProperty()                # 役職
	contact_email1 = ndb.StringProperty()                # メールアドレス（仕事）
	contact_email2 = ndb.StringProperty()                # メールアドレス（携帯）
	contact_tel_no1 = ndb.StringProperty()                # 電話番号
	contact_tel_no2 = ndb.StringProperty()                # FAX番号
	contact_tel_no3 = ndb.StringProperty()                # 携帯番号
	contact_tel_no4 = ndb.StringProperty()                # 内線
	contact_tel_no5 = ndb.StringProperty()                # ポケットベル
	contact_postal_country = ndb.StringProperty()                # 国、地域
	contact_postal_code = ndb.StringProperty()                # 郵便番号
	contact_postal_prefecture = ndb.StringProperty()                # 住所（都道府県）
	contact_postal_city = ndb.StringProperty()                # 住所（市区町村）
	contact_postal_street_address = ndb.TextProperty()                # 住所（番地）

	date_created = ndb.DateTimeProperty(auto_now_add=True, indexed=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True, indexed=True)
	creator_name = ndb.StringProperty(indexed=False)
	updater_name = ndb.StringProperty(indexed=False)


	def put(self):
		# オーナーはbelong_memberに存在するもののみ
		belong_members = self.belong_members
		group_owners = self.group_owners
		if group_owners is not None:
			for owner in group_owners:
				if belong_members is None or owner not in belong_members:
					group_owners.remove(owner)
		self.group_owners = group_owners

		ndb.Model.put(self)

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'comment': UcfUtil.nvl(self.comment),
			'group_id': UcfUtil.nvl(self.group_id),
			'group_id_lower': UcfUtil.nvl(self.group_id_lower),
			'mail_address': UcfUtil.nvl(self.mail_address),
			'group_name': UcfUtil.nvl(self.group_name),
			'management_group': UcfUtil.nvl(self.management_group),
			'belong_members': UcfUtil.listToCsv(self.belong_members) if self.belong_members is not None else '',
			'group_owners': UcfUtil.listToCsv(self.group_owners) if self.group_owners is not None else '',
			'top_group_flag': UcfUtil.nvl(self.top_group_flag),
			'main_group_id': UcfUtil.nvl(self.main_group_id),

			'contact_company': UcfUtil.nvl(self.contact_company),
			'contact_company_office': UcfUtil.nvl(self.contact_company_office),
			'contact_company_department': UcfUtil.nvl(self.contact_company_department),
			'contact_company_department2': UcfUtil.nvl(self.contact_company_department2),
			'contact_company_post': UcfUtil.nvl(self.contact_company_post),
			'contact_email1': UcfUtil.nvl(self.contact_email1),
			'contact_email2': UcfUtil.nvl(self.contact_email2),
			'contact_tel_no1': UcfUtil.nvl(self.contact_tel_no1),
			'contact_tel_no2': UcfUtil.nvl(self.contact_tel_no2),
			'contact_tel_no3': UcfUtil.nvl(self.contact_tel_no3),
			'contact_tel_no4': UcfUtil.nvl(self.contact_tel_no4),
			'contact_tel_no5': UcfUtil.nvl(self.contact_tel_no5),
			'contact_postal_country': UcfUtil.nvl(self.contact_postal_country),
			'contact_postal_code': UcfUtil.nvl(self.contact_postal_code),
			'contact_postal_prefecture': UcfUtil.nvl(self.contact_postal_prefecture),
			'contact_postal_city': UcfUtil.nvl(self.contact_postal_city),
			'contact_postal_street_address': UcfUtil.nvl(self.contact_postal_street_address),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.comment = vo.get('comment', '')
		self.group_id = vo.get('group_id', '')
		self.group_id_lower = vo.get('group_id_lower', '')
		self.mail_address = vo.get('mail_address', '')
		self.group_name = vo.get('group_name', '')
		self.management_group = vo.get('management_group', '')
		self.belong_members = UcfUtil.csvToList(vo.get('belong_members', '')) if vo.get('belong_members', '') != '' else []
		self.group_owners = UcfUtil.csvToList(vo.get('group_owners', '')) if vo.get('group_owners', '') != '' else []

		self.top_group_flag = vo.get('top_group_flag', '')
		self.main_group_id = vo.get('main_group_id', '')

		self.contact_company = vo.get('contact_company', '')
		self.contact_company_office = vo.get('contact_company_office', '')
		self.contact_company_department = vo.get('contact_company_department', '')
		self.contact_company_department2 = vo.get('contact_company_department2', '')
		self.contact_company_post = vo.get('contact_company_post', '')
		self.contact_email1 = vo.get('contact_email1', '')
		self.contact_email2 = vo.get('contact_email2', '')
		self.contact_tel_no1 = vo.get('contact_tel_no1', '')
		self.contact_tel_no2 = vo.get('contact_tel_no2', '')
		self.contact_tel_no3 = vo.get('contact_tel_no3', '')
		self.contact_tel_no4 = vo.get('contact_tel_no4', '')
		self.contact_tel_no5 = vo.get('contact_tel_no5', '')
		self.contact_postal_country = vo.get('contact_postal_country', '')
		self.contact_postal_code = vo.get('contact_postal_code', '')
		self.contact_postal_prefecture = vo.get('contact_postal_prefecture', '')
		self.contact_postal_city = vo.get('contact_postal_city', '')
		self.contact_postal_street_address = vo.get('contact_postal_street_address', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')

############################################################
## TEMPLATE
############################################################
class Template(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	template_name = ndb.StringProperty()
	template_name_lower = ndb.StringProperty()
	content = ndb.TextProperty()
	template_type = ndb.StringProperty()  #push_message / push_image/ push_video
	content_url = ndb.StringProperty()
	preview_url = ndb.StringProperty()

	action_config = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()


	def put(self):
		ndb.Model.put(self)

	def delete(self):
		self.key.delete()

	@classmethod
	def getTemplateAmount(cls, tenant):
		memcache_key = 'gettemplateamount?tenant=' + tenant
		templates = memcache.get(memcache_key)
		if templates is not None:
			return templates

		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace(tenant.lower())
		try:
			# 利用ユーザー数を返す（たまたま物理削除がなく全件取得すればOKなのでこれでよし）
			q = cls.query()
			templates = q.count(limit=1000000)
			memcache.set(key=memcache_key, value=templates, time=3600)
			return templates
		finally:
			namespace_manager.set_namespace(strOldNamespace)

	@classmethod
	def clearTemplateAmountCache(cls, tenant):
		memcache_key = 'gettemplateamount?tenant=' + tenant
		memcache.delete(memcache_key)

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'template_name': UcfUtil.nvl(self.template_name),
			'template_name_lower': UcfUtil.nvl(self.template_name_lower),
			'content': UcfUtil.nvl(self.content),
			'template_type': UcfUtil.nvl(self.template_type),
			'content_url': UcfUtil.nvl(self.content_url),
			'preview_url': UcfUtil.nvl(self.preview_url),
			'action_config': UcfUtil.nvl(self.action_config),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.template_name = vo.get('template_name', '')
		self.template_name_lower = vo.get('template_name_lower', '')
		self.content = vo.get('content', '')
		self.template_type = vo.get('template_type', '')
		self.content_url = vo.get('content_url', '')
		self.preview_url = vo.get('preview_url', '')
		self.action_config = vo.get('action_config', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')


############################################################
## POST MESSAGE HISTORY
############################################################
class PostMessageHistory(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	title = ndb.StringProperty(default='')
	template_unique_id = ndb.StringProperty()
	template_name = ndb.StringProperty()
	template_type_id = ndb.StringProperty()
	template_type_name = ndb.StringProperty()
	contents = ndb.TextProperty()
	total_users = ndb.IntegerProperty(default=0)
	success_users = ndb.IntegerProperty(default=0)
	skip_users = ndb.IntegerProperty(default=0)
	error_users = ndb.IntegerProperty(default=0)
	status = ndb.StringProperty(default='PROCESS') #PROCESS / ERROR / FINISHED / SCHEDULE/ CANCEL
	client_ip = ndb.StringProperty()
	user_agent = ndb.TextProperty()
	log_text = ndb.TextProperty()
	memo = ndb.TextProperty()
	access_datetime = ndb.DateTimeProperty()
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)
	date_scheduled = ndb.DateTimeProperty()

	@classmethod
	def getInstance(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		return row

	@classmethod
	def addHistoryLog(cls, titile, memo, template_unique_id, template_name, template_type_id, template_type_name, contents
										, client_ip, user_agent, total_users=0, success_users=0, skip_users=0, error_users=0,
										status='PROCESS', log_text='',date_scheduled = None):
		row = cls()
		row.unique_id = UcfUtil.guid()
		row.title = titile
		row.template_unique_id = template_unique_id
		row.template_name = template_name
		row.template_type_id = template_type_id
		row.template_type_name = template_type_name
		row.contents = json.JSONEncoder().encode(contents) if contents is not None else None
		row.total_users = total_users
		row.success_users = success_users
		row.skip_users = skip_users
		row.error_users = error_users
		row.client_ip = client_ip
		row.user_agent = user_agent
		row.status = status
		row.log_text = log_text
		row.memo = memo
		row.access_datetime = datetime.datetime.now()
		row.date_scheduled = date_scheduled
		row.put()

		return row

	@classmethod
	def updateHistoryLog(cls, unique_id, total_users=0, success_users=0, skip_users=0, error_users=0, status='PROCESS',
											 log_text=''):
		row = cls.getInstance(unique_id)
		if row:
			row.total_users += total_users
			row.success_users += success_users
			row.skip_users += skip_users
			row.error_users += error_users
			row.log_text = log_text
			if row.status != status:
				row.status = status
			row.put()

			# logging.info('================updateHistoryLog=====================')
			# logging.info(row.total_users)
			# logging.info(row.success_users)
			# logging.info(row.skip_users)
			# logging.info(row.error_users)

		return row

	@classmethod
	def checkCanelSchedule(cls, unique_id):
		row = cls.getInstance(unique_id)
		if row:
			if row.status=='CANCEL':
				return True
		return False

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		process_users = 0
		process_users += self.success_users if self.success_users is not None else 0
		process_users += self.skip_users if self.skip_users is not None else 0
		process_users += self.error_users if self.error_users is not None else 0

		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'title': UcfUtil.nvl(self.title),
			'template_unique_id': UcfUtil.nvl(self.template_unique_id),
			'template_name': UcfUtil.nvl(self.template_name),
			'template_type_id': UcfUtil.nvl(self.template_type_id),
			'template_type_name': UcfUtil.nvl(self.template_type_name),
			'contents': UcfUtil.nvl(self.contents),
			'total_users': UcfUtil.nvl(self.total_users) if self.total_users is not None else '0',
			'success_users': UcfUtil.nvl(self.success_users) if self.success_users is not None else '0',
			'skip_users': UcfUtil.nvl(self.skip_users) if self.skip_users is not None else '0',
			'error_users': UcfUtil.nvl(self.error_users) if self.error_users is not None else '0',
			'process_users': process_users,
			'status': UcfUtil.nvl(self.status),
			# 'status_name':UcfUtil.nvl(sateraito_func.getPostmessageStatusName(self.status)),
			'client_ip': UcfUtil.nvl(self.client_ip),
			'user_agent': UcfUtil.nvl(self.user_agent),
			'log_text': UcfUtil.nvl(self.log_text),
			'memo': UcfUtil.nvl(self.memo),
			'access_datetime': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.access_datetime, timezone)) if self.access_datetime is not None else '',
			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
		  'date_scheduled':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_scheduled, timezone)) if self.date_scheduled is not None else ''
			}
		return vo

############################################################
## POST MESSAGE HISTORY DETAIL
############################################################
class PostMessageHistoryDetail(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	process_type = ndb.StringProperty()    #ERROR / SKIP
	history_unique_id = ndb.StringProperty()
	user_unique_id = ndb.StringProperty()
	user_id = ndb.StringProperty()
	last_name = ndb.StringProperty()
	first_name = ndb.StringProperty()
	last_name_kana = ndb.StringProperty()
	first_name_kana = ndb.StringProperty()
	contents = ndb.TextProperty()
	log_text = ndb.TextProperty()
	access_datetime = ndb.DateTimeProperty()
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def getInstance(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		return row

	@classmethod
	def addLog(cls, process_type, history_unique_id, user_unique_id, user_id, last_name, first_name, last_name_kana,
						 first_name_kana, contents, log_text=''):
		row = cls()
		row.unique_id = UcfUtil.guid()
		row.process_type = process_type
		row.history_unique_id = history_unique_id
		row.user_unique_id = user_unique_id
		row.user_id = user_id
		row.last_name = last_name
		row.first_name = first_name
		row.last_name_kana = last_name_kana
		row.first_name_kana = first_name_kana
		row.contents = json.JSONEncoder().encode(contents) if contents is not None else None
		row.access_datetime = datetime.datetime.now()
		if log_text != '':
			row.log_text = log_text
		row.put()

		return row

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'process_type': UcfUtil.nvl(self.process_type),
			'history_unique_id': UcfUtil.nvl(self.history_unique_id),
			'user_unique_id': UcfUtil.nvl(self.user_unique_id),
			'user_id': UcfUtil.nvl(self.user_id),
			'last_name': UcfUtil.nvl(self.last_name),
			'first_name': UcfUtil.nvl(self.first_name),
			'full_name': UcfUtil.nvl(self.first_name) + UcfUtil.nvl(self.last_name),
			'last_name_kana': UcfUtil.nvl(self.last_name_kana),
			'first_name_kana': UcfUtil.nvl(self.first_name_kana),
			'full_name_kana': UcfUtil.nvl(self.first_name_kana) + UcfUtil.nvl(self.last_name_kana),
			'contents': UcfUtil.nvl(self.contents),
			'log_text': UcfUtil.nvl(self.log_text),
			'access_datetime': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.access_datetime, timezone)) if self.access_datetime is not None else '',
			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			}
		return vo


############################################################
## SEARCH LIST
############################################################
class SearchList(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	search_name = ndb.StringProperty()
	search_name_lower = ndb.StringProperty()
	search_config = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()


	def put(self):
		ndb.Model.put(self)

	def delete(self):
		self.key.delete()

	@classmethod
	def getSearchAmount(cls, tenant):
		memcache_key = 'getSearchamount?tenant=' + tenant
		searches = memcache.get(memcache_key)
		if searches is not None:
			return searches

		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace(tenant.lower())
		try:
			# 利用ユーザー数を返す（たまたま物理削除がなく全件取得すればOKなのでこれでよし）
			q = cls.query()
			searches = q.count(limit=1000000)
			memcache.set(key=memcache_key, value=searches, time=3600)
			return searches
		finally:
			namespace_manager.set_namespace(strOldNamespace)

	@classmethod
	def clearSearchAmountCache(cls, tenant):
		memcache_key = 'getSearchamount?tenant=' + tenant
		memcache.delete(memcache_key)

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'search_name': UcfUtil.nvl(self.search_name),
			'search_name_lower': UcfUtil.nvl(self.search_name_lower),
			'search_config': UcfUtil.nvl(self.search_config),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.search_name = vo.get('search_name', '')
		self.search_name_lower = vo.get('search_name_lower', '')
		self.search_config = vo.get('search_config', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')


class SettingColumns(ndb.Model):
	type = ndb.StringProperty(default='USER')
	colsToShow = ndb.TextProperty()
	colsChangeName = ndb.TextProperty()
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def getInstance(cls, type, auto_create=False):
		row = cls.get_by_id(type, memcache_timeout=NDB_MEMCACHE_TIMEOUT)
		if row is None:
			if auto_create:
				row = cls(id=type)
				row.type = type
				if type == "USER" or type == "USER_SELECT":
					row.colsToShow = u'[{"header":"ユーザーID","field":"user_id","width":150},{"header":"名前","field":"display_name","width":80},{"header":"名前カナ","field":"display_name_kana","width":150},{"header":"メールアドレス","field":"mail_address","width":150},{"header":"生年月日","field":"birthday","width":120},{"header":"LINE ID","field":"line_id","width":120}]'
					row.colsChangeName = u'[]'
				row.put()
		else:
			if row.colsChangeName is None:
				row.colsChangeName = u'[]'
				row.put()

		return row


class FormTemplate(ndb.Model):
	""" form data class
"""
	template_id = ndb.StringProperty()
	template_name = ndb.StringProperty()
	template_name_lower = ndb.StringProperty()
	template_body = ndb.TextProperty()
	template_body_for_print = ndb.TextProperty()
	template_body_for_html_builder = ndb.TextProperty()
	template_body_for_mobile = ndb.TextProperty()
	template_viewers = ndb.StringProperty(repeated=True)

	column_list = ndb.TextProperty()
	template_disabled = ndb.BooleanProperty()
	show_as_max_window = ndb.BooleanProperty()
	# created_date = ndb.DateTimeProperty(auto_now_add=True)
	# updated_date = ndb.DateTimeProperty(auto_now=True)
	del_flag = ndb.BooleanProperty(default=False)

	show_doc_info_to_top = ndb.BooleanProperty()  # no longer use

	# Where to place doc info
	# top ... doc info, contents, attached file
	# middle ... contents, doc_info, attached file
	#   bottom ... contents, attached_file, doc_info
	doc_info_place = ndb.StringProperty()

	html_field_names = ndb.StringProperty(repeated=True)  # textarea fild names which have 'richtext' class
	date_field_names = ndb.StringProperty(repeated=True)  # input field name which have 'date' class
	show_doc_in_contextual_gadget = ndb.BooleanProperty()
	show_doc_in_mail = ndb.BooleanProperty()

	required_start_date = ndb.BooleanProperty(default=False)
	required_end_date = ndb.BooleanProperty(default=False)

	default_enable_access_control = ndb.BooleanProperty(default=False)
	default_enable_edit_access_control = ndb.BooleanProperty(default=False)
	disable_add_new_user_to_accessible_members = ndb.BooleanProperty(default=False)
	disable_add_new_user_to_edit_accessible_members = ndb.BooleanProperty(default=False)
	is_disable_attach_files = ndb.BooleanProperty()  # �Y�t�t�@�C���@�\�𖳌�ɂ���
	is_mandatory_attach_files = ndb.BooleanProperty()  # �Y�t�t�@�C����K�{�Ƃ���i�Y�t�t�@�C���@�\���ꍇ�͎g�p���Ȃ��j
	enable_doc_comment = ndb.BooleanProperty(default=False)
	hidden_button_comment = ndb.BooleanProperty(default=False)
	hidden_button_comment_sm = ndb.BooleanProperty(default=False)
	default_accessible_members = ndb.StringProperty(repeated=True)
	default_accessible_members_name_info = ndb.TextProperty()
	default_send_mail_to_accessible_users = ndb.BooleanProperty(default=False)
	default_edit_accessible_members = ndb.StringProperty(repeated=True)
	default_edit_accessible_members_name_info = ndb.TextProperty()
	default_send_mail_to_edit_accessible_users = ndb.BooleanProperty(default=False)

	require_set_accessible_members = ndb.BooleanProperty(default=False)
	require_reply_chat = ndb.BooleanProperty(default=False)
	default_reply_chat_members = ndb.StringProperty(repeated=True)
	default_reply_chat_members_name_info = ndb.TextProperty()
	template_body_reply = ndb.TextProperty()

	mapping_content_qa = ndb.TextProperty() #mapping content QA by class
	field_export_setting = ndb.TextProperty() #Field export setting

	# added 2016-07-05: workflow template revision
	template_version = ndb.StringProperty()

	# added 2017-01-17: create members
	default_enable_create_control = ndb.BooleanProperty(default=False)
	default_create_members = ndb.StringProperty(repeated=True)
	default_create_members_name_info = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	def _post_put_hook(self, future):
		FormTemplate.clearInstanceCache(self.template_id)

	def put(self):
		ndb.Model.put(self)

	def delete(self):
		self.key.delete()

	@classmethod
	def getFormTemplateAmount(cls, tenant):
		memcache_key = 'getformtemplateamount?tenant=' + tenant
		templates = memcache.get(memcache_key)
		if templates is not None:
			return templates

		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace(tenant.lower())
		try:
			# 利用ユーザー数を返す（たまたま物理削除がなく全件取得すればOKなのでこれでよし）
			q = cls.query()
			templates = q.count(limit=1000000)
			memcache.set(key=memcache_key, value=templates, time=3600)
			return templates
		finally:
			namespace_manager.set_namespace(strOldNamespace)

	@classmethod
	def clearFormTemplateAmountCache(cls, tenant):
		memcache_key = 'getformtemplateamount?tenant=' + tenant
		memcache.delete(memcache_key)

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'template_id': UcfUtil.nvl(self.template_id),
			'template_name': UcfUtil.nvl(self.template_name),
			'template_name_lower': UcfUtil.nvl(self.template_name_lower),
			'template_body': UcfUtil.nvl(self.template_body),
			'template_body_for_print': UcfUtil.nvl(self.template_body_for_print),
			'template_body_for_html_builder': UcfUtil.nvl(self.template_body_for_html_builder),
			'template_body_for_mobile': UcfUtil.nvl(self.template_body_for_mobile),
			'template_viewers': UcfUtil.listToCsv(self.template_viewers) if self.template_viewers is not None else '',
			'column_list': UcfUtil.nvl(self.column_list),
			'template_disabled': self.template_disabled if self.template_disabled is not None else False,
			'show_as_max_window': self.show_as_max_window if self.show_as_max_window is not None else False,
			'del_flag': self.del_flag if self.del_flag is not None else False,
			'show_doc_info_to_top': self.show_doc_info_to_top if self.show_doc_info_to_top is not None else False,
			'doc_info_place': UcfUtil.nvl(self.doc_info_place),
			'html_field_names': UcfUtil.listToCsv(self.html_field_names) if self.html_field_names is not None else '',
			'date_field_names': UcfUtil.listToCsv(self.date_field_names) if self.date_field_names is not None else '',
			'show_doc_in_contextual_gadget': self.show_doc_in_contextual_gadget if self.show_doc_in_contextual_gadget is not None else False
			,
			'show_doc_in_mail': self.show_doc_in_mail if self.show_doc_in_mail is not None else False,
			'required_start_date': self.required_start_date if self.required_start_date is not None else False,
			'required_end_date': self.required_end_date if self.required_end_date is not None else False,
			'default_enable_access_control': self.default_enable_access_control if self.default_enable_access_control is not None else False
			,
			'default_enable_edit_access_control': self.default_enable_edit_access_control if self.default_enable_edit_access_control is not None else False
			,
			'disable_add_new_user_to_accessible_members': self.disable_add_new_user_to_accessible_members if self.disable_add_new_user_to_accessible_members is not None else False
			,
			'disable_add_new_user_to_edit_accessible_members': self.disable_add_new_user_to_edit_accessible_members if self.disable_add_new_user_to_edit_accessible_members is not None else False
			,
			'is_disable_attach_files': self.is_disable_attach_files if self.is_disable_attach_files is not None else False,
			'is_mandatory_attach_files': self.is_mandatory_attach_files if self.is_mandatory_attach_files is not None else False
			,
			'enable_doc_comment': self.enable_doc_comment if self.enable_doc_comment is not None else False,
			'hidden_button_comment': self.hidden_button_comment if self.hidden_button_comment is not None else False,
			'hidden_button_comment_sm': self.hidden_button_comment_sm if self.hidden_button_comment_sm is not None else False,
			'default_accessible_members': UcfUtil.listToCsv(
				self.default_accessible_members) if self.default_accessible_members is not None else '',
			'default_accessible_members_name_info': UcfUtil.nvl(self.default_accessible_members_name_info),
			'default_send_mail_to_accessible_users': self.default_send_mail_to_accessible_users if self.default_send_mail_to_accessible_users is not None else False
			,
			'default_edit_accessible_members': UcfUtil.listToCsv(
				self.default_edit_accessible_members) if self.default_edit_accessible_members is not None else '',
			'default_edit_accessible_members_name_info': UcfUtil.nvl(self.default_edit_accessible_members_name_info),
			'default_send_mail_to_edit_accessible_users': self.default_send_mail_to_edit_accessible_users if self.default_send_mail_to_edit_accessible_users is not None else False
			,
			'require_set_accessible_members': self.require_set_accessible_members if self.require_set_accessible_members is not None else False
			,
			'require_reply_chat': self.require_reply_chat if self.require_reply_chat is not None else False,
			'default_reply_chat_members': UcfUtil.listToCsv(
				self.default_reply_chat_members) if self.default_reply_chat_members is not None else '',
			'default_reply_chat_members_name_info': UcfUtil.nvl(self.default_reply_chat_members_name_info),
			'template_body_reply': UcfUtil.nvl(self.template_body_reply),
			'template_version': UcfUtil.nvl(self.template_version),
			'default_enable_create_control': self.default_enable_create_control if self.default_enable_create_control is not None else False
			,
			'default_create_members': UcfUtil.listToCsv(
				self.default_create_members) if self.default_create_members is not None else '',
			'default_create_members_name_info': UcfUtil.nvl(self.default_create_members_name_info),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def exchangeVoCbo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'template_id': UcfUtil.nvl(self.template_id),
			'template_name': UcfUtil.nvl(self.template_name)
		}
		return vo

	def exchangeCboVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'template_id': UcfUtil.nvl(self.template_id),
			'template_name': UcfUtil.nvl(self.template_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.template_id = vo.get('template_id', '')
		self.template_name = vo.get('template_name', '')
		self.template_name_lower = vo.get('template_name_lower', '')
		self.template_body = vo.get('template_body', '')
		self.template_body_for_print = vo.get('template_body_for_print', '')
		self.template_body_for_html_builder = vo.get('template_body_for_html_builder', '')
		self.template_body_for_mobile = vo.get('template_body_for_mobile', '')
		self.template_viewers = UcfUtil.csvToList(vo.get('template_viewers', '')) if vo.get('template_viewers',
			'') != '' else []
		self.column_list = vo.get('column_list', '')
		self.template_disabled = vo.get('template_disabled', False)
		self.show_as_max_window = vo.get('show_as_max_window', False)
		self.del_flag = vo.get('del_flag', False)
		self.show_doc_info_to_top = vo.get('show_doc_info_to_top', False)
		self.doc_info_place = vo.get('doc_info_place', '')
		self.html_field_names = UcfUtil.csvToList(vo.get('html_field_names', '')) if vo.get('html_field_names',
			'') != '' else []
		self.date_field_names = UcfUtil.csvToList(vo.get('date_field_names', '')) if vo.get('date_field_names',
			'') != '' else []
		self.show_doc_in_contextual_gadget = vo.get('show_doc_in_contextual_gadget', False)
		self.show_doc_in_mail = vo.get('show_doc_in_mail', False)
		self.required_start_date = vo.get('required_start_date', False)
		self.required_end_date = vo.get('required_end_date', False)
		self.default_enable_access_control = vo.get('default_enable_access_control', False)
		self.default_enable_edit_access_control = vo.get('default_enable_edit_access_control', False)
		self.disable_add_new_user_to_accessible_members = vo.get('disable_add_new_user_to_accessible_members', False)
		self.disable_add_new_user_to_edit_accessible_members = vo.get('disable_add_new_user_to_edit_accessible_members',
			False)
		self.is_disable_attach_files = vo.get('is_disable_attach_files', False)
		self.is_mandatory_attach_files = vo.get('is_mandatory_attach_files', False)
		self.enable_doc_comment = vo.get('enable_doc_comment', False)
		self.hidden_button_comment = vo.get('hidden_button_comment', False)
		self.hidden_button_comment_sm = vo.get('hidden_button_comment_sm', False)
		self.default_accessible_members = UcfUtil.csvToList(vo.get('default_accessible_members', '')) if vo.get(
			'default_accessible_members', '') != '' else []
		self.default_accessible_members_name_info = vo.get('default_accessible_members_name_info', '')
		self.default_send_mail_to_accessible_users = vo.get('default_send_mail_to_accessible_users', False)
		self.default_edit_accessible_members = UcfUtil.csvToList(vo.get('default_edit_accessible_members', '')) if vo.get(
			'default_edit_accessible_members', '') != '' else []
		self.default_edit_accessible_members_name_info = vo.get('default_edit_accessible_members_name_info', '')
		self.default_send_mail_to_edit_accessible_users = vo.get('default_send_mail_to_edit_accessible_users', False)
		self.require_set_accessible_members = vo.get('require_set_accessible_members', False)
		self.require_reply_chat = vo.get('require_reply_chat', False)
		self.default_reply_chat_members = UcfUtil.csvToList(vo.get('default_reply_chat_members', '')) if vo.get(
			'default_reply_chat_members', '') != '' else []
		self.default_reply_chat_members_name_info = vo.get('default_reply_chat_members_name_info', '')
		self.template_body_reply = vo.get('template_body_reply', '')
		self.template_version = vo.get('template_version', '')
		self.default_enable_create_control = vo.get('default_enable_create_control', False)
		self.default_create_members = UcfUtil.csvToList(vo.get('default_create_members', '')) if vo.get(
			'default_create_members', '') != '' else []
		self.default_create_members_name_info = vo.get('default_create_members_name_info', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')

	@classmethod
	def getMemcacheKey(cls, template_id):
		return 'script=form-template-getinstance&template_id=' + template_id

	@classmethod
	def clearInstanceCache(cls, template_id):
		memcache.delete(cls.getMemcacheKey(template_id))

	@classmethod
	def getDict(cls, template_id, get_deleted=False):
		# check memcache
		memcache_key = cls.getMemcacheKey(template_id)
		cached_dict = memcache.get(memcache_key)
		if cached_dict is not None:
			if not get_deleted:
				if cached_dict['del_flag']:
					# soft deleted row should not be returned
					return None
			logging.debug('FormTemplate.getDict: found and respond cache')
			return cached_dict

		row = cls.getInstance(template_id, get_deleted)
		if row is None:
			return None
		row_dict = row.to_dict()
		row_dict['id'] = row.key.id()

		# set to memcache
		memcache.set(memcache_key, row_dict, time=DICT_MEMCACHE_TIMEOUT)

		return row_dict

	@classmethod
	def getInstance(cls, template_id, get_deleted=False):
		# get datastore data
		q = cls.query()
		q = q.filter(cls.template_id == template_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		if row is not None:
			if (not get_deleted) and row.del_flag:
				row = None
		if row is not None:
			is_updated = False
			if row.show_doc_in_contextual_gadget is None:
				row.show_doc_in_contextual_gadget = False
				is_updated = True
			if row.show_doc_in_mail is None:
				row.show_doc_in_mail = False
				is_updated = True
			if row.default_enable_access_control is None:
				row.default_enable_access_control = False
				is_updated = True
			if row.default_accessible_members_name_info is None:
				row.default_accessible_members_name_info = '{}'
				is_updated = True
			if row.default_send_mail_to_accessible_users is None:
				row.default_send_mail_to_accessible_users = False
				is_updated = True
			if row.disable_add_new_user_to_accessible_members is None:
				row.disable_add_new_user_to_accessible_members = False
				is_updated = True
			if row.default_enable_edit_access_control is None:
				row.default_enable_edit_access_control = False
				is_updated = True
			if row.default_edit_accessible_members_name_info is None:
				row.default_edit_accessible_members_name_info = '{}'
				is_updated = True
			if row.disable_add_new_user_to_edit_accessible_members is None:
				row.disable_add_new_user_to_edit_accessible_members = False
				is_updated = True
			if row.default_send_mail_to_edit_accessible_users is None:
				row.default_send_mail_to_edit_accessible_users = False
				is_updated = True
			if row.default_reply_chat_members_name_info is None:
				row.default_reply_chat_members_name_info = '{}'
				is_updated = True
			if row.enable_doc_comment is None:
				row.enable_doc_comment = False
				is_updated = True
			if row.hidden_button_comment is None:
				row.hidden_button_comment = False
				is_updated = True
			if row.hidden_button_comment_sm is None:
				row.hidden_button_comment_sm = False
				is_updated = True
			if row.template_body_for_print is None:
				row.template_body_for_print = ''
				is_updated = True
			if row.template_body_for_html_builder is None:
				row.template_body_for_html_builder = ''
				is_updated = True
			if row.template_body_reply is None:
				row.template_body_reply = ''
				is_updated = True
				# added 2016-07-05: workflow template revision
			if row.template_version is None:
				row.template_version = row.date_changed.strftime('%Y%m%d') + '.' + "{:04d}".format(1)
				is_updated = True

			## added 2017-01-17
			if row.default_enable_create_control is None:
				row.default_enable_create_control = False
				is_updated = True
			if row.default_create_members_name_info is None:
				row.default_create_members_name_info = '{}'
				is_updated = True
				## added 2017-04-12
			if row.required_start_date is None:
				row.required_start_date = False
				is_updated = True
			if row.required_end_date is None:
				row.required_end_date = False
				is_updated = True
			if is_updated:
				row.put()
		return row


class FormData(ndb.Model):
	""" Workflow document which is created from workflow template
"""
	doc_id = ndb.StringProperty()
	doc_title = ndb.StringProperty()  # USER INPUT FORM VALUE
	template_id = ndb.StringProperty()
	template_name = ndb.StringProperty()
	template_body = ndb.TextProperty()
	template_body_for_mobile = ndb.TextProperty()
	doc_values = ndb.TextProperty()
	status = ndb.StringProperty()  # 'draft' or 'posted'

	author_email = ndb.StringProperty()
	author_user_id = ndb.StringProperty()
	author_name = ndb.StringProperty()

	enable_access_control = ndb.BooleanProperty()
	accessible_members = ndb.StringProperty(repeated=True)
	accessible_members_name_info = ndb.TextProperty()
	accessible_members_extracted = ndb.StringProperty(repeated=True)  # group --> member converted
	accessible_members_extracted_name_info = ndb.TextProperty()

	enable_edit_access_control = ndb.BooleanProperty()
	edit_accessible_members = ndb.StringProperty(repeated=True)
	edit_accessible_members_name_info = ndb.TextProperty()
	edit_accessible_members_extracted = ndb.StringProperty(repeated=True)  # group --> member converted
	edit_accessible_members_extracted_name_info = ndb.TextProperty()

	send_mail_on_publish = ndb.BooleanProperty()
	email_to_notify = ndb.TextProperty()
	edit_email_to_notify = ndb.TextProperty()
	send_mail_finished = ndb.BooleanProperty(default=False)

	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)
	submit_date = ndb.DateTimeProperty(auto_now_add=True)  # date when user posted
	published_date = ndb.DateTimeProperty(
		auto_now_add=True)  # date when this document went public --> bbs sorting is done by published_date
	publish_start_date = ndb.DateTimeProperty()  #
	publish_end_date = ndb.DateTimeProperty()  #

	html_field_names = ndb.StringProperty(repeated=True)  # richtext field names of doc_values
	del_flag = ndb.BooleanProperty(default=False)
	has_attach_file_in_doc = ndb.BooleanProperty()
	has_comment_check_list2 = ndb.BooleanProperty()
	has_comment_published2 = ndb.BooleanProperty()

	count_likes = ndb.IntegerProperty(default=0)
	likes = ndb.TextProperty()

	# for notes_db_import
	notes_page_id = ndb.StringProperty()
	notes_parent_page_id = ndb.StringProperty()
	doc_no = ndb.StringProperty()

	bbs_id = ndb.StringProperty()
	store_id = ndb.StringProperty()
	store_history_id = ndb.StringProperty()

	doc_count_by_bbs_id = ndb.IntegerProperty()

	send_mail_to_accessible_users = ndb.BooleanProperty()
	send_mail_to_edit_accessible_users = ndb.BooleanProperty()

	priority = ndb.StringProperty(default='normal')
	department = ndb.StringProperty(default='')
	document_type = ndb.StringProperty(default='')

	# added 2016-07-05: workflow template revision
	template_version = ndb.StringProperty()

	contentQA = ndb.TextProperty()   #Content data QA

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	def _pre_put_hook(self):
		tz_utc = tz.tzutc()

		if self.publish_start_date is not None:
			if self.publish_start_date.tzinfo is not None:
				self.publish_start_date = self.publish_start_date.astimezone(tz_utc).replace(tzinfo=None)

		if self.publish_end_date is not None:
			if self.publish_end_date.tzinfo is not None:
				self.publish_end_date = self.publish_end_date.astimezone(tz_utc).replace(tzinfo=None)

		if self.published_date is not None:
			if self.published_date.tzinfo is not None:
				self.published_date = self.published_date.astimezone(tz_utc).replace(tzinfo=None)

		if self.submit_date is not None:
			if self.submit_date.tzinfo is not None:
				self.submit_date = self.submit_date.astimezone(tz_utc).replace(tzinfo=None)

		if not self.likes or self.likes is None:
			self.likes = '[]'

		if not self.count_likes or self.count_likes is None:
			self.count_likes = 0


	def _post_put_hook(self, future):
		""" set default value if property is None
"""
		FormData.clearInstanceCache(self.doc_id)

		if not self.count_likes or self.count_likes is None:
			self.count_likes = 0

		# likes
		if not self.likes or self.likes is None:
			self.likes = '[]'

		# accessible_members
		if not self.enable_access_control or self.enable_access_control is None:
			self.accessible_members = ['__all__']

		# edit_accessible_members
		if not self.enable_edit_access_control or self.enable_edit_access_control is None:
			self.edit_accessible_members = []

		if self.published_date is None:
			self.published_date = datetime.datetime(1970, 1, 1, 0, 0, 0)

		if self.del_flag:
			# update attached files del_flag
			q_a = AttachedFile.query()
			q_a = q_a.filter(AttachedFile.doc_id == self.doc_id)
			for row_a in q_a:
				if not row_a.del_flag:
					row_a.del_flag = True
					row_a.put()

	@classmethod
	def _post_delete_hook(cls, key, future):
		FormData.clearInstanceCache(key.id())
		# delete fulltext search index entry
		sateraito_func.removeFormFromIndex(key.id())
		# delete attached file entry and blob
		q_at = AttachedFile.query()
		q_at = q_at.filter(AttachedFile.doc_id == key.id())
		for row_at in q_at:
			# DO NOT delete blob: new version of doc may point this blob
			# logging.debug('start delete Blob file_id=' + str(row_at.file_id))
			# row_at.blob_ref.delete()
			logging.debug('start delete AttachFile')
			row_at.key.delete()

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'doc_id': UcfUtil.nvl(self.doc_id),
			'doc_title': UcfUtil.nvl(self.doc_title),
			'template_name': UcfUtil.nvl(self.template_name),
			'template_id': UcfUtil.nvl(self.template_id),
			'template_body': UcfUtil.nvl(self.template_body),
			'template_body_for_mobile': UcfUtil.nvl(self.template_body_for_mobile),
			'doc_values': UcfUtil.nvl(self.doc_values),
			'author_user_id': UcfUtil.nvl(self.author_user_id),

			'created_date': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.created_date, timezone)) if self.created_date is not None else '',
			'updated_date': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.updated_date, timezone)) if self.updated_date is not None else '',
			}
		return vo

	@classmethod
	def getMaxFormCount(cls, bbs_id):
		q = cls.query()
		# q = q.filter(cls.bbs_id == bbs_id)
		q = q.order(-cls.doc_count_by_bbs_id)
		row = q.get()
		if row is None:
			return 0
		if row.doc_count_by_bbs_id is None:
			return 0
		return row.doc_count_by_bbs_id

	@classmethod
	def getMemcacheKey(cls, doc_id):
		return 'script=FormData-getdict&doc_id=' + doc_id

	@classmethod
	def clearInstanceCache(cls, doc_id):
		memcache.delete(cls.getMemcacheKey(doc_id))

	@classmethod
	def getFormDataByStoreHistoryID(cls, store_history_id):
		entry = None
		if store_history_id and store_history_id != '':
			query = cls.query()
			query = query.filter(cls.store_history_id == store_history_id)
			key = query.get(keys_only=True)
			entry = key.get() if key is not None else None
		return entry

	@classmethod
	def getDict(cls, doc_id, get_deleted=False):
		memcache_key = cls.getMemcacheKey(doc_id)
		# check memcache
		if not get_deleted:
			cached_dict = memcache.get(memcache_key)
			if cached_dict is not None:
				logging.debug('FormData.getDict: found and respond cache')
				return cached_dict
				# get data
		row = cls.getInstance(doc_id, get_deleted)
		if row is None:
			return None
		row_dict = row.to_dict()
		row_dict['id'] = row.key.id()
		# set to memcache
		memcache.set(memcache_key, row_dict, time=DICT_MEMCACHE_TIMEOUT)
		return row_dict

	@classmethod
	def getInstance(cls, doc_id, get_deleted=False, use_cache=True):
		# get datastore data
		row = cls.get_by_id(doc_id, memcache_timeout=NDB_MEMCACHE_TIMEOUT, use_cache=use_cache)
		if row is not None:
			if row.del_flag:
				if get_deleted:
					pass
				else:
					row = None
		return row

	@classmethod
	def getByKey(cls, key):
		entity = None
		if key is not None:
			if type(key) is str or type(key) is unicode:
				if key.startswith('form-'):
					entity = cls.get_by_id(key)
				else:
					entity = cls.get_by_id(int(key))
			else:
				if key.id() is not None:
					entity = cls.get_by_id(key.id())
				elif key.name() is not None:
					# entity = cls.get_by_key_name(key.name())
					entity = cls.get_by_id(key.name())
		return entity


class AttachedFile(ndb.Model):
	""" infomation about attachment file of doc
                stored in blobstore
"""
	file_id = ndb.StringProperty()
	doc_id = ndb.StringProperty()
	notes_page_id = ndb.StringProperty()
	notes_parent_page_id = ndb.StringProperty()
	file_name = ndb.StringProperty()
	mime_type = ndb.StringProperty()
	# blob_ref = blobstore.BlobReferenceProperty()
	blob_ref = ndb.BlobKeyProperty()
	attached_by_user_email = ndb.StringProperty()
	del_flag = ndb.BooleanProperty()
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def getInstance(cls, file_id, get_deleted=False):
		q = cls.query()
		q = q.filter(cls.file_id == file_id)
		for row in q:
			if row.del_flag:
				if get_deleted:
					pass
				else:
					row = None
			return row

	@classmethod
	def getRowsByDocId(cls, doc_id):
		""" return list of AttachedFile22 entity for doc_id
                return empty list if doc exists and logical deleted
"""
		q = cls.query()
		q = q.filter(cls.doc_id == doc_id)
		q = q.order(-cls.created_date)
		rows = []
		for row in q:
			# check del_flag
			if row.del_flag is None or row.del_flag == False:
				rows.append(row)
		return rows

	@classmethod
	def hasAttachments(cls, doc_id):
		""" return list of AttachedFile22 entity for doc_id
                return empty list if doc exists and logical deleted
"""
		q = cls.query()
		q = q.filter(cls.doc_id == doc_id)
		q = q.order(-cls.created_date)
		for row in q:
			# check del_flag
			if row.del_flag is None or row.del_flag == False:
				return True
		return False


class HtmlBuilderDB(ndb.Model):
	template_id = ndb.StringProperty()
	json_data = ndb.TextProperty(default='')
	viewer_email = ndb.StringProperty()
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)

	def _post_put_hook(self, future):
		HtmlBuilderDB.clearInstanceCache(self.viewer_email, self.template_id)
		HtmlBuilderDB.clearInstanceCache(self.viewer_email, self.template_id, True)

	@classmethod
	def getMemcacheKey(cls, viewer_email, template_id, edit_mode=False):
		if edit_mode:
			return 'script=htmlbuilderdb-getdict&template_id=' + viewer_email + '&template_id=' + template_id
		else:
			return 'script=htmlbuilderdb-getdict&template_id=' + template_id

	@classmethod
	def clearInstanceCache(cls, viewer_email, template_id, edit_mode=False):
		memcache.delete(cls.getMemcacheKey(viewer_email, template_id, edit_mode))

	@classmethod
	def getDict(cls, viewer_email, template_id, edit_mode=False):
		# check memcache
		logging.debug('getDict: template_id_htmlbuilder=' + str(template_id))
		memcache_key = cls.getMemcacheKey(viewer_email, template_id, edit_mode)
		cached_dict = memcache.get(memcache_key)
		if cached_dict is not None:
			logging.debug('HtmlBuilderDB.getDict: found and respond cache')
			return cached_dict

		row = cls.getInstance(viewer_email, template_id, edit_mode=edit_mode)
		if row is None:
			newRow = cls()
			newRow.template_id = template_id
			newRow.viewer_email = viewer_email
			newRow.put()
			row = newRow

		row_dict = row.to_dict()
		row_dict['id'] = row.key.id()

		# set to memcache
		memcache.set(memcache_key, row_dict, time=DICT_MEMCACHE_TIMEOUT)
		return row_dict

	@classmethod
	def getInstance(cls, viewer_email, template_id, edit_mode=False):
		# get datastore data
		q = cls.query()
		q = q.filter(cls.template_id == template_id)
		if edit_mode:
			q = q.filter(cls.viewer_email == viewer_email)
		else:
			q = q.order(-cls.updated_date)
		key = q.get(keys_only=True)
		return key.get(use_cache=False, use_memcache=False) if key is not None else None

	@classmethod
	def update(cls, viewer_email, template_id, json_data):
		logging.debug('update: template_id_htmlbuilder=' + str(template_id))
		q = cls.query()
		q = q.filter(cls.template_id == template_id)
		q = q.filter(cls.viewer_email == viewer_email)
		row = q.get(use_cache=False, use_memcache=False)
		if row:
			row.template_id = template_id
			row.json_data = json_data
			row.put()
		else:
			newRow = cls()
			newRow.template_id = template_id
			newRow.viewer_email = viewer_email
			newRow.json_data = json_data
			newRow.put()
		return True

	@classmethod
	def updateTemplateId(cls, viewer_email, old_id, new_id):
		logging.debug('updateTemplateId: old_id=' + str(old_id))
		logging.debug('updateTemplateId: new_id=' + str(new_id))
		q = cls.query()
		q = q.filter(cls.template_id == old_id)
		q = q.filter(cls.viewer_email == viewer_email)
		row = q.get()
		if row:
			row.template_id = new_id
			row.put()
			cls.clearInstanceCache(viewer_email, old_id)
			return True
		else:
			newRow = cls()
			newRow.template_id = new_id
			newRow.viewer_email = viewer_email
			newRow.put()
			return True

		return False

# �ЂȌ`�ݒ�t�@�C���̃C���|�[�g���
class LTCacheImportedWorkflowTemplate(ndb.Model):
	import_id = ndb.StringProperty()
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)
	jsondata_blob = ndb.BlobProperty()
	status = ndb.StringProperty()
	error_code = ndb.StringProperty()
	eror_msg = ndb.TextProperty()

# added 2016-06-25: workflow template revision
class WorkflowTemplateRevision(ndb.Model):
	""" Workflow template data class
"""
	revision_id = ndb.StringProperty()
	viewer_email = ndb.StringProperty()
	revision_comment = ndb.StringProperty()

	template_id = ndb.StringProperty()
	template_name = ndb.StringProperty()
	template_body = ndb.TextProperty()
	template_body_for_print = ndb.TextProperty()
	template_body_for_html_builder = ndb.TextProperty()
	temp_template_body_for_html_builder = ndb.TextProperty()
	template_body_for_mobile = ndb.TextProperty()

	column_list = ndb.TextProperty()
	template_disabled = ndb.BooleanProperty()
	show_as_max_window = ndb.BooleanProperty()
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)
	del_flag = ndb.BooleanProperty(default=False)

	show_doc_info_to_top = ndb.BooleanProperty()  # no longer use

	# Where to place doc info
	# top ... doc info, contents, attached file
	# middle ... contents, doc_info, attached file
	#   bottom ... contents, attached_file, doc_info
	doc_info_place = ndb.StringProperty()

	html_field_names = ndb.StringProperty(repeated=True)  # textarea fild names which have 'richtext' class
	date_field_names = ndb.StringProperty(repeated=True)  # input field name which have 'date' class
	show_doc_in_contextual_gadget = ndb.BooleanProperty()
	show_doc_in_mail = ndb.BooleanProperty()

	required_start_date = ndb.BooleanProperty(default=False)
	required_end_date = ndb.BooleanProperty(default=False)

	default_enable_access_control = ndb.BooleanProperty(default=False)
	default_enable_edit_access_control = ndb.BooleanProperty(default=False)
	disable_add_new_user_to_accessible_members = ndb.BooleanProperty(default=False)
	disable_add_new_user_to_edit_accessible_members = ndb.BooleanProperty(default=False)
	is_disable_attach_files = ndb.BooleanProperty()  # �Y�t�t�@�C���@�\�𖳌�ɂ���
	is_mandatory_attach_files = ndb.BooleanProperty()  # �Y�t�t�@�C����K�{�Ƃ���i�Y�t�t�@�C���@�\���ꍇ�͎g�p���Ȃ��j
	enable_doc_comment = ndb.BooleanProperty(default=False)
	hidden_button_comment = ndb.BooleanProperty(default=False)
	hidden_button_comment_sm = ndb.BooleanProperty(default=False)
	default_accessible_members = ndb.StringProperty(repeated=True)
	default_accessible_members_name_info = ndb.TextProperty()
	default_send_mail_to_accessible_users = ndb.BooleanProperty(default=False)
	default_edit_accessible_members = ndb.StringProperty(repeated=True)
	default_edit_accessible_members_name_info = ndb.TextProperty()
	default_send_mail_to_edit_accessible_users = ndb.BooleanProperty(default=False)

	require_set_accessible_members = ndb.BooleanProperty(default=False)
	require_reply_chat = ndb.BooleanProperty(default=False)
	default_reply_chat_members = ndb.StringProperty(repeated=True)
	default_reply_chat_members_name_info = ndb.TextProperty()

	# added 2016-07-05: workflow template revision
	template_version = ndb.StringProperty()
	# added 2017-01-17: create members
	default_enable_create_control = ndb.BooleanProperty(default=False)
	default_create_members = ndb.StringProperty(repeated=True)
	default_create_members_name_info = ndb.TextProperty()

	def _post_put_hook(self, future):
		WorkflowTemplateRevision.clearInstanceCache(self.revision_id, self.template_id)

	@classmethod
	def getMemcacheKey(cls, revision_id):
		return 'script=workflow-revision&revision_id=' + revision_id

	@classmethod
	def getListMemcacheKey(cls, template_id):
		return 'script=workflow-revision-list&template_id=' + template_id

	@classmethod
	def clearInstanceCache(cls, revision_id, template_id):
		memcache.delete(cls.getMemcacheKey(revision_id))
		memcache.delete(cls.getListMemcacheKey(template_id))

	@classmethod
	def getDict(cls, revision_id, get_deleted=False):
		# check memcache
		memcache_key = cls.getMemcacheKey(revision_id)
		cached_dict = memcache.get(memcache_key)
		if cached_dict is not None:
			if not get_deleted:
				if cached_dict['del_flag']:
					# soft deleted row should not be returned
					return None
			logging.debug('WorkflowTemplateRevision.getDict: found and respond cache')
			return cached_dict

		row = cls.getInstance(revision_id, get_deleted)
		if row is None:
			return None
		row_dict = row.to_dict()
		row_dict['id'] = row.key.id()

		# set to memcache
		memcache.set(memcache_key, row_dict, time=DICT_MEMCACHE_TIMEOUT)

		return row_dict

	@classmethod
	def getInstance(cls, revision_id, get_deleted=False):
		# get datastore data
		row = cls.get_by_id(revision_id, memcache_timeout=NDB_MEMCACHE_TIMEOUT)
		if row is not None:
			if (not get_deleted) and row.del_flag:
				row = None
		if row is not None:
			is_updated = False
			if row.show_doc_in_contextual_gadget is None:
				row.show_doc_in_contextual_gadget = False
				is_updated = True
			if row.show_doc_in_mail is None:
				row.show_doc_in_mail = False
				is_updated = True
			if row.default_enable_access_control is None:
				row.default_enable_access_control = False
				is_updated = True
			if row.default_accessible_members_name_info is None:
				row.default_accessible_members_name_info = '{}'
				is_updated = True
			if row.default_send_mail_to_accessible_users is None:
				row.default_send_mail_to_accessible_users = False
				is_updated = True
			if row.disable_add_new_user_to_accessible_members is None:
				row.disable_add_new_user_to_accessible_members = False
				is_updated = True
			if row.default_enable_edit_access_control is None:
				row.default_enable_edit_access_control = False
				is_updated = True
			if row.default_edit_accessible_members_name_info is None:
				row.default_edit_accessible_members_name_info = '{}'
				is_updated = True
			if row.disable_add_new_user_to_edit_accessible_members is None:
				row.disable_add_new_user_to_edit_accessible_members = False
				is_updated = True
			if row.default_send_mail_to_edit_accessible_users is None:
				row.default_send_mail_to_edit_accessible_users = False
				is_updated = True
			if row.default_reply_chat_members_name_info is None:
				row.default_reply_chat_members_name_info = '{}'
				is_updated = True
			if row.enable_doc_comment is None:
				row.enable_doc_comment = False
				is_updated = True
			if row.hidden_button_comment is None:
				row.hidden_button_comment = False
				is_updated = True
			if row.hidden_button_comment_sm is None:
				row.hidden_button_comment_sm = False
				is_updated = True
			if row.template_body_for_print is None:
				row.template_body_for_print = ''
				is_updated = True
			if row.template_body_for_html_builder is None:
				row.template_body_for_html_builder = ''
			if row.temp_template_body_for_html_builder is None:
				row.temp_template_body_for_html_builder = ''
				is_updated = True
				# added 2016-07-05: workflow template revision
			if row.template_version is None:
				row.template_version = row.updated_date.strftime('%Y%m%d') + '.' + "{:04d}".format(1)
				is_updated = True
			if row.revision_comment is None:
				row.revision_comment = ''
				is_updated = True
				## added 2017-01-17
			if row.default_enable_create_control is None:
				row.default_enable_create_control = False
				is_updated = True
			if row.default_create_members_name_info is None:
				row.default_create_members_name_info = '{}'
				is_updated = True

			## added 2017-04-12
			if row.required_start_date is None:
				row.required_start_date = False
				is_updated = True
			if row.required_end_date is None:
				row.required_end_date = False
				is_updated = True
			if is_updated:
				row.put()
		return row

	@classmethod
	def getList(cls, template_id, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		memcache_key = cls.getListMemcacheKey(template_id)
		cached_dict = memcache.get(memcache_key)
		if cached_dict is not None:
			logging.debug('WorkflowTemplateRevision.getList: found and respond cache')
			return cached_dict
		q = cls.query()
		q = q.filter(cls.template_id == template_id)
		q = q.order(-cls.created_date)
		results = []
		for key in q.fetch(3, keys_only=True):
			row = key.get()
			if row.del_flag:
				pass
			results.append({
				'revision_id': row.revision_id,
				'viewer_email': row.viewer_email,
				'revision_comment': sateraito_func.noneToZeroStr(row.revision_comment),
				'template_version': row.template_version,
				'template_id': row.template_id,
				'template_name': row.template_name,
				'created_date': str(sateraito_func.toShortLocalDate(row.created_date, timezone=timezone)),
				# 'updated_date': str(sateraito_func.toLocalTime(row.updated_date, timezone=timezone)),
			})
			# set to memcache
		memcache.set(memcache_key, results, time=DICT_MEMCACHE_TIMEOUT)
		return results

	@classmethod
	def clone(cls, viewer_email, rowClone, revision_comment=''):
		new_revision_id = sateraito_func.createNewTemplateRevisionId()
		row = cls(id=new_revision_id)
		row.revision_id = new_revision_id
		row.revision_comment = revision_comment
		row.viewer_email = viewer_email
		row.template_version = rowClone.template_version
		row.template_id = rowClone.template_id
		row.template_name = rowClone.template_name
		row.template_body = rowClone.template_body
		row.template_body_for_print = rowClone.template_body_for_print
		row.template_body_for_html_builder = rowClone.template_body_for_html_builder
		row.template_body_for_mobile = rowClone.template_body_for_mobile
		row.column_list = rowClone.column_list
		row.template_disabled = rowClone.template_disabled
		row.show_as_max_window = rowClone.show_as_max_window
		row.del_flag = rowClone.del_flag
		row.show_doc_info_to_top = rowClone.show_doc_info_to_top
		row.doc_info_place = rowClone.doc_info_place
		row.html_field_names = rowClone.html_field_names
		row.date_field_names = rowClone.date_field_names
		row.show_doc_in_contextual_gadget = rowClone.show_doc_in_contextual_gadget
		row.show_doc_in_mail = rowClone.show_doc_in_mail
		row.default_enable_access_control = rowClone.default_enable_access_control
		row.default_enable_edit_access_control = rowClone.default_enable_edit_access_control
		row.disable_add_new_user_to_accessible_members = rowClone.disable_add_new_user_to_accessible_members
		row.disable_add_new_user_to_edit_accessible_members = rowClone.disable_add_new_user_to_edit_accessible_members
		row.is_disable_attach_files = rowClone.is_disable_attach_files
		row.is_mandatory_attach_files = rowClone.is_mandatory_attach_files
		row.enable_doc_comment = rowClone.enable_doc_comment
		row.hidden_button_comment = rowClone.hidden_button_comment
		row.hidden_button_comment_sm = rowClone.hidden_button_comment_sm
		row.default_accessible_members = rowClone.default_accessible_members
		row.default_accessible_members_name_info = rowClone.default_accessible_members_name_info
		row.default_send_mail_to_accessible_users = rowClone.default_send_mail_to_accessible_users
		row.default_edit_accessible_members = rowClone.default_edit_accessible_members
		row.default_edit_accessible_members_name_info = rowClone.default_edit_accessible_members_name_info
		row.default_send_mail_to_edit_accessible_users = rowClone.default_send_mail_to_edit_accessible_users
		row.require_set_accessible_members = rowClone.require_set_accessible_members
		row.require_reply_chat = rowClone.require_reply_chat
		row.default_reply_chat_members = rowClone.default_reply_chat_members
		row.default_reply_chat_members_name_info = rowClone.default_reply_chat_members_name_info

		row.default_enable_create_control = rowClone.default_enable_create_control
		row.default_create_members = rowClone.default_create_members
		row.default_create_members_name_info = rowClone.default_create_members_name_info
		row.required_start_date = rowClone.required_start_date
		row.required_end_date = rowClone.required_end_date
		row.put()

	@classmethod
	def revert(cls, viewer_email, revision_id, template_id, first_edit_htmlbuilder, revision_comment=''):
		revision = cls.getInstance(revision_id)
		template = FormTemplate.getInstance(template_id)
		if revision is not None and template is not None:
			cls.clone(viewer_email, template, revision_comment=revision_comment)
			template.template_version = sateraito_func.up_template_version(template.template_version)
			# template.template_version = revision.template_version
			template.template_id = revision.template_id
			template.template_name = revision.template_name
			template.template_body = revision.template_body
			template.template_body_for_print = revision.template_body_for_print
			# if edited by form html builder
			if first_edit_htmlbuilder is False:
				revision.template_body_for_html_builder = revision.temp_template_body_for_html_builder
			template.template_body_for_html_builder = revision.template_body_for_html_builder
			template.template_body_for_mobile = revision.template_body_for_mobile
			template.column_list = revision.column_list
			template.template_disabled = revision.template_disabled
			template.show_as_max_window = revision.show_as_max_window
			template.del_flag = revision.del_flag
			template.show_doc_info_to_top = revision.show_doc_info_to_top
			template.doc_info_place = revision.doc_info_place
			template.html_field_names = revision.html_field_names
			template.date_field_names = revision.date_field_names
			template.show_doc_in_contextual_gadget = revision.show_doc_in_contextual_gadget
			template.show_doc_in_mail = revision.show_doc_in_mail
			template.default_enable_access_control = revision.default_enable_access_control
			template.default_enable_edit_access_control = revision.default_enable_edit_access_control
			template.disable_add_new_user_to_accessible_members = revision.disable_add_new_user_to_accessible_members
			template.disable_add_new_user_to_edit_accessible_members = revision.disable_add_new_user_to_edit_accessible_members
			template.is_disable_attach_files = revision.is_disable_attach_files
			template.is_mandatory_attach_files = revision.is_mandatory_attach_files
			template.enable_doc_comment = revision.enable_doc_comment
			template.hidden_button_comment = revision.hidden_button_comment
			template.hidden_button_comment_sm = revision.hidden_button_comment_sm
			template.default_accessible_members = revision.default_accessible_members
			template.default_accessible_members_name_info = revision.default_accessible_members_name_info
			template.default_send_mail_to_accessible_users = revision.default_send_mail_to_accessible_users
			template.default_edit_accessible_members = revision.default_edit_accessible_members
			template.default_edit_accessible_members_name_info = revision.default_edit_accessible_members_name_info
			template.default_send_mail_to_edit_accessible_users = revision.default_send_mail_to_edit_accessible_users
			template.require_set_accessible_members = revision.require_set_accessible_members
			template.require_reply_chat = revision.require_reply_chat
			template.default_reply_chat_members = revision.default_reply_chat_members
			template.default_reply_chat_members_name_info = revision.default_reply_chat_members_name_info

			template.default_enable_create_control = revision.default_enable_create_control
			template.default_create_members = revision.default_create_members
			template.default_create_members_name_info = revision.default_create_members_name_info
			template.required_start_date = revision.required_start_date
			template.required_end_date = revision.required_end_date
			template.put()


class DocCommentChecklist(ndb.Model):
	""" checklist comment for doc
"""
	comment_id = ndb.StringProperty()
	doc_id = ndb.StringProperty()
	comment = ndb.TextProperty()
	author_email = ndb.StringProperty()
	author_user_id = ndb.StringProperty()
	author_name = ndb.StringProperty()
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def addNewDocComment(cls, comment_id, doc_id, author_email, author_name, author_user_id, comment):
		row = cls(id=comment_id)
		row.comment_id = comment_id
		row.doc_id = doc_id
		row.author_email = author_email
		row.author_name = author_name
		row.author_user_id = author_user_id
		row.comment = comment
		row.put()
		return row

	@classmethod
	def hasDocComment(cls, doc_id):
		""" return list of DocCommentChecklist2 entity for doc_id
                return empty list if doc exists and logical deleted
"""
		q = cls.query()
		q = q.filter(cls.doc_id == doc_id)
		q = q.fetch(1)
		for row in q:
			return True
		return False


class DocCommentPublished(db.Model):
	""" comment for workflow document(published doc)
"""
	comment_id = db.StringProperty()
	reply_to_comment_id = db.StringProperty()
	doc_id = db.StringProperty()
	comment = db.TextProperty()
	author_email = db.StringProperty()
	author_user_id = db.StringProperty()
	author_name = db.StringProperty()
	created_date = db.DateTimeProperty(auto_now_add=True)
	updated_date = db.DateTimeProperty(auto_now=True)

	@classmethod
	def addNewDocComment(cls, comment_id, doc_id, author_email, author_name, author_user_id, comment,
											 reply_to_comment_id='__not_set'):
		row = cls(key_name=comment_id)
		row.comment_id = comment_id
		row.reply_to_comment_id = reply_to_comment_id
		row.doc_id = doc_id
		row.author_email = author_email
		row.author_name = author_name
		row.author_user_id = author_user_id
		row.comment = comment
		row.put()

	@classmethod
	def hasDocComment(cls, doc_id):
		""" return list of DocCommentPublished2 entity for doc_id
                return empty list if doc exists and logical deleted
"""
		q = cls.all()
		q.filter('doc_id =', doc_id)
		for row in q.run(limit=1):
			return True
		return False

	@classmethod
	def getComments(cls, doc_id, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		results = []
		q = cls.all(keys_only=True)
		q.filter('doc_id =', doc_id)
		# q.order('-created_date')
		for key in q:
			row = db.get(key)
			results.append({
				'comment_id': row.comment_id,
				'parent_id': row.reply_to_comment_id,
				'comment': row.comment,
				'comment_email': row.author_email,
				'comment_name': row.author_name,
				'comment_date': sateraito_func.toShortLocalTime(row.created_date, timezone=timezone)
			})
		return results


class AttachedFileComment(ndb.Model):
	""" infomation about attachment file of doc
                stored in blobstore
"""
	file_id = ndb.StringProperty()
	doc_id = ndb.StringProperty()
	comment_id = ndb.StringProperty()
	notes_page_id = ndb.StringProperty()
	notes_parent_page_id = ndb.StringProperty()
	file_name = ndb.StringProperty()
	mime_type = ndb.StringProperty()
	# blob_ref = blobstore.BlobReferenceProperty()
	blob_ref = ndb.BlobKeyProperty()
	attached_by_user_email = ndb.StringProperty()
	del_flag = ndb.BooleanProperty()
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def getRowsByDocIdAndCommentId(cls, doc_id, comment_id):
		""" return list of AttachedFile32 entity for comment_id
                return empty list if doc exists and logical deleted
"""
		q = cls.query()
		q = q.filter(cls.doc_id == doc_id)
		q = q.filter(cls.comment_id == comment_id)
		q = q.order(-cls.created_date)
		rows = []
		for row in q:
			# check del_flag
			if row.del_flag is None or row.del_flag == False:
				rows.append(row)
		return rows


class BlobPointer(db.Model):
	"""  Datastore class to store user search history
"""
	pointer_namespace = db.StringProperty()
	pointer_table = db.StringProperty()
	blob_creation = db.DateTimeProperty()
	blob_ref = blobstore.BlobReferenceProperty()
	blob_filename = db.StringProperty()
	checked = db.BooleanProperty()
	created_date = db.DateTimeProperty(auto_now_add=True)
	updated_date = db.DateTimeProperty(auto_now=True)

	@classmethod
	def registerNew(cls, blob_info, pointer_namespace, pointer_table='AttachedFileComment'):
		old_namespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace('')
		new_row = cls()
		new_row.blob_creation = blob_info.creation
		new_row.blob_filename = blob_info.filename
		new_row.blob_ref = blob_info
		new_row.pointer_namespace = pointer_namespace
		new_row.pointer_table = pointer_table
		new_row.checked = False
		new_row.put()
		namespace_manager.set_namespace(old_namespace)

# EDIツールなどからのAPIコール用.request_tokenでAPIからCSVエクスポート、インポート状況を照会
class CsvTaskQueue(db.Model):
	created_date = db.DateTimeProperty(auto_now_add=True)
	updated_date = db.DateTimeProperty(auto_now=True)
	task_type = db.StringProperty()  # IMPORT / EXPORT
	request_token = db.StringProperty()
	status = db.StringProperty()  # SUCCESS:処理成功 FAILED:処理失敗
	deal_status = db.StringProperty()  # PROCESSING…処理中 FIN…処理完了
	download_url = db.StringProperty()
	expire_date = db.DateTimeProperty()  # このデータのアクセス期限（期限失効後はタスクにより削除してもOK）
	csv_download_id = db.StringProperty()
	log_text = db.TextProperty()  # インポートなどのログ
	have_more_rows = db.BooleanProperty(default=False)


class CsvDownloadData(ndb.Model):
	"""  Datastore class to store csv download info
"""
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)
	data_order = ndb.IntegerProperty()
	csv_download_id = ndb.StringProperty()
	csv_data = ndb.BlobProperty()
	csv_filename = ndb.StringProperty()
	csv_fileencoding = ndb.StringProperty()
	expire_date = ndb.DateTimeProperty()


class AutoNo(ndb.Model):
	""" Datastore class to store monthly sequence number
        """
	created_date = ndb.DateTimeProperty(auto_now_add=True)
	updated_date = ndb.DateTimeProperty(auto_now=True)
	auto_no_key = ndb.StringProperty()
	counter = ndb.IntegerProperty()

	@classmethod
	def getAutoNo(cls, auto_no_key, num_digits, start_from):
		"""
                 Return str
                """

		q = cls.query()
		q = q.filter(cls.auto_no_key == auto_no_key)
		key = q.get(keys_only=True)

		@ndb.transactional(propagation=ndb.TransactionOptions.INDEPENDENT)
		def countup(key):
			if key is None:
				row = cls.get_by_id('KEY_' + str(auto_no_key), memcache_timeout=NDB_MEMCACHE_TIMEOUT)
				if row is None:
					# create new
					row = cls(id='KEY_' + str(auto_no_key))
					row.auto_no_key = auto_no_key
					row.counter = start_from
					row.put()
					return str(row.counter).zfill(num_digits)
				else:
					row.counter += 1
					row.put()
					return str(row.counter).zfill(num_digits)
			else:
				row = key.get(memcache_timeout=NDB_MEMCACHE_TIMEOUT)
				row.counter += 1
				row.put()
				return str(row.counter).zfill(num_digits)

		return countup(key)

############################################################
## STORE TRADE
############################################################
class Store(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	name = ndb.StringProperty()
	name_lower = ndb.StringProperty()
	store_id = ndb.StringProperty()
	store_id_disp = ndb.StringProperty()    #Store id display
	reply_message = ndb.StringProperty()
	qrcode_id = ndb.StringProperty()
	qrcode_url = ndb.StringProperty()
	memo = ndb.StringProperty()
	form_id = ndb.StringProperty()
	text_merge = ndb.TextProperty()

	reply_user = ndb.StringProperty(repeated=True)
	reply_user_name_info = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)
	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	def put(self, without_update_fulltext_index=False):
		if not without_update_fulltext_index:
			try:
				# update full-text indexes.
				Store.addStoreToTextSearchIndex(self)
			except Exception, e:
				logging.info('failed update store full-text index. unique_id=' + self.unique_id)
				logging.exception(e)

		ndb.Model.put(self)

	def delete(self):
		try:
			Store.removeStoreFromIndex(self.unique_id)
		except Exception, e:
			logging.info('failed delete store full-text index. unique_id=' + self.unique_id)
			logging.exception(e)
			#ndb.Model.delete(self)
		self.key.delete()

	@classmethod
	def getStoreByStoreID(cls, store_id):
		entry = None
		if store_id and store_id != '':
			query = cls.query()
			query = query.filter(cls.store_id == store_id)
			key = query.get(keys_only=True)
			entry = key.get() if key is not None else None
		return entry

	@classmethod
	def getStoreIdDisplayByStoreID(cls, store_id):
		if store_id is None or store_id == '': return ''
		entry = cls.getStoreByStoreID(store_id)
		if entry:
			return entry.store_id_disp

		return ''

	@classmethod
	def getStoreDisplayByStoreID(cls, store_id):
		if store_id is None or store_id == '': return '', ''
		entry = cls.getStoreByStoreID(store_id)
		if entry:
			return entry.unique_id, entry.store_id_disp

		return '', ''

	# ユーザーを全文検索用インデックスに追加する関数
	@classmethod
	def addStoreToTextSearchIndex(cls, entry):
		vo = entry.exchangeVo(sateraito_inc.DEFAULT_TIMEZONE)  # 日付関連の項目はインデックスしないのでデフォルトタイムゾーンでOKとする

		#logging.info(vo)

		# 検索用のキーワードをセット
		keyword = ''
		keyword += ' ' + vo.get('name', '')
		keyword += ' ' + vo.get('store_id', '')
		keyword += ' ' + vo.get('store_id_disp', '')
		keyword += ' ' + vo.get('reply_message', '')
		keyword += ' ' + vo.get('memo', '')
		keyword += ' ' + vo.get('reply_user_name_info', '')
		keyword += ' ' + vo.get('text_merge', '')

		chat_date_unixtime = sateraito_func.datetimeToMyUnixtime(UcfUtil.getNow())

		search_document = search.Document(
			doc_id=entry.unique_id,
			fields=[
				search.TextField(name='unique_id', value=vo.get('unique_id', '')),
				search.TextField(name='name', value=vo.get('name', '')),
				search.TextField(name='store_id', value=vo.get('store_id', '')),
				search.TextField(name='store_id_disp', value=vo.get('store_id_disp', '')),
				search.TextField(name='reply_message', value=vo.get('reply_message', '')),
				search.TextField(name='memo', value=vo.get('memo', '')),
				search.TextField(name='qrcode_id', value=vo.get('qrcode_id', '')),
				search.TextField(name='qrcode_url', value=vo.get('qrcode_url', '')),
				search.TextField(name='form_id', value=vo.get('form_id', '')),
				search.TextField(name='text_merge', value=vo.get('text_merge', '')),

				search.TextField(name='reply_user', value=UcfUtil.listToCsv(vo.get('reply_user', ''))),
				search.TextField(name='reply_user_name_info', value=vo.get('reply_user_name_info', '')),

				search.TextField(name='text', value=keyword), # 検索
				search.DateField(name='created_date', value=UcfUtil.getNow()),
				search.NumberField(name='store_date', value=chat_date_unixtime)
			])

		index = search.Index(name='store_index')
		index.put(search_document)

	# 全文検索用インデックスより指定されたunique_idを持つインデックスを削除する関数
	@classmethod
	def removeStoreFromIndex(cls, unique_id):
		# remove text search index
		index = search.Index(name='store_index')
		index.delete(unique_id)

	@classmethod
	def getDictFromTextSearchIndex(cls, ft_result, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		dict = {}
		for field in ft_result.fields:
			if field.name in ['store_date']:
				pass
			elif field.name in ['created_date']:
				if field.value:
					create_date = UcfUtil.getLocalTime(field.value, timezone)
					dict[field.name] = create_date.strftime('%Y-%m-%d %I:%M %p')
					dict['date_created'] = create_date.strftime('%Y-%m-%d %I:%M %p')
				else:
					dict[field.name] = ''
			else:
				dict[field.name] = field.value.strip('#')
		return dict

	# フルテキストカタログから一覧用の取得フィールドを返す
	@classmethod
	def getReturnedFieldsForTextSearch(cls):
		return ['unique_id', 'name', 'store_id', 'store_id_disp', 'reply_message', 'memo', 'text_merge', 'date_created',
						'date_changed', 'created_date', 'qrcode_id', 'form_id', 'qrcode_url', 'reply_user', 'reply_user_name_info']

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'name': UcfUtil.nvl(self.name),
			'store_id': UcfUtil.nvl(self.store_id),
			'store_id_disp': UcfUtil.nvl(self.store_id_disp),
			'reply_message': UcfUtil.nvl(self.reply_message),
			'memo': UcfUtil.nvl(self.memo),
			'qrcode_id': UcfUtil.nvl(self.qrcode_id),
			'qrcode_url': UcfUtil.nvl(self.qrcode_url),
			'form_id': UcfUtil.nvl(self.form_id),
			'text_merge': UcfUtil.nvl(self.text_merge),

			'reply_user': UcfUtil.listToCsv(self.reply_user) if self.reply_user is not None else '',
			'reply_user_name_info': UcfUtil.nvl(self.reply_user_name_info),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def exchangeVoCbo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'id': UcfUtil.nvl(self.store_id),
			'name': UcfUtil.nvl(self.store_id_disp)
		}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.name = vo.get('name', '')
		self.name_lower = vo.get('name_lower', '')
		self.store_id = vo.get('store_id', '')
		self.store_id_disp = vo.get('store_id_disp', '')
		self.reply_message = vo.get('reply_message', '')
		self.memo = vo.get('memo', '')
		self.qrcode_id = vo.get('qrcode_id', '')
		self.qrcode_url = vo.get('qrcode_url', '')
		self.form_id = vo.get('form_id', '')
		self.text_merge = vo.get('text_merge', '')

		self.reply_user = UcfUtil.csvToList(vo.get('reply_user', '')) if vo.get('reply_user', '') != '' else []
		self.reply_user_name_info = vo.get('reply_user_name_info', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')

############################################################
## STORE TEMPLATE LIST
############################################################
class StoreTemplate(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	template_name = ndb.StringProperty()
	template_name_lower = ndb.StringProperty()
	template_body = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()


	def put(self):
		ndb.Model.put(self)

	def delete(self):
		self.key.delete()

	@classmethod
	def getSearchAmount(cls, tenant):
		memcache_key = 'getStoreSearchamount?tenant=' + tenant
		searches = memcache.get(memcache_key)
		if searches is not None:
			return searches

		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace(tenant.lower())
		try:
			# 利用ユーザー数を返す（たまたま物理削除がなく全件取得すればOKなのでこれでよし）
			q = cls.query()
			searches = q.count(limit=1000000)
			memcache.set(key=memcache_key, value=searches, time=3600)
			return searches
		finally:
			namespace_manager.set_namespace(strOldNamespace)

	@classmethod
	def clearSearchAmountCache(cls, tenant):
		memcache_key = 'getStoreSearchamount?tenant=' + tenant
		memcache.delete(memcache_key)

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'template_name': UcfUtil.nvl(self.template_name),
			'template_name_lower': UcfUtil.nvl(self.template_name_lower),
			'template_body': UcfUtil.nvl(self.template_body),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.template_name = vo.get('template_name', '')
		self.template_name_lower = vo.get('template_name_lower', '')
		self.template_body = vo.get('template_body', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')


############################################################
## Store Data
############################################################
class StoreData(ndb.Model):
	unique_id = ndb.StringProperty(required=True)
	store_id = ndb.StringProperty()
	store_name = ndb.StringProperty()
	user_id = ndb.StringProperty()
	last_name = ndb.StringProperty()
	first_name = ndb.StringProperty()
	last_name_kana = ndb.StringProperty()
	first_name_kana = ndb.StringProperty()
	mail_address = ndb.StringProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)
	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

	def put(self, without_update_fulltext_index=False):
		if not without_update_fulltext_index:
			try:
				# update full-text indexes.
				StoreData.addStoreDataToTextSearchIndex(self)
			except Exception, e:
				logging.info('failed update store data full-text index. unique_id=' + self.unique_id)
				logging.exception(e)

		ndb.Model.put(self)

	def delete(self):
		try:
			StoreData.removeStoreDataFromIndex(self.unique_id)
		except Exception, e:
			logging.info('failed delete store data full-text index. unique_id=' + self.unique_id)
			logging.exception(e)
			#ndb.Model.delete(self)
		self.key.delete()


	# ユーザーを全文検索用インデックスに追加する関数
	@classmethod
	def addStoreDataToTextSearchIndex(cls, entry):
		vo = entry.exchangeVo(sateraito_inc.DEFAULT_TIMEZONE)  # 日付関連の項目はインデックスしないのでデフォルトタイムゾーンでOKとする

		#logging.info(vo)

		# 検索用のキーワードをセット
		keyword = ''
		keyword += ' ' + vo.get('store_name', '')
		keyword += ' ' + vo.get('last_name', '')
		keyword += ' ' + vo.get('first_name', '')
		keyword += ' ' + vo.get('last_name_kana', '')
		keyword += ' ' + vo.get('first_name_kana', '')
		keyword += ' ' + vo.get('mail_address', '')

		chat_date_unixtime = sateraito_func.datetimeToMyUnixtime(UcfUtil.getNow())

		search_document = search.Document(
			doc_id=entry.unique_id,
			fields=[
				search.TextField(name='unique_id', value=vo.get('unique_id', '')),
				search.TextField(name='store_id', value=vo.get('store_id', '')),
				search.TextField(name='store_name', value=vo.get('store_name', '')),
				search.TextField(name='user_id', value=vo.get('user_id', '')),
				search.TextField(name='last_name', value=vo.get('last_name', '')),
				search.TextField(name='first_name', value=vo.get('first_name', '')),
				search.TextField(name='last_name_kana', value=vo.get('last_name_kana', '')),
				search.TextField(name='first_name_kana', value=vo.get('first_name_kana', '')),
				search.TextField(name='mail_address', value=vo.get('mail_address', '')),

				search.TextField(name='text', value=keyword), # 検索
				search.DateField(name='created_date', value=UcfUtil.getNow()),
				search.NumberField(name='store_date', value=chat_date_unixtime)
			])

		index = search.Index(name='store_data_index')
		index.put(search_document)

	# 全文検索用インデックスより指定されたunique_idを持つインデックスを削除する関数
	@classmethod
	def removeStoreDataFromIndex(cls, unique_id):
		# remove text search index
		index = search.Index(name='store_data_index')
		index.delete(unique_id)

	@classmethod
	def getDictFromTextSearchIndex(cls, ft_result, timezone=sateraito_inc.DEFAULT_TIMEZONE):
		dict = {}
		for field in ft_result.fields:
			if field.name in ['store_date']:
				pass
			elif field.name in ['created_date']:
				if field.value:
					create_date = UcfUtil.getLocalTime(field.value, timezone)
					dict[field.name] = create_date.strftime('%Y-%m-%d %I:%M')
					dict['date_created'] = create_date.strftime('%Y-%m-%d %I:%M')
				else:
					dict[field.name] = ''
			else:
				dict[field.name] = field.value.strip('#')
		return dict

	# フルテキストカタログから一覧用の取得フィールドを返す
	@classmethod
	def getReturnedFieldsForTextSearch(cls):
		return ['unique_id', 'store_id', 'store_name', 'user_id', 'last_name', 'first_name', 'last_name_kana',
						'first_name_kana', 'mail_address', 'date_created', 'date_changed', 'created_date']

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
			'unique_id': UcfUtil.nvl(self.unique_id),
			'store_id': UcfUtil.nvl(self.store_id),
			'store_name': UcfUtil.nvl(self.store_name),
			'user_id': UcfUtil.nvl(self.user_id),
			'last_name': UcfUtil.nvl(self.last_name),
			'first_name': UcfUtil.nvl(self.first_name),
			'last_name_kana': UcfUtil.nvl(self.last_name_kana),
			'first_name_kana': UcfUtil.nvl(self.first_name_kana),
			'mail_address': UcfUtil.nvl(self.mail_address),

			'date_created': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
			'date_changed': UcfUtil.nvl(
				UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			'creator_name': UcfUtil.nvl(self.creator_name),
			'updater_name': UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.store_id = vo.get('store_id', '')
		self.store_name = vo.get('store_name', '')
		self.user_id = vo.get('user_id', '')
		self.last_name = vo.get('last_name', '')
		self.first_name = vo.get('first_name', '')
		self.last_name_kana = vo.get('last_name_kana', '')
		self.first_name_kana = vo.get('first_name_kana', '')
		self.mail_address = vo.get('mail_address', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get(
				'date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get(
				'date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')


############################################################
## EMAIL TEMPLATE
## Author: LONG
############################################################
class EmailTemplate(ndb.Model):

	unique_id = ndb.StringProperty(required=True)
	template_name = ndb.StringProperty()
	template_name_lower = ndb.StringProperty()
	subject = ndb.StringProperty()
	content = ndb.TextProperty()

	action_config = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()


	def put(self):
		ndb.Model.put(self)

	def delete(self):
		self.key.delete()

	@classmethod
	def getTemplateAmount(cls, tenant):

		memcache_key = 'getemailtemplateamount?tenant=' + tenant
		templates = memcache.get(memcache_key)
		if templates is not None:
			return templates

		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace(tenant.lower())
		try:
			# 利用ユーザー数を返す（たまたま物理削除がなく全件取得すればOKなのでこれでよし）
			q = cls.query()
			templates = q.count(limit=1000000)
			memcache.set(key=memcache_key, value=templates, time=3600)
			return templates
		finally:
			namespace_manager.set_namespace(strOldNamespace)

	@classmethod
	def clearTemplateAmountCache(cls, tenant):
		memcache_key = 'getemailtemplateamount?tenant=' + tenant
		memcache.delete(memcache_key)

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
				'unique_id':UcfUtil.nvl(self.unique_id),
				'template_name':UcfUtil.nvl(self.template_name),
				'template_name_lower':UcfUtil.nvl(self.template_name_lower),
				'subject':UcfUtil.nvl(self.subject),
				'content':UcfUtil.nvl(self.content),

				'date_created':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
				'date_changed':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
				'creator_name':UcfUtil.nvl(self.creator_name),
				'updater_name':UcfUtil.nvl(self.updater_name),
			}
		return vo

	def mergeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.template_name = vo.get('template_name', '')
		self.template_name_lower = vo.get('template_name_lower', '')
		self.content = vo.get('content', '')
		self.subject = vo.get('subject', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get('date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get('date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')

############################################################
## SEND EMAIL HISTORY
## Author: LONG
############################################################
class SendEmailHistory(ndb.Model):

	unique_id = ndb.StringProperty(required=True)
	subject = ndb.StringProperty(default='')
	template_unique_id = ndb.StringProperty()
	template_name = ndb.StringProperty()
	contents = ndb.TextProperty()
	total_users = ndb.IntegerProperty(default=0)
	success_users = ndb.IntegerProperty(default=0)
	skip_users = ndb.IntegerProperty(default=0)
	error_users = ndb.IntegerProperty(default=0)
	status = ndb.StringProperty(default='PROCESS') #PROCESS / ERROR / FINISHED / SCHEDULED / CANCEL
	sender_email = ndb.StringProperty()
	user_agent = ndb.TextProperty()
	log_text = ndb.TextProperty()
	access_datetime = ndb.DateTimeProperty()
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)
	date_scheduled = ndb.DateTimeProperty()

	@classmethod
	def getInstance(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		return row

	@classmethod
	def addHistoryLog(cls,subject, template_unique_id, template_name,contents,sender_email,user_agent,total_users=0,success_users=0,skip_users=0,error_users=0, status='PROCESS',log_text='',date_scheduled = None):
		row = cls()
		row.unique_id = UcfUtil.guid()
		row.subject = subject
		row.template_unique_id = template_unique_id
		row.template_name = template_name
		row.contents = json.JSONEncoder().encode(contents) if contents is not None else None
		row.total_users = total_users
		row.success_users = success_users
		row.skip_users = skip_users
		row.error_users = error_users
		row.sender_email = sender_email
		row.user_agent = user_agent
		row.status = status
		row.log_text = log_text
		row.access_datetime = datetime.datetime.now()
		row.date_scheduled = date_scheduled
		row.put()

		return row

	@classmethod
	def updateHistoryLog(cls, unique_id, total_users=0,success_users=0,skip_users=0,error_users=0, status='PROCESS',log_text=''):
		row = cls.getInstance(unique_id)
		if row:
			row.total_users += total_users
			row.success_users += success_users
			row.skip_users += skip_users
			row.error_users += error_users
			row.log_text = log_text
			if row.status != status:
				row.status = status
			row.put()

		return row

	@classmethod
	def checkCanelSchedule(cls, unique_id):
		row = cls.getInstance(unique_id)
		if row:
			if row.status=='CANCEL':
				return True
		return False

	@classmethod
	def updateScheduledTask(cls, unique_id, new_date_scheduled, timezone):
		row = cls.getInstance(unique_id)
		if new_date_scheduled is not None:
			new_date_scheduled = UcfUtil.getUTCTime(UcfUtil.getDateTime(new_date_scheduled), timezone)
			if row:
				row.date_scheduled = new_date_scheduled
				row.put()

		return row

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		process_users = 0
		process_users +=self.success_users if self.success_users is not None else 0
		process_users +=self.skip_users if self.skip_users is not None else 0
		process_users +=self.error_users if self.error_users is not None else 0

		vo = {
				'unique_id':UcfUtil.nvl(self.unique_id),
				'subject':UcfUtil.nvl(self.subject),
				'contents':UcfUtil.nvl(self.contents),
				'template_unique_id':UcfUtil.nvl(self.template_unique_id),
				'template_name':UcfUtil.nvl(self.template_name),
				'total_users': UcfUtil.nvl(self.total_users) if self.total_users is not None else '0',
				'success_users':UcfUtil.nvl(self.success_users) if self.success_users is not None else '0',
				'skip_users':UcfUtil.nvl(self.skip_users) if self.skip_users is not None else '0',
				'error_users':UcfUtil.nvl(self.error_users) if self.error_users is not None else '0',
				'process_users':process_users,
				'status':UcfUtil.nvl(self.status),
				# 'status_name':UcfUtil.nvl(sateraito_func.getPostmessageStatusName(self.status)),
				'sender_email': UcfUtil.nvl(self.sender_email),
				'user_agent':UcfUtil.nvl(self.user_agent),
				'log_text': UcfUtil.nvl(self.log_text),
				'access_datetime':UcfUtil.nvl(UcfUtil.getLocalTime(self.access_datetime, timezone)) if self.access_datetime is not None else '',
				'date_created':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
				'date_changed':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
				'date_scheduled':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_scheduled, timezone)) if self.date_scheduled is not None else ''
			}
		return vo

############################################################
## SEND EMAIL HISTORY DETAIL
## Author: LONG
############################################################
class SendEmailHistoryDetail(ndb.Model):

	unique_id = ndb.StringProperty(required=True)
	process_type = ndb.StringProperty()    #ERROR / SKIP
	history_unique_id = ndb.StringProperty()
	user_unique_id = ndb.StringProperty()
	user_id = ndb.StringProperty()
	user_email = ndb.StringProperty()
	last_name = ndb.StringProperty()
	first_name = ndb.StringProperty()
	last_name_kana = ndb.StringProperty()
	first_name_kana = ndb.StringProperty()
	contents = ndb.TextProperty()
	log_text = ndb.TextProperty()
	access_datetime = ndb.DateTimeProperty()
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def getInstance(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		return row

	@classmethod
	def addLog(cls, process_type, history_unique_id, user_unique_id,user_id,user_email,last_name,first_name,last_name_kana,first_name_kana,contents,log_text=''):
		row = cls()
		row.unique_id = UcfUtil.guid()
		row.process_type = process_type
		row.history_unique_id = history_unique_id
		row.user_unique_id = user_unique_id
		row.user_id = user_id
		row.user_email = user_email
		row.last_name = last_name
		row.first_name = first_name
		row.last_name_kana = last_name_kana
		row.first_name_kana = first_name_kana
		row.contents = json.JSONEncoder().encode(contents) if contents is not None else None
		row.access_datetime = datetime.datetime.now()
		if log_text!='':
			row.log_text = log_text
		row.put()

		return row

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
				'unique_id':UcfUtil.nvl(self.unique_id),
				'process_type':UcfUtil.nvl(self.process_type),
				'history_unique_id':UcfUtil.nvl(self.history_unique_id),
				'user_unique_id':UcfUtil.nvl(self.user_unique_id),
				'user_id':UcfUtil.nvl(self.user_id),
				'user_email':UcfUtil.nvl(self.user_email),
				'last_name':UcfUtil.nvl(self.last_name),
				'first_name':UcfUtil.nvl(self.first_name),
				'full_name':UcfUtil.nvl(self.first_name) +' '+ UcfUtil.nvl(self.last_name),
				'last_name_kana':UcfUtil.nvl(self.last_name_kana),
				'first_name_kana':UcfUtil.nvl(self.first_name_kana),
				'full_name_kana':UcfUtil.nvl(self.first_name_kana) + UcfUtil.nvl(self.last_name_kana),
				'contents':UcfUtil.nvl(self.contents),
				'log_text':UcfUtil.nvl(self.log_text),
				'access_datetime':UcfUtil.nvl(UcfUtil.getLocalTime(self.access_datetime, timezone)) if self.access_datetime is not None else '',
				'date_created':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
				'date_changed':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			}
		return vo


############################################################
## SENDER EMAIL
## Author: LONG
############################################################
class SenderEmail(ndb.Model):

	unique_id = ndb.StringProperty(required=True)
	first_name = ndb.StringProperty()
	last_name = ndb.StringProperty()
	email = ndb.StringProperty()
	email_lower = ndb.StringProperty()
	is_default = ndb.BooleanProperty()
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now=True)
	reply_email = ndb.StringProperty()
	reply_name = ndb.StringProperty()

	@classmethod
	def getInstance(cls, unique_id):
		q = cls.query()
		q = q.filter(cls.unique_id == unique_id)
		key = q.get(keys_only=True)
		row = key.get() if key is not None else None
		return row

	def put(self):
		ndb.Model.put(self)

	def delete(self):
		self.key.delete()

	@classmethod
	# def newSenderEmail(cls, email, first, last, reply_email, reply_name):
	def newSenderEmail(cls, sender_dict):
		row = None
		email = sender_dict['email'].strip()
		first_name = sender_dict['first_name'].strip()
		last_name = sender_dict['last_name'].strip()
		reply_email = sender_dict['reply_email'].strip()
		reply_name = sender_dict['reply_name'].strip()

		q = cls.query()
		q = q.filter(cls.email == email)
		key = q.get(keys_only=True)

		if key is None and first_name != '' and last_name != '' and email != '':
			row = cls()
			row.unique_id = UcfUtil.guid()

			row.first_name = first_name
			row.last_name = last_name
			row.email = email
			row.email_lower = email.lower()

			if reply_email is not None and reply_email != '' and reply_name is not None and reply_name != '':
				row.reply_email = reply_email
				row.reply_name = reply_name
			else:
				row.reply_email = ''
				row.reply_name = ''

			if cls.query().count() >0:
				row.is_default = False
			else:
				row.is_default = True

			row.date_created = datetime.datetime.now()
			row.date_changed = datetime.datetime.now()

			row.put()

		return row

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		reply_display =''

		logging.info(self.reply_name)
		if self.reply_name is not None and self.reply_email is not None and self.reply_name != '' and self.reply_email != '':
			reply_display = UcfUtil.nvl(self.reply_name) +' ['+ UcfUtil.nvl(self.reply_email) +']'
			logging.info(reply_display)

		vo = {
				'unique_id':UcfUtil.nvl(self.unique_id),
				'first_name':UcfUtil.nvl(self.first_name),
				'last_name':UcfUtil.nvl(self.last_name),
				'full_name':UcfUtil.nvl(self.first_name) +' '+ UcfUtil.nvl(self.last_name),
				'email':UcfUtil.nvl(self.email),
				'email_lower':UcfUtil.nvl(self.email_lower),
				'reply_email':UcfUtil.nvl(self.reply_email),
				'reply_name':UcfUtil.nvl(self.reply_name),
				'reply_display': reply_display,
				'is_default':UcfUtil.nvl(self.is_default),
				'date_created':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
				'date_changed':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
			}
		return vo

	def mergeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.first_name = vo.get('first_name', '')
		self.last_name = vo.get('last_name', '')
		self.email = vo.get('email', '')
		self.email_lower = vo.get('email_lower', '')
		self.reply_email = vo.get('reply_email', '')
		self.reply_name = vo.get('reply_name', '')
		self.is_default = vo.get('is_default', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get('date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get('date_changed', '') != '' else None

############################################################
## EMAIL RECEIVER SEARCH LIST
## Author: LONG
############################################################
class EmailReceiverSearchList(ndb.Model):

	unique_id = ndb.StringProperty(required=True)
	search_name = ndb.StringProperty()
	search_name_lower = ndb.StringProperty()
	search_config = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()


	def put(self):
		ndb.Model.put(self)

	def delete(self):
		self.key.delete()

	@classmethod
	def getSearchAmount(cls, tenant):

		memcache_key = 'getReceiversearchamount?tenant=' + tenant
		searches = memcache.get(memcache_key)
		if searches is not None:
			return searches

		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace(tenant.lower())
		try:
			# 利用ユーザー数を返す（たまたま物理削除がなく全件取得すればOKなのでこれでよし）
			q = cls.query()
			searches = q.count(limit=1000000)
			memcache.set(key=memcache_key, value=searches, time=3600)
			return searches
		finally:
			namespace_manager.set_namespace(strOldNamespace)

	@classmethod
	def clearSearchAmountCache(cls, tenant):
		memcache_key = 'getReceiversearchamount?tenant=' + tenant
		memcache.delete(memcache_key)

	def exchangeVo(self, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる
		vo = {
				'unique_id':UcfUtil.nvl(self.unique_id),
				'search_name':UcfUtil.nvl(self.search_name),
				'search_name_lower':UcfUtil.nvl(self.search_name_lower),
				'search_config':UcfUtil.nvl(self.search_config),

				'date_created':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_created, timezone)) if self.date_created is not None else '',
				'date_changed':UcfUtil.nvl(UcfUtil.getLocalTime(self.date_changed, timezone)) if self.date_changed is not None else '',
				'creator_name':UcfUtil.nvl(self.creator_name),
				'updater_name':UcfUtil.nvl(self.updater_name),
			}
		return vo

	def margeFromVo(self, vo, timezone):
		# UCFModelと管理画面の実装の互換性を保ちたいので項目個別実装でつじつまを合わせる

		self.unique_id = vo.get('unique_id', '')
		self.search_name = vo.get('search_name', '')
		self.search_name_lower = vo.get('search_name_lower', '')
		self.search_config = vo.get('search_config', '')

		if vo.has_key('date_created'):
			self.date_created = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_created', '')), timezone) if vo.get('date_created', '') != '' else None
		if vo.has_key('date_changed'):
			self.date_changed = UcfUtil.getUTCTime(UcfUtil.getDateTime(vo.get('date_changed', '')), timezone) if vo.get('date_changed', '') != '' else None
		self.creator_name = vo.get('creator_name', '')
		self.updater_name = vo.get('updater_name', '')

############################################################
## EMAIL SEND EMAIL CRON TASK
## Author: TAMBH
############################################################
class SendEmailCronTask(ndb.Model):

	unique_id = ndb.StringProperty(required=True)
	content_config = ndb.TextProperty()
	is_send = ndb.BooleanProperty(default=False)
	date_send = ndb.DateTimeProperty()
	history_id = ndb.StringProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()

############################################################
## EMAIL SEND MESSAGE LINE CRON TASK
## Author: TAMBH
############################################################
class SendMessageLineCronTask(ndb.Model):

	unique_id = ndb.StringProperty(required=True)
	content_config = ndb.TextProperty()
	is_send = ndb.BooleanProperty(default=False)
	date_send = ndb.DateTimeProperty()
	history_id = ndb.StringProperty()
	is_cancel = ndb.BooleanProperty(default=False)

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_changed = ndb.DateTimeProperty(auto_now_add=True)

	creator_name = ndb.StringProperty()
	updater_name = ndb.StringProperty()