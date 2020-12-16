# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
import sateraito_inc
import sateraito_func
from ucf.pages.operator import *
from ucf.pages.profile import ProfileUtils
from ucf.pages.mypagelink import MyPageLinkUtils

class Page(TenantAppHelper):

	def getSharePointURLPartsByMailAddress(self, mail_address):
		result = ''
		sp = mail_address.split('@')
		result = sp[0]
		if len(sp) >= 2:
			domain = sp[1]
			result = result + '_' + sp[1].replace('.', '_')
		return result

	def processOfRequest(self, tenant):
		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# ログイン時の各種情報を取得＆チェック
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			if is_select_ok == False:
				return
			# パスワード次回変更フラグをチェック
			if self.checkForcePasswordChange() == False:
				return

			if profile_vo is not None:
				ProfileUtils.editVoForSelect(self, profile_vo, with_expand_mypage_links=True)

			# 自動遷移先URLが指定されていたらリダイレクト
			if ucffunc.redirectAutoRedirectURL(self, profile_vo):
				return

			ucfp = UcfTenantParameter(self)

			is_available_matrixauth = profile_vo is not None and profile_vo['login_type'] == 'DCARD'
			# パスワード変更のリンクを表示するかどうか
			ucfp.data['is_available_password_change'] = not is_available_matrixauth and (profile_vo is None or profile_vo['passwordchange_unavailable_flag'] != 'UNAVAILABLE')
			# ワンタイム・ランダムパスワード PINコード変更のリンクを表示するかどうか
			ucfp.data['is_available_matrixauth'] = is_available_matrixauth and (profile_vo is None or profile_vo['passwordchange_unavailable_flag'] != 'UNAVAILABLE')
			# アクセス申請のリンクを表示するかどうか（まずはシンプルにアクセス制御が有効なら全表示）
#			ucfp.data['is_available_access_apply'] = profile_vo and profile_vo['acsctrl_active_flag'] == 'ACTIVE' and profile_vo['device_check_flag'] == 'ACTIVE' and UcfUtil.getHashStr(vo, UcfConfig.REQUESTKEY_TEMP_LOGIN_CHECK_ACTION_KEY) == ''
			ucfp.data['is_available_access_apply'] = profile_vo and profile_vo['acsctrl_active_flag'] == 'ACTIVE'
			# 予備のメールアドレスのリンクを表示するかどうか
			ucfp.data['is_available_sub_mailaddress_regist'] = True
			# サービスURLと表示フラグ

			icon_info = []		# Nexus7デザイン用なのでApps版以外は不要...
			icon_cnt = 0
			mypage_links = {}
			custom_links = []

			if profile_vo is not None:
				if self._tenant.endswith('.my.salesforce.com'):
					mypage_links['mypage_links_ck_mydomain'] = profile_vo.get('mypage_links_ck_mydomain', False)
					mypage_links['mypage_links_lk_mydomain'] = 'https://' + self._tenant
					# リンク
					if profile_vo.get('mypage_links_ck_mydomain', False):
						icon_info.append({'link':True, 'icon':'mydomain', 'url':'https://' + self._tenant})
						icon_cnt += 1

				# マイページのカスタムリンク設定を取得
				mypagelink_info = None
				mypagelink_unique_id = MyPageLinkUtils.DEFAULT_UNIQUE_ID
				mypagelink_entry = MyPageLinkUtils.getData(self, mypagelink_unique_id)
				if mypagelink_entry is not None:
					mypagelink_vo = mypagelink_entry.exchangeVo(self._timezone)					# 既存データをVoに変換
					MyPageLinkUtils.editVoForSelect(self, mypagelink_vo)		# データ加工（取得用）
					link_info_json = UcfUtil.getHashStr(mypagelink_vo, 'link_info')
					if link_info_json != '':
						mypagelink_info = JSONDecoder().decode(link_info_json)
						for link_data in mypagelink_info:
							link = link_data.get('link')
							if profile_vo.get('mypage_links_ck_' + link.get('id', ''), False):
								custom_links.append({
										'name':link.get('name', ''),
										'url':link.get('url', ''),
										'icon':link.get('icon', ''),
									})

			logging.info(custom_links)

			# パスワード変更アイコン
			if ucfp.data['is_available_password_change']:
				icon_info.append({'link':True, 'icon':'password', 'url':'/a/' + self._tenant + '/personal/password/'})
				icon_cnt += 1
			# 端末申請アイコン（アイズ様Nexus7連携なら表示しない）
			if ucfp.data['is_available_access_apply'] and self.getDeptInfo()['hide_access_apply_link_flag'] != 'HIDDEN':
				icon_info.append({'link':True, 'icon':'accessapply', 'url':'/a/' + self._tenant + '/acs/apply'})
				icon_cnt += 1
			# 予備のメールアドレス登録アイコン
			if ucfp.data['is_available_sub_mailaddress_regist'] and self.getDeptInfo()['hide_regist_sub_mail_address_link_flag'] != 'HIDDEN':
				icon_info.append({'link':True, 'icon':'submailaddress', 'url':'/a/' + self._tenant + '/personal/minfo/'})
				icon_cnt += 1
			# ワンタイムランダムパスワード PINコード変更
			if ucfp.data['is_available_matrixauth']:
				icon_info.append({'link':True, 'icon':'matrixauth', 'url':'/a/' + self._tenant + '/personal/otp/'})
				icon_cnt += 1

						

			# 6 * 2 = 12 分、定義
			for i in range(12 - icon_cnt):
				icon_info.append({'link':False, 'icon':'no', 'url':'#'})
				icon_cnt += 1

			# セキュリティブラウザを表示するかどうか（PCは表示しない、スマホとタブレットは表示）
			#ucfp.data['is_display_securitybrowser_link'] = self._design_type == 'sp' or self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET
			ucfp.data['is_display_securitybrowser_link'] = False
			# セキュリティブラウザリンク
			ucfp.data['securitybrowser_link'] = ''
			if self._is_android:
				ucfp.data['securitybrowser_link'] = 'https://play.google.com/store/apps/details?id=xxxxxx'
			elif self._is_ios:
				ucfp.data['securitybrowser_link'] = 'https://itunes.apple.com/app/idxxxxxx'


			# nexus7かどうか（Salesforce版ではとりあえず対応しない）
			#is_nexus7 = self.getUserAgent().lower().find('nexus 7 ') >= 0
			is_nexus7 = False

			if (is_nexus7 or self.request.get('dtp') == 'nexus7') and self._design_type != 'm':
				template_vals = {
					'ucfp' : ucfp
					,'icon_info':icon_info
					,'mypage_links': mypage_links
					,'custom_links': custom_links
					,'exist_custom_links': custom_links is not None and len(custom_links) > 0
					,'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET		# アクセス申請用ログイン画面でタブレットの場合はそもそも出さない
					
				}
				self.appendBasicInfoToTemplateVals(template_vals)
				self.render('personal_index_nexus7.html', self._design_type, template_vals)
			else:
				template_vals = {
					'ucfp' : ucfp
					,'mypage_links': mypage_links
					,'custom_links': custom_links
					,'exist_custom_links': custom_links is not None and len(custom_links) > 0
					,'is_hide_backstretch':self._career_type == UcfConfig.VALUE_CAREER_TYPE_TABLET		# アクセス申請用ログイン画面でタブレットの場合はそもそも出さない
				}
				self.appendBasicInfoToTemplateVals(template_vals)
				self.render('personal_index.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)