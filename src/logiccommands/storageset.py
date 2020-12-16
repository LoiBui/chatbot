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
# STORAGESET $key $data
#
#######################################


class StorageSetCommand(BaseCommandEx):
  def __init__(self, element_list, parent_command, script_row_num, params):
    super(StorageSetCommand, self).__init__(element_list, parent_command, script_row_num, params)

  # 解析
  def _analysis(self):
    self._assert_len_elements(num_equal=3)

    index = 1
    name = 'key'
    self._assert_exist_element(index, name)

    index = 2
    name = 'data'
    self._assert_exist_element(index, name)

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

    index = 2
    name = 'data'
    element = self.getElementObj(index)
    value = self.getValue(element)
    # check valid value
    storage_data = value

    user_id = self.vars.get('__USER__')
    if not user_id:
      return

    # # for test large data
    # storage_data = storage_data * 1024 * 1024

    # bot_storage_db.BotStorage.save_storage(user_id, storage_data, storage_key)
    bot_storage_db.BotStorageText.save_storage(user_id, storage_data, storage_key)
