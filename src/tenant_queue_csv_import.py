#!/usr/bin/python
# coding: utf-8

import os,urllib,logging,webapp2,csv,gc
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
from google.appengine.api import taskqueue
from google.appengine.api import runtime
from google.appengine.api import memcache
from google.appengine.ext import ndb
from ucf.utils.helpers import *
from ucf.utils.ucfutil import UcfUtil
from ucf.utils.mailutil import UcfMailUtil
from ucf.pages.file import *
from ucf.pages.operator import *
#from ucf.pages.operator_group import *
# from ucf.pages.user import *
from ucf.pages.group import *
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
import sateraito_inc
import sateraito_func
from ucf.utils.ucfutil import *

import master_func


############################################################
# CSVインポートキュー：共通入り口ハンドラ
############################################################
class Page(TenantTaskHelper):

  # タスクステータスを更新（ログ更新）
  def updateTaskStatus(self, file_vo, file_entry, log_msg, is_error, login_operator_unique_id, login_operator_id, is_after_process=False):

    # ステータス後処理
    datNow = UcfUtil.getLocalTime(UcfUtil.getNow(), self._timezone)
    if is_error:
      file_vo['status'] = 'FAILED'
    elif is_after_process:
      file_vo['status'] = 'SUCCESS'
    log_text = file_vo.get('log_text', '')
    for msg in log_msg:
      log_text += msg + '\n'
    file_vo['log_text'] = log_text
    if is_after_process:
      file_vo['deal_status'] = 'FIN'
      file_vo['expire_date'] = UcfUtil.add_months(datNow,1)	# 一ヶ月有効とする
      file_vo['upload_count'] = '1'
      file_vo['last_upload_date'] = UcfUtil.nvl(datNow)
    file_vo['upload_operator_id'] = login_operator_id
    file_vo['upload_operator_unique_id'] = login_operator_unique_id
    file_vo['last_upload_operator_id'] = login_operator_id
    file_vo['last_upload_operator_unique_id'] = login_operator_unique_id

    FileUtils.editVoForRegist(self, file_vo, UcfConfig.EDIT_TYPE_RENEW)
    # Voからモデルにマージ
    file_entry.margeFromVo(file_vo, self._timezone)
    # 更新
    file_entry.updater_name = login_operator_id
    file_entry.date_changed = UcfUtil.getNow()
    file_entry.put()

  def _formatLogRecord(self, log):
    return '[' + UcfUtil.nvl(UcfUtil.getNowLocalTime(self._timezone)) + ']' + log

  def processOfRequest(self, tenant, token):
    self._approot_path = os.path.dirname(__file__)

    # エラーが1回おきたら処理を終了する
    if(int(self.request.headers.environ['HTTP_X_APPENGINE_TASKRETRYCOUNT']) > 1):
      logging.error('error over_1_times')
      return

    data_key = UcfUtil.nvl(self.getRequest('data_key'))
    data_kind = UcfUtil.nvl(self.getRequest('data_kind'))
    login_operator_id = UcfUtil.nvl(self.getRequest('login_operator_id'))
    login_operator_unique_id = UcfUtil.nvl(self.getRequest('login_operator_unique_id'))
    login_operator_mail_address = UcfUtil.nvl(self.getRequest('login_operator_mail_address'))
    login_operator_client_ip = UcfUtil.nvl(self.getRequest('login_operator_client_ip'))

    # オペレータ情報を取得
    login_operator_entry = None
    if login_operator_unique_id != '':
      login_operator_entry = OperatorUtils.getData(self, login_operator_unique_id)
      if login_operator_entry is None:
        raise Exception('Not found login operator information.')
        return

    # preparing blob reader
    # blobstore 保存しているバイナリデータを取得
    blob_key = str(urllib.unquote(self.request.get('key')))
    blob_reader = blobstore.BlobReader(blob_key)

    # ファイルデータを取得（ステータス=CREATINGで作成済）
    file_entry = FileUtils.getDataEntryByDataKey(self, data_key)
    if file_entry is None:
      raise Exception(self.getMsg('MSG_NOTFOUND_TARGET_FILE',(data_key)))
      return

    # タスクトークンの取得と更新
    last_task_token = file_entry.task_token if file_entry.task_token is not None else ''
    file_entry.task_token = token
    file_entry.put()

    file_vo = file_entry.exchangeVo(self._timezone)
    FileUtils.editVoForSelect(self, file_vo)

    file_encoding = UcfUtil.getHashStr(self.getDeptInfo(True), 'file_encoding')
    if file_encoding == '' or file_encoding == 'SJIS':
      data_encoding = 'cp932'
    elif file_encoding == 'JIS':
      data_encoding = 'jis'
    elif file_encoding == 'EUC':
      data_encoding = 'euc-jp'
    elif file_encoding == 'UTF7':
      data_encoding = 'utf-7'
    elif file_encoding == 'UTF8':
      data_encoding = 'utf-8'
    elif file_encoding == 'UNICODE':
      data_encoding = 'utf-16'
    else:
      data_encoding = 'cp932'


    log_msg = []
    #is_error = False
    record_cnt = 0
    #insert_cnt = 0
    #update_cnt = 0
    #delete_cnt = 0
    #skip_cnt = 0
    #error_cnt = 0

    shutdown_record_cnt_str = self.request.get('shutdown_record_cnt')
    if shutdown_record_cnt_str is not None and shutdown_record_cnt_str != '':
      shutdown_record_cnt = int(shutdown_record_cnt_str)
    else:
      shutdown_record_cnt = 0
    logging.info('shutdown_record_cnt=' + str(shutdown_record_cnt))

    is_error_str = self.request.get('is_error')
    if is_error_str is not None and is_error_str.lower() == 'true':
      is_error = True
    else:
      is_error = False
    logging.info('is_error=' + str(is_error))

    insert_cnt_str = self.request.get('insert_cnt')
    if insert_cnt_str is not None and insert_cnt_str != '':
      insert_cnt = int(insert_cnt_str)
    else:
      insert_cnt = 0
    update_cnt_str = self.request.get('update_cnt')
    if update_cnt_str is not None and update_cnt_str != '':
      update_cnt = int(update_cnt_str)
    else:
      update_cnt = 0
    delete_cnt_str = self.request.get('delete_cnt')
    if delete_cnt_str is not None and delete_cnt_str != '':
      delete_cnt = int(delete_cnt_str)
    else:
      delete_cnt = 0
    skip_cnt_str = self.request.get('skip_cnt')
    if skip_cnt_str is not None and skip_cnt_str != '':
      skip_cnt = int(skip_cnt_str)
    else:
      skip_cnt = 0
    error_cnt_str = self.request.get('error_cnt')
    if error_cnt_str is not None and error_cnt_str != '':
      error_cnt = int(error_cnt_str)
    else:
      error_cnt = 0

    try:

      # 同じトークンで既に処理済みの場合、ＧＡＥのタスクが強制終了した後のリトライなのでログを出しておく
      if last_task_token == token:
        is_error = True
        log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_TASK_FORCE_RETRY'))))
        self.updateTaskStatus(file_vo, file_entry, log_msg, is_error, login_operator_unique_id, login_operator_id)
        del log_msg[:]

      logging.info('csv_analysis start...')
      new_lines = []
      str_record = ''
      quote_num = 0
      old_lines = blob_reader.read().splitlines()
      for line in old_lines:

        #str_record += lineline + '\n'
        #if str_record.count('"') % 2 == 0:
        #	new_lines.append(str_record.rstrip('\n'))
        #	str_record = ''

        quote_num += line.count('"')
        if quote_num % 2 == 0:
          new_lines.append(str_record + line)
          str_record = ''
          quote_num = 0
        else:
          str_record += line + '\n'

      logging.info('csv_analysis end. the record count is ' + str(len(new_lines)) + ' with title line.')

      # 巨大なCSVファイルを扱えるように対応 2015.03.27
      csv.field_size_limit(1000000000)

      # process uploaded csv file
      # universal-newline mode に対応
      #csvfile = csv.reader(blob_reader, dialect=csv.excel)
      #csvfile = csv.reader(blob_reader.read().splitlines(), dialect=csv.excel)
      csvfile = csv.reader(new_lines, dialect=csv.excel)

      col_names = []
      for row in csvfile:
        # タイトル行の処理
        if record_cnt == 0:
          # first row: column list
          col_index = 0
          for col in row:
            # BOM付CSVに対応 2016.10.13
            if data_encoding == 'utf-8' and col_index == 0:
              col = col.decode('utf-8-sig').encode('utf-8')
            col_name = col.strip().strip('"')
  #					# 条件を削除し、一列目の情報は全て列を作成
            col_names.append(col_name)
            col_index += 1

        # データ行の処理
        elif shutdown_record_cnt <= record_cnt - 1:

          is_runtime_shutdown = False
          is_force_runtime_shutdown = False
          # 5レコードに一回チェックしてみる
          # シャットダウンを検知した場合
          if record_cnt % 5 == 0:
            is_runtime_shutdown = runtime.is_shutting_down()
          # 強制対応はとりあえずコメントアウト
          ## シャットダウン検知しない場合も多いので、500レコードに一回ずつ別タスクにする ⇒ 100 に変更 2014.06.12
          #if (shutdown_record_cnt < record_cnt - 1) and (record_cnt - 1) % 100 == 0:
          #	is_force_runtime_shutdown = True

          if is_runtime_shutdown or is_force_runtime_shutdown:
            is_shutting_down = True
            current_memory_usage = runtime.memory_usage().current()
            logging.info('is_shutting_down=' + str(is_runtime_shutdown) + ' current_memory_usage=' + str(current_memory_usage))

            # instance will be shut down soon!
            # exit here and kick same batch to start next record
            logging.info('***** kicking same batch and stopping: shutdown_record_cnt=' + str(record_cnt - 1))
            # サマリをログ出力
            log_msg.append(self._formatLogRecord('development process [record:' + UcfUtil.nvl(record_cnt - 1) + ' skip:' + UcfUtil.nvl(skip_cnt) + ' insert:' + UcfUtil.nvl(insert_cnt) + ' update:' + UcfUtil.nvl(update_cnt) + ' delete:' + UcfUtil.nvl(delete_cnt) + ' error:' + UcfUtil.nvl(error_cnt) + ' ]'))
            log_msg.append(self._formatLogRecord('kicking same batch and stopping: shutdown_record_cnt=' + str(record_cnt - 1)))
            self.updateTaskStatus(file_vo, file_entry, log_msg, is_error, login_operator_unique_id, login_operator_id)
            del log_msg[:]

            # kick start import
            import_q = taskqueue.Queue('csv-export-import')
            params = {
                      'shutdown_record_cnt': record_cnt - 1
                      ,'insert_cnt': insert_cnt
                      ,'update_cnt': update_cnt
                      ,'delete_cnt': delete_cnt
                      ,'skip_cnt': skip_cnt
                      ,'error_cnt': error_cnt
                      ,'is_error': is_error
                      ,'key': blob_key
                      ,'data_key': data_key
                      ,'data_kind':data_kind
                      ,'login_operator_id': login_operator_id
                      ,'login_operator_unique_id': login_operator_unique_id
                      ,'login_operator_mail_address': login_operator_mail_address
                      ,'login_operator_client_ip': login_operator_client_ip
                     }

            import_t = taskqueue.Task(
              url='/a/' + tenant + '/' + token + '/queue_csv_import',
              params=params,
              target=sateraito_func.getBackEndsModuleName(tenant),
              countdown='1'
            )
            import_q.add(import_t)
            return

          col_index = 0
          # params に配列を作成する。
          csv_record = {}
          for col_value in row:
            if col_index < len(col_names):
              # cut off too much csv data columns
              # csv_record[col_names[col_index]] = unicode(col_value, UcfConfig.DL_ENCODING).strip().strip('"')
              # csv_record[col_names[col_index]] = unicode(col_value, data_encoding).strip().strip('"')
              csv_record[col_names[col_index]] = unicode(col_value, data_encoding)
              col_index += 1

          # 1行処理
          deal_type = ''
          row_log_msg = None
          code = ''
          if data_kind == 'importgroupcsv':
            deal_type, code, row_log_msg = self.importOneRecordGroup(csv_record, record_cnt, blob_key, data_key,
                                                                     data_kind, login_operator_unique_id,
                                                                     login_operator_id, login_operator_mail_address,
                                                                     login_operator_client_ip, login_operator_entry)
          # elif data_kind == 'importusercsv':
          #   deal_type, code, row_log_msg = self.importOneRecordUser(csv_record, record_cnt, blob_key, data_key, data_kind, login_operator_unique_id, login_operator_id, login_operator_mail_address, login_operator_client_ip, login_operator_entry)
          # elif data_kind == 'importchangeuseridcsv':
          #   deal_type, code, row_log_msg = self.importOneRecordChangeUserID(csv_record, record_cnt, blob_key, data_key, data_kind, login_operator_unique_id, login_operator_id, login_operator_mail_address, login_operator_client_ip, login_operator_entry)

          # 件数やエラーメッセージを集計
          if row_log_msg is not None:
            log_msg.extend(row_log_msg)
          if code != '':
            error_cnt += 1
            is_error = True
          if deal_type == UcfConfig.EDIT_TYPE_NEW:
            insert_cnt += 1
          elif deal_type == UcfConfig.EDIT_TYPE_RENEW:
            update_cnt += 1
          elif deal_type == UcfConfig.EDIT_TYPE_DELETE:
            delete_cnt += 1
          elif deal_type == UcfConfig.EDIT_TYPE_SKIP:
            skip_cnt += 1

          # ユーザーID変更処理はデリケートなので毎回ログを出す
          if data_kind == 'importchangeuseridcsv' and log_msg is not None and len(log_msg) > 0:
            self.updateTaskStatus(file_vo, file_entry, log_msg, is_error, login_operator_unique_id, login_operator_id)
            del log_msg[:]

        # ときどきメモリ開放
        if record_cnt % 100 == 0:
          current_memory_usage = runtime.memory_usage().current()
          gc.collect()
          current_memory_usage2 = runtime.memory_usage().current()
          logging.info('[memory_usage]record=' + str(record_cnt) + ' before:' + str(current_memory_usage) + ' after:' + str(current_memory_usage2))
        record_cnt += 1
    except BaseException, e:
      self.outputErrorLog(e)
      log_msg.append(self._formatLogRecord('system error.'))
      is_error = True

    # サマリをログ出力
    log_msg.append(self._formatLogRecord('result [record:' + UcfUtil.nvl(record_cnt - 1) + ' skip:' + UcfUtil.nvl(skip_cnt) + ' insert:' + UcfUtil.nvl(insert_cnt) + ' update:' + UcfUtil.nvl(update_cnt) + ' delete:' + UcfUtil.nvl(delete_cnt) + ' error:' + UcfUtil.nvl(error_cnt) + ' ]'))
    # ステータス後処理
    self.updateTaskStatus(file_vo, file_entry, log_msg, is_error, login_operator_unique_id, login_operator_id, is_after_process=True)


  ############################################################
  # 一行インポート：グループ（importgroupcsv）
  ############################################################
  def importOneRecordGroup(self, csv_record, record_cnt, blob_key, data_key, data_kind, login_operator_unique_id, login_operator_id, login_operator_mail_address, login_operator_client_ip, login_operator_entry):

    titles = GroupUtils.getCsvTitles(self)

    code = ''
    row_log_msg = []
    entry_vo = None
    current_belong_members = []		# 編集時に使用。編集前の所属メンバー（今回解除されたメンバーの判定に使用する）
    deal_type = ''
    edit_type = ''

    try:

      # CSVチェック
      vc = GroupCsvValidator()
      vc.validate(self, csv_record)
      # 入力エラーがあれば
      if vc.total_count > 0:
        code = '100'
        for title in titles:
          if vc.msg.has_key(title):
            #row_log_msg.extend(vc.msg[title])
            row_log_msg.extend(['[' + title + ']' + msg for msg in vc.msg[title]])

      if code == '':
        command = UcfUtil.getHashStr(csv_record, 'command')
        # セールスフォースではグループIDとメールアドレスは別 2015.12.18
        #email = UcfUtil.getHashStr(csv_record, 'email')
        group_id = UcfUtil.getHashStr(csv_record, 'group_id')

        q = sateraito_db.Group.query()
        q = q.filter(sateraito_db.Group.group_id_lower == group_id.lower())
        key = q.get(keys_only=True)
        entry = key.get() if key is not None else None
        # 委託管理者の場合は自分がアクセスできるカテゴリかをチェック
        if entry is not None and ucffunc.isDelegateOperator(login_operator_entry) and not ucffunc.isDelegateTargetManagementGroup(entry.management_group, login_operator_entry.delegate_management_groups if login_operator_entry is not None else None):
          code = '400'
          row_log_msg.append(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
        else:
          vo = {}
          # 削除処理の場合
          if command == 'D':
            if entry is None:
              code = '400'
              row_log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA'))))
            else:
              edit_type = UcfConfig.EDIT_TYPE_DELETE
              entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換

          # 新規登録の場合
          elif command == 'I':
            if entry is not None:
              code = '400'
              row_log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_VC_ALREADY_EXIST'))))
            else:
              edit_type = UcfConfig.EDIT_TYPE_NEW
              GroupUtils.editVoForDefault(self, vo)
              # csv_dataからマージ
              GroupUtils.margeVoFromCsvRecord(self, vo, csv_record, login_operator_entry)
              GroupUtils.editVoForSelectCsvImport(self, vo)		# データ加工（取得用）

          # 編集の場合
          elif command == 'U':
            if entry is None:
              code = '400'
              row_log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA'))))
            else:
              edit_type = UcfConfig.EDIT_TYPE_RENEW
              entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
              GroupUtils.editVoForSelect(self, entry_vo, is_with_parent_group_info=False, is_with_belong_member_info=False)		# データ加工（取得用）
              UcfUtil.margeHash(vo, entry_vo)									# 既存データをVoにコピー
              # csv_dataからマージ
              GroupUtils.margeVoFromCsvRecord(self, vo, csv_record, login_operator_entry)
              GroupUtils.editVoForSelectCsvImport(self, vo)		# データ加工（取得用）

              current_belong_members = UcfUtil.csvToList(UcfUtil.getHashStr(entry_vo, 'belong_members'))

          # 新規 or 編集の場合
          elif command == 'IU':
            if entry is not None:
              edit_type = UcfConfig.EDIT_TYPE_RENEW
              entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
              GroupUtils.editVoForSelect(self, entry_vo, is_with_parent_group_info=False, is_with_belong_member_info=False)		# データ加工（取得用）
              UcfUtil.margeHash(vo, entry_vo)									# 既存データをVoにコピー
            else:
              edit_type = UcfConfig.EDIT_TYPE_NEW
            # csv_dataからマージ
            GroupUtils.margeVoFromCsvRecord(self, vo, csv_record, login_operator_entry)
            GroupUtils.editVoForSelectCsvImport(self, vo)		# データ加工（取得用）

          ########################
          # 削除
          if edit_type == UcfConfig.EDIT_TYPE_DELETE:
            # トップグループなら子グループをトップに昇格
            if UcfUtil.getHashStr(entry_vo, 'top_group_flag') == 'TOP':
              GroupUtils.updateBelongMembersTopGroupFlag(self, UcfUtil.getHashStr(entry_vo, 'group_id_lower'), UcfUtil.csvToList(entry_vo['belong_members']), 'SET', operator_id=login_operator_id)
            # このグループをメイン組織に設定しているユーザのメイン組織をクリア
            OperatorUtils.removeUsersTargetMainGroup(self, UcfUtil.getHashStr(entry_vo, 'group_id_lower'), operator_id=login_operator_id)
            # このグループをメイン組織に設定しているグループのメイン組織をクリア
            GroupUtils.removeGroupsTargetMainGroup(self, UcfUtil.getHashStr(entry_vo, 'group_id_lower'), operator_id=login_operator_id)
            # このグループを所属メンバーとして持っている親グループからメンバーとして解除 2016.10.24
            GroupUtils.removeOneMemberFromBelongGroups(self, UcfUtil.getHashStr(entry_vo, 'group_id_lower'), operator_id=login_operator_id)
            # このグループ自体を削除
            entry.key.delete()
            # オペレーションログ出力
            UCFMDLOperationLog.addLog(login_operator_mail_address, login_operator_unique_id, UcfConfig.SCREEN_GROUP, UcfConfig.OPERATION_TYPE_REMOVE, entry_vo.get('group_id', ''), entry_vo.get('unique_id', ''), login_operator_client_ip, '', is_async=True)
            deal_type = edit_type

          # 更新、新規
          elif edit_type == UcfConfig.EDIT_TYPE_NEW or edit_type == UcfConfig.EDIT_TYPE_RENEW:

            # 入力チェック
            vc = GroupValidator(edit_type, ucffunc.isDelegateOperator(login_operator_entry), login_operator_entry.delegate_management_groups if login_operator_entry is not None else None)
            vc.validate(self, vo)

            # 入力エラーがなければ登録処理
            if vc.total_count <= 0:

              # オペレーションログ詳細用に更新フィールドを取得（加工前に比較しておく）
              if edit_type == UcfConfig.EDIT_TYPE_NEW:
                is_diff = True
                diff_for_operation_log = []
              else:
                is_diff, diff_for_operation_log = GroupUtils.isDiff(self, vo, entry_vo)
              # 差分があるかを判定
              is_skip = not is_diff

              # 加工データ
              GroupUtils.editVoForRegist(self, vo, entry_vo, edit_type)
              # 新規登録場合モデルを新規作成
              if edit_type == UcfConfig.EDIT_TYPE_NEW:
                unique_id = UcfUtil.guid()
                vo['unique_id'] = unique_id
                entry = sateraito_db.Group(unique_id=unique_id,id=GroupUtils.getKey(self, vo))

              #logging.info('vo=' + str(vo))
              # Voからモデルにマージ
              #logging.info(vo)
              entry.margeFromVo(vo, self._timezone)
              # 更新日時、更新者の更新
              entry.updater_name = login_operator_id
              entry.date_changed = UcfUtil.getNow()

              # 新規登録場合ユニークＩＤを生成
              if edit_type == UcfConfig.EDIT_TYPE_NEW:
                # 作成日時、作成者の更新
                entry.creator_name = login_operator_id
                entry.date_created = UcfUtil.getNow()

              belong_members = UcfUtil.csvToList(vo['belong_members'])
              release_members = []																# 今回の変更で所属メンバーから解除されたメンバー
              for current_belong_member in current_belong_members:
                if current_belong_member not in belong_members:
                  release_members.append(current_belong_member)

              # 子グループのトップフラグを更新
              GroupUtils.updateBelongMembersTopGroupFlag(self, UcfUtil.getHashStr(vo, 'group_id'), belong_members, 'REMOVE', operator_id=login_operator_id)
              # 今回このグループからメンバー解除されたグループのトップフラグ更新
              GroupUtils.updateBelongMembersTopGroupFlag(self, UcfUtil.getHashStr(vo, 'group_id'), release_members, 'SET', operator_id=login_operator_id)

              # 登録、更新処理（※トランザクションは制約やデメリットが多いので使用しない）
              if not is_skip:
                entry.put()

                # オペレーションログ出力
                operation_log_detail = {}
                if edit_type == UcfConfig.EDIT_TYPE_RENEW:
                  operation_log_detail['fields'] = diff_for_operation_log
                UCFMDLOperationLog.addLog(login_operator_mail_address, login_operator_unique_id, UcfConfig.SCREEN_GROUP, UcfConfig.OPERATION_TYPE_ADD if edit_type == UcfConfig.EDIT_TYPE_NEW else UcfConfig.OPERATION_TYPE_MODIFY, vo.get('group_id', ''), vo.get('unique_id', ''), login_operator_client_ip, JSONEncoder().encode(operation_log_detail), is_async=True)

                deal_type = edit_type
              else:
                deal_type = UcfConfig.EDIT_TYPE_SKIP

            # 入力エラーがあれば
            else:
              code = '100'
              for key, value in vc.msg.iteritems():
                #row_log_msg.extend(value)
                row_log_msg.extend(['[' + key + ']' + msg for msg in value])

    except BaseException, e:
      self.outputErrorLog(e)
      code = '500'
      row_log_msg.append(self._formatLogRecord('system error.'))

    # エラーメッセージ処理
    if code != '':
      #row_log_msg.append(self._formatLogRecord('[row:' + UcfUtil.nvl(record_cnt) + ',code=' + code + ']'))
      row_log_msg.insert(0, self._formatLogRecord('[row:' + UcfUtil.nvl(record_cnt) + ',code=' + code + ']'))
    return deal_type, code, row_log_msg


  ############################################################
  # 一行インポート：ユーザー
  ############################################################
  # def importOneRecordUser(self, csv_record, record_cnt, blob_key, data_key, data_kind, login_operator_unique_id, login_operator_id, login_operator_mail_address, login_operator_client_ip, login_operator_entry):
  #
  #   titles = UserUtils.getCsvTitles(self)
  #
  #   code = ''
  #   row_log_msg = []
  #   entry_vo = None
  #   edit_type = ''
  #   deal_type = ''
  #
  #   try:
  #
  #     # CSVチェック
  #     vc = UserCsvValidator()
  #     vc.validate(self, csv_record)
  #     # 入力エラーがあれば
  #     if vc.total_count > 0:
  #       code = '100'
  #       for title in titles:
  #         if vc.msg.has_key(title):
  #           #row_log_msg.extend(vc.msg[title])
  #           row_log_msg.extend(['[' + title + ']' + msg for msg in vc.msg[title]])
  #
  #     if code == '':
  #       command = UcfUtil.getHashStr(csv_record, 'command')
  #       user_id = UcfUtil.getHashStr(csv_record, 'user_id')
  #
  #       q = sateraito_db.User.query()
  #       q = q.filter(sateraito_db.User.user_id_lower == user_id.lower())
  #       key = q.get(keys_only=True)
  #       entry = key.get() if key is not None else None
  #
  #       # 委託管理者の場合は自分がアクセスできるカテゴリかをチェック
  #       if entry is not None and ucffunc.isDelegateOperator(login_operator_entry) and not ucffunc.isDelegateTargetManagementGroup(entry.management_group, login_operator_entry.delegate_management_groups if login_operator_entry is not None else None):
  #         code = '400'
  #         row_log_msg.append(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
  #       else:
  #         vo = {}
  #         # 削除処理の場合
  #         if command == 'D':
  #           if entry is None:
  #             code = '400'
  #             row_log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA'))))
  #           else:
  #             edit_type = UcfConfig.EDIT_TYPE_DELETE
  #             entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
  #
  #         # 新規登録の場合
  #         elif command == 'I':
  #           if entry is not None:
  #             code = '400'
  #             row_log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_VC_ALREADY_EXIST'))))
  #           else:
  #             edit_type = UcfConfig.EDIT_TYPE_NEW
  #             UserUtils.editVoForDefault(self, vo)
  #             # csv_dataからマージ
  #             UserUtils.margeVoFromCsvRecord(self, vo, csv_record, login_operator_entry)
  #             UserUtils.editVoForSelectCsvImport(self, vo)		# データ加工（取得用）
  #
  #         # 編集の場合
  #         elif command == 'U':
  #           if entry is None:
  #             code = '400'
  #             row_log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA'))))
  #           else:
  #             edit_type = UcfConfig.EDIT_TYPE_RENEW
  #             entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
  #             UserUtils.editVoForSelect(self, entry_vo, is_with_parent_group_info=False)		# データ加工（取得用）
  #             UcfUtil.margeHash(vo, entry_vo)									# 既存データをVoにコピー
  #             # csv_dataからマージ
  #             UserUtils.margeVoFromCsvRecord(self, vo, csv_record, login_operator_entry)
  #             UserUtils.editVoForSelectCsvImport(self, vo)		# データ加工（取得用）
  #
  #         # 新規 or 編集の場合
  #         elif command == 'IU':
  #           if entry is not None:
  #             edit_type = UcfConfig.EDIT_TYPE_RENEW
  #             entry_vo = entry.exchangeVo(self._timezone)										# 既存データをVoに変換
  #             UserUtils.editVoForSelect(self, entry_vo, is_with_parent_group_info=False)		# データ加工（取得用）
  #             UcfUtil.margeHash(vo, entry_vo)									# 既存データをVoにコピー
  #           else:
  #             edit_type = UcfConfig.EDIT_TYPE_NEW
  #           # csv_dataからマージ
  #           UserUtils.margeVoFromCsvRecord(self, vo, csv_record, login_operator_entry)
  #           UserUtils.editVoForSelectCsvImport(self, vo)		# データ加工（取得用）
  #
  #         ########################
  #         # 削除
  #         if edit_type == UcfConfig.EDIT_TYPE_DELETE:
  #           # このユーザを所属メンバーに持つグループからメンバーを削除
  #           GroupUtils.removeOneMemberFromBelongGroups(self, UcfUtil.getHashStr(entry_vo, 'user_id_lower'), operator_id=login_operator_id)
  #           # このユーザを所属メンバーに持つ組織からメンバーを削除
  #           # OrgUnitUtils.removeMemberFromBelongOrgUnits(self, [UcfUtil.getHashStr(entry_vo, 'user_id_lower')], None, operator_id=login_operator_id)
  #           # 削除（※トランザクションは制約やデメリットが多いので使用しない）
  #
  #           sateraito_db.User.removeUserFromIndex([entry.unique_id])
  #           entry.key.delete()
  #
  #           # ユーザー数キャッシュをクリア
  #           sateraito_db.User.clearActiveUserAmountCache(self._tenant)
  #           # オペレーションログ出力
  #           UCFMDLOperationLog.addLog(login_operator_mail_address, login_operator_unique_id, UcfConfig.SCREEN_USER, UcfConfig.OPERATION_TYPE_REMOVE, entry_vo.get('user_id', ''), entry_vo.get('unique_id', ''), login_operator_client_ip, '', is_async=True)
  #           deal_type = edit_type
  #
  #         # 更新、新規
  #         elif edit_type == UcfConfig.EDIT_TYPE_NEW or edit_type == UcfConfig.EDIT_TYPE_RENEW:
  #
  #           # 入力チェック
  #           vc = UserValidator(edit_type, ucffunc.isDelegateOperator(login_operator_entry), login_operator_entry.delegate_management_groups if login_operator_entry is not None else None)
  #           vc.validate(self, vo)
  #
  #           # 入力エラーがなければ登録処理
  #           if vc.total_count <= 0:
  #
  #             # オペレーションログ詳細用に更新フィールドを取得（加工前に比較しておく）
  #             if edit_type == UcfConfig.EDIT_TYPE_NEW:
  #               is_diff = True
  #               diff_for_operation_log = []
  #             else:
  #               is_diff, diff_for_operation_log = UserUtils.isDiff(self, vo, entry_vo)
  #             # 差分があるかを判定
  #             is_skip = not is_diff
  #
  #             # 加工データ
  #             UserUtils.editVoForRegist(self, vo, entry_vo, edit_type)
  #             # 新規登録場合モデルを新規作成
  #             if edit_type == UcfConfig.EDIT_TYPE_NEW:
  #               unique_id = UcfUtil.guid()
  #               vo['unique_id'] = unique_id
  #               entry = sateraito_db.User(unique_id=unique_id,id=UserUtils.getKey(self, vo))
  #             #logging.info('vo=' + str(vo))
  #             # Voからモデルにマージ
  #             #logging.info(vo)
  #             entry.margeFromVo(vo, self._timezone)
  #             # 更新日時、更新者の更新
  #             entry.updater_name = login_operator_id
  #             entry.date_changed = UcfUtil.getNow()
  #
  #             # 新規登録場合ユニークＩＤを生成
  #             if edit_type == UcfConfig.EDIT_TYPE_NEW:
  #               # 作成日時、作成者の更新
  #               entry.creator_name = login_operator_id
  #               entry.date_created = UcfUtil.getNow()
  #
  #             # 登録、更新処理（※トランザクションは制約やデメリットが多いので使用しない）
  #             if not is_skip:
  #               entry.put()
  #
  #               # オペレーションログ出力
  #               operation_log_detail = {}
  #               if edit_type == UcfConfig.EDIT_TYPE_RENEW:
  #                 operation_log_detail['fields'] = diff_for_operation_log
  #               UCFMDLOperationLog.addLog(login_operator_mail_address, login_operator_unique_id, UcfConfig.SCREEN_USER, UcfConfig.OPERATION_TYPE_ADD if edit_type == UcfConfig.EDIT_TYPE_NEW else UcfConfig.OPERATION_TYPE_MODIFY, vo.get('user_id', ''), vo.get('unique_id', ''), login_operator_client_ip, JSONEncoder().encode(operation_log_detail), is_async=True)
  #
  #               deal_type = edit_type
  #
  #               # ユーザー数キャッシュをクリア
  #               if edit_type == UcfConfig.EDIT_TYPE_NEW:
  #                 sateraito_db.User.clearActiveUserAmountCache(self._tenant)
  #
  #               ## UserEntryにレコード追加
  #               #sateraito_func.addUpdateUserEntryTaskQueue(self._tenant, entry)
  #
  #             else:
  #               deal_type = UcfConfig.EDIT_TYPE_SKIP
  #
  #           # 入力エラーがあれば
  #           else:
  #             code = '100'
  #             for key, value in vc.msg.iteritems():
  #               #row_log_msg.extend(value)
  #               row_log_msg.extend(['[' + key + ']' + msg for msg in value])
  #
  #   except BaseException, e:
  #     self.outputErrorLog(e)
  #     code = '500'
  #     row_log_msg.append(self._formatLogRecord('system error.'))
  #
  #   # エラーメッセージ処理
  #   if code != '':
  #     #row_log_msg.append(self._formatLogRecord('[row:' + UcfUtil.nvl(record_cnt) + ',code=' + code + ']'))
  #     row_log_msg.insert(0, self._formatLogRecord('[row:' + UcfUtil.nvl(record_cnt) + ',code=' + code + ']'))
  #   return deal_type, code, row_log_msg

  ############################################################
  # 一行インポート：ユーザーID一括変更
  ############################################################
  # def importOneRecordChangeUserID(self, csv_record, record_cnt, blob_key, data_key, data_kind, login_operator_unique_id, login_operator_id, login_operator_mail_address, login_operator_client_ip, login_operator_entry):
  #
  #   titles = UserUtils.getChangeUserIDCsvTitles(self)
  #
  #   code = ''
  #   row_log_msg = []
  #   entry_vo = None
  #   deal_type = ''
  #
  #   try:
  #
  #     # CSVチェック
  #     vc = ChangeUserIDCsvValidator()
  #     vc.validate(self, csv_record)
  #     # 入力エラーがあれば
  #     if vc.total_count > 0:
  #       code = '100'
  #       for title in titles:
  #         if vc.msg.has_key(title):
  #           #row_log_msg.extend(vc.msg[title])
  #           row_log_msg.extend(['[' + title + ']' + msg for msg in vc.msg[title]])
  #
  #     if code == '':
  #       user_id = UcfUtil.getHashStr(csv_record, 'user_id')
  #
  #       q = sateraito_db.User.query()
  #       q = q.filter(sateraito_db.User.user_id_lower == user_id.lower())
  #       key = q.get(keys_only=True)
  #       entry = key.get() if key is not None else None
  #
  #       # 委託管理者の場合は自分がアクセスできるカテゴリかをチェック
  #       if entry is not None and ucffunc.isDelegateOperator(login_operator_entry) and not ucffunc.isDelegateTargetManagementGroup(entry.management_group, login_operator_entry.delegate_management_groups if login_operator_entry is not None else None):
  #         code = '400'
  #         row_log_msg.append(UcfMessage.getMessage(self.getMsg('MSG_INVALID_ACCESS_BY_DELEGATE_MANAGEMENT_GROUPS')))
  #       else:
  #
  #         if entry is None:
  #           code = '400'
  #           row_log_msg.append(self._formatLogRecord(UcfMessage.getMessage(self.getMsg('MSG_NOT_EXIST_DATA'))))
  #         else:
  #
  #           src_user_id = user_id
  #           dst_user_id = csv_record.get('new_user_id', '')
  #
  #           # １アカウントの情報を更新
  #           result_code, result_msg, result_vcmsg, vo = UserUtils.changeOneUserID(self, src_user_id, dst_user_id, entry, ucffunc.isDelegateOperator(login_operator_entry), login_operator_entry.delegate_management_groups if login_operator_entry is not None else None, record_cnt=record_cnt, is_direct_taskprocess=True, login_operator_id='')
  #           if result_code != 0:
  #             code = str(result_code)
  #             if result_msg != '':
  #               row_log_msg.append(result_msg)
  #             if result_vcmsg is not None:
  #               for key, value in result_vcmsg.iteritems():
  #                 #row_log_msg.extend(value)
  #                 row_log_msg.extend(['[' + key + ']' + msg for msg in value])
  #           else:
  #             deal_type = UcfConfig.EDIT_TYPE_RENEW
  #             # ユーザーID一括変更処理はデリケートなので成功しても行ごとにログを出すようにする
  #             row_log_msg.append(self._formatLogRecord('[row:' + UcfUtil.nvl(record_cnt) + ']' + UcfMessage.getMessage(self.getMsg('LOG_CHANGEID'), (src_user_id, dst_user_id))))
  #             if result_msg != '':
  #               row_log_msg.append(result_msg)
  #             if result_vcmsg is not None:
  #               for key, value in result_vcmsg.iteritems():
  #                 #row_log_msg.extend(value)
  #                 row_log_msg.extend(['[' + key + ']' + msg for msg in value])
  #
  #             # オペレーションログ出力
  #             operation_log_detail = {}
  #             operation_log_detail['fields'] = [{'key':'user_id', 'before':src_user_id, 'after':dst_user_id}]
  #             UCFMDLOperationLog.addLog(login_operator_mail_address, login_operator_unique_id, UcfConfig.SCREEN_USER, UcfConfig.OPERATION_TYPE_CHANGEID, vo.get('user_id', ''), vo.get('unique_id', ''), login_operator_client_ip, JSONEncoder().encode(operation_log_detail), is_async=True)
  #
  #
  #   except BaseException, e:
  #     self.outputErrorLog(e)
  #     code = '500'
  #     row_log_msg.append(self._formatLogRecord('system error.'))
  #
  #   # エラーメッセージ処理
  #   if code != '':
  #     #row_log_msg.append(self._formatLogRecord('[row:' + UcfUtil.nvl(record_cnt) + ',code=' + code + ']'))
  #     row_log_msg.insert(0, self._formatLogRecord('[row:' + UcfUtil.nvl(record_cnt) + ',code=' + code + ']'))
  #   return deal_type, code, row_log_msg


#app = webapp2.WSGIApplication([('/a/([^/]*)/([^/]*)/queue_csv_import', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config)
app = ndb.toplevel(webapp2.WSGIApplication([('/a/([^/]*)/([^/]*)/queue_csv_import', Page)], debug=sateraito_inc.debug_mode, config=sateraito_func.wsgi_config))

