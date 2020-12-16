# coding: utf-8
import os,sys,datetime,time
import logging
from ucf.config.ucfconfig import *
from ucf.utils.ucfxml import *

import sateraito_message

############################################
## メッセージ管理クラス
############################################
class UcfMessage():

	MSG_FAILED_UPDATE_DB = u'failed update database:%s'

	def getMessage(message_template, ls_param=None):
		u'''メッセージを作成'''
		result = message_template
		if ls_param is not None and len(ls_param) > 0:
			try:
				result = result % ls_param
			except BaseException, instance:
				logging.warning(instance)
				logging.warning(message_template)
				result = result.replace('%s', '')
		return result
	getMessage = staticmethod(getMessage)

	# jslang.py が未使用になったためこのメソッドも未使用 2012/06/04
	# メッセージファイルの更新日時を取得（指定言語のファイルがなければ空）
	def getLangFileLastModified(approot_path,language):
		last_modified = ''
		msg_file_path = os.path.join(approot_path, 'lang', UcfConfig.MESSAGE_DEFAULT_FILE + '.xml')
		if os.path.exists(msg_file_path) == True:
			last_modified = time.ctime(os.path.getmtime(msg_file_path))
		return last_modified
	getLangFileLastModified = staticmethod(getLangFileLastModified)

	# 指定言語のメッセージ一覧を返す（sateraito_message.py 使用版）
	def getMessageListEx(language):
		msgs = None

		if sateraito_message.LANGUAGES.has_key(language):
			msgs = sateraito_message.LANGUAGES.get(language)
		else:
			msgs = sateraito_message.LANGUAGES.get(UcfConfig.MESSAGE_DEFAULT_LANGUAGE)
		return msgs
	getMessageListEx = staticmethod(getMessageListEx)


	# 指定言語のメッセージ一覧を返す ※未使用
	def getMessageList(approot_path,language=UcfConfig.MESSAGE_DEFAULT_FILE,is_only_js=False):
		msgs = {}
		
		# デフォルト定義に対して、言語設定をメッセージ単位でマージ、追加
		msg_file_path = os.path.join(approot_path, 'lang', UcfConfig.MESSAGE_DEFAULT_FILE + '.xml')
		if os.path.exists(msg_file_path) == True:
			xml_msg = UcfXml.load(msg_file_path)
			for node in xml_msg._element:
				if node.tag == 'msg':
					if node.attrib.has_key('name') and (is_only_js == False or (node.attrib.has_key('js') and node.attrib['js'] == 'on')):
						msgs[node.attrib['name']] = unicode(node.text)

		if language.lower() != UcfConfig.MESSAGE_DEFAULT_FILE.lower():
			#msg_file_path = os.path.join(approot_path, 'lang', language + '.xml')
			msg_file_path = os.path.join(approot_path, 'lang', language + '_ALL.xml')
			if os.path.exists(msg_file_path) == True:
				xml_msg = UcfXml.load(msg_file_path)
				for node in xml_msg._element:
					if node.tag == 'msg':
						if node.attrib.has_key('name') and (is_only_js == False or (node.attrib.has_key('js') and node.attrib['js'] == 'on')):
							msgs[node.attrib['name']] = unicode(node.text)

		return msgs
	getMessageList = staticmethod(getMessageList)
