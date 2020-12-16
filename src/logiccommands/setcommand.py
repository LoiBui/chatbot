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
# 変数やJSONに値を代入するコマンド
# 
# SET $content = /content				# ビジネスデータ（JSON）の「/content」の内容を変数「$content」に代入
#
# SET /content = $content				# 変数「$content」の内容をビジネスデータ（JSON）の「/content」に代入
#
# SET /content = 'Hello'				# 文字列「Hello」をビジネスデータ（JSON）の「/content」に代入
#
# SET /content = 'Hello' + 'World'				# 文字列「Hello」と「World」をつなげた文字列をビジネスデータ（JSON）の「/content」に代入
#
# SET $new_digit = 3 + /digit + $old_digit				# 変数「$new_digit」に3 と「/digit」の内容と変数「$old_digit」の内容を足した値を代入（数字以外なら文字として足す）
#
# ※括弧対応無し
#
#
#######################################
class SetCommand(BaseCommand):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(SetCommand, self).__init__(element_list, parent_command, script_row_num, params)


	# 解析
	def _analysis(self):

		if len(self.element_list) < 4:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		# 変数
		target_element = self.getElementObj(1)
		if target_element.get('type') == 'literal':
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(1), 'target', target_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
		# 演算子
		valid_operators = ['=']
		ope_element = self.getElementObj(2)
		if ope_element.get('type') == 'literal' or ope_element.get('value', '') not in valid_operators:
			raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(2), 'operator', ope_element.get('value'), ','.join(valid_operators))))

		# 値
		valid_operators = ['+', '-', '/', '*']
		for index in range(3, len(self.element_list)):
			command_element = self.element_list[index]
			# 偶数の場合は演算子チェック
			if index % 2 == 0:
				if command_element.get('type') == 'literal' or command_element.get('value', '') not in valid_operators:
					raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(index), 'operator', command_element.get('value'), ','.join(valid_operators))))
		else:
			# 偶数（演算子）で終わるのは変なので
			if index % 2 == 0:
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(index), command_element.get('value'))))


	# コマンド実行
	def _execute(self):
		
		# 代入するデータを作成
		value = self._getValueForCalc(self.element_list[3], without_check_instance=True)

		## 改めて四則演算に対応できる型かのチェック
		#if not isinstance(value, (str, unicode, float, int, long, bool)):
		#	raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(3), 'value', 'str, unicode, float, int, long, bool')))

		# 4マス目以降がある場合
		for index in range(4, len(self.element_list) - 1, 2):
			value1 = value
			ope = self.element_list[index].get('value', '')
			value2 = self._getValueForCalc(self.element_list[index + 1])
			# 加算
			if ope == '+':
				# どちらも数値型なら数値型として計算
				if isinstance(value1, (int, float, long)) and isinstance(value2, (int, float, long)):
					value = value1 + value2
				# どちらかが数値型以外なら文字列として計算
				else:
					if not isinstance(value1, (str, unicode)):
						value1 = str(value1)
					if not isinstance(value2, (str, unicode)):
						value2 = str(value2)
					value = value1 + value2

			# 減算
			elif ope == '-':
				# どちらも数値型なら数値型として計算
				if isinstance(value1, (int, float, long)) and isinstance(value2, (int, float, long)):
					value = value1 - value2
				# どちらかが数値型以外ならエラー
				else:
					raise Exception('unsupported operand type(s) for %s: \'%s\' and \'%s\'' % (ope, type(value1), type(value2)))

			# 乗算
			elif ope == '*':
				# どちらも数値型なら数値型として計算
				if isinstance(value1, (int, float, long)) and isinstance(value2, (int, float, long)):
					value = value1 * value2
				# どちらかが数値型以外ならエラー
				else:
					raise Exception('unsupported operand type(s) for %s: \'%s\' and \'%s\'' % (ope, type(value1), type(value2)))

			# 除算
			elif ope == '/':
				# どちらも数値型なら数値型として計算
				if isinstance(value1, (int, float, long)) and isinstance(value2, (int, float, long)):
					value = value1 / value2
				# どちらかが数値型以外ならエラー
				else:
					raise Exception('unsupported operand type(s) for %s: \'%s\' and \'%s\'' % (ope, type(value1), type(value2)))


		# 代入先
		target_element = self.getElementObj(1)

		# 演算子
		ope_element = self.getElementObj(2)

		# 代入
		self.setValue(target_element.get('value', ''), value)



	# 四則演算用の値を取得
	def _getValueForCalc(self, element, without_check_instance=False):
		value = self.getValue(element)
		if value is None:
			raise Exception('no exist value.')
		#if isinstance(value, list):
		#	# リストでも1マスの場合は1マス目を値として使用
		#	if len(value) != 1:
		#		raise Exception('invalid value.')
		#	value = value[0]
		# 改めて四則演算に対応できる型かのチェック
		if not without_check_instance and not isinstance(value, (str, unicode, float, int, long, bool)):
			logging.warning(value)
			raise Exception('invalid value. excepted str, unicode, float, int, long, bool... got %s.' % (str(type(value))))

		return value
