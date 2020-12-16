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
from logiccommands.elseifcommand import *
from logiccommands.elsecommand import *

#######################################
# コマンド：EndIf文…なくてもいいが...
#######################################
class EndIfCommand(BaseCommand):

	def __init__(self, element_list, parent_command, script_row_num, params):
		super(EndIfCommand, self).__init__(element_list, parent_command, script_row_num, params)


	# 特定コマンドの次じゃないと使えないコマンドの場合、前のコマンドを指定
	def getPreCommandsDef(self):
		return [IfCommand, ElseIfCommand, ElseCommand]

	# 前のコマンドが未処理の場合のみ実行するコマンド
	def isOnlyExecuteWhenNoExecutePreCommand(self):
		return True

	# 解析
	def _analysis(self):
		if len(self.element_list) > 1:
			raise Exception(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'))

	# コマンド実行
	def _execute(self):
		pass
