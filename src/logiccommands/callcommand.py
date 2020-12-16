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

import copy

#######################################
#
# CALL function $result
# CALL function $result $parameter1
# CALL function $result $parameter1 $parameter2
# CALL function $result $parameter1 $parameter2 $parameter3
#
#######################################


class CallCommand(BaseCommandEx):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(CallCommand, self).__init__(element_list, parent_command, script_row_num, params)

	def isCanReturnCommand(self):
		return True

	# 解析
	def _analysis(self):
		self._assert_len_elements(num_min=2)

		logic_elements = self.element_list[1:]

		index = 1
		name = 'function'

		index = 2
		name = 'result'
		if self._check_exist_element(index):
			self._assert_kind_element(index, name, ('VARIABLE', 'JSONXPATH'), exclude=('CONSTANT'))

		parameter_elements = self.element_list[3:]
		# logging.warning('parameter_elements')
		# logging.warning(parameter_elements)
		num_parameter_elements = len(parameter_elements)


	# コマンド実行
	def _execute(self):
		logging.debug(self.get_command_string())

		index = 1
		name = 'function'
		element = self.getElementObj(index)
		value = self.getValue(element)
		self._assert_value_element_not_none(index, name)
		if not value:
			self._raise_exception_invalid_element(index, name)
		function = value
		# logging.debug(function)

		call_parameter_elements = self.element_list[3:]
		# logging.warning('call_parameter_elements')
		# logging.warning(call_parameter_elements)
		num_call_parameter_elements = len(call_parameter_elements)

		defcommand = self.getProto(function)
		if not defcommand:
			self._raise_exception_invalid_element(index, name)
		# # make sure sub list commands have no connection with the def command
		# for command in defcommand.sub_command_list:
		# 	command.setParentCommand(None)

		# fast but only allow call function 1 time
		# sub_command_list = defcommand.sub_command_list

		# slow but allow function call function, function call itself many times
		sub_command_list = copy.deepcopy(defcommand.sub_command_list)

		# allow function call many time but not allow function call itself
		# sub_command_list = map(copy.copy, defcommand.sub_command_list)

		# logging.warning(self.sub_command_list)
		# logging.warning(self.parent_command)

		# callcommand = copy.copy(self)

		for command in sub_command_list:
			command.setParentCommand(self)
		self.sub_command_list = sub_command_list

		# setup stack vars

		# need modify environment to reflect function scope
		vars = self.vars
		# global scope and current function scope all vars name that already exists
		# function scope can exist and can change it value
		exist_vars = vars.keys()

		def_parameters = []
		# shadow variables: in programming, function scope that have express similar to a var in another scope before current function scope
		# in normal case, function scope will not have access to the that shadow variables but local variables
		shadow_vars = {}
		def_parameter_elements = defcommand.get_parameter_elements()
		num_def_parameter_elements = len(def_parameter_elements)
		for i in range(num_def_parameter_elements):
			parameter_index = i + 2
			parameter_express = defcommand._get_element_express(parameter_index)
			if parameter_express in exist_vars:
				shadow_vars[parameter_express] = vars[parameter_express]
			def_parameters.append(parameter_express)

		parameter_vars = {}
		call_parameters = []
		for i in range(num_def_parameter_elements):
			def_parameter_index = i + 2
			call_parameter_index = i + 3
			parameter_express = defcommand._get_element_express(def_parameter_index)
			parameter_value = self._get_element_value(call_parameter_index)
			parameter_vars[parameter_express] = parameter_value
			call_parameters.append(parameter_express)

		vars.update(parameter_vars)

		data = {
			'exist_vars': exist_vars,
			'shadow_vars': shadow_vars,
			'parameter_vars': parameter_vars
		}
		# logging.debug(data)

		# self.vars = vars
		self.pushStackVars(data)

		self.executeSubCommandList()

		# restore stack vars

		data = self.popStackVars()
		# logging.debug(data)

		old_exist_vars = data['exist_vars']
		new_exist_vars = vars.keys()
		# logging.warning(new_exist_vars)
		not_del_vars = []
		not_del_vars.extend(old_exist_vars)
		if '__PROTO__' not in not_del_vars:
			not_del_vars.append('__PROTO__')
		if '__STACK__' not in not_del_vars:
			not_del_vars.append('__STACK__')
		# if self._check_exist_element(2):
		# 	not_del_vars.append(self.getElementObj(2).get('value'))
		for var_key in new_exist_vars:
			if var_key not in not_del_vars:
				# del vars[var_key]
				vars.pop(var_key, None)

		old_shadow_vars = data['shadow_vars']
		vars.update(old_shadow_vars)

		index = 2
		# name = 'result'
		if self._check_exist_element(index):
			element_result = self.getElementObj(index)
			# return_result = self.getReturnResult()
			return_result = data.get('result')
			self.setValue(element_result.get('value'), return_result)

			logging.debug('{} {} {} -> {}'.format(self.get_command_name(), function, ' '.join([str(parameter_vars[parameter]) for parameter in call_parameters]), return_result))

		else:
			logging.debug('{} {} {} -> {}'.format(self.get_command_name(), function, ' '.join([str(parameter_vars[parameter]) for parameter in call_parameters]), 'None'))

		# vars_dub = {}
		# for var_key in vars.keys():
		# 	if var_key not in ['__PROTO__', '__STACK__']:
		# 		vars_dub[var_key] = vars[var_key]
		# logging.debug(vars_dub)

		# delete dynamic copy sub commands to free up memory from copy
		del self.sub_command_list



