# coding: utf-8

import webapp2, logging
import json
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils.validates import BaseValidator
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
				self._msg = self.getMsg('MSG_NOT_INSTALLED', (self._tenant))
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
			# logging.info(req)
			
			unique_id = UcfUtil.getHashStr(req, 'unique_id')
			channel_kind = UcfUtil.getHashStr(req, 'channel_kind')
			channel_config = UcfUtil.getHashStr(req, 'channel_config')
			
			channel_config_jsondata = json.JSONDecoder().decode(channel_config)
			open_api_id = channel_config_jsondata['open_api_id']
			consumer_key = channel_config_jsondata['consumer_key']
			server_id = channel_config_jsondata['server_id']
			priv_key = channel_config_jsondata['priv_key']
			domain_id = channel_config_jsondata['domain_id']
			
			edit_type = self.request.get('edit_type')
			bot_no = self.request.get('bot_no')
			bot_name = self.request.get('bot_name')
			bot_description = self.request.get('bot_description')
			bot_photourl = self.request.get('bot_photourl')
			if unique_id:
				bot_url = self.request.get('bot_url')
			else:
				unique_id = UcfUtil.guid()
				bot_url = sateraito_inc.my_site_url + '/webhook/' + self._tenant + '/' + unique_id
			bot_manager = self.request.get('bot_manager')
			richmenu_id = FileUpSettingConfig.getRichMenuId(channel_kind)
			
			# 入力チェック
			if open_api_id == '' or consumer_key == '' or server_id == '' or priv_key == '':
				self._code = 400
				self._msg = self.getMsg('ERR_EMPTY_LINEWORKSAPIKEYS')
				self.responseAjaxResult()
				return
			
			# 新規登録
			if edit_type == 'new':
				
				payload = {
					'name': bot_name,
					'photoUrl': bot_photourl,
					'description': bot_description,
					'managers': UcfUtil.csvToList(bot_manager.strip().replace(' ', '')),
					'useCallback': True,
					'callbackUrl': bot_url,
					'callbackEvents': ['text', 'image', 'location']
				}
				result = lineworks_func.callLineWorksAPIBotAction('/message/v1', open_api_id, consumer_key, server_id, priv_key,
														  payload, 'POST')
				logging.debug(result)
				if not result:
					self._code = 400
					self._msg = self.getMsg('ERR_FAILED_TO_ACCESS_LINEWORKSAPI')
					self.responseAjaxResult()
					return
				else:
					result_json = json.JSONDecoder().decode(result.content)
					bot_no = result_json.get('botNo', 0)
				
				# regist bot to domain
				payload = {
					'usePublic': True
				}
				result = lineworks_func.callLineWorksRegisterDomain('/message/v1', open_api_id, consumer_key, server_id,
																	priv_key, payload, bot_no, domain_id, 'POST')
				logging.debug(result)
				if not result:
					self._code = 400
					self._msg = self.getMsg('ERR_FAILED_TO_ACCESS_LINEWORKSAPI2')
					self.responseAjaxResult()
					return
				else:
					if result.status_code != 200:
						result_json = json.JSONDecoder().decode(result.content)
						if result.status_code == 400 and result_json['code'] == 'ALREADY_REGISTERED_BOT':
							pass
						else:
							self._code = 400
							self._msg = self.getMsg('ERR_FAILED_TO_ACCESS_LINEWORKSAPI2')
							self.responseAjaxResult()
							return
				
				logging.info(result.content)
				
				# create rich menu
				richmenu_id = lineworks_func.createRichMenu(self, open_api_id, consumer_key, server_id, priv_key, bot_no)
			
			# BOT変更
			elif edit_type == 'renew':
				
				# check domain
				payload = {
					'usePublic': True
				}
				result = lineworks_func.callLineWorksRegisterDomain('/message/v1', open_api_id, consumer_key, server_id,
																	priv_key, payload, bot_no, domain_id, 'POST')
				if not result:
					self._code = 400
					self._msg = self.getMsg('ERR_FAILED_TO_ACCESS_LINEWORKSAPI2')
					self.responseAjaxResult()
					return
				else:
					if result.status_code != 200:
						result_json = json.JSONDecoder().decode(result.content)
						if result.status_code == 400 and result_json['code'] == 'ALREADY_REGISTERED_BOT':
							pass
						else:
							self._code = 400
							self._msg = self.getMsg('ERR_FAILED_TO_ACCESS_LINEWORKSAPI2')
							self.responseAjaxResult()
							return
				
				# update bot
				payload = {
					'name': bot_name,
					'photoUrl': bot_photourl,
					'description': bot_description,
					'useCallback': True,
					'callbackUrl': bot_url,
					'managers': UcfUtil.csvToList(bot_manager.strip().replace(' ', '')),
					'callbackEvents': ['text', 'image', 'location']
				}
				
				result = lineworks_func.callLineWorksAPIBotAction('/message/v1', open_api_id, consumer_key, server_id, priv_key,
														  payload, 'PUT', bot_no, 'update_bot')
				if not result:
					self._code = 400
					self._msg = self.getMsg('ERR_FAILED_TO_ACCESS_LINEWORKSAPI')
					self.responseAjaxResult()
					return
					
				# create rich menu
				richmenu_id = lineworks_func.createRichMenu(self, open_api_id, consumer_key, server_id, priv_key, bot_no)
			
			if bot_no:
				channel_config_jsondata['bot_no'] = UcfUtil.toInt(bot_no)
			
			if richmenu_id:
				channel_config_jsondata['richmenu_id'] = richmenu_id
			
			channel_config = json.JSONEncoder().encode(channel_config_jsondata)
			
			# modify file up lineworks config
			FileUpSettingConfig.modifyFileUpSettingConfig(unique_id, channel_config, channel_kind)
			
			operation_log_detail = req
			UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(),
									  UcfConfig.SCREEN_DASHBOARD, UcfConfig.OPERATION_TYPE_MODIFY_LINEWORKS_CONFIG, '',
									  '', self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))
			
			ret_value = {
				'bot_no': UcfUtil.toInt(bot_no) if bot_no else 0,
				'bot_url': bot_url,
				'unique_id': unique_id
			}
			
			self._code = 0
			self.responseAjaxResult(ret_value)
		
		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)