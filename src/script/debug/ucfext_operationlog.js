Ext.ucf.operationlog = function(){

		_hashOperationList = {};

    return {

			OperationList:[
				['operator_add', _msg.OPERATION_OPERATOR_ADD]
				,['operator_modify', _msg.OPERATION_OPERATOR_MODIFY]
				,['operator_remove', _msg.OPERATION_OPERATOR_REMOVE]
				,['operator_changeid', _msg.OPERATION_OPERATOR_CHANGEID]
				// ,['user_add', _msg.OPERATION_USER_ADD]
				// ,['user_modify', _msg.OPERATION_USER_MODIFY]
				// ,['user_remove', _msg.OPERATION_USER_REMOVE]
				// ,['user_changeid', _msg.OPERATION_USER_CHANGEID]
				,['dashboard_modify', _msg.OPERATION_DASHBOARD_MODIFY]
				,['dashboard_addpicture', _msg.OPERATION_DASHBOARD_ADDPICTURE]
				,['dashboard_removepicture', _msg.OPERATION_DASHBOARD_REMOVEPICTURE]
				,['dashboard_modify_directcloudbox_config', _msg.OPERATION_DASHBOARD_MODIFY_DIRECTCLOUDBOX_CONFIG]
			],

			viewHelper:function(id, value, cmp){
				var is_html = false;
				var result = value;
				if(id == 'operation'){
					if(typeof(Ext.ucf.operationlog._hashOperationList) == 'undefined' || Ext.ucf.operationlog._hashOperationList.length == 0){
						Ext.ucf.operationlog._hashOperationList = {};
						for(var i = 0; i < Ext.ucf.operationlog.OperationList.length; i++){
							var list_item = Ext.ucf.operationlog.OperationList[i];
							Ext.ucf.operationlog._hashOperationList[list_item[0]] = list_item[1];
						}
					}
					if(typeof(Ext.ucf.operationlog._hashOperationList[value]) != 'undefined'){
						result = Ext.ucf.operationlog._hashOperationList[value];
					}
				}
				return {value:result, is_html:is_html};
			},

			createOperationLogRecord : function(){
				return Ext.data.Record.create([
					{name: 'unique_id',  type: 'string', mapping: 'unique_id'}
					,{name: 'operation_date',  type: 'string'}
					,{name: 'operator_id',  type: 'string'}
					,{name: 'operator_unique_id',  type: 'string'}
					,{name: 'screen',  type: 'string'}
					,{name: 'operation_type',  type: 'string'}
					,{name: 'operation',  type: 'string'}
					,{name: 'target_data',  type: 'string'}
					,{name: 'target_unique_id',  type: 'string'}
					,{name: 'client_ip',  type: 'string'}
					,{name: 'log_text',  type: 'string'}
				]);
			},

			// ログテキストの詳細を表示
			dispLogTextDetail : function(record)
			{
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
						defaults: {width:500,height:300},
						defaultType: 'textarea',
						items :[{
								fieldLabel: '',
								name: 'log_text',
								value: record.get('log_text'),
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
							title:_msg.OPERATIONLOG_DETAIL,
							layout:'fit',
							modal:true,
							width:600,
							height:400,
							plain: true,
							autoDestory:true,
							items: logform
						});
					};
				detailwindow.show();
				detailwindow.dd.constrainTo(Ext.getBody());
			},
			init: function(){}

    };


}();
