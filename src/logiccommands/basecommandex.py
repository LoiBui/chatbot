#!/usr/bin/python
# coding: utf-8

import re
import json
import logging
import datetime

import sateraito_inc
import sateraito_func
from ucf.utils.ucfutil import *
from google.appengine.api import urlfetch
from logiccommands.basecommand import *


import itertools


#######################################
#
#
#
#######################################


class BaseCommandEx(BaseCommand):
  def __init__(self, element_list, parent_command, script_row_num, params):
    super(BaseCommandEx, self).__init__(element_list, parent_command, script_row_num, params)

    # # add index for element for better log debug and traceback error
    # for index, element in enumerate(element_list):
    #   element['index'] = index

    # # store final command result
    # self.return_result = None

  def _check_exist_element(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    return element is not None

  def _assert_exist_element(self, index, name):
    element = self.getElementObj(index)
    if element is None:
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(index), name)))

  def _assert_len_elements(self, num_equal=None, num_min=None, num_max=None):
    len_elements = len(self.element_list)

    if num_equal is not None:
      if len_elements > num_equal:
        raise Exception(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'))
      elif len_elements < num_equal:
        raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

    elif num_min is not None:
      if len_elements < num_min:
        raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

    elif num_max is not None:
      if len_elements > num_max:
        raise Exception(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'))

  def _check_kind_element_constant(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    # logging.debug(element)
    return element.get('type') == 'literal'

  def _check_kind_element_variable(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    # logging.debug(element)
    return element.get('value').startswith('$')

  def _check_kind_element_jsonxpath(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    # logging.debug(element)
    return element.get('value').startswith('/')

  def _check_kind_element_number(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    # logging.debug(element)

    if element.get('type') == 'literal':
      return False

    element_express = element.get('value')
    if element_express.startswith('$') or element_express.startswith('/'):
      return False

    try:
      int(element_express)
      return True
    except ValueError:
      pass

    try:
      float(element_express)
      return True
    except ValueError:
      pass

    return False

  def _check_kind_element_keyword(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    # logging.debug(element)

    if element.get('type') == 'literal':
      return False

    element_express = element.get('value')
    if element_express.startswith('$') or element_express.startswith('/'):
      return False

    try:
      int(element_express)
      return False
    except ValueError:
      pass

    try:
      float(element_express)
      return False
    except ValueError:
      pass

    return True

  def _assert_kind_element(self, index, name, include, exclude=None):
    constant = 'CONSTANT'
    variable = 'VARIABLE'
    jsonxpath = 'JSONXPATH'

    checkers = {
      constant: '_check_kind_element_constant',
      variable: '_check_kind_element_variable',
      jsonxpath: '_check_kind_element_jsonxpath'
    }

    if not isinstance(include, (list, tuple)):
      include = tuple([include])
    elif isinstance(include, list):
      include = tuple(include)

    if exclude is not None:
      if not isinstance(exclude, (list, tuple)):
        exclude = tuple([exclude])
      elif isinstance(exclude, list):
        exclude = tuple(exclude)

    include_kinds = ','.join(set([self.getMsg(kind) for kind in include]))

    element = self.getElementObj(index)
    element_express = element.get('value')

    if exclude is not None:
      for kind in exclude:
        if kind in checkers:
          func_check = getattr(self, checkers[kind])
          if func_check and func_check(index):
            raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND', (str(index), name, element_express, self.getMsg(kind), include_kinds)))

    for kind in include:
      if kind in checkers:
        func_check = getattr(self, checkers[kind])
        if func_check:
          if func_check(index):
            return
          else:
            continue

    raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(index), name, element_express, include_kinds)))

  def _check_value_element_not_none(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    value = self.getValue(element)
    return value is not None

  def _assert_value_element_not_none(self, index, name):
    value = self.getValue(self.getElementObj(index))
    if value is None:
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(index), name)))

  def _assert_type_element(self, index, name, include, exclude=None):
    types = {
      bool: 'BOOLEAN',
      int: 'INTEGER',
      long: 'INTEGER',
      float: 'FLOAT',
      basestring: 'STRING',
      unicode: 'STRING',
      dict: 'DICT',
      list: 'LIST'
    }

    if not isinstance(include, (list, tuple)):
      include = tuple([include])
    elif isinstance(include, list):
      include = tuple(include)

    if exclude is not None:
      if not isinstance(exclude, (list, tuple)):
        exclude = tuple([exclude])
      elif isinstance(exclude, list):
        exclude = tuple(exclude)

    include_types = ','.join(set([self.getMsg(types[t]) for t in include]))
    # logging.debug(include_types)

    element = self.getElementObj(index)
    # logging.debug(element)
    element_value = self.getValue(element)
    # logging.debug(element_value)

    if exclude is not None:
      if isinstance(element_value, exclude):
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(index), name, include_types)))

    if not isinstance(element_value, include):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(index), name, include_types)))

  def _get_element_value(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    return self.getValue(element)

  def _get_element_express(self, index_or_element):
    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element
    if element:
      return element.get('value', '')

  def _get_element_kind(self, index_or_element):
    # constant = 'CONSTANT'
    # variable = 'VARIABLE'
    # jsonxpath = 'JSONXPATH'

    if isinstance( index_or_element, (int, long)):
      index = index_or_element
      element = self.getElementObj(index)
    else:
      element = index_or_element

    if element.get('type') == 'literal':
      return 'CONSTANT'
    else:
      element_express = element.get('value')
      if element_express.startswith('$'):
        return 'VARIABLE'
      elif element_express.startswith('/'):
        return 'JSONXPATH'
      # else:
      #   try:
      #     int(element_express)
      #     # return 'INTEGER'
      #     return 'NUMBER'
      #   except ValueError:
      #     pass
      #
      #   try:
      #     float(element_express)
      #     # return 'FLOAT'
      #     return 'NUMBER'
      #   except ValueError:
      #     pass
      #
      #   # return 'PATTERN'
      #   return 'KEYWORD'

    return 'OTHER'

  def _raise_exception_invalid_element(self, index, name):
    raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(index), name)))

  def _raise_exception_invalid_pattern(self, index, name, valid_values):
    raise Exception(self.getMsg('CMDERR_INVALID_PATTERN', (str(index), name, self._get_element_express(index), ','.join(valid_values))))

  def _raise_exception_missing_element(self):
    raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

  def _raise_exception_redundant_element(self):
    raise Exception(self.getMsg('CMDERR_EXIST_NOTNEED_ELEMENTS'))

  # 解析
  def _analysis(self):
    pass

  # コマンド実行
  def _execute(self):
    pass

  def get_command_name(self):
    command_name = self.getElementObj(0).get('value', '')
    return command_name

  def get_command_string(self):
    command_string = ' '.join([element.get('value', '') for element in self.element_list])
    return command_string

  def get_command_string_value(self):
    command_string = ' '.join([self.getValue(element) for element in self.element_list])
    return command_string

  # use for dynamic define function
  def setProto(self, name, ref):
    if '__PROTO__' not in self.vars:
      self.vars['__PROTO__'] = {}
    self.vars['__PROTO__'][name] = ref

  # get function defined
  def getProto(self, name):
    if '__PROTO__' not in self.vars:
      self.vars['__PROTO__'] = {}
    return self.vars['__PROTO__'].get(name)

  # push stack before jump in to function scope, store the environments info to restore after out of function scope
  def pushStackVars(self, data):
    if '__STACK__' not in self.vars:
      self.vars['__STACK__'] = []
    self.vars['__STACK__'].append(data)

  # when out function scope, pop stack to get info to restore environments
  def popStackVars(self):
    if '__STACK__' not in self.vars:
      self.vars['__STACK__'] = []
    # should throw error if call wrong time in functions stack
    return self.vars['__STACK__'].pop()

  # def setReturnResult(self, value):
  # 	self.return_result = value
  #
  # def getReturnResult(self):
  # 	return self.return_result

  # save result of last executed function, do not pop stack yet
  def setReturnResult(self, value):
    stack = self.vars['__STACK__']
    if not stack:
      return
    data = stack[len(stack) - 1]
    data['result'] = value

  # load result of last executed function, do not pop stack yet
  def getReturnResult(self):
    stack = self.vars['__STACK__']
    if not stack:
      return
    data = stack[len(stack) - 1]
    return data.get('result')

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

  def _is_operator_not(self, index_or_element):
    if self._check_kind_element_constant(index_or_element):
      return False

    element_express = self._get_element_express(index_or_element) or ''.upper()
    if element_express.upper() not in ['NOT']:
      return False

    return True

  def _is_operator_compare(self, index_or_element):
    if self._check_kind_element_constant(index_or_element):
      return False

    operators = ['==', '!=', '<>', '>', '<', '>=', '<=']
    element_express = self._get_element_express(index_or_element) or ''.upper()
    if element_express.upper() not in operators:
      return False

    return True

  def _is_operator_calculate(self, index_or_element):
    if self._check_kind_element_constant(index_or_element):
      return False

    operators = ['+', '-', '/', '*']
    element_express = self._get_element_express(index_or_element) or ''.upper()
    if element_express.upper() not in operators:
      return False

    return True

  def _is_operator(self, index_or_element, operators):
    if self._check_kind_element_constant(index_or_element):
      return False

    element_express = self._get_element_express(index_or_element) or ''.upper()
    if element_express.upper() not in operators:
      return False

    return True

  def _get_inline_elements_value_all(self, inline_elements):
    len_inline_elements = len(inline_elements)

    if len(inline_elements) == 1:
      element = len_inline_elements[0]
      return self._get_element_value(element)

    else:
      list_or_operations = _split_iterable(inline_elements, [True], self._is_operator_or)

      return self._get_inline_elements_value_or(list_or_operations)

  def _get_inline_elements_value_or(self, list_or_operations):
    return _get_result_or(*list_or_operations, func=self._get_inline_elements_value_and)

  def _get_inline_elements_value_and(self, list_and_operations):
    return _get_result_and(*list_and_operations, func=self._get_inline_elements_value_and)

  def _get_inline_elements_value(self, inline_elements):
    len_inline_elements = len(inline_elements)

    if len_inline_elements == 1:
      element = len_inline_elements[0]
      return self._get_element_value(element)

    elif len_inline_elements == 2:
      element_1 = inline_elements[0]
      element_2 = inline_elements[1]
      if self._is_operator_not(element_1):
        return not self._get_element_value(element_2)

    elif len_inline_elements == 3:
      # element_1 = inline_elements[0]
      element_2 = inline_elements[1]
      # element_3 = inline_elements[2]

      if self._is_operator_calculate(element_2):
        return self._get_inline_elements_value_caculate(inline_elements)
      elif self._is_operator_compare(element_2):
        return self._get_inline_elements_value_compare(inline_elements)
      else:
        if self._is_operator(element_2, 'IS'):
          element_a = inline_elements[0]
          element_b = inline_elements[2]
          return self._get_element_value(element_a) is self._get_element_value(element_b)

    else:
      is_need_compate = False
      for element in inline_elements:
        if self._is_operator_compare(element):
          is_need_compate = True

      compate_operators = ['==', '!=', '<>', '>', '<', '>=', '<=']
      list_compate_operations = _split_iterable(inline_elements, compate_operators, func=None, include_splitters=True)
      # todo

  def _get_inline_elements_value_compare(self, inline_elements):
    # todo
    pass

  def _get_inline_elements_value_caculate(self, inline_elements):
    # toso
    pass

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
