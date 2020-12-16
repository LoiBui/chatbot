
	var PREFIX_XMLEDITOR = "XMLEDITOR";

	// 詳細、参照画面用
/* 詳細、参照画面ではＡＪＡＸを使わないのでコメントアウト 
	function initXmlEditorDispHtml(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, strTargetXmlData)
	{
		// POSTデータ（テンプレート設定値）を作成
		var strPostBody = makeXmlEditorPostBody(prefix_template_data_key);

		var strQueryKey = 'tid';// QSTRING_CMSTEMPLATE_ID と合わせる
		var strXmlEditorAreaQueryKey = 'xeaid';	// REQUESTKEY_XMLEDITOR_AREAID とあわせる
		var strXmlResultQueryKey = 'xrfn';// REQUESTKEY_XMLRESULT_FIELD_NAME と合わせる
		var strIsXmlEditorQueryKey = 'isxe';// REQUESTKEY_IS_XMLEDITOR と合わせる
		var strIsWithInit = 'iswi';// REQUESTKEY_IS_WITHINIT と合わせる
		var strEditStatusQueryKey = 'xees';// REQUESTKEY_XMLEDITOR_STATUS と合わせる
		var strMethod = 'post';
		var isCache = false;
		var isSync = false;

		// XMLデータをPOSTデータとしてセット 2008/09/09
		if(strPostBody.lastIndexOf(prefix_template_data_key) <= 0)
		{
			strPostBody += "&";
		}
		var strValue = escape(strTargetXmlData);
		strPostBody += strXmlResultFieldName + "=" + strValue;

		var strUrl = strXmlEditorAjaxDirUrl + 'create_xmleditor_html.aspx?' + strQueryKey + '=' + escape(strTemplateID) + '&' + strXmlEditorAreaQueryKey + '=' + escape(strXmlEditorAreaID) + '&' + strXmlResultQueryKey + '=' + escape(strXmlResultFieldName) + '&' + strIsXmlEditorQueryKey + '=true&' + strIsWithInit + '=true&' + strEditStatusQueryKey + '=CONFIRM';

		executeSetHtmlAjaxMethod(strXmlEditorAreaID, strUrl, strMethod, strPostBody, isCache, isSync);


	}
*/

	// 画面表示時の初期設定用
	function initXmlEditorInputHtml(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, strTargetXmlData)
	{
		if(checkAjaxProcessing(PREFIX_XMLEDITOR + strXmlResultFieldName))
		{
			return;
		}

		// POSTデータ（テンプレート設定値）を作成
		var strPostBody = makeXmlEditorPostBody(prefix_template_data_key);

		var strQueryKey = 'tid';// QSTRING_CMSTEMPLATE_ID と合わせる
		var strXmlEditorAreaQueryKey = 'xeaid';	// REQUESTKEY_XMLEDITOR_AREAID とあわせる
		var strXmlResultQueryKey = 'xrfn';// REQUESTKEY_XMLRESULT_FIELD_NAME と合わせる
		var strIsXmlEditorQueryKey = 'isxe';// REQUESTKEY_IS_XMLEDITOR と合わせる
		var strIsWithInit = 'iswi';// REQUESTKEY_IS_WITHINIT と合わせる
		var strMethod = 'post';
		var isCache = false;
		var isSync = false;

		// XMLデータをPOSTデータとしてセット 2008/09/09
		if(strPostBody.lastIndexOf(prefix_template_data_key) <= 0)
		{
			strPostBody += "&";
		}
		var strValue = escape(strTargetXmlData);
		strPostBody += strXmlResultFieldName + "=" + strValue;

		var strUrl = strXmlEditorAjaxDirUrl + 'create_xmleditor_html.aspx?' + strQueryKey + '=' + escape(strTemplateID) + '&' + strXmlEditorAreaQueryKey + '=' + escape(strXmlEditorAreaID) + '&' + strXmlResultQueryKey + '=' + escape(strXmlResultFieldName) + '&' + strIsXmlEditorQueryKey + '=true&' + strIsWithInit + '=true';

		setAjaxProcessing(PREFIX_XMLEDITOR + strXmlResultFieldName);
		executeSetHtmlAjaxMethodEx(strXmlEditorAreaID, strUrl, strMethod, strPostBody, isCache, isSync, function(){clearAjaxProcessing(PREFIX_XMLEDITOR + strXmlResultFieldName);});


	}
	
	// 新規作成 2006/04/04 T.ASAO
	// 入力エリアをそのまま更新
	function refleshXmlEditorInputArea(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, strFldNameProcessingFlag, strIdleValue, strProcessingValue)
	{
		var fldIdleFlag = document.getElementsByName(strFldNameProcessingFlag + strXmlResultFieldName)[0];
		if(fldIdleFlag.value == strIdleValue)
		{
			// 連打防止のため、処理中フラグをセット
			fldIdleFlag.value = strProcessingValue;
	
			// AJAXにてテンプレート設問エリアを更新
			createXmlEditorInputHtml(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, true);
		}
		else
		{
			showErrorMessage("...処理中です.しばらくたってから再度実行して下さい。");
		}
	}
	

	// 入力エリアを１つ増やす
	function addXmlEditorInputArea(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, strCntFieldName, strFldNameProcessingFlag, strIdleValue, strProcessingValue)
	{
		var fldIdleFlag = document.getElementsByName(strFldNameProcessingFlag + strXmlResultFieldName)[0];

		if(fldIdleFlag.value == strIdleValue)
		{
			// 連打防止のため、処理中フラグをセット
			fldIdleFlag.value = strProcessingValue;
			
			// IDX追加
			var intCnt = document.getElementsByName(strCntFieldName)[0].value;
			if(intCnt == "")
			{
				intCnt = 1;
			}
			document.getElementsByName(strCntFieldName)[0].value = (intCnt - 0) + 1;
			
			// AJAXにてテンプレート設問エリアを更新
			createXmlEditorInputHtml(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, true);
		}
		else
		{
			showErrorMessage("...処理中です.しばらくたってから再度実行して下さい。");
		}
	}
	
	// 入力エリアを１つ減らす
	function delXmlEditorInputArea(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, strIdxFieldName, strFldNameProcessingFlag, strIdleValue, strProcessingValue)
	{
		var fldIdleFlag = document.getElementsByName(strFldNameProcessingFlag + strXmlResultFieldName)[0];
		
		if(fldIdleFlag.value == strIdleValue)
		{
			// 連打防止のため、処理中フラグをセット
			fldIdleFlag.value = strProcessingValue;
			
			// IDX減らす
			var idx = document.getElementsByName(strIdxFieldName)[0].value;
			if(idx == "")
			{
				idx = 1;
			}
			document.getElementsByName(strIdxFieldName)[0].value = (idx - 0) - 1;
			
			// AJAXにてテンプレート設問エリアを更新
			createXmlEditorInputHtml(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, true);
		}
		else
		{
			showErrorMessage("...処理中です.しばらくたってから再度実行して下さい。");
		}
	}
	
	// CMSテンプレート入力エリアのPOSTデータの生成
	function makeXmlEditorPostBody(prefix_template_data_key)
	{
		var strPostBody = "";
/* なにやら2バイト文字がばけるので
		var frm = document.getElementsByName('frmEdit')[0];

		strPostBody = createQueryForPost(frm, prefix_template_data_key);
*/


		// INPUTタグ
		{
			var target = document.getElementsByTagName("INPUT");
			for(i = 0; i < target.length; i++)
			{
				var field = target[i];				

				if(field.name.indexOf(prefix_template_data_key, 0) == 0)
				{
					switch(field.type)
					{
						case "hidden":
						case "text":
						case "password":
						{
							var strValue = escape(field.value);
							strPostBody += field.name + "=" + strValue + "&";
						}
							break;
						case "checkbox":
						{
							var strValue = '';
							if(field.checked)
							{
								strValue = escape(field.value);
							}

							strPostBody += field.name + "=" + strValue + "&";
						}
							break;
						case "radio":
						{
							if(field.checked)
							{
								var strValue = escape(field.value);
								strPostBody += field.name + "=" + strValue + "&";
							}
						}
							break;
					}
				}
			}			
		}
		
		// SELECTタグ
		{
			var target = document.getElementsByTagName("SELECT");
			for(i = 0; i < target.length; i++)
			{
				var field = target[i];				
		
				if(field.name.indexOf(prefix_template_data_key, 0) == 0)
				{
					var strValue = escape(field.value);
					strPostBody += field.name + "=" + strValue + "&";
				}
			}			
		}
		
		// TEXTAREAタグ
		{
			var target = document.getElementsByTagName("TEXTAREA");
			for(i = 0; i < target.length; i++)
			{
				var field = target[i];				
		
				if(field.name.indexOf(prefix_template_data_key, 0) == 0)
				{
					var strValue = escape(field.value);
					strPostBody += field.name + "=" + strValue + "&";
				}
			}			
		}
		
		//TODO strPostBodyが空でないときは、最後の&を削るべきかもしれないけど影響なさそうなので放置. 2006/04/06 T.ASAO
		
		return strPostBody;
	}

	// 選択されたテンプレート用の設問ＨＴＭＬを作成
	function createXmlEditorInputHtml(strXmlEditorAjaxDirUrl, strXmlEditorAreaID, strXmlResultFieldName, strTemplateID, prefix_template_data_key, isWithXmlEditor)
	{
		if(checkAjaxProcessing(PREFIX_XMLEDITOR + strXmlResultFieldName))
		{
			return;
		}

		// POSTデータ（テンプレート設定値）を作成
		var strPostBody = makeXmlEditorPostBody(prefix_template_data_key);
		
		var strQueryKey = 'tid';// QSTRING_CMSTEMPLATE_ID と合わせる
		var strXmlEditorAreaQueryKey = 'xeaid';	// REQUESTKEY_XMLEDITOR_AREAID とあわせる
		var strXmlResultQueryKey = 'xrfn';// REQUESTKEY_XMLRESULT_FIELD_NAME と合わせる
		var strIsXmlEditorQueryKey = 'isxe';// REQUESTKEY_IS_XMLEDITOR と合わせる
		var strMethod = 'post';
		var isCache = false;
		var isSync = false;

		var strUrl = strXmlEditorAjaxDirUrl + 'create_xmleditor_html.aspx?' + strQueryKey + '=' + escape(strTemplateID) + '&' + strXmlEditorAreaQueryKey + '=' + escape(strXmlEditorAreaID) + '&' + strXmlResultQueryKey + '=' + escape(strXmlResultFieldName) + '&' + strIsXmlEditorQueryKey + '=' + escape(isWithXmlEditor);


		setAjaxProcessing(PREFIX_XMLEDITOR + strXmlResultFieldName);
		executeSetHtmlAjaxMethodEx(strXmlEditorAreaID, strUrl, strMethod, strPostBody, isCache, isSync, function(){clearAjaxProcessing(PREFIX_XMLEDITOR + strXmlResultFieldName);});


	}
	
	function changeContentsBodyArea(strDispFlag, strXmlEditorAreaID)
	{

		if(strDispFlag == "ON")
		{
			document.getElementById(strXmlEditorAreaID).style.display = 'inline';
		}
		else
		{
			document.getElementById(strXmlEditorAreaID).style.display = 'none';
		}
	}
	
