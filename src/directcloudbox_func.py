#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging
import json
import datetime
import time
import urllib, urllib2
from google.appengine.api import memcache
from google.appengine.api import urlfetch
from ucf.utils.ucfutil import UcfUtil
import sateraito_inc
import sateraito_func
from ucf.utils.models import FileServerSettingConfig


#####################################################
# DIRECT CLOUD BOX コール
#####################################################
def getAccessToken(refreshAccessToken=False):
	
	directcloudbox_config = FileServerSettingConfig.getFileServerConfig('directcloudbox')
	if not directcloudbox_config:
		return 0
	
	directcloudbox_token_memcache_key = ''
	if directcloudbox_config:
		directcloudbox_token_memcache_key = 'script=directcloudbox_token&code=' + directcloudbox_config['code'] + '&id=' + directcloudbox_config['uid']
	
	if not refreshAccessToken:
		access_token = memcache.get(directcloudbox_token_memcache_key)
		if access_token:
			logging.info('retrieve server_token from memcache.')
			return access_token
	
	url = 'https://api.directcloud.jp/openapi/jauth/token'
	logging.info(url)
	payload = {
		'code': directcloudbox_config['code'],
		'id': directcloudbox_config['uid'],
		'password': directcloudbox_config['password'],
		'service': sateraito_inc.DIRECT_CLOUD_BOX_SERVICE,
		'service_key': sateraito_inc.DIRECT_CLOUD_BOX_SERVICE_KEY
	}
	payload_str = urllib.urlencode(payload)
	logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			headers = {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
			result = urlfetch.fetch(url=url, method='POST', payload=payload_str, deadline=10, follow_redirects=True, headers=headers)
			
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of DIRECT CLOUD BOX. status code=' + str(result.status_code))
			
			result_json = json.JSONDecoder().decode(result.content)
			logging.debug(result_json)
			# 結果チェック
			if result_json['success']:
				access_token = result_json.get('access_token', '')
				expires_in = result_json.get('expire_timestamp', 0)
				break  # 成功なのでwhile抜ける
			else:
				return 1
			
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				return 2
			process_cnt += 1
	
	if expires_in != 0:
		memcache_expire_secs = expires_in - time.mktime(UcfUtil.getNow().timetuple()) - sateraito_inc.session_timeout
	else:
		memcache_expire_secs = sateraito_inc.session_timeout - 600
	logging.info('memcache_expire_secs=' + str(memcache_expire_secs))
	if memcache_expire_secs > 0 and directcloudbox_token_memcache_key != '':
		if not memcache.set(key=directcloudbox_token_memcache_key, value=access_token, time=memcache_expire_secs):
			logging.warning("Memcache set failed.")
		else:
			logging.info("Memcache set success.key=" + directcloudbox_token_memcache_key)
	
	return access_token


#####################################################
# DIRECT CLOUD BOX コール
#####################################################
def checkAccessToken(unique_id, code, uid, password, is_saved=False):
	url = 'https://api.directcloud.jp/openapi/jauth/token'
	logging.info(url)
	payload = {
		'code': code,
		'id': uid,
		'password': password,
		'service': sateraito_inc.DIRECT_CLOUD_BOX_SERVICE,
		'service_key': sateraito_inc.DIRECT_CLOUD_BOX_SERVICE_KEY
	}
	payload_str = urllib.urlencode(payload)
	logging.info(payload_str)
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			headers = {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
			result = urlfetch.fetch(url=url, method='POST', payload=payload_str, deadline=10, follow_redirects=True, headers=headers)
			
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of DIRECT CLOUD BOX. status code=' + str(result.status_code))
			
			result_json = json.JSONDecoder().decode(result.content)
			logging.debug(result_json)
			# 結果チェック
			if result_json['success']:
				access_token = result_json.get('access_token', '')
				expires_in = result_json.get('expire_timestamp', 0)
				break  # 成功なのでwhile抜ける
			else:
				return 0
		
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				return 1
			process_cnt += 1
	
	get_list_user = callDirectCloudBoxAdminAPI(access_token, 'users', 'lists')
	if 'success' in get_list_user and get_list_user['success'] is True:
		list_user = get_list_user['lists']
		for user in list_user:
			if user['id'] == uid:
				user_seq = user['user_seq']
				file_server_config = {
					'code': code,
					'uid': uid,
					'password': password,
					'user_seq': user_seq
				}
				FileServerSettingConfig.modifyConfig(unique_id, json.JSONEncoder().encode(file_server_config), 'directcloudbox', is_saved)
				
				logging.debug('save memcache')
				directcloudbox_token_memcache_key = 'script=directcloudbox_token&code=' + code + '&id=' + uid
				if expires_in != 0:
					memcache_expire_secs = expires_in - time.mktime(
						UcfUtil.getNow().timetuple()) - sateraito_inc.session_timeout
				else:
					memcache_expire_secs = sateraito_inc.session_timeout - 600
				logging.info('memcache_expire_secs=' + str(memcache_expire_secs))
				if memcache_expire_secs > 0 and directcloudbox_token_memcache_key != '':
					if not memcache.set(key=directcloudbox_token_memcache_key, value=access_token, time=memcache_expire_secs):
						logging.warning("Memcache set failed.")
					else:
						logging.info("Memcache set success.key=" + directcloudbox_token_memcache_key)
				return access_token
	else:
		return 2


#####################################################
# DIRECT CLOUD BOX コール
#####################################################
def callShareBoxFileManagementApi(access_token, action, node='', version='v1', file_data='', content_type=''):
	url = 'https://api.directcloud.jp/openapp/{0}/files/{1}/{2}'.format(version, action, urllib.quote_plus(node))
	
	logging.info(url)
	
	method = 'GET'
	payload = {}
	if action == 'upload':
		payload_str = file_data
		method = 'POST'
	else:
		payload_str = urllib.urlencode(payload)
	
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			headers = {
				'Content-Type': content_type,
				'access_token': access_token
			}
			result = urlfetch.fetch(url=url, method=method, payload=payload_str, deadline=10, follow_redirects=True, headers=headers)
			
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of DIRECT CLOUD BOX. status code=' + str(result.status_code))
			logging.info(result.content)
			result_json = json.JSONDecoder().decode(result.content)
			logging.debug(result_json)
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				return False
			process_cnt += 1
			
	return result_json


#####################################################
# DIRECT CLOUD BOX ADMIN API コール
#####################################################
def callDirectCloudBoxAdminAPI(access_token, title, action, node='', version='m1', name='', user_seq='', dir_permission_seq=''):
	url = 'https://api.directcloud.jp/openapp/{0}/{1}/{2}/{3}'.format(version, title, action, urllib.quote_plus(node))
	
	logging.info(url)
	
	method = 'GET'
	payload = {}
		
	if action == 'create':
		method = 'POST'
		if title == 'sharedboxes':
			payload['name'] = name
		
		elif title == 'folder_permissions':
			payload['node'] = node
			payload['target_seq'] = user_seq
			payload['target_type'] = 'U'
			payload['permission_name'] = 'owner'
	
	elif action == 'update':
		method = 'POST'
		if title == 'folder_permissions':
			payload['dir_permission_seq'] = dir_permission_seq
			payload['permission_name'] = 'owner'
		
	payload_str = urllib.urlencode(payload)
	
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			headers = {
				'access_token': access_token
			}
			logging.debug(headers)
			
			result = urlfetch.fetch(url=url, method=method, payload=payload_str, deadline=30, follow_redirects=True, headers=headers)
			
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of DIRECT CLOUD BOX. status code=' + str(result.status_code))
			logging.info(result.content)
			result_json = json.JSONDecoder().decode(result.content)
			logging.debug(result_json)
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				return False
			process_cnt += 1
	
	return result_json


#####################################################
# DIRECT CLOUD BOX コール
#####################################################
def callShareBoxDownloadFileManagementApi(access_token, node='', file_seq=''):
	url = 'https://api.directcloud.jp/openapp/v1/files/download/{0}'.format(urllib.quote_plus(node))
	
	logging.info(url)
	
	payload = {
		'file_seq': file_seq,
		'flag_direct': 'Y'
	}
	payload_str = urllib.urlencode(payload)
	
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			headers = {
				'access_token': access_token
			}
			result = urlfetch.fetch(url=url, method='POST', payload=payload_str, deadline=10, follow_redirects=True, headers=headers)
			
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of DIRECT CLOUD BOX. status code=' + str(result.status_code))
			# logging.info(result.content)
			# result_json = json.JSONDecoder().decode(result.content)
			# logging.debug(result_json)
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				return False
			process_cnt += 1
	
	return result.content


def callDirectCloudBoxUserAPI(access_token, title, action, node='', version='v1', file_seq='', page='', keyword=''):
	url = 'https://api.directcloud.jp/openapp/{0}/{1}/{2}/{3}'.format(version, title, action, urllib.quote_plus(node))
	
	logging.info(url)
	logging.info(keyword)
	
	method = 'GET'
	payload = {}
	if title == 'files':
		if action == 'download':
			method = 'POST'
			payload['file_seq'] = file_seq
		if action == 'index':
			method = 'POST'
			payload['limit'] = 50
			payload['offset'] = 50*page
			payload['sort'] = '+datetime'
		if action == 'search':
			method = 'POST'
			payload['keyword'] = keyword
			
	payload_str = urllib.urlencode(payload)
	logging.debug(payload)
	
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			headers = {
				'access_token': access_token
			}
			result = urlfetch.fetch(url=url, method=method, payload=payload_str, deadline=10, follow_redirects=True, headers=headers)
			
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of DIRECT CLOUD BOX. status code=' + str(result.status_code))
			logging.info(result.content)
			result_json = json.JSONDecoder().decode(result.content)
			logging.debug(result_json)
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				return False
			process_cnt += 1
	
	return result_json


def callDCBAdminForUserActionAPI(access_token, title, action, version='m1', user_seq=''):
	url = 'https://api.directcloud.jp/openapp/{0}/{1}/{2}/{3}'.format(version, title, action, user_seq)
	
	logging.info(url)
	
	method = 'GET'
	payload = {}
	
	payload_str = urllib.urlencode(payload)
	logging.debug(payload)
	
	# APIコール
	process_cnt = 0
	MAX_RETRY_CNT = 2
	while True:
		try:
			# アクセストークン（サーバートークン）を取得
			headers = {
				'access_token': access_token
			}
			result = urlfetch.fetch(url=url, method=method, payload=payload_str, deadline=10, follow_redirects=True, headers=headers)
			
			if result.status_code != 200:
				logging.error(result.status_code)
				logging.error(result.content)
				raise Exception('failed api call of DIRECT CLOUD BOX. status code=' + str(result.status_code))
			logging.info(result.content)
			result_json = json.JSONDecoder().decode(result.content)
			logging.debug(result_json)
			
			break  # 成功なのでwhile抜ける
		except BaseException, e:
			if process_cnt <= MAX_RETRY_CNT:
				logging.warning('[process_cnt=' + str(process_cnt) + ']' + ' '.join(e.args))
			else:
				return False
			process_cnt += 1
	
	return result_json

