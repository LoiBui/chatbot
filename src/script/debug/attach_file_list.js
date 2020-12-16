(function () {

    AttachFile = {

        /**
         * requestCheckAttachFileExist
         *
         * @param {string} aDocId
         * @param {string} aFileIds
         * @param {function} callback
         * @param {number} aNumRetry
         */
        requestCheckAttachFileExist: function (aDocId, aFileIds, callback, aNumRetry) {
             AttachFile._requestCheckAttachFileExist(aDocId, aFileIds, callback, aNumRetry);
        },

        /**
         * _requestCheckAttachFileExistOid
         *
         * @param {string} aDocId
         * @param {string} aFileIds
         * @param {function} callback
         * @param {number} aNumRetry
         */
        _requestCheckAttachFileExist: function (aDocId, aFileIds, callback, aNumRetry) {
            if (aFileIds.length == 0) {
                callback({
                    status: 'ok'
                });
                return;
            }

            if (typeof(aNumRetry) == 'undefined') {
                // 読込中メッセージを表示
                SateraitoUI.showLoadingMessage();
                aNumRetry = 1;
            }

            AppsUser.getAccessToken(function (token) {
              var postData = {
                doc_id: aDocId,
                file_ids: Ext.encode(aFileIds),
                token: token
              };

              Ext.Ajax.request({
                url: _vurl + 'form/build/checkattachfileexist',
                method: 'POST',
                params: postData,
                success: function (response, options) {
                  var jsondata = Ext.decode(response.responseText);

                  // 読込中メッセージを消去
                  SateraitoUI.clearMessage();

                  // コールバックをキック
                  callback(jsondata);
                },
                failure: function () {
                  // 失敗時
                  Sateraito.Util.console('retrying ' + aNumRetry);

                  if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

                    // リトライ
                    AttachFile._requestCheckAttachFileExistOid(aDocId, aFileIds, callback, (aNumRetry + 1));

                  } else {

                    // １０回リトライしたがだめだった
                    // 読込中メッセージを消去
                    SateraitoUI.clearMessage();

                    callback({
                      status: 'ng'
                    });
                    return;
                  }
                }
              });
            });
        },

        /**
         * bindDownloadAttachedFileLink
         *
         * ダウンロードリンクのイベントハンドラを定義
         */
        bindDownloadAttachedFileLink: function () {
//			$('.download_attached_file').live('click', function(){
            $(document).on('click', '.download_attached_file', function () {

                var element = this;

                var fileId = $(element).attr('file_id');

                if (Ext.ucf.Util.isSmartPhone()) {
                    var downloadUrl = '';
                    downloadUrl += _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/downloadattachedfile';
                    downloadUrl += '?file_id=' + encodeURIComponent(fileId);
                    window.open(downloadUrl);
                } else {
                    var downloadUrl = '';
                    downloadUrl += _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/downloadattachedfile';
                    downloadUrl += '?file_id=' + encodeURIComponent(fileId);
                    //          downloadUrl += '&token=' + encodeURIComponent(USER_TOKEN);
                    if ($('#dummy_frame').size() == 0) {
                        //$('body').append('<iframe id="dummy_frame" style="width:0px;height:0px;display:none;"></iframe>');
                        $('body').append('<iframe id="dummy_frame" style="width: 100%;height: 35px;display: block;border: none;position: relative;"></iframe>');
                    }
                    $('#dummy_frame').attr('src', downloadUrl);
                }
            });
        },

        /**
         * isImageFile
         *
         * ファイル名の拡張子から画像ファイルかどうかを判断する
         *
         * @param {string} aFileName
         * @return {boolean} true ... 画像ファイルである
         */
        isImageFile: function (aFileName) {
            var fileNameSplited = aFileName.split('.');
            if (fileNameSplited.length >= 2) {
                var extension = fileNameSplited[(fileNameSplited.length - 1)].toLowerCase();
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'bmp') {
                    return true;
                }
            }
            return false;
        },

        /**
         * getImgFileNameByAttachedFileName
         *
         * 添付ファイルの埋め込みリンクのアイコンファイル名を返す
         *
         * @param {string} aFileName
         * @return {string} 画像ファイル名
         */
        getImgFileNameByAttachedFileName: function (aFileName) {
            var fileNameSplited = aFileName.split('.');
            if (fileNameSplited.length >= 2) {
                var extension = fileNameSplited[(fileNameSplited.length - 1)].toLowerCase();
                if (extension == 'png' || extension == 'jpg' || extension == 'jpeg' || extension == 'gif' || extension == 'bmp') {
                    return 'image.png';
                }
                if (extension == 'doc' || extension == 'pdf' || extension == 'ppt' || extension == 'xls') {
                    return extension + '.png'
                }
                if (extension == 'docx') {
                    return 'doc.png';
                }
                if (extension == 'xlsx') {
                    return 'xls.png';
                }
                if (extension == 'pptx') {
                    return 'ppt.png';
                }
                if (extension == 'csv') {
                    return 'xls.png';
                }
                if (extension == 'zip') {
                    return 'folder.png';
                }
                if (extension == 'lzh') {
                    return 'folder.png';
                }
            }

            return 'file.png';
        },

        /**
         * getFileLinkHtml
         *
         * リッチテキスト埋め込み用の添付ファイルリンクhtmlを返す
         *
         * @param {object} attachedFile ... 添付ファイルを示すオブジェクト
         * @return {string}
         */
        getFileLinkHtml: function (attachedFile) {
            var clipText = '';
            clipText += '<span class="Apple-tab-span" style="white-space:pre">	</span>';
            clipText += '<img class="download_attached_file"';
            clipText += ' file_id="' + encodeURIComponent(attachedFile.file_id) + '"';
            // FireFox用にhrefでファイルIDを埋め込む
            clipText += ' href="' + _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/downloadattachedfile?file_id=' + encodeURIComponent(attachedFile.file_id) + '"';
            clipText += ' src="' + SATERAITO_MY_SITE_URL + '/images/file_icon/32/' + AttachFile.getImgFileNameByAttachedFileName(attachedFile.file_name) + '">';
            clipText += '<span class="download_attached_file"';
            clipText += ' file_id="' + encodeURIComponent(attachedFile.file_id) + '"';
            // FireFox用にsrcでファイルIDを埋め込む
            clipText += ' src="' + _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/downloadattachedfile?file_id=' + encodeURIComponent(attachedFile.file_id) + '"';
            clipText += ' style="text-decoration:underline;cursor:pointer;color:blue;">';
            clipText += Ext.ucf.Util.escapeHtml(attachedFile.file_name);
            clipText += '</span>';
            clipText += '&nbsp;';
            clipText += '<br /><br />';
            return clipText;
        },

        /**
         * getInlinePictureHtml
         *
         * 添付画像ファイルのリッチテキスト内表示用html文を返す
         *
         * @param {object} attachedFile ... 添付ファイルを示すオブジェクト
         * @return {string}
         */
        getInlinePictureHtml: function (attachedFile) {
            var clipImgText = '';
            clipImgText += '<img class="inline_img"';
            clipImgText += ' file_id="' + attachedFile.file_id + '"';
            clipImgText += ' src="' + _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/getinlinepicturefile';
            clipImgText += '?file_id=' + encodeURIComponent(attachedFile.file_id) + '&token=' + USER_TOKEN + '" />';
            return clipImgText;
        },

        /**
         * getAttachFileDirectUrl
         *
         * 添付ファイルを直接開くURLを返す
         *
         * @param {object} attachedFile ... 添付ファイルを示すオブジェクト
         * @return {string}
         */
        getAttachFileDirectUrl: function (attachedFile) {
            var clipDirectLinkUrlText = '';
            clipDirectLinkUrlText += _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/downloadattachedfile';
            clipDirectLinkUrlText += '?file_id=' + encodeURIComponent(attachedFile.file_id);
            clipDirectLinkUrlText += '&show_in_browser=1';
            return clipDirectLinkUrlText;
        },

        /**
         * requestAttachedFileList
         *
         * @param {Function} callback
         * @param {number} aNumRetry
         */
        requestAttachedFileList: function (callback, aNumRetry) {
            if (typeof(aNumRetry) == 'undefined') {
                aNumRetry = 1;
            }

            AppsUser.getAccessToken(function (token) {
              // is_openid_modeがTrueの場合は、全画面状態で申請書を開いている状態
              // is_openid_modeがFalseの場合は、ガジェット内で申請書を開いている状態 --> トークンによるアクセス制御状態
              var url = _vurl + 'form/build/getattachedfilelist?doc_id=' + DOC_ID + '&token=' + token;

              Ext.Ajax.request({
                url: url,
                method: 'GET',
                timeout: 1000 * 120,		// 120秒
                success: function (response, options) {
                  // 成功時
                  var jsondata = Ext.decode(response.responseText);

                  callback(jsondata.file_list);
                },
                failure: function () {
                  // 失敗時
                  if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
                    AttachFile.requestAttachedFileList(callback, (aNumRetry + 1));
                  } else {
                    // １０回リトライしてもだめだった
                  }
                }
              });
            });
        },

        /**
         * requestDropFileUpload
         *
         * 一つのファイルをドラッグ＆ドロップアップロード
         *
         * @param {string} fileName
         * @param {string} progressId ... アップロードの経過を表示する領域のID
         * @param {Object} formData ... 送信するフォームデータ
         * @param {function} callback ... アップロード終了時にキック、第一引数＝正常終了したか（boolean）、第二引数＝（エラー）メッセージ
         */
        requestDropFileUpload: function (fileName, progressId, formData, callback) {
            // アップロードURLを取得
            AttachFile.requestUploadUrl(function (aUploadUrl) {
                // アップロード実行
                AttachFile._requestDropFileUpload(fileName, progressId, formData, aUploadUrl, callback)
            });
        },

        /**
         * _requestDropFileUpload
         *
         * 一つのファイルをアップロード
         *
         * @param {string} fileName
         * @param {string} progressId ... アップロードの経過を表示する領域のID
         * @param {Object} formData ... 送信するフォームデータ
         * @param {string} aUploadUrl ... アップロード先URL
         * @param {function} callback ... アップロード終了時にキック、第一引数＝正常終了したか（boolean）、第二引数＝（エラー）メッセージ
         */
        _requestDropFileUpload: function (fileName, progressId, formData, aUploadUrl, callback) {
            var xhr;
            if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                xhr = new XMLHttpRequest();
            }
            else { // code for IE6, IE5
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xhr.open('POST', aUploadUrl);
            xhr.onload = function () {
            };

            xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                    var complete = (event.loaded / event.total * 100 | 0);
                    var progress = document.getElementById(progressId);
                    progress.textContent = fileName + MyLang.getMsg('DOC_FILE_UPLOAD_DROP3') + complete + MyLang.getMsg('DOC_FILE_UPLOAD_DROP4');
                }
            };

            function error(e) {
                // 失敗時
                //alert('添付ファイルのアップロード中にエラーが発生しました');
                try {
                    callback(false, fileName + ': ' + MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR3'));
                } catch (e) {
                }
            }

            function loadEnd(e) {
                var progress = document.getElementById(progressId);
                if (progress && progress != undefined) {
                    progress.textContent = fileName + MyLang.getMsg('DOC_FILE_UPLOAD_DROP3') + '100' + MyLang.getMsg('DOC_FILE_UPLOAD_DROP4');
                }
            }

            /*this.xhr.addEventListener('loadstart', this.relayXHREvent.createDelegate(this), false);
             this.xhr.addEventListener('progress', this.relayXHREvent.createDelegate(this), false);
             this.xhr.addEventListener('progressabort', this.relayXHREvent.createDelegate(this), false);
             this.xhr.addEventListener('error', this.relayXHREvent.createDelegate(this), false);
             this.xhr.addEventListener('load', this.relayXHREvent.createDelegate(this), false);*/
            xhr.addEventListener('loadend', loadEnd, false);
            xhr.addEventListener('error', error, false);

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // 成功時
                    if (xhr.responseText == 'status=ok') {
                        var progress = document.getElementById(progressId);
                        if (progress && progress != undefined) {
                            progress.textContent = fileName + MyLang.getMsg('DOC_FILE_UPLOAD_DROP3') + '100' + MyLang.getMsg('DOC_FILE_UPLOAD_DROP4');
                        }
                        //alert('ファイルを添付しました');
                        $('input[name=attach_file]').val(null);
                        callback(true, fileName + ': ' + MyLang.getMsg('DOC_FILE_ATTACHMENT_MSG3'));

                    } else if (xhr.responseText == 'status=too_big') {
                        //alert('添付ファイルのサイズが大きすぎたため、添付ができませんでした。');
                        callback(false, fileName + ': ' + MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR1'));

                    } else if (xhr.responseText == 'status=mime_type_is_not_access') {
                        //alert('添付ファイルのサイズが大きすぎたため、添付ができませんでした。');
                        callback(false, fileName + ': ' + MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR4'));

                    } else {
                        //alert('添付ファイルのアップロード中にエラーが発生しました。時間をおいてから再度お試し下さい。');
                        callback(false, fileName + ': ' + MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR2'));
                    }
                    return;
                }
            };
            xhr.send(formData);

        },
        /**
         * requestUploadUrl
         *
         * アップロード用URLを取得
         *
         * @param {function} callback
         */
        requestUploadUrl: function (callback) {
          AppsUser.getAccessToken(function (token) {
            Ext.Ajax.request({
              method: 'GET',
              url: _vurl + 'form/build/getattachuploadurl?token=' + token,
              timeout: 1000 * 120,		// 120秒
              success: function (response, options) {
                // 成功時

                var jsondata = Ext.decode(response.responseText);

                callback(jsondata.upload_url);
              },
              failure: function () {
                // 失敗時
                alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR3'));
                callback(null);
              }
            });
          });
        },
        /**
         * requestDeleteFile
         *
         * @param {string} aFileId
         * @param {Function} callback
         */
        requestDeleteFile: function (aFileId, callback) {
            // ファイルの削除は、ガジェット内で新規申請書を開いている状態 --> トークンによるアクセス制御状態

          AppsUser.getAccessToken(function (token) {
            var postParams = {
              'token': token,
              'file_id': aFileId,
              'doc_id': DOC_ID
            };

            // ファイルアップロードをリクエスト
            Ext.Ajax.request({
              params: postParams,
              url: _vurl + 'form/build/deletefile',
              method: 'POST',
              timeout: 1000 * 120,		// 120秒
              success: function (response, options) {
                // 成功時
                var jsondata = Ext.decode(response.responseText);
                if (jsondata.status == 'ok') {

                  alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_DELETE'));
                  $('input[name=attach_file]').val(null);
                  callback(true);

                } else {
                  alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_DELETE_ERR1'));
                  callback(false);
                }

              },
              failure: function () {
                // 失敗時

                alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_DELETE_ERR2'));
                callback(false);
              }
            });
          });
        },

        /**
         * isDocumentFile
         *
         * ファイル名の拡張子から画像ファイルかどうかを判断する
         *
         * @param {string} aFileName
         * @return {boolean} true ... 画像ファイルである
         */
        isDocumentFile: function (aFileName) {
            var fileNameSplited = aFileName.split('.');
            if (fileNameSplited.length >= 2) {
                var extension = fileNameSplited[(fileNameSplited.length - 1)].toLowerCase();

                if (extension == 'txt' || extension == 'doc' || extension == 'pdf' || extension == 'ppt' || extension == 'xls') {
                    return true;
                }
                if (extension == 'docx') {
                    return true;
                }
                if (extension == 'xlsx') {
                    return true;
                }
                if (extension == 'pptx') {
                    return true;
                }
                if (extension == 'csv') {
                    return true;
                }
            }
            return false;
        },

        /**
         * showList
         *
         * 添付ファイル一覧を取得し、表示する
         */
        showList: function () {
            // ファイル一覧描画エリアをいったんクリア
            $('#attached_file_render_area').html('<table></table>');


            // このドキュメントに添付されているファイルを一覧表示
            AttachFile.requestAttachedFileList(function (aJsonData) {
                Ext.each(aJsonData, function () {
                    var attachedFile = this;

                    var vHtml = '';
                    vHtml += '<tr>';
                    vHtml += '<td style="padding-left:5px; padding-right:5px;">';

                    if (IS_OPENID_MODE) {
                        vHtml += '<a href="' + _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/downloadattachedfile?file_id=' + attachedFile.file_id + '&doc_id=' + DOC_ID + '">';
                        vHtml += attachedFile.file_name;
                        vHtml += '</a>';
                    } else {
                        vHtml += '<span class="download_attached_file link_cmd" file_id="' + attachedFile.file_id + '">';
                        vHtml += Ext.ucf.Util.escapeHtml(attachedFile.file_name);
                        vHtml += '</span>';
                    }
                    vHtml += '&nbsp;&nbsp;<img title="' + MyLang.getMsg('PREVIEW_ON_GOOGLE_DRIVE') + '" onclick="Ext.ucf.FormData.util.openGoogleDocViewer(this);" file_id="' + attachedFile.file_id + '"  src="' + SATERAITO_MY_SITE_URL + '/images/preview.gif" style="width:15px;height:15px; vertical-align: bottom;" class="info" >';
                    //vHtml += attachedFile.file_name;
                    //vHtml += '</a>';
                    vHtml += '</td>';
                    vHtml += '<td style="padding-left:5px; padding-right:5px;">';
                    if (IS_EDITABLE) {
                        vHtml += '<button class="btn_delete_file" file_id="' + attachedFile.file_id + '">' + MyLang.getMsg('DELETE') + '</button>';
                    }
                    vHtml += '</td>';

                    // ファイルへのリンクをコピー
                    if (IS_EDITABLE) {
                        vHtml += '<td style="padding-left:5px; padding-right:5px;">';
                        vHtml += '<div id="copy_file_link_container_' + attachedFile.file_id + '" style="position:relative;">';
                        vHtml += '<div id="copy_file_link_' + attachedFile.file_id + '" style="font-size:12px;">';
                        vHtml += MyLang.getMsg('DOC_FILE_ATTACHMENT_LINK1') + '</div></div>',
                            vHtml += '</td>';
                    }

                    // 画像ファイルの場合、ドキュメント内に直接画像を表示するリンクコピーも表示する
                    var needInlineImgLink = false;
                    if (AttachFile.isImageFile(attachedFile.file_name)) {
                        if (IS_EDITABLE) {
                            needInlineImgLink = true;
                        }
                    }
                    if (needInlineImgLink) {
//                        vHtml += '<td style="padding-left:5px; padding-right:5px;">';
//                        vHtml += '<div id="copy_img_file_link_container_' + attachedFile.file_id + '" style="position:relative;">';
//                        vHtml += '<div id="copy_img_file_link_' + attachedFile.file_id + '" style="font-size:12px;">';
//                        vHtml += MyLang.getMsg('DOC_FILE_ATTACHMENT_LINK2') + '</div></div>',
//                            vHtml += '</td>';
                    }

                    var fileNameSplited = ('' + attachedFile.file_name).split('.');
                    var isPdf = '0';
                    if (fileNameSplited[fileNameSplited.length - 1].toLowerCase() == 'pdf') {
                        isPdf = '1';
                    }

                    vHtml += '</tr>';

                    // ファイル情報を表示
                    $('#attached_file_render_area').find('table').append(vHtml);

                    if (IS_EDITABLE) {
                        if (Ext.ucf.Util.isBrowserToUseClipboardApi()) {
                            // Chromeの場合：ZeroClipboardをつかわないでクリップボードにセット

                            // ファイルへのリンクをコピー処理
                            $('#copy_file_link_' + attachedFile.file_id).css('cursor', 'pointer');
                            $('#copy_file_link_' + attachedFile.file_id).on('click', function () {

                                Ext.ucf.Util.setClipboardValue('text/html', AttachFile.getFileLinkHtml(attachedFile), function () {
                                    alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_LINK3'));
                                });
                            });

                            // 画像ファイルのリッチテキスト内表示リンクをコピー処理
                            if (needInlineImgLink) {
                                $('#copy_img_file_link_' + attachedFile.file_id).css('cursor', 'pointer');
                                $('#copy_img_file_link_' + attachedFile.file_id).on('click', function () {

                                    Ext.ucf.Util.setClipboardValue('text/html', AttachFile.getInlinePictureHtml(attachedFile), function () {
                                        alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_LINK4'));
                                    });
                                });
                            }

                        } else {
                            // ファイルへのリンクをコピー処理
                            var clip = new ZeroClipboard.Client();
                            clip.setHandCursor(true);
                            clip.addEventListener('mouseover', function (client) {
                                var clipText = '';
                                clipText += '<span class="Apple-tab-span" style="white-space:pre">	</span>';
                                clipText += '<img class="download_attached_file" file_id="' + attachedFile.file_id + '" src="' + SATERAITO_MY_SITE_URL + '/images/file_icon/32/' + AttachFile.getImgFileNameByAttachedFileName(attachedFile.file_name) + '">';
                                clipText += '<span class="download_attached_file" file_id="' + attachedFile.file_id + '" style="text-decoration:underline;cursor:pointer;color:blue;">';
                                clipText += Ext.ucf.Util.escapeHtml(attachedFile.file_name);
                                clipText += '</span>';
                                clip.setText(clipText);
                            });
                            clip.addEventListener('complete', function () {
                                alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_LINK3'));
                            });
                            clip.glue('copy_file_link_' + attachedFile.file_id, 'copy_file_link_container_' + attachedFile.file_id);

                            if (needInlineImgLink) {
                                // 画像ファイルのリッチテキスト内表示リンクをコピー処理
                                var clip1 = new ZeroClipboard.Client();
                                clip1.setHandCursor(true);
                                clip1.addEventListener('mouseover', function (client) {
                                    var clipText = '';
                                    clipText += '<img class="inline_img" file_id="' + attachedFile.file_id + '" src="' + _vurl + 'form/build/' + FORM_TEMPLATE_ID + '/downloadattachedfile?file_id=' + attachedFile.file_id + '&token=' + USER_TOKEN + '" />';
                                    clip1.setText(clipText);
                                });
                                clip1.addEventListener('complete', function () {
                                    alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_LINK4'));
                                });
                                clip1.glue('copy_img_file_link_' + attachedFile.file_id, 'copy_img_file_link_container_' + attachedFile.file_id);
                            }
                        }
                    }
                });
            });
        }
    };

    Importer = {

        /**
         * requestUploadUrl
         *
         * @param {function} callback
         */
        requestUploadUrl: function (callback) {
            AppsUser.getAccessToken(function (token) {
              Ext.Ajax.request({
                method: 'GET',
                url: _vurl + 'form/build/getattachuploadurl?token=' + token,
                timeout: 1000 * 120,		// 120秒
                success: function (response, options) {
                  // 成功時

                  var jsondata = Ext.decode(response.responseText);

                  callback(jsondata.upload_url);
                },
                failure: function () {
                  // 失敗時
                  alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR3'));
                  callback(null);
                }
              });
            });
        },

        /**
         * requestCommentUploadUrl
         *
         * @param {function} callback
         */
        requestCommentUploadUrl: function (callback) {
            AppsUser.getAccessToken(function (token) {
              Ext.Ajax.request({
                method: 'GET',
                url: _vurl + 'form/build/getattachuploadurlcomment?token=' + token,
                timeout: 1000 * 120,		// 120秒
                success: function (response, options) {
                  // 成功時

                  var jsondata = Ext.decode(response.responseText);

                  callback(jsondata.upload_url);
                },
                failure: function () {
                  // 失敗時
                  alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR3'));
                  callback(null);
                }
              });
            });
        },

        /**
         * requestAttachFileImport
         *
         * @param {function} callback
         */
        requestAttachFileImport: function (callback) {
            // トークンをセット
            $('#file_upload_form').find('input[name=token]').val(USER_TOKEN);

            // ドキュメントIDをセット
            $('#file_upload_form').find('input[name=doc_id]').val(DOC_ID);

            // アップロード実行
            Ext.Ajax.request({
                method: 'POST',
                form: 'file_upload_form',
                timeout: 1000 * 120,		// 120秒
                success: function (response, options) {
                    // 成功時

                    if (response.responseText == 'status=ok') {
                        // 正常終了
                        $('input[name=attach_file]').val(null);
                        callback(true);
                    } else if (response.responseText == 'status=too_big') {
                        alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR1'));
                        callback(false);
                    } else if (response.responseText == 'status=mime_type_is_not_access') {
                        alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR4'));
                        callback(false);
                    } else {
                        alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR2'));
                        callback(false);
                    }

                },
                failure: function () {
                    // 失敗時

                    alert(MyLang.getMsg('DOC_FILE_ATTACHMENT_ERR3'));
                    callback();
                }
            });
        }
    };

    LoginMgr = {

        /**
         * getViewerEmail
         *
         * @return {string}
         */
        getViewerEmail: function () {
            return '';
        }
    }

})();
