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
# EXIT
#######################################


class ExitCommand(BaseCommandEx):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(ExitCommand, self).__init__(element_list, parent_command, script_row_num, params)

	# 解析
	def _analysis(self):
		if len(self.element_list) > 1:
			raise Exception(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'))

	# コマンド実行
	def _execute(self):
		self.setIsTerminated(True)
		logging.debug('START TERMINATED')
		parent_command = self.getParentCommand()
		while parent_command is not None:
			parent_command.setIsTerminated(True)
			# parent_command_name = parent_command.get_command_name()
			# logging.debug('SET {} TERMINATED'.format(parent_command_name))
			parent_command = parent_command.getParentCommand()
		logging.debug('END TERMINATED')
