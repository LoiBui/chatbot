# coding: utf-8

import re,logging
from jinja2 import contextfilter, Markup

#+++++++++++++++++++++++++++++++++++++++
#+++ フィルタを登録
#+++++++++++++++++++++++++++++++++++++++
def registCustomFilters(jinja_environment):
	jinja_environment.filters['escapejs'] = escapejs
#	jinja_environment.filters['escapejson'] = escapejson
	jinja_environment.filters['linebreaksbr'] = linebreaksbr
	jinja_environment.filters['hyperlink_linebreaksbr'] = hyperlink_linebreaksbr

#+++++++++++++++++++++++++++++++++++++++
#+++ hyperlink_linebreaksbr:リンクをtarget="_brank" のハイパーリンク文字列に変換する
#+++++++++++++++++++++++++++++++++++++++
@contextfilter
def hyperlink_linebreaksbr(context, value):
	result = ''
	if type(value) is int:
		result = str(value)
	else:
		if value is not None:
			result = value
			ptn_link = re.compile(r"(https?://[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+)")
			result = ptn_link.sub(r'!#!a href=!%!\1!%! target=!%!_blank!%! !$!\1!#!/a!$!', result)
			if context.eval_ctx.autoescape:
				result = result.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
			result = result.replace('\n', '<br />\n')
			result = result.replace('!#!', '<').replace('!$!', '>').replace('!%!', '"')
			if context.eval_ctx.autoescape:
				result = Markup(result)
	return result

#+++++++++++++++++++++++++++++++++++++++
#+++ escapejs:JavaScript用のエスケープ
#+++++++++++++++++++++++++++++++++++++++
@contextfilter
def escapejs(context, value):
	result = ''
	if type(value) is int:
		result = str(value)
	else:
		if value is not None:
			for c in value:
				result = result + '\\u' + hex(ord(c))[2:].zfill(4)
			if context.eval_ctx.autoescape:
				result = Markup(result)
	return result

#+++++++++++++++++++++++++++++++++++++++
#+++ escapejson:JavaScript用のjson用のエスケープ（escapejsでもOKだが長い文字列だとエラーしちゃうので簡易的に）
#+++++++++++++++++++++++++++++++++++++++
#@contextfilter
#def escapejson(context, value):
#	result = ''
#	if type(value) is int:
#		result = str(value)
#	else:
#		for c in value:
#			if c in ('"', '\'', '}', '{', '_', ' ', '\\', ',', ':', '.', '@', '/', '<', '>'):
#				result = result + '\\u' + hex(ord(c))[2:].zfill(4)
#			else:
#				result = result + c
#		if context.eval_ctx.autoescape:
#			result = Markup(result)
#	return result

#+++++++++++++++++++++++++++++++++++++++
#+++ linebreaksbr:JavaScript用のエスケープ（autosafe設定の場合は、safeフィルタも使用される前提。例： xxx|linebreaksbr|safe）
#+++++++++++++++++++++++++++++++++++++++
@contextfilter
def linebreaksbr(context, value):
	result = ''
	if type(value) is int:
		result = str(value)
	else:
		if value is not None:
			result = value
			if context.eval_ctx.autoescape:
				result = result.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
			result = result.replace('\n', '<br />\n')
			if context.eval_ctx.autoescape:
				result = Markup(result)
	return result

