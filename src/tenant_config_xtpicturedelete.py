# coding: utf-8

import webapp2
from google.appengine.api import images
from google.appengine.ext import db
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils import loginfunc
from ucf.utils import ucffunc
from ucf.config.ucfconfig import *
from ucf.pages.file import *
from ucf.pages.dept import *
import sateraito_inc
import sateraito_func

# 企業の背景画像などを標準に戻す（削除）
class Page(TenantAppHelper):
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

			# 有償版チェック
			if sateraito_func.isFreeMode(self._tenant):
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_NOAVAILABLE_FREE_APP')))
				return

			if self.isAdmin() == False:
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				return

			# デザインタイプ
			design_type = UcfUtil.nvl(self.getRequest('dtp'))
			if design_type == '':
				design_type = UcfConfig.TEMPLATE_DEFAULT_DESIGN_TYPE

			# 画像ID
			picture_id = UcfUtil.nvl(self.getRequest('picture_id'))
			# 画像IDチェック
			if picture_id not in ('logo', 'mainbg01', 'mainbg02', 'mainbg03', 'mainbg04', 'mainbg05', 'mainbg06', 'mainbg07', 'mainbg08', 'mainbg09', 'mainbg10'):
				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_PARAMETER',('picture_id'))))
				return

			# 企業マスタから対象の既存データキーを取得
			data_key_field = ''
			# ロゴ
			if picture_id == 'logo':
				data_key_field =  'logo_data_key'
			# ログイン画面背景画像
			elif picture_id == 'mainbg01':
				data_key_field =  'login_background_' + design_type + '1_data_key'
			elif picture_id == 'mainbg02':
				data_key_field =  'login_background_' + design_type + '2_data_key'
			elif picture_id == 'mainbg03':
				data_key_field =  'login_background_' + design_type + '3_data_key'
			elif picture_id == 'mainbg04':
				data_key_field =  'login_background_' + design_type + '4_data_key'
			elif picture_id == 'mainbg05':
				data_key_field =  'login_background_' + design_type + '5_data_key'
			elif picture_id == 'mainbg06':
				data_key_field =  'login_background_' + design_type + '6_data_key'
			elif picture_id == 'mainbg07':
				data_key_field =  'login_background_' + design_type + '7_data_key'
			elif picture_id == 'mainbg08':
				data_key_field =  'login_background_' + design_type + '8_data_key'
			elif picture_id == 'mainbg09':
				data_key_field =  'login_background_' + design_type + '9_data_key'
			elif picture_id == 'mainbg10':
				data_key_field =  'login_background_' + design_type + '10_data_key'

			data_key =  UcfUtil.nvl(self.getDeptInfo(True)[data_key_field])

			file_entry = None
			file_vo = None
			if data_key != '':
				file_entry = FileUtils.getDataEntryByDataKey(self, data_key)

			# あればキーをクリア＆データも削除
			if file_entry is not None:
				dept = DeptUtils.getDeptEntryByUniqueID(self, UcfUtil.nvl(self.getDeptInfo(True)['unique_id']))
				dept_vo = dept.exchangeVo(self._timezone)
				DeptUtils.editVoForSelect(self, dept_vo)
				# 企業マスタのdata_keyをクリア
				dept_vo[data_key_field] = ''
				DeptUtils.editVoForRegist(self, dept_vo, None, UcfConfig.EDIT_TYPE_RENEW)
				dept.margeFromVo(dept_vo, self._timezone)
				dept.updater_name = UcfUtil.nvl(self.getLoginID())
				dept.date_changed = UcfUtil.getNow()
				dept.put()
				# ファイル自体も削除
				file_entry.delete()

				memcache_key = 'tenant_picture?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache_key2 = 'tenant_picture2?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache_key3 = 'tenant_picture3?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache_key4 = 'tenant_picture4?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
				memcache.delete(memcache_key)
				memcache.delete(memcache_key2)
				memcache.delete(memcache_key3)
				memcache.delete(memcache_key4)

			# memcacheを更新
			self.getDeptInfo(is_force_select=True)

			# オペレーションログ出力
			operation_log_detail = {}
			operation_log_detail['design_type'] = design_type
			operation_log_detail['picture_id'] = picture_id
			UCFMDLOperationLog.addLog(self.getLoginOperatorMailAddress(), self.getLoginOperatorUniqueID(), UcfConfig.SCREEN_DASHBOARD, UcfConfig.OPERATION_TYPE_REMOVE_PICTURE, '', '', self.getClientIPAddress(), JSONEncoder().encode(operation_log_detail))

			# リダイレクト
			self.redirect('/a/' + tenant + '/config/bgupload')

		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)