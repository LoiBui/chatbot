# coding: utf-8

import webapp2,logging
from ucf.utils.helpers import *
import sateraito_inc
import sateraito_func

from utilities import IPy

######################################
# �V���v���ȓ��̓`�F�b�N�F
######################################
class Page(AjaxHelper):
	def processOfRequest(self):
		self.response.headers['Content-Type'] = 'application/json'
		try:

			# Request����vo�ɃZ�b�g
			req = UcfVoInfo.setRequestToVo(self)

			check_value = UcfUtil.getHashStr(req, 'check_value')
			check_name = UcfUtil.getHashStr(req, 'check_name')
			autocmd = UcfUtil.getHashStr(req, 'autocmd')

			# IP�A�h���X
			# IPv6�Ή� 2013.01.15
			if autocmd == 'ipaddress':
				is_ok = False

				sp = check_value.split('.')
				# IPv4
				if len(sp) == 4:
					is_err = False
					for sp1 in sp:
						try:
							spi = int(sp1)
							if spi < 0 or spi > 255:
								is_err = True
						except BaseException, e:
							is_err = True

					if is_err == False:
						is_ok = True

				# IPv6�iIPv4�����̃`�F�b�N�ɓ��ꂵ�Ă��������ꉞ�c���Ă�����IPv6�����ύX�j
				else:
					try:
						IPy.IP(check_value)
						is_ok = True
					except BaseException, e:
						logging.info('[autocmd:invalid IPv6]' + str(e))
						is_ok = False

				if is_ok == False:
					self._code = 100
					self._msg = self.getMsg('MSG_VC_REG_PATTERN', (check_name))
					self.responseAjaxResult()
					return
			
			logging.info(check_value)

			# �u���E�U
			if autocmd == 'useragentid':
				if check_value == '':
					self._code = 100
					self._msg = self.getMsg('MSG_VC_REG_PATTERN', (check_name))
					self.responseAjaxResult()
					return

			self._code = 0
			self.responseAjaxResult()

		except BaseException, e:
			self.outputErrorLog(e)
			self._code = 999
			self.responseAjaxResult()

app = webapp2.WSGIApplication([('/vcautocmd', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)