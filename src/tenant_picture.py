# coding: utf-8

import webapp2,logging,datetime,time
from google.appengine.api import memcache
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.pages.file import *
from ucf.config.ucfconfig import *
import sateraito_inc
import sateraito_func
import oem_func
from ucf.utils import ucffunc,loginfunc

class Page(TenantImageHelper):
	def processOfRequest(self, tenant, picture_id, data_key=None):
		self._approot_path = os.path.dirname(__file__)
		try:

#			# パフォーマンスチューニング：画像のときはまあチェックしなくてもいいかなと
#			if self.isValidTenant(not_redirect=True) == False:
#				self.outputErrorLog(self.getMsg('MSG_NOT_INSTALLED', (self._tenant)))
#				self.response.set_status(403)
#				return

			# OEM会社コード
			oem_company_code = oem_func.getValidOEMCompanyCode(self.getDeptValue('oem_company_code'))

			# memcacheから取得しないフラグ
			is_notuse_memcache = 'n' == self.getRequest('uc')
			# デザインタイプ
			if self.getRequest('dtp') != '':
				design_type = self.getRequest('dtp')
			else:
				design_type = self._design_type

			# 画像IDチェック
			if picture_id not in ['logo', 'mainbg01', 'mainbg02', 'mainbg03', 'mainbg04', 'mainbg05', 'mainbg06', 'mainbg07', 'mainbg08', 'mainbg09', 'mainbg10']:
				self.response.set_status(404)
				return

			memcache_key = 'tenant_picture?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
			memcache_key2 = 'tenant_picture2?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
			memcache_key3 = 'tenant_picture3?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type
			memcache_key4 = 'tenant_picture4?tenant=' + tenant + '&picture_id=' + picture_id + '&designe_type=' + design_type

			# memcache使用時
			if not is_notuse_memcache:

				keys = [memcache_key, memcache_key2,memcache_key3,memcache_key4]
				mapping = memcache.get_multi(keys)

				#last_modified = memcache.get(memcache_key4)
				last_modified = mapping.get(memcache_key4)

				if self.responseIsLastModified(last_modified=last_modified, is_force_response=is_notuse_memcache):
					return

				#binary_data = memcache.get(memcache_key)
				#content_type = memcache.get(memcache_key2)
				#file_name = memcache.get(memcache_key3)
				binary_data = mapping.get(memcache_key)
				content_type = mapping.get(memcache_key2)
				file_name = mapping.get(memcache_key3)
				if binary_data and content_type and file_name and last_modified:
					self.responseImage(binary_data, content_type, file_name, last_modified, is_notuse_memcache)
					return

			# memcacheから取得しない、あるいはできなかった場合

			# データキーと取得できなかった場合のデフォルトファイル名を決定
			data_key = ''
			file_name = ''
			content_type = None
			last_modified = ''
			if self.getDeptInfo() is not None:
				# ロゴ
				if picture_id == 'logo':
					data_key =  UcfUtil.nvl(self.getDeptInfo()['logo_data_key'])
					file_name = 'Logo.png'
					content_type = 'image/png'
				# ログイン画面背景画像
				elif picture_id == 'mainbg01':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '1_data_key')
					file_name = '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg02':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '2_data_key')
					file_name = '02.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg03':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '3_data_key')
					file_name = '03.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg04':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '4_data_key')
					file_name = '04.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg05':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '5_data_key')
					file_name = '05.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg06':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '6_data_key')
					file_name = '06.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg07':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '7_data_key')
					file_name = '07.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg08':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '8_data_key')
					file_name = '08.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg09':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '9_data_key')
					file_name = '09.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'
				elif picture_id == 'mainbg10':
					data_key =  UcfUtil.getHashStr(self.getDeptInfo(), 'login_background_' + design_type + '10_data_key')
					file_name = '10.jpg' if design_type == UcfConfig.VALUE_DESIGN_TYPE_PC else '01.jpg'
					content_type = 'image/jpeg'

			# OEMを考慮（とりあえずはLogoのみ）
			if picture_id == 'logo':
				filepath = self.getParamFilePath(os.path.join('images', design_type, 'oem', oem_company_code, file_name))
			else:
				filepath = self.getParamFilePath(os.path.join('images', design_type, file_name))
			# データキーが指定されていなければデフォルト画像を返して終了
			if data_key == '':
				fp = open(filepath, 'rb')
				binary_data = fp.read()
				fp.close()
				last_modified = time.ctime(os.path.getmtime(filepath))
				

			# データキーが指定されていればファイルDBから取得
			else:
				file_entry = FileUtils.getDataEntryByDataKey(self, data_key)

				# バイナリデータが取得できなければデフォルト画像を返して終了
				if file_entry is None or file_entry.blob_data is None:
					fp = open(filepath, 'rb')
					binary_data = fp.read()
					fp.close()
					last_modified = time.ctime(os.path.getmtime(filepath))
				# 取得できればそれを返す
				else:
					binary_data = file_entry.blob_data
					if file_entry.content_type is not None and file_entry.content_type != '':
						content_type = file_entry.content_type
					last_modified = str(file_entry.last_upload_date)
					
			if binary_data is None:
				self.response.set_status(404)
			else:
				mapping = {
					memcache_key:binary_data,
					memcache_key2:content_type,
					memcache_key3:file_name,
					memcache_key4:last_modified,
				}
				#memcache.set(key=memcache_key, value=binary_data, time=3600)
				#memcache.set(key=memcache_key2, value=content_type, time=3600)
				#memcache.set(key=memcache_key3, value=file_name, time=3600)
				#memcache.set(key=memcache_key4, value=last_modified, time=3600)
				memcache.set_multi(mapping, time=3600)

				self.responseImage(binary_data, content_type, file_name, last_modified, is_notuse_memcache)
				if data_key != '':
					logging.info('picture load from bigtable.')
		except BaseException, e:
			self.outputErrorLog(e)
			self.response.set_status(404)
			return


class CustomIconPage(TenantImageHelper):
	def processOfRequest(self, tenant, picture_id, data_key):
		self._approot_path = os.path.dirname(__file__)
		try:
			## OEM会社コード
			#oem_company_code = oem_func.getValidOEMCompanyCode(self.getDeptValue('oem_company_code'))
			# memcacheから取得しないフラグ
			is_notuse_memcache = 'n' == self.getRequest('uc')
			# data_keyチェック
			if data_key is None or data_key == '':
				self.response.set_status(404)
				return

			memcache_key = 'tenant_picture?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key
			memcache_key2 = 'tenant_picture2?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key
			memcache_key3 = 'tenant_picture3?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key
			memcache_key4 = 'tenant_picture4?tenant=' + tenant + '&picture_id=' + picture_id + '&data_key=' + data_key

			# memcache使用時
			if not is_notuse_memcache:

				keys = [memcache_key, memcache_key2,memcache_key3,memcache_key4]
				mapping = memcache.get_multi(keys)

				#last_modified = memcache.get(memcache_key4)
				last_modified = mapping.get(memcache_key4)

				if self.responseIsLastModified(last_modified=last_modified, is_force_response=is_notuse_memcache):
					return

				#binary_data = memcache.get(memcache_key)
				#content_type = memcache.get(memcache_key2)
				#file_name = memcache.get(memcache_key3)
				binary_data = mapping.get(memcache_key)
				content_type = mapping.get(memcache_key2)
				file_name = mapping.get(memcache_key3)
				if binary_data and content_type and file_name and last_modified:
					self.responseImage(binary_data, content_type, file_name, last_modified, is_notuse_memcache)
					return

			# memcacheから取得しない、あるいはできなかった場合

			file_entry = FileUtils.getDataEntryByDataKey(self, data_key)
			# バイナリデータが取得できなければデフォルト画像を返して終了
			if file_entry is None or file_entry.blob_data is None:
				self.response.set_status(404)
				return

			binary_data = file_entry.blob_data
			content_type = None
			if file_entry.content_type is not None and file_entry.content_type != '':
				content_type = file_entry.content_type
			last_modified = str(file_entry.last_upload_date)
			file_name = file_entry.data_name

			mapping = {
				memcache_key:binary_data,
				memcache_key2:content_type,
				memcache_key3:file_name,
				memcache_key4:last_modified,
			}
			memcache.set_multi(mapping, time=300)
			self.responseImage(binary_data, content_type, file_name, last_modified, is_notuse_memcache)

		except BaseException, e:
			self.outputErrorLog(e)
			self.response.set_status(404)
			return

app = webapp2.WSGIApplication([
													('/a/([^/]*)/picture/([^/]+)', Page),
													('/a/([^/]*)/picture/([^/]+)/([^/]+)', CustomIconPage),
											], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)