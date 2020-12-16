#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging
import json
import datetime
import re
import urllib
import sateraito_inc
import sateraito_func
from ucf.utils.ucfutil import *
from google.appengine.api import urlfetch
from logiccommands.basecommand import *

#######################################
# REST:RESTで外部APIをコールするコマンド
#
#
#
# SET $params/q1 = $q1
# SET $params/q2 = 'パラメータ2'
#
# REST GET 'https://xxxxxx.com/api/xxx' $result $params
#
# REST POST 'https://xxxxxx.com/api/xxx' $result $params
#
# REST JSON 'https://xxxxxx.com/api/xxx' $result $params $headers
#
#
#######################################
class RestCommand(BaseCommand):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(RestCommand, self).__init__(element_list, parent_command, script_row_num, params)

	# 解析
	def _analysis(self):

		if len(self.element_list) < 4:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		# メソッド
		method_element = self.getElementObj(1)
		valid_methods = ['GET', 'POST', 'JSON']
		if method_element.get('type') == 'literal' or method_element.get('value').upper() not in valid_methods:
			raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(1), 'method', method_element.get('value'), ','.join(valid_methods))))


		# URL
		url_element = self.getElementObj(2)
		# 定数でも変数でもJSONXPATHでもなければNG
		if not url_element.get('type') == 'literal' and not url_element.get('value').startswith('$') and not url_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(2), 'url', url_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# 結果変数
		result_element = self.getElementObj(3)
		# 変数
		if result_element.get('type') == 'literal':
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(3), 'result', result_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
		if not result_element.get('value').startswith('$') and not result_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(3), 'result', result_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# オプション：パラメータ（クエリーやPOSTデータ）
		param_element = self.getElementObj(4)
		if param_element is not None:
			# 変数でもJSONXPATHでもなければNG
			if param_element.get('type') == 'literal':
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(4), 'payload', param_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
			if not param_element.get('value').startswith('$') and not param_element.get('value').startswith('/'):
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(4), 'payload', param_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# オプション：ヘッダー
		header_element = self.getElementObj(5)
		if header_element is not None:
			# 変数でもJSONXPATHでもなければNG
			if header_element.get('type') == 'literal':
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(5), 'headers', header_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
			if not header_element.get('value').startswith('$') and not header_element.get('value').startswith('/'):
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(5), 'headers', header_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))



	# コマンド実行
	def _execute(self):

		
		# メソッド
		method = UcfUtil.nvl(self.getValue(self.getElementObj(1))).upper()

		# URL
		url = self.getValue(self.getElementObj(2))
		if url == '' or not (url.lower().startswith('http://') or url.lower().startswith('https://')):
			raise Exception(self.getMsg('CMDERR_INVALID_URL_FORMAT', (str(2), 'url', url)))

		# パラメータ生成
		params = self.getValue(self.getElementObj(4))
		if params is not None and not isinstance(params, dict):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(4), 'payload', ','.join([self.getMsg('DICT')]))))

		# ヘッダー
		headers = self.getValue(self.getElementObj(5))
		if headers is not None and not isinstance(headers, dict):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(5), 'headers', ','.join([self.getMsg('DICT')]))))

		if headers is None:
			headers = {}
		payload = None
		urlfetch_method = ''

		# GETの場合、クエリーパラメータ
		if method == 'GET':
			if params is not None:
				for k, v in params.iteritems():
					if isinstance(v, (str, unicode, int, float, long)):
						url = UcfUtil.appendQueryString(url, k, v)
			urlfetch_method = urlfetch.GET
		# POST(key0value型）の場合、POSTパラメータとして「valid_params」をそのまま使う
		elif method == 'POST':
			#valid_params = {}
			if params is not None:
				#for k, v in params.iteritems():
				#	if isinstance(v, unicode):
				#		valid_params[k] = v.encode('utf-8')
				#	elif isinstance(v, (str, int, float, long)):
				#		valid_params[k] = v
				payload = urllib.urlencode(dict([k, v.encode('utf-8') if isinstance(v, unicode) else v] for k, v in params.items() if isinstance(v, (str, unicode, int, float, long, bool))))
			urlfetch_method = urlfetch.POST

		# JSONの場合、BodyにJSONをセット
		elif method == 'JSON':
			if params is None:
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(4), 'payload')))

			payload = json.JSONEncoder().encode(params)
			urlfetch_method = urlfetch.POST
			headers['Content-Type'] = 'application/json'

		# APIコール
		result = urlfetch.fetch(url=url, method=urlfetch_method, payload=payload, deadline=5, headers=headers, follow_redirects=True)
		logging.info(result.content)
		if result.status_code != 200:
			logging.error(result.status_code)
			raise Exception(self.getMsg('ERR_FAILED_REQUEST_API', (str(result.status_code), url)))
		urlfetch_result = None
		if result.content is not None and result.content != '':
			try:
				urlfetch_result = json.JSONDecoder().decode(result.content)
			except Exception, e:
				logging.exception(e)
				raise Exception(self.getMsg('ERR_INVALID_FORMAT_API_RESULT'))

		# 結果をセット
		result_element = self.getElementObj(3)
		self.setValue(result_element.get('value'), urlfetch_result)


