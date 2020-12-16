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

MAX_STORE_TEXT_LENGTH = (1024 - 128) * 1024


class ListSave(ndb.Model):
  date_data_create = ndb.DateTimeProperty(auto_now_add=True)
  date_update = ndb.DateTimeProperty(auto_now=True)

  data = ndb.BlobProperty()

  @classmethod
  def has_data(cls, key):
    entry = cls.get_by_id(id=key)
    if not entry:
      return False

    return True

  @classmethod
  def get_data(cls, key, timeout=None):
    entry = cls.get_by_id(id=key)
    if not entry:
      return None

    data = entry.data

    if timeout is None:
      return data

    date_update = entry.date_update
    date_now = datetime.datetime.utcnow().replace(tzinfo=None)
    seconds_passed = (date_now - date_update).total_seconds()

    if int(timeout) <= seconds_passed:
      return None

    return data

  @classmethod
  def set_data(cls, key, data):
    entry = cls.get_by_id(id=key)
    if not entry:
      entry = cls(id=key)

    entry.data = data
    entry.put()

  @classmethod
  def clear_data(cls, key):
    entry = cls.get_by_id(id=key)
    if not entry:
      return False

    entry.key.delete()
    return True

  @classmethod
  def has_data_list(cls, key):
    key_length = cls._get_key_for_length(key)
    if not cls.has_data(key_length):
      return False

    key_first = cls._get_key_for_index(key, 0)
    if not cls.has_data(key_first):
      return False

    return True

  @classmethod
  def get_data_list(cls, key, timeout=None):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length, timeout=timeout)
    if not length:
      return None

    data = []

    length = int(length)

    for idx in range(0, length):
      key_index = cls._get_key_for_index(key, idx)
      data_index = cls.get_data(key_index)
      data.append(data_index)

    return data

  @classmethod
  def set_data_list(cls, key, data):
    key_length = cls._get_key_for_length(key)
    length = len(data)
    cls.set_data(key_length, str(length))

    for idx in range(0, length):
      key_index = cls._get_key_for_index(key, idx)
      data_index = data[idx]
      cls.set_data(key_index, data_index)

  @classmethod
  def clear_data_list(cls, key):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length)
    if not length:
      return False

    cls.clear_data(key_length)

    length = int(length)

    for idx in range(0, length):
      key_index = cls._get_key_for_index(key, idx)
      cls.clear_data(key_index)

  @classmethod
  def has_data_list_index(cls, key, index):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length)
    if not length:
      return False

    length = int(length)

    if index >= length:
      return False

    key_index = cls._get_key_for_index(key, index)
    if not cls.has_data(key_index):
      return False

    return True

  @classmethod
  def get_data_list_index(cls, key, index, timeout=None):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length)
    if not length:
      return None

    length = int(length)

    if index >= length:
      return None

    key_index = cls._get_key_for_index(key, index)
    data_index = cls.get_data(key_index, timeout=timeout)
    return data_index

  @classmethod
  def set_data_list_index(cls, key, index, data_index):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length)
    if not length:
      length = index + 1
      cls.set_data(key_length, str(length))
    else:
      length = int(length)
      if index >= length:
        length = index + 1
        cls.set_data(key_length, str(length))
      else:
        pass

    key_index = cls._get_key_for_index(key, index)
    cls.set_data(key_index, data_index)

  @classmethod
  def data_list_length(cls, key):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length)

    if not length:
      return None

    length = int(length)

    return length

  @classmethod
  def data_list_push(cls, key, data_index):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length)
    if not length:
      length = 1
      cls.set_data(key_length, str(length))
    else:
      length = int(length)
      length += 1
      cls.set_data(key_length, str(length))

    key_index = cls._get_key_for_index(key, length - 1)
    cls.set_data(key_index, data_index)

  @classmethod
  def data_list_pop(cls, key):
    key_length = cls._get_key_for_length(key)
    length = cls.get_data(key_length)
    if not length:
      return None

    else:
      length = int(length)
      if length:
        length -= 1
        cls.set_data(key_length, str(length))
      else:
        return None

    key_index = cls._get_key_for_index(key, length)
    data_index = cls.get_data(key_index)

    cls.clear_data(key_index)

    return data_index

  @staticmethod
  def _get_key_for_length(key):
    key_length = key + ".length"
    return key_length

  @staticmethod
  def _get_key_for_index(key, index):
    key_index = key + "." + str(index)
    return key_index


class DataSave(ndb.Model):
  date_data_create = ndb.DateTimeProperty(auto_now_add=True)
  date_update = ndb.DateTimeProperty(auto_now=True)

  data = ndb.JsonProperty(compressed=False)

  @classmethod
  def has_data(cls, key):
    entry = cls.get_by_id(id=key)
    if not entry:
      return False

    return True

  @classmethod
  def get_data(cls, key):
    entry = cls.get_by_id(id=key)
    if not entry:
      return None

    data = entry.data

    return data

  @classmethod
  def set_data(cls, key, data, options=None):
    entry = cls.get_by_id(id=key)
    if not entry:
      entry = cls(id=key)

    entry.data = data

    if options:
      entry.populate(**options)

    entry.put()

  @classmethod
  def clear_data(cls, key):
    entry = cls.get_by_id(id=key)
    if not entry:
      return False

    entry.key.delete()
    return True


class DataSaveTimeout(ndb.Model):
  date_data_create = ndb.DateTimeProperty(auto_now_add=True)
  date_update = ndb.DateTimeProperty(auto_now=True)

  data = ndb.JsonProperty(compressed=False)

  timeout = ndb.IntegerProperty(indexed=False)

  @classmethod
  def has_data(cls, key):
    entry = cls.get_by_id(id=key)
    if not entry:
      return False

    return True

  @classmethod
  def get_data(cls, key, timeout=None):
    entry = cls.get_by_id(id=key)
    if not entry:
      return None

    data = entry.data

    timeout = entry.timeout or timeout
    if not timeout:
      return data

    logging.debug('timeout: ' + str(timeout))

    date_update = entry.date_update
    date_now = datetime.datetime.utcnow().replace(tzinfo=None)
    seconds_passed = (date_now - date_update).total_seconds()
    
    logging.info('date_update: ' + str(date_update))
    logging.info('date_now: ' + str(date_now))
    logging.info('seconds_passed: ' + str(seconds_passed))

    if int(timeout) <= seconds_passed:
      return None

    return data

  @classmethod
  def set_data(cls, key, data, timeout=None, options=None):
    entry = cls.get_by_id(id=key)
    if not entry:
      entry = cls(id=key)

    entry.data = data

    if timeout is not None:
      entry.timeout = timeout

    if options:
      entry.populate(**options)
      
    entry.put()

  @classmethod
  def clear_data(cls, key):
    entry = cls.get_by_id(id=key)
    if not entry:
      return False

    entry.key.delete()
    return True


class DataSaveTextLarge(ndb.Model):
  date_data_create = ndb.DateTimeProperty(auto_now_add=True)
  date_update = ndb.DateTimeProperty(auto_now=True)

  data = ndb.TextProperty()

  @classmethod
  def get_element_id(cls, key, index=None):
    index = index or 0
    element_id = "{}__{}".format(key, index)

    return element_id

  @classmethod
  def extract_element_key(cls, element_id):
    element_key = element_id.rsplit('__', 1)[0]

    return element_key

  @classmethod
  def extract_element_index(cls, element_id):
    element_index = element_id.rsplit('__', 1)[1]
    
    return int(element_index)

  @classmethod
  def has_data(cls, key):
    element_id = cls.get_element_id(key)
    entry = cls.get_by_id(id=element_id)
    if not entry:
      return False

    return True

  @classmethod
  def get_data(cls, key):
    index = 0
    first_element_id = cls.get_element_id(key, index=index)
    first_entry = cls.get_by_id(id=first_element_id)
    if not first_entry:
      return None

    data = first_entry.data
    if len(data) < MAX_STORE_TEXT_LENGTH:
      return data

    index += 1
    next_element_id = cls.get_element_id(key, index=index)
    next_entry = cls.get_by_id(id=next_element_id)
    while next_entry:
      next_data = next_entry.data
      if not next_data:
        break

      data += next_data

      if len(next_data) < MAX_STORE_TEXT_LENGTH:
        break

      index += 1
      next_element_id = cls.get_element_id(key, index=index)
      next_entry = cls.get_by_id(id=next_element_id)

    return data

  @classmethod
  def set_data(cls, key, data, options=None):
    string = data
    length = MAX_STORE_TEXT_LENGTH
    chunks = (string[0 + i:length + i] for i in range(0, len(string), length))
    index = 0
    for chunk in chunks:
      element_id = cls.get_element_id(key, index=index)
      entry = cls.get_by_id(id=element_id)
      if not entry:
        entry = cls(id=element_id)

      entry.data = chunk

      if options:
        entry.populate(**options)

      entry.put()
      index += 1

    need_delete_element_id = cls.get_element_id(key, index=index)
    need_delete_entry = cls.get_by_id(id=need_delete_element_id)
    while need_delete_entry:
      need_delete_entry.key.delete()
      index += 1
      need_delete_element_id = cls.get_element_id(key, index=index)
      need_delete_entry = cls.get_by_id(id=need_delete_element_id)

  @classmethod
  def clear_data(cls, key):
    index = 0
    first_element_id = cls.get_element_id(key, index=index)
    first_entry = cls.get_by_id(id=first_element_id)
    if not first_entry:
      return False

    first_entry.key.delete()

    index += 1
    need_delete_element_id = cls.get_element_id(key, index=index)
    need_delete_entry = cls.get_by_id(id=need_delete_element_id)
    while need_delete_entry:
      need_delete_entry.key.delete()
      index += 1
      need_delete_element_id = cls.get_element_id(key, index=index)
      need_delete_entry = cls.get_by_id(id=need_delete_element_id)

    return True


class ChatSession(DataSaveTimeout):
  data = ndb.BlobProperty()

  @classmethod
  def load_session(cls, session_id, timeout=None):
    if timeout is not None:
      timeout = cls._normal_timeout(timeout)

    data = cls.get_data(session_id, timeout=timeout)

    if data and isinstance(data, basestring):
      session = json.loads(data)
    else:
      session = data

    return session
  
  @classmethod
  def load_session1(cls, session_id):
    data = cls.get_data1(session_id)

    if data and isinstance(data, basestring):
      session = json.loads(data)
    else:
      session = data

    return session

  @classmethod
  def save_session(cls, session_id, data, timeout=None):
    if timeout is not None:
      timeout = cls._normal_timeout(timeout)

    if not data:
      session = {}
    else:
      session = data

    if session and isinstance(session, (basestring, unicode)):
      pass
    else:
      session = json.dumps(session)

    return cls.set_data(session_id, session, timeout=timeout)

  @classmethod
  def clear_session(cls, session_id):
    session = {}
    session = json.dumps(session)

    return cls.set_data(session_id, session)

  @staticmethod
  def _normal_timeout(timeout):
    if timeout is None:
      return None

    try:
      timeout = int(timeout)
    except ValueError:
      return None

    if timeout < 0:
      timeout = None

    return timeout


class ChatSessionTest(ChatSession):
  pass


class ChatSessionRest(ChatSession):
  pass


class ChatSessionNextsetAddon(ChatSession):
  pass


class ChatSessionSateraitoAddon(ChatSession):
  pass


class ChatSessionLineworks(ChatSession):
  pass


class ChatSessionLine(ChatSession):
  pass


class ChatSessionFacebookWorkplace(ChatSession):
  pass


class ChatSessionFacebook(ChatSession):
  pass


class ChatSessionMail(ChatSession):
  pass


class ChatSessionGmail(ChatSession):
  pass
