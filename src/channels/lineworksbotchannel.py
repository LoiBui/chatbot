# coding: utf-8

import logging, webapp2
import hashlib
import base64
import json
import hmac
import datetime
import re
from ucf.utils.models import *
from google.appengine.api import urlfetch, app_identity
from ucf.utils.helpers import TenantWebHookAPIHelper
from ucf.utils.ucfutil import UcfUtil
import sateraito_inc
import sateraito_func
import sateraito_db
import oem_func
import lineworks_func
from google.appengine.api import taskqueue
from google.appengine.api import memcache
import urllib2
# import channels
from channels.basechannel import *
import chat_session_db
import directcloudbox_func
import cloudstorage
from google.appengine.ext import blobstore
import base64


############################################################
# チャネル：LINE WORKS Talk BOT
#
# □トリガー：LINE WORKS Talk BOTのwebhook
# 
# トリガー設定（trigger_config）
#  - open_api_id：LINE WORKS API実行用のキー
#  - botNo：対象のBotのBotNo（一応チェック用の設定？）
#
# [TRIGGER]トリガーで渡されてくるコンテンツ
#  - content：チャット文字列
#  - timestamp：UTC日時（YYYY-MM-DD hh:mm:ss）
#  - account：チャットを送信してきたLINE WORKS アカウントID
#  - writerUserNo：送信ユーザーNo（なんだろこれ）
#  - channelNo：元のトークルームのNo
#  - botNo：BotNo
#
# [ACTION]アクションで必要なコンテンツ（チャネル設定画面で指定したdata_mappingに基づいた値を使用）
#  - message_type：link or image or text（デフォルト=text. imagesは未対応）
#  - message_body：チャット文字列
#  - link_url：リンクURL（message_type=link の場合のみ）
#  - link_text：リンクに表示する文言（message_type=link の場合のみ）
#
############################################################


class ChannelLineWorksBOT(ChannelBase, TenantWebHookAPIHelper):
	CHANNEL_KIND = 'lineworksbot'
	
	# トリガーとして利用可能なチャネルか
	# IS_TRIGGER = True
	# アクションとして利用可能なチャネルか
	# IS_ACTION = True
	
	def __init__(self, params):
		super(ChannelLineWorksBOT, self).__init__(params)
	
	## チャネルタイトル
	# @property
	# def title(self):
	#	return self.getMsg('CHANNEL_TITLE_LINEWORKSBOT')
	
	## チャネルの説明
	# @property
	# def description(self):
	#	return self.getMsg('CHANNEL_DESCRIPTION_LINEWORKSBOT')
	
	# [TRIGGER]WEBHOOK系リクエスト処理（REST、サテライトアドオン、BOTのWEBHOOKなど）
	# contentsを取得するのが目的。contentsの要素はチャネルごとに個別定義
	def executeWebhookProcess(self, tenant, rule_id):
		
		contents_str = self.request.body
		x_works_signature = self.request.headers.get('X-Works-Signature', '')
		x_works_botno = self.request.headers.get('X-WORKS-BotNo', '')  # APIv2対応
		
		if contents_str is None or contents_str == '':
			self.response.set_status(400)
			self._status = 'error'
			self._msg = 'json is not found.'
			logging.warning(self._msg)
			return
		
		# 改ざんチェック
		# 1. API ID を秘密鍵として、body内容を HMAC-SHA256でエンコードしてからBASE64エンコード
		# 2. X-WORKS-Signature ヘッダー値と比較
		privkey = self.channel_config.get('open_api_id', '')
		key = str(privkey)
		value = contents_str
		signature = hmac.new(key, value, digestmod=hashlib.sha256).digest()  # バイト配列に変換
		signature_base64 = base64.b64encode(signature)
		logging.info(signature_base64)
		if signature_base64 != x_works_signature:
			logging.warning('not match signature.')
			if sateraito_inc.developer_mode:
				pass
			else:
				self.response.set_status(400)
				self._status = 'error'
				self._msg = 'not match signature.'
				return
		else:
			logging.info('The signature is match.')
		
		try:
			contents = json.JSONDecoder().decode(contents_str)
		except Exception, e:
			logging.error('invalid json format')
			self.response.set_status(400)
			self._status = 'error'
			self._msg = 'invalid json format'
			return

		botNo = UcfUtil.toInt(x_works_botno)
		
		# 一応botNoが想定されているものかをチェック
		if self.channel_config.get('bot_no', 0) != botNo:
			logging.error('invalid botNo:' + str(botNo))
			# self.response.set_status(400)
			self._status = 'error'
			self._msg = 'invalid botNo:' + str(botNo)
			return
		
		source = contents['source']
		lineworks_id = contents['source']['accountId'] if 'accountId' in source else ''
		room_id = contents['source']['roomId'] if 'roomId' in source else ''
		# ......................................................................

		logging.warning("CONTENT WEB HOOK")
		logging.warning(contents)

		if room_id != '':
			return
		


		# payload = {
		# 	"type": "button_template",
		# 	"contentText": 'You are want to download ?',
		# 	"actions": [
		# 		{
		# 			"type": "uri",
		# 			"label": 'Excel',
		# 			"uri": sateraito_inc.my_site_url + "/tenant/template/download_excel?session=e20c63c7cc0ab6eaf28568baff2ce692&type=excel"
		# 		},
		# 		{
		# 			"type": "uri",
		# 			"label": 'Pdf',
		# 			"uri": sateraito_inc.my_site_url + "/tenant/template/download_excel?session=e20c63c7cc0ab6eaf28568baff2ce692&type=pdf"
		# 		}
		# 	]
		# }
		
		# self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		# return 
		if contents is not None and contents['content']['type'] == 'text' and contents['content']['text'] == 'Start':
			self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			template = lineworks_func.getExcelTemplate()
			actions = []
			for item in template:
				actions.append({
					"type": "message",
					"label": item['display_name'],
					"postback": item['alias']
				})
				
			payload = {
				"type": "button_template",
				"contentText": "Please choose a template?",
				"actions": actions
			}
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)
			return

		elif contents is not None and contents['content']['type'] == 'text' and 'postback' in contents['content'] and contents['content']['postback'] is not None:
			self.responsiveFileValue(contents, tenant, lineworks_id, rule_id)
		else:
			chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			logging.warning("ZOOOOOOOOOOOOOO HERE")
			logging.warning(chat_session)
			if chat_session and 'alias' in chat_session and 'phase' in chat_session and 'postback' in chat_session and 'sheet_name' in chat_session:
				self.step3(chat_session['postback'], tenant, lineworks_id, chat_session['sheet_name'], rule_id, contents['content']['text'])

	def responsiveFileValue(self, contents, tenant, lineworks_id, rule_id):
		postback = contents['content']['postback']
		
		step = len(postback.split("_@"))
		if step == 1:
			fileInfo = lineworks_func.getFileByAlias(postback)
			sheets = lineworks_func.getSheetsByUniqueId(fileInfo['unique_id'])

			# show question if template have 1 sheets
			if len(sheets) == 1:
				logging.info("SKIP STEP 111111111111111111111111111111")
				self.step3(postback, tenant, lineworks_id, sheets[0], rule_id, contents['content']['text'])
				return

			actions = []
			for item in sheets:
				actions.append({
					"type": "message",
					"label": item,
					"postback": postback + "_@1"
				})
			
			payload = {
				"type": "button_template",
				"contentText": "Please choose a sheet of template file?",
				"actions": actions
			}
			self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		elif step == 2:
			logging.warning("zoooooooooo step2")
			self.step3(postback, tenant, lineworks_id, contents['content']['text'], rule_id, contents['content']['text'])
		elif step == 3:
			logging.warning("zoooooooooo step3")
			chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			self.step3(postback, tenant, lineworks_id, chat_session['sheet_name'], rule_id, contents['content']['text'])
		elif step == 4 and contents['content']['text'].lower() == 'yes':
			logging.warning("zoooooooooo step4")
			self.chooseExcelPdf(postback, tenant, lineworks_id, rule_id)
		elif step == 4 and contents['content']['text'].lower() == 'no':
			logging.warning("zoooooooooo step4")
			self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
    			"text": "Please start over."
			}, self.channel_config)

	def step3(self, postback, tenant, lineworks_id, sheet_name, rule_id, answer):
		postback = postback.split("_@")[0]
		fileInfo = lineworks_func.getFileByAlias(postback)
		questions = lineworks_func.getQuestionFromFileByUniqueIdAndSheetName(fileInfo['unique_id'], sheet_name)
		logging.warning("SEND QUESTION")
		self.sendQuestion(questions, answer, tenant, lineworks_id, rule_id, postback, sheet_name)

	def findNextEl(self, alias, questions):
		for index, item in enumerate(questions):
			if alias is None and len(questions) > 0:
				return questions[0]
			if item['alias'] == alias:
				if index + 1 >= len(questions):
					return None 
				else:
					return questions[index+1]
		return None

	def removeEmptyField(self, questions):
		newQuestion = []
		for item in questions:
			if item['question'] != '':
				newQuestion.append(item)
		return newQuestion

	def sendQuestion(self, questions, answer, tenant, lineworks_id, rule_id, postback, sheet_name):
		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		questions = self.removeEmptyField(questions)
		question = None

		
		if chat_session and 'alias' in chat_session:
			question = self.findNextEl(chat_session['alias'], questions)
		else:
			question = self.findNextEl(None, questions)

		if question is None:
			data_answer = chat_session['data_answer']
			for i in data_answer:
				if data_answer[i] is None:
					data_answer[i] = answer

			txt = ''
			for item in data_answer:
				question = lineworks_func.findQuestionByAlias(item)
				txt += question['question'] + " => " + data_answer[item] + "\n"

			payload = {
				"type": "button_template",
				"contentText": 'You are finish. Please confirm your answer. \n' + txt,
				"actions": [
					{
						"type": "message",
						"label": 'Yes',
						"postback": postback + "_@1_@2_@3"
					},
					{
						"type": "message",
						"label": 'No',
						"postback": postback + "_@1_@2_@3"
					}
				]
			}
			
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)
			self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
		else:
			data_answer = {}
			if 'data_answer' not in chat_session:
				data_answer[question['alias']] = None
			else:
				data_answer = chat_session['data_answer']
				for i in data_answer:
					if data_answer[i] is None:
						data_answer[i] = answer
				data_answer[question['alias']] = None

			chat_session = {
				'phase': 'question',
				'alias': question['alias'],
				'postback': postback,
				'sheet_name': sheet_name,
				'data_answer': data_answer
			}
			payload = None
			if int(question['require']) == 1 and question['require'].strip() == '':
				payload = {
					"type": "text",
					"text": question['question']
				}
			else:
				actions = []

				if int(question['require']) == 0:
					actions.append({
						"type": "message",
						"label": 'Skip',
						"postback": postback + "_@1_@2"
					})
				if question['value'].strip() != '':
					arr = question['value'].strip().split(",")
					for item in arr:
						actions.append({
							"type": "message",
							"label": item,
							"postback": postback + "_@1_@2"
						})
				payload = {
					"type": "button_template",
					"contentText": question['question'],
					"actions": actions
				}
				if len(actions) == 0:
    					payload = {
							"type": "text",
    						"text": question['question']
						}
			self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		

	def chooseExcelPdf(self, postback, tenant, lineworks_id, rule_id):

		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		
		data = chat_session['data_answer']
		question = lineworks_func.findQuestionByAlias(data.keys()[-1])

		dataAnswer = json.dumps(chat_session['data_answer'])
		unique_id = AnswerUser.save(lineworks_id, rule_id, question['file_id'], dataAnswer, question['sheet'])
		

		self.executeAction(tenant, lineworks_id, {
				"type": "text",
    			"text": "Please wait while we create the file for you."
		}, self.channel_config)
		self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)

		url = sateraito_inc.my_site_url + "/tenant/template/download_excel?session=" + unique_id +"&tenant="+tenant
		response = urllib2.urlopen(url)
		data = json.loads(response.read())
		logging.warning(data)
		if data['status']:
			payload = {
				"type": "button_template",
				"contentText": 'You are want to download ?',
				"actions": [
					{
						"type": "uri",
						"label": 'Excel',
						"uri": sateraito_inc.my_site_url + "/tenant/template/download_cloudstorage/" + data['excel'] + "/xlsx"
					},
					{
						"type": "uri",
						"label": 'Pdf',
						"uri": sateraito_inc.my_site_url + "/tenant/template/download_cloudstorage/" + data['excel'] + "/xlsx"
					}
				]
			}
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		else: 
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
    			"text": "ERROR"
			}, self.channel_config)
    			
		













	# [ACTION]アクションの実処理
	def executeAction(self, tenant, lineworks_id, payload, channel_config, next_data=None, node='', upload=False,
					  access_token='', blob_key=None, rule_id='', file_seq=''):
		
		# チャットボットにメッセージ送信
		logging.info('start to send message to line works chat bot...')
		
		if lineworks_id != '':
			logging.info(payload)
			logging.info(type(payload))
			logging.info(next_data)
			
			# logging.info(payload)
			open_api_id = channel_config.get('open_api_id', '')
			consumer_key = channel_config.get('consumer_key', '')
			server_id = channel_config.get('server_id', '')
			priv_key = channel_config.get('priv_key', '')
			bot_no = UcfUtil.toInt(channel_config.get('bot_no', ''))
			lineworksapiurl = 'message/v1/bot'
			
			# result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key, server_id,
			# 											  priv_key, payload, bot_no, 'message/push')
			# return 
			
			payload = {
				'accountId': lineworks_id,
				'content': payload
			}
			result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key, server_id,
														priv_key, payload, bot_no, 'message/push')
			
			if result.status_code != 200:
				logging.error(result.status_code)
				raise Exception(result.content)
			logging.info(result.content)
	
	def getChatSessionDb(self):
		return chat_session_db.ChatSessionLineworks
	
	def getChatSessionId(self, tenant, source_id, rule_id, language, oem_company_code):
		# load session temp for user to test
		# source_id = contents['source']['accountId']
		# rule_id = rule_row.unique_id
		if not rule_id:
			# user for test only
			rule_id = 'TEMP'
		chat_session_id = 'lineworks__{}__{}__{}__{}__{}'.format(tenant, source_id, rule_id, language, oem_company_code)
		logging.debug("chat_session_id: {}".format(chat_session_id))
		
		chat_session = chat_session_db.ChatSessionLineworks.load_session(chat_session_id) or {}
		return chat_session
	
	def saveChatSession(self, tenant, source_id, rule_id, language, oem_company_code, chat_session, chat_session_timeout=None):
		# load session temp for user to test
		# source_id = contents['source']['accountId']
		# rule_id = rule_row.unique_id
		if not rule_id:
			# user for test only
			rule_id = 'TEMP'
		chat_session_id = 'lineworks__{}__{}__{}__{}__{}'.format(tenant, source_id, rule_id, language, oem_company_code)
		if not chat_session:
			chat_session = {}
		
		if chat_session_timeout is None:
			chat_session_timeout = sateraito_inc.DEFAULT_CHAT_SESSION_TIMEOUT
		chat_session_db.ChatSessionLineworks.save_session(chat_session_id, chat_session, timeout=chat_session_timeout)
	
	def clearChatSession(self, tenant, source_id, rule_id, language, oem_company_code):
		# load session temp for user to test
		# source_id = contents['source']['accountId']
		# rule_id = rule_row.unique_id
		if not rule_id:
			# user for test only
			rule_id = 'TEMP'
		chat_session_id = 'lineworks__{}__{}__{}__{}__{}'.format(tenant, source_id, rule_id, language, oem_company_code)
		
		chat_session_db.ChatSessionLineworks.clear_session(chat_session_id)
