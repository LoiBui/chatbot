#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging
import json
import datetime
import sateraito_inc
import sateraito_func
import oem_func
from ucf.utils.ucfutil import *
import logiccommands
from logiccommands.basecommand import *
from ucf.config.ucfmessage import UcfMessage


#######################################
# コマンド：BaseCommand
#######################################

class BaseCommand(object):

	def __init__(self, element_list, parent_command, script_row_num, params):
		self.parent_command = parent_command
		self.element_list = element_list
		self.script_row_num = script_row_num
		self.sub_command_list = None
		self.is_skipped = False				# 条件分岐の条件にマッチせずスキップされたフラグ（If条件分岐コマンドで処理されなかった場合にTrue）
		self.is_break = False
		self.is_return = False
		self.is_terminated = False

		self._language = params.get('language', '')
		self._oem_company_code = params.get('oem_company_code', '')

		self.analysis()


	def getMsgs(self):
		return UcfMessage.getMessageListEx(self._language)

	def getMsg(self, msgid, ls_param=()):
		msgid = oem_func.exchangeMessageID(msgid, self._oem_company_code)
		return UcfMessage.getMessage(UcfUtil.getHashStr(self.getMsgs(), msgid), ls_param)

	# 各コマンド固有の解析（子クラスで継承）
	def _analysis(self):
		pass

	# _コマンド実行（子クラスで継承）
	def _execute(self):
		pass

	# 前のコマンドが未処理の場合のみ実行するコマンド（子クラスで継承）
	def isOnlyExecuteWhenNoExecutePreCommand(self):
		return False

	# Break可能コマンドかどうか（子クラスで継承）
	def isCanBreakCommand(self):
		return False

	# 特定コマンドの次じゃないと使えないコマンドの場合、前のコマンドを指定（子クラスで継承）
	def getPreCommandsDef(self):
		return None

	# 特定コマンドの子供じゃないと使えないコマンドの場合、親のコマンドを指定（子クラスで継承）
	def getParentCommandsDef(self):
		return None

	# 各コマンド固有の解析
	def analysis(self):
		self._analysis()

	# コマンド実行
	def execute(self):
		self.is_skipped = False
		try:
			self._execute()
		except Exception, e:
			command_str = self._createCommandStr()
			command_str = ''.join(command_str[0:40]) + '...'
			raise Exception(self.getMsg('CMDERR_ERROR_OCCURED', (str(self.script_row_num), command_str, ' '.join(e.args).strip())))

	# ログ用にコマンド文字列を復元
	def _createCommandStr(self):
		command_str = ' '.join([('\'' + element.get('value') + '\'' if element.get('type') == 'literal' else element.get('value')) for element in self.element_list])
		return command_str

	# 親コマンドを取得
	def getParentCommand(self):
		return self.parent_command

	# for use to jump code in programming like go to label, function or method
	def setParentCommand(self, command):
		self.parent_command = command

	# Breakフラグをセット
	def setIsBreak(self, is_break):
		self.is_break = is_break

	# Breakフラグを取得
	def isBreak(self):
		return self.is_break

		# can return flag
	def isCanReturnCommand(self):
		return False

	# Returnフラグをセット
	def setIsReturn(self, is_return):
		self.is_return = is_return

	# Returnフラグを取得
	def isReturn(self):
		return self.is_return

	# ネストされたコマンド（If内の処理など）をセット
	def setSubCommandList(self, sub_command_list):
		self.sub_command_list = sub_command_list

	# 実行時用パラメータをセット
	def setExecuteParameter(self, contents, vars):
		self.contents = contents
		self.vars = vars

	# サブコマンドの実行
	def executeSubCommandList(self):
		logiccommands.executeCommands(self.sub_command_list, self.contents, self.vars)

	# elementリストから指定indexのelementオブジェクトを取得（解析時も利用可）
	def getElementObj(self, index):
		if self.element_list is not None and len(self.element_list) > index:
			return self.element_list[index]
		else:
			return None

	# elementオブジェクトから実際の値を取得（実行時のみ利用可）
	def getValue(self, element):
		value = None
		if element is not None:
			# 定数ならそのまま
			if element.get('type', '') == 'literal':
				value = element.get('value', '')
			# 変数の場合、変数ハッシュから取得（なければ追加）
			elif element.get('value', '').startswith('$'):
				variable_key = ''
				json_path = ''
				ary = element.get('value', '').strip('/').split('/')
				variable_key = ary[0]
				if len(ary) > 1:
					json_path = '/' + '/'.join(ary[1:])
				else:
					json_path = ''

				if json_path != '' and not isinstance(self.vars[variable_key], dict):
					raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', ('', self.getMsg('DICT'))))

				if self.vars.has_key(variable_key):
					if json_path == '':
						value = self.vars[variable_key]
					else:
						value = sateraito_func.getDataFromJsonByXPath(self.vars[variable_key], json_path)

			# JSONパスの場合、ビジネスデータJSONから取得
			elif element.get('value', '').startswith('/'):
				value = sateraito_func.getDataFromJsonByXPath(self.contents, element.get('value', ''))

			# 数値型の場合
			else:
				try:
					value = int(element.get('value', ''))
				except ValueError, e:
					try:
						value = float(element.get('value', ''))
					except ValueError, e:
						value = element.get('value', '')			# それ以外の場合はそのまま返す（例えば「+」などの演算子やURLなどのサブコマンド的なやつ）
		
		return value

	# 値をビジネスデータJSONや変数にセット（実行時のみ利用可）
	def setValue(self, key, value):
		# 変数の場合、変数ハッシュにセット
		if key.startswith('$'):
			variable_key = ''
			json_path = ''
			ary = key.strip('/').split('/')
			variable_key = ary[0]
			if len(ary) > 1:
				json_path = '/' + '/'.join(ary[1:])
			else:
				json_path = ''

			if json_path != '':
				# できるだけ直感的に書けるように、なければ作ってしまう
				if not self.vars.has_key(variable_key):
					self.vars[variable_key] = {}
				elif not isinstance(self.vars[variable_key], dict):
					raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', ('', self.getMsg('DICT'))))
				sateraito_func.setValueToJsonByXPath(self.vars[variable_key], json_path, value)
			else:
				self.vars[variable_key] = value

		# JSONパスの場合、ビジネスデータJSONにセット
		elif key.startswith('/'):
			sateraito_func.setValueToJsonByXPath(self.contents, key, value)
		else:
			raise Exception('inalid target "%s".' % (key))

	# 条件分岐などで処理をスキップされたフラグ
	def isSkipped(self):
		return self.is_skipped
	def setIsSkipped(self, is_skipped):
		self.is_skipped = is_skipped

	# force stop logic
	def isTerminated(self):
		return self.is_terminated

	def setIsTerminated(self, is_terminated):
		self.is_terminated = is_terminated
