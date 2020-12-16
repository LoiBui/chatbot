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
import logging
import datetime

import channel_user_db


class LineUserProfile(channel_user_db.ChannelUserProfile):
  pass


class LineUserMapping(channel_user_db.ChannelUserMapping):
  pass
