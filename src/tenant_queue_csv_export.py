# coding: utf-8

import webapp2,logging
from google.appengine.api import taskqueue
from simplejson.decoder import JSONDecoder
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils import loginfunc
from ucf.pages.file import *
from ucf.pages.operator import OperatorUtils
from ucf.pages.operator_group import OperatorGroupUtils
# from ucf.pages.user import UserUtils
from ucf.pages.group import GroupUtils
from ucf.pages.login_history import LoginHistoryUtils
from ucf.pages.operationlog import OperationLogUtils
import sateraito_inc
import sateraito_func
import master_func

##############################
# �L���[�FCSV�G�N�X�|�[�g
##############################
class Page(TenantTaskHelper):

	def processOfRequest(self, tenant, token):
		self._approot_path = os.path.dirname(__file__)

		# �G���[��1�񂨂����珈�����I������
		if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 1):
			logging.error('error over_1_times')
			return

		data_key = UcfUtil.nvl(self.getRequest('data_key'))
		data_kind = UcfUtil.nvl(self.getRequest('data_kind'))
		search_key = UcfUtil.nvl(self.getRequest('search_key'))	# CSV�����̏����i����ꍇ�̂݁j
		optional_scond_json = UcfUtil.nvl(self.getRequest('optional_scond'))	# ���̑���������JSON�i�ꗗ�Ō�����������i�荞���Export���邽�߁j
		login_operator_id = UcfUtil.nvl(self.getRequest('login_operator_id'))
		login_operator_unique_id = UcfUtil.nvl(self.getRequest('login_operator_unique_id'))
		login_operator_mail_address = UcfUtil.nvl(self.getRequest('login_operator_mail_address'))

		if data_key == '':
			raise Exception(self.getMsg('MSG_INVALID_PARAMETER',('data_key')))
			return
		if data_kind == '':
			raise Exception(self.getMsg('MSG_INVALID_PARAMETER',('data_kind')))
			return

		optional_scond = None
		logging.info('optional_scond_json=' + optional_scond_json)
		if optional_scond_json != '':
			optional_scond = JSONDecoder().decode(optional_scond_json)

		# �t�@�C���f�[�^���擾�i�X�e�[�^�X=CREATING�ō쐬�ρj
		file_entry = FileUtils.getDataEntryByDataKey(self, data_key)
		if file_entry is None:
			raise Exception(self.getMsg('MSG_NOTFOUND_TARGET_FILE',(data_key)))
			return

		# �I�y���[�^�����擾
		login_operator_entry = None
		if login_operator_unique_id != '':
			login_operator_entry = OperatorUtils.getData(self, login_operator_unique_id)
			if login_operator_entry is None:
				raise Exception('Not found login operator information.')
				return

		try:
			datNow = UcfUtil.getLocalTime(UcfUtil.getNow(), self._timezone)
			data_name = ''
			csv_text = ''
			if data_kind == 'exportoperatorcsv':
				data_name = tenant + '_' + 'operator_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = OperatorUtils.createCsv(self, login_operator_entry)
			# elif data_kind == 'exportusercsv':
			# 	data_name = tenant + '_' + 'user_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
			# 	csv_text = UserUtils.createCsv(self, login_operator_entry)
			elif data_kind == 'exportgroupcsv':
				data_name = tenant + '_' + 'group_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = GroupUtils.createCsv(self, login_operator_entry)
			elif data_kind == 'exportacslogcsv':
				data_name = tenant + '_' + 'acslog_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				# ���������ɂ��i�荞�� 2016.09.23
				#csv_text = LoginHistoryUtils.createCsv(self, login_operator_entry)
				csv_text = LoginHistoryUtils.createCsv(self, login_operator_entry, optional_scond=optional_scond)
			elif data_kind == 'exportacslogcsv':
				data_name = tenant + '_' + 'acslog_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = LoginHistoryUtils.createCsv(self, login_operator_entry, search_key)
			elif data_kind == 'exportoperationlogcsv':
				data_name = tenant + '_' + 'operationlog_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = OperationLogUtils.createCsv(self, login_operator_entry)
			elif data_kind == 'exportmasterdatacsv':
				master_code = optional_scond.get('master_code')
				if not master_code:
					raise Exception(self.getMsg('MSG_INVALID_PARAMETER',('master_code')))
				query_string = search_key or ''
				master_class = master_func.get_master_class(master_code, True)
				if not master_class:
					raise Exception(self.getMsg('MSG_INVALID_PARAMETER',('master_code')))
				logging.debug('Export MasterData CSV: "{}" -->> "{}"'.format(master_code, query_string))
				data_name = tenant + '_' + 'masterdata' + '_' + master_code + '_' + datNow.strftime('%Y') + datNow.strftime('%m') + datNow.strftime('%d') + datNow.strftime('%H') + datNow.strftime('%M') + datNow.strftime('%S') + '.csv'
				csv_text = master_func.create_csv_str(master_code, query_string=query_string, options=optional_scond)
			else:
				raise Exception(self.getMsg('MSG_INVALID_PARAMETER', ('data_kind')))

			# �t�@�C�������Ή�
			max_file_size = 512000		# �����]�T�������ĂP�l�a��菬���߂Ɂi�}���`�o�C�g���Ȃ�ƂȂ��l�����Ĕ����Ƃ���j
			# max_file_size = 500
			csv_size = len(csv_text)
			is_use_item = False
			if csv_size >= max_file_size:
				is_use_item = True
				start_idx = 0
				end_idx = max_file_size
				item_order = 0
				while True:
					sl = csv_text[start_idx:end_idx]
					if len(sl) <= 0:
						break

					# FileItem ��o�^
					unique_id = UcfUtil.guid()
					file_item_entry = UCFMDLFileItem(unique_id=unique_id,key_name=FileUtils.getItemKey(self, data_key, item_order))
					file_item_entry.unique_id = unique_id
					file_item_entry.data_key = data_key
					file_item_entry.item_order = item_order
					file_item_entry.text_data = sl
					file_item_entry.date_created = UcfUtil.getNow()
					file_item_entry.date_changed = UcfUtil.getNow()
					file_item_entry.put()

					start_idx = end_idx
					end_idx = start_idx + max_file_size
					item_order += 1

			file_vo = file_entry.exchangeVo(self._timezone)
			FileUtils.editVoForSelect(self, file_vo)

			# CSV���t�@�C��DB�Ɋi�[
			file_vo['data_type'] = 'CSV'
			file_vo['content_type'] = 'text/csv'
#			file_vo['data_encoding'] = UcfConfig.DL_ENCODING
			file_encoding = UcfUtil.getHashStr(self.getDeptInfo(True), 'file_encoding')
			if file_encoding == '' or file_encoding == 'SJIS':
				file_vo['data_encoding'] = 'cp932'
			elif file_encoding == 'JIS':
				file_vo['data_encoding'] = 'jis'
			elif file_encoding == 'EUC':
				file_vo['data_encoding'] = 'euc-jp'
			elif file_encoding == 'UTF7':
				file_vo['data_encoding'] = 'utf-7'
			elif file_encoding == 'UTF8':
				file_vo['data_encoding'] = 'utf-8'
			elif file_encoding == 'UNICODE':
				file_vo['data_encoding'] = 'utf-16'
			else:
				file_vo['data_encoding'] = 'cp932'
			file_vo['deal_status'] = 'FIN'
			file_vo['status'] = 'SUCCESS'
			file_vo['is_use_item'] = UcfUtil.nvl(is_use_item)
			if not is_use_item:
				file_vo['text_data'] = csv_text
			file_vo['data_size'] = UcfUtil.nvl(csv_size)					# �ǂ����ɂ��Ă��S�̂̃T�C�Y���Z�b�g
			file_vo['expire_date'] = UcfUtil.add_months(datNow,1)	# �ꃖ���L��Ƃ���
			file_vo['data_name'] = data_name
			file_vo['download_count'] = '0'
#			file_vo['last_download_date'] = UcfUtil.nvl(datNow)
			file_vo['download_operator_id'] = login_operator_id
			file_vo['download_operator_unique_id'] = login_operator_unique_id
			file_vo['last_download_operator_id'] = login_operator_id
			file_vo['last_download_operator_unique_id'] = login_operator_unique_id
			FileUtils.editVoForRegist(self, file_vo, UcfConfig.EDIT_TYPE_NEW)

			# Vo���烂�f���Ƀ}�[�W
			file_entry.margeFromVo(file_vo, self._timezone)
			# �X�V
			file_entry.updater_name = login_operator_id
			file_entry.date_changed = UcfUtil.getNow()
			file_entry.put()
		except Exception, e:
			file_entry.status = 'FAILED'
			file_entry.deal_status = 'FIN'
#			file_entry.log_text = 'system error.'
			file_entry.updater_name = login_operator_id
			file_entry.date_changed = UcfUtil.getNow()
			file_entry.put()
			self.outputErrorLog(e)
			raise e

app = webapp2.WSGIApplication([('/a/([^/]*)/([^/]*)/queue_csv_export', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)

