
Ext.ucf.acslog = function(){

    return {

			viewHelper:function(id, value, cmp){
				var is_html = false;
				var result = value;
				if(id == 'target_career'){
					switch(value)
					{
						case 'PC':
							result = _msg.TARGET_CAREER_PC;
							break;
						case 'SOFTBANK':
							result = _msg.TARGET_CAREER_SP;
							break;
						case 'EZWEB':
							result = _msg.TARGET_CAREER_AU;
							break;
						case 'IMODE':
							result = _msg.TARGET_CAREER_DOCOMO;
							break;
						case 'WILLCOM':
							result = _msg.TARGET_CAREER_WILLCOM;
							break;
						case 'MOBILE':
							result = _msg.TARGET_CAREER_MOBILE;
							break;
						case 'TABLET':
							result = _msg.TARGET_CAREER_TABLET;
							break;
						case 'SP':
							result = _msg.TARGET_CAREER_SP;
							break;
						case 'API':
							result = _msg.TARGET_CAREER_API;
							break;
						case 'FPAPP':
							result = _msg.TARGET_CAREER_FPAPP;
							break;
						default:
							result = value;
							break;
					}
				}else if(id == 'target_env'){
					switch(value)
					{
						case 'office':
							result = _msg.OFFICE;
							break;
						case 'outside':
							result = _msg.OUTSIDE;
							break;
						case 'sp':
							result = _msg.SP;
							break;
						case 'fp':
							result = _msg.FP;
							break;
						default:
							result = value;
							break;
					}
				}else if(id == 'login_result'){
					switch(value)
					{
						case 'SUCCESS':
							result = '成功';
							break;
						case 'FAILED':
							result = '失敗';
							break;
						default:
							result = value;
							break;
					}
				}else if(id == 'log_code'){
					result = value;
				}
				
				return {value:result, is_html:is_html};
			},

			createLoginHistoryRecord : function(){
				return Ext.data.Record.create([
					{name: 'unique_id',  type: 'string', mapping: 'unique_id'}
					,{name: 'access_date',  type: 'string'}
					,{name: 'operator_unique_id',  type: 'string'}
					,{name: 'operator_id',  type: 'string'}
					,{name: 'login_id',  type: 'string'}
					,{name: 'log_code',  type: 'string'}
					,{name: 'log_text',  type: 'string'}
					,{name: 'login_result',  type: 'string'}
					,{name: 'client_ip',  type: 'string'}
					,{name: 'client_x_forwarded_for_ip',  type: 'string'}
					,{name: 'target_career',  type: 'string'}
					,{name: 'target_env',  type: 'string'}
					,{name: 'use_profile_id',  type: 'string'}
					,{name: 'use_access_apply_unique_id',  type: 'string'}

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
						defaults: {width:800,height:500},
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
							title:_msg.LOGIN_HISTORY_DETAIL,
							layout:'fit',
							modal:true,
							width:900,
							height:600,
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

