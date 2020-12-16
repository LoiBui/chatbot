
var VALUE_SUCCESS = "SUCCESS";
var VALUE_ERROR = "ERROR";

// AJAX実行中を表すオブジェクト
var _ajax_processing = new Object();

// AJAX実行中チェック（１つでもあるかどうか）
function checkExistAjaxProcessing()
{
	if(_ajax_processing && _ajax_processing.count && _ajax_processing.count > 0)
	{
		return true;
	}
	else
	{
		return false;
	}
}

// AJAX実行中チェック（指定キーの処理に関して）
function checkAjaxProcessing(key)
{
	if(_ajax_processing && _ajax_processing[key] && _ajax_processing[key] == 1)
	{
		return true;
	}
	else
	{
		return false;
	}
}

// AJAX実行中フラグをセット
function setAjaxProcessing(key)
{
	_ajax_processing[key] = 1;
	if(!_ajax_processing.count)
	{
		_ajax_processing.count = 1;
	}
	else
	{
		_ajax_processing.count++;
	}
}

// AJAX実行中フラグをクリア
function clearAjaxProcessing(key)
{
	_ajax_processing[key] = 0;
	if(!_ajax_processing.count)
	{
		_ajax_processing.count = 0;
	}
	else
	{
		_ajax_processing.count--;
	}
}


///////////////////////////////////////////////////
/// AJAX:Requestして結果HTMLを指定IDの箇所にセット
/// 結果がHTMLであることが大前提
/// 終了時デリゲート対応 2009/06/15 T.ASAO
///////////////////////////////////////////////////
function executeSetHtmlAjaxMethodEx(strSetHtmlID, url, strMethod, strPostBody, isCache, isSync, compDelegate)
{
	if(isCache)
	{
     new Ajax.Updater(strSetHtmlID, url, {method:strMethod, postBody:strPostBody, asynchronous:!isSync, onComplete:compDelegate});
	}
	else
	{
		new Ajax.Updater(strSetHtmlID, url, {method:strMethod, postBody:strPostBody, asynchronous:!isSync, onComplete:compDelegate, requestHeaders:['If-Modified-Since','Wed, 15 Nov 1995 00:00:00 GMT']});
	}
}

///////////////////////////////////////////////////
/// AJAX:指定FormのInputデータを配列で取得
/// strPrefix:Postデータを作成するInputのnameの接頭語を指定(空なら全てが対象)
///////////////////////////////////////////////////
function createQueryForPost(frm, strPrefix)
{
	var strPostBody = "";

  var elements = Form.getElements($(frm));
  var queryComponents = new Array();

  for (var i = 0; i < elements.length; i++) {
		
		if(elements[i].name.substring(0, strPrefix.length).toLowerCase() == strPrefix.toLowerCase())
		{
			var queryComponent = Form.Element.serialize(elements[i]);
			if (queryComponent)
			{
				queryComponents.push(queryComponent);
			}
		}
  }

	strPostBody = queryComponents.join('&');
	
	return strPostBody;
}


///////////////////////////////////////////////////
/// AJAX:executeAjaxMethodの結果が正しく取得できれば0. できなければ-1. 
///////////////////////////////////////////////////
function checkAjaxReturnSuccess(httpObj)
{
	if(httpObj.readyState == 4 && httpObj.status == 200)
	{
		return 0;
	}
	if(httpObj.readyState == 4 && httpObj.status == 404)
	{
		return -1;
	}

	return 1;
}

///////////////////////////////////////////////////
/// AJAX:executeAjaxMethodの結果から処理結果コードを取得
///////////////////////////////////////////////////
function getAjaxReturnProcessCode(httpObj)
{
	var strReturn = "";
	var strAjaxResult = httpObj.responseText;
	
	var strResultAry = strAjaxResult.split("\r\n", 3);

	if(strResultAry.length >= 1)
	{
		strReturn = strResultAry[0];
	}
	
	return strReturn;
}

///////////////////////////////////////////////////
/// AJAX:executeAjaxMethodの結果から処理メッセージを取得
///////////////////////////////////////////////////
function getAjaxReturnMessage(httpObj)
{
	var strReturn = "";
	var strAjaxResult = httpObj.responseText;
	
	var strResultAry = strAjaxResult.split("\r\n", 3);
	
	if(strResultAry.length >= 2)
	{
		strReturn = strResultAry[1];
	}
	
	return strReturn;
}

///////////////////////////////////////////////////
/// AJAX:executeAjaxMethodの結果から処理結果を取得
///////////////////////////////////////////////////
function getAjaxReturnResult(httpObj)
{
	var strReturn = "";
	var strAjaxResult = httpObj.responseText;
	
	var strResultAry = strAjaxResult.split("\r\n", 3);
	
	if(strResultAry.length >= 3)
	{
		strReturn = strResultAry[2];
	}
	
	return strReturn;
}
