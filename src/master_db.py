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

from google.appengine.ext import ndb

import StringIO
import csv

from ucf.utils.ucfutil import UcfUtil


import master_helper

TYPE_OF_SIMPLE = master_helper.TYPE_OF_SIMPLE
TYPE_OF_BOOL = bool
TYPE_OF_STRING = basestring
TYPE_OF_DATE = datetime.date

FIELD_TYPE_GENERIC = master_helper.FIELD_TYPE_GENERIC
FIELD_TYPE_NUMBER = master_helper.FIELD_TYPE_NUMBER
FIELD_TYPE_INTEGER = master_helper.FIELD_TYPE_INTEGER
FIELD_TYPE_FLOAT = master_helper.FIELD_TYPE_FLOAT
FIELD_TYPE_BOOLEAN = master_helper.FIELD_TYPE_BOOLEAN
FIELD_TYPE_STRING = master_helper.FIELD_TYPE_STRING
FIELD_TYPE_DATE = master_helper.FIELD_TYPE_DATE

DATASTORE_DATE_FORMAT = master_helper.DATASTORE_DATE_FORMAT


###########################################################################################################
#
###########################################################################################################


class BaseExpando(ndb.Expando):
	def extract_to_dict(self, property_names, key_name=None):
		output = {}

		for name in property_names:
			value = getattr(self, name, None)

			if value is None or isinstance(value, TYPE_OF_SIMPLE):
				output[name] = value
			elif isinstance(value, TYPE_OF_DATE):
				output[name] = unicode(value.replace(microsecond=0))

		if key_name is not None:
			output[key_name] = self.key.id()

		return output

	def extract_to_list(self, property_names, key_index=None):
		output = []

		if key_index is None or key_index == 0:
			output.append(self.key.id())

		for name in property_names:
			value = getattr(self, name, None)

			if value is None or isinstance(value, TYPE_OF_SIMPLE):
				output.append(value)
			elif isinstance(value, TYPE_OF_DATE):
				output.append(unicode(value.replace(microsecond=0)))

		if key_index is not None:
			output.insert(key_index, self.key.id())

		return output

	def convert_to_dict(self, key_name=None, include=None, exclude=None, ignore_none=False):
		output = {}

		for key in self._properties:
			if include is not None and key not in include:
				continue
			if exclude is not None and key in exclude:
				continue

			value = getattr(self, key, None)

			if value is None:
				if ignore_none:
					continue
				else:
					output[key] = value
					continue

			if isinstance(value, TYPE_OF_SIMPLE):
				output[key] = value
			elif isinstance(value, TYPE_OF_DATE):
				output[key] = unicode(value.replace(microsecond=0))

		if key_name is not None:
			output[key_name] = self.key.id()

		return output

	def convert_to_list(self, key_index=None, include=None):
		output = []

		if key_index is None or key_index == 0:
			output.append(self.key.id())

		if include is None:
			include = self._properties

		for key in include:
			value = getattr(self, key, None)

			if value is None or isinstance(value, TYPE_OF_SIMPLE):
				output.append(value)
			elif isinstance(value, TYPE_OF_DATE):
				output.append(unicode(value.replace(microsecond=0)))

		if key_index is not None:
			output.insert(key_index, self.key.id())

		return output

	def import_from_dict(self, dict_values, include=None, exclude=None):
		for key in dict_values:
			if include is not None and key not in include:
				continue
			if exclude is not None and key in exclude:
				continue

			value = dict_values[key]
			setattr(self, key, value)

	@classmethod
	def check_exist_by_id(cls, entry_id):
		entry = cls.get_by_id(entry_id)
		if entry is None:
			return False
		else:
			return True

	@classmethod
	def get_all_entry_ids(cls):
		all_entry_ids = []

		all_entries_key = cls.query().fetch(keys_only=True)
		for entry_key in all_entries_key:
			all_entry_ids.append(entry_key.id())

		return all_entry_ids

	@classmethod
	def get_all_entries_as_dict(cls, key_name=None):
		all_entries_dict = {}

		all_entries = cls.query().fetch()

		for entry in all_entries:
			key_value = getattr(entry, key_name, None) if key_name is not None else entry.key.id()
			all_entries_dict[key_value] = entry

		return all_entries_dict

	@classmethod
	def get_all_entries_as_dict_of_dict(cls, key_name=None, include=None, exclude=None):
		all_entries_dict = {}

		all_entries = cls.query().fetch()

		for entry in all_entries:
			key_value = getattr(entry, key_name, None) if key_name is not None else entry.key.id()
			entry_dict = entry.convert_to_dict(include=include, exclude=exclude)
			all_entries_dict[key_value] = entry_dict

		return all_entries_dict

	@classmethod
	def get_all_entries_as_dict_of_list(cls, key_name=None, include=None):
		all_entries_dict = {}

		all_entries = cls.query().fetch()

		for entry in all_entries:
			key_value = getattr(entry, key_name, None) if key_name is not None else entry.key.id()
			entry_list = entry.convert_to_list(include=include)
			all_entries_dict[key_value] = entry_list

		return all_entries_dict

	@classmethod
	def get_all_entries_as_list(cls):
		all_entries_list = []

		all_entries = cls.query().fetch()

		for entry in all_entries:
			all_entries_list.append(entry)

		return all_entries_list

	@classmethod
	def get_all_entries_as_list_of_dict(cls, key_name=None, include=None, exclude=None):
		all_entries_list = []
		all_entry_ids_list = []

		all_entries = cls.query().fetch()

		for entry in all_entries:
			entry_dict = entry.convert_to_dict(include=include, exclude=exclude)
			all_entries_list.append(entry_dict)

			key_value = entry.key.id()
			if key_name is not None:
				entry_dict[key_name] = key_value
			else:
				all_entry_ids_list.append(key_value)

		if key_name is not None:
			return all_entries_list
		else:
			return all_entries_list, all_entry_ids_list

	@classmethod
	def get_all_entries_as_list_of_list(cls, key_index=None, include=None):
		all_entries_list = []
		all_entry_ids_list = []

		all_entries = cls.query().fetch()

		for entry in all_entries:
			entry_list = entry.convert_to_list(include=include)
			all_entries_list.append(entry_list)

			key_value = entry.key.id()
			if key_index is not None:
				entry_list.insert(key_index, key_value)
			else:
				all_entry_ids_list.append(key_value)

		if key_index is not None:
			return all_entries_list
		else:
			return all_entries_list, all_entry_ids_list

	@classmethod
	def datastore_clear(cls):
		ndb.delete_multi(cls.query().fetch(keys_only=True))

	@classmethod
	def datastore_clear_by_batch(cls, batch_size=500):
		query_data_key = cls.query().fetch(batch_size, keys_only=True)
		while query_data_key:
			ndb.delete_multi(query_data_key)
			query_data_key = cls.query().fetch(batch_size, keys_only=True)

	@classmethod
	def get_datastore_all_field_types(cls):
		all_field_types = {}
		for model_property in cls._properties:
			property_type = str(type(cls._properties[model_property]))
			data_type = master_helper.get_field_type_from_python_type(property_type)
			all_field_types[model_property] = data_type

		return all_field_types

	def get_entry_all_field_types(self):
		all_field_types = {}
		for model_property in self._properties:
			property_type = str(type(self._properties[model_property]))
			data_type = master_helper.get_field_type_from_python_type(property_type)
			all_field_types[model_property] = data_type

		return all_field_types

	def set_field_value_genetic(self, col_name, col_value, indexed=False):
		property_generic = ndb.GenericProperty(col_name, indexed=indexed)
		property_generic._code_name = col_name
		self._properties[col_name] = property_generic
		property_generic._set_value(self, col_value)

	def set_field_value_integer(self, col_name, col_value, indexed=False):
		property_integer = ndb.IntegerProperty(col_name, indexed=indexed)
		property_integer._code_name = col_name
		self._properties[col_name] = property_integer
		property_integer._set_value(self, int(col_value))

	def set_field_value_float(self, col_name, col_value, indexed=False):
		property_float = ndb.FloatProperty(col_name, indexed=indexed)
		property_float._code_name = col_name
		self._properties[col_name] = property_float
		property_float._set_value(self, float(col_value))

	def set_field_value_boolean(self, col_name, col_value, indexed=False):
		property_boolean = ndb.BooleanProperty(col_name, indexed=indexed)
		property_boolean._code_name = col_name
		self._properties[col_name] = property_boolean
		value_boolean = None
		if col_value is not None:
			if isinstance(col_value, TYPE_OF_STRING):
				value_boolean = True if col_value.lower() == "true" else False
			elif isinstance(col_value, TYPE_OF_BOOL):
				value_boolean = col_value
			else:
				value_boolean = True if col_value else False
		property_boolean._set_value(self, value_boolean)

	def set_field_value_string(self, col_name, col_value, indexed=False):
		property_string = ndb.StringProperty(col_name, indexed=indexed)
		property_string._code_name = col_name
		self._properties[col_name] = property_string
		property_string._set_value(self, str(col_value))

	def set_field_value_datetime(self, col_name, col_value, datatime_format=DATASTORE_DATE_FORMAT, indexed=False):
		property_datetime = ndb.DateTimeProperty(col_name, indexed=indexed)
		property_datetime._code_name = col_name
		self._properties[col_name] = property_datetime
		value_datetime = None
		if col_value is not None:
			if isinstance(col_value, TYPE_OF_STRING):
				value_datetime = datetime.datetime.strptime(col_value, datatime_format)
			elif isinstance(col_value, TYPE_OF_DATE):
				value_datetime = col_value
			else:
				logging.warn("Invalid Type Date: {}".format(str(col_value)))
				return
		property_datetime._set_value(self, value_datetime)

	def set_field_value_base_on_type(self, col_name, col_value, col_type=None):
		if col_type is None:
			self.set_field_value_genetic(col_name, col_value)

		else:
			if col_type == FIELD_TYPE_INTEGER:
				self.set_field_value_integer(col_name, col_value)

			elif col_type == FIELD_TYPE_FLOAT:
				self.set_field_value_float(col_name, col_value)

			elif col_type == FIELD_TYPE_BOOLEAN:
				self.set_field_value_boolean(col_name, col_value)

			elif col_type == FIELD_TYPE_STRING:
				self.set_field_value_string(col_name, col_value)

			elif col_type == FIELD_TYPE_DATE:
				self.set_field_value_datetime(col_name, col_value)

	def set_field_value_genetic_none(self, col_name, indexed=False):
		property_generic = ndb.GenericProperty(col_name, indexed=indexed)
		property_generic._code_name = col_name
		self._properties[col_name] = property_generic
		property_generic._set_value(self, None)

	def set_field_value_integer_none(self, col_name, indexed=False):
		property_integer = ndb.IntegerProperty(col_name, indexed=indexed)
		property_integer._code_name = col_name
		self._properties[col_name] = property_integer
		property_integer._set_value(self, None)

	def set_field_value_float_none(self, col_name, indexed=False):
		property_float = ndb.FloatProperty(col_name, indexed=indexed)
		property_float._code_name = col_name
		self._properties[col_name] = property_float
		property_float._set_value(self, None)

	def set_field_value_boolean_none(self, col_name, indexed=False):
		property_boolean = ndb.BooleanProperty(col_name, indexed=indexed)
		property_boolean._code_name = col_name
		self._properties[col_name] = property_boolean
		property_boolean._set_value(self, None)

	def set_field_value_string_none(self, col_name, indexed=False):
		property_string = ndb.StringProperty(col_name, indexed=indexed)
		property_string._code_name = col_name
		self._properties[col_name] = property_string
		property_string._set_value(self, None)

	def set_field_value_date_time_none(self, col_name, indexed=False):
		property_datetime = ndb.DateTimeProperty(col_name, indexed=indexed)
		property_datetime._code_name = col_name
		self._properties[col_name] = property_datetime
		property_datetime._set_value(self, None)

	def set_field_value_none_base_on_type(self, col_name, col_type=None):
		if col_type is None:
			self.set_field_value_genetic_none(col_name)

		else:
			if col_type == FIELD_TYPE_INTEGER:
				self.set_field_value_integer_none(col_name)

			elif col_type == FIELD_TYPE_FLOAT:
				self.set_field_value_float_none(col_name)

			elif col_type == FIELD_TYPE_BOOLEAN:
				self.set_field_value_boolean_none(col_name)

			elif col_type == FIELD_TYPE_STRING:
				self.set_field_value_string_none(col_name)

			elif col_type == FIELD_TYPE_DATE:
				self.set_field_value_date_time_none(col_name)

	def import_from_dict_base_on_type(self, dict_values, dict_types, include=None, exclude=None):
		for key in dict_values:
			if include is not None and key not in include:
				continue
			if exclude is not None and key in exclude:
				continue

			value = dict_values[key]
			value_type = dict_types.get(key, None)
			if value is not None and value != '':
				self.set_field_value_base_on_type(key, value, value_type)
			else:
				self.set_field_value_none_base_on_type(key, value_type)

	def change_entry_id(self, new_id, new_id_check=False):
		model_class = self.__class__
		if new_id_check:
			entry_existed = model_class.get_by_id(new_id)
			if entry_existed:
				logging.warning("Can not change entry id to '" + str(new_id) + "' because already existed entry with that id")
				return None

		original_values = dict((k, v) for k, v in self._values.iteritems())
		new_entry = model_class(id=new_id, **original_values)

		if new_entry:
			new_entry.put()
			self.key.delete()

			return new_entry

	def clone_entity(self, **extra_args):
		model_class = self.__class__

		props = {}

		for k, v in self._properties.iteritems():
			value = v.__get__(self, model_class)
			props[k] = value

		props.update(extra_args)

		return model_class(**props)

	def update_entity(self, props, include=None, exclude=None):
		if include is None and exclude is None:
			self.populate(**props)

		else:
			props_selected = {}
			for k, v in props.iteritems():
				if include is not None and k not in include:
					continue

				if exclude is not None and k in exclude:
					continue

				props_selected[k] = props[k]

			self.populate(**props_selected)

		return self.put()


class BaseExpandoExDate(BaseExpando):
	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_updated = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def get_last_insert(cls):
		query_all = cls.query().order(-cls.date_created)
		last_entry_insert = query_all.get()
		return last_entry_insert

	@classmethod
	def get_first_insert(cls):
		query_all = cls.query().order(cls.date_created)
		first_entry_insert = query_all.get()
		return first_entry_insert

	@classmethod
	def get_last_update(cls):
		query_all = cls.query().order(-cls.date_updated)
		last_row_update = query_all.get()
		return last_row_update

	@classmethod
	def get_first_update(cls):
		query_all = cls.query().order(cls.date_updated)
		first_entry_update = query_all.get()
		return first_entry_update


class BaseExpandoExCsv(BaseExpando):
	@classmethod
	def export_entries_to_csv_rows(cls, entries=None, fields=None, fields_include=None, fields_exclude=None, exclude_field_id=False, field_extra_prefix=None, field_extra=None, field_extra_suffix=None):
		if fields is None:
			fields = []

			for key in cls._properties:
				if fields_include is not None and key not in fields_include:
					continue
				if fields_exclude is not None and key in fields_exclude:
					continue

				fields.append(key)

		if entries is None:
			entries = cls.query().fetch()

		all_csv_rows = []

		for entry in entries:
			row = []

			if field_extra_prefix is not None:
				row.extend(field_extra_prefix)

			if not exclude_field_id:
				entry_id = entry.key.id()
				row.append(entry_id)

			if field_extra is not None:
				row.extend(field_extra)

			for field in fields:
				value = getattr(entry, field, "")
				row.append(value)

			if field_extra_suffix is not None:
				row.extend(field_extra_suffix)

			all_csv_rows.append(row)

		return all_csv_rows

	@classmethod
	def export_entries_to_csv_string(cls, entries=None, fields=None, fields_include=None, fields_exclude=None, exclude_field_id=False, field_extra_prefix=None, field_extra=None, field_extra_suffix=None):
		if fields is None:
			fields = []

			for key in cls._properties:
				if fields_include is not None and key not in fields_include:
					continue
				if fields_exclude is not None and key in fields_exclude:
					continue

				fields.append(key)

		if entries is None:
			entries = cls.query().fetch()

		tmp = StringIO.StringIO()
		writer = csv.writer(tmp)

		for entry in entries:
			row = []

			if field_extra_prefix is not None:
				row.extend(field_extra_prefix)

			if not exclude_field_id:
				entry_id = entry.key.id()
				row.append(entry_id)

			if field_extra is not None:
				row.extend(field_extra)

			for field in fields:
				value = getattr(entry, field, "")
				row.append(value)

			if field_extra_suffix is not None:
				row.extend(field_extra_suffix)

			writer.writerow(row)

		contents = tmp.getvalue()
		tmp.close()

		return contents

	@classmethod
	def export_all_entries_to_csv_rows(cls, fields=None, fields_include=None, fields_exclude=None, exclude_field_id=False, field_extra_prefix=None, field_extra=None, field_extra_suffix=None):
		if fields is None:
			fields = []

			for key in cls._properties:
				if fields_include is not None and key not in fields_include:
					continue
				if fields_exclude is not None and key in fields_exclude:
					continue

				fields.append(key)

		all_csv_rows = []

		query_all = cls.query()
		cursor = None
		more = True
		while more:
			result, cursor, more = query_all.fetch_page(1000, start_cursor=cursor)
			for entry in result:
				row = []

				if field_extra_prefix is not None:
					row.extend(field_extra_prefix)

				if not exclude_field_id:
					entry_id = entry.key.id()
					row.append(entry_id)

				if field_extra is not None:
					row.extend(field_extra)

				for field in fields:
					value = getattr(entry, field, "")
					row.append(value)

				if field_extra_suffix is not None:
					row.extend(field_extra_suffix)

				all_csv_rows.append(row)

		return all_csv_rows

	@classmethod
	def export_all_entries_to_csv_string(cls, fields=None, fields_include=None, fields_exclude=None, exclude_field_id=False, field_extra_prefix=None, field_extra=None, field_extra_suffix=None):
		if fields is None:
			fields = []

			for key in cls._properties:
				if fields_include is not None and key not in fields_include:
					continue
				if fields_exclude is not None and key in fields_exclude:
					continue

				fields.append(key)

		tmp = StringIO.StringIO()
		writer = csv.writer(tmp)

		query_all = cls.query()
		cursor = None
		more = True
		while more:
			result, cursor, more = query_all.fetch_page(1000, start_cursor=cursor)
			for entry in result:
				row = []

				if field_extra_prefix is not None:
					row.extend(field_extra_prefix)

				if not exclude_field_id:
					entry_id = entry.key.id()
					row.append(entry_id)

				if field_extra is not None:
					row.extend(field_extra)

				for field in fields:
					value = getattr(entry, field, "")
					row.append(value)

				if field_extra_suffix is not None:
					row.extend(field_extra_suffix)

				writer.writerow(row)

		contents = tmp.getvalue()
		tmp.close()

		return contents


class MasterDef(ndb.Model):
	master_code = ndb.StringProperty()
	master_name = ndb.StringProperty()
	master_config = ndb.TextProperty()

	comment = ndb.TextProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_updated = ndb.DateTimeProperty(auto_now=True)

	is_deleted = ndb.BooleanProperty(default=False)

	@classmethod
	def get_definition(cls, master_code):
		entry = cls.get_by_id(master_code)
		if not entry:
			return

		master_config_text = entry.master_config
		master_config = None
		try:
			master_config = json.loads(master_config_text)
		except:
			pass

		master_definition = {
			"master_code": entry.master_code,
			"master_name": entry.master_name,
			"master_config": master_config,
			"comment": entry.comment,
			"date_updated": entry.date_updated,
			"date_created": entry.date_created,
		}

		return master_definition

	@classmethod
	def set_definition(cls, master_code, master_config, master_name='', comment=''):
		entry = cls.get_by_id(master_code)
		if not entry:
			entry = cls(id=master_code)
			entry.master_code = master_code

		entry.master_name = master_name

		master_config_text = None
		if isinstance(master_config, (list, tuple, dict)):
			master_config_text = json.dumps(master_config)
		elif isinstance(master_config, basestring):
			master_config_text = master_config
		entry.master_config = master_config_text

		entry.comment = comment

		return entry.put()

	@classmethod
	def delete_definition(cls, master_code):
		entry = cls.get_by_id(master_code)
		if not entry:
			return

		entry.key.delete()

	@classmethod
	def list_definition(cls, datetime_to_string=False):
		entries = cls.query().fetch()

		masters = []
		for entry in entries:
			master_dict = entry.to_dict()

			if datetime_to_string:
				date_updated = master_dict['date_updated']
				date_updated = date_updated.strftime(DATASTORE_DATE_FORMAT)
				master_dict['date_updated'] = date_updated
				date_created = master_dict['date_created']
				date_created = date_created.strftime(DATASTORE_DATE_FORMAT)
				master_dict['date_created'] = date_created

			masters.append(master_dict)
		return masters

	@classmethod
	def has_config(cls, master_code):
		entry = cls.get_by_id(master_code)
		if not entry:
			return False

		if not entry.master_config:
			return False

		return True

	@classmethod
	def get_config(cls, master_code):
		entry = cls.get_by_id(master_code)
		if not entry:
			return

		master_config_text = entry.master_config
		master_config = None
		try:
			master_config = json.loads(master_config_text)
		except:
			pass

		return master_config

	@classmethod
	def set_config(cls, master_code, master_config):
		entry = cls.get_by_id(master_code)
		if not entry:
			entry = cls(id=master_code)
			entry.master_code = master_code

		master_config_text = None
		if isinstance(master_config, (list, tuple, dict)):
			master_config_text = json.dumps(master_config)
		elif isinstance(master_config, basestring):
			master_config_text = master_config
		entry.master_config = master_config_text

		return entry.put()


	@classmethod
	def list_config(cls):
		entries = cls.query().fetch()

		masters = []
		for entry in entries:
			master_code = entry.master_code
			master_config = entry.master_config or {}
			if master_config:
				master_config = json.loads(master_config)
			master_dict = {
				'master_code': master_code,
				'master_config': master_config
			}

			masters.append(master_dict)
		return masters


class MasterBase(ndb.Model):
	# item_key = ndb.StringProperty()
	# item_date_created = ndb.DateTimeProperty(auto_now_add=True)
	# item_date_updated = ndb.DateTimeProperty(auto_now=True)

	data_key = ndb.StringProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_updated = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def get_last_insert(cls):
		# query_all = cls.query().order(-cls.item_date_created)
		query_all = cls.query().order(-cls.date_created)
		last_entry_insert = query_all.get()
		return last_entry_insert

	@classmethod
	def get_first_insert(cls):
		# query_all = cls.query().order(cls.item_date_created)
		query_all = cls.query().order(cls.date_created)
		first_entry_insert = query_all.get()
		return first_entry_insert

	@classmethod
	def get_last_update(cls):
		# query_all = cls.query().order(-cls.item_date_updated)
		query_all = cls.query().order(-cls.date_updated)
		last_row_update = query_all.get()
		return last_row_update

	@classmethod
	def get_first_update(cls):
		# query_all = cls.query().order(cls.item_date_updated)
		query_all = cls.query().order(cls.date_updated)
		first_entry_update = query_all.get()
		return first_entry_update


class MasterApiKey(ndb.Model):
	unique_id = ndb.StringProperty()
	api_key = ndb.StringProperty()

	creator_email = ndb.StringProperty()

	date_created = ndb.DateTimeProperty(auto_now_add=True)
	date_updated = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def create_api_key(cls, creator_email):
		unique_id = UcfUtil.guid()
		entry = cls(id=unique_id)
		entry.unique_id = unique_id
		api_key = UcfUtil.guid()
		entry.api_key = api_key
		entry.creator_email = creator_email

		entry_key = entry.put()

		entry_dict = entry_key.get().to_dict()

		return entry_dict

	@classmethod
	def list_api_key(cls):
		entries = cls.query().fetch()

		api_keys = []
		for entry in entries:
			entry_dict = entry.to_dict()

			api_keys.append(entry_dict)
		return api_keys

	@classmethod
	def delete_api_key(cls, unique_id):
		entry = cls.get_by_id(unique_id)
		if not entry:
			return False

		entry.key.delete()

		return True

	@classmethod
	def hide_api_key(cls, api_key):
		api_key_hidden = api_key[0:16] + '*' * 16
		return api_key_hidden
