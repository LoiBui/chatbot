/**
 * Created by THANG NGUYEN (tan@vn.sateraito.co.jp) on 2015/02/02.
 * Updated: 2015-11-20
 */

var DEBUG_MODE = false;

function debugLog(msg) {
  if (window.console && window.console.log && DEBUG_MODE === true) {
    // console is available
    window.console.log(msg);
  }
}

/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.1.9";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = require('buffer').Buffer;
        } catch (err) {}
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ? function (u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u))
        .toString('base64')
    }
    : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ? function(a) {
        return (a.constructor === buffer.constructor
                ? a : new buffer(a, 'base64')).toString();
    }
    : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
    if (global['Meteor']) {
       Base64 = global.Base64; // for normal export in Meteor.js
    }
})(this);

// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

Array.prototype.keySort = function (keys) {

  keys = keys || {};

  // via
  // http://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array
  var obLen = function (obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key))
        size++;
    }
    return size;
  };

  // avoiding using Object.keys because I guess did it have IE8 issues?
  // else var obIx = function(obj, ix){ return Object.keys(obj)[ix]; } or
  // whatever
  var obIx = function (obj, ix) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (size == ix)
          return key;
        size++;
      }
    }
    return false;
  };

  var keySort = function (a, b, d) {
    d = d !== null ? d : 1;
    // a = a.toLowerCase(); // this breaks numbers
    // b = b.toLowerCase();
    if (a == b)
      return 0;
    return a > b ? 1 * d : -1 * d;
  };

  var KL = obLen(keys);

  if (!KL)
    return this.sort(keySort);

  for (var k in keys) {
    // asc unless desc or skip
    keys[k] =
        keys[k] == 'desc' || keys[k] == -1 ? -1
      : (keys[k] == 'skip' || keys[k] === 0 ? 0
      : 1);
  }

  this.sort(function (a, b) {
    var sorted = 0, ix = 0;

    while (sorted === 0 && ix < KL) {
      var k = obIx(keys, ix);
      if (k) {
        var dir = keys[k];
        sorted = keySort(a[k], b[k], dir);
        ix++;
      }
    }
    return sorted;
  });
  return this;
};

Array.prototype.indexOfObject = function (object) {
  for (var i = 0; i < this.length; i++) {
    if (JSON.stringify(this[i]) === JSON.stringify(object))
      return i;
  }
};
/*
 Sorts an array of objects (note: sorts the original array and returns nothing)

 @arrToSort             array           javascript array of objects
 @strObjParamToSortBy   string          name of obj param to sort by, and an
 @sortAsc               bool (optional) sort ascending or decending (defaults to true and sorts in ascending order)
 returns                void            because the original array that gets passed in is sorted
 */
function sortArrOfObjectsByParam(arrToSort /* array */, strObjParamToSortBy /* string */, sortAscending /* bool(optional, defaults to true) */) {
  if (sortAscending == undefined) sortAscending = true;  // default to true

  if (sortAscending) {
    arrToSort.sort(function (a, b) {
      return a[strObjParamToSortBy] > b[strObjParamToSortBy];
    });
  }
  else {
    arrToSort.sort(function (a, b) {
      return a[strObjParamToSortBy] < b[strObjParamToSortBy];
    });
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function testJsonIsOk(aObj) {
  try {
    JSON.parse(JSON.stringify(aObj));
    return true;
  } catch (e) {
    debugLog('_____ERROR: ' + e.message + '_____');
    return false;
  }
}

/**
 * IsNumeric
 * Returns whether item is a valid number
 * @param {string} s item to check
 * @return {boolean} true if item can be converted to a number
 */
function IsNumeric(s) {
  return !isNaN(parseFloat(s)) && isFinite(s);
}

/**
 * IsDate
 * Returns whether item is a valid date
 * @param {string} sDate item to check
 * @return {boolean} true if item can be converted to a date
 */
function IsDate(sDate) {
  var tryDate = new Date(sDate);
  return (tryDate.toString() != "NaN" && tryDate != "Invalid Date");
}


function removeAllScriptTags(strHtml) {
  var elm = $(document.createElement('div'));
  elm.html(strHtml);
  elm.find('script').remove();
  return elm.html();
}

/**
 * escapeHtml
 *
 * @param {String} aStringToEscape
 */
function escapeHtml(aStringToEscape) {
  if (aStringToEscape == null) {
    return null;
  }
  return aStringToEscape.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * unescapeHtml
 *
 * @param {String} aStringToEscape
 */
function unescapeHtml(aStringToEscape) {
  if (aStringToEscape == null) {
    return null;
  }
  return aStringToEscape.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'");
}

/**
 * escapeAndEncodeHtml
 *
 * @param {String} aStringToEscape
 */
function escapeAndEncodeHtml(aStringToEscape) {
  if (aStringToEscape == null) {
    return null;
  }
  aStringToEscape = encodeURIComponent(aStringToEscape);
  return aStringToEscape; //.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * unescapeAndDecodeHtml
 *
 * @param {String} aStringToEscape
 */
function unescapeAndDecodeHtml(aStringToEscape) {
  if (aStringToEscape == null) {
    return null;
  }
  aStringToEscape = decodeURIComponent(aStringToEscape);
  return aStringToEscape;//.replace(/&amp;/g,"&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'");
}

function getValFromNodeAttribute(aNodeAtt) {
  if ('value' in aNodeAtt) {
    return aNodeAtt.value;
  }
  if ('nodeValue' in aNodeAtt) {
    return aNodeAtt.nodeValue;
  }
  return '';
}

ObjectsTemporary = function () {
  this.items = [];
  this.active = -1;
};
ObjectsTemporary.prototype.get = function (index) {
  with (this) {
    if (typeof index == 'undefined') {
      index = this.active;
    }
    if (this.items.length > 0) {
      return this.items[index];
    } else {
      return null;
    }
  }
};
ObjectsTemporary.prototype.set = function (aObj) {
  with (this) {
    if (typeof aObj == 'undefined') {
      return false;
    }
    if (typeof aObj != 'object') {
      return false;
    }
    this.active += 1;
    this.items.push(aObj);
    return true;
  }
};
ObjectsTemporary.prototype.destroy = function (aElement) {
  with (this) {
    items = new Array();
    active = -1;
  }
};

RefactorCode = {};
RefactorCode.parent = null;
RefactorCode.numTab = 1;
RefactorCode.result = '';
RefactorCode.arrCnt = ['tbody'];
RefactorCode.arrOts = ['input', 'span', 'label'];
RefactorCode.checkTagNameIsOts = function (aTagName) {
  for (var i = 0; i < RefactorCode.arrOts.length; i++) {
    if (RefactorCode.arrOts[i] == aTagName) {
      return true;
    }
  }
  return false;
};
RefactorCode.checkTagNameIsContinue = function (aTagName) {
  for (var i = 0; i < RefactorCode.arrCnt.length; i++) {
    if (RefactorCode.arrCnt[i] == aTagName) {
      return true;
    }
  }
  return false;
};
RefactorCode.getTabString = function (numTab) {
  var tab_string = '';
  for (var i = 0; i < numTab; i++) {
    tab_string += '  ';
  }
  return tab_string
};
RefactorCode.getInnerText = function (child) {
  var newChild = $(child).clone();
  $.each($(newChild).children(), function () {
    $(this).remove();
  });
  return $(newChild).text();
};

RefactorCode.getChildren = function (parent, numTab) {
  var childs = $(parent).children();
  for (var i = 0; i < childs.length; i++) {
    var child = childs[i];
    var tagName = child.tagName.toLowerCase();

    var cnt = RefactorCode.checkTagNameIsContinue(tagName);
    if (cnt == true) {
      numTab = numTab - 1;
    }
    var tab_string = RefactorCode.getTabString(numTab);


//      if(this.checkTagNameIsOts(tagName) == true){
//        RefactorCode.result += tab_string;
//        RefactorCode.result += '<' + tagName;
//        try{
//          for(var j=0; j<child.attributes.length; j++){
//            var attr = child.attributes[j];
//            RefactorCode.result += ' ' + attr.nodeName + '="'+getValFromNodeAttribute(attr)+'"';
//          }
//        }catch(e){}
//        RefactorCode.result += '>';
//        RefactorCode.result += $(child).html();
//        RefactorCode.result += '</' + tagName + '>';
//        RefactorCode.result += '\n';
//        return;
//      }

    if (tagName == 'textarea') {
      RefactorCode.result += tab_string;
      RefactorCode.result += '<' + tagName;
      try {

//        for (var j = 0; j < child.attributes.length; j++) {
//          var attr = child.attributes[j];
//          RefactorCode.result += ' ' + attr.nodeName + '="' + getValFromNodeAttribute(attr) + '"';
//        }
        $.each(child.attributes, function() {
          RefactorCode.result += ' ' + this.name + '="' + this.value + '"';
        })
      } catch (e) {
      }
      RefactorCode.result += '>';
      RefactorCode.result += $(child).val();
      RefactorCode.result += '</' + tagName + '>';
      RefactorCode.result += '\n';
      continue;
    } else if (tagName == 'br') {
      var strAttr = '';
      try {
//        for (var j = 0; j < child.attributes.length; j++) {
//          var attr = child.attributes[j];
//          strAttr += ' ' + attr.nodeName + '="' + getValFromNodeAttribute(attr) + '"';
//        }
        $.each(child.attributes, function() {
          strAttr += ' ' + this.name + '="' + this.value + '"';
        });
      } catch (e) {
      }
      RefactorCode.result += tab_string + '<br' + strAttr + '>\n';
      continue;
    }

//      if(tagName == 'td' && $(child).attr('class') == 'detail_name'){
//        RefactorCode.result += tab_string;
//        RefactorCode.result += '<' + tagName;
//        try{
//          for(var j=0; j<child.attributes.length; j++){
//            var attr = child.attributes[j];
//            RefactorCode.result += ' ' + attr.nodeName + '="'+getValFromNodeAttribute(attr)+'"';
//          }
//        }catch(e){}
//        RefactorCode.result += '>';
//        var textContent = RefactorCode.getInnerText( child );
//        if(textContent.trim() != ''){
//          RefactorCode.result += textContent;
//        }
//        RefactorCode.getChildren(child, numTab + 1);
//        RefactorCode.result += '</' + tagName + '>';
//        RefactorCode.result += '\n';
//        return;
//      }

    if (cnt == false) {
      RefactorCode.result += tab_string;
      RefactorCode.result += '<' + tagName;
      try {
//        for (var j = 0; j < child.attributes.length; j++) {
//          var attr = child.attributes[j];
//          RefactorCode.result += ' ' + attr.nodeName + '="' + getValFromNodeAttribute(attr) + '"';
//        }
        $.each(child.attributes, function() {
          RefactorCode.result += ' ' + this.name + '="' + this.value + '"';
        });
      } catch (e) {
      }
      RefactorCode.result += '>\n';
    }

    var textContent = RefactorCode.getInnerText(child);
    if (textContent.trim() != '') {
      if (cnt == false) {
        RefactorCode.result += tab_string + '  ' + textContent;
      } else {
        RefactorCode.result += '  ' + textContent;
      }
      RefactorCode.result += '\n';
    }
    RefactorCode.getChildren(child, numTab + 1);

    if (cnt == false) {
      RefactorCode.result += tab_string;
      RefactorCode.result += '</' + tagName + '>';
      RefactorCode.result += '\n';
    }
  }
};
RefactorCode.init = function (props, aSilentScript) {

  // console.log('********* RefactorCode.init ***********');
  // fixed IE 9
  // RefactorCode.parent = props.parent.clone();
  RefactorCode.parent = props.parent;
  RefactorCode.numTab = 1;
  RefactorCode.result = '';
  RefactorCode.test = false;

  if (typeof aSilentScript == 'undefined') {
    aSilentScript = true;
  }

  if (!aSilentScript) {
    RefactorCode.parent.append(MainLayout.sateraito_script.outerHTML);
  }

  RefactorCode.result = beautify($(RefactorCode.parent).html());
//  if (!aSilentScript) {
//    RefactorCode.result += '<script name="' + MainLayout.sateraito_script.getAttribute('name') + '">\n';
//    RefactorCode.result += beautify(MainLayout.sateraito_script.textContent, true);
//    RefactorCode.result += '\n</script>';
//  }
//  return;
//
//  if (!aSilentScript) {
//    RefactorCode.parent.append(MainLayout.sateraito_script.outerHTML);
//  }
//
//  var childs = $(RefactorCode.parent).children();
//  for (var i = 0; i < childs.length; i++) {
//    var child = childs[i];
//    var tagName = child.tagName.toLowerCase();
//    var tab_string = RefactorCode.getTabString(0);
//    RefactorCode.result += tab_string;
//    RefactorCode.result += '<' + tagName;
//    try {
////      for (var j = 0; j < child.attributes.length; j++) {
////        var attr = child.attributes[j];
////        RefactorCode.result += ' ' + attr.nodeName + '="' + getValFromNodeAttribute(attr) + '"';
////      }
//      $.each(child.attributes, function() {
//        RefactorCode.result += ' ' + this.name + '="' + this.value + '"';
//      });
//    } catch (e) {
//      console.log(e)
//    }
//    RefactorCode.result += '>\n';
//    var textContent = RefactorCode.getInnerText(child);
//    if (textContent.trim() != '') {
//      RefactorCode.result += tab_string + '  ' + textContent;
//      RefactorCode.result += '\n';
//    }
//    RefactorCode.getChildren(child, RefactorCode.numTab);
//    RefactorCode.result += tab_string;
//    RefactorCode.result += '</' + tagName + '>';
//    RefactorCode.result += '\n';
//    RefactorCode.numTab = 1;
//  }
};

function beautify(htmlStr, aJsBeautify, aCssBeautify) {
  var source = htmlStr,
    output,
    opts = {};
  opts = {
    "indent_size": 2,
    "indent_char": " ",
    "eol": "\n",
    "indent_level": 0,
    "indent_with_tabs": false,
    "preserve_newlines": false,
    "max_preserve_newlines": 0,
    "jslint_happy": false,
    "space_after_anon_function": false,
    "brace_style": "collapse", // -- none, expand, collapse, end-expand,
    "keep_array_indentation": false,
    "keep_function_indentation": false,
    "space_before_conditional": true,
    "break_chained_methods": false,
    "eval_code": false,
    "unescape_strings": false,
    "wrap_line_length": 0,
    "wrap_attributes": "auto",
    "wrap_attributes_indent_size": 2,
    "end_with_newline": false
  };
  if (aJsBeautify) {
    output = js_beautify(source, opts);
  }else if (aCssBeautify){
    output = css_beautify(source, opts);
  }else{
    output = html_beautify(source, opts);
  }
  //IE対応　tab, line feed を変更
  //return output;
  return output.replace(/&#10;/g, '\r\n').replace(/&#9;/g, '\t');
}

MiniMessage = {
  message: null,
  fontSize: 12,
  /**
   * initMessageArea
   */
  initMessageArea: function(aFontSize)
  {
    var vHtml = '';
    vHtml += '<div id="mini_message" style="position:absolute; top:0px; left:0px; width:200px; text-align:center; z-index:10000;';
    if (typeof(aFontSize) == 'undefined') {
      // no option
    } else {
      MiniMessage.fontSize = aFontSize;
    }
    vHtml += '"></div>';

    // Add Mini Message Area
    $('body').append(vHtml);

    // ���b�Z�[�W�̈ʒu���Ĕz�u
    var bodyWidth = $(window).width();
    var messageAreaWidth = $('#mini_message').width();
    $('#mini_message').css('left', '' + ((bodyWidth / 2) - (messageAreaWidth / 2)) + 'px');
  },

  /**
   * clearMsg
   */
  clearMessage: function()
  {
    $('#mini_message').html('');
  },

  /**
   * showLoadingMessage
   *
   * �Ǎ������b�Z�[�W��\������
   */
  showLoadingMessage: function(aMessageText)
  {

    if (typeof(aMessageText) == 'undefined') {
      aMessageText = MyLang.getMsg('LOADING');
    }
    // �~�j���b�Z�[�W������
    $('#mini_message').html('');
    $('#mini_message').css('width', '250px');

    // ���b�Z�[�W�̈ʒu���Ĕz�u
    var bodyWidth = $('#mini_message').parent().width();
    var messageAreaWidth = $('#mini_message').width();
    $('#mini_message').css('left', '' + ((bodyWidth / 2) - (messageAreaWidth / 2)) + 'px');

    // �~�j���b�Z�[�W��\��
    $('#mini_message').text(aMessageText)
      .css('width', '250px')
      .css('font-size', '1.4em')
      .css('font-weight', 'bold')
      .css('background-color', 'lemonchiffon')
      .css('text-align', 'center');
  },

  /**
   * showNormalMiniMessage
   *
   * @param {string} aMessage
   * @param {number} aWait
   */
  showNormalMiniMessage: function(aMessage, aWait)
  {
    if (typeof(aWait) == 'undefined') {
      aWait = 3000;
    }

    // �~�j���b�Z�[�W������
    $('#mini_message').html('');
    $('#mini_message').css('width', '350px');

    // �~�j���b�Z�[�W�̈ʒu���Ĕz�u
    var bodyWidth = $('#mini_message').parent().width();
    var messageAreaWidth = $('#mini_message').width();
    $('#mini_message').css('left', '' + ((bodyWidth / 2) - (messageAreaWidth / 2)) + 'px');

    // �~�j���b�Z�[�W��\��
    $('#mini_message').text(aMessage)
      .css('font-size', '1.4em')
      .css('width', '350px')
      .css('font-weight', 'bold')
      .css('background-color', 'lemonchiffon')
      .css('text-align', 'center');

    (function(){
      // �~�j���b�Z�[�W������
      $('#mini_message').html('').css('width', '0px');
    }).defer(aWait);
  },

  /**
   * showErrMiniMessage
   *
   * @param {String} aMessage
   */
  showErrMiniMessage: function(aMessage)
  {
    // �~�j���b�Z�[�W������
    $('#mini_message').html('');
    $('#mini_message').css('width', '400px');

    // �~�j���b�Z�[�W�̈ʒu���Ĕz�u
    var bodyWidth = $('#mini_message').parent().width();
    var messageAreaWidth = $('#mini_message').width();
    $('#mini_message').css('left', '' + ((bodyWidth / 2) - (messageAreaWidth / 2)) + 'px');

    // �~�j���b�Z�[�W��\��
    $('#mini_message').text(aMessage)
      .css('font-size', '1.2em')
      .css('width', '400px')
      .css('font-weight', 'bold')
      .css('background-color', 'pink')
      .css('text-align', 'center');

    (function(){
      // �~�j���b�Z�[�W������
      $('#mini_message').html('').css('width', '0px');
    }).defer(3000);
  }
};
