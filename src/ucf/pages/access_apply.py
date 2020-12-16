# coding: utf-8

import webapp2,logging,gc
from google.appengine.api import taskqueue
from ucf.utils.validates import BaseValidator
from ucf.utils.models import *
from ucf.utils.helpers import *
from ucf.utils.ucfutil import UcfUtil
from ucf.utils.mailutil import UcfMailUtil
from ucf.pages.operator import OperatorUtils
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
import sateraito_inc
import sateraito_func
import oem_func


############################################################
## アクセス申請テーブル用メソッド
############################################################
class AccessApplyUtils():

	# エクスポート用CSVを作成
	def createCsv(cls, helper, login_operator_entry=None, sk_operator_unique_id='', optional_scond=None):

		logging.info('start create csv...')
		with_cursor = True
		csv_records = []
		# タイトル
		titles = AccessApplyUtils.getCsvTitles(helper)
		csv_records.append(UcfUtil.createCsvRecordEx(titles))
		# データ一覧取得
		q = UCFMDLAccessApply.all()
		if sk_operator_unique_id != '':
			q.filter('operator_unique_id =', sk_operator_unique_id)

			## ユーザーごとのレコードは従来通り1000件固定
			#max_export_cnt = 1000		# 最大出力件数

		else:

			sk_search_type = UcfUtil.getHashStr(optional_scond, 'sk_search_type') if optional_scond is not None else ''
			sk_operator_id = UcfUtil.getHashStr(optional_scond, 'sk_operator_id').lower() if optional_scond is not None else ''
			#sk_operator_unique_id = UcfUtil.getHashStr(optional_scond, 'sk_operator_unique_id') if optional_scond is not None else ''
			sk_apply_date_date_from = UcfUtil.getHashStr(optional_scond, 'sk_apply_date_date_from') if optional_scond is not None else ''
			sk_apply_date_time_from = UcfUtil.getHashStr(optional_scond, 'sk_apply_date_time_from') if optional_scond is not None else ''
			sk_apply_date_date_to = UcfUtil.getHashStr(optional_scond, 'sk_apply_date_date_to') if optional_scond is not None else ''
			sk_apply_date_time_to = UcfUtil.getHashStr(optional_scond, 'sk_apply_date_time_to') if optional_scond is not None else ''

			if sk_search_type == '':
				sk_search_type = 'operator_id'


			# 委託管理者なら自分が触れるデータのみ対象
			if ucffunc.isDelegateOperator(login_operator_entry) and login_operator_entry.delegate_management_groups is not None and len(login_operator_entry.delegate_management_groups) > 0:
				q.filter('management_group IN', login_operator_entry.delegate_management_groups)
				# 管理グループが複数ある場合はカーソル使えないので
				if len(login_operator_entry.delegate_management_groups) >= 2:
					with_cursor = False

			# ログインIDで検索
			if sk_search_type == 'operator_id' and sk_operator_id != '':
				q.filter('operator_id_lower >=', sk_operator_id)
				q.filter('operator_id_lower <', sk_operator_id + u'\uFFFD')

			# 申請日時で検索
			elif sk_search_type == 'apply_date' and (sk_apply_date_date_from != '' or sk_apply_date_date_to != ''):
				if sk_apply_date_date_from != '':
					if sk_apply_date_time_from != '':
						time_ary = sk_apply_date_time_from.split(':')
						sk_apply_date_from = sk_apply_date_date_from + ' ' + time_ary[0] + ':' + time_ary[1] + ':00'
						sk_apply_date_from_utc = UcfUtil.getUTCTime(UcfUtil.getDateTime(sk_apply_date_from), helper._timezone)
					else:
						sk_apply_date_from = sk_apply_date_date_from + ' 00:00:00'
						sk_apply_date_from_utc = UcfUtil.getUTCTime(UcfUtil.getDateTime(sk_apply_date_from), helper._timezone)
					#wheres.append("apply_date >= '" + UcfUtil.escapeGql(sk_apply_date_from_utc) + "'")
					q.filter('apply_date >=', sk_apply_date_from_utc)
				if sk_apply_date_date_to != '':
					if sk_apply_date_time_to != '':
						time_ary = sk_apply_date_time_to.split(':')
						sk_apply_date_to = sk_apply_date_date_to + ' ' + time_ary[0] + ':' + time_ary[1] + ':00'
						sk_apply_date_to_utc = UcfUtil.getUTCTime(UcfUtil.getDateTime(sk_apply_date_to), helper._timezone)
					else:
						sk_apply_date_to = sk_apply_date_date_to + ' 00:00:00'
						sk_apply_date_to_utc = UcfUtil.getUTCTime(UcfUtil.add_days(UcfUtil.getDateTime(sk_apply_date_to), 1), helper._timezone)
					#wheres.append("apply_date < '" + UcfUtil.escapeGql(sk_apply_date_to_utc) + "'")
					q.filter('apply_date <', sk_apply_date_to_utc)
				q.order('-apply_date')


		# ユーザーごとも全体も上限を統一 2017.02.14
		# 全件取得の場合は、fetchのメモリ使用量が大きいため、過去何ヶ月分の制約を設けてみる（ログイン履歴の設定を流用）
		login_history_max_export_cnt = helper.getDeptInfo().get('login_history_max_export_cnt')
		max_export_cnt = UcfUtil.toInt(login_history_max_export_cnt)		# 最大出力件数
		if max_export_cnt <= 0:
			max_export_cnt = 1000
		logging.info('max_export_cnt=' + str(max_export_cnt))

		cnt = 0
		limit = 500
		#limit = 1000					# 通常の、max_export_cnt == 1000 のドメインは1発で取れたほうがいいはずなので 1000 とする
		start_cursor = None
		while True:
			if with_cursor and start_cursor is not None:
				fetch_data = q.with_cursor(start_cursor=start_cursor).fetch(limit)
			else:
				fetch_data = q.fetch(limit, cnt)

			each_cnt = 0
			for entry in fetch_data:

				vo = entry.exchangeVo(helper._timezone)
				AccessApplyUtils.editVoForCsv(helper, vo)

				data = []
				data.append('IU')																						# command
				data.append(UcfUtil.getHashStr(vo, 'apply_date'))					# apply_date
				data.append(UcfUtil.getHashStr(vo, 'operator_id'))					# email
				data.append(UcfUtil.getHashStr(vo, 'device_distinguish_id'))					# device_distinguish_id
				data.append(UcfUtil.getHashStr(vo, 'device_mac_address'))					# mac_address
				data.append(UcfUtil.getHashStr(vo, 'identifier_for_vendor'))					# identifier_for_vendor
				data.append(UcfUtil.getHashStr(vo, 'target_career'))					# target_career
				data.append(UcfUtil.getHashStr(vo, 'target_env'))					# target_env
				data.append(UcfUtil.getHashStr(vo, 'use_profile_id'))					# use_profile_id
				data.append(UcfUtil.getHashStr(vo, 'useragent_id'))					# user_agent
				data.append(UcfUtil.getHashStr(vo, 'approval_status'))					# status
				data.append(UcfUtil.getHashStr(vo, 'approval_status_date'))					# status_date
				data.append(UcfUtil.getHashStr(vo, 'access_expire'))					# access_expire
				data.append(UcfUtil.getHashStr(vo, 'last_login_date'))					# last_login_date
				data.append(UcfUtil.getHashStr(vo, 'apply_comment'))					# apply_comment
				data.append(UcfUtil.getHashStr(vo, 'approval_comment'))					# approval_comment

				csv_records.append(UcfUtil.createCsvRecordEx(data))
				each_cnt += 1

				vo = None
				entry = None
				if each_cnt % 100 == 0:
					gc.collect()

			cnt += each_cnt

			if with_cursor:
				start_cursor = q.cursor()
				logging.info(start_cursor)
			logging.info(cnt)

			# 件数上限
			if cnt >= max_export_cnt or each_cnt < limit:
				break

		csv_text = '\r\n'.join(csv_records)
		return csv_text
	createCsv = classmethod(createCsv)

	def getCsvTitles(cls, helper):
		return ['command','apply_date','email','device_distinguish_id','mac_address','identifier_for_vendor','target_career','target_env','use_profile_id','user_agent','status','status_date','access_expire','last_login_date','apply_comment','approval_comment']
	getCsvTitles = classmethod(getCsvTitles)

	# 取得用：データ加工（CSV用）
	def editVoForCsv(cls, helper, vo):
		pass
	editVoForCsv = classmethod(editVoForCsv)

	# チェックボックス値補正（TODO 本来はフロントからPOSTするようにExtJsなどで処理すべきが取り急ぎ）
	def setNotPostValue(cls, helper, req):
		# チェックボックス項目
		cbx_fields = [
		]
		for field in cbx_fields:
			if not req.has_key(field[0]):
				req[field[0]] = field[1]
	setNotPostValue = classmethod(setNotPostValue)

	# 初期値用：データ加工
	def editVoForDefault(cls, helper, vo):
		pass
	editVoForDefault = classmethod(editVoForDefault)

	# 取得用：データ加工
	def editVoForSelect(cls, helper, vo):
		# 申請日時を日付と時間（時分）に分ける
		access_expire_date = ''
		access_expire_time = ''
		access_expire = UcfUtil.getHashStr(vo, 'access_expire')
		if access_expire != '':
			date_time_ary = access_expire.split(' ')
			access_expire_date = date_time_ary[0]
			if len(date_time_ary) >= 2:
				access_expire_time = date_time_ary[1]
				time_ary = access_expire_time.split(':')
				if len(time_ary) >= 2:
					access_expire_time = time_ary[0] + ':' + time_ary[1]
		vo['access_expire_date'] = access_expire_date
		vo['access_expire_time'] = access_expire_time
		
	editVoForSelect = classmethod(editVoForSelect)

	# 更新用：データ加工
	def editVoForRegist(cls, helper, vo, entry_vo, edit_type):
		if edit_type == UcfConfig.EDIT_TYPE_NEW:
			vo['dept_id'] = UcfUtil.getHashStr(helper.getDeptInfo(), 'dept_id')
		vo['operator_id_lower'] = UcfUtil.getHashStr(vo, 'operator_id').lower()
		# アクセス期限の日付と時分からアクセス期限を作成
		access_expire = ''
		if UcfUtil.getHashStr(vo, 'access_expire_date') != '':
			access_expire = UcfUtil.getHashStr(vo, 'access_expire_date')
			if UcfUtil.getHashStr(vo, 'access_expire_time') != '':
				time_ary = UcfUtil.getHashStr(vo, 'access_expire_time').split(':')
				if len(time_ary) >= 2:
					access_expire = access_expire + ' ' + time_ary[0] + ':' + time_ary[1] + ':00'
		vo['access_expire'] = access_expire

		# 承認ステータスが変更された場合はステータス日付を更新
		if UcfUtil.getHashStr(vo, 'approval_status') != UcfUtil.getHashStr(entry_vo, 'approval_status'):
			vo['approval_status_date'] = UcfUtil.nvl(UcfUtil.getNowLocalTime(helper._timezone))
			vo['approval_operator_id'] = UcfUtil.nvl(helper.getLoginID())

	editVoForRegist = classmethod(editVoForRegist)

	# 既存データを取得
	def getData(cls, helper, unique_id):
		query = UCFMDLAccessApply.gql("where unique_id = :1", UcfUtil.escapeGql(unique_id))
		entry = query.get()
		return entry
	getData = classmethod(getData)

	# キーに使用する値を取得
	def getKey(cls, helper, vo):
		# 最新ものを上に出したいので. ※TODO BigTableのInsertパフォーマンス大丈夫かなー？
		return UcfUtil.nvl(int(''.ljust(10, '9')) - int(UcfUtil.nvl(int(time.time())).ljust(10, '0')))  + UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
	getKey = classmethod(getKey)

	# アクセスキー用Cookieキーを作成
	def createCookieKeyForAccessKey(cls, helper, operator_unique_id):
		return 'ACSDID' + UcfUtil.md5(helper.getDeptInfo()['unique_id'] + '|' + operator_unique_id)
	createCookieKeyForAccessKey = classmethod(createCookieKeyForAccessKey)

	# アクセスキーを作成
	def createAccessKey(cls, helper, useragent_id, operator_unique_id):
		return UcfUtil.md5(useragent_id + '|' + operator_unique_id)
	createAccessKey = classmethod(createAccessKey)

	# アクセス申請時の申請端末・環境情報を作成
	def createApplyInfo(cls, helper, device_info=None):
		apply_info = {}
#		apply_info['UserAgent'] = helper.getUserAgent()
#		apply_info['IPAddress'] = helper.getClientIPAddress()
		apply_info['XForwardedForIPAddress'] = helper.getSessionHttpHeaderXForwardedForIPAddress()
		for k,v in helper.request.environ.iteritems():
			if str(k) == 'HTTP_USER_AGENT':
				apply_info[str(k)] = helper.getUserAgent()
			else:
				apply_info[str(k)] = str(v)

		# セキュリティブラウザのその他端末情報をセット 2015.09.04
		if device_info is not None:
			apply_info['DeviceInfo'] = device_info

		return apply_info
	createApplyInfo = classmethod(createApplyInfo)
	
	# 申請端末・環境情報をハッシュに展開
	def expandApplyInfo(cls, helper, vo):
		try:
			apply_info = JSONDecoder().decode(UcfUtil.getHashStr(vo, 'apply_info'))
			# TODO セキュリティブラウザの端末情報を展開 2015.09.04
			if apply_info.has_key('DeviceInfo'):
				pass
		except BaseException, e:
			logging.exception(e)
			apply_info = {}
		return apply_info
	expandApplyInfo = classmethod(expandApplyInfo)

	# Excelアプリ等の情報が取れれば表示文字列を作成して返す
	def createClientAppDisp(cls, helper, vo, apply_info):
		result = ''
		# AndroidOffice系アプリ
		requested_with = apply_info.get('HTTP_X_REQUESTED_WITH', '')
		if requested_with != '':
			if requested_with == 'com.microsoft.office.officehub':
				result = helper.getMsg('MICROSOFT_OFFICE_MOBILE')
			elif requested_with == 'com.microsoft.office.word':
				result = helper.getMsg('MICROSOFT_WORD')
			elif requested_with == 'com.microsoft.office.excel':
				result = helper.getMsg('MICROSOFT_EXCEL')
			elif requested_with == 'com.microsoft.office.powerpoint':
				result = helper.getMsg('MICROSOFT_POWERPOINT')
			elif requested_with == 'com.microsoft.office.onenote':
				result = helper.getMsg('MICROSOFT_ONENOTE')
			elif requested_with == 'com.microsoft.office.skydrive':
				result = helper.getMsg('MICROSOFT_ONEDRIVE')
			elif requested_with == 'com.microsoft.office.outlook':
				result = helper.getMsg('MICROSOFT_OUTLOOK')
			elif requested_with.find('com.microsoft.office.')>= 0:
				result = helper.getMsg('MICROSOFT_OFFICE_APP')
		return result
	createClientAppDisp = classmethod(createClientAppDisp)

	# アクセスブラウザのユーザエージェントIDを決定(アクセス申請用)
	def getAccessUserAgentIDForAccessControl(cls, helper):
		useragentid = ''
		strAgent = helper.getUserAgent().lower()
		strJphone = helper.getServerVariables("HTTP_X_JPHONE_MSNAME").lower()
		strAccept = helper.getServerVariables("HTTP_ACCEPT").lower()
		#strRequestedWith = helper.getRequestHeaders('X-Requested-With').strip().lower()		# AndroidのOffice系アプリから渡されてくる（例：com.microsoft.office.word）
		## AndroidのOffice系アプリのUserAgent判別に対応 2015.09.11
		#if strRequestedWith.find('com.microsoft.office.'.lower())>=0:		# ※空かどうかだけで判別でもよさそうだが

		# UcfSSOClient
		if strAgent.find('UcfSSOClient'.lower())>=0 or strAgent.find('SSOClient'.lower())>=0:
			useragentid = UcfConfig.USERAGENTID_SSOCLIENT
		# CACHATTOセキュリティブラウザ（DOCOMO の文字があるのでガラ携帯より前で処理） 2016/02/21 追加
		elif strAgent.find('Cachatto'.lower())>=0:
			useragentid = 'CACHATTO'
		# WILLCOM
		elif strAgent.find('WILLCOM'.lower())>=0 or strAgent.find('DDIPOCKET'.lower())>=0:
			useragentid = 'WILLCOM'
		# SoftBank
		elif strJphone!='' or strAgent.find('j-phone'.lower())>=0 or strAgent.find('softbank'.lower())>=0 or strAgent.find('vodafone'.lower())>=0 or strAgent.find('mot-'.lower())>=0:
			useragentid = 'SB'
		# au
		elif strAgent.find('kddi'.lower())>=0 or strAgent.find('up.browser'.lower())>=0 or strAccept.find('hdml'.lower())>=0:
			useragentid = 'AU'
		# Docomo
		elif strAgent.find('docomo'.lower())>=0:
			useragentid = 'DC'
		# KAITO 2012/08/20 追加
		elif strAgent.find('KAITO'.lower())>=0:
			useragentid = 'KAITO'
		# CLOMOセキュリティブラウザ 2013/10/16 追加
		elif strAgent.find('SecuredBrowser'.lower())>=0 and strAgent.find('.securedbrowser'.lower())>=0:
			useragentid = 'CLOMO'
		# IIJセキュリティブラウザ 2013/12/05 追加
		#elif strAgent.find('IIJsmb/'.lower())>=0:
		elif strAgent.find('IIJsmb'.lower())>=0:
			useragentid = 'IIJSMB'
		## サテライト・セキュリティブラウザ対応 2014/11/19 追加
		#elif strAgent.find('SateraitoSecurityBrowser'.lower())>=0 and ( (strAgent.find('iPhone OS 2_0'.lower())>=0 or strAgent.find('iPhone'.lower())>=0) or (strAgent.find('iPod'.lower())>=0) or (strAgent.find('iPad'.lower())>=0) ):
		#	useragentid = 'SATERAITOSECURITYBROWSER_IOS'
		# WindowsPhone
		elif strAgent.find('IEMobile'.lower())>=0 or strAgent.find('Windows Phone'.lower())>=0:
			useragentid = 'WINDOWSPHONE'
		# iPhone
		# WindowsMobileにもiPhoneと含まれるケースがあるので除外 2015.12.24
		#elif strAgent.find('iPhone OS 2_0'.lower())>=0 or strAgent.find('iPhone'.lower())>=0:
		elif strAgent.find('iPhone'.lower())>=0 and not strAgent.find('iPad'.lower())>=0 and not strAgent.find('Windows Phone'.lower())>=0:
			useragentid = 'IPHONE'
		# iPod
		elif strAgent.find('iPod'.lower())>=0:
			useragentid = 'IPOD'
		## サテライト・セキュリティブラウザ対応 2014/11/19 追加
		#elif strAgent.find('SateraitoSecurityBrowser'.lower())>=0 and strAgent.find('Android '.lower())>=0:
		#	useragentid = 'SATERAITOSECURITYBROWSER_ANDROID'
		# Android
		elif strAgent.find('Android '.lower())>=0 and strAgent.find('Mobile '.lower())>=0:
			useragentid = 'ANDROID'
		# Blackberry
		elif strAgent.find('BlackBerry'.lower())>=0:
			useragentid = 'BLACKBERRY'
		# iPhoneというキーワードが含まれるWindowsMobileもあるので↑に移動 2015.12.24
		## WindowsPhone
		#elif strAgent.find('IEMobile'.lower())>=0 or strAgent.find('Windows Phone'.lower())>=0:
		#	useragentid = 'WINDOWSPHONE'
		# iPad
		elif strAgent.find('iPad'.lower())>=0:
			useragentid = 'IPAD'
		# サテライト・セキュリティブラウザ対応 2016/04/13 追加
		elif strAgent.find('SateraitoSecurityBrowser'.lower())>=0 and strAgent.find('Mac OS X'.lower())>=0:
			useragentid = 'SATERAITOSECURITYBROWSER_MAC'
		# Microsoft Edge 追加 2015.07.17
		elif strAgent.find('Edge'.lower())>=0:
			useragentid = 'EDGE'
		# IE
		elif strAgent.find('MSIE'.lower())>=0 or strAgent.find('Trident'.lower())>=0:
			useragentid = 'IE'
		# FireFox
		elif strAgent.find('FireFox'.lower())>=0:
			useragentid = 'FF'
		# Opera15以降のChromimum化対応 2014.07.29
		# Opera
		elif strAgent.find('Opera'.lower())>=0 or (strAgent.find('Chrome'.lower())>=0 and strAgent.find('OPR'.lower())>=0):
			useragentid = 'OP'
		# Safari（ChromeにもSafariの文字が入っているのでそれははじく）
		# Chrome（iOSのChromeにも対応 2015.01.07）
		#elif strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0:
		# Microsoft EdgeにもSafariという文字が入っているので対応（↑で先に判別されるが一応） 2015.07.17
		#elif strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0 and strAgent.find('CriOS'.lower())<0:
		# Mac版セキュリティブラウザにもSafariという文字が入っているので対応（↑で先に判別されるが一応） 2016.04.13
		#elif strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0 and strAgent.find('CriOS'.lower())<0 and strAgent.find('Edge'.lower())<0:
		elif strAgent.find('Safari'.lower())>=0 and strAgent.find('Chrome'.lower())<0 and strAgent.find('CriOS'.lower())<0 and strAgent.find('Edge'.lower())<0 and strAgent.find('Cachatto'.lower())<0 and strAgent.find('SateraitoSecurityBrowser'.lower())<0:
			useragentid = 'SF'
		# Chrome（iOSのChromeにも対応 2014.02.17）
		#elif strAgent.find('Chrome'.lower())>=0:
		# Microsoft EdgeにもChromeという文字が入っているので対応（↑で先に判別されるが一応） 2015.07.17
		#elif strAgent.find('Chrome'.lower())>=0 or strAgent.find('CriOS'.lower())>=0:
		elif (strAgent.find('Chrome'.lower())>=0 or strAgent.find('CriOS'.lower())>=0) and strAgent.find('Edge'.lower())<0:
			useragentid = 'CR'
		# Opera15以降のChromimum化対応 2014.07.29
		## Opera
		#elif strAgent.find('Opera'.lower())>=0:
		#	useragentid = 'OP'
		# Lunascape
		elif strAgent.find('Lunascape'.lower())>=0:
			useragentid == 'LS'
		# それ以外はUserAgentそのものを使用
		else:
			useragentid = strAgent
		return useragentid
	getAccessUserAgentIDForAccessControl = classmethod(getAccessUserAgentIDForAccessControl)

	# UserAgentIDに対して表示文言を返す
	def getUserAgentDisp(cls, helper, useragentid):
		useragentdisp = ''
		if useragentid == 'SATERAITOSECURITYBROWSER_IOS':
			useragentdisp = helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_IOS')
		elif useragentid == 'SATERAITOSECURITYBROWSER_ANDROID':
			useragentdisp = helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_ANDROID')
		elif useragentid == 'SATERAITOSECURITYBROWSER_MAC':
			useragentdisp = helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_MAC')
		elif useragentid == 'SATERAITOSECURITYBROWSER_WINDOWS':
			useragentdisp = helper.getMsg('DEVICE_SATERAITOSECURITYBROWSER_WINDOWS')
		# SSOCLIENT
		elif useragentid == 'SSOCLIENT':
			useragentdisp = helper.getMsg('DEVICE_SSOCLIENT')
		# Blackberry
		elif useragentid == 'BLACKBERRY':
			useragentdisp = helper.getMsg('DEVICE_BLACKBERRY')
		# WindowsPhone
		elif useragentid == 'WINDOWSPHONE':
			useragentdisp = helper.getMsg('DEVICE_WINDOWSPHONE')
		# WILLCOM
		elif useragentid == 'WILLCOM':
			useragentdisp = helper.getMsg('DEVICE_WILLCOM')
		# SoftBank
		elif useragentid == 'SB':
			useragentdisp = helper.getMsg('DEVICE_SB')
		# au
		elif useragentid == 'AU':
			useragentdisp = helper.getMsg('DEVICE_AU')
		# Docomo
		elif useragentid == 'DC':
			useragentdisp = helper.getMsg('DEVICE_DC')
		# KAITO
		elif useragentid == 'KAITO':
			useragentdisp = helper.getMsg('DEVICE_KAITO')
		# CLOMOセキュリティブラウザ 2013/10/16 追加
		elif useragentid == 'CLOMO':
			useragentdisp = helper.getMsg('DEVICE_CLOMO')
		# IIJセキュリティブラウザ 2013/12/05 追加
		elif useragentid == 'IIJSMB':
			useragentdisp = helper.getMsg('DEVICE_IIJSMB')
		# CACHATTOセキュリティブラウザ 2016/02/21 追加
		elif useragentid == 'CACHATTO':
			useragentdisp = helper.getMsg('DEVICE_CACHATTO')
		# iPhone
		elif useragentid == 'IPHONE':
			useragentdisp = helper.getMsg('DEVICE_IPHONE')
		# iPod
		elif useragentid == 'IPOD':
			useragentdisp = helper.getMsg('DEVICE_IPOD')
		# Android
		elif useragentid == 'ANDROID':
			useragentdisp = helper.getMsg('DEVICE_ANDROID')
		# iPad
		elif useragentid == 'IPAD':
			useragentdisp = helper.getMsg('DEVICE_IPAD')
		# IE
		elif useragentid == 'IE':
			useragentdisp = helper.getMsg('DEVICE_IE')
		# FireFox
		elif useragentid == 'FF':
			useragentdisp = helper.getMsg('DEVICE_FF')
		# Chrome
		elif useragentid == 'CR':
			useragentdisp = helper.getMsg('DEVICE_CR')
		# Safari（ChromeにもSafariの文字が入っているのでそれははじく）
		elif useragentid == 'SF':
			useragentdisp = helper.getMsg('DEVICE_SF')
		# Opera
		elif useragentid == 'OP':
			useragentdisp = helper.getMsg('DEVICE_OP')
		# Lunascape
		elif useragentid == 'LS':
			useragentdisp = helper.getMsg('DEVICE_LS')
		return useragentdisp
	getUserAgentDisp = classmethod(getUserAgentDisp)


	# 該当ユーザの既存の申請一覧から有効な申請データの件数を取得（ステータスにかかわらずレコードがあればカウント）
	def getActiveApplyCountByUser(cls, helper, operator_unique_id):
		q = UCFMDLAccessApply.all(keys_only=True)
		q.filter('operator_unique_id =', operator_unique_id)
		active_apply_count = q.count()
		#gql = ''
		#wheres = []
		#wheres.append("operator_unique_id = '" + UcfUtil.escapeGql(operator_unique_id) + "'")
		#gql += UcfUtil.getToGqlWhereQuery(wheres)
		#entrys = UCFMDLAccessApply.gql(gql)
		#active_apply_count = 0
		#for entry in entrys:
		#	# フィルタリングするならここで
		#	active_apply_count += 1
		return active_apply_count
	getActiveApplyCountByUser = classmethod(getActiveApplyCountByUser)

	# 該当ユーザの許可済みかつアクセス期限の切れていない申請一覧を取得
	def getApprovalApplyVoListByUser(cls, helper, operator_unique_id):
		apply_vos = []
		q = UCFMDLAccessApply.all()
		q.filter('operator_unique_id =', operator_unique_id)
		q.filter('approval_status IN', ['APPROVAL', 'DENY'])			# 申請済みはカウントしないべきなので修正 2016.11.24
		active_apply_count = 0
		for entry in q:
			vo = entry.exchangeVo(helper._timezone)
			AccessApplyUtils.editVoForSelect(helper, vo)
			is_approval = True
			# ステータス.承認済みかどうか
			if is_approval and UcfUtil.getHashStr(vo, 'approval_status') != 'APPROVAL':
				is_approval = False
			# アクセス期限.切れていないかどうか
			if is_approval:
				access_expire = UcfUtil.getHashStr(vo, 'access_expire')
				if access_expire != '' and UcfUtil.getNowLocalTime(helper._timezone) > UcfUtil.getDateTime(access_expire):
					is_approval = False
			if is_approval:
				apply_vos.append(vo)
		return apply_vos
	getApprovalApplyVoListByUser = classmethod(getApprovalApplyVoListByUser)

	# 許可通知メール送信キューに追加
	def addMailSendQueue(cls, helper, apply_vo):
		# token作成
		token = UcfUtil.guid()
		params = {
				'apply_unique_id': UcfUtil.getHashStr(apply_vo, 'unique_id')
		}
		# taskに追加
		import_q = taskqueue.Queue('send-mail')
		import_t = taskqueue.Task(
				url='/a/' + helper._tenant + '/' + token + '/sendmail_update_approval_status',
				params=params,
				#target='mail',
				target='default',
				countdown='1'
		)
		import_q.add(import_t)
		logging.info('add taskqueue:sendmail_update_approval_status')
	addMailSendQueue = classmethod(addMailSendQueue)


############################################################
## バリデーションチェッククラス ：アクセス申請用
############################################################
class AccessApplyValidator(BaseValidator):

	def validate(self, helper, vo):

		# 初期化
		self.init()

		check_name = ''
		check_key = ''
		check_value = ''

		########################
		check_name = helper.getMsg('FLD_APPLY_COMMENT')
		check_key = 'apply_comment'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 最大長チェック：500文字
		if not self.maxLengthValidator(check_value, 500):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 500)))


############################################################
## バリデーションチェッククラス ：アクセス承認用
############################################################
class ApprovalAccessApplyValidator(BaseValidator):

	def validate(self, helper, vo):

		# 初期化
		self.init()

		check_name = ''
		check_key = ''
		check_value = ''

		########################
		check_name = helper.getMsg('FLD_APPROVAL_COMMENT')
		check_key = 'approval_comment'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 最大長チェック：500文字
		if not self.maxLengthValidator(check_value, 500):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 500)))

		check_name = helper.getMsg('FLD_COMMENT')
		check_key = 'comment'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 最大長チェック：500文字
		if not self.maxLengthValidator(check_value, 500):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 500)))

