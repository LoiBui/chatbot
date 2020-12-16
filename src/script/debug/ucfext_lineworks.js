
Ext.ucf.lineworks = function(){

    return {
        showConfigPanel: function(channel_kind_id, params){
            var panel_area = 'panel_area_' + channel_kind_id;
            var csrf_token = params.csrf_token;
            var webhook_url = params.webhook_url;
            var channel_config = params.channel_config;

            var data_mapping = typeof(channel_config) != 'undefined' ? channel_config.data_mapping : {};
            var upload_url = _vurl + 'config/xtpictureupload?picture_id=boticon';
            var vhtml = Ext.ucf.lineworks.createConfigPanel(data_mapping, upload_url, csrf_token, webhook_url);

            var containerPanel = new Ext.Panel({
                html: vhtml,
                layout: 'fit',
                frame: false,
                border: false,
                bodyStyle: 'background-color:white;padding:5px; font-size:12px;',
            });
            containerPanel.render(Ext.get(panel_area));

            Ext.ucf.lineworks.appendDataConfigPanel(channel_config);
        },

        appendDataConfigPanel: function(channel_config){
            var domain_id = channel_config?channel_config.domain_id:''
            var field_domain_id_area = Ext.ucf.field.createTextField2('domain_id', 'domain_id', domain_id, '', 150, Ext.ucf.delegateCheckValidation);
            field_domain_id_area.render('FIELD_domain_id_area');
            if(domain_id){
                Ext.getCmp('domain_id').disable();
            }

            var tenant_id = channel_config?channel_config.tenant_id:''
            var field_tenant_id_area = Ext.ucf.field.createTextField2('tenant_id', 'tenant_id', tenant_id, '', 150, Ext.ucf.delegateCheckValidation);
            field_tenant_id_area.render('FIELD_tenant_id_area');
            if(tenant_id){
                Ext.getCmp('tenant_id').disable();
            }

            var field_open_api_id_area = Ext.ucf.field.createTextField2('open_api_id', 'open_api_id', channel_config?channel_config.open_api_id:'', '', 300, Ext.ucf.delegateCheckValidation);
            field_open_api_id_area.render('FIELD_open_api_id_area');
            
            var field_consumer_key_area = Ext.ucf.field.createTextField2('consumer_key', 'consumer_key', channel_config?channel_config.consumer_key:'', '', 300, Ext.ucf.delegateCheckValidation);
            field_consumer_key_area.render('FIELD_consumer_key_area');
            
            var field_server_id_area = Ext.ucf.field.createTextField2('server_id', 'server_id', channel_config?channel_config.server_id:'', '', 300, Ext.ucf.delegateCheckValidation);
            field_server_id_area.render('FIELD_server_id_area');

            var field_priv_key_area = Ext.ucf.field.createTextAreaField('priv_key', 'priv_key', channel_config?channel_config.priv_key:'', '', 480, Ext.ucf.delegateCheckValidation);
            field_priv_key_area.render('FIELD_priv_key_area');
            
            var field_bot_no_area = Ext.ucf.field.createTextField2('bot_no', 'bot_no', channel_config?channel_config.bot_no:'', '', 80, Ext.ucf.delegateCheckValidation);
            field_bot_no_area.render('FIELD_bot_no_area');
            $('#bot_no').attr('disabled', 'disabled');
            
            if(!channel_config || !channel_config.bot_no){
                $('#FIELD_bot_no_area').css('display', 'none');
                $('#none_bot').css('display', '');
            }
            // else{
            //     $('#FIELD_bot_no_area').css('display', 'none');
            //     $('#none_bot').css('display', '');
            // }

            if(channel_config){
                var setBotInfo = function(response){
                    var jsondata = jQuery.parseJSON(response.responseText);
                    var code = jsondata.code;
                    if (code != 0) 
                    {
                        if (jsondata.msg == '')
                        {
                            Ext.ucf.dispSysErrMsg(code);
                        }
                        else{
                            Ext.ucf.flowMsg(_msg.VMSG_MSG_ERROR, jsondata.msg);
                        }
                        return;
                    }

                    var bot_data = jsondata.bot_vo;

                    $('#input_bot_name').val(bot_data.bot_name);
                    $('#input_bot_description').text(bot_data.bot_description);
                    $('#input_bot_manager').val(bot_data.bot_manager);
                    // $('#input_bot_url').val(bot_data.bot_url);
                    $('#input_bot_photourl').val(bot_data.bot_photourl);

                    if(typeof(bot_data.bot_photourl) != 'undefined' && bot_data.bot_photourl != ''){
                        $('#img_bot_icon').attr('src', bot_data.bot_photourl);
                        $('#img_bot_icon').css('display', 'block');
                        $('#img_bot_icon_noupload_msg').css('display', 'none');
                    }

                    if(typeof(bot_data.bot_manager) != 'undefined' && bot_data.bot_manager != ''){
                        $('#input_bot_manager').attr('disabled', 'disabled');
                    }
                };

                // データ取得
                Ext.Ajax.request({ 
                    url: _vurl + 'lineworksbot/xtgetdetail',
                    method: 'POST', 
                    params: channel_config,
                    success: setBotInfo,
                    failure: setBotInfo
                });
            }
        },

        createConfigPanel: function(data_mapping, upload_url, csrf_token, webhook_url){

            var data_mapping_sender = typeof(data_mapping.sender) != 'undefined' ? data_mapping.sender : '/source/accountId';
            var data_mapping_sender_type = typeof(data_mapping.sender_type) != 'undefined' ? data_mapping.sender_type : 'lineworks_id';

            var vHtml = '';
            vHtml += '<div class="channel_panel" >';
            vHtml += '<table>';
            vHtml += '<tr>';
            vHtml += '<td>';
            vHtml += '<span class="section_description" >' + _msg.EXP_LINEWORKSAPI_CONFIG2 + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<td style="text-align:left;">';
            vHtml += '<table>';

            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKSAPI_DOMAIN_ID) + ':&nbsp;</th>';
            vHtml += '<td>';
            vHtml += '<div id="FIELD_domain_id_area" ></div>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKSAPI_OPEN_API_ID + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';

            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKSAPI_TENANT_ID) + ':&nbsp;</th>';
            vHtml += '<td>';
            vHtml += '<div id="FIELD_tenant_id_area" ></div>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKSAPI_OPEN_API_ID + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';

            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKSAPI_OPEN_API_ID) + ':&nbsp;</th>';
            vHtml += '<td>';
            vHtml += '<div id="FIELD_open_api_id_area" ></div>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKSAPI_OPEN_API_ID + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKSAPI_CONSUMER_KEY) + ':&nbsp;</th>';
            vHtml += '<td>';
            vHtml += '<div id="FIELD_consumer_key_area" ></div>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKSAPI_CONSUMER_KEY + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKSAPI_SERVER_ID) + ':&nbsp;</th>';
            vHtml += '<td>';
            vHtml += '<div id="FIELD_server_id_area" ></div>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKSAPI_SERVER_ID + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKSAPI_PRIV_KEY) + ':&nbsp;</th>';
            vHtml += '<td>';
            vHtml += '<div id="FIELD_priv_key_area" ></div>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKSAPI_PRIV_KEY + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKSAPI_BOT_NO) + ':&nbsp;</th>';
            vHtml += '<td>';
            vHtml += '<table>';
            vHtml += '<tr>';
            vHtml += '<td>';
            vHtml += '<div id="FIELD_bot_no_area" style="margin-top:-1%;" ></div>';
            vHtml += '<div id="none_bot" style="display:none"><label style="margin-left:-1.5%;" >' + _msg.LINEWORKS_BOT_NOT_YET_SETTING + '</label></div>';
            vHtml += '</td>';
            vHtml += '<td>&nbsp;&nbsp;</td>';
            vHtml += '<td>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '</table>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKSAPI_BOT_NO + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';

            // --------------------------------------------- create bot config  ---------------------------------------------
            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKS_BOT_NAME) + ':&nbsp;<font size="2" color="red" >*</font></th>';
            vHtml += '<td>';
            vHtml += '<input type="text" id="input_bot_name" style="width:292px;" class="x-form-text x-form-field"><br>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKS_BOT_NAME + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';


            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKS_BOT_DESCRIPTION) + ':&nbsp;<font size="2" color="red" >*</font></th>';
            vHtml += '<td>';
            vHtml += '<textarea id="input_bot_description" style="width:472px; height:50px;" class="x-form-textarea x-form-field" ></textarea><br>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKS_BOT_DESCRIPTION + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';

            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKS_BOT_MANAGER) + ':&nbsp;<font size="2" color="red" >*</font></th>';
            vHtml += '<td>';
            vHtml += '<input type="text" id="input_bot_manager" style="width:292px;" class="x-form-text x-form-field" ><br>';
            vHtml += '<span class="description" >' + _msg.EXP_LINEWORKS_BOT_MANAGER + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';

            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left;">' + Ext.ucf.htmlEscape(_msg.LINEWORKS_BOT_URL) + ':&nbsp;</th>';
            vHtml += '<td>';
            if(webhook_url){
                vHtml += '<input type="text" id="input_bot_url" style="width:472px;" class="x-form-text x-form-field" value="' + webhook_url + '" disabled >';
            }
            else{
                vHtml += '<input type="text" id="input_bot_url" style="width:472px;" class="x-form-text x-form-field" placeholder="' + _msg.EXPLAIN_CALLBACK_URL_AUTO_DISPLAY +'" disabled >';
            }
            vHtml += '</td>';
            vHtml += '</tr>';

            vHtml += '<tr>';
            vHtml += '<th style="font-size:13px; text-align:left; padding-top:15px;">' + Ext.ucf.htmlEscape(_msg.LINEWORKS_BOT_ICON) + ':&nbsp;<font size="2" color="red" >*</font></th>';
            vHtml += '<td>';
            vHtml += '<table>';
            vHtml += '<tr>';
            vHtml += '<td nowrap style="width: 15%">';
            vHtml += '<img src="" width="88px" height="88px" border="0" id="img_bot_icon" style="display: none"/>';
            vHtml += '<input type="hidden" id="input_bot_icon_key" >';
            vHtml += '<span id="img_bot_icon_noupload_msg" >' + _msg.LINEWORKS_BOT_ICON_NOUPLOAD + '</span>';
            vHtml += '</td>';
            vHtml += '<td style="vertical-align:bottom;">';
            vHtml += '<label for="input_bot_icon" style="height:20px; margin-left:30px; box-shadow:inset 0px 1px 0px 0px #ffffff; background:linear-gradient(to bottom, #f3f3f3 5%, #dddddd 100%); border-radius:3px; border:1px solid #dcdcdc; display:inline-block; cursor:pointer; color:#000000; text-decoration:none; text-shadow:0px 1px 0px #ffffff;">&nbsp;&nbsp;&nbsp;'+_msg.LINEWORKS_BOT_ICON_UPLOAD+'&nbsp;&nbsp;&nbsp;</label>';
            vHtml += '<input type="file" id="input_bot_icon" class="x-btn-text" style="display:none; margin:0 0 30px 30px; width:90px; color:transparent;" onChange="Ext.ucf.lineworks.changeBotIcon(\'input_bot_icon\', \''+ upload_url + '\', \'' + csrf_token + '\', \'' + webhook_url + '\');">';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';

            vHtml += '<td colspan="2" >';
            vHtml += '<span class="description" >' + _msg.VMSG_LINEWORKS_BOT_ICON + '</span>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<td colspan="2" style="height:5px;" >';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<th class="detail_name" nowrap style="text-align:left; font-size:12px; padding-left:3px;">';
            vHtml += _msg.LINEWORKS_BOT_PHOTOURL + '：';
            vHtml += '</th>';
            vHtml += '<td class="detail_value">';
            vHtml += '<input type="text" id="input_bot_photourl" class="x-form-text x-form-field" style="width:337px; margin-left:20px" placeholder="' + _msg.EXPLAIN_IMAGE_URL_AUTO_DISPLAY +'" disabled>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '<tr>';
            vHtml += '<td colspan="2" style="height:5px;" >';
            vHtml += '</td>';
            vHtml += '</table>';
            vHtml += '</td>';
            vHtml += '</tr>';

            vHtml += '</table>';
            vHtml += '</td>';
            vHtml += '</tr>';
            vHtml += '</table>';
            vHtml += '<input type="hidden" id="data_mapping_sender" value="'+ Ext.ucf.htmlEscape(data_mapping_sender) + '" />';
            vHtml += '<input type="hidden" id="data_mapping_sender_type" value="'+ Ext.ucf.htmlEscape(data_mapping_sender_type) + '" />';
            vHtml += '</div>';
            
            return vHtml;
        },

        changeBotIcon: function(file_id, upload_url, csrf_token, webhook_url){
            data = new FormData();
            data.append('input_bot_icon', $('#input_bot_icon')[0].files[0]);
            data.append('file_id', file_id);
            data.append('token', csrf_token);
            $("#input_bot_icon").attr("disabled", "disabled");

            $.ajax({
                url: upload_url,
                type: "POST",
                data: data,
                enctype: 'multipart/form-data',
                processData: false,  // tell jQuery not to process the data
                contentType: false   // tell jQuery not to set contentType
            }).done(function(json_data) {
                var data_key = '';
                if(json_data){
                    data_key = JSON.parse(json_data).data_key;
                    if(data_key){
                        $('#input_bot_icon_key').val(data_key);
                        var tempArr = webhook_url.split('/');
                        // $('#input_bot_photourl').val(tempArr[0] + '//' + tempArr[2] + '/a/' + tempArr[4] + '/picture/boticon/' + data_key);
                        $('#input_bot_photourl').val(_my_site_url + _vurl + 'picture/boticon/' + data_key);
                        (function(){
                            $('#img_bot_icon').attr('src', _vurl + 'picture/boticon/' + data_key + '?uc=n');
                        }).defer(1000);
                        $('#img_bot_icon').attr('src', _vurl + 'picture/boticon/' + data_key + '?uc=n');
                        $('#img_bot_icon').css('display', 'block');
                        $('#input_bot_icon').css('margin-bottom', '30px');
                        $('#img_bot_icon_noupload_msg').css('display', 'none');
                        $("#input_bot_icon").removeAttr("disabled");
                    }
                }
            });
        },
        
        // トリガー設定JSON生成
        createConfigJson: function(){

            // 保存時に画面に存在しないデータを一応保持したまま更新したいので一度退避したものをもとに更新
            var channel_config = typeof(this.channel_config) != 'undefined' ? this.channel_config : {};

            channel_config['data_mapping'] = {
                sender: $('#data_mapping_sender').val()
                ,sender_type: $('#data_mapping_sender_type').val()
            };

            // LINE WORKS API関連設定
            channel_config['open_api_id'] = Ext.getCmp('open_api_id').getValue();
            channel_config['consumer_key'] = Ext.getCmp('consumer_key').getValue();
            channel_config['server_id'] = Ext.getCmp('server_id').getValue();
            channel_config['priv_key'] = Ext.getCmp('priv_key').getValue();
            channel_config['bot_no'] = Ext.getCmp('bot_no')?parseInt(Ext.getCmp('bot_no').getValue()):'';
            channel_config['domain_id'] = Ext.getCmp('domain_id').getValue();
            channel_config['tenant_id'] = Ext.getCmp('tenant_id').getValue();

            return channel_config;
        },

        // 購読をチェックする
        checkLineWorksStatus2: function()
        {
            var handleAfterProcess = function(response){
                if (response.responseText != undefined && response.responseText != '') {
                    var result = jQuery.parseJSON(response.responseText);
                    if(result.code == 0){
                        Ext.getCmp('btnLineWorks').enable();
                    }
                }
            };
            
            var open_api_id = Ext.ucf.getElementValue('open_api_id')
            var consumer_key = Ext.ucf.getElementValue('consumer_key');
            var server_id = Ext.ucf.getElementValue('server_id');
            var priv_key = Ext.ucf.getElementValue('priv_key');
            var bot_no = Ext.ucf.getElementValue('bot_no');
            var domain_id = Ext.ucf.getElementValue('domain_id');
            var tenant_id = Ext.ucf.getElementValue('tenant_id');
            if (!open_api_id || !consumer_key || !server_id || !priv_key || !domain_id || !tenant_id){
                Ext.getCmp('btnLineWorks').disable();
                return;
            }
            var params = {
                open_api_id: open_api_id
                ,consumer_key: consumer_key
                ,server_id: server_id
                ,priv_key: priv_key
                ,bot_no: bot_no
            };

            Ext.Ajax.request({
                url: _vurl + 'lineworksbot/xtgetdetail',
                method: "POST",
                params: params,
                success: handleAfterProcess,
                failure: handleAfterProcess
            });
        },

        // 購読をチェックする
        checkLineWorksStatus: function()
        {
            var handleAfterProcess = function(response){
                if (response.responseText != undefined && response.responseText != '') {
                    var result = jQuery.parseJSON(response.responseText);
                    if(result.code == 0){
                        Ext.getCmp('btnLineWorks').enable();
                    }
                }
            };
            
            var open_api_id = Ext.ucf.getElementValue('open_api_id')
            var consumer_key = Ext.ucf.getElementValue('consumer_key');
            var server_id = Ext.ucf.getElementValue('server_id');
            var priv_key = Ext.ucf.getElementValue('priv_key');
            var bot_no = Ext.ucf.getElementValue('bot_no');
            var domain_id = Ext.ucf.getElementValue('domain_id');
            var tenant_id = Ext.ucf.getElementValue('tenant_id');

            if (!open_api_id || !consumer_key || !server_id || !priv_key || !domain_id || !tenant_id){
                Ext.getCmp('btnLineWorks').disable();
                return;
            }

            if(open_api_id && consumer_key && server_id && priv_key && domain_id && tenant_id){
                if(!bot_no){
                    Ext.getCmp('btnLineWorks').enable();
                }
                else{
                    var params = {
                        open_api_id: open_api_id
                        ,consumer_key: consumer_key
                        ,server_id: server_id
                        ,priv_key: priv_key
                        ,bot_no: bot_no
                    };
        
                    Ext.Ajax.request({
                        url: _vurl + 'lineworksbot/xtgetdetail',
                        method: "POST",
                        params: params,
                        success: handleAfterProcess,
                        failure: handleAfterProcess
                    });

                }
            }
        },

        init: function(){}
    };
}();
