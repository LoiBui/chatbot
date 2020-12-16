#!/usr/bin/python
# coding: utf-8

import os
import webapp2, logging
import json, datetime  # 申込ページ拡張対応
from google.appengine.api import urlfetch  # 申込ページ拡張対応
from ucf.utils.models import *
from ucf.utils.helpers import *
from ucf.utils.validates import BaseValidator
from ucf.utils.mailutil import UcfMailUtil
from ucf.pages.operator import OperatorUtils
import sateraito_inc
import sateraito_func
import sateraito_mail
import oem_func


class _Page(webapp2.RequestHandler):
	
	def process(self, oem_company_code, sp_code):
		
		try:
			logging.debug(oem_company_code)
			logging.debug(sp_code)
			# 言語を決定（Cookieの値を考慮）
			hl_from_cookie = self.getCookie('hl')
			hl = self.request.get('hl')
			logging.info('hl_from_cookie=' + str(hl_from_cookie))
			if hl != '' and hl in sateraito_func.ACTIVE_LANGUAGES:
				self._language = hl
				self.setCookie('hl', hl, path='/')
			elif hl_from_cookie is not None and hl_from_cookie in sateraito_func.ACTIVE_LANGUAGES:
				self._language = hl_from_cookie
			
			# 言語一覧
			language_list = []
			for language in sateraito_func.ACTIVE_LANGUAGES:
				language_list.append([language, self.getMsg(sateraito_func.LANGUAGES_MSGID.get(language, ''))])
			
			ucfp = UcfFrontParameter(self)
			
			error_messages = []
			
			# Requestからvoにセット
			req = UcfVoInfo.setRequestToVo(self)
			contact_tel_no = UcfUtil.getHashStr(req, 'contact_tel_no1') + UcfUtil.getHashStr(req,
																							 'contact_tel_no2') + UcfUtil.getHashStr(
				req, 'contact_tel_no3')
			req['contact_tel_no'] = contact_tel_no
			# ステータス
			edit_status = UcfUtil.getHashStr(req, UcfConfig.QSTRING_STATUS)
			back_status = UcfUtil.nvl(self.getRequest('bk'))
			# ページ番号（種別）
			page_no = UcfUtil.getHashStr(req, 'pno')
			ucfp.data = req
			vo = req
			if edit_status == UcfConfig.VC_CHECK:
				# 入力チェック
				vc = Validator('')
				vc.validate(self, vo, oem_company_code, sp_code)
				ucfp.voinfo.validator = vc
				# 入力エラーがなければ登録処理
				if ucfp.voinfo.validator.total_count <= 0:
					
					tenant = UcfUtil.getHashStr(req, 'tenant').strip()
					# federated_domain = UcfUtil.getHashStr(req, 'federated_domain').strip()
					
					logging.info('tenant=' + str(tenant))
					# logging.info('federated_domain=' + str(federated_domain))
					
					# テナントが既に登録されていないかチェック
					tenant_entry = sateraito_func.getTenantEntry(tenant)
					if tenant_entry is not None:
						self.redirectError(UcfMessage.getMessage(self.getMsg('ALREADY_REGIST_TENANT_NAME'), (tenant)))
						return
					
					# is_valid_domain = True		# とりあえずノーチェック
					# if not is_valid_domain:
					#	ucfp.voinfo.setVo(vo, None, None, self)
					#	error_messages.append(UcfMessage.getMessage(self.getMsg('ERR_INVALID_ADMIN_ACCOUNT_OR_FEDERATED_DOMAIN')))
					# else:
					if True:
						
						# 入力エラーがなければ確認画面に遷移（確認ページから戻ってきた直後を除く）
						if back_status == UcfConfig.STATUS_BACK:
							pass
						
						elif page_no == 'REQUEST':
							# 確認ページを表示
							template_vals = {
								'oem_company_code': oem_company_code,
								'sp_code': sp_code,
								'ucfp': ucfp,
								'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
								'error_messages': error_messages,
								'footer_message': self.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ()),
								'language_list': JSONEncoder().encode(language_list)
							}
							self.appendBasicInfoToTemplateVals(template_vals)
							self.render('contract_confirm.html', self._design_type, template_vals)
							return
						else:
							
							# 登録処理
							
							tenant = UcfUtil.getHashStr(req, 'tenant').strip()
							# federated_domain = UcfUtil.getHashStr(req, 'federated_domain').strip()
							default_operator_id = UcfUtil.getHashStr(req, 'default_operator_id').strip()
							default_operator_pwd = UcfUtil.getHashStr(req, 'default_operator_pwd').strip()
							
							# default_operator_email = default_operator_id + '@' + federated_domain
							# default_operator_email = default_operator_id + '@' + tenant.strip()
							# default_operator_email = default_operator_email.lower()
							default_operator_email = default_operator_id.lower()
							company_name = UcfUtil.getHashStr(req, 'company_name').strip()
							tanto_name = UcfUtil.getHashStr(req, 'tanto_name').strip()
							contact_mail_address = UcfUtil.getHashStr(req, 'contact_mail_address').strip()
							contact_tel_no = UcfUtil.getHashStr(req, 'contact_tel_no').strip()
							contact_prospective_account_num = UcfUtil.getHashStr(req, 'contact_prospective_account_num')  # 申込ページ拡張対応
							
							strOldNamespace = namespace_manager.get_namespace()
							namespace_manager.set_namespace('')
							
							# TenantEntry登録
							tenant_entry = sateraito_func.insertTenantEntry(tenant, is_free_mode=True)
							# FederatedDomainEntryに登録
							# sateraito_func.setFederatedDomainEntry(tenant, federated_domain)
							
							namespace_manager.set_namespace(tenant.lower())
							
							# 海外展開対応
							default_language = self._language
							default_timezone = 'Asia/Tokyo' if self._language == 'ja' else 'Etc/UTC'
							default_encoding = 'SJIS' if self._language == 'ja' else 'UTF8'
							
							# DeptMaster登録
							dept_vo = ucffunc.registDeptMaster(self, tenant, company_name, tanto_name,
															   contact_mail_address, contact_tel_no, oem_company_code,
															   sp_code, default_language=default_language,
															   default_timezone=default_timezone,
															   default_encoding=default_encoding)

							# デフォルトプロファイルの登録
							# ucffunc.registDefaultProfile(self, dept_vo)
							# デフォルトオペレータ登録
							self.registDefaultOperator(tenant, dept_vo['dept_id'], default_operator_email,
													   default_operator_pwd, last_name='Default', first_name='Operator',
													   sub_mail_address=contact_mail_address)
							# サンキューメールとセットアップ通知の統合対応 2020.06.09
							# サンキューメール送信
							# self.sendNotificationMail(vo, oem_company_code, sp_code)
							# 営業メンバーに通知メール送信 2016.10.10
							# self.sendInstallNotificationMailToSalesMembers(tenant_entry, dept_vo, federated_domain, oem_company_code, sp_code)
							# 申込ページ拡張対応
							# self.sendInstallNotificationMailToSalesMembers(tenant_entry, dept_vo, oem_company_code, sp_code, contact_prospective_account_num=contact_prospective_account_num)
							self.sendThankyouMailAndSetupNotificationMail(vo, tenant_entry, dept_vo, oem_company_code, sp_code,
																		  contact_prospective_account_num=contact_prospective_account_num)
							
							# 処理後一覧ページに遷移
							if sp_code == '':
								self.redirect(
									'/' + oem_company_code + '/contract/thanks?tenant=' + UcfUtil.urlEncode(tenant))
							else:
								self.redirect(
									'/' + oem_company_code + '/' + sp_code + '/contract/thanks?tenant=' + UcfUtil.urlEncode(
										tenant))
							return
				
				# 入力エラーがあれば画面に戻る
				else:
					ucfp.voinfo.setVo(vo, None, None, self)
			else:
				pass
			
			template_vals = {
				'oem_company_code': oem_company_code,
				'sp_code': sp_code,
				'ucfp': ucfp,
				'vcmsg': ucfp.voinfo.validator.msg if ucfp.voinfo.validator != None else {},
				'error_messages': error_messages,
				'footer_message': self.getMsg('EXPLAIN_LOGINPAGE_DEFAULT', ()),
				'language_list': JSONEncoder().encode(language_list),
			}
			
			self.appendBasicInfoToTemplateVals(template_vals)
			
			self.render('contract_request.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return
	
	# デフォルトオペレータ登録
	def registDefaultOperator(self, tenant, dept_id, operator_id, operator_password, last_name, first_name,
							  sub_mail_address):
		q = UCFMDLOperator.query()
		q = q.filter(UCFMDLOperator.operator_id_lower == operator_id.lower())
		key = q.get(keys_only=True)
		entry = None
		if key is not None:
			entry = key.get()
		if entry is None:
			vo = {}
			unique_id = UcfUtil.guid()
			vo['unique_id'] = unique_id
			vo['operator_id'] = operator_id
			entry = UCFMDLOperator(unique_id=unique_id, id=OperatorUtils.getKey(self, vo))
			# entry.federated_domain = operator_id.split('@')[1].lower()
			entry.creator_name = 'SYSTEM'
			entry.last_name = last_name
			entry.first_name = first_name
			entry.unique_id = unique_id
			entry.tenant = tenant.lower()
			entry.dept_id = dept_id
			entry.access_authority = ['ADMIN']
		# entry.profile_infos = ['ADMIN01']
		# entry.password1 = ''
		
		entry.operator_id = operator_id
		entry.operator_id_lower = operator_id.lower()
		entry.sub_mail_address = sub_mail_address  # 予備のメールアドレスにも登録（パスワード忘れ対策）
		
		password_enc = ''
		if operator_password is not None and operator_password != '':
			password_enc = self.encryptoData(operator_password, enctype='AES')
		entry.password = password_enc
		entry.password_enctype = 'AES'
		entry.mail_address = sub_mail_address.lower()
		entry.updater_name = 'SYSTEM'
		entry.date_changed = UcfUtil.getNow()
		entry.put()
		
		# UserEntryにレコード追加
		sateraito_func.addUpdateUserEntryTaskQueue(tenant, entry)
	
	# 営業メンバーに通知メール送信 2017.12.15
	# def sendInstallNotificationMailToSalesMembers(self, tenant_entry, dept_vo, federated_domain, oem_company_code, sp_code):
	# 申込ページ拡張対応
	# def sendInstallNotificationMailToSalesMembers(self, tenant_entry, dept_vo, oem_company_code, sp_code):
	# サンキューメールとセットアップ通知の統合対応 2020.06.09
	# def sendInstallNotificationMailToSalesMembers(self, tenant_entry, dept_vo, oem_company_code, sp_code, contact_prospective_account_num=None):
	def sendThankyouMailAndSetupNotificationMail(self, vo, tenant_entry, dept_vo, oem_company_code, sp_code,
												 contact_prospective_account_num=None):
		sp_name = u''
		if sp_code == oem_func.SP_CODE_WORKSMOBILE:
			sp_name = self.getMsg('FILEUP_HTML_TITLE')
			pass
		else:
			sp_name = self.getMsg('FILEUP_HTML_TITLE')
		
		subject = u'[セットアップ通知] %s：%s' % (sp_name, tenant_entry.tenant)
		body = u''
		body += u'サービス名：%s\n' % (sp_name)
		body += u'ドメイン：%s\n' % (tenant_entry.tenant)
		body += u'インストール日時：%s\n' % (UcfUtil.nvl(UcfUtil.getNowLocalTime(self._timezone)))
		body += u'利用開始日：%s\n' % (tenant_entry.available_start_date)
		body += u'課金開始日：%s\n' % (tenant_entry.charge_start_date)
		body += u'解約日：%s\n' % (tenant_entry.cancel_date)
		body += u'\n'
		body += u'～その他の情報～\n'
		# body += u'認証ドメイン：%s\n' % (federated_domain)
		body += u'会社名：%s\n' % (dept_vo.get('company_name', ''))
		body += u'担当者名：%s\n' % (dept_vo.get('tanto_name', ''))
		body += u'担当者アドレス：%s\n' % (dept_vo.get('contact_mail_address', ''))
		body += u'担当者電話番号：%s\n' % (dept_vo.get('contact_tel_no', ''))
		body += u'導入予定アカウント数：%s\n' % (UcfUtil.nvl(contact_prospective_account_num))  # 申込ページ拡張対応
		
		# メール送信
		# 申込ページ拡張対応…会社情報サーバーから送る対応 2017.06.05
		# try:
		#	UcfMailUtil.sendOneMail(to=UcfUtil.listToCsv(sateraito_inc.SALES_MEMBERS_EMAILS), cc='', bcc='', reply_to=sateraito_inc.DEFAULT_REPLY_TO_EMAIL, sender=sateraito_inc.SENDER_EMAIL, subject=subject, body=body, body_html='', data=None)
		##ログだけ、エラーにしない
		# except BaseException, e:
		#	self.outputErrorLog(e)
		
		addon_id = 'FILEUP_NONFREE' if not sateraito_inc.debug_mode else 'FILEUP_DEV'  # ※ここはアドオンごとに変更してください
		
		# サンキューメールの送信情報を作成
		# メール文書情報取得
		if sp_code == oem_func.SP_CODE_WORKSMOBILE:
			mail_template_id = 'CONTRACT_FILEUP_WORKSMOBILE'
		else:
			mail_template_id = 'CONTRACT_FILEUP'
		
		mail_info = UcfMailUtil.getMailTemplateInfoByLanguageDef(self, mail_template_id)
		
		tenant = UcfUtil.getHashStr(vo, 'tenant').lower()
		tenant_top_url = oem_func.getMySiteUrl(oem_company_code) + '/a/' + tenant + '/'
		
		# 差し込み情報作成
		insert_vo = {}
		now = UcfUtil.getNowLocalTime(self._timezone)
		insert_vo['DATETIME'] = UcfUtil.nvl(now)
		insert_vo['DATE'] = now.strftime('%Y/%m/%d')
		insert_vo['TIME'] = now.strftime('%H:%M:%S')
		insert_vo['CONTACT_MAIL_ADDRESS'] = UcfUtil.getHashStr(vo, 'contact_mail_address')
		insert_vo['COMPANY_NAME'] = UcfUtil.getHashStr(vo, 'company_name')
		insert_vo['TANTO_NAME'] = UcfUtil.getHashStr(vo, 'tanto_name')
		insert_vo['CONTACT_TEL_NO'] = UcfUtil.getHashStr(vo, 'contact_tel_no1').strip() + UcfUtil.getHashStr(vo,
																											 'contact_tel_no2').strip() + UcfUtil.getHashStr(
			vo, 'contact_tel_no3').strip()
		insert_vo['TENANT'] = tenant
		insert_vo['DASHBOARD_URL'] = tenant_top_url
		
		thankyou_mail_to = UcfUtil.getHashStr(vo, 'contact_mail_address')
		thankyou_mail_subject = UcfUtil.editInsertTag(UcfUtil.getHashStr(mail_info, 'Subject'), insert_vo, '[$$', '$$]')
		thankyou_mail_body = UcfUtil.editInsertTag(UcfUtil.getHashStr(mail_info, 'Body'), insert_vo, '[$$', '$$]')
		thankyou_mail_html_body = UcfUtil.editInsertTag(UcfUtil.getHashStr(mail_info, 'BodyHtml'), insert_vo, '[$$',
														'$$]')
		
		logging.debug(dept_vo)
		
		post_data = {
			'subject': subject,
			'body': body,
			'addon_id': addon_id,
			'sp_code': sp_code,
			'oem_company_code': oem_company_code,
			'tenant_or_domain': tenant_entry.tenant,
			'available_start_date': UcfUtil.nvl(tenant_entry.available_start_date),
			'charge_start_date': UcfUtil.nvl(tenant_entry.charge_start_date),
			'cancel_date': UcfUtil.nvl(tenant_entry.cancel_date),
			'company_name': dept_vo.get('company_name', ''),
			'tanto_name': dept_vo.get('tanto_name', ''),
			'contact_mail_address': dept_vo.get('contact_mail_address', ''),  # 追加 2018.04.11
			'contact_tel_no': dept_vo.get('contact_tel_no', ''),
			'contact_prospective_account_num': UcfUtil.nvl(contact_prospective_account_num),
			# サンキューメールとセットアップ通知の統合対応 2020.06.09
			'version': 'v2',  # API側での動作分岐のため
			'is_send_setup_mail': 'send',
			'is_send_thankyou_mail': 'send',
			'thankyou_mail_to': thankyou_mail_to,
			'thankyou_mail_subject': thankyou_mail_subject,
			'thankyou_mail_body': thankyou_mail_body,
			'thankyou_mail_html_body': thankyou_mail_html_body,
		}
		
		logging.debug(post_data)
		
		payload = json.JSONEncoder().encode(post_data)
		headers = {'Content-Type': 'application/json'}
		retry_cnt = 0
		while True:
			try:
				now = datetime.datetime.now()
				MD5_SUFFIX_KEY_APPSSUPPORT = '0234b04994db475facdc22e5a0351676'  # 認証APIのMD5SuffixKey（サテライトサポート窓口アプリ）
				check_key = UcfUtil.md5(addon_id + now.strftime('%Y%m%d%H%M') + MD5_SUFFIX_KEY_APPSSUPPORT)
				url = 'https://sateraito-apps-support.appspot.com/api/sendmail_to_salesmembers?addon_id=%s&ck=%s' % (
				UcfUtil.urlEncode(addon_id), UcfUtil.urlEncode(check_key))
				result = urlfetch.fetch(url=url, payload=payload, headers=headers, method=urlfetch.POST, deadline=10,
										follow_redirects=True)
				if result.status_code != 200:
					raise Exception(str(result.status_code))
				break
			except Exception, e:
				if retry_cnt < 3:
					logging.warning('retry' + '(' + str(retry_cnt) + ')... ' + str(e))
					retry_cnt += 1
				else:
					logging.exception(e)
					break


class Page(ContractFrontHelper, _Page):
	def processOfRequest(self, oem_company_code):
		self._approot_path = os.path.dirname(__file__)
		
		# OEMコードチェック
		if not oem_func.isValidOEMCompanyCode(oem_company_code):
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
			return
		
		self.process(oem_company_code, '')


class SPPage(ContractSPFrontHelper, _Page):
	def processOfRequest(self, oem_company_code, sp_code):
		self._approot_path = os.path.dirname(__file__)
		
		# OEMコードチェック
		if not oem_func.isValidOEMCompanyCode(oem_company_code):
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
			return
		
		# SPコードチェック
		if not oem_func.isValidSPCode(oem_company_code, sp_code):
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS')))
			return
		
		self.process(oem_company_code, sp_code)


app = webapp2.WSGIApplication([
	(r'/([^/]*)/contract/request', Page),
	(r'/([^/]*)/([^/]*)/contract/request', SPPage),
], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)


############################################################
## バリデーションチェッククラス
############################################################
class Validator(BaseValidator):
	
	def validate(self, helper, vo, oem_company_code, sp_code):
		
		# 初期化
		self.init()
		
		check_name = ''
		check_key = ''
		check_value = ''
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_TENANT_NAME')
		check_key = 'tenant'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 半角英数字チェック
		if not self.alphabetNumberValidator(check_value, except_str=['-', '_', '.']):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_ALPHABETNUMBER'), (check_name)))
		# 最大長チェック：100文字（長すぎても微妙なので）
		if not self.maxLengthValidator(check_value, 100):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 100)))
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_DEFAULT_OPERATOR_ID')
		check_key = 'default_operator_id'
		check_value = UcfUtil.getHashStr(vo, check_key)
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		## @以降が入ってこないようにメールアドレス形式の場合ははじく 2014.06.19
		# elif self.mailAddressValidator(check_value):
		#	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_EXCEPT_MAILADDRESS'), (check_name)))
		# 半角英数字チェック
		elif not self.alphabetNumberValidator(check_value, except_str=['-', '_', '.', '@']):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_ALPHABETNUMBER'), (check_name)))
		# 半角スペースもはじく 2017.01.23
		elif check_value.find(' ') >= 0:
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_SPACE'), (check_name)))
		
		########################
		
		check_name = helper.getMsg('FLD_CONTRACT_DEFAULT_OPERATOR_PWD')
		check_key = 'default_operator_pwd'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# 半角チェック
		elif not self.hankakuValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_HANKAKU'), (check_name)))
		# 半角スペースもはじく 2017.01.23
		elif check_value.find(' ') >= 0:
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_SPACE'), (check_name)))
		# 暗号化が正しくできるかを判別 2018.05.29
		else:
			try:
				password_enc = helper.encryptoData(check_value, enctype='AES')
			except BaseException, e:
				self.appendValidate(check_key,
									UcfMessage.getMessage(helper.getMsg('MSG_VC_INCLUDE_INVALID_CHAR2'), (check_name)))
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_COMPANY_NAME')
		check_key = 'company_name'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_TANTO_NAME')
		check_key = 'tanto_name'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_CONTACT_MAIL_ADDRESS')
		check_key = 'contact_mail_address'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		# メールアドレス形式チェック
		if not self.mailAddressValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAILADDRESS')))
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_CONTACT_TEL_NO')
		check_key = 'contact_tel_no1'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_CONTACT_TEL_NO')
		check_key = 'contact_tel_no2'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		
		########################
		check_name = helper.getMsg('FLD_CONTRACT_CONTACT_TEL_NO')
		check_key = 'contact_tel_no3'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
		
		########################
		check_name = helper.getMsg('FLD_CONTACT_PROSPECTIVE_ACCOUNT_NUM')
		check_key = 'contact_prospective_account_num'
		check_value = UcfUtil.getHashStr(vo, check_key).strip()
		# 必須チェック
		if not self.needValidator(check_value):
			self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))


