Ext.ucf = function () {
  var msgCt;
  var _switchLeftMenuHandle = new Array();
  // 画面上部のメッセージBOXHTMLを作成
  function createBox(t, s) {
    return ['<div class="msg">',
      '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
      '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
      '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
      '</div>'].join('');
  }

  return {
    showMessgeBox: function (title, message_text, callback, button_type) {
      button_type = button_type || Ext.Msg.OK;
      Ext.Msg.show({
        title: title,
        icon: Ext.MessageBox.INFO,
        msg: message_text,
        buttons: button_type,
        fn: function (buttonId) {
          if (buttonId == 'ok' || buttonId == 'yes') {
            if (typeof callback === "function") {
              callback();
            }
          }
        }
      });
    },

    // 各セクションの開閉状態の初期化（設定によるものではなくユーザーが開閉を選択するもの）※予期せぬ動作不備を避けるため一番最後に行う
    initShowOrHideSections: function () {
      // セクションエリアの開閉用イベントハンドラ
      $(document).on('click', '.section_area_title', function () {
        var element = this;
        var sectionAreaId = $(element).attr('section_show_hide_area_id');
        //var img = $(element).find('img.section_arrow_img');
        var showHideArea = $('#' + sectionAreaId);
        var display = $(showHideArea).css('display');
        if (display == 'none') {
          //$(showHideArea).show('fast');
          //$(img).attr('src', '/images/section_area_down.png');
          Ext.ucf.showSection(element);
        } else {
          //$(showHideArea).hide('fast');
          //$(img).attr('src', '/images/section_area_right.png');
          Ext.ucf.hideSection(element);
        }

        //// オリジナルイベント定義
        //$(element).bind('section_show',function(){
        //	$(showHideArea).show('fast');
        //	$(img).attr('src', '/images/section_area_down.png');
        //});
        //$(element).bind('section_hide',function(){
        //	$(showHideArea).hide('fast');
        //	$(img).attr('src', '/images/section_area_right.png');
        //});

      });

      // 初期状態をセット
      $(document).find('.section_area_title').each(function () {
        var element = this;
        var sectionAreaId = $(element).attr('section_show_hide_area_id');
        //var img = $(element).find('img.section_arrow_img');
        var showHideArea = $('#' + sectionAreaId);
        var init_display = $(element).attr('init_display');
        if (init_display != 'show') {
          //$(showHideArea).hide();
          //$(img).attr('src', '/images/section_area_right.png');
          Ext.ucf.hideSection(element);
        } else {
          //$(showHideArea).show();
          //$(img).attr('src', '/images/section_area_down.png');
          Ext.ucf.showSection(element);
        }
      });
    },

    // セクションエリアの開く処理
    showSection: function (section_area_title_element) {
      var element = $(section_area_title_element);
      var sectionAreaId = $(element).attr('section_show_hide_area_id');
      var img = $(element).find('img.section_arrow_img');
      var showHideArea = $('#' + sectionAreaId);
      $(showHideArea).show('fast');
      $(img).attr('src', '/images/section_area_down.png');
    },

    // セクションエリアの閉じる処理
    hideSection: function (section_area_title_element) {
      var element = $(section_area_title_element);
      var sectionAreaId = $(element).attr('section_show_hide_area_id');
      var img = $(element).find('img.section_arrow_img');
      var showHideArea = $('#' + sectionAreaId);
      $(showHideArea).hide('fast');
      $(img).attr('src', '/images/section_area_right.png');
    },

    // 左メニューの開閉時に行う処理のデリゲートを追加
    appendLeftMenuChangeDelagate: function (func) {
      _switchLeftMenuHandle.push(func);
    },
    // 左メニューの開閉
    changeLeftMenu: function () {
      var obj = jQuery(document.getElementById('mainArea'));
      if (obj) {
        if (obj.hasClass('on')) {
          obj.removeClass('on').addClass('off');
          leftmenu_class = 'off'
        }
        else {
          obj.removeClass('off').addClass('on');
          leftmenu_class = 'on'
        }

        // Cookieをサーバサイドで更新
        Ext.Ajax.request({
          url: _vurl + 'leftmenustatusset',
          method: 'POST',
          params: {leftmenu_class: leftmenu_class}
        });

        // 左メニュー開閉時、リサイズ動作対応
        // switchLeftMenuHandleが存在する場合、実行
        if (_switchLeftMenuHandle) {
          Ext.each(_switchLeftMenuHandle, function (func) {
            func();
          });
        }
      }
    },
    // Bing背景画像切り替えメソッド
    setNewMainBgType: function (obj, cur, BgTypeIdxAryJson) {
      var max_cnt = BgTypeIdxAryJson.length;
      for (i = 1; i <= max_cnt; i++) {
        var bgtype_idx = BgTypeIdxAryJson[i - 1];
        var bgtype = 'BgType' + bgtype_idx;
        if (obj.hasClass(bgtype)) {
          var idx;
          if (cur > 0) {
            if (i == max_cnt) {
              idx = 1;
            }
            else {
              idx = i + 1;
            }
          }
          else if (cur < 0) {
            if (i == 1) {
              idx = max_cnt;
            }
            else {
              idx = i - 1;
            }
          }
          else {
            idx = i;
          }
          var bgtype_new = 'BgType' + BgTypeIdxAryJson[idx - 1];
          obj.removeClass(bgtype).addClass(bgtype_new);
          break;
        }
      }
    },
    // 画面上部にメッセージを表示
    flowMsg: function (title, format) {
      if (!msgCt) {
        msgCt = Ext.DomHelper.insertFirst(document.body, {id: 'msg-div'}, true);
      }
      msgCt.alignTo(document, 't-t');
      var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
      var m = Ext.DomHelper.append(msgCt, {html: createBox(title, s)}, true);
      m.slideIn('t').pause(3).ghost("t", {remove: true});
    },
    nvl: function (value) {
      return value ? value.toString() : '';
    },
    // BasicForm内のinputデータを返す
    getFormValues: function (form) {
      var fs = form.getValues(true);
      return Ext.urlDecode(fs.replace(/\+/g, '%20'));
    },
    //  HTMLエスケープ（改行、タブなどのエスケープはトリム）
    htmlEscape: function (str) {
      str = Ext.ucf.nvl(str).replace(/(\n|\r|\t)/g, "");	// トリム
      var map = {"<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", "\"": "&quot;", " ": " ", "　": "　"};
      var replaceStr = function (s) {
        return map[s];
      };
      var result = str.replace(/<|>|&|'|"|　|\s/g, replaceStr);
      return result;
    },
    //  HTMLエスケープ(改行は<br />に変換)
    htmlEncode: function (str) {
      // str==undefined の場合に「undefined」が表示されてしまうので変更
//					var html = Ext.util.Format.htmlEncode(String(str)).replace(/\r\n/g, "<br />").replace(/(\n|\r)/g, "<br />");
      var html = Ext.util.Format.htmlEncode(Ext.ucf.nvl(str)).replace(/\r\n/g, "<br />").replace(/(\n|\r)/g, "<br />");
      return html;
    },
    // 3桁区切書式に変換する。引数Numericは任意の1バイト数字
    getNumberFormat: function (Numeric) {
      Numeric += '';

      //入っていたカンマを消す
      var Separator = Numeric.indexOf(',', 0);
      while (Separator != -1) {
        Numeric = Numeric.substring(0, Separator) + Numeric.substring(Separator + 1, Numeric.length);
        Separator = Numeric.indexOf(',', 0);
      }

      //小数点を探し、小数点以下と整数部を分割して保持する
      var DecimalPoint = Numeric.lastIndexOf('.');
      if (DecimalPoint == -1) {
        var Decimals = '';
        var Integers = Numeric + '';
      } else {
        var Decimals = Numeric.substring(DecimalPoint, Numeric.length) + '';
        var Integers = Numeric.substring(0, DecimalPoint) + '';
      }
      //整数部の文字列長を3の倍数にする。足りない分は手前に' 'を埋め込む
      Blanks = Integers.length % 3;
      if (Blanks != 0) {
        for (var i = 0; 3 - Blanks > i; i++) {
          Integers = ' ' + Integers;
        }
      }

      //整数文字列先頭から3文字おきにカンマを挿入する
      //先頭がマイナス符号の時は負数として処理する
      FigureInteger = Integers.substring(0, 3);
      var j = 2;
      if (Integers.charAt(2) == '-') {
        FigureInteger = FigureInteger + Integers.substring(3, 6);
        j = 4;
      }
      for (i = j; Integers.length > i; i++) {
        if (i % 3 == 0) {
          FigureInteger = FigureInteger + ',' + Integers.substring(i, i + 3);
        }
      }

      //臨時に入れておいた' 'を削除する
      while (FigureInteger.charAt(0) == ' ') {
        FigureInteger = FigureInteger.substring(1, FigureInteger.length);
      }

      //整形済みの整数部と、待避してあった小数部を連結。連結した文字列を返して終了！
      CommaNumber = FigureInteger + Decimals;
      return CommaNumber;
    },


    // Ext.data.Recordオブジェクト配列をjson形式に変換（引数のタイプによって分岐してもよい）
    toJson: function (records) {
      var jsons = [];
      Ext.each(records, function (record, idx) {
        var item = {};
        for (var i in record.fields.keys) {
          var k = record.fields.keys[i];
          var v = record.get(k);
          item[k] = v;
        }
        jsons.push(item);
      });
      return jsons;
    },

    // XMLからInnerTextを取得（ノードがなければ空）
    getInnerText: function (ele) {
      var result;

      if (!ele || !ele.firstChild) {
        result = '';
      }
      else {
        result = ele.firstChild.nodeValue || '';
      }
      return result;
    },

    // APIの戻り値からバリデーションチェックメッセージを表示
//				setValidationCheckMessageHtml : function(nodRoot, target_ids, success)
    setValidationCheckMessageHtml: function (nodRoot, success) {
      var query = Ext.DomQuery;

      var code = Ext.ucf.getInnerText(query.selectNode('ReturnCode', nodRoot));

      // 正常なら正常時処理
      if (code == '0') {
        if (success) {
          success(nodRoot);
        }
      }
      // VCに引っかかったなら、メッセージを表示
      else if (code == '100') {
        Ext.ucf.setValidationMessages(query.jsSelect('ErrorInfo/Message', nodRoot));
      }
      else {
        // 不必要なエラー表示が多いので空の場合は出さないようにする
        if (code && code != '') {
          Ext.MessageBox.alert(_msg.VMSG_MSG_ERROR, _msg.VMSG_MSG_SYSTEMERROR_OCCURED + ' CODE=' + code);
        }
      }

    },
    setValidationMessages: function (lstMessage) {
      var query = Ext.DomQuery;

      for (var i = 0; i < lstMessage.length; i++) {
        var nodMessage = lstMessage[i];
        var msg = Ext.ucf.getInnerText(nodMessage);
        var id = Ext.ucf.getInnerText(query.selectNode('@validate', nodMessage));
        if (id != '') {
          Ext.ucf.appendValidationMessage(id, msg);
        }
      }
    },
    getValidationMessages: function (lstMessage) {
      var query = Ext.DomQuery;
      var strMsgs = '';
      for (var i = 0; i < lstMessage.length; i++) {
        var nodMessage = lstMessage[i];
        var msg = Ext.ucf.getInnerText(nodMessage);
        var id = Ext.ucf.getInnerText(query.selectNode('@validate', nodMessage));
        if (id != '') {
          strMsgs += msg;
        }
      }
      return strMsgs;
    },
    appendValidationMessage: function (id, msg) {
      var vc_area_id = 'VC_' + id;
      var vc_area = Ext.get(vc_area_id);
      if (vc_area) {
        var msg_html = '<br/>' + '<span class="text_validate">' + msg + '</span>';
        vc_area.dom.innerHTML += msg_html;
      }
      // 指定されたExtJsコンポーネントがあればそこに表示することを試みる
      else {
        var cmp = Ext.getCmp(id);
        if (cmp && cmp.markInvalid) {
          cmp.markInvalid(msg);
        }
      }
    },
    clearValidationMessage: function (id) {
      var vc_area_id = 'VC_' + id;
      var vc_area = Ext.get(vc_area_id);
      if (vc_area) {
        vc_area.dom.innerHTML = '';
      }

      var cmp = Ext.getCmp(id);
      if (cmp && cmp.clearInvalid) {
        cmp.clearInvalid('');
      }

    },

    getErrorMessages: function (lstMessage) {
      var query = Ext.DomQuery;
      var strMsgs = '';
      for (var i = 0; i < lstMessage.length; i++) {
        var nodMessage = lstMessage[i];
        var msg = Ext.ucf.getInnerText(nodMessage);
        strMsgs += msg + "<br/>";
      }
      return strMsgs;
    },
    // ラジオボタン、チェックボックスのチェック（とりあえず1チェックのみ対応）
    checkElements: function (name, check_value) {
      var flds = document.getElementsByName(name);
      if (flds) {
        for (i = 0; i < flds.length; i++) {
          var fld = flds[i];
          if (fld.value == check_value) {
            fld.checked = true;
//								break;
          }
          else {
            fld.checked = false;
          }
        }
      }
    },

    getElementValue: function (name) {
      var flds = document.getElementsByName(name);
      var result = ''
      if (flds && flds.length > 0) {
        var tp = 'text';
        //if(flds && flds[0])
        //{
        //	if(flds[0].type)
        //	{
        //		tp = flds[0].type;
        //	}
        //}
        for (i = 0; i < flds.length; i++) {
          if (flds[i].type) {
            tp = flds[i].type;
            break;
          }

        }

        var idx = 0;
        for (i = 0; i < flds.length; i++) {
          switch (tp) {
            //TODO SelectBox

            case 'checkbox':
            case 'radio':
              if (flds[i].checked) {
                result = result + (idx > 0 ? ',' : '') + (flds[i].value ? flds[i].value : '');
                idx++;
              }
              break;
            default:
              result = result + (idx > 0 ? ',' : '') + (flds[i].value ? flds[i].value : '');
              idx++;
              break;
          }
        }
//						alert(tp + ':' + flds[0].name + ':' + result);
      }
      return result;

    },
    replaceAll: function (expression, org, dest) {
      return expression.split(org).join(dest);
    },
    dispUpdateMsg: function (code, nodRoot) {
      var query = Ext.DomQuery;
      // 正常時処理
      if (code == '0') {
        Ext.ucf.flowMsg(_msg.SUCCESS, _msg.UPDATED, code);
      }
      else {
        var msg = Ext.ucf.getErrorMessages(query.jsSelect('ErrorInfo/Message', nodRoot));
        Ext.ucf.flowMsg(_msg.FAILED, msg, code);
      }
    },
    dispUpdateMsgByReturnCode: function (code, nodRoot) {
      var query = Ext.DomQuery;
      // 正常時処理
      if (code == '0') {
        Ext.ucf.flowMsg(_msg.SUCCESS, _msg.UPDATED, code);
      }
      else if (code == '100') {
        var msg = Ext.ucf.getValidationMessages(query.jsSelect('ErrorInfo/Message', nodRoot));
        Ext.ucf.flowMsg(_msg.FAILED, msg, code);
      }
      else {
        // 不必要なエラー表示が多いので空の場合は出さないようにする
        if (code && code != '') {
          Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, 'CODE={0}:' + _msg.VMSG_MSG_UPDATE_FAILED, code);
        }
      }
    },
    dispErrMsg: function (nodRoot) {
      var query = Ext.DomQuery;
      var code = Ext.ucf.getInnerText(query.selectNode('ReturnCode', nodRoot));
      var msg = Ext.ucf.getErrorMessages(query.jsSelect('ErrorInfo/Message', nodRoot));
      if (code) {
        Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, msg, code);
//						Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, 'CODE={0}:' + _msg.VMSG_MSG_SYSTEMERROR_OCCURED, code);	
      }
      else {
//					Ext.MessageBox.alert(_msg.VMSG_MSG_ERROR, _msg.VMSG_MSG_SYSTEMERROR_OCCURED);	
        // 不必要に出るのでコメントアウト 2011/11/15
        //Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, _msg.VMSG_MSG_SYSTEMERROR_OCCURED);
      }
    },
    dispSysErrMsg: function (code) {
      if (code && code != '') {
        Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, 'CODE={0}:' + _msg.VMSG_MSG_SYSTEMERROR_OCCURED, code);
      }
      else {
//					Ext.MessageBox.alert(_msg.VMSG_MSG_ERROR, _msg.VMSG_MSG_SYSTEMERROR_OCCURED);	
        // 不必要に出るのでコメントアウト 2011/11/15
        //Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, _msg.VMSG_MSG_SYSTEMERROR_OCCURED);
      }
    },
    getHiddenHtml: function (name, unique_id, value) {
      return '<input type="hidden" name="' + name + '_' + unique_id + '" value="' + escape(value) + '" >';
    },
    getTargetFieldValueList: function (s, data_id) {
      var list = [];
      for (var i = 0, r; r = s[i]; i++) {
//                  store.remove(r);
        list.push(r.get(data_id));
      }
      return list.join(',');
    },
    getUniqueIDList: function (s) {
      return Ext.ucf.getTargetFieldValueList(s, 'unique_id');
    },
    preSubmit: function (target_cmp) {
      // ExtJsバージョンアップ【3.1.1→3.3.1】に伴う修正
      if (target_cmp) {
        // Maskが全て掛らない画面用
        var mask = new Ext.LoadMask(target_cmp, {msg: _msg.VMSG_MSG_ACCESSING});
      }
      else {
        // getBody()で全体にMaskが掛る画面用
        var mask = new Ext.LoadMask(Ext.getBody(), {msg: _msg.VMSG_MSG_ACCESSING});
      }

      mask.show();
    },
    // １項目のチェック使用ページで上書き前提
    delegateCheckValidation: function (ele) {
      // Ext.ucf.checkValidation(ele, '', '', '', '');
    },
    // １項目のチェック（private）
    checkValidation: function (ele, unique_id, regist_type, url, p) {
      if (!url || url == '') {
        return;
      }

      // うっとおしいからとりあえずなし
//					var mask = new Ext.LoadMask(Ext.get('AREA_' + ele.name), {msg:_msg.VMSG_MSG_CHECKING});	

      var handleAfterProcess = function (response) {
        var code = '';
        if (response.responseXML != undefined) {
          var query = Ext.DomQuery;
          var nodRoot = response.responseXML;

          code = Ext.ucf.getInnerText(query.selectNode('ReturnCode', nodRoot));
          if (code == '0') {
            ele.preVCMessage = '';
            ele.clearInvalid();
          }
          else if (code == '100') {
            var msg = Ext.ucf.getValidationMessages(query.jsSelect('ErrorInfo/Message', nodRoot));
            ele.preVCMessage = msg;
            ele.markInvalid(msg);
          }
        }
        else {
          Ext.ucf.dispSysErrMsg(code);
        }
      };

      var params = {
        UNIQUE_ID: unique_id,
        RegistType: regist_type,
        FieldID: ele.name,
//						FieldValue:ele.getValue(),
        FieldValue: ele.getValue(),
        FieldDispName: ele.fieldLabel
      };

      if (p) {
        $.extend(p, params);
        params = p;
      }

      // マスクをかける
//					mask.show();
      // AJAXコール
      Ext.Ajax.request({
        url: url,
        method: "POST",
        params: params,
        success: handleAfterProcess,
        failure: handleAfterProcess
      });

    },
    // AutoCmdによるシンプルな１フィールドチェック
    checkValidationByAutoCmd: function (field, cmd) {
      return null;
    },

    // Store検索
    executeQuery: function (url,params, callback,method) {
        method = method || 'POST';
        var handleAfterProcess = function (response) {
          if (response.responseText != undefined && response.responseText != '') {
            //alert(response.responseText);
            var result = jQuery.parseJSON(response.responseText);
            var code = result.code;

            if (typeof(callback) == 'function') {
                  callback(result);
             }
          }
          else {
            console.log(response)
          }
        };

        // 検索条件をJson形式で取得
        if (method.toLowerCase() =='post') {
          Ext.Ajax.request({
            url: url,
            method: 'POST',
            params: params,
//            cors: true,
//            useDefaultXhrHeader : false,
            success: handleAfterProcess,
            failure: handleAfterProcess
          });
        }else{
           Ext.Ajax.request({
            url: url,
            method: 'GET',
//            cors: true,
//            useDefaultXhrHeader : false,
            success: handleAfterProcess,
            failure: handleAfterProcess
          });
        }
    },

    // Store検索
    search: function (psc, store, param_delegate, get_scond_url, after_process_delegate) {
      //			if(psc)
      if (psc == true) {
        var handleAfterProcess = function (response) {
          if (response.responseText != undefined && response.responseText != '') {
            //alert(response.responseText);
            var result = jQuery.parseJSON(response.responseText);
            var code = result.code;

            if (code == 0) {
              store.load({params: param_delegate(result.data), waitMsg: _msg.LOADING});
            }
            else {
              store.load({params: param_delegate(), waitMsg: _msg.LOADING});
            }
            store.baseParams = param_delegate();
          }
          else {
            Ext.ucf.dispSysErrMsg();
          }
        };

        // 検索条件をJson形式で取得
        Ext.Ajax.request({
          url: get_scond_url,
          method: "POST",
          params: param_delegate(),
          success: handleAfterProcess,
          failure: handleAfterProcess
        });

      }
      else {

        store.load({params: param_delegate(), waitMsg: _msg.LOADING});
        store.baseParams = param_delegate();
      }
    },
    // Store検索　表示件数変更用セレクトBOX
    // items : セレクトBOXアイテム　[20, 50, 100]
    // listeners : セレクトBOXイベントリスナー
    // options : {
    //  cookei_key : 表示件数保持用クッキーキー　（省略可）
    // }
    searchLimitComboBox: function (items, listeners, options) {
      //options
      options = options || {};
      var cookie_key = options.cookie_key || 'F361D891';
      var cookie_expire = options.cookie_expire || 365;
      var cookie_path = options.cookie_path || location.pathname.split('/', 3).join('/');

      items = items || [20, 50, 100];

      var selectedValue = getCookie(cookie_key) || items[0];

      var cb = new Ext.form.ComboBox({
        mode: 'local', store: items || [20, 50, 100], width: 50, value: parseInt(selectedValue), forceSelection: true, autoSelect: false, triggerAction: 'all', lastQuery: '', listeners: listeners || {}
      });

      //クッキー保持
      cb.addListener('select', function (cb, record, index) {
        var value = cb.value;
        setCookie(cookie_key, value, cookie_expire, cookie_path);
      });

      return cb;
    },
    // 画面項目のリセット
    resetComponents: function (list_cmp) {
      if (list_cmp) {
        for (var i = 0; i < list_cmp.length; i++) {
          var cmp = Ext.getCmp(list_cmp[i].id);
          cmp.reset();
          if (cmp.preValue) {
            cmp.preValue = cmp.getValue();
          }
        }
      }
    },
    /** \uxxxx みたいな文字列を普通の文字列に変換 */
    decodeUnicode: function (input) {
      var cary = Ext.ucf.decodeSurrogatePairs(Ext.ucf.fromCodePointString(input));
      var resultStr = Ext.ucf.fromCharCodeArray(cary);

      if (resultStr == undefined) {
        return input;
      }
      else {
        return resultStr;
      }
    },
    /** サロゲートペアはそのままの状態で返します。 */
    fromCodePointString: function (str) {
      var strs = (" " + str).split(/[^0-9a-f]+(?:0[x])?/i);
      var result = new Array();

      for (var i = 0; i < strs.length; i++) {
        var v = parseInt(strs[i], 16);

        if (!isNaN(v)) result.push(v);
      }
      return result;
    },

    /** エラー時は null を返します。 */
    decodeSurrogatePairs: function (codes) {
      var result = new Array(), prev = 0;

      for (var i = 0; i < codes.length; i++) {
        var c = codes[i];

        if ((c & 0xf800) == 0xd800) {
          if (c & 0x400) {
            if (!prev) return null;
            result.push((((prev & 0x3ff) << 10) | (c & 0x3ff)) + 0x10000);
            prev = 0;
          } else {
            if (prev) return null;
            prev = c;
          }
        } else {
          if (prev) return null;
          result.push(c);
          prev = 0;
        }
      }
      return result;
    },

    /** サロゲートペアは予めエンコードしておきます。 */
    fromCharCodeArray: function (src) {
      return String.fromCharCode.apply(null, src);
    },

    dispUsePasswordCharacterList: function () {
      var passwordlistpanel = new Ext.Panel({
        frame: true,
        layout: 'table',
        layoutConfig: {
          columns: 1,
          tableAttrs: {
            style: {
              width: '100%'
            }
          }
        },
        defaults: {
          border: false,
          collapsible: false
        },
        items: [
          {xtype: 'displayfield', value: '<font color="black">' + _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_TYPE1 + '</font>'}
          ,
          {xtype: 'displayfield', value: '<font color="black">' + _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_TYPE2 + '</font>'}
          ,
          {xtype: 'displayfield', value: '<font color="black">' + _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_TYPE3 + '</font>'}
          ,
          {xtype: 'displayfield', value: '<font color="black">' + _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_TYPE4 + '</font>'}
          ,
          {xtype: 'displayfield', value: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color="black">' + _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_TYPE5 + '</font>'}
          ,
          {xtype: 'displayfield', value: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color="black">' + _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_TYPE6 + '</font>'}
          ,
          {xtype: 'displayfield', value: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color="black">' + _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_TYPE7 + '</font>'}
        ]
      });

      var passwordwindow
      {
        passwordwindow = new Ext.Window({
          title: _msg.VMSG_INFO_PASSWORD_AVAILABLE_CHAR_LIST,
          layout: 'fit',
          width: 500,
          height: 200,
          plain: true,
          autoDestory: true,
          items: passwordlistpanel
        });
      }
      ;

      passwordwindow.show();
      passwordwindow.dd.constrainTo(Ext.getBody());
    },
    // 非同期CSVダウンロード
    exportToCsv: function (params, mask_area) {
      var mask;
      // AJAXコール成功時ハンドラ
      var handleAfterProcess = function (response) {
        if (response.responseText != undefined && response.responseText != '') {
          var jsondata = jQuery.parseJSON(response.responseText);
          var code = jsondata.code;
          if (code == 0) {
            // 結果から取得
            var data_key = jsondata.data_key;
            // ダウンロード（非同期用）タイムアウト 600秒=10分）
            Ext.ucf.downloadFile(data_key, 600000, mask);
          }
          else {
            if (mask) {
              mask.hide();
            }
          }
        }
        else {
          Ext.ucf.dispSysErrMsg();
          if (mask) {
            mask.hide();
          }
        }
      }


      if (params == undefined) {
        params = {};
      }

      var url = _vurl + 'asynccsvexport';

      if (mask_area && mask_area != '') {
        mask = new Ext.LoadMask(Ext.get(mask_area), {msg: _msg.VMSG_EXPORTING});
        mask.show();
      }
      // AJAXコール
      Ext.Ajax.request({
        url: url,
        method: 'POST',
        params: params,
        success: handleAfterProcess,
        failure: handleAfterProcess
      });
    },
    // ファイルをダウンロード（取得できるまで定期的にチェック）
    downloadFile: function (data_key, timeout_ms, mask) {
      var check_url = _vurl + 'file/check';
      var download_url = _vurl + 'file/download?data_key=' + escape(data_key);

      // タイマー停止
      var stop = function (mask, timer) {
        timer.stop();
        if (mask) {
          mask.hide();
        }
      };

      // 開始時間
      var st = new Date().getTime();

      // ダウンロードされるまで定期的にチェック（1秒ごとに）
      $.timer(1000, function (timer) {

        var handleAfterProcess = function (response) {
          if (response.responseText != undefined && response.responseText != '') {
            var jsondata = jQuery.parseJSON(response.responseText);
            var code = jsondata.code;
            // ファイルあり
            if (code == '0') {
              // ダウンロード
              location.href = download_url;
              stop(mask, timer);

            }
            // ファイルなし（まだできていない）
            else if (code == '404') {
              // タイムアウトチェック
              var passed_ms = Math.floor(new Date().getTime() - st);
              var isTimeout = timeout_ms >= 0 && passed_ms > timeout_ms;
              if (isTimeout) {
                Ext.ucf.flowMsg(_msg.FAILED, _msg.MSG_FAILED_FILE_EXPORT);
                stop(mask, timer);
              }
            }
            else {
              stop(mask, timer);
              Ext.ucf.dispSysErrMsg();
            }
          }
          else {
            stop(mask, timer);
            Ext.ucf.dispSysErrMsg(code);
          }
        }
        // ファイルチェック
        Ext.Ajax.request({url: check_url, method: 'POST', params: {data_key: data_key}, success: handleAfterProcess, failure: handleAfterProcess});
      });

    },
    SubnetMaskList: [
      ['', _msg.VMSG_SUBNETMASK]
      ,
      ['\u002f\u0033\u0032', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u0020\u002f\u0020\u0033\u0032']
      ,
      ['\u002f\u0033\u0031', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0034\u0020\u002f\u0020\u0033\u0031']
      ,
      ['\u002f\u0033\u0030', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0032\u0020\u002f\u0020\u0033\u0030']
      ,
      ['\u002f\u0032\u0039', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0034\u0038\u0020\u002f\u0020\u0032\u0039']
      ,
      ['\u002f\u0032\u0038', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0034\u0030\u0020\u002f\u0020\u0032\u0038']
      ,
      ['\u002f\u0032\u0037', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0032\u0034\u0020\u002f\u0020\u0032\u0037']
      ,
      ['\u002f\u0032\u0036', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0031\u0039\u0032\u0020\u002f\u0020\u0032\u0036']
      ,
      ['\u002f\u0032\u0035', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0031\u0032\u0038\u0020\u002f\u0020\u0032\u0035']
      ,
      ['\u002f\u0032\u0034', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0032\u0034']
      ,
      ['\u002f\u0032\u0033', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0034\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0032\u0033']
      ,
      ['\u002f\u0032\u0032', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0035\u0032\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0032\u0032']
      ,
      ['\u002f\u0032\u0031', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0034\u0038\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0032\u0031']
      ,
      ['\u002f\u0032\u0030', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0034\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0032\u0030']
      ,
      ['\u002f\u0031\u0039', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0032\u0032\u0034\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0039']
      ,
      ['\u002f\u0031\u0038', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0031\u0039\u0032\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0038']
      ,
      ['\u002f\u0031\u0037', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0031\u0032\u0038\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0037']
      ,
      ['\u002f\u0031\u0036', '\u0032\u0035\u0035\u002e\u0032\u0035\u0035\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0036']
      ,
      ['\u002f\u0031\u0035', '\u0032\u0035\u0035\u002e\u0032\u0035\u0034\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0035']
      ,
      ['\u002f\u0031\u0034', '\u0032\u0035\u0035\u002e\u0032\u0035\u0032\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0034']
      ,
      ['\u002f\u0031\u0033', '\u0032\u0035\u0035\u002e\u0032\u0034\u0038\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0033']
      ,
      ['\u002f\u0031\u0032', '\u0032\u0035\u0035\u002e\u0032\u0034\u0030\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0032']
      ,
      ['\u002f\u0031\u0031', '\u0032\u0035\u0035\u002e\u0032\u0032\u0034\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0031']
      ,
      ['\u002f\u0031\u0030', '\u0032\u0035\u0035\u002e\u0031\u0039\u0032\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0031\u0030']
      ,
      ['\u002f\u0039', '\u0032\u0035\u0035\u002e\u0031\u0032\u0038\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0039']
      ,
      ['\u002f\u0038', '\u0032\u0035\u0035\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0038']
      ,
      ['\u002f\u0030', '\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u002e\u0030\u0030\u0030\u0020\u002f\u0020\u0030']
    ],
    FileEncodingList: [
      ['SJIS', _msg.VALUE_FILEENCODING_SJIS]
      //, ['JIS', _msg.VALUE_FILEENCODING_JIS]
      ,
      ['EUC', _msg.VALUE_FILEENCODING_EUC]
      //, ['UTF7', _msg.VALUE_FILEENCODING_UTF7]
      ,
      ['UTF8', _msg.VALUE_FILEENCODING_UTF8]
      //, ['UNICODE', _msg.VALUE_FILEENCODING_UNICODE]
    ],
    TimeZoneList: [
      ['Pacific/Midway', _msg.TIMEZONE_PACIFIC_MIDWAY]
      ,
      ['Pacific/Niue', _msg.TIMEZONE_PACIFIC_NIUE]
      ,
      ['Pacific/Pago_Pago', _msg.TIMEZONE_PACIFIC_PAGO_PAGO]
      ,
      ['Pacific/Honolulu', _msg.TIMEZONE_PACIFIC_HONOLULU]
      ,
      ['Pacific/Rarotonga', _msg.TIMEZONE_PACIFIC_RAROTONGA]
      ,
      ['Pacific/Tahiti', _msg.TIMEZONE_PACIFIC_TAHITI]
      ,
      ['Pacific/Marquesas', _msg.TIMEZONE_PACIFIC_MARQUESAS]
      ,
      ['America/Anchorage', _msg.TIMEZONE_AMERICA_ANCHORAGE]
      ,
      ['Pacific/Gambier', _msg.TIMEZONE_PACIFIC_GAMBIER]
      ,
      ['America/Los_Angeles', _msg.TIMEZONE_AMERICA_LOS_ANGELES]
      ,
      ['America/Tijuana', _msg.TIMEZONE_AMERICA_TIJUANA]
      ,
      ['America/Vancouver', _msg.TIMEZONE_AMERICA_VANCOUVER]
      ,
      ['America/Whitehorse', _msg.TIMEZONE_AMERICA_WHITEHORSE]
      ,
      ['Pacific/Pitcairn', _msg.TIMEZONE_PACIFIC_PITCAIRN]
      ,
      ['America/Dawson_Creek', _msg.TIMEZONE_AMERICA_DAWSON_CREEK]
      ,
      ['America/Denver', _msg.TIMEZONE_AMERICA_DENVER]
      ,
      ['America/Edmonton', _msg.TIMEZONE_AMERICA_EDMONTON]
      ,
      ['America/Hermosillo', _msg.TIMEZONE_AMERICA_HERMOSILLO]
      ,
      ['America/Mazatlan', _msg.TIMEZONE_AMERICA_MAZATLAN]
      ,
      ['America/Phoenix', _msg.TIMEZONE_AMERICA_PHOENIX]
      ,
      ['America/Yellowknife', _msg.TIMEZONE_AMERICA_YELLOWKNIFE]
      ,
      ['America/Belize', _msg.TIMEZONE_AMERICA_BELIZE]
      ,
      ['America/Chicago', _msg.TIMEZONE_AMERICA_CHICAGO]
      ,
      ['America/Costa_Rica', _msg.TIMEZONE_AMERICA_COSTA_RICA]
      ,
      ['America/El_Salvador', _msg.TIMEZONE_AMERICA_EL_SALVADOR]
      ,
      ['America/Guatemala', _msg.TIMEZONE_AMERICA_GUATEMALA]
      ,
      ['America/Managua', _msg.TIMEZONE_AMERICA_MANAGUA]
      ,
      ['America/Mexico_City', _msg.TIMEZONE_AMERICA_MEXICO_CITY]
      ,
      ['America/Regina', _msg.TIMEZONE_AMERICA_REGINA]
      ,
      ['America/Tegucigalpa', _msg.TIMEZONE_AMERICA_TEGUCIGALPA]
      ,
      ['America/Winnipeg', _msg.TIMEZONE_AMERICA_WINNIPEG]
      ,
      ['Pacific/Easter', _msg.TIMEZONE_PACIFIC_EASTER]
      ,
      ['Pacific/Galapagos', _msg.TIMEZONE_PACIFIC_GALAPAGOS]
      ,
      ['America/Bogota', _msg.TIMEZONE_AMERICA_BOGOTA]
      ,
      ['America/Cayman', _msg.TIMEZONE_AMERICA_CAYMAN]
      ,
      ['America/Grand_Turk', _msg.TIMEZONE_AMERICA_GRAND_TURK]
      ,
      ['America/Guayaquil', _msg.TIMEZONE_AMERICA_GUAYAQUIL]
      ,
      ['America/Havana', _msg.TIMEZONE_AMERICA_HAVANA]
      ,
      ['America/Iqaluit', _msg.TIMEZONE_AMERICA_IQALUIT]
      ,
      ['America/Jamaica', _msg.TIMEZONE_AMERICA_JAMAICA]
      ,
      ['America/Lima', _msg.TIMEZONE_AMERICA_LIMA]
      ,
      ['America/Montreal', _msg.TIMEZONE_AMERICA_MONTREAL]
      ,
      ['America/Nassau', _msg.TIMEZONE_AMERICA_NASSAU]
      ,
      ['America/New_York', _msg.TIMEZONE_AMERICA_NEW_YORK]
      ,
      ['America/Panama', _msg.TIMEZONE_AMERICA_PANAMA]
      ,
      ['America/Port-au-Prince', _msg.TIMEZONE_AMERICA_PORT_MAU_MPRINCE]
      ,
      ['America/Rio_Branco', _msg.TIMEZONE_AMERICA_RIO_BRANCO]
      ,
      ['America/Toronto', _msg.TIMEZONE_AMERICA_TORONTO]
      ,
      ['America/Caracas', _msg.TIMEZONE_AMERICA_CARACAS]
      ,
      ['America/Antigua', _msg.TIMEZONE_AMERICA_ANTIGUA]
      ,
      ['America/Asuncion', _msg.TIMEZONE_AMERICA_ASUNCION]
      ,
      ['America/Barbados', _msg.TIMEZONE_AMERICA_BARBADOS]
      ,
      ['America/Boa_Vista', _msg.TIMEZONE_AMERICA_BOA_VISTA]
      ,
      ['America/Campo_Grande', _msg.TIMEZONE_AMERICA_CAMPO_GRANDE]
      ,
      ['America/Cuiaba', _msg.TIMEZONE_AMERICA_CUIABA]
      ,
      ['America/Curacao', _msg.TIMEZONE_AMERICA_CURACAO]
      ,
      ['America/Guyana', _msg.TIMEZONE_AMERICA_GUYANA]
      ,
      ['America/Halifax', _msg.TIMEZONE_AMERICA_HALIFAX]
      ,
      ['America/Manaus', _msg.TIMEZONE_AMERICA_MANAUS]
      ,
      ['America/Martinique', _msg.TIMEZONE_AMERICA_MARTINIQUE]
      ,
      ['America/Port_of_Spain', _msg.TIMEZONE_AMERICA_PORT_OF_SPAIN]
      ,
      ['America/Porto_Velho', _msg.TIMEZONE_AMERICA_PORTO_VELHO]
      ,
      ['America/Puerto_Rico', _msg.TIMEZONE_AMERICA_PUERTO_RICO]
      ,
      ['America/Santiago', _msg.TIMEZONE_AMERICA_SANTIAGO]
      ,
      ['America/Santo_Domingo', _msg.TIMEZONE_AMERICA_SANTO_DOMINGO]
      ,
      ['America/Thule', _msg.TIMEZONE_AMERICA_THULE]
      ,
      ['Antarctica/Palmer', _msg.TIMEZONE_ANTARCTICA_PALMER]
      ,
      ['Atlantic/Bermuda', _msg.TIMEZONE_ATLANTIC_BERMUDA]
      ,
      ['America/St_Johns', _msg.TIMEZONE_AMERICA_ST_JOHNS]
      ,
      ['America/Araguaina', _msg.TIMEZONE_AMERICA_ARAGUAINA]
      ,
      ['America/Bahia', _msg.TIMEZONE_AMERICA_BAHIA]
      ,
      ['America/Belem', _msg.TIMEZONE_AMERICA_BELEM]
      ,
      ['America/Cayenne', _msg.TIMEZONE_AMERICA_CAYENNE]
      ,
      ['America/Fortaleza', _msg.TIMEZONE_AMERICA_FORTALEZA]
      ,
      ['America/Godthab', _msg.TIMEZONE_AMERICA_GODTHAB]
      ,
      ['America/Maceio', _msg.TIMEZONE_AMERICA_MACEIO]
      ,
      ['America/Miquelon', _msg.TIMEZONE_AMERICA_MIQUELON]
      ,
      ['America/Montevideo', _msg.TIMEZONE_AMERICA_MONTEVIDEO]
      ,
      ['America/Paramaribo', _msg.TIMEZONE_AMERICA_PARAMARIBO]
      ,
      ['America/Recife', _msg.TIMEZONE_AMERICA_RECIFE]
      ,
      ['America/Sao_Paulo', _msg.TIMEZONE_AMERICA_SAO_PAULO]
      ,
      ['Antarctica/Rothera', _msg.TIMEZONE_ANTARCTICA_ROTHERA]
      ,
      ['Atlantic/Stanley', _msg.TIMEZONE_ATLANTIC_STANLEY]
      ,
      ['America/Noronha', _msg.TIMEZONE_AMERICA_NORONHA]
      ,
      ['Atlantic/South_Georgia', _msg.TIMEZONE_ATLANTIC_SOUTH_GEORGIA]
      ,
      ['America/Scoresbysund', _msg.TIMEZONE_AMERICA_SCORESBYSUND]
      ,
      ['Atlantic/Azores', _msg.TIMEZONE_ATLANTIC_AZORES]
      ,
      ['Atlantic/Cape_Verde', _msg.TIMEZONE_ATLANTIC_CAPE_VERDE]
      ,
      ['Africa/Abidjan', _msg.TIMEZONE_AFRICA_ABIDJAN]
      ,
      ['Africa/Accra', _msg.TIMEZONE_AFRICA_ACCRA]
      ,
      ['Africa/Bamako', _msg.TIMEZONE_AFRICA_BAMAKO]
      ,
      ['Africa/Banjul', _msg.TIMEZONE_AFRICA_BANJUL]
      ,
      ['Africa/Bissau', _msg.TIMEZONE_AFRICA_BISSAU]
      ,
      ['Africa/Casablanca', _msg.TIMEZONE_AFRICA_CASABLANCA]
      ,
      ['Africa/Conakry', _msg.TIMEZONE_AFRICA_CONAKRY]
      ,
      ['Africa/Dakar', _msg.TIMEZONE_AFRICA_DAKAR]
      ,
      ['Africa/El_Aaiun', _msg.TIMEZONE_AFRICA_EL_AAIUN]
      ,
      ['Africa/Freetown', _msg.TIMEZONE_AFRICA_FREETOWN]
      ,
      ['Africa/Lome', _msg.TIMEZONE_AFRICA_LOME]
      ,
      ['Africa/Monrovia', _msg.TIMEZONE_AFRICA_MONROVIA]
      ,
      ['Africa/Nouakchott', _msg.TIMEZONE_AFRICA_NOUAKCHOTT]
      ,
      ['Africa/Ouagadougou', _msg.TIMEZONE_AFRICA_OUAGADOUGOU]
      ,
      ['Africa/Sao_Tome', _msg.TIMEZONE_AFRICA_SAO_TOME]
      ,
      ['America/Danmarkshavn', _msg.TIMEZONE_AMERICA_DANMARKSHAVN]
      ,
      ['Atlantic/Canary', _msg.TIMEZONE_ATLANTIC_CANARY]
      ,
      ['Atlantic/Faroe', _msg.TIMEZONE_ATLANTIC_FAROE]
      ,
      ['Atlantic/Reykjavik', _msg.TIMEZONE_ATLANTIC_REYKJAVIK]
      ,
      ['Atlantic/St_Helena', _msg.TIMEZONE_ATLANTIC_ST_HELENA]
      ,
      ['Etc/UTC', _msg.TIMEZONE_ETC_UTC]
      ,
      ['Europe/Lisbon', _msg.TIMEZONE_EUROPE_LISBON]
      ,
      ['Africa/Algiers', _msg.TIMEZONE_AFRICA_ALGIERS]
      ,
      ['Africa/Bangui', _msg.TIMEZONE_AFRICA_BANGUI]
      ,
      ['Africa/Brazzaville', _msg.TIMEZONE_AFRICA_BRAZZAVILLE]
      ,
      ['Africa/Ceuta', _msg.TIMEZONE_AFRICA_CEUTA]
      ,
      ['Africa/Douala', _msg.TIMEZONE_AFRICA_DOUALA]
      ,
      ['Africa/Kinshasa', _msg.TIMEZONE_AFRICA_KINSHASA]
      ,
      ['Africa/Lagos', _msg.TIMEZONE_AFRICA_LAGOS]
      ,
      ['Africa/Libreville', _msg.TIMEZONE_AFRICA_LIBREVILLE]
      ,
      ['Africa/Luanda', _msg.TIMEZONE_AFRICA_LUANDA]
      ,
      ['Africa/Malabo', _msg.TIMEZONE_AFRICA_MALABO]
      ,
      ['Africa/Ndjamena', _msg.TIMEZONE_AFRICA_NDJAMENA]
      ,
      ['Africa/Niamey', _msg.TIMEZONE_AFRICA_NIAMEY]
      ,
      ['Africa/Porto-Novo', _msg.TIMEZONE_AFRICA_PORTO_MNOVO]
      ,
      ['Africa/Tunis', _msg.TIMEZONE_AFRICA_TUNIS]
      ,
      ['Africa/Windhoek', _msg.TIMEZONE_AFRICA_WINDHOEK]
      ,
      ['Europe/Amsterdam', _msg.TIMEZONE_EUROPE_AMSTERDAM]
      ,
      ['Europe/Andorra', _msg.TIMEZONE_EUROPE_ANDORRA]
      ,
      ['Europe/Belgrade', _msg.TIMEZONE_EUROPE_BELGRADE]
      ,
      ['Europe/Berlin', _msg.TIMEZONE_EUROPE_BERLIN]
      ,
      ['Europe/Brussels', _msg.TIMEZONE_EUROPE_BRUSSELS]
      ,
      ['Europe/Budapest', _msg.TIMEZONE_EUROPE_BUDAPEST]
      ,
      ['Europe/Copenhagen', _msg.TIMEZONE_EUROPE_COPENHAGEN]
      ,
      ['Europe/Gibraltar', _msg.TIMEZONE_EUROPE_GIBRALTAR]
      ,
      ['Europe/Luxembourg', _msg.TIMEZONE_EUROPE_LUXEMBOURG]
      ,
      ['Europe/Madrid', _msg.TIMEZONE_EUROPE_MADRID]
      ,
      ['Europe/Malta', _msg.TIMEZONE_EUROPE_MALTA]
      ,
      ['Europe/Monaco', _msg.TIMEZONE_EUROPE_MONACO]
      ,
      ['Europe/Oslo', _msg.TIMEZONE_EUROPE_OSLO]
      ,
      ['Europe/Paris', _msg.TIMEZONE_EUROPE_PARIS]
      ,
      ['Europe/Prague', _msg.TIMEZONE_EUROPE_PRAGUE]
      ,
      ['Europe/Rome', _msg.TIMEZONE_EUROPE_ROME]
      ,
      ['Europe/Stockholm', _msg.TIMEZONE_EUROPE_STOCKHOLM]
      ,
      ['Europe/Tirane', _msg.TIMEZONE_EUROPE_TIRANE]
      ,
      ['Europe/Vienna', _msg.TIMEZONE_EUROPE_VIENNA]
      ,
      ['Europe/Zurich', _msg.TIMEZONE_EUROPE_ZURICH]
      ,
      ['Africa/Blantyre', _msg.TIMEZONE_AFRICA_BLANTYRE]
      ,
      ['Africa/Bujumbura', _msg.TIMEZONE_AFRICA_BUJUMBURA]
      ,
      ['Africa/Cairo', _msg.TIMEZONE_AFRICA_CAIRO]
      ,
      ['Africa/Gaborone', _msg.TIMEZONE_AFRICA_GABORONE]
      ,
      ['Africa/Harare', _msg.TIMEZONE_AFRICA_HARARE]
      ,
      ['Africa/Johannesburg', _msg.TIMEZONE_AFRICA_JOHANNESBURG]
      ,
      ['Africa/Kigali', _msg.TIMEZONE_AFRICA_KIGALI]
      ,
      ['Africa/Lubumbashi', _msg.TIMEZONE_AFRICA_LUBUMBASHI]
      ,
      ['Africa/Lusaka', _msg.TIMEZONE_AFRICA_LUSAKA]
      ,
      ['Africa/Maputo', _msg.TIMEZONE_AFRICA_MAPUTO]
      ,
      ['Africa/Maseru', _msg.TIMEZONE_AFRICA_MASERU]
      ,
      ['Africa/Mbabane', _msg.TIMEZONE_AFRICA_MBABANE]
      ,
      ['Africa/Tripoli', _msg.TIMEZONE_AFRICA_TRIPOLI]
      ,
      ['Asia/Amman', _msg.TIMEZONE_ASIA_AMMAN]
      ,
      ['Asia/Beirut', _msg.TIMEZONE_ASIA_BEIRUT]
      ,
      ['Asia/Damascus', _msg.TIMEZONE_ASIA_DAMASCUS]
      ,
      ['Asia/Gaza', _msg.TIMEZONE_ASIA_GAZA]
      ,
      ['Asia/Jerusalem', _msg.TIMEZONE_ASIA_JERUSALEM]
      ,
      ['Asia/Nicosia', _msg.TIMEZONE_ASIA_NICOSIA]
      ,
      ['Europe/Athens', _msg.TIMEZONE_EUROPE_ATHENS]
      ,
      ['Europe/Bucharest', _msg.TIMEZONE_EUROPE_BUCHAREST]
      ,
      ['Europe/Chisinau', _msg.TIMEZONE_EUROPE_CHISINAU]
      ,
      ['Europe/Helsinki', _msg.TIMEZONE_EUROPE_HELSINKI]
      ,
      ['Europe/Istanbul', _msg.TIMEZONE_EUROPE_ISTANBUL]
      ,
      ['Europe/Riga', _msg.TIMEZONE_EUROPE_RIGA]
      ,
      ['Europe/Sofia', _msg.TIMEZONE_EUROPE_SOFIA]
      ,
      ['Europe/Tallinn', _msg.TIMEZONE_EUROPE_TALLINN]
      ,
      ['Europe/Vilnius', _msg.TIMEZONE_EUROPE_VILNIUS]
      ,
      ['Africa/Addis_Ababa', _msg.TIMEZONE_AFRICA_ADDIS_ABABA]
      ,
      ['Africa/Asmara', _msg.TIMEZONE_AFRICA_ASMARA]
      ,
      ['Africa/Dar_es_Salaam', _msg.TIMEZONE_AFRICA_DAR_ES_SALAAM]
      ,
      ['Africa/Djibouti', _msg.TIMEZONE_AFRICA_DJIBOUTI]
      ,
      ['Africa/Kampala', _msg.TIMEZONE_AFRICA_KAMPALA]
      ,
      ['Africa/Khartoum', _msg.TIMEZONE_AFRICA_KHARTOUM]
      ,
      ['Africa/Mogadishu', _msg.TIMEZONE_AFRICA_MOGADISHU]
      ,
      ['Africa/Nairobi', _msg.TIMEZONE_AFRICA_NAIROBI]
      ,
      ['Antarctica/Syowa', _msg.TIMEZONE_ANTARCTICA_SYOWA]
      ,
      ['Asia/Aden', _msg.TIMEZONE_ASIA_ADEN]
      ,
      ['Asia/Baghdad', _msg.TIMEZONE_ASIA_BAGHDAD]
      ,
      ['Asia/Bahrain', _msg.TIMEZONE_ASIA_BAHRAIN]
      ,
      ['Asia/Kuwait', _msg.TIMEZONE_ASIA_KUWAIT]
      ,
      ['Asia/Qatar', _msg.TIMEZONE_ASIA_QATAR]
      ,
      ['Asia/Riyadh', _msg.TIMEZONE_ASIA_RIYADH]
      ,
      ['Europe/Kaliningrad', _msg.TIMEZONE_EUROPE_KALININGRAD]
      ,
      ['Europe/Minsk', _msg.TIMEZONE_EUROPE_MINSK]
      ,
      ['Indian/Antananarivo', _msg.TIMEZONE_INDIAN_ANTANANARIVO]
      ,
      ['Indian/Comoro', _msg.TIMEZONE_INDIAN_COMORO]
      ,
      ['Indian/Mayotte', _msg.TIMEZONE_INDIAN_MAYOTTE]
      ,
      ['Asia/Tehran', _msg.TIMEZONE_ASIA_TEHRAN]
      ,
      ['Asia/Baku', _msg.TIMEZONE_ASIA_BAKU]
      ,
      ['Asia/Dubai', _msg.TIMEZONE_ASIA_DUBAI]
      ,
      ['Asia/Muscat', _msg.TIMEZONE_ASIA_MUSCAT]
      ,
      ['Asia/Tbilisi', _msg.TIMEZONE_ASIA_TBILISI]
      ,
      ['Europe/Moscow', _msg.TIMEZONE_EUROPE_MOSCOW]
      ,
      ['Europe/Samara', _msg.TIMEZONE_EUROPE_SAMARA]
      ,
      ['Indian/Mahe', _msg.TIMEZONE_INDIAN_MAHE]
      ,
      ['Indian/Mauritius', _msg.TIMEZONE_INDIAN_MAURITIUS]
      ,
      ['Indian/Reunion', _msg.TIMEZONE_INDIAN_REUNION]
      ,
      ['Antarctica/Mawson', _msg.TIMEZONE_ANTARCTICA_MAWSON]
      ,
      ['Asia/Aqtau', _msg.TIMEZONE_ASIA_AQTAU]
      ,
      ['Asia/Aqtobe', _msg.TIMEZONE_ASIA_AQTOBE]
      ,
      ['Asia/Ashgabat', _msg.TIMEZONE_ASIA_ASHGABAT]
      ,
      ['Asia/Dushanbe', _msg.TIMEZONE_ASIA_DUSHANBE]
      ,
      ['Asia/Karachi', _msg.TIMEZONE_ASIA_KARACHI]
      ,
      ['Asia/Tashkent', _msg.TIMEZONE_ASIA_TASHKENT]
      ,
      ['Indian/Kerguelen', _msg.TIMEZONE_INDIAN_KERGUELEN]
      ,
      ['Indian/Maldives', _msg.TIMEZONE_INDIAN_MALDIVES]
      ,
      ['Asia/Colombo', _msg.TIMEZONE_ASIA_COLOMBO]
      ,
      ['Asia/Katmandu', _msg.TIMEZONE_ASIA_KATMANDU]
      ,
      ['Antarctica/Vostok', _msg.TIMEZONE_ANTARCTICA_VOSTOK]
      ,
      ['Asia/Almaty', _msg.TIMEZONE_ASIA_ALMATY]
      ,
      ['Asia/Bishkek', _msg.TIMEZONE_ASIA_BISHKEK]
      ,
      ['Asia/Dhaka', _msg.TIMEZONE_ASIA_DHAKA]
      ,
      ['Asia/Thimphu', _msg.TIMEZONE_ASIA_THIMPHU]
      ,
      ['Asia/Yekaterinburg', _msg.TIMEZONE_ASIA_YEKATERINBURG]
      ,
      ['Indian/Chagos', _msg.TIMEZONE_INDIAN_CHAGOS]
      ,
      ['Asia/Rangoon', _msg.TIMEZONE_ASIA_RANGOON]
      ,
      ['Indian/Cocos', _msg.TIMEZONE_INDIAN_COCOS]
      ,
      ['Antarctica/Davis', _msg.TIMEZONE_ANTARCTICA_DAVIS]
      ,
      ['Asia/Bangkok', _msg.TIMEZONE_ASIA_BANGKOK]
      ,
      ['Asia/Hovd', _msg.TIMEZONE_ASIA_HOVD]
      ,
      ['Asia/Jakarta', _msg.TIMEZONE_ASIA_JAKARTA]
      ,
      ['Asia/Omsk', _msg.TIMEZONE_ASIA_OMSK]
      ,
      ['Asia/Phnom_Penh', _msg.TIMEZONE_ASIA_PHNOM_PENH]
      ,
      ['Asia/Vientiane', _msg.TIMEZONE_ASIA_VIENTIANE]
      ,
      ['Indian/Christmas', _msg.TIMEZONE_INDIAN_CHRISTMAS]
      ,
      ['Antarctica/Casey', _msg.TIMEZONE_ANTARCTICA_CASEY]
      ,
      ['Asia/Brunei', _msg.TIMEZONE_ASIA_BRUNEI]
      ,
      ['Asia/Choibalsan', _msg.TIMEZONE_ASIA_CHOIBALSAN]
      ,
      ['Asia/Hong_Kong', _msg.TIMEZONE_ASIA_HONG_KONG]
      ,
      ['Asia/Krasnoyarsk', _msg.TIMEZONE_ASIA_KRASNOYARSK]
      ,
      ['Asia/Kuala_Lumpur', _msg.TIMEZONE_ASIA_KUALA_LUMPUR]
      ,
      ['Asia/Macau', _msg.TIMEZONE_ASIA_MACAU]
      ,
      ['Asia/Makassar', _msg.TIMEZONE_ASIA_MAKASSAR]
      ,
      ['Asia/Manila', _msg.TIMEZONE_ASIA_MANILA]
      ,
      ['Asia/Shanghai', _msg.TIMEZONE_ASIA_SHANGHAI]
      ,
      ['Asia/Singapore', _msg.TIMEZONE_ASIA_SINGAPORE]
      ,
      ['Asia/Taipei', _msg.TIMEZONE_ASIA_TAIPEI]
      ,
      ['Asia/Ulaanbaatar', _msg.TIMEZONE_ASIA_ULAANBAATAR]
      ,
      ['Australia/Perth', _msg.TIMEZONE_AUSTRALIA_PERTH]
      ,
      ['Asia/Dili', _msg.TIMEZONE_ASIA_DILI]
      ,
      ['Asia/Irkutsk', _msg.TIMEZONE_ASIA_IRKUTSK]
      ,
      ['Asia/Jayapura', _msg.TIMEZONE_ASIA_JAYAPURA]
      ,
      ['Asia/Pyongyang', _msg.TIMEZONE_ASIA_PYONGYANG]
      ,
      ['Asia/Seoul', _msg.TIMEZONE_ASIA_SEOUL]
      ,
      ['Asia/Tokyo', _msg.TIMEZONE_ASIA_TOKYO]
      ,
      ['Pacific/Palau', _msg.TIMEZONE_PACIFIC_PALAU]
      ,
      ['Australia/Adelaide', _msg.TIMEZONE_AUSTRALIA_ADELAIDE]
      ,
      ['Australia/Darwin', _msg.TIMEZONE_AUSTRALIA_DARWIN]
      ,
      ['Antarctica/DumontDUrville', _msg.TIMEZONE_ANTARCTICA_DUMONTDURVILLE]
      ,
      ['Asia/Yakutsk', _msg.TIMEZONE_ASIA_YAKUTSK]
      ,
      ['Australia/Brisbane', _msg.TIMEZONE_AUSTRALIA_BRISBANE]
      ,
      ['Australia/Hobart', _msg.TIMEZONE_AUSTRALIA_HOBART]
      ,
      ['Australia/Sydney', _msg.TIMEZONE_AUSTRALIA_SYDNEY]
      ,
      ['Pacific/Guam', _msg.TIMEZONE_PACIFIC_GUAM]
      ,
      ['Pacific/Port_Moresby', _msg.TIMEZONE_PACIFIC_PORT_MORESBY]
      ,
      ['Pacific/Saipan', _msg.TIMEZONE_PACIFIC_SAIPAN]
      ,
      ['Asia/Vladivostok', _msg.TIMEZONE_ASIA_VLADIVOSTOK]
      ,
      ['Pacific/Efate', _msg.TIMEZONE_PACIFIC_EFATE]
      ,
      ['Pacific/Guadalcanal', _msg.TIMEZONE_PACIFIC_GUADALCANAL]
      ,
      ['Pacific/Kosrae', _msg.TIMEZONE_PACIFIC_KOSRAE]
      ,
      ['Pacific/Noumea', _msg.TIMEZONE_PACIFIC_NOUMEA]
      ,
      ['Pacific/Norfolk', _msg.TIMEZONE_PACIFIC_NORFOLK]
      ,
      ['Asia/Kamchatka', _msg.TIMEZONE_ASIA_KAMCHATKA]
      ,
      ['Asia/Magadan', _msg.TIMEZONE_ASIA_MAGADAN]
      ,
      ['Pacific/Auckland', _msg.TIMEZONE_PACIFIC_AUCKLAND]
      ,
      ['Pacific/Fiji', _msg.TIMEZONE_PACIFIC_FIJI]
      ,
      ['Pacific/Funafuti', _msg.TIMEZONE_PACIFIC_FUNAFUTI]
      ,
      ['Pacific/Kwajalein', _msg.TIMEZONE_PACIFIC_KWAJALEIN]
      ,
      ['Pacific/Majuro', _msg.TIMEZONE_PACIFIC_MAJURO]
      ,
      ['Pacific/Nauru', _msg.TIMEZONE_PACIFIC_NAURU]
      ,
      ['Pacific/Tarawa', _msg.TIMEZONE_PACIFIC_TARAWA]
      ,
      ['Pacific/Wake', _msg.TIMEZONE_PACIFIC_WAKE]
      ,
      ['Pacific/Wallis', _msg.TIMEZONE_PACIFIC_WALLIS]
      ,
      ['Pacific/Apia', _msg.TIMEZONE_PACIFIC_APIA]
      ,
      ['Pacific/Enderbury', _msg.TIMEZONE_PACIFIC_ENDERBURY]
      ,
      ['Pacific/Fakaofo', _msg.TIMEZONE_PACIFIC_FAKAOFO]
      ,
      ['Pacific/Tongatapu', _msg.TIMEZONE_PACIFIC_TONGATAPU]
      ,
      ['Pacific/Kiritimati', _msg.TIMEZONE_PACIFIC_KIRITIMATI]
    ],
    TimeZoneList_old: [
      ['-12', _msg.TIMEZONE_M_12]
      ,
      ['-11', _msg.TIMEZONE_M_11]
      ,
      ['-10', _msg.TIMEZONE_M_10]
      ,
      ['-9', _msg.TIMEZONE_M_9]
      ,
      ['-8', _msg.TIMEZONE_M_8]
      ,
      ['-7', _msg.TIMEZONE_M_7]
      ,
      ['-6', _msg.TIMEZONE_M_6]
      ,
      ['-5', _msg.TIMEZONE_M_5]
      ,
      ['-4', _msg.TIMEZONE_M_4]
      ,
      ['-3', _msg.TIMEZONE_M_3]
      ,
      ['-2', _msg.TIMEZONE_M_2]
      ,
      ['-1', _msg.TIMEZONE_M_1]
      ,
      ['0', _msg.TIMEZONE_0]
      ,
      ['+1', _msg.TIMEZONE_P_1]
      ,
      ['+2', _msg.TIMEZONE_P_2]
      ,
      ['+3', _msg.TIMEZONE_P_3]
      ,
      ['+4', _msg.TIMEZONE_P_4]
      ,
      ['+5', _msg.TIMEZONE_P_5]
      ,
      ['+6', _msg.TIMEZONE_P_6]
      ,
      ['+7', _msg.TIMEZONE_P_7]
      ,
      ['+8', _msg.TIMEZONE_P_8]
      ,
      ['+9', _msg.TIMEZONE_P_9]
      ,
      ['+10', _msg.TIMEZONE_P_10]
      ,
      ['+11', _msg.TIMEZONE_P_11]
      ,
      ['+12', _msg.TIMEZONE_P_12]
      ,
      ['+13', _msg.TIMEZONE_P_13]
      ,
      ['+14', _msg.TIMEZONE_P_14]
    ],
    init: function () {

      Ext.Ajax.timeout = 600000;	// timeout is 600s. the default is 30s.

      var lb = Ext.get('lib-bar');
      if (lb) {
        lb.show();
      }


      Ext.apply(Ext.form.VTypes, {
        autocmd: function (val, field) {
          return Ext.ucf.checkValidationByAutoCmd(field, field.autoCmd);
        }
      });

      // for IE 2015.07.02
      if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function (suffix) {
          return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
      }

    }
  };


}();


SateraitoUI = {
    mask: null,
    /**
     * clearMessage
     *
     * メッセージ表示領域をクリアする
     * ガジェットからもOpenID画面からも共通して呼び出せる
     */
    clearMessage: function () {
        if (typeof(SateraitoUI.mask) != 'undefined' && SateraitoUI.mask != null) {
            SateraitoUI.mask.hide();
        }

    },

    /**
     * showLoadingMessage
     *
     * 読込中メッセージを表示する
     * ガジェットからもOpenID画面からも共通して呼び出せる
     *
     * @param {string} aMessageText
     */
    showLoadingMessage: function (aMessageText) {
        if (typeof(aMessageText) == 'undefined') {
            aMessageText = _msg.LOADING;
        }

        if (Ext.get('contentsArea')==null) return;

        // マスクをかける
        SateraitoUI.mask = new Ext.LoadMask(Ext.get('contentsArea'), {msg: aMessageText});
        SateraitoUI.mask.show();
    },

    showTimerMessage: function(aMessageText, aTime)
    {
        SateraitoUI.showLoadingMessage(aMessageText);
    },

    /**
     * changeEnabledComponents
     *
     * @param {string} aDocId
     * @param {array} aOkToUpdateField
     */
    changeEnabledComponents: function (isEnabled) {
        var cmpIds = ['approve_button', 'reject_button', 'approve_button2', 'reject_button2', 'update_button', 'update_button2', 'looked_button', 'btn_submit_new_component', 'btn_submit_cancel_new_component', 'select_follow', 'select_favorite', 'post_to_calendar'];
        for (var i = 0; i < cmpIds.length; i++) {
            var cmpId = cmpIds[i];
            var cmp = Ext.getCmp(cmpId);
            if (cmp) {
                if (isEnabled) {
                    cmp.enable();
                } else {
                    cmp.disable();
                }
            }
        }
    }
};

AppsUser = {

    isAccessToken:false,
    accessToken:'',
    userListLoadingStatus: '0',	// 0=ロード前 1=ロード中 2=ロード完了
    userList: [],
    viewerUserInfo: null,		// ログイン中のユーザーの情報

    getTokenString:function(prefix){
      var strPrefix = prefix || '&';
      if (!AppsUser.isAccessToken) return '';
      return '{0}token={1}'.format(strPrefix,AppsUser.accessToken);
    },

    getAccessToken:function(callback){
      if (AppsUser.accessToken!='') {
        if (typeof callback === "function") {
          callback(AppsUser.accessToken);
        }
      }else{
        AppsUser.requestToken(function(jsondata){
          AppsUser.accessToken =jsondata.token;
          if (typeof callback === "function") {
            callback(AppsUser.accessToken);
          }
        })
      }
    },

    requestOneTimeToken: function(app_id, aForPreview, callback, aNumRetry)
    {
        if (typeof(aRenew) == 'undefined') {
        aRenew = false;
        }
        AppsUser._requestToken(callback, aRenew);
    },

    /**
     * requestToken
     *
     * ユーザートークンの取得
     *
     * @param {function} callback
     * @param {boolean} aRenew
     */
    requestToken: function (callback, aRenew) {
        if (typeof(aRenew) == 'undefined') {
            aRenew = false;
        }
        AppsUser._requestToken(callback, aRenew);
    },

    /**
     * _requestToken
     *
     * ユーザートークンの取得（ガジェットIO版）
     *
     * @param {Function} callback
     * @param {number} aNumRetry
     */
    _requestToken: function (callback, aRenew, aNumRetry) {
        if (typeof(aNumRetry) == 'undefined') {
            aNumRetry = 1;
        }

        var baseUrl = _vurl;
        var methodUrl = 'createtoken';

        ExecuteRequest.get({
            baseUrl: baseUrl,
            methodUrl: methodUrl,
            callback: callback
        });
    },

    /**
     * getUser
     *
     * @param {String} aUserEmail
     * @return {Object}
     */
    getUser: function (aUserEmail) {
        var ret = null;
        $.each(AppsUser.userList, function (i, user) {
            if (user.user_email == aUserEmail) {
                ret = user;
                // ここの「return false」は、$.eachを抜けるためのもの
                return false;
            }
        });
        return ret;
    },

    /**
     * getUserName
     *
     * メールアドレスよりユーザー名を返す
     *
     * @param {String} aUserEmail
     * @return {String} ユーザー名
     */
    getUserName: function (aUserEmail) {
        var user = AppsUser.getUser(aUserEmail);
        if (!user || (!user.family_name && !user.given_name)) {
            return aUserEmail;
        }
        return user.family_name + user.given_name;
    }
};

ExecuteRequest = {

    /**
     * post
     *
     * 通信エラー等でエラーした場合はコールバックは必ずキックされる
     *
     * @param {object} aParam
     *   callback ... post終了後にキックされる
     *   aEnableRetry ... trueの場合、リトライを最大10回までおこなう
     */
    post: function (aParam) {
        // 必須項目
        var aBaseUrl = aParam['baseUrl'];
        var aMethodUrl = aParam['methodUrl'];
        var aPostData = aParam['postData'];
        if (typeof(aBaseUrl) == 'undefined' || typeof(aMethodUrl) == 'undefined' || typeof(aPostData) == 'undefined') {
            console.log('** ExecuteRequest error aBaseUrl=' + aBaseUrl + ' aMethodUrl=' + aMethodUrl + ' aPostData=' + aPostData);
            return;
        }

        // オプション項目
        var callback = aParam['callback'];
        var enableRetry = aParam['enableRetry'];
        if (typeof(enableRetry) == 'undefined') {
            enableRetry = false;
        }
        var silentMode = aParam['silentMode'];
        if (typeof(silentMode) == 'undefined') {
            silentMode = false;
        }
        var busyMsg = aParam['busyMsg'];
        if (typeof(busyMsg) == 'undefined') {
            busyMsg = '';
        }

        ExecuteRequest.requestPost(aBaseUrl + aMethodUrl, enableRetry, silentMode, busyMsg, aPostData, callback);
    },

    /**
     * requestPost
     *
     * @param {string} aUrl
     * @param {boolean} aEnableRetry
     * @param {boolean} aSilentMode
     * @param {object} aPostData
     * @param {function} callback
     */
    requestPost: function (aUrl, aEnableRetry, aSilentMode, aBusyMsg, aPostData, callback, aNumRetry) {
        if (typeof(aNumRetry) == 'undefined') {
            aNumRetry = 1;
        }

        // 更新していますメッセージを表示
        if (!aSilentMode) {
            if (aBusyMsg == '') {
                SateraitoUI.showLoadingMessage();
            } else {
                SateraitoUI.showLoadingMessage(aBusyMsg);
            }
        }

        Ext.Ajax.request({
            url: aUrl,
            method: 'POST',
            params: aPostData,
            success: function (response, options) {
                // メッセージを消去
                if (!aSilentMode) {
                    SateraitoUI.clearMessage();
                }

                // コールバックをキック
                var jsondata = Ext.decode(response.responseText);
                if (typeof(callback) == 'function') {
                    callback(jsondata);
                }
            },
            failure: function () {
                // メッセージを消去
                if (!aSilentMode) {
                    SateraitoUI.clearMessage();
                }

                // 失敗時
                if (aEnableRetry) {
                    if (aNumRetry < 5) {
                        // リトライ
                        (function () {
                            ExecuteRequest.postOid(aUrl, aEnableRetry, aSilentMode, aBusyMsg, aPostData, callback, (aNumRetry + 1));
                        }).defer(MyUtil.getWaitMillisec(aNumRetry));
                    } else {
                        // １０回リトライしたがだめだった
                        // エラーメッセージ
                        if (response.rc == 401) {
                            // ガジェットタイムアウト
                            SateraitoUI.showLoadingMessage(_msg.ERROR_TIMEOUT);
                        } else {
                            SateraitoUI.showTimerMessage(_msg.ERROR_WHILE_LOADING, 10);
                        }
                        // コールバックをキック
                        callback({
                            status: 'error',
                            error_code: 'unknown_error'
                        });
                    }
                } else {
                    // コールバックをキック
                    callback({
                        status: 'error',
                        error_code: 'unknown_error'
                    });
                }
            }
        });
    },

    /**
     * get
     *
     * ガジェットIO、OpenID共通
     *
     * @param {string} aParam ... パラメータ指定オブジェクト
     *   baseUrl {string} ... 末尾に「/」は付けない
     *   methodUrl {string} ... 先頭に「/」は必要
     *   callback {function}
     *   silentMode {boolean}
     *   callbackWhenError {boolean} ... 10回リトライして終了した時にコールバックする時にはtrueを指定する
     *   randomWait {boolean} ... 最初のリクエストの前に最大100ミリ秒のランダムなWaitを入れる
     */
    get: function (aParam) {
        // 必須項目
        var aBaseUrl = aParam['baseUrl'];
        var aMethodUrl = aParam['methodUrl'];
        if (typeof(aBaseUrl) == 'undefined' || typeof(aMethodUrl) == 'undefined') {
            Sateraito.Util.console('** SimpleRequest error aBaseUrl=' + aBaseUrl + ' aMethodUrl=' + aMethodUrl);
            return;
        }

        // オプション項目
        var callback = aParam['callback'];
        var aSilentMode = aParam['silentMode'];
        if (typeof(aSilentMode) == 'undefined') {
            aSilentMode = false;
        }
        var aCallbackWhenError = aParam['callbackWhenError'];
        if (typeof(aCallbackWhenError) == 'undefined') {
            aCallbackWhenError = false;
        }
        var randomWait = aParam['randomWait'];
        if (typeof(randomWait) == 'undefined') {
            randomWait = false;
        }

        var goRequest = function () {
            var numRetry = 1;
            ExecuteRequest.requestGet(aBaseUrl + aMethodUrl, callback, numRetry, aSilentMode, aCallbackWhenError);
        };

        if (randomWait) {
            // 最初のリクエストの前に最大100ミリ秒のランダムなWaitを入れる
            var randomFactor = Math.ceil(Math.random() * 100);
            (function () {
                goRequest();
            }).defer(randomFactor);
        } else {
            goRequest();
        }
    },

    /**
     * requestGet
     *
     * @param {string} url
     * @param {Function} callback
     * @param {number} aNumRetry
     * @param {boolean} aSilentMode
     */
    requestGet: function (aUrl, callback, aNumRetry, aSilentMode, aCallbackWhenError) {
        if (typeof(aNumRetry) == 'undefined') {
            aNumRetry = 1;
        }
        if (typeof(aSilentMode) == 'undefined') {
            aSilentMode = false;
        }
        if (typeof(aCallbackWhenError) == 'undefined') {
            aCallbackWhenError = false;
        }

        if (!aSilentMode) {
            // 読込中メッセージを表示
            SateraitoUI.showLoadingMessage();
        }

        // リクエスト
        Ext.Ajax.request({
            url: aUrl,
            success: function (response, options) {
                if (!aSilentMode) {
                    // 読込中メッセージを消去
                    SateraitoUI.clearMessage();
                }

                var jsondata = Ext.decode(response.responseText);

                // コールバックをキック
                if (typeof(callback) == 'function') {
                    callback(jsondata);
                }
            },
            failure: function () {
                if (!aSilentMode) {
                    // 読込中メッセージを消去
                    SateraitoUI.clearMessage();
                }
                // 失敗時
                Sateraito.Util.console('retrying ' + aNumRetry);

                if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
                    // リトライ
                    (function () {
                        ExecuteRequest.requestOid(aUrl, callback, (aNumRetry + 1), aSilentMode, aCallbackWhenError);
                    }).defer(MyUtil.getWaitMillisec(aNumRetry));

                } else {

                    // １０回リトライしたがだめだった
                    // エラーメッセージ
                    if (response.rc == 401) {
                        // ガジェットタイムアウト
                        SateraitoUI.showLoadingMessage(_msg.ERROR_TIMEOUT);
                    } else {
                        SateraitoUI.showTimerMessage(_msg.ERROR_WHILE_LOADING, 10);
                    }

                    // 通常コールバックはキックしない
                    if (aCallbackWhenError) {
                        callback({
                            status: 'ng',
                            error_code: 'unknown_error'
                        });
                    }
                }
            }
        });
    }
};

