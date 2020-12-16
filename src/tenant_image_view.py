# coding: utf-8

import webapp2, logging, datetime, time
from ucf.utils.helpers import *
from ucf.utils.models import *
from ucf.pages.file import *
from ucf.config.ucfconfig import *
import sateraito_inc
import sateraito_func
from ucf.utils import ucffunc, loginfunc
from google.appengine.api import images


class LoadImagesPage(TenantAppHelper):
	def processOfRequest(self, tenant):
		try:
			if self.isValidTenant() is False:
				return
			
			key = self.request.get('key')
			
			img = images.Image(blob_key=key)
			img.resize(width=300, height=300)
			img.im_feeling_lucky()
			img_png = img.execute_transforms(output_encoding=images.PNG)
			self.response.headers['Content-Type'] = 'image/png'
			self.response.out.write(img_png)
			return

		except BaseException, e:
			self.outputErrorLog(e)
			self.response.set_status(404)
			return


app = webapp2.WSGIApplication([('/a/([^/]*)/image', LoadImagesPage)],
							  debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)

