#!/usr/bin/python
# coding: utf-8

__author__ = 'Akitoshi Abe <abe@baytech.co.jp>'

import os
import webapp2
import logging
import json

import urllib, urllib2, StringIO, gzip

from google.appengine.api import mail
from google.appengine.api import urlfetch

from ucf.utils.ucfutil import UcfUtil

'''
sateraito_mail.py

@since: 2017-11-21
@version: 2017-11-21
@author: Akitoshi Abe
'''

# この値は利用するアドオンごとに変更してください
SENDER_ADDON_PROJECT_ID = 'sateraito-faq'

# この値は必要に応じて変更してください（サテライトメールサーバーに登録済みのアドレスである必要があります）
MESSAGE_SENDER_EMAIL = 'sateraito-service@sateraito.jp'

# 以下の値は固定
SATERAITO_MAIL_SERVER_URL = 'https://sendmail.sateraito.jp'
MD5_SUFFIX_KEY_MAIL_SERVER = 'm4Usu7ekCR7WAfFwBIZ2wMH85t9ye2wK'


def sendMail(to, message_subject, message_body,
			cc='', reply_to='', is_html=False):
	
	"""
	  @param {string / list} to 
	  @param {string} message_subject
	  @param {string} message_body
	  @param {string / list} cc
	  @param {string / list} reply_to
	  @param {boolean} is_html ... html形式のメールを送る場合Trueを指定
	  
	  @return {boolean} succeeded, {string} error_code
	  
	  to, cc, reply_toに指定できるもの：
	    カンマ区切りの文字列での複数のメールアドレス指定可能
	    また 「"氏名" <address@example.com>」 形式でのアドレス指定も可能
	  例） akitoshiabe@gmail.com
	       akitoshiabe@gmail.com, abe@sateraito.co.jp
	       "阿部昭敏" <akitoshiabe@gmail.com>
	       "阿部昭敏" <akitoshiabe@gmail.com>, "阿部サテライト" <abe@sateraito.co.jp>
	       
	    またlistで複数アドレスを渡すのも可
	"""
	if isinstance(to, list):
		to_str = ','.join(to)
	else:
		to_str = to
	if isinstance(cc, list):
		cc_str = ','.join(cc)
	else:
		cc_str = cc
	if isinstance(reply_to, list):
		reply_to_str = ','.join(reply_to)
	else:
		reply_to_str = reply_to
	return _sendMail(to_str, message_subject, message_body,
			cc=cc_str, reply_to=reply_to_str, is_html=is_html)


def _sendMail(to, message_subject, message_body,
			cc='', reply_to='', is_html=False):
	
	# check to
	if to is None or str(to).strip() == '':
		logging.error('to is None')
		return False, 'invalid_to'
	if not mail.IsEmailValid(to):
		logging.error('invalid to=' + str(to))
		return False, 'invalid_to'
	# check cc
	if cc is not None and str(cc).strip() != '':
		if not mail.IsEmailValid(cc):
			logging.error('invalid cc=' + str(cc))
			return False, 'invalid_cc'
	# check reply_to
	if reply_to is not None and str(reply_to) != '':
		if not mail.IsEmailValid(reply_to):
			logging.error('invalid reply_to=' + str(reply_to))
			return False, 'invalid_reply_to'
	# calc check_key
	now = UcfUtil.getNow()	# 標準時
	check_key = UcfUtil.md5(now.strftime('%Y%m%d%H%M') + MD5_SUFFIX_KEY_MAIL_SERVER + SENDER_ADDON_PROJECT_ID)
	# post data
	url = SATERAITO_MAIL_SERVER_URL + '/api/sendmail'
	values = {
			'addon_project_id': SENDER_ADDON_PROJECT_ID,
			'sender_email': MESSAGE_SENDER_EMAIL,
			'to': to,
			'cc': cc,
			'reply_to': reply_to,
			'message_subject': message_subject,
			'message_body': message_body,
			'is_html': str(is_html),
			'check_key': check_key,
			}
	headers = {}
	response = HttpPostAccess(url, values, headers)
	logging.info('response=' + str(response))
	try:
		response_dict = json.JSONDecoder().decode(response)
		if response_dict.get('status') != 'ok':
			return False, response_dict.get('error_code')
	except BaseException, e:
		logging.error('error: class name:' + e.__class__.__name__ + ' message=' +str(e))
		return False, 'unexpected_error'
	
	return True, ''


URLFETCH_TIMEOUT_SECOND = 30


def HttpPostAccess(url, values, headers):
	# 値をURLエンコード
	data = urllib.urlencode(values)
	req = urllib2.Request(url, data, headers)
	response = urllib2.urlopen(req, timeout=URLFETCH_TIMEOUT_SECOND)
	return response.read()



