/*

 Copyright (C) 2004-2010 Alex Gorbatchev.

 @license
 Dual licensed under the MIT and GPL licenses.
*/
(function(){function b(){this.regexList=[{regex:new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)","gm"),css:"color2"},{regex:SyntaxHighlighter.regexLib.xmlComments,css:"comments"},{regex:new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)","sg"),func:function(c,b){var f=SyntaxHighlighter.Match,g=c[0],d=(new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)","xg")).exec(g),e=[];if(null!=c.attributes)for(var a,h=new XRegExp("(?<name> [\\w:\\-\\.]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)",
"xg");null!=(a=h.exec(g));)e.push(new f(a.name,c.index+a.index,"color1")),e.push(new f(a.value,c.index+a.index+a[0].indexOf(a.value),"string"));null!=d&&e.push(new f(d.name,c.index+d[0].indexOf(d.name),"keyword"));return e}}]}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null;b.prototype=new SyntaxHighlighter.Highlighter;b.aliases=["xml","xhtml","xslt","html"];SyntaxHighlighter.brushes.Xml=b;"undefined"!=typeof exports?exports.Brush=b:null})();
