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
# AI:自然言語を解析するコマンド
# 実際はLUISなどの外部APIをコール
#
#
#
# SET $params/q1 = $q1
# SET $params/q2 = 'パラメータ2'
#
# AI $word
#
#######################################
class AICommand(BaseCommand):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(AICommand, self).__init__(element_list, parent_command, script_row_num, params)

	# 解析
	def _analysis(self):

		if len(self.element_list) < 2:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		# 結果変数
		result_element = self.getElementObj(1)
		# 変数
		if result_element.get('type') == 'literal':
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(1), 'result', result_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
		if not result_element.get('value').startswith('$') and not result_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(1), 'result', result_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# 解析する文章
		word_element = self.getElementObj(2)
		# 定数でも変数でもJSONXPATHでもなければNG
		if not word_element.get('type') == 'literal' and not word_element.get('value').startswith('$') and not word_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(2), 'word', word_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

	# コマンド実行
	def _execute(self):

		
		# 解析する文章
		word = self.getValue(self.getElementObj(2))
		logging.info(word)
		# 解析に使用するエンジン（今はでLUIS固定）
		ai_kind = 'LUIS'

		# Microsoft Azure の Cognitive Services LUIS API
		if ai_kind == 'LUIS':

			# LUISのテストアプリのアプリケーションID
			app_id = 'c4c98f4b-ea66-4f3f-b2dc-7051b355a521'
			url = 'https://eastasia.api.cognitive.microsoft.com/luis/v2.0/apps/%s' % (app_id)
			access_key = '7fa7c20f9cf84f9189cf772627cad03c'			# key2:b3a5d60c5c1d46d1b0bb43cbe2249cbc
			q = word
			payload = {
					'timezoneOffset': 540,			# Asia/Tokyo…9時間＝540分なので分数でUTCからのずれを指定するらしい...
					'verbose': 'true',						# すべてのヒットIntentをResponseに含めるフラグ。らしい...
					#'spellCheck': ??,
					#'staging': ??,
					#'log': ??,
				}
			url = url + '?' + urllib.urlencode(payload)
			logging.info(url)
			headers = {
				'Content-Type': 'application/json',
				'Ocp-Apim-Subscription-Key': access_key,
			}
			urlfetch_method = urlfetch.POST
			# APIコール
			result = urlfetch.fetch(url=url, method=urlfetch.POST, payload=json.JSONEncoder().encode(q), headers=headers)
			logging.info(result.content)
			if result.status_code != 200:
				logging.error(result.status_code)
				raise Exception(self.getMsg('ERR_FAILED_REQUEST_API', (str(result.status_code), url)))
			if result.content is None or result.content == '':
				raise Exception(self.getMsg('ERR_INVALID_FORMAT_API_RESULT'))

			urlfetch_result = None
			try:
				urlfetch_result = json.JSONDecoder().decode(result.content)
			except Exception, e:
				logging.exception(e)
				raise Exception(self.getMsg('ERR_INVALID_FORMAT_API_RESULT'))

			# 将来的に複数のAIを使い分けることを想定して「AI」コマンドのResponseを統一
			ai_response = {}
			# 元文章
			ai_response['sentence'] = urlfetch_result.get('query', '') if urlfetch_result.has_key('query') and urlfetch_result['query'] is not None else ''
			# ヒットしたかどうか
			ai_response['hit'] = urlfetch_result.has_key('topScoringIntent')
			if urlfetch_result.has_key('topScoringIntent'):
				# 一番ヒットしたIntent
				ai_response['topScoringIntent'] = {
						'intent':urlfetch_result.get('topScoringIntent', '{}').get('intent', ''),
						'score':urlfetch_result.get('topScoringIntent', '{}').get('score', 0),
					}
				# 見つかったEntityリスト
				entities = []
				for entity in urlfetch_result.get('entities', []):
					entities.append({
						'category':entity.get('type', ''),
						'entity':entity.get('entity', ''),
						'score':entity.get('score', 0),
					})
				ai_response['entities'] = entities
			logging.info(ai_response)
			# 結果をセット
			result_element = self.getElementObj(1)
			self.setValue(result_element.get('value'), ai_response)

		else:
			raise Exception('invalid ai kind:' + method)



