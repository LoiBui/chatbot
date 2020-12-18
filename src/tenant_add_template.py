# coding: utf-8

import webapp2
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
import sateraito_inc
import sateraito_func

_gnaviid = 'DASHBOARD'
_leftmenuid = 'OPERATIONLOG'
class Page(TenantAppHelper):

  def processOfRequest(self, tenant):
		try:
			self._approot_path = os.path.dirname(__file__)
			if self.isValidTenant() == False:
				return

			if loginfunc.checkLogin(self) == False:
				return

			# �����`�F�b�N
			if self.isAdmin() == False:
#				self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_AUTHORITY')))
				self.redirect('/a/' + tenant + '/personal/')
				return

			# ���O�C�����̊e������擾���`�F�b�N
			is_select_ok, user_vo, profile_vo, error_msg = loginfunc.checkLoginInfo(self)
			if is_select_ok == False:
				return
			# �p�X���[�h����ύX�t���O���`�F�b�N
			if self.checkForcePasswordChange() == False:
				return

			ucfp = UcfTenantParameter(self)
			ucfp.data['gnaviid'] = _gnaviid
			ucfp.data['leftmenuid'] = _leftmenuid
			ucfp.data['explains'] = [self.getMsg('EXPLAIN_OPERATIONLOG_HEADER')]

			template_vals = {
				'ucfp' : ucfp,
			}
			print(1111111111111111111111111111111111111111111111111111111111111111111111111111)
			self.appendBasicInfoToTemplateVals(template_vals)

			self.render('template_add.html', self._design_type, template_vals)
		except BaseException, e:
			self.outputErrorLog(e)
			self.redirectError(UcfMessage.getMessage(self.getMsg('MSG_SYSTEM_ERROR'), ()))
			return

app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/add_template', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))