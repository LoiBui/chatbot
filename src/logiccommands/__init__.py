# coding: utf-8

from setcommand import *
from ifcommand import *
from elseifcommand import *
from elsecommand import *
from endifcommand import *
from forcommand import *
from endforcommand import *
from breakcommand import *
from patterncommand import *
from restcommand import *

from htmlcommand import HtmlCommand
from rsscommand import RssCommand

from defcommand import DefCommand
from callcommand import CallCommand
from returncommand import ReturnCommand
from exitcommand import ExitCommand

#from stringcommand import StringCommand
#from arraycommand import ArrayCommand

from storagehas import StorageHasCommand
from storageget import StorageGetCommand
from storageset import StorageSetCommand
from storagedel import StorageDelCommand

from aicommand import AICommand
from hashcommand import HashCommand
from nowcommand import NowCommand

command_classes = {
			'SET': SetCommand,
			'IF': IfCommand,
			'ELSEIF': ElseIfCommand,
			'ELIF': ElseIfCommand,		# エイリアス
			'ELSE': ElseCommand,
			'ENDIF': EndIfCommand,	
			'FOR': ForCommand,
			'ENDFOR': EndForCommand,
			'BREAK': BreakCommand,
			'PATTERN': PatternCommand,
			'REST': RestCommand,
			'HTML': HtmlCommand,
			'RSS': RssCommand,
			#'STRING': StringCommand,
			#'ARRAY': ArrayCommand,
			'DEF': DefCommand,
			'CALL': CallCommand,
			'RETURN': ReturnCommand,
			'EXIT': ExitCommand,
			# ボットストレージ関連コマンド
			'STORAGEHAS': StorageHasCommand,
			'STORAGEGET': StorageGetCommand,
			'STORAGESET': StorageSetCommand,
			'STORAGEDEL': StorageDelCommand,
			'AI': AICommand,						# 自然言語解析コマンド（LUIS）
			'HASH': HashCommand,			# SHA、MD5 などのハッシュ値を作成するコマンド
			'NOW': NowCommand,			# 現在の日時を指定形式（例：yyyy/MM/dd HH:mm:ss）文字列で返すコマンド

	}

def executeCommands(command_list, contents, vars):
	if command_list is not None:
		pre_command_obj = None
		for command in command_list:
			# 親コマンドにBreakフラグが立っている場合は、ここで抜ける
			parent_command = command.getParentCommand()
			if parent_command is not None and parent_command.isBreak():
				break
			# Returnコマンド対応
			if parent_command is not None and parent_command.isReturn():
				# fix return in forcommand loop
				break
			if pre_command_obj is not None and pre_command_obj.isReturn():
				break
			# ※前のコマンド（例：If）が条件にあわずスキップされた場合のみ実行するコマンド（例：ElseIf、Else）の場合はスキップされたフラグを見て実行
			if not command.isOnlyExecuteWhenNoExecutePreCommand() or pre_command_obj.isSkipped():
				command.setExecuteParameter(contents, vars)
				command.execute()
				# Returnコマンド対応
				if command.isReturn():
					break		# Breakコマンドと違ってReturnコマンドは最上位でも指定されるのでここで抜ける
				if command.isTerminated():
					# force stop logic immediately
					return

			pre_command_obj = command
