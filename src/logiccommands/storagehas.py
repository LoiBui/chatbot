#!/usr/bin/python
# coding: utf-8

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

import re

import bot_storage_db


#######################################
#
# STORAGEHAS $key $result
#
#######################################


class StorageHasCommand(BaseCommandEx):
  def __init__(self, element_list, parent_command, script_row_num, params):
    super(StorageHasCommand, self).__init__(element_list, parent_command, script_row_num, params)

  # 解析
  def _analysis(self):
    self._assert_len_elements(num_equal=3)

    index = 1
    name = 'key'
    self._assert_exist_element(index, name)

    index = 2
    name = 'result'
    self._assert_exist_element(index, name)
    self._assert_kind_element(index, name, ['VARIABLE', 'JSONXPATH'], ['CONSTANT'])

  # コマンド実行
  def _execute(self):
    logging.debug(self.get_command_string())

    index = 1
    name = 'key'
    element = self.getElementObj(index)
    value = self.getValue(element)
    # check valid key
    self._assert_value_element_not_none(index, name)
    if not value:
      self._raise_exception_invalid_element(index, name)
    self._assert_type_element(index, name, [basestring, unicode], [dict, list])
    # if not re.match(r'^[A-Za-z0-9_-]*$', value):
    #   self._raise_exception_invalid_element(index, name)
    storage_key = value

    user_id = self.vars.get('__USER__')
    if not user_id:
      return

    # result = bot_storage_db.BotStorage.has_storage(user_id, storage_key)
    result = bot_storage_db.BotStorageText.has_storage(user_id, storage_key)

    index = 2
    element_result = self.getElementObj(index)
    value_result = result
    self.setValue(element_result.get('value'), value_result)
