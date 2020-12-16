#!/usr/bin/python
# coding: utf-8

import logging
import json
import datetime
import time
import base64
import urllib
import urllib2
import hashlib
from google.appengine.api import memcache
from google.appengine.api import urlfetch
from ucf.utils.ucfutil import UcfUtil
import Crypto.PublicKey.RSA as RSA
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA256
import sateraito_inc
import sateraito_func

VERSION = 'v2'
API_BASE_URL = 'https://api.line.me'

MAX_RETRY_CNT = 2
ERROR_HTTP_CODES_RETRY = [
  429,  # Too Many Requests.
  503,  # Service Unavailable or Timeout.
  504,  # Gateway Timeout.
]

ERROR_LINE_CODES_RETRY_INCLUDE = [

]

ERROR_LINE_CODES_RETRY_EXCLUDE = [

]

RETRY_WAIT_SECONDS = 1


def fetchURL(api_url_part, access_token=None, method=None, payload=None, parameters=None, headers=None):
  request_url = API_BASE_URL + '/' + VERSION

  request_url = request_url + '/' + api_url_part.lstrip('/')
  request_url = request_url.strip()

  if not access_token:
    raise Exception("Missing Access Token")

  parameters = parameters or {}

  if parameters and '?' not in request_url:
    request_url = request_url + '?' + urllib.urlencode(parameters)
  elif parameters:
    request_url = request_url + '&' + urllib.urlencode(parameters)
  # logging.info(request_url)

  payload_str = ''
  if payload:
    if isinstance(payload, (dict, list, tuple)):
      payload_str = json.JSONEncoder().encode(payload)
    elif isinstance(payload, (basestring, unicode)):
      payload_str = payload
    else:
      payload_str = json.JSONEncoder().encode(payload)
      # logging.info(payload_str)

  if not method:
    if payload_str:
      method = 'POST'
    else:
      method = 'GET'

  logging.debug('{}: {}'.format(method, request_url))

  # アクセストークン（サーバートークン）を取得
  # headers = {
  #   'Authorization': 'Bearer ' + access_token,
  #   'Content-Type': 'application/json',
  # }

  headers = headers or {}
  if access_token:
    headers['Authorization'] = 'Bearer {}'.format(access_token)

  headers['Content-Type'] = 'application/json'

  contents = None

  try:
      for i in range(0, MAX_RETRY_CNT):
        req = urllib2.Request(request_url,headers=headers)
        result  = urllib2.urlopen(req)
        contents = result.read()
        status_code = result.getcode()
        if status_code != 200:
          logging.error(status_code)
          logging.error(contents)

        if status_code not in ERROR_HTTP_CODES_RETRY:
          result.close()
          return contents
        else:
          continue
  except urllib2.URLError:
      logging.exception('Caught exception fetching url')

  return contents

def callLineAPI(api_url_part, access_token=None, method=None, payload=None, parameters=None, headers=None,skip_json=False):
  request_url = API_BASE_URL + '/' + VERSION

  request_url = request_url + '/' + api_url_part.lstrip('/')
  request_url = request_url.strip()

  if not access_token:
    raise Exception("Missing Access Token")

  parameters = parameters or {}

  if parameters and '?' not in request_url:
    request_url = request_url + '?' + urllib.urlencode(parameters)
  elif parameters:
    request_url = request_url + '&' + urllib.urlencode(parameters)
  # logging.info(request_url)

  payload_str = ''
  if payload:
    if isinstance(payload, (dict, list, tuple)):
      payload_str = json.JSONEncoder().encode(payload)
    elif isinstance(payload, (basestring, unicode)):
      payload_str = payload
    else:
      payload_str = json.JSONEncoder().encode(payload)
      # logging.info(payload_str)

  if not method:
    if payload_str:
      method = 'POST'
    else:
      method = 'GET'

  logging.debug('{}: {}'.format(method, request_url))

  # アクセストークン（サーバートークン）を取得
  # headers = {
  #   'Authorization': 'Bearer ' + access_token,
  #   'Content-Type': 'application/json',
  # }

  headers = headers or {}
  if access_token:
    headers['Authorization'] = 'Bearer {}'.format(access_token)

  headers['Content-Type'] = 'application/json'

  result = None

  for i in range(0, MAX_RETRY_CNT):
    result = urlfetch.fetch(url=request_url, method=method, payload=payload_str, deadline=10, follow_redirects=True, headers=headers)

    if result.status_code != 200:
      logging.error(result.status_code)
      logging.error(result.content)

      if result.status_code not in ERROR_HTTP_CODES_RETRY:
        return result
      else:
        continue

    if skip_json==False:
      try:
        result_json = json.JSONDecoder().decode(result.content)

        error_message = result_json.get('message', '')
        if error_message:
          logging.error(error_message)

        # error_code = result_json.get('errorCode', '')
        # error_message = result_json.get('errorMessage', '')
        # if error_code or error_message:
        #   if ERROR_LINE_CODES_RETRY_INCLUDE and error_code in ERROR_LINE_CODES_RETRY_INCLUDE:
        #     continue
        #
        #   if ERROR_LINE_CODES_RETRY_EXCLUDE and error_code not in ERROR_LINE_CODES_RETRY_INCLUDE:
        #     continue
        #
        #   logging.error(error_code)
        #   logging.error(error_message)
        #   break

      except:
        ex = Exception('failed api call of Line API. status code=' + str(result.status_code))
        setattr(ex, 'code', result.status_code)
        logging.error(ex)
        continue

    return result

  return result


def getLineUserProfile(access_token, user_id):
  user_profile = _loadLineUserProfile(access_token, user_id)
  if not user_profile:
    user_profile = requestLineUserProfile(access_token, user_id)
    _saveLineUserProfile(access_token, user_id, user_profile)

  return user_profile


def _loadLineUserProfile(access_token, user_id):
  key_name = _get_memcache_key_name("user_profile", access_token, user_id)
  user_profile = memcache.get(key_name)
  return user_profile


def _saveLineUserProfile(access_token, user_id, user_profile):
  key_name = _get_memcache_key_name("user_profile", access_token, user_id)
  result = memcache.set(key_name, user_profile)
  return result


def requestLineUserProfile(access_token, user_id):
  api_url_part = '/bot/profile/{}'.format(user_id)

  response = callLineAPI(api_url_part, access_token)
  result = json.JSONDecoder().decode(response.content)
  if result.get('error'):
    return None
  user_profile = result

  return user_profile


def _get_memcache_key_name(prefix, *agrs):
  subsix = "_".join([str(a) for a in agrs])
  subsix_md5 = hashlib.md5(subsix).hexdigest()
  key_name = 'LINE_{}__{}'.format(prefix, subsix_md5)

  return key_name
