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

try:
  from basecommandex import BaseCommandEx
except:
  from logiccommands.basecommand import BaseCommandEx


#######################################
#
#######################################


class DefCommand(BaseCommandEx):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(DefCommand, self).__init__(element_list, parent_command, script_row_num, params)

	def isCanReturnCommand(self):
		return True

	# 解析
	def _analysis(self):
		self._assert_len_elements(num_min=2)

		index = 1
		name = 'function'

		parameter_elements = self.element_list[2:]
		# logging.warning('parameter_elements')
		# logging.warning(parameter_elements)
		num_parameter_elements = len(parameter_elements)
		for i in range(num_parameter_elements):
			self._assert_kind_element(i + 2, 'function parameter {}'.format(i + 1), ['VARIABLE'])

	# コマンド実行
	def _execute(self):
		index = 1
		name = 'function'
		element = self.getElementObj(index)
		value = self.getValue(element)
		self._assert_value_element_not_none(index, name)
		if not value:
			self._raise_exception_invalid_element(index, name)
		function = value
		# logging.debug(function)

		parameter_elements = self.element_list[2:]
		# logging.warning('parameter_elements')
		# logging.warning(parameter_elements)
		num_parameter_elements = len(parameter_elements)

		# make sure sub list commands have no connection with the def command to instance new sub list commands for call command
		for command in self.sub_command_list:
			command.setParentCommand(None)

		self.setProto(function, self)

	def get_parameter_elements(self):
		parameter_elements = self.element_list[2:]
		return parameter_elements




