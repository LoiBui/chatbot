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


import itertools


#######################################
# IF:条件分岐コマンド
# 
# IF /content == '今日の天気は？':
#
# IF '今日の天気は？' IN /content:
#
# IF $digit > 10:
#
# IF /digit >= 10:
#
#
# ※括弧対応無し
# ※and、or などなし（今のところ）
#
#######################################


class IfCommand(BaseCommandEx):
	def __init__(self, element_list, parent_command, script_row_num, params):
		super(IfCommand, self).__init__(element_list, parent_command, script_row_num, params)

	# 解析
	def _analysis(self):
		logic_elements = self.element_list[1:]

		# logging.warning('logic_elements')
		# logging.warning(logic_elements)

		num_logic_elements = len(logic_elements)

		if num_logic_elements < 1:
			raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

		current_element_index = 1
		list_or_operations = _split_iterable(logic_elements, [True], self._is_operator_or)
		# logging.debug(list_or_operations)
		for or_index, or_operation_child in enumerate(list_or_operations):
			# logging.warning(or_operation_child)
			list_and_operations = _split_iterable(or_operation_child, [True], self._is_operator_and)
			# logging.debug(list_and_operations)
			for and_index, and_operation_child in enumerate(list_and_operations):
				# logging.warning(and_operation_child)
				num_operations_plus_operator = len(and_operation_child)
				if num_operations_plus_operator < 1:
					raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

				elif num_operations_plus_operator == 1:
					pass

				elif num_operations_plus_operator == 2:
					valid_operators = ['NOT']
					operator_index = current_element_index + 0
					if not self._is_operator(operator_index, valid_operators):
						raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(current_element_index), 'comparative operator', self._get_element_express(current_element_index), ','.join(valid_operators))))

				elif num_operations_plus_operator == 3:
					valid_operators = ['==', '!=', '<>', '>', '<', '>=', '<=', 'IN']
					operator_index = current_element_index + 1
					# logging.debug(self._get_element_express(operator_index))
					if not self._is_operator(operator_index, valid_operators):
						raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(current_element_index), 'comparative operator', self._get_element_express(current_element_index), ','.join(valid_operators))))

				elif num_operations_plus_operator > 3:
					raise Exception('{}: ""'.format(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'),
																					' '.join([self._get_element_express(o) for o in and_operation_child])
																					))

				current_element_index += num_operations_plus_operator
				# + 1 element for next and
				if and_index < len(list_and_operations) - 1:
					current_element_index += 1
			# + 1 element for next or
			if or_index < len(list_or_operations) - 1:
				current_element_index += 1

	# コマンド実行
	def _execute(self):
		result = False

		logic_elements = self.element_list[1:]

		# logging.warning('logic_elements')
		# logging.warning(logic_elements)

		list_or_operations = _split_iterable(logic_elements, [True], self._is_operator_or)
		# logging.warning(list_or_operations)
		result_or_operations = False
		for or_index, or_operation_child in enumerate(list_or_operations):
			# logging.warning(or_operation_child)
			list_and_operations = _split_iterable(or_operation_child, [True], self._is_operator_and)
			# logging.warning(list_and_operations)
			result_and_operations = True
			for and_index, and_operation_child in enumerate(list_and_operations):
				# logging.warning(and_operation_child)
				num_operations_plus_operator = len(and_operation_child)

				bool_logic = False

				if num_operations_plus_operator == 1:
					operation_element = and_operation_child[0]
					operation = self._get_element_value(operation_element)
					bool_logic = _get_result_one_operation(operation)

				elif num_operations_plus_operator == 2:
					operation_element = and_operation_child[0]
					operation = self._get_element_value(operation_element)
					operator_element = and_operation_child[1]
					operator = self._get_element_value(operator_element)
					bool_logic = _get_result_one_operation(operation, operator=operator)

				elif num_operations_plus_operator == 3:
					operation_a_element = and_operation_child[0]
					operation_a = self._get_element_value(operation_a_element)
					operator_element = and_operation_child[1]
					operator = self._get_element_value(operator_element)
					operation_b_element = and_operation_child[2]
					operation_b = self._get_element_value(operation_b_element)
					bool_logic = _get_result_two_operation(operation_a, operation_b, operator=operator)
					logging.debug("Logic '{} {} {}': {}".format(operation_a, operator, operation_b, bool_logic))

				result_and_operations = result_and_operations and bool_logic

				if not result_and_operations:
					break

			result_or_operations = result_or_operations or result_and_operations

			if result_or_operations:
				break

		result = result_or_operations

		# 条件にマッチしなければ処理しない
		if not result:
			self.setIsSkipped(True)
			return

		# 条件に一致したらサブコマンドリストを実施
		self.executeSubCommandList()

	def _is_operator_or(self, index_or_element):
		if self._check_kind_element_constant(index_or_element):
			return False

		element_express = self._get_element_express(index_or_element) or ''.upper()
		if element_express.upper() not in ['OR']:
			return False

		return True

	def _is_operator_and(self, index_or_element):
		if self._check_kind_element_constant(index_or_element):
			return False

		element_express = self._get_element_express(index_or_element) or ''.upper()
		if element_express.upper() not in ['AND']:
			return False

		return True

	def _is_operator(self, index_or_element, operators):
		if self._check_kind_element_constant(index_or_element):
			return False

		element_express = self._get_element_express(index_or_element) or ''.upper()
		if element_express.upper() not in operators:
			return False

		return True


def get_true_or_false(value):
	true_or_false = not not value

	return true_or_false


def _get_result_or(*args, **kwargs):
	list_operations = args
	func = kwargs.get('func')

	bool_value = None
	for operation in list_operations:
		bool_value = func(operation) if func else operation
		if bool_value:
			# return True
			# operator or should return the first "true" value
			return bool_value

	# return False
	# operator or should return the last "false" value
	return bool_value


def _get_result_or_boolean(*args, **kwargs):
	true_or_false = not not _get_result_or(*args, **kwargs)

	return true_or_false


def _get_result_and(*args, **kwargs):
	list_operations = args
	func = kwargs.get('func')

	bool_value = None
	for operation in list_operations:
		bool_value = func(operation) if func else operation
		if not bool_value:
			# return False
			# operator and should return the first "false" value
			return bool_value

	# return True
	# operator and should return the last "true" value
	return bool_value


def _get_result_and_boolean(*args, **kwargs):
	true_or_false = not not _get_result_and(*args, **kwargs)

	return true_or_false


def _get_result_two_operation(operation_a, operation_b, operator, func=None):
	target = operation_a if not func else func(operation_a)
	comp_ope = operator if not func else func(operator)
	value = operation_b if not func else func(operation_b)

	is_match = False

	try:
		if comp_ope == '==':
			is_match = target == value
		elif comp_ope in ['!=', '<>']:
			is_match = target != value
		elif comp_ope in ['>']:
			is_match = target > value
		elif comp_ope in ['>=']:
			is_match = target >= value
		elif comp_ope in ['<']:
			is_match = target < value
		elif comp_ope in ['<=']:
			is_match = target <= value
		elif str(comp_ope).upper() in ['IN']:
			if isinstance(value, (list, dict)):
				is_match = target in value
			elif isinstance(value, (str, unicode)) and isinstance(target, (str, unicode)):
				is_match = value.find(target) >= 0
	except Exception, e:
		# logging.warning(comp_ope)
		# logging.warning(target)
		# logging.warning(value)
		msg_warning = 'Exception Logic: {} {} {}'.format(target, comp_ope, value)
		logging.warning(msg_warning)
		logging.warning(e)
		is_match = False

	return is_match


def _get_result_one_operation(operation, operator=None, func=None):
	value = operation if not func else func(operation)
	ope = operator if not func else func(operator)

	is_match = False

	try:
		if ope:
			if str(ope).upper() in ['NOT']:
				is_match = not value

		else:
			is_match = not not value
	except Exception, e:
		if ope:
			msg_warning = 'Exception Logic: {} {}'.format(ope, value)
		else:
			msg_warning = 'Exception Logic: {}'.format(value)
		logging.warning(msg_warning)
		logging.warning(e)
		is_match = False

	return is_match


def _split_iterable(iterable, splitters, func=None, include_splitters=False):
	return [list(g) for k, g in itertools.groupby(iterable, lambda x: (x if func is None else func(x)) in splitters) if include_splitters or not k]
