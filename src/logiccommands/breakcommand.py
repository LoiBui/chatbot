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
from logiccommands.ifcommand import *

#######################################
# コマンド：Break
#
# FORループなどを抜ける
#
#######################################
class BreakCommand(BaseCommand):

	def __init__(self, element_list, parent_command, script_row_num, params):
		super(BreakCommand, self).__init__(element_list, parent_command, script_row_num, params)


	# 解析
	def _analysis(self):

		if len(self.element_list) > 1:
			raise Exception(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'))

		# Break対象のコマンドの子、孫の場所にいるかをチェック
		is_exist_break_target_parent = False
		parent_command = self.getParentCommand()
		while parent_command is not None:
			if parent_command.isCanBreakCommand():
				is_exist_break_target_parent = True
				break
			parent_command = parent_command.getParentCommand()
		if not is_exist_break_target_parent:
			raise Exception(self.getMsg('CMDERR_CANNOT_USE_ATTHISPLACE'))

	# 実行
	def _execute(self):

		# まず、このコマンド自体に一応Breakフラグをセット
		self.setIsBreak(True)
		# Break対象のコマンドまでさかのぼってBreakフラグを立てる
		parent_command = self.getParentCommand()
		while parent_command is not None:
			parent_command.setIsBreak(True)
			if parent_command.isCanBreakCommand():
				break
			parent_command = parent_command.getParentCommand()

