#!/usr/bin/python
# coding: utf-8

# honban
# debug_mode = True
# http_mode = False
# developer_mode = False
_env = 'dev'
# _env = 'prod'

# dev
debug_mode = True
http_mode = True if _env == 'dev' else False 		# True is only http for local env
developer_mode = True

# ログ出力レベル
# 0：全部（10と同じ）
# 10：調査用のデバッグログも出力（調査時のみ指定）
# 20：通常ログまで出力（標準）
# 30：警告ログまで表示
# 40：エラーログまで表示（指定される想定無し）
# 50：クリティカルログまで表示（指定される想定無し）
logging_level = 20

DEFAULT_AVAILABLE_USERS = 10

MAX_NUM_OF_TEMPLATES = 100

NUM_COMMENTS_PER_PAGE = 200

DOC_STATUS_POSTED = 'posted'
CSV_EXPORT_ALL_DOMAIN = []
MAX_NUM_OF_ROWS_EXPORT = 1000
MAX_NUM_OF_ROWS_EXPORT_ALL = 10000
MAX_SORT_LIMIT_FULLTEXT = 10000

# session time out seconds.
session_timeout = 1440 * 60

version = '2020061801'

MAIL_MERGE_FORMAT = '[$${0}$$]'

# Google App Engine setting
if _env == 'dev':
    site_fqdn = 'localhost:8080'
else: 
    site_fqdn = 'sateraito-makedocschat-dev.an.r.appspot.com'

if not http_mode:
    my_site_url = 'https://' + site_fqdn
else:
    my_site_url = 'http://' + site_fqdn

QA_QUESTION_FORMAT = 'q{0}'
QA_ANSWER_FORMAT = 'a{0}'

# TASK_MODULE_NAME_DEFAULT = 'default'

# IP固定でなくても直接コールできるようになったのでプロキシサーバーは廃止
# LINEWORKSAPI_PROXY_URL = 'https://52.192.147.107/api/lineworks/relay_lineworks_api.aspx'
# LINEWORKSAPI_PROXY_MD5_SUFFIX_KEY = 'ebeef4ea23174fe790e7d1c516f90ec7'		# 全アドオン共通.変更不可（組織ツリー作成バッチと同じ）
# LINEWORKSAPI_PROXY_MD5_PREFIX_KEY = 'prefix'		# 固定

# Cookieのドメイン設定（別サーバーの緊急モードサイトとも申請データを共存させるため）
cookie_domain = ''

# csv downloader email
MANAGE_EMAIL = 'asao@baytech.co.jp,bessho@baytech.co.jp,haraguchi@baytech.co.jp,azuma@baytech.co.jp,matsuo@baytech.co.jp,yokoyama@baytech.co.jp'
MANAGE_DOMAIN = 'baytech.co.jp'
MANAGE_PROTECT_CODE = '342e0527423a422fad170c93886a56e4'
# key publish email
PUBLISH_KEY_EMAILS = ['haraguchi@baytech.co.jp','bessho@baytech.co.jp','asao@baytech.co.jp','abe@baytech.co.jp','kozuka@baytech.co.jp','hoa@vn.sateraito.co.jp','azuma@baytech.co.jp','matsuo@baytech.co.jp','yokoyama@baytech.co.jp','umeki@baytech.co.jp','sumitani@baytech.co.jp','oka@baytech.co.jp','yahagi@baytech.co.jp','tateiwa@baytech.co.jp','shoji@baytech.co.jp','yamamoto@baytech.co.jp']
# sales email…営業メンバーメール
# SALES_MEMBERS_EMAILS = ['contact-info@sateraito.co.jp','asao@sateraito.co.jp']
SALES_MEMBERS_EMAILS = ['asao@sateraito.co.jp']

SENDER_EMAIL = 'asao@baytech.co.jp'
SUPERVISOR_EMAIL = 'asao@sateraito.co.jp'
DEFAULT_REPLY_TO_EMAIL = 'contact-info@sateraito.co.jp'

MANAGER_SITE_ACCEPT_IP_ADDRESS_LIST = ('127.0.0.1/32', '202.215.197.120/29')

# md5_suffix_key
MD5_SUFFIX_KEY = '1bb27e6a0c8e30b3b2acabc293a067ca'

max_password_history_count = 10		# パスワード履歴を保持する最大件数（デフォルト. 将来的にはドメインごとに設定もあり）

MERGE_FIELD_CLASS_OPERATOR = [
    {'keys': ['operator_id'], 'content': '[$$operator_id$$]', 'class':'o_operator_id'},
    {'keys': ['first_name'], 'content': '[$$first_name$$]', 'class':'o_first_name'},
    {'keys': ['last_name'], 'content': '[$$last_name$$]', 'class':'o_last_name'},
    {'keys': ['first_name', 'last_name'], 'content':'[$$first_name$$] [$$last_name$$]', 'class':'o_fullname'},
    {'keys': ['mail_address'], 'content':'[$$mail_address$$]', 'class':'o_mail_address'}
]

FORM_DATA_TEMPLATE_FIELD_NAME_SKIP = ['workflow_template_setting']

DEFAULT_LANGUAGE = 'ja'
DEFAULT_TIMEZONE = 'Asia/Tokyo'
DEFAULT_ENCODING = 'SJIS'

DEFAULT_CHAT_SESSION_TIMEOUT = 5 * 60

# URLFETCHタイムアウト秒
URLFETCH_TIMEOUT_SECOND = 30

# For Direct Cloud Box
DIRECT_CLOUD_BOX_BASE_NODE = '1{2'
DIRECT_CLOUD_BOX_SERVICE = 'SateraitoOffice'
DIRECT_CLOUD_BOX_SERVICE_KEY = 'f0a1b2970b6faa4295c2ca435f7c01924ca5014f0977c4fc811ba82b1492e6c2'