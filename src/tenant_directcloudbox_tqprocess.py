# coding: utf-8

import webapp2, logging, json
from ucf.utils.helpers import *
from ucf.utils import loginfunc
from ucf.pages.operator import *
from ucf.utils.models import *
import sateraito_inc
import sateraito_func
import lineworks_func
import directcloudbox_func
import channels
from google.appengine.api import images


class TqUploadImagePage(TenantTaskHelper):
	
	def processOfRequest(self, tenant, rule_id):
		try:
			if not self.isValidTenant(not_redirect=True):
				return
			
			req = UcfVoInfo.setRequestToVo(self)
			logging.info(req)
			chat_session = UcfUtil.getHashStr(req, 'chat_session')
			chat_session = json.JSONDecoder().decode(chat_session)
			node = UcfUtil.getHashStr(req, 'node')
			user_id = UcfUtil.getHashStr(req, 'user_id')
			none_permission = UcfUtil.getHashStr(req, 'none_permission')
			
			rule_row = FileUpSettingConfig.getInstance(rule_id)
			if rule_row is None:
				logging.error('not found rule.')
				return
			
			channel_config = None
			if rule_row.channel_config is not None and rule_row.channel_config != '':
				channel_config = json.JSONDecoder().decode(rule_row.channel_config)
			else:
				logging.error('channel_config is not JSON format.')
				return
		
			open_api_id = channel_config.get('open_api_id', '')
			consumer_key = channel_config.get('consumer_key', '')
			server_id = channel_config.get('server_id', '')
			priv_key = channel_config.get('priv_key', '')
			
			channel = None
			for channel_class in channels.channel_classes:
				if channel_class.CHANNEL_KIND == rule_row.channel_kind:
					channel = channel_class({'language': self._language, 'oem_company_code': self._oem_company_code})
					break
			else:
				logging.error('invalid channel_kind' + str(rule_row.trigger_channel_kind))
				return
			
			access_token = directcloudbox_func.getAccessToken()
			if node == '':
				logging.debug('process create LINE WORKS folder')
				create_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes', 'create',
																			   name=self.getMsg('CHAT_IMAGE_SAVE'),
																			   node=sateraito_inc.DIRECT_CLOUD_BOX_BASE_NODE)
				if 'success' in create_folder and create_folder['success'] is True:
					logging.debug('process get list folder to get LINE WORKS folder node')
					get_list_folder = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'sharedboxes', 'lists',
																					 node=sateraito_inc.DIRECT_CLOUD_BOX_BASE_NODE)
					if 'success' in get_list_folder and get_list_folder['success'] is True:
						list_folder = get_list_folder['lists']
						for folder in list_folder:
							if folder['name'] == self.getMsg('CHAT_IMAGE_SAVE'):
								node = folder['node']
								FileUpSettingConfig.setFolderNode('lineworksbot', node)
								
								logging.debug('process get user_seq to create folder permission')
								user_seq = FileServerSettingConfig.getDCBUserSeq('directcloudbox')
								if user_seq:
									logging.debug('process create permission for LINE WORKS folder')
									directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'folder_permissions',
																				   'create', node=node, user_seq=user_seq)
			else:
				# if none_permission == 0:
				logging.debug('process check permission which has [owner/editor/editor] permission can upload')
				get_folder_permission = directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'folder_permissions',
																					   'lists', node=node)
				result = get_folder_permission['result']
				
				user_seq = FileServerSettingConfig.getDCBUserSeq('directcloudbox')
				if result['users_count'] > 0:
					flag = True
					users = result['users']
					logging.debug('process check user permission')
					for user in users:
						logging.debug(user)
						if user['user_seq'] == user_seq:
							if user['permission_name'] not in ['owner', 'editor', 'uploader']:
								logging.debug('process check user role')
								get_user = directcloudbox_func.callDCBAdminForUserActionAPI(access_token, 'users', 'read', user_seq=user_seq)
								if 'success' in get_user and get_user['success'] and get_user['result']['role_name'] in ['SUPERUSER', 'MANAGER']:
									logging.debug('process update permission for upload folder')
									directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'folder_permissions', 'update',
																			   dir_permission_seq=user['dir_permission_seq'])
							flag = False
							break
					if flag:
						logging.debug('process check user role')
						get_user = directcloudbox_func.callDCBAdminForUserActionAPI(access_token, 'users', 'read', user_seq=user_seq)
						if 'success' in get_user and get_user['success'] and get_user['result']['role_name'] in ['SUPERUSER', 'MANAGER']:
							logging.debug('process create permission for upload folder')
							directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'folder_permissions', 'create',
																   node=node, user_seq=user_seq)
				else:
					if user_seq:
						logging.debug('process check user role')
						get_user = directcloudbox_func.callDCBAdminForUserActionAPI(access_token, 'users', 'read', user_seq=user_seq)
						if 'success' in get_user and get_user['success'] and get_user['result']['role_name'] in ['SUPERUSER', 'MANAGER']:
							logging.debug('process create permission for upload folder')
							directcloudbox_func.callDirectCloudBoxAdminAPI(access_token, 'folder_permissions', 'create',
																	   node=node, user_seq=user_seq)
					
			count = 0
			logging.debug(node)
			
			resource_id_memcache_key = 'script=source_id&lineworks_id=' + user_id
			resource_id = memcache.get(resource_id_memcache_key)
			logging.debug(resource_id)
			
			list_resource_id = resource_id.split(',')
			
			for resource_id in list_resource_id:
				result = lineworks_func.callLineWorksDownloadContentAPI(open_api_id, consumer_key, server_id, priv_key, resource_id)
				
				if result:
					logging.debug(result.headers)
					text = result.headers.get('content-disposition')
					logging.debug(text)
					file_extension = re.findall(r'filename=\"([\s\S]*?)\"', text)[0].split('.')[-1]
					
					datetime_now = str(UcfUtil.getNowLocalTime(self._timezone))
					file_datetime = datetime_now.split(' ')[0].replace('-', '') + datetime_now.split(' ')[1].split('.')[0].replace(':', '')
					
					file_name = file_datetime
					if 'location' in chat_session:
						file_name = file_name + '_' + chat_session['location']
					file_name = file_name + '_' + UcfUtil.guid()
					
					logging.debug('process get image property')
					img = images.Image(result.content)
					# logging.debug(img.height)
					img.im_feeling_lucky()
					img.execute_transforms(parse_source_metadata=True)
					image_property = img.get_original_metadata()
					logging.debug(image_property)
					
					image_name = file_name + '.' + file_extension
					content_type, body = sateraito_func.encode_multipart_formdata([], [('Filedata', str(image_name), result.content)])
					upload_image = directcloudbox_func.callShareBoxFileManagementApi(access_token, 'upload', node=node,
																					 file_data=body, content_type=content_type)
					logging.debug(upload_image)
					if 'success' in upload_image and upload_image['success'] is True:
						count += 1
					
					if 'comment' in chat_session:
						logging.debug('process upload comment file txt')
						txt = ''
						txt += '[' + self.getMsg('FILE_NAME') + '] ' + image_name + '\n\n'
						if 'DateTimeOriginal' in image_property:
							dt_object = datetime.datetime.fromtimestamp(int(image_property['DateTimeOriginal']))
							image_datetime = UcfUtil.getUTCTime(UcfUtil.getDateTime(dt_object), self._timezone)
							txt += '[' + self.getMsg('IMAGE_DATETIME') + '] ' + str(image_datetime).replace('-', '/') + '\n\n'
						txt += '[' + self.getMsg('UPLOAD_DATETIME') + '] ' + str(datetime_now).split('.')[0].replace('-', '/') + '\n\n'
						if 'GPSLatitude' in image_property and 'GPSLongitude' in image_property:
							txt += '[' + self.getMsg('IMAGE_LOCATION') + '] ' + 'https://www.google.com/maps/place/' + \
								   str(image_property['GPSLatitude']) + ',' + str(image_property['GPSLongitude']) + '\n\n'
						if 'location' in chat_session:
							txt += '[' + self.getMsg('UPLOAD_LOCATION') + '] ' + 'https://www.google.com/maps/place/' + \
								   chat_session['location'] + '\n\n'
						txt += '[' + self.getMsg('COMMENT') + '] ' + chat_session['comment']
						txt_name = file_name + '.txt'
						content_type, body = sateraito_func.encode_multipart_formdata([], [('Filedata', str(txt_name), txt)], 'text/plain')
						directcloudbox_func.callShareBoxFileManagementApi(access_token, 'upload', node=node,
																	  file_data=body, content_type=content_type)
											
			if count == len(list_resource_id):
				response_content = self.getMsg('MSG_NOTIFICATION_UPLOADED_SUCCESS', str(count))
				channel.executeAction(tenant, user_id, response_content, channel_config)
			else:
				response_content1 = self.getMsg('MSG_NOTIFICATION_UPLOADED_FAIL')
				channel.executeAction(tenant, user_id, response_content1, channel_config)
			
			channel.clearChatSession(tenant, user_id, rule_id, self._language, self._oem_company_code)
			
			logging.debug('process clear memcache')
			memcache.set(key=resource_id_memcache_key, value='', time=0)
		
		except BaseException, e:
			self.outputErrorLog(e)


app = webapp2.WSGIApplication([('/a/([^/]*)/([^/]*)/tq/uploadimage', TqUploadImagePage)],
							  debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
