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


class ChannelUserProfile(ndb.Model):
  date_profile_create = ndb.DateTimeProperty(auto_now_add=True)
  date_update = ndb.DateTimeProperty(auto_now=True)

  profile = ndb.JsonProperty(compressed=False)

  @classmethod
  def get_profile_key(cls, chanel_id, user_id):
    profile_key = '{}__{}'.format(chanel_id, user_id)

    return profile_key

  @classmethod
  def has_profile(cls, chanel_id, user_id):
    profile_key = cls.get_profile_key(chanel_id, user_id)
    entry = cls.get_by_id(id=profile_key)
    if not entry:
      return False

    return True

  @classmethod
  def get_profile(cls, chanel_id, user_id):
    profile_key = cls.get_profile_key(chanel_id, user_id)
    entry = cls.get_by_id(id=profile_key)
    if not entry:
      return None

    profile = entry.profile

    return profile

  @classmethod
  def set_profile(cls, chanel_id, user_id, profile, options=None):
    profile_key = cls.get_profile_key(chanel_id, user_id)
    entry = cls.get_by_id(id=profile_key)
    if not entry:
      entry = cls(id=profile_key)

    entry.profile = profile

    if options:
      entry.populate(**options)

    entry.put()

  @classmethod
  def clear_profile(cls, chanel_id, user_id):
    profile_key = cls.get_profile_key(chanel_id, user_id)
    entry = cls.get_by_id(id=profile_key)
    if not entry:
      return False

    entry.chanel_id, user_id.delete()
    return True


class ChannelUserMapping(ndb.Model):
  date_mapping_create = ndb.DateTimeProperty(auto_now_add=True)
  date_update = ndb.DateTimeProperty(auto_now=True)

  user_id = ndb.StringProperty(required=True)
  display_name = ndb.StringProperty(default='')
  picture_url = ndb.StringProperty(default='')

  @classmethod
  def get_mapping_key(cls, channel_id, user_id):
    mapping_key = '{}__{}'.format(channel_id, user_id)

    return mapping_key

  @classmethod
  def has_mapping(cls, channel_id, user_id):
    mapping_key = cls.get_mapping_key(channel_id, user_id)
    entry = cls.get_by_id(id=mapping_key)
    if not entry:
      return False

    return True

  @classmethod
  def get_mapping(cls, channel_id, user_id):
    mapping_key = cls.get_mapping_key(channel_id, user_id)
    entry = cls.get_by_id(id=mapping_key)
    if not entry:
      return None

    user_id = entry.user_id

    return user_id

  @classmethod
  def set_mapping(cls, channel_id, user_name, user_id, options=None,display_name='',picture_url=''):
    mapping_key = cls.get_mapping_key(channel_id, user_id)
    entry = cls.get_by_id(id=mapping_key)
    if not entry:
      entry = cls(id=mapping_key)

    entry.user_id = user_id
    entry.display_name = display_name
    entry.picture_url = picture_url

    if options:
      entry.populate(**options)

    entry.put()

  @classmethod
  def clear_mapping(cls, channel_id, user_id):
    mapping_key = cls.get_mapping_key(channel_id, user_id)
    entry = cls.get_by_id(id=mapping_key)
    if not entry:
      return False

    entry.user_name.delete()
    return True

  @classmethod
  def get_mapping_by_user_id(cls, user_id):
    q = cls.query()
    q = q.filter(cls.user_id == user_id)
    key = q.get(keys_only=True)
    row = key.get() if key is not None else None
    return row