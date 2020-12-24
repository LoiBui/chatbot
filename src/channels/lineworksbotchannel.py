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

# import channels
from channels.basechannel import *
import chat_session_db
import directcloudbox_func
import cloudstorage
from google.appengine.ext import blobstore


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

		if room_id != '':
			return
			
		if contents is not None and contents['content']['type'] == 'text' and contents['content']['text'] == 'Start':
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

		elif contents is not None and contents['content']['type'] == 'text' and contents['content']['postback'] is not None:
			self.responsiveFileValue(contents, tenant, lineworks_id)

	def responsiveFileValue(self, contents, tenant, lineworks_id):
		postback = contents['content']['postback']
		
		step = len(postback.split("_@"))
		if step == 1:
			fileInfo = lineworks_func.getFileByAlias(postback)
			
			sheets = lineworks_func.getSheetsByUniqueId(fileInfo['unique_id'])
			logging.info(contents)
			logging.info(sheets)

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
			self.executeAction(tenant, lineworks_id, payload, self.channel_config)
		elif step == 2:
			logging.info("zooooooooooooooooooooooooooooooooooojhasgdjusagdsadsasg")
			postback = postback.split("_@")[0]
			fileInfo = lineworks_func.getFileByAlias(postback)
			questions = lineworks_func.getQuestionFromFileByUniqueIdAndSheetName(fileInfo['unique_id'], contents['content']['text'])

			for item in questions:
				if item['question'] != '':
					logging.info(item)
					payload = {
						"type": "text",
    					"text": item['question']
					}
					self.executeAction(tenant, lineworks_id, payload, self.channel_config)
					logging.info("sendddddddddddddddddddddddd")
					return


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

	def processSubFolder(self, tenant, rule_id, lineworks_id, node):
		response_content = ''
		count = 0
		
		logging.debug('process check access token')
		access_token = directcloudbox_func.getAccessToken()
		if access_token in [0, 1, 2]:
			if access_token == 0:
				response_content = self.getMsg('MSG_REQUIRE_INPUT_DIRECT_CLOUD_BOX_ACCOUNT')
			elif access_token == 1:
				response_content = self.getMsg('MSG_DIRECT_CLOUD_BOX_ACCOUNT_INVALID')
			else:
				logging.error('Has problem when get access token')
				return
			self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
			return -1, response_content
		
		get_list_sub_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes', 'lists', node=node)
		if 'success' in get_list_sub_folder and get_list_sub_folder['success'] is True:
			count = len(get_list_sub_folder['lists'])
			response_content = get_list_sub_folder['lists']
		
		return count, response_content
	
	###############################################
	# Create task upload image to direct cloud box
	###############################################
	def kickUploadImage(self, tenant, rule_id, lineworks_id, chat_session, node='', none_permission=0):
		chat_session['phase'] = 4
		self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
		
		params = {
			'user_id': lineworks_id,
			'chat_session': json.JSONEncoder().encode(chat_session),
			'node': node,
			'none_permission': none_permission
		}
		
		# task queue
		task_url = '/a/' + tenant + '/' + rule_id + '/tq/uploadimage'
		import_q = taskqueue.Queue('uploadimage-queue')
		import_t = taskqueue.Task(
			url=task_url,
			params=params,
			target=sateraito_func.getBackEndsModuleName(tenant),
			countdown=2
		)
		logging.info('run task')
		logging.info(task_url)
		import_q.add(import_t)
	
	###############################################
	# Create Image Url
	###############################################
	def createImageUrl(self, access_token, node, file_seq, tenant):
		
		storage_platform = 'directcloudbox'
		
		blob_key = FileStorage.getBlobKey(file_seq, storage_platform)
		logging.debug('blob_key=' + str(blob_key))
		
		if not blob_key:
			logging.debug('create blob_key')
			result = directcloudbox_func.callShareBoxDownloadFileManagementApi(access_token, node=node, file_seq=file_seq)
			
			width, height = sateraito_func.getImageInfo(result)
			logging.debug(str(width) + ' ------ ' + str(height))
			
			resize_image = sateraito_func.resizeImage(result, width, height)
			
			bucket = app_identity.get_default_gcs_bucket_name()
			filename = '/{0}/{1}/chat_files/{2}'.format(bucket, tenant, UcfUtil.guid())
			with cloudstorage.open(filename, 'w') as filehandle:
				filehandle.write(resize_image)
			
			# /gs/bucket/object
			blobstore_filename = '/gs{}'.format(filename)
			blob_key = blobstore.create_gs_key(blobstore_filename)
			FileStorage.saveFile(file_seq, blob_key, storage_platform)
			
		image_url = oem_func.getMySiteUrl(self._oem_company_code) + '/a/' + tenant + '/image?key=' + blob_key
		
		return image_url, blob_key
	
	def getFileAndFolder(self, access_token, node=''):
		page = 0
		list_file = []
		list_comment = []
		while True:
			get_list_file = directcloudbox_func.callDirectCloudBoxUserAPI(access_token, 'files', 'index', node=node, page=page)
			if 'success' in get_list_file and get_list_file['success'] is True:
				for temp_file in get_list_file['lists']:
					if temp_file['extension'] in ['jpg', 'jpeg', 'png', 'gif']:
						list_file.append(temp_file)
					if temp_file['extension'] == 'txt':
						list_comment.append(temp_file)
					
				if get_list_file['lastpage']:
					break
				page += 1
			else:
				break
		
		return list_file, list_comment
