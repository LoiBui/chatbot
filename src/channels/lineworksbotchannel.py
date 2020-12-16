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
		
		if room_id != '':
			return
		# else:
		# 	target_users = {'lineworks_id': lineworks_id}
		
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
			self.executeAction(tenant, lineworks_id, response_content, self.channel_config)
			return

		chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
		logging.debug(chat_session)
		
		if chat_session and 'phase' in chat_session and chat_session['phase'] == 4:
			logging.debug('process wait for last process is completed')
			response_content = self.getMsg('MSG_WAIT_FOR_PROGRESS_COMPLETED')
			self.executeAction(tenant, lineworks_id, response_content, self.channel_config)
			return
		
		if contents is not None and contents['type'] == 'message':
			response_content = None
			next_data = None
			
			resource_id_memcache_key = 'script=source_id&lineworks_id=' + lineworks_id
			resource_id = memcache.get(resource_id_memcache_key)
			
			if 'content' in contents:
				# process start chat
				if 'postback' in contents['content']:
					postback = contents['content']['postback']
					
					if postback == 'start':
						response_content = self.getMsg('MSG_WELCOME_MESSAGE')
						
					elif postback.split('_')[0] == 'phase':
						logging.debug(resource_id)
						if chat_session and resource_id:
							if postback.split('_')[1] == '1':
								node = FileUpSettingConfig.getFolderNode(self.CHANNEL_KIND)
								get_list_subfolder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes',
																									'lists', node=node)
								if 'success' in get_list_subfolder and get_list_subfolder['success'] is True:
									response_content = get_list_subfolder['lists']
									response_content = sorted(response_content, key=lambda k: k['name'])
							elif postback.split('_')[1] == '2':
								chat_session['phase'] = 2
								self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
								response_content = self.getMsg('MSG_ASK_TO_ADD_LOCATION')
							elif postback.split('_')[1] == '3':
								chat_session['phase'] = 3
								self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
								response_content = self.getMsg('MSG_ASK_TO_ADD_COMMENT')
							elif postback.split('_')[1] == '4':
								logging.debug('process upload image to direct cloud box')
								if 'node' in chat_session:
									chat_session['phase'] = 4
									self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
									self.kickUploadImage(tenant, rule_id, lineworks_id, chat_session, node=chat_session['node'])
									response_content = self.getMsg('MSG_WAIT_FOR_UPLOAD_IMAGE')
								else:
									if 'temp_node' in chat_session:
										self.kickUploadImage(tenant, rule_id, lineworks_id, chat_session, node=chat_session['temp_node'])
										response_content = self.getMsg('MSG_WAIT_FOR_UPLOAD_IMAGE')
									else:
										self.kickUploadImage(tenant, rule_id, lineworks_id, chat_session)
										response_content = self.getMsg('MSG_WAIT_FOR_CREATE_CHAT_SAVE_IMAGE_FOLDER_AND_UPLOAD_IMAGE')
							elif postback.split('_')[1] == '5':
								logging.debug('process cancel upload image')
								response_content = self.getMsg('MSG_CANCEL_UPLOAD')
								self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
								
								resource_id_memcache_key = 'script=source_id&lineworks_id=' + lineworks_id
								memcache.set(key=resource_id_memcache_key, value='', time=0)
						else:
							response_content = self.getMsg('MSG_UPLOAD_PROGRESS_HAS_EXPIRED')
						
					elif postback.split('_')[0] == 'nextfolder':
						logging.debug('process next folder')
						if chat_session:
							next_data = postback
							if len(postback.split('_')) == 2:
								node = FileUpSettingConfig.getFolderNode(self.CHANNEL_KIND)
								count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
								response_content = sorted(response_content, key=lambda k: k['name'])
						else:
							response_content = self.getMsg('MSG_UPLOAD_PROGRESS_HAS_EXPIRED')
						
					elif postback.split('_')[0] == 'nextimagefolder':
						logging.debug('process next image folder')
						next_data = postback
						if len(postback.split('_')) == 3:
							node = postback.split('_')[1]
							count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
							logging.debug(response_content)
							
							response_content = sorted(response_content, key=lambda k: k['name'])
							response_content = {'list_folder': response_content}
							self.executeAction(tenant, lineworks_id, response_content, self.channel_config, node=node, next_data=next_data)
							return
						
					elif postback.split('_')[0] == 'nextimage':
						logging.debug('process next image folder')
						next_data = postback
						if len(postback.split('_')) == 3:
							node = postback.split('_')[1]
							list_file, list_comment = self.getFileAndFolder(access_token, node)
							response_content = {'list_file': list_file, 'list_comment': list_comment}
							self.executeAction(tenant, lineworks_id, response_content, self.channel_config, node=node,
											   next_data=next_data, access_token=access_token)
							return
					
					# process create folder
					elif postback.split('_')[0] == 'choosefolder':
						logging.debug('process choose folder')
						if chat_session:
							node = postback.split('_')[1]
							chat_session['node'] = node
							self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
							self.executeAction(tenant, lineworks_id, response_content, self.channel_config, upload=True, rule_id=rule_id)
							return
						else:
							response_content = self.getMsg('MSG_UPLOAD_PROGRESS_HAS_EXPIRED')
							
					elif postback.split('_')[0] == 'chooseimagefolder':
						logging.debug('process choose image folder')
						
						node = postback.split('_')[1]
						count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
						if count == 0:
							list_file, list_comment = self.getFileAndFolder(access_token, node)
							if len(list_file) == 0:
								response_content = self.getMsg('MSG_NO_IMAGE_OR_FOLDER')
								self.executeAction(tenant, lineworks_id, response_content, self.channel_config)
								return
							else:
								response_content = {'list_file': list_file, 'list_comment': list_comment}
						elif count > 0:
							list_file, list_comment = self.getFileAndFolder(access_token, node)
							response_content = sorted(response_content, key=lambda k: k['name'])
							if len(list_file) == 0:
								response_content = {'list_folder': response_content}
							else:
								response_content = {'list_file': list_file, 'list_folder': response_content, 'list_comment': list_comment}
									
						self.executeAction(tenant, lineworks_id, response_content, self.channel_config, node=node, access_token=access_token)
						return
					
					elif postback.split('_')[0] == 'image':
						logging.debug('process view image')
						
						file_seq = ''
						node = ''
						if len(postback.split('/')) == 2:
							blob_key = '_'.join(postback.split('_')[1:]).split('/')[0]
							keyword = '.'.join(postback.split('/')[1].split('.')[:-1]) + '.txt'
							search_file = directcloudbox_func.callDirectCloudBoxUserAPI(access_token, 'files', 'search', node=sateraito_inc.DIRECT_CLOUD_BOX_BASE_NODE, keyword=keyword)
							if 'success' in search_file and search_file['success'] is True:
								if len(search_file['lists']) > 0:
									file_seq = search_file['lists'][0]['file_seq']
									node = search_file['lists'][0]['node']
						
						else:
							blob_key = '_'.join(postback.split('_')[1:])
						self.executeAction(tenant, lineworks_id, response_content, self.channel_config, blob_key=blob_key, node=node, file_seq=file_seq, access_token=access_token)
						return
					
					elif postback.split('_')[0] == 'showdetail':
						node = postback.split('_')[1]
						file_seq = postback.split('_')[2]

						text = ''
						if node != '':
							file_download = directcloudbox_func.callShareBoxDownloadFileManagementApi(access_token, node=node, file_seq=file_seq)
							logging.debug(type(file_download))
							if file_download.strip() != '':
								text = file_download
								
								logging.debug(text)
								
								patten1 = '(\[' + str(self.getMsg('IMAGE_LOCATION')) +'\])\s*(.*\\n?)\s*'
								regex1 = re.findall(patten1, text)
								logging.debug(regex1)
								if len(regex1) > 0 and len(regex1[0]) > 1:
									text = text.replace(regex1[0][1], regex1[0][1].replace(',', urllib.quote_plus(',')))
									
								patten2 = '(\[' + str(self.getMsg('UPLOAD_LOCATION')) +'\])\s*(.*\\n?)\s*'
								regex2 = re.findall(patten2, text)
								logging.debug(regex2)
								if len(regex2) > 0 and len(regex2[0]) > 1:
									text = text.replace(regex2[0][1], regex2[0][1].replace(',', urllib.quote_plus(',')))
						
						if text == '':
							text = self.getMsg('NO_MORE_DETAIL')
							
						self.executeAction(tenant, lineworks_id, text, self.channel_config)
						return
						
				elif contents['content']['type'] == 'image':
					logging.debug('process save image in memcache')

					time.sleep(1)
					
					resource_id_memcache_key = 'script=source_id&lineworks_id=' + lineworks_id
					resource_id = memcache.get(resource_id_memcache_key)
					logging.debug(resource_id)

					# if chat_session:
					if not resource_id:
						if chat_session:
							memcache_expire_secs = 300
							if memcache_expire_secs > 0 and resource_id_memcache_key != '':
								if not memcache.set(key=resource_id_memcache_key, value=contents['content']['resourceId'],
													time=memcache_expire_secs):
									logging.warning("Memcache set failed.")
								else:
									logging.info("Memcache set success.key=" + resource_id_memcache_key)

							node = FileUpSettingConfig.getFolderNode('lineworksbot')
							logging.debug(node)
							if node == '':
								logging.debug('check folder node exist')
								get_list_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes', 'lists')
								if 'success' in get_list_folder and get_list_folder['success'] is True:
									list_folder = get_list_folder['lists']
									for folder in list_folder:
										if folder['name'] == self.getMsg('CHAT_IMAGE_SAVE'):
											node = folder['node']
											FileUpSettingConfig.setFolderNode(self.CHANNEL_KIND, node)

											count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
											if count == 0:
												chat_session['node'] = node
												self.saveChatSession(tenant, lineworks_id, rule_id, self._language,
																	 self._oem_company_code, chat_session)
												self.executeAction(tenant, lineworks_id, response_content, self.channel_config,
																   upload=True, rule_id=rule_id)
												return
											elif count > 0:
												chat_session['temp_node'] = node
												chat_session['sub_folder'] = 1
												self.saveChatSession(tenant, lineworks_id, rule_id, self._language,
																	 self._oem_company_code, chat_session)
												response_content = sorted(response_content, key=lambda k: k['name'])
												self.executeAction(tenant, lineworks_id, response_content, self.channel_config,
																   upload=True, rule_id=rule_id)
												return

								self.executeAction(tenant, lineworks_id, response_content, self.channel_config, upload=True, rule_id=rule_id)
								return

							else:
								logging.debug('check folder node still exist')
								check_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes',
																							  'read', node=node)
								if 'success' in check_folder and check_folder['success'] is True and check_folder['result']['name'] == self.getMsg('CHAT_IMAGE_SAVE'):
									count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
									if count == 0:
										chat_session['node'] = node
										self.saveChatSession(tenant, lineworks_id, rule_id, self._language,
															 self._oem_company_code, chat_session)
										self.executeAction(tenant, lineworks_id, response_content, self.channel_config,
														   upload=True, rule_id=rule_id)
										return
									elif count > 0:
										chat_session['temp_node'] = node
										chat_session['sub_folder'] = 1
										self.saveChatSession(tenant, lineworks_id, rule_id, self._language,
															 self._oem_company_code, chat_session)
										response_content = sorted(response_content, key=lambda k: k['name'])
										self.executeAction(tenant, lineworks_id, response_content, self.channel_config,
														   upload=True, rule_id=rule_id)
										return
								else:
									get_list_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes', 'lists')
									if 'success' in get_list_folder and get_list_folder['success'] is True:
										list_folder = get_list_folder['lists']
										for folder in list_folder:
											if folder['name'] == self.getMsg('CHAT_IMAGE_SAVE'):
												node = folder['node']
												FileUpSettingConfig.setFolderNode(self.CHANNEL_KIND, node)

												count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
												if count == 0:
													chat_session['node'] = node
													self.saveChatSession(tenant, lineworks_id, rule_id, self._language,
																		 self._oem_company_code, chat_session)
													self.executeAction(tenant, lineworks_id, response_content, self.channel_config,
																	   upload=True, rule_id=rule_id)
													return
												elif count > 0:
													chat_session['temp_node'] = node
													chat_session['sub_folder'] = 1
													self.saveChatSession(tenant, lineworks_id, rule_id, self._language,
																		 self._oem_company_code, chat_session)
													response_content = sorted(response_content, key=lambda k: k['name'])
													self.executeAction(tenant, lineworks_id, response_content, self.channel_config,
																	   upload=True, rule_id=rule_id)
													return
									
									self.executeAction(tenant, lineworks_id, response_content, self.channel_config, upload=True, rule_id=rule_id)
									return

						else:
							response_content = self.getMsg('MSG_INCORRECT_MESSAGE')

					else:
						if chat_session:
							memcache_expire_secs = 300
							logging.info('memcache_expire_secs=' + str(memcache_expire_secs))
							if memcache_expire_secs > 0 and resource_id_memcache_key != '':
								if not memcache.set(key=resource_id_memcache_key, value=resource_id + ',' + contents['content']['resourceId'],
													time=memcache_expire_secs):
									logging.warning("Memcache set failed.")
								else:
									logging.info("Memcache set success.key=" + resource_id_memcache_key)
							else:
								response_content = self.getMsg('MSG_INCORRECT_MESSAGE')
						else:
							response_content = self.getMsg('MSG_INCORRECT_MESSAGE')
						
				elif contents['content']['type'] == 'location':
					logging.debug('process get location from user')
					if chat_session:
						if 'phase' in chat_session and chat_session['phase'] == 2:
							chat_session['location'] = str(contents['content']['latitude']) + ',' + str(contents['content']['longitude'])
							del chat_session['phase']
							self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
							self.executeAction(tenant, lineworks_id, response_content, self.channel_config, upload=True, rule_id=rule_id)
							return
						else:
							response_content = self.getMsg('MSG_WRONG_ACTION')
					else:
						response_content = self.getMsg('MSG_WRONG_ACTION')
					
				elif contents['content']['type'] == 'text':
					response_content = self.getMsg('MSG_INCORRECT_MESSAGE')
					
					if contents['content']['text'] in [self.getMsg('VMSG_HELP'), '?', u'？']:
						logging.debug('process when chose [help] option')
						response_content = self.getMsg('MSG_WELCOME_MESSAGE')
					
					elif contents['content']['text'] in [self.getMsg('MSG_UPLOAD_IMAGE1'), self.getMsg('MSG_UPLOAD_IMAGE2'),
														 self.getMsg('VMSG_UPLOAD'), self.getMsg('VMSG_IMAGE')]:
						chat_session = {'phase': 0}
						self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
						response_content = self.getMsg('MSG_ASK_UPLOAD_IMAGE')
					
					elif contents['content']['text'] == self.getMsg('MSG_VIEW_IMAGE'):
						logging.debug('process view image')
						
						node = FileUpSettingConfig.getFolderNode('lineworksbot')
						if node == '':
							logging.debug('check folder node exist')
							get_list_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes', 'lists')
							if 'success' in get_list_folder and get_list_folder['success'] is True:
								list_folder = get_list_folder['lists']
								for folder in list_folder:
									if folder['name'] == self.getMsg('CHAT_IMAGE_SAVE'):
										node = folder['node']
										FileUpSettingConfig.setFolderNode(self.CHANNEL_KIND, node)
										
										count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
										if count == 0:
											list_file, list_comment = self.getFileAndFolder(access_token, node)
											if len(list_file) == 0:
												response_content = self.getMsg('MSG_NO_IMAGE_OR_FOLDER')
												self.executeAction(tenant, lineworks_id, response_content, self.channel_config)
												return
											else:
												response_content = {'list_file': list_file, 'list_comment': list_comment}
												
										elif count > 0:
											list_file, list_comment = self.getFileAndFolder(access_token, node)
											response_content = sorted(response_content, key=lambda k: k['name'])
											if len(list_file) == 0:
												response_content = {'list_folder': response_content}
											else:
												response_content = {'list_file': list_file, 'list_folder': response_content, 'list_comment': list_comment}
												
						else:
							logging.debug('check folder node still exist')
							check_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes',
																						  'read', node=node)
							if 'success' in check_folder and check_folder['success'] is True:
								count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
								if count == 0:
									list_file, list_comment = self.getFileAndFolder(access_token, node)
									if len(list_file) == 0:
										response_content = self.getMsg('MSG_NO_IMAGE_OR_FOLDER')
										self.executeAction(tenant, lineworks_id, response_content, self.channel_config)
										return
									else:
										response_content = {'list_file': list_file, 'list_comment': list_comment}
								elif count > 0:
									list_file, list_comment = self.getFileAndFolder(access_token, node)
									response_content = sorted(response_content, key=lambda k: k['name'])
									if len(list_file) == 0:
										response_content = {'list_folder': response_content}
									else:
										response_content = {'list_file': list_file, 'list_folder': response_content, 'list_comment': list_comment}
							else:
								get_list_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes', 'lists')
								if 'success' in get_list_folder and get_list_folder['success'] is True:
									list_folder = get_list_folder['lists']
									for folder in list_folder:
										if folder['name'] == self.getMsg('CHAT_IMAGE_SAVE'):
											node = folder['node']
											FileUpSettingConfig.setFolderNode(self.CHANNEL_KIND, node)
											
											count, response_content = self.processSubFolder(tenant, rule_id, lineworks_id, node)
											if count == 0:
												list_file, list_comment = self.getFileAndFolder(access_token, node)
												if len(list_file) == 0:
													response_content = self.getMsg('MSG_NO_IMAGE_OR_FOLDER')
													self.executeAction(tenant, lineworks_id, response_content, self.channel_config)
													return
												else:
													response_content = {'list_file': list_file, 'list_comment': list_comment}
														
											elif count > 0:
												list_file, list_comment = self.getFileAndFolder(access_token, node)
												response_content = sorted(response_content, key=lambda k: k['name'])
												if len(list_file) == 0:
													response_content = {'list_folder': response_content}
												else:
													response_content = {'list_file': list_file, 'list_folder': response_content, 'list_comment': list_comment}
													
						self.executeAction(tenant, lineworks_id, response_content, self.channel_config, access_token=access_token, node=node)
						return
					
					elif contents['content']['text'] == self.getMsg('MSG_CHOOSE_FOLDER'):
						if chat_session and resource_id:
							node = FileUpSettingConfig.getFolderNode(self.CHANNEL_KIND)
							get_list_subfolder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes',
																								'lists', node=node)
							if 'success' in get_list_subfolder and get_list_subfolder['success'] is True:
								response_content = get_list_subfolder['lists']
								response_content = sorted(response_content, key=lambda k: k['name'])
					
					elif contents['content']['text'] == self.getMsg('MSG_REGISTER_LOCATION'):
						if chat_session and resource_id:
							chat_session['phase'] = 2
							self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
							response_content = self.getMsg('MSG_ASK_TO_ADD_LOCATION')
							
					elif contents['content']['text'] == self.getMsg('MSG_REGISTER_COMMENT'):
						if chat_session and resource_id:
							chat_session['phase'] = 3
							self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
							response_content = self.getMsg('MSG_ASK_TO_ADD_COMMENT')
							
					elif contents['content']['text'] == self.getMsg('MSG_PERFORM_UPLOAD'):
						if chat_session and resource_id:
							logging.debug('process upload image to direct cloud box')
							if 'node' in chat_session:
								chat_session['phase'] = 4
								self.saveChatSession(tenant, lineworks_id, rule_id, self._language,
													 self._oem_company_code, chat_session)
								self.kickUploadImage(tenant, rule_id, lineworks_id, chat_session,
													 node=chat_session['node'])
								response_content = self.getMsg('MSG_WAIT_FOR_UPLOAD_IMAGE')
							else:
								if 'temp_node' in chat_session:
									self.kickUploadImage(tenant, rule_id, lineworks_id, chat_session,
														 node=chat_session['temp_node'])
									response_content = self.getMsg('MSG_WAIT_FOR_UPLOAD_IMAGE')
								else:
									self.kickUploadImage(tenant, rule_id, lineworks_id, chat_session)
									response_content = self.getMsg('MSG_WAIT_FOR_CREATE_CHAT_SAVE_IMAGE_FOLDER_AND_UPLOAD_IMAGE')
							
					elif contents['content']['text'] == self.getMsg('VMSG_CANCEL'):
						if chat_session and resource_id:
							logging.debug('process cancel upload image')
							response_content = self.getMsg('MSG_CANCEL_UPLOAD')
							self.clearChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
							
							resource_id_memcache_key = 'script=source_id&lineworks_id=' + lineworks_id
							memcache.set(key=resource_id_memcache_key, value='', time=0)
					
					else:
						if chat_session and 'phase' in chat_session and chat_session['phase'] == 3:
							chat_session['comment'] = contents['content']['text']
							del chat_session['phase']
							self.saveChatSession(tenant, lineworks_id, rule_id, self._language, self._oem_company_code, chat_session)
							self.executeAction(tenant, lineworks_id, response_content, self.channel_config, upload=True, rule_id=rule_id)
							return
			
			logging.debug(response_content)
			self.executeAction(tenant, lineworks_id, response_content, self.channel_config, next_data=next_data)
		
		self.contents = contents
		self._status = 'ok'
		self._msg = ''
		return

	# [ACTION]アクションの実処理
	def executeAction(self, tenant, lineworks_id, contents, channel_config, next_data=None, node='', upload=False,
					  access_token='', blob_key=None, rule_id='', file_seq=''):
		
		# チャットボットにメッセージ送信
		logging.info('start to send message to line works chat bot...')
		
		if lineworks_id != '':
			logging.info(contents)
			logging.info(type(contents))
			logging.info(next_data)
			
			# logging.info(payload)
			open_api_id = channel_config.get('open_api_id', '')
			consumer_key = channel_config.get('consumer_key', '')
			server_id = channel_config.get('server_id', '')
			priv_key = channel_config.get('priv_key', '')
			bot_no = UcfUtil.toInt(channel_config.get('bot_no', ''))
			lineworksapiurl = 'message/v1/bot'
			
			if upload:
				logging.debug('process show action to choose')
				actions = []
				chat_session = self.getChatSessionId(tenant, lineworks_id, rule_id, self._language, self._oem_company_code)
				
				if 'node' not in chat_session:
					if 'sub_folder' in chat_session:
						temp_obj = {
							"type": "message",
							"label": self.getMsg('MSG_CHOOSE_FOLDER'),
							"text": self.getMsg('MSG_CHOOSE_FOLDER'),
							"postback": 'phase_1'
						}
						actions.append(temp_obj)
				
				if 'location' not in chat_session:
					temp_obj = {
						"type": "message",
						"label": self.getMsg('MSG_REGISTER_LOCATION'),
						"text": self.getMsg('MSG_REGISTER_LOCATION'),
						"postback": 'phase_2'
					}
					actions.append(temp_obj)
				
				if 'comment' not in chat_session:
					temp_obj = {
						"type": "message",
						"label": self.getMsg('MSG_REGISTER_COMMENT'),
						"text": self.getMsg('MSG_REGISTER_COMMENT'),
						"postback": 'phase_3'
					}
					actions.append(temp_obj)
				
				temp_obj = {
					"type": "message",
					"label": self.getMsg('MSG_PERFORM_UPLOAD'),
					"text": self.getMsg('MSG_PERFORM_UPLOAD'),
					"postback": 'phase_4'
				}
				actions.append(temp_obj)
				
				temp_obj = {
					"type": "message",
					"label": self.getMsg('VMSG_CANCEL'),
					"text": self.getMsg('VMSG_CANCEL'),
					"postback": 'phase_5'
				}
				actions.append(temp_obj)
				
				content_obj = {
					"type": "button_template",
					"contentText": self.getMsg('MSG_SELECT_ACTION'),
					"actions": actions
				}
				
				payload = {
					'accountId': lineworks_id,
					'content': content_obj
				}
				
				result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key, server_id,
														  priv_key, payload, bot_no, 'message/push')
				
				if result.status_code != 200:
					logging.error(result.status_code)
					raise Exception(result.content)
				logging.info(result.content)
				
			elif blob_key:
				image_url = oem_func.getMySiteUrl(self._oem_company_code) + '/a/' + tenant + '/image?key=' + blob_key
				
				comment = ''
				image_datetime = ''
				if file_seq != '':
					file_download = directcloudbox_func.callShareBoxDownloadFileManagementApi(access_token, node=node, file_seq=file_seq)
					logging.debug(file_download)
					try:
						regex1 = '\[' + self.getMsg('COMMENT').encode('utf-8') + '\](.*\n?)'
					except:
						regex1 = '\[' + self.getMsg('COMMENT') + '\](.*\n?)'
					comment_regex = re.findall(regex1, file_download)
					if len(comment_regex) > 0:
						comment = comment_regex[0].strip()
						comment = comment[:30] + '...' if len(comment) > 30 else comment
						
					try:
						regex2 = '\[' + self.getMsg('IMAGE_DATETIME').encode('utf-8') + '\](.*\n?)'
					except:
						regex2 = '\[' + self.getMsg('IMAGE_DATETIME') + '\](.*\n?)'
					image_datetime_regex = re.findall(regex2, file_download)
					if len(image_datetime_regex) > 0:
						image_datetime = image_datetime_regex[0].strip()
				
				text = '[' + self.getMsg('COMMENT') + '] ' + comment + '\n'
				text += '[' + self.getMsg('IMAGE_DATETIME') + '] ' + image_datetime
				
				content_obj = {
					"type": "carousel",
					"columns": [{
						"thumbnailImageUrl": image_url,
						"text": text,
						"actions": [{
							"type": "message",
							"label": self.getMsg('SHOW_DETAIL'),
							"text": self.getMsg('SHOW_DETAIL'),
							"postback": "showdetail_" + node + "_" + file_seq
						}]
					}]
				}
				
				payload = {
					'accountId': lineworks_id,
					'content': content_obj
				}
				
				result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key, server_id,
														  priv_key, payload, bot_no, 'message/push')
				
				if result.status_code != 200:
					logging.error(result.status_code)
					raise Exception(result.content)
				logging.info(result.content)
			
			elif type(contents) in [unicode, str]:
				content_obj = {
					"type": "text",
					"text": contents
				}
				
				payload = {
					'accountId': lineworks_id,
					'content': content_obj
				}
				
				result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key, server_id,
														  priv_key, payload, bot_no, 'message/push')
				
				if result.status_code != 200:
					logging.error(result.status_code)
					raise Exception(result.content)
				logging.info(result.content)
			
			elif type(contents) in [list]:
				start = 0
				if next_data is not None and next_data.split('_')[0] != 'nextfolder':
					pass
				else:
					if next_data is not None:
						start = UcfUtil.toInt(next_data.split('_')[1])
					logging.info(start)
					
					actions = []
					flag = 0
					
					for i in range(start, len(contents)):
						temp_obj = {
							"type": "message",
							"label": contents[i]['name'],
							"text": contents[i]['name'],
							"postback": 'choosefolder_' + contents[i]['node']
						}
						actions.append(temp_obj)
						
						flag += 1
					
						if flag == 5 and len(range(start, len(contents))) > 5:
							break

					if len(range(start, len(contents))) > 5:
						next_obj = {
							"type": "message",
							"label": self.getMsg('MSG_NEXT_DATA'),
							"postback": 'nextfolder_' + str(start + flag)
						}
						actions.append(next_obj)
					
					content_obj = {
						"type": "button_template",
						"contentText": self.getMsg('MSG_SELECT_FOLDER'),
						"actions": actions
					}
					
					payload = {
						'accountId': lineworks_id,
						'content': content_obj
					}
					
					result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key,
															  server_id, priv_key, payload, bot_no,
															  'message/push')
					
					if result.status_code != 200:
						logging.error(result.status_code)
						raise Exception(result.content)
					logging.info(result.content)
			
			elif type(contents) in [dict]:
				list_file = contents['list_file'] if 'list_file' in contents else None
				list_folder = contents['list_folder'] if 'list_folder' in contents else None
				list_comment = contents['list_comment'] if 'list_comment' in contents else None
				
				if list_file:
					start = 0
					if next_data is not None and next_data.split('_')[0] != 'nextimage':
						pass
					else:
						if next_data is not None:
							start = UcfUtil.toInt(next_data.split('_')[2])
						logging.info(start)
						
						elements = []
						flag = 0
						for i in range(start, len(list_file)):
							comment = None
							for comment_file in list_comment:
								if list_file[i]['name'].split('.')[0] == comment_file['name'].split('.')[0]:
									file_download = directcloudbox_func.callShareBoxDownloadFileManagementApi(access_token, node=node,
																							   file_seq=comment_file['file_seq'])
									
									try:
										regex = '\[' + self.getMsg('COMMENT').encode('utf-8') + '\](.*\n?)'
									except:
										regex = '\[' + self.getMsg('COMMENT') + '\](.*\n?)'
										
									logging.debug(regex)
									comment_regex = re.findall(regex, file_download)
									
									if len(comment_regex) > 0:
										comment = comment_regex[0].strip()
									break
							logging.debug(comment)
							
							image_url, key = self.createImageUrl(access_token, node, list_file[i]['file_seq'], tenant)
							
							action = {
								"type": "message",
								"label": self.getMsg('MSG_VIEW_IMAGE'),
								"text": self.getMsg('MSG_VIEW_IMAGE') + ': ' + list_file[i]['name']
							}
							if comment:
								action["postback"] = "image_" + key + "/" + list_file[i]['name']
							else:
								action["postback"] = "image_" + key
								
							temp_obj = {
								"title": list_file[i]['datetime'],
								"image": image_url,
								"action": action
							}
							if comment:
								temp_obj['subtitle'] = comment
							
							elements.append(temp_obj)
							flag += 1
							if flag == 4:
								break
						
						actions = []
						if len(range(start, len(list_file))) > 4:
							actions.append([{
								"type": "message",
								"label": self.getMsg('MSG_NEXT_DATA'),
								"postback": "nextimage_" + node + '_' + str(start + flag)
							}])
						
						content_obj = {
							"type": "list_template",
							"elements": elements,
							"actions": actions
						}
						
						payload = {
							'accountId': lineworks_id,
							'content': content_obj
						}
						
						result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key,
																  server_id, priv_key, payload, bot_no,
																  'message/push')
						
						if result.status_code != 200:
							logging.error(result.status_code)
							raise Exception(result.content)
						logging.info(result.content)
				
				logging.debug(list_folder)
				if list_folder:
					start = 0
					if next_data is not None and next_data.split('_')[0] != 'nextimagefolder':
						pass
					else:
						if next_data is not None:
							start = UcfUtil.toInt(next_data.split('_')[2])
						logging.info(start)
						
						actions = []
						flag = 0
						
						for i in range(start, len(list_folder)):
							temp_obj = {
								"type": "message",
								"label": list_folder[i]['name'],
								"text": list_folder[i]['name'],
								"postback": 'chooseimagefolder_' + list_folder[i]['node']
							}
							actions.append(temp_obj)
							
							flag += 1
							
							if flag == 5 and len(range(start, len(list_folder))) > 5:
								break
						
						if len(range(start, len(list_folder))) > 5:
							next_obj = {
								"type": "message",
								"label": self.getMsg('MSG_NEXT_DATA'),
								"postback": 'nextimagefolder_' + node + '_' + str(start + flag)
							}
							actions.append(next_obj)
						
						content_obj = {
							"type": "button_template",
							"contentText": self.getMsg('MSG_SELECT_FOLDER'),
							"actions": actions
						}
						
						payload = {
							'accountId': lineworks_id,
							'content': content_obj
						}
						
						result = lineworks_func.callLineWorksAPI2(lineworksapiurl, open_api_id, consumer_key,
																  server_id, priv_key, payload, bot_no,
																  'message/push')
						
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
