
Ext.ucf.file = {
  RecordInfo : Ext.data.Record.create([
							{name: 'unique_id',  type: 'string'},
							{name: 'data_key',  type: 'string'},
							{name: 'data_type',  type: 'string'},
							{name: 'data_kind',  type: 'string'},
							{name: 'data_name',  type: 'string'},
							{name: 'data_path',  type: 'string'},
							{name: 'data_size',  type: 'string'},
							{name: 'access_url',  type: 'string'},
							{name: 'blob_key',  type: 'string'},
							{name: 'status',  type: 'string'},
							{name: 'deal_status',  type: 'string'},
							{name: 'upload_operator_id',  type: 'string'},
							{name: 'upload_operator_unique_id',  type: 'string'},
							{name: 'last_upload_operator_id',  type: 'string'},
							{name: 'last_upload_operator_unique_id',  type: 'string'},
							{name: 'last_upload_date',  type: 'string'},
							{name: 'upload_count',  type: 'string'},
							{name: 'download_operator_id',  type: 'string'},
							{name: 'download_operator_unique_id',  type: 'string'},
							{name: 'last_download_operator_id',  type: 'string'},
							{name: 'last_download_operator_unique_id',  type: 'string'},
							{name: 'last_download_date',  type: 'string'},
							{name: 'download_count',  type: 'string'},
							{name: 'log_text',  type: 'string'},
							{name: 'date_created',  type: 'string'},
							{name: 'date_changed',  type: 'string'},
							{name: 'expire_date',  type: 'string'}
					
	]),

	// ログテキストの詳細を表示
	dispLogTextDetail : function(file_unique_id)
	{
		var show_window = function(log_text){
			var editeddata;
			var logform = new Ext.FormPanel({
				labelWidth: 30,
				frame:false,
				width: 900,
				layout:'fit',
				items: [{
					xtype:'fieldset',
					autoHeight:true,
					autoWidth:true,
					defaults: {width:600,height:400},
					defaultType: 'textarea',
					items :[{
							fieldLabel: '',
							name: 'log_text',
							value: log_text,
							readOnly: true
						}
					]
				}],
				buttons: [{
					text: _msg.VMSG_CLOSE,
					handler: function(){
						detailwindow.close();
					}
				}]
			});
			var detailwindow
				{
				detailwindow = new Ext.Window({
						title:_msg.LOG,
						layout:'fit',
						modal:true,
						width:700,
						height:500,
						plain: true,
						autoDestory:true,
						items: logform
					});
				};
			detailwindow.show();
			detailwindow.dd.constrainTo(Ext.getBody());
		};
		var handleAfterProcess = function(response){
			if (response.responseText != undefined && response.responseText != '') {
				var result = jQuery.parseJSON(response.responseText);
				var code = result.code;
				if (code == 0) {
					show_window(result.log_text);
				}
			}
		}

		var params = {
			unique_id:file_unique_id
		};
	  Ext.Ajax.request({ 
	    url: _vurl + 'file/xtgetdetail',
	    method: 'POST', 
	    params: params, 
	    success: handleAfterProcess, 
	    failure: handleAfterProcess
	  }); 

	},

	viewHelper:function(){
		return{

			vh_basic : function(value, p, record)
			{
				var html = '';
				html += Ext.ucf.htmlEscape(value);
				return html;
			},
			vh_download_operator_id : function(value, p, record)
			{
				var html = '';
				operator_unique_id = record.get('download_operator_unique_id')
				if(operator_unique_id && operator_unique_id != ''){
					html += '<a href="' + _vurl + 'account/detail?unqid=' + escape(operator_unique_id) + '&tp=r" >' + Ext.ucf.htmlEscape(value) + '</a>';
				}else{
					html += Ext.ucf.htmlEscape(value);
				}
				return html;
			},
			vh_upload_operator_id : function(value, p, record)
			{
				var html = '';
				operator_unique_id = record.get('upload_operator_unique_id')
				if(operator_unique_id && operator_unique_id != ''){
					html += '<a href="' + _vurl + 'account/detail?unqid=' + escape(operator_unique_id) + '&tp=r" >' + Ext.ucf.htmlEscape(value) + '</a>';
				}else{
					html += Ext.ucf.htmlEscape(value);
				}
				return html;
			},
			vh_last_download_operator_id : function(value, p, record)
			{
				var html = '';
				operator_unique_id = record.get('last_download_operator_unique_id')
				if(operator_unique_id && operator_unique_id != ''){
					html += '<a href="' + _vurl + 'account/detail?unqid=' + escape(operator_unique_id) + '&tp=r" >' + Ext.ucf.htmlEscape(value) + '</a>';
				}else{
					html += Ext.ucf.htmlEscape(value);
				}
				return html;
			},
			vh_last_upload_operator_id : function(value, p, record)
			{
				var html = '';
				operator_unique_id = record.get('last_upload_operator_unique_id')
				if(operator_unique_id && operator_unique_id != ''){
					html += '<a href="' + _vurl + 'account/detail?unqid=' + escape(operator_unique_id) + '&tp=r" >' + Ext.ucf.htmlEscape(value) + '</a>';
				}else{
					html += Ext.ucf.htmlEscape(value);
				}
				return html;
			},
			vh_data_name : function(value, p, record)
			{
				var html = '';
				data_key = record.get('data_key')
				if(data_key && data_key != ''){
					html += '<a href="' + _vurl + 'file/download?data_key=' + escape(data_key) + '" >' + Ext.ucf.htmlEscape(value) + '</a>';
				}else{
					html += Ext.ucf.htmlEscape(value);
				}
				return html;
			},
			vh_status : function(value, p, record)
			{
				var html = '';
				if(value == 'FAILED'){
					html += Ext.ucf.htmlEscape(_msg.PROCESS_RESULT_FAILED);
				}
				else if(value == 'SUCCESS'){
					html += Ext.ucf.htmlEscape(_msg.PROCESS_RESULT_SUCCESS);
				}
				else
				{
					html += Ext.ucf.htmlEscape(value);
				}
				return html;
			},
			vh_deal_status : function(value, p, record)
			{
				var html = '';
				if(value == 'CREATING'){
					html += Ext.ucf.htmlEscape(_msg.PROCESS_RESULT_PROCESSING);
				}
				else if(value == 'FIN'){
					html += Ext.ucf.htmlEscape(_msg.PROCESS_RESULT_FIN);
				}
				else
				{
					html += Ext.ucf.htmlEscape(value);
				}
				return html;
			},
			vh_log_text : function(value, p, record)
			{

				var html = '';
				if(record.get('log_text') && record.get('log_text') != ''){
					html += '<a href="JavaScript:Ext.ucf.file.dispLogTextDetail(\'' + record.get('unique_id') + '\')" >' + _msg.LOG + '</a>';
				}
				return html;
			}
		}
	},
	// CSVエクスポート履歴GRIDを作成
	createExportHistoryGridPanel:function(data_kind,params,toolbarappenditems){
		var each_page_cnt = 10;

		if(!params)
		{
			params = {};
		}
		if(!params.panel_title){params.panel_title = _msg.VMSG_EXPORT_HISTORY;}
		if(!params.export_button_title){params.export_button_title = _msg.VMSG_EXPORT;}
		if(!params.without_operator_link){params.without_operator_link = false;}
		if(!params.without_export_button){params.without_export_button = false;}

  	var store = new Ext.data.Store({
				reader: new Ext.data.JsonReader({
							idProperty: 'unique_id'
							,root: 'records'
							,totalProperty: 'all_count'
							}, Ext.ucf.file.RecordInfo),
		    url: _vurl + 'file/xtlist',
				autoDestroy:true
    });

		var getSearchBaseParam = function()	{
			var start = 0;
			var params = {start:start, limit: each_page_cnt, data_kind:data_kind};
			return params;
		};
		var search_file = function(){
			Ext.ucf.search(false, store, getSearchBaseParam, '');
		};
		var btnReflesh = new Ext.Button({
			iconCls:'reflesh',
			handler:search_file
		});
		var pagingBar = new Ext.PagingToolbar({
			pageSize: each_page_cnt,
			store: store,
			displayInfo: true, 
			displayMsg: _msg.PAGING_BAR,
			emptyMsg: _msg.NO_DISP_DATA,
			items:[
					'->'
			]
		});
		
		var toolBarItems = [btnReflesh];

		if(!params.without_export_button){
			toolBarItems.push('-');
			toolBarItems.push({
          text: params.export_button_title,
          handler: function(){
						Ext.ucf.exportToCsv({data_kind:data_kind},params.mask_area);
          }
			});
			toolBarItems.push('-');
		}

		if(toolbarappenditems && toolbarappenditems.length > 0){
			toolBarItems.push(toolbarappenditems);
			toolBarItems.push('-');
		}
		var toolBar = new Ext.Toolbar({
			items:toolBarItems
		});
		
//			var sm = new Ext.grid.CheckboxSelectionModel({
//			});		
		
		var cm = new Ext.grid.ColumnModel({
        columns: [
//					sm,
				{
            header: _msg.FILE_EXPORT_DATE,
            dataIndex: 'date_created',
            width: 50,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_DATA_NAME,
            dataIndex: 'data_name',
            width: 120,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_data_name
        },{
            header: _msg.FILE_DATA_SIZE,
            dataIndex: 'data_size',
            width: 20,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_DOWNLOAD_OPERATOR_ID,
            dataIndex: 'download_operator_id',
            width: 40,
            sortable: false,
						renderer: params.without_operator_link ? vh_basic : Ext.ucf.file.viewHelper().vh_download_operator_id
        },{
            header: _msg.FILE_DOWNLOAD_COUNT,
            dataIndex: 'download_count',
            width: 20,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_LAST_DOWNLOAD_OPERATOR_ID,
            dataIndex: 'last_download_operator_id',
            width: 120,
            sortable: false,
						renderer: params.without_operator_link ? vh_basic : Ext.ucf.file.viewHelper().vh_last_download_operator_id
        },{
            header: _msg.FILE_EXPIRE,
            dataIndex: 'expire_date',
            width: 50,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_DEAL_STATUS,
            dataIndex: 'deal_status',
            width: 30,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_deal_status
        },{
            header: _msg.FLD_TASK_STATUS,
            dataIndex: 'status',
            width: 30,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_status
        },{
            header: _msg.LOG,
            dataIndex: 'log_text',
            align: 'center',
            width: 25,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_log_text
        }
			]
		});
		var grid = new Ext.grid.GridPanel({
      store: store,
//      width: 600,
      region:'center',
			clicksToEdit: 1,
			columnLines:true,
			loadMask:true,
			viewConfig: {forceFit: true},
//	        margins: '20 20 20 20',
      stripeRows: true,
			bbar: pagingBar,
			tbar: toolBar,
//				sm: sm,
			cm: cm
    });
		// パネルにグリッドをセット
    var layout = new Ext.Panel({
      collapsible: true,
      title: params.panel_title,
      layout: 'border',
			waitMsgTarget: true,
			monitorResize:true,
      layoutConfig: {
          columns: 1
      },
      height: 320,
      items: [grid]
    });
		search_file();

		// GridPanelリサイズ処理を追加
		Ext.ucf.appendLeftMenuChangeDelagate(function()
		{
			grid.setWidth(layout.getWidth() - 2);
		});

		return layout;
	},
	// CSVインポート履歴GRIDを作成
	createImportHistoryGridPanel:function(data_kind,params){
		var each_page_cnt = 10;

		if(!params)
		{
			params = {};
		}
		if(!params.panel_title){params.panel_title = _msg.VMSG_IMPORT_HISTORY;}
		if(!params.popup_panel_title){params.popup_panel_title = _msg.VMSG_IMPORT;}

  	var store = new Ext.data.Store({
				reader: new Ext.data.JsonReader({
							idProperty: 'unique_id'
							,root: 'records'
							,totalProperty: 'all_count'
							}, Ext.ucf.file.RecordInfo),
		    url: _vurl + 'file/xtlist',
				autoDestroy:true
    });

		var getSearchBaseParam = function()	{
			var start = 0;
			var params = {start:start, limit: each_page_cnt, data_kind:data_kind};
			return params;
		};
		var search_file = function(){
			Ext.ucf.search(false, store, getSearchBaseParam, '');
		};
	
		var createUploadPopup = function(){
			var uploadwindow;
			var uploadpanel = Ext.ucf.file.createCsvImportForm(_vurl + 'asynccsvimport',{btn_text:_msg.VMSG_IMPORT},{data_kind:data_kind,file_id:'csvfile'},function(){uploadwindow.close();search_file();});
			uploadwindow = new Ext.Window({
					title:params.popup_panel_title,
					layout:'form',
					modal:true,
					width:600,
					height:200,
//						plain: true,
					autoDestory:true,
					items: [
					{xtype:'spacer', height:'30px'}
					,uploadpanel
					,{xtype:'spacer', height:'30px'}
					,{xtype:'displayfield', value:'<p>' + _msg.EXP_FILE_UPLOAD + '</p>'}
						
					]
				});
			return uploadwindow;
		
		};

		var btnReflesh = new Ext.Button({
			iconCls:'reflesh',
			handler:search_file
		});
			
//			var sLimitCB = new Ext.ucf.searchLimitComboBox(
//						[10,50,100]
//						,{
//							'select':function(cb, record, index){
//								each_page_cnt = cb.value;
//								pagingBar.pageSize = each_page_cnt;
//								search_file();
//								}
//						});
//			each_page_cnt = sLimitCB.value;
		
		var pagingBar = new Ext.PagingToolbar({
			pageSize: each_page_cnt,
			store: store,
			displayInfo: true, 
			displayMsg: _msg.PAGING_BAR,
			emptyMsg: _msg.NO_DISP_DATA,
			items:[
//						'->','-',_msg.DISP_COUNT,sLimitCB
					'->'
			]
		});
		
		var toolBar = new Ext.Toolbar({
			items:[btnReflesh
				,'-'
				,{
	          text: _msg.VMSG_IMPORT,
	          handler: function(){
							// アップロード用ポップアップを表示
							var uploadwindow = createUploadPopup();
							uploadwindow.show();
							uploadwindow.dd.constrainTo(Ext.getBody());
	          }
				},'-']
		});
		
//			var sm = new Ext.grid.CheckboxSelectionModel({
//			});		
		
		var cm = new Ext.grid.ColumnModel({
        columns: [
//					sm,
				{
            header: _msg.FILE_IMPORT_DATE,
            dataIndex: 'date_created',
            width: 50,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_DATA_NAME,
            dataIndex: 'data_name',
            width: 120,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_data_name
        },{
            header: _msg.FILE_DATA_SIZE,
            dataIndex: 'data_size',
            width: 20,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_UPLOAD_OPERATOR_ID,
            dataIndex: 'upload_operator_id',
            width: 120,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_upload_operator_id
        },{
            header: _msg.FILE_DOWNLOAD_COUNT,
            dataIndex: 'download_count',
            width: 20,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_LAST_DOWNLOAD_OPERATOR_ID,
            dataIndex: 'last_download_operator_id',
            width: 40,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_last_download_operator_id
        },{
            header: _msg.FILE_EXPIRE,
            dataIndex: 'expire_date',
            width: 50,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_basic
        },{
            header: _msg.FILE_DEAL_STATUS,
            dataIndex: 'deal_status',
            width: 30,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_deal_status
        },{
            header: _msg.FLD_TASK_STATUS,
            dataIndex: 'status',
            width: 30,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_status
        },{
            header: _msg.LOG,
            dataIndex: 'log_text',
            align: 'center',
            width: 25,
            sortable: false,
						renderer: Ext.ucf.file.viewHelper().vh_log_text
        }
			]
		});
		var grid = new Ext.grid.GridPanel({
      store: store,
//      width: 600,
      region:'center',
			clicksToEdit: 1,
			columnLines:true,
			loadMask:true,
			viewConfig: {forceFit: true},
//	        margins: '20 20 20 20',
      stripeRows: true,
			bbar: pagingBar,
			tbar: toolBar,
//				sm: sm,
			cm: cm
    });
		// パネルにグリッドをセット
    var layout = new Ext.Panel({
      collapsible: true,
      title: params.panel_title,
      layout: 'border',
			waitMsgTarget: true,
			monitorResize:true,
      layoutConfig: {
          columns: 1
      },
      height: 320,
      items: [grid]
    });
		search_file();
		// GridPanelリサイズ処理を追加
		Ext.ucf.appendLeftMenuChangeDelagate(function()
		{
			grid.setWidth(layout.getWidth() - 2);
		});
		return layout;
	}
};

Ext.ucf.file.createFileUpdateField = function (file_id, upload_url, o, after_process_delgate){
	//options parameter
	if(!o){
		o = {}
	}

	if(o.btn_text == undefined){o.btn_text = _msg.VMSG_FILE_ATTACHMENT;}
	if(o.btn_only == undefined){o.btn_only = false;}
	if(o.csrf_token == undefined){o.csrf_token = '';}
	if(o.width == undefined){o.width = 400;}

	var fuploadfield = new Ext.ux.form.FileUploadField({
		 buttonText: o.btn_text
		,id: file_id
		,value: ''
		,name: file_id
		,width:o.width
		,buttonOnly: o.btn_only
		,listeners: {
				'fileselected': function(fb, v){fileSelectedHundler();}
		}
	});
//	if(o.btn_only == false){fuploadfield.width = 00;}

	var formToken = new Ext.form.Hidden({
		name:'token'
		,value:o.csrf_token
	});

	var form = new Ext.FormPanel({
		url: upload_url,
		hideLabel: true,
		hideBorders: true,
		border:false,
		frame:false,
		fileUpload: true,
		layout:'form',	// ここはformじゃなくじゃだめ！
		items: [fuploadfield,formToken]
	});
	
	var fileSelectedHundler = function(){
		if(form.getForm() && form.getForm().isValid()){
			form.getForm().submit({	
				params : {file_id:file_id},
				waitMsg: _msg.VMSG_MSG_UPLOADING,
				success: handleAfterProcess,
				failure: handleAfterProcess
			});
		};
	};
	var handleAfterProcess = function(basicForm,action){
		var response = action.response;
		if (response.responseText != undefined && response.responseText != '') {
			var responseText = response.responseText.replace('<pre style="word-wrap: break-word; white-space: pre-wrap;">', '').replace('</pre>', '');
			console.log(response);
			var jsondata = Ext.decode(responseText);
			var code = jsondata.code;
			if (code == 0) {
				Ext.ucf.dispUpdateMsgByReturnCode(code, jsondata.msg);
			}
			else if(code == 100) {
				var message = '';
				for (data in jsondata.vcmsg)
				{
					message += jsondata.vcmsg[data] + '<br/>';
					var ele = Ext.getCmp(data);
					if(ele != undefined){
						ele.preVCMessage = jsondata.vcmsg[data];
						ele.markInvalid(jsondata.vcmsg[data]);
					}
				}
				Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, message);
			}
			else {
				if (jsondata.msg == '')
				{
					Ext.ucf.dispSysErrMsg();
				}
				else{
					Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, jsondata.msg);
				}
			}
		}
		else
		{
			Ext.ucf.dispSysErrMsg();
		}
		if(after_process_delgate){
			after_process_delgate(jsondata);
		}
	}
	form.addEvents('fileupload'); 
	return form;
};

Ext.ucf.file.createCsvImportForm = function (upload_url, o, params, after_process_delgate){
	//options parameter
	if(!o){
		o = {}
	}

	if(o.btn_text == undefined){o.btn_text = _msg.VMSG_FILE_ATTACHMENT;}
	if(o.btn_only == undefined){o.btn_only = false;}
	if(o.file_id == undefined){o.file_id = params.file_id;}

	var fuploadfield = new Ext.ux.form.FileUploadField({
		 buttonText: o.btn_text
		,id: o.file_id
		,name: o.file_id
		,buttonOnly: o.btn_only
		,width:400
		,listeners: {
				'fileselected': function(fb, v){fileSelectedHundler();}
		}
	});

	var form = new Ext.FormPanel({
		id:'csv_import_form',
		hideLabel: true,
		hideBorders: true,
		border:false,
		frame:false,
		fileUpload:true,
		layout:'form',
		items: [fuploadfield]
	});

	var fileSelectedHundler = function(){
		if(form.getForm() && form.getForm().isValid()){
			var execute_submit_token = function(response_token){
				if (response_token.responseText != undefined && response_token.responseText != '') {
					var jsondata_token = jQuery.parseJSON(response_token.responseText);
					var code_token = jsondata_token.code;
					if (code_token == 0) {
						var execute_submit = function(response){
							if (response.responseText != undefined && response.responseText != '') {
								var jsondata = jQuery.parseJSON(response.responseText);
								var code = jsondata.code;
								if (code == 0) {
									form.getForm().getEl().dom.action = jsondata.url;
									form.getForm().submit({
										params : params,
										waitMsg: _msg.VMSG_MSG_UPLOADING,
										success: handleAfterProcess,
										failure: handleAfterProcess
									});
								}
								else {
									if (jsondata.msg == '')
									{
										Ext.ucf.dispSysErrMsg();
									}
									else{
										Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, jsondata.msg);
									}
									return;
								}
							}
							else
							{
								Ext.ucf.dispSysErrMsg();
							}
						};

						// URLにトークンを追加
						upload_url += (upload_url.indexOf('?') > -1 ? '&' : '?') + 'token=' + escape(jsondata_token.token);

						Ext.Ajax.request({url:_vurl + 'createuploadurl', method:'POST', params:{upload_url:upload_url}, success: execute_submit,	failure: execute_submit});
					}
					else
					{
						Ext.ucf.dispSysErrMsg();
					}
				}
				else
				{
					Ext.ucf.dispSysErrMsg();
				}

			};
			// トークン発行
			Ext.Ajax.request({url:_vurl + 'createcsrftoken', method:'GET', params:{}, success: execute_submit_token,	failure: execute_submit_token});
		}
	};
	var handleAfterProcess = function(basicForm,action){
		var response = action.response;
		if (response.responseText != undefined && response.responseText != '') {
			var responseText = response.responseText.replace('<pre style="word-wrap: break-word; white-space: pre-wrap;">', '').replace('</pre>', '');
			var jsondata = Ext.decode(responseText);
			var code = jsondata.code;
			if (code == 0) {
				//Ext.ucf.dispUpdateMsgByReturnCode(code, jsondata.msg);
			}
			else {
				if (jsondata.msg == '')
				{
					Ext.ucf.dispSysErrMsg();
				}
				else{
					Ext.ucf.flowMsg(code, jsondata.msg);
				}
			}
		}
		else
		{
			Ext.ucf.dispSysErrMsg();
		}

		if(after_process_delgate){
			after_process_delgate(jsondata);
		}
	}
	form.addEvents('fileupload'); 
	return form;
};



Ext.ucf.file.applicateViewHelper = function(record){
		var vh = {};
		for(var i in record.fields.keys)
		{
			var k = record.fields.keys[i];
			var v = Ext.ucf.nvl(record.get(k));
			switch(k)
			{
				default:
					vh[k] = Ext.ucf.htmlEncode(v);
					break;
			}
		}
		return vh;
};


Ext.ucf.file.createFileUploadForm = function()
{
	var fuploadfield = new Ext.ux.form.FileUploadField({
		 buttonText: _msg.VMSG_UPLOAD
		,id: 'loginpage_picture'
		,name: 'loginpage_picture'
		,buttonOnly: false
		,width:400
		,listeners: {
				'fileselected': function(fb, v){fileSelectedHundler();}
		}
	});
//	if(o.btn_only == false){fuploadfield.width = 400;}

	var form = new Ext.FormPanel({
		url: upload_url,
		hideLabel: true,
		hideBorders: true,
		border:false,
		frame:false,
		fileUpload:true,
		layout:'form',
		items: [fuploadfield]
	});
	
	var fileSelectedHundler = function(){
		if(form.getForm() && form.getForm().isValid()){
			form.getForm().submit({
				params : params,
				waitMsg: _msg.VMSG_MSG_UPLOADING,
				success: handleAfterProcess,
				failure: handleAfterProcess
			});
		};
	};
	var handleAfterProcess = function(basicForm,action){
		var response = action.response;
		if (response.responseText != undefined && response.responseText != '') {
			var responseText = response.responseText.replace('<pre style="word-wrap: break-word; white-space: pre-wrap;">', '').replace('</pre>', '');
			var jsondata = Ext.decode(responseText);
			var code = jsondata.code;
			if (code == 0) {
				//Ext.ucf.dispUpdateMsgByReturnCode(code, jsondata.msg);
			}
			else {
				if (jsondata.msg == '')
				{
					Ext.ucf.dispSysErrMsg();
				}
				else{
					Ext.ucf.flowMsg(code, jsondata.msg);
				}
			}
		}
		else
		{
			Ext.ucf.dispSysErrMsg();
		}
		uploadwindow.close();
	}
	form.addEvents('fileupload'); 
	return form;
};

