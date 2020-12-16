
// 折りたたみ
function showErrorMessage(strMessage)
{
	alert('[ERROR]' + strMessage);
}

function exMenu(sName)
{
	sMenu = document.getElementsByName(sName)[0].style;
	if (sMenu.display == 'none')
	{
		sMenu.display = "block"; 
	}
	else
	{
		sMenu.display = "none";
	}
}

//別ウインドウ表示
function WindowOpen(path)
{
	window.open(path,'alert',
	'width=400,height=250,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no');
}								

//別ウインドウ表示2
function WindowOpen2(path, width, height)
{
	window.open(path,'alert',
	'width=' + width + ',height=' + height + ',toolbar=yes,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
}								

//クッキー値を取得
function getCookie(name) {
  var start = document.cookie.indexOf(name + '=');
  var len = start + name.length + 1;
  if((!start) && (name != document.cookie.substring(0,name.length)))
  {
    return null;
  }
  
  if(start == -1)
  {
    return null;
  }
  
  var end = document.cookie.indexOf(';',len);
  if(end == -1)
  {
		end = document.cookie.length;
	}
	
  if(end == start){
  	return '';
  }
  return unescape(document.cookie.substring(len,end));
}

function setCookie(name, value, expires, path, domain, secure) 
{
	var today = new Date();
	today.setTime(today.getTime());

	if(expires)
	{
		expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );

	document.cookie = name + "=" +escape( value ) +
	( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) + 
	( ( path ) ? ";path=" + path : "" ) + 
	( ( domain ) ? ";domain=" + domain : "" ) +
	( ( secure ) ? ";secure" : "" );

}

function delCookie(name, path, domain) {
  if (Get_Cookie(name))
  {
    document.cookie = name + '=' + ((path) ? ';path=' + path : '') + ((domain) ? ';domain=' + domain : '') + ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
  }
}


function logout()
{
	location.href = '/xt/logout';
}

// 戻るボタン対応
function sendToBack()
{
	document.getElementsByName('frmBack')[0].submit();
}

// 言語選択プルダウンの設定
function createLanguageSelectBox(element_id, language_list, selected_value, is_disp_default, is_post, onChangeHandler)
{
	var element = $('#' + element_id);
	if(typeof(element) == 'undefined'){
		return;
	}
	// 選択肢を初期化
	element.html('');
	if(is_disp_default){
		element.append('<option value="" >' + _msg.SELECT_LANGUAGE + '</option>');
	}
	for(var i = 0; i < language_list.length; i++){
		var item = language_list[i];
		//element.append('<option value="' + item[0] + '" ' + (selected_value == item[0] ? 'selected' : '') + ' >' + item[1] + '</option>');
		element.append('<option value="' + item[0] + '" >' + item[1] + '</option>');
	}
	// 
	if(is_disp_default){
		var hl_from_cookie = getCookie('hl');
		if(typeof(hl_from_cookie) != 'undefined' && hl_from_cookie != ''){
			$(element).val(hl_from_cookie);
		}
	}else{
		$(element).val(selected_value);
	}

	// post時でonChangeHandlerが定義されていない場合は選択不可にする
	if(is_post && typeof(onChangeHandler) == 'undefined'){
		$(element).attr('disabled', 'disabled');
	}

	// 選択変更時のイベントハンドラ
	$(element).change(function(){
		var value = $(element).val();
		setCookie('hl', value, 3650, '/');
		if(typeof(onChangeHandler) != 'undefined'){
			onChangeHandler();
		}else{
			location.reload();
		}
	});
}

(function (global)
{
  var ValueError = function (message)
  {
    var err = new Error(message);
    err.name = 'ValueError';
    return err;
  };

  var defaultTo = function (x, y)
  {
    return y == null ? x : y;
  };

  var create = function (transformers)
  {
    return function (template)
    {
      var args = Array.prototype.slice.call(arguments, 1);
      var idx = 0;
      var state = 'UNDEFINED';

      return template.replace(
        /([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
        function (match, literal, key, xf)
        {
          if (literal != null)
          {
            return literal;
          }
          if (key.length > 0)
          {
            if (state === 'IMPLICIT')
            {
              throw ValueError('cannot switch from implicit to explicit numbering');
            }
            state = 'EXPLICIT';
          } else
          {
            if (state === 'EXPLICIT')
            {
              throw ValueError('cannot switch from explicit to implicit numbering');
            }
            state = 'IMPLICIT';
            key = String(idx);
            idx += 1;
          }
          var value = defaultTo('', lookup(args, key.split('.')));

          if (xf == null)
          {
            return value;
          } else if (Object.prototype.hasOwnProperty.call(transformers, xf))
          {
            return transformers[xf](value);
          } else
          {
            throw ValueError('no transformer named "' + xf + '"');
          }
        }
      );
    };
  };

  var lookup = function (obj, path)
  {
    if (!/^\d+$/.test(path[0]))
    {
      path = ['0'].concat(path);
    }
    for (var idx = 0; idx < path.length; idx += 1)
    {
      var key = path[idx];
      obj = typeof obj[key] === 'function' ? obj[key]() : obj[key];
    }
    return obj;
  };

  //  format :: String,*... -> String
  var format = create({});

  //  format.create :: Object -> String,*... -> String
  format.create = create;

  //  format.extend :: Object,Object -> ()
  format.extend = function (prototype, transformers)
  {
    var $format = create(transformers);
    prototype.format = function ()
    {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this);
      return $format.apply(global, args);
    };
  };

  /* istanbul ignore else */
  if (typeof module !== 'undefined')
  {
    module.exports = format;
  } else if (typeof define === 'function' && define.amd)
  {
    define(function ()
    {
      return format;
    });
  } else
  {
    global.format = format;
  }

}.call(this, this));
window.format.extend(String.prototype, {});
window.format.extend(String.prototype, {
  escape: function (s)
  {
    return s.replace(/[&<>"'`]/g, function (c)
    {
      return '&#' + c.charCodeAt(0) + ';'
    })
  },
  upper: function (s)
  {
    return s.toUpperCase();
  },
  lower: function (s)
  {
    return s.toLowerCase();
  }
});
