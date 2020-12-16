
Ext.ucf.search_list = function(){

    return {
			viewHelper:function(id, value, cmp){
				var is_html = false;
				var result = value;
				return {value:result, is_html:is_html};
			},

            getRandomStr: function(length) {
                var ram = 0;
                var result = '';
                var baseStr = '';
                baseStr += '0123456789';
                ram += 10;
                baseStr += 'abcdefghijklmnopqrstuvwxyz';
                ram += 26;
                baseStr += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                ram += 26;
                for(var i=0; i<length; i++) {
                    result += baseStr.charAt(Math.floor(Math.random() * ram));
                }
                return result;
            },

            isValidURL: function(url) {
                var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                if (pattern.test(url)) {
                    return true;
                }
                return false;
            },

             // ログテキストなどの詳細を表示
			createSearchData: function(content)
			{
				var show_window = function(search_config){

                    var vHtml = '';
                    vHtml += '<div style="px;padding:10px;">';
                    vHtml += '<table border="0" width="100%" cellpadding="2" cellspacing="2" class="detail2" >';
                    vHtml += '<tr><td colspan="4"><img src="/images/share/space.gif" width="10" height="10" border="0" alt=""></td></tr>';
                    vHtml += '<tr>';
                    vHtml += '<td valign="middle" class="style2" nowrap>{0}&nbsp;<font color="red">*</font></td>'.format(_msg.FLD_SEARCH_NAME);;
                    vHtml += '<td align="left" class="style3" colspan="3">';
                    vHtml += '<input type="text" size="20" autocomplete="off" id="preview_search_name" name="preview_template_name" class="x-form-text x-form-field" style="width: 242px;">';
//                    vHtml += '<input type="hidden" id="preview_search_config" value="{0}">'.format(Base64.encode(search_config));
                    vHtml += '</td>';
                    vHtml += '</tr>';
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
                                    saveSearch();
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
                                Ext.ucf.flowMsg(_msg.VMSG_SEARCH_ADD,_msg.PROCESS_RESULT_SUCCESS , '');
                                detailwindow.close();
                            }else{
                                Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR,_msg.PROCESS_RESULT_FAILED , '');
                            }
                        }
                    };

                     var saveSearch = function(){
                            var preview_search_config_val = search_config;//$('#preview_action_config').val();
                            var preview_search_name_val = $('#preview_search_name').val();
                            if (preview_search_name_val == '') {
                                vc_msgs = '[' + _msg.FLD_SEARCH_NAME + ']' + _msg.VC_NEED;
                                Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR,vc_msgs , '');
                                return;
                            }
                            var params = {
                                search_name: preview_search_name_val,
                                search_config: preview_search_config_val
                            };
                          Ext.Ajax.request({
                            url: _vurl + 'search/create',
                            method: 'POST',
                            params: params,
                            success: handleAfterProcessTemplate,
                            failure: handleAfterProcessTemplate
                          });
                        };

					var detailwindow
						{
						var window_title = _msg.VMSG_SEARCH_ADD;
						detailwindow = new Ext.Window({
								title:window_title,
								layout:'fit',
								modal:true,
								width:450,
								height:150,
								plain: true,
								autoDestory:true,
								items: logform
							});
						};
					detailwindow.show();
					detailwindow.dd.constrainTo(Ext.getBody());
				};

				var handleAfterProcess = function(){
					if (content != undefined && content != '') {
                        show_window(content);
					}
				};
				handleAfterProcess();
			},

			init: function(){}

    };


}();

