/**
 * Created by THANG NGUYEN (tan@vn.sateraito.co.jp) on 2015/02/05.
 * Updated: 2015-11-20
 */
$(function () {
  var DEFAULT_CONDITION = "0#:::,:::,:::,:::,:::,:::,:::,:::,:::,:::";
  var vbCrLf = '<br>';
  var BUTTON_TYPE_SELECT = 5;                             // ボタン設定画面（追加）
  var BUTTON_TYPE_SELECT_DEP = 6;                         // ボタン設定画面（追加部署指定）
  var BUTTON_TYPE_DEL = 7;                                // ボタン設定画面（削除）
  var BUTTON_TYPE_OPEN_NOTIFICATION = 'ButtonTypeOpenNotification';                  // ボタン設定画面（開封通知）

  var ApproveConditionManager = function () {
    var me = this;
    me.sConditionString = '';                 // 条件文字列（エクセルセルの条件文字列ソース）
    me.sConditionBasicString = '';             // 全体条件'
    me.sConditionPriority = '';                // 条件優先フラグ（0:|でつなげる 1:%でつなげる）
    me.sConditionListString = '';                               // 条件文字列リスト（条件文字列をカンマ区切りで繋げた文字列）
    me.sConditionList = me.createArrayString(9);                 // 条件文字列リスト（条件文字列をカンマ区切りで繋げた文字列）を配列化
    me.sCondition = '';                                           // 条件文字列（:区切りのソースデータ）
    me.sConditionType = '';                                      // 【条件文字列01】条件タイプ 空:初期値　0:承認者指定　1:部署、役職指定　2:申請者と同じ部署を指定
    me.sConditionField = '';                                      // 【条件文字列02】条件指定するフィールド名（条件タイプ＝１の時に利用する）
    me.sConditionValue = '';                                     // 【条件文字列03】条件の値 条件タイプ＝1,3ではインデックス、条件タイプ2ではテキスト
    me.sConditionConnect = '';                                   // 【条件文字列04】条件の接続 0:または 1:かつ
    me.sConditionBoss = me.createArrayString(19);                 // 承認者１～２０の定数リスト
    me.sConditionFieldText = me.createArrayString(9);            // 部署、役職の定数リスト（条件タイプ＝2で利用）
    me.sConditionSameDepartment = me.createArrayString(4);      // 部署の定数リスト（条件タイプ＝3で利用）
    me.sConditionRelativeDoc = me.createArrayString(2);
    me.sConditionRelativeDocHtml = me.createArrayString(2);
    me.sConditionDocAuthor = me.createArrayString(0);
    me.sConditionDocAuthorHtml = me.createArrayString(0);
    me.sConditionBossHtml = me.createArrayString(19);            // 承認者１～２０のHTML定数リスト
    me.sConditionFieldTextHtml = me.createArrayString(9);      // 部署、役職のHTML定数リスト（条件タイプ＝2で利用）
    me.sConditionSameDepartmentHtml = me.createArrayString(4); // 部署の定数HTMLリスト（条件タイプ＝3で利用）
    me.iConditionIndex = 0;                                      // 処理対象の条件インデックス 0～
    me.iConditionCount = 0;                                      // 条件登録数
  };

  ApproveConditionManager.prototype.createArrayString = function (length) {
    var arr = new Array();
    for (var i = 0; i <= length; i++) {
      arr.push('');
    }
    return arr;
  };

  ApproveConditionManager.prototype.Init = function (sNewConditionListString) {
    var me = this;
//    me.sConditionListString = sNewConditionListString;

    // 条件文字列の取得
    me.sConditionString = sNewConditionListString;
    if (me.sConditionString == ""){
      me.sConditionString = DEFAULT_CONDITION;
    }

    // 全体条件と個別条件の分割
    var temp = me.sConditionString.split("#");
    if(temp.length === 2) {
      me.sConditionBasicString = temp[0];
      me.sConditionListString = temp[1];
    }else{
      me.sConditionListString = temp[0];
    }

    // 条件接続タイプ
    me.sConditionPriority = me.sConditionBasicString;

    // 条件文字列リスト
    var temp = me.sConditionListString.split(","), i;
    for (i = 0; i < temp.length; i++) {
      me.sConditionList[i] = temp[i];
    }
    // 定数定義
    for (i = 0; i <= 19; i++) {
      // note: (i+1) 1byte. convert to 2 byte
      me.sConditionBoss[i] = MyLang.getMsg("USERINFO_BOSS_EMAIL") + (i + 1);
    }

    me.sConditionFieldText[0] = MyLang.getMsg("USERINFO_EMAIL");
    me.sConditionFieldText[1] = MyLang.getMsg("USERINFO_FAMILY_NAME");
    me.sConditionFieldText[2] = MyLang.getMsg("USERINFO_GIVEN_NAME");
    me.sConditionFieldText[3] = MyLang.getMsg("USERINFO_DEPARTMENT_1");
    me.sConditionFieldText[4] = MyLang.getMsg("USERINFO_DEPARTMENT_2");
    me.sConditionFieldText[5] = MyLang.getMsg("USERINFO_DEPARTMENT_3");
    me.sConditionFieldText[6] = MyLang.getMsg("USERINFO_DEPARTMENT_4");
    me.sConditionFieldText[7] = MyLang.getMsg("USERINFO_DEPARTMENT_5");
    me.sConditionFieldText[8] = MyLang.getMsg("USERINFO_JOB_TITLE");
    me.sConditionFieldText[9] = MyLang.getMsg("USERINFO_PRIORITY");

    me.sConditionSameDepartment[0] = MyLang.getMsg("USERINFO_DEPARTMENT_1");
    me.sConditionSameDepartment[1] = MyLang.getMsg("USERINFO_DEPARTMENT_2");
    me.sConditionSameDepartment[2] = MyLang.getMsg("USERINFO_DEPARTMENT_3");
    me.sConditionSameDepartment[3] = MyLang.getMsg("USERINFO_DEPARTMENT_4");
    me.sConditionSameDepartment[4] = MyLang.getMsg("USERINFO_DEPARTMENT_5");


    me.sConditionRelativeDoc[0] = MyLang.getMsg("USERINFO_RELATIVE_DOC_1");
    me.sConditionRelativeDoc[1] = MyLang.getMsg("USERINFO_RELATIVE_DOC_2");
    me.sConditionRelativeDoc[2] = MyLang.getMsg("USERINFO_RELATIVE_DOC_3");


    me.sConditionDocAuthor[0] = MyLang.getMsg("USERINFO_DOC_AUTHOR");

    // 定数定義(HTML)
    for (i = 0; i <= 19; i++) {
      me.sConditionBossHtml[i] = "boss_email_" + (i + 1)
    }

    me.sConditionFieldTextHtml[0] = "email";
    me.sConditionFieldTextHtml[1] = "family_name";
    me.sConditionFieldTextHtml[2] = "given_name";
    me.sConditionFieldTextHtml[3] = "department_1";
    me.sConditionFieldTextHtml[4] = "department_2";
    me.sConditionFieldTextHtml[5] = "department_3";
    me.sConditionFieldTextHtml[6] = "department_4";
    me.sConditionFieldTextHtml[7] = "department_5";
    me.sConditionFieldTextHtml[8] = "job_title";
    me.sConditionFieldTextHtml[9] = "job_title_not";

    me.sConditionSameDepartmentHtml[0] = "department_1:__submitter_department_1";
    me.sConditionSameDepartmentHtml[1] = "department_2:__submitter_department_2";
    me.sConditionSameDepartmentHtml[2] = "department_3:__submitter_department_3";
    me.sConditionSameDepartmentHtml[3] = "department_4:__submitter_department_4";
    me.sConditionSameDepartmentHtml[4] = "department_5:__submitter_department_5";


    me.sConditionRelativeDocHtml[0] = "relative_doc_approvers:";
    me.sConditionRelativeDocHtml[1] = "relative_doc_approver_candidates:";
    me.sConditionRelativeDocHtml[2] = "relative_doc_author";

    me.sConditionDocAuthorHtml[0] = "doc_author";


    // 条件登録数の更新
    me.ConditionCountUp();
  };

  ApproveConditionManager.prototype.SetConditoinIndex = function (iIndex) {

    var me = this;
    me.iConditionIndex = iIndex;
    me.SetConditoinData(me.iConditionIndex);

  };
  ApproveConditionManager.prototype.SetConditoinData = function (iIndex) {

    // 条件文字列の取得
    var me = this, sConditionData = me.createArrayString(4), i , temp;
    me.sCondition = me.sConditionList[iIndex];
    temp = me.sCondition.split(":");
    for (i = 0; i < temp.length; i++) {
      sConditionData[i] = temp[i];
    }

    me.sConditionType = sConditionData[0];
    me.sConditionField = sConditionData[1];
    me.sConditionValue = sConditionData[2];
    me.sConditionConnect = sConditionData[3];

  };

  ApproveConditionManager.prototype.GetConditionBoss = function (Index) {
    var me = this;
    // 承認者の定数出力
    return me.sConditionBoss[Index];
  };
  ApproveConditionManager.prototype.GetConditionFieldName = function (Index) {
    var me = this;
    // 部署、役職の定数出力
    return me.sConditionFieldText[Index];
  };

  ApproveConditionManager.prototype.GetConditionSameDepartment = function (Index) {
    var me = this;
    // 部署の定数出力
    return me.sConditionSameDepartment[Index];
  };

  ApproveConditionManager.prototype.GetConditionRelativeDoc = function (Index) {
    var me = this;
    // 部署の定数出力
    return me.sConditionRelativeDoc[Index];
  };

  ApproveConditionManager.prototype.GetConditionDocAuthor = function (Index) {
    var me = this;
    // 部署の定数出力
    return me.sConditionDocAuthor[Index];
  };

  ApproveConditionManager.prototype.GetConditionExp = function () {
    var me = this, strResult = "";
    switch (me.sConditionType) {
      case "":
        strResult = "";
        break;
      case "0":
        strResult = me.sConditionBoss[parseInt(me.sConditionValue)];
        break;
      case "1":
        strResult = me.sConditionFieldText[parseInt(me.sConditionField)] + " = " + me.sConditionValue;
        break;
      case "2":
        strResult = MyLang.getMsg("APPROVE_COND_EXP_1") + me.sConditionSameDepartment[parseInt(me.sConditionValue)] + MyLang.getMsg("APPROVE_COND_EXP_2");
        break;
      case "3":
        strResult = me.sConditionRelativeDoc[parseInt(me.sConditionField)].replace('%1', me.sConditionValue);
        break;
      case "4":
        strResult = me.sConditionDocAuthor[parseInt(me.sConditionValue)];
        break;
    }
    return strResult;
  };

  ApproveConditionManager.prototype.GetConditionExp2 = function () {

    var me = this, strResult = "";
    switch (me.sConditionConnect) {

      case "":
        strResult = me.GetConditionExp();
        break;
      case "0":
        strResult = me.GetConditionExp() + " " +  MyLang.getMsg("OR_CONDITION");
        break;
      case "1":
        strResult = me.GetConditionExp() + " " + MyLang.getMsg("AND_CONDITION");
        break;
    }
    return strResult;
  };


  ApproveConditionManager.prototype.GetConditionExpBasic = function () {

    var me = this;
    if(me.sConditionPriority == "1") {
      return MyLang.getMsg("ORDER_OF_PRIORITY_SPECIFIED");
    }else {
      return "";
    }

  };

  ApproveConditionManager.prototype.ConditonString = function () {
    var me = this;
    // 条件文字列の出
    return me.sConditionString;
  };

  ApproveConditionManager.prototype.ConditonListString = function () {
    var me = this;
    // 条件リスト文字列の出力
    return me.sConditionListString;
  };

  ApproveConditionManager.prototype.ConditonType = function (NewConditionType) {
    var me = this;
    if (typeof NewConditionType === 'undefined') {
      // 条件タイプの出力
      return me.sConditionType;
    } else {
      // 条件タイプの入力
      me.sConditionType = NewConditionType;
      me.SetConditionString();
    }
  };

  ApproveConditionManager.prototype.ConditonField = function (NewConditionField) {
    var me = this;
    if (typeof NewConditionField === 'undefined') {
      // 条件フィールドの出力
      return me.sConditionField;
    } else {
      // 条件フィールドの入力
      me.sConditionField = NewConditionField;
      me.SetConditionString();
    }
  };

  ApproveConditionManager.prototype.ConditonValue = function (NewConditionValue) {
    var me = this;
    if (typeof NewConditionValue === 'undefined') {
      // 条件値の出力
      return me.sConditionValue;
    } else {
      // 条件値の入力
      me.sConditionValue = NewConditionValue;
      me.SetConditionString();
    }
  };

  ApproveConditionManager.prototype.ConditonConnect = function (NewConditionConnect) {
    var me = this;
    if (typeof NewConditionConnect === 'undefined') {
      // 条件値の出力
      return me.sConditionConnect;
    } else {
      // 条件値の入力
      me.sConditionConnect = NewConditionConnect;
      me.SetConditionString();
    }
  };

  ApproveConditionManager.prototype.ConditonCount = function () {
    var me = this;
    // 上件数の出力
    return me.iConditionCount;
  };

  ApproveConditionManager.prototype.ConditonPriority = function (NewConditionPriority) {
    var me = this;
    if(NewConditionPriority == undefined){
      // 条件優先フラグの出力
      return me.sConditionPriority;
    }else{
      // 条件優先フラグの入力
      me.sConditionPriority = NewConditionPriority;
      // 条件文字列リストの更新
      me.UpdateConditionListString();
    }
  };


  ApproveConditionManager.prototype.SetConditionString = function () {

    var me = this;
    // 条件リストの作成
    me.sCondition = me.sConditionType + ":" + me.sConditionField + ":" + me.sConditionValue + ":" + me.sConditionConnect;
    me.sConditionList[me.iConditionIndex] = me.sCondition;

    // 条件文字列リストの更新
    me.UpdateConditionListString();
  };

  ApproveConditionManager.prototype.ConditionCountUp = function () {
    var me = this, i;
    me.iConditionCount = 0;
    for (i = 0; i <= 9; i++) {
      me.SetConditoinData(i);
      if (me.sConditionType != "") {
        me.iConditionCount = me.iConditionCount + 1;
      }
    }

    // 念のため処理対象のインデックスでSetConditionDataを再実行しておく
    me.SetConditoinData(me.iConditionIndex);
  };

  ApproveConditionManager.prototype.DeleteCondition = function (Index) {

    var me = this, i;
    // 一番最後の条件を削除した場合はひとつ前の条件の接続子を削除する
    var sBeforeCondition;
    if (Index > 0) {
      if (Index == me.iConditionCount - 1) {
        sBeforeCondition = me.sConditionList[Index - 1];
        me.sConditionList[Index - 1] = sBeforeCondition.substring(0, sBeforeCondition.length - 1); // Left(sBeforeCondition, Len(sBeforeCondition) - 1)
      }
    }


    // 削除インデックス以降の条件は一つ繰り上げる
    for (i = 0; i <= 8; i++) {
      if (i >= Index) {
        me.sConditionList[i] = me.sConditionList[i + 1];
      }
    }
    me.sConditionList[9] = "";

    // 条件文字列リストの更新
    me.UpdateConditionListString();
  };

  ApproveConditionManager.prototype.UpdateConditionListString = function () {

    var me = this, i;
    // 条件文字列リストの更新
    me.sConditionListString = "";
    for (i = 0; i <= 9; i++) {
      if (me.sConditionList[i] == "") {
        me.sConditionListString = me.sConditionListString + ":::";
      } else {
        me.sConditionListString = me.sConditionListString + me.sConditionList[i];
      }
      if (i < 9) {
        me.sConditionListString = me.sConditionListString + ",";
      }
    }

    // 条件登録数の更新
    me.ConditionCountUp();

    // 条件文字列
    me.sConditionString = me.sConditionPriority + "#" + me.sConditionListString;

  };

  ApproveConditionManager.prototype.GetConditionHtml = function () {

    var me = this,
      sConditionHtml = '',
      sAllConditionHtml = '',
      i;

    // 設定条件数分ループ
    for (i = 0; i <= me.iConditionCount - 1; i++) {

      // 条件フラグの設定
      me.SetConditoinData(i);

      // 条件編集
      // 【条件文字列01】sConditionType 条件タイプ 空:初期値　0:承認者指定　1:部署、役職指定　2:申請者と同じ部署を指定
      // 【条件文字列02】sConditionField 条件指定するフィールド名（条件タイプ＝１の時に利用する）
      // 【条件文字列03】sConditionValue 条件の値 条件タイプ＝1,3ではインデックス、条件タイプ2ではテキスト
      // 【条件文字列04】sConditionConnect 条件の接続 0:または 1:かつ

      switch (me.sConditionType) {

        case "0":
          // 承認者指定
          sConditionHtml = me.sConditionBossHtml[parseInt(me.sConditionValue)];
          break;
        case "1":
          // 部署、役職指定
          sConditionHtml = me.sConditionFieldTextHtml[parseInt(me.sConditionField)] + ":" + me.sConditionValue;
          break;
        case "2":
          // 申請者と同じ部署を指定
          sConditionHtml = me.sConditionSameDepartmentHtml[parseInt(me.sConditionValue)];
          break;
        case "3":
          // step 6,7,8
          sConditionHtml = me.sConditionRelativeDocHtml[parseInt(me.sConditionField)] + me.sConditionValue;
          break;
        case "4":
          // step 9
          sConditionHtml = me.sConditionDocAuthorHtml[parseInt(me.sConditionValue)];
          break;
      }

      if (i < me.iConditionCount) {
        if (me.sConditionConnect.toString() == "0") {
          // または
          // sConditionHtml = sConditionHtml + "|";
          if (me.sConditionPriority == "1"){
            sConditionHtml = sConditionHtml + "%";
          }else {
            sConditionHtml = sConditionHtml + "|";
          }
        } else if (me.sConditionConnect.toString() == "1") {
          // かつ
          sConditionHtml = sConditionHtml + ";"
        }
      }

      // 全体HTMLに追加
      sAllConditionHtml = sAllConditionHtml + sConditionHtml;


    }

    return sAllConditionHtml;
  };

//  ApproveConditionManager.prototype.GetTargetUserList = function(sFilePath, sUserAddress){
//
//      '条件の対象となるユーザーを取得するメソッド
//      '条件リストをループしてユーザー情報を一括で取得するクエリを作成し、ユーザー情報を取得する
//      '承認者指定の場合は単純に条件指定できないので、先に対象ユーザーを取得したうえでemailを条件にして一括クエリを編集する
//      '承認者と同じ部署を指定の場合は単純に条件指定できないので、先に対象ユーザーを取得したうえで部署を条件にして一括クエリを編集する
//
//      Dim sConditionHtml As String
//      Dim sAllConditionHtml As String
//      Dim i As Integer
//      Dim UserDataManager As UserDataManager
//      Set UserDataManager = New UserDataManager
//      UserDataManager.Init (sFilePath)
//      Dim colResult As Collection
//      Dim varResult As Variant
//      Dim sWhere
//      Dim sBossEmail As String
//      Dim sDepartment As String
//      Dim sSQL As String
//
//
//      '設定条件数分ループ
//      For i = 0 To iConditionCount - 1
//
//          '条件フラグの設定
//          SetConditoinData (i)
//
//          '条件編集
//          '【条件文字列01】sConditionType 条件タイプ 空:初期値　0:承認者指定　1:部署、役職指定　2:申請者と同じ部署を指定
//          '【条件文字列02】sConditionField 条件指定するフィールド名（条件タイプ＝１の時に利用する）
//          '【条件文字列03】sConditionValue 条件の値 条件タイプ＝1,3ではインデックス、条件タイプ2ではテキスト
//          '【条件文字列04】sConditionConnect 条件の接続 0:または 1:かつ
//
//          Select Case sConditionType
//
//              Case "0"
//                  '承認者指定
//                  sSQL = "SELECT " & sConditionBossHtml(sConditionValue) & " FROM @TABLE@ WHERE email = '" & sUserAddress & "'"
//                  Set colResult = UserDataManager.GetUserData(sSQL)
//                  If colResult.Count > 0 Then
//                      varResult = colResult(1)
//                      sBossEmail = varResult(0)
//                  Else
//                      sBossEmail = "$$$$$$$$$$"
//                  End If
//                  sWhere = sWhere & "email = '" & sBossEmail & "' "
//
//              Case "1"
//                  '部署、役職指定
//                  sWhere = sWhere & sConditionFieldTextHtml(sConditionField) & " = '" & sConditionValue & "' "
//
//              Case "2"
//                  '申請者と同じ部署を指定
//                  sSQL = "SELECT department_" & CStr(Val(sConditionValue) + 1) & " FROM @TABLE@ WHERE email = '" & sUserAddress & "'"
//                  Set colResult = UserDataManager.GetUserData(sSQL)
//                  If colResult.Count > 0 Then
//                      varResult = colResult(1)
//                      sDepartment = varResult(0)
//                  Else
//                      sDepartment = "$$$$$$$$$$"
//                  End If
//                  sWhere = sWhere & "department_" & CStr(Val(sConditionValue) + 1) & " = '" & sDepartment & "' "
//
//
//          End Select
//
//          If i < iConditionCount Then
//
//              If sConditionConnect = "0" Then
//                  'または
//                  sWhere = sWhere & " OR "
//              ElseIf sConditionConnect = "1" Then
//                  'かつ
//                  sWhere = sWhere & " AND "
//              End If
//
//          End If
//
//
//
//      Next
//
//      'ユーザー情報の取得
//      sSQL = "SELECT email,family_name,given_name FROM @TABLE@ WHERE " & sWhere & " ORDER BY email "
//
//      Set GetTargetUserList = UserDataManager.GetUserData(sSQL)
//
//  End Function


  WindowOtherSetting = {
    defaultData: {
      ok_to_attachfile: {
        is_checked: false
      },
      ok_to_open_notification:{
        is_checked: false,
        display: '',
        value: ''
      },
      additional_filter:{
        is_checked: false,
        display: '',
        value: ''
      }
    },
    currentColumn: -1,
    close: function () {
      var win = Ext.getCmp('window_other_setting');
      if (win) {
        win.close();
      }
    },
    showWindow: function (aGrid, aRecord, aColumnIndex) {
      var win = Ext.getCmp('window_other_setting');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            id: 'btn_update_window_other_setting',
            text: MyLang.getMsg('BTN_UPDATE'),
            handler: function () {
              var rowSelected = MainLayout.getRowSelected();
              if (rowSelected) {
                var $window_content = $('#window_other_setting_content');

                var ckOkToAttachFile = $window_content.find(':input[name="ckOkToAttachFile"]');
                var ckOkToOpenNotification = $window_content.find(':input[name="ckOkToOpenNotification"]');
                var ckAdditionalFilter = $window_content.find(':input[name="ckAdditionalFilter"]');

                for(var i=1; i<= 35; i++){
                  if($window_content.find(':input[name=ckAdditionalFilter_' + i + ']').is(':checked')){
                    if ($window_content.find(':input[name=txtAdditionalFilterValue_' + i + ']').val() == "") {
                      Ext.Msg.show({
                        icon: Ext.MessageBox.INFO,
                        msg: MyLang.getMsg('MSG_ALERT_1'),
                        buttons: Ext.Msg.OK
                      });
                      // MsgBox "条件が指定されていません", vbOKOnly, "条件指定"
                      return;
                    }
                  }
                }


                var obj = clone(WindowOtherSetting.defaultData);
                obj.ok_to_attachfile.is_checked = ckOkToAttachFile.is(':checked');
                obj.ok_to_open_notification.is_checked = ckOkToOpenNotification.is(':checked');
                obj.additional_filter.is_checked = ckAdditionalFilter.is(':checked');

                var okToOpenNotificationObjValue = clone(WindowOtherSetting.defaultData);
                var sValue = rowSelected.get('other_setting_value');
                if(sValue!=''){
                  okToOpenNotificationObjValue = JSON.parse(sValue);
                }

                var flag_checked = ckOkToOpenNotification.is(':checked');
                if( WindowOtherSetting.callbackData instanceof Object){
                  okToOpenNotificationObjValue.ok_to_open_notification = WindowOtherSetting.callbackData;
                  if(typeof okToOpenNotificationObjValue.flag_checked != 'undefined'){
                    flag_checked = okToOpenNotificationObjValue.flag_checked;
                  }
                }

                if(!flag_checked){
                  obj.ok_to_open_notification.value = '';
                  obj.ok_to_open_notification.display = '';
                }else{
                  obj.ok_to_open_notification.value = okToOpenNotificationObjValue.ok_to_open_notification.value;
                  obj.ok_to_open_notification.display = okToOpenNotificationObjValue.ok_to_open_notification.display;
                }
                obj.ok_to_open_notification.is_checked = flag_checked;

                var showOtherSetting = '';
                if(obj.ok_to_attachfile.is_checked){
                  showOtherSetting += MyLang.getMsg('DISPLAY_OK_TO_ATTACH') + vbCrLf;
                }
                if(obj.ok_to_open_notification.is_checked && obj.ok_to_open_notification.display != ''){
                  showOtherSetting += MyLang.getMsg('DISPLAY_OK_TO_OPEN_NOTIFICATION') + vbCrLf;
                  showOtherSetting += obj.ok_to_open_notification.display;
                }

                if(obj.additional_filter.is_checked){
                  for(var i=1; i<= 35; i++){
                    if($window_content.find(':input[name=ckAdditionalFilter_' + i + ']').is(':checked')){
                      var txtAdditionalFilterValue = $window_content.find(':input[name=txtAdditionalFilterValue_' + i + ']');
                      var lblAdditionalFilter = $window_content.find('span[name=lblAdditionalFilter_' + i + ']');
                      obj.additional_filter.display += '&nbsp;&nbsp;' + lblAdditionalFilter.text() + ' = ' + txtAdditionalFilterValue.val() + vbCrLf;
                      obj.additional_filter.value += txtAdditionalFilterValue.attr('field') + ':' + txtAdditionalFilterValue.val();
                      if(i==35){}else{
                        obj.additional_filter.value += ';';
                      }
                    }
                  }
                  showOtherSetting += MyLang.getMsg('DISPLAY_ADDITIONAL_FILTER') + vbCrLf;
                  showOtherSetting += obj.additional_filter.display;
                }

                // show editable_item
                rowSelected.set('other_setting', showOtherSetting);
                rowSelected.set('other_setting_value', JSON.stringify(obj));
              }
              // フォームを閉じる
              WindowOtherSetting.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              WindowOtherSetting.close();
            }
          })
        );


        win = new Ext.Window({
          id: 'window_other_setting',
          title: MyLang.getMsg('TITLE_WINDOW_OTHER_SETTING'),
          layout: 'fit',
          width: 450,
          height: 500,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="window_other_setting_content" class="container"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {

              var $window_content = $('#window_other_setting_content');
              $window_content.html('');
              var vHtml = '';

              vHtml += '<div class="main_title">';
//              vHtml += '<span>' + MyLang.getMsg("APPROVER_ADD_BUTTON_EXP") + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<input name="ckOkToAttachFile" type="checkbox"> ' + MyLang.getMsg('LBL_OK_TO_ATTACH');
              vHtml += '</div>';
              vHtml += '<div class="item" style="display:none;">';
              vHtml += '<input name="ckOkToOpenNotification" type="checkbox"> <span name="spanOkToOpenNotification">' + MyLang.getMsg('LBL_OK_TO_OPEN_NOTIFICATION') + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<input name="ckAdditionalFilter" type="checkbox"> <span name="spanAdditionalFilter"> ' + MyLang.getMsg('LBL_ADDITIONAL_FILTER') + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="pdl20">';
              vHtml += '<div class="item">';
              vHtml += '<table style="width: 100%" class="list" cellspacing="0" cellpadding="0">';
              vHtml += '<tr>';
              vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_1"></td>';
              vHtml += '<td><span name="lblAdditionalFilter_1">' + MyLang.getMsg("USERINFO_EMAIL") + '</span></td>';
              vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_1" field="email"></td>';
              vHtml += '</tr>';
              vHtml += '<tr>';
              vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_2"></td>';
              vHtml += '<td><span name="lblAdditionalFilter_2">' + MyLang.getMsg("USERINFO_FAMILY_NAME") + '</span></td>';
              vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_2" field="family_name"></td>';
              vHtml += '</tr>';
              vHtml += '<tr>';
              vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_3"></td>';
              vHtml += '<td><span name="lblAdditionalFilter_3">' + MyLang.getMsg("USERINFO_GIVEN_NAME") + '</span></td>';
              vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_3" field="given_name"></td>';
              vHtml += '</tr>';
              vHtml += '<tr>';
              vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_4"></td>';
              vHtml += '<td><span name="lblAdditionalFilter_4">' + MyLang.getMsg("USERINFO_JOB_TITLE") + '</span></td>';
              vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_4" field="job_title"></td>';
              vHtml += '</tr>';
              vHtml += '<tr>';
              vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_5"></td>';
              vHtml += '<td><span name="lblAdditionalFilter_5">' + MyLang.getMsg("USERINFO_FAMILY_NAME") + '</span></td>';
              vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_5" field="employee_id"></td>';
              vHtml += '</tr>';
              var idx = 6;
              for (var i = 0; i <= 19; i++) {
                vHtml += '</tr>';
                vHtml += '<tr>';
                vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_' + idx + '"></td>';
                vHtml += '<td><span name="lblAdditionalFilter_' + idx + '">' + MyLang.getMsg("USERINFO_BOSS_EMAIL") + (i + 1) + '</span></td>';
                vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_' + idx + '" field="boss_email_' + (i + 1) + '"></td>';
                vHtml += '</tr>';
                vHtml += '<tr>';
                idx ++;
              }
              for (var i = 0; i <= 4; i++) {
                vHtml += '</tr>';
                vHtml += '<tr>';
                vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_' + idx + '"></td>';
                vHtml += '<td><span name="lblAdditionalFilter_' + idx + '">' + MyLang.getMsg("USERINFO_DEPARTMENT_" + (i + 1)) + '</span></td>';
                vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_' + idx + '" field="department_' + (i + 1) + '"></td>';
                vHtml += '</tr>';
                vHtml += '<tr>';
                idx ++;
              }
              for (var i = 0; i <= 4; i++) {
                vHtml += '</tr>';
                vHtml += '<tr>';
                vHtml += '<td><input type="checkbox" name="ckAdditionalFilter_' + idx + '"></td>';
                vHtml += '<td><span name="lblAdditionalFilter_' + idx + '">' + MyLang.getMsg("USERINFO_ATTRIBUTE_" + (i + 1)) + '</span></td>';
                vHtml += '<td>=&nbsp;<input name="txtAdditionalFilterValue_' + idx + '" field="user_attribute_' + (i + 1) + '"></td>';
                vHtml += '</tr>';
                vHtml += '<tr>';
                idx ++;
              }
              vHtml += '</table>';
              vHtml += '</div>';
              vHtml += '</div>';
              $window_content.html(vHtml);

              // load data
              WindowOtherSetting.currentColumn = aColumnIndex;
              var sValue = aRecord.get('other_setting_value'), obj = clone(WindowOtherSetting.defaultData);
              if(sValue!=''){
                obj = JSON.parse(sValue);
              }

              var ckOkToAttachFile = $window_content.find(':input[name="ckOkToAttachFile"]');
              var ckOkToOpenNotification = $window_content.find(':input[name="ckOkToOpenNotification"]');
              var ckAdditionalFilter = $window_content.find(':input[name="ckAdditionalFilter"]');
              var spanOkToOpenNotification = $window_content.find('span[name="spanOkToOpenNotification"]');
              var btnShowOkToOpenNotificationPopup = $window_content.find('button[name="btnShowOkToOpenNotificationPopup"]');
              ckOkToAttachFile.prop('checked', obj.ok_to_attachfile.is_checked);
              ckOkToOpenNotification.prop('checked', obj.ok_to_open_notification.is_checked);
              if(obj.additional_filter){
              ckAdditionalFilter.prop('checked', obj.additional_filter.is_checked);
              }

              for(var i=1; i<= 35; i++){
                if(obj.additional_filter && obj.additional_filter.is_checked) {

                }else{
                  $window_content.find(':input[name=ckAdditionalFilter_' + i + ']').attr('disabled','disabled');
                }

                $window_content.find(':input[name=txtAdditionalFilterValue_' + i + ']').attr('disabled','disabled');

                $window_content.find(':input[name=ckAdditionalFilter_' + i + ']').change(function(){
                  var splitIndex = $(this).attr('name').split('_');
                  var index = splitIndex[1];
                  if($(this).is(':checked')){
                    $window_content.find(':input[name=txtAdditionalFilterValue_' + index + ']').removeAttr('disabled');
                  }else{
                    $window_content.find(':input[name=txtAdditionalFilterValue_' + index + ']').attr('disabled', 'disabled');
                  }
                })
              }

              if(obj.ok_to_open_notification.is_checked){
                btnShowOkToOpenNotificationPopup.removeAttr('disabled')
              }
              if(obj.additional_filter && obj.additional_filter.is_checked){
                if(obj.additional_filter.value){
                  var sValue = obj.additional_filter.value, sValueSplit, selectIndex= 0;

                  if(sValue !=''){
                    sValueSplit = sValue.split(';');
                    for(var i=0; i< sValueSplit.length; i++){
                      sValue = sValueSplit[i];
                      sValue = sValue.split(':');
                      if(sValue.length ==2){
                        var txtAdditionalFilterValue = $window_content.find(':input[field=' + sValue[0] + ']');
                        txtAdditionalFilterValue.val(sValue[1]);
                        var ck = $window_content.find(':input[name=ckAdditionalFilter_' + txtAdditionalFilterValue.attr('name').split('_')[1] + ']')
                        ck.prop('checked', true);
                        ck.removeAttr('disabled');
                        txtAdditionalFilterValue.removeAttr('disabled');
                      }
                    }
                  }
                }
              }

              ckOkToOpenNotification.change(function(){
                if($(this).is(':checked')){
                  WindowOtherSetting.callbackData = null;

                  WindowButtonSetting.showWindow(aGrid, aRecord, aColumnIndex, BUTTON_TYPE_OPEN_NOTIFICATION, obj.ok_to_open_notification.value, function(data){
                    WindowOtherSetting.callbackData = data;
                    ckOkToOpenNotification.prop('checked', data.flag_checked);
                  });
                }
              });
              spanOkToOpenNotification.click(function(){
                ckOkToOpenNotification.prop('checked', true);
                WindowOtherSetting.callbackData = null;

                WindowButtonSetting.showWindow(aGrid, aRecord, aColumnIndex, BUTTON_TYPE_OPEN_NOTIFICATION, obj.ok_to_open_notification.value, function(data){
                  WindowOtherSetting.callbackData = data;
                  ckOkToOpenNotification.prop('checked', data.flag_checked);
                });
              });

              ckAdditionalFilter.change(function(){
//                console.log()
                if($(this).is(':checked')){
                  for(var i=1; i<= 35; i++){
                    $window_content.find(':input[name=ckAdditionalFilter_' + i + ']').removeAttr('disabled');
                    if($window_content.find(':input[name=ckAdditionalFilter_' + i + ']').is(':checked')){
                      $window_content.find(':input[name=txtAdditionalFilterValue_' + i + ']').removeAttr('disabled');
                    }
                  }
                }else{
                  for(var i=1; i<= 35; i++){
                    $window_content.find(':input[name=ckAdditionalFilter_' + i + ']').attr('disabled','disabled');
                    $window_content.find(':input[name=txtAdditionalFilterValue_' + i + ']').attr('disabled','disabled');
                  }
                }
              });
            },
            hide: function () {
              WindowOtherSetting.close();
            }
          }
        });
      }
      win.show();
    }
  };

  WindowEditableItem = {
    currentColumn: -1,
    close: function () {
      var win = Ext.getCmp('window_editable_item');
      if (win) {
        win.close();
      }
    },
    showWindow: function (aGrid, aRecord, aColumnIndex) {
      var win = Ext.getCmp('window_editable_item');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            id: 'btn_update_window_editable_item',
            text: MyLang.getMsg('BTN_UPDATE'),
            handler: function () {
              var rowSelected = MainLayout.getRowSelected();
              if (rowSelected) {
                var $window_content = $('#window_editable_item_content');

                var ckUpdateClass = $window_content.find('input[name="ckUpdateClass"]');
                var txtUpdateClass = $window_content.find('input[name="txtUpdateClass"]');
                var ckUpdateField = $window_content.find('input[name="ckUpdateField"]');
                var txtUpdateField = $window_content.find('input[name="txtUpdateField"]');
                var obj = {
                  update_class: {
                    is_checked: ckUpdateClass.is(':checked'),
                    value: txtUpdateClass.val()
                  },
                  update_field: {
                    is_checked: ckUpdateField.is(':checked'),
                    value: txtUpdateField.val()
                  }
                };

                var showEditableItem = '';
                if(obj.update_class.is_checked && obj.update_class.value.trim() !== ''){
                  showEditableItem += MyLang.getMsg('DISPLAY_UPDATE_CLASS') + vbCrLf;
                  showEditableItem += ' ' + obj.update_class.value + vbCrLf;
                }
                if(obj.update_field.is_checked && obj.update_field.value.trim() !== ''){
                  showEditableItem += MyLang.getMsg('DISPLAY_UPDATE_FIELD') + vbCrLf;
                  showEditableItem += ' ' + obj.update_field.value;
                }

                // show editable_item
                rowSelected.set('editable_item', showEditableItem);
                rowSelected.set('editable_item_value', JSON.stringify(obj));
              }
              // フォームを閉じる
              WindowEditableItem.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              WindowEditableItem.close();
            }
          })
        );


        win = new Ext.Window({
          id: 'window_editable_item',
          title: MyLang.getMsg('TITLE_WINDOW_BUTTON_SETTING'),
          layout: 'fit',
          width: 500,
          height: 230,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="window_editable_item_content" class="container"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {

              var $window_content = $('#window_editable_item_content');
              $window_content.html('');
              var vHtml = '';

              vHtml += '<div class="main_title">';
//              vHtml += '<span>' + MyLang.getMsg("APPROVER_ADD_BUTTON_EXP") + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<input name="ckUpdateClass" type="checkbox"> ' + MyLang.getMsg('LBL_UPDATE_CLASS');
              vHtml += '</div>';
              vHtml += '<div class="item pdl20">';
              vHtml += '<input style="width:97%" name="txtUpdateClass" type="text" disabled>';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<input name="ckUpdateField" type="checkbox"> ' + MyLang.getMsg('LBL_UPDATE_FIELD');
              vHtml += '</div>';
              vHtml += '<div class="item pdl20">';
              vHtml += '<input style="width:97%" name="txtUpdateField" type="text" disabled>';
              vHtml += '</div>';
              $window_content.html(vHtml);

              // load data
              WindowEditableItem.currentColumn = aColumnIndex;
              var sValue = aRecord.get('editable_item_value'), obj = {
                update_class: {
                  is_checked: false,
                  value: ''
                },
                update_field:{
                  is_checked: false,
                  value: ''
                }
              };
              if(sValue!=''){
                obj = JSON.parse(sValue);
              }
              var ckUpdateClass = $window_content.find('input[name="ckUpdateClass"]');
              var txtUpdateClass = $window_content.find('input[name="txtUpdateClass"]');
              var ckUpdateField = $window_content.find('input[name="ckUpdateField"]');
              var txtUpdateField = $window_content.find('input[name="txtUpdateField"]');
              ckUpdateClass.prop('checked', obj.update_class.is_checked);
              txtUpdateClass.val(obj.update_class.value);
              ckUpdateField.prop('checked', obj.update_field.is_checked);
              txtUpdateField.val(obj.update_field.value);
              if(obj.update_class.is_checked){
                txtUpdateClass.removeAttr('disabled')
              }
              if(obj.update_field.is_checked){
                txtUpdateField.removeAttr('disabled')
              }
              ckUpdateClass.change(function(){
                if($(this).is(':checked')){
                  txtUpdateClass.removeAttr('disabled');
                }else{
                  txtUpdateClass.attr('disabled', 'disabled');
                }
              });
              ckUpdateField.change(function(){
                if($(this).is(':checked')){
                  txtUpdateField.removeAttr('disabled');
                }else{
                  txtUpdateField.attr('disabled', 'disabled');
                }
              })

            },
            hide: function () {
              WindowEditableItem.close();
            }
          }
        });
      }
      win.show();
    }
  };

  WindowButtonSetting = {
    currentColumn: -1,
    callbackFunc: null,
    close: function () {
      var win = Ext.getCmp('window_button_setting');
      if (win) {
        win.close();
      }
    },
    getPropertyKeys: function () {
      var property_name = '';
      var property_name_value = '';
      switch (WindowButtonSetting.currentColumn) {
        case BUTTON_TYPE_SELECT:
          // 追加ボタン
          property_name = 'select_button';
          property_name_value = 'select_button_value';
          break;
        case BUTTON_TYPE_SELECT_DEP:
          // 追加ボタン
          property_name = 'select_dep_button';
          property_name_value = 'select_dep_button_value';
          break;
        case BUTTON_TYPE_DEL:
          // 削除ボタン
          property_name = 'del_button';
          property_name_value = 'del_button_value';
          break;
//        case BUTTON_TYPE_OPEN_NOTIFICATION:
//          // 削除ボタン
//          property_name = 'button_type_open_notification';
//          property_name_value = 'button_type_open_notification_value';
//          break;
      }
      return {
        name: property_name,
        value: property_name_value
      };
    },
    showWindow: function (aGrid, aRecord, aColumnIndex, aPropertyName, aPropertyValue, aCallbackFunction) {
      if(typeof aCallbackFunction === 'function'){
        WindowButtonSetting.callbackFunc = aCallbackFunction;
      }else{
        WindowButtonSetting.callbackFunc = null;
      }
      var win = Ext.getCmp('window_button_setting');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            id: 'btn_update_window_button_setting',
            text: MyLang.getMsg('BTN_UPDATE'),
            handler: function () {
              var sOkNumber = "", sOkNumberString = "";
              var $window_content = $('#window_button_setting');
              // 対象ボタン種類判定
              var objKeys = WindowButtonSetting.getPropertyKeys();
              var property_name = objKeys.name, property_name_value = objKeys.value, iTargetNumber, i;

              // 条件の保存
              var rowSelected = MainLayout.getRowSelected();
              if (rowSelected) {
                iTargetNumber = parseInt(rowSelected.get('process_no'));
                var flagChecked = true;
                // 許可プロセス番号
                for (i = 1; i <= iTargetNumber - 1; i++) {
                  var ckProcess = $window_content.find('input[name="ckProcess' + i + '"]');
                  if (ckProcess.is(':checked')) {
                    if (sOkNumber != "") {
                      sOkNumber = sOkNumber + " ";
                      sOkNumberString = sOkNumberString + vbCrLf;
                    }
                    sOkNumber = sOkNumber + i.toString().trim();
                    if(typeof aCallbackFunction === 'function'){
                      sOkNumberString = '　' + sOkNumberString + MyLang.getMsg("PROCESS_NUMBER") + i; //StrConv(i, vbWide, LNGCODE_JP)
                    }else{
                      sOkNumberString = sOkNumberString + MyLang.getMsg("PROCESS_NUMBER") + i; //StrConv(i, vbWide, LNGCODE_JP)
                    }
                    flagChecked = true;
                  }
                }

                // 申請者のチェック
                if ($window_content.find('input[name="ckShinseiSha"]').is(':checked')) {
                  sOkNumber = "1:" + sOkNumber;
                  if(typeof aCallbackFunction === 'function'){
                    sOkNumberString ='　' + MyLang.getMsg("AUTHOR_NAME") + vbCrLf + sOkNumberString;
                  }else{
                    sOkNumberString = MyLang.getMsg("AUTHOR_NAME") + vbCrLf + sOkNumberString;
                  }
                  flagChecked = true;
                } else {
                  sOkNumber = "0:" + sOkNumber;
                }
                sOkNumberString = sOkNumberString + vbCrLf;

                // 条件値の保存
                // ActiveSheet.Cells(iTargetRow, Range(TARGET_RANGE_VALUE).Column) = sOkNumber
                // ActiveSheet.Cells(iTargetRow, Range(TARGET_RANGE).Column) = sOkNumberString

                if(typeof aCallbackFunction === 'function'){
                  WindowButtonSetting.callbackFunc({
                    display: sOkNumberString,
                    value: sOkNumber,
                    flag_checked: flagChecked
                  });
                }else {
                  rowSelected.set(property_name, sOkNumberString);
                  rowSelected.set(property_name_value, sOkNumber);
                }
              }

              // フォームを閉じる
              WindowButtonSetting.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              WindowButtonSetting.close();
            }
          })
        );


        win = new Ext.Window({
          id: 'window_button_setting',
          title: MyLang.getMsg('TITLE_WINDOW_BUTTON_SETTING'),
          layout: 'fit',
          width: 400,
          height: 420,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="window_button_setting_content" class="container"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              var $window_content = $('#window_button_setting_content');
              $window_content.html('');
              var vHtml = '';

              vHtml += '<div class="main_title">';
//              vHtml += '<span>' + MyLang.getMsg("APPROVER_ADD_BUTTON_EXP") + '</span>';
              vHtml += '<p name="lblComment"></p>';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<input name="ckShinseiSha" type="checkbox"> ' + MyLang.getMsg("AUTHOR_NAME");
              vHtml += '</div>';
              for (var i = 1; i <= 20; i++) {
                vHtml += '<div class="item">';
                vHtml += '<input name="ckProcess' + i + '" type="checkbox"><span name="ckProcessCaption' + i + '"> ' + MyLang.getMsg("PROCESS_NUMBER") + i + '：</span>';
                vHtml += '</div>';
              }
              $window_content.html(vHtml);

              // 対象ボタン種類判定
              WindowButtonSetting.currentColumn = aColumnIndex;
              var objKeys = WindowButtonSetting.getPropertyKeys();
              var property_name = objKeys.name, property_name_value = objKeys.value, sValue, sFlg, sProcess, i, iTargetNumber;

              // セル取得
              if(aPropertyValue !== undefined){
                sValue = aPropertyValue;
              }else {
                sValue = aRecord.get(property_name_value);
              }
              if (sValue == "") {
                sValue = "0:";
              }

              // フラグ分解
              sFlg = sValue.split(":");

              // 申請者チェック
              if (sFlg[0] == "1") {
                $window_content.find('input[name="ckShinseiSha"]').prop('checked', true);
              }

              // プロセスチェック
              sProcess = sFlg[1].split(" ");
              for (i = 0; i < sProcess.length; i++) {
                $window_content.find('input[name="ckProcess' + sProcess[i] + '"]').prop('checked', true);
                $window_content.find('span[name="ckProcessCaption' + sProcess[i] + '"]').removeClass('disabled');
              }


              // チェックボックスの制御
              iTargetNumber = parseInt(aRecord.get('process_no'));
              var store = aGrid.getStore();
              for (var i = 1; i <= 20; i++) {

                var ckProcess = $window_content.find('input[name="ckProcess' + i + '"]');
                var ckProcessCaption = $window_content.find('span[name="ckProcessCaption' + i + '"]');
                if (i >= iTargetNumber) {
                  ckProcess.attr('disabled', 'disabled');
                  ckProcessCaption.addClass('disabled');
                }
								// fix 2015.06.26 by T.ASAO
                //var record = store.getAt(i);
                var record = store.getAt(i-1);
                if (record) {
                  // fix 2015.06.16 by T.ASAO
                  //ckProcessCaption.text(ckProcessCaption.text() + aRecord.get('approver_name'));
                  ckProcessCaption.text(ckProcessCaption.text() + record.get('approver_name'));
                }
              }

              // コメント表示
              var sComment = '';
              var sProcessName = '';
              sProcessName = "プロセス" + aRecord.get('process_no') + ":" + aRecord.get('approver_name');

              switch (aColumnIndex) {
                case BUTTON_TYPE_SELECT:
                  // 追加ボタン
                  sComment = sProcessName + MyLang.getMsg('BUTTON_TYPE_SELECT_COMMENT');
                  break;
                case BUTTON_TYPE_SELECT_DEP:
                  // 追加ボタン
                  sComment = sProcessName + MyLang.getMsg('BUTTON_TYPE_SELECT_DEP_COMMENT');
                  break;
                case BUTTON_TYPE_DEL:
                  // 削除ボタン
                  sComment = sProcessName + MyLang.getMsg('BUTTON_TYPE_DEL_COMMENT');
                  break;
//                case BUTTON_TYPE_OPEN_NOTIFICATION:
//                  // 開封通知
//                  sComment = sProcessName + "の開封通知設定が可能なプロセスを指定します";
//                  break;
              }

              if(aPropertyName != undefined && aPropertyName == BUTTON_TYPE_OPEN_NOTIFICATION){
                sComment = sProcessName + MyLang.getMsg('BUTTON_TYPE_OPEN_NOTIFICATION_COMMENT');
              }

              $window_content.find('p[name="lblComment"]').text(sComment);
            },
            hide: function () {
              WindowButtonSetting.close();
            }
          }
        });
      }
      win.show();
    }
  };

  WindowApproverCondition = {
    callback: null,
    close: function () {
      var win = Ext.getCmp('window_approver_condition');
      if (win) {
        win.close();
      }
    },
    PartsEnable: function (ButtonType, EnabledType) {
      var $window_content = $('#window_approver_condition_content');
      var cmbBoss = $window_content.find(':input[name="cmbBoss"]');
      var cmbFieldName = $window_content.find(':input[name="cmbFieldName"]');
      var txtFieldValue = $window_content.find(':input[name="txtFieldValue"]');
      var cmbSameDepartment = $window_content.find(':input[name="cmbSameDepartment"]');
      var opGroupRelativeDoc = $window_content.find(':input[name="opGroupRelativeDoc"]');
      var txtRelativeDocValue1 = $window_content.find(':input[name="txtRelativeDocValue1"]');
      var txtRelativeDocValue2 = $window_content.find(':input[name="txtRelativeDocValue2"]');
      switch (ButtonType) {
        case 0:
          if (EnabledType == true) {
            cmbBoss.removeAttr('disabled');
          } else {
            cmbBoss.attr('disabled', 'disabled');
          }
          break;
        case 1:
          if (EnabledType == true) {
            cmbFieldName.removeAttr('disabled');
            txtFieldValue.removeAttr('disabled');
          } else {
            cmbFieldName.attr('disabled', 'disabled');
            txtFieldValue.attr('disabled', 'disabled');
          }
          break;
        case 2:
          if (EnabledType == true) {
            cmbSameDepartment.removeAttr('disabled');
          } else {
            cmbSameDepartment.attr('disabled', 'disabled');
          }
          break;
        case 3:
          if (EnabledType == true) {
            opGroupRelativeDoc.removeAttr('disabled');
            if($(opGroupRelativeDoc[0]).is(':checked')) {
              txtRelativeDocValue1.removeAttr('disabled');
            }else if($(opGroupRelativeDoc[1]).is(':checked')) {
              txtRelativeDocValue2.removeAttr('disabled');
            }
          } else {
            opGroupRelativeDoc.attr('disabled', 'disabled');
            txtRelativeDocValue1.attr('disabled', 'disabled');
            txtRelativeDocValue2.attr('disabled', 'disabled');
          }
          break;
      }
    },
    showWindow: function (callback) {
      if (typeof callback === 'function') {
        WindowApproverCondition.callback = callback;
      } else {
        WindowApproverCondition.callback = null;
      }
      var win = Ext.getCmp('window_approver_condition');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            id: 'btn_sign_up_window_approver_condition',
            text: MyLang.getMsg('BTN_SIGN_UP'),
            handler: function () {
              var $window_content = $('#window_approver_condition_content');
              var opBoss = $window_content.find('#opBoss');
              var opField = $window_content.find('#opField');
              var opSameDepartment = $window_content.find('#opSameDepartment');
              var opRelativeDoc = $window_content.find('#opRelativeDoc');
              var opDocAuthor = $window_content.find('#opDocAuthor');
              var txtFieldValue = $window_content.find(':input[name="txtFieldValue"]');
              var cmbFieldName = $window_content.find(':input[name="cmbFieldName"]');
              var cmbBoss = $window_content.find(':input[name="cmbBoss"]');
              var cmbSameDepartment = $window_content.find(':input[name="cmbSameDepartment"]');
              var opGroupRelativeDoc = $window_content.find(':input[name="opGroupRelativeDoc"]');
              var txtRelativeDocValue1 = $window_content.find(':input[name="txtRelativeDocValue1"]');
              var txtRelativeDocValue2 = $window_content.find(':input[name="txtRelativeDocValue2"]');


              // エラーチェック
              if (opField.is(':checked')) {
                if (txtFieldValue.val() == "") {
                  Ext.Msg.show({
                    icon: Ext.MessageBox.INFO,
                    msg: MyLang.getMsg('MSG_ALERT_1'),
                    buttons: Ext.Msg.OK
                  });
                  // MsgBox "条件が指定されていません", vbOKOnly, "条件指定"
                  return;
                }
              }

              // Relative Doc Value
              if (opRelativeDoc.is(':checked')) {
                if ( ($(opGroupRelativeDoc[0]).is(':checked') && txtRelativeDocValue1.val() == "") ||
                      ($(opGroupRelativeDoc[1]).is(':checked') && txtRelativeDocValue2.val() == "")) {
                  Ext.Msg.show({
                    icon: Ext.MessageBox.INFO,
                    msg: MyLang.getMsg('MSG_ALERT_1'),
                    buttons: Ext.Msg.OK
                  });
                  // MsgBox "条件が指定されていません", vbOKOnly, "条件指定"
                  return;
                }
              }

              // 条件タイプ
              if (opBoss.is(':checked')) {
                WindowApprover.conditionManager.ConditonType("0");
              } else if (opField.is(':checked')) {
                WindowApprover.conditionManager.ConditonType("1");
              } else if (opSameDepartment.is(':checked')) {
                WindowApprover.conditionManager.ConditonType("2");
              } else if (opRelativeDoc.is(':checked')) {
                WindowApprover.conditionManager.ConditonType("3");
              } else if (opDocAuthor.is(':checked')) {
                WindowApprover.conditionManager.ConditonType("4");
              }


              // 条件フィールド
              if (opField.is(':checked')) {
                WindowApprover.conditionManager.ConditonField(cmbFieldName.val());
              } else if(opRelativeDoc.is(':checked')) {
                var sValue = '';
                $.each(opGroupRelativeDoc, function(){
                  if($(this).is(':checked')){
                    sValue = $(this).val();
                  }
                })
                WindowApprover.conditionManager.ConditonField(sValue);
              } else {
                WindowApprover.conditionManager.ConditonField("");
              }

              // 条件値
              if (opBoss.is(':checked')) {
                WindowApprover.conditionManager.ConditonValue(cmbBoss.val());
              } else if (opField.is(':checked')) {
                WindowApprover.conditionManager.ConditonValue(txtFieldValue.val());
              } else if (opSameDepartment.is(':checked')) {
                WindowApprover.conditionManager.ConditonValue(cmbSameDepartment.val());
              } else if (opRelativeDoc.is(':checked')) {
                if($(opGroupRelativeDoc[0]).is(':checked')){
                  WindowApprover.conditionManager.ConditonValue(txtRelativeDocValue1.val());
                }else if($(opGroupRelativeDoc[1]).is(':checked')){
                  WindowApprover.conditionManager.ConditonValue(txtRelativeDocValue2.val());
                }else{
                  WindowApprover.conditionManager.ConditonValue('');
                }
              }else if (opDocAuthor.is(':checked')) {
                WindowApprover.conditionManager.ConditonValue('0');
              }

              if (WindowApproverCondition.callback) {
                WindowApproverCondition.callback();
              }

              // 閉じる
              WindowApproverCondition.close();

            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {

              WindowApproverCondition.close();
            }
          })
        );


        win = new Ext.Window({
          id: 'window_approver_condition',
          title: MyLang.getMsg('TITLE_WINDOW_APPROVER_CONDITION'),
          layout: 'fit',
          width: 400,
          height: 540,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="window_approver_condition_content" class="container"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              var $window_content = $('#window_approver_condition_content');
              $window_content.html('');
              var vHtml = '';

              vHtml += '<div class="item">';
              vHtml += '<input id="opBoss" name="cond" type="radio" checked> ' + MyLang.getMsg("APPROVER_ADD_EXP_1");
              vHtml += '</div>';
              vHtml += '<div class="pdl20">';
              vHtml += '<div class="item">';
              vHtml += '<select name="cmbBoss" style="width: 120px;"></select>';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<p>' + MyLang.getMsg("APPROVER_ADD_EXP_2") + '</p>';
              vHtml += '</div>';
              vHtml += '</div>';

              vHtml += '<div class="item">';
              vHtml += '<input id="opField" name="cond" type="radio"> ' + MyLang.getMsg("APPROVER_ADD_EXP_3") ;
              vHtml += '</div>';
              vHtml += '<div class="pdl20">';
              vHtml += '<div class="item">';
              vHtml += '<select name="cmbFieldName" style="width: 120px;"></select> ＝ <input type="text" name="txtFieldValue">';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<p>' + MyLang.getMsg("APPROVER_ADD_EXP_4") + '</p>';
              vHtml += '</div>';
              vHtml += '</div>';

              vHtml += '<div class="item">';
              vHtml += '<input id="opSameDepartment" name="cond" type="radio"> ' + MyLang.getMsg("APPROVER_ADD_EXP_6");
              vHtml += '</div>';
              vHtml += '<div class="pdl20">';
              vHtml += '<div class="item">';
              vHtml += '<select name="cmbSameDepartment" style="width: 120px;"></select> ' + MyLang.getMsg('APPROVER_ADD_EXP_7');
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<p>' + MyLang.getMsg("APPROVER_ADD_EXP_5") + '</p>';
              vHtml += '</div>';
              vHtml += '</div>';

              vHtml += '<div class="item" style="display: none;">';
              vHtml += '<input id="opRelativeDoc" name="cond" type="radio"> ' + MyLang.getMsg("APPROVER_ADD_EXP_8");
              vHtml += '</div>';
              vHtml += '<div class="pdl20" style="display: none;">';
              vHtml += '<div class="item">';
              vHtml += '<input type="radio" name="opGroupRelativeDoc" value="0">' + MyLang.getMsg("APPROVER_ADD_EXP_8_1") + '<input style="width: 60px;" type="text" name="txtRelativeDocValue1">' + MyLang.getMsg("APPROVER_ADD_EXP_8_2");
              vHtml += '<div style="clear: both;margin-top: 5px;"></div>';
              vHtml += '<input type="radio" name="opGroupRelativeDoc" value="1">' + MyLang.getMsg("APPROVER_ADD_EXP_8_3") + '<input style="width: 60px;" type="text" name="txtRelativeDocValue2">' + MyLang.getMsg("APPROVER_ADD_EXP_8_4");
              vHtml += '<div style="clear: both;margin-top: 5px;"></div>';
              vHtml += '<input type="radio" name="opGroupRelativeDoc" value="2">' + MyLang.getMsg("APPROVER_ADD_EXP_8_5");
              vHtml += '</div>';
              vHtml += '</div>';

              vHtml += '<div class="item">';
              vHtml += '<input id="opDocAuthor" name="cond" type="radio"> ' + MyLang.getMsg("APPROVER_ADD_EXP_9");
              vHtml += '</div>';

              $window_content.html(vHtml);

              var i;
              // 承認者プルダウンの設定
              var cmbBoss = $window_content.find(':input[name="cmbBoss"]');
              cmbBoss.html('');
              for (i = 0; i <= 19; i++) {
                if (WindowApprover.conditionManager.GetConditionBoss(i)) {
                  cmbBoss.append('<option value="' + i + '">' + WindowApprover.conditionManager.GetConditionBoss(i) + '</option>');
                }
              }
              cmbBoss.prop('selectedIndex', 0);

              // 承認者フィールドプルダウンの設定
              var cmbFieldName = $window_content.find(':input[name="cmbFieldName"]');
              cmbFieldName.html('');
              for (i = 0; i <= 9; i++) {
                if (WindowApprover.conditionManager.GetConditionFieldName(i)) {
                  cmbFieldName.append('<option value="' + i + '">' + WindowApprover.conditionManager.GetConditionFieldName(i) + '</option>');
                }
              }
              cmbFieldName.prop('selectedIndex', 0);

              // 同一部署プルダウンの設定
              var cmbSameDepartment = $window_content.find(':input[name="cmbSameDepartment"]');
              cmbSameDepartment.html('');
              for (i = 0; i <= 4; i++) {
                if (WindowApprover.conditionManager.GetConditionSameDepartment(i)) {
                  cmbSameDepartment.append('<option value="' + i + '">' + WindowApprover.conditionManager.GetConditionSameDepartment(i) + '</option>');
                }
              }
              cmbSameDepartment.prop('selectedIndex', 0);

              // relative doc
              var opGroupRelativeDoc = $window_content.find(':input[name="opGroupRelativeDoc"]');
              $(opGroupRelativeDoc[0]).prop('checked', true);

              var txtRelativeDocValue1 = $window_content.find(':input[name="txtRelativeDocValue1"]');
              var txtRelativeDocValue2 = $window_content.find(':input[name="txtRelativeDocValue2"]');

              // 表示初期化
              WindowApproverCondition.PartsEnable(0, false);
              WindowApproverCondition.PartsEnable(1, false);
              WindowApproverCondition.PartsEnable(2, false);
              WindowApproverCondition.PartsEnable(3, false);

              var opBoss = $window_content.find('#opBoss');
              var opField = $window_content.find('#opField');
              var opSameDepartment = $window_content.find('#opSameDepartment');
              var opRelativeDoc = $window_content.find('#opRelativeDoc');
              var opDocAuthor = $window_content.find('#opDocAuthor');
              switch (WindowApprover.conditionManager.ConditonType()) {
                case "":
                  WindowApproverCondition.PartsEnable(0, true);
                  opBoss.prop('checked', true);
                  break;
                case "0":
                  WindowApproverCondition.PartsEnable(0, true);
                  opBoss.prop('checked', true);
                  cmbBoss.prop('selectedIndex', WindowApprover.conditionManager.ConditonValue());
                  break;
                case "1":
                  WindowApproverCondition.PartsEnable(1, true);
                  opField.prop('checked', true);
                  cmbFieldName.prop('selectedIndex', WindowApprover.conditionManager.ConditonField());
                  $window_content.find(':input[name="txtFieldValue"]').val(WindowApprover.conditionManager.ConditonValue());
                  break;
                case "2":
                  WindowApproverCondition.PartsEnable(2, true);
                  opSameDepartment.prop('checked', true);
                  cmbSameDepartment.prop('selectedIndex', WindowApprover.conditionManager.ConditonValue());
                  break;
                case "3":
                  WindowApproverCondition.PartsEnable(3, true);
                  opRelativeDoc.prop('checked', true);
                  $(opGroupRelativeDoc[parseInt(WindowApprover.conditionManager.ConditonField())]).prop('checked', true);
                  if(WindowApprover.conditionManager.ConditonField() == 0){
                    txtRelativeDocValue1.val(WindowApprover.conditionManager.ConditonValue());
                    txtRelativeDocValue1.removeAttr('disabled');
                    txtRelativeDocValue2.attr('disabled', 'disabled');
                  }else if(WindowApprover.conditionManager.ConditonField() == 1){
                    txtRelativeDocValue2.val(WindowApprover.conditionManager.ConditonValue());
                    txtRelativeDocValue1.attr('disabled', 'disabled');
                    txtRelativeDocValue2.removeAttr('disabled');
                  }else if(WindowApprover.conditionManager.ConditonField() == 2){
                    txtRelativeDocValue1.attr('disabled', 'disabled');
                    txtRelativeDocValue2.attr('disabled', 'disabled');
                  }
                  break;
                case "4":
//                  WindowApproverCondition.PartsEnable(4, true);
                  opDocAuthor.prop('checked', true);
//                  opDocAuthor.prop('selectedIndex', WindowApprover.conditionManager.ConditonValue());
                  break;
              }

              opBoss.click(function () {
                // 部品無効化制御
                WindowApproverCondition.PartsEnable(0, true);
                WindowApproverCondition.PartsEnable(1, false);
                WindowApproverCondition.PartsEnable(2, false);
                WindowApproverCondition.PartsEnable(3, false);
              });

              opField.click(function () {
                // 部品無効化制御
                WindowApproverCondition.PartsEnable(0, false);
                WindowApproverCondition.PartsEnable(1, true);
                WindowApproverCondition.PartsEnable(2, false);
                WindowApproverCondition.PartsEnable(3, false);
              });

              opSameDepartment.click(function () {
                // 部品無効化制御
                WindowApproverCondition.PartsEnable(0, false);
                WindowApproverCondition.PartsEnable(1, false);
                WindowApproverCondition.PartsEnable(2, true);
                WindowApproverCondition.PartsEnable(3, false);

              });

              opRelativeDoc.click(function () {
                // 部品無効化制御
                WindowApproverCondition.PartsEnable(0, false);
                WindowApproverCondition.PartsEnable(1, false);
                WindowApproverCondition.PartsEnable(2, false);
                WindowApproverCondition.PartsEnable(3, true);
              });

              $(opGroupRelativeDoc[0]).click(function(){
                $window_content.find(':input[name="txtRelativeDocValue1"]').removeAttr('disabled');
                $window_content.find(':input[name="txtRelativeDocValue2"]').attr('disabled', 'disabled');
              });
              $(opGroupRelativeDoc[1]).click(function(){
                $window_content.find(':input[name="txtRelativeDocValue1"]').attr('disabled', 'disabled');
                $window_content.find(':input[name="txtRelativeDocValue2"]').removeAttr('disabled');
              });
              $(opGroupRelativeDoc[2]).click(function(){
                $window_content.find(':input[name="txtRelativeDocValue1"]').attr('disabled', 'disabled');
                $window_content.find(':input[name="txtRelativeDocValue2"]').attr('disabled', 'disabled');
              });
            },
            hide: function () {
              WindowApproverCondition.close();
            }
          }
        });
      }
      win.show();
    }
  };

  WindowApprover = {
    conditionManager: null,
    flg_cmbCondInit: 0,
    close: function () {
      var win = Ext.getCmp('window_approver');
      if (win) {
        win.close();
      }
    },
    PartsEdit: function () {
      var $window_content = $('#window_approver_content'), i;

      // 各パーツの有効化・無効化
      for (i = 1; i <= 10; i++) {
        var btnCond = $window_content.find(':input[name="btnCond' + i + '"]');
        var btnDel = $window_content.find(':input[name="btnDel' + i + '"]');
        var txtCond = $window_content.find(':input[name="txtCond' + i + '"]');
        var cmbCond = $window_content.find(':input[name="cmbCond' + i + '"]');
        if (i > WindowApprover.conditionManager.ConditonCount()) {
          // 説明・削除の無効化
          btnDel.attr('disabled', 'disabled');
          txtCond.attr('disabled', 'disabled');
        } else {
          // 説明・削除の有効化
          btnDel.removeAttr('disabled');
          txtCond.removeAttr('disabled');
        }
        if ((i - 1) > WindowApprover.conditionManager.ConditonCount()) {
          // 条件ボタンの無効化
          btnCond.attr('disabled', 'disabled');
        } else {
          // 条件ボタンの有効化
          btnCond.removeAttr('disabled');
        }
        if (i < 10) {
          if ((i + 1) > WindowApprover.conditionManager.ConditonCount()) {
            // かつ・またはの無効化
            cmbCond.attr('disabled', 'disabled');
          } else {
            // かつ・またはの有効化
            cmbCond.removeAttr('disabled');
            WindowApprover.conditionManager.SetConditoinIndex(i - 1);
            if (WindowApprover.conditionManager.ConditonConnect() != "") {
              cmbCond.prop("selectedIndex", WindowApprover.conditionManager.ConditonConnect());
            }
          }
        }
      }

      // 条件説明セット
      for (i = 1; i <= 10; i++) {
        var txtCond = $window_content.find(':input[name="txtCond' + i + '"]');
        txtCond.val("");
      }
      for (i = 1; i <= WindowApprover.conditionManager.ConditonCount(); i++) {
        WindowApprover.conditionManager.SetConditoinIndex(i - 1);
        var txtCond = $window_content.find(':input[name="txtCond' + i + '"]');
        txtCond.val(WindowApprover.conditionManager.GetConditionExp());
      }

      // 条件優先フラグ
      if(WindowApprover.conditionManager.ConditonPriority() == "1") {
        $window_content.find(':input[name="ckPriority"]').prop('checked', true);
      }else {
        $window_content.find(':input[name="ckPriority"]').prop('checked', false);
      }
    },
    btnCond_click: function (elm) {
      var $window_content = $('#window_approver_content');
      var iButtonIndex = parseInt($(elm).attr('idx'));
      // 編集する条件のインデックス設定
      WindowApprover.conditionManager.SetConditoinIndex(iButtonIndex - 1);

      // 条件編集画面の表示
      WindowApproverCondition.showWindow(function () {
        // かつ・またはの更新
        if (iButtonIndex > 1) {
          WindowApprover.conditionManager.SetConditoinIndex(iButtonIndex - 2);
          WindowApprover.conditionManager.ConditonConnect($window_content.find(':input[name="cmbCond' + (iButtonIndex - 1) + '"]').val());
        }

        // パーツ編集
        WindowApprover.PartsEdit();
      });

    },
    cmbCond_change: function (elm) {
      var $window_content = $('#window_approver_content');
      var Index = parseInt($(elm).attr('idx'));
      if (WindowApprover.flg_cmbCondInit == 1) {
        if (WindowApprover.conditionManager.ConditonCount() > Index) {
          WindowApprover.conditionManager.SetConditoinIndex(Index - 1);
          WindowApprover.conditionManager.ConditonConnect($window_content.find(':input[name="cmbCond' + Index + '"]').val());
        }
      }
    },
    btnDel_click: function (elm) {
      var iButtonIndex = parseInt($(elm).attr('idx'));
      //条件削除
      WindowApprover.conditionManager.DeleteCondition(iButtonIndex - 1);
      // パーツ編集
      WindowApprover.PartsEdit();
    },
    showWindow: function (aRecord) {
      var win = Ext.getCmp('window_approver');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            id: 'btn_update_window_approver',
            text: MyLang.getMsg('BTN_UPDATE'),
            handler: function () {
              // 条件の保存
              var i, sExp = '';
              for (i = 0; i <= 9; i++) {
                WindowApprover.conditionManager.SetConditoinIndex(i);
                if (sExp != "" && WindowApprover.conditionManager.GetConditionExp2() != "") {
                  sExp = sExp + vbCrLf;
                }
                sExp = sExp + WindowApprover.conditionManager.GetConditionExp2();
              }

              sExp = sExp + vbCrLf + WindowApprover.conditionManager.GetConditionExpBasic();

              // 条件値の保存
              // ActiveSheet.Cells(iTargetRow, Range(RANGE_CONDITION).Column) = sExp + vbCrLf
              // ActiveSheet.Cells(iTargetRow, Range(RANGE_CONDITION_VALUE).Column) = conditionManager.ConditonListString
              var rowSelected = MainLayout.getRowSelected();
              if (rowSelected) {
                rowSelected.set('condition', sExp + vbCrLf);
                // rowSelected.set('condition_value', WindowApprover.conditionManager.ConditonListString());
                rowSelected.set('condition_value', WindowApprover.conditionManager.ConditonString());
              }
              WindowApprover.close();
            }
          })
        );
//        buttons.push(
//          new Ext.Button({
//            id: 'btn_disp_member_window_approver',
//            text: MyLang.getMsg('BTN_DISP_MEMBER'),
//            handler: function () {
//              WindowApprover.close();
//            }
//          })
//        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              WindowApprover.close();
            }
          })
        );


        win = new Ext.Window({
          id: 'window_approver',
          title: MyLang.getMsg('TITLE_WINDOW_APPROVER'),
          layout: 'fit',
          width: 500,
          height: 480,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="window_approver_content" class="container"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              var $window_content = $('#window_approver_content');
              $window_content.html('');
              var vHtml = '';

              vHtml += '<table style="width: 100%" class="list" cellspacing="0" cellpadding="0">';

              for (var i = 1; i <= 10; i++) {
                vHtml += '<tr>';
                vHtml += '<td>';
                vHtml += '<button onclick="WindowApprover.btnCond_click(this);" idx="' + i + '" name="btnCond' + i + '" style="width:71px;height:25px">' + MyLang.getMsg('CONDITIONS') + i + '</button>';
                vHtml += '</td>';
                vHtml += '<td>';
                vHtml += '<input name="txtCond' + i + '" type="text" style="width: 95%;height:22px" disabled value="">';
                vHtml += '</td>';
                vHtml += '<td>';
                if (i != 10) {
                  vHtml += '<select onchange="WindowApprover.cmbCond_change(this);" idx="' + i + '" name="cmbCond' + i + '" disabled style="width:100px;height:25px">';
                  vHtml += '</select>';
                }
                vHtml += '</td>';
                vHtml += '<td>';
                vHtml += '<button onclick="WindowApprover.btnDel_click(this);" idx="' + i + '" name="btnDel' + i + '" disabled  style="height:25px">' + MyLang.getMsg("BTN_DELETE") + '</button>';
                vHtml += '</td>';
                vHtml += '</tr>';
              }
              vHtml += '</tr></table>';

              vHtml += '<div style="padding:5px 5px;">';
              vHtml += '<input name="ckPriority" type="checkbox"> ' + MyLang.getMsg("LBL_CK_PRIORITY") + '';
              vHtml += '</div>';


              $window_content.html(vHtml);

              // コンディション管理クラスのインスタンス作成
              var conditionManager = new ApproveConditionManager();
              WindowApprover.conditionManager = conditionManager;
              conditionManager.Init(aRecord.get('condition_value'));

              // かつ・または初期化
              var i;
              WindowApprover.flg_cmbCondInit = 0;
              for (i = 1; i <= 9; i++) {
                // かつ・または
                var cmbCond = $window_content.find(':input[name="cmbCond' + i + '"]');
                cmbCond.append('<option value="0">' + MyLang.getMsg("OR_CONDITION") + '</option>');
                cmbCond.append('<option value="1">' + MyLang.getMsg("AND_CONDITION") + '</option>');
                cmbCond.prop('selectedIndex', 0);
                // Me.Controls("cmbCond" & i).ListIndex = 0
              }
              WindowApprover.flg_cmbCondInit = 1;  //⇒Changeボタンが発動し、条件のかつ・またはデータが更新されるのを防ぐ

              $window_content.find(':input[name="ckPriority"]').change(function(){
                if($(this).is(':checked')) {
                  WindowApprover.conditionManager.ConditonPriority("1");
                }else {
                  WindowApprover.conditionManager.ConditonPriority("0");
                }
              });

              // パーツ編集
              WindowApprover.PartsEdit();

//              var btnCond = $window_content.find(':input[name="btnCond' + i + '"]');
//              var btnDel = $window_content.find(':input[name="btnDel' + i + '"]');
//              var txtCond = $window_content.find(':input[name="txtCond' + i + '"]');
//              var cmbCond = $window_content.find(':input[name="cmbCond' + i + '"]');


            },
            hide: function () {
              WindowApprover.close();
            }
          }
        });
      }
      win.show();
    }
  };

  WindowStepProcess = {
    close: function () {
      var win = Ext.getCmp('window_step_process');
      if (win) {
        win.close();
      }
    },
    showWindow: function (aRecord) {
      var win = Ext.getCmp('window_step_process');
      if (!win) {
        var buttons = [];
        buttons.push(
          new Ext.Button({
            id: 'btn_update_window_step_process',
            text: MyLang.getMsg('BTN_UPDATE'),
            handler: function () {
              var sStepProcessValue, sStepProcessString;
              var $window_content = $('#window_step_process');
              var txtAutoApprove = $window_content.find('input[name="txtAutoApprove"]').val();
              // 入力チェック
              if (txtAutoApprove == "" || !IsNumeric(txtAutoApprove)) {
                Ext.Msg.show({
                  icon: Ext.MessageBox.INFO,
                  msg: MyLang.getMsg('MSG_ALERT_2'),
                  buttons: Ext.Msg.OK
                });
                return;
              }

              // 単独承認/全員承認
              if ($window_content.find('#opOnly').is(':checked')) {
                // 単独承認
                sStepProcessValue = "0";
                sStepProcessString = MyLang.getMsg("APPROVE_SINGLE");
              } else {
                // 全員承認
                sStepProcessValue = "1";
                sStepProcessString = MyLang.getMsg("APPROVE_ALL_MEMBER");
              }

              // スキップ設定
              if ($window_content.find('input[name="ckSkipOk"]').is(':checked')) {
                // スキップ可能とする
                sStepProcessValue = sStepProcessValue + ",1";
                sStepProcessString = sStepProcessString + vbCrLf + MyLang.getMsg("APPROVE_SKIP");
              } else {
                // スキップ可能としない
                sStepProcessValue = sStepProcessValue + ",0"
              }

              // 自動承認設定
              sStepProcessValue = sStepProcessValue + "," + txtAutoApprove;
              if (txtAutoApprove != "0") {
                sStepProcessString = sStepProcessString + vbCrLf + MyLang.getMsg("APPROVE_AUTO") + '(' + txtAutoApprove + MyLang.getMsg("DAY") + ')';
              }

              // メール通知
              if ($window_content.find('input[name="ckSendMail"]').is(':checked')) {
                // メール通知しない
                sStepProcessValue = sStepProcessValue + ",1";
                sStepProcessString = sStepProcessString + vbCrLf + MyLang.getMsg("CHECK_SEND_MAIL");
              } else {
                sStepProcessValue = sStepProcessValue + ",0";
              }

              sStepProcessString = sStepProcessString + vbCrLf;


              // 条件値の保存
              // ActiveSheet.Cells(iTargetRow, Range(RANGE_STEP_PROCESS_VALUE).Column) = sStepProcessValue
              // ActiveSheet.Cells(iTargetRow, Range(RANGE_STEP_PROCESS).Column) = sStepProcessString
              var rowSelected = MainLayout.getRowSelected();
              if (rowSelected) {
                rowSelected.set('step_process', sStepProcessString);
                rowSelected.set('step_process_value', sStepProcessValue);
              }
              // フォームを閉じる
              WindowStepProcess.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              WindowStepProcess.close();
            }
          })
        );


        win = new Ext.Window({
          id: 'window_step_process',
          title: MyLang.getMsg('TITLE_WINDOW_STEP_PROCESS'),
          layout: 'fit',
          width: 400,
          height: 420,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="window_step_process_content" class="container"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              var $window_content = $('#window_step_process_content');
              $window_content.html('');
              var vHtml = '';

              vHtml += '<div class="main_title">';
              vHtml += '<span>' + MyLang.getMsg("APPROVE_SINGLE_OR_ALL") + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="group_box">';
              vHtml += '<div class="item">';
              vHtml += '<input id="opOnly" name="OnrlyOrAll" type="radio" checked> ' + MyLang.getMsg("APPROVE_PROCESS_SINGLE") + ' <br>';
              vHtml += '</div>';
              vHtml += '<div class="item">';
              vHtml += '<input id="opAll" name="OnrlyOrAll" type="radio">' + MyLang.getMsg("APPROVE_PROCESS_ALL") + ' <br>';
              vHtml += '</div>';
              vHtml += '</div>';

              vHtml += '<div class="main_title">';
              vHtml += '<span>' + MyLang.getMsg("APPROVE_SKIP_SETTING") + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="group_box">';
              vHtml += '<div class="item">';
              vHtml += '<input name="ckSkipOk" type="checkbox"> ' + MyLang.getMsg("APPROVE_PROCESS_SKIP");
              vHtml += '</div>';
              vHtml += '</div>';

              vHtml += '<div class="main_title" style="display:none;">';
              vHtml += '<span>' + MyLang.getMsg("APPROVE_AUTO_SETTING") + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="group_box" style="display:none;">';
              vHtml += '<div class="item">';
              vHtml += '<input name="txtAutoApprove" type="number" value="0" style="width:50px;"> ' + MyLang.getMsg("APPROVE_AUTO_SETTING_EXP_1") + ' <br><br>';
              vHtml += '<span>' + MyLang.getMsg("APPROVE_AUTO_SETTING_EXP_2") + '</span>';
              vHtml += '</div>';
              vHtml += '</div>';

              vHtml += '<div class="main_title">';
              vHtml += '<span>' + MyLang.getMsg("CHECK_SEND_NOTIFY") + '</span>';
              vHtml += '</div>';
              vHtml += '<div class="group_box">';
              vHtml += '<div class="item">';
              vHtml += '<input name="ckSendMail" type="checkbox"> ' + MyLang.getMsg("CHECK_SEND_NOTIFY_EXP_1");
              vHtml += '</div>';
              vHtml += '</div>';

              $window_content.html(vHtml);

              // セル取得
              var sValue, sFlg;
              sValue = aRecord.get('step_process_value');
              if (sValue == "") {
                sValue = "0,0,0,0";
              }

              // フラグ分解
              sFlg = sValue.split(",");

              // 単独承認/全員承認
              if (sFlg[0] == '0') {
                $window_content.find('#opOnly').prop('checked', true);
              } else {
                $window_content.find('#opAll').prop('checked', true);
              }

              // スキップ設定
              if (sFlg[1] == '1') {
                $window_content.find('input[name="ckSkipOk"]').prop('checked', true);
              }

              // 自動承認設定
              $window_content.find('input[name="txtAutoApprove"]').val(sFlg[2]);

              // メール通知
              if (sFlg[3] == '1') {
                $window_content.find('input[name="ckSendMail"]').prop('checked', true);
              }

            },
            hide: function () {
              WindowStepProcess.close();
            }
          }
        });
      }
      win.show();
    }
  };

  WindowAction = {
    close: function () {
      var win = Ext.getCmp('window_action');
      if (win) {
        win.close();
      }
    },
    showWindow: function (aRecord) {
      var win = Ext.getCmp('window_action');
      if (!win) {
        var buttons = [];

        buttons.push(
          new Ext.Button({
            id: 'btn_update_window_action',
            text: MyLang.getMsg('BTN_UPDATE'),
            handler: function () {
              var sActionTypeValue, sActionTypeString;
              var $window_content = $('#window_action_content');
              // 承認タイプ
              if ($window_content.find('#opApprove').is(':checked')) {
                sActionTypeValue = "1";
                sActionTypeString = MyLang.getMsg("OPTION_APPROVE");
              } else if ($window_content.find('#opFinalApprove').is(':checked')) {
                sActionTypeValue = "2";
                sActionTypeString = MyLang.getMsg("OPTION_APPROVE_FINAL");
              } else if ($window_content.find('#opLook').is(':checked')) {
                sActionTypeValue = "3";
                sActionTypeString = MyLang.getMsg("OPTION_ROUTING");
              }

              // 承認アクションオプション
              if (sActionTypeValue == "1" || sActionTypeValue == "2") {

                if ($window_content.find('input[name="ckNoReject"]').is(':checked')) {
                  // 否決ができないプロセスとする
                  sActionTypeValue = sActionTypeValue + ",1";
                  sActionTypeString = sActionTypeString + vbCrLf + "　" + MyLang.getMsg("OPTION_NO_REJECTED");
                } else {
                  sActionTypeValue = sActionTypeValue + ",0";
                }

                if ($window_content.find('input[name="ckNoRemand"]').is(':checked')) {
                  // 差し戻しができないプロセスとする
                  sActionTypeValue = sActionTypeValue + ",1";
                  sActionTypeString = sActionTypeString + vbCrLf + "　" + MyLang.getMsg("OPTION_NO_REVERTED");
                } else {
                  sActionTypeValue = sActionTypeValue + ",0";
                }

                if ($window_content.find('input[name="ckNoAgency"]').is(':checked')) {
                  // 代理承認ができないプロセスとする
                  sActionTypeValue = sActionTypeValue + ",1";
                  sActionTypeString = sActionTypeString + vbCrLf + "　" + MyLang.getMsg("OPTION_NO_AGENCY_APPROVE");
                } else {
                  sActionTypeValue = sActionTypeValue + ",0";
                }
              } else {
                // 承認タイプ＝回覧
                sActionTypeValue = sActionTypeValue + ",0,0,0";
              }


              // セル出力
              //ActiveSheet.Cells(iTargetRow, Range(RANGE_ACTION_TYPE_VALUE).Column) = sActionTypeValue
              //ActiveSheet.Cells(iTargetRow, Range(RANGE_ACTION_TYPE).Column) = sActionTypeString
              var rowSelected = MainLayout.getRowSelected();
              if (rowSelected) {
                rowSelected.set('action_type', sActionTypeString);
                rowSelected.set('action_type_value', sActionTypeValue);
              }
              // 閉じる
              WindowAction.close();
            }
          })
        );
        buttons.push(
          new Ext.Button({
            text: MyLang.getMsg('BTN_CANCEL'),
            handler: function () {
              WindowAction.close();
            }
          })
        );

        win = new Ext.Window({
          id: 'window_action',
          title: MyLang.getMsg('TITLE_WINDOW_ACTION'),
          layout: 'fit',
          width: 300,
          height: 200,
          closeAction: 'hide',
          plain: true,
          modal: true,
          items: new Ext.Panel({
            border: false,
            autoScroll: true,
            html: '<div id="window_action_content" class="container"></div>'
          }),
          buttons: buttons,
          listeners: {
            afterRender: function () {
              var $window_content = $('#window_action_content');
              $window_content.html('');
              var vHtml = '';

              vHtml += '<div class="item">';
              vHtml += '<input id="opApprove" name="action_type" type="radio" checked> ' + MyLang.getMsg("OPTION_APPROVE_PROCESS");
              vHtml += '&nbsp;&nbsp;<input id="opFinalApprove" name="action_type" type="radio"> ' + MyLang.getMsg("OPTION_APPROVE_PROCESS_FINAL");
              vHtml += '</div>';

              vHtml += '<div class="item pdl20"  style="display:none;">';
              vHtml += '<input name="ckNoReject" type="checkbox"> ' + MyLang.getMsg("OPTION_NO_REJECTED") + ' <br>';
              vHtml += '<input name="ckNoRemand" type="checkbox"> ' + MyLang.getMsg("OPTION_NO_REVERTED") + ' <br>';;
              vHtml += '</div>';
              vHtml += '<div class="item pdl20">';
              vHtml += '<input name="ckNoAgency" type="checkbox"> ' + MyLang.getMsg("OPTION_NO_AGENCY_APPROVE");
              vHtml += '</div>';

              vHtml += '<div class="item">';
              vHtml += '<input id="opLook" name="action_type" type="radio"> ' + MyLang.getMsg("OPTION_ROUTING_PROCESS");
              vHtml += '</div>';

              $window_content.html(vHtml);

              // load data

              // セル取得
              var sActionTypeValue = aRecord.get('action_type_value');

              // フラグ分解
              var sFlg, i;
              sFlg = sActionTypeValue.split(",");

              // 承認タイプ
              switch (sFlg[0]) {
                case '1':
                  $window_content.find('#opApprove').prop('checked', true);
                  break;
                case '2':
                  $window_content.find('#opFinalApprove').prop('checked', true);
                  break;
                case '3':
                  $window_content.find('#opLook').prop('checked', true);
                  break;
              }

              // 否決ができないプロセスとする
              if (sFlg[1] == '1') {
                $window_content.find('input[name="ckNoReject"]').prop('checked', true);
              }

              // 差し戻しができないプロセスとする
              if (sFlg[2] == '1') {
                $window_content.find('input[name="ckNoRemand"]').prop('checked', true);
              }

              // 代理承認ができないプロセスとする
              if (sFlg[3] == '1') {
                $window_content.find('input[name="ckNoAgency"]').prop('checked', true);
              }

              $window_content.find('#opApprove').click(function () {
                // オプションチェックボックスの制御
                $window_content.find('input[name="ckNoReject"]').removeAttr('disabled');
                $window_content.find('input[name="ckNoRemand"]').removeAttr('disabled');
                $window_content.find('input[name="ckNoAgency"]').removeAttr('disabled');
              });

              $window_content.find('#opFinalApprove').click(function () {
                // オプションチェックボックスの制御
                $window_content.find('input[name="ckNoReject"]').removeAttr('disabled');
                $window_content.find('input[name="ckNoRemand"]').removeAttr('disabled');
                $window_content.find('input[name="ckNoAgency"]').removeAttr('disabled');
              });

              $window_content.find('#opLook').click(function () {
                // オプションチェックボックスの制御
                $window_content.find('input[name="ckNoReject"]').attr('disabled', 'disabled');
                $window_content.find('input[name="ckNoRemand"]').attr('disabled', 'disabled');
                $window_content.find('input[name="ckNoAgency"]').attr('disabled', 'disabled');
              });

            },
            hide: function () {
              WindowAction.close();
            }
          }
        });
      }
      win.show();
    }
  };

  MainLayout = {
    selRecordStore: null,
    currentRowIndex: -1,
    handlerShowWindow: function (grid, rowIndex, columnIndex, e) {
      var store = grid.getStore();
      var record = store.getAt(rowIndex);
      switch (columnIndex) {
        case 0:
          break;
        case 1:
          break;
        case 2:
          WindowAction.showWindow(record);
          break;
        case 3:
          WindowStepProcess.showWindow(record);
          break;
        case 4:
          WindowApprover.showWindow(record);
          break;
        case BUTTON_TYPE_SELECT:
          WindowButtonSetting.showWindow(grid, record, columnIndex);
          break;
        case BUTTON_TYPE_SELECT_DEP:
          WindowButtonSetting.showWindow(grid, record, columnIndex);
          break;
        case BUTTON_TYPE_DEL:
          WindowButtonSetting.showWindow(grid, record, columnIndex);
          break;
        case 8:
          WindowEditableItem.showWindow(grid, record, columnIndex);
          break;
        case 9:
          WindowOtherSetting.showWindow(grid, record, columnIndex);
          break;
      }
    },
    nextTab: function (aTabIndex) {
      aTabIndex = parseInt(aTabIndex);
      MyPanel.tabSet.setActiveTab(MyPanel.tabDefine[aTabIndex].name);
    },
    createSampleData: function () {
      // sample static data for the store
      return [
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
      ];
    },
    loadData: function(){
      var data = [];
      try {
        var json_data_grid_string = $('#json_data_grid').val();
        var json_data_grid = JSON.parse(json_data_grid_string);
      }catch(e){
//        console.log(e);
        return data;
      }

      $.each(json_data_grid, function(){
        var editable_item = '',
          editable_item_value = '',
          other_setting = '',
          other_setting_value = '';
        if(typeof this.editable_item != 'undefined'){
          editable_item = this.editable_item;
        }
        if(typeof this.editable_item_value != 'undefined'){
          editable_item_value = this.editable_item_value;
        }
        if(typeof this.other_setting != 'undefined'){
          other_setting = this.other_setting;
        }
        if(typeof this.other_setting_value != 'undefined'){
          other_setting_value = this.other_setting_value;
        }
        data.push([
          this.process_no,
          this.approver_name,
          this.action_type,
          this.action_type_value,
          this.step_process,
          this.step_process_value,
          this.condition,
          this.condition_value,
          this.select_button,
          this.select_button_value,
          this.select_dep_button,
          this.select_dep_button_value,
          this.del_button,
          this.del_button_value,
          editable_item,
          editable_item_value,
          other_setting,
          other_setting_value
        ]);
      });

      return data;
    },
    getRowSelected: function () {
      var grid = Ext.getCmp('grid_main'), rowSelected = null;
      if (grid) {
        var selectionModel = grid.getSelectionModel();
        rowSelected = selectionModel.getSelected();
      }
      return rowSelected;
    },
    createColumnGrid: function () {
      return new Ext.grid.ColumnModel({
        columns: [
          {
            id: 'process_no',
            header: MyLang.getMsg('PROCESS_NO'),
            width: 80,
            dataIndex: 'process_no',
            row_selected: null,
            editor: new Ext.form.TextField({
              allowBlank: true,
              listeners: {
                beforeshow: function (cmp) {
                  cmp.row_selected = MainLayout.getRowSelected();
                },
                change: function (cmp, newValue, oldValue) {
                  if (newValue != oldValue && cmp.row_selected) {
                    var rowSelected = cmp.row_selected;
                    if (rowSelected) {
                      rowSelected.set('process_no', newValue);
                    }
                  }
                }
              }
            })
          },
          {
            id: 'approver_name',
            header: MyLang.getMsg('APPROVER_NAME'),
            width: 100,
            dataIndex: 'approver_name',
            row_selected: null,
            editor: new Ext.form.TextField({
              allowBlank: true,
              listeners: {
                beforeshow: function (cmp) {
                  cmp.row_selected = MainLayout.getRowSelected();
                },
                change: function (cmp, newValue, oldValue) {
                  if (newValue != oldValue && cmp.row_selected) {
                    var rowSelected = cmp.row_selected;
                    if (rowSelected) {
                      rowSelected.set('approver_name', newValue);
                    }
                  }
                }
              }
            })
          },
          {
            id: 'action_type',
            header: MyLang.getMsg('ACTION_TYPE'),
            width: 100,
            dataIndex: 'action_type'
          },
          {
            id: 'step_process',
            header: MyLang.getMsg('STEP_PROCESS'),
            width: 100,
            dataIndex: 'step_process'
          },
          {
            id: 'condition',
            header: MyLang.getMsg('CONDITION'),
            width: 100,
            dataIndex: 'condition'
          },
          {
            id: 'select_button',
            header: MyLang.getMsg('SELECT_BUTTON'),
            width: 100,
            dataIndex: 'select_button'
          },
          {
            id: 'select_dep_button',
            header: MyLang.getMsg('SELECT_DEP_BUTTON'),
            width: 100,
            dataIndex: 'select_dep_button'
          },
          {
            id: 'del_button',
            header: MyLang.getMsg('DEL_BUTTON'),
            width: 100,
            dataIndex: 'del_button'
          },
          {
            id: 'editable_item',
            header: MyLang.getMsg('EDITABLE_ITEM'),
            width: 100,
            dataIndex: 'editable_item'
          },
          {
            id: 'other_setting',
            header: MyLang.getMsg('OTHER_SETTING'),
            width: 120,
            dataIndex: 'other_setting'
          }
        ],
        defaults: {
          menuDisabled: true,
          sortable: false,
          draggable: false
        }
      });
    },
    createDatastore: function () {
      return new Ext.data.ArrayStore({
        id: 'store_main',
        fields: [
          {name: 'process_no'},
          {name: 'approver_name'},
          {name: 'action_type'},
          {name: 'action_type_value'},
          {name: 'step_process'},
          {name: 'step_process_value'},
          {name: 'condition'},
          {name: 'condition_value'},
          {name: 'select_button'},
          {name: 'select_button_value'},
          {name: 'select_dep_button'},
          {name: 'select_dep_button_value'},
          {name: 'del_button'},
          {name: 'del_button_value'},
          {name: 'editable_item'},
          {name: 'editable_item_value'},
          {name: 'other_setting'},
          {name: 'other_setting_value'}
        ]
      });
    },
    init: function () {
      return new Ext.grid.EditorGridPanel({
        id: 'grid_main',
        renderTo: 'grid_main_render',
        layout: 'fit',
        columnLines: true,
        cm: MainLayout.createColumnGrid(),
        sm: new Ext.grid.RowSelectionModel({
          singleSelect: true,
          listeners: {
            rowselect: function (smObj, rowIndex, record) {
              MainLayout.selRecordStore = record;
              MainLayout.currentRowIndex = rowIndex;
              Ext.getCmp('btn_add_before').enable();
              Ext.getCmp('btn_add_after').enable();
              Ext.getCmp('btn_delete').enable();
            }
          }
        }),
        bbar: [
          {
            xtype: 'button',
            text: MyLang.getMsg('BTN_ADD_ROW'),
            handler: function () {
              MainLayout.addNewRecord();
            }
          },
          {
            xtype: 'button',
            id: 'btn_add_before',
            text: MyLang.getMsg('BTN_ADD_BEFORE'),
            disabled: true,
            handler: function () {
              MainLayout.addBeforeNewRecord();
            }
          },
          {
            xtype: 'button',
            id: 'btn_add_after',
            text: MyLang.getMsg('BTN_ADD_AFTER'),
            disabled: true,
            handler: function () {
              MainLayout.addAfterNewRecord();
            }
          },
          {
            xtype: 'button',
            id: 'btn_delete',
            text: MyLang.getMsg('BTN_ROW_DELETE'),
            disabled: true,
            handler: function () {
              Ext.Msg.show({
                //title: MyLang.getMsg('SATERAITO_BBS'),
                icon: Ext.MessageBox.QUESTION,
                msg: MyLang.getMsg('MSG_ROW_DELETE'),
                buttons: Ext.Msg.OKCANCEL,
                fn: function (buttonId) {
                  if (buttonId == 'ok') {
                    MainLayout.deleteRecord();
                  }
                }
              });
            }
          }
        ],
        store: MainLayout.createDatastore(),
        autoExpandColumn: 'condition',
        clicksToEdit: 1,
        stripeRows: true,
        stateId: 'grid',
        height: 400,
        // frame: true,
        listeners: {
          celldblclick: function (grid, rowIndex, columnIndex, e) {
            MainLayout.handlerShowWindow(grid, rowIndex, columnIndex, e)
          },
          afterRender: function () {
            var grid = Ext.getCmp('grid_main');
            var store = grid.getStore();
            var data = MainLayout.loadData();
            if(data.length === 0){
              data = MainLayout.createSampleData();
            }
            store.loadData(data);

//            MainLayout.addNewRecord(function(){
//              MainLayout.addNewRecord();
//            });

          }
        }
      });
    },
    getNewRecord: function(grid, store){
      var count = store.getCount();
      var MyDataRecord = Ext.data.Record.create([
        {name: 'process_no'},
        {name: 'approver_name'},
        {name: 'action_type'},
        {name: 'action_type_value'},
        {name: 'step_process'},
        {name: 'step_process_value'},
        {name: 'condition'},
        {name: 'condition_value'},
        {name: 'select_button'},
        {name: 'select_button_value'},
        {name: 'select_dep_button'},
        {name: 'select_dep_button_value'},
        {name: 'del_button'},
        {name: 'del_button_value'},
        {name: 'editable_item'},
        {name: 'editable_item_value'}
      ]);
      var newRecord = new MyDataRecord({
        //process_no: count + 1,
        process_no: '',
        approver_name: '',
        action_type: '',
        action_type_value: '0,0,0,0',
        step_process: '',
        step_process_value: '0,0,0,0',
        condition: '',
        condition_value: '',
        select_button: '',
        select_button_value: '',
        select_dep_button: '',
        select_dep_button_value: '',
        del_button: '',
        del_button_value: '',
        editable_item: '',
        editable_item_value: '',
        other_setting: '',
        other_setting_value: ''
      });
      return newRecord;
    },
    addBeforeNewRecord: function (callback) {
      var me = this;
      if (me.currentRowIndex > -1){
        var grid = Ext.getCmp('grid_main');
        var store = grid.getStore();
        var newRecord = me.getNewRecord(grid, store);
        grid.stopEditing();
        var idxInsert = me.currentRowIndex;
        store.insert(idxInsert, newRecord);
        grid.getSelectionModel().clearSelections();
        grid.startEditing(idxInsert, 0);

        if (typeof callback === 'function') {
          (function () {
            callback();
          }).defer(200);
        }
      }
    },
    addAfterNewRecord: function (callback) {
      var me = this;
      if (me.currentRowIndex > -1){
        var grid = Ext.getCmp('grid_main');
        var store = grid.getStore();
        var newRecord = me.getNewRecord(grid, store);
        grid.stopEditing();
        var idxInsert = me.currentRowIndex +1;
        store.insert(idxInsert, newRecord);
        grid.startEditing(idxInsert, 0);
        grid.getSelectionModel().clearSelections();

        if (typeof callback === 'function') {
          (function () {
            callback();
          }).defer(200);
        }
      }
    },

    deleteRecord: function (callback) {
      var me = this;
      if (me.currentRowIndex > -1){
        var grid = Ext.getCmp('grid_main');
        var store = grid.getStore();
        grid.stopEditing();
        store.removeAt(me.currentRowIndex);
        grid.getSelectionModel().clearSelections();

        if (typeof callback === 'function') {
          (function () {
            callback();
          }).defer(200);
        }
      }
    },
    addNewRecord: function (callback) {
      var me = this;
      var grid = Ext.getCmp('grid_main');
      var store = grid.getStore();
      var count = store.getCount();
      var newRecord = me.getNewRecord(grid, store);

      grid.stopEditing();
      store.add(newRecord);
      grid.getSelectionModel().clearSelections();
      grid.startEditing(0, 0);

      if (typeof callback === 'function') {
        (function () {
          callback();
        }).defer(200);
      }
    },
    generateHtmlRouteApprove: function(){
      var sHtmlHeaderTemplate = '';                       // HTMLヘッダーテンプレート
      var sHtmlDetailTemplate = '';                       // HTML明細テンプレート
      var sHtmlFooterTemplate = '';                       // HTMLフッターテンプレート
      var sNameWidth = '';                                // プロセス名称幅
      var sMemberWidth = '';                              // プロセスメンバー幅

      var sGenerateHtml = '';                             // 出力HTML
      var sDetailHtml = '';                               // 変数明細HTML
      var i;                                              // 汎用変数
      var iTargetRow;                                     // 処理対象行
      var sValue = '';                                    // 設定情報
      var sEditValue = '';                                // 編集情報
      var sEditValue1 = '';                               // 編集情報1
      var sEditValue2 = '';                               // 編集情報2
      var sEditValue3 = '';                               // 編集情報3
      var sFlg;                                           // フラグ配列
      var sCondition;                                     // 承認者条件
      var conditionManager = new ApproveConditionManager();     // 条件管理クラス

      // HTML編集定数
      var CONST_DEFINED = {
        APPROVE_TYPE_FINAL: "final_approve",                                    // 承認タイプ＝決裁
        APPROVE_TYPE_LOOK: 'approve_type="look"',                             // 承認タイプ＝回覧
        NO_REJECT: "no_reject",                                                 // 否決できない
        NO_REMAND: "no_remand",                                                 // 差し戻しできない
        NO_AGENCY: "no_agency",                                                 // 代理承認できない
        COMMENT_PRE: "<!--",                                                    // コメントプレフィックス
        COMMENT_SUF: "-->",                                                     // コメントサフィックス
        OK_TO_REMOVE: "ok_to_remove",                                           // 削除アイコンの表示（申請者）
        OK_TO_REMOVE_PROCESS: 'ok_to_remove_process_number="@PROCESS@"',      // 削除アイコンの表示（承認者）
        OPEN_NOTIFICATION: 'ok_to_open_notification ',                                      // 開封通知設定アイコンの表示（申請者）
        OPEN_NOTIFICATION_PROCESS: 'ok_to_open_notification_process_number="@PROCESS@"',  // 開封通知設定アイコンの表示（承認者）
        NEED_ALL: "need_all_approve_to_go_next",                                // 全員承認
        DO_NOT_SEND_EMAIL: "do_not_send_email",                                 // メール通知しない
        SKIP_OK: "skip_ok",                                                     // スキップOK
        AUTO_APPROVE: 'is_auto_approve approve_limit_days="@DAY@"',           // 自動承認
        UPDATE_CLASS: 'ok_to_update_class="@CLASS@"',                         // 編集可能クラス
        UPDATE_FIELD: 'ok_to_update_field="@FIELD@"'                         // 編集可能クラス
      };

      var APPROVE_TYPE_FINAL  = "final_approve";                                    // 承認タイプ＝決裁
      var APPROVE_TYPE_LOOK  = 'approve_type="look"';                             // 承認タイプ＝回覧
      var NO_REJECT  = "no_reject";                                                 // 否決できない
      var NO_REMAND  = "no_remand";                                                 // 差し戻しできない
      var NO_AGENCY  = "no_agency";                                                 // 代理承認できない
      var COMMENT_PRE  = "<!--";                                                    // コメントプレフィックス
      var COMMENT_SUF  = "-->";                                                     // コメントサフィックス
      var OK_TO_REMOVE  = "ok_to_remove";                                           // 削除アイコンの表示（申請者）
      var OK_TO_REMOVE_PROCESS  = 'ok_to_remove_process_number="@PROCESS@"';      // 削除アイコンの表示（承認者）
      var OPEN_NOTIFICATION = 'ok_to_open_notification ';                                      // 開封通知設定アイコンの表示（申請者）
      var OPEN_NOTIFICATION_PROCESS = 'ok_to_open_notification_process_number="@PROCESS@"';  // 開封通知設定アイコンの表示（承認者）
      var OK_TO_ATTACHFILE = 'ok_to_attachfile';
      var NEED_ALL  = "need_all_approve_to_go_next";                                // 全員承認
      var DO_NOT_SEND_EMAIL  = "do_not_send_email";                                 // メール通知しない
      var SKIP_OK  = "skip_ok";                                                     // スキップOK
      var AUTO_APPROVE  = 'is_auto_approve approve_limit_days="@DAY@"';           // 自動承認
      var UPDATE_CLASS  = 'ok_to_update_class="@CLASS@"';                         // 編集可能クラス
      var UPDATE_FIELD  = 'ok_to_update="@FIELD@"';                         // 編集可能クラス

      // テンプレート読み込み
      var tab = $('#tabs-3');
      sNameWidth = tab.find('#name_width_value').val();
      sMemberWidth = tab.find('#member_width_value').val();
      sHtmlHeaderTemplate = tab.find('#html_header_value').val();
      sHtmlFooterTemplate = tab.find('#html_footer_value').val();

      // ===============================================================
      // ヘッダー編集
      // ===============================================================
      sGenerateHtml = sHtmlHeaderTemplate;

      var grid = Ext.getCmp('grid_main');
      var store = grid.getStore();

      store.each(function () {

        var record = this;

        if(record.get('process_no').toString().trim()==='') return true;

        // ======< テンプレートロード >======
        sHtmlDetailTemplate = tab.find('#html_detail_value').val();
        sDetailHtml = sHtmlDetailTemplate;

        // ====================================< プロセス№　編集処理 >====================================
        // 値取得
        sValue = record.get('process_no');

        // プロセス№編集
        sEditValue = sValue.toString();
        sDetailHtml = sDetailHtml.replace(/@NUM@/g, sEditValue); //Replace(sDetailHtml, "@NUM@", sEditValue);


        // ====================================< プロセス名称　編集処理 >====================================
        // 値取得
        sValue = record.get('approver_name');

        // プロセス名称編集
        sEditValue = sValue;
        sDetailHtml = sDetailHtml.replace(/@PROCESS_NAME@/g, sEditValue); //Replace(sDetailHtml, "@PROCESS_NAME@", sEditValue)

        // プロセス名称幅、承認者幅編集
        sDetailHtml = sDetailHtml.replace(/@NAME_WIDTH@/g, sNameWidth); //Replace(sDetailHtml, "@NAME_WIDTH@", sNameWidth)
        sDetailHtml = sDetailHtml.replace(/@MEMBER_WIDTH@/g, sMemberWidth); //Replace(sDetailHtml, "@MEMBER_WIDTH@", sMemberWidth)


        // ====================================< 承認/回覧　編集処理 >====================================
        // 値取得
        sValue = record.get('action_type_value'); //.Cells(iTargetRow, .Range(RANGE_ACTION_TYPE_VALUE).Column)
        sEditValue = '';
        // フラグ配列展開
        // sFlg(0) 1:承認　2:決裁　3:回覧
        // sFlg(1) 0:通常プロセス　1:否決はできない
        // sFlg(2) 0:通常プロセス　1:差戻しはできない
        // sFlg(3) 0:通常プロセス　1:代理承認はできない

        if (sValue == "") {
          sValue = "1,0,0,0";
        }
        sFlg = sValue.split(",");

        // 承認タイプ編集
        switch (sFlg[0]) {
          case '1':
            // 承認
            sEditValue = "";
            break;
          case '2':
            // 決裁
            sEditValue = APPROVE_TYPE_FINAL;
            break;
          case '3':
            // 回覧
            sEditValue = APPROVE_TYPE_LOOK;
            break;
        }

        // 否決はできない
        if (sFlg[1] == '1') {
          sEditValue = sEditValue + " " + NO_REJECT;
        }

        // 差戻しはできない
        if (sFlg[2] == '1') {
          sEditValue = sEditValue + " " + NO_REMAND;
        }

        // 代理承認はできない
        if (sFlg[3] == '1') {
          sEditValue = sEditValue + " " + NO_AGENCY;
        }

        sDetailHtml = sDetailHtml.replace(/@APPROVE_TYPE@/g, sEditValue.toString()); //Replace(sDetailHtml, "@APPROVE_TYPE@", sEditValue)

        // ====================================< プロセスの進め方　編集処理 >====================================
        // 値取得
        sValue = record.get('step_process_value'); //.Cells(iTargetRow, .Range(RANGE_STEP_PROCESS_VALUE).Column)
        sEditValue = '';

        // フラグ配列展開
        // sFlg(0) 0:単独承認　1:全員承認
        // sFlg(1) 0:通常プロセス　1:スキップ可
        // sFlg(2) 自動承認基準日数（0は指定しない）
        // sFlg(3) 0:通常プロセス　1:メール通知しない

        if (sValue == "") {
          sValue = "0,0,0,0";
        }
        sFlg = sValue.split(",");

        // 単独承認/全員承認 編集
        if (sFlg[0] == '1') {
          sEditValue = NEED_ALL;
        }

        // スキップ可
        if (sFlg[1] == '1') {
          sEditValue = sEditValue + " " + SKIP_OK;
        }

        // 自動承認
        if (sFlg[2] != '0') {
          sEditValue = sEditValue + " " + AUTO_APPROVE.replace(/@DAY@/g, sFlg[2].toString()); //Replace(AUTO_APPROVE, "@DAY@", sFlg(2));
        }

        // メール通知しない
        if (sFlg[3] == '1') {
          sEditValue = sEditValue + " " + DO_NOT_SEND_EMAIL;
        }

        sDetailHtml = sDetailHtml.replace(/@STEP_PROCESS@/g, sEditValue); //Replace(sDetailHtml, "@STEP_PROCESS@", sEditValue)

        // ====================================< 承認者の指定条件　編集処理 >====================================
        // 値取得
        sValue = record.get('condition_value'); // .Cells(iTargetRow, .Range(RANGE_CONDITION_VALUE).Column)

        // 承認者条件の編集はConditionManagerを利用する
        conditionManager = new ApproveConditionManager();
        conditionManager.Init(sValue);

        sEditValue = conditionManager.GetConditionHtml();
        sDetailHtml = sDetailHtml.replace(/@CONDITION@/g, sEditValue); //Replace(sDetailHtml, "@CONDITION@", sEditValue)


        // ====================================< 追加ボタン　編集処理 >====================================
        // 値取得
        sValue = record.get('select_button_value'); // .Cells(iTargetRow, .Range(RANGE_SELECT_BUTTON_VALUE).Column)

        // フラグ配列展開
        // sFlg(0) 0:承認者画面で表示しない　1:申請者画面で表示
        // sFlg(1) 空:承認者画面では表示しない　入力有り：表示をする承認プロセス番号

        if (sValue == "") {
          sValue = "0:";
        }
        sFlg = sValue.split(":");

        // 申請者画面での表示編集
        if (sFlg[0] == "0") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_SEL_BTN_1@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_SEL_BTN_1@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_SEL_BTN_1@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_SEL_BTN_1@", sEditValue2)

        // 承認者画面での表示編集
        if (sFlg[1] == "") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
          sEditValue = ""
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
          sEditValue = sFlg[1].toString();
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_SEL_BTN_2@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_SEL_BTN_2@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_SEL_BTN_2@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_SEL_BTN_2@", sEditValue2)
        sDetailHtml = sDetailHtml.replace(/@SEL_SHOW_NUM@/g, sEditValue); //Replace(sDetailHtml, "@SEL_SHOW_NUM@", sEditValue)


        // ====================================< 追加ボタン(部署指定)　編集処理 >====================================
        // 値取得
        sValue = record.get('select_dep_button_value'); // .Cells(iTargetRow, .Range(RANGE_SELECT_DEP_BUTTON_VALUE).Column)

        // フラグ配列展開
        // sFlg(0) 0:申請者画面で表示しない　1:申請者画面で表示
        // sFlg(1) 空:承認者画面では表示しない　入力有り：表示をする承認プロセス番号

        if (sValue == "") {
          sValue = "0:";
        }
        sFlg = sValue.split(":");

        // 申請者画面での表示編集
        if (sFlg[0] == "0") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_SEL_DEP_BTN_1@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_SEL_DEP_BTN_1@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_SEL_DEP_BTN_1@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_SEL_DEP_BTN_1@", sEditValue2)

        // 承認者画面での表示編集
        if (sFlg[1] == "") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
          sEditValue = "";
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
          sEditValue = sFlg[1].toString();
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_SEL_DEP_BTN_2@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_SEL_DEP_BTN_2@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_SEL_DEP_BTN_2@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_SEL_DEP_BTN_2@", sEditValue2)
        sDetailHtml = sDetailHtml.replace(/@SEL_DEP_SHOW_NUM@/g, sEditValue); //Replace(sDetailHtml, "@SEL_DEP_SHOW_NUM@", sEditValue)

        // ====================================< 追加ボタン(部署指定)　編集処理 >====================================
        // 値取得
        sValue = record.get('select_dep_button_value'); // .Cells(iTargetRow, .Range(RANGE_SELECT_DEP_BUTTON_VALUE).Column)

        // フラグ配列展開
        // sFlg(0) 0:申請者画面で表示しない　1:申請者画面で表示
        // sFlg(1) 空:承認者画面では表示しない　入力有り：表示をする承認プロセス番号

        if (sValue == "") {
          sValue = "0:";
        }
        sFlg = sValue.split(":");

        // 申請者画面での表示編集
        if (sFlg[0] == "0") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_SEL_DEP_BTN_1@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_SEL_DEP_BTN_1@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_SEL_DEP_BTN_1@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_SEL_DEP_BTN_1@", sEditValue2)

        // 承認者画面での表示編集
        if (sFlg[1] == "") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
          sEditValue = ""
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
          sEditValue = sFlg[1].toString();
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_SEL_DEP_BTN_2@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_SEL_DEP_BTN_2@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_SEL_DEP_BTN_2@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_SEL_DEP_BTN_2@", sEditValue2)
        sDetailHtml = sDetailHtml.replace(/@SEL_DEP_SHOW_NUM@/g, sEditValue); //Replace(sDetailHtml, "@SEL_DEP_SHOW_NUM@", sEditValue)


        // ====================================< 削除ボタン　編集処理 >====================================
        // 値取得
        sValue = record.get('del_button_value'); // .Cells(iTargetRow, .Range(RANGE_DEL_BUTTON_VALUE).Column)

        // フラグ配列展開
        // sFlg(0) 0:申請者画面で表示しない　1:申請者画面で表示
        // sFlg(1) 空:承認者画面では表示しない　入力有り：表示をする承認プロセス番号

        if (sValue == "") {
          sValue = "0:";
        }
        sFlg = sValue.split(":");

        // 申請者画面での表示編集
        if (sFlg[0] == "0") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
          sEditValue3 = "";
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
          sEditValue3 = OK_TO_REMOVE;
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_CL_BTN_1@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_CL_BTN_1@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_CL_BTN_1@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_CL_BTN_1@", sEditValue2)
        sDetailHtml = sDetailHtml.replace(/@OK_TO_REM@/g, sEditValue3); //Replace(sDetailHtml, "@OK_TO_REM@", sEditValue3)

        // 承認者画面での表示編集
        if (sFlg[1] == "") {
          // 表示しない
          sEditValue1 = COMMENT_PRE;
          sEditValue2 = COMMENT_SUF;
          sEditValue3 = ""
        } else {
          // 表示する
          sEditValue1 = "";
          sEditValue2 = "";
          sEditValue = sFlg[1].toString();
          sEditValue3 = OK_TO_REMOVE_PROCESS.replace(/@PROCESS@/g, sEditValue); // Replace(OK_TO_REMOVE_PROCESS, "@PROCESS@", sEditValue)
        }

        sDetailHtml = sDetailHtml.replace(/@PRE_CL_BTN_2@/g, sEditValue1); //Replace(sDetailHtml, "@PRE_CL_BTN_2@", sEditValue1)
        sDetailHtml = sDetailHtml.replace(/@SUF_CL_BTN_2@/g, sEditValue2); //Replace(sDetailHtml, "@SUF_CL_BTN_2@", sEditValue2)
        sDetailHtml = sDetailHtml.replace(/@OK_TO_REM_NUM@/g, sEditValue3); //Replace(sDetailHtml, "@OK_TO_REM_NUM@", sEditValue3)
        sDetailHtml = sDetailHtml.replace(/@CL_SHOW_NUM@/g, sEditValue); //Replace(sDetailHtml, "@CL_SHOW_NUM@", sEditValue)

        // ====================================< 編集可能クラス　編集処理 >====================================
        // 値取得
        sValue = record.get('editable_item_value'); // .Cells(iTargetRow, .Range(RANGE_UPDATE_CLASS).Column)
        var obj = {
          update_class:{
            is_checked: false,
            value: ''
          },
          update_field:{
            is_checked: false,
            value: ''
          }
        };
        if(sValue != ""){
          obj = JSON.parse(sValue);
        }
        sEditValue = "";
        if(obj.update_class.is_checked){
          sEditValue = UPDATE_CLASS.replace(/@CLASS@/g, obj.update_class.value);
        }
        sDetailHtml = sDetailHtml.replace(/@UPDATE_CLASS@/g, sEditValue);

        sEditValue = "";
        if(obj.update_field.is_checked){
          sEditValue = UPDATE_FIELD.replace(/@FIELD@/g, obj.update_field.value);
        }
        sDetailHtml = sDetailHtml.replace(/@UPDATE_FIELD@/g, sEditValue);

//        // 編集可能クラスの編集
//        if (sValue == "") {
//          sEditValue = "";
//        } else {
//          sEditValue = UPDATE_CLASS.replace(/@CLASS@/g, sValue); //Replace(UPDATE_CLASS, "@CLASS@", sValue)
//        }
//
//        sDetailHtml = sDetailHtml.replace(/@UPDATE_CLASS@/g, sEditValue); //Replace(sDetailHtml, "@UPDATE_CLASS@", sEditValue)

        // ====================================< Other Setting >====================================
        sValue = record.get('other_setting_value');
        var obj = clone(WindowOtherSetting.defaultData);
        if(sValue != ""){
          obj = JSON.parse(sValue);
        }

        sEditValue = "";
        if(obj.ok_to_attachfile.is_checked){
          sEditValue = OK_TO_ATTACHFILE;
        }
        sDetailHtml = sDetailHtml.replace(/@ATTACHFILE@/g, sEditValue);

        // ====================================< 開封通知　編集処理 >====================================
        // 値取得
        sValue = "";
        if(obj.ok_to_open_notification.is_checked) {
          // sValue = record.get('button_type_open_notification_value'); //.Cells(iTargetRow, .Range(RANGE_OPEN_NOTIFICATION_VALUE).Column)
          sValue = obj.ok_to_open_notification.value;

          // フラグ配列展開
          // sFlg(0) 0:申請者画面で表示しない　1:申請者画面で表示
          // sFlg(1) 空:承認者画面では表示しない　入力有り：表示をする承認プロセス番号

          if (sValue == "") {
            sValue = "0:";
          }
          sFlg = sValue.split(":");

          // 申請者画面での表示編集
          if (sFlg[0] == "0") {
            // 表示しない
            sEditValue = "";
          } else {
            // 表示する
            sEditValue = OPEN_NOTIFICATION;
          }

          sDetailHtml = sDetailHtml.replace(/@OPEN_NOTIFICATION@/g, sEditValue); // Replace(sDetailHtml, "@OPEN_NOTIFICATION@", sEditValue)

          // 承認者画面での表示編集
          if (sFlg[1] == "") {
            // 表示しない
            sEditValue = "";
          } else {
            // 表示する
            sEditValue = OPEN_NOTIFICATION_PROCESS.replace(/@PROCESS@/g, sFlg[0]); // Replace(OPEN_NOTIFICATION_PROCESS, "@PROCESS@", sFlg(1))
          }

          sDetailHtml = sDetailHtml.replace(/@OPEN_NOTIFICATION_NUM@/g, sEditValue); // Replace(sDetailHtml, "@OPEN_NOTIFICATION_NUM@", sEditValue)

        }else{
          sDetailHtml = sDetailHtml.replace(/@OPEN_NOTIFICATION@/g, '');
          sDetailHtml = sDetailHtml.replace(/@OPEN_NOTIFICATION_NUM@/g, '');
        }
        // ====================================< 出力HTML編集 >====================================

        sValue = "";
        if(obj.additional_filter && obj.additional_filter.is_checked) {
          sValue = obj.additional_filter.value;
          sDetailHtml = sDetailHtml.replace(/@ADDITIONAL_FILTER@/g, 'additional_filter="'+sValue+'"');
        }else{
          sDetailHtml = sDetailHtml.replace(/@ADDITIONAL_FILTER@/g, '');
        }

        sGenerateHtml = sGenerateHtml + sDetailHtml;

      });


      // ===============================================================
      // フッター編集
      // ===============================================================
      sGenerateHtml = sGenerateHtml + sHtmlFooterTemplate;


      // ===============================================================
      // 画面出力
      // ===============================================================

      return sGenerateHtml;
    }
  };

  Setting = {
    has_loaded: false,
    init: function(){
      var me = this;
      if(me.has_loaded === true){
        return;
      }

      var tab = $('#tabs-3');
      tab.find('#name_width_value').val($('#name_width_value_tmp').val());
      tab.find('#member_width_value').val($('#member_width_value_tmp').val());
      tab.find('#html_header_value').val($('#html_header_value_tmp').val());
      tab.find('#html_detail_value').val($('#html_detail_value_tmp').val());
      tab.find('#html_footer_value').val($('#html_footer_value_tmp').val());

      me.has_loaded = true;
    },
    getSettingData: function(){
      var tab = $('#tabs-3');
      return {
        name_width_value: tab.find('#name_width_value').val(),
        member_width_value: tab.find('#member_width_value').val(),
        html_header_value: tab.find('#html_header_value').val(),
        html_detail_value: tab.find('#html_detail_value').val(),
        html_footer_value: tab.find('#html_footer_value').val()
      }
    },
    enable_ctr: function(enable){
      var tab = $('#tabs-3');
      if(enable === true){
        tab.find('#name_width_value').removeAttr('disabled');
        tab.find('#member_width_value').removeAttr('disabled');
        tab.find('#html_header_value').removeAttr('disabled');
        tab.find('#html_detail_value').removeAttr('disabled');
        tab.find('#html_footer_value').removeAttr('disabled');
      }else{
        tab.find('#name_width_value').attr('disabled', 'disabled');
        tab.find('#member_width_value').attr('disabled', 'disabled');
        tab.find('#html_header_value').attr('disabled', 'disabled');
        tab.find('#html_detail_value').attr('disabled', 'disabled');
        tab.find('#html_footer_value').attr('disabled', 'disabled');
      }
    },
    update: function(elm){
      debugLog('=> Setting: update');
      var tab = $('#tabs-3');
      debugLog(tab.find('#name_width_value').val());
      debugLog(tab.find('#member_width_value').val());
      debugLog(tab.find('#html_header_value').val());
      debugLog(tab.find('#html_detail_value').val());
      debugLog(tab.find('#html_footer_value').val());
      var postData = {
        name_width_value: tab.find('#name_width_value').val(),
        member_width_value: tab.find('#member_width_value').val(),
        html_header_value: tab.find('#html_header_value').val(),
        html_detail_value: tab.find('#html_detail_value').val(),
        html_footer_value: tab.find('#html_footer_value').val()
      };

      Setting.enable_ctr(false);
      // todo
      Setting.request_update(postData, function(isOk){
        Setting.enable_ctr(true);
        if(isOk){
          Ext.Msg.show({
            icon: Ext.MessageBox.INFO,
            msg: MyLang.getMsg('SUCCESS_UPDATE'),
            buttons: Ext.Msg.OK
          });
        }
      });
    },
    request_update: function(postData, callback){
      var template_id = $('#template_id').val();
      var route_approve_body_id = $('#route_approve_body_id').val();
      var postParams = {
				'token': USER_TOKEN,
        'route_approve_body_id': route_approve_body_id
			};

      $.extend(postParams, postData);

			// ファイルアップロードをリクエスト
			Ext.Ajax.request({
				params: postParams,
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + APP_ID + '/' + template_id + '/routerapprove',
				method: 'POST',
				timeout: 1000 * 120,		// 120秒
				success: function(response, options)
				{
					// 成功時
					if (response.responseText == 'status=ok') {
						callback(true);
					} else {
						callback(false);
					}

				},
				failure: function()
				{
					// 失敗時
					callback(false);
				}
			});
    },
    request_get_router_detail: function(template_id, route_approve_body_id, callback){
      var postParams = {
				'token': USER_TOKEN,
        'action': 'get_router_detail',
        'template_id': template_id,
        'route_approve_body_id': route_approve_body_id
			};

			// ファイルアップロードをリクエスト
			Ext.Ajax.request({
				params: postParams,
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + APP_ID + '/' + template_id + '/routerapprove',
				method: 'POST',
				timeout: 1000 * 120,		// 120秒
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);
          callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					callback(false);
				}
			});
    }
  };

  ViewSource = {
    elmViewSource: null,
    init: function (callback) {
      ViewSource.elmViewSource = $('#viewSource');
      ViewSource.viewSource();
      if (typeof  callback == "function") {
        callback();
      }
    },
    viewSource: function () {
      ViewSource.elmViewSource.html('');
      try {
        var generateHtmlRouteApprove = MainLayout.generateHtmlRouteApprove();
//        $('#resultHtml').html(generateHtmlRouteApprove);
//        RefactorCode.init({parent: $('#resultHtml')});
//        ViewSource.elmViewSource.text(RefactorCode.result);
        ViewSource.elmViewSource.text(generateHtmlRouteApprove);
        // Extend jQuery functionality to support prettify as a prettify() method.
//        jQuery.fn.prettify = function () {
//          this.html(prettyPrintOne(this.html()));
//        };
//        prettyPrint();
//        ViewSource.elmViewSource.prettify();
//        ViewSource.elmViewSource.attr('class', 'prettyprint lang-html linenums=true');
        ViewSource.elmViewSource.attr('class', 'brush: html, js, jscript, javascript, css; toolbar: false;');
        SyntaxHighlighter.highlight(undefined, ViewSource.elmViewSource[0]);
      } catch (e) {
//        console.log(e)
      }
    },
    beforePostMessage: function () {
      ViewSource.postMessage();
    },
    postMessage: function () {
      // 最終確認メッセージ表示
      Ext.Msg.show({
        icon: Ext.MessageBox.QUESTION,
        msg: MyLang.getMsg('MSG_SAVE_HTML_ROUTER_EDITOR'),
        buttons: Ext.Msg.OKCANCEL,
        fn: function (buttonId) {
          if (buttonId == 'ok') {
            Loading.showMessage(MyLang.getMsg('UPDATING'));
            var templateId = "", template_body = "";

            var template_id = $('#template_id').val();
            var generateHtmlRouteApprove = MainLayout.generateHtmlRouteApprove();
            var grid = Ext.getCmp('grid_main');
            var store = grid.getStore();
            var dataGrid = [];
            store.each(function(){
              var record = this;
              dataGrid.push({
               process_no: record.get('process_no'),
               approver_name: record.get('approver_name'),
               action_type: record.get('action_type'),
               action_type_value: record.get('action_type_value'),
               step_process: record.get('step_process'),
               step_process_value: record.get('step_process_value'),
               condition: record.get('condition'),
               condition_value: record.get('condition_value'),
               select_button: record.get('select_button'),
               select_button_value: record.get('select_button_value'),
               select_dep_button: record.get('select_dep_button'),
               select_dep_button_value: record.get('select_dep_button_value'),
               del_button: record.get('del_button'),
               del_button_value: record.get('del_button_value'),
               editable_item: record.get('editable_item'),
               editable_item_value: record.get('editable_item_value'),
               other_setting: record.get('other_setting'),
               other_setting_value: record.get('other_setting_value')
              })
            });
            var objSave = {
              json_data_grid: JSON.stringify(dataGrid)
            };
            // console.log(JSON.stringify(dataGrid))

            var objPostMessage = new Object();
            objPostMessage.router_approve_body = escapeAndEncodeHtml(generateHtmlRouteApprove);
            if (testJsonIsOk(objSave) && testJsonIsOk(objPostMessage)) {
              Setting.request_update(objSave, function(isOk){
                if (isOk) {
                  top.postMessage(JSON.stringify(objPostMessage), "*");
                  window.close();
                } else {
                  window.alert(MyLang.getMsg('MSG_SAVE_HTML_ERROR'));
                }
                Loading.hide();
              });
            } else {
              //json が正しくありません
              window.alert(MyLang.getMsg('MSG_SAVE_UNDEFINED_ERROR'));
              window.close();
            }

          }
        }
      });
    }
  };

  TabOne = {
    create: function (idTab) {
      var vHtml = '';
      vHtml += '<div id="tabs-1">';
      vHtml += '<div id="template_body_html_builder_result" style="display: none;"></div>';
      vHtml += '<div id="result" class="p10 bgWhite">';
      vHtml += '<div class="p0">';
      vHtml += '<div class="content">' + MyLang.getMsg('MSG_APPROVER_EDITOR_TAB_EXP');
      vHtml += '</div>';
      vHtml += '<div>';
      vHtml += '<div id="layoutMain" class="pwie">';
      vHtml += '<div class="pwie">';
      vHtml += '<table width="100%" cellpadding="10" cellspacing="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      //vHtml += '<td width="60%" valign="top">';
      vHtml += '<td valign="top" style="min-width: 70%;">';
      vHtml += '<div id="grid_main_render" class="ui-sortable">';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div>';
      vHtml += '</td>';

      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div><br>';
      vHtml += '<div class="buttonLayer" style="height:0"></div>';
      vHtml += '<table cellspacing="10" cellpadding="0" class="">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td style="min-width:240px;">';
      vHtml += '<input onclick="ViewSource.beforePostMessage()" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_ROUTER_COMPLETE') + '"> &nbsp;';
      //vHtml += '<input onclick="MainLayout.nextTab(\'1\')" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_SETTING') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'1\')" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_HTML_CONFIRM') + '"> &nbsp;';
      vHtml += '</td>';

      vHtml += '<td class="alignright pL10">';
      vHtml += '<div class="newSelect" style="display: block">';
      vHtml += '  <select id="op_default_template_list">';
      vHtml += '  </select>';
      vHtml += '</div>';
      vHtml += '</td>';
      vHtml += '<td class="alignright pL10">';
      vHtml += '<div class="newSelect" style="display: block">';
      vHtml += '  <select id="op_router_list">';
      vHtml += '  </select>';
      vHtml += '</div>';
      vHtml += '</td>';
      vHtml += '<td class="alignright pL10">';
      vHtml += '<input id="update_c_t" onclick="MyPanel.runUpdateCurrentTemplate(this)" type="button" class="newgraybtn update_c_t" value="' + MyLang.getMsg('RUN_UPDATE_CURRENT_TEMPLATE') + '"> &nbsp;';
      vHtml += '</td>';

      vHtml += '</tr>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td><span style="color: red;">' + MyLang.getMsg('MSG_EDITOR_COMPLETE_EXP_1') + '</span>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '<br></div>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '</div>';
      var mainPanel = new Ext.Panel({
        frame: false,
        border: false,
        margins: {top: 0, right: 5, bottom: 0, left: 5},
        html: vHtml,
        autoScroll: true
      });

      return new Ext.Panel({
        layout: 'fit',
        frame: false,
        border: false,
        items: [mainPanel],
        height: 460,
        listeners: {
          afterrender: function () {
            (function () {
              MainLayout.init();
            }).defer(10);
          }
        }
      });
    }
  };

  TabTwo = {
    create: function (idTab) {
      var vHtml = '';
      vHtml += '<div id="tabs-2">';
      vHtml += '<div class="p10 bgWhite">';
      vHtml += '<div class="content">';
      vHtml += MyLang.getMsg('MSG_HTML_SOURCE_TAB_EXP_1');
      vHtml += '</div>';
      vHtml += '<div>';
      vHtml += '<table cellpadding="5" cellspacing="0">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<div class="newSelect" style="display: none">';
      vHtml += '</div>';
      vHtml += '</td>';
      vHtml += '<td class="alignright pL10">';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table><br>';
      vHtml += '<div style="width: 100%; display: inline-block">';
//      vHtml += '<pre id="viewSource" style="width: 99%;" class="prettyprint lang-html linenums=true">';
      vHtml += '<pre id="viewSource" style="width: 99%;" class="brush: html, js, jscript, javascript, css; toolbar: false;">';
      vHtml += '</pre>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div><br>';
      vHtml += '<table cellspacing="10" width="100%" cellpadding="0" class="buttonLayer">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<input onclick="ViewSource.beforePostMessage()" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_ROUTER_COMPLETE') + '"> &nbsp;';
      //vHtml += '<input onclick="MainLayout.nextTab(\'0\');" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_BACK') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'0\');" type="button"  class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_SETTING_BACK') + '"> &nbsp;';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td><span style="color: red;">' + MyLang.getMsg('MSG_EDITOR_COMPLETE_EXP_1') + '</span>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '</div>';
      vHtml += '</div>';
      var mainPanel = new Ext.Panel({
        frame: false,
        border: false,
        margins: {top: 0, right: 5, bottom: 0, left: 5},
        html: vHtml,
        autoScroll: true
      });

      return new Ext.Panel({
        layout: 'fit',
        frame: false,
        border: false,
        items: [mainPanel],
        height: 460
      });
    }
  };

  TabThree = {
    create: function (idTab) {
      var vHtml = '';
      vHtml += '<div id="tabs-3">';

      vHtml += '<div class="p10 bgWhite">';
      vHtml += '<div class="content">';

      vHtml += '<form id="form_setting">';
      vHtml += '<table class="detail" style="width: 100%;">';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name" width="30%">' + MyLang.getMsg('NAME_WIDTH_VALUE');
      vHtml += '</td>';
      vHtml += '<td class="detail_value" width="70%"><input id="name_width_value" type="text" value="30%">';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name" width="30%">' + MyLang.getMsg('MEMBER_WIDTH_VALUE');
      vHtml += '</td>';
      vHtml += '<td class="detail_value" width="70%"><input id="member_width_value" type="text" value="70%">';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name" width="30%">' + MyLang.getMsg('HTML_HEADER_VALUE');
      vHtml += '</td>';
      vHtml += '<td class="detail_value" width="70%"><textarea id="html_header_value" style="width: 98%;vertical-align: middle;"><table class="detail" width="80%">\n</textarea>';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name" width="30%">' + MyLang.getMsg('HTML_DETAIL_VALUE');
      vHtml += '</td>';
      vHtml += '<td class="detail_value" width="70%">';
      vHtml += '<textarea id="html_detail_value" rows="12" style="width: 98%;vertical-align: middle;">';
      vHtml += '<!------------ 【プロセス@NUM@：@PROCESS_NAME@】------------>\n';
      vHtml += '<tr>\n';
      vHtml += '<td class="detail_name" width="@NAME_WIDTH@">@PROCESS_NAME@</td>\n';
      vHtml += '<td class="detail_value" width="@MEMBER_WIDTH@">\n';
      vHtml += '<input type="text" name="process" number="@NUM@" @APPROVE_TYPE@  disp="@PROCESS_NAME@" approver="@CONDITION@" @STEP_PROCESS@ @OK_TO_REM@ @OK_TO_REM_NUM@ @UPDATE_CLASS@ @UPDATE_FIELD@ @ATTACHFILE@>\n';
      vHtml += '<!--ユーザー追加ボタン-->\n';
      vHtml += '@PRE_SEL_BTN_1@<input type="button" class="user_select_button" process_number="@NUM@" value="' + MyLang.getMsg("BTN_ADD_USER") + '">@SUF_SEL_BTN_1@\n';
      vHtml += '@PRE_SEL_BTN_2@<input type="button" class="user_select_button" process_number="@NUM@" value="' + MyLang.getMsg("BTN_ADD_USER") + '" ok_to_show_process_number="@SEL_SHOW_NUM@">@SUF_SEL_BTN_2@\n';
      vHtml += '<!--ユーザー追加（部署指定）ボタン-->\n';
      vHtml += '@PRE_SEL_DEP_BTN_1@<input type="button" class="department_1_select_button" process_number="@NUM@" value="' + MyLang.getMsg("BTN_ADD_DEPARTMENT") + '" @ADDITIONAL_FILTER@>@SUF_SEL_DEP_BTN_1@\n';
      vHtml += '@PRE_SEL_DEP_BTN_2@<input type="button" class="department_1_select_button" process_number="@NUM@" value="' + MyLang.getMsg("BTN_ADD_DEPARTMENT") + '" ok_to_show_process_number="@SEL_DEP_SHOW_NUM@" @ADDITIONAL_FILTER@>@SUF_SEL_DEP_BTN_2@\n';
      vHtml += '<!--クリアボタン-->\n';
      vHtml += '@PRE_CL_BTN_1@<input type="button" class="clear_approver_button" process_number="@NUM@" value="' + MyLang.getMsg("BTN_CLEAR") + '">@SUF_CL_BTN_1@\n';
      vHtml += '@PRE_CL_BTN_2@<input type="button" class="clear_approver_button" process_number="@NUM@" value="' + MyLang.getMsg("BTN_CLEAR") + '" ok_to_show_process_number="@CL_SHOW_NUM@">@SUF_CL_BTN_2@\n';
      vHtml += '</td>\n';
      vHtml += '</tr>\n';
      vHtml += '</textarea>';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '<tr>';
      vHtml += '<td class="detail_name" width="30%">' + MyLang.getMsg('HTML_FOOTER_VALUE');
      vHtml += '</td>';
      vHtml += '<td class="detail_value" width="70%"><textarea id="html_footer_value" style="width: 98%;vertical-align: middle;"></table>\n</textarea>';
      vHtml += '</td>';
      vHtml += '</tr>';

      vHtml += '</table>';

      vHtml += '<div>';
      vHtml += '<input onclick="Setting.update(this)" type="button" style="margin-top: 5px;margin-left: 45%;width: 140px;" class="newgraybtn" value="' + MyLang.getMsg('BTN_UPDATE') + '">'
      vHtml += '</div>';
      vHtml += '</form>';

      vHtml += '</div>';
      vHtml += '<div id="resultHtml" style="display: none"></div>';
      vHtml += '</div>';
      vHtml += '</div>';
      vHtml += '<div class="clearL"></div><br>';
      vHtml += '<table cellspacing="10" width="100%" cellpadding="0" class="buttonLayer">';
      vHtml += '<tbody>';
      vHtml += '<tr>';
      vHtml += '<td>';
      vHtml += '<input onclick="ViewSource.beforePostMessage()" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_ROUTER_COMPLETE') + '"> &nbsp;';
      //vHtml += '<input onclick="MainLayout.nextTab(\'0\');"  type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_BACK') + '"> &nbsp;';
      vHtml += '<input onclick="MainLayout.nextTab(\'1\');" type="button" class="newgraybtn" value="' + MyLang.getMsg('BTN_EDITOR_HTML_CONFIRM') + '"> &nbsp;';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tr>';
      vHtml += '<tr>';
      vHtml += '<td><span style="color: red;">' + MyLang.getMsg('MSG_EDITOR_COMPLETE_EXP_1') + '</span>';
      vHtml += '</td>';
      vHtml += '</tr>';
      vHtml += '</tbody>';
      vHtml += '</table>';
      vHtml += '<br>';
      vHtml += '</div>';
      var mainPanel = new Ext.Panel({
        frame: false,
        border: false,
        margins: {top: 0, right: 5, bottom: 0, left: 5},
        html: vHtml,
        autoScroll: true
      });

      return new Ext.Panel({
        layout: 'fit',
        frame: false,
        border: false,
        items: [mainPanel],
        height: 460
      });
    }
  };

  MyPanel = {
    default_template_list: null,
    router_list: {},
    hideAd: false,
    tabSet: null,
    basePanel: null,
    tabDefine: [
      {
        name: 'tabs-one',
        displayName: MyLang.getMsg('MSG_HTML_APPROVER_TAB')
      },
      {
        name: 'tabs-two',
        displayName: MyLang.getMsg('MSG_HTML_SOURCE_TAB')
      },
      {
        name: 'tabs-three',
        displayName: MyLang.getMsg('MSG_HTML_SETTING_TAB')
      }
    ],
    columnWrap: function (val) {
      return '<div style="white-space:normal !important;">' + val + '</div>';
    },
    /**
     * bindSectionClassHandler
     *
     * 「section_area」クラスの開閉用イベントハンドラ（クリック時のハンドラ）をバインドする
     */
    bindSectionClassHandler: function () {
      // セクションエリアの開閉用イベントハンドラ
      $(document).on('click', 'div.section_area_title', function () {
        var element = this;
        var sectionArea = $(element).parent('div.section_area');
        var img = $(sectionArea).find('img.section_arrow_img');
        var showHideArea = $(sectionArea).find('div.section_show_hide_area');
        var display = $(showHideArea).css('display');
        if (display == 'none') {
          $(showHideArea).show('normal');
          $(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowDown.gif');
        } else {
          $(showHideArea).hide('normal');
          $(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowRight.gif');
        }
      });
    },
    createTab: function (aTabName, aDisplayName, aPanel) {
      aPanel.region = 'center';
      return new Ext.Panel({
        id: aTabName,
        tabName: aTabName,
        autoWidth: true,
        height: 170,
        title: aDisplayName,
        layout: 'border',
        items: [aPanel],
        listeners: {activate: MyPanel.handlerActivate}
      });
    },
    getHeaderHtml: function () {
      var vHtml = '';
      vHtml += '<div class="builder_header"><img src="' + BASE_URL + '/images/form_builder.png"/><span>';
      vHtml += MyLang.getMsg('MSG_HTML_ROUTER_APPROVER_EDITOR_TITLE');
      vHtml += '</span></div>';
      return vHtml;
    },
    buildPanel: function () {
//      Ext.QuickTips.init();

      var header = {
        deferredRender: false,
        height: 33,
        html: MyPanel.getHeaderHtml(),
        region: 'north',
        border: false
      };

      var footer = {
        deferredRender: false,
        height: 21,
        html: MyPanel.getFooterHtml(),
        region: 'south'
      };

      MyPanel.tabSet = new Ext.TabPanel({
        id: 'tab_set',
        activeTab: 0,
        enableTabScroll: true,
        plain: true,
        items: []
      });
      MyPanel.tabSet.region = 'center';

      mainPanel = new Ext.Panel({
        bodyStyle: 'background-color:white;',
        layout: 'border',
        items: [
          header,
          MyPanel.tabSet
        ]
      });

      MyPanel.basePanel = new Ext.Viewport({
        renderTo: 'html_editor_render',
        layout: 'fit',
        autoWidth: true,
        autoHeight: true,
        style: 'background-color: white;',
        items: [mainPanel]
      });


      Ext.util.CSS.createStyleSheet('.x-tab-strip span.x-tab-strip-text {font-size: ' + (11 + MyPanel.fontSize) + 'px}');
      Ext.util.CSS.createStyleSheet('.x-grid3-hd-row td {font-size: ' + (11 + MyPanel.fontSize) + 'px; line-height:' + (15 + MyPanel.fontSize) + 'px}');
      Ext.util.CSS.createStyleSheet('.x-grid3-row td, .x-grid3-summary-row td {font-size: ' + (11 + MyPanel.fontSize) + 'px; line-height:' + (15 + MyPanel.fontSize) + 'px; vertical-align: middle;}');

      //Ext.util.CSS.createStyleSheet('.x-panel-body {background-color:transparent}');
      //Ext.util.CSS.createStyleSheet('.x-window-body, .x-window-mc {background-color:#fff}');
      Ext.util.CSS.createStyleSheet('a:visited {color: purple}');

      Ext.util.CSS.createStyleSheet('.sateraito {font-size: ' + (12 + MyPanel.fontSize) + 'px}');

      ///Ext.util.CSS.createStyleSheet('.x-grid3-cell-inner, .x-grid3-hd-inner {white-space: normal;}');

      $.each(MyPanel.tabDefine, function () {

        var tabName = this;
        switch (this.name) {
          case MyPanel.tabDefine[0].name:

            var newTab = MyPanel.createTab(tabName.name, tabName.displayName, TabOne.create(tabName.name));
            MyPanel.tabSet.add(newTab);
            break;
          case MyPanel.tabDefine[1].name:
            var newTab = MyPanel.createTab(tabName.name, tabName.displayName, TabTwo.create(tabName.name));
            MyPanel.tabSet.add(newTab);
            break;
          case MyPanel.tabDefine[2].name:
            var newTab = MyPanel.createTab(tabName.name, tabName.displayName, TabThree.create(tabName.name));
            MyPanel.tabSet.add(newTab);
            break;
        }
      });

      MyPanel.tabSet.setActiveTab(MyPanel.tabDefine[2].name);
      MyPanel.tabSet.setActiveTab(MyPanel.tabDefine[0].name);

      // 「section_area」クラスハンドラ
      MyPanel.bindSectionClassHandler();

      // load default template list
      if(!MyPanel.default_template_list) {
        var default_template_list = [];
        var html_options = '';
        html_options += '<option value="">' + MyLang.getMsg('NO_SELECT_TEMAPLTE') + '</option>';
        $.each(JSON.parse($('#default_template_list').val()), function () {
          var template = this;
          if (template.template_name === '') {
            template.template_name = '(' + MyLang.getMsg('NO_SUBJECT') + ')';
          }
          default_template_list.push(template);
          html_options += '<option value="' + template.template_id + '">' + template.template_name + '</option>'
        });
        MyPanel.default_template_list = default_template_list;
        MyPanel.html_options = html_options;

        $('#op_default_template_list').html(MyPanel.html_options);
        MyPanel.load_router_list();
        $('#op_default_template_list').val($('#template_id').val());
//        $('#op_router_list').val($('#route_approve_body_id').val());
        $('#update_c_t').attr('disabled','disabled');
        $('#op_router_list').attr('disabled','disabled');
      }else{
        $('#op_default_template_list').html(MyPanel.html_options);
        MyPanel.load_router_list();

        if(MyPanel.selected_template_id){
          $('#op_default_template_list').val(MyPanel.selected_template_id);
        }
        if(MyPanel.selected_route_approve_body_id){
          $('#op_router_list').val(MyPanel.selected_route_approve_body_id);
        }
      }
      $('#op_default_template_list').change(function(){
        if ($(this).val() == ""){
          $('#update_c_t').attr('disabled','disabled');
        $('#op_router_list').attr('disabled','disabled');
        }else{
          $('#update_c_t').removeAttr('disabled');
          $('#op_router_list').removeAttr('disabled');
        }
      });

      return true;
    },
    load_router_list: function(){
      var html_options = '';

      var template_route_max_count = 5;
      if(typeof(WORKFLOW_TEMPLATE_ROUTE_COUNT) != 'undefined'){
        template_route_max_count = WORKFLOW_TEMPLATE_ROUTE_COUNT;
      }
      for(var i = 1; i <= 30; i++) {
        var template_route_name_key = MyLang.getMsg('ROUTER') + i;
        var template_route_body_key = 'template_route_' + i + '_body';
        if (template_route_max_count < i) {
          break;
        }
        html_options += '<option value="' + template_route_body_key + '">' + template_route_name_key + '</option>'
      }
      $('#op_router_list').html(html_options);
    },
    get_router_detail: function(aTemplateId, aRouteApproveBodyId, aCallback){
      var me = this;
      var cache_key = aTemplateId + '___' + aRouteApproveBodyId;
      if(typeof me.router_list[cache_key] == 'undefined'){
        Setting.request_get_router_detail(aTemplateId, aRouteApproveBodyId, function(aJsonData){
          if(aJsonData && aJsonData.status == 'ok'){
            me.router_list[cache_key] = aJsonData.data;
            aCallback(me.router_list[cache_key]);
          }
        });
      }else{
        aCallback(me.router_list[cache_key]);
      }
    },
    selected_template_id: null,
    selected_route_approve_body_id: null,
    runUpdateCurrentTemplate: function(button){
      Ext.Msg.show({
        icon: Ext.MessageBox.QUESTION,
        msg: MyLang.getMsg('RUN_UPDATE_CURRENT_TEMPLATE_CONFIRM'),
        buttons: Ext.Msg.OKCANCEL,
        fn: function(buttonId)
        {
          if (buttonId == 'ok') {
            var template_id = $('#op_default_template_list').val();
            var route_approve_body_id = $('#op_router_list').val();
            MyPanel.selected_template_id = template_id;
            MyPanel.selected_route_approve_body_id = route_approve_body_id;
            $(button).attr('disabled', 'disabled');
            Loading.showMessage();
            MyPanel.get_router_detail(template_id, route_approve_body_id, function(aRouterDetail){
              if(aRouterDetail){
                if(!$.isEmptyObject(aRouterDetail)){
                  $('#name_width_value_tmp').val(aRouterDetail.name_width_value);
                  $('#member_width_value_tmp').val(aRouterDetail.member_width_value);
                  $('#html_header_value_tmp').val(aRouterDetail.html_header_value);
                  $('#html_detail_value_tmp').val(aRouterDetail.html_detail_value);
                  $('#html_footer_value_tmp').val(aRouterDetail.html_footer_value);
                  $('#json_data_grid').val(aRouterDetail.json_data_grid);
                  Setting.has_loaded = false;
                  MyPanel.basePanel.destroy();
                  setTimeout(function(){
                    MyPanel.buildPanel();
                    Loading.hide();
                  }, 300);
                }else{
                  Ext.Msg.show({
                    icon: Ext.MessageBox.INFO,
                    msg: MyLang.getMsg('RUN_UPDATE_CURRENT_TEMPLATE_EMPTY_DATA'),
                    buttons: Ext.Msg.OK
                  });
                  Loading.hide();
                  $(button).removeAttr('disabled');
                }
              }else{
                Ext.Msg.show({
                  icon: Ext.MessageBox.INFO,
                  msg: MyLang.getMsg('RUN_UPDATE_CURRENT_TEMPLATE_ERROR'),
                  buttons: Ext.Msg.OK
                });
                Loading.hide();
                $(button).removeAttr('disabled');
              }
            })
          }
        }
      });
    },
    handlerActivate: function (tab) {
      switch (tab.id) {
        case MyPanel.tabDefine[0].name:
          break;
        case MyPanel.tabDefine[1].name:
          ViewSource.init();
          break;
        case MyPanel.tabDefine[2].name:
          Setting.init();
          break;
      }
    },
    getFooterHtml: function () {
      var vHtmlLink = '<span style="text-decoration: underline;cursor: pointer" onclick="></span>';

      return vHtmlLink;
    }
  };

  debugLog(' ++++ Init: SATERAITO HTML ROUTER APPROVE BUILDER !!! ++++ ');
  // init
  // ツールチップ初期化
  Ext.QuickTips.init();

  MyLang.setLocale(SATERAITO_LANG);

  MiniMessage.initMessageArea();

	var timer_id;
	var timer_id2;
	var alertGadgetTimeout = function(){
		try{
			debugLog('[alert]');
			debugLog(new Date());
			clearTimeout(timer_id);
			MiniMessage.showLoadingMessage(MyLang.getMsg('ALERT_GADGET_TIMEOUT'));	// タイムアウトメッセージは消さない
			timer_id2 = setTimeout(function(){notificationGadgetTimeout()}, 10 * 60 * 1000);		// each 10 minuts
		}catch(e){
		}
	};
	var notificationGadgetTimeout = function(){
		try{
			debugLog('[alert]');
			debugLog(new Date());
			clearTimeout(timer_id2);
			MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
		}catch(e){
		}
	};

	// GoogleSitesガジェット認証タイムアウト（1時間）を直前でアラートする機能
	function processGadGetTimeOut(){
    // iFrame版はガジェットタイムアウトが不要なので 2016.03.26 T.ASAO
    if(GADGET_START_TIME < 0){
    return;
    }
    var now = new Date();
    var time_now = now.getTime();
//    GADGET_START_TIME = time_now - (59 * 60 * 1000) - (50*1000);
//    GADGET_START_TIME = time_now - (49 * 60 * 1000) - (50*1000);
    var elapsed_time = time_now - GADGET_START_TIME;
    var period_of_time = 60 * 60 * 1000; // 60 minuts
    var time_remaining = period_of_time - elapsed_time;
//    console.log(GADGET_START_TIME);
//    console.log(time_now);
//    console.log(elapsed_time);
//    console.log(period_of_time);
//    console.log(time_remaining);
    var distaince
		debugLog('[start]');
		debugLog(now);
    if(time_remaining < 0){

    console.log('time_remaining < 0');
      MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
    }else {
      if (time_remaining > (10 * 60 * 1000)) {
        console.log('time_remaining > 10 * 60 * 1000');
        timer_id = setTimeout(function () { alertGadgetTimeout() }, time_remaining - (10 * 60 * 1000));	// each time_remaining - (10 * 60 * 1000) minuts
      } else {
        console.log('else time_remaining > 10 * 60 * 1000');
        timer_id2 = setTimeout(function(){notificationGadgetTimeout()}, time_remaining);		// each time_remaining minuts
      }
    }
	}

  processGadGetTimeOut();

  Loading = {
    showMessage: function(aMsg){
      if(typeof aMsg == 'undefined'){
        aMsg = MyLang.getMsg('LOADING');
      }
      Loading.mask = new Ext.LoadMask(Ext.getBody(), {msg: aMsg});
      Loading.mask.show();
    },
    hide: function(){
      Loading.mask.hide();
    }
  }

  MyPanel.buildPanel();

});
