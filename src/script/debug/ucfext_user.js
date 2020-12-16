Ext.ucf.user = function () {
    var NUM_CUSTOM_FIELDS = 30;
    var MAX_NUM_COLS_TO_SHOW= NUM_CUSTOM_FIELDS +13;
    return {
        colsToShow_Influenza : [],
        viewHelper: function (id, value, cmp) {
            var is_html = false;
            var result = value;
            return {value: result, is_html: is_html};
        },

        showColumnSetting: function () {
            console.log('showColumnSetting');

            // ボタン
            var buttons = [];
            buttons.push(Ext.ucf.user.createSaveButton());

            buttons.push(new Ext.Button({
                text: _msg.FLD_CANCEL,
                handler: function () {
                    Ext.getCmp('window_setting_influenza').close();
                }
            }));

            // サイズ調整
            var windowWidth = 670;
            var windowHeight = 550;

            // 詳細ウィンドウインスタンスを作成
            var grid = Ext.ucf.user.createColsToShowGrid();
            var text = 'window_setting_influenza';
            var detailWindow = new Ext.Window({
                id: text,
                width: windowWidth,
                height: windowHeight,
                maximizable: true,
                bodyStyle: 'background-color:white;',
                title: _msg.SETTING_CONFIRM,
                plain: true,
                autoScroll: false,
                layout: 'fit',
                items: [grid],
                buttons: buttons,
                listeners: {
                    afterrender: function () {
                        (function () {

                            Ext.ucf.user.GetSettingReport(function (aResult) {
                                var colsToShow = aResult.colsToShow;

                                if (colsToShow == '' || colsToShow == null || colsToShow == '[]') {
                                    // デフォルトの表示列設定
                                    Ext.ucf.user.addDefaultRows();
                                    Ext.ucf.user.setDefaultColsToShow();
                                }
                                else {
                                    // 表示列の設定を表示
                                    Ext.ucf.user.addDefaultRows();
                                    var textgrid = 'cols_to_show_grid_influenza';
                                    var grid = Ext.getCmp(textgrid);
                                    var store = grid.getStore();

                                    var colsToShow = Ext.decode(colsToShow);
                                    var sortOrder = 0;
                                    Ext.each(colsToShow, function (aEntry) {

                                        var index = store.find('field', aEntry.field);
                                        var record = store.getAt(index);
                                        record.set('check_enabled', true);
                                        record.set('sort_order', sortOrder);
                                        sortOrder++;
                                        var header_name = MyLang.getMsg(aEntry.header);
                                        if (!header_name) {
                                            header_name = aEntry.header;
                                        }
                                        record.set('header', header_name);
                                        record.set('width', aEntry.width);
                                        if (typeof(aEntry.custom_field_name) != 'undefined') {
                                            record.set('custom_field_name', aEntry.custom_field_name);
                                        }
                                        record.commit();
                                    });

                                    store.sort('sort_order', 'ASC');
                                }
                            });
                        }).defer(20);
                    }
                }
            });
            // ウィンドウを開く
            detailWindow.show();
        },

        createSaveButton: function () {
            var text = 'window_setting_influenza';
            var textbutton = 'save_setting_button_influenza';
            var button = new Ext.Button({
                id: textbutton,
                diabled: true,
                text: _msg.FLD_UPDATE,
                handler: function () {
                    // 表示列設定
                    var textgrid = 'cols_to_show_grid_influenza';
                    var grid = Ext.getCmp(textgrid);
                    var store = grid.getStore();
                    var colsToShow = [];
                    store.each(function (aRecord) {
                        if (aRecord.get('check_enabled')) {
                            colsToShow.push({
                                header: aRecord.get('header'),
                                field: aRecord.get('field'),
                                width: aRecord.get('width'),
                                custom_field_name: aRecord.get('custom_field_name')
                            });
                        }
                    });
                    var colsToShowJson = Ext.encode(colsToShow);

                    var postData = {
                        colsToShow: colsToShowJson
                    };
                    // ボタンをdisable
                    var textbutton = 'save_setting_button_influenza';
                    Ext.getCmp(textbutton).disable();

                    // 保存をリクエスト
                    Ext.ucf.user.requesUpdateSetting(postData, function (aResult) {

                        Ext.getCmp(textbutton).enable();
                        if (aResult.status == 'ok') {
                            Ext.Msg.show({
                                title: _msg.SETTING_CONFIRM,
                                icon: Ext.MessageBox.INFO,
                                msg: _msg.VMSG_SAVE_SETTING_CONFIRM,
                                buttons: Ext.Msg.OK,
                                fn: function (buttonId) {
                                    Ext.getCmp(text).close();
                                    //Ext.ucf.user.loadColsToShow(colsToShow);
                                    location.reload();
                                }
                            });
                            //Template.loadTemplateInfo();
                        } else {
                            Ext.ucf.showMessgeBox(_msg.DELEGATE_FUNCTION_USER_CONFIG,_msg.VMSG_ALERT_UPDATE_FAIL);
                        }
                    });
                }
            });
            return button;
        },

        loadColsToShow: function (ColsToShow) {
            Ext.ucf.user.colsToShow_Influenza = ColsToShow;
            if (Ext.ucf.user.colsToShow_Influenza.length == 0)
                Ext.ucf.user.loadColsToShowDefault()

            var colsToShow = Ext.ucf.user.setColsToShow();
            //colsToShow.push({header: MyLang.getMsg('TEMPLATE'), field: "template_name", width: 150})
            Ext.ucf.user.colsToShow_Influenza = colsToShow
        },

        setColsToShow: function () {
            return Ext.ucf.user.colsToShow_Influenza;
        },

        loadColsToShowDefault: function () {
            var ColsToShow = [];
            ColsToShow.push({header: _msg.FLD_USERID, field: "user_id", width: 80})
            ColsToShow.push({header: _msg.FLD_USERNAME, field: "display_name", width: 150})
            ColsToShow.push({header: _msg.FLD_USERNAME_KANA, field: "display_name_kana", width: 150})
            ColsToShow.push({header: _msg.FLD_MAILADDRESS, field: "mail_address", width: 150})
            ColsToShow.push({header: _msg.FLD_BIRTHDAY, field: "birthday", width: 120})
            ColsToShow.push({header: _msg.FLD_LINEWORKSID, field: "lineworks_id", width: 120})
            Ext.ucf.user.colsToShow_Influenza = ColsToShow
        },

        requesUpdateSetting: function (postData, callback, aNumRetry) {
            Ext.ucf.user._requestUpdateSettingOid(postData, callback, aNumRetry);
        },

        _requestUpdateSettingOid: function (postData, callback, aNumRetry) {
            // 更新中メッセージを表示
            //SateraitoUI.showLoadingMessage(MyLang.getMsg('NOW_SAVING'));

            if (typeof(aNumRetry) == 'undefined') {
                aNumRetry = 1;
            }
            var url = _vurl + 'user/setcolumns';
            Ext.Ajax.request({
                url: url,
                method: 'POST',
                params: postData,
                success: function (response, options) {
                    var jsondata = Ext.decode(response.responseText);
                    // 読込中メッセージを消去
                    //SateraitoUI.clearMessage();
                    // コールバックをキック
                    callback(jsondata);
                },
                failure: function () {
                    //SateraitoUI.showTimerMessage(MyLang.getMsg('ALERT_UPDATE_FAIL'), 10);

                    // コールバックをキック
                    callback({
                        status: 'error',
                        error_code: 'unknown_error'
                    });
                    return;
                }
            });
        },

        GetSettingReport: function (callback, aNumRetry) {
            Ext.ucf.user._GetSettingReportOid(callback, aNumRetry);
        },

        _GetSettingReportOid: function (callback, aNumRetry) {
            if (typeof(aNumRetry) == 'undefined') {
                aNumRetry = 1;
                // 読込中メッセージを表示
                //SateraitoUI.showLoadingMessage();
            }

            var url = _vurl + 'user/getcolumns';
            Ext.Ajax.request({
                url: url,
                method: 'GET',
                success: function (response, options) {
                    var jsondata = Ext.decode(response.responseText);
                    // 読込中メッセージを消去
                    //SateraitoUI.clearMessage();
                    // コールバックをキック
                    callback(jsondata);
                },
                failure: function () {
                    // 失敗時
                    //Sateraito.Util.console(MyLang.getMsg('RETRYING') + aNumRetry);

                    if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
                        Ext.ucf.user._GetSettingReportOid(callback, (aNumRetry + 1));
                    } else {
                        // １０回リトライしたがだめだった
                        // 読込中メッセージを消去
                        //SateraitoUI.clearMessage();
                        return;
                    }
                }
            });
        },

        createColsToShowGrid: function () {
            var store = new Ext.data.ArrayStore({
                id: 'store_cols_to_show',
                fields: [
                    {name: 'sort_order', type: 'int'},
                    {name: 'check_enabled', type: 'bool'},
                    {name: 'header', type: 'string'},
                    {name: 'field_display', type: 'string'},
                    {name: 'field', type: 'string'},
                    {name: 'custom_field_name', type: 'string'},
                    {name: 'width', type: 'int'},
                    {name: 'buttons', type: 'string'}
                ]
            });

            var cols = [
                {
                    header:_msg.FLD_SORT_ORDER,
                    hidden: true,
                    width: 50,
                    dataIndex: 'sort_order'
                },
                {
                    header: _msg.FLD_SHOW_OR_NOT,
                    xtype: 'checkcolumn',
                    width: 36,
                    dataIndex: 'check_enabled'
                },
                {
                    header: _msg.FLD_DOC_TITLE,
                    width: 134,
                    dataIndex: 'header',
                    editor: new Ext.form.TextField()
                },
                {
                    header: _msg.FLD_COL_WIDTH,
                    width: 66,
                    dataIndex: 'width',
                    editor: new Ext.form.NumberField()
                },
                {
                    header: _msg.FLD_CUSTOM_FIELD_NAME,
                    width: 126,
                    dataIndex: 'custom_field_name',
                    editor: new Ext.form.TextField()
                },
                {
                    header: _msg.FLD_FIELD_DESCRIPTION,
                    width: 198,
                    dataIndex: 'field_display'
                },
                {
                    header: '',
                    width: 50,
                    dataIndex: 'buttons'
                }
            ];

            var cm = new Ext.grid.ColumnModel({
                defaults: {
                    menuDisabled: true
                },
                columns: cols
            });
            var grid = new Ext.grid.EditorGridPanel({
                title: _msg.SETTING_CONFIRM,
                header: false,
                id: 'cols_to_show_grid_influenza',
                store: store,
                stripeRows: true,
                cm: cm
            });
            return grid
        },

        /**
         * upRow
         *
         * @param {string} aField
         */
        upRow: function (aField) {
            var textgrid = 'cols_to_show_grid_influenza';
            var grid = Ext.getCmp(textgrid);
            var store = grid.getStore();

            var myIndex = store.find('field', aField);
            var myRecord = store.getAt(myIndex);
            var mySortOrder = myRecord.get('sort_order');

            // 自分のソートオーダーより小さいなかで、最大のものを求める
            var maxSortOrder = -1;
            var foundField = null;
            store.each(function (aRecord) {
                if (aRecord.get('field') != aField) {
                    var sortOrder = aRecord.get('sort_order');
                    if (sortOrder < mySortOrder) {
                        if (maxSortOrder < sortOrder) {
                            maxSortOrder = sortOrder;
                            foundField = aRecord.get('field');
                        }
                    }
                }
            });
            // 自分の一つ上の行をソートオーダーを入れ替えて、再ソート
            if (foundField != null) {
                myRecord.set('sort_order', maxSortOrder);
                var index = store.find('field', foundField);
                store.getAt(index).set('sort_order', mySortOrder);
                store.sort('sort_order', 'ASC');
            }
        },

        /**
         * downRow
         *
         * @param {string} aField
         */
        downRow: function (aField) {
            var textgrid = 'cols_to_show_grid_influenza';
            var grid = Ext.getCmp(textgrid);
            var store = grid.getStore();

            var myIndex = store.find('field', aField);
            var myRecord = store.getAt(myIndex);
            var mySortOrder = myRecord.get('sort_order');

            // 自分のソートオーダーより大きいなかで、最小のものを求める
            var minSortOrder = 10000;
            var foundField = null;
            store.each(function (aRecord) {
                if (aRecord.get('field') != aField) {
                    var sortOrder = aRecord.get('sort_order');
                    if (sortOrder > mySortOrder) {
                        if (minSortOrder > sortOrder) {
                            minSortOrder = sortOrder;
                            foundField = aRecord.get('field');
                        }
                    }
                }
            });
            // 自分の一つ上の行をソートオーダーを入れ替えて、再ソート
            if (foundField != null) {
                myRecord.set('sort_order', minSortOrder);
                var index = store.find('field', foundField);
                store.getAt(index).set('sort_order', mySortOrder);
                store.sort('sort_order', 'ASC');
            }
        },

        /**
         * addDefaultRows
         *
         * 列設定グリッドに必要行を追加（チェックはしない）
         */
        addDefaultRows: function () {
            var textgrid = 'cols_to_show_grid_influenza';
            var grid = Ext.getCmp(textgrid);
            var store = grid.getStore();
            var GridRow = store.recordType;

            var buttonHtml = function (aField) {
                return '<span class="link_cmd" title="' + _msg.FLD_MOVE_UP + '" onclick="Ext.ucf.user.upRow(\'' + aField + '\');">▲</span> <span title="' + _msg.FLD_MOVE_DOWN + '" class="link_cmd" onclick="Ext.ucf.user.downRow(\'' + aField + '\');">▼</span>';
            };

            store.add(new GridRow({
                sort_order: 1000,
                check_enabled: false,
                header: _msg.FLD_USERID,
                field: 'user_id',
                field_display: _msg.FLD_USERID,
                width: 150,
                buttons: buttonHtml('user_id')
            }));

            store.add(new GridRow({
                sort_order: 1001,
                check_enabled: false,
                header: _msg.FLD_USERNAME,
                field: 'display_name',
                field_display:  _msg.FLD_USERNAME,
                width: 150,
                buttons: buttonHtml('display_name')
            }));

            store.add(new GridRow({
                sort_order: 1002,
                check_enabled: false,
                header: _msg.FLD_USERNAME_KANA,
                field: 'display_name_kana',
                field_display: _msg.FLD_USERNAME_KANA,
                width: 150,
                buttons: buttonHtml('display_name_kana')
            }));

            store.add(new GridRow({
                sort_order: 1003,
                check_enabled: false,
                header: _msg.FLD_MAILADDRESS,
                field: 'mail_address',
                field_display: _msg.FLD_MAILADDRESS,
                width: 100,
                buttons: buttonHtml('mail_address')
            }));

            store.add(new GridRow({
                sort_order: 1004,
                check_enabled: false,
                header: _msg.FLD_BIRTHDAY,
                field: 'birthday',
                field_display:_msg.FLD_BIRTHDAY,
                width: 150,
                buttons: buttonHtml('birthday')
            }));

            store.add(new GridRow({
                sort_order: 1005,
                check_enabled: false,
                header: _msg.FLD_LINEWORKSID,
                field: 'lineworks_id',
                field_display: _msg.FLD_LINEWORKSID,
                width: 200,
                buttons: buttonHtml('lineworks_id')
            }));

            //add more

            store.add(new GridRow({
                sort_order: 1006,
                check_enabled: false,
                header: _msg.FLD_COMMENT,
                field: 'comment',
                field_display: _msg.FLD_COMMENT,
                width: 100,
                buttons: buttonHtml('comment')
            }));

            store.add(new GridRow({
                sort_order: 1007,
                check_enabled: false,
                header: _msg.FLD_CONTACT_COMPANY,
                field: 'contact_company',
                field_display: _msg.FLD_CONTACT_COMPANY,
                width: 100,
                buttons: buttonHtml('contact_company')
            }));

            store.add(new GridRow({
                sort_order: 1008,
                check_enabled: false,
                header: _msg.FLD_CONTACT_COMPANY_OFFICE,
                field: 'contact_company_office',
                field_display: _msg.FLD_CONTACT_COMPANY_OFFICE,
                width: 100,
                buttons: buttonHtml('contact_company_office')
            }));

            store.add(new GridRow({
                sort_order: 1009,
                check_enabled: false,
                header: _msg.FLD_CONTACT_COMPANY_DEPARTMENT,
                field: 'contact_company_department',
                field_display: _msg.FLD_CONTACT_COMPANY_DEPARTMENT,
                width: 100,
                buttons: buttonHtml('contact_company_department')
            }));

            store.add(new GridRow({
                sort_order: 10010,
                check_enabled: false,
                header: _msg.FLD_CONTACT_COMPANY_DEPARTMENT2,
                field: 'contact_company_department2',
                field_display: _msg.FLD_CONTACT_COMPANY_DEPARTMENT2,
                width: 100,
                buttons: buttonHtml('contact_company_department2')
            }));

            store.add(new GridRow({
                sort_order: 1011,
                check_enabled: false,
                header: _msg.FLD_CONTACT_COMPANY_POST,
                field: 'contact_company_post',
                field_display: _msg.FLD_CONTACT_COMPANY_POST,
                width: 100,
                buttons: buttonHtml('contact_company_post')
            }));

            store.add(new GridRow({
                sort_order: 10012,
                check_enabled: false,
                header: _msg.FLD_CONTACT_EMAIL1,
                field: 'contact_email1',
                field_display: _msg.FLD_CONTACT_EMAIL1,
                width: 100,
                buttons: buttonHtml('contact_email1')
            }));

            store.add(new GridRow({
                sort_order: 10013,
                check_enabled: false,
                header: _msg.FLD_CONTACT_EMAIL2,
                field: 'contact_email2',
                field_display: _msg.FLD_CONTACT_EMAIL2,
                width: 100,
                buttons: buttonHtml('contact_email2')
            }));

            store.add(new GridRow({
                sort_order: 10014,
                check_enabled: false,
                header: _msg.FLD_CONTACT_TEL_NO1,
                field: 'contact_tel_no1',
                field_display: _msg.FLD_CONTACT_TEL_NO1,
                width: 100,
                buttons: buttonHtml('contact_tel_no1')
            }));

            store.add(new GridRow({
                sort_order: 10015,
                check_enabled: false,
                header: _msg.FLD_CONTACT_TEL_NO2,
                field: 'contact_tel_no2',
                field_display: _msg.FLD_CONTACT_TEL_NO2,
                width: 100,
                buttons: buttonHtml('contact_tel_no2')
            }));

            store.add(new GridRow({
                sort_order: 10016,
                check_enabled: false,
                header: _msg.FLD_CONTACT_TEL_NO3,
                field: 'contact_tel_no3',
                field_display: _msg.FLD_CONTACT_TEL_NO3,
                width: 100,
                buttons: buttonHtml('contact_tel_no3')
            }));

            store.add(new GridRow({
                sort_order: 10017,
                check_enabled: false,
                header: _msg.FLD_CONTACT_TEL_NO4,
                field: 'contact_tel_no4',
                field_display: _msg.FLD_CONTACT_TEL_NO4,
                width: 100,
                buttons: buttonHtml('contact_tel_no4')
            }));

            store.add(new GridRow({
                sort_order: 10018,
                check_enabled: false,
                header: _msg.FLD_CONTACT_TEL_NO5,
                field: 'contact_tel_no5',
                field_display: _msg.FLD_CONTACT_TEL_NO5,
                width: 100,
                buttons: buttonHtml('contact_tel_no5')
            }));

            store.add(new GridRow({
                sort_order: 10019,
                check_enabled: false,
                header: _msg.FLD_CONTACT_POSTAL_COUNTRY,
                field: 'contact_postal_country',
                field_display: _msg.FLD_CONTACT_POSTAL_COUNTRY,
                width: 100,
                buttons: buttonHtml('contact_postal_country')
            }));

            store.add(new GridRow({
                sort_order: 10020,
                check_enabled: false,
                header: _msg.FLD_CONTACT_POSTAL_CODE,
                field: 'contact_postal_code',
                field_display: _msg.FLD_CONTACT_POSTAL_CODE,
                width: 100,
                buttons: buttonHtml('contact_postal_code')
            }));

            store.add(new GridRow({
                sort_order: 10021,
                check_enabled: false,
                header: _msg.FLD_CONTACT_POSTAL_PREFECTURE,
                field: 'contact_postal_prefecture',
                field_display: _msg.FLD_CONTACT_POSTAL_PREFECTURE,
                width: 100,
                buttons: buttonHtml('contact_postal_prefecture')
            }));

            store.add(new GridRow({
                sort_order: 10022,
                check_enabled: false,
                header: _msg.FLD_CONTACT_POSTAL_CITY,
                field: 'contact_postal_city',
                field_display: _msg.FLD_CONTACT_POSTAL_CITY,
                width: 100,
                buttons: buttonHtml('contact_postal_city')
            }));

            store.add(new GridRow({
                sort_order: 10023,
                check_enabled: false,
                header: _msg.FLD_CONTACT_POSTAL_STREET_ADDRESS,
                field: 'contact_postal_street_address',
                field_display: _msg.FLD_CONTACT_POSTAL_STREET_ADDRESS,
                width: 100,
                buttons: buttonHtml('contact_postal_street_address')
            }));


            // カスタムフィールド１～１０
            // for (var i = 1; i <= NUM_CUSTOM_FIELDS; i++) {
            //     store.add(new GridRow({
            //         sort_order: (10024 + i),
            //         check_enabled: false,
            //         header: _msg.FLD_CUSTOM_FIELD + i,
            //         field: 'custom_attribute' + i,
            //         field_display: _msg.FLD_EXP_CUSTOM_FIELD,
            //         width: 100,
            //         buttons: buttonHtml('custom_attribute' + i)
            //     }));
            // }
        },

        setDefaultColsToShow: function () {
            var textgrid = 'cols_to_show_grid_influenza';
            var grid = Ext.getCmp(textgrid);
            var store = grid.getStore();

            var setChecked = function (aField, aSortOrder) {
                var record = store.getAt(store.find('field', aField));
                record.set('check_enabled', true);
                record.set('sort_order', aSortOrder);
                record.commit();
            };

            setChecked('user_id', 0);
            setChecked('display_name', 1);
            setChecked('display_name_kana', 2);
            setChecked('mail_address', 3);
            setChecked('birthday', 4);
            setChecked('lineworks_id', 5);
            store.sort('sort_order', 'ASC');
        },

         // ログテキストなどの詳細を表示
			createInputName : function(index)
			{
				var show_window = function(index){

                    var header_text_current = $('#lbl_custom_attribute' + index).text();

                    var vHtml = '';
                    vHtml += '<div style="px;padding:10px;">';
                    vHtml += '<table border="0" width="100%" cellpadding="2" cellspacing="2" class="detail2" >';

                    vHtml += '<tr><td colspan="4"><img src="/images/share/space.gif" width="10" height="10" border="0" alt=""></td></tr>';

                    vHtml += '<tr>';
                    vHtml += '<td valign="middle" class="style2" nowrap>{0}</td>'.format(_msg.FLD_HEADER_NAME_CURRENT);;
                    vHtml += '<td align="left" class="style3" colspan="3">';
                    vHtml += '<label>{0}</label>'.format(header_text_current);
                    vHtml += '</td>';
                    vHtml += '</tr>';

                    vHtml += '<tr><td colspan="4"><img src="/images/share/space.gif" width="10" height="10" border="0" alt=""></td></tr>';

                    vHtml += '<tr>';
                    vHtml += '<td valign="middle" class="style2" nowrap>{0}&nbsp;<font color="red">*</font></td>'.format(_msg.FLD_HEADER_NAME);;
                    vHtml += '<td align="left" class="style3" colspan="3">';
                    vHtml += '<input type="text" size="20" autocomplete="off" id="header_name_change" name="header_name_change" class="x-form-text x-form-field" style="width: 242px;">';
                    vHtml += '</td>';
                    vHtml += '</tr>';

                    vHtml += '<tr><td colspan="4"><img src="/images/share/space.gif" width="10" height="10" border="0" alt=""></td></tr>';
                    vHtml += '<tr><td colspan="4"><img src="/images/share/space.gif" width="10" height="10" border="0" alt=""></td></tr>';

                    vHtml += '</table>';
                    vHtml += '</div>';

					var logform = new Ext.FormPanel({
						labelWidth: 30,
						frame:false,
						width: 450,
						layout:'fit',
						html: vHtml,
						buttons: [
                            {
                                text: _msg.VMSG_SAVE,
                                handler: function(){
                                    saveHeaderName();
                                }
                            }
                            ,{
							text: _msg.VMSG_CLOSE,
							handler: function(){
								detailwindow.close();
							}
						}]
					});

                    var handleAfterProcessTemplate = function(response){
                        if (response.responseText != undefined && response.responseText != '') {
                            var result = $.parseJSON(response.responseText);
                            var code = result.code;
                            if (code == 0) {
                                Ext.ucf.flowMsg(_msg.FLD_CHANGE_HEADER_NAME_TITLE,_msg.PROCESS_RESULT_SUCCESS , '');
                                $('#lbl_custom_attribute' + index).text($('#header_name_change').val());
                                detailwindow.close();
                            }else{
                                Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR,_msg.PROCESS_RESULT_FAILED , '');
                            }
                        }
                    };

                     var saveHeaderName = function(){
                            var header_name_change_val = $('#header_name_change').val();
                            if (header_name_change_val == '') {
                                vc_msgs = '[' + _msg.FLD_HEADER_NAME + ']' + _msg.VC_NEED;
                                Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR,vc_msgs , '');
                                return;
                            }
                            var params = {
                                header: header_name_change_val,
                                field: 'custom_attribute' + index
                            };
                          Ext.Ajax.request({
                            url: _vurl + 'user/changetitle',
                            method: 'POST',
                            params: params,
                            success: handleAfterProcessTemplate,
                            failure: handleAfterProcessTemplate
                          });
                        };

					var detailwindow
						{
						var window_title = _msg.FLD_CHANGE_HEADER_NAME_TITLE;
						detailwindow = new Ext.Window({
								title:window_title,
								layout:'fit',
								modal:true,
								width:450,
								height:170,
								plain: true,
								autoDestory:true,
								items: logform
							});
						};
					detailwindow.show();
					detailwindow.dd.constrainTo(Ext.getBody());
				};

				var handleAfterProcess = function(){
                        show_window(index);
				};
				handleAfterProcess();
			},

        init: function () {
        }

    };


}();

