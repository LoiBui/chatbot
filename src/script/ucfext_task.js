Ext.ucf.task_history=function(){return{createTaskHistoryRecord:function(){return Ext.data.Record.create([{name:"unique_id",type:"string",mapping:"unique_id"},{name:"task_unique_id",type:"string"},{name:"task_status",type:"string"},{name:"task_status_date",type:"string"},{name:"task_start_date",type:"string"},{name:"task_end_date",type:"string"},{name:"execute_operator_id",type:"string"},{name:"log_text",type:"string"}])},vh_log_text:function(a,c,b){a="";b.get("log_text")&&""!=b.get("log_text")&&(a+=
"<a href=\"JavaScript:Ext.ucf.task_history.dispLogTextDetail('"+b.get("unique_id")+"')\" >"+_msg.LOG+"</a>");return a},vh_basic:function(a,c,b){return Ext.ucf.htmlEscape(a)},vh_task_status:function(a,c,b){a=Ext.ucf.task.viewHelper("task_status",a,null);return a.is_html?a.value:Ext.ucf.htmlEscape(a.value)},vh_execute_operator_id:function(a,c,b){a=Ext.ucf.task.viewHelper("execute_operator_id",a,null);return a.is_html?a.value:Ext.ucf.htmlEscape(a.value)},dispLogTextDetail:function(a){var c=function(a){a=
new Ext.FormPanel({labelWidth:30,frame:!1,width:900,layout:"fit",items:[{xtype:"fieldset",autoHeight:!0,autoWidth:!0,defaults:{width:600,height:400},defaultType:"textarea",items:[{fieldLabel:"",name:"log_text",value:a,readOnly:!0}]}],buttons:[{text:_msg.VMSG_CLOSE,handler:function(){b.close()}}]});var b=new Ext.Window({title:_msg.LOG,layout:"fit",modal:!0,width:700,height:500,plain:!0,autoDestory:!0,items:a});b.show();b.dd.constrainTo(Ext.getBody())},b=function(a){void 0!=a.responseText&&""!=a.responseText&&
(a=jQuery.parseJSON(a.responseText),0==a.code&&c(a.log_text))};Ext.Ajax.request({url:_vurl+"task/xtgethistorydetail",method:"POST",params:{unique_id:a},success:b,failure:b})},dispChangeIDLogTextDetail:function(a){var c=function(a){a=new Ext.FormPanel({labelWidth:30,frame:!1,width:900,layout:"fit",items:[{xtype:"fieldset",autoHeight:!0,autoWidth:!0,defaults:{width:600,height:400},defaultType:"textarea",items:[{fieldLabel:"",name:"log_text",value:a,readOnly:!0}]}],buttons:[{text:_msg.VMSG_CLOSE,handler:function(){b.close()}}]});
var b=new Ext.Window({title:_msg.LOG,layout:"fit",modal:!0,width:700,height:500,plain:!0,autoDestory:!0,items:a});b.show();b.dd.constrainTo(Ext.getBody())},b=function(a){void 0!=a.responseText&&""!=a.responseText&&(a=jQuery.parseJSON(a.responseText),0==a.code&&c(a.log_text))};Ext.Ajax.request({url:_vurl+"task/xtgetchangeidlogdetail",method:"POST",params:{unique_id:a},success:b,failure:b})},createTaskHistoryGrid:function(a){var c=new Ext.data.Store({reader:new Ext.data.JsonReader({idProperty:"unique_id",
root:"records",totalProperty:"all_count"},Ext.ucf.task_history.createTaskHistoryRecord()),url:_vurl+"task/xthistorylist",autoDestroy:!0}),b=function(){return{start:0,limit:10,sk_task_unique_id:a}},d=function(){Ext.ucf.search(!1,c,b,"")},f=new Ext.Button({iconCls:"reflesh",handler:d}),e=new Ext.PagingToolbar({pageSize:10,store:c,displayInfo:!0,displayMsg:_msg.PAGING_BAR,emptyMsg:_msg.NO_DISP_DATA,items:["->"]});f=new Ext.Toolbar({items:[f]});var g=new Ext.grid.ColumnModel({columns:[{header:_msg.FLD_TASK_START_DATE_FOR_LIST,
dataIndex:"task_start_date",width:70,sortable:!1,renderer:Ext.ucf.task_history.vh_basic},{header:_msg.FLD_TASK_END_DATE_FOR_LIST,dataIndex:"task_end_date",width:70,sortable:!1,renderer:Ext.ucf.task_history.vh_basic},{header:_msg.FLD_TASK_STATUS,dataIndex:"task_status",width:50,sortable:!1,renderer:Ext.ucf.task_history.vh_task_status},{header:_msg.FLD_TASK_EXECUTE_OPERATOR_ID,dataIndex:"execute_operator_id",width:100,sortable:!1,renderer:Ext.ucf.task_history.vh_execute_operator_id},{header:_msg.LOG,
dataIndex:"",align:"center",width:40,sortable:!1,renderer:Ext.ucf.task_history.vh_log_text}]});e=new Ext.grid.GridPanel({store:c,region:"center",columnLines:!0,loadMask:!0,viewConfig:{forceFit:!0},stripeRows:!0,bbar:e,tbar:f,cm:g});e=new Ext.Panel({collapsible:!1,title:_msg.VMSG_TASKHISTORY,layout:"border",waitMsgTarget:!0,monitorResize:!0,layoutConfig:{columns:1},height:320,items:[e]});d();return e},init:function(){}}}();
Ext.ucf.task=function(){return{dispTaskHistoryWindow:function(a){a=Ext.ucf.task_history.createTaskHistoryGrid(a);a=new Ext.Window({title:_msg.VMSG_TASKHISTORY,layout:"fit",modal:!0,width:700,height:500,plain:!0,autoDestory:!0,items:a});a.show();a.dd.constrainTo(Ext.getBody())},viewHelperEx:function(){return{vh_log_detail:function(a,c,b){return"<a href=\"JavaScript:Ext.ucf.task.dispTaskHistoryWindow('"+b.get("unique_id")+"')\" >"+_msg.HISTORY+"</a>"}}},viewHelper:function(a,c,b){b=c;if("task_type"==
a)switch(c){case "account_sync_to_o365":b=_msg.TASK_TYPE_ACCOUNT_SYNC_TO_O365;break;case "account_sync_to_sso":b=_msg.TASK_TYPE_ACCOUNT_SYNC_TO_SSO;break;case "group_sync_to_o365":b=_msg.TASK_TYPE_GROUP_SYNC_TO_O365;break;case "group_sync_to_sso":b=_msg.TASK_TYPE_GROUP_SYNC_TO_SSO;break;case "orgunit_sync_to_o365":b=_msg.TASK_TYPE_ORGUNIT_SYNC_TO_O365;break;case "orgunit_sync_to_sso":b=_msg.TASK_TYPE_ORGUNIT_SYNC_TO_SSO;break;default:b=c}else if("task_deal_status"==a)switch(c){case "WAIT":b=_msg.TASK_DEAL_STATUS_WAIT;
break;case "PROCESSING":b=_msg.TASK_DEAL_STATUS_PROCESSING;break;case "STOP":b=_msg.TASK_DEAL_STATUS_STOP;break;case "STOP_INDICATING":b=_msg.TASK_DEAL_STATUS_STOP_INDICATING;break;case "":b=_msg.TASK_DEAL_STATUS_DEFAULT;break;case "FIN":b=_msg.TASK_DEAL_STATUS_FIN;break;default:b=c}else if("task_status"==a)switch(c){case "SUCCESS":b=_msg.SUCCESS;break;case "FAILED":b=_msg.FAILED;break;default:b=c}else if("task_fixed_term_type"==a)switch(c){case "1DAY":b=_msg.TASK_FIX_TERM_TYPE_DAILY;break;case "":b=
_msg.TASK_FIX_TERM_TYPE_SINGLE;break;default:b=c}else if("execute_operator_id"==a)switch(c){case "cron_polling_task":b=_msg.CRON_POLLING_TASK;break;default:b=c}return{value:b,is_html:!1}},createTaskRecord:function(){return Ext.data.Record.create([{name:"unique_id",type:"string",mapping:"unique_id"},{name:"comment",type:"string"},{name:"task_type",type:"string"},{name:"task_target",type:"string"},{name:"task_deal_status",type:"string"},{name:"task_status",type:"string"},{name:"task_status_date",type:"string"},
{name:"task_fixed_term_type",type:"string"},{name:"task_start_plan_date",type:"string"},{name:"task_start_date",type:"string"},{name:"task_end_date",type:"string"},{name:"data_delete_flag",type:"string"},{name:"password_field",type:"string"},{name:"password_update_flag",type:"string"},{name:"execute_operator_id",type:"string"}])},goEditPage:function(a){window.location.href=_vurl+"task/regist?unqid="+escape(a)+"&tp=rn"},vh_basic:function(a,c,b){return Ext.ucf.htmlEscape(a)},vh_task_type:function(a,
c,b){a=Ext.ucf.task.viewHelper("task_type",a,null);a=a.is_html?a.value:Ext.ucf.htmlEscape(a.value);return'<a href="'+_vurl+"task/regist?unqid="+escape(b.get("unique_id"))+'&tp=rn" >'+a+"</a>"},vh_task_deal_status:function(a,c,b){a=Ext.ucf.task.viewHelper("task_deal_status",a,null);return a.is_html?a.value:Ext.ucf.htmlEscape(a.value)},vh_task_status:function(a,c,b){a=Ext.ucf.task.viewHelper("task_status",a,null);return a.is_html?a.value:Ext.ucf.htmlEscape(a.value)},vh_task_fixed_term_type:function(a,
c,b){a=Ext.ucf.task.viewHelper("task_fixed_term_type",a,null);return a.is_html?a.value:Ext.ucf.htmlEscape(a.value)},vh_execute_operator_id:function(a,c,b){a=Ext.ucf.task.viewHelper("execute_operator_id",a,null);return a.is_html?a.value:Ext.ucf.htmlEscape(a.value)},vhEdit:function(a,c,b){return'<input type="button" value="" class="btnEdit" onclick="JavaScript:Ext.ucf.task.goEditPage(\''+a+"');\" />"},updateLump:function(a,c,b,d){if(0>=a.length)Ext.Msg.show({icon:Ext.MessageBox.WARNING,title:_msg.WARNING,
msg:_msg.MSG_NOT_SELECTED_TARGET_DATA,buttons:Ext.Msg.OK});else{var f=function(a){void 0!=a.responseText&&""!=a.responseText&&(a=jQuery.parseJSON(a.responseText).code,0==a&&(Ext.ucf.flowMsg(_msg.SUCCESS,_msg.UPDATED,a),d&&d()));e.hide()};a={unique_id_list:Ext.ucf.getUniqueIDList(a),update_kbn:c};var e=new Ext.LoadMask(Ext.get(b),{msg:_msg.VMSG_MSG_UPDATING});e.show();Ext.Ajax.request({url:_vurl+"task/xtlumpupd",method:"POST",params:a,success:f,failure:f})}},createTaskColumnModel:function(a){return new Ext.grid.ColumnModel({columns:[a,
{header:_msg.FLD_TASK_TYPE,dataIndex:"task_type",width:140,sortable:!1,renderer:Ext.ucf.task.vh_task_type},{header:_msg.FLD_TASK_START_DATE,dataIndex:"task_start_date",width:70,sortable:!1,renderer:Ext.ucf.task.vh_basic},{header:_msg.FLD_TASK_END_DATE,dataIndex:"task_end_date",width:70,sortable:!1,renderer:Ext.ucf.task.vh_basic},{header:_msg.FLD_TASK_DEAL_STATUS,dataIndex:"task_deal_status",width:40,sortable:!1,renderer:Ext.ucf.task.vh_task_deal_status},{header:_msg.FLD_TASK_STATUS,dataIndex:"task_status",
width:50,sortable:!1,renderer:Ext.ucf.task.vh_task_status},{header:_msg.FLD_TASK_FIXED_TERM_TYPE_FOR_LIST,dataIndex:"task_fixed_term_type",width:35,sortable:!1,renderer:Ext.ucf.task.vh_task_fixed_term_type},{header:_msg.FLD_TASK_START_PLAN_DATE_FOR_LIST,dataIndex:"task_start_plan_date",width:70,sortable:!1,renderer:Ext.ucf.task.vh_basic},{header:_msg.FLD_TASK_LAST_EXECUTE_OPERATOR_ID,dataIndex:"execute_operator_id",width:80,sortable:!1,renderer:Ext.ucf.task.vh_execute_operator_id},{header:_msg.HISTORY,
dataIndex:"",align:"center",width:40,sortable:!1,renderer:Ext.ucf.task.viewHelperEx().vh_log_detail},{header:"",dataIndex:"unique_id",hidden:!1,width:25,sortable:!1,renderer:Ext.ucf.task.vhEdit}]})},submitAccountSyncToAppsTaskRegistWithConfirm:function(a){if(""==Ext.ucf.getElementValue("task_deal_status")){var c="DELETE"==Ext.ucf.getElementValue("data_delete_flag"),b="UPDATE"==Ext.ucf.getElementValue("password_update_flag");if(1==c||1==b){var d="";1==c&&(d+="<br/>"+_msg.EXP_TASK5);1==b&&(d+="<br/>"+
_msg.EXP_TASK6);d+="<br/>"+_msg.EXP_TASK7;is_ok=!1;Ext.Msg.show({icon:Ext.MessageBox.WARNING,title:_msg.CONFIRM,msg:d,buttons:Ext.Msg.YESNO,fn:function(b,c){"yes"==b&&a.submit()}})}else document.frmEdit.submit()}else document.frmEdit.submit()},DatTaskType:[["account_sync_to_sso",_msg.TASK_TYPE_ACCOUNT_SYNC_TO_SSO],["account_sync_to_o365",_msg.TASK_TYPE_ACCOUNT_SYNC_TO_O365],["group_sync_to_o365",_msg.TASK_TYPE_GROUP_SYNC_TO_O365]],DatTaskDealStatus:[["",_msg.TASK_DEAL_STATUS_DEFAULT],["WAIT",_msg.TASK_DEAL_STATUS_WAIT],
["PROCESSING",_msg.TASK_DEAL_STATUS_PROCESSING],["STOP_INDICATING",_msg.TASK_DEAL_STATUS_STOP_INDICATING],["STOP",_msg.TASK_DEAL_STATUS_STOP],["FIN",_msg.TASK_DEAL_STATUS_FIN]],DatTaskStatus:[["SUCCESS",_msg.PROCESS_RESULT_SUCCESS],["FAILED",_msg.PROCESS_RESULT_FAILED]],DatFixedTermType:[["",_msg.TASK_FIX_TERM_TYPE_SINGLE2],["1DAY",_msg.TASK_FIX_TERM_TYPE_DAILY2]],init:function(){}}}();
