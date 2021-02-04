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

# self.getMsg('CHANNEL_TITLE_LINEWORKSBOT')
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
		
		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		logging.debug(chat_session)
		
		if contents is not None and contents['content']['type'] == 'text':
			if 'postback' in contents['content'] and '-------CANCEL-------' in contents['content']['postback']:
				check = contents['content']['postback'].split('@@@')
				if len(check) == 2:
					lineworks_func.removeAnswer(check[-1])
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": 'Has canceled your responses'
				}, self.channel_config)
				self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			elif 'postback' in contents['content'] and 'CHOOSE_QUESTION_____' in contents['content']['postback']:
				self.generalQuestion(tenant, lineworks_id, rule_id, contents['content']['postback']);
			elif 'postback' in contents['content'] and 'ANSWER_QUESTION______' in contents['content']['postback']:
				self.proccessAnswer(tenant, lineworks_id, rule_id, contents['content']['postback'], contents['content']);
			elif 'postback' in contents['content'] and contents['content']['postback'] == 'start':
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": self.getMsg('HELP_MESSAGE')
				}, self.channel_config)
				
			elif contents['content']['text'] in [self.getMsg('VMSG_HELP'), '?', u'？'] and not chat_session:
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": self.getMsg('HELP_MESSAGE')
				}, self.channel_config)
			
			elif contents['content']['text'] == self.getMsg('CHOOSE_TEMPLATE'):
				self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
				template = lineworks_func.getExcelTemplate()
				actions = []
				payload = None
				if len(template) == 0:
					payload = {
						"type": "text",
						"text": self.getMsg('NOT_YET_SETUP_FILE')
					}
				else:
					for idx, item in enumerate(template):
						actions.append({
							"type": "message",
							"label": item['display_name'],
							"postback": item['alias']
						})
						if idx == 8 and len(template) > 10:
							actions.append({
								"type": "message",
								"label": self.getMsg('LOAD_MORE'),
								"postback": '-------PAGINATE-------START-------1'
							})
							logging.warning("zooooooooooooooooo more")
							break
						
					payload = {
						"type": "button_template",
						"contentText": self.getMsg('CHOOSE_A_TEMPLATE'),
						"actions": actions
					}
				self.executeAction(tenant, lineworks_id, payload, self.channel_config)
				self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, {'isStart': True})
				return
			elif 'postback' in contents['content'] and contents['content']['postback'] is not None and 'PAGINATE' in contents['content']['postback']:
				postback = contents['content']['postback']
				if 'START' in postback:
					print('PAGINATOR-----------------------')
					page = postback.split("-------")
					self.paginatorFile(page[-1], tenant, lineworks_id)
				elif 'SHEETS' in postback:
					data = postback.split("-------")
					self.paginatorSheet(data[-1], tenant, lineworks_id)
				elif 'QUESTIONS' in postback:
					data = postback.split("-------")
					self.paginatorQuestion(data[-1], tenant, lineworks_id, rule_id)
					
			elif 'postback' in contents['content'] and contents['content']['postback'] is not None:
				logging.warning("ZOOOOOOOOOOOOOO responsiveFileValue")
				self.responsiveFileValue(contents, tenant, lineworks_id, rule_id)
			elif 'current_question' in chat_session:
				# zooo answer Text
				logging.warning("zooo answer Text")
				self.proccessAnswer(tenant, lineworks_id, rule_id, 'ANSWER_QUESTION______'+chat_session['current_question'], contents['content'])
			else:
				# chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
				logging.warning("ZOOOOOOOOOOOOOO HERE")
				logging.warning(chat_session)
				if len(chat_session) == 0:
					self.executeAction(tenant, lineworks_id, {
						"type": "text",
						"text": self.getMsg('PRESS_CHOOSE_TEMPLATE_BUTTON'),
					}, self.channel_config)
				elif chat_session and 'isStart' in chat_session and chat_session['isStart']:
					self.executeAction(tenant, lineworks_id, {
						"type": "text",
						"text": self.getMsg('PLEASE_CHOOSE_A_TEMPLATE')
					}, self.channel_config)
				elif chat_session and 'alias' in chat_session and 'phase' in chat_session and 'postback' in chat_session and 'sheet_name' in chat_session:
					self.step3(chat_session['postback'], tenant, lineworks_id, chat_session['sheet_name'], rule_id, contents['content']['text'])

	def paginatorSheet(self, postback, tenant, lineworks_id):
		print('ZOOOOOOOOOO SHEETS')
		print(postback)
		arr = postback.split("_")
		step = int(arr[0])
		alias = arr[1]
		actions = []
		fileInfo = lineworks_func.getFileByAlias(alias)
		sheets = lineworks_func.getSheetsByUniqueId(fileInfo['unique_id'])
		for (idx, item) in enumerate(sheets):
			if idx >= step * 9:
				actions.append({
					"type": "message",
					"label": item,
					"postback": postback + "_@1"
				})
			if idx == (step + 1)*9 - 1 and len(sheets) > 10*(step + 1):
				actions.append({
					"type": "message",
					"label": self.getMsg('LOAD_MORE'),
					"postback": '-------PAGINATE-------SHEETS-------'+str(step+1)+'_' + str(alias)
				})
				break
		payload = {
			"type": "button_template",
			"contentText": self.getMsg('PLEASE_CHOOSE_A_SHEET'),
			"actions": actions
		}
		self.executeAction(tenant, lineworks_id, payload, self.channel_config)
    					
	def paginatorFile(self, step, tenant, lineworks_id):
		logging.warning('PAGINATOR-----------------------START')
		actions = []
		step = int(step)
		# 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
		# 1 2 3 4 5 6 7 8 9
		# 10 11 12 13 14 15 16 17 18
		template = lineworks_func.getExcelTemplate()
		for (idx, item) in enumerate(template):
			if idx >= step * 9:
				actions.append({'type': 'message', 'label': item['display_name'], 'postback': item['alias']})
			if idx == (step + 1)*9 - 1 and len(template) > 10*(step + 1):
				actions.append({
					'type': 'message',
					'label': self.getMsg('LOAD_MORE'),
					'postback': '-------PAGINATE-------START-------'+str(step+1)
				})
				break
		logging.warning(len(actions))
		logging.warning(actions)
		payload = {
			"type": "button_template",
			"contentText": self.getMsg('CHOOSE_A_TEMPLATE'),
			"actions": actions
		}
		self.executeAction(tenant, lineworks_id, payload, self.channel_config)
    	
	def paginatorQuestion(self, data, tenant, lineworks_id, rule_id):
		data = data.split("_")
		step = int(data[0])
		sheet_name = data[1]
		unique_id = data[2]
		questions = lineworks_func.getQuestionFromFileByUniqueIdAndSheetName(unique_id, sheet_name)
		questions = self.removeEmptyField(questions)
		actions = []
		# 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
		# step1: 1->8 
		#
		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		logging.warning("z00000000000000000 paginator question")
		if 'arr_question' not in chat_session:
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
    			"text": 'Your choices are not appropriate'	
			}, self.channel_config)
			return
    			
		arr_question = chat_session['arr_question']

		for (idx, item) in enumerate(arr_question):
			question = self.findIndexQuestion(item, questions)
			if 'index' not in question:
    				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": 'Your choices are not appropriate'
				}, self.channel_config)
				return
			if idx >= step * 8:
				actions.append({
					'type': 'message', 
					'label': 'Question ' + str(int(question['index']) + 1), 
					'text': 'Question ' + str(int(question['index']) + 1), 
					'postback': 'CHOOSE_QUESTION_____'+question['data']['alias']
				})
			if idx == (step + 1)*8 - 1 and len(arr_question) > 8*(step + 1):
				break
		
		actions.append({
			"type": "message",
			"label": 'Cancel',
			"postback": '-------CANCEL-------'
		})

		if len(arr_question) > 9*(step + 1):
			actions.append({
				'type': 'message',
				'label': self.getMsg('LOAD_MORE'),
				'postback': '-------PAGINATE-------QUESTIONS-------'+str(step+1) + "_" +sheet_name+'_'+ unique_id
			})
		
		payload = {
			"type": "button_template",
			"contentText": 'Please choose question below',
			"actions": actions
		}
		
 		logging.warning(len(actions))
		self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		
	def responsiveFileValue(self, contents, tenant, lineworks_id, rule_id):
		postback = contents['content']['postback']
		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		
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
			for idx, item in enumerate(sheets):
				actions.append({
					"type": "message",
					"label": item,
					"postback": postback + "_@1"
				})
				if idx == 8 and len(sheets) > 10:
					actions.append({
							"type": "message",
							"label": self.getMsg('LOAD_MORE'),
							"postback": '-------PAGINATE-------SHEETS-------1_'+str(postback)
						})
					logging.warning("zooooooooooooooooo more")
					break
			
			payload = {
				"type": "button_template",
				"contentText": self.getMsg('PLEASE_CHOOSE_A_SHEET'),
				"actions": actions
			}
			self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		elif step == 2:
			logging.warning("zoooooooooo step2")
			logging.warning(postback)
			postback = postback.split("_@")[0]
			self.step3(postback, tenant, lineworks_id, contents['content']['text'], rule_id, contents['content']['text'])
		elif step == 3:
			logging.warning("zoooooooooo step3")
			if chat_session:
				self.step3(postback, tenant, lineworks_id, chat_session['sheet_name'], rule_id, contents['content']['text'])
			else:
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": self.getMsg('MSG_PREVIOUS_SESSION_FINISHED')		# ket thuc template -> doi message
				}, self.channel_config)
		elif step == 4 and contents['content']['text'] == self.getMsg('YES'):
			logging.warning("zoooooooooo step4")
			self.chooseExcelPdf(tenant, lineworks_id, rule_id)
		elif step == 4 and contents['content']['text'] == self.getMsg('NO'):
			logging.warning("zoooooooooo step4")
			if chat_session:
				if 'is_confirm' in chat_session and chat_session['is_confirm']:
					text = self.getMsg('MSG_DENY_CREATE_FILE')
					self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
				else:
					text = self.getMsg('MSG_FOLLOW_CURRENT_PROCESS')
			else:
				text = self.getMsg('MSG_PREVIOUS_SESSION_FINISHED')
				
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
    			"text": text		# ket thuc template -> doi message
			}, self.channel_config)

	def step3(self, postback, tenant, lineworks_id, sheet_name, rule_id, answer):
		fileInfo = lineworks_func.getFileByAlias(postback)
		questions = lineworks_func.getQuestionFromFileByUniqueIdAndSheetName(fileInfo['unique_id'], sheet_name)
		logging.warning("SEND QUESTION")
		questions = self.removeEmptyField(questions)
		self.sendQuestion(questions, tenant, lineworks_id, rule_id, sheet_name, fileInfo['unique_id'])

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
	def findIndexQuestion(self, alias, questions):
		question = {}
		for idx, item in enumerate(questions):
			if item['alias'] == alias:
				question['index'] = idx
				question['data'] = item
				break
		return question
    				

	def showFinish(self, tenant, lineworks_id, rule_id, chat_session):
		chat_session['is_confirm'] = True
		self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
		self.chooseExcelPdf(tenant, lineworks_id, rule_id);
		return;

		data_answer = chat_session['data_answer']
		postback = '4932742'
		txt = []
		for item in data_answer:
			question = lineworks_func.findQuestionByAlias(item)
			txt.append(question['question'] + " => " + data_answer[item] + "\n")
		if len("".join(txt)) < 300:
			payload = {
				"type": "button_template",
				"contentText": self.getMsg('YOU_ARE_FINISH_PCYA') + '\n' + "".join(txt),
				"actions": [
					{
						"type": "message",
						"label": self.getMsg('YES'),
						"postback": postback + "_@1_@2_@3"
					},
					{
						"type": "message",
						"label": self.getMsg('NO'),
						"postback": postback + "_@1_@2_@3"
					}
				]
			}
		else:
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
				"text": self.getMsg('YOU_ARE_FINISH')
			}, self.channel_config)
			for qs in txt:
				if len(qs) > 300:
					qs = qs[:296]+"..."
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": qs
				}, self.channel_config)
			payload = {
				"type": "button_template",
				"contentText": self.getMsg('PLEASE_CONFIRM_YOUR_ANSWER'),
				"actions": [
					{
						"type": "message",
						"label": self.getMsg('YES'),
						"postback": postback + "_@1_@2_@3"
					},
					{
						"type": "message",
						"label": self.getMsg('NO'),
						"postback": postback + "_@1_@2_@3"
					}
				]
			}
		chat_session['is_confirm'] = True
			
		self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)

	def sendQuestion(self, questions, tenant, lineworks_id, rule_id, sheet_name, file_unique_id):
		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		# check sheet was setup question 
		if len(questions) == 0:
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
				"text": self.getMsg('SHEETS_WAS_NOT_ALLOWED_SETUP')
			}, self.channel_config)
			return

		# init arr question 
		if 'arr_question' not in chat_session:
			chat_session['arr_question'] = []
			for item in questions:
				chat_session['arr_question'].append(item['alias'])
    				
		#finish 
		if len(chat_session['arr_question']) == 0 and len(questions) > 0:
			self.showFinish(tenant, lineworks_id, rule_id, chat_session)
			return 


		actions = []
		logging.warning("check rm------------------------------")
		logging.warning(chat_session)
		for idx, item in enumerate(chat_session['arr_question']):
			question = self.findIndexQuestion(item, questions)
			if 'index' not in question:
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": 'Click cancel in the question list to select another sheet.'
				}, self.channel_config)
				return
			actions.append({
				"type": "message",
				"label": 'Question ' + str(question['index']+1),
				"text": 'Question ' + str(question['index']+1),
				"postback": 'CHOOSE_QUESTION_____'+question['data']['alias']
			})
			if idx == 7 and len(chat_session['arr_question']) > 9:
				break
		
		actions.append({
			"type": "message",
			"label": 'Cancel',
			"postback": '-------CANCEL-------'
		})
		if len(chat_session['arr_question']) > 9:
			actions.append({
				"type": "message",
				"label": self.getMsg('LOAD_MORE'),
				"postback": '-------PAGINATE-------QUESTIONS-------1_'+sheet_name+'_'+file_unique_id
			})
    			
		payload = {
			"type": "button_template",
			"contentText": 'Please choose question below',
			"actions": actions
		}
		self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		if 'sheet_name' not in chat_session:
			chat_session['sheet_name'] = sheet_name
			chat_session['file_unique_id'] = file_unique_id
		
		self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)


	def generalQuestion(self, tenant, lineworks_id, rule_id, postback):
		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		if len(chat_session) == 0:
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
				"text": self.getMsg('MSG_PREVIOUS_SESSION_FINISHED')
			}, self.channel_config)
			return
    			
		alias_question = postback.strip().split("CHOOSE_QUESTION_____")[-1]
		question = lineworks_func.findQuestionByAliasAndFileId(alias_question, chat_session['file_unique_id'])
		chat_session['current_question'] = alias_question

		if question is None or alias_question not in chat_session['arr_question']:
			self.executeAction(tenant, lineworks_id, {
				"type": "text",
				"text": 'Your choices are not appropriate'
			}, self.channel_config)	
		else:
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
						"label": self.getMsg('SKIP'),
						"postback": "ANSWER_QUESTION______" + alias_question
					})
				if question['value'].strip() != '':
					arr = question['value'].strip().split(",")
					for item in arr:
						actions.append({
							"type": "message",
							"label": item,
							"postback": "ANSWER_QUESTION______" + alias_question
						})
				payload = {
					"type": "button_template",
					"contentText": question['question'] + (self.getMsg('YOU_CAN_SKIP') if int(question['require']) == 0 else "" ),
					"actions": actions
				}
				if len(actions) == 0:
					payload = {
						"type": "text",
						"text": question['question']
					}
			self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)

	def proccessAnswer(self, tenant, lineworks_id, rule_id, postback, data):
		alias_question = postback.strip().split("ANSWER_QUESTION______")[-1]
		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)

		question = lineworks_func.findQuestionByAlias(alias_question)
		if question['value'].strip() != '':
			arrCheck = question['value'].strip().split(",")
			if data['text'] not in arrCheck:
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": self.getMsg('YOUR_ANSWER_IS_INVALID')
				}, self.channel_config)
				return

		if 'data_answer' not in chat_session:
			chat_session['data_answer'] = {}
		chat_session['data_answer'][alias_question] = data['text']

		logging.warning(alias_question)
		chat_session['arr_question'].remove(alias_question)
		logging.warning(chat_session)

		questions = lineworks_func.getQuestionFromFileByUniqueIdAndSheetName(chat_session['file_unique_id'], chat_session['sheet_name'])
		questions = self.removeEmptyField(questions)

		
		self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
		self.sendQuestion(questions, tenant, lineworks_id, rule_id, chat_session['sheet_name'], chat_session['file_unique_id'])
    				
	
	def chooseExcelPdf(self, tenant, lineworks_id, rule_id):

		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		if 'is_confirm' in chat_session and chat_session['is_confirm']:
			try:
				logging.warning(chat_session)
				data = chat_session['data_answer']
				question = lineworks_func.findQuestionByAlias(data.keys()[-1])
				
				file_unique_id = chat_session['file_unique_id']
				dataAnswer = json.dumps(chat_session['data_answer'])
				unique_id = AnswerUser.save(lineworks_id, rule_id, question['file_id'], dataAnswer, question['sheet'])
				
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": self.getMsg('PLEASE_WAIT_WHILE_WE_CREATE')
				}, self.channel_config)
				self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)

				url = sateraito_inc.my_site_url + "/tenant/template/download_excel?session=" + unique_id +"&tenant="+tenant
				response = urllib2.urlopen(url)
				data = json.loads(response.read())
				logging.warning(data)
				if data['status']:
					actions = []
					logging.warning(file_unique_id)
					file = lineworks_func.getFileByUniqueId(file_unique_id)
					logging.warning(file)
					if int(file['download_method']) == 0 or int(file['download_method']) == 1:
						actions.append({
							"type": "uri",
							"label": 'Pdf',
							"uri": sateraito_inc.my_site_url + "/tenant/template/download_cloudstorage/" + data['pdf'] + "/pdf"
						})
					if int(file['download_method']) == 0 or int(file['download_method']) == 2:
						actions.append({
							"type": "uri",
							"label": 'Excel',
							"uri": sateraito_inc.my_site_url + "/tenant/template/download_cloudstorage/" + data['excel'] + "/xlsx"
						})
					actions.append({
						"type": "message",
						"label": 'Cancel',
						"postback": '-------CANCEL-------@@@'+data['pdf']
					})
					payload = {
						"type": "button_template",
						"contentText": self.getMsg('MSG_CHOOSE_FILE_FORMAT_TO_DOWNLOAD'),
						"actions": actions
					}
					self.executeAction(tenant, lineworks_id, payload, self.channel_config)
				else:
					self.executeAction(tenant, lineworks_id, {
						"type": "text",
						"text": "ERROR"
					}, self.channel_config)
			except Exception, e:
				logging.warning(111111111)
				logging.warning(e)
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
	    			"text": self.getMsg('MSG_PREVIOUS_SESSION_FINISHED')
				}, self.channel_config)	
		else:
			if chat_session:
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": self.getMsg('MSG_FOLLOW_CURRENT_PROCESS')
				}, self.channel_config)
			else:
				self.executeAction(tenant, lineworks_id, {
					"type": "text",
					"text": self.getMsg('MSG_PREVIOUS_SESSION_FINISHED')
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
