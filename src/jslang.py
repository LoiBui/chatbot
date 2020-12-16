#!/usr/bin/python
# coding: utf-8

import os
import logging
import webapp2
from ucf.utils.helpers import FrontHelper
from ucf.config.ucfmessage import UcfMessage
from ucf.utils.ucfutil import UcfUtil
from ucf.config.ucfconfig import *
from simplejson.encoder import JSONEncoder
import sateraito_inc
import sateraito_func

# 言語ごとにJavaScriptの言語メッセージファイルを作成して返す
# 静的なjsファイルにしたので未使用　2012/06/04
class Page(FrontHelper):
	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)

		last_modified_language = ''	# Wed, 21 Jun 2006 07:00:25 GMT
		last_modified_default = ''	# Wed, 21 Jun 2006 07:00:25 GMT
		language = UcfUtil.nvl(self.getRequest('ln'));
		if language != '':
			last_modified_language = UcfMessage.getLangFileLastModified(self._approot_path, language=language)
		if language.lower() != UcfConfig.MESSAGE_DEFAULT_FILE.lower():
			last_modified_default = UcfMessage.getLangFileLastModified(self._approot_path, language=UcfConfig.MESSAGE_DEFAULT_FILE)
		else:
			last_modified_default = last_modified_language

		last_modified = str(last_modified_language) + '|' + str(last_modified_default)

#		if self.request.headers.has_key('If-Modified-Since'):
#			logging.info('If-Modified-Since=' + self.request.headers['If-Modified-Since'])
#		logging.info('last_modified=' + last_modified)

		if self.request.headers.has_key('If-Modified-Since') and last_modified is not None and self.request.headers['If-Modified-Since'] == last_modified:
			self.response.set_status(304)
			return

		msgs = UcfMessage.getMessageList(self._approot_path, language=language,is_only_js=True)

		template_vals = {
			'lang_json':JSONEncoder().encode(msgs)
		}
		#self.appendBasicInfoToTemplateVals(template_vals)
		self.response.headers['Last-Modified'] = last_modified
		self.render('jslang.html', self._design_type, template_vals, content_type='text/javascript')

app = webapp2.WSGIApplication([
                               (r'/script/lang.js', Page),
																(r'/script/debug/lang.js', Page)
                              ], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
