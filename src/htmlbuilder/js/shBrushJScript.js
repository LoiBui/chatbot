/*

 Copyright (C) 2004-2010 Alex Gorbatchev.

 @license
 Dual licensed under the MIT and GPL licenses.
*/
(function(){function b(){var a=SyntaxHighlighter.regexLib;this.regexList=[{regex:a.multiLineDoubleQuotedString,css:"string"},{regex:a.multiLineSingleQuotedString,css:"string"},{regex:a.singleLineCComments,css:"comments"},{regex:a.multiLineCComments,css:"comments"},{regex:/\s*#.*/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords("break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with"),"gm"),
css:"keyword"}];this.forHtmlScript(a.scriptScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null;b.prototype=new SyntaxHighlighter.Highlighter;b.aliases=["js","jscript","javascript"];SyntaxHighlighter.brushes.JScript=b;"undefined"!=typeof exports?exports.Brush=b:null})();
