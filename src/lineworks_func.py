#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging
import json
import datetime
import time
import base64
import urllib, urllib2
from google.appengine.api import memcache
from google.appengine.api import urlfetch
from ucf.utils.ucfutil import UcfUtil
import Crypto.PublicKey.RSA as RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
import sateraito_inc
import sateraito_func
from ucf.utils.models import *


#####################################################
# LINE WORKS API コール
#####################################################
def callLineWorksAPI(apiurlpart, open_api_id, consumer_key, server_id, priv_key, payload, api_version='v2'):
	# APIv2対応
	# lineworksapiurl = 'https://apis.worksmobile.com/%s/%s' % (open_api_id, apiurlpart.lstrip('/'))
	# APIバージョンアップ対応 2018.05.10
	# lineworksapiurl = 'https://apis.worksmobile.com/%s/%s/v2' % (open_api_id, apiurlpart.lstrip('/'))
	lineworksapiurl = 'https://apis.worksmobile.com/%s/%s/%s' % (open_api_id, apiurlpart.lstrip('/'), api_version)
	# プロキシサーバー廃止対応（LINE WORKS API認証をID固定タイプではなくID登録タイプでの認証に対応）2017.05.01
	## チェックキー
	# check_key = UcfUtil.md5(sateraito_inc.LINEWORKSAPI_PROXY_MD5_PREFIX_KEY + datetime.datetime.now().strftime('%Y%m%d%H%M') + sateraito_inc.LINEWORKSAPI_PROXY_MD5_SUFFIX_KEY)
	## プロキシAPIURL
	# url = sateraito_inc.LINEWORKSAPI_PROXY_URL + '?ck=%s&apiurl=%s' % (UcfUtil.urlEncode(check_key), UcfUtil.urlEncode(lineworksapiurl))
	url = lineworksapiurl
	logging.info(url)
	payload_str = json.JSONEncoder().encode(payload)
	logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			
			# アクセストークン（サーバートークン）を取得
			server_token = getServerToken(open_api_id, server_id, priv_key, no_memcache_use=process_cnt > 0)
			
			headers = {
				'consumerKey': consumer_key,
				'Authorization': 'Bearer ' + server_token,
				'Content-Type': 'application/json',
			}
			result = urlfetch.fetch(url=url, method='post', payload=payload_str, deadline=10, follow_redirects=True,
									headers=headers)
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of LINE WORKS API. status code=' + str(result.status_code))
			logging.info(result.content)
			result_json = json.JSONDecoder().decode(result.content)
			# if result_json.get('errorCode', '') != '':
			#	raise Exception('failed api call of LINE WORKS API. errorCode=' + result_json.get('errorCode', '') + ' errorMessage=' + result_json.get('errorMessage', ''))
			if result_json.get('errorCode', '') == '024' and result_json.get('code', '') == 'UNAUTHORIZED':
				raise Exception('failed api call of LINE WORKS API. errorCode=' + result_json.get('errorCode',
																								  '') + ' errorMessage=' + result_json.get(
					'errorMessage', ''))
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				raise e
			process_cnt += 1
	
	return result


#####################################################
# LINE WORKS API：アクセストークン（サーバートークン）を取得
#####################################################
def getServerToken(open_api_id, server_id, priv_key, no_memcache_use=False):
	lineworksapi_server_token_memcache_key = ''
	if open_api_id != '' and server_id != '':
		lineworksapi_server_token_memcache_key = 'script=lineworksapi_server_token&open_api_id=' + open_api_id + '&server_id=' + server_id
	
	logging.info(lineworksapi_server_token_memcache_key)
	
	if not no_memcache_use and lineworksapi_server_token_memcache_key != '':
		server_token = memcache.get(lineworksapi_server_token_memcache_key)
		if server_token is not None:
			logging.info('retrieve server_token from memcache.')
			return server_token
	
	server_token = ''
	expires_in = 0
	
	process_cnt = 0
	MAX_RETRY_CNT = 0
	while True:
		try:
			# １．JWT 生成 - RFC-7519
			jwt_header = {
				'typ': 'JWT',
				'alg': 'RS256',
			}
			
			jwt_payload = {
				'iss': server_id,
				'iat': sateraito_func.datetimeToEpoch(UcfUtil.add_minutes(datetime.datetime.now(), -5)),
				'exp': sateraito_func.datetimeToEpoch(UcfUtil.add_minutes(datetime.datetime.now(), 50)),
				# MAX3600秒の範囲であること
			}
			jwt_header_str = json.JSONEncoder().encode(jwt_header)
			jwt_header_enc = base64.urlsafe_b64encode(jwt_header_str)
			jwt_payload_str = json.JSONEncoder().encode(jwt_payload)
			jwt_payload_enc = base64.urlsafe_b64encode(jwt_payload_str)
			
			# ２．JWT 電子署名(signature) - RFC-7515
			signature_source = str(jwt_header_enc + '.' + jwt_payload_enc)
			
			rsa_private_key = RSA.importKey(priv_key, passphrase='')
			
			logging.info(process_cnt)
			
			signer = PKCS1_v1_5.new(rsa_private_key)
			digest = SHA256.new()
			digest.update(signature_source)
			signature = signer.sign(digest)
			jwt_sig_enc = base64.urlsafe_b64encode(signature)
			logging.info(jwt_sig_enc)
			assertion_jwt = jwt_header_enc + '.' + jwt_payload_enc + '.' + jwt_sig_enc
			logging.info(assertion_jwt)
			
			# ３．LINE WORKS 認証サーバーへの Token リクエスト - RFC-7523
			
			form_fields = {}
			form_fields['grant_type'] = 'urn:ietf:params:oauth:grant-type:jwt-bearer'
			form_fields['assertion'] = assertion_jwt
			form_data = urllib.urlencode(form_fields)
			
			request_url = 'https://authapi.worksmobile.com/b/%s/server/token' % (open_api_id)
			
			deadline = 10
			headers = {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			}
			logging.info('urlfetch:' + request_url)
			result = urlfetch.fetch(url=request_url, method=urlfetch.POST, payload=form_data, follow_redirects=True,
									deadline=deadline, headers=headers)
			if result.status_code != 200:
				raise Exception(
					'failed retrieve access_token of LINE WORKS API. status code=' + str(result.status_code))
			
			# 結果サンプル（成功）
			# {"access_token":"AAAA/arPRL4dqjpKAsg5Vt4r2P/zoP+c2VydmVySWQ+otLu9qTV5IqO0jbXfzaJQ5UZ0EYA22s5sMRySYIKpF0Va8NyW5Vu0okP9dlVqOKiZQczlzVTD0Ull8RI/rlBJN8gWrslOIA1WdOzLyM7byVQSqYL1AY43Ltrc9xqTDDJVMsS/Z8x1drlqeSCBXohIfb+ddk4h/gFPghzRmyG2qPueC4YxWArmCBOpbXH0zVdw/z2bXtgnHr33/XnRnhwx2j9JKx1nNW7JsAK4SIbgqZMxzr9YJ7iWEMJKS0ACsyMBa6Ba7izijUvRG43QZZ4BlSFtaykA7dDcAezaclmCNxRj9G0JszzrKfMK0PEI=","token_type":"Bearer","expires_in":86400}
			# 結果サンプル（失敗）
			# {"message":"invalid param","detail":"jwt exp - iat term should be max 3600 seconds","code":"11"}
			
			response_json = json.JSONDecoder().decode(result.content)
			
			# 結果チェック
			if response_json.get('access_token', '') == '':
				# エラー
				raise Exception('failed retrieve access token of line works api.code=%s message=%s detail=%s' % (
				response_json.get('code', ''), response_json.get('message', ''), response_json.get('detail', '')))
			
			server_token = response_json.get('access_token', '')
			token_type = response_json.get('token_type', '')
			expires_in = response_json.get('expires_in', 0)  # 例：86400 （24時間）
			break  # 成功なのでwhile抜ける
		
		except BaseException, e:
			logging.info(e)
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				# logging.exception(e)
				# pass
				raise e
			process_cnt += 1
	
	# ちょっと余裕をもって10分前に破棄
	memcache_expire_secs = expires_in - 600
	logging.info('memcache_expire_secs=' + str(memcache_expire_secs))
	if memcache_expire_secs > 0 and lineworksapi_server_token_memcache_key != '':
		if not memcache.set(key=lineworksapi_server_token_memcache_key, value=server_token, time=memcache_expire_secs):
			logging.warning("Memcache set failed.")
		else:
			logging.info("Memcache set success.key=" + lineworksapi_server_token_memcache_key)
	
	return server_token


#####################################################
# LINE WORKS API コール　メッセージ送信
#####################################################
def callLineWorksAPI2(apiurlpart, open_api_id, consumer_key, server_id, priv_key, payload, bot_no, api_kind):
	lineworksapiurl = 'https://apis.worksmobile.com/r/%s/%s/%s/%s' % (
	open_api_id, apiurlpart.lstrip('/'), bot_no, api_kind.lstrip('/'))
	url = lineworksapiurl
	logging.info(url)
	payload_str = json.JSONEncoder().encode(payload)
	logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			server_token = getServerToken(open_api_id, server_id, priv_key, no_memcache_use=process_cnt > 0)
			
			headers = {
				'consumerKey': consumer_key,
				'Authorization': 'Bearer ' + server_token,
				'Content-Type': 'application/json; charset=UTF-8',
			}
			
			result = urlfetch.fetch(url=url, method='post', payload=payload_str, deadline=10, follow_redirects=True,
									headers=headers)
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of LINE WORKS API. status code=' + str(result.status_code))
			logging.info(result.content)
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				raise e
			process_cnt += 1
	
	return result


#####################################################
# LINE WORKS API コール　メッセージ送信
#####################################################
def callLineWorksUploadContentAPI(open_api_id, consumer_key, server_id, priv_key):
	lineworksapiurl = 'http://storage.worksmobile.com/openapi/message/upload.api'
	
	img_url = sateraito_inc.my_site_url + "/images/rich_menu.png"
	img_get_result = urlfetch.fetch(url=img_url, method='get', deadline=10, follow_redirects=True)
	img_binary = img_get_result.content
	
	content_type, body = sateraito_func.encode_multipart_formdata([], [('resourceName', 'linewoks_richmenu.png', img_binary)])
	
	url = lineworksapiurl
	logging.info(url)
	# logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			server_token = getServerToken(open_api_id, server_id, priv_key, no_memcache_use=process_cnt > 0)
			
			headers = {
				'consumerKey': consumer_key,
				'authorization': 'Bearer ' + server_token,
				'x-works-apiid': open_api_id,
				'Content-Type': content_type
			}
			
			result = urlfetch.fetch(url=url, method='post', payload=body, deadline=10, follow_redirects=True,
									headers=headers)
			logging.info(result)
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of LINE WORKS API. status code=' + str(result.status_code))
			logging.info(result.content)
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				raise e
			process_cnt += 1
	
	return result.headers['x-works-resource-id']


#####################################################
# LINE WORKS API コール　メッセージ送信
#####################################################
def callLineWorksSetRichMenuAPI(apiurlpart, open_api_id, consumer_key, server_id, priv_key, payload, bot_no, richmenu_id, api_kind):
	lineworksapiurl = "https://apis.worksmobile.com/r/%s/%s/%s/richmenu/%s/%s" % (open_api_id, apiurlpart.lstrip('/'), bot_no, richmenu_id, api_kind)
	
	url = lineworksapiurl
	logging.info(url)
	payload_str = json.JSONEncoder().encode(payload)
	logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			server_token = getServerToken(open_api_id, server_id, priv_key, no_memcache_use=process_cnt > 0)
			
			headers = {
				'consumerKey': consumer_key,
				'Authorization': 'Bearer ' + server_token,
				'Content-Type': 'application/json',
			}
			
			result = urlfetch.fetch(url=url, method='post', payload=payload_str, deadline=10, follow_redirects=True, headers=headers)
			logging.info(result)
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of LINE WORKS API. status code=' + str(result.status_code))
			logging.info(result.content)
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				raise e
			process_cnt += 1


def getExcelTemplate():
	template_list = []
	q = ExcelTemplateFile.query()
	q = q.order(-ExcelTemplateFile.created_date)
	
	for entry in q.iter():
		vo = entry.exchangeVo('Asia/Tokyo')
		# OperatorUtils.editVoForList(self, vo)
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['alias', 'filename', 'display_name']:
				list_vo[k] = v
		template_list.append(list_vo)
	return template_list

def getFileByAlias(alias):
	q = ExcelTemplateFile.query()
	q = q.filter(ExcelTemplateFile.alias == alias)

	file = []

	for entry in q.iter(limit=2000, offset=0):
		vo = entry.exchangeVo('Asia/Tokyo')
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['blob_store', 'filename', 'display_name', 'unique_id', 'alias', 'download_method']:
				list_vo[k] = v
		file = list_vo
	return file

def getFileByUniqueId(unique_id):
	q = ExcelTemplateFile.query()
	q = q.filter(ExcelTemplateFile.unique_id == unique_id)

	file = []

	for entry in q.iter(limit=2000, offset=0):
		vo = entry.exchangeVo('Asia/Tokyo')
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['blob_store', 'filename', 'display_name', 'unique_id', 'alias', 'download_method']:
				list_vo[k] = v
		file = list_vo
	return file

def getFileValueByUniqueId(unique_id):
	q = ExcelTemplateValue.query()
	q = q.filter(ExcelTemplateValue.file_id == unique_id.lower())
	q = q.order(ExcelTemplateValue.created_date)

	fileValue = []

	for entry in q.iter(limit=2000, offset=0):
		vo = entry.exchangeVo('Asia/Tokyo')
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['unique_id', 'default', 'file_id', 'location', 'question', 'require', 'sheet', 'value', 'created_date', 'sheet_name', 'alias']:
				list_vo[k] = v
		fileValue.append(list_vo)
	return fileValue

def getSheetsByUniqueId(unique_id):
	sheets = []
	fileValue = getFileValueByUniqueId(unique_id)
	for item in fileValue:
		if item['sheet_name'] not in sheets:
			sheets.append(item['sheet_name'])
	return sheets

def findQuestionByAlias(alias):
	q = ExcelTemplateValue.query()
	q = q.filter(ExcelTemplateValue.alias == alias)
	
	fileValue = None

	for entry in q.iter(limit=2000, offset=0):
		vo = entry.exchangeVo('Asia/Tokyo')
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['question', 'alias', 'default', 'location', 'require', 'sheet', 'value', 'file_id']:
				list_vo[k] = v
		fileValue = list_vo
	return fileValue

def findQuestionByAliasAndFileId(alias, file_id):
	q = ExcelTemplateValue.query()
	q = q.filter(ExcelTemplateValue.alias == alias)
	q = q.filter(ExcelTemplateValue.file_id == file_id)
	
	fileValue = None

	for entry in q.iter(limit=2000, offset=0):
		vo = entry.exchangeVo('Asia/Tokyo')
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['question', 'alias', 'default', 'location', 'require', 'sheet', 'value', 'file_id']:
				list_vo[k] = v
		fileValue = list_vo
	return fileValue

def getQuestionFromFileByUniqueIdAndSheetName(unique_id, sheet_name):
	q = ExcelTemplateValue.query()
	q = q.filter(ExcelTemplateValue.file_id == unique_id.lower())
	q = q.filter(ExcelTemplateValue.sheet_name == sheet_name)
	q = q.order(ExcelTemplateValue.created_date)

	fileValue = []

	for entry in q.iter(limit=2000, offset=0):
		vo = entry.exchangeVo('Asia/Tokyo')
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['question', 'alias', 'default', 'location', 'require', 'sheet', 'value']:
				list_vo[k] = v
		fileValue.append(list_vo)
	return fileValue

def getAnswerByUniqueId(unique_id):
	q = AnswerUser.query()
	q = q.filter(AnswerUser.unique_id == unique_id)

	fileValue = None

	for entry in q.iter(limit=2000, offset=0):
		vo = entry.exchangeVo('Asia/Tokyo')
		list_vo = {}
		for k,v in vo.iteritems():
			if k in ['excel_blob', 'file_id', 'lineworks_id', 'pdf_blob', 'rule_id', 'value']:
				list_vo[k] = v
		fileValue = list_vo
	return fileValue
#####################################################
# LINE WORKS API コール　Rich Menu作成
#####################################################
def createRichMenu(helper, open_api_id, consumer_key, server_id, priv_key, bot_no):
	richmenu_id = ''
	
	resourceCid = callLineWorksUploadContentAPI(open_api_id, consumer_key, server_id, priv_key)

	payload = {
		"size": {
			"width": 2500,
			"height": 1686
		},
		"name": "FAQ Rich Menu",
		"areas": [
			{
				"bounds": {
					"x": 0,
					"y": 0,
					"width": 1250,
					"height": 1686
				},
				"action": {
					"type": "message",
					"label": helper.getMsg('CHOOSE_TEMPLATE'),
					"text": helper.getMsg('CHOOSE_TEMPLATE')
				}
			},
			{
				"bounds": {
					"x": 1250,
					"y": 843,
					"width": 1250,
					"height": 843
				},
				"action": {
					"type": "message",
					"label": helper.getMsg('VMSG_HELP'),
					"text": helper.getMsg('VMSG_HELP'),
				}
			}
		]
	}
	
	create_richmenu = callLineWorksAPI2("message/v1/bot", open_api_id, consumer_key, server_id, priv_key, payload, bot_no, 'richmenu')
	
	if create_richmenu.status_code != 200:
		logging.error(create_richmenu.status_code)
		raise Exception(create_richmenu.content)
	else:
		create_richmenu_result = json.JSONDecoder().decode(create_richmenu.content)
		richmenu_id = create_richmenu_result["richMenuId"]
		payload = {
			"resourceId": resourceCid
		}
		
		callLineWorksSetRichMenuAPI("message/v1/bot", open_api_id, consumer_key, server_id, priv_key, payload, bot_no, richmenu_id, 'content')
		callLineWorksSetRichMenuAPI("message/v1/bot", open_api_id, consumer_key, server_id, priv_key, payload, bot_no, richmenu_id, 'account/all')
	
	return richmenu_id


#####################################################
# LINE WORKS API コール　ボット登録
#####################################################
def callLineWorksAPIBotAction(apiurlpart, open_api_id, consumer_key, server_id, priv_key, payload, method, bot_no='', api_kind=None):
	
	lineworksapiurl = 'https://apis.worksmobile.com/r/%s/%s/bot' % (open_api_id, apiurlpart.lstrip('/'))
	if api_kind in ['update_bot', 'get_bot']:
		lineworksapiurl = 'https://apis.worksmobile.com/r/%s/%s/bot/%s' % (open_api_id, apiurlpart.lstrip('/'), bot_no)
	
	url = lineworksapiurl
	logging.info(url)
	payload_str = json.JSONEncoder().encode(payload)
	logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			server_token = getServerToken(open_api_id, server_id, priv_key, no_memcache_use=process_cnt > 0)
			
			headers = {
				'consumerKey': consumer_key,
				'Authorization': 'Bearer ' + server_token,
				'Content-Type': 'application/json',
			}
			result = urlfetch.fetch(url=url, method=method, payload=payload_str, deadline=10, follow_redirects=True,
									headers=headers)
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of LINE WORKS API. status code=' + str(result.status_code))
			result_json = json.JSONDecoder().decode(result.content)
			if api_kind != 'update_bot':
				if result_json.get('errorCode', '') == '024' and result_json.get('code', '') == 'UNAUTHORIZED':
					raise Exception('failed api call of LINE WORKS API. errorCode=' + result_json.get('errorCode',
																									  '') + ' errorMessage=' + result_json.get(
						'errorMessage', ''))
			break  # 成功なのでwhile抜ける
		
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				# raise e
				return False
			process_cnt += 1
	
	return result


#####################################################
# LINE WORKS API コール　ドメイン登録
#####################################################
def callLineWorksRegisterDomain(apiurlpart, open_api_id, consumer_key, server_id, priv_key, payload, bot_no, domain,
								method):
	lineworksapiurl = 'https://apis.worksmobile.com/r/%s/%s/bot/%s/domain/%s' % (
	open_api_id, apiurlpart.lstrip('/'), bot_no, domain)
	
	url = lineworksapiurl
	logging.info(url)
	payload_str = json.JSONEncoder().encode(payload)
	logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			server_token = getServerToken(open_api_id, server_id, priv_key, no_memcache_use=process_cnt > 0)
			
			headers = {
				'consumerKey': consumer_key,
				'Authorization': 'Bearer ' + server_token,
				'Content-Type': 'application/json',
			}
			result = urlfetch.fetch(url=url, method=method, payload=payload_str, deadline=10, follow_redirects=True,
									headers=headers)
			if result.status_code != 200:
				logging.info(result.status_code)
				logging.info(result.content)
				result_json = json.JSONDecoder().decode(result.content)
				if result.status_code == 400 and result_json['code'] == 'ALREADY_REGISTERED_BOT':
					break
				raise Exception('failed api call of LINE WORKS API. status code=' + str(result.status_code))
			logging.info(result.content)
		
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				# raise e
				return False
			process_cnt += 1
	
	return result


#####################################################
# LINE WORKS API コール　メッセージ送信
#####################################################
def callLineWorksDownloadContentAPI(open_api_id, consumer_key, server_id, priv_key, resource_id):
	lineworksapiurl = 'http://storage.worksmobile.com/openapi/message/download.api'
	
	url = lineworksapiurl
	logging.info(url)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			server_token = getServerToken(open_api_id, server_id, priv_key, no_memcache_use=process_cnt > 0)
			
			headers = {
				'consumerKey': consumer_key,
				'authorization': 'Bearer ' + server_token,
				'x-works-apiid': open_api_id,
				'x-works-resource-id': resource_id
			}
			
			result = urlfetch.fetch(url=url, method='GET', payload='', deadline=10, follow_redirects=True,
									headers=headers)
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of LINE WORKS API. status code=' + str(result.status_code))
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				raise e
			process_cnt += 1
	return result
