# coding: utf-8

import webapp2
from ucf.utils.helpers import *
import sateraito_inc
import sateraito_func

class Page(FrontHelper):
	def processOfRequest(self):
		self._approot_path = os.path.dirname(__file__)
		ucfp = UcfFrontParameter(self)

		# 言語を決定（Cookieの値を考慮）
		hl_from_cookie = self.getCookie('hl')
		logging.info('hl_from_cookie=' + str(hl_from_cookie))
		if hl_from_cookie is not None and hl_from_cookie in sateraito_func.ACTIVE_LANGUAGES:
			self._language = hl_from_cookie
		# 言語一覧
		language_list = []
		for language in sateraito_func.ACTIVE_LANGUAGES:
			language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])

		template_vals = {
			'footer_message':self.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ()),
			'language_list':JSONEncoder().encode(language_list)
		}
		self.appendBasicInfoToTemplateVals(template_vals)
		self.render('notfound.html', self._design_type, template_vals)

app = webapp2.WSGIApplication([('/.*', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
