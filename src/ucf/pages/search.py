# coding: utf-8

import webapp2,logging,time
import gc
from simplejson.encoder import JSONEncoder
from simplejson.decoder import JSONDecoder
import unicodedata
from google.appengine.api import search
from google.appengine.api import runtime
from ucf.utils.validates import BaseValidator
from ucf.utils.helpers import *
#from ucf.utils.models import *
from ucf.pages.task import TaskChangeIDUtils
import sateraito_inc
import sateraito_func
import sateraito_db
import oem_func

############################################################
## ユーザーテーブル用メソッド
############################################################
class SearchUtils():

    # チェックボックス値補正（TODO 本来はフロントからPOSTするようにExtJsなどで処理すべきが取り急ぎ）
    def setNotPostValue(cls, helper, req):
        # チェックボックス項目
        cbx_fields = [
        ]
        for field in cbx_fields:
            if not req.has_key(field[0]):
                req[field[0]] = field[1]
    setNotPostValue = classmethod(setNotPostValue)

    # 初期値用：データ加工
    def editVoForDefault(cls, helper, vo):
        pass
    editVoForDefault = classmethod(editVoForDefault)

    # 取得用：データ加工
    def editVoForSelect(cls, helper, vo):

        vo['content_short'] = UcfUtil.getHashStr(vo, 'content')

    editVoForSelect = classmethod(editVoForSelect)

    # 取得用：データ加工（一覧用）
    def editVoForList(cls, helper, vo):
        pass
    editVoForList = classmethod(editVoForList)

    # 取得用：データ加工（CSV用）
    def editVoForCsv(cls, helper, vo):
        pass
    editVoForCsv = classmethod(editVoForCsv)

    # 取得用：データ加工（CSVインポート時の取得）
    def editVoForSelectCsvImport(cls, helper, vo):
        SearchUtils.editVoForCsv(helper, vo)
    editVoForSelectCsvImport = classmethod(editVoForSelectCsvImport)


    # 更新用：データ加工
    def editVoForRegist(cls, helper, vo, entry_vo, edit_type, is_noupdate_password_change_date_for_sync=False):
        vo['search_name_lower'] = UcfUtil.getHashStr(vo, 'search_name').lower()												# 小文字
    editVoForRegist = classmethod(editVoForRegist)

    # 既存データを取得
    def getData(cls, helper, unique_id):
        return SearchUtils.getSearchEntryByUniqueID(helper, unique_id)
    getData = classmethod(getData)

    # キーに使用する値を取得
    def getKey(cls, helper, vo):
        return UcfConfig.KEY_PREFIX + UcfUtil.getHashStr(vo, 'unique_id')
    getKey = classmethod(getKey)


    # コピー新規用に不要なデータをvoから削除
    def removeFromVoForCopyRegist(cls, helper, vo):
        vo['unique_id'] = ''
        vo['date_created'] = ''
        vo['date_changed'] = ''
        vo['creator_name'] = ''
        vo['updater_name'] = ''
    removeFromVoForCopyRegist = classmethod(removeFromVoForCopyRegist)

    # ユニークIDからユーザVoを取得
    def getSearchByUniqueID(cls, helper, search_unique_id):
        search_vo = None
        if search_unique_id and search_unique_id != '':
            entry = SearchUtils.getSearchEntryByUniqueID(helper, search_unique_id)
            if entry is not None:
                search_vo = entry.exchangeVo(helper._timezone)
                SearchUtils.editVoForSelect(helper, search_vo)
        return search_vo
    getSearchByUniqueID = classmethod(getSearchByUniqueID)

    # ユニークIDからユーザEntryを取得
    def getSearchEntryByUniqueID(cls, helper, search_unique_id):
        entry = None
        if search_unique_id and search_unique_id != '':
            query = sateraito_db.SearchList.query()
            query = query.filter(sateraito_db.SearchList.unique_id == search_unique_id)
            key = query.get(keys_only=True)
            entry = key.get() if key is not None else None
        return entry
    getSearchEntryByUniqueID = classmethod(getSearchEntryByUniqueID)


    # ２つのVOに変更点があるかどうかを判定
    def isDiff(cls, helper, vo1, vo2):
        is_diff = False
        diff_for_operation_log = []	# オペレーションログに出力する情報のため、keyはユーザーライクにCSV項目と合わせる（出力不要項目の場合はセットしない）

        key = 'search_name'		#
        if vo1.get(key, '') != vo2.get(key, ''):
            diff_for_operation_log.append({'key':'search_name', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
            is_diff = True

        key = 'search_config'		#
        if vo1.get(key, '') != vo2.get(key, ''):
            diff_for_operation_log.append({'key':'search_config', 'before':vo2.get(key, ''), 'after':vo1.get(key, '')})
            is_diff = True

        return is_diff, diff_for_operation_log
    isDiff = classmethod(isDiff)

    # エクスポート用CSVを作成
    def createCsv(cls, helper, login_operator_entry=None):
        with_cursor = True
        csv_records = []
        # タイトル
        titles = SearchUtils.getCsvTitles(helper)
        csv_records.append(UcfUtil.createCsvRecordEx(titles))

        # データ一覧取得
        q = sateraito_db.SearchList.query()
        q = q.order(sateraito_db.SearchList.search_name)
        logging.info('with_cursor=' + str(with_cursor))

        max_export_cnt = -1
        cnt = 0
        limit = 1000					# 通常の、max_export_cnt == 1000 のドメインは1発で取れたほうがいいはずなので 1000 とする
        start_cursor = None
        while True:

            if with_cursor:
                if start_cursor is not None:
                    each_rows, start_cursor, more = q.fetch_page(limit, start_cursor=start_cursor)
                else:
                    each_rows, start_cursor, more = q.fetch_page(limit)
            else:
                each_rows = q.iter(limit=limit, offset=cnt)

            each_cnt = 0
            for entry in each_rows:

                vo = entry.exchangeVo(helper._timezone)
                SearchUtils.editVoForCsv(helper, vo)

                data = []
                data.append('IU')	# command
                data.append(UcfUtil.getHashStr(vo, 'search_name')) # search_name
                data.append(UcfUtil.getHashStr(vo, 'search_config')) # search_config

                csv_records.append(UcfUtil.createCsvRecordEx(data))
                each_cnt += 1

                vo = None
                entry = None
                if each_cnt % 100 == 0:
                    gc.collect()

            cnt += each_cnt
            logging.info(cnt)

            # 件数上限
            if with_cursor:
                if cnt >= max_export_cnt or not more:
                    break
            else:
                if (max_export_cnt > 0 and cnt >= max_export_cnt) or each_cnt < limit:
                    break

        csv_text = '\r\n'.join(csv_records)

        current_memory_usage = runtime.memory_usage().current()
        gc.collect()
        current_memory_usage_after_collect = runtime.memory_usage().current()
        logging.info('current_memory_usage=' + str(current_memory_usage) + ' after_collect=' + str(current_memory_usage_after_collect))

        return csv_text
    createCsv = classmethod(createCsv)

    # csv_dataからマージ＆整備（editVoForSelectしてない生のvoにマージ）
    def margeVoFromCsvRecord(cls, helper, vo, csv_record, login_operator_entry):
        if csv_record.has_key('search_name'):
            vo['search_name'] = csv_record['search_name']
        if csv_record.has_key('search_config'):
            vo['search_config'] = csv_record['search_config'].strip()

    margeVoFromCsvRecord = classmethod(margeVoFromCsvRecord)

    def getCsvTitles(cls, helper):
        return ['command','search_name','search_config']
    getCsvTitles = classmethod(getCsvTitles)


############################################################
## バリデーションチェッククラス 
############################################################
class SearchValidator(BaseValidator):

    def validate(self, helper, vo):

        # 初期化
        self.init()
        # チェック TODO 未対応項目に対応

        check_name = ''
        check_key = ''
        check_value = ''

        ########################
        # ユーザID
        check_name = helper.getMsg('FLD_SEARCH_NAME')
        check_key = 'search_name'
        check_value = UcfUtil.getHashStr(vo, check_key)
        # 必須チェック
        if not self.needValidator(check_value):
            self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
        # 半角チェック
        # if not self.hankakuValidator(check_value):
        # 	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_HANKAKU'), (check_name)))
        # 半角スペースもはじく 2017.01.23
        # if check_value.find(' ') >= 0:
        # 	self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_INVALID_SPACE'), (check_name)))
        # 最大長チェック
        if not self.maxLengthValidator(check_value, 255):
            self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MAXLENGTH'), (check_name, 255)))


############################################################
## バリデーションチェッククラス：CSV用（レコードとしてのチェックはその後行う）
############################################################
class SearchCsvValidator(BaseValidator):

    def validate(self, helper, vo):

        # 初期化
        self.init()

        check_name = ''
        check_key = ''
        check_value = ''

        ########################
        # まず必須項目チェック
        # command
        check_key = 'command'
        check_name = check_key
        check_value = UcfUtil.getHashStr(vo, check_key)
        if not self.needValidator(check_value):
            self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))
        # name
        check_key = 'search_name'
        check_name = check_key
        check_value = UcfUtil.getHashStr(vo, check_key)
        if not self.needValidator(check_value):
            self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_NEED'), (check_name)))

        #######################
        # 項目チェック（CSVカラムがある場合のみ）
        # command
        check_key = 'command'
        check_name = check_key
        if vo.has_key(check_key):
            # 候補
            check_value = UcfUtil.getHashStr(vo, check_key)
            if not self.listPatternValidator(check_value, ['I','U','D','IU']):
                self.appendValidate(check_key, UcfMessage.getMessage(helper.getMsg('MSG_VC_MATCHING'), (check_name,'I,U,D,IU')))



############################################################
## ビューヘルパー
############################################################
class SearchViewHelper(ViewHelper):

    def applicate(self, vo, helper):
        voVH = {}

        # ここで表示用変換を必要に応じて行うが、原則Djangoテンプレートのフィルタ機能を使う
        for k,v in vo.iteritems():
            if k == 'language':
                voVH[k] = helper.getMsg(sateraito_func.LANGUAGES_MSGID.get(v, 'VMSG_LANG_DEFAULT'))
            else:
                voVH[k] = v

        return voVH
