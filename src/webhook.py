#!/usr/bin/python
# coding: utf-8

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import os
import webapp2
import urllib
import datetime
import logging
import json
import gc
#from google.appengine.api import namespace_manager
#from google.appengine.api import taskqueue
#from google.appengine.api import memcache
#from google.appengine.ext import db
#from google.appengine.ext.db.metadata import Namespace
#from google.appengine.api import urlfetch
#import google.appengine.api.runtime
from ucf.utils.ucfutil import UcfUtil
from ucf.utils.models import *
from ucf.utils.helpers import TenantWebHookAPIHelper
import sateraito_inc
import sateraito_func
import sateraito_db
import oem_func
import channels


############################################
# WebHook用ページ
# - LINE WORKS Talk BOT のcallback
# - Gmailのプッシュ通知（webhook版）などを想定
############################################
class WebHookPage(TenantWebHookAPIHelper):

    #[TRIGGER]WEBHOOK系リクエスト処理（REST、サテライトアドオン、BOTのWEBHOOKなど）
    def executeWebhookProcess(self, tenant, rule_id):
        logging.info('**** requests *********************')
        logging.info(self.request)
        logging.info('language=' + str(self._language))

        # ビジネスルールを取得
        # rule_row = sateraito_db.BusinessRule.getInstance(rule_id)
        
        rule_row = FileUpSettingConfig.getInstance(rule_id)
    
        if rule_row is None:
            logging.warning('not found business rule.')
            self.response.set_status(400)
            return

        logging.info('channel_kind' + str(rule_row.channel_kind))

        # トリガー種別から実行するクラスを決定
        channel = None
        for channel_class in channels.channel_classes:
            logging.info(channel_class)
            if channel_class.CHANNEL_KIND == rule_row.channel_kind:
                channel = channel_class({'language': self._language, 'oem_company_code': self._oem_company_code})
                break
        else:
            logging.error('invalid channel_kind' + str(rule_row.channel_kind))
            self.response.set_status(400)
            return

        logging.info(channel)

        channel_config = None
        if rule_row.channel_config is not None and rule_row.channel_config != '':
            channel_config = json.JSONDecoder().decode(rule_row.channel_config)
        else:
            logging.error('channel_config is not JSON format.')
            self.response.set_status(500)
            return

        # logging.info(channel_config)

        # トリガー処理実行
        channel.request = self.request
        channel.response = self.response
        channel.channel_config = channel_config
        if self._request_type == UcfConfig.REQUEST_TYPE_GET:
            channel.get(tenant, rule_id)
        elif self._request_type == UcfConfig.REQUEST_TYPE_POST:
            # logging.debug('post to: {}'.format(rule_row.channel_kind))
            channel.post(tenant, rule_id)
        else:
            logging.error('invalid http method.')
            self.response.set_status(405)
            return

        self._status = channel._status
        self._msg = channel._msg

        # logging.info(channel.contents)

        # channel_contents = channel.contents
        channel_contents = getattr(channel, 'contents', {})
        if channel_contents:
            try:
                logging.info(json.dumps(channel_contents))
            except:
                logging.info(channel_contents)

        # # goku add and edited
        # # in the case the trigger channel send event not that we expect
        # # therefore should not trigger any action
        # if channel_contents:
        # 	pass
        #
        # else:
        # 	# トリガーの履歴登録
        # 	client_ip = self.getClientIPAddress()
        # 	user_agent = self.getUserAgent()
        #
        # 	if isinstance(channel_contents, (list, tuple)):
        # 		# in case 1 trigger but have many events like facebook
        # 		for event_data in channel_contents:
        # 			row = businessrulehandler.registBusinessTrigger(tenant, rule_row, event_data, client_ip=client_ip, user_agent=user_agent)
        # 			businessrulehandler.kickBusinessRuleActionQueue(tenant, rule_id, row.unique_id, event_data)
        #
        # 	else:
        # 		row = businessrulehandler.registBusinessTrigger(tenant, rule_row, channel_contents, client_ip=client_ip, user_agent=user_agent)
        # 		# ビジネスルール処理（channel_contentsの変換が目的. アクションの分岐はない）
        # 		businessrulehandler.kickBusinessRuleActionQueue(tenant, rule_id, row.unique_id, channel_contents)

        # goku add
        # to scope with facebook way handle subscribe webhook
        # when webhook subscribe, facebook will send a get request to callback url to verify
        get_response = getattr(channel, '_response', '')
        
        logging.info(get_response)
        
        if get_response:
            # logging.debug('response: {}'.format(get_response))
            # for work with facebook register webhook
            # self.response.set_status(channel.response.status_code)
            self.response.set_status(200)
            self.response.out.write(get_response)
            # self.response.out.write(json.JSONEncoder().encode({'status': self._status, 'msg': get_response}))

        else:
            self.response.out.write(json.JSONEncoder().encode({'status': self._status, 'msg': self._msg}))


app = webapp2.WSGIApplication([('/webhook/([^/]*)/([^/]*)', WebHookPage)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
