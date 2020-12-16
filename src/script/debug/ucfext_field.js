
Ext.ucf.field = function(){
	return {

     createHTMLLinkText: function(id, value) {

        var cmp = new Ext.form.Label({id: id});
       if (value != undefined && value != '') {
         var link_url = '<a href="{0}" target="_blank">{1}</a>'.format(value,value);
          cmp.html = link_url;
       }else{
         cmp.text = '';
       }

       return cmp;
    },

		createPlaneText: function(id, value, vh, viewHelperKey)
		{
			var cmp = new Ext.form.Label({id:id});
			var vh_result;
			if(vh){
				if(viewHelperKey == undefined || viewHelperKey == ''){
					viewHelperKey = id;
				}
				vh_result = vh(viewHelperKey, value, cmp);
			}

			var is_html = false;
			var value_vh;

			if(vh_result)
			{
				is_html = vh_result.is_html;
				value_vh = vh_result.value;
			}

			if(is_html)
			{
				cmp.html = value_vh;
			}
			else
			{
				cmp.text = value_vh;
			}
			return cmp;
		},

		/*******************************
		 *テキストボックスを作成する
		 *******************************
		 * id: 
		 * name: 
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: 作成したテキストボックスの幅（整数値）
		 * vc_delegate: 入力チェック用デリゲート
		 * params: オプション
		 *   ・autocomplete: autocomplete属性の値（on or off） ※空の場合は処理しない
		 */
		createTextField: function(id, name, value, field_label, width, vc_delegate, params)
		{
			return new Ext.form.TextField({
				id: id,
				name: name,
				value:value,
				grow:true,
				growMin:width,
				growMax:width * 2,
				fieldLabel:field_label,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
					,afterrender:function(cmp){
						if(typeof(params) != 'undefined' && typeof(params['autocomplete']) != 'undefined' && params['autocomplete'] != ''){
							if(typeof(cmp.inputEl) != 'undefined'){
								cmp.getEl().set({
									autocomplete:params['autocomplete']
								});
							}
						}
					}
				}
			});
		},

        /*******************************
		 *テキストボックスを作成する
		 *******************************
		 * id:
		 * name:
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: 作成したテキストボックスの幅（整数値）
		 * vc_delegate: 入力チェック用デリゲート
		 * params: オプション
		 *   ・autocomplete: autocomplete属性の値（on or off） ※空の場合は処理しない
		 */
		createTextField2: function(id, name, value, field_label, width, vc_delegate, params)
		{
			return new Ext.form.TextField({
				id: id,
				name: name,
				value:value,
				width:width,
				fieldLabel:field_label,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
					,afterrender:function(cmp){
						if(typeof(params) != 'undefined' && typeof(params['autocomplete']) != 'undefined' && params['autocomplete'] != ''){
							if(typeof(cmp.inputEl) != 'undefined'){
								cmp.getEl().set({
									autocomplete:params['autocomplete']
								});
							}
						}
					}
				}
			});
		},

		/*******************************
		 *テキストボックス（数値専用）を作成する
		 *******************************
		 * id: 
		 * name: 
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: 作成したテキストボックスの幅（整数値）
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createNumberField: function(id, name, value, field_label, width, numberType, vc_delegate)
		{
			// 入力チェック正規表現
			var maskRe;
			switch(numberType){
				case 'FLOAT':	// 小数
					maskRe = '[0-9,\-.]';
					break;
				default:	// INTEGER:整数（整数）
					maskRe = '[0-9,\-]';
					break;
			}

			return new Ext.form.TextField({
				id: id,
				name: name,
				value:value,
				grow:true,
				growMin:width,
				growMax:width * 2,
				maskRe: new RegExp(maskRe),		// 小数点対応（厳密なチェックではないが、厳密なチェックにすると手入力できなくなってしまうので...）
				//invalidText: invalid_text,
				fieldLabel:field_label,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});
		},
		/*******************************
		 *パスワード用テキストボックスを作成する
		 *******************************
		 * id: 
		 * name: 
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: 作成したテキストボックスの幅（整数値）
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createPasswordField: function(id, name, value, field_label, width, vc_delegate)
		{
			return new Ext.form.TextField({
				id: id,
				name: name,
				value:value,
				grow:true,
				growMin:width,
				growMax:width * 2,
//				maxLength:max_length,
				fieldLabel:field_label,
				inputType:'password',
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});
		},
		/*******************************
		 *テキストエリアを作成する
		 *******************************
		 * id: 作成するテキストエリア名
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: 作成したテキストエリアの幅
		 * height: 作成したテキストエリアの高さ
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createTextAreaField: function(id, name, value, field_label, width, height, vc_delegate)
		{
			return new Ext.form.TextArea({
				id: id,
				name: name,
				value:value,
				width:width,
				height:height,
				fieldLabel:field_label,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});
		},

		/*******************************
		 *コンボボックスを作成する
		 *******************************
		 * id:
		 * name:
		 * data: コンボボックス内に格納するアイテムリスト
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: ボックスの幅
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createComboBox: function(id, name, data, value, field_label, width, vc_delegate)
		{
			return new Ext.form.ComboBox({
				id: id,
				name: name,
				hiddenName: name,
				typeAhead: true,
				triggerAction: 'all',
				lazyRender:false,
				mode: 'local',
				value:value,
				store: new Ext.data.ArrayStore({
					id: 0,
					fields: ['Value', 'Disp'],
					data: data
				}),
				valueField: 'Value',
				displayField: 'Disp',
				fieldLabel:field_label,
				selectOnFocus:true,
				autoWidth:false,
				width:width,
				editable:false,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});
		},
		/*******************************
		 *コンボボックスを作成する（サーバから取得する版）
		 *******************************
		 * id:
		 * name:
		 * data: コンボボックス内に格納するアイテムリスト
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: ボックスの幅
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createComboBoxByStore: function(id, name, url, value, field_label, width, vc_delegate)
		{
			var combo;
			combo = new Ext.form.ComboBox({
				id: id,
				name: name,
				hiddenName: name,
				typeAhead: true,
				triggerAction: 'all',
				lazyRender:true,
				mode: 'remote',
//				value:value,
				store: new Ext.data.JsonStore({
                        url:url,
                        total:'all_count',
                        root:'records',
                        fields:['Value','Disp'],
                        autoLoad:true,
                        listeners:{
                            scope:this,
                            load:function(store) {
                                combo.setValue(value);
                            }
                        }
                    }),
				valueField: 'Value',
				displayField: 'Disp',
				fieldLabel:field_label,
				selectOnFocus:true,
				autoWidth:false,
				width:width,
				editable:false,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});
			return combo;
		},

		/*******************************
		 *チェックボックスを作成する
		 *******************************
		 * id: 
		 * name: 
		 * field_label: フィールド名称
		 * field_value: チェック時にPOSTされる値
		 * checked: true or false…チェックするかどうか
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createCheckBox: function(id, name, checked, field_value, field_label, vc_delegate)
		{
			return new Ext.form.Checkbox({
				id: id,
				name: name,
				inputValue:field_value,
				checked:checked,
				fieldLabel:field_label,
				boxLabel:field_label,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});

		},

		/*******************************
		 *チェックボックスグループを作成する
		 *******************************
		 * id: 
		 * name: 
		 * field_label: フィールド名称
		 * items: ラジオボタン内に格納するアイテムリスト
		 * columns: 列数を指定する "[100, 100]" のような形で長さ毎指定することも可能
		 * vertical_flag: "true" を指定すると縦方向に整列、"false" を指定すると横方向に整列する 
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createCheckBoxGroup: function(id, name, value, field_label, width, items, columns, vertical_flag, vc_delegate)
		{
			if (!columns)
			{
				columns = 'auto';
			}
			
			// inputValueが空のitemの初期選択がされないので手動で設定
			Ext.each(items, function(item){
				if(item.inputValue == value){
					item.checked = true;
				}
			});

			return new Ext.form.CheckboxGroup({
				id: id
				,name: name
				,value: value
				,width: width
				,columns: columns
				,vertical: vertical_flag
				,fieldLabel:field_label
				,items: items
				,listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});
		},

		/*******************************
		 *ラジオボタングループを作成する
		 *******************************
		 * id: 
     * name: 
		 * value: 表示文字
		 * field_label: フィールド名称
		 * width: 作成したラジオボタンの幅
		 * items: ラジオボタン内に格納するアイテムリスト
		 * columns: 列数を指定する "[100, 100]" のような形で長さ毎指定することも可能
		 * vertical_flag: "true" を指定すると縦方向に整列、"false" を指定すると横方向に整列する 
		 * vc_delegate: 入力チェック用デリゲート

			～縦に2列に並べる場合の例～
				・width:600
				・columns：[.50,.50]
				・vertical_flag : true

		 */
		createRadioButtonGroup: function(id, name, value, field_label, width, items, columns, vertical_flag, vc_delegate)
		{
			if (!columns)
			{
				columns = 'auto';
			}
			
			// inputValueが空のitemの初期選択がされないので手動で設定
			Ext.each(items, function(item){
				if(item.inputValue == value){
					item.checked = true;
				}
			});

			return new Ext.form.RadioGroup({
				 id: id
				,name: name
				,value: value
				,width: width
				,columns: columns
				,vertical: vertical_flag
				,fieldLabel:field_label
				,items: items
				,listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});

		},
		/*******************************
		 *日付ボックスを作成
		 *******************************
		 * id:
		 * name:
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: ボックスの幅
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createDateField: function(id, name, value, field_label, width, vc_delegate,iseditable,format_date)
		{
      format_date = format_date||'Y/m/d';
      iseditable = iseditable||false;
			return new Ext.form.DateField({
				id: id,
				name: name,
				value: value,
				format: format_date,
				width: width,
				grow: true,
				growMin:width,
				growMax:width * 2,
				fieldLabel: field_label,
        editable: iseditable,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});

		},
		/*******************************
		 *時間	ボックスを作成
		 *******************************
		 * id:
		 * name:
		 * value: 初期値
		 * field_label: フィールド名称
		 * width: ボックスの幅
		 * vc_delegate: 入力チェック用デリゲート
		 */
		createTimeField: function(id, name, value, field_label, width, vc_delegate)
		{

			return new Ext.form.TimeField({
				id: id,
				name: name,
				value: value,
				format: 'H:i',
//				width: width,
				width: 72,
				increment: 60,
				grow: true,
				growMin:width,
				growMax:width * 2,
				fieldLabel: field_label,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});

		},

    createHtmlEditorField: function (id, name, value, field_label, width, height, vc_delegate) {
            return new Ext.form.HtmlEditor({
                id: id,
                name: name,
                value: value,
                width: width,
                height: height,
                fieldLabel: field_label,
                listeners: {
                    blur: function () {
                        if (vc_delegate != undefined) {
                            if (this.preValue == undefined || this.preValue != this.getValue()) {
                                vc_delegate(this);
                            } else {
                                if (this.preVCMessage) {
                                    this.markInvalid(this.preVCMessage);
                                }
                            }
                            this.preValue = this.getValue();
                        }
                    }
                }
            });
        },

    createDateField2: function(id, value, width, field_label, vc_delegate)
		{

			return new Ext.form.DateField({
				id: id,
				value: value,
				format: 'Y/m/d',
				width: width,
//				grow: true,
//				growMin:width,
//				growMax:width * 2,
				fieldLabel: field_label,
				listeners:{
					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
				}
			});
		},

//     createTimeField: function(id, name, value, field_label, width, vc_delegate)
// 		{

// 			return new Ext.form.TimeField({
// 				id: id,
// 				name: name,
// 				value: value,
// 				format: 'H:i',
// //				width: width,
// 				width: 72,
// 				increment: 15,
// //				grow: true,
// //				growMin:width,
// //				growMax:width * 2,
// 				fieldLabel: field_label,
// 				listeners:{
// 					blur:function(){if(vc_delegate != undefined){if(this.preValue == undefined || this.preValue != this.getValue()){vc_delegate(this);}else{if(this.preVCMessage){this.markInvalid(this.preVCMessage);}}this.preValue=this.getValue();}}
// 				}
// 			});

// 		},

		init : function(){
			// outerHTML および、innerTextをFitrefoxに実装する.
			if (!('outerHTML' in document.createElement('div'))) {
				HTMLElement.prototype.__defineGetter__('outerHTML', function() { return new XMLSerializer().serializeToString(this); })
				HTMLElement.prototype.__defineGetter__('innerText', function() { return this.textContent; })
				HTMLElement.prototype.__defineSetter__('innerText', function(text) {return this.textContent = text;});
			}
		}
	};
}();
