#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging
import json
import datetime
import sateraito_inc
import sateraito_func
from ucf.utils.ucfutil import *

from logiccommands.basecommand import *

#######################################
# SHA、MD5などのハッシュ値を作成するコマンド
# 
# HASH SHA1 $hash /text
# HASH SHA224 $hash $text
# HASH SHA256 /hash /text
# HASH SHA384 $hash 'source string'
# HASH SHA512 $hash /text
#
#
#######################################
class HashCommand(BaseCommand):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(HashCommand, self).__init__(element_list, parent_command, script_row_num, params)


	# 解析
	def _analysis(self):

		if len(self.element_list) < 4:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		# ハッシュ種別
		kind_element = self.getElementObj(1)
		valid_kinds = ['MD5', 'SHA1', 'SHA224', 'SHA256', 'SHA384', 'SHA512']
		if kind_element.get('type') == 'literal' or kind_element.get('value').upper() not in valid_kinds:
			raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(1), 'kind', kind_element.get('value'), ','.join(valid_kinds))))

		# 結果変数
		result_element = self.getElementObj(2)
		# 変数
		if result_element.get('type') == 'literal':
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(2), 'result', result_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
		if not result_element.get('value').startswith('$') and not result_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(2), 'result', result_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# 対象文字列
		value_element = self.getElementObj(3)
		# 定数でも変数でもJSONXPATHでもなければNG
		if not value_element.get('type') == 'literal' and not value_element.get('value').startswith('$') and not value_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(3), 'value', value_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))


	# コマンド実行
	def _execute(self):

		# ハッシュ種別
		kind = UcfUtil.nvl(self.getValue(self.getElementObj(1))).upper()
		
		# ハッシュ値の元文字列
		value = self.getValue(self.element_list[3])

		result = ''
		if kind == 'MD5':
			result = UcfUtil.md5(value)
		elif kind == 'SHA1':
			result = UcfUtil.sha1(value)
		elif kind == 'SHA224':
			result = UcfUtil.sha224(value)
		elif kind == 'SHA256':
			result = UcfUtil.sha256(value)
		elif kind == 'SHA384':
			result = UcfUtil.sha384(value)
		elif kind == 'SHA512':
			result = UcfUtil.sha512(value)

		# 結果をセット
		result_element = self.getElementObj(2)
		self.setValue(result_element.get('value'), result)

