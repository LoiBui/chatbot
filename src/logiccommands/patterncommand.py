#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging
import json
import datetime
import re
import sateraito_inc
import sateraito_func
from ucf.utils.ucfutil import *
from logiccommands.basecommand import *

#######################################
# PATTERN:正規表現コマンド
#  正規表現で文字列を抽出
#
#
# PATTERN	URL $pattern_result /content
# PATTERN	EMAIL $pattern_result /content
# PATTERN	'([^\s　。、]+)[\s　]*(?=様|さま|さん)' $pattern_result /content
#
#
#
#######################################
class PatternCommand(BaseCommand):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(PatternCommand, self).__init__(element_list, parent_command, script_row_num, params)

	# 解析
	def _analysis(self):

		if len(self.element_list) < 4:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		# パターン
		pattern_element = self.getElementObj(1)

		# 結果をセットする変数
		target_element = self.getElementObj(2)
		if target_element.get('type') == 'literal':
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(2), 'result', target_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
		if not target_element.get('value').startswith('$') and not target_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(2), 'result', target_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# 検索する文字列
		value_element = self.getElementObj(3)
		# 定数でも変数でもJSONXPATHでもなければNG
		if not value_element.get('type') == 'literal' and not value_element.get('value').startswith('$') and not value_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(3), 'search_contents', value_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# オプション：最大何個結果を取得するか（1以外の場合は、リストで返す. 未指定の場合もリスト）
		max_result_cnt_element = self.getElementObj(4)
		if max_result_cnt_element is not None:
			pass

	# コマンド実行
	def _execute(self):

		# パターン
		pattern_element = self.getElementObj(1)
		# 正規表現文字列
		pattern = ''
		# 定数の場合そのまま使用
		if pattern_element.get('type') == 'literal':
			pattern = pattern_element.get('value')

 		# 変数、JSONパスの場合
		elif pattern_element.get('value').startswith('$') or pattern_element.get('value').startswith('/'):
			pattern = self.getValue(pattern_element.get('value'))

 		# パターン指定子の場合、正規表現を作成
		# URLを抽出
		elif pattern_element.get('value') == 'URL':
			pattern = r"(https?://[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)"
		# EMAILパターン
		elif pattern_element.get('value') == 'EMAIL':
			pattern = r"([!-Z^-~]+@[!-Z^-~]+\.[!-Z^-~]+)"
		else:
			raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(1), 'pattern', pattern_element.get('value'), 'URL,EMAIL')))

		if pattern == '':
			raise Exception(self.getMsg('CMDERR_INVALID_PATTERN_FORMAT', (str(1), pattern)))

		logging.info('pattern=' + pattern)

		# 検索コンテンツ
		logging.info(self.getElementObj(3).get('value'))
		search_target = self.getValue(self.getElementObj(3))

		logging.info(search_target)

		# goku edit
		try:
			pattern_uni = pattern
			if not isinstance(pattern, unicode) and isinstance(pattern, basestring):
				pattern_uni = unicode(pattern, 'utf-8')
			search_target_uni = search_target
			if not isinstance(search_target, unicode) and isinstance(search_target, basestring):
				search_target_uni = unicode(search_target, 'utf-8')
			search_result = re.findall(pattern_uni, search_target_uni, re.UNICODE)
		except:
			# 検索
			search_result = re.findall(pattern, search_target)

		logging.info(search_result)

		# オプション最大何個結果を返すか（1の場合のみ配列ではなく文字列で返す）
		max_result_cnt = 0
		max_result_cnt_element = self.getElementObj(4)
		logging.info(max_result_cnt_element)
		if max_result_cnt_element is not None:
			max_result_cnt = self.getValue(max_result_cnt_element)
			if not isinstance(max_result_cnt, (int, long, float)):
				max_result_cnt = 0
			else:
				max_result_cnt = int(max_result_cnt)

		if max_result_cnt == 1:
			search_result = search_result[0] if len(search_result) >= 1 else ''
		elif max_result_cnt > 0:
			search_result = search_result[0:max_result_cnt]

		# 結果をセット
		target_element = self.getElementObj(2)
		self.setValue(target_element.get('value'), search_result)


