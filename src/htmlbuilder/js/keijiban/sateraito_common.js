(function(){SateraitoWF={showDocument:function(a){IS_OPENID_MODE?location.href.indexOf("docprint")?window.open(SATERAITO_MY_SITE_URL+"/"+SATERAITO_GOOGLE_APPS_DOMAIN+"/"+LoginMgr.appId+"/docprint2/"+a+"?hl="+SATERAITO_LANG+"&token="+LoginMgr.token):window.open(SATERAITO_MY_SITE_URL+"/"+SATERAITO_GOOGLE_APPS_DOMAIN+"/"+LoginMgr.appId+"/docdetail2/"+a+"?hl="+SATERAITO_LANG+"&token="+LoginMgr.token):DocDetailWindow.showWindow(a,null,null,!1,"",{hideNextPrevButton:!0})},addComma:function(a){return NumUtil.addComma(a)},
removeComma:function(a){return NumUtil.removeComma(a)},getCalendarCmp:function(a,b){if("form_new_doc"==a.id)return Ext.getCmp("template_body_new_doc_"+b);var c=a.id.split("_")[1];return Ext.getCmp("template_body_"+c+"_"+b)},calcAll:function(a){"form_new_doc"==a.id?Calc.calcAll("template_body_new_doc"):(a=a.id.split("_")[1],Calc.calcAll("template_body_"+a))},dateDiff:function(a,b){return"undefined"==typeof a||"undefined"==typeof b||null==typeof a||null==typeof b||""==a||""==b?null:Sateraito.DateUtil.getDateDiff(a,
b)},dateAdd:function(a,b){return""==a||null==a||isNaN(b)?null:Sateraito.DateUtil.getFutureDateStr(a,b)},registerFunctionsToNewWindow:function(a,b){var c=Ext.getCmp("doc_detail_window_new_doc");"undefined"==typeof c.customFunctions&&(c.customFunctions={});c.customFunctions[a]=b},getFunctionsFromNewWindow:function(a){var b=Ext.getCmp("doc_detail_window_new_doc");"undefined"==typeof b.customFunctions&&(b.customFunctions={});return b.customFunctions[a]},disableFormElement:function(a,b){$(a).find("div.main_body").find(":input[name="+
b+"]").attr("disabled","disabled")},enableFormElement:function(a,b){$(a).find("div.main_body").find(":input[name="+b+"]").removeAttr("disabled")},setFormValue:function(a,b,c){$(a).find("div.main_body").find(":input[name="+b+"]").hasClass("number")&&(c=NumUtil.addComma(NumUtil.removeComma(c)));$(a).find("div.main_body").find(":input[name="+b+"]").attr("value",c)},getFormValue:function(a,b){return $(a).find("div.main_body").find(":input[name="+b+"]").val()},getForm:function(a){console.log($(a));console.log($(a).parents("form"));
return $(a).parents("form")[0]},showNewDocWindow:function(a,b){var c=WorkflowTemplate.getTemplateIdByName(a);if(""==c)return!1;NewDocWindow.showWindow(c,b);return!0},round:function(a,b,c){return Calc.round(a,b,c)},sum:function(a,b){return Calc.sum(a,b)},diff:function(a,b){return Calc.diff(a,b)},multi:function(a,b){return Calc.multi(a,b)}};SateraitoUI={clearMessage:function(){IS_OPENID_MODE||IS_TOKEN_MODE?_OidMiniMessage.clearMessage():Sateraito.MiniMessage.clearMessage()},showLoadingMessage:function(a){"undefined"==
typeof a&&(a=MyLang.getMsg("LOADING"));IS_OPENID_MODE||IS_TOKEN_MODE?_OidMiniMessage.showLoadingMessage(a):Sateraito.MiniMessage.showLoadingMessage(a)},showTimerMessage:function(a,b){IS_OPENID_MODE||IS_TOKEN_MODE?_OidMiniMessage.showTimerMessage(a,b):Sateraito.MiniMessage.showTimerMessage(a,b)},changeEnabledComponents:function(a){for(var b="approve_button reject_button approve_button2 reject_button2 update_button update_button2 looked_button btn_submit_new_doc btn_save_as_draft_doc btn_delete_draft_doc".split(" "),
c=0;c<b.length;c++){var d=Ext.getCmp(b[c]);d&&(a?d.enable():d.disable())}}};NumUtil={addComma:function(a){a=""+a;var b=a.indexOf(".");0>b&&(b=a.length);for(var c=a.substring(b,a.length),d=0;d<b;d++){var e=a.substring(b-1-d,b-1-d+1);if("0">e||"9"<e){c=a.substring(0,b-d)+c;break}0<d&&0==d%3&&(c=","+c);c=e+c}return c},removeComma:function(a){if("undefined"==typeof a||null==a)return"";value=""+a;return value.split(",").join("")}};Calc={calcAll:function(a){$("#"+a).find("input.multi").attr("calced","0");
$("#"+a).find("input.sum").attr("calced","0");$("#"+a).find("input.diff").attr("calced","0");Calc.calcSum(a);Calc.calcDiff(a);Calc.calcMulti(a)},calcSumField:function(a,b){if("1"!=$(a).attr("calced")){var c=$(a).attr("fields").split(" "),d=null;Ext.each(c,function(){var a=$("#"+b).find("[name="+this+"]")[0];$(a).is("input.sum")&&"1"!=$(a).attr("calced")&&Calc.calcSumField(a,b);$(a).is("input.diff")&&"1"!=$(a).attr("calced")&&Calc.calcDiffField(a,b);$(a).is("input.multi")&&"1"!=$(a).attr("calced")&&
Calc.calcMultiField(a,b);a=$("#"+b).find("[name="+this+"]").val();if("undefined"==typeof a||""==a.trim()||isNaN(parseFloat(NumUtil.removeComma(a),10)))return!0;null==d&&(d=0);d+=Math.floor(parseFloat(NumUtil.removeComma(a),10))});null==d?$(a).val(""):$(a).val(NumUtil.addComma(""+Math.floor(d)));$(a).attr("calced","1")}},calcSum:function(a){$("#"+a).find("input.sum").each(function(){Calc.calcSumField(this,a)})},calcDiffField:function(a,b){if("1"!=$(a).attr("calced")){var c=$(a).attr("fields").split(" "),
d=null,e=null,f=null;Ext.each(c,function(a,c){var d=$("#"+b).find("[name="+this+"]")[0];$(d).is("input.sum")&&"1"!=$(d).attr("calced")&&Calc.calcSumField(d,b);$(d).is("input.diff")&&"1"!=$(d).attr("calced")&&Calc.calcDiffField(d,b);$(d).is("input.multi")&&"1"!=$(d).attr("calced")&&Calc.calcMultiField(d,b);d=$("#"+b).find("[name="+this+"]").val();if("undefined"==typeof d||""==d.trim()||isNaN(parseFloat(NumUtil.removeComma(d),10)))return!0;0==c&&(e=Math.floor(parseFloat(NumUtil.removeComma(d),10)));
1==c&&(f=Math.floor(parseFloat(NumUtil.removeComma(d),10)))});if(null!=e||null!=f)null==e&&(e=0),null==f&&(f=0),d=e-f;null==d?$(a).val(""):$(a).val(NumUtil.addComma(""+Math.floor(d)));$(a).attr("calced","1")}},calcDiff:function(a){$("#"+a).find("input.diff").each(function(){Calc.calcDiffField(this,a)})},calcMultiField:function(a,b){if("1"!=$(a).attr("calced")){var c=$(a).attr("fields").split(" "),d=null;Ext.each(c,function(){var a=$("#"+b).find("[name="+this+"]")[0];$(a).is("input.sum")&&"1"!=$(a).attr("calced")&&
Calc.calcSumField(a,b);$(a).is("input.diff")&&"1"!=$(a).attr("calced")&&Calc.calcDiffField(a,b);$(a).is("input.multi")&&"1"!=$(a).attr("calced")&&Calc.calcMultiField(a,b);a=$(a).val();if("undefined"==typeof a||""==a.trim()||isNaN(parseFloat(NumUtil.removeComma(a),10)))return d=null,!1;null==d&&(d=1);d*=parseFloat(NumUtil.removeComma(a),10)});null==d?$(a).val(""):(c=$(a).attr("number"),"undefined"!=typeof c&&null!=c&&""!=c.trim()&&(isNaN(parseFloat(c))||(d=Math.floor(d*parseFloat(c)))),$(a).val(NumUtil.addComma(""+
Math.floor(d))));$(a).attr("calced","1")}},calcMulti:function(a){$("#"+a).find("input.multi").each(function(){Calc.calcMultiField(this,a)})}};FieldConvert={bindEventToGoogleCalendarButtonEvent:function(a,b){var c=function(b,c){var f=$(c).attr("data_fields").split(";"),k={};Ext.each(f,function(){var a=(""+this).split(":");k[a[0]]=a[1]});var f="",h=null,g=null,m=!1,n=!1;"undefined"!=typeof k.from&&""!=k.from&&$("#"+a).find(":input[name='"+k.from+"']").each(function(){var a=$(this).val(),b=new DateFormat("yyyy-MM-dd");
h=b.parse(a);null==h&&(b=new DateFormat("yyyy-MM-dd HH:mm:ss"),h=b.parse(a),m=!0)});"undefined"!=typeof k.to&&""!=k.to&&$("#"+a).find(":input[name='"+k.to+"']").each(function(){var a=$(this).val(),b=new DateFormat("yyyy-MM-dd");g=b.parse(a);null==g&&(b=new DateFormat("yyyy-MM-dd HH:mm:ss"),g=b.parse(a),n=!0)});null!=h&&m&&(h=new Date(h.getUTCFullYear(),h.getUTCMonth(),h.getUTCDate(),h.getUTCHours(),h.getUTCMinutes(),h.getUTCSeconds()));null!=g&&(n?g=new Date(g.getUTCFullYear(),g.getUTCMonth(),g.getUTCDate(),
g.getUTCHours(),g.getUTCMinutes(),g.getUTCSeconds()):g.setTime(g.getTime()+864E5));null==h&&null!=g?n?(h=new Date,h.setTime(g.getTime()-36E5)):h=g:null!=h&&null==g&&(m?(g=new Date,g.setTime(h.getTime()+36E5)):g=h);if(null!=h&&null!=g){var l;m&&n?(f=""+h.getFullYear()+("0"+(h.getMonth()+1)).slice(-2)+("0"+h.getDate()).slice(-2)+"T"+("0"+h.getHours()).slice(-2)+("0"+h.getMinutes()).slice(-2)+("0"+h.getSeconds()).slice(-2)+"Z",l=""+g.getFullYear()+("0"+(g.getMonth()+1)).slice(-2)+("0"+g.getDate()).slice(-2)+
"T"+("0"+g.getHours()).slice(-2)+("0"+g.getMinutes()).slice(-2)+("0"+g.getSeconds()).slice(-2)+"Z"):(f=""+h.getFullYear()+("0"+(h.getMonth()+1)).slice(-2)+("0"+h.getDate()).slice(-2),l=""+g.getFullYear()+("0"+(g.getMonth()+1)).slice(-2)+("0"+g.getDate()).slice(-2));f=f+"/"+l}else f="";var p="";"undefined"!=typeof k.title&&""!=k.title&&$("#"+a).find(":input[name='"+k.title+"']").each(function(){p=$(this).val()});var q="";"undefined"!=typeof k.details&&""!=k.details&&$("#"+a).find(":input[name='"+k.details+
"']").each(function(){q=$(this).val()});var r="";"undefined"!=typeof k.location&&""!=k.location&&$("#"+a).find(":input[name='"+k.location+"']").each(function(){r=$(this).val()});l="https://www.google.com/calendar/event?action=TEMPLATE&trp=false";""!=p&&(l=l+"&text="+encodeURIComponent(p));""!=f&&(l=l+"&dates="+encodeURIComponent(f));""!=q&&(l=l+"&details="+encodeURIComponent(q));""!=r&&(l=l+"&location="+encodeURIComponent(r));window.open(l)};$("#"+a).find("input[type=button].add_to_google_calendar").each(function(){var a=
this;$(a).attr("src",SATERAITO_MY_SITE_URL+"/images/calendar_plus_ja.gif");$(a).on("click",function(){c("button",a)})});$("#"+a).find("img.add_to_google_calendar").each(function(){var a=this;$(a).attr("src",SATERAITO_MY_SITE_URL+"/images/calendar_plus_ja.gif");$(a).css("cursor","pointer");$(a).on("click",function(){c("img",a)})})},bindClearButtonEvent:function(a){var b=$("#"+a).find("input[type=button].clear_button");$.each(b,function(){$(this).on("click",function(){var b=$(this).attr("fields").split(" ");
Ext.each(b,function(){var b=""+this;$("#"+a).find(":input[name="+b+"]").val("")})})})},dateFieldConvertAll:function(a,b){$("#"+a).find("input.date").each(function(){FieldConvert.dateFieldConvertEach(a,b,this)})},dateFieldConvertEach:function(a,b,c){var d=$(c).attr("class"),e=$(c).attr("type");"undefined"==typeof e&&(e="text");if("text"==e||""==e){var e=$(c).attr("name"),f=$(c).val();if("undefined"==typeof f||null==f)f="";var k=!1;$(c).attr("disabled")&&(k=!0);var h=!1;$(c).attr("readonly")&&(h=!0);
$(c).after('<div style="display:inline-block;" id="date_field_render_area_'+a+"_"+e+'"></div>');f=new Ext.form.DateField({id:"template_body_new_doc_"+e,name:e,invalidText:MyLang.getMsg("INPUT_CHECK_ERR_MSG1"),renderTo:"date_field_render_area_"+a+"_"+e,readOnly:h,disabled:k,value:f,format:"Y-m-d"});b.add(f);$("#date_field_render_area_"+a+"_"+e).find("input[name="+e+"]").addClass(d);$(c).remove()}},numberFieldConvert:function(a,b){$("#"+a).find("input.number").each(function(){FieldConvert._numberFieldConvert(a,
b,this)})},_numberFieldConvert:function(a,b,c){var d=$(c).attr("class"),e=$(c).attr("type");"undefined"==typeof e&&(e="text");if("text"==e||""==e){var e=$(c).attr("name"),f=$(c).val();if("undefined"==typeof f||null==f)f="";var k=!1;$(c).attr("readonly")&&(k=!0);var h=!1;$(c).attr("disabled")&&(h=!0);var g=$(c).attr("fields");if("undefined"==typeof g||null==g)g="";var m=$(c).width();$(c).after('<div style="display:inline-block;" id="number_field_render_area_'+a+"_"+e+'"></div>');f=new Ext.form.TextField({id:a+
"_"+e,maskRe:/[0-9,]/,name:e,invalidText:MyLang.getMsg("INPUT_CHECK_ERR_MSG4"),renderTo:"number_field_render_area_"+a+"_"+e,width:m,value:f,readOnly:k,disabled:h,validator:function(a){a=NumUtil.removeComma(a);return isNaN(a)?MyLang.getMsg("INPUT_CHECK_ERR_MSG5"):!0},listeners:{focus:function(a){var b=NumUtil.removeComma(a.getRawValue());a.setRawValue(b)},change:function(a){var b=NumUtil.removeComma(a.getRawValue());isNaN(b)||(b=NumUtil.addComma(b),a.setRawValue(b))}}});b.add(f);$("#number_field_render_area_"+
a+"_"+e).find("input[name="+e+"]").addClass(d).attr("fields",g);$(c).remove()}},richTextFieldConvert:function(a){$("#"+a).find("textarea.richtext").each(function(){FieldConvert._richTextFieldConvert(a,this)})},_richTextFieldConvert:function(a,b){var c=$(b).attr("name"),d=$(b).val();$("body").append('<div id="dummy_for_inline_img" style="display:none;">'+d+"</div>");$("#dummy_for_inline_img").find("img.inline_img").each(function(){$(this).attr("file_id")});d=$("#dummy_for_inline_img").html();$("#dummy_for_inline_img").remove();
$(b).after('<div id="richtext_field_render_area_'+a+"_"+c+'"></div>');new Ext.form.HtmlEditor({renderTo:"richtext_field_render_area_"+a+"_"+c,id:"richtext_field_"+a+"_"+c,name:c,cls:"richtext",fontFamilies:"Arial;Courier New;Tahoma;Times New Roman;Verdana;\uff2d\uff33 \uff30\u30b4\u30b7\u30c3\u30af;\uff2d\uff33 \uff30\u660e\u671d;\uff2d\uff33 \u30b4\u30b7\u30c3\u30af;\uff2d\uff33 \u660e\u671d".split(";"),defaultFont:"Arial",value:d,width:$(b).width(),height:$(b).height(),listeners:{initialize:function(a){if(a=
a.getEditorBody())a.style.fontFamily="Arial"}}});$(b).remove()}};MyUtil={isValidAppId:function(a){return!/^[a-zA-Z][a-zA-Z0-9_-]+$/.test(a)||1<a.split("_____").length?!1:!0}};DocDetailWindow={init:function(a){var b=[];$("#template_body_"+a).find("*").each(function(){var a=$(this).attr("name");"undefined"!=typeof a&&null!=a&&""!=a&&"process"!=a.toLowerCase()&&b.push(a)});DocDetailWindow.showInputFields(b,a)},showInputFields:function(a,b){var c=Ext.getCmp("form_panel_"+b).getForm();Ext.each(a,function(){var a=
""+this,e=$("#template_body_"+b).find(":input[name="+a+"]");$(e).attr("name");var f=$(e).attr("type");"undefined"==typeof f&&(f="text");f=f.toLowerCase();$(e).is("textarea")&&($("#template_body_"+b).find("span.sateraito_doc_value[name="+a+"]").hide(),$(e).show(),$(e).removeAttr("disabled"),$(e).hasClass("richtext")&&FieldConvert._richTextFieldConvert("template_body_"+b,e));"checkbox"==f&&$(e).removeAttr("disabled");$(e).is("input")&&"text"==f&&($("#template_body_"+b).find("span.sateraito_doc_value[name="+
a+"]").hide(),$(e).show(),$(e).removeAttr("disabled"),$(e).hasClass("number")&&FieldConvert._numberFieldConvert("template_body_"+b,c,e),$(e).hasClass("date")&&FieldConvert.dateFieldConvertEach("template_body_"+b,c,e));"radio"==f&&$("#template_body_"+b).find(":input[name="+a+"]").removeAttr("disabled");$(e).is("select")&&$(e).removeAttr("disabled");"button"==f&&$(e).is(".clear_button")&&$(e).show()});$("#template_body_"+b).find(":input").change(function(){Calc.calcAll("template_body_"+b)});FieldConvert.bindClearButtonEvent("template_body_"+
b)}}})();
