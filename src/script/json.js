JSON=JSON||{};
(function(){function c(a){return 10>a?"0"+a:a}function n(a){p.lastIndex=0;return p.test(a)?'"'+a.replace(p,function(a){var d=r[a];return"string"===typeof d?d:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function l(a,d){var k=e,b=d[a];b&&"object"===typeof b&&"function"===typeof b.toJSON&&(b=b.toJSON(a));"function"===typeof h&&(b=h.call(d,a,b));switch(typeof b){case "string":return n(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);case "object":if(!b)return"null";
e+=m;var g=[];if("[object Array]"===Object.prototype.toString.apply(b)){var c=b.length;for(a=0;a<c;a+=1)g[a]=l(a,b)||"null";d=0===g.length?"[]":e?"[\n"+e+g.join(",\n"+e)+"\n"+k+"]":"["+g.join(",")+"]";e=k;return d}if(h&&"object"===typeof h)for(c=h.length,a=0;a<c;a+=1){var f=h[a];"string"===typeof f&&(d=l(f,b))&&g.push(n(f)+(e?": ":":")+d)}else for(f in b)Object.hasOwnProperty.call(b,f)&&(d=l(f,b))&&g.push(n(f)+(e?": ":":")+d);d=0===g.length?"{}":e?"{\n"+e+g.join(",\n"+e)+"\n"+k+"}":"{"+g.join(",")+
"}";e=k;return d}}"function"!==typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(a){return this.getUTCFullYear()+"-"+c(this.getUTCMonth()+1)+"-"+c(this.getUTCDate())+"T"+c(this.getUTCHours())+":"+c(this.getUTCMinutes())+":"+c(this.getUTCSeconds())+"Z"},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var q=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,p=/[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
e,m,r={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},h;"function"!==typeof JSON.stringify&&(JSON.stringify=function(a,d,c){var b;m=e="";if("number"===typeof c)for(b=0;b<c;b+=1)m+=" ";else"string"===typeof c&&(m=c);if((h=d)&&"function"!==typeof d&&("object"!==typeof d||"number"!==typeof d.length))throw Error("JSON.stringify");return l("",{"":a})});"function"!==typeof JSON.parse&&(JSON.parse=function(a,d){function c(a,e){var b,f=a[e];if(f&&"object"===typeof f)for(b in f)if(Object.hasOwnProperty.call(f,
b)){var g=c(f,b);void 0!==g?f[b]=g:delete f[b]}return d.call(a,e,f)}a=String(a);q.lastIndex=0;q.test(a)&&(a=a.replace(q,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return a=eval("("+a+")"),"function"===typeof d?c({"":a},""):a;throw new SyntaxError("JSON.parse");})})();
Object.prototype.toJSONString||(Object.prototype.toJSONString=function(c){return JSON.stringify(this,c)},Object.prototype.parseJSON=function(c){return JSON.parse(this,c)});
