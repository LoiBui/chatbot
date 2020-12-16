# coding: utf-8

import webapp2
from google.appengine.api import taskqueue
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.utils import loginfunc
from ucf.pages.file import *
import sateraito_inc
import sateraito_func

# CSV�G�N�X�|�[�g�F�񓯊�
class AsyncExportPage(TenantAjaxHelper):
	def processOfRequest(self, tenant):
		try:
			if self.isValidTenant(not_redirect=True) == False:
				self._code = 400
				self._msg = self.getMsg('MSG_NOT_INSTALLED', (self._tenant))
				self.responseAjaxResult()
				return

			if loginfunc.checkLogin(self, not_redirect=True) == False:
				self._code = 403
				self._msg = self.getMsg('MSG_NOT_LOGINED')
				self.responseAjaxResult()
				return

			# ���O�C�����̊e������擾���`�F�b�N
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self, not_redirect=True)
			if is_select_ok == False:
				self._code = 403
				self._msg = error_msg
				self.responseAjaxResult()
				return

			if self.isAdmin() == False and self.isOperator(target_function=UcfConfig.DELEGATE_FUNCTION_OPERATOR_CONFIG) == False:
				self._code = 403
				self._msg = self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')
				self.responseAjaxResult()
				return

			# �L���[�L�[
			data_kind = self.getRequest('data_kind')
			# UCFMDLFile�̃f�[�^�L�[���쐬
			data_key = UcfUtil.guid()
			# CSV�����̏����i����ꍇ�̂݁j
			search_key = self.getRequest('search_key')
			# ���̑���������JSON�i�ꗗ�Ō�����������i�荞���Export���邽�߁j
			optional_scond_json = self.getRequest('optional_scond')

			# �X�e�[�^�X=CREATING �ɂ� 1���R�[�h�ǉ����Ă����i�t�����g����̔��萧��Ȃǂ̂��߁j
			file_entry = FileUtils.insertNewCreatingRecord(self, data_key, data_kind)

			try:
				# CSV�쐬�^�X�N��ǉ�
				token = UcfUtil.guid()
				params = {
									 'data_key': data_key
									,'data_kind':data_kind
									,'search_key':search_key
									,'optional_scond':optional_scond_json
									,'login_operator_id':self.getLoginOperatorID()
									,'login_operator_unique_id':self.getLoginOperatorUniqueID()
	                ,'login_operator_mail_address': self.getLoginOperatorMailAddress()
								 }
				import_q = taskqueue.Queue('csv-export-import')
				import_t = taskqueue.Task(
					url='/a/' + tenant + '/' + token + '/queue_csv_export',
					params=params,
					target=sateraito_func.getBackEndsModuleName(tenant),
					countdown='1'
				)
				import_q.add(import_t)

				self._code = 0
				ret_value = {}
				ret_value['data_key'] = data_key
				self.responseAjaxResult(ret_value)
			
			except BaseException, e:
				file_entry.status = 'FAILED'
				file_entry.updater_name = UcfUtil.nvl(self.getLoginID())
				file_entry.date_changed = UcfUtil.getNow()
				file_entry.put()
				raise e

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

app = webapp2.WSGIApplication([('/a/([^/]*)/asynccsvexport', AsyncExportPage)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)