#!/usr/bin/python
# coding: utf-8

import sys

stdin = sys.stdin
stdout = sys.stdout
reload(sys)
sys.setdefaultencoding('utf-8')
sys.stdin = stdin
sys.stdout = stdout

import json
import hashlib
import logging

import gc
import time
import datetime

from google.appengine.ext import ndb
from google.appengine.api import search
from google.appengine.api import memcache

from google.appengine.api import namespace_manager

import master_db
import master_helper

# for datastore dnb entry
KIND_PREFIX = "Master_"
PROPERTY_PREFIX = "item_"

# for textsearch index document
INDEX_PREFIX = "Master_"
FIELD_PREFIX = "item_"

# don't prefix master data property name
KEEP_MASTER_PROPERTY_NAME = True

ITEM_CODE_KEY = "data_key"
ITEM_CODE_DATE_UPDATED = "date_updated"
ITEM_CODE_DATE_CREATED = "date_created"

DEFAULT_ITEMS = [
  ITEM_CODE_KEY,
  ITEM_CODE_DATE_UPDATED,
  ITEM_CODE_DATE_CREATED
]
DEFAULT_INDEX = True

IGNORE_ITEMS = [
  ITEM_CODE_DATE_UPDATED,
  ITEM_CODE_DATE_CREATED
]

IGNORE_INDEX_ITEMS = [
]

MASTER_BASE = master_db.MasterBase
DICT_TYPE_PROPERTIES = master_helper.DICT_TYPE_PROPERTIES
DICT_GET_VALUE_TYPE_IMPORT = master_helper.DICT_GET_VALUE_TYPE_IMPORT
DICT_GET_VALUE_TYPE_EXPORT = master_helper.DICT_GET_VALUE_TYPE_EXPORT

DICT_TYPE_FIELDS = master_helper.DICT_TYPE_FIELDS
DICT_GET_VALUE_TYPE_SEARCH = master_helper.DICT_GET_VALUE_TYPE_SEARCH

CACHED_MASTER_CLASS = {}

DATASTORE_DATE_FORMAT = master_helper.DATASTORE_DATE_FORMAT


# check key will valid in current server time +- 5 minus
MARGIN_MINUTES_BEFORE = 5
MARGIN_MINUTES_AFTER = 5

CSV_EXPORT_LIMITS = 100000
CSV_EXPORT_GC_RATE = 500

def getMemcacheKeyMasterData(master_code):
  return 'script=masterdata&master_code' + master_code

def clearMemcacheKeyMasterData(master_code):
  memcache.delete(getMemcacheKeyMasterData(master_code))

def get_current_tenant():
  return namespace_manager.get_namespace()


def get_master_definition(master_code):
  master_code = master_code.strip()
  return master_db.MasterDef.get_definition(master_code)


def set_master_definition(master_code, master_config, master_name='', comment=''):
  master_code = master_code.strip()
  master_name = master_name.strip()
  return master_db.MasterDef.set_definition(master_code, master_config, master_name=master_name, comment=comment)


def delete_master_definition(master_code):
  master_code = master_code.strip()
  return master_db.MasterDef.delete_definition(master_code)


def list_master_definition(*args, **kwargs):
  return master_db.MasterDef.list_definition(*args, **kwargs)


def has_master_config(master_code):
  master_code = master_code.strip()
  return master_db.MasterDef.has_config(master_code)


def get_master_config(master_code):
  master_code = master_code.strip()
  return master_db.MasterDef.get_config(master_code)


def set_master_config(master_code, master_config):
  master_code = master_code.strip()
  return master_db.MasterDef.set_config(master_code, master_config)


def list_master_config():
  return master_db.MasterDef.list_config()


def list_master_definition_info(datetime_to_string=False):
  list_definitions = list_master_definition(datetime_to_string=datetime_to_string)
  list_info = []

  for definition in list_definitions:
    master_code = definition.get('master_code')
    if not master_code:
      continue

    if definition.get('is_deleted'):
      continue

    definition_info = {
      'master_code': master_code,
      'master_name': definition.get('master_name')
    }

    master_config = None
    try:
      master_config = json.loads(definition.get('master_config'))
    except:
      pass

    if isinstance(master_config, basestring):
      try:
        master_config = json.loads(master_config)
      except:
        pass

    if master_config and isinstance(master_config, dict):
      master_items = master_config.get('master_items')
      if master_items:
        definition_info['master_items'] = master_items
        definition_info['number_field'] = len(master_items)
        for item in master_items:
          item_code = item['item_code']
          if item_code == ITEM_CODE_KEY:
            definition_info['key_name'] = item['item_name']
            break

    definition_info['date_updated'] = definition.get('date_updated')
    definition_info['date_created'] = definition.get('date_created')

    list_info.append(definition_info)

  return list_info


def get_master_items(master_code):
  master_config = get_master_config(master_code)
  if not master_config:
    return

  if isinstance(master_config, basestring):
    try:
      master_config = json.loads(master_config)
    except:
      pass

  if isinstance(master_config, basestring):
    try:
      master_config = json.loads(master_config)
    except:
      pass

  master_items = None
  if isinstance(master_config, dict):
    master_items = master_config.get('master_items')

  return master_items


def get_master_kind_stored(master_code):
  master_code = master_code.strip()
  master_kind = KIND_PREFIX + master_code
  return master_kind


def get_property_name_stored(item_code):
  if KEEP_MASTER_PROPERTY_NAME:
    return item_code
  property_name = PROPERTY_PREFIX + item_code
  return property_name


def reverse_property_name_stored(property_name):
  if KEEP_MASTER_PROPERTY_NAME:
    return property_name
  item_code = property_name[len(PROPERTY_PREFIX):]
  return item_code


def get_property_type_stored(item_type):
  property_type = DICT_TYPE_PROPERTIES.get(item_type)
  return property_type


def get_property_ndb_stored(item):
  item_code = item.get("item_code")
  if item_code in DEFAULT_ITEMS:
    return None
  item_type = item.get("item_type")

  property_name = get_property_name_stored(item_code)
  property_type = get_property_type_stored(item_type)

  property_ndb = property_type(property_name, indexed=DEFAULT_INDEX)

  return property_ndb


def get_master_properties(master_items):
  properties = {}
  for item in master_items:
    property_ndb =get_property_ndb_stored(item)
    if not property_ndb:
      continue
    property_name = property_ndb._name

    # if property_name in properties:
    #   return

    properties[property_name] = property_ndb

  return properties


def generate_master_class(master_code, master_items):
  master_code = master_code.strip()
  class_kind = get_master_kind_stored(master_code)

  master_properties = get_master_properties(master_items)

  master_class = master_helper.create_sub_class(class_kind, MASTER_BASE, master_properties)

  return master_class


def load_master_class(master_code):
  master_code = master_code.strip()
  master_items = get_master_items(master_code)
  if not master_items:
    return

  master_class = generate_master_class(master_code, master_items)

  return master_class


def get_master_class_cached(tenant):
  tenant_cached = CACHED_MASTER_CLASS.get(tenant)
  if not tenant_cached:
    tenant_cached = {}
    CACHED_MASTER_CLASS[tenant] = tenant_cached

  return tenant_cached


def delete_master_class_cached(master_code=None):
  tenant = get_current_tenant()
  if tenant in CACHED_MASTER_CLASS:
    if not master_code:
      del CACHED_MASTER_CLASS[tenant]
      return

    tenant_cached = CACHED_MASTER_CLASS.get(tenant)
    if tenant_cached:
      if master_code in tenant_cached:
        del tenant_cached[master_code]


def get_master_class(master_code, is_new=False):
  tenant = get_current_tenant()
  tenant_cached = get_master_class_cached(tenant)
  class_cached = tenant_cached.get(master_code)
  if not class_cached or is_new:
    master_class = load_master_class(master_code)
    if master_class:
      class_cached = master_class
      tenant_cached['master_code'] = class_cached
  return class_cached


def get_master_import_value_dict(master_code=None, master_items=None):
  if master_code and not master_items:
    master_items = get_master_items(master_code)

  dict_get_value_func = {}

  if not master_items:
    return dict_get_value_func

  for item in master_items:
    item_code = item.get('item_code')
    if item_code in IGNORE_ITEMS:
      continue
    item_type = item.get('item_type')
    import_func = DICT_GET_VALUE_TYPE_IMPORT.get(item_type)
    if import_func:
      dict_get_value_func[item_code] = import_func

  return dict_get_value_func


def convert_data_dict_to_master_dict(data_dict, dict_get_value_func, include=None, exclude=None):
  master_dict = {}
  dict_keys = data_dict.keys()
  if include and exclude:
    dict_keys = list((set(dict_keys) & set(include)) - set(exclude))
  elif include:
    dict_keys = list(set(dict_keys) & set(include))
  elif exclude:
    dict_keys = list(set(dict_keys) - set(exclude))

  for item_code in dict_keys:
    property_name = get_property_name_stored(item_code)
    if not property_name:
      continue

    item_value_raw = data_dict.get(item_code)

    if item_code == ITEM_CODE_KEY:
      if not item_value_raw:
        return None
      master_dict[property_name] = item_value_raw
      continue

    if item_value_raw is None:
      master_dict[property_name] = item_value_raw
      continue

    get_value_func = dict_get_value_func.get(item_code)
    if not get_value_func:
      continue

    item_value_import = get_value_func(item_value_raw)
    master_dict[property_name] = item_value_import

  return master_dict


def reverse_master_dict_to_data_dict(master_dict):
  if KEEP_MASTER_PROPERTY_NAME:
    return master_dict
  data_dict = {}
  for property_name in master_dict:
    item_code = reverse_property_name_stored(property_name)
    data_dict[item_code] = master_dict.get(property_name)
  return data_dict


def _get_master_data_entry(master_class, data_key):
  entry = master_class.get_by_id(data_key)

  return entry


def _insert_master_data_entry(master_class, data_key, data_dict):
  entry = master_class(id=data_key)
  entry.populate(**data_dict)

  return entry.put()


def _update_master_data_entry(master_class, data_key, data_dict, entry=None):
  if not entry:
    entry = master_class.get_by_id(data_key)
  if not entry:
    return
  entry.populate(**data_dict)

  return entry.put()


def _delete_master_data_entry(master_class, data_key, entry=None):
  if not entry:
    entry = master_class.get_by_id(data_key)
  if not entry:
    return

  entry.key.delete()

  return True


def get_master_data_record(master_code, data_key):
  master_class = get_master_class(master_code)
  if not master_class:
    return
  entry = _get_master_data_entry(master_class, data_key)
  return entry


def insert_master_data_record(master_code, dict_object):
  master_class = get_master_class(master_code)
  if not master_class:
    return
  data_key = dict_object.get(ITEM_CODE_KEY)
  if not data_key:
    return
  entry = _get_master_data_entry(master_class, data_key)
  if entry:
    return

  dict_get_value_func = get_master_import_value_dict(master_code=master_code)

  master_dict = convert_data_dict_to_master_dict(dict_object, dict_get_value_func)

  result = _insert_master_data_entry(master_class, data_key, master_dict)

  if result:
    entry_key = result
    entry_inserted = entry_key.get()
    entry_dict = entry_inserted.to_dict()
    text_search_dict = reverse_master_dict_to_data_dict(entry_dict)
    data_key = text_search_dict.get(ITEM_CODE_KEY)
    _insert_master_data_index_document(master_code, data_key, text_search_dict)

  clearMemcacheKeyMasterData(master_code)

  return result


def update_master_data_record(master_code, dict_object):
  master_class = get_master_class(master_code)
  if not master_class:
    return
  data_key = dict_object.get(ITEM_CODE_KEY)
  if not data_key:
    return
  entry = _get_master_data_entry(master_class, data_key)
  if not entry:
    return

  dict_get_value_func = get_master_import_value_dict(master_code=master_code)

  master_dict = convert_data_dict_to_master_dict(dict_object, dict_get_value_func)

  result = _update_master_data_entry(master_class, data_key, master_dict, entry=entry)
  if result:
    entry_key = result
    entry_inserted = entry_key.get()
    entry_dict = entry_inserted.to_dict()
    text_search_dict = reverse_master_dict_to_data_dict(entry_dict)
    data_key = text_search_dict.get(ITEM_CODE_KEY)
    _update_master_data_index_document(master_code, data_key, text_search_dict)

  clearMemcacheKeyMasterData(master_code)

  return result


def delete_master_data_record(master_code, dict_object):
  master_class = get_master_class(master_code)
  if not master_class:
    return
  data_key = dict_object.get(ITEM_CODE_KEY)
  if not data_key:
    return
  entry = _get_master_data_entry(master_class, data_key)
  if not entry:
    return

  _delete_master_data_entry(master_class, data_key, entry=entry)

  _delete_master_data_index_document(master_code, data_key)

  clearMemcacheKeyMasterData(master_code)

  return True


def get_master_index_name(master_code):
  master_code = master_code.strip()
  index_name = INDEX_PREFIX + master_code
  return index_name


def get_index_field_name(item_code):
  if KEEP_MASTER_PROPERTY_NAME:
    return item_code
  field_name = FIELD_PREFIX + item_code
  return field_name


def reverse_index_field_name(field_name):
  if KEEP_MASTER_PROPERTY_NAME:
    return field_name
  item_code = field_name[len(FIELD_PREFIX):]
  return item_code


def get_index_field_type(item_type):
  field_type = DICT_TYPE_FIELDS.get(item_type)
  return field_type


def get_master_search_index(master_code):
  index_name = get_master_index_name(master_code)
  index = search.Index(index_name)

  return index


def get_dict_index_field_type(master_code=None, master_items=None):
  if master_code and not master_items:
    master_items = get_master_items(master_code)

  dict_index_field_type = {}

  if not master_items:
    return dict_index_field_type

  for item in master_items:
    item_code = item.get('item_code')
    if item_code in IGNORE_INDEX_ITEMS:
      continue
    item_type = item.get('item_type')
    field_type = get_index_field_type(item_type)
    if field_type:
      dict_index_field_type[item_code] = field_type

  return dict_index_field_type


def get_dict_index_value_func(master_code=None, master_items=None):
  if master_code and not master_items:
    master_items = get_master_items(master_code)

  dict_index_value_func = {}

  if not master_items:
    return dict_index_value_func

  for item in master_items:
    item_code = item.get('item_code')
    if item_code in IGNORE_INDEX_ITEMS:
      continue
    item_type = item.get('item_type')
    import_func = DICT_GET_VALUE_TYPE_SEARCH.get(item_type)
    if import_func:
      dict_index_value_func[item_code] = import_func

  return dict_index_value_func


def convert_data_dict_to_dict_document(data_dict, dict_index_value_func, include=None, exclude=None):
  dict_document = {}
  dict_keys = data_dict.keys()
  if include and exclude:
    dict_keys = list((set(dict_keys) & set(include)) - set(exclude))
  elif include:
    dict_keys = list(set(dict_keys) & set(include))
  elif exclude:
    dict_keys = list(set(dict_keys) - set(exclude))

  for item_code in dict_keys:
    field_name = get_index_field_name(item_code)
    if not field_name:
      continue

    item_value_raw = data_dict.get(item_code)

    if item_code == ITEM_CODE_KEY:
      if not item_value_raw:
        return None
      dict_document[field_name] = item_value_raw
      continue

    if item_value_raw is None:
      dict_document[field_name] = item_value_raw
      continue

    get_value_func = dict_index_value_func.get(item_code)
    if not get_value_func:
      continue

    item_value_import = get_value_func(item_value_raw)
    dict_document[field_name] = item_value_import

  return dict_document


def reverse_document_dict_to_data_dict(document_dict):
  if KEEP_MASTER_PROPERTY_NAME:
    return document_dict
  data_dict = {}
  for field_name in document_dict:
    item_code = reverse_index_field_name(field_name)
    data_dict[item_code] = document_dict.get(field_name)
  return data_dict


def convert_dict_object_to_index_document(dict_object, dict_index_field_type, dict_index_value_func, include=None, exclude=None, doc_id=None):
  document_fields = []
  document_id = doc_id or dict_object.get(ITEM_CODE_KEY)
  if not document_id:
    return

  dict_keys = dict_object.keys()
  if include and exclude:
    dict_keys = list((set(dict_keys) & set(include)) - set(exclude))
  elif include:
    dict_keys = list(set(dict_keys) & set(include))
  elif exclude:
    dict_keys = list(set(dict_keys) - set(exclude))

  for item_code in dict_keys:
    field_name = get_index_field_name(item_code)
    if not field_name:
      continue

    field_type = dict_index_field_type.get(item_code)
    if not field_type:
      continue

    item_value_raw = dict_object.get(item_code)
    if item_value_raw is None:
      continue

    field_value = None
    if item_value_raw is not None:
      get_value_func = dict_index_value_func.get(item_code)
      if get_value_func:
        field_value = get_value_func(item_value_raw)

    field = field_type(name=field_name, value=field_value)
    document_fields.append(field)

  new_document = search.Document(doc_id=document_id, fields=document_fields)

  return new_document


def _get_master_data_index_document(master_code, data_key):
  index = get_master_search_index(master_code)
  index_document = index.get(data_key)

  return index_document


def _insert_master_data_index_document(master_code, data_key, data_dict):
  index = get_master_search_index(master_code)
  master_items = get_master_items(master_code)
  if not master_items:
    return
  dict_index_field_type = get_dict_index_field_type(master_code, master_items)
  dict_index_value_func = get_dict_index_value_func(master_code, master_items)
  index_document = convert_dict_object_to_index_document(data_dict, dict_index_field_type, dict_index_value_func, doc_id=data_key)
  if not index_document:
    return

  return index.put(index_document)


def _update_master_data_index_document(master_code, data_key, data_dict):
  index = get_master_search_index(master_code)
  master_items = get_master_items(master_code)
  if not master_items:
    return
  dict_index_field_type = get_dict_index_field_type(master_code, master_items)
  dict_index_value_func = get_dict_index_value_func(master_code, master_items)
  index_document = convert_dict_object_to_index_document(data_dict, dict_index_field_type, dict_index_value_func, doc_id=data_key)
  if not index_document:
    return

  return index.put(index_document)


def _delete_master_data_index_document(master_code, data_key):
  index = get_master_search_index(master_code)
  # index_document = index.get(data_key)
  # if not index_document:
  #   return

  index.delete(data_key)

  return True


def index_search_get_ids(master_code, last_id=None, limit=100):
  index = get_master_search_index(master_code)

  documents = index.get_range(start_id=last_id, include_start_object=False, ids_only=True, limit=limit)
  document_ids = [document.doc_id for document in documents]

  return document_ids


def index_search_query_ids(master_code, query_string, page_size=100, max_result=10000, is_get_all=True):
  index = get_master_search_index(master_code)
  query_option = search.QueryOptions(ids_only=True, limit=page_size)

  if is_get_all:
    documents = _query_search_index_by_cursor(index, query_string, query_option, is_get_all=True)
  else:
    documents, cursor_web_safe_string, result_number_found = _query_search_index_by_cursor(index, query_string, query_option, is_get_all=False, query_count=max_result)

  document_ids = [document.doc_id for document in documents]

  return document_ids


def _query_search_index_by_offset(index, query_string, query_options, is_get_all=True, result_offset=None):
  result_documents = []
  result_returned = 1
  if not result_offset:
    result_offset = 0

  try:
    if is_get_all:
      while result_returned > 0:
        query_options._offset = result_offset
        query = search.Query(query_string=query_string, options=query_options)
        result = index.search(query)

        result_returned = len(result.results)
        if result_returned > 0:
          result_documents.extend(result.results)
          result_offset += result_returned

    else:
      if result_offset:
        query_options._offset = result_offset
      query = search.Query(query_string=query_string, options=query_options)
      result = index.search(query)
      result_returned = len(result.results)
      if result_returned > 0:
        result_documents = result.results

  except search.Error as ex:
    logging.exception(ex)
    return None

  return result_documents


def _query_search_index_by_cursor(index, query_string, query_options, is_get_all=True, query_cursor=None, query_count=None, number_found_accuracy=100):
  # logging.debug('query string: ' + str(query_string))

  result_documents = []
  if not query_cursor:
    cursor = search.Cursor()
  else:
    # cursor = query_cursor
    cursor = search.Cursor(web_safe_string=query_cursor)

  query_options_limit = query_options._limit

  try:
    if is_get_all:
      while cursor is not None:
        query_options._cursor = cursor
        query = search.Query(query_string=query_string, options=query_options)
        result = index.search(query)

        result_returned = len(result.results)
        cursor = result.cursor
        if result_returned > 0:
          result_documents.extend(result.results)

      return result_documents

    elif query_count and query_options_limit and query_count > query_options_limit:
      # if cursor:
      #   query_options._cursor = cursor
      while cursor is not None and len(result_documents) < query_count:
        query_options._cursor = cursor

        count_need_to_query = query_count - len(result_documents)
        if count_need_to_query and count_need_to_query < query_options_limit:
          query_options._limit = count_need_to_query
          query_options._number_found_accuracy = number_found_accuracy

        query = search.Query(query_string=query_string, options=query_options)
        result = index.search(query)

        result_returned = len(result.results)
        cursor = result.cursor

        if result_returned > 0:
          result_documents.extend(result.results)

      if len(result_documents) > query_count:
        result_documents = result_documents[:query_count]

      if cursor:
        return result_documents, cursor.web_safe_string, result.number_found
      else:
        return result_documents, '', result.number_found

    else:
      if cursor:
        query_options._cursor = cursor
      if query_count and query_options_limit and query_count < query_options_limit:
        query_options._limit = query_count
      query_options._number_found_accuracy = number_found_accuracy
      query = search.Query(query_string=query_string, options=query_options)
      result = index.search(query)
      result_returned = len(result.results)
      cursor = result.cursor

      if result_returned > 0:
        result_documents = result.results

      if cursor:
        return result_documents, cursor.web_safe_string, result.number_found
      else:
        return result_documents, '', result.number_found

  except search.Error as ex:
    logging.exception(ex)
    return None


def fetch_masterdata_entries(master_code, entry_ids):
  master_class = get_master_class(master_code)

  entries = []

  for entry_id in entry_ids:
    entry = master_class.get_by_id(entry_id)
    if not entry_id:
      continue

    entries.append(entry)

  return entries


def fetch_masterdata_from_ids(master_code, entry_ids, to_safe_dict=False):
  master_class = get_master_class(master_code)

  data = []

  for entry_id in entry_ids:
    entry = master_class.get_by_id(entry_id)
    if not entry:
      continue

    if to_safe_dict:
      data_dict = convert_masterdata_entry_to_safe_dict(entry)
    else:
      entry_dict = entry.to_dict()
      data_dict = reverse_master_dict_to_data_dict(entry_dict)

    data.append(data_dict)

    del entry

  return data


def convert_masterdata_entry_to_safe_dict(entry):
  entry_dict = entry.to_dict()

  data_dict = reverse_master_dict_to_data_dict(entry_dict)
  for key in data_dict:
    value = data_dict[key]
    if isinstance(value, datetime.datetime):
      data_dict[key] = value.strftime(DATASTORE_DATE_FORMAT)

  return data_dict


def get_memcached_api_key_list():
  key_name = "MASTERDATA_API_KEYS"
  api_keys = memcache.get(key_name)
  return api_keys


def set_memcached_api_key_list(api_keys):
  key_name = "MASTERDATA_API_KEYS"
  memcache.set(key_name, api_keys)


def delete_memcached_api_key_list():
  key_name = "MASTERDATA_API_KEYS"
  memcache.delete(key_name)


def api_key_create(creator_email):
  api_key_info = master_db.MasterApiKey.create_api_key(creator_email)
  delete_memcached_api_key_list()
  return api_key_info


def api_key_delete(unique_id):
  result = master_db.MasterApiKey.delete_api_key(unique_id)
  delete_memcached_api_key_list()
  return result


def api_key_list():
  api_keys = get_memcached_api_key_list()
  if api_keys is None:
    api_keys = master_db.MasterApiKey.list_api_key()
    set_memcached_api_key_list(api_keys)

  return api_keys


def api_key_only_list():
  api_keys = api_key_list()
  if not api_keys:
    return []

  only_api_keys = [api_key_info['api_key'] for api_key_info in api_keys]

  return only_api_keys


def api_key_safe_list():
  api_keys = api_key_list()
  if not api_keys:
    return []

  for api_key_info in api_keys:
    api_key = api_key_info['api_key']
    api_key_hidden = api_key_hide(api_key)
    api_key_info['api_key'] = api_key_hidden

  return api_keys


def api_key_hide(api_key):
  api_key_hidden = api_key[0:16] + '*' * 16
  return api_key_hidden


def api_create_check_key(tenant, api_key, check_time=None):
  if check_time is None:
    # now = datetime.datetime.now()
    now = datetime.datetime.utcnow()
    check_time = now

  check_key_string = tenant + check_time.strftime('%Y%m%d%H%M') + api_key
  md5_value = hashlib.md5()
  md5_value.update(check_key_string)
  check_key = md5_value.hexdigest()

  return check_key


def api_verify_check_key(check_key, tenant, api_key, check_time=None, minutes_before=MARGIN_MINUTES_BEFORE, minutes_after=MARGIN_MINUTES_AFTER):
  if check_time is None:
    # now = datetime.datetime.now()
    now = datetime.datetime.utcnow()
    check_time = now

  check_key_generated = api_create_check_key(tenant, api_key, check_time=check_time)
  if check_key == check_key_generated:
    return True

  # if minutes_before > 0:
  # 	for i in range(0, minutes_before):
  # 		minutes_before_sub = i + 1
  # 		time_before = datetime.timedelta(minutes=minutes_before_sub)
  # 		check_time_before = check_time - time_before
  # 		check_key_generated_before = api_create_check_key(tenant, api_key, check_time=check_time_before)
  # 		if check_key == check_key_generated_before:
  # 			return True
  #
  # if minutes_after > 0:
  # 	for i in range(0, minutes_after):
  # 		minutes_after_add = i + 1
  # 		time_after = datetime.timedelta(minutes=minutes_after_add)
  # 		check_time_after = check_time + time_after
  # 		check_key_generated_after = api_create_check_key(tenant, api_key, check_time=check_time_after)
  # 		if check_key == check_key_generated_after:
  # 			return True

  # check both this way we can do it faster
  minutes_margin = max(minutes_before, minutes_after)
  if minutes_margin > 0:
    for i in range(0, minutes_margin):
      if i < minutes_before:
        minutes_before_sub = i + 1
        time_before = datetime.timedelta(minutes=minutes_before_sub)
        check_time_before = check_time - time_before
        check_key_generated_before = api_create_check_key(tenant, api_key, check_time=check_time_before)
        if check_key == check_key_generated_before:
          return True

      if i < minutes_after:
        minutes_after_add = i + 1
        time_after = datetime.timedelta(minutes=minutes_after_add)
        check_time_after = check_time + time_after
        check_key_generated_after = api_create_check_key(tenant, api_key, check_time=check_time_after)
        if check_key == check_key_generated_after:
          return True

  return False


def create_csv_str(master_code, query_string='', options=None):
  time_start_all = time.time()
  logging.info("Export CSV Start")

  # for best performance, limit call functions, create unnecessary middle strings and actively freeing up memory
  options = options or {}
  headless = options.get('headless') or False
  delimiter = options.get('delimiter')
  if not delimiter:
    delimiter = ','
  newline = options.get('newline')
  if not newline:
    newline = '\r\n'
  empty = options.get('empty')
  if not empty:
    empty = ''
  include = options.get('include') or []
  exclude = options.get('exclude') or []
  limit = options.get('limit')
  if not limit:
    limit = CSV_EXPORT_LIMITS

  python_number_types = (int, float, long, complex)

  master_class = get_master_class(master_code)
  string_rows = []

  header_command = 'command'
  header_master_code = 'master_code'
  header_data_key = 'data_key'

  value_command = 'IU'
  value_master_code = master_code

  value_bool_true = 'true'
  value_bool_false = 'false'

  date_format_str = DATASTORE_DATE_FORMAT

  row_headers = [
    header_command,
    header_master_code,
    header_data_key
  ]

  master_items = get_master_items(master_code)
  export_items = []
  for item in master_items:
    item_code = item['item_code']
    if item_code in DEFAULT_ITEMS:
      continue
    if include and item_code not in include:
      continue
    if exclude and item_code in exclude:
      continue
    export_items.append(item_code)
    row_headers.append(item_code)

  csv_count_columns = len(row_headers)
  csv_cell_rows = 0

  if not headless:
    string_rows.append(delimiter.join(row_headers))

  data_keys = index_search_query_ids(master_code, query_string, max_result=limit, is_get_all=True)

  for entry_key in data_keys:
    entry = master_class.get_by_id(entry_key)
    if not entry:
      continue

    row_values = [empty] * csv_count_columns
    row_values[0] = value_command
    row_values[1] = value_master_code
    row_values[2] = entry_key

    index_column = 3
    for item_code in export_items:
      entry_value = getattr(entry, item_code, None)
      if entry_value is None:
        index_column += 1
        continue

      if isinstance(entry_value, basestring):
        row_values[index_column] = entry_value
      elif isinstance(entry_value, bool):
        if entry_value:
          row_values[index_column] = value_bool_true
        else:
          row_values[index_column] = value_bool_false
      elif isinstance(entry_value, python_number_types):
        row_values[index_column] = str(entry_value)
      elif isinstance(entry_value, datetime.datetime):
        row_values[index_column] = entry_value.strftime(date_format_str)
      else:
        row_values[index_column] = str(entry_value)

      index_column += 1

    del entry

    string_rows.append(delimiter.join(row_values))
    del row_values

    csv_cell_rows += 1
    if (csv_cell_rows % CSV_EXPORT_GC_RATE) == 0:
      gc.collect()

  del data_keys
  gc.collect()

  logging.info("Export CSV End")
  time_end_all = time.time()
  time_process_all = time_end_all - time_start_all
  logging.info("Export CSV Time: {} minutes".format(time_process_all / 60.0))

  return newline.join(string_rows)

def index_search_query_data(master_code, query_string, page_size=100, max_result=10000, offset=0):
  index = get_master_search_index(master_code)
  # sort option
  sort_expression = search.SortExpression(
        expression='data_key',
        direction=search.SortExpression.ASCENDING,
        default_value='')
  sort = search.SortOptions(expressions=[sort_expression], limit=max_result)
  q_ft = search.Query(query_string=query_string, options=search.QueryOptions(sort_options=sort, limit=page_size, offset=offset, ids_only=True))
  results = index.search(q_ft)
  logging.info('operator.number_found=' + str(results.number_found))

  return results, results.number_found
