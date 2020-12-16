# coding: utf-8

import webapp2, logging
import json
from ucf.utils.helpers import *
from ucf.utils.models import *
import sateraito_inc
import sateraito_func
import sateraito_db
from ucf.utils import ucffunc, loginfunc
import lineworks_func


class Page(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		
		logging.info('**** requests *********************')
		logging.info(self.request)
		
		try:
			
			if self.isValidTenant(not_redirect=True) is False:
				self._code = 400
				self._msg = self.getMsg('MSG_NOT_INSTALLED', self._tenant)
				self.responseAjaxResult()
				return
			
			if loginfunc.checkLogin(self, not_redirect=True) is False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return
			
			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_redirect=True)
			if is_select_ok is False:
				self._code = 403
				self._msg = error_msg
				self.responseAjaxResult()
				return
			
			if self.isAdmin() is False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return
			
			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)
			logging.info(req)
			
			# 検索条件
			# sk_keyword = UcfUtil.getHashStr(req, 'sk_keyword').strip()
			# sk_search_type = 'fulltext' if sk_keyword != '' else ''
			
			bot_no = self.request.get('bot_no')
			# bot_no = 9999
			
			open_api_id = self.request.get('open_api_id')
			consumer_key = self.request.get('consumer_key')
			server_id = self.request.get('server_id')
			priv_key = self.request.get('priv_key')
			
			# 入力チェック
			if open_api_id == '' or consumer_key == '' or server_id == '' or priv_key == '':
				self._code = 400
				self._msg = self.getMsg('ERR_EMPTY_LINEWORKSAPIKEYS')
				self.responseAjaxResult()
				return
			
			result = lineworks_func.callLineWorksAPIBotAction('/message/v1', open_api_id, consumer_key, server_id, priv_key, {},
													  'GET', bot_no, 'get_bot')
			result_json = json.JSONDecoder().decode(result.content)
			
			bot_vo = {
				'bot_no': bot_no,
				'bot_name': result_json.get('name', ''),
				'bot_photourl': result_json.get('photoUrl', ''),
				'bot_url': result_json.get('callbackUrl', ''),
				'bot_description': result_json.get('description', ''),
				'bot_manager': UcfUtil.listToCsv(result_json.get('managers', []))
			}
			
			ret_value = {
				'all_count': 0,
				'bot_vo': bot_vo
			}
			
			self._code = 0
			self.responseAjaxResult(ret_value)
		
		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode,
							  config=sateraito_func.wsgi_config)