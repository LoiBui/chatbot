Ext.ucf.acslog=function(){return{viewHelper:function(c,b,a){a=b;if("target_career"==c)switch(b){case "PC":a=_msg.TARGET_CAREER_PC;break;case "SOFTBANK":a=_msg.TARGET_CAREER_SP;break;case "EZWEB":a=_msg.TARGET_CAREER_AU;break;case "IMODE":a=_msg.TARGET_CAREER_DOCOMO;break;case "WILLCOM":a=_msg.TARGET_CAREER_WILLCOM;break;case "MOBILE":a=_msg.TARGET_CAREER_MOBILE;break;case "TABLET":a=_msg.TARGET_CAREER_TABLET;break;case "SP":a=_msg.TARGET_CAREER_SP;break;case "API":a=_msg.TARGET_CAREER_API;break;case "FPAPP":a=
_msg.TARGET_CAREER_FPAPP;break;default:a=b}else if("target_env"==c)switch(b){case "office":a=_msg.OFFICE;break;case "outside":a=_msg.OUTSIDE;break;case "sp":a=_msg.SP;break;case "fp":a=_msg.FP;break;default:a=b}else if("login_result"==c)switch(b){case "SUCCESS":a="\u6210\u529f";break;case "FAILED":a="\u5931\u6557";break;default:a=b}else"log_code"==c&&(a=b);return{value:a,is_html:!1}},createLoginHistoryRecord:function(){return Ext.data.Record.create([{name:"unique_id",type:"string",mapping:"unique_id"},
{name:"access_date",type:"string"},{name:"operator_unique_id",type:"string"},{name:"operator_id",type:"string"},{name:"login_id",type:"string"},{name:"log_code",type:"string"},{name:"log_text",type:"string"},{name:"login_result",type:"string"},{name:"client_ip",type:"string"},{name:"client_x_forwarded_for_ip",type:"string"},{name:"target_career",type:"string"},{name:"target_env",type:"string"},{name:"use_profile_id",type:"string"},{name:"use_access_apply_unique_id",type:"string"}])},dispLogTextDetail:function(c){c=
new Ext.FormPanel({labelWidth:30,frame:!1,width:900,layout:"fit",items:[{xtype:"fieldset",autoHeight:!0,autoWidth:!0,defaults:{width:800,height:500},defaultType:"textarea",items:[{fieldLabel:"",name:"log_text",value:c.get("log_text"),readOnly:!0}]}],buttons:[{text:_msg.VMSG_CLOSE,handler:function(){b.close()}}]});var b=new Ext.Window({title:_msg.LOGIN_HISTORY_DETAIL,layout:"fit",modal:!0,width:900,height:600,plain:!0,autoDestory:!0,items:c});b.show();b.dd.constrainTo(Ext.getBody())},init:function(){}}}();
