#!/usr/bin/python
# coding: utf-8

import logging
import json
import datetime
import re
import urllib
import urllib2

import sateraito_inc
import sateraito_func
from ucf.utils.ucfutil import *
from google.appengine.api import urlfetch
from logiccommands.basecommand import *


#######################################
# HTML:
#
# HTML 'https://xxxxxx.com/xxx/xxx' $str_before $str_after $result
#
# HTML 'https://xxxxxx.com/xxx/xxx' $str_before $str_after $result $select_start $select_end
#
# HTML 'https://xxxxxx.com/xxx/xxx' $str_before $str_after $result $select_start $select_end $params $headers
#
# HTML 'https://xxxxxx.com/xxx/xxx' $str_before $str_after $result 1 10 $params $headers
#
#######################################


class HtmlCommand(BaseCommand):
  def __init__(self, element_list, parent_command, script_row_num, params):
    super(HtmlCommand, self).__init__(element_list, parent_command, script_row_num, params)

  # 解析
  def _analysis(self):

    if len(self.element_list) < 5:
      raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

    # URL
    url_element = self.getElementObj(1)
    # 定数でも変数でもJSONXPATHでもなければNG
    if not url_element.get('type') == 'literal' and not url_element.get('value').startswith('$') and not url_element.get('value').startswith('/'):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2',
                                  (str(1), 'url', url_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # string before
    str_before_element = self.getElementObj(2)
    if not str_before_element.get('type') == 'literal' and not str_before_element.get('value').startswith('$') and not str_before_element.get('value').startswith('/'):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2',
                                  (str(2), 'url', str_before_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # string after
    str_after_element = self.getElementObj(3)
    if not str_after_element.get('type') == 'literal' and not str_after_element.get('value').startswith('$') and not str_after_element.get('value').startswith('/'):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2',
                                  (str(3), 'url', str_after_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # 結果変数
    result_element = self.getElementObj(4)
    # 変数
    if result_element.get('type') == 'literal':
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND',
                                  (str(4), 'result', result_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
    if not result_element.get('value').startswith('$') and not result_element.get('value').startswith('/'):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(4), 'result', result_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # オプション：select_start
    select_start_element = self.getElementObj(5)
    if select_start_element is not None:
      pass

    # オプション：select_end
    select_end_element = self.getElementObj(6)
    if select_end_element is not None:
      pass

    # オプション：パラメータ
    param_element = self.getElementObj(7)
    if param_element is not None:
      # 変数でもJSONXPATHでもなければNG
      if param_element.get('type') == 'literal':
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND',
                                    (str(7), 'payload', param_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
      if not param_element.get('value').startswith('$') and not param_element.get('value').startswith('/'):
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(7), 'payload', param_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # オプション：ヘッダー
    header_element = self.getElementObj(8)
    if header_element is not None:
      # 変数でもJSONXPATHでもなければNG
      if header_element.get('type') == 'literal':
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND',
                                    (str(8), 'headers', header_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
      if not header_element.get('value').startswith('$') and not header_element.get('value').startswith('/'):
        raise Exception(
          self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(8), 'headers', header_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

  # コマンド実行
  def _execute(self):
    # URL
    url = self.getValue(self.getElementObj(1))
    if url == '' or not (url.lower().startswith('http://') or url.lower().startswith('https://')):
      raise Exception(self.getMsg('CMDERR_INVALID_URL_FORMAT', (str(1), 'url', url)))

    str_before = self.getValue(self.getElementObj(2))
    if str_before is None:
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(2), 'str_before')))
    if not isinstance(str_before, (basestring, unicode)):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(2), 'str_before', ','.join([self.getMsg('STRING')]))))
    if str_before == "":
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(2), 'str_before')))
    
    str_after = self.getValue(self.getElementObj(3))
    if str_after is None:
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(3), 'str_after')))
    if not isinstance(str_after, (basestring, unicode)):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(3), 'str_after', ','.join([self.getMsg('STRING')]))))
    if str_after == "":
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT', (str(3), 'str_after')))

    select_start = self.getValue(self.getElementObj(5))
    if select_start is not None:
      if not isinstance(select_start, int):
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(5), 'select_start', ','.join([self.getMsg('INTEGER')]))))
      select_start -= 1
    else:
      # select_start = None
      pass

    select_end = self.getValue(self.getElementObj(6))
    if select_end is not None:
      if not isinstance(select_end, int):
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(6), 'select_end', ','.join([self.getMsg('INTEGER')]))))
      select_end -= 1
    else:
      # select_end = None
      pass

    # パラメータ生成
    params = self.getValue(self.getElementObj(7))
    if params is not None and not isinstance(params, dict):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(7), 'params', ','.join([self.getMsg('DICT')]))))

    # ヘッダー
    headers = self.getValue(self.getElementObj(8))
    if headers is not None and not isinstance(headers, dict):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(8), 'headers', ','.join([self.getMsg('DICT')]))))

    if params is not None:
      for k, v in params.iteritems():
        if isinstance(v, (str, unicode, int, float, long)):
          url = UcfUtil.appendQueryString(url, k, v)

    if headers is None:
      headers = {}

    content = None
    response_encoding = None

    try:
      request = urllib2.Request(url, headers=headers)
      response = urllib2.urlopen(request, timeout=10)
      content = response.read()
      response_encoding = response.headers.getparam('charset')
      response.close()

    except urllib2.HTTPError as e:
      logging.error('Can not fulfill the request.')
      logging.error('Error code: ' + str(e.code))

      raise Exception(self.getMsg('ERR_FAILED_REQUEST_API', (str(e.code), url)))

    except urllib2.URLError as e:
      logging.error('Can not reach a server.')
      logging.error('Reason: ' + str(e.reason))

      raise Exception(self.getMsg('ERR_FAILED_REQUEST_API', (str(e.errno), url)))

    result = []

    try:
      if content:
        if response_encoding:
          logging.debug("HTML charset: {}".format(response_encoding))
          # content = content.decode(response_encoding, 'ignore')
          content = content.decode(response_encoding)
        else:
          # content = content.decode('utf-8', 'ignore')
          content = content.decode('utf-8')
    except:
      pass

    if content is not None and content != '':
      start = str_before
      end = str_after

      escape_start = start
      escape_end = end

      isUnicode = isinstance(content, unicode)
      if isUnicode:
        regex_string = ur'%s(.*?)%s' % (escape_start, escape_end)
        # logging.debug({'regex': regex_string, 'content_type': str(type(content))})
        result = re.findall(regex_string, content, flags=re.IGNORECASE|re.DOTALL|re.MULTILINE|re.UNICODE)
      else:
        regex_string = r'%s(.*?)%s' % (escape_start, escape_end)
        # logging.debug({'regex': regex_string, 'content_type': str(type(content))})
        result = re.findall(regex_string, content, flags=re.IGNORECASE|re.DOTALL|re.MULTILINE)

    result_selected = result[select_start:select_end]

    # 結果をセット
    result_element = self.getElementObj(4)
    self.setValue(result_element.get('value'), result_selected)


