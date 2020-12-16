# coding: utf-8

from ucf.utils.helpers import TenantWebHookAPIHelper
from ucf.utils.ucfutil import UcfUtil
from ucf.config.ucfmessage import UcfMessage
import sateraito_func
import oem_func


class ChannelException(BaseException):
    pass

#class ClassProperty(property):
#	pass
#
#class PropertyMeta(type):
#	def __new__(cls, name, bases, namespace):
#		props = [(k, v) for k, v in namespace.items() if type(v) == ClassProperty]
#		for k, v in props:
#			setattr(cls, k, v)
#			del namesplace[k]
#		return type.__new__(cls, name, bases, namesplace)


############################################################
# チャネルベースクラス（インタフェース）
############################################################
class ChannelBase(TenantWebHookAPIHelper, object):

    # チャネル種別（要override）
    CHANNEL_KIND = ''
    # トリガーとして利用可能なチャネルか（ビジネスルール作成画面でラインナップに出すかの制御などに使用）
    IS_TRIGGER = False
    # アクションとして利用可能なチャネルか（ビジネスルール作成画面でラインナップに出すかの制御などに使用）
    IS_ACTION = False

    def __init__(self, params):
        self._language = params.get('language', '')
        self._oem_company_code = params.get('oem_company_code', '')
        pass

    def getSimpleValueByJSONXPath(self, contents, xpath):
        # / で始まらない場合はパスではなく値と判断してそのまま返す
        if xpath == '' or not xpath.startswith('/'):
            return xpath
        result = sateraito_func.getDataFromJsonByXPath(contents, xpath)
        if isinstance(result, list):
            if len(result) > 0:
                return result[0]
            else:
                return ''
        else:
            return result

    # チャネルごとの各種設定（例えば、LINE WORKS BOTならLINE WORKS API 用のキーなど）
    _channel_config = None

    @property
    def channel_config(self):
        return self._channel_config

    @channel_config.setter
    def channel_config(self, value):
        self._channel_config = value

    # トリガー　→　ビジネスルール　→　アクション　と持ち回るデータ（持ち回りながら加工されていく）
    # 基本は文字列だが複数の情報を取得するケースもあるのでJSONにしておく
    _contents = {}

    @property
    def contents(self):
        return self._contents

    @contents.setter
    def contents(self, value):
        self._contents = value

    def getMsgs(self):
        return UcfMessage.getMessageListEx(self._language)

    def getMsg(self, msgid, ls_param=()):
        msgid = oem_func.exchangeMessageID(msgid, self._oem_company_code)
        return UcfMessage.getMessage(UcfUtil.getHashStr(self.getMsgs(), msgid), ls_param)

    ## チャネルタイトル
    #@property
    #def title(self):
    #	raise Exception('need override by sub class.')
    #	#return u''

    ## チャネルの説明文
    #@property
    #def description(self):
    #	raise Exception('need override by sub class.')
    #	#return u''

    #[TRIGGER]WEBHOOK系リクエスト処理（REST、サテライトアドオン、BOTのWEBHOOKなど）
    # contentsを取得するのが目的。contentsの要素はチャネルごとに個別定義
    # ※（webhook処理があるタイプのチャネルでは要override）
    def executeWebhookProcess(self, tenant, rule_id):
        # self.contents = {}
        raise Exception('need override by sub class.')

    # def executeBusinessAction2(self, tenant, contents, channel_config):
    #     raise Exception('need override by sub class.')
    #
    # # [ACTION]アクションの実処理
    # def executeBusinessAction3(self, tenant, contents, channel_config, rule_row, action_row):
    #     raise Exception('need override by sub class.')
    #
    # # [ACTION]アクションの実処理
    # def executeBusinessAction(self, tenant, target_users, contents, channel_config, rule_row, action_row):
    #     raise Exception('need override by sub class.')

    def getChatSessionId(self, tenant, contents, rule_row, language, oem_company_code):
        raise Exception('need override by sub class.')

    def getChatSessionDb(self):
        raise Exception('need override by sub class.')

    # def loadChatSession(self):
    # 	raise Exception('need override by sub class.')
    
    # def saveChatSession(self):
    # 	raise Exception('need override by sub class.')

    # def getBotStorageId(self, tenant, contents, rule_row, language, oem_company_code):
    #     raise Exception('need override by sub class.')

    # [ACTION]アクションの実処理
    # def executeAction(self, tenant, target_users, contents, channel_config, rule_row, action_row):
    #     raise Exception('need override by sub class.')
    def executeAction(self, tenant, target_users, contents, channel_config):
        raise Exception('need override by sub class.')

    def saveChatSession(self, tenant, contents, rule_row, language, oem_company_code, chat_session):
        raise Exception('need override by sub class.')
