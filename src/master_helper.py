#!/usr/bin/python
# coding: utf-8

import sys

stdin = sys.stdin
stdout = sys.stdout
reload(sys)
sys.setdefaultencoding('utf-8')
sys.stdin = stdin
sys.stdout = stdout

import re
import json
import logging
import time
import datetime

from google.appengine.ext import ndb
from google.appengine.api import search
from google.appengine.api import memcache


FIELD_TYPE_GENERIC = "generic"
FIELD_TYPE_NUMBER = "number"
FIELD_TYPE_INTEGER = "int"
FIELD_TYPE_FLOAT = "float"
FIELD_TYPE_BOOLEAN = "bool"
FIELD_TYPE_STRING = "string"
FIELD_TYPE_DATE = "date"

DATASTORE_DATE_FORMAT = "%Y/%m/%d %H:%M:%S"
DATASTORE_DATE_FORMAT2 = "%Y/%m/%d"

TYPE_OF_RAW = (int, long, float, bool, basestring)
TYPE_OF_STRUCT = (dict, list, tuple)
TYPE_OF_SIMPLE = (int, long, float, bool, basestring, dict, list, tuple)


class DateTimeProperty(ndb.DateTimeProperty):
	def _get_for_dict(self, entity):
		value_date = super(DateTimeProperty, self)._get_for_dict(entity)
		var_str = value_date.strftime(DATASTORE_DATE_FORMAT)
		return var_str


DICT_TYPE_PROPERTIES = {
	FIELD_TYPE_GENERIC: ndb.GenericProperty,
	FIELD_TYPE_NUMBER: ndb.FloatProperty,
	FIELD_TYPE_INTEGER: ndb.IntegerProperty,
	FIELD_TYPE_FLOAT: ndb.FloatProperty,
	FIELD_TYPE_BOOLEAN: ndb.BooleanProperty,
	FIELD_TYPE_STRING: ndb.StringProperty,
	# FIELD_TYPE_DATE: DateTimeProperty,
	FIELD_TYPE_DATE: ndb.DateTimeProperty,
}

NDB_PROPERTY_NAMES_DISALLOWED = [
	"allocate_ids",
	"allocate_ids_async",
	"get_by_id",
	"get_by_id_async",
	"get_or_insert",
	"get_or_insert_async",
	"put",
	"put_async",
	"key",
	"populate",
	"gql",
	"query",
	"to_dict",
	"has_complete_key",
]

DICT_TYPE_FIELDS = {
	FIELD_TYPE_GENERIC: search.TextField,
	FIELD_TYPE_NUMBER: search.NumberField,
	FIELD_TYPE_INTEGER: search.NumberField,
	FIELD_TYPE_FLOAT: search.NumberField,
	FIELD_TYPE_BOOLEAN: search.AtomField,
	FIELD_TYPE_STRING: search.TextField,
	# FIELD_TYPE_DATE: search.DateField,
	FIELD_TYPE_DATE: search.NumberField,
}


def get_field_type_from_python_type(property_type):
	data_type = ''
	if property_type.find('GenericProperty') != -1:
		logging.error("Found Generic Property Type: " + property_type)

	elif property_type.find('IntegerProperty') != -1:
		data_type = FIELD_TYPE_INTEGER
	elif property_type.find('FloatProperty') != -1:
		data_type = FIELD_TYPE_FLOAT
	elif property_type.find('BooleanProperty') != -1:
		data_type = FIELD_TYPE_BOOLEAN
	elif property_type.find('StringProperty') != -1:
		data_type = FIELD_TYPE_STRING
	elif property_type.find('DateTimeProperty') != -1:
		data_type = FIELD_TYPE_DATE
	else:
		logging.error("Unsupported Property Type Found: " + property_type)

	return data_type


def create_sub_class(name_class, base_class, properties):
	new_class = None

	if isinstance(base_class, list):
		new_class = type(name_class, tuple(tuple), properties)
	elif isinstance(base_class, tuple):
		new_class = type(name_class, base_class, properties)
	else:
		new_class = type(str(name_class), (base_class,), properties)

	return new_class


class DateTimeJSONEncoder(json.JSONEncoder):
	def default(self, obj):
		if isinstance(obj, datetime.datetime):
			return obj.strftime(DATASTORE_DATE_FORMAT)
		else:
			return super(DateTimeJSONEncoder, self).default(obj)


def json_encode(obj):
	return DateTimeJSONEncoder().encode(obj)


def get_value_generic(value):
	if isinstance(value, TYPE_OF_RAW):
		return value
	elif isinstance(value, TYPE_OF_STRUCT):
		return json.dumps(value)
	elif isinstance(value, datetime.datetime):
		return value

	return None


def get_value_str(value):
	if isinstance(value, basestring):
		return value
	else:
		return str(value)


def get_value_bool(value):
	if value is None:
		return None
	if isinstance(value, bool):
		return value
	elif isinstance(value, basestring):
		if not value:
			# return False
			return None
		if value.lower() == "true":
			return True
		elif value.lower() == "false":
			return False
		else:
			return not (not value)
	else:
		return True if value else False


def get_value_int(value):
	if isinstance(value, int):
		return value
	elif isinstance(value, (basestring, float)):
		try:
			return int(value)
		except:
			return None
	else:
		return None


def get_value_float(value):
	if isinstance(value, float):
		return value
	elif isinstance(value, (basestring, int)):
		try:
			return float(value)
		except:
			return None
	else:
		return None


def get_value_number(value):
	if isinstance(value, float):
		return value
	elif isinstance(value, int):
		return float(value)
	elif isinstance(value, basestring):
		try:
			return float(value)
		except:
			return None
	else:
		return None


def get_value_date(value):
	if isinstance(value, datetime.datetime):
		return value
	elif isinstance(value, basestring):
		try:
			return datetime.datetime.strptime(value, DATASTORE_DATE_FORMAT)
		except:
			pass

		try:
			return datetime.datetime.strptime(value, DATASTORE_DATE_FORMAT2)
		except:
			return None

	else:
		return None


def get_search_value_str(value):
	if value is None:
		return ""
	if isinstance(value, basestring):
		return value
	else:
		return str(value)


def get_search_value_bool(value):
	if isinstance(value, bool):
		return 'true' if value else 'false'
	elif isinstance(value, basestring):
		if not value:
			return 'false'
		if value == "true" or value == "True" or value == "TRUE":
			return 'true'
		elif value == "false" or value == "False" or value == "FALSE":
			return 'false'
		else:
			return 'true' if value else 'false'
	else:
		return 'true' if value else 'false'


def get_search_value_number(value):
	if isinstance(value, float):
		return value
	elif isinstance(value, int):
		return float(value)
	elif isinstance(value, basestring):
		try:
			return float(value)
		except:
			return None
	else:
		return None


def datetime_to_epoch(d):
	return int(time.mktime(d.timetuple()))


def epoch_to_datetime(epoch):
	return datetime.datetime(*time.localtime(epoch)[:6])


def get_search_value_date(value):
	if isinstance(value, datetime.datetime):
		return datetime_to_epoch(value)
	elif isinstance(value, basestring):
		value_date = None
		try:
			value_date = datetime.datetime.strptime(value, DATASTORE_DATE_FORMAT)
		except:
			pass

		try:
			value_date = datetime.datetime.strptime(value, DATASTORE_DATE_FORMAT2)
		except:
			pass

		if value_date:
			return datetime_to_epoch(value_date)
		return None
	elif isinstance(value, int):
		return value

	else:
		return None


DICT_GET_VALUE_TYPE_IMPORT = {
	FIELD_TYPE_GENERIC: get_value_generic,
	FIELD_TYPE_NUMBER: get_value_number,
	FIELD_TYPE_INTEGER: get_value_int,
	FIELD_TYPE_FLOAT: get_value_float,
	FIELD_TYPE_BOOLEAN: get_value_bool,
	FIELD_TYPE_STRING: get_value_str,
	FIELD_TYPE_DATE: get_value_date,
}

DICT_GET_VALUE_TYPE_EXPORT = {
	FIELD_TYPE_GENERIC: get_value_generic,
	FIELD_TYPE_NUMBER: get_value_number,
	FIELD_TYPE_INTEGER: get_value_int,
	FIELD_TYPE_FLOAT: get_value_float,
	FIELD_TYPE_BOOLEAN: get_value_bool,
	FIELD_TYPE_STRING: get_value_str,
	FIELD_TYPE_DATE: get_value_date,
}

DICT_GET_VALUE_TYPE_SEARCH = {
	FIELD_TYPE_GENERIC: get_search_value_str,
	FIELD_TYPE_NUMBER: get_search_value_number,
	FIELD_TYPE_INTEGER: get_search_value_number,
	FIELD_TYPE_FLOAT: get_search_value_number,
	FIELD_TYPE_BOOLEAN: get_search_value_bool,
	FIELD_TYPE_STRING: get_search_value_str,
	FIELD_TYPE_DATE: get_search_value_date,
}


PATTEN_DATE = ur'\s*(?:[<>=!]{1,2})\s*(\d{4}/\d{1,2}/\d{1,2}(?:\s*\d{1,2}:\d{1,2}:\d{1,2})?)'


def replace_func(matchobj):
	all_text = matchobj.group(0)
	try:

		match_text = matchobj.groups()[0]
		data_str = match_text
		value_data = get_search_value_date(match_text)

		return all_text.replace(match_text, str(value_data))

	except:
		return all_text


def fix_text_query_string(query_string):
	if isinstance(query_string, unicode):
		query_string_uni = query_string
	else:
		query_string_uni = unicode(query_string, 'utf-8')
	query_string_fixed = re.sub(PATTEN_DATE, replace_func, query_string_uni, flags=re.DOTALL | re.IGNORECASE | re.MULTILINE | re.UNICODE)

	return query_string_fixed
