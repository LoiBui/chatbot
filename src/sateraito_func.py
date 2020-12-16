#!/usr/bin/python
# coding: utf-8
import struct

__author__ = 'T.ASAO <asao@sateraito.co.jp>'

import logging, re
import datetime
import random
import json
import time
from dateutil import zoneinfo, tz

# from lxml.html.clean import Cleaner

from google.appengine.ext import db
from google.appengine.api import memcache
from google.appengine.api import taskqueue
from google.appengine.api import namespace_manager
from google.appengine.api import search
from google.appengine.api.search import TransientError
from google.appengine.runtime import DeadlineExceededError
from google.appengine.api import urlfetch
import sateraito_inc
import sateraito_black_list
from ucf.utils.ucfutil import *
from ucf.utils.models import *
from operator import itemgetter
from google.appengine.api import images

OFFSET_OF_MY_UNIXTIME = -2100000000


##########################################################################
# JSON�I�u�W�F�N�g����XPATH�Œl�̈ꗗ���擾�i�ȈՊ֐��j
# [INPUT]
# json_obj�FJSON�I�u�W�F�N�g. 
# xpath�FJSON�I�u�W�F�N�g�̗v�f��\��XPATH���C�N�ȃp�X�@�i��F/root/users/email�j
# without_empty�FTrue�c�󕶎�������ʂ��珜�O
#
# �@�`�����`
#
# �EJSONPath���C�u�����Ƃ��������̂�����݂��������A�����͎��O��JSONXPath�I�Ȃ��̂��쐬
# �EJSON�I�u�W�F�N�g�́A�����ł��z��ł�OK�B�r���ɔz�񂪂������ꍇ�͂��̊e�v�f���ׂĂ��炳��ɉ��ʊK�w�����ǂ�
# �EJSONPath���C�u�����Ƃ��������̂�����݂��������A�����͎��O��JSONXPath�I�Ȃ��̂��쐬
#
# �@�`��`
#
#		json_obj = {'users':
#								{'user':{'email':['asao1@sateraito.co.jp','asao2@sateraito.co.jp']}},
#					
#			}
#
#		xpath = '/users/user/email'
#
#		json_obj = {'users':
#										{'user':{
#													'email':'asao1@sateraito.co.jp'
#												}
#										}
#								}
#
#		xpath = '/users/user/email'
#
#		json_obj = {'users':[
#								{'user':{'email':'asao1@sateraito.co.jp'}},
#								{'user':{'email':'asao2@sateraito.co.jp'}},
#							]
#			}
#
#		xpath = '/users/user/email'
#
#		json_obj = [
#								{'user':{'email':'asao1@sateraito.co.jp'}},
#								{'user':{'email':['asao2@sateraito.co.jp','asao3@sateraito.co.jp']}},
#							]
#
#		xpath = '/user/email'
#
##########################################################################
# def getDataListFromJsonByXPath(json_obj, xpath, without_empty=False):
#	results = []
#
#	# xpath�w�肠��̏ꍇ
#	if xpath.startswith('/'):
#
#		# �����̏ꍇ
#		if isinstance(json_obj, dict):
#			# xpath���u/�v�ŕ������Đ擪��������
#			if xpath == '/':
#				current_key = '/'
#				sub_xpath = ''
#			else:
#				xpaths = xpath.strip('/').split('/')
#				current_key = xpaths[0]
#				if len(xpaths) > 1:
#					sub_xpath = '/' + '/'.join(xpaths[1:])
#				else:
#					sub_xpath = ''
#
#			if current_key == '/':
#				element = json_obj
#				results.extend(getDataListFromJsonByXPath(element, sub_xpath, without_empty=without_empty))
#			elif json_obj.has_key(current_key):
#				element = json_obj.get(current_key)
#				results.extend(getDataListFromJsonByXPath(element, sub_xpath, without_empty=without_empty))
#
#		#json_obj �����X�g�������ꍇ�A���X�g�̊e�v�f�ɑ΂��ď����i��K�w���̂܂܃X���C�h����C���[�W�j
#		elif isinstance(json_obj, list):
#			for element in json_obj:
#				results.extend(getDataListFromJsonByXPath(element, xpath, without_empty=without_empty))
#
#		# �l�̏ꍇ�cxpath�w�肠���json_obj���l�^�Ƃ������Ƃ͑ΏۊO�Ȃ̂ŃZ�b�g���Ȃ�
#		else:
#			pass
#
#	# xpath���w��Ȃ��Ȃ�json_obj��l�Ƃ��Č��ʂ�Ԃ�
#	else:
#		# ���X�g�̏ꍇ�A���X�g�v�f���l�^�̏ꍇ��������
#		if isinstance(json_obj, list):
#			for element in json_obj:
#				if not isinstance(element, (list, dict)):
#					# ���l�̏ꍇ
#					if isinstance(element, (int, long, float)):
#						results.append(element)
#					# Boolean�̏ꍇ
#					elif isinstance(element, bool):
#						results.append(json_obj)
#					# ������̏ꍇ
#					else:
#						str_result = UcfUtil.nvl(element)
#						if not without_empty or str_result != '':
#							results.append(str_result)
#		# �����̏ꍇ�c�Ώۃf�[�^�Ȃ�
#		elif isinstance(json_obj, dict):
#			pass
#		# �l�^�̏ꍇ�c�l���Z�b�g
#		# ���l�̏ꍇ
#		elif isinstance(json_obj, (int, long, float)):
#			results.append(json_obj)
#		# Boolean�̏ꍇ
#		elif isinstance(json_obj, bool):
#			results.append(json_obj)
#		# ������̏ꍇ
#		else:
#			str_result = UcfUtil.nvl(json_obj)
#			if not without_empty or str_result != '':
#				results.append(str_result)
#
#	return results


##########################################################################
# JSON�I�u�W�F�N�g����XPATH�Œl���擾
# [INPUT]
# json_obj�FJSON�I�u�W�F�N�g. 
# xpath�FJSON�I�u�W�F�N�g�̗v�f��\��XPATH���C�N�ȃp�X�@�i��F/root/users/email�j
#
# �@�`�����`
#
# �EJSONPath���C�u�����Ƃ��������̂�����݂��������A�����͎��O��JSONXPath�I�Ȃ��̂��쐬
# �EJSON�I�u�W�F�N�g�́A�����ł��z��ł�OK�B�r���ɔz�񂪂������ꍇ�͂��̊e�v�f���ׂĂ��炳��ɉ��ʊK�w�����ǂ�
#
# �@�`��`
#
#		json_obj = {'users':
#								{'user':{'email':['asao1@sateraito.co.jp','asao2@sateraito.co.jp']}},
#					
#			}
#
#		xpath = '/users/user/email'
#
#		json_obj = {'users':
#										{'user':{
#													'email':'asao1@sateraito.co.jp'
#												}
#										}
#								}
#
#		xpath = '/users/user/email'
#
#		json_obj = {'users':[
#								{'user':{'email':'asao1@sateraito.co.jp'}},
#								{'user':{'email':'asao2@sateraito.co.jp'}},
#							]
#			}
#
#		xpath = '/users/user/email'
#
#		json_obj = [
#								{'user':{'email':'asao1@sateraito.co.jp'}},
#								{'user':{'email':['asao2@sateraito.co.jp','asao3@sateraito.co.jp']}},
#							]
#
#		xpath = '/user/email'
#
##########################################################################
def getDataFromJsonByXPath(json_obj, xpath):
	result, is_list_result = _getDataFromJsonByXPath(json_obj, xpath)
	return result


def _getDataFromJsonByXPath(json_obj, xpath):
	result = None
	is_list_result = False
	# xpath�w�肠��̏ꍇ
	if xpath.startswith('/'):
		# �����̏ꍇ
		if isinstance(json_obj, dict):
			# xpath���u/�v�ŕ������Đ擪��������
			if xpath == '/':
				current_key = '/'
				sub_xpath = ''
			else:
				xpaths = xpath.strip('/').split('/')
				current_key = xpaths[0]
				if len(xpaths) > 1:
					sub_xpath = '/' + '/'.join(xpaths[1:])
				else:
					sub_xpath = ''
			
			data = None
			if current_key == '/':
				element = json_obj
				data, is_list = _getDataFromJsonByXPath(element, sub_xpath)
			elif json_obj.has_key(current_key):
				element = json_obj.get(current_key)
				data, is_list = _getDataFromJsonByXPath(element, sub_xpath)
			if data is not None:
				result = data
				if is_list:
					is_list_result = True
		
		# json_obj �����X�g�������ꍇ�A���X�g�̊e�v�f�ɑ΂��ď����i��K�w���̂܂܃X���C�h����C���[�W�j
		elif isinstance(json_obj, list):
			is_list_result = True
			for element in json_obj:
				data, is_list = _getDataFromJsonByXPath(element, xpath)
				if data is not None:
					if result is None:
						result = []
					if is_list:
						result.extend(data)
					else:
						result.append(data)
		
		# �l�̏ꍇ�cxpath�w�肠���json_obj���l�^�Ƃ������Ƃ͑ΏۊO�Ȃ̂ŃZ�b�g���Ȃ�
		else:
			pass
	
	# xpath���w��Ȃ��Ȃ�json_obj��l�Ƃ��Č��ʂ�Ԃ�
	else:
		result = json_obj
	return result, is_list_result


##########################################################################
# JSON�I�u�W�F�N�g��XPATH�w��ӏ��ɒl���Z�b�g
# [INPUT]
# json_obj�FJSON�I�u�W�F�N�g. 
# xpath�FJSON�I�u�W�F�N�g�̗v�f��\��XPATH���C�N�ȃp�X�@�i��F/root/users/email�j
# value: �Z�b�g����l
#
# [OUTPUT]
# boolean�FTrue�c�l�Z�b�g�ς݁AFalse�c�Z�b�g����
##########################################################################
def setValueToJsonByXPath(json_obj, xpath, value):
	if not xpath.startswith('/'):
		raise Exception('invalid xpath "%s"' % (xpath))
	if xpath.endswith('/'):
		raise Exception('invalid xpath "%s"' % (xpath))
	
	# �����̏ꍇ
	if isinstance(json_obj, dict):
		# xpath���u/�v�ŕ������Đ擪��������
		if xpath == '/':
			current_key = '/'
			sub_xpath = ''
		else:
			xpaths = xpath.strip('/').split('/')
			current_key = xpaths[0]
			if len(xpaths) > 1:
				sub_xpath = '/' + '/'.join(xpaths[1:])
			else:
				sub_xpath = ''
		
		try:
			current_key = str(current_key)
		except:
			pass
		try:
			sub_xpath = str(sub_xpath)
		except:
			pass
		
		# sub_xpath����Ȃ疖���܂ł��ǂ����Ƃ������ƂȂ̂ł����ɃZ�b�g�i�Ȃ���Βǉ��j
		if sub_xpath == '':
			json_obj[current_key] = value
			return True
		# �󂶂�Ȃ��Ȃ炳��ɂ��ǂ�
		else:
			# �Ȃ���΍쐬
			if not json_obj.has_key(current_key):
				json_obj[current_key] = {}
			element = json_obj.get(current_key)
			return setValueToJsonByXPath(element, sub_xpath, value)
	
	# json_obj �����X�g�������ꍇ�A���X�g�̊e�v�f�ɑ΂��ď����i��K�w���̂܂܃X���C�h����C���[�W�j
	elif isinstance(json_obj, list):
		is_set = False
		for element in json_obj:
			if setValueToJsonByXPath(element, xpath, value):
				is_set = True
		return is_set
	
	# �l�̏ꍇ�cxpath�w�肠���json_obj���l�^�Ƃ������Ƃ͑ΏۊO�Ȃ̂ŃZ�b�g���Ȃ�
	else:
		raise Exception('invalid xpath "%s"' % (xpath))


def datetimeToEpoch(d):
	return int(time.mktime(d.timetuple()))


def epochTodatetime(epoch):
	return datetime.datetime(*time.localtime(epoch)[:6])


def isSameList(list1, list2):
	if list1 is None:
		list1 = []
	if list2 is None:
		list2 = []
	return set(list1) == set(list2)


def isSameMembers(list_1, list_2):
	""" Args:
		list_1: list
		list_2: list
Returns:
		boolean
"""
	# set_1 = set(list_1)
	# set_2 = set(list_2)
	# if len(set_1 - set_2) == 0 and len(set_2 - set_1) == 0:
	#	return True
	# return False
	return isSameList(list_1, list_2)


# HTML�����񂩂烊���N�𔻕ʂ��A���J�[�^�O�ɕϊ�
def exchangeToHyperLinkHtml(html_text):
	result = html_text
	ptn_link = re.compile(r"(https?://[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)")
	result = ptn_link.sub(r'!#!a href=!%!\1!%! target=!%!_blank!%! !$!\1!#!/a!$!', result)
	result = result.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
	result = result.replace('\n', '<br />\n')
	result = result.replace('!#!', '<').replace('!$!', '>').replace('!%!', '"')
	return result


# XML�G�X�P�[�v
def encodeXMLText(text):
	if text is None:
		return ''
	else:
		# return saxutils.escape(value)
		text = text.replace('&', '&amp;')
		text = text.replace('"', '&quot;')
		text = text.replace('\'', '&apos;')
		text = text.replace('<', '&lt;')
		text = text.replace('>', '&gt;')
		return text


def addUpdateUserEntryTaskQueue(tenant, operator_entry):
	try:
		# token�쐬
		token = UcfUtil.guid()
		params = {
			'user_email': operator_entry.operator_id_lower,
			'is_admin': 'ADMIN' in operator_entry.access_authority if operator_entry.access_authority is not None else False,
		}
		# task�ɒǉ� �܂邲��
		import_q = taskqueue.Queue('userentry-set-queue')
		import_t = taskqueue.Task(
			url='/a/' + tenant + '/openid/' + token + '/regist_user_entry',
			params=params,
			target='default',
			countdown='0'
		)
		import_q.add(import_t)
		logging.info('add task queue userentry-set-queue')
	
	except Exception, e:
		logging.info('failed add update user entry taskqueue. tenant=' + tenant + ' user=' + operator_entry.operator_id)
		logging.exception(e)


def checkCsrf(request):
	'''
		AJax �� Post �ŌĂяo���ꂽ���N�G�X�g�� CSRF�i�N���X�T�C�g���N�G�X�g�t�H�[�W�F���j���`�F�b�N�B
		��肪�Ȃ��ꍇ�� True ��Ԃ�
'''
	
	headers = request.headers
	
	strHost = headers.get('Host')
	strOrigin = headers.get('Origin')
	strXRequestedWith = headers.get('X-Requested-With')
	
	# if (strHost != sateraito_inc.site_fqdn):
	if (strHost != sateraito_inc.site_fqdn):
		logging.error('Invalid Request Header : Host : ' + str(strHost))
		return False
	
	# if ((strOrigin is not None) and (strOrigin != sateraito_inc.my_site_url)):
	if ((strOrigin is not None) and (strOrigin != sateraito_inc.my_site_url)):
		logging.error('Invalid Request Header : Origin : ' + str(strOrigin))
		return False
	
	if (strXRequestedWith != 'XMLHttpRequest'):
		logging.error('Invalid Request Header : X-Requested-With : ' + str(strXRequestedWith))
		return False
	
	logging.info('csrf check is ok.')
	return True


def get_all_tenant_entry():
	results = []
	start = 0
	limit = 100
	
	# q = Namespace.all()
	# domain_list = []
	# for row in q:
	#	if row.namespace_name != '':
	#		domain_list.append(row.namespace_name)
	
	q = TenantEntry.all()
	fetch_data = None
	if q:
		each_entrys = None
		while each_entrys is None or len(each_entrys) > 0:
			each_entrys = []
			fetch_data = q.fetch(limit, start)
			for entry in fetch_data:
				each_entrys.append(entry)
			results.extend(each_entrys)
			start += limit
	return results


# ���[�U�G���g���̓o�^�A�X�V
def registUserEntry(tenant, user_email, is_admin, is_disable_user):
	tenant = tenant.lower()
	strOldNamespace = namespace_manager.get_namespace()
	namespace_manager.set_namespace('')
	
	logging.info('registUserEntry...')
	logging.info('user_email=' + user_email)
	logging.info('is_admin=' + str(is_admin))
	user_email = user_email.lower()
	try:
		# domain = user_email.split('@')[1]
		# check user entry in datastore
		q = UserEntry.all(keys_only=True)
		q.filter('user_email =', user_email)
		key = q.get()
		if key is None:
			# create user entry on Datastore
			new_user_entry = UserEntry()
			new_user_entry.user_email = user_email
			new_user_entry.tenant = tenant
			# new_user_entry.domain = domain
			new_user_entry.disable_user = False
			# new_user_entry.user_id = user_id
			
			if is_admin:
				new_user_entry.is_admin = True
			else:
				new_user_entry.is_admin = False
			new_user_entry.put()
		else:
			user_entry = UserEntry.getByKey(key)
			# update user entry on Datastore
			user_entry.user_email = user_email
			if is_admin:
				user_entry.is_admin = True
			else:
				user_entry.is_admin = False
			user_entry.put()
		namespace_manager.set_namespace(strOldNamespace)
	except Exception, error:
		namespace_manager.set_namespace(strOldNamespace)
		raise error


## �e�i���g�G���g���̓o�^�A�X�V
# def registTenantEntry(tenant, requestor=''):
#	strOldNamespace = namespace_manager.get_namespace()
#	namespace_manager.set_namespace('')
#	try:
#		token = memcache.get('regist_tenant_entry?tenant=' + tenant)
#		if token is None:
#			# �Y���̃��R�[�h���Ȃ��ꍇ�́A�����쐬�����ق����悳�����Ȃ̂ł����ō쐬�i���̌�̓^�X�N�j
#			insertTenantEntry(tenant)
#			if requestor != '':
#				# token�쐬
#				token = UcfUtil.guid()
#				params = {
#						'requestor': requestor,
#						'type': 'start'
#				}
#				# task�ɒǉ� �܂邲��
#				import_q = taskqueue.Queue('tenant-set-queue')
#				import_t = taskqueue.Task(
#						url='/a/' + tenant + '/openid/' + token + '/regist_tenant_entry',
#						params=params,
#						target='b1process',
#						countdown='5'
#				)
#				#logging.info('run task')
#				import_q.add(import_t)
#				# �^�X�N�ɒǉ��������_�ŏ���1��̓^�X�N�o�^������Ȃ��悤��memcache�X�V�cvalue�̓g�[�N���i�`�F�b�N�Ɏg�p�j
#				memcache_time = 1440 * 60
#				memcache.set(key='regist_tenant_entry?tenant=' + tenant, value=token, time=memcache_time)
#		namespace_manager.set_namespace(strOldNamespace)
#	except Exception, error:
#		namespace_manager.set_namespace(strOldNamespace)
#		raise error

## SSO�A�g�h���C����ǉ�
# def registFederatedDomainEntry(tenant, federated_domain):
#	setFederatedDomainEntry(tenant, federated_domain)
#
# def setFederatedDomainEntry(tenant, federated_domain):
#	strOldNamespace = namespace_manager.get_namespace()
#	namespace_manager.set_namespace('')
#	try:
#		# �Z�[���X�t�H�[�X�͕����̃e�i���g�œ���h���C���̗��p�����蓾��̂ŕύX 2015.12.21
#		#q = FederatedDomainEntry.gql("where federated_domain = :1", federated_domain.lower())
#		#domain_entry = q.get()
#		#if domain_entry is None:
#		#	new_domain_entry = FederatedDomainEntry()
#		#	new_domain_entry.federated_domain = federated_domain.lower()
#		#	new_domain_entry.tenant = tenant.lower()
#		#	new_domain_entry.put()
#		#else:
#		#	if tenant.lower() != domain_entry.tenant:
#		#		domain_entry.tenant = tenant.lower()
#		#		domain_entry.updated_date = UcfUtil.getNow()
#		#		domain_entry.put()
#		q = FederatedDomainEntry.all()
#		q.filter('tenant =', tenant.lower())
#		q.filter('federated_domain =', federated_domain.lower())
#		domain_entry = q.get()
#		if domain_entry is None:
#			new_domain_entry = FederatedDomainEntry()
#			new_domain_entry.federated_domain = federated_domain.lower()
#			new_domain_entry.tenant = tenant.lower()
#			new_domain_entry.put()
#	except Exception, error:
#		raise error
#	finally:
#		namespace_manager.set_namespace(strOldNamespace)

# def removeFederatedDomainEntry(tenant, federated_domain):
#	strOldNamespace = namespace_manager.get_namespace()
#	namespace_manager.set_namespace('')
#	try:
#		q = FederatedDomainEntry.all()
#		q.filter('tenant =', tenant.lower())
#		q.filter('federated_domain =', federated_domain.lower())
#		# �ꉞ�������[�v
#		for domain_entry in q:
#			domain_entry.delete()
#	except Exception, error:
#		raise error
#	finally:
#		namespace_manager.set_namespace(strOldNamespace)


# �Z�[���X�t�H�[�X�͓���h���C���������e�i���g���݂���ꍇ������̂ł��̊֐��͐��藧���Ȃ� 2015.12.21
# �g�p�ӏ���API�֘A�݂̂Ȃ̂ł�������R�����g�A�E�g
# def getFederatedDomainEntry(federated_domain):
#	strOldNamespace = namespace_manager.get_namespace()
#	namespace_manager.set_namespace('')
#	try:
#		q = FederatedDomainEntry.gql("where federated_domain = :1", federated_domain.lower())
#		entry = q.get()
#		return entry
#	except Exception, error:
#		raise error
#	finally:
#		namespace_manager.set_namespace(strOldNamespace)

# def getFederatedDomainList(tenant, is_with_cache=False):
#	strOldNamespace = namespace_manager.get_namespace()
#	namespace_manager.set_namespace('')
#
#	try:
#		memcache_key = 'getfederateddomains?tenant=' + tenant
#
#		validdomainlist = None
#		if is_with_cache:
#			validdomainlist = memcache.get(memcache_key)
#
#		if validdomainlist is None:
#			validdomainlist = []
#			# DeptMaster�ł͂Ȃ��F�؃h���C���e�[�u�������Ĕ���
#			#q = UCFMDLDeptMaster.all()
#			#for row in q:
#			#	if row.federated_domains is not None:
#			#		for federated_domain in row.federated_domains:
#			#			validdomainlist.append(federated_domain.lower())
#			q = FederatedDomainEntry.all()
#			q.filter('tenant =', tenant.lower())
#			for entry in q:
#				validdomainlist.append(entry.federated_domain.lower())
#
#		if validdomainlist is not None:
#			memcache.set(key=memcache_key, value=validdomainlist, time=300)
#		return validdomainlist
#	except Exception, error:
#		raise error
#	finally:
#		namespace_manager.set_namespace(strOldNamespace)

def getDomainPart(p_email_address):
	a_email_address = p_email_address.split('@')
	return a_email_address[1] if len(a_email_address) > 1 else ''


def getUserIDPart(p_email_address):
	a_email_address = p_email_address.split('@')
	return a_email_address[0]


# TenantEntry��1���o�^�i���݂��Ȃ��ꍇ����.�ȍ~�̓^�X�N�ŏ����j
def insertTenantEntry(tenant, is_free_mode=True):
	tenant = tenant.lower()
	q = TenantEntry.gql("where tenant = :1", tenant.lower())
	tenant_entry = q.get()
	if tenant_entry is None:
		tenant_entry = TenantEntry()
		tenant_entry.tenant = tenant
		tenant_entry.num_users = 0
		tenant_entry.max_users = 0
		tenant_entry.available_users = sateraito_inc.DEFAULT_AVAILABLE_USERS
		tenant_entry.is_free_mode = is_free_mode
		tenant_entry.is_disable = False
		
		# �C���X�g�[���Z�b�g���J�ɔ���30��p������������Ή� 2014.03.10
		dt_now = datetime.datetime.now()
		dt_expire = UcfUtil.add_days(dt_now, 30)  # ��������31��i�����łȂ��Ă��悢�Ƃ͎v����...�j
		tenant_entry.available_start_date = dt_now.strftime('%Y/%m/%d')
		tenant_entry.charge_start_date = dt_expire.strftime('%Y/%m/%d')
		# tenant_entry.cancel_date = dt_expire.strftime('%Y/%m/%d')
		tenant_entry.cancel_date = ''
		
		tenant_entry.put()
	return tenant_entry


def setNumTenantUser(tenant, tenant_entry, num_users, max_users=None):
	'''
Set number of domain users
'''
	
	old_namespace = namespace_manager.get_namespace()
	namespace_manager.set_namespace('')
	
	if tenant_entry is None:
		tenant = tenant.lower()
		q = TenantEntry.all()
		q.filter('tenant =', tenant)
		tenant_entry = q.get()
	if tenant_entry is not None:
		is_need_edit = False
		if tenant_entry.num_users is None or tenant_entry.num_users < num_users:
			tenant_entry.num_users = num_users
			is_need_edit = True
		if max_users is not None and (tenant_entry.max_users is not None or tenant_entry.max_users < max_users):
			tenant_entry.max_users = max_users
			is_need_edit = True
		if is_need_edit:
			tenant_entry.updated_date = UcfUtil.getNow()
			tenant_entry.put()
	namespace_manager.set_namespace(old_namespace)


# �ŏI���p�����X�V
def updateDomainLastLoginMonth(tenant):
	strOldNamespace = namespace_manager.get_namespace()
	namespace_manager.set_namespace('')
	try:
		q = TenantEntry.all()
		q.filter('tenant =', tenant.lower())
		tenant_entry = q.get()
		is_updated = False
		if tenant_entry is not None:
			is_updated = tenant_entry.updateLastLoginMonth()
		namespace_manager.set_namespace(strOldNamespace)
		return is_updated
	except Exception, error:
		namespace_manager.set_namespace(strOldNamespace)
		raise error
	return False


# �e�i���g�G���g���[���擾
def getTenantEntry(tenant):
	strOldNamespace = namespace_manager.get_namespace()
	namespace_manager.set_namespace('')
	
	tenant_entry = None
	try:
		q = TenantEntry.all(keys_only=True)
		q.filter('tenant =', tenant.lower())
		tenant_entry = TenantEntry.getByKey(q.get())
		
		namespace_manager.set_namespace(strOldNamespace)
		return tenant_entry
	except Exception, error:
		namespace_manager.set_namespace(strOldNamespace)
		raise error


# �t���[���[�h���ǂ������擾
def isFreeMode(tenant, is_with_cache=True):
	tenant = tenant.lower()
	strOldNamespace = namespace_manager.get_namespace()
	namespace_manager.set_namespace('')
	try:
		memcache_key = 'isfreemode?tenant=' + tenant.lower()
		
		is_free_mode = None
		if is_with_cache:
			is_free_mode = memcache.get(memcache_key)
		
		if is_free_mode is None:
			entry = getTenantEntry(tenant)
			if entry is not None:
				is_free_mode = entry.is_free_mode
		
		if is_free_mode is not None:
			memcache.set(key=memcache_key, value=is_free_mode, time=300)
		
		namespace_manager.set_namespace(strOldNamespace)
		
		if is_free_mode is None:
			is_free_mode = True
		
		return is_free_mode
	except Exception, error:
		namespace_manager.set_namespace(strOldNamespace)
		raise error


# ����e�i���g���ǂ������擾
def isTenantDisabled(tenant, without_check_black_list=False):
	row = TenantEntry.getInstance(tenant, cache_ok=True)
	if row is None:
		return True
	
	# �u���b�N���X�g���`�F�b�N 2017.01.30
	# G Suite �ňȊO�̓u���b�N���X�g�����Ȃ��Ή� 2017.08.28
	# if not without_check_black_list:
	#	if tenant in sateraito_black_list.DOMAINS_TO_DISABLE:
	#		return True
	
	is_need_update = False
	if row.is_disable is None:
		row.is_disable = False
		is_need_update = True
	if row.available_start_date is None:
		row.available_start_date = ''
		is_need_update = True
	if row.charge_start_date is None:
		row.charge_start_date = ''
		is_need_update = True
	if row.cancel_date is None:
		row.cancel_date = ''
		is_need_update = True
	if is_need_update:
		row.put()
	
	if row.is_disable == True:
		return True
	
	# ������`�F�b�N����悤�ɑΉ� 2013/11/13
	if row.cancel_date != '':
		now = UcfUtil.getNow()  # �W����
		cancel_date = UcfUtil.add_days(UcfUtil.getDateTime(row.cancel_date), 1)  # ����͗��p�Ƃ��邽��1���Ă���
		return now >= cancel_date
	
	return False


# �h���C�����Ƃ�BackEnds�p���W���[���̃��W���[�������擾
# ���^�X�N��CSV�����ȂǑ傫�߂ȏ����ł̂ݎg��. �S�Ă�BackEnds�����Ŏg���Ƃ͌���Ȃ�
# ���f�t�H���g=b2process
def getBackEndsModuleName(tenant):
	module_name = 'b2process'
	row = TenantEntry.getInstance(tenant, cache_ok=True)
	if row is not None:
		if row.backends_module_type == 'b2':
			module_name = 'b2process'
		elif row.backends_module_type == 'b4':
			module_name = 'b4process'
	logging.info('module_name=' + module_name)
	return module_name


def needToShowUpgradeLink(tenant):
	""" check if domain is in status to show upgrade link
	Return: True if showing upgrade link is needed
"""
	# Upgrade link is shown ONLY IN FREE edition
	if not isFreeMode(tenant):
		return False
	# check number of users
	row = TenantEntry.getInstance(tenant, cache_ok=True)
	if row is None:
		return False
	available_users = row.available_users
	num_users = row.num_users
	logging.info('available_users=' + str(available_users) + ' num_users=' + str(num_users))
	if available_users is not None and num_users is not None:
		if available_users < num_users:
			return True
	return False


def getSharePointURLPartsByMailAddress(mail_address):
	result = ''
	sp = mail_address.split('@')
	result = sp[0]
	if len(sp) >= 2:
		domain = sp[1]
		result = result + '_' + sp[1].replace('.', '_')
	return result


# gaesessions�g�p�̂��߂���͖��g�p����
wsgi_config = {'webapp2_extras.sessions': {
	# ��������ƃX�}�z�ȂǂɎx�������������
	'secret_key': 'acd1da8160e04f75b4bfce35e005e068',  # �閧�L�[�K�{
	#						'secret_key':'a',		 #�閧�L�[�K�{
	'cookie_name': 'ucf_sid',  # �Z�b�V�����N�b�L�[��
	'session_max_age': sateraito_inc.session_timeout,  # �Z�b�V������������ (sec)
	'cookie_arg': {
		'max_age': None,
		'domain': None,
		'path': '/',
		'secure': None,
		'httponly': None,
	},
	'default_backend': 'memcache',  # �ۑ���̎w��	securecookie or memcache or datastore
}, }

'''
Database Classes
'''


class TenantEntry(db.Model):
	'''
'''
	tenant = db.StringProperty()
	num_users = db.IntegerProperty()
	max_users = db.IntegerProperty()
	available_users = db.IntegerProperty()  # �����ł̗��p�\���[�U���i�g�p�𐧌�����̂ł͂Ȃ��A�A�b�v�O���[�h�̃��b�Z�[�W���o�����肷��̂Ɏg�p�j�@�� �_��Ǘ�����A�g����_�񃉃C�Z���X�����Z�b�g
	last_login_month = db.StringProperty()  # �Ō�ɗ��p���ꂽ����ێ�
	is_free_mode = db.BooleanProperty()  # �����ݒ�(�����True�j
	is_disable = db.BooleanProperty()
	available_start_date = db.StringProperty()  # ���p�J�n��iYYYY/MM/DD �`���j
	charge_start_date = db.StringProperty()  # �ۋ��J�n��iYYYY/MM/DD �`���j
	cancel_date = db.StringProperty()  # ����iYYYY/MM/DD �`���j
	tenant = db.StringProperty()
	created_date = db.DateTimeProperty(auto_now_add=True)
	updated_date = db.DateTimeProperty(auto_now_add=True)
	# module_type = db.StringProperty()			# �g�p���郂�W���[���^�C�v�if1�Af2�Af4�A�A�A�j
	backends_module_type = db.StringProperty()  # �g�p���郂�W���[���^�C�v�ib1�Ab2�Ab4�A�A�A�j
	
	def updateLastLoginMonth(self):
		""" update last_login_month to current date
		if no need to update(last_login_month is already current), not update
		Return: True ... last_login_month is updated
										False .. last_login_month is not updated
"""
		tz_utc = zoneinfo.gettz('UTC')
		current_time_utc = datetime.datetime.now(tz_utc)
		current_month = current_time_utc.strftime('%Y-%m')
		if (self.last_login_month is None) or (self.last_login_month != current_month):
			self.last_login_month = current_month
			self.put()
			TenantEntry.clearInstanceCache(self.tenant)
			return True
		return False
	
	@classmethod
	def getMemcacheKey(cls, tenant):
		return 'script=tenantentry-getinstance&tenant=' + tenant
	
	@classmethod
	def clearInstanceCache(cls, tenant):
		memcache.delete(cls.getMemcacheKey(tenant))
	
	@classmethod
	def getInstance(cls, tenant, cache_ok=False):
		tenant = tenant.lower()
		strOldNamespace = namespace_manager.get_namespace()
		namespace_manager.set_namespace('')
		result = None
		try:
			# memcache entry expires in 60 min
			memcache_key = cls.getMemcacheKey(tenant)
			memcache_expire_secs = 60 * 60
			if cache_ok:
				# check if cached data exists
				cached_data = memcache.get(memcache_key)
				if cached_data is not None:
					result = db.model_from_protobuf(cached_data)
			
			if result is None:
				q = cls.all()
				q.filter('tenant =', tenant)
				row = q.get()
				if row is not None:
					is_need_put = False
					# if row.module_type is None:
					#	row.module_type = ''
					#	is_need_put = True
					if row.backends_module_type is None:
						row.backends_module_type = ''
						is_need_put = True
					if is_need_put:
						row.put()
					
					if not memcache.set(memcache_key, value=db.model_to_protobuf(row), time=memcache_expire_secs):
						logging.warning("Memcache set failed.")
					result = row
		except Exception, error:
			namespace_manager.set_namespace(strOldNamespace)
			raise error
		namespace_manager.set_namespace(strOldNamespace)
		return result
	
	@classmethod
	def getByKey(cls, key):
		entity = None
		if key is not None:
			if key.name() is not None:
				entity = cls.get_by_key_name(key.name())
			elif key.id() is not None:
				entity = cls.get_by_id(key.id())
		return entity
	
	@classmethod
	def getByTenant(cls, tenant):
		result = None
		if tenant is not None:
			tenant = tenant.lower()
			strOldNamespace = namespace_manager.get_namespace()
			namespace_manager.set_namespace('')
			
			q = cls.all()
			q.filter('tenant =', tenant)
			row = q.get()
			if row is not None:
				result = row
				
			namespace_manager.set_namespace(strOldNamespace)
		return result
	
	@classmethod
	def getById(cls, tenant_id):
		result = None
		entity = cls.get_by_id(tenant_id)
		if entity is not None:
			result = entity
		return result


# class FederatedDomainEntry(db.Model):
#	tenant = db.StringProperty()
#	federated_domain = db.StringProperty()
#	created_date = db.DateTimeProperty(auto_now_add=True)
#	updated_date = db.DateTimeProperty(auto_now_add=True)

class UserEntry(db.Model):
	'''
Datastore class to store User data
'''
	user_email = db.StringProperty()
	# user_id = db.StringProperty()
	tenant = db.StringProperty()
	domain = db.StringProperty()
	created_date = db.DateTimeProperty(auto_now_add=True)
	is_admin = db.BooleanProperty()
	disable_user = db.BooleanProperty()
	
	@classmethod
	def getByKey(cls, key):
		entity = None
		if key is not None:
			if key.name() is not None:
				entity = cls.get_by_key_name(key.name())
			elif key.id() is not None:
				entity = cls.get_by_id(key.id())
		return entity


# ����ꗗ
ACTIVE_LANGUAGES = ['ja', 'en']

TEMPLATE_TYPE = ['push_message', 'push_image', 'push_video', 'push_sticker', 'push_audio', 'push_location',
				 'push_template']

TEMPLATE_MSGID = {
	'push_message': 'LINEAPI_ACTION_TYPE_PUSH_MESSAGE',
	'push_image': 'LINEAPI_ACTION_TYPE_REPLY_IMAGE',
	'push_video': 'LINEAPI_ACTION_TYPE_REPLY_VIDEO',
	'push_audio': 'LINEAPI_ACTION_TYPE_AUDIO',
	'push_location': 'LINEAPI_ACTION_TYPE_LOCATION',
	'push_template': 'LINEAPI_ACTION_TYPE_TEMPLATE',
	'push_sticker': 'LINEAPI_ACTION_TYPE_STICKER'
}

# ���ꃁ�b�Z�[�WID�ikey:����ID�Avalue:���b�Z�[�WID�j
LANGUAGES_MSGID = {
	'ja': 'VMSG_LANG_JAPANESE',
	'en': 'VMSG_LANG_ENGLISH',
	'zh-cn': 'VMSG_LANG_CHINESE',
	'zh-tw': 'VMSG_LANG_CHINESE_TRADITIONAL',
	'ko': 'VMSG_LANG_KOREAN',
	'pt': 'VMSG_LANG_PORTUGUESE',
	'fr': 'VMSG_LANG_FRENCH',
	'de': 'VMSG_LANG_GERMAN',
	'es': 'VMSG_LANG_SPANISH',
	'hi': 'VMSG_LANG_HINDI',
	'sv': 'VMSG_LANG_SWEDISH',
	'fi': 'VMSG_LANG_FINNISH',
	'it': 'VMSG_LANG_ITALIAN',
	'id': 'VMSG_LANG_INDONESIAN',
	'ru': 'VMSG_LANG_RUSSIAN',
	'tl': 'VMSG_LANG_TAGALOG',
	'mn': 'VMSG_LANG_MONGOLIAN',
	'my': 'VMSG_LANG_MYANMAR',
	'vi': 'VMSG_LANG_VIETNAMESE',
	'ms': 'VMSG_LANG_MALAYSIAN',
	'no': 'VMSG_LANG_NORWEGIAN',
	'da': 'VMSG_LANG_DANISH',
	'lo': 'VMSG_LANG_LAO',
	'cs': 'VMSG_LANG_CZECH',
	'tr': 'VMSG_LANG_TURKISH',
}


def exchangeLanguageCode(lang):
	return lang


def getActiveLanguage(language, hl=sateraito_inc.DEFAULT_LANGUAGE):
	language = exchangeLanguageCode(language)
	return language if language in ACTIVE_LANGUAGES else hl


def getActiveTimeZone(timezone, default_timezone=sateraito_inc.DEFAULT_TIMEZONE):
	return timezone if timezone in ACTIVE_TIMEZONES else default_timezone


# �g�p����ExtJs��locale�t�@�C�������t�@�C����������
def getExtJsLocaleFileName(lang):
	lang = lang.lower()
	
	logging.info('getExtJsLocaleFileName....')
	logging.info('lang=' + lang)
	
	locale_file = 'ext-lang-en.js'
	if lang == 'en':
		locale_file = 'ext-lang-en.js'
	elif lang == 'en_bg':
		locale_file = 'ext-lang-en_GB.js'
	elif lang == 'cn' or lang == 'zh-cn' or lang == 'zh_cn':
		locale_file = 'ext-lang-zh_CN.js'
	elif lang == 'zh-tw' or lang == 'zh_tw':
		locale_file = 'ext-lang-zh_TW.js'
	elif lang == 'ja' or lang == 'ja-jp' or lang == 'ja_jp':
		locale_file = 'ext-lang-ja.js'
	elif lang == 'ko' or lang == 'ko-kr' or lang == 'ko_kr':
		locale_file = 'ext-lang-ko.js'
	elif lang == 'pt':
		locale_file = 'ext-lang-pt.js'
	elif lang == 'pt-br' or lang == 'pt_br':
		locale_file = 'ext-lang-pt_BR.js'
	elif lang == 'fr' or lang == 'fr-be' or lang == 'fr-lu' or lang == 'fr-ch':
		locale_file = 'ext-lang-fr.js'
	elif lang == 'fr-ca':
		locale_file = 'ext-lang-fr_CA.js'
	elif lang == 'sv' or lang == 'sv_se':
		locale_file = 'ext-lang-sv_SE.js'
	elif lang == 'fi':
		locale_file = 'ext-lang-fi.js'
	elif lang == 'de':
		locale_file = 'ext-lang-de.js'
	# elif lang == 'hi':
	#	locale_file = 'ext-lang-.js'
	elif lang == 'es':
		locale_file = 'ext-lang-es.js'
	elif lang == 'it':
		locale_file = 'ext-lang-it.js'
	elif lang == 'th':
		locale_file = 'ext-lang-th.js'
	elif lang == 'ru':
		locale_file = 'ext-lang-ru.js'
	elif lang == 'id':
		locale_file = 'ext-lang-id.js'
	elif lang == 'vi':
		locale_file = 'ext-lang-vn.js'
	elif lang == 'cs':
		locale_file = 'ext-lang-cs.js'
	elif lang == 'da':
		locale_file = 'ext-lang-da.js'
	elif lang == 'no':
		locale_file = 'ext-lang-no_NN.js'
	elif lang == 'tr':
		locale_file = 'ext-lang-tr.js'
	
	logging.info('locale_file=' + locale_file)
	
	return locale_file


# �L��ȃ^�C���]�[�����X�g�i�����̂Ŗ����Ɂj
ACTIVE_TIMEZONES = [
	'Pacific/Midway',
	'Pacific/Niue',
	'Pacific/Pago_Pago',
	'Pacific/Honolulu',
	'Pacific/Rarotonga',
	'Pacific/Tahiti',
	'Pacific/Marquesas',
	'America/Anchorage',
	'Pacific/Gambier',
	'America/Los_Angeles',
	'America/Tijuana',
	'America/Vancouver',
	'America/Whitehorse',
	'Pacific/Pitcairn',
	'America/Dawson_Creek',
	'America/Denver',
	'America/Edmonton',
	'America/Hermosillo',
	'America/Mazatlan',
	'America/Phoenix',
	'America/Yellowknife',
	'America/Belize',
	'America/Chicago',
	'America/Costa_Rica',
	'America/El_Salvador',
	'America/Guatemala',
	'America/Managua',
	'America/Mexico_City',
	'America/Regina',
	'America/Tegucigalpa',
	'America/Winnipeg',
	'Pacific/Easter',
	'Pacific/Galapagos',
	'America/Bogota',
	'America/Cayman',
	'America/Grand_Turk',
	'America/Guayaquil',
	'America/Havana',
	'America/Iqaluit',
	'America/Jamaica',
	'America/Lima',
	'America/Montreal',
	'America/Nassau',
	'America/New_York',
	'America/Panama',
	'America/Port-au-Prince',
	'America/Rio_Branco',
	'America/Toronto',
	'America/Caracas',
	'America/Antigua',
	'America/Asuncion',
	'America/Barbados',
	'America/Boa_Vista',
	'America/Campo_Grande',
	'America/Cuiaba',
	'America/Curacao',
	'America/Guyana',
	'America/Halifax',
	'America/Manaus',
	'America/Martinique',
	'America/Port_of_Spain',
	'America/Porto_Velho',
	'America/Puerto_Rico',
	'America/Santiago',
	'America/Santo_Domingo',
	'America/Thule',
	'Antarctica/Palmer',
	'Atlantic/Bermuda',
	'America/St_Johns',
	'America/Araguaina',
	'America/Bahia',
	'America/Belem',
	'America/Cayenne',
	'America/Fortaleza',
	'America/Godthab',
	'America/Maceio',
	'America/Miquelon',
	'America/Montevideo',
	'America/Paramaribo',
	'America/Recife',
	'America/Sao_Paulo',
	'Antarctica/Rothera',
	'Atlantic/Stanley',
	'America/Noronha',
	'Atlantic/South_Georgia',
	'America/Scoresbysund',
	'Atlantic/Azores',
	'Atlantic/Cape_Verde',
	'Africa/Abidjan',
	'Africa/Accra',
	'Africa/Bamako',
	'Africa/Banjul',
	'Africa/Bissau',
	'Africa/Casablanca',
	'Africa/Conakry',
	'Africa/Dakar',
	'Africa/El_Aaiun',
	'Africa/Freetown',
	'Africa/Lome',
	'Africa/Monrovia',
	'Africa/Nouakchott',
	'Africa/Ouagadougou',
	'Africa/Sao_Tome',
	'America/Danmarkshavn',
	'Atlantic/Canary',
	'Atlantic/Faroe',
	'Atlantic/Reykjavik',
	'Atlantic/St_Helena',
	'Etc/UTC',
	'Europe/Lisbon',
	'Africa/Algiers',
	'Africa/Bangui',
	'Africa/Brazzaville',
	'Africa/Ceuta',
	'Africa/Douala',
	'Africa/Kinshasa',
	'Africa/Lagos',
	'Africa/Libreville',
	'Africa/Luanda',
	'Africa/Malabo',
	'Africa/Ndjamena',
	'Africa/Niamey',
	'Africa/Porto-Novo',
	'Africa/Tunis',
	'Africa/Windhoek',
	'Europe/Amsterdam',
	'Europe/Andorra',
	'Europe/Belgrade',
	'Europe/Berlin',
	'Europe/Brussels',
	'Europe/Budapest',
	'Europe/Copenhagen',
	'Europe/Gibraltar',
	'Europe/Luxembourg',
	'Europe/Madrid',
	'Europe/Malta',
	'Europe/Monaco',
	'Europe/Oslo',
	'Europe/Paris',
	'Europe/Prague',
	'Europe/Rome',
	'Europe/Stockholm',
	'Europe/Tirane',
	'Europe/Vienna',
	'Europe/Zurich',
	'Africa/Blantyre',
	'Africa/Bujumbura',
	'Africa/Cairo',
	'Africa/Gaborone',
	'Africa/Harare',
	'Africa/Johannesburg',
	'Africa/Kigali',
	'Africa/Lubumbashi',
	'Africa/Lusaka',
	'Africa/Maputo',
	'Africa/Maseru',
	'Africa/Mbabane',
	'Africa/Tripoli',
	'Asia/Amman',
	'Asia/Beirut',
	'Asia/Damascus',
	'Asia/Gaza',
	'Asia/Jerusalem',
	'Asia/Nicosia',
	'Europe/Athens',
	'Europe/Bucharest',
	'Europe/Chisinau',
	'Europe/Helsinki',
	'Europe/Istanbul',
	'Europe/Riga',
	'Europe/Sofia',
	'Europe/Tallinn',
	'Europe/Vilnius',
	'Africa/Addis_Ababa',
	'Africa/Asmara',
	'Africa/Dar_es_Salaam',
	'Africa/Djibouti',
	'Africa/Kampala',
	'Africa/Khartoum',
	'Africa/Mogadishu',
	'Africa/Nairobi',
	'Antarctica/Syowa',
	'Asia/Aden',
	'Asia/Baghdad',
	'Asia/Bahrain',
	'Asia/Kuwait',
	'Asia/Qatar',
	'Asia/Riyadh',
	'Europe/Kaliningrad',
	'Europe/Minsk',
	'Indian/Antananarivo',
	'Indian/Comoro',
	'Indian/Mayotte',
	'Asia/Tehran',
	'Asia/Baku',
	'Asia/Dubai',
	'Asia/Muscat',
	'Asia/Tbilisi',
	'Europe/Moscow',
	'Europe/Samara',
	'Indian/Mahe',
	'Indian/Mauritius',
	'Indian/Reunion',
	'Antarctica/Mawson',
	'Asia/Aqtau',
	'Asia/Aqtobe',
	'Asia/Ashgabat',
	'Asia/Dushanbe',
	'Asia/Karachi',
	'Asia/Tashkent',
	'Indian/Kerguelen',
	'Indian/Maldives',
	'Asia/Colombo',
	'Asia/Katmandu',
	'Antarctica/Vostok',
	'Asia/Almaty',
	'Asia/Bishkek',
	'Asia/Dhaka',
	'Asia/Thimphu',
	'Asia/Yekaterinburg',
	'Indian/Chagos',
	'Asia/Rangoon',
	'Indian/Cocos',
	'Antarctica/Davis',
	'Asia/Bangkok',
	'Asia/Hovd',
	'Asia/Jakarta',
	'Asia/Omsk',
	'Asia/Phnom_Penh',
	'Asia/Vientiane',
	'Indian/Christmas',
	'Antarctica/Casey',
	'Asia/Brunei',
	'Asia/Choibalsan',
	'Asia/Hong_Kong',
	'Asia/Krasnoyarsk',
	'Asia/Kuala_Lumpur',
	'Asia/Macau',
	'Asia/Makassar',
	'Asia/Manila',
	'Asia/Shanghai',
	'Asia/Singapore',
	'Asia/Taipei',
	'Asia/Ulaanbaatar',
	'Australia/Perth',
	'Asia/Dili',
	'Asia/Irkutsk',
	'Asia/Jayapura',
	'Asia/Pyongyang',
	'Asia/Seoul',
	'Asia/Tokyo',
	'Pacific/Palau',
	'Australia/Adelaide',
	'Australia/Darwin',
	'Antarctica/DumontDUrville',
	'Asia/Yakutsk',
	'Australia/Brisbane',
	'Australia/Hobart',
	'Australia/Sydney',
	'Pacific/Guam',
	'Pacific/Port_Moresby',
	'Pacific/Saipan',
	'Asia/Vladivostok',
	'Pacific/Efate',
	'Pacific/Guadalcanal',
	'Pacific/Kosrae',
	'Pacific/Noumea',
	'Pacific/Norfolk',
	'Asia/Kamchatka',
	'Asia/Magadan',
	'Pacific/Auckland',
	'Pacific/Fiji',
	'Pacific/Funafuti',
	'Pacific/Kwajalein',
	'Pacific/Majuro',
	'Pacific/Nauru',
	'Pacific/Tarawa',
	'Pacific/Wake',
	'Pacific/Wallis',
	'Pacific/Apia',
	'Pacific/Enderbury',
	'Pacific/Fakaofo',
	'Pacific/Tongatapu',
	'Pacific/Kiritimati'
]


# ���^�C���]�[���ݒ�l����V�^�C���]�[���ݒ�l�ւ̕␳�p
def exchangeTimeZoneCode(timezone):
	if timezone == '-12':
		timezone = 'Pacific/Midway'  # -12���Ȃ��̂�
	elif timezone == '-11':
		timezone = 'Pacific/Niue'  #
	elif timezone == '-10':
		timezone = 'Pacific/Honolulu'  #
	elif timezone == '-9':
		timezone = 'America/Anchorage'  #
	elif timezone == '-8':
		timezone = 'America/Los_Angeles'  #
	elif timezone == '-7':
		timezone = 'America/Denver'  #
	elif timezone == '-6':
		timezone = 'America/Chicago'  #
	elif timezone == '-5':
		timezone = 'America/New_York'  #
	elif timezone == '-4':
		timezone = 'America/Santiago'  #
	elif timezone == '-3':
		timezone = 'America/Sao_Paulo'  #
	elif timezone == '-2':
		timezone = 'America/Noronha'  #
	elif timezone == '-1':
		timezone = 'Atlantic/Azores'  #
	elif timezone == '0':
		timezone = 'Etc/UTC'  #
	elif timezone == '+1':
		timezone = 'Europe/Prague'  #
	elif timezone == '+2':
		timezone = 'Europe/Athens'  #
	elif timezone == '+3':
		timezone = 'Asia/Qatar'  #
	elif timezone == '+4':
		timezone = 'Europe/Moscow'  #
	elif timezone == '+5':
		timezone = 'Asia/Karachi'  #
	elif timezone == '+6':
		timezone = 'Asia/Dhaka'  #
	elif timezone == '+7':
		timezone = 'Asia/Bangkok'  #
	elif timezone == '+8':
		timezone = 'Asia/Kuala_Lumpur'  #
	elif timezone == '+9':
		timezone = 'Asia/Tokyo'  #
	elif timezone == '+10':
		timezone = 'Australia/Sydney'  #
	elif timezone == '+11':
		timezone = 'Pacific/Guadalcanal'  #
	elif timezone == '+12':
		timezone = 'Pacific/Auckland'  #
	elif timezone == '+13':
		timezone = 'Pacific/Tongatapu'  #
	elif timezone == '+14':
		timezone = 'Pacific/Kiritimati'  #
	# else:
	#	timezone = sateraito_inc.DEFAULT_TIMEZONE		#
	return timezone


def getTemplateLIFFList(self):
	template_liff = []
	template_liff.append(u'{0} : {1}{2} \r\n'.format(self.getMsg('FLD_LINE_MESSAGE_TEMPLATE_LIFF_PROFILE'), 'URL_LIFF',
													 '1592127395-vRbAmql7'))
	
	return template_liff


def noneToZeroStr(string_param):
	if string_param is None:
		return ''
	return string_param


def toLocalTime(date_utc, timezone=sateraito_inc.DEFAULT_TIMEZONE):
	"""
Args: data_utc ... datetime
Returns: datetime
"""
	if date_utc is None:
		return None
	tz_user_local = zoneinfo.gettz(timezone)
	return date_utc.replace(tzinfo=tz.tzutc()).astimezone(tz_user_local)


def noneToFalse(bool_param):
	if bool_param is None:
		return False
	return bool_param


def dateString():
	# create date string
	dt_now = datetime.datetime.now()
	return dt_now.strftime('%Y%m%d%H%M%S')


def randomString(maxlenght=16):
	# create 16-length random string
	s = 'abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
	random_string = ''
	for j in range(maxlenght):
		random_string += random.choice(s)
	return random_string


def randomUpperString(maxlenght=16):
	# create 16-length random string
	s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	random_string = ''
	for j in range(maxlenght):
		random_string += random.choice(s)
	return random_string


def createNewTemplateId():
	""" create new template id string
"""
	return 'template-' + dateString() + randomString()


def strToBool(str_param):
	if isinstance(str_param, bool):
		return str_param
	if str(str_param).lower() == 'true':
		return True
	return False


def getScriptVirtualUrl():
	# return '/js/' if not sateraito_inc.debug_mode else '/js/debug/'
	return '/script/' if not sateraito_inc.debug_mode else '/script/debug/'


def getHtmlBuilderScriptVirtualUrl():
	return '/htmlbuilder/js/' if not sateraito_inc.debug_mode else '/htmlbuilder/js/debug/'


def getScriptVersionQuery():
	return UcfUtil.md5(sateraito_inc.version)


def boolToStr(bool_param):
	if bool_param:
		return 'True'
	return 'False'


def none2ZeroStr(string_param):
	if string_param is None:
		return ''
	if not isinstance(string_param, str) and not isinstance(string_param, unicode):
		return str(string_param)
	return string_param


def noneToEmptyDictStr(str_param):
	if str_param is None:
		return '{}'
	return str_param


def toShortLocalDate(date_utc, timezone=sateraito_inc.DEFAULT_TIMEZONE):
	"""
Args: date_utc ... datetime
												timezone ... timezone name string
Returns: string YYYY-MM-DD or ''
"""
	short_local_datetime = toShortLocalTime(date_utc, timezone)
	if short_local_datetime == '':
		return ''
	return str(short_local_datetime).split(' ')[0]


def toShortLocalTime(date_utc, timezone=sateraito_inc.DEFAULT_TIMEZONE):
	"""
Args: date_utc ... datetime
Returns: string YYYY-MM-DD HH:MI:SS
"""
	local_time = toLocalTime(date_utc, timezone)
	local_time_str = (str(local_time).split('.'))[0]
	local_time_str2 = local_time_str.split('+')[0]
	return local_time_str2


def createNewTemplateRevisionId():
	""" create new template revision id string
"""
	return 'revision-' + dateString() + randomString()


def up_template_version(template_version=''):
	if template_version != '' and template_version is not None:
		template_version_split = template_version.split('.')
		template_ver = int(template_version_split[1]) + 1
		return datetime.datetime.now().strftime('%Y%m%d') + '.' + "{:04d}".format(template_ver)
	else:
		return datetime.datetime.now().strftime('%Y%m%d') + '.' + "{:04d}".format(1)


def createNewFileId():
	""" create new file id string
"""
	return 'file-' + dateString() + randomString()


def noneToEmpty(str_param):
	if str_param is None:
		return ''
	return str_param


def removeFormFromIndex(form_id):
	logging.debug('removeFormFromIndex form_id=' + str(form_id))
	# remove text search index
	index = search.Index(name='form_index')
	index.delete(form_id)


def getFormFromIndex(form_id):
	logging.debug('getFormFromIndex form_id=' + str(form_id))
	# remove text search index
	index = search.Index(name='form_index')
	return index.get(form_id)


def createNewDocId():
	""" create new workflow document id string
"""
	return 'doc-' + dateString() + randomString()


# 添付ファイル名の正規化
def normalizeFileName(file_name):
	# なぜかDB側にC:\などからフルパスで入っている場合があるのでとりあえずここではじく
	file_name = os.path.basename(os.path.normpath(file_name))
	# Windows用
	ary_file_name = file_name.split('\\')
	file_name = ary_file_name[len(ary_file_name) - 1]
	# Windowsでファイル名として許容されていない記号などを加工
	file_name = file_name.replace('\\', ' ').replace(':', ' ').replace('*', ' ').replace('?', ' ').replace('"',
																										   ' ').replace(
		'|', ' ').replace('<', ' ').replace('>', ' ').replace('/', ' ')
	return file_name


# def sanitizeHtml(html_string):
# 	if html_string is None:
# 		return None
# 	if str(html_string).strip() == '':
# 		return ''
#
# 	cleaner = Cleaner(style=False, links=False, add_nofollow=True,
# 		page_structure=True, javascript=True, scripts=True, safe_attrs_only=False,
# 		host_whitelist=['www.youtube.com', 'www.sateraito.co.jp', 'www.nextset.co.jp'])
# 	#logging.debug('before clean:' + str(html_string))
# 	safe_html = None
# 	try:
# 		# in some case, character garbled without decoding to unicode
# 		decoded_string = str(html_string).decode('utf8')
# 		safe_html = cleaner.clean_html(decoded_string)
# 	except BaseException, e:
# 		logging.error('error while cleaning html:' + e.__class__.__name__ + ' message=' + str(e))
# 		return html_string
# 	else:
# 		#logging.debug('after clean:' + str(safe_html))
# 		return safe_html


# seconds to wait till next retry
def timeToSleep(num_retry):
	sleep_time = 2 ** num_retry
	if sleep_time > 60:
		sleep_time = 60
	return sleep_time


def removeDocFromIndex(doc_id):
	logging.debug('removeDocFromIndex doc_id=' + str(doc_id))
	# remove text search index
	index = search.Index(name='doc_index')
	index.delete(doc_id)


def datetimeToMyUnixtime(datetime_param):
	""" My Unix time = Unixtime - 2100000000
				in this system, unixtime is just used for ordering of fulltext search result
				normal unixtime has Year 2038 problem, and fulltext index can not treat 64 bit integer
"""
	logging.debug('datetime_param.timetuple()=' + str(datetime_param.timetuple()))
	return time.mktime(datetime_param.timetuple()) + OFFSET_OF_MY_UNIXTIME


def createSearchDoc(template_id, doc_id, doc_title, text_doc_values, html_doc_values, published_date, publish_start_date
					,
					publish_end_date, accessible_members, doc_count, priority, author_user_id, author_name, store_id,
					store_history_id):
	""" create index document for textsearch
"""
	published_date_unixtime = datetimeToMyUnixtime(published_date)
	# publish start date
	publish_start_date_unixtime = datetimeToMyUnixtime(datetime.datetime(1970, 1, 1, 0, 0, 0))
	if publish_start_date is not None:
		publish_start_date_unixtime = datetimeToMyUnixtime(publish_start_date)
	# publish end date
	publish_end_date_unixtime = datetimeToMyUnixtime(datetime.datetime(2100, 1, 1, 0, 0, 0))
	if publish_end_date is not None:
		logging.debug('start converting publish end date=' + str(publish_end_date))
		publish_end_date_unixtime = datetimeToMyUnixtime(publish_end_date)
		logging.debug('publish_end_date_unixtime=' + str(publish_end_date_unixtime))
	# accessible_members
	accessible_members_str = ''
	for email in accessible_members:
		accessible_members_str += ' #' + email + '#'
	return search.Document(
		doc_id=doc_id,
		fields=[
			search.TextField(name='template_id', value=template_id),
			search.TextField(name='doc_title', value=doc_title),
			search.TextField(name='text', value=text_doc_values),
			search.HtmlField(name='html', value=html_doc_values),
			search.DateField(name='created_date', value=datetime.date.today()),
			search.NumberField(name='published_date', value=published_date_unixtime),
			search.NumberField(name='publish_start_date', value=publish_start_date_unixtime),
			search.NumberField(name='publish_end_date', value=publish_end_date_unixtime),
			search.TextField(name='accessible_members', value=accessible_members_str),
			search.NumberField(name='doc_count', value=doc_count),
			search.TextField(name='priority', value=priority),
			search.TextField(name='author_user_id', value=author_user_id),
			search.TextField(name='store_id', value=store_id),
			search.TextField(name='author_name', value=author_name),
			search.TextField(name='store_history_id', value=store_history_id)
		])


def getDocFromIndex(doc_id):
	logging.debug('getDocFromIndex doc_id=' + str(doc_id))
	# remove text search index
	index = search.Index(name='doc_index')
	return index.get(doc_id)


def addDocToTextSearchIndex(workflow_doc, num_retry=0):
	""" add workflow doc to textsearch index
				Args: workflow_doc ... WorkflowDoc object
"""
	logging.debug('addDocToTextSearchIndex')
	doc_values_dict = json.JSONDecoder().decode(workflow_doc.doc_values)
	html_doc_values = ''
	text_doc_values = ''
	for key, value in doc_values_dict.items():
		if key in workflow_doc.html_field_names:
			html_doc_values += ' ' + value
		else:
			text_doc_values += ' ' + str(value)
	index = search.Index(name='doc_index')
	logging.debug('workflow_doc.doc_id=' + str(workflow_doc.doc_id))
	# accessible_members
	accessible_members = workflow_doc.accessible_members
	
	try:
		index.put(createSearchDoc(workflow_doc.template_id,
								  workflow_doc.doc_id,
								  workflow_doc.doc_title,
								  text_doc_values,
								  html_doc_values,
								  workflow_doc.published_date,
								  workflow_doc.publish_start_date,
								  workflow_doc.publish_end_date,
								  accessible_members,
								  workflow_doc.doc_count_by_bbs_id,
								  workflow_doc.priority,
								  workflow_doc.author_user_id,
								  workflow_doc.author_name,
								  workflow_doc.store_id,
								  workflow_doc.store_history_id
								  )
				  )
	except TransientError, e:
		if num_retry >= 10:
			raise e
		sleep_time = timeToSleep(num_retry)
		time.sleep(sleep_time)
		logging.debug('caught TransientError, sleeping and retry...')
		addDocToTextSearchIndex(workflow_doc, (num_retry + 1))
	except DeadlineExceededError, e:
		if num_retry >= 10:
			raise e
		sleep_time = timeToSleep(num_retry)
		time.sleep(sleep_time)
		logging.info('caught DeadlineExceededError, sleeping and retry...')
		addDocToTextSearchIndex(workflow_doc, (num_retry + 1))


def createNewCommentId():
	""" create new comment id string
"""
	return 'comment-' + dateString() + randomString()


def washShiftJISErrorChar(unicode_string):
	"""  Convert character in string which is not in Shift_JIS to '?'
"""
	washed_string = ''
	for c in unicode_string:
		try:
			c.encode('cp932')
		except UnicodeEncodeError:
			washed_string += '?'
		else:
			washed_string += c
	return washed_string


def toUtcTime(date_localtime, timezone=sateraito_inc.DEFAULT_TIMEZONE):
	""" Args: date_localtime ... datetime
				Return: datetime
"""
	if date_localtime is None:
		return None
	tz_user_local = zoneinfo.gettz(timezone)
	tz_utc = tz.tzutc()
	return date_localtime.replace(tzinfo=tz_user_local).astimezone(tz_utc)


def escapeForCsv(string_param):
	result = noneToZeroStr(string_param)
	if result.find('\n') >= 0 or result.find(',') >= 0 or result.find('"') >= 0:
		result = '"' + result.replace('"', '""') + '"'
	return result


def removeDuplicate(ret_results):
	ret_results_no_duplicate = []
	for a_result in ret_results:
		if a_result in ret_results_no_duplicate:
			pass
		else:
			ret_results_no_duplicate.append(a_result)
	return ret_results_no_duplicate


def getReplyUser(reply_id):
	if reply_id == '':
		return sateraito_inc.SENDER_EMAIL
	
	return reply_id


def multipleKeySort(items, columns, functions={}, getter=itemgetter):
	""" Sort a list of dictionary objects or objects by multiple keys bidirectionally.
	Keyword Arguments:
		items -- A list of dictionary objects or objects
		columns -- A list of column names to sort by. Use -column to sort in descending order
		functions -- A Dictionary of Column Name -> Functions to normalize or process each column value
		getter -- Default "getter" if column function does not exist
				operator.itemgetter for Dictionaries
				operator.attrgetter for Objects
	"""
	
	comparers = []
	for col in columns:
		column = col[1:] if col.startswith('-') else col
		if not column in functions:
			functions[column] = getter(column)
		comparers.append((functions[column], 1 if column == col else -1))
	
	def comparer(left, right):
		for func, polarity in comparers:
			result = cmp(func(left), func(right))
			if result:
				return polarity * result
		else:
			return 0
	
	return sorted(items, cmp=comparer)


def compose(inner_func, *outer_funcs):
	"""Compose multiple unary functions together into a single unary function"""
	if not outer_funcs:
		return inner_func
	outer_func = compose(*outer_funcs)
	return lambda *args, **kwargs: outer_func(inner_func(*args, **kwargs))


def encode_multipart_formdata(fields, files, mimetype='image/jpeg'):
	boundary = 'paLp12Buasdasd40tcxAp97curasdaSt40bqweastfarcUNIQUE_STRING'
	crlf = '\r\n'
	line = []
	for key, value in fields:
		line.append('--' + boundary)
		line.append('Content-Disposition: form-data; name="%s"' % key)
		line.append('')
		line.append(value)
	
	for key, filename, value in files:
		line.append('--' + boundary)
		line.append('Content-Disposition: form-data; name="%s"; filename="%s"' % (key, filename))
		line.append('Content-Type: %s' % mimetype)
		line.append('')
		line.append(value)
	
	line.append('--%s--' % boundary)
	line.append('')
	
	body = crlf.join(line)
	content_type = 'multipart/form-data; boundary=%s' % boundary
	return content_type, body
	
	
def getImageInfo(data):
	data = str(data)
	size = len(data)
	height = -1
	width = -1
	content_type = ''
	
	# handle GIFs
	if (size >= 10) and data[:6] in ('GIF87a', 'GIF89a'):
		# Check to see if content_type is correct
		content_type = 'image/gif'
		w, h = struct.unpack("<HH", data[6:10])
		width = int(w)
		height = int(h)
	
	# See PNG 2. Edition spec (http://www.w3.org/TR/PNG/)
	# Bytes 0-7 are below, 4-byte chunk length, then 'IHDR'
	# and finally the 4-byte width, height
	elif ((size >= 24) and data.startswith('\211PNG\r\n\032\n')
		  and (data[12:16] == 'IHDR')):
		content_type = 'image/png'
		w, h = struct.unpack(">LL", data[16:24])
		width = int(w)
		height = int(h)
	
	# Maybe this is for an older PNG version.
	elif (size >= 16) and data.startswith('\211PNG\r\n\032\n'):
		# Check to see if we have the right content type
		content_type = 'image/png'
		w, h = struct.unpack(">LL", data[8:16])
		width = int(w)
		height = int(h)
	
	# handle JPEGs
	elif (size >= 2) and data.startswith('\377\330'):
		content_type = 'image/jpeg'
		jpeg = StringIO.StringIO(data)
		jpeg.read(2)
		b = jpeg.read(1)
		try:
			while b and ord(b) != 0xDA:
				while ord(b) != 0xFF:
					b = jpeg.read(1)
				while ord(b) == 0xFF:
					b = jpeg.read(1)
				if 0xC0 <= ord(b) <= 0xC3:
					jpeg.read(3)
					h, w = struct.unpack(">HH", jpeg.read(4))
					break
				else:
					jpeg.read(int(struct.unpack(">H", jpeg.read(2))[0]) - 2)
				b = jpeg.read(1)
			width = int(w)
			height = int(h)
		except struct.error:
			pass
		except ValueError:
			pass
	
	return width, height


def resizeImage(img, img_width, img_height):
	img_quality = 70
	# img = images.Image(blob_key=str(meishi_blob_key))
	img = images.Image(img)
	logging.debug('width: ' + str(img.width))
	logging.debug('height: ' + str(img.height))
	if int(img_width) > 450:
		img_height = int(img_height * 450 / img_width)
		img_width = 450
	if int(img_height) > 450:
		img_width = int(img_width * 450 / img_height)
		img_height = 450
	img.resize(width=img_width, height=img_height)
	img.im_feeling_lucky()
	thumbnail = img.execute_transforms(output_encoding=images.PNG, quality=img_quality)
	while int(len(thumbnail)) / 1024 > 20 and img_quality > 50:
		logging.info(img_quality)
		logging.info(int(len(thumbnail)))
		img_quality -= 5
		img.resize(width=img_width, height=img_height)
		logging.debug(img.width)
		logging.debug(img.height)
		img.im_feeling_lucky()
		thumbnail = img.execute_transforms(output_encoding=images.PNG, quality=img_quality)
	
	return thumbnail
