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
# 日時を指定形式（例：%Y-%m-%d %H:%M、%Y-%m-%d）文字列で返すコマンド
# 
# NOW /today '%Y-%m-%d %H:%M' 'Asia/Tokyo'
# NOW $now $format $timezone
#
#
#######################################
class NowCommand(BaseCommand):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(NowCommand, self).__init__(element_list, parent_command, script_row_num, params)


	# 解析
	def _analysis(self):

		if len(self.element_list) < 3:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		# 結果変数
		result_element = self.getElementObj(1)
		# 変数
		if result_element.get('type') == 'literal':
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(3), 'result', result_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
		if not result_element.get('value').startswith('$') and not result_element.get('value').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(3), 'result', result_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# 出力形式
		format_element = self.getElementObj(2)
		# 定数でも変数でもJSONXPATHでもなければNG
		if not format_element.get('type') == 'literal' and not format_element.get('format').startswith('$') and not format_element.get('format').startswith('/'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(2), 'format', format_element.get('format'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

		# タイムゾーン（オプション）…デフォルトは「Asia/Tokyo」かな
		timezone_element = self.getElementObj(3)
		if timezone_element is not None:
			# 定数でも変数でもJSONXPATHでもなければNG
			if not timezone_element.get('type') == 'literal' and not timezone_element.get('timezone').startswith('$') and not timezone_element.get('timezone').startswith('/'):
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(3), 'timezone', timezone_element.get('timezone'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))


	# コマンド実行
	def _execute(self):

		# 出力形式
		format = self.getValue(self.element_list[2])

		# タイムゾーン
		timezone = self.getValue(self.element_list[3]) if len(self.element_list) > 3 else ''
		timezone = sateraito_func.getActiveTimeZone(timezone, default_timezone=sateraito_inc.DEFAULT_TIMEZONE)
		
		# 現在のタイムスタンプを取得
		now_local = UcfUtil.getNowLocalTime(timezone)

		# 指定フォーマットの文字列に変換
		result = ''
		try:
			result = now_local.strftime(format)
		except BaseException, e:
			logging.exception(e)
			raise Exception(self.getMsg('INVALID_DATETIME_FORMAT', (format)))

		# 結果をセット
		result_element = self.getElementObj(1)
		self.setValue(result_element.get('value'), result)

