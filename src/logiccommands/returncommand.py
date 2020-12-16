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
from logiccommands.elseifcommand import *

try:
  from basecommandex import BaseCommandEx
except:
  from logiccommands.basecommand import BaseCommandEx


#######################################
# RETURN
#######################################


class ReturnCommand(BaseCommandEx):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(ReturnCommand, self).__init__(element_list, parent_command, script_row_num, params)

	# 解析
	def _analysis(self):
		if len(self.element_list) > 2:
			raise Exception(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'))
		
		# is_exist_return_target_parent = False
		# parent_command = self.getParentCommand()
		# while parent_command is not None:
		# 	if parent_command.isCanReturnCommand():
		# 		is_exist_return_target_parent = True
		# 		return
		# 	parent_command = parent_command.getParentCommand()
		# if not is_exist_return_target_parent:
		# 	raise Exception(self.getMsg('CMDERR_CANNOT_USE_ATTHISPLACE'))

	# コマンド実行
	def _execute(self):
		self.setIsReturn(True)
		parent_command = self.getParentCommand()

		while parent_command is not None:
			if parent_command.isCanReturnCommand():
				# if is a call command
				index = 1
				# name = 'result'
				if self._check_exist_element(index):
					return_result = self._get_element_value(index)
					self.setReturnResult(return_result)
					logging.debug('RETURN {}'.format(return_result))
				else:
					self.setReturnResult(None)
				return

			else:
				parent_command.setIsReturn(True)
				parent_command = parent_command.getParentCommand()

