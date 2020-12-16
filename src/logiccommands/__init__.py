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
			'ELIF': ElseIfCommand,		# �G�C���A�X
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
			# �{�b�g�X�g���[�W�֘A�R�}���h
			'STORAGEHAS': StorageHasCommand,
			'STORAGEGET': StorageGetCommand,
			'STORAGESET': StorageSetCommand,
			'STORAGEDEL': StorageDelCommand,
			'AI': AICommand,						# ���R�����̓R�}���h�iLUIS�j
			'HASH': HashCommand,			# SHA�AMD5 �Ȃǂ̃n�b�V���l���쐬����R�}���h
			'NOW': NowCommand,			# ���݂̓������w��`���i��Fyyyy/MM/dd HH:mm:ss�j������ŕԂ��R�}���h

	}

def executeCommands(command_list, contents, vars):
	if command_list is not None:
		pre_command_obj = None
		for command in command_list:
			# �e�R�}���h��Break�t���O�������Ă���ꍇ�́A�����Ŕ�����
			parent_command = command.getParentCommand()
			if parent_command is not None and parent_command.isBreak():
				break
			# Return�R�}���h�Ή�
			if parent_command is not None and parent_command.isReturn():
				# fix return in forcommand loop
				break
			if pre_command_obj is not None and pre_command_obj.isReturn():
				break
			# ���O�̃R�}���h�i��FIf�j�������ɂ��킸�X�L�b�v���ꂽ�ꍇ�̂ݎ��s����R�}���h�i��FElseIf�AElse�j�̏ꍇ�̓X�L�b�v���ꂽ�t���O�����Ď��s
			if not command.isOnlyExecuteWhenNoExecutePreCommand() or pre_command_obj.isSkipped():
				command.setExecuteParameter(contents, vars)
				command.execute()
				# Return�R�}���h�Ή�
				if command.isReturn():
					break		# Break�R�}���h�ƈ����Return�R�}���h�͍ŏ�ʂł��w�肳���̂ł����Ŕ�����
				if command.isTerminated():
					# force stop logic immediately
					return

			pre_command_obj = command
