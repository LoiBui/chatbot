# coding: utf-8

import os,sys,random,datetime,Cookie
import traceback
import logging
import jinja2
from google.appengine.api import memcache
from google.appengine.api import users
#from google.appengine.ext import webapp
import webapp2
#from webapp2_extras import sessions
from ucf.sessions import get_current_session
from ucf.utils.ucfutil import *
from ucf.config.ucfconfig import *
from ucf.config.ucfmessage import *
from ucf.utils.ucfxml import *
from google.appengine.api import namespace_manager
from ucf.utils import ucffunc,jinjacustomfilters
from simplejson.encoder import JSONEncoder
from ucf.pages.dept import *

import sateraito_inc
import sateraito_func
import oem_func
#import sateraito_black_list
import sateraito_jinja2_environment


############################################################
## ヘルパー（共通）
############################################################
class Helper(webapp2.RequestHandler):

    # oem_company_code
    _oem_company_code = oem_func.OEM_COMPANY_CODE_DEFAULT
    # sp_codes
    _sp_codes = []
    # タイムゾーン
    _timezone = sateraito_inc.DEFAULT_TIMEZONE
    # 多言語対応
    _language = sateraito_inc.DEFAULT_LANGUAGE
    # エラーページＵＲＬ（デフォルトから変更したい場合は各Pageにてセット）
    _error_page = ''
    _approot_path = ''
    # ルートフォルダパス
    _root_folder_path = ''
    # キャリアタイプ（PC,MB,SP,API）
    _career_type = ''
    # キャリア（PC,DOCOMO,AU,SOFTBANK）
    _career = ''
    # Androidフラグ
    _is_android = False
    # iOSフラグ
    _is_ios = False
    # デザインタイプ（pc,m,sp）
    _design_type = ''
    # ページタイプ
    _page_type = ''
    # Requestタイプ（GET or POST）
    _request_type = ''
    #msgs = None
    #_msgs_language = ''
    _is_api = False
    _client_ip_for_api = ''		# APIアクセス時にAPIから本来のクライアントIPアドレスが渡されてくる場合に使用（プロファイルのアクセス環境振り分けなどに使用）
    _device_distinguish_id_for_api = ''		# APIアクセス時の端末識別子
    _device_mac_address_for_api = ''		# APIアクセス時のMACアドレス
    _device_identifier_for_vendor_for_api = ''
    #_access_key_id_for_api = ''		# APIアクセス時のアクセスキーID
    _access_key_for_api = ''		# APIアクセス時のアクセスキー
    _career_type_for_api = ''
    #_user_agent_for_api = ''		# APIアクセス時にAPIから本来のユーザーエージェントが渡されてくる場合に使用（プロファイルのアクセス環境振り分けなどに使用）
    _application_id = ''

    def init(self):
        u''' 抽象メソッドイメージ '''
        pass

    def onLoad(self):
        u''' オンロード（抽象メソッドイメージ）
            Helperを継承する一番子供のクラスで必要に応じてオーバーロードするためのメソッド
            先頭で初期化しておきたい処理などに使用
         '''

        # X-Forwarded-ForIPアドレスを取得しておく
        self.getSessionHttpHeaderXForwardedForIPAddress()

    def dispatch(self):
        ##このリクエストに対するセッションストアを作る
        #self.session_store = sessions.get_store(request=self.request)		# webapp2_extras用
        try:
            #ディスパッチャーの起動
            webapp2.RequestHandler.dispatch(self)
        finally:
            ## セッションを保存
            #self.session_store.save_sessions(self.response)		# webapp2_extras用
            pass

    def session(self):
#		backend = self.session_store.config.get('default_backend','memcache')
#		return self.session_store.get_session(backend=backend)
        #return self.session_store.get_session()			# webapp2_extras用
        return get_current_session()								# gaesessions用

    def getMsgs(self):
        #if self.msgs == None or self._msgs_language != self._language:
        #	self.msgs = UcfMessage.getMessageList(self._approot_path, self._language)
        #	self._msgs_language = self._language
        #return self.msgs
        return UcfMessage.getMessageListEx(self._language)

    def getMsg(self, msgid, ls_param=()):
        msgid = oem_func.exchangeMessageID(msgid, self._oem_company_code)
        return UcfMessage.getMessage(UcfUtil.getHashStr(self.getMsgs(), msgid), ls_param)

    def getRootPath(self):
        u'''ルートパスを取得'''
        return self._root_folder_path

    def getAppRootFolderPath(self):
        return self._approot_path

    # 現在のURLをHTTPSに変換
    def exchangeToHttpsUrl(self):
        current_url = self.request.url
        current_url_lower = current_url.lower()
        https_url = ''
        # ＵＲＬのドメイン部分を除く（例：manager/xxxx、manager/）
        if current_url_lower.startswith("http://"):
            https_url = 'https://' + UcfUtil.subString(current_url, len("http://"))
        elif current_url_lower.startswith("https://"):
            https_url = 'https://' + UcfUtil.subString(current_url, len("https://"))
        else:
            https_url = self.request.url
        return https_url

    # 現在のページがSSLかどうかを判定
    def isSSLPage(self):
        current_url = self.request.url.lower()
        return current_url.startswith("https://")

    def getTemplateFolderPath(self):
        u'''テンプレートフォルダパスを取得'''
        return os.path.join(self.getAppRootFolderPath(), UcfConfig.TEMPLATES_FOLDER_PATH)

    def getTemplateFilePath(self, filename):
        u'''テンプレートファイルパスを取得'''
        return os.path.join(self.getTemplateFolderPath(), filename)

    def getLocalTemplateFolderPath(self):
        u'''ローカルテンプレートフォルダパスを取得(絶対パス)'''
        return os.path.normpath(os.path.join(os.getcwd(), UcfConfig.TEMPLATES_FOLDER_PATH))

    def getLocalTemplateFilePath(self, filename):
        u'''ローカルテンプレートファイルパスを取得(相対パス)'''
        return os.path.normpath(os.path.join(UcfConfig.TEMPLATES_FOLDER_PATH, filename))

    def getParamFolderPath(self):
        u'''パラメーターフォルダパスを取得'''
        return os.path.normpath(os.path.join(self.getAppRootFolderPath(), UcfConfig.PARAM_FOLDER_PATH))

    def getParamFilePath(self, filename):
        u'''パラメーターファイルパスを取得'''
        return os.path.normpath(os.path.join(self.getParamFolderPath(), filename))

    def getLocalParamFolderPath(self):
        u'''ローカルパラメーターフォルダパスを取得(絶対パス)'''
        return os.path.normpath(os.path.join(os.getcwd(), UcfConfig.PARAM_FOLDER_PATH))

    def getLocalParamFilePath(self, filename):
        u'''ローカルパラメーターファイルパスを取得(相対パス)'''
        return os.path.normpath(os.path.join(UcfConfig.PARAM_FOLDER_PATH, filename))

    def getImagesFolderPath(self):
        u'''パラメーターフォルダパスを取得'''
        return os.path.normpath(os.path.join(self.getAppRootFolderPath(), UcfConfig.IMAGES_FOLDER_PATH))

    def getImagesFilePath(self, filename):
        u'''パラメーターファイルパスを取得'''
        return os.path.normpath(os.path.join(self.getImagesFolderPath(), filename))

    def judgeTargetCareer(self):
        u'''UserAgentからキャリアタイプを自動判定'''
        strTargetCareer, strTargetCareerType, strDesignType, is_android, is_ios = self.getTargetCareer()
        #内部変数にセット
        self._career = strTargetCareer
        self._career_type = strTargetCareerType
        self._design_type = strDesignType
        self._is_android = is_android
        self._is_ios = is_ios

    def getTargetCareer(self, is_disable_fp=False):
        u'''UserAgentからキャリアタイプを自動判定'''
        # ※ProfileUtilsの_judgeUserAgentToMatchUserAgentIDメソッドとも連動したい
        #環境変数の取得
        strAgent =  self.getUserAgent().lower()
        strJphone = self.getServerVariables("HTTP_X_JPHONE_MSNAME").lower()
        strAccept = self.getServerVariables("HTTP_ACCEPT").lower()

        # 海外展開対応：ガラ携帯の制御をしないフラグをみる （2015.07.09）
        # ※せめてスマホ判定をしたほうがよい気もするが、海外のガラ携帯（？）との統一性を保つためあえて考慮しない
        #logging.info('is_disable_fp=' + str(is_disable_fp))

        # ユーザエージェント判定
        strTargetCareer = None
        strTargetCareerType = None
        strDesignType = None
        is_android = False
        is_ios = False

        # WS-Federation対応：個別にスマホ判定すべきものだけ優先的に処理（ここではPC or スマホ or 、、、くらいが判別できればOKなため） 2015.09.11
        # iPhone版Lyncアプリ
        if strAgent.find('Lync Mobile'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
            is_ios = True
        # Android版Lyncアプリ
        elif strAgent.find('ACOMO'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
            is_android = True

        # Orkney Upward というモバイルアプリ（セールスフォース関連アプリとしてメジャーらしいのでスマホ版デザイン対応） 2015.12.11
        elif strAgent.find('Orkney Upward for iOS'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
            is_ios = True

        # CACHATTOセキュアブラウザ 2016/02/21（DOCOMO の文字があるのでガラ携帯より前で処理） 追加
        elif strAgent.find('Cachatto'.lower())>=0:
            # iPhone（SecureBrowser for iPhone）
            # 例：Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X)AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12D508 Model/iPhone6,1Cachatto/3.18.0
            if strAgent.find('iPhone'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_ios = True
            # iPod
            elif strAgent.find('iPod'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_ios = True
            # iPad
            # 例：Mozilla/5.0 (iPad; CPU OS 9_2_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13D15 Model/iPad4,1 Cachatto-iPad/3.18.0
            elif strAgent.find('iPad'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
                is_ios = True
            # Android
            # [WebView UA] Cachatto-Android/[x.y.z] (CACHATTO SecureBrowser V[x.y.z] B[build]; [キャリア名]; [キャリアコード])
            # [WebView UA] Cachatto-Android/[x.y.z] (CACHATTO SecureBrowser V[x.y.z] B[build]; [キャリア名]; [キャリアコード])
            elif strAgent.find('Android'.lower())>=0 and strAgent.find('Mobile'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_android = True
            # Android（タブレット）
            elif strAgent.find('Android'.lower())>=0 and strAgent.find('Mobile'.lower())<0:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
                is_android = True
            # その他はPC扱い（SecureBrowser for Windows、CACHATTO Desktop）
            # Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/6.0; SLCC2)Cachatto-Agent/3.5.0 (B2013070700)
            # Mozilla/5.0 (Windows NT 6.2; WOW64; Trident/7.0; rv:11.0) like Gecko CACHATTO Desktop/1.8.48; Cachatto-Agent/3.10.3 (B2015121700)
            else:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC

        # Blackberry
        elif strAgent.find('BlackBerry'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
        # WindowsPhone
        elif strAgent.find('IEMobile'.lower())>=0 or strAgent.find('Windows Phone'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
        # WILLCOM
        elif not is_disable_fp and (strAgent.find('WILLCOM'.lower())>=0 or strAgent.find('DDIPOCKET'.lower())>=0):
            strTargetCareer = UcfConfig.VALUE_CAREER_WILLCOM
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_MOBILE
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_MOBILE
        # SoftBank
        elif not is_disable_fp and (strJphone!='' or strAgent.find('j-phone'.lower())>=0 or strAgent.find('softbank'.lower())>=0 or strAgent.find('vodafone'.lower())>=0 or strAgent.find('mot-'.lower())>=0):
            strTargetCareer = UcfConfig.VALUE_CAREER_SOFTBANK
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_MOBILE
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_MOBILE
        # au
        elif not is_disable_fp and (strAgent.find('kddi'.lower())>=0 or strAgent.find('up.browser'.lower())>=0 or strAccept.find('hdml'.lower())>=0):
            strTargetCareer = UcfConfig.VALUE_CAREER_EZWEB
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_MOBILE
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_MOBILE
        # Docomo
        elif not is_disable_fp and (strAgent.find('docomo'.lower())>=0):
            strTargetCareer = UcfConfig.VALUE_CAREER_IMODE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_MOBILE
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_MOBILE
        # KAITO
        elif strAgent.find('KAITO'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
        # CLOMOセキュリティブラウザ 2013/10/16 追加	※ここではPCなのかとかを決めるだけなので不要なのでは？？？
        elif strAgent.find('SecuredBrowser'.lower())>=0 and strAgent.find('.securedbrowser'.lower())>=0:
            # iPhone
            if strAgent.find('iPhone OS 2_0'.lower())>=0 or strAgent.find('iPhone'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_ios = True
            # iPod
            elif strAgent.find('iPod'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_ios = True
            # Android
            elif strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_android = True
            # Android（タブレット）
            elif strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())<0:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
                is_android = True
            # iPad
            elif strAgent.find('iPad'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
                is_ios = True
            # その他はPC扱い
            else:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
        # IIJセキュリティブラウザ 2013/12/05 追加	※ここではPCなのかとかを決めるだけなので不要なのでは？？？
        #elif strAgent.find('IIJsmb/'.lower())>=0:
        elif strAgent.find('IIJsmb'.lower())>=0:
            # iPhone
            if strAgent.find('iPhone'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_ios = True
            # iPod
            elif strAgent.find('iPod'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_ios = True
            # Android
            #elif strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())>=0:
            elif strAgent.find('Android'.lower())>=0 and strAgent.find('Mobile'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
                is_android = True
            # Android（タブレット）
            #elif strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())<0:
            elif strAgent.find('Android'.lower())>=0 and strAgent.find('Mobile'.lower())<0:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
                is_android = True
            # iPad
            elif strAgent.find('iPad'.lower())>=0:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
                is_ios = True
            # その他はPC扱い
            else:
                strTargetCareer = UcfConfig.VALUE_CAREER_PC
                strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
                strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
        # iPhone
        # WindowsMobileにもiPhoneと含まれるケースがあるので除外 2015.12.24
        #elif (strAgent.find('iPhone OS 2_0'.lower())>=0 or strAgent.find('iPhone'.lower())>=0) and not strAgent.find('iPad'.lower())>=0:
        elif strAgent.find('iPhone'.lower())>=0 and not strAgent.find('iPad'.lower())>=0 and not strAgent.find('Windows Phone'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
            is_ios = True
        # iPod
        elif strAgent.find('iPod'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
            is_ios = True
        # Android
        elif strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_MOBILE
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_SP
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP
            is_android = True
        # Android（タブレット）
        elif strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())<0:
            strTargetCareer = UcfConfig.VALUE_CAREER_PC
            #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
            is_android = True
        # iPad
        elif strAgent.find('iPad'.lower())>=0:
            strTargetCareer = UcfConfig.VALUE_CAREER_PC
            #strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_TABLET
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
            is_ios = True
        ## SSOCLIENT
        #elif strAgent.find('UcfSSOClient'.lower())>=0:
        #	strTargetCareer = UcfConfig.VALUE_CAREER_PC
        #	strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
        #	strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC
        #デフォルトは、PC
        else:
            strTargetCareer = UcfConfig.VALUE_CAREER_PC
            strTargetCareerType = UcfConfig.VALUE_CAREER_TYPE_PC
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_PC

        # WorksMobile関連アプリ 2016/01/19 追加	※WorksMobileアプリは、PC、Mac、スマホ全て小さい画面なのでスマホ版として表示
        if strAgent.find('WorksMobile'.lower())>=0:
            strDesignType = UcfConfig.VALUE_DESIGN_TYPE_SP

        return strTargetCareer, strTargetCareerType, strDesignType, is_android, is_ios

    def get(self):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self.init()
        self.onLoad()
        self.processOfRequest()

    def post(self):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self.init()
        self.onLoad()
        self.processOfRequest()

    def processOfRequest(self):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def render(self, template_name, design_type, vals, content_type=None):

        # 文字コード指定：これをやらないとmetaタグだけでは文字コードをブラウザが認識してくれないため。
        #self.response.headers['Content-Type'] = 'text/html; charset=' + UcfConfig.ENCODING + ';'
        #encodeとcharsetのマッピング対応 2009.5.20 Osamu Kurihara
        if UcfConfig.ENCODING=='cp932':
             charset_string='Shift_JIS'
            #charset_string = UcfConfig.FILE_CHARSET
        #マッピング定義がないものはUcfConfig.ENCODING
        else:
            charset_string=UcfConfig.ENCODING

        if content_type is None or content_type == '':
            content_type = 'text/html'
        self.response.headers['Content-Type'] = content_type + '; charset=' + charset_string + ';'

        # レンダリング
        jinja_environment = sateraito_jinja2_environment.getEnvironmentObj(design_type)
        template = jinja_environment.get_template(template_name)
        self.response.out.write(template.render(vals))

    def setResponseHeaderForDownload(self, file_name, enc=UcfConfig.ENCODING):
        u'''CSVダウンロード用のレスポンスヘッダを設定'''

        #TODO 本番環境で日本語ファイル名がうまくいかない.エンコードの問題っぽいけど。→今ならいけるかも
        # Content-Disposition にマルチバイト文字を埋め込むときはUTF-8でよさそう Osamu Kurihara
        # self.response.headers['Content-Disposition'] = 'inline;filename=' + unicode(file_name).encode(enc)
        self.response.headers['Content-Disposition'] = 'attachment;filename=' + unicode(file_name).encode(enc)
#		self.response.headers['Content-Type'] = 'application/Octet-Stream-Dummy'
        self.response.headers['Content-Type'] = 'application/octet-stream'


    def redirectError(self, error_info):
        u'''エラーページに遷移'''
        logging.debug(error_info)
        self.setSession(UcfConfig.SESSIONKEY_ERROR_INFO, error_info)
        self.redirect(self._error_page)

    def redirectSuccess(self, success_info,success_url):
        self.setSession(UcfConfig.SESSIONKEY_REGIST_USER_INFO, success_info)
        self.redirect(success_url)

    def decryptoForCookie(self, enc_value):
        try:
            return UcfUtil.deCrypto(enc_value, UcfConfig.COOKIE_CRYPTOGRAPIC_KEY)
        except Exception, e:
            logging.warning('enc_value=' + enc_value)
            logging.warning(e)
            return enc_value

    def encryptoForCookie(self, value):
        return UcfUtil.enCrypto(str(value), UcfConfig.COOKIE_CRYPTOGRAPIC_KEY)

    def decryptoData(self, enc_value, enctype=''):
        try:
            if enctype == 'AES':
                return UcfUtil.deCryptoAES(enc_value, UcfConfig.COOKIE_CRYPTOGRAPIC_KEY)
            else:
                return UcfUtil.deCrypto(enc_value, UcfConfig.COOKIE_CRYPTOGRAPIC_KEY)
        except Exception, e:
            logging.warning('enc_value=' + enc_value)
            logging.warning(e)
            return enc_value

    def encryptoData(self, value, enctype=''):
        if enctype == 'AES':
            return unicode(UcfUtil.enCryptoAES(str(value), UcfConfig.COOKIE_CRYPTOGRAPIC_KEY))
        else:
            return unicode(UcfUtil.enCrypto(str(value), UcfConfig.COOKIE_CRYPTOGRAPIC_KEY))

    ############################################################
    ## クッキー
    ############################################################
    def getCookie(self, name):
        u'''クッキーの値を取得（なければNone）'''
        cookie = Cookie.SimpleCookie(self.request.headers.get('Cookie'))
#		cookie = Cookie.SimpleCookie(os.environ.get('HTTP_COOKIE'))
        if cookie.get(name) is not None:
#			return cookie.get(name).value
            value = cookie.get(name).value
            # 復号化
            try:
                value = self.decryptoForCookie(UcfUtil.urlDecode(value))
            except Exception, e:
                logging.exception(e)
                value = value

            return value

        else:
            return None

    def setCookie(self, name, value, expires=None,is_secure=False, path='/', tenant=''):
        u'''クッキーの値をセット（期限指定無しの場合は無期限）'''

        if expires is None or expires == '':
            expires = UcfUtil.getDateTime('2037/12/31').strftime(UcfConfig.COOKIE_DATE_FMT)

        # 暗号化
#		try:
        value = UcfUtil.urlEncode(self.encryptoForCookie(unicode(value)))
#		except Exception, e:
#			logging.exception(e)
#			value = value
        if not sateraito_inc.http_mode and is_secure:
            self.response.headers.add_header('Set-Cookie', str(name) + '=' + value + ';' + 'expires=' + str(expires) + ';' + 'Path=' + str(path) + ';' + (('domain=' + str(tenant) + ';') if tenant != '' else '') + 'secure')
        else:
            self.response.headers.add_header('Set-Cookie', str(name) + '=' + value + ';' + 'expires=' + str(expires) + ';' + 'Path=' + str(path) + ((';' + 'domain=' + str(tenant) + ';') if tenant != '' else ''))

    def clearCookie(self, name, path=None, tenant=''):
        u'''クッキーの値をクリア'''
        self.response.headers.add_header('Set-Cookie', str(name) + '=;' + 'expires=' + 'Wed, 01-Jan-1970 00:00:00 GMT' + ';' + 'Path=' + str(path) + ((';' + 'domain=' + str(tenant) + ';') if tenant != '' else ''))

    ############################################################
    ## セッション
    ############################################################
    def setSession(self, key, value):
        u'''セッションのセット'''
        self.session()[key] = value

    def getSession(self, key):
        u'''セッションの取得'''
        return self.session().get(key, None)

    ############################################################
    ## リクエスト値
    ############################################################
    def getRequest(self, key):
        u'''Requestデータの取得'''
        # 同一名の複数POSTに対応
        value = ''
        list = self.request.get_all(key)
        i = 0
        for v in list:
            if i > 0:
                value += ','
            value += v
            i += 1
        if value != None:
            # ファイルオブジェクトなどをスルーするために変換できないものは無視（微妙？） 2009/11/19 T.ASAO
            try:
                value = unicode(value)	# unicodeに変換
            except:
                pass

        return value

    def getRequests(self, key):
        u'''Requestデータの取得(リスト形式で返す)'''
        # 同一名の複数POSTに対応
#		value = self.request.get(key)
        list = self.request.get_all(key)
        for v in list:
            v = unicode(v)	# unicodeに変換
        return list

    # クライアントのIPアドレスを取得
    def getClientIPAddress(self):
        return UcfUtil.getHashStr(os.environ, 'REMOTE_ADDR')

    # クライアントの[HTTP_X_FORWARDED_FOR]IPアドレスを取得
    def getClientForwardedForIPAddress(self):
        return UcfUtil.getHashStr(os.environ, 'HTTP_X_FORWARDED_FOR')

    # クライアントの[HTTP_X_FORWARDED_FOR]IPアドレスを取得
    # ※取得できたタイミングでセッションに保持しておきそこから取得（HTTPSでは取得できないので）
    def getSessionHttpHeaderXForwardedForIPAddress(self):
        result = ''
        # 今回のHTTPヘッダから取得
        ip = self.getClientForwardedForIPAddress()
        # 取得できたら
        if ip != '':
            # セッションも更新
            result = ip
            self.setSession(UcfConfig.SESSIONKEY_XFORWARDEDFOR_IP, ip)
        # 取得できなかったら
        else:
            result = UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_XFORWARDEDFOR_IP))

        # 末尾のIPアドレスを使用
        if result.find(',') >= 0:
            ip_ary = result.split(',')
            result = ip_ary[len(ip_ary) - 1]
            result = result.strip()
        return result

    def getUserAgent(self):
        u'''UserAgentの取得'''

        # ActiveSync対応…ActiveSync接続時にはUserAgentではなくこちらがセットされてくるので 2015.09.10
        if self.getRequestHeaders('X-Ms-Client-User-Agent').strip() != '':
            return self.getRequestHeaders('X-Ms-Client-User-Agent').strip()
        # SSOログインアプリからマルチバイト文字列がURLエンコードされてくる場合があるので一応デコードを試みる
        #return str(self.request.user_agent)
        try:
            return str(UcfUtil.urlDecode(self.request.user_agent))
        except BaseException, ex:
            return str(self.request.user_agent)

    def getRequestHeaders(self, key=None):
        u'''HTTPリクエストヘッダー値の取得'''
        if key:
            return self.request.headers.get(key, '')
        else:
            #TODO できればCloneして返したい
            return self.request.headers

    def getServerVariables(self, key):
        u'''サーバー環境変数値Request.environの取得'''
        if key:
            return self.request.environ.get(key, '')
        else:
            #TODO できればCloneして返したい
            return self.request.environ

    def outputErrorLog(self, e):
        logging.exception(e)
        #u''' 例外をログ出力する （抽象メソッドイメージ）'''
        #try:
        #	exc_type, exc_value, exc_traceback = sys.exc_info()
        #	logging.error(repr(traceback.format_exception(exc_type, exc_value, exc_traceback)))
        #except BaseException, ex:
        #	logging.exception(ex)
        #	pass

    def _createConfigForTemplate(self):
        return {}



############################################################
## ヘルパー…cron用
############################################################
class CronHelper(Helper):
    def init(self):
        pass

    def get(self):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self.init()
        self.processOfRequest()

    def post(self):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self.init()
        self.onLoad()
        self.processOfRequest()

    def processOfRequest(self):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

############################################################
## メンテナンスサイトヘルパー
############################################################
class ManageHelper(Helper):

    SESSIONKEY_MANAGER_LOGIN_ID = 'mlid'

    def init(self):

        self._root_folder_path = ''
        # エラーページＵＲＬ
        if self._error_page == None or self._error_page == '':
            self._error_page = UcfConfig.URL_ERROR

        #キャリア判定
        self.judgeTargetCareer()

        #UcfConfig.TIME_ZONE_HOUR = 9	# ベタで日本時間
        #UcfConfig.TIMEZONE = 'Asia/Tokyo'	# ベタで日本時間
        self._timezone = 'Asia/Tokyo'	# ベタで日本時間

    def getDeptInfo(self):
        return {}

    # テンプレートに渡す基本情報をセット
    def appendBasicInfoToTemplateVals(self, template_vals):
        template_vals['config'] = self._createConfigForTemplate()
        template_vals['version'] = UcfUtil.md5(sateraito_inc.version)
        template_vals['vurl'] = '/manager/'
        template_vals['vscripturl'] = '/script/' if not sateraito_inc.debug_mode else '/script/debug/'
        template_vals['language'] = sateraito_inc.DEFAULT_LANGUAGE
        template_vals['extjs_locale_file'] = sateraito_func.getExtJsLocaleFileName(sateraito_inc.DEFAULT_LANGUAGE)
        template_vals['lang'] = self.getMsgs()
        template_vals['user_email'] = UcfUtil.nvl(self.getSession(self.SESSIONKEY_MANAGER_LOGIN_ID))
        template_vals['FREE_MODE'] = False	# 無償バージョンかどうか

    # ログインチェック
    def checkLogin(self, not_redirect=False):
        is_login = False
        if UcfUtil.nvl(self.getSession(self.SESSIONKEY_MANAGER_LOGIN_ID)) != '':
            is_login = True
            user_email = UcfUtil.nvl(self.getSession(self.SESSIONKEY_MANAGER_LOGIN_ID))
            return is_login, user_email

        user_email = ''
        user = users.get_current_user()
        if not user:
            if not_redirect == False:
                self.setSession(self.SESSIONKEY_MANAGER_LOGIN_ID, '')
                # Federated Login 廃止に伴い変更 2014.07.24
                #login_url = users.create_login_url(self.request.url, None, sateraito_inc.MANAGE_DOMAIN)
                login_url = users.create_login_url(self.request.url)
                self.redirect(login_url)
            return is_login, user_email

        if user.email() not in UcfUtil.csvToList(sateraito_inc.MANAGE_EMAIL):
            if not_redirect == False:
                self.setSession(self.SESSIONKEY_MANAGER_LOGIN_ID, '')
                logout_url = users.create_logout_url(self.request.url)
                self.redirect(logout_url)
            return is_login, user_email

        # GET parameters

        # Date to start export
        # Response Mode
        # Protect Code Check
        pc_long = self.request.get('pc')
        if pc_long is None:
            if not_redirect == False:
                logging.exception('wrong access: wrong protect code')
                # リダイレクトはしない
                #self.redirect('/manager/error')
                self.response.out.write('invalid access.')
            return is_login, user_email
        pc = pc_long[0:(len(pc_long) - 2)]
        if pc != sateraito_inc.MANAGE_PROTECT_CODE:
            if not_redirect == False:
                logging.exception('wrong access: wrong protect code')
                # リダイレクトはしない
                #self.redirect('/manager/error')
                self.response.out.write('invalid access.')
            return is_login, user_email
        # Day Code Check
        day_code = pc_long[(len(pc_long) - 2):]
        now = UcfUtil.getNowLocalTime(self._timezone)
        now_day = str(now.strftime('%d')).zfill(2)
        if day_code != now_day:
            logging.exception('wrong access: day code')
            if not_redirect == False:
                # リダイレクトはしない
                #self.redirect('/manager/error')
                self.response.out.write('invalid access.')
            return is_login, user_email

        is_login = True
        user_email = user.email()
        self.setSession(self.SESSIONKEY_MANAGER_LOGIN_ID, user_email)

        if is_login == False and not_redirect == False:
            # リダイレクトはしない
            #self.redirect('/manager/error')
            self.response.out.write('invalid access.')
        return is_login, user_email

    # ログアウト
    def logout(self):
        self.setSession(self.SESSIONKEY_MANAGER_LOGIN_ID, '')
        logout_url = users.create_logout_url('/manager/index')
        self.redirect(logout_url)

    def checkAccessIPAddress(self):
        u''' アクセスIPアドレスをチェック '''
        accept_ip_address_list = sateraito_inc.MANAGER_SITE_ACCEPT_IP_ADDRESS_LIST
        deny_ip_address_list = ()
        is_ok = UcfUtil.isCheckIPAddressRange(self.getClientIPAddress(), accept_ip_address_list, deny_ip_address_list)
        if is_ok == False:
            self.response.set_status(403)
        return is_ok

############################################################
## サイトルートヘルパー
############################################################
class FrontHelper(Helper):
#	def __init__(self):
#		# 親のコンストラクタをコール
#		Helper.__init__(self)

    def init(self):

        u'''フロントサイト用の初期化'''
        self._root_folder_path = ''
        # エラーページＵＲＬ
        if self._error_page == None or self._error_page == '':
            self._error_page = UcfConfig.URL_ERROR

        #キャリア判定
        self.judgeTargetCareer()

    def _createConfigForTemplate(self):
        config = {}

        config['QSTRING_STATUS'] = UcfConfig.QSTRING_STATUS
        config['VC_CHECK'] = UcfConfig.VC_CHECK
        config['QSTRING_TYPE'] = UcfConfig.QSTRING_TYPE
        config['QSTRING_CODE'] = UcfConfig.QSTRING_CODE
        config['EDIT_TYPE_RENEW'] = UcfConfig.EDIT_TYPE_RENEW
        config['EDIT_TYPE_NEW'] = UcfConfig.EDIT_TYPE_NEW
        config['EDIT_TYPE_COPYNEWREGIST'] = UcfConfig.EDIT_TYPE_COPYNEWREGIST
        config['QSTRING_TYPE2'] = UcfConfig.QSTRING_TYPE2
        config['EDIT_TYPE_DELETE'] = UcfConfig.EDIT_TYPE_DELETE
        config['EDIT_TYPE_REFER'] = UcfConfig.EDIT_TYPE_REFER

        return config


    # テンプレートに渡す基本情報をセット
    def appendBasicInfoToTemplateVals(self, template_vals):
#		template_vals['my_site_url'] = sateraito_inc.my_site_url
        template_vals['config'] = self._createConfigForTemplate()
        template_vals['version'] = UcfUtil.md5(sateraito_inc.version)
        template_vals['vurl'] = '/'
        template_vals['vscripturl'] = '/script/' if not sateraito_inc.debug_mode else '/script/debug/'
        #template_vals['language'] = sateraito_inc.DEFAULT_LANGUAGE
        template_vals['language'] = self._language if self._language is not None and self._language != '' else sateraito_inc.DEFAULT_LANGUAGE
        template_vals['extjs_locale_file'] = sateraito_func.getExtJsLocaleFileName(sateraito_inc.DEFAULT_LANGUAGE)
        template_vals['lang'] = self.getMsgs()
        template_vals['FREE_MODE'] = True	# 無償バージョンかどうか


############################################################
## 契約用ヘルパー
############################################################
class ContractFrontHelper(FrontHelper):

    def get(self, oem_company_code):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._oem_company_code = oem_company_code
        self.init()
        self.onLoad()
        self.processOfRequest(oem_company_code)

    def post(self, oem_company_code):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._oem_company_code = oem_company_code
        self.init()
        self.onLoad()
        self.processOfRequest(oem_company_code)

############################################################
## 契約用ヘルパー（SP限定用）
############################################################
class ContractSPFrontHelper(FrontHelper):

    def get(self, oem_company_code, sp_code):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._oem_company_code = oem_company_code
        self.init()
        self.onLoad()
        self.processOfRequest(oem_company_code, sp_code)

    def post(self, oem_company_code, sp_code):
        self.request.charset = UcfConfig.ENCODING
        self.response.charset = UcfConfig.ENCODING
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._oem_company_code = oem_company_code
        self.init()
        self.onLoad()
        self.processOfRequest(oem_company_code, sp_code)



############################################################
## APIヘルパー…外部からコールされるAPI用（ドメイン関係ない版）
############################################################
class APIHelper(FrontHelper):
    def get(self):
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API
        self._design_type = UcfConfig.VALUE_DESIGN_TYPE_API
        self.processOfRequest()

    def post(self):
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API
        self._design_type = UcfConfig.VALUE_DESIGN_TYPE_API
        self.processOfRequest()

    def processOfRequest(self):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    # TenantHelperのものを使うのでコメントアウト 2017.01.30
#	def isValidTenant(self, tenant):
#		# 無効テナントかどうかをチェック
#		if sateraito_func.isTenantDisabled(tenant):
#			return False
#		return True

    def checkAccessIPAddress(self, accept_ip_address_list, deny_ip_address_list=None):
        u''' アクセスIPアドレスをチェック '''
        return UcfUtil.isCheckIPAddressRange(self.getClientIPAddress(), accept_ip_address_list, deny_ip_address_list)

    def checkCheckKey(self, check_key, application_id, uid=''):

        is_ok = False
        if check_key != '':
            #uid = ''
            uid_check_keys = []

            is_ok = False
            for uid_check_key in uid_check_keys:
                if uid_check_key.lower() == check_key.lower():
                    is_ok = True
                    break
        return is_ok

    # テナントが固定の場合はセット
    def setTenant(self, tenant):
        namespace_manager.set_namespace(tenant.lower())
        self._tenant = tenant


    def outputErrorLog(self, e):
        u''' 例外をログ出力する （抽象メソッドイメージ）'''
        logging.exception(e)
        #try:
        #	exc_type, exc_value, exc_traceback = sys.exc_info()
        #	logging.error(repr(traceback.format_exception(exc_type, exc_value, exc_traceback)))
        #except BaseException, ex:
        #	logging.exception(ex)
        #	pass

    # 設定に基づいてユーザ名の表示名を取得
    def getUserNameDisp(self, last_name, first_name, middle_name=''):
        return last_name + ' ' + first_name


############################################################
## テナントヘルパー…基本機能
############################################################
class TenantHelper(Helper):

#	def __init__(self):
#		# 親のコンストラクタをコール
#		Helper.__init__(self)

    _tenant = ''
    _dept = None
    _is_dept_selected = False	# このページ内で最新の情報を取得したかどうか

    def judgeTargetCareer(self):
        is_disable_fp = self.getDeptInfo() is not None and self.getDeptValue('is_disable_fp') == 'True'
        u'''UserAgentからキャリアタイプを自動判定'''
        strTargetCareer, strTargetCareerType, strDesignType, is_android, is_ios = self.getTargetCareer(is_disable_fp=is_disable_fp)
        #内部変数にセット
        self._career = strTargetCareer
        self._career_type = strTargetCareerType
        self._design_type = strDesignType
        self._is_android = is_android
        self._is_ios = is_ios

    def init(self):

        self._root_folder_path = ''
        # エラーページＵＲＬ
        if self._error_page is None or self._error_page == '':
            self._error_page = '/a/' + self._tenant + UcfConfig.URL_ERROR
        # タイムゾーン設定
        dept = self.getDeptInfo()
        if dept is not None and UcfUtil.nvl(dept['timezone']) != '':
            try:
                #UcfConfig.TIME_ZONE_HOUR = int(UcfUtil.nvl(dept['timezone']))
                #UcfConfig.TIMEZONE = sateraito_func.getActiveTimeZone(UcfUtil.nvl(dept['timezone']))
                self._timezone = sateraito_func.getActiveTimeZone(UcfUtil.nvl(dept['timezone']))
            except:
                #UcfConfig.TIME_ZONE_HOUR = 0
                #UcfConfig.TIMEZONE = sateraito_inc.DEFAULT_TIMEZONE
                self._timezone = sateraito_inc.DEFAULT_TIMEZONE
                pass
        # OEMコード設定
        self._oem_company_code = oem_func.getValidOEMCompanyCode(dept.get('oem_company_code', '') if dept is not None else '')
        # サービスコード
        if dept is not None and dept.get('sp_codes', '') != '':
            self._sp_codes = UcfUtil.csvToList(dept.get('sp_codes'))
        else:
            self._sp_codes = []

        #キャリア判定
        self.judgeTargetCareer()

    def setTenant(self, tenant):
        #namespace_manager.set_namespace(tenant)
        namespace_manager.set_namespace(tenant.lower())
        self._tenant = tenant
        self._dept = None
        self._is_dept_selected = False
        self._error_page = '/a/' + self._tenant + UcfConfig.URL_ERROR

    def getDeptInfo(self, no_memcache=False, is_force_select=False):

        memcache_key = 'deptinfo?tenant=' + self._tenant

        if is_force_select or (no_memcache and not self._is_dept_selected):
            #logging.info('get dept info start...')
            self._dept = ucffunc.getDeptVoByTenant(self._tenant, self)
            self._is_dept_selected = True
            #logging.info('get dept info end.')
            if self._dept is not None:
                DeptUtils.editVoForSelect(self, self._dept)
                memcache.set(key=memcache_key, value=self._dept, time=300)

        elif self._dept is None:
            self._dept = memcache.get(memcache_key)
            if self._dept is None:
                #logging.info('get dept info start...')
                self._dept = ucffunc.getDeptVoByTenant(self._tenant, self)
                self._is_dept_selected = True
                #logging.info('get dept info end.')
                if self._dept is not None:
                    DeptUtils.editVoForSelect(self, self._dept)
                    memcache.set(key=memcache_key, value=self._dept, time=300)

        return self._dept

    def getDeptValue(self, key):
        return self.getDeptInfo().get(key)

    def _createConfigForTemplate(self):
        config = {}

        config['QSTRING_STATUS'] = UcfConfig.QSTRING_STATUS
        config['VC_CHECK'] = UcfConfig.VC_CHECK
        config['REQUESTVALUE_ACS_APPLY_STATUS_APPROVAL'] = UcfConfig.REQUESTVALUE_ACS_APPLY_STATUS_APPROVAL
        config['REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY'] = UcfConfig.REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY
        config['TEMPLOGIN_ACTIONKEY_ACS_APPLY'] = UcfConfig.TEMPLOGIN_ACTIONKEY_ACS_APPLY
        config['QSTRING_TYPE'] = UcfConfig.QSTRING_TYPE
        config['QSTRING_CODE'] = UcfConfig.QSTRING_CODE
        config['EDIT_TYPE_RENEW'] = UcfConfig.EDIT_TYPE_RENEW
        config['EDIT_TYPE_NEW'] = UcfConfig.EDIT_TYPE_NEW
        config['EDIT_TYPE_COPYNEWREGIST'] = UcfConfig.EDIT_TYPE_COPYNEWREGIST
        config['QSTRING_TYPE2'] = UcfConfig.QSTRING_TYPE2
        config['REQUESTKEY_SESSION_SCID'] = UcfConfig.REQUESTKEY_SESSION_SCID
        config['SESSIONKEY_SCOND_OPERATOR_LIST'] = UcfConfig.SESSIONKEY_SCOND_OPERATOR_LIST
        config['SESSIONKEY_SCOND_USER_LIST'] = UcfConfig.SESSIONKEY_SCOND_USER_LIST
        config['EDIT_TYPE_DELETE'] = UcfConfig.EDIT_TYPE_DELETE
        config['EDIT_TYPE_REFER'] = UcfConfig.EDIT_TYPE_REFER
        config['SESSIONKEY_SCOND_LOGIN_HISTORY'] = UcfConfig.SESSIONKEY_SCOND_LOGIN_HISTORY
        config['SESSIONKEY_SCOND_GROUP_LIST'] = UcfConfig.SESSIONKEY_SCOND_GROUP_LIST
        config['SESSIONKEY_SCOND_BUSINESSRULE_LIST'] = UcfConfig.SESSIONKEY_SCOND_BUSINESSRULE_LIST
        config['SESSIONKEY_SCOND_POSTMESSAGE_LIST'] = UcfConfig.SESSIONKEY_SCOND_POSTMESSAGE_LIST
        config['SESSIONKEY_SCOND_TEMPLATE_LIST'] = UcfConfig.SESSIONKEY_SCOND_TEMPLATE_LIST
        config['SESSIONKEY_SCOND_SEARCH_LIST'] = UcfConfig.SESSIONKEY_SCOND_SEARCH_LIST
        config['SESSIONKEY_SCOND_FORM_LIST'] = UcfConfig.SESSIONKEY_SCOND_FORM_LIST
        config['SESSIONKEY_SCOND_STORE_LIST'] = UcfConfig.SESSIONKEY_SCOND_STORE_LIST
        config['DIRECT_APPROVAL_COUNT_UNLIMITED'] = UcfConfig.DIRECT_APPROVAL_COUNT_UNLIMITED
        # config['SESSIONKEY_SCOND_TASK_LIST'] = UcfConfig.SESSIONKEY_SCOND_TASK_LIST
        config['REQUESTKEY_TASK_TYPE'] = UcfConfig.REQUESTKEY_TASK_TYPE
        config['REQUESTKEY_MATRIXAUTH_RANDOMKEY'] = UcfConfig.REQUESTKEY_MATRIXAUTH_RANDOMKEY

        return config

    # ※外部からコールされる場合あり
    def process_of_get(self, tenant):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()

    # ※外部からコールされる場合あり
    def process_of_post(self, tenant):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()

    def get(self, tenant):
        self.process_of_get(tenant)
        self.processOfRequest(tenant)

    def post(self, tenant):
        self.process_of_post(tenant)
        self.processOfRequest(tenant)

    def processOfRequest(self, tenant):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def getMsgs(self):
        return UcfMessage.getMessageListEx(self._language)

#	def getMsgs(self):
#		memcache_key = 'msgs?language=' + self._language
#		is_debug = sateraito_inc.debug_mode
#		if is_debug == False and self._tenant:
#			# 取得していないか言語が違う場合はまずmemcacheから取得
#			if self.msgs is None or self._msgs_language != self._language:
#				self.msgs = memcache.get(memcache_key)
#				if self.msgs is not None:
#					self._msgs_language = self._language
#
#		# 次に、ファイルから取得
#		if self.msgs is None or self._msgs_language != self._language:
#			#logging.info('load message list...ln=' + str(self._language))
#			#self.msgs = UcfMessage.getMessageList(self._approot_path, self._language)
#			self.msgs = UcfMessage.getMessageListEx(self._language)
#			#logging.info('load message list end.')
#			self._msgs_language = self._language
#			if self.msgs is not None:
#				# memcacheにセットしておく（3600秒）
#				memcache.set(key=memcache_key, value=self.msgs, time=3600)
#		return self.msgs


    ############################################################
    ## セッション
    ############################################################
    def setSession(self, key, value):
        u'''セッションのセット'''
        # keyにドメイン情報（unique_id）を付与（path指定が動的にできなそう＆BigTableではなくmemcacheに保持を考慮してnamespace_managerは使わないため）
        logging.debug(namespace_manager.get_namespace())
        key = self.createTenantSessionKeyPrefix() + key
        logging.debug(key)
        self.session()[key] = value

    def getSession(self, key):
        u'''セッションの取得'''
        # keyにドメイン情報（unique_id）を付与（path指定が動的にできなそう＆BigTableではなくmemcacheに保持を考慮してnamespace_managerは使わないため）
        key = self.createTenantSessionKeyPrefix() + key
        return self.session().get(key, None)

## webapp2_extras用
#	def clearSession(self):
#		sessionkey_prefix = self.createTenantSessionKeyPrefix()
#		session_keys = []
#		for k,v in self.session().iteritems():
#			if UcfUtil.startsWith(k, sessionkey_prefix):
#				session_keys.append(k)
#		for session_key in session_keys:
#			self.session()[session_key] = None

    def createTenantSessionKeyPrefix(self):
        return UcfUtil.md5(self._tenant)

    ############################################################
    ## Cookie
    ############################################################
    def setCookie(self, name, value, expires=None, is_secure=False, path=None):
        u'''クッキーの値をセット（期限指定無しの場合は無期限）'''
        if expires is None or expires == '':
            expires = UcfUtil.getDateTime('2037/12/31').strftime(UcfConfig.COOKIE_DATE_FMT)

        if path is None:
            path = '/a/' + self._tenant + '/'	# 最後の「/」いるのかなー
        #domain = ''
        domain = sateraito_inc.cookie_domain
        # 暗号化
#		try:
        value = UcfUtil.urlEncode(self.encryptoForCookie(str(value)))
#		except Exception, e:
#			logging.exception(e)
#			value = value
        if not sateraito_inc.http_mode and is_secure:
            self.response.headers.add_header('Set-Cookie', str(name) + '=' + value + ';' + 'expires=' + str(expires) + ';' + 'Path=' + str(path) + ';' + (('domain=' + str(domain) + ';') if domain != '' else '') + 'secure;')
        else:
            self.response.headers.add_header('Set-Cookie', str(name) + '=' + value + ';' + 'expires=' + str(expires) + ';' + 'Path=' + str(path) + ((';' + 'domain=' + str(domain) + ';') if domain != '' else ''))

    def clearCookie(self, name, path=None):
        u'''クッキークリア'''
        if path is None:
            path = '/a/' + self._tenant + '/'
        #domain = ''
        domain = sateraito_inc.cookie_domain
        self.response.headers.add_header('Set-Cookie', str(name) + '=;' + 'expires=' + 'Wed, 01-Jan-1970 00:00:00 GMT' + ';' + 'Path=' + str(path) + ((';' + 'domain=' + str(domain) + ';') if domain != '' else ''))


    def isValidTenant(self, not_redirect=False, without_check_exist_dept=False):
        # 無効テナントかどうかをチェック

        # OEM以外はブラックリストチェックする 2017.01.30
        without_check_black_list = False
        dept = self.getDeptInfo()
        if dept is not None and dept.get('oem_company_code', '') not in oem_func.getBlackListTargetOEMCompanyCodes():
            without_check_black_list = True
        if sateraito_func.isTenantDisabled(self._tenant, without_check_black_list=without_check_black_list):
            if not_redirect == False:
                self.redirectError(self.getMsg('MSG_THIS_APPRICATION_IS_STOPPED_FOR_YOUR_TENANT'))
            return False

        return True

    def getTemplateRender(self, template_name, design_type, vals):
        # レンダリング
        jinja_environment = sateraito_jinja2_environment.getEnvironmentObjForTenant(design_type)
        template = jinja_environment.get_template(template_name)
        return template.render(vals)

    def render(self, template_name, design_type, vals):
        if UcfConfig.ENCODING=='cp932':
            charset_string='Shift_JIS'
            #charset_string = UcfConfig.FILE_CHARSET
        else:
            charset_string=UcfConfig.ENCODING
        self.response.headers['Content-Type'] = 'text/html; charset=' + charset_string + ';'

        # レンダリング
        jinja_environment = sateraito_jinja2_environment.getEnvironmentObjForTenant(design_type)
        template = jinja_environment.get_template(template_name)
        self.response.out.write(template.render(vals))



    # テンプレートに渡す基本情報をセット
    def appendBasicInfoToTemplateVals(self, template_vals):
        pass

############################################################
## TenantAppヘルパー…アプリ用
############################################################
class TenantAppHelper(TenantHelper):

    _temporary_login_action_key = None

    # CSRF対策：トークンを発行しセッションにセット
    def createCSRFToken(self, key):
        token = UcfUtil.guid()
        # sessionではなくmemcacheのみでチェックする施策 2016.12.27
        #logging.info('createCSRFToken[key]' + key + '[create_token]' + token + '[session_token]' + UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_CSRF_TOKEN_PREFIX + key)))
        # sessionに戻してみる 2020.08.10
        #memcache_key = self._tenant + UcfConfig.SESSIONKEY_CSRF_TOKEN_PREFIX + key + self.getLoginOperatorUniqueID()
        #memcache.set(key=memcache_key, value=token, time=86400)        # セッションと同じ24時間程度にしてみる（自動延長がないとはいえ長すぎ？）
        self.setSession(UcfConfig.SESSIONKEY_CSRF_TOKEN_PREFIX + key, token)
        return token

    # CSRF対策：トークンをチェック
    def checkCSRFToken(self, key, token, without_refresh_token=False):
        # sessionではなくmemcacheのみでチェックする施策 2016.12.27
        #logging.info('checkCSRFToken[key]' + key + '[request_token]' + token + '[session_token]' + UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_CSRF_TOKEN_PREFIX + key)))
        #return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_CSRF_TOKEN_PREFIX + key)) == token

        # sessionに戻してみる 2020.08.10
        #memcache_key = self._tenant + UcfConfig.SESSIONKEY_CSRF_TOKEN_PREFIX + key + self.getLoginOperatorUniqueID()
        #is_ok = False
        #token_from_memcache = memcache.get(memcache_key)
        #if token_from_memcache is not None:
        #    is_ok = token_from_memcache == token
        #    if not without_refresh_token:
        #        memcache.delete(memcache_key)
        #if not is_ok:
        #    logging.warning('checkCSRFToken=' + str(is_ok) + '[token_from_memcache]' + str(token_from_memcache) + '[token]' + str(token))
        is_ok = False
        token_from_memcache = self.getSession(UcfConfig.SESSIONKEY_CSRF_TOKEN_PREFIX + key)
        if token_from_memcache is not None:
            is_ok = token_from_memcache == token
        if not is_ok:
            logging.warning('checkCSRFToken=' + str(is_ok) + '[token_from_memcache]' + str(token_from_memcache) + '[token]' + str(token))
        return is_ok


    # 背景画像を使用しないか、またその場合の設定を取得
    def isNoUseBgPictures(self):
        #if self._tenant in ['nextsetdemo']:
        #	return True, '#FFFFFF'
        return False, ''

    # デフォルト背景画像のインデックスを返す（最低10個）
    def _getBgDefaultIdx(self):
        demo_tenants = ['line.sateraito.jp']
        idx_ary = []
        if self._tenant in demo_tenants:
            idx_ary = ['01','02','04','03','05','09','06','10','07','11','08','12','13','15','16','18','14','19','17','21','20','22','24','23','25','27','26','28','29','31','30','32','33','34','35','36']
        else:
            idx_ary = ['01','02','04','03','05','09','06','10','07','11']
        return idx_ary

    # 1～10 のランダム数字をセット.背景画像用 ⇒ オリジナル画像が設定されていたらその範囲でセット
    def _createBgTypeIdx(self):

        idx_ary = []

        # オリジナル画像
        dept = self.getDeptInfo()
        if dept is not None:
            for i in range(10):
                if UcfUtil.getHashStr(dept, 'login_background_pc' + str(i + 1) + '_data_key') != '':
                    idx_ary.append(str(i + 1).rjust(2, '0'))

        # カスタム画像があるかどうか
        is_exist_custom = len(idx_ary) > 0

        demo_tenants = ['line.sateraito.jp']

        # カスタム画像がない場合は標準画像をセット
        if not is_exist_custom:
            idx_ary = self._getBgDefaultIdx()

        # 日付によって先頭画像を決定（デモテナント以外）
        if is_exist_custom or self._tenant not in demo_tenants:
            start_idx = (datetime.datetime.now() - datetime.datetime(1900, 1, 1)).days % len(idx_ary)
            #logging.info('start_idx=' + str(start_idx))
            new_idx_ary = []
            for i in range(len(idx_ary)):
                idx = (i + start_idx) % len(idx_ary)
                #idx = (len(idx_ary) - start_idx + i) if start_idx > i else (i - start_idx)
                new_idx_ary.append(idx_ary[idx])
            idx_ary = new_idx_ary

        return idx_ary, is_exist_custom

    # テンプレートに渡す基本情報をセット
    def appendBasicInfoToTemplateVals(self, template_vals):
#		logging.info('appendBasicInfoToTemplateVals start...')
        dept = self.getDeptInfo()
        template_vals['config'] = self._createConfigForTemplate()
        template_vals['dept'] = dept
        template_vals['my_site_url'] = oem_func.getMySiteUrl(self._oem_company_code)
        template_vals['version'] = UcfUtil.md5(sateraito_inc.version)
        template_vals['vurl'] = '/a/' + self._tenant + '/'
        template_vals['vscripturl'] = '/script/' if not sateraito_inc.debug_mode else '/script/debug/'
        template_vals['tenant'] = self._tenant
        template_vals['language'] = self._language if self._language is not None and self._language != '' else sateraito_inc.DEFAULT_LANGUAGE
        template_vals['extjs_locale_file'] = sateraito_func.getExtJsLocaleFileName(self._language if self._language is not None and self._language != '' else sateraito_inc.DEFAULT_LANGUAGE)
        template_vals['lang'] = self.getMsgs()
        template_vals['FREE_MODE'] = sateraito_func.isFreeMode(self._tenant)	# 無償バージョンかどうか
        # 教育機関モードでの制御廃止 2016.02.12
        #template_vals['EDUCATION_MODE'] = (dept.get('is_education_mode') == 'True') if (dept is not None and dept.get('is_education_mode') is not None) else False	# 教育機関モードかどうか
        login_mail_address = self.getLoginOperatorMailAddress()
        login_id = self.getLoginID()
        login_name = self.getLoginOperatorName()
        login_access_authority = self.getLoginOperatorAccessAuthority().split(',')
        login_delegate_function = self.getLoginOperatorDelegateFunction().split(',')
        login_delegate_management_groups = self.getLoginOperatorDelegateManagementGroups().split(',')
        template_vals['login'] = {'mail_address':login_mail_address, 'id':login_id, 'name':login_name, 'access_authority':login_access_authority, 'delegate_function':login_delegate_function, 'delegate_management_groups':login_delegate_management_groups}

        if self._design_type == UcfConfig.VALUE_DESIGN_TYPE_PC:
            isBgNoUse, BgColor = self.isNoUseBgPictures()
            template_vals['BgNoUse'] = isBgNoUse
            template_vals['BgColor'] = BgColor
            idx_ary, is_exist_custom = self._createBgTypeIdx()
            template_vals['BgTypeIdxAry'] = idx_ary
            #template_vals['BgTypeIdxAryJson'] = JSONEncoder().encode(idx_ary)
            template_vals['BgIsExistCustom'] = is_exist_custom
            template_vals['leftmenu_class'] = UcfUtil.nvl(self.getCookie(UcfConfig.COOKIEKEY_LEFTMENUCLASS)) if UcfUtil.nvl(self.getCookie(UcfConfig.COOKIEKEY_LEFTMENUCLASS)) != '' else 'on'

        elif self._design_type == UcfConfig.VALUE_DESIGN_TYPE_SP:
            template_vals['BgIsExistCustom'] = dept.get('login_background_sp1_data_key', '') != '' if dept is not None else False

        template_vals['BgIsExistCustomLogo'] = dept.get('logo_data_key', '') != '' if dept is not None else False
        template_vals['BgIsDispCustomLogo'] = dept.get('is_disp_login_custom_logo', '') == 'ACTIVE' if dept is not None else False

        # OEM会社コード
        template_vals['oem_company_code'] = oem_func.getValidOEMCompanyCode(dept.get('oem_company_code', '') if dept is not None else '')
        # サービスコード
        template_vals['sp_codes'] = self._sp_codes

#		user = users.get_current_user()
#		template_vals['user_email'] = user.email() if user != None else ''
#		logging.info('appendBasicInfoToTemplateVals end.')

    # 一時ログインキーをセット…これでこのページ内では通常のログインとは別のログイン認証が行われる
    def setTemporaryLoginActionKey(self, temporary_login_action_key):
        self._temporary_login_action_key = temporary_login_action_key

    # 一時ログインキーを取得
    def getTemporaryLoginActionKey(self):
        return UcfUtil.nvl(self._temporary_login_action_key)

    def isAdmin(self):
        u'''管理者かどうか'''
        temp = ',' + self.getLoginOperatorAccessAuthority().replace(' ', '') + ','

        result = None
        if ',' + UcfConfig.ACCESS_AUTHORITY_ADMIN + ',' in temp:
            result = True
        else:
            result = False
        return result

    def isOperator(self, target_function=None):
        u'''委託管理者かどうか'''
        access_authority = UcfUtil.csvToList(self.getLoginOperatorAccessAuthority())
        delegate_function = UcfUtil.csvToList(self.getLoginOperatorDelegateFunction())
        result = False
        if UcfConfig.ACCESS_AUTHORITY_OPERATOR in access_authority:
            if target_function is None:
                result = True
            elif isinstance(target_function, str):
                if target_function == '' or target_function in delegate_function:
                    result = True
            elif isinstance(target_function, list):
                for target_function_item in target_function:
                    if target_function_item in delegate_function:
                        result = True
                        break
        return result

    def checkDateChanged(self, model):
        u'''更新日時チェック'''
        model_vo = model.exchangeVo(self._timezone)
        req_date_changed = UcfUtil.nvl(self.getRequest('date_changed'))
        if req_date_changed != '' and req_date_changed != UcfUtil.getHashStr(model_vo, 'date_changed'):
            return False
        else:
            return True

    def checkCheckKey(self, check_key, application_id, uid=''):
        is_ok = False
        if check_key != '':
            uid_check_keys = []
            # クライアント証明書チェック機能
            if application_id == UcfConfig.APPLICATIONID_CHECKCLIENTCERTFICATION:
                now = UcfUtil.getNow()	# 標準時
                md5_suffix_key = UcfConfig.MD5_SUFFIX_KEY_CHECKCLIENTCERTFICATION	# キー固定
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, -5).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, -4).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, -3).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, -2).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, -1).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + now.strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, 1).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, 2).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, 3).strftime('%Y%m%d%H%M') + md5_suffix_key))
                uid_check_keys.append(UcfUtil.md5(uid + UcfUtil.add_minutes(now, 4).strftime('%Y%m%d%H%M') + md5_suffix_key))


            is_ok = False
            for uid_check_key in uid_check_keys:
                if uid_check_key.lower() == check_key.lower():
                    is_ok = True
                    break
        return is_ok

    # 設定に基づいてユーザ名の表示名を取得
    def getUserNameDisp(self, last_name, first_name, middle_name=''):
        return ucffunc.getUserNameDisp(self, self.getDeptInfo(), last_name, first_name, middle_name)


    def getLoginID(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_ID))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_ID + '|' + self.getTemporaryLoginActionKey()))

    def getLoginOperatorID(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_OPERATOR_ID))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_OPERATOR_ID + '|' + self.getTemporaryLoginActionKey()))

    def getLoginOperatorName(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_NAME))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_NAME + '|' + self.getTemporaryLoginActionKey()))

    def getLoginOperatorMailAddress(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_MAIL_ADDRESS))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_MAIL_ADDRESS + '|' + self.getTemporaryLoginActionKey()))

    def getLoginOperatorAccessAuthority(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_ACCESS_AUTHORITY))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_ACCESS_AUTHORITY + '|' + self.getTemporaryLoginActionKey()))

    # ログインユーザの委託管理機能一覧を取得
    def getLoginOperatorDelegateFunction(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_DELEGATE_FUNCTION))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_DELEGATE_FUNCTION + '|' + self.getTemporaryLoginActionKey()))

    # ログインユーザの委託管理する管理グループ一覧を取得
    def getLoginOperatorDelegateManagementGroups(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_DELEGATE_MANAGEMENT_GROUPS))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_DELEGATE_MANAGEMENT_GROUPS + '|' + self.getTemporaryLoginActionKey()))

    # ログインオペレータユニークＩＤを取得（空もあり得るので注意）
    def getLoginOperatorUniqueID(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_UNIQUE_ID))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_UNIQUE_ID + '|' + self.getTemporaryLoginActionKey()))

    # ログイン時の適用プロファイルユニークIDを取得（空もあり得るので注意）
    def getLoginOperatorProfileUniqueID(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_PROFILE_UNIQUE_ID))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_PROFILE_UNIQUE_ID + '|' + self.getTemporaryLoginActionKey()))

    # ログイン時の適用対象環境種別を取得（空もあり得るので注意）
    def getLoginOperatorTargetEnv(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_TARGET_ENV))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_TARGET_ENV + '|' + self.getTemporaryLoginActionKey()))

    # ログインユーザにパスワード変更を強制するフラグをセッションから取得
    def getLoginOperatorForcePasswordChangeFlag(self):
        if self.getTemporaryLoginActionKey() == '':
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_FORCE_PASSWORD_CHANGE))
        else:
            return UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_LOGIN_FORCE_PASSWORD_CHANGE + '|' + self.getTemporaryLoginActionKey()))

    # ログインユーザにパスワード変更を強制するフラグをセッションにセット
    def setLoginOperatorForcePasswordChangeFlag(self, force_type):
        self.setSession(UcfConfig.SESSIONKEY_LOGIN_FORCE_PASSWORD_CHANGE, force_type)

    # ログインユーザが次回パスワード変更フラグあるいはパスワード期限のため、パスワード変更ページにしか遷移できないかどうかをセッションから取得し必要ならリダイレクト
    def checkForcePasswordChange(self):
        force_password_change_type = self.getLoginOperatorForcePasswordChangeFlag()
        if force_password_change_type == 'FORCE':
            self.redirect('/a/' + self._tenant + '/personal/password/')
            return False
        elif force_password_change_type == 'FORCE2':
            self.redirect('/a/' + self._tenant + '/personal/otp/')
            return False
        else:
            return True

    # 「rurl_key」をセッションから取得　…パスワード変更ページなどから「元の認証ページに戻る」ためのキー
    def getLoginOperatorRURLKey(self):
        key = ''
        if self.getTemporaryLoginActionKey() == '':
            key = UcfConfig.SESSIONKEY_RURL_KEY
        else:
            key = UcfConfig.SESSIONKEY_RURL_KEY + '|' + self.getTemporaryLoginActionKey()
        rurl_key = UcfUtil.nvl(self.getSession(key))
        return rurl_key

    # 「rurl_key」をセッションにセット　…パスワード変更ページなどから「元の認証ページに戻る」ためのキー
    def setLoginOperatorRURLKey(self, rurl_key):
        key = UcfConfig.SESSIONKEY_RURL_KEY
        self.setSession(key, rurl_key)

    # アクセス申請ページの「元の認証ページに戻る」リンク用のRURLをセッションにセット
    # ※クエリーにURLを丸ごとセットするのは環境によってURLが長すぎて動作不備となるのでセッションで受け渡す方法に変更 2013.08.06
    def setOriginalProcessLinkToSession(self, rurl_key, rurl):
        if rurl_key != '':
            # セッションではなく別のmemcacheで管理するように変更（キーにguidが付いているせいか複数の情報がセッションにセットされるパターンがあり、結果としてmemcacheの上限１ＭＢを超えることがあるため） 2015.05.07
            #self.setSession(UcfConfig.SESSIONKEY_ORIGINAL_PROCESS_LINK_PREFIX + rurl_key, rurl)
            memcache_key = UcfConfig.SESSIONKEY_ORIGINAL_PROCESS_LINK_PREFIX + rurl_key + '_' + self._tenant
            memcache.set(key=memcache_key, value=rurl, time=86400)		# セッションと同じ24時間程度にしてみる

    # アクセス申請ページの「元の認証ページに戻る」リンク用のRURLをセッションから取得
    def getOriginalProcessLinkFromSession(self, rurl_key):
        rurl = ''
        if rurl_key != '':
            # セッションではなく別のmemcacheで管理するように変更（キーにguidが付いているせいか複数の情報がセッションにセットされるパターンがあり、結果としてmemcacheの上限１ＭＢを超えることがあるため） 2015.05.07
            #rurl = UcfUtil.nvl(self.getSession(UcfConfig.SESSIONKEY_ORIGINAL_PROCESS_LINK_PREFIX + rurl_key))
            memcache_key = UcfConfig.SESSIONKEY_ORIGINAL_PROCESS_LINK_PREFIX + rurl_key + '_' + self._tenant
            rurl = UcfUtil.nvl(memcache.get(memcache_key))
        return rurl

    # Create Access Token
    def createAccessToken(self, key):
      return sateraito_inc.MD5_SUFFIX_KEY

    #check Access token
    def checkAccessToken(self, key,token):
      return token==sateraito_inc.MD5_SUFFIX_KEY

############################################################
## TenantAppヘルパー…キュー用
############################################################
class TenantTaskHelper(TenantHelper):

    def getLoginID(self):
        return ''

    def get(self, tenant, token):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        # ドメインが'/'で開始している場合の対策（実際ないけど念のため）
        self.processOfRequest(tenant.rstrip('/'), token)

    def post(self, tenant, token):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        self.processOfRequest(tenant, token)

    def processOfRequest(self, tenant, token):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    # 設定に基づいてユーザ名の表示名を取得
    def getUserNameDisp(self, last_name, first_name, middle_name=''):
        return ucffunc.getUserNameDisp(self, self.getDeptInfo(), last_name, first_name, middle_name)



############################################################
## TenantAPIヘルパー…外部からコールされるAPI用
############################################################
class TenantAPIHelper(TenantHelper):

    def getLoginID(self):
        return ''

    def get(self, tenant):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API

        self.processOfRequest(tenant)

    def post(self, tenant):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API

        self.processOfRequest(tenant)

    def processOfRequest(self, tenant, token):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def checkAccessIPAddress(self, accept_ip_address_list, deny_ip_address_list=None):
        u''' アクセスIPアドレスをチェック '''
        return UcfUtil.isCheckIPAddressRange(self.getClientIPAddress(), accept_ip_address_list, deny_ip_address_list)

    def render(self, template_name, vals):
        design_type = UcfConfig.VALUE_DESIGN_TYPE_API

        self.response.headers['Content-Type'] = 'text/xml; charset=' + 'UTF-8' + ';'

        # レンダリング
        jinja_environment = sateraito_jinja2_environment.getEnvironmentObjForTenant(design_type)
        template = jinja_environment.get_template(template_name)
        self.response.out.write(template.render(vals))

    def checkCheckKeyForUser(self, uid, check_key, application_id):
        return ucffunc.checkCheckKeyForUser(self, uid, check_key, application_id)

    # 設定に基づいてユーザ名の表示名を取得
    def getUserNameDisp(self, last_name, first_name, middle_name=''):
        return ucffunc.getUserNameDisp(self, self.getDeptInfo(), last_name, first_name, middle_name)


############################################################
## TenantAPIヘルパー…WebHook用
############################################################
class TenantWebHookAPIHelper(TenantAPIHelper):

    def get(self, tenant, rule_id):
        logging.info('vao day')
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API
        self._status = ''
        self._msg = ''

        self.executeWebhookProcess(tenant, rule_id)

    def post(self, tenant, rule_id):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API
        self._status = ''
        self._msg = ''

        self.executeWebhookProcess(tenant, rule_id)

    def executeWebhookProcess(self, tenant, rule_id):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass



############################################################
## DomainAPIヘルパー…外部からコールされるAPI用
############################################################
class DomainAPIHelper(TenantHelper):

    def get(self, domain):
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API

        self.processOfRequest(domain)

    def post(self, domain):
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self.init()
        self.onLoad()
        self._is_api = True
        self._application_id = ''
        self._career_type = UcfConfig.VALUE_CAREER_TYPE_API

        self.processOfRequest(domain)

    def processOfRequest(self, domain):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def checkAccessIPAddress(self, accept_ip_address_list, deny_ip_address_list=None):
        u''' アクセスIPアドレスをチェック '''
        return UcfUtil.isCheckIPAddressRange(self.getClientIPAddress(), accept_ip_address_list, deny_ip_address_list)

    def render(self, template_name, vals):
        design_type = UcfConfig.VALUE_DESIGN_TYPE_API

        self.response.headers['Content-Type'] = 'text/xml; charset=' + 'UTF-8' + ';'

        # レンダリング
        jinja_environment = sateraito_jinja2_environment.getEnvironmentObjForDomain(design_type)
        template = jinja_environment.get_template(template_name)
        self.response.out.write(template.render(vals))

    def checkCheckKeyForUser(self, uid, check_key, application_id):
        return ucffunc.checkCheckKeyForUser(self, uid, check_key, application_id)

############################################################
## Ajaxヘルパー
############################################################
class AjaxHelper(Helper):

    def get(self):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        # ファイルアップロードのところはこれを指定するとNGなのでページ側で行う
#		self.response.headers['Content-Type'] = 'application/json'
#		FrontHelper.get(self)
        self.processOfRequest()

    def post(self):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        # ファイルアップロードのところはこれを指定するとNGなのでページ側で行う
#		self.response.headers['Content-Type'] = 'application/json'
#		FrontHelper.post(self)
        self.processOfRequest()

    def processOfRequest(self):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def responseAjaxResult(self, ret_value={}):
        if ret_value is None:
            ret_value = {}
        ret_value['msg'] = self._msg
        ret_value['code']= self._code
        return self.response.out.write(JSONEncoder().encode(ret_value))

############################################################
## 管理用Ajaxヘルパー
############################################################
class ManageAjaxHelper(ManageHelper):

    def get(self):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        # ファイルアップロードのところはこれを指定するとNGなのでページ側で行う
#		self.response.headers['Content-Type'] = 'application/json'
#		FrontHelper.get(self)
        self.processOfRequest()

    def post(self):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        # ファイルアップロードのところはこれを指定するとNGなのでページ側で行う
#		self.response.headers['Content-Type'] = 'application/json'
#		FrontHelper.post(self)
        self.processOfRequest()

    def processOfRequest(self):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def responseAjaxResult(self, ret_value={}):
        if ret_value is None:
            ret_value = {}
        ret_value['msg'] = self._msg
        ret_value['code']= self._code
        return self.response.out.write(JSONEncoder().encode(ret_value))

############################################################
## Manageヘルパー…キュー用
############################################################
class ManageTaskHelper(ManageHelper):
    def get(self, token):
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self.init()
        self.onLoad()
        self.processOfRequest(token)

    def post(self, token):
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self.init()
        self.onLoad()
        self.processOfRequest(token)

    def processOfRequest(self, token):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass


############################################################
## Ajaxヘルパー
############################################################
class TenantAjaxHelper(TenantAppHelper):


    def get(self, tenant=None):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        if sateraito_func.checkCsrf(self.request) == False:
            self.response.set_status(403)
            return

        self.response.headers['Content-Type'] = 'application/json'
        TenantAppHelper.get(self, tenant=tenant)

    def post(self, tenant=None):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        if sateraito_func.checkCsrf(self.request) == False:
            self.response.set_status(403)
            return

        self.response.headers['Content-Type'] = 'application/json'
        TenantAppHelper.post(self, tenant=tenant)

    def processOfRequest(self, tenant):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def responseAjaxResult(self, ret_value={},isAllowOrigin=False):
        if ret_value is None:
            ret_value = {}
        ret_value['msg'] = self._msg
        ret_value['code']= self._code

        if isAllowOrigin:
          self.response.headers.add_header('Access-Control-Allow-Origin', '*')

        return self.response.out.write(JSONEncoder().encode(ret_value))

    def appendStatusAjaxResult(self, ret_value={}):
        if ret_value is None:
            ret_value = {}
        ret_value['msg'] = self._msg
        ret_value['code']= self._code

        return ret_value

############################################################
## Ajaxヘルパー
############################################################
class TenantAjaxHttpHelper(TenantAppHelper):


    def get(self, tenant=None):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        # if sateraito_func.checkCsrf(self.request) == False:
        #     self.response.set_status(403)
        #     return

        self.response.headers['Content-Type'] = 'application/json'
        TenantAppHelper.get(self, tenant=tenant)

    def post(self, tenant=None):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        # if sateraito_func.checkCsrf(self.request) == False:
        #     self.response.set_status(403)
        #     return

        self.response.headers['Content-Type'] = 'application/json'
        TenantAppHelper.post(self, tenant=tenant)

    def processOfRequest(self, tenant):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def responseAjaxResult(self, ret_value={},isAllowOrigin=False):
        if ret_value is None:
            ret_value = {}
        ret_value['msg'] = self._msg
        ret_value['code']= self._code

        if isAllowOrigin:
          self.response.headers.add_header('Access-Control-Allow-Origin', '*')

        return self.response.out.write(JSONEncoder().encode(ret_value))

    def appendStatusAjaxResult(self, ret_value={}):
        if ret_value is None:
            ret_value = {}
        ret_value['msg'] = self._msg
        ret_value['code']= self._code

        return ret_value

############################################################
## Ajaxヘルパー（ファイルアップロード用）
############################################################
class TenantAjaxHelperWithFileUpload(TenantAppHelper):

    def get(self, tenant=None):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        TenantAppHelper.get(self, tenant=tenant)

    def post(self, tenant=None):
        self._code = 999
        self._msg = ''
        self._request_type = UcfConfig.REQUEST_TYPE_POST
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        TenantAppHelper.post(self, tenant=tenant)

    def processOfRequest(self, tenant):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def responseAjaxResult(self, ret_value={}):
        if ret_value is None:
            ret_value = {}
        ret_value['msg'] = self._msg
        ret_value['code']= self._code
        return self.response.out.write(JSONEncoder().encode(ret_value))


############################################################
## 画像ヘルパー
############################################################
class TenantImageHelper(TenantAppHelper):


    def get(self, tenant=None, picture_id=None, data_key=None):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        self.processOfRequest(tenant, picture_id, data_key)

    def processOfRequest(self, tenant, picture_id, data_key):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass

    def responseIsLastModified(self, last_modified=None, is_force_response=False):
        is_last_modified = False
        if is_force_response == False and self.request.headers.has_key('If-Modified-Since') and last_modified is not None and self.request.headers['If-Modified-Since'] == str(last_modified):
#			logging.info('If-Modified-Since=' + self.request.headers['If-Modified-Since'])
#			logging.info('last_modified=' + str(last_modified))
            self.response.set_status(304)
            is_last_modified = True
        return is_last_modified

    def responseImage(self, binarydata, content_type=None, file_name=None, last_modified=None, is_force_response=False):
        if content_type is None or content_type == '':
            # 変更 2018.05.08
            #content_type = 'image'
            content_type = 'image/png'
        if content_type is not None and content_type != '':
            # 変更…ユニコードだとヘッダセットでエラーするので 2018.05.08
            #self.response.headers['Content-Type'] = content_type
            self.response.headers['Content-Type'] = str(content_type)
        if file_name is not None and file_name != '':
            self.response.headers['Content-Disposition'] = 'inline;filename=' + unicode(file_name).encode(UcfConfig.ENCODING)
        # Edge cache にちょっと乗せてみる 2016.06.09
        #self.response.headers['Cache-Control'] = ''
        self.response.headers['cache-control'] = 'public, max-age=60'			# 60秒
        if is_force_response == False and last_modified is not None and last_modified != '':
#			logging.info('[last_modified]' + str(last_modified))
            self.response.headers['Last-Modified'] = str(last_modified)	# Wed, 21 Jun 2006 07:00:25 GMT
        bin_length = len(binarydata)
        if bin_length > 500000:	# over 500kb.
            logging.warning('picture size is too large [' + str(bin_length) + ']')
        self.response.write(binarydata)

############################################################
## ビューヘルパーの親クラス
############################################################
class ViewHelper():

    def applicate(self, vo, model, helper):
        return None

    #def formatDateTime(self, dat):
    #	u'''日付を表示に適切な文字列に変換（日付型エンティティには不要.文字列フィールドで日付型の場合などに使用）'''
    #	result = ''
    #	if dat <> None:
    #		dat = UcfUtil.getLocalTime(dat)
    #		if dat <> None:
    #			result = dat.strftime('%Y/%m/%d %H:%M:%S')
    #
    #	return result


############################################################
## １レコード分のVo情報をまとめて保持するクラス
############################################################
class UcfVoInfo():
    u'''１レコード分のVo情報をまとめて保持するクラス'''
    # Vo
    vo = None
    # 表示用Vo
    voVH = None
    # バリデーションチェック結果
    validator = None

    def __init__(self):
        # クラス変数の初期化（コンストラクタで明示的に行わないとインスタンス生成時に初期化されないため）
        self.index = 0
        # Vo
        self.vo = None
        # 表示用Vo
        self.voVH = None
        # バリデーションチェック結果
        self.validator = None

    def exchangeEncoding(vo):
        u''' voデータを表示用に文字コードを変換  2011/06/01 現在この処理は不要'''
        for k,v in vo.iteritems():
            # ファイルオブジェクトなどをスルーするために変換できないものは無視（微妙？） 2009/11/19 T.ASAO
            try:
                vo[k] = v
            except:
                pass
        return vo
    exchangeEncoding = staticmethod(exchangeEncoding)


    def setVo(self, vo, view_helper, model, helper, isWithoutExchangeEncode=False):
        u''' voをセットし同時にvoVHも作成するメソッド
            ※エンコードを同時にする場合は必ずテンプレートに渡す直前で行うこと
        '''
        # vo自体をセット
        self.vo = vo

        # VHを作成
        if view_helper != None:
            self.voVH = view_helper.applicate(vo, helper)
        else:
            self.voVH = vo

    def setRequestToVo(helper):
        u'''Requestデータをハッシュにセット. '''
        vo = {}
        for argument in helper.request.arguments():
            vo[argument] = helper.getRequest(argument)
        return vo
    setRequestToVo = staticmethod(setRequestToVo)


    def margeRequestToVo(helper, vo, isKeyAppend=False):
        u'''Requestデータを指定VOにマージ '''
        for argument in helper.request.arguments():
            if vo.has_key(argument) or isKeyAppend:
                vo[argument] = helper.getRequest(argument)
    margeRequestToVo = staticmethod(margeRequestToVo)


############################################################
## 各ページでテンプレートに渡すための共通変数群を管理するクラス
############################################################
class UcfParameter():
    u'''各ページでテンプレートに渡すための共通変数群を管理するクラス'''
    # 詳細系ページ用
    voinfo = None
    # 一覧系ページ用（UcfVoInfoリスト）
    voinfos = None
    # Requestパラメータ用
    request = None
    # それ以外のパラメータ用
    data = None

    def __init__(self):
        u'''コンストラクタ'''
        # クラス変数の初期化（コンストラクタで明示的に行わないとインスタンス生成時に初期化されないため）
        self.voinfo = UcfVoInfo()
        self.voinfos = []
        self.all_count = 0
        self.request = {}
        self.data = {}

    def setRequestData(self, helper):
        # Requestパラメータをそのままセット
        for argument in helper.request.arguments():
            value = helper.getRequest(argument)
            self.request[argument] = value


############################################################
## フロント用：各ページでテンプレートに渡すためのパラメータクラス
############################################################
class UcfFrontParameter(UcfParameter):
    u'''フロント用：各ページでテンプレートに渡すためのパラメータクラス'''

    def __init__(self, helper):
        u'''フロント用の一般的なパラメータをUcfParameterにセット'''

        # 親のコンストラクタをコール
        UcfParameter.__init__(self)

        # Requestパラメータをそのままセット
        self.setRequestData(helper)

############################################################
## テナントアプリ用：各ページでテンプレートに渡すためのパラメータクラス
############################################################
class UcfTenantParameter(UcfParameter):
    u'''各ページでテンプレートに渡すためのパラメータクラス'''

    def __init__(self, helper):
        u'''一般的なパラメータをUcfParameterにセット'''

        # 親のコンストラクタをコール
        UcfParameter.__init__(self)

        # Requestパラメータをそのままセット
        self.setRequestData(helper)

############################################################
## BUILD
############################################################
class TenantBuildHelper(TenantAppHelper):

    def get(self, tenant=None, template_id=None):
        self.setTenant(tenant)
        self._request_type = UcfConfig.REQUEST_TYPE_GET
        self._language = sateraito_func.getActiveLanguage(self.getDeptInfo()['language']) if self.getDeptInfo() is not None else sateraito_inc.DEFAULT_LANGUAGE
        self.init()
        self.onLoad()
        self.processOfRequest(tenant, template_id)

    def processOfRequest(self, tenant, template_id):
        u'''Requestがきた場合の処理（抽象メソッドイメージ）'''
        pass
