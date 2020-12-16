# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
from google.appengine.api import namespace_manager
from simplejson.encoder import JSONEncoder
import sateraito_inc
import sateraito_func
import sateraito_db


###########################################################
# API�F�_��Ǘ��V�X�e������̌_������󂯂ăZ�b�g
# �c���p�J�n���A�ۋ��J�n���A����
'''

�`INPUT�`

�`OUTPUT�`


'''
##########################################
class Page(TenantAPIHelper):

	MD5_SUFFIX_KEY = '6a8a0a5a5bf94c95aa0f39d0eedbe71e'		# �S�A�h�I������.�ύX�s��

	# �`�F�b�N�L�[�`�F�b�N
	def _checkCheckKey(self, tenant, check_key):

		is_ok = False

		# MD5SuffixKey
		md5_suffix_key = self.MD5_SUFFIX_KEY

		# �`�F�b�N�L�[�`�F�b�N
		if tenant != '' and check_key != '' and md5_suffix_key != '':
			tenant = tenant.lower()
			domain_check_keys = []
			now = UcfUtil.getNow()	# �W����
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -5).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -4).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -3).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -2).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, -1).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + now.strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 1).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 2).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 3).strftime('%Y%m%d%H%M') + md5_suffix_key))
			domain_check_keys.append(UcfUtil.md5(tenant + UcfUtil.add_minutes(now, 4).strftime('%Y%m%d%H%M') + md5_suffix_key))

			is_ok = False
			for domain_check_key in domain_check_keys:
				if domain_check_key.lower() == check_key.lower():
					is_ok = True
					break
		return is_ok

	def processOfRequest(self, tenant):

		## set namespace
		#sateraito_func.setNamespace(tenant, '')

		return_code = 999
		params = {}
		params['errors'] = []

		try:
#			self._approot_path = os.path.dirname(__file__)

			check_key = self.request.get('ck')
			available_start_date = self.request.get('available_start_date')				# ���p�J�n���iYYYY/MM/DD �`���j
			charge_start_date = self.request.get('charge_start_date')		# �ۋ��J�n���iYYYY/MM/DD �`���j
			cancel_date = self.request.get('cancel_date')			# �����iYYYY/MM/DD �`���j
			available_users = int(self.request.get('license_amount')) if self.request.get('license_amount') != '' else -1		# �_�񃉃C�Z���X���i�擾�ł��Ȃ��ꍇ�͋�-1���Z�b�g����܂��j
			guarantee_trial_term  = self.request.get('guarantee_trial_term')			# �g���C�A�����Ԃ�ۏ؂���ꍇ�con

			# �`�F�b�N�L�[�`�F�b�N
			is_check_ok = self._checkCheckKey(tenant, check_key)
			if not is_check_ok:
				return_code = 403
				params['errors'].append({'code':return_code, 'message': 'invalid check_key.', 'validate':''})
				self.outputResult(return_code, params)
				return

			# �h���C���G���g���[�擾
			tenant_row = sateraito_func.TenantEntry.getInstance(tenant.lower(), cache_ok=False)
			if tenant_row is None:
				return_code = 403
				params['errors'].append({'code':return_code, 'message': 'invalid tenant.', 'validate':''})
				self.outputResult(return_code, params)
				return

			# �_��Ǘ�����A�g���������ɂ�����炸�A�C���X�g�[������30���Ԃ͎g����悤�ɂ���Ή� 2017.10.20
			if guarantee_trial_term == 'on' and cancel_date != '':
				trial_expire = UcfUtil.set_time(UcfUtil.add_days(tenant_row.created_date, 30), 0, 0, 0)
				if trial_expire > UcfUtil.getDateTime(cancel_date):
					cancel_date = trial_expire.strftime('%Y/%m/%d')
			logging.info('cancel_date=' + cancel_date)

			# �_��Ǘ��ɃZ�b�g����Ă���΂��̎��_�ŏ��藘�p�ł͂Ȃ��̂ŗL�����[�h��
			# �ۋ��J�n������L�����[�h�A�������[�h�������؂�ւ��i�_��Ǘ��V�X�e������A�g���Ă��Ȃ��h���C���A�e�i���g�͐��䂵�����Ȃ����߁A�����Ńt���O���㏑���j
			#if charge_start_date != '':
			#	tenant_row.is_free_mode = UcfUtil.set_time(UcfUtil.getNowLocalTime(self._timezone), 0, 0, 0) < UcfUtil.set_time(UcfUtil.getDateTime(charge_start_date), 0, 0, 0)
			tenant_row.is_free_mode = False
			tenant_row.available_start_date = available_start_date
			tenant_row.charge_start_date = charge_start_date
			tenant_row.cancel_date = cancel_date
			if available_users >= 0:
				tenant_row.available_users = available_users
			tenant_row.put()

			sateraito_func.TenantEntry.clearInstanceCache(tenant.lower()) 	# 即時反映されるようにキャッシュをクリア 2019.10.09

			# ���p���[�U�[�����W�v���Č_��Ǘ��T�[�o�[�ɕԂ��iSSO�͂��܂��ܕ����폜���Ȃ��S���擾�����OK�Ȃ̂ł���ł悵�j 2015.11.20
			namespace_manager.set_namespace(tenant.lower())
			# �ʒm�T�[�o�[�͊Ǘ��҂ł͂Ȃ����[�U�[�Ǘ��̃��R�[�h���Ŕ��ʂ��ׂ��Ȃ̂ŕύX 2017.06.05
			#q = UCFMDLOperator.query()
			q = sateraito_db.User.query()
			active_users = q.count(limit=1000000)

			sateraito_func.setNumTenantUser(tenant, tenant_row, active_users)

			return_code = 0
			params['active_users'] = active_users			# ���݂̗��p���[�U�[��
			self.outputResult(return_code, params)

		except BaseException, e:
			self.outputErrorLog(e)
			try:
				return_code = 999
				params['errors'].append({'code':return_code, 'message': 'System error occured.', 'validate':''})
				self.outputResult(return_code, params)
			except BaseException, e2:
				self.outputErrorLog(e2)
				return

	def outputResult(self, return_code, params=None):
		params = {} if params is None else params

		msg = ''
		if params.has_key('errors'):
			for err in params['errors']:
				if msg != '':
					msg += '\n'
				msg += err.get('message', '')

		result = {
			'code':str(return_code)
			,'msg':msg
			,'active_users':params['active_users'] if params.has_key('active_users') else -1
		}
		self.response.out.write(JSONEncoder().encode(result))
		logging.info(result)

app = webapp2.WSGIApplication([('/a/([^/]*)/api/[^/].+', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)