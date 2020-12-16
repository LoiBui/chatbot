Ext.ucf.task_history = function()
{

    return {
			createTaskHistoryRecord : function(){
				return Ext.data.Record.create([
					{name: 'unique_id',  type: 'string', mapping: 'unique_id'}
					,{name: 'task_unique_id',  type: 'string'}
					,{name: 'task_status',  type: 'string'}
					,{name: 'task_status_date',  type: 'string'}
					,{name: 'task_start_date',  type: 'string'}
					,{name: 'task_end_date',  type: 'string'}
					,{name: 'execute_operator_id',  type: 'string'}
					,{name: 'log_text',  type: 'string'}
				]);
			},
			vh_log_text : function(value, p, record)
			{

				var html = '';
				if(record.get('log_text') && record.get('log_text') != ''){
					html += '<a href="JavaScript:Ext.ucf.task_history.dispLogTextDetail(\'' + record.get('unique_id') + '\')" >' + _msg.LOG + '</a>';
				}
				return html;
			},
			vh_basic:function(value, p, record)
			{
				return Ext.ucf.htmlEscape(value);
			},
			vh_task_status : function(value, p, record)
			{
				var vh_result = Ext.ucf.task.viewHelper('task_status', value, null);
				if(vh_result.is_html){
					return vh_result.value;
				}else{
					return Ext.ucf.htmlEscape(vh_result.value);
				}
			},
			vh_execute_operator_id : function(value, p, record)
			{
				var vh_result = Ext.ucf.task.viewHelper('execute_operator_id', value, null);
				if(vh_result.is_html){
					return vh_result.value;
				}else{
					return Ext.ucf.htmlEscape(vh_result.value);
				}
			},
			// ログテキストの詳細を表示
			dispLogTextDetail : function(unique_id)
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
					unique_id:unique_id
				};
			  Ext.Ajax.request({ 
			    url: _vurl + 'task/xtgethistorydetail',
			    method: 'POST', 
			    params: params, 
			    success: handleAfterProcess, 
			    failure: handleAfterProcess
			  }); 

			},
			// ログテキストの詳細を表示
			dispChangeIDLogTextDetail : function(unique_id)
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
					unique_id:unique_id
				};
			  Ext.Ajax.request({ 
			    url: _vurl + 'task/xtgetchangeidlogdetail',
			    method: 'POST', 
			    params: params, 
			    success: handleAfterProcess, 
			    failure: handleAfterProcess
			  }); 

			},

			// タスク履歴一覧グリッドを作成
			createTaskHistoryGrid : function(task_unique_id)
			{
				var each_page_cnt = 10;
		  	var store_task_history = new Ext.data.Store({
						reader: new Ext.data.JsonReader({
									idProperty: 'unique_id'
									,root: 'records'
									,totalProperty: 'all_count'
									}, Ext.ucf.task_history.createTaskHistoryRecord()),
				    url: _vurl + 'task/xthistorylist',
						autoDestroy:true
		    });

				var getSearchBaseParam = function()	{
					var start = 0;
					var params = {start:start, limit: each_page_cnt, sk_task_unique_id:task_unique_id};
					return params;
				};
				var search_task_history = function(){
					Ext.ucf.search(false, store_task_history, getSearchBaseParam, '');
				};
				var btnReflesh = new Ext.Button({
					iconCls:'reflesh',
					handler:search_task_history
				});
				var pagingBar = new Ext.PagingToolbar({
					pageSize: each_page_cnt,
					store: store_task_history,
					displayInfo: true, 
					displayMsg: _msg.PAGING_BAR,
					emptyMsg: _msg.NO_DISP_DATA,
					items:[
							'->'
					]
				});
				
				var toolBarItems = [btnReflesh];
				var toolBar = new Ext.Toolbar({
					items:toolBarItems
				});
				
		//			var sm = new Ext.grid.CheckboxSelectionModel({
		//			});		
				
				var cm = new Ext.grid.ColumnModel({
		        columns: [
				      {
				          header: _msg.FLD_TASK_START_DATE_FOR_LIST,
				          dataIndex: 'task_start_date',
				          width: 70,
				          sortable: false,
									renderer: Ext.ucf.task_history.vh_basic
				      },{
				          header: _msg.FLD_TASK_END_DATE_FOR_LIST,
				          dataIndex: 'task_end_date',
				          width: 70,
				          sortable: false,
									renderer: Ext.ucf.task_history.vh_basic
				      },{
				          header: _msg.FLD_TASK_STATUS,
				          dataIndex: 'task_status',
				          width: 50,
				          sortable: false,
									renderer: Ext.ucf.task_history.vh_task_status
				      },{
				          header: _msg.FLD_TASK_EXECUTE_OPERATOR_ID,
				          dataIndex: 'execute_operator_id',
				          width: 100,
				          sortable: false,
									renderer: Ext.ucf.task_history.vh_execute_operator_id
			        },{
			            header: _msg.LOG,
			            dataIndex: '',
			            align: 'center',
			            width: 40,
			            sortable: false,
									renderer: Ext.ucf.task_history.vh_log_text
			        }
					]
				});
				var grid = new Ext.grid.GridPanel({
		      store: store_task_history,
		      region:'center',
					columnLines:true,
					loadMask:true,
					viewConfig: {forceFit: true},
		      stripeRows: true,
					bbar: pagingBar,
					tbar: toolBar,
		//				sm: sm,
					cm: cm
		    });
				// パネルにグリッドをセット
		    var layout = new Ext.Panel({
		      collapsible: false,
		      title: _msg.VMSG_TASKHISTORY,
		      layout: 'border',
					waitMsgTarget: true,
					monitorResize:true,
		      layoutConfig: {
		          columns: 1
		      },
		      height: 320,
		      items: [grid]
		    });
				search_task_history();
				return layout;

			},
			init: function(){}
    };


}();

Ext.ucf.task = function(){

    return {
			// タスク履歴ウィンドウを表示
			dispTaskHistoryWindow : function(task_unique_id)
			{
				var gridpanel = Ext.ucf.task_history.createTaskHistoryGrid(task_unique_id);
				var detailwindow = new Ext.Window({
						title:_msg.VMSG_TASKHISTORY,
						layout:'fit',
						modal:true,
						width:700,
						height:500,
						plain: true,
						autoDestory:true,
						items: gridpanel
				});
				detailwindow.show();
				detailwindow.dd.constrainTo(Ext.getBody());

			},

			viewHelperEx:function(){
				return{
					vh_log_detail : function(value, p, record)
					{
						return '<a href="JavaScript:Ext.ucf.task.dispTaskHistoryWindow(\'' + record.get('unique_id') + '\')" >' + _msg.HISTORY + '</a>';
					}
				}
			},
			viewHelper:function(id, value, cmp){
				var is_html = false;
				var result = value;
				if(id == 'task_type'){
					switch(value)
					{
						case 'account_sync_to_o365':
							result = _msg.TASK_TYPE_ACCOUNT_SYNC_TO_O365;
							break;
						case 'account_sync_to_sso':
							result = _msg.TASK_TYPE_ACCOUNT_SYNC_TO_SSO;
							break;
						case 'group_sync_to_o365':
							result = _msg.TASK_TYPE_GROUP_SYNC_TO_O365;
							break;
						case 'group_sync_to_sso':
							result = _msg.TASK_TYPE_GROUP_SYNC_TO_SSO;
							break;
						case 'orgunit_sync_to_o365':
							result = _msg.TASK_TYPE_ORGUNIT_SYNC_TO_O365;
							break;
						case 'orgunit_sync_to_sso':
							result = _msg.TASK_TYPE_ORGUNIT_SYNC_TO_SSO;
							break;
						default:
							result = value;
							break;
					}
				}else if(id == 'task_deal_status'){
					switch(value)
					{
						case 'WAIT':
							result = _msg.TASK_DEAL_STATUS_WAIT;
							break;
						case 'PROCESSING':
							result = _msg.TASK_DEAL_STATUS_PROCESSING;
							break;
						case 'STOP':
							result = _msg.TASK_DEAL_STATUS_STOP;
							break;
						case 'STOP_INDICATING':
							result = _msg.TASK_DEAL_STATUS_STOP_INDICATING;
							break;
						case '':
							result = _msg.TASK_DEAL_STATUS_DEFAULT;
							break;
						case 'FIN':
							result = _msg.TASK_DEAL_STATUS_FIN;
							break;
						default:
							result = value;
							break;
					}
				}else if(id == 'task_status'){
					switch(value)
					{
						case 'SUCCESS':
							result = _msg.SUCCESS;
							break;
						case 'FAILED':
							result = _msg.FAILED;
							break;
						default:
							result = value;
							break;
					}
				}
				else if(id == 'task_fixed_term_type'){
					switch(value)
					{
						case '1DAY':
							result = _msg.TASK_FIX_TERM_TYPE_DAILY;
							break;
						case '':
							result = _msg.TASK_FIX_TERM_TYPE_SINGLE;
							break;
						default:
							result = value;
							break;
					}
				}
				else if(id == 'execute_operator_id'){
					switch(value)
					{
						case 'cron_polling_task':
							result = _msg.CRON_POLLING_TASK;
							break;
						default:
							result = value;
							break;
					}
				}
				return {value:result, is_html:is_html};
			},

			createTaskRecord : function(){
				return Ext.data.Record.create([
					{name: 'unique_id',  type: 'string', mapping: 'unique_id'}
					,{name: 'comment',  type: 'string'}
					,{name: 'task_type',  type: 'string'}
					,{name: 'task_target',  type: 'string'}
					,{name: 'task_deal_status',  type: 'string'}
					,{name: 'task_status',  type: 'string'}
					,{name: 'task_status_date',  type: 'string'}
					,{name: 'task_fixed_term_type',  type: 'string'}
					,{name: 'task_start_plan_date',  type: 'string'}
					,{name: 'task_start_date',  type: 'string'}
					,{name: 'task_end_date',  type: 'string'}
					,{name: 'data_delete_flag',  type: 'string'}
					,{name: 'password_field',  type: 'string'}
					,{name: 'password_update_flag',  type: 'string'}
					,{name: 'execute_operator_id',  type: 'string'}
//					,{name: 'log_text',  type: 'string'}
				]);
			},
			goEditPage:function(unique_id)
			{
				window.location.href = _vurl + 'task/regist?unqid=' + escape(unique_id) + '&tp=rn';
			},

			vh_basic:function(value, p, record)
			{
				return Ext.ucf.htmlEscape(value);
			},
			vh_task_type:function(value, p, record)
			{
				var disp_value;
				var vh_result = Ext.ucf.task.viewHelper('task_type', value, null);
				if(vh_result.is_html){
					disp_value = vh_result.value;
				}else{
					disp_value = Ext.ucf.htmlEscape(vh_result.value);
				}
				var html = '';
				html += '<a href="' + _vurl + 'task/regist?unqid=' + escape(record.get('unique_id')) + '&tp=rn" >' + disp_value + '</a>';
				return html;
			},
			vh_task_deal_status:function(value, p, record){
				var vh_result = Ext.ucf.task.viewHelper('task_deal_status', value, null);
				if(vh_result.is_html){
					return vh_result.value;
				}else{
					return Ext.ucf.htmlEscape(vh_result.value);
				}
			},
			vh_task_status : function(value, p, record)
			{
				var vh_result = Ext.ucf.task.viewHelper('task_status', value, null);
				if(vh_result.is_html){
					return vh_result.value;
				}else{
					return Ext.ucf.htmlEscape(vh_result.value);
				}
			},
			vh_task_fixed_term_type : function(value, p, record)
			{
				var vh_result = Ext.ucf.task.viewHelper('task_fixed_term_type', value, null);
				if(vh_result.is_html){
					return vh_result.value;
				}else{
					return Ext.ucf.htmlEscape(vh_result.value);
				}
			},
			vh_execute_operator_id : function(value, p, record)
			{
				var vh_result = Ext.ucf.task.viewHelper('execute_operator_id', value, null);
				if(vh_result.is_html){
					return vh_result.value;
				}else{
					return Ext.ucf.htmlEscape(vh_result.value);
				}
			},
			vhEdit: function(value, p, record)
			{
				return '<input type="button" value="" class="btnEdit" onclick="JavaScript:Ext.ucf.task.goEditPage(\'' + value + '\');" />';
			},
			// 一括更新
			updateLump:function(s, update_kbn, mask_area_id, after_success)
			{
				if(s.length <= 0)
				{
					Ext.Msg.show({
						icon: Ext.MessageBox.WARNING,
						title: _msg.WARNING,
						msg: _msg.MSG_NOT_SELECTED_TARGET_DATA,
						buttons: Ext.Msg.OK
						});
				}
				else
				{
					var handleAfterProcess = function(response){
						if (response.responseText != undefined && response.responseText != '') {
							var result = jQuery.parseJSON(response.responseText);
							var code = result.code;
							if (code == 0) {
								Ext.ucf.flowMsg(_msg.SUCCESS, _msg.UPDATED, code);
								if(after_success){
									after_success();
								}
							}
						}
						mask.hide();
					}

					var params = {
						unique_id_list:Ext.ucf.getUniqueIDList(s),
						update_kbn:update_kbn
					};
					var mask = new Ext.LoadMask(Ext.get(mask_area_id), {msg:_msg.VMSG_MSG_UPDATING});
					mask.show();
				  Ext.Ajax.request({ 
				    url: _vurl + 'task/xtlumpupd',
				    method: 'POST', 
				    params: params, 
				    success: handleAfterProcess, 
				    failure: handleAfterProcess
				  }); 
				}
			},

			createTaskColumnModel : function(sm)
			{
				return new Ext.grid.ColumnModel({
				      columns: [
							sm,
							{
				          header: _msg.FLD_TASK_TYPE,
				          dataIndex: 'task_type',
				          width: 140,
				          sortable: false,
									renderer: Ext.ucf.task.vh_task_type
				      },{
				          header: _msg.FLD_TASK_START_DATE,
				          dataIndex: 'task_start_date',
				          width: 70,
				          sortable: false,
									renderer: Ext.ucf.task.vh_basic
				      },{
				          header: _msg.FLD_TASK_END_DATE,
				          dataIndex: 'task_end_date',
				          width: 70,
				          sortable: false,
									renderer: Ext.ucf.task.vh_basic
				      },{
				          header: _msg.FLD_TASK_DEAL_STATUS,
				          dataIndex: 'task_deal_status',
				          width: 40,
				          sortable: false,
									renderer: Ext.ucf.task.vh_task_deal_status
				      },{
				          header: _msg.FLD_TASK_STATUS,
				          dataIndex: 'task_status',
				          width: 50,
				          sortable: false,
									renderer: Ext.ucf.task.vh_task_status
				      },{
				          header: _msg.FLD_TASK_FIXED_TERM_TYPE_FOR_LIST,
				          dataIndex: 'task_fixed_term_type',
				          width: 35,
				          sortable: false,
									renderer: Ext.ucf.task.vh_task_fixed_term_type
				      },{
				          header: _msg.FLD_TASK_START_PLAN_DATE_FOR_LIST,
				          dataIndex: 'task_start_plan_date',
				          width: 70,
				          sortable: false,
									renderer: Ext.ucf.task.vh_basic
				      },{
				          header: _msg.FLD_TASK_LAST_EXECUTE_OPERATOR_ID,
				          dataIndex: 'execute_operator_id',
				          width: 80,
				          sortable: false,
									renderer: Ext.ucf.task.vh_execute_operator_id
			        },{
			            header: _msg.HISTORY,
			            dataIndex: '',
			            align: 'center',
			            width: 40,
			            sortable: false,
									renderer: Ext.ucf.task.viewHelperEx().vh_log_detail
			        },{
			            header: '',
			            dataIndex: 'unique_id',
									hidden: false,
			            width: 25,
			            sortable: false,
									renderer: Ext.ucf.task.vhEdit
			        }
						]
					});

			},
			submitAccountSyncToAppsTaskRegistWithConfirm:function(form){
				// 今回のセットが処理待ちステータスなら
				if(Ext.ucf.getElementValue('task_deal_status') == ''){
					// 不要データ削除フラグ
					var account_delete_flag = Ext.ucf.getElementValue('data_delete_flag') == 'DELETE';
					// パスワード更新フラグ
					var password_update_flag = Ext.ucf.getElementValue('password_update_flag') == 'UPDATE';
					if(account_delete_flag == true || password_update_flag == true){
						var msg = '';
						if(account_delete_flag == true){
							msg += '<br/>' + _msg.EXP_TASK5;
						}
						if(password_update_flag == true){
							msg += '<br/>' + _msg.EXP_TASK6;
						}
						msg += '<br/>' + _msg.EXP_TASK7;
						is_ok = false;
						Ext.Msg.show({
							icon: Ext.MessageBox.WARNING,
							title: _msg.CONFIRM,
							msg: msg,
							buttons: Ext.Msg.YESNO,
							fn:function(btn,text){
						    if (btn == 'yes'){
										form.submit();
						    }
							}
						});
					}
					else
					{
						document.frmEdit.submit();
					}
				}
				else
				{
					document.frmEdit.submit();
				}

			},
			DatTaskType: [
											['account_sync_to_sso', _msg.TASK_TYPE_ACCOUNT_SYNC_TO_SSO]
											, ['account_sync_to_o365', _msg.TASK_TYPE_ACCOUNT_SYNC_TO_O365]
											//, ['group_sync_to_sso', _msg.TASK_TYPE_GROUP_SYNC_TO_SSO]
											, ['group_sync_to_o365', _msg.TASK_TYPE_GROUP_SYNC_TO_O365]
											//, ['orgunit_sync_to_sso', _msg.TASK_TYPE_ORGUNIT_SYNC_TO_SSO]
											//, ['orgunit_sync_to_o365', _msg.TASK_TYPE_ORGUNIT_SYNC_TO_O365]
											],

			DatTaskDealStatus : [
												['', _msg.TASK_DEAL_STATUS_DEFAULT], ['WAIT', _msg.TASK_DEAL_STATUS_WAIT], ['PROCESSING', _msg.TASK_DEAL_STATUS_PROCESSING], ['STOP_INDICATING', _msg.TASK_DEAL_STATUS_STOP_INDICATING], ['STOP', _msg.TASK_DEAL_STATUS_STOP], ['FIN', _msg.TASK_DEAL_STATUS_FIN]
											],
			DatTaskStatus : [
												['SUCCESS', _msg.PROCESS_RESULT_SUCCESS], ['FAILED', _msg.PROCESS_RESULT_FAILED]
											],
			DatFixedTermType : [
												['', _msg.TASK_FIX_TERM_TYPE_SINGLE2], ['1DAY', _msg.TASK_FIX_TERM_TYPE_DAILY2]
											],
			init: function(){}

    };


}();

