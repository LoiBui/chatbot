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

from xml.etree import ElementTree
from HTMLParser import HTMLParser, HTMLParseError
from htmlentitydefs import name2codepoint


#######################################
# RSS:
#
# RSS 'http://xxxxxx.com/rss/xxx' $result
#
# RSS 'http://xxxxxx.com/rss/xxx' $result $select_start $select_end
#
# RSS 'http://xxxxxx.com/rss/xxx' $result $select_start $select_end $params $headers
#
# RSS 'http://xxxxxx.com/rss/xxx' $result 1 10 $params $headers
#
#######################################


class RssCommand(BaseCommand):
  def __init__(self, element_list, parent_command, script_row_num, params):
    super(RssCommand, self).__init__(element_list, parent_command, script_row_num, params)

  # 解析
  def _analysis(self):

    if len(self.element_list) < 3:
      raise Exception(self.getMsg('CMDERR_NOEXIST_NEED_ELEMENTS'))

    # URL
    url_element = self.getElementObj(1)
    # 定数でも変数でもJSONXPATHでもなければNG
    if not url_element.get('type') == 'literal' and not url_element.get('value').startswith('$') and not url_element.get('value').startswith('/'):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2',
                                  (str(1), 'url', url_element.get('value'), ','.join([self.getMsg('CONSTANT'), self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # 結果変数
    result_element = self.getElementObj(2)
    # 変数
    if result_element.get('type') == 'literal':
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND',
                                  (str(2), 'result', result_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
    if not result_element.get('value').startswith('$') and not result_element.get('value').startswith('/'):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(2), 'result', result_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # オプション：select_start
    select_start_element = self.getElementObj(3)
    if select_start_element is not None:
      pass

    # オプション：select_end
    select_end_element = self.getElementObj(4)
    if select_end_element is not None:
      pass

    # オプション：パラメータ
    param_element = self.getElementObj(5)
    if param_element is not None:
      # 変数でもJSONXPATHでもなければNG
      if param_element.get('type') == 'literal':
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND',
                                    (str(5), 'payload', param_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
      if not param_element.get('value').startswith('$') and not param_element.get('value').startswith('/'):
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(5), 'payload', param_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

    # オプション：ヘッダー
    header_element = self.getElementObj(6)
    if header_element is not None:
      # 変数でもJSONXPATHでもなければNG
      if header_element.get('type') == 'literal':
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_KIND',
                                    (str(6), 'headers', header_element.get('value'), self.getMsg('CONSTANT'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))
      if not header_element.get('value').startswith('$') and not header_element.get('value').startswith('/'):
        raise Exception(
          self.getMsg('CMDERR_INVALID_ELEMENT_KIND2', (str(6), 'headers', header_element.get('value'), ','.join([self.getMsg('VARIABLE'), self.getMsg('JSONXPATH')]))))

  # コマンド実行
  def _execute(self):
    # URL
    url = self.getValue(self.getElementObj(1))
    if url == '' or not (url.lower().startswith('http://') or url.lower().startswith('https://')):
      raise Exception(self.getMsg('CMDERR_INVALID_URL_FORMAT', (str(1), 'url', url)))

    select_start = self.getValue(self.getElementObj(3))
    if select_start is not None:
      if not isinstance(select_start, int):
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(3), 'select_start', ','.join([self.getMsg('INTEGER')]))))
      select_start -= 1
    else:
      # select_start = None
      pass

    select_end = self.getValue(self.getElementObj(4))
    if select_end is not None:
      if not isinstance(select_end, int):
        raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(4), 'select_end', ','.join([self.getMsg('INTEGER')]))))
      select_end -= 1
    else:
      # select_end = None
      pass

    # パラメータ生成
    params = self.getValue(self.getElementObj(5))
    if params is not None and not isinstance(params, dict):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(5), 'params', ','.join([self.getMsg('DICT')]))))

    # ヘッダー
    headers = self.getValue(self.getElementObj(6))
    if headers is not None and not isinstance(headers, dict):
      raise Exception(self.getMsg('CMDERR_INVALID_ELEMENT_TYPE', (str(6), 'headers', ','.join([self.getMsg('DICT')]))))

    if params is not None:
      for k, v in params.iteritems():
        if isinstance(v, (str, unicode, int, float, long)):
          url = UcfUtil.appendQueryString(url, k, v)

    if headers is None:
      headers = {}

    content = None

    try:
      request = urllib2.Request(url, headers=headers)
      response = urllib2.urlopen(request, timeout=10)
      content = response.read()

    except urllib2.HTTPError as e:
      logging.error('Can not fulfill the request.')
      logging.error('Error code: ' + str(e.code))

      raise Exception(self.getMsg('ERR_FAILED_REQUEST_API', (str(e.code), url)))

    except urllib2.URLError as e:
      logging.error('Can not reach a server.')
      logging.error('Reason: ' + str(e.reason))

      raise Exception(self.getMsg('ERR_FAILED_REQUEST_API', (str(e.errno), url)))

    result = []

    if content is not None and content != '':
      # can check rss format before parse
      rss_xml = content
      start = select_start
      end = select_end

      rss_items = []

      try:
        rss_items = _get_rss_items(rss_xml, start, end)
      except IOError, e:
        logging.error(e, exc_info=True)
        raise Exception(self.getMsg('ERR_INVALID_FORMAT_API_RESULT'))
      except Exception, e:
        logging.error(e, exc_info=True)
        raise Exception(self.getMsg('ERR_INVALID_FORMAT_API_RESULT'))

      for item in rss_items:
        title = item.get('title')
        if title:
          title_strip = _html_to_text(title)
          item['title'] = title_strip

        description = item.get('description')
        if description:
          description_strip = _html_to_text(description)
          item['description'] = description_strip

        result = rss_items

    # 結果をセット
    result_element = self.getElementObj(2)
    self.setValue(result_element.get('value'), result)


#######################################
#
# Helper Functions
#
#######################################

# All Feed Rss format:

# feed rss 0.9 very very old tech
# use namespace for rss 0.9
NS_RSS_09 = "{http://my.netscape.com/rdf/simple/0.9/}"

# feed rdf
# use namespace for rdf
NS_RDF = "{http://www.w3.org/1999/02/22-rdf-syntax-ns#}"
NS_RSS = "{http://purl.org/rss/1.0/}"

# feed rss 1.0 base on rdf
# use namespace for rss 1.0
NS_RSS_10 = "{http://purl.org/rss/1.0/}"

# feed rss 2.0 is current most popular
# rss 2.0 with no namespace

# feed rss complete new scheme Pie/Echo/Atom
# new tag name and use namespace hard to predict, usually {http://purl.org/echo/}, but other namespaces may be used
NS_ATOM = '{http://purl.org/echo/}'


def _get_xml_items_rdf(feed, start=None, end=None, fields=('title', 'description'), namespace=NS_RSS_10):
  rss_root = feed
  # items = rss_root.findall('{http://purl.org/rss/1.0/}item')
  items = rss_root.findall(namespace + 'item')

  # get only in range
  selected_items = items[start:end]

  rss_items = []
  for entry in selected_items:
    item = {}

    # get     title, description
    for field in fields:
      # value = entry.findtext('{http://purl.org/rss/1.0/}' + field) or ''
      value = entry.findtext(namespace + field) or ''
      # if value:
      #   item[field] = value
      item[field] = value

    rss_items.append(item)

  return rss_items


def _get_xml_items_rss_09(feed, start=None, end=None, fields=('title', 'description')):
  return _get_xml_items_rdf(feed, start, end, fields, namespace=NS_RSS_09)


def _get_rss_items_rss_10(feed, start=None, end=None, fields=('title', 'description')):
  return _get_xml_items_rdf(feed, start, end, fields, namespace=NS_RSS_10)


def _get_rss_items_rss_20(feed, start=None, end=None, fields=('title', 'description')):
  rss_root = feed
  items = rss_root.findall('channel/item')

  # get only in range
  selected_items = items[start:end]

  rss_items = []
  for entry in selected_items:
    item = {}

    # get title, description
    for field in fields:
      # value = entry.findtext('field')
      value = entry.findtext(field) or ''
      # if value:
      #   item[field] = value
      item[field] = value

    rss_items.append(item)

  return rss_items


def _get_rss_items_rss_atom(feed, start=None, end=None, fields=('title', 'content'), namespace=NS_ATOM):
  rss_root = feed
  items = rss_root.findall(namespace + "entry")

  # get only in range
  selected_items = items[start:end]

  rss_items = []
  for entry in selected_items:
    item = {}

    # get title, description
    for field in fields:
      # value = entry.findtext('{http://purl.org/echo/}' + field) or ''
      value = entry.findtext(namespace + field) or ''
      # if value:
      #   item[field] = value
      item[field] = value

    # for compatibility with other rss
    content = entry.findtext(namespace + 'content') or ''
    item['description'] = content

    rss_items.append(item)

  return rss_items


def _get_rss_items(rss_xml, start=None, end=None, fields=('title', 'description')):
  # entire feed
  rss_root = ElementTree.fromstring(rss_xml)

  feed = rss_root

  # check is rdf
  if feed.tag == NS_RDF + "RDF":
    # check the namespace of the first channel tag
    for elem in feed:
      if elem.tag.endswith("channel"):
        # check is rss 0.9
        if elem.tag.startswith(NS_RSS_09):
          return _get_xml_items_rss_09(feed, start, end, fields)

        # check is rss 1.0
        if elem.tag.startswith(NS_RSS_10):
          return _get_rss_items_rss_10(feed, start, end, fields)

  # check is rss 2.0
  elif feed.tag == "rss":
    return _get_rss_items_rss_20(feed, start, end, fields)

  # check is rss atom
  elif feed.tag.endswith("feed"):
    # get atom namespace
    fields = ['title']
    namespace = feed.tag[:feed.tag.index("}") + 1]
    return _get_rss_items_rss_atom(feed, start, end, fields, namespace=namespace)

  elif 'html' in feed.tag:
    raise IOError("unexpected html content format")

  # unexpected rss format
  raise IOError("unknown rss feed format")


class _HTML2Text(HTMLParser):
  def __init__(self):
    HTMLParser.__init__(self)
    self._buf = []
    self.hide_output = False

  def handle_starttag(self, tag, attrs):
    if tag in ('p', 'br') and not self.hide_output:
      self._buf.append('\n')
    elif tag in ('script', 'style'):
      self.hide_output = True

  def handle_startendtag(self, tag, attrs):
    if tag == 'br':
      self._buf.append('\n')

  def handle_endtag(self, tag):
    if tag == 'p':
      self._buf.append('\n')
    elif tag in ('script', 'style'):
      self.hide_output = False

  def handle_data(self, text):
    if text and not self.hide_output:
      self._buf.append(re.sub(r'\s+', ' ', text))

  def handle_entityref(self, name):
    if name in name2codepoint and not self.hide_output:
      c = unichr(name2codepoint[name])
      self._buf.append(c)

  def handle_charref(self, name):
    if not self.hide_output:
      n = int(name[1:], 16) if name.startswith('x') else int(name)
      self._buf.append(unichr(n))

  def get_text(self):
    return re.sub(r' +', ' ', ''.join(self._buf))


def _html_to_text(html):
  parser = _HTML2Text()
  try:
    parser.feed(html)
    parser.close()
  except HTMLParseError:
    pass
  return parser.get_text()


def _text_to_html(text):
  def func(mo):
    t = mo.group()
    if len(t) == 1:
      return {'&': '&amp;', "'": '&#39;', '"': '&quot;', '<': '&lt;', '>': '&gt;'}.get(t)
    return '<a href="%s">%s</a>' % (t, t)

  return re.sub(r'https?://[^] ()"\';]+|[&\'"<>]', func, text)
