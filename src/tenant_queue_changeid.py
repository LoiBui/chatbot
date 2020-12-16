# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.config.ucfconfig import *
from ucf.config.ucfmessage import *
from ucf.utils.ucfutil import *
from ucf.utils import loginfunc
from ucf.pages.task import TaskChangeIDUtils
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func

##############################
# �L���[�F�^�X�N�P�������F�A�J�E���g�A�O���[�vID�ύX
##############################
class Page(TenantTaskHelper):

	def processOfRequest(self, tenant, token):
		self._approot_path = os.path.dirname(__file__)

		## �G���[��1�񂨂����珈�����I������
		#if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 10):
		#	logging.error('error over_10_times')
		#	return

		###################################
		# ���ʃp�����[�^
		task_unique_id = UcfUtil.nvl(self.getRequest('task_unique_id'))
		requestor = UcfUtil.nvl(self.getRequest('requestor'))
		sync_result = {}
		sync_result['execute_operator_id'] = UcfUtil.nvl(self.getRequest('execute_operator_id'))
		sync_result['log_text'] = ''
		sync_result['error_count'] = 0

		task_entry = None
		task_vo = None
		data_key = ''

		###################################
		# �O�����i�^�X�N�擾�A�X�e�[�^�X�ύX�Ȃǁj
		is_valid, task_entry, task_vo = TaskChangeIDUtils.beforeTaskProcess(self, task_unique_id, sync_result)
		if is_valid == False:
			return

		try:
			if task_vo.get('task_type', '') == 'change_user_id':
				TaskChangeIDUtils.changeBelongMembersAddressesOfUser(self, sync_result, task_vo, task_entry, is_direct_taskprocess=False)
			else:
				TaskChangeIDUtils.changeBelongMembersAddresses(self, sync_result, task_vo, task_entry, is_direct_taskprocess=False)

			if TaskChangeIDUtils.updateTaskStatusWithCancelIndicate(self, task_unique_id, sync_result, is_afterprocess=True):	# �^�X�N�X�e�[�^�X�A���O�X�V�iwith �L�����Z���w���`�F�b�N�j
				return

		except Exception, e:
			self.outputErrorLog(e)
			# ������̓I�ȓ��e���o��
			#sync_result['log_text'] += ucffunc.createErrorLogRecord(self, 'A system error occured.', '', data_key)
			sync_result['log_text'] += ucffunc.createErrorLogRecord(self, 'A system error occured. (' + str(e) + ')', '', data_key)
			if TaskChangeIDUtils.updateTaskStatusWithCancelIndicate(self, task_unique_id, sync_result, is_afterprocess=True, is_error=True):	# �^�X�N�X�e�[�^�X�A���O�X�V�iwith �L�����Z���w���`�F�b�N�j
				return



######################################################################
app = webapp2.WSGIApplication([('/a/([^/]*)/([^/]*)/queue_changeid', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)

