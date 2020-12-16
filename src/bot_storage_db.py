import sys

stdin = sys.stdin
stdout = sys.stdout
reload(sys)
sys.setdefaultencoding('utf-8')
sys.stdin = stdin
sys.stdout = stdout

import json
import logging
import datetime

from google.appengine.ext import ndb

import chat_session_db


class BotStorage(chat_session_db.DataSave):
  owner_id = ndb.StringProperty()

  # data = ndb.BlobProperty(compressed=True)
  data = ndb.BlobProperty()

  @classmethod
  def has_storage(cls, owner_id, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)

    return cls.has_data(storage_slot_id)

  @classmethod
  def load_storage(cls, owner_id, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)

    storage_json = cls.get_data(storage_slot_id)
    if not storage_json:
      return

    try:
      storage = json.loads(storage_json)
    except:
      logging.error("Load data from {} failed because json loads error.".format(storage_slot_id))
      return

    data = storage.get('data')

    return data

  @classmethod
  def save_storage(cls, owner_id, data, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)

    storage = {
      'data': data
    }

    try:
      storage_json = json.dumps(storage)
    except:
      logging.error("Save data to {} failed because json dumps error.".format(storage_slot_id))
      return

    return cls.set_data(storage_slot_id, storage_json, {"owner_id": owner_id})

  @classmethod
  def clear_storage(cls, owner_id, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)
    return cls.clear_data(storage_slot_id)

  @classmethod
  def list_storage(cls, owner_id):
    query_all = cls.query()
    query_filter = query_all.filter(cls.owner_id == owner_id)

    list_data = []

    for entry in query_filter.iter():
      storage_slot_id = entry.key.id()
      slot_id = _get_slot_id(storage_slot_id)

      if not slot_id:
        continue

      storage_json = entry.data
      if not storage_json:
        data = None
      else:
        # storage = json.loads(storage_json)
        # storage_data = storage.get('data')
        storage_data = None
        try:
          storage = json.loads(storage_json)
          storage_data = storage.get('data')
        except:
          logging.error("Load data from {} failed because json dumps error.".format(storage_slot_id))

      storage_slot = {
        'key': slot_id,
        'data': storage_data
      }

      list_data.append(storage_slot)

    return list_data


  @classmethod
  def dict_storage(cls, owner_id):
    query_all = cls.query()
    query_filter = query_all.filter(cls.owner_id == owner_id)

    dict_data = {}

    for entry in query_filter.iter():
      storage_slot_id = entry.key.id()
      slot_id = _get_slot_id(storage_slot_id)

      if not slot_id:
        continue

      storage_json = entry.data
      if not storage_json:
        storage_data = None
      else:
        # storage = json.loads(storage_json)
        # storage_data = storage.get('data')
        storage_data = None
        try:
          storage = json.loads(storage_json)
          storage_data = storage.get('data')
        except:
          logging.error("Load data from {} failed because json dumps error.".format(storage_slot_id))

      dict_data[slot_id] = storage_data

    return dict_data

  @classmethod
  def empty_storage(cls, owner_id):
    query_all = cls.query()
    query_filter = query_all.filter(cls.owner_id == owner_id)

    for entry_key in query_filter.iter(keys_only=True):
      entry_key.delete()


class BotStorageText(chat_session_db.DataSaveTextLarge):
  owner_id = ndb.StringProperty()
  category_id = ndb.StringProperty()

  @classmethod
  def has_storage(cls, owner_id, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)

    return cls.has_data(storage_slot_id)

  @classmethod
  def load_storage(cls, owner_id, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)

    storage_json = cls.get_data(storage_slot_id)
    if not storage_json:
      return

    try:
      storage = json.loads(storage_json)
    except:
      logging.error("Load data from {} failed because json loads error.".format(storage_slot_id))
      return

    data = storage.get('data')

    return data

  @classmethod
  def save_storage(cls, owner_id, data, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)

    storage = {
      'data': data
    }

    try:
      storage_json = json.dumps(storage)
    except:
      logging.error("Save data to {} failed because json dumps error.".format(storage_slot_id))
      return

    return cls.set_data(storage_slot_id, storage_json, {"owner_id": owner_id, "category_id": slot_id})

  @classmethod
  def clear_storage(cls, owner_id, slot_id):
    storage_slot_id = _get_storage_slot_id(owner_id, slot_id)
    return cls.clear_data(storage_slot_id)

  @classmethod
  def list_storage(cls, owner_id):
    query_all = cls.query()
    query_filter = query_all.filter(cls.owner_id == owner_id)

    dict_chunks = {}

    for entry in query_filter.iter():
      entry_id = entry.key.id()
      storage_slot_id = cls.extract_element_key(entry_id)
      element_index = cls.extract_element_index(entry_id)
      slot_id = _get_slot_id(storage_slot_id)

      if not slot_id:
        continue

      chunk = entry.data
      if slot_id not in dict_chunks:
        dict_chunks[slot_id] = {}

      dict_chunks[slot_id][element_index] = chunk

    list_data = []

    categories = list(dict_chunks.keys())
    for category in categories:
      category_data_chunks = categories[category]
      indexs = list(category_data_chunks.keys()).sort()
      chunks = [category_data_chunks[index] for index in indexs]
      storage_json = ''
      for chunk in chunks:
        storage_json += chunk

      if not storage_json:
        continue

      storage_data = None
      try:
        storage = json.loads(storage_json)
        storage_data = storage.get('data')
      except:
        logging.error("Load data from {} failed because json dumps error.".format(storage_slot_id))

      storage_slot = {
        'key': category,
        'data': storage_data
      }

      list_data.append(storage_slot)

    return list_data

  @classmethod
  def dict_storage(cls, owner_id):
    query_all = cls.query()
    query_filter = query_all.filter(cls.owner_id == owner_id)

    dict_chunks = {}

    for entry in query_filter.iter():
      entry_id = entry.key.id()
      storage_slot_id = cls.extract_element_key(entry_id)
      element_index = cls.extract_element_index(entry_id)
      slot_id = _get_slot_id(storage_slot_id)

      if not slot_id:
        continue

      chunk = entry.data
      if slot_id not in dict_chunks:
        dict_chunks[slot_id] = {}

      dict_chunks[slot_id][element_index] = chunk

    dict_data = {}

    categories = list(dict_chunks.keys())
    for category in categories:
      category_data_chunks = categories[category]
      indexs = list(category_data_chunks.keys()).sort()
      chunks = [category_data_chunks[index] for index in indexs]
      storage_json = ''
      for chunk in chunks:
        storage_json += chunk

      if not storage_json:
        continue

      storage_data = None
      try:
        storage = json.loads(storage_json)
        storage_data = storage.get('data')
      except:
        logging.error("Load data from {} failed because json dumps error.".format(storage_slot_id))

      dict_data[category] = storage_data

    return dict_data

  @classmethod
  def empty_storage(cls, owner_id):
    query_all = cls.query()
    query_filter = query_all.filter(cls.owner_id == owner_id)

    for entry_key in query_filter.iter(keys_only=True):
      entry_key.delete()


def _get_storage_slot_id(owner_id, slot_id):
  # storage_slot_id = "{}__{}".format(owner_id, slot_id)
  storage_slot_id = "{}__{}".format(slot_id, owner_id)

  return storage_slot_id


def _get_owner_id(storage_slot_id):
  try:
    # owner_id = storage_slot_id.split('__', 1)[0]
    owner_id = storage_slot_id.split('__', 1)[1]

    return owner_id
  except:
    logging.error("Invalid chat storage ID format: {}".format(storage_slot_id))


def _get_slot_id(storage_slot_id):
  try:
    # slot_id = storage_slot_id.split('__', 1)[1]
    slot_id = storage_slot_id.split('__', 1)[0]

    return slot_id
  except:
    logging.error("Invalid chat storage ID format: {}".format(storage_slot_id))
