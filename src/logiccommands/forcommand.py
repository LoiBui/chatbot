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
# FOR:繰り返しコマンド
# 
#
#  FOR $item IN /users:				# リストを表すJSONXPATH
#　　　　・
#　　　　・
#
#  FOR $item IN $datalist:		# リストを含む変数
#　　　　・
#　　　　・
#
#  ENDFOR ※なくてもOK
#
#######################################
class ForCommand(BaseCommand):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(ForCommand, self).__init__(element_list, parent_command, script_row_num, params)

	# Break可能コマンドかどうか
	def isCanBreakCommand(self):
		return True

	# 解析
	def _analysis(self):

		if len(self.element_list) < 4:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		# 変数
		item_element = self.getElementObj(1)
		if item_element.get('type') == 'literal':
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(1), 'item', item_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE')]))))
		if not item_element.get('value').startswith('$'):
			raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(1), 'item', item_element.get('value'), ','.join([self.getMsg('VARIABLE')]))))

		# 演算子
		valid_operators = ['IN']
		ope_element = self.getElementObj(2)
		if ope_element.get('type') == 'literal' or ope_element.get('value', '').upper() not in valid_operators:
			raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(2), 'operator', ope_element.get('value'), ','.join(valid_operators))))

	# コマンド実行
	def _execute(self):

		# ループで使用する変数（ここで定義）
		item_element = self.getElementObj(1)
		item_var = item_element.get('value')			# $item みたいな変数名
		# 演算子
		ope = self.getValue(self.getElementObj(2))
		# ループするリスト
		items = self.getValue(self.getElementObj(3))

		if items is not None:

			if not isinstance(items, list):
				raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(3), 'loop items', ','.join([self.getMsg('LIST')]))))

			for item in items:
				if self.isBreak():
					break
				if self.isReturn():
					break

				# break soon to make sure correct value in vars[item_var] when for loop break

				self.vars[item_var] = item
				# サブコマンドリストを実施
				self.executeSubCommandList()

