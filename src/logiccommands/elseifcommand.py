#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging
import json
#import webapp2
import datetime
#from google.appengine.ext import db
#from google.appengine.ext import ndb
#from google.appengine.api import memcache
#from google.appengine.api import taskqueue
import sateraito_inc
import sateraito_func
#import sateraito_db
from ucf.utils.ucfutil import *
from logiccommands.basecommand import *
from logiccommands.ifcommand import *

#######################################
# コマンド：ElseIf文
#######################################
#class ElseIfCommand(BaseCommand):
class ElseIfCommand(IfCommand):

	def __init__(self, element_list, parent_command, script_row_num, params):
		super(ElseIfCommand, self).__init__(element_list, parent_command, script_row_num, params)


	# 特定コマンドの次じ		ゃないと使えないコマンドの場合、前のコマンドを指定
	def getPreCommandsDef(self):
		return [IfCommand]

	# 前のコマンドが未処理の場合のみ実行するコマンド
	def isOnlyExecuteWhenNoExecutePreCommand(self):
		return True

