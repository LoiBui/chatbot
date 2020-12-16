/**
 * Created by THANG NGUYEN on 3/12/14.
 */

(function(){
  /**
	 * SateraitoWF
	 *
	 * 公開API
	 */
	SateraitoWF = {

		// 記号全角半角変換テーブル
		symbolArray: [
			['@', '＠'],
			['|', '｜'],
			['!', '！'],
			['#', '＃'],
			['$', '＄'],
			['%', '％'],
			['&', '＆'],
			['\'', '’'],
			['"', '”'],
			['(', '（'],
			[')', '）'],
			['=', '＝'],
			['-', 'ー'],
			['~', '～'],
			['^', '＾'],
			['\\', '￥'],
			['_', '＿'],
			['<', '＜'],
			['>', '＞'],
			['?', '？'],
			['/', '／'],
			['+', '＋'],
			['*', '＊'],
			[':', '：'],
			[';', '；'],
			['･', '・'],
			['{', '｛'],
			['}', '｝'],
			['[', '［'],
			[']', '］'],
			['.', '．'],
			[',', '，'],
			[':', '：'],
			[';', '；']
		],

		// カタカナ全角半角変換テーブル
		// カタカナの変換では「ｶﾞ」-->ガのように２文字が１文字になる場合があるので、上から順に変換する事
		katakanaArray: [
			['ｶﾞ', 'ガ'],
			['ｷﾞ', 'ギ'],
			['ｸﾞ', 'グ'],
			['ｹﾞ', 'ゲ'],
			['ｺﾞ', 'ゴ'],
			['ｻﾞ', 'ザ'],
			['ｼﾞ', 'ジ'],
			['ｽﾞ', 'ズ'],
			['ｾﾞ', 'ゼ'],
			['ｿﾞ', 'ゾ'],
			['ﾀﾞ', 'ダ'],
			['ﾁﾞ', 'ヂ'],
			['ﾂﾞ', 'ヅ'],
			['ﾃﾞ', 'デ'],
			['ﾄﾞ', 'ド'],
			['ﾊﾞ', 'バ'],
			['ﾊﾟ', 'パ'],
			['ﾋﾞ', 'ビ'],
			['ﾋﾟ', 'ピ'],
			['ﾌﾞ', 'ブ'],
			['ﾌﾟ', 'プ'],
			['ﾍﾞ', 'ベ'],
			['ﾍﾟ', 'ペ'],
			['ﾎﾞ', 'ボ'],
			['ﾎﾟ', 'ポ'],
			['ｳﾞ', 'ヴ'],
			['ｧ', 'ァ'],
			['ｱ', 'ア'],
			['ｨ', 'ィ'],
			['ｲ', 'イ'],
			['ｩ', 'ゥ'],
			['ｳ', 'ウ'],
			['ｪ', 'ェ'],
			['ｴ', 'エ'],
			['ｫ', 'ォ'],
			['ｵ', 'オ'],
			['ｶ', 'カ'],
			['ｷ', 'キ'],
			['ｸ', 'ク'],
			['ｹ', 'ケ'],
			['ｺ', 'コ'],
			['ｻ', 'サ'],
			['ｼ', 'シ'],
			['ｽ', 'ス'],
			['ｾ', 'セ'],
			['ｿ', 'ソ'],
			['ﾀ', 'タ'],
			['ﾁ', 'チ'],
			['ｯ', 'ッ'],
			['ﾂ', 'ツ'],
			['ﾃ', 'テ'],
			['ﾄ', 'ト'],
			['ﾅ', 'ナ'],
			['ﾆ', 'ニ'],
			['ﾇ', 'ヌ'],
			['ﾈ', 'ネ'],
			['ﾉ', 'ノ'],
			['ﾊ', 'ハ'],
			['ﾋ', 'ヒ'],
			['ﾌ', 'フ'],
			['ﾍ', 'ヘ'],
			['ﾎ', 'ホ'],
			['ﾏ', 'マ'],
			['ﾐ', 'ミ'],
			['ﾑ', 'ム'],
			['ﾒ', 'メ'],
			['ﾓ', 'モ'],
			['ｬ', 'ャ'],
			['ﾔ', 'ヤ'],
			['ｭ', 'ュ'],
			['ﾕ', 'ユ'],
			['ｮ', 'ョ'],
			['ﾖ', 'ヨ'],
			['ﾗ', 'ラ'],
			['ﾘ', 'リ'],
			['ﾙ', 'ル'],
			['ﾚ', 'レ'],
			['ﾛ', 'ロ'],
			['ﾜ', 'ワ'],
			['ｦ', 'ヲ'],
			['ﾝ', 'ン'],
			['｡', '。'],
			['｢', '「'],
			['｣', '」'],
			['､', '、'],
			['･', '・'],
			['ｰ', 'ー'],
			['ﾞ', '゛'],
			['ﾟ', '゜']
		],

		/**
		 * _toFullWidthKatakana
		 *
		 * カタカナを全角に変換
		 *
		 * @param {string} aHankakuStr
		 * @return {string}
		 */
		_toFullWidthKatakana: function(aHankakuStr)
		{
			return SateraitoWF._toFullWidth(aHankakuStr, SateraitoWF.katakanaArray);
		},

		/**
		 * _toFullWidthSymbol
		 *
		 * 記号を全角に変換
		 *
		 * @param {string} aHankakuStr
		 * @return {string}
		 */
		_toFullWidthSymbol: function(aHankakuStr)
		{
			return SateraitoWF._toFullWidth(aHankakuStr, SateraitoWF.symbolArray);
		},

		/**
		 * _toFullWidth
		 *
		 * 変換テーブルを使って全角に変換
		 *
		 * @param {string} aHankakuStr
		 * @param {array} aArrayTable
		 * @return {string}
		 */
		_toFullWidth: function(aHankakuStr, aArrayTable)
		{
			var zenkakuStr = aHankakuStr;
			// 変換開始
			Ext.each(aArrayTable, function(){
				var hankakuMoji = String(this[0]);
				var zenkakuMoji = String(this[1]);
				while (zenkakuStr.indexOf(hankakuMoji) != -1) {
					zenkakuStr = zenkakuStr.replace(hankakuMoji, zenkakuMoji);
				}
			});
			return zenkakuStr;
		},

		/**
		 * _toHalfWidthKatakana
		 *
		 * カタカナについて、半角に変換
		 *
		 * @param {string} aZenkakuStr
		 * @return {string}
		 */
		_toHalfWidthKatakana: function(aZenkakuStr)
		{
			return SateraitoWF._toHalfWidth(aZenkakuStr, SateraitoWF.katakanaArray);
		},

		/**
		 * _toHalfWidthSymbol
		 *
		 * 記号について、半角に変換
		 *
		 * @param {string} aZenkakuStr
		 * @return {string}
		 */
		_toHalfWidthSymbol: function(aZenkakuStr)
		{
			return SateraitoWF._toHalfWidth(aZenkakuStr, SateraitoWF.symbolArray);
		},

		/**
		 * _toHalfWidth
		 *
		 * 変換テーブルに従って、半角に変換
		 *
		 * @param {string} aZenkakuStr
		 * @param {array} aArrayTable
		 */
		_toHalfWidth: function(aZenkakuStr, aArrayTable)
		{
			var hankakuStr = aZenkakuStr;
			// 変換開始
			Ext.each(aArrayTable, function(){
				var hankakuMoji = String(this[0]);
				var zenkakuMoji = String(this[1]);
				while (hankakuStr.indexOf(zenkakuMoji) != -1) {
					hankakuStr = hankakuStr.replace(zenkakuMoji, hankakuMoji);
				}
			});
			return hankakuStr;
		},

		/**
		 * toFullWidth
		 *
		 * 文字列の半角部分を全角に変換する
		 *
		 * @param {string} aStr
		 * @return {string}
		 */
		toFullWidth: function(aStr)
		{
			if (typeof(aStr) != 'string') {
				return aStr;
			} else {
				aStr = SateraitoWF._toFullWidthSymbol(aStr);
				aStr = SateraitoWF._toFullWidthKatakana(aStr);
				return aStr.replace(/[A-Za-z0-9]/g,function(s){return String.fromCharCode(s.charCodeAt(0) + 0xFEE0)});
			}
		},

		/**
		 * toHalfWidth
		 *
		 * 文字列の全角部分を半角に変換する
		 *
		 * @param {string} aStr
		 * @return {string}
		 */
		toHalfWidth: function(aStr)
		{
			if (typeof(aStr) != 'string') {
				return aStr;
			} else {
				aStr = SateraitoWF._toHalfWidthSymbol(aStr);
				aStr = SateraitoWF._toHalfWidthKatakana(aStr);
				return aStr.replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(s){return String.fromCharCode(s.charCodeAt(0)-0xFEE0)});
			}
		},

		/**
		 * addComma
		 *
		 * @param {string} aStr
		 */
		addComma: function(aStr)
		{
			return NumUtil.addComma(aStr);
		},

		/**
		 * removeComma
		 *
		 * @param {string} aStr
		 */
		removeComma: function(aStr)
		{
			return NumUtil.removeComma(aStr);
		},

		/**
		 * getCalendarCmp
		 *
		 * @param {string} aElementName
		 * @return {Ext.Component}
		 */
		getCalendarCmp: function(aForm, aElementName)
		{
			if (aForm.id == 'form_new_doc') {
				return Ext.getCmp('template_body_new_doc_' + aElementName);
			} else {
				var formId = aForm.id;
				var formIdSplited = formId.split('_');
				var docId = formIdSplited[1];
				return Ext.getCmp('template_body_' + docId + '_' + aElementName);
			}
		},

		/**
		 * calcAll
		 *
		 * @param {dom} aForm
		 */
		calcAll: function(aForm)
		{
			if (aForm.id == 'form_new_doc') {
				Calc.calcAll('template_body_new_doc');
			} else {
				var formId = aForm.id;
				var formIdSplited = formId.split('_');
				var docId = formIdSplited[1];
				Calc.calcAll('template_body_' + docId);
			}
		},

		/**
		 * round:四捨五入、切り捨て、切り上げ
		 *
		 * @param {number} aNum
		 * @param {string} aDecimalPlace
		 * @param {string} aRoundType
		 */
		round: function(aNum, aDecimalPlace, aRoundType)
		{
			return Calc.round(aNum, aDecimalPlace, aRoundType);
		},

		/**
		 * sum:加算
		 *
		 * @param {number} aNum1
		 * @param {number} aNum2
		 */
		sum: function(aNum1, aNum2)
		{
			return Calc.sum(aNum1, aNum2);
		},

		/**
		 * diff:減算
		 *
		 * @param {number} aNum1
		 * @param {number} aNum2
		 */
		diff: function(aNum1, aNum2)
		{
			return Calc.diff(aNum1, aNum2);
		},

		/**
		 * multi:乗算
		 *
		 * @param {number} aNum1
		 * @param {number} aNum2
		 */
		multi: function(aNum1, aNum2)
		{
			return Calc.multi(aNum1, aNum2);
		},


		/**
		 * divide:除算
		 *
		 * @param {number} aNum1
		 * @param {number} aNum2
		 */
		divide: function(aNum1, aNum2)
		{
			return Calc.divide(aNum1, aNum2);
		},

		/**
		 * dateDiff
		 *
		 * @param {string} aDateSmall YYYY-MM-DD
		 * @param {string} aDateBig YYYY-MM-DD
		 * @return {number}
		 */
		dateDiff: function(aDateSmall, aDateBig)
		{
			if (aDateSmall == '' || aDateBig == '') {
				return null;
			}

			return Sateraito.DateUtil.getDateDiff(aDateSmall, aDateBig);
		},

		/**
		 * dateAdd
		 *
		 * @param {string} aStrDate YYYY-MM-DD
		 * @param {number} aDelta
		 */
		dateAdd: function(aStrDate, aDelta)
		{
			if (aStrDate == '' || aStrDate == null || isNaN(aDelta)) {
				return null;
			}

			return Sateraito.DateUtil.getFutureDateStr(aStrDate, aDelta);
		},

		/**
		 * monthAdd
		 *
		 * @param {string} aStrDate YYYY-MM-DD
		 * @param {number} aDelta
		 */
		monthAdd: function(aStrDate, aDelta)
		{
			if (aStrDate == '' || aStrDate == null || isNaN(aDelta)) {
				return null;
			}

			return Sateraito.DateUtil.addMonth(aStrDate, aDelta);
		},

		/**
		 * yearAdd:日付に指定年数を足す（うるう年も考慮）
		 *
		 * @param {string} aStrDate YYYY-MM-DD
		 * @param {number} aDelta
		 */
		yearAdd: function(aStrDate, aDelta)
		{
			if (aStrDate == '' || aStrDate == null || isNaN(aDelta)) {
				return null;
			}
			return Sateraito.DateUtil.addYear(aStrDate, aDelta);
		},

		/**
		 * registerFunctionsToNewWindow
		 *
		 * @param {string} aFunctionName
		 * @param {function} aFunction
		 */
		registerFunctionsToNewWindow: function(aFunctionName, aFunction)
		{
			var window = Ext.getCmp('doc_detail_window_new_doc');
			if (typeof(window.customFunctions) == 'undefined') {
				window.customFunctions = {};
			}
			window.customFunctions[aFunctionName] = aFunction;
		},

		/**
		 * registerWFHandler
		 *
		 * @param {string} event name
		 * @param {function} aFunction
		 */
		registerWFHandler: function(aForm, aEventName, aFunction)
		{
			var window;
			if (aForm.id == 'form_new_doc') {
				window = Ext.getCmp('doc_detail_window_new_doc');
			} else {
				var formId = aForm.id;
				var formIdSplited = formId.split('_');
				var docId = formIdSplited[1];
				window = Ext.getCmp('doc_detail_window_' + docId);
			}
			// 印刷用画面の場合は、window自体取れないので
			if (typeof(window) != 'undefined') {
				if(typeof(window.wfEventHandler) == 'undefined')
				{
					window.wfEventHandler = {};
				}
				window.wfEventHandler[aEventName] = aFunction;
			}
		},

		/**
		 * getFunctionsFromNewWindow
		 *
		 * @param {string} aFunctionName
		 * @param {function}
		 */
		getFunctionsFromNewWindow: function(aFunctionName)
		{
			var window = Ext.getCmp('doc_detail_window_new_doc');
			if (typeof(window.customFunctions) == 'undefined') {
				window.customFunctions = {};
			}
			return window.customFunctions[aFunctionName];
		},

		/**
		 * getFormMainBody
		 *
		 * @param {Object} aForm
		 * @return {string}
		 */
		getFormMainBody: function(aForm)
		{
			var divMainBody = $(aForm).find('div.main_body');
			return divMainBody;
		},

		/**
		 * disableFormElement
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		disableFormElement: function(aForm, aName)
		{
			var divMainBody = SateraitoWF.getFormMainBody(aForm);
			SateraitoWF.disableFormElementByMainBody(divMainBody, aName);
		},

		/**
		 * disableFormElement
		 *
		 * @param {Object} aDivMainBody
		 * @param {string} aName
		 */
		disableFormElementByMainBody: function(aDivMainBody, aName)
		{
			$(aDivMainBody).find(':input[name=' + aName + ']').attr('disabled', 'disabled');
			// numberフィールドなどExtJs項目の処理
			var field_id = $(aDivMainBody).find(':input[name=' + aName + ']').attr('id');
			if(typeof(field_id) != 'undefined')
			{
				var field = Ext.ComponentMgr.get(field_id);
				if(typeof(field) != 'undefined'){
					field.disable();
				}
			}
		},

		/**
		 * enableFormElement
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		enableFormElement: function(aForm, aName)
		{
			var divMainBody = SateraitoWF.getFormMainBody(aForm);
			SateraitoWF.enableFormElementByMainBody(divMainBody, aName);
		},

		/**
		 * enableFormElementByMainBody
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		enableFormElementByMainBody: function(aDivMainBody, aName)
		{
			$(aDivMainBody).find(':input[name=' + aName + ']').removeAttr('disabled');
			// numberフィールドなどExtJs項目の処理
			var field_id = $(aDivMainBody).find(':input[name=' + aName + ']').attr('id');
			if(typeof(field_id) != 'undefined')
			{
				var field = Ext.ComponentMgr.get(field_id);
				if(typeof(field) != 'undefined'){
					field.enable();
				}
			}
		},

		/**
		 * setFormValue
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		setFormValue: function(aForm, aName, aValue)
		{
			var divMainBody = SateraitoWF.getFormMainBody(aForm);
			SateraitoWF.setFormValueByMainBody(divMainBody, aName, aValue);
		},

		/**
		 * setFormValueByMainBody
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		setFormValueByMainBody: function(aDivMainBody, aName, aValue)
		{
			var value_csv = [];
			if(typeof(aValue) == 'string' && aValue != ''){
				value_csv = aValue.split(',');
			}else{
				value_csv.push('' + aValue);
			}

			// numberクラスの場合は、カンマを自動でつける
			//if ($(aForm).find('div.main_body').find(':input[name=' + aName + ']').hasClass('number')) {
			if ($(aDivMainBody).find(':input[name=' + aName + ']').hasClass('number')) {
				aValue = NumUtil.addComma(NumUtil.removeComma(aValue));
			}
			//$(aForm).find('div.main_body').find(':input[name=' + aName + ']').attr('value', aValue);
			//$(aDivMainBody).find(':input[name=' + aName + ']').attr('value', aValue);


			$(aDivMainBody).find(':input[name=' + aName + ']').each(function(){
				var element = this;
				var name = $(element).attr('name');
				var type = $(element).attr('type');

				// ラジオボタンの場合
				if (type == 'radio') {
					if($(element).val() == aValue){
						$(element).attr('checked', 'checked');
					}
				}
				// チェックボックスの場合
				else if (type == 'checkbox') {
					if($.inArray($(element).val(), value_csv) >= 0){
						$(element).attr('checked', 'checked');
					}else{
						$(element).removeAttr('checked');
					}
				}
				// テキストエリアの場合
				else if ($(element).is('textarea')) {
					$(element).val(aValue).trigger('autosize.resize');
					// disabledの際の表示に対応（とりあえずradioとcheckboxは対応なし）
					var escapedValue = Sateraito.Util.escapeHtml(aValue);
					$(aDivMainBody).find('span.sateraito_doc_value[name=' + aName + ']').html(Sateraito.Util.enterToBr(escapedValue));
				}
				else{
					$(element).attr('value', aValue);
					// disabledの際の表示に対応（とりあえずradioとcheckboxは対応なし）
					var escapedValue = Sateraito.Util.escapeHtml(aValue);
					$(aDivMainBody).find('span.sateraito_doc_value[name=' + aName + ']').html(Sateraito.Util.enterToBr(escapedValue));
				}
			});
		},

		/**
		 * getFormValue
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 * @return {string}
		 */
		getFormValue: function(aForm, aName)
		{
			var divMainBody = SateraitoWF.getFormMainBody(aForm);
			return SateraitoWF.getFormValueByMainBody(divMainBody, aName);
		},

		/**
		 * getFormValueByMainBody
		 *
		 * @param {Object} aDivMainBody
		 * @param {string} aName
		 * @return {string}
		 */
		getFormValueByMainBody: function(aDivMainBody, aName)
		{
			// 同一name複数対応.checkbox, radio 対応
			//var formValue = $(aForm).find('div.main_body').find(':input[name=' + aName + ']').val();
			//return formValue;
			var formValue = '';
			//$(aForm).find('div.main_body').find(':input[name=' + aName + ']').each(function(){
			$(aDivMainBody).find(':input[name=' + aName + ']').each(function(){
				var element = this;
				var name = $(element).attr('name');
				var type = $(element).attr('type');

				// ラジオボタンの場合
				if (type == 'radio') {
					if(($(element).is(':checked'))){
						formValue += (formValue != '' ? ',' : '') + $(element).val();		// on あるいは value値
					}
				}
				// チェックボックスの場合
				else if (type == 'checkbox') {
					if(($(element).is(':checked'))){
						formValue += (formValue != '' ? ',' : '') + $(element).val();		// on あるいは value値
					}
				}
				else{
					formValue += (formValue != '' ? ',' : '') + $(element).val();
				}
			});
			return formValue;

		},


		/**
		 * getForm
		 *
		 * @param {Object} aObj 呼び出し元オブジェクト
		 */
		getForm: function(aObj)
		{
			return $(aObj).parents('form')[0];
		},


		/**
		 * showNewDocWindow：新規申請画面を開く
		 *
		 * @param {string} aTemplateName
		 * @param {Object} aDefaultValues
		 */
		showNewDocWindow: function(aTemplateName, aDefaultValues)
		{
			if (IS_OPENID_MODE) {
				alert(MyLang.getMsg('MSG_NOT_AVAILABLE_CREATE_DOC_IN_OPENIDMODE'));
				return false;
			}

			var templateId = WorkflowTemplate.getTemplateIdByName(aTemplateName);
			if (templateId == '') {
				Sateraito.Util.console('showNewDocWindow is pending. because of template id is empty.');
				return false;
			}

			NewDocWindow.showWindow(templateId, aDefaultValues, '', '', '', null, '', false, '', '');
			return true;
		},

		/**
		 * showNewDocWindowWithRelationAndCheckDuplicate：新規申請画面を開く（これ経由で作成された申請には内部で、元申請のdoc_idが保持される）
		 * …元申請から引き継き継がれた申請の重複を制御できる！
		 *
		 * @param {Object} aForm
		 * @param {string} aTemplateName
		 * @param {Object} aDefaultValues
		 * @param {int} aMaxAcceptCount…元申請から引き継ぐ形で何個の申請が可能か（デフォルト=1）
		 * @param {string} aCheckDuplicateGroupKey…同一の元ひな形で、複数のチェックロジックを使う場合はここにキーを指定することでキーごとにチェック可能
		 */
		showNewDocWindowWithRelationAndCheckDuplicate: function(aForm, aTemplateName, aDefaultValues, aCheckDuplicateGroupKey, aMaxAcceptCount)
		{
			if (IS_OPENID_MODE) {
				alert(MyLang.getMsg('MSG_NOT_AVAILABLE_CREATE_DOC_IN_OPENIDMODE'));
				return false;
			}

			var templateId = WorkflowTemplate.getTemplateIdByName(aTemplateName);
			if (templateId == '') {
				return false;
			}

			if(typeof(aMaxAcceptCount) == 'undefined'){
				aMaxAcceptCount = 1;
			}
			if(typeof(aCheckDuplicateGroupKey) == 'undefined'){
				aCheckDuplicateGroupKey = '';
			}

			NewDocWindow.showWindow(templateId, aDefaultValues, '', '', '', null, '', false, '', WorkflowDoc.docIds[aForm.id], true, aMaxAcceptCount, aCheckDuplicateGroupKey);
			return true;
		},

		/**
		 * showNewDocWindowWithRelation：新規申請画面を開く（これ経由で作成された申請には内部で、元申請のdoc_idが保持される）
		 *
		 * @param {Object} aForm
		 * @param {string} aTemplateName
		 * @param {Object} aDefaultValues
		 */
		showNewDocWindowWithRelation: function(aForm, aTemplateName, aDefaultValues)
		{
			if (IS_OPENID_MODE) {
				alert(MyLang.getMsg('MSG_NOT_AVAILABLE_CREATE_DOC_IN_OPENIDMODE'));
				return false;
			}

			var templateId = WorkflowTemplate.getTemplateIdByName(aTemplateName);
			if (templateId == '') {
				return false;
			}

			NewDocWindow.showWindow(templateId, aDefaultValues, '', '', '', null, '', false, '', WorkflowDoc.docIds[aForm.id]);
			return true;
		},

		/**
		 * showRelativeDocWindow：本申請の元となる申請の詳細を開く（なければ処理しない）
		 *
		 * @param {Object} aForm
		 * @param {int} aRelativeDocGeneration:何世代前の関連文書を開くかの指定（1,2,3... デフォルト=1）
		 */
		showRelativeDocWindow: function(aForm, aRelativeDocGeneration)
		{
			if(typeof(aRelativeDocGeneration) == 'undefined' || isNaN(aRelativeDocGeneration) || aRelativeDocGeneration <= 0)
			{
				aRelativeDocGeneration = 1;
			}

			var doc_id = WorkflowDoc.docIds[aForm.id];
			var relative_doc_id = '';
			if(aRelativeDocGeneration == 1){
				relative_doc_id = WorkflowDoc.relativeDocIds[doc_id];
			}else{
				var relative_doc_id_chain = WorkflowDoc.relativeDocIdChains[doc_id];
				if(typeof(relative_doc_id_chain) != 'undefined' && relative_doc_id_chain.length >= aRelativeDocGeneration){
					var ary_idx = relative_doc_id_chain.length - aRelativeDocGeneration;
					if(ary_idx >= 0){
						relative_doc_id = relative_doc_id_chain[ary_idx];
					}
				}
			}
			if(typeof(relative_doc_id) == 'undefined' || relative_doc_id == ''){
				return;
			}
			DocDetailWindow.showWindow(relative_doc_id);
			return true;
		},


		/**
		 * requestMasterDataRow: マスター情報からデータキーを指定して1件データを取得する（プロリード不要）
		 *
		 * @param {string} aMasterCode
		 * @param {string} aDataKeyValue
		 * @param {function} callback
		 */
		requestMasterDataRow: function(aMasterCode, aDataKeyValue, callback)
		{
			MasterData.requestMasterDataRow(aMasterCode, aDataKeyValue, callback);
		},

		/**
		 * requestMasterData
		 *
		 * @param {string} aMasterCode
		 * @param {function} callback
		 */
		requestMasterData: function(aMasterCode, callback)
		{
			MasterData.requestMasterData(aMasterCode, '', true, false, false, '', callback);
		},

		/**
		 * getMasterData
		 *
		 * @param {string} aMasterCode
		 * @return {array}
		 */
		getMasterData: function(aMasterCode)
		{
			if (MasterData.hasMasterDataCache(aMasterCode)) {
				// キャッシュがあるので、同期的にマスターデータを返せる
				var retResult;
				MasterData.requestMasterData(aMasterCode, '', true, false, false, '', function(aResult, aHaveMoreRows){
					retResult = aResult;
				});
				return retResult;
			}

			// キャッシュがなかった
			return [];
		},

		/**
		 * appendUpdateMasterData：申請、承認時に、更新するマスター情報を追加（実際の更新は申請、承認タイミング）
		 *
		 * @param {Object} aForm
		 * @param {string} aMasterCode
		 * @param {string} aDataKeyValue
		 * @param {object} aUpdateData
		 * @param {object} aUpdateOption
		 * @param {string} aTargetApproveType: 処理するタイミングを指定.  値… submit=申請 final_approve=決裁 reject=否決
		 * @param {boolean} aIsOverWrite: true…このレコードに関する設定を上書き（master_code, data_key, TargetApproveTypeをキーとする）
		 */
		appendUpdateMasterData: function(aForm, aMasterCode, aDataKeyValue, aUpdateData, aUpdateOption, aTargetApproveType, aIsOverWrite)
		{
			var doc_id = WorkflowDoc.docIds[aForm.id];
			WorkflowDoc.appendMasterRowForUpdate(doc_id, aMasterCode, aDataKeyValue, aUpdateData, aUpdateOption, aTargetApproveType, aIsOverWrite);
		},


		/**
		 * openSectionArea
		 *
		 * クラス「section_area」で作成されたエリアを開いて表示状態にする
		 *
		 * @param {object} aForm
		 * @param {string} aSectionClasses ... 指定セクションエリアのクラス、半角スペース区切りで複数指定可能
		 */
		openSectionArea: function(aForm, aSectionClasses)
		{
			SateraitoWF._openSectionArea(aForm, aSectionClasses, true);
		},

		/**
		 * closeSectionArea
		 *
		 * クラス「section_area」で作成されたエリアを閉じて表示しない状態にする
		 *
		 * @param {object} aForm
		 * @param {string} aSectionClasses ... 指定セクションエリアのクラス、半角スペース区切りで複数指定可能
		 */
		closeSectionArea: function(aForm, aSectionClasses)
		{
			SateraitoWF._openSectionArea(aForm, aSectionClasses, false);
		},

		/**
		 * _openSectionArea
		 *
		 * セクションエリアを開くまたは閉じる
		 *
		 * @param {objecct} aForm
		 * @param {string} aSectionClasses ... 指定セクションエリアのクラス、半角スペース区切りで複数指定可能
		 * @param {bool} aOpen ... trueの場合開く、falseの場合閉じる
		 */
		_openSectionArea: function(aForm, aSectionClasses, aOpen)
		{
			var divMainBody = SateraitoWF.getFormMainBody(aForm);
			var sectionClassArray = String(aSectionClasses).split(' ');
			Ext.each(sectionClassArray, function(){
				var targetClass = '' + this;
				$(divMainBody).find('div.section_area').each(function(){
					var sectionArea = $(this);
					if ($(sectionArea).hasClass(targetClass)) {
						var img = $(sectionArea).find('img.section_arrow_img');
						var showHideArea = $(sectionArea).find('div.section_show_hide_area');
						var display = $(showHideArea).css('display');
						if (aOpen) {
							// 開く
							$(showHideArea).show();
							$(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowDown.gif');
						} else {
							// 閉じる
							$(showHideArea).hide();
							$(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowRight.gif');
						}
					}
				});
			});
		},

		/**
		 * 承認ルート選択ボックスを非表示にする機能
		 *
		 * @param {Object} aForm
		 */
		hideRouteSelection: function(aForm)
		{
			$('#route_selection').hide();
		},

		/**
		 * 承認ルート選択ボックスを表示する機能
		 *
		 * @param {Object} aForm
		 */
		showRouteSelection: function(aForm)
		{
			$('#route_selection').show();
		},

		/**
		 * 承認ルート（１～５、、３０）を選択する機能
		 *
		 * @param {Object} aForm
		 * @param {string} aRouteNo（1～5、、３０）
		 */
		selectRoute: function(aForm, aRouteNo)
		{
			var template_body_id = '';
			if (aForm.id == 'form_new_doc') {
				template_body_id = 'template_body_new_doc';
			} else {
				// 新規申請時以外はルートの切り替え処理は実施しない
				return;
				//var formId = aForm.id;
				//var formIdSplited = formId.split('_');
				//var docId = formIdSplited[1];
				//template_body_id = 'template_body_' + docId;
			}

			// ルート初期化が終わっていない場合は待つ対応 2013.10.19
			var obj = {
				process : function(){
					if(!ApproverCandidate.checkInitApprover(template_body_id)){
						setTimeout(obj.process, 1000);
					}else{
						var aRouteIdx = aRouteNo - 1;
						SateraitoWF.setFormValue(aForm, 'route_selection', aRouteIdx);
						$('#route_selection').trigger('change');
					}
				}
			};
			obj.process();
		},

		/**
		 * 現在アクティブな承認ルート（１～５、、３０）を取得する機能
		 *
		 * @param {Object} aForm
		 */
		getCurrentRoute: function(aForm)
		{
			var route_selection = SateraitoWF.getFormValue(aForm, 'route_selection');
			if(typeof(route_selection) != 'undefined' && route_selection != ''){
				return parseInt(route_selection, 10) + 1;
			}else{
				return 0;
			}
		},

		/**
		 * 現在開いているユーザーの承認ステップ番号（1～）を返す ※取得、特定できない場合は0が返る
		 *
		 * @param {Object} aForm
		 */
		getCurrentApproveProcessNumber: function(aForm){
			var currentApproveNo = $(aForm).find('div.route_body').find('input[name=process][current_approving=1]').attr('number');
			if(!isNaN(currentApproveNo)){
				return parseInt(currentApproveNo, 10);
			}else{
				return 0;
			}
		},

		/**
		 * 指定承認ルートに現在設定されている承認者（value）のアカウント（メールアドレス）一覧を返す
		 *
		 * @param {Object} aForm
		 * @param {number} aNumProcessNumber
		 */
		getApprovers: function(aForm, aNumProcessNumber)
		{
			var list_address = [];
			var target_value = $(aForm).find('div.route_body').find(':input[name=process][number=' + aNumProcessNumber + ']').val();
			if(typeof(target_value) != 'undefined' && target_value != '')
			{
				list_address = target_value.split(',');
			}
			return list_address;
		},

		/**
		 * 指定承認ルートに承認者を追加（ユーザーが存在しなければなにもしない）
		 *
		 * @param {Object} aForm
		 * @param {number} aNumProcessNumber
		 * @param {string} aUserKey:ユーザ指定キー（通常はメールアドレス）
		 * @param {string} aUserKeyCol: ユーザ指定キーとして使用する項目. employee_id=社員番号（省略するとメールアドレス）
		 */
		addApprover: function(aForm, aNumProcessNumber, aUserKey, aUserKeyCol)
		{
			var user = WorkflowUser.getUserByKey(aUserKey, aUserKeyCol);
			if(typeof(user) != 'undefined' && user != null){

				var template_body_id = '';
				if (aForm.id == 'form_new_doc') {
					template_body_id = 'template_body_new_doc';
				} else {
					var formId = aForm.id;
					var formIdSplited = formId.split('_');
					var docId = formIdSplited[1];
					template_body_id = 'template_body_' + docId;
				}

				// セットする承認プロセスのinputエレメント
				var processElement = $('#' + template_body_id).find('input[name=process][number=' + aNumProcessNumber + ']');
				// 承認者として追加
				ApproverCandidate.addApprover(processElement, [user.user_email], template_body_id);

			}
		},

		/**
		 * 指定承認ルートから該当の承認者を削除（ユーザーが存在しなければなにもしない）
		 *
		 * @param {Object} aForm
		 * @param {number} aNumProcessNumber
		 * @param {string} aUserKey:ユーザ指定キー（通常はメールアドレス）
		 * @param {string} aUserKeyCol: ユーザ指定キーとして使用する項目. employee_id=社員番号（省略するとメールアドレス）
		 */
		removeApprover: function(aForm, aNumProcessNumber, aUserKey, aUserKeyCol)
		{
			var user = WorkflowUser.getUserByKey(aUserKey, aUserKeyCol);
			if(typeof(user) != 'undefined' && user != null){

				var template_body_id = '';
				if (aForm.id == 'form_new_doc') {
					template_body_id = 'template_body_new_doc';
				} else {
					var formId = aForm.id;
					var formIdSplited = formId.split('_');
					var docId = formIdSplited[1];
					template_body_id = 'template_body_' + docId;
				}
				ApproverCandidate.removeApprover(aNumProcessNumber, user.user_email, template_body_id);

			}
		},

		/**
		 * 指定承認ルートの承認者を全員削除
		 *
		 * @param {Object} aForm
		 * @param {number} aNumProcessNumber
		 */
		clearApprovers: function(aForm, aNumProcessNumber)
		{
			var template_body_id = '';
			if (aForm.id == 'form_new_doc') {
				template_body_id = 'template_body_new_doc';
			} else {
				var formId = aForm.id;
				var formIdSplited = formId.split('_');
				var docId = formIdSplited[1];
				template_body_id = 'template_body_' + docId;
			}

			var list_address = SateraitoWF.getApprovers(aForm, aNumProcessNumber);
			if(list_address != null){
				Ext.each(list_address, function(user_email){
					ApproverCandidate.removeApprover(aNumProcessNumber, user_email, template_body_id);
				});
			}
		},

		/**
		 * ユーザ情報を取得：
		 *  →取得できる値は以下の通り
　　 *　　 user_email, family_name, given_name, department_1, department_2, department_3, department_4, department_5, job_title, employee_id
		 *
		 * @param {Object} aForm
		 * @param {string} aUserKey:ユーザ指定キー（通常はメールアドレス）
		 * @param {string} aUserKeyCol: ユーザ指定キーとして使用する項目. employee_id=社員番号（省略するとメールアドレス）
		 */
		getUser: function(aForm, aUserKey, aUserKeyCol)
		{
			return WorkflowUser.getUserByKey(aUserKey, aUserKeyCol);
		},

		/**
		 * getViewerUserInfo
		 *
		 * @return {object} ログイン中のユーザーのユーザー情報
		 */
		getViewerUserInfo: function()
		{
			return UserSetting.userSetting;
		},

		/**
		 * getSubmitterUserInfo
		 * @param {dom} aForm
		 * @return {object} 申請者（代理申請の場合は本来の申請者）のユーザー情報
		 */
		getSubmitterUserInfo: function(aForm)
		{
			var formId = aForm.id;
			return UserSetting.submitterSetting[formId];
		},

		/**
		 * getToday
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		getToday: function(callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				SateraitoWF._getTodayOid(callback, aNumRetry);
			} else {
				SateraitoWF._getToday(callback, aNumRetry);
			}
		},

		/**
		 * _getTodayOid
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_getTodayOid: function(callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/gettoday?hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						SateraitoWF._getTodayOid(callback, (aNumRetry + 1));

					} else {
						// １０回リトライしたがだめだった
					}
				}
			});
		},

		/**
		 * _getToday
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_getToday: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/gettoday?hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[gettoday](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							SateraitoWF._getToday(callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった
						}
					}
					return;
				}

				var jsonData = response.data;

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		}

	};

	/**
	 * SateraitoUI
	 *
	 * 画面系共通API
	 */
		SateraitoUI = {
		/**
		 * changeEnabledComponents
		 *
		 * @param {string} aDocId
		 * @param {array} aOkToUpdateField
		 */
		changeEnabledComponents : function(isEnabled){
			var cmpIds = ['approve_button', 'reject_button', 'remand_button', 'approve_button2', 'reject_button2', 'remand_button2', 'update_button', 'update_button2', 'delete_button', 'delete_button2', 'looked_button', 'looked_button2', 'resubmit_button', 'resubmit_button2', 'btn_submit_new_doc', 'btn_save_as_draft_doc'];
			for (var i = 0; i < cmpIds.length; i++){
				var cmpId = cmpIds[i];
				var cmp = Ext.getCmp(cmpId);
				if(cmp){
					if(isEnabled){
						cmp.enable();
					}else{
						cmp.disable();
					}
				}

			}
		},

		getWindowHeightWithUserPrefs: function(aHeight){
			var height;
			if(!IS_OPENID_MODE){
				var height_pref = Sateraito.GadgetHeight.getUserPrefs(aHeight);
				if(height_pref >= aHeight){
					height = aHeight;
				}else{
					height = height_pref;
				}
			}else{
				height = aHeight;
			}
			return height;
		}
	};

	/**
	 * GoogleAppsグループを管理するモジュール
	 */
	AppsGroup = {

		groupList: [],
		groupListLoadingStatus: '0',

		/**
		 * getGroupName
		 *
		 * グループメールアドレスからグループ名を返す
		 *
		 * @param {string} aEmail
		 * @return {string}
		 */
		getGroupName: function(aEmail)
		{
			var retName = aEmail;
			Ext.each(AppsGroup.groupList, function(){
				var groupId = '' + this.group_id;
				if (groupId == aEmail) {
					retName = '' + this.group_name;
				}
			});
			return retName;
		},

		/**
		 * requestAllGroupOfMember
		 *
		 * 自分の所属するグループ一覧をサーバー側メモリーにロードするのをリクエスト
		 * ロード中メッセージ非表示関数
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestAllGroupOfMember: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/group/loadallgroupofuser';
			gadgets.io.makeRequest(url, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						AppsGroup.requestAllGroupOfMember(callback, (aNumRetry + 1));
					} else {
						// １０回リトライしたがだめだった
						if (response.rc == 401) {
							// ガジェットタイムアウト
							Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));
						} else {
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}

					return;
				}

				var jsondata = response.data;

				if (typeof(callback) == 'function') {
					callback();
				}

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestGroupList
		 *
		 * ユーザー一覧をロードしローカルキャッシュにセット
		 * 既にロード済みならサーバーにリクエストせず、コールバックをキックして終わり
		 * ロード中メッセージ非表示関数
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestGroupList: function(callback, aNumRetry)
		{
			if (AppsGroup.groupList.length > 0) {
				if (typeof(callback) == 'function') {
					callback(AppsGroup.groupList);
				}
				return;
			}

			if (IS_OPENID_MODE) {
				AppsGroup._requestGroupListOid(callback, aNumRetry);
			} else {
				AppsGroup._requestGroupList(callback, aNumRetry);
			}
		},

		/**
		 * _requestGroupList
		 *
		 * ユーザー一覧を取得しローカルキャッシュにセット
		 * ガジェットIO版
		 *
		 * @param {Object} callback コールバック関数
		 * @param {Number} aNumRetry リトライ回数
		 */
		_requestGroupList: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// ローディングステータスをロード中にセット
			AppsGroup.groupListLoadingStatus = '1';

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/group/getgrouplist';
			gadgets.io.makeRequest(url, function(response) {

				// ユーザー一覧を取得したときのイベント

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// aNumRetry秒後にリトライ
						(function(){
							AppsGroup._requestGroupList(callback, (aNumRetry + 1));
						}).defer(1000 * aNumRetry);

					} else {
						// １０回リトライしたがだめだった
						AppsGroup.groupListLoadingStatus = '0';
					}

					return;
				}

				AppsGroup.groupListLoadingStatus = '2';

				var jsondata = response.data;

				// グループ一覧をセット
				AppsGroup.groupList = jsondata;

				// コールバックをキック
				if (typeof(callback) == 'function') {
					callback(jsondata);
				}

			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestGroupListOid
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestGroupListOid: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// ローディングステータスをロード中にセット
			AppsGroup.groupListLoadingStatus = '1';

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/group/oid/getgrouplist',
				success: function(response, options)
				{
					// ローディングステータスを完了にセット
					AppsGroup.groupListLoadingStatus = '2';

					var jsondata = Ext.decode(response.responseText);

					// ユーザー一覧をセット
					AppsGroup.groupList = jsondata;

					// コールバックをキック
					if (typeof(callback) == 'function') {
						callback(jsondata);
					}
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// aNumRetry秒後にリトライ
						(function(){
							AppsGroup._requestGroupListOid(callback, (aNumRetry + 1));
						}).defer(1000 * aNumRetry);

					} else {

						// １０回リトライしたがだめだった
					}
				}
			});
		}
	};


	ApproverCandidate = {

		/**
		 * checkInitApprover
		 *
		 * input name="process"のタグ初期化が終わっているかをチェック
		 *
		 * @param {string} aTemplateBodyId
		 * @param {bool} aOkWithoutDuplicate:false…本当に全て完了したかどうか true…排他制御はまだだが初期セットは終わったかどうか
		 */
		checkInitApprover: function(aTemplateBodyId, aOkWithoutDuplicate)
		{
			if(typeof(aOkWithoutDuplicate) == 'undefined'){
				aOkWithoutDuplicate = false;
			}
			var is_all_process_initialized = true;
			$('#' + aTemplateBodyId).find('input[name=process]').each(function(){
				if(aOkWithoutDuplicate && $(this).attr('initializing') == '1'){
					is_all_process_initialized = false;
					return;
				}else if(!aOkWithoutDuplicate && ($(this).attr('initializing') == '1' || $(this).attr('initializing') == '2')){
					is_all_process_initialized = false;
					return;
				}
			});
			return is_all_process_initialized;
		},

		/**
		 * isExistExclusionDuplicateApproversSetting
		 *
		 * 承認者排他制御設定があるかどうか
		 *
		 * @param {object} aTemplateBodyId
		 */
		isExistExclusionDuplicateApproversSetting: function(aTemplateBodyId)
		{
			var workflowApproverSetting = $('#' + aTemplateBodyId).find('input[name=workflow_approver_setting]');
			var exclusionDuplicateApprovers = $(workflowApproverSetting).attr('exclusion_duplicate_approvers');
			return typeof(exclusionDuplicateApprovers) != 'undefined';
		},

		/**
		 * exclusionDuplicateApprovers
		 *
		 * 承認番号をまたがって重複している承認者をチェックし除外
		 *
		 * @param {string} aTemplateBodyId
		 */
		exclusionDuplicateApprovers: function(aTemplateBodyId)
		{
			// 排他制御設定
			var workflowApproverSetting = $('#' + aTemplateBodyId).find('input[name=workflow_approver_setting]');
			var exclusionDuplicateApprovers = $(workflowApproverSetting).attr('exclusion_duplicate_approvers');
			// オプション（maximum or minimum) ※デフォルト minimum
			var exclusion_option = $(workflowApproverSetting).attr('exclusion_option');
			if(typeof(exclusion_option) == 'undefined'){
				exclusion_option = '';
			}
			if (typeof(exclusionDuplicateApprovers) != 'undefined') {
				// まず重複しているアドレスと制御分類をピックアップ、と同時に承認番号が何番まであるかをチェック
				var max_process_number = 0;
				var duplicate_infos = {};
				var exclusion_approvers_categorys = {};		// 排他制御するプロセス単位を限定する分類
				$('#' + aTemplateBodyId).find('input[name=process]').each(function(){
					var process_number = parseInt($(this).attr('number'), 10);
					if(process_number > max_process_number){
						max_process_number = process_number;
					}

					// 重複承認者を除外しないオプション
					var is_not_exclusion_duplicate_approvers = typeof($(this).attr('is_not_exclusion_duplicate_approvers')) != 'undefined';
					if(!is_not_exclusion_duplicate_approvers){

						// 重複承認者除外カテゴリー
						var exclusion_approvers_category = $(this).attr('exclusion_approvers_category');
						if(typeof(exclusion_approvers_category) == 'undefined'){
							exclusion_approvers_category = '';
						}
						if(typeof(exclusion_approvers_categorys[exclusion_approvers_category]) == 'undefined'){
							exclusion_approvers_categorys[exclusion_approvers_category] = '';
						}

						var duplicate_emails;
						if(typeof(duplicate_infos[exclusion_approvers_category]) == 'undefined'){
							duplicate_emails = {};
							duplicate_infos[exclusion_approvers_category] = duplicate_emails;
						}else{
							duplicate_emails = duplicate_infos[exclusion_approvers_category];
						}

						var aApproverList = $(this).val().split(',');
						Ext.each(aApproverList, function(){
							var email = '' + this;
							var email_lower = email.toLowerCase();
							if (email != '') {
								if(typeof(duplicate_emails[email_lower]) == 'undefined'){
									duplicate_emails[email_lower] = 0;
								}
								duplicate_emails[email_lower] = duplicate_emails[email_lower] + 1;
							}
						});
					}
				});

				// 次に改めてinput process をループし重複しているものを削除していく
				for(i = 0; i < max_process_number; i++){
					var aApproveNumber;
					// 一番番号が大きいのを残す（小さいほうから順に処理して最後のを残す）
					if(exclusion_option.toLowerCase() == 'maximum'){
						aApproveNumber = i + 1;
					// 一番番号が小さいほうを残す（大きいほうから順に処理して最後のを残す）（デフォルト）
					}else{
						aApproveNumber = max_process_number - i;
					}

					var aProcessElement = $('#' + aTemplateBodyId).find('input[name=process][number=' + aApproveNumber + ']');

					// 重複承認者を除外しないオプションが設定されているプロセスは処理しない
					var is_not_exclusion_duplicate_approvers = typeof($(aProcessElement).attr('is_not_exclusion_duplicate_approvers')) != 'undefined';
					if(!is_not_exclusion_duplicate_approvers){

						// 重複承認者除外カテゴリーごとにメールアドレス件数辞書を取得しカウントダウンして処理
						var exclusion_approvers_category = $(aProcessElement).attr('exclusion_approvers_category');
						if(typeof(exclusion_approvers_category) == 'undefined'){
							exclusion_approvers_category = '';
						}
						var duplicate_emails = duplicate_infos[exclusion_approvers_category];

						// 現在表示中の承認者リスト
						var oldApproverListStr = '' + $(aProcessElement).val();
						var oldApproverList = [];
						if (oldApproverListStr != '') {
							oldApproverList = oldApproverListStr.split(',');
						}
						// 削除後の承認者リストを作成
						var newApproverList = [];
						Ext.each(oldApproverList, function(){
							var email = '' + this;
							var email_lower = email.toLowerCase();
							var is_delete = false;
							if(typeof(duplicate_emails[email_lower]) != 'undefined'){
								// 2つ以上残っているなら削除対象
								if(duplicate_emails[email_lower] >= 2){
									duplicate_emails[email_lower] = duplicate_emails[email_lower] - 1;
									is_delete = true;
								}
							}
							if (is_delete == false) {
								newApproverList.push(email);
							}
						});

						// 新しい承認者リストで更新する
						ApproverCandidate.setNewApprovers(aProcessElement, newApproverList, aTemplateBodyId);
					}
					// 初期化完了フラグをセット
					$(aProcessElement).attr('initializing', '0');
				}
			}
		},

		/**
		 * initApprover
		 *
		 * input name="process"のタグを初期化
		 *
		 * @param {string} aTemplateBodyId
		 * @param {string} aGhostWriterOf
		 * @param {string} aRelativeDocId
		 * @param {bool} isBindButtonClickEvent
		 */
		initApprover: function(aTemplateBodyId, aGhostWriterOf, aRelativeDocId, isBindButtonClickEvent)
		{
			var isDealAfterInitialize = false;	// 全ルート初期化処理完了時の処理を実施ずみかどうか（何度も実行されないように）
			var isExistExlusionSetting = ApproverCandidate.isExistExclusionDuplicateApproversSetting(aTemplateBodyId);

			// 初期化に時間がかかるので、初期化前に「承認」ボタンなどを押されないように、「initializing=1」がついているprocessが一つでもあれば承認などができないようにする対応 2012.12.03
			$('#' + aTemplateBodyId).find('input[name=process]').each(function(){
				var element = this;
				$(element).attr('initializing', '1');
			});

			$('#' + aTemplateBodyId).find('input[name=process]').each(function(){

				var element = this;
				var approver = $(this).attr('approver');
				if(typeof(approver) == 'undefined'){
					approver = '';
				}

				// テキスト表示されてしまうので、非表示設定
				$(this).hide();

				if (approver.trim() != '') {
					var approverList = [];
					var delimiterList = [];

					// | と % を区別するために、不本意ながら一文字ずつループ...
					var temp_delimiter = '';
					var temp_approver = '';
					for(i = 0; i < approver.length; i++){
						//var c = approver[i];
						var c = approver.charAt(i);
						if(c == '|' || c == '%'){
							// ひとつ前のデータをセットしクリア
							approverList.push(temp_approver);
							delimiterList.push(temp_delimiter);
							temp_approver = '';
							temp_delimiter = '' + c;
						}else{
							temp_approver += '' + c
						}
					}
					// 最後に残ったやつを処理
					if(temp_approver != '')
					{
						approverList.push(temp_approver);
						delimiterList.push(temp_delimiter);
					}


					// 承認者取得して表示
					ApproverCandidate.requestMultiApproverCandidate(approverList, delimiterList, 0, '', aGhostWriterOf, aRelativeDocId, function(aApproverList){
						ApproverCandidate.addApprover(element, aApproverList, aTemplateBodyId);
						// 排他制御が終わるまでは初期化完了ではないので、initializing=2 を導入 2012.12.12
						if(isExistExlusionSetting){
							$(element).attr('initializing', '2');
						}else{
							$(element).attr('initializing', '0');
						}
						// 全承認プロセスが初期化完了したタイミングでの処理（排他制御以外でOK）
						if(!isDealAfterInitialize && ApproverCandidate.checkInitApprover(aTemplateBodyId, true)){
							isDealAfterInitialize = true;
							// 承認番号をまたがった承認者排他処理
							ApproverCandidate.exclusionDuplicateApprovers(aTemplateBodyId);

							// 承認者の初期化が完了した際のイベントハンドラ
							$('#' + aTemplateBodyId).find('input[type=hidden][name=new_workflow_doc_init_approver_handler]').each(function(){
								var handlerElement = this;
								var newWorkflowDocInitApproverHandler = handlerElement.onclick;
								if (typeof(newWorkflowDocInitApproverHandler) == 'function') {
									newWorkflowDocInitApproverHandler($('#' + aTemplateBodyId).parents('form')[0]);
								}
							});
						}
					});
				// approver が空の場合
				}else{
					// 排他制御が終わるまでは初期化完了ではないので、initializing=2 を導入 2012.12.12
					if(isExistExlusionSetting){
						$(element).attr('initializing', '2');
					}else{
						$(element).attr('initializing', '0');
					}
					// 全承認プロセスが初期化完了したタイミングでの処理（排他制御以外でOK）
					if(!isDealAfterInitialize && ApproverCandidate.checkInitApprover(aTemplateBodyId, true)){
						isDealAfterInitialize = true;

						// 承認番号をまたがった承認者排他処理
						ApproverCandidate.exclusionDuplicateApprovers(aTemplateBodyId);

						// 承認者の初期化が完了した際のイベントハンドラ
						$('#' + aTemplateBodyId).find('input[type=hidden][name=new_workflow_doc_init_approver_handler]').each(function(){
							var handlerElement = this;
							var newWorkflowDocInitApproverHandler = handlerElement.onclick;
							if (typeof(newWorkflowDocInitApproverHandler) == 'function') {
								newWorkflowDocInitApproverHandler($('#' + aTemplateBodyId).parents('form')[0]);
							}
						});
					}
				}
			});

			// 承認ルートを切り替えた際にボタンが必ず表示されてしまっていたので改めてイベントと表示非表示の制御をする様に対応 2012/08/01
			if(isBindButtonClickEvent){
				//
				// 部署名から追加ボタン処理
				//
				// ボタンの属性
				//
				// name="department_1_select_button" process_number="3"
				//   process_number ... 部署名から承認/回覧者を追加するプロセス番号
				//
				Department1SelectWindow.bindButtonClickEvent(aTemplateBodyId);

				//
				// ユーザー一覧から追加ボタン処理
				//
				// ボタンの属性
				//
				// name="user_select_button" process_number="3"
				//   process_number ... ユーザー一覧から承認/回覧者を追加するプロセス番号
				//
				FieldConvert.bindUserSelectButtonEvent(aTemplateBodyId);

				//
				// 承認者クリアボタン処理
				//
				// class="clear_approver_button" process_number="3"
				//  process_number ... 承認者をクリアするプロセス番号
				//
				FieldConvert.bindClearApproverButtonEvent(aTemplateBodyId);
			}
		},

		/**
		 * addApprover
		 *
		 * 承認者欄に承認者をセットし、表示
		 * 承認者欄に既にセットされている場合、追加表示
		 * 承認者定義のinputエレメントの場合、表示領域spanのクラスは「approver_name_list」になる
		 *
		 * @param {dom} aProcessElement ... 承認者定義をしているinputエレメント（<input type="text" name="process" number="3" approver="boss_mail_1|boss_mail_2" value="demo1@fminor.net,demo2@fminor.net">）
		 * @param {array of string} aApproverList(メールアドレスの配列)
		 *
		 * 承認者を更新すると、
		 * <input type="text" name="process" number="3" approver="boss_mail_1|boss_mail_2" value="demo1@fminor.net,demo2@fminor.net" updated>
		 * のように「updated」マークがつく
		 */
		addApprover: function(aProcessElement, aApproverList, aTemplateBodyId)
		{
			// 現在表示中の承認者リスト
			var oldApproverListStr = '' + $(aProcessElement).val();
			var oldApproverList = [];
			if (oldApproverListStr != '') {
				oldApproverList = oldApproverListStr.split(',');
			}
			// 承認者リストに、重複がおきないように追加
			Ext.each(aApproverList, function(){
				var email = '' + this;
				if (email != '') {
					if (oldApproverList.indexOf(email) == -1) {
						oldApproverList.push(email);
					}
				}
			});

			ApproverCandidate.setNewApprovers(aProcessElement, oldApproverList, aTemplateBodyId);
		},

		/**
		 * setNewApprovers
		 *
		 * プロセスの承認者を新しい承認者リストで置き換える
		 *
		 * @param {dom} aProcessElement
		 * @param {array} aApproverList
		 * @param {string} aTemplateBodyId
		 */
		setNewApprovers: function(aProcessElement, aApproverList, aTemplateBodyId)
		{
			var myProcessNo = $(aProcessElement).attr('number');
			var currentApproveNo = $('#' + aTemplateBodyId).find('input[name=process][current_approving=1]').attr('number');
			var okToRemoveProcessNo = $(aProcessElement).attr('ok_to_remove_process_number');	// このプロセス番号を実行中の場合、承認者を削除できる
			var okToOpenNotificationProcessNo = $(aProcessElement).attr('ok_to_open_notification_process_number');	// このプロセス番号を実行中の場合、開封通知のボタンを表示

			// 再申請プロセスかどうか
			var inReSubmitProcess = false;
			// 管理者編集プロセスかどうか
			var inAdminEditProcess = false;
			var doc_id = '';
			if(aTemplateBodyId != 'template_body_new_doc'){
				doc_id = aTemplateBodyId.substring('template_body_'.length, aTemplateBodyId.length);
				if($('#' + aTemplateBodyId).find('#in_resubmit_process_' + doc_id).val() == '1'){
					inReSubmitProcess = true;
				}
				if($('#' + aTemplateBodyId).find('#in_admin_edit_process_' + doc_id).val() == '1'){
					inAdminEditProcess = true;
				}
			}else{
				doc_id = NewDocWindow.newDocId;
			}

			var isRemovableProcess = false;
			if(inAdminEditProcess)
			{
				if($(aProcessElement).attr('ok_to_admin_edit') == '1')
				{
					isRemovableProcess = true;
				}
			}
			else
			{
				//
				// このプロセスがok_to_removeかどうかチェック
				//
				if (typeof(okToRemoveProcessNo) != 'undefined' && typeof(currentApproveNo) != 'undefined') {
					// 複数対応
					var okToRemoveProcessNos = okToRemoveProcessNo.split(' ');	// このプロセス番号を実行中の場合、承認者を削除できる
					Ext.each(okToRemoveProcessNos, function(){
						var checkApproveNo = this;
						if (checkApproveNo == currentApproveNo) {
							isRemovableProcess = true;
							return;
						}
					});
				}
				// 新規申請である（差し戻し再申請の場合も）
				if (aTemplateBodyId == 'template_body_new_doc' || inReSubmitProcess) {
					var okToRemove = $(aProcessElement).attr('ok_to_remove');
					if (typeof(okToRemove) == 'undefined' || okToRemove == null) {
						// no option
					} else {
						// ok_to_removeが設定されていて、かつ今は新規申請 or 差し戻し再申請時である
						isRemovableProcess = true;
					}
				}
			}

			// 開封通知ボタンを表示してよいプロセスかどうかをチェック
			var isOpenNotificationProcess = false;
			if(!inAdminEditProcess)
			{
				// このプロセスがok_to_open_notificationかどうかチェック
				//
				if (typeof(okToOpenNotificationProcessNo) != 'undefined' && typeof(currentApproveNo) != 'undefined') {
					// 複数対応
					var okToOpenNotificationProcessNos = okToOpenNotificationProcessNo.split(' ');	// このプロセス番号を実行中の場合、開封通知ボタンを表示できる
					Ext.each(okToOpenNotificationProcessNos, function(){
						var checkApproveNo = this;
						if (checkApproveNo == currentApproveNo) {
							isOpenNotificationProcess = true;
							return;
						}
					});
				}
				// 新規申請である（差し戻し再申請の場合も）
				if (aTemplateBodyId == 'template_body_new_doc' || inReSubmitProcess) {
					var okToOpenNotification = $(aProcessElement).attr('ok_to_open_notification');
					if (typeof(okToOpenNotification) == 'undefined' || okToOpenNotification == null) {
						// no option
					} else {
						// ok_to_open_notificationが設定されていて、かつ今は新規申請 or 差し戻し再申請時である
						isOpenNotificationProcess = true;
					}
				}
			}

			// この文書の開封通知設定情報（本申請書を開いたタイミングでサーバーから取得した情報）
			var openNotifications = WorkflowDoc.openNotifications[doc_id];

			// inputエレメントのvalueにカンマ区切りで新しいメールアドレスリストをセット
			$(aProcessElement).attr('value', Sateraito.Util.myImplode(aApproverList));

			// 更新済みマークを追加
			$(aProcessElement).attr('updated', '1');
			//var processNumber = $(aProcessElement).attr('number');

			// クリアする前に開封通知ボタンがONなアドレス一覧を退避（申請書を開いた際の初期化時にはnullがセットされているはず）
			var preClearOpenNotifications = WorkflowDoc.createOpenNotifications(aTemplateBodyId);

			// いったん名前表示を皆クリアする
			$('#' + aTemplateBodyId).find('span.approver_name_list[number=' + myProcessNo + ']').remove();

			// inputのvalueの値に基づいて名前表示を再表示
			var nameList = [];
			Ext.each(aApproverList, function(){
				var email = '' + this;
				var vHtml = '';
				vHtml += '<span title="' + Sateraito.Util.escapeHtml(email) + '">';
				vHtml += Sateraito.Util.escapeHtml(WorkflowUser.getUserName(email));
				vHtml += '</span>';
				if (isOpenNotificationProcess) {

					// クリア前に開封通知がONかどうかを判別
					var is_pre_clear_on_open_notification = false;
					if(preClearOpenNotifications != null){
						var hash_pcs = preClearOpenNotifications[myProcessNo];
						if(typeof(hash_pcs) != 'undefined'){
							if(typeof(hash_pcs['target_approvers']) != 'undefined'){
								var target_approvers = hash_pcs['target_approvers'];
								for(i = 0; i < target_approvers.length; i++){
									var target_approver = target_approvers[i];
									if(email.toLowerCase() == target_approver.toLowerCase()){
										is_pre_clear_on_open_notification = true;
										break;
									}
								}
							}
						}
					}

					// このプロセスの開封状況情報を取得
					var result = WorkflowDoc.getOpenNotificationStatus(openNotifications, myProcessNo, email);
					// この承認プロセスの承認者の開封通知リクエストがONになっているかどうか
					var is_on_open_notification = is_pre_clear_on_open_notification || result[0];
					// この承認プロセスの承認者の開封通知状況を取得
					var open_status = result[1];

					if(!IS_PRINT_WINDOW){
						if(is_on_open_notification){
							vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_on.png" class="btn_open_notification" email="' + email + '" status="on" style="padding-left:2px;height:14px;cursor:pointer;" onclick="ApproverCandidate.toggleOpenNotificationButton(' + myProcessNo + ', \'' + email + '\', \'' + aTemplateBodyId + '\');" title="' + MyLang.getMsg('OPEN_NOTIFICATION_ON') + '">';
						}else{
							vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_off.png" class="btn_open_notification" email="' + email + '" status="off" style="padding-left:2px;height:14px;cursor:pointer;" onclick="ApproverCandidate.toggleOpenNotificationButton(' + myProcessNo + ', \'' + email + '\', \'' + aTemplateBodyId + '\');" title="' + MyLang.getMsg('OPEN_NOTIFICATION_OFF') + '">';
						}
					}
				}
				if (!IS_PRINT_WINDOW && isRemovableProcess) {
					vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/btn_delete.png" style="cursor:pointer;" onclick="ApproverCandidate.removeApprover(' + myProcessNo + ', \'' + email + '\', \'' + aTemplateBodyId + '\');">';
				}
				nameList.push(vHtml);
			});

			// 名前についてはカンマのあとに半角スペースを入れる
			$(aProcessElement).after('<span class="approver_name_list" number="' + myProcessNo + '">' + Sateraito.Util.myImplode(nameList, ', ') + '</span>');
		},

		/**
		 * toggleOpenNotificationButton
		 *
		 * 開封通知ボタンを切り替える
		 *
		 * @param {string} aApproveNumber
		 * @param {string} aEmail
		 * @param {string} aTemplateBodyId
		 */
		toggleOpenNotificationButton: function(aApproveNumber, aEmail, aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('span.approver_name_list[number=' + aApproveNumber + ']').find('img.btn_open_notification[email=\'' + aEmail + '\']').each(function(){

				var img = $(this);
				if(img.attr('status') == 'on'){
					img.attr('src',  SATERAITO_MY_SITE_URL + '/images/open_notification_off.png');
					img.attr('status',  'off');
					img.attr('title',  MyLang.getMsg('OPEN_NOTIFICATION_OFF'));
				}else{
					img.attr('src',  SATERAITO_MY_SITE_URL + '/images/open_notification_on.png');
					img.attr('status',  'on');
					img.attr('title',  MyLang.getMsg('OPEN_NOTIFICATION_ON'));
				}
			});
		},

		/**
		 * removeApprover
		 *
		 * 承認者を一人削除する
		 *
		 * @param {string} aApproveNumber
		 * @param {string} aEmail
		 * @param {string} aTemplateBodyId
		 */
		removeApprover: function(aApproveNumber, aEmail, aTemplateBodyId)
		{
			var aProcessElement = $('#' + aTemplateBodyId).find('input[name=process][number=' + aApproveNumber + ']');

			// 現在表示中の承認者リスト
			var oldApproverListStr = '' + $(aProcessElement).val();
			var oldApproverList = [];
			if (oldApproverListStr != '') {
				oldApproverList = oldApproverListStr.split(',');
			}
			// 削除後の承認者リストを作成
			var newApproverList = [];
			Ext.each(oldApproverList, function(){
				if ('' + this != aEmail) {
					newApproverList.push('' + this)
				}
			});

			// 新しい承認者リストで更新する
			ApproverCandidate.setNewApprovers(aProcessElement, newApproverList, aTemplateBodyId);
		},

		/**
		 * requestApproverCandidate
		 *
		 * @param {String} aFilter
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		requestApproverCandidate: function(aFilter, aAdditionalFilter, aGhostWriterOf, aRelativeDocId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			if(typeof(aRelativeDocId) == 'undefined'){
				aRelativeDocId = '';
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getapprovercandidate?filter=' + encodeURIComponent(aFilter) + '&additional_filter=' + encodeURIComponent(aAdditionalFilter) + '&ghost_writer_of=' + encodeURIComponent(aGhostWriterOf) + '&relative_doc_id=' + encodeURIComponent(aRelativeDocId) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getapprovercandidate](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							// リトライ
							ApproverCandidate.requestApproverCandidate(aFilter, aAdditionalFilter, aGhostWriterOf, aRelativeDocId, callback, (aNumRetry + 1));
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}

					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestMultiApproverCandidate
		 *
		 * @param {String} filterApproverList リスト 例： boss_email1, boss_email2
		 * @param {String} filterIdx:今回処理対象のリストインデックス（0～) ※Ajax１コールの負荷軽減のため1承認者ずつ処理
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		requestMultiApproverCandidate: function(filterApproverList, filterDelimiterList, filterIdx, aAdditionalFilter, aGhostWriterOf, aRelativeDocId, callback, aNumRetry, results)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			if(typeof(aRelativeDocId) == 'undefined'){
				aRelativeDocId = '';
			}

			if(typeof(results) == 'undefined') {
				results = [];
			}

			var aFilter = filterApproverList[filterIdx];
			var aDelimiter = filterDelimiterList[filterIdx];

			// % 対応：% はこれまでの（左の）指定で、実際に誰もいなければ処理、いればスキップ.
			if(aDelimiter == '%' && results.length > 0){
				// 最後の承認者を処理したらコールバックをキック
				if(filterApproverList.length - 1 <= filterIdx){
					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();
					callback(results);
				// 次の承認者を処理
				}else{
					ApproverCandidate.requestMultiApproverCandidate(filterApproverList, filterDelimiterList, filterIdx + 1, aAdditionalFilter, aGhostWriterOf, aRelativeDocId, callback, 0, results);
				}
				return;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getapprovercandidate?filter=' + encodeURIComponent(aFilter) + '&additional_filter=' + encodeURIComponent(aAdditionalFilter) + '&ghost_writer_of=' + encodeURIComponent(aGhostWriterOf) + '&relative_doc_id=' + encodeURIComponent(aRelativeDocId) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getapprovercandidate](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							ApproverCandidate.requestMultiApproverCandidate(filterApproverList, filterDelimiterList, filterIdx, aAdditionalFilter, aGhostWriterOf, aRelativeDocId, callback, (aNumRetry + 1), results);
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;
				results = results.concat(jsonData);

				// 最後の承認者を処理したらコールバックをキック
				if(filterApproverList.length - 1 <= filterIdx){

					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();

					callback(results);

				// 次の承認者を処理
				}else{
					ApproverCandidate.requestMultiApproverCandidate(filterApproverList, filterDelimiterList, filterIdx + 1, aAdditionalFilter, aGhostWriterOf, aRelativeDocId, callback, 0, results);
				}

			}, Sateraito.Util.requestParam());
		}

	};

	Department1SelectWindow = {

		/**
		 * bindButtonClickEvent
		 *
		 * 部署名から追加ボタン処理
		 *
		 * ボタンの属性
		 *
		 * class="department_1_select_button" process_number="3" ok_to_show_process_number="2"
		 *   process_number ... 部署名から承認/回覧者を追加するプロセス番号
		 *   ok_to_show_process_number ... この承認プロセスの時にボタンを表示、という指定
		 *
		 * @param {string} aTemplateBodyId
		 */
		bindButtonClickEvent: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input[type=button].department_1_select_button').unbind('click',false);
			$('#' + aTemplateBodyId).find('input[type=button].department_1_select_button').bind('click', function(){
				var processNumber = $(this).attr('process_number');
				var additionalFilter = $(this).attr('additional_filter');
				if (typeof(additionalFilter) == 'undefined' || additionalFilter == null) {
					additionalFilter = '';
				}
				Department1SelectWindow.showWindow(processNumber, aTemplateBodyId, additionalFilter);
			});

			// 再申請プロセスかどうか
			var inReSubmitProcess = false;
			var doc_id = '';
			if(aTemplateBodyId != 'template_body_new_doc'){
				doc_id = aTemplateBodyId.substring('template_body_'.length, aTemplateBodyId.length);
				if($('#' + aTemplateBodyId).find('#in_resubmit_process_' + doc_id).val() == '1'){
					inReSubmitProcess = true;
				}
			}

			// もし「ok_to_show_process_number」が指定されていた場合、新規作成時は表示しない（差し戻し再申請の場合も）
			// --> その承認段階が来たら、表示するため
			if (aTemplateBodyId == 'template_body_new_doc' || inReSubmitProcess) {
				$('#template_body_new_doc').find('input[type=button].department_1_select_button').each(function(){
					var okToShowProcessNumber = $(this).attr('ok_to_show_process_number');
					if (okToShowProcessNumber == null) {
						// no option
					} else {
						// 指定されていたので、新規作成時に表示しない
						$(this).hide();
					}
				});
			}
		},

		/**
		 * onSelectClick
		 *
		 * 選択ボタンをクリックした時の動作
		 *
		 * @param {string} aProcessNumber
		 * @param {string} aTemplateBodyId
		 */
		onSelectClick: function(aProcessNumber, aTemplateBodyId, aAdditionalFilter)
		{
			var grid = Ext.ComponentMgr.get('department_1_grid');
			var sm = grid.selModel;
			var record = sm.getSelected();
			if (typeof(record) != 'undefined') {

				var selctedColValue = record.data['department_1'];

				var processElement = $('#' + aTemplateBodyId).find('input[name=process][number=' + aProcessNumber + ']');
				var filter = 'department_1:' + selctedColValue;
				// 部署名から選択の場合、代理申請の場合でも候補は変わらないので代理申請は考慮しないでおく
				// ダイレクトに一名セットするだけなので関連付元文書IDのセットもしないでおく
				ApproverCandidate.requestApproverCandidate(filter, aAdditionalFilter, '', '', function(aApproverList){

					ApproverCandidate.addApprover(processElement, aApproverList, aTemplateBodyId);
				});

				Ext.ComponentMgr.get('department_1_window').close();
			}
		},

		/**
		 * createGrid
		 *
		 * 部署名１用グリッド
		 */
		createGrid: function(aProcessNumber, aTemplateBodyId, aAdditionalFilter)
		{
			Department1.dataStore = Department1.createDataStore();

			var cols = [];

			cols.push({
				id: 'department_1',
				header: MyLang.getMsg('DEPARTMENT_NAME'),	// 部署名
				width: 200,
				menuDisabled: true,
				sortable: true,
        renderer: Sateraito.Util.vhBasic,
				dataIndex: 'department_1'
			});

			return new Ext.grid.GridPanel({
				id: 'department_1_grid',
				bodyStyle: 'background-color:white;',
				columns: cols,
				store: Department1.dataStore,
				plain: true,
				stripeRows: true,
				listeners: {
					'rowdblclick': function(grid, row, e)
					{
						Department1SelectWindow.onSelectClick(aProcessNumber, aTemplateBodyId, aAdditionalFilter);
					},
					'afterrender': function()
					{
						// 部署名一覧を読み込み
						Department1.requestDepartment1List(true, function(aJsonData){
							// データ追加
							var datas = [];

							Ext.each(aJsonData, function(){
								datas.push([
									'' + this
								]);
							});

							// データストアにデータをロードし、グリッドに表示させる
							Department1.dataStore.loadData(datas);
						});
					}
				}
			});
		},

		/**
		 * showWindow
		 *
		 * マスター参照用ウィンドウを表示する
		 *
		 * @param {string} aProcessNumber
		 * @param {string} aTemplateBodyId
		 */
		showWindow: function(aProcessNumber, aTemplateBodyId, aAdditionalFilter)
		{
			// 既に表示されていたら、前面に出す
			var existingWindow = Ext.ComponentMgr.get('department_1_window');
			if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
				existingWindow.toFront();
				return;
			}

			// キャッシュOKで部署名１一覧を取得
			Department1.requestDepartment1List(true, function(aDepartment1List){

				// 既に表示されていたら、前面に出す
				var existingWindow = Ext.ComponentMgr.get('department_1_window');
				if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
					existingWindow.toFront();
					return;
				}

				var grid = Department1SelectWindow.createGrid(aProcessNumber, aTemplateBodyId, aAdditionalFilter);
				var buttons = [];
				// 選択ボタン
				buttons.push({
					text: MyLang.getMsg('SELECT'),
					handler: function()
					{
						Department1SelectWindow.onSelectClick(aProcessNumber, aTemplateBodyId, aAdditionalFilter);
					}
				});
				// キャンセルボタン
				buttons.push({
					text: MyLang.getMsg('CANCEL'),
					handler: function(){
						Ext.ComponentMgr.get('department_1_window').close();
					}
				});

				var detailWindow = new Ext.Window({
					id: 'department_1_window',
					width: 250,
					height: SateraitoUI.getWindowHeightWithUserPrefs(200),
					title: MyLang.getMsg('SELECT_DEPARTMENT1'),
					plain: true,
					autoScroll: false,
					layout: 'fit',
					items: [grid],
					modal: true,
					buttons: buttons
				});
				detailWindow.show();
				// ウインドウの移動範囲を制約
				detailWindow.dd.constrainTo(Ext.getBody());

			});
		}
	};

	UserSelectWindow = {

		/**
		 * createDataStore
		 *
		 * @return {Ext.data.ArrayStore}
		 */
		createDataStore: function()
		{
			return new Ext.data.ArrayStore({
				id: 'user_info_store',
				fields: [
					{name: 'email'},
					{name: 'user_name'},
					{name: 'department_1'}
				]
			});
		},

		/**
		 * onSelectClick
		 *
		 * 選択ボタンをクリックした時の動作
		 *
		 * @param {string} aProcessNumber
		 * @param {string} aTemplateBodyId
		 */
		onSelectClick: function(aProcessNumber, aTemplateBodyId)
		{
			var grid = Ext.ComponentMgr.get('user_select_grid');
			var sm = grid.selModel;
			// 複数選択に対応
			//var record = sm.getSelected();
			var records = sm.getSelections();
			if (typeof(records) != 'undefined' && records.length > 0) {

				// 選択されたユーザーのメールアドレス
				var selectedColValues = [];
				Ext.each(records, function(){
					var record = this;
					var selectedColValue = record.data['email'];
					selectedColValues.push(selectedColValue);
				});

				// セットする承認プロセスのinputエレメント
				var processElement = $('#' + aTemplateBodyId).find('input[name=process][number=' + aProcessNumber + ']');

				// 承認者として追加
				ApproverCandidate.addApprover(processElement, selectedColValues, aTemplateBodyId);

				// ウィンドウを閉じる
				Ext.ComponentMgr.get('user_select_window').close();
			}
		},

		/**
		 * createGrid
		 *
		 * ユーザー一覧グリッド
		 */
		createGrid: function(aProcessNumber, aTemplateBodyId)
		{
			var dataStore = UserSelectWindow.createDataStore();

			var cols = [];

			cols.push({
				id: 'email',
				header: MyLang.getMsg('FLD_EMAIL'),
				width: 110,
				menuDisabled: true,
				sortable: true,
        renderer: Sateraito.Util.vhBasic,
				dataIndex: 'email'
			});
			cols.push({
				id: 'user_name',
				header: MyLang.getMsg('FLG_USER_NAME'),
				width: 110,
				menuDisabled: true,
				sortable: true,
        renderer: Sateraito.Util.vhBasic,
				dataIndex: 'user_name'
			});
			cols.push({
				id: 'department_1',
				header: MyLang.getMsg('FLD_DEPARTMENT_1'),		// ※管理画面の一覧と合わせる意味で文言変更 2013.01.31
				width: 110,
				menuDisabled: true,
				sortable: true,
        renderer: Sateraito.Util.vhBasic,
				dataIndex: 'department_1'
			});

			return new Ext.grid.GridPanel({
				id: 'user_select_grid',
				bodyStyle: 'background-color:white;',
				columns: cols,
				store: dataStore,
				plain: true,
				stripeRows: true,
				listeners: {
					'rowdblclick': function(grid, row, e)
					{
						UserSelectWindow.onSelectClick(aProcessNumber, aTemplateBodyId);
					}
				}
			});
		},

		/**
		 * onSearchClick
		 *
		 * 「検索」ボタンをクリックしたとき
		 */
		onSearchClick: function()
		{
			var MAX_SEARCH_RESULT = 100;

			var MyDataRecord = Ext.data.Record.create([
				{ name: 'email' },
				{ name: 'user_name' },
				{ name: 'department_1' }
			]);

			var userStore = Ext.ComponentMgr.get('user_select_grid').getStore();
			userStore.removeAll();

			var searchText = Ext.ComponentMgr.get('user_select_search_keyword').getValue();
			searchText = searchText.trim();

			var cntResult = 0;

			var nullToZeroStr = function(aParam){
				if (aParam == null) {
					return '';
				}
				return aParam;
			};

			if (searchText == '') {
				// 全件表示
//				Ext.each(UserInfo.userInfoList, function(){
				Ext.each(WorkflowUser.userList, function(){

					cntResult++;
					if (cntResult > MAX_SEARCH_RESULT) {
						alert(MyLang.getMsg('MSG_SEARCH_RESULT_MORETHAN_MAX_RESULT_THRESHOLD'));	// 100行以上の検索結果が見つかりました。最初の100行だけ表示します。
						return false;
					}

					var userEmail = nullToZeroStr(this.user_email);
					var userName = nullToZeroStr(this.family_name) + ' ' + nullToZeroStr(this.given_name);
					var department1 = nullToZeroStr(this.department_1);

					var newRecord = new MyDataRecord({
						email: userEmail,
						user_name: userName,
						department_1: department1
					});
					userStore.add(newRecord);
				});
				return;
			}

			// 通常検索
//			Ext.each(UserInfo.userInfoList, function(){
			Ext.each(WorkflowUser.userList, function(){
				var userEmail = nullToZeroStr(this.user_email);
				var userName = nullToZeroStr(this.family_name) + ' ' + nullToZeroStr(this.given_name);
				var department1 = nullToZeroStr(this.department_1);

				if (userEmail.indexOf(searchText) != -1
				   || userName.indexOf(searchText) != -1
				   || department1.indexOf(searchText) != -1) {

					// キーワードにマッチした

					cntResult++;
					if (cntResult > MAX_SEARCH_RESULT) {
						alert(MyLang.getMsg('MSG_SEARCH_RESULT_MORETHAN_MAX_RESULT_THRESHOLD'));
						return false;
					}

					var newRecord = new MyDataRecord({
						email: userEmail,
						user_name: userName,
						department_1: department1
					});
					userStore.add(newRecord);
				}
			});
		},

		/**
		 * showWindow
		 *
		 * ユーザー検索用ウィンドウを表示する
		 *
		 * @param {string} aProcessNumber
		 * @param {string} aTemplateBodyId
		 */
		showWindow: function(aProcessNumber, aTemplateBodyId)
		{
			// 既に表示されていたら、前面に出す
			var existingWindow = Ext.ComponentMgr.get('user_select_window');
			if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
				existingWindow.toFront();
				return;
			}

//			// キャッシュOKでユーザー一覧を取得
//			UserInfo.requestUserInfo(null, true, function(aUserInfoList){

			// 既に表示されていたら、前面に出す
			var existingWindow = Ext.ComponentMgr.get('user_select_window');
			if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
				existingWindow.toFront();
				return;
			}

			var grid = UserSelectWindow.createGrid(aProcessNumber, aTemplateBodyId);
			var buttons = [];
			// 選択ボタン
			buttons.push({
				text: MyLang.getMsg('SELECT'),
				handler: function()
				{
					UserSelectWindow.onSelectClick(aProcessNumber, aTemplateBodyId);
				}
			});
			// キャンセルボタン
			buttons.push({
				text: MyLang.getMsg('CANCEL'),
				handler: function(){
					Ext.ComponentMgr.get('user_select_window').close();
				}
			});

			var inputBox = new Ext.form.TextField({
				id: 'user_select_search_keyword',
				listeners: {
					'specialkey': function(f, e){
						if (e.getKey() == e.ENTER) {
							UserSelectWindow.onSearchClick();
						}
					}
				}
			});
			var searchButton = new Ext.Button({
				text: MyLang.getMsg('SEARCH'),
				handler: UserSelectWindow.onSearchClick
			});

			inputBox.region = 'center';
			searchButton.region = 'east';

			var searchPanel = new Ext.Panel({
				height: 30,
				layout: 'border',
				items: [inputBox, searchButton]
			});

			searchPanel.region = 'north';
			grid.region = 'center';

			var detailWindow = new Ext.Window({
				id: 'user_select_window',
				width: 400,
				height: SateraitoUI.getWindowHeightWithUserPrefs(300),
				title: MyLang.getMsg('USER_SEARCH'),
				plain: true,
				autoScroll: false,
				layout: 'border',
				modal: true,
				items: [searchPanel, grid],
				buttons: buttons
			});
			detailWindow.show();
			// ウインドウの移動範囲を制約
			detailWindow.dd.constrainTo(Ext.getBody());

//			});
		}
	};

	OidMiniMessage = {

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
		 * 読込中メッセージを表示する
		 */
		showLoadingMessage: function()
		{
			// ミニメッセージを消去
			$('#mini_message').html('');
			$('#mini_message').css('width', '250px');

			// メッセージの位置を再配置
			var bodyWidth = $('#mini_message').parent().width();
			var messageAreaWidth = $('#mini_message').width();
			$('#mini_message').css('left', '' + ((bodyWidth / 2) - (messageAreaWidth / 2)) + 'px');

			// ミニメッセージを表示
			$('#mini_message').text(MyLang.getMsg('LOADING'))
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

			// ミニメッセージを消去
			$('#mini_message').html('');
			$('#mini_message').css('width', '350px');

			// ミニメッセージの位置を再配置
			var bodyWidth = $('#mini_message').parent().width();
			var messageAreaWidth = $('#mini_message').width();
			$('#mini_message').css('left', '' + ((bodyWidth / 2) - (messageAreaWidth / 2)) + 'px');

			// ミニメッセージを表示
			$('#mini_message').text(aMessage)
				.css('font-size', '1.4em')
				.css('width', '350px')
				.css('font-weight', 'bold')
				.css('background-color', 'lemonchiffon')
				.css('text-align', 'center');

			(function(){
				// ミニメッセージを消去
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
			// ミニメッセージを消去
			$('#mini_message').html('');
			$('#mini_message').css('width', '400px');

			// ミニメッセージの位置を再配置
			var bodyWidth = $('#mini_message').parent().width();
			var messageAreaWidth = $('#mini_message').width();
			$('#mini_message').css('left', '' + ((bodyWidth / 2) - (messageAreaWidth / 2)) + 'px');

			// ミニメッセージを表示
			$('#mini_message').text(aMessage)
				.css('font-size', '1.2em')
				.css('width', '400px')
				.css('font-weight', 'bold')
				.css('background-color', 'pink')
				.css('text-align', 'center');

			(function(){
				// ミニメッセージを消去
				$('#mini_message').html('').css('width', '0px');
			}).defer(3000);
		}
	};

	Hanko = {

		/**
		 * renderWaku
		 *
		 * ハンコ用の枠のみを描画する
		 *
		 * @param {number} aRadius
		 * @param {canvas} aCanvas
		 * @param {string} aTopStr
		 * @param {string} aMiddleStr
		 * @param {string} aLowStr
		 */
		renderWaku: function(aCanvas)
		{
			if(typeof(aCanvas) == 'undefined' || typeof(aCanvas.getContext) == 'undefined'){
				return;
			}
			var context = aCanvas.getContext('2d');
			var centerX = aCanvas.width / 2;
			var centerY = aCanvas.height / 2;
			context.lineWidth = 2;
			context.strokeStyle = 'red'; // line color
			context.stroke();
		},

		/**
		 * renderHanko
		 *
		 * ハンコを描画する
		 *
		 * @param {number} aRadius
		 * @param {canvas} aCanvas
		 * @param {string} aTopStr
		 * @param {string} aMiddleStr
		 * @param {string} aLowStr
		 */
		renderHanko: function(aRadius, aCanvas, aTopStr, aMiddleStr, aLowStr)
		{
			if(typeof(aCanvas) == 'undefined' || typeof(aCanvas.getContext) == 'undefined'){
				return;
			}
			$(aCanvas).addClass('vml');
			var context = aCanvas.getContext('2d');
			var centerX = aCanvas.width / 2;
			var centerY = aCanvas.height / 2;
			var radius = aRadius;
			var startingAngle = 0;
			var endingAngle = 2 * Math.PI;
			var counterclockwise = false;
			context.arc(centerX, centerY, radius, startingAngle, endingAngle, counterclockwise);
			context.lineWidth = 2;
			context.strokeStyle = 'red'; // line color
			context.stroke();

			var degree = 16; // 16度
			var x = radius * Math.cos(degree * (Math.PI / 180));
			var y = radius * Math.sin(degree * (Math.PI / 180))

			context.beginPath();
			context.moveTo(centerX + x, centerY + y);
			context.lineTo(centerX + (x * (-1)), centerY + y);
			context.moveTo(centerX + x, centerY + (y * (-1)));
			context.lineTo(centerX + (x * (-1)), centerY + (y * (-1)));
			context.stroke();

			//context.font = "normal " + (radius * 0.35) + "px 'メイリオ,Meiryo,Hiragino Kaku Gothic Pro,ヒラギノ角ゴ Pro W3,ＭＳ Ｐゴシック'";
			context.font = "normal " + (radius * 0.35) + "px 'ＭＳ 明朝'";
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = 'red';

			context.fillText(aMiddleStr, centerX, centerY);
			context.fillText(aTopStr, centerX, centerY - (radius * 0.6));
			// ユーザー名のみ全体が入るようにフォントサイズ調整 2014.05.19
			//context.fillText(aLowStr, centerX, centerY + (radius * 0.55));
			// 文字列のバイト数をカウント
			var countLength = function(str) {
				var r = 0;
				for (var i = 0; i < str.length; i++) {
					var c = str.charCodeAt(i);
					// Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
					// Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
					if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
						r += 1;
					} else {
						r += 2;
					}
				}
				return r;
			};

			// 文字列をバイト数で区切るためのインデックスを算出
			var splitStrIdx = function(str, len){
				var split_idx = 0;
				var r = 0;
				for (var i = 0; i < str.length; i++) {
					var c = str.charCodeAt(i);
					if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
						r += 1;
					} else {
						r += 2;
					}
					if(r > len){
						split_idx = i;
						break;
					}
				}
				return split_idx;
			};

			var each_row_char_length = 13;		// 全角6.5文字までならフォントサイズを小さくして一行にセットできる
			var low_str_length = countLength(aLowStr);
			if(low_str_length == each_row_char_length){
				context.font = "normal " + (radius * 0.15) + "px 'ＭＳ 明朝'";
				context.fillText(aLowStr, centerX, centerY + (radius * 0.55));
			}else if(low_str_length > each_row_char_length){
				var split_idx = splitStrIdx(aLowStr, each_row_char_length);
				context.font = "normal " + (radius * 0.15) + "px 'ＭＳ 明朝'";
				context.fillText(aLowStr.substring(0, split_idx), centerX, centerY + (radius * 0.45));
				context.fillText(aLowStr.substring(split_idx), centerX, centerY + (radius * 0.8));
			}else{
				context.fillText(aLowStr, centerX, centerY + (radius * 0.55));
			}

		}

	};


	UserSetting = {

		userSetting: {},
		submitterSetting: {},

		/**
		 * getUserName
		 *
		 * ログイン中ユーザーのユーザー名を返す
		 * 代理申請の場合でも、ログイン中ユーザーのユーザー名を返す
		 */
		getUserName: function()
		{
			return UserSetting.userSetting.family_name + ' ' + UserSetting.userSetting.given_name;
		},

		/**
		 * requestUserSetting
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestUserSetting: function(callback, aEmailGhostWriterOf, aNumRetry)
		{
			if (typeof(aEmailGhostWriterOf) == 'undefined') {
				aEmailGhostWriterOf = '';
			}

			if (IS_OPENID_MODE) {
				UserSetting._requestUserSettingOid(callback, aEmailGhostWriterOf, aNumRetry);
			} else {
				UserSetting._requestUserSetting(callback, aEmailGhostWriterOf, aNumRetry);
			}
		},

		/**
		 * _requestUserSetting
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestUserSetting: function(callback, aEmailGhostWriterOf, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getusersetting?ghost_writer_of=' + encodeURIComponent(aEmailGhostWriterOf) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getusersetting](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						// 全画面ロードマスクを消去
						DisplayMgr.hideLoadMask();
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							// リトライ
							UserSetting._requestUserSetting(callback, aEmailGhostWriterOf, (aNumRetry + 1));
						} else {
							// 全画面ロードマスクを消去
							DisplayMgr.hideLoadMask();
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// 代理申請者のユーザー設定でない場合、保存する
				if (jsonData.status == 'ok' && aEmailGhostWriterOf == '') {
					// ユーザー設定を保存
					UserSetting.userSetting = jsonData.user_setting;
				}

				// コールバックをキック
				callback(jsonData.status, jsonData.user_setting);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestUserSettingOid
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestUserSettingOid: function(callback, aEmailGhostWriterOf, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getusersetting?ghost_writer_of=' + encodeURIComponent(aEmailGhostWriterOf) + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 代理申請者のユーザー設定でない場合、保存する
					if (jsonData.status == 'ok' && aEmailGhostWriterOf == '') {
						// ユーザー設定を保存
						UserSetting.userSetting = jsonData.user_setting;
					}

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData.status, jsonData.user_setting);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						UserSetting._requestUserSettingOid(callback, aEmailGhostWriterOf, (aNumRetry + 1));

					} else {

						// 全画面ロードマスクを消去
						DisplayMgr.hideLoadMask();
						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * requestUpdateUserSetting
		 *
		 * @param {Object} aUserSetting
		 * @param {function} callback
		 */
		requestUpdateUserSetting: function(aUserSetting, callback)
		{
			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('UPDATING'));

			// 送信データ作成
			var postData = {
				'deputy_approvers': aUserSetting.deputy_approvers,
				'ghost_writers': aUserSetting.ghost_writers,
				'language': aUserSetting.language,
				'timezone': aUserSetting.timezone,
				'token': MyUtil.getToken(),
				'hl':SATERAITO_LANG
			};

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/updateusersetting', function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[updateusersetting]' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else if(response.rc == 403){
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('MSG_CSRF_CHECK'), 10);
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_UPDATING'), 10);
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				callback(jsonData);

			}, Sateraito.Util.requestParam(true, postData));
		}
	};

	ApproverCommentDict = {

		/**
		 * requestApproverCommentDict
		 *
		 * @param {string} aDocId
		 * @param {string} aProcessNumber
		 * @param {function} callback
		 */
		requestApproverCommentDict: function(aDocId, aProcessNumber, callback)
		{
			if (IS_OPENID_MODE) {
				ApproverCommentDict._requestApproverCommentDictOid(aDocId, aProcessNumber, callback);
			} else {
				ApproverCommentDict._requestApproverCommentDict(aDocId, aProcessNumber, callback);
			}
		},

		/**
		 * _requestApproverCommentDictOid
		 *
		 * @param {string} aDocId
		 * @param {string} aProcessNumber
		 * @param {function} callback
		 */
		_requestApproverCommentDictOid: function(aDocId, aProcessNumber, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getapprovercommentdict?doc_id=' + aDocId + '&process_number=' + encodeURIComponent(aProcessNumber) + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						ApproverCommentDict._requestApproverCommentDictOid(aDocId, aProcessNumber, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _requestApproverCommentDict
		 *
		 * @param {string} aDocId
		 * @param {string} aProcessNumber
		 * @param {function} callback
		 */
		_requestApproverCommentDict: function(aDocId, aProcessNumber, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getapprovercommentdict?doc_id=' + aDocId + '&process_number=' + encodeURIComponent(aProcessNumber) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getapprovercommentdict](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							// リトライ
							ApproverCommentDict._requestApproverCommentDict(aDocId, aProcessNumber, callback, (aNumRetry + 1));
						} else {
							// １０回リトライしたがだめだった
							// 読込中メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		}
	};

	QandA = {

		/**
		 * postAnswer
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {string} aQuestionNo
		 * @param {string} aAnswerDetail
		 * @param {string} IsStopAutoApproveWithoutAnswer
		 * @param {string} ExpandRateApproveExpireDate
		 * @param {function} callback
		 */
		postAnswer: function(aDocId, aQandAName, aQuestionNo, aAnswerDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback)
		{
			if (IS_OPENID_MODE) {
				QandA._postAnswerOid(aDocId, aQandAName, aQuestionNo, aAnswerDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback);
			} else {
				QandA._postAnswer(aDocId, aQandAName, aQuestionNo, aAnswerDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback);
			}
		},

		/**
		 * _postAnswer
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {string} aQuestionNo
		 * @param {string} aAnswerDetail
		 * @param {string} IsStopAutoApproveWithoutAnswer
		 * @param {string} ExpandRateApproveExpireDate
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_postAnswer: function(aDocId, aQandAName, aQuestionNo, aAnswerDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('UPDATING'));

			var postData = {};
			// ドキュメントID
			postData['doc_id'] = aDocId;
			// Q&A名
			postData['q_and_a_name'] = aQandAName;
			// 質問番号
			postData['question_no'] = aQuestionNo;
			// 回答内容
			postData['answer_detail'] = aAnswerDetail;
			// 「質問」文言
			postData['word_for_question'] = aWordForQuestion;
			// 回答のない質問がある場合は自動承認をしないフラグ
			postData['is_stop_auto_approve_without_answer'] = IsStopAutoApproveWithoutAnswer;
			// 回答にかかった時間の×何倍、承認期限日を延期するか
			postData['expand_rate_approve_expire_date'] = ExpandRateApproveExpireDate;
			// 言語設定
			postData['hl'] = SATERAITO_LANG
			postData['token'] = MyUtil.getToken()

			// 質問を投稿
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/postanswer', function(response){

				// メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[postanswer](' + aNumRetry + ')' + err);

					// エラーの場合、falseでコールバックをキック
					callback(false);
					return;
				}

				var jsonData = response.data;

				// コールバックをキック
				callback(true);
			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * _postAnswerOid
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {string} aQuestionNo
		 * @param {string} aAnswerDetail
		 * @param {string} IsStopAutoApproveWithoutAnswer
		 * @param {string} ExpandRateApproveExpireDate
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_postAnswerOid: function(aDocId, aQandAName, aQuestionNo, aAnswerDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			OidMiniMessage.showNormalMiniMessage(MyLang.getMsg('UPDATING'));

			var postData = {};
			// ドキュメントID
			postData['doc_id'] = aDocId;
			// Q&A名
			postData['q_and_a_name'] = aQandAName;
			// 質問番号
			postData['question_no'] = aQuestionNo;
			// 回答内容
			postData['answer_detail'] = aAnswerDetail;
			// 「質問」文言
			postData['word_for_question'] = aWordForQuestion;
			// 回答のない質問がある場合は自動承認をしないフラグ
			postData['is_stop_auto_approve_without_answer'] = IsStopAutoApproveWithoutAnswer;
			// 回答にかかった時間の×何倍、承認期限日を延期するか
			postData['expand_rate_approve_expire_date'] = ExpandRateApproveExpireDate;
			// 言語設定
			postData['hl'] = SATERAITO_LANG

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/postanswer',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(true);
				},
				failure: function()
				{
					// 失敗時

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// falseでコールバックをキック
					callback(false);
				}
			});
		},

		/**
		 * postQuestion
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {string} aQuestionDetail
		 * @param {string} IsStopAutoApproveWithoutAnswer
		 * @param {string} ExpandRateApproveExpireDate
		 * @param {function} callback
		 */
		postQuestion: function(aDocId, aQandAName, aQuestionDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback)
		{
			if (IS_OPENID_MODE) {
				QandA._postQuestionOid(aDocId, aQandAName, aQuestionDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback);
			} else {
				QandA._postQuestion(aDocId, aQandAName, aQuestionDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback);
			}
		},

		/**
		 * _postQuestion
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {string} aQuestionDetail
		 * @param {string} IsStopAutoApproveWithoutAnswer
		 * @param {string} ExpandRateApproveExpireDate
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_postQuestion: function(aDocId, aQandAName, aQuestionDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('UPDATING'));

			var postData = {};
			// ドキュメントID
			postData['doc_id'] = aDocId;
			// Q&A名
			postData['q_and_a_name'] = aQandAName;
			// 質問内容
			postData['question_detail'] = aQuestionDetail;
			// 「質問」文言
			postData['word_for_question'] = aWordForQuestion;
			// 回答のない質問がある場合は自動承認をしないフラグ
			postData['is_stop_auto_approve_without_answer'] = IsStopAutoApproveWithoutAnswer;
			// 回答にかかった時間の×何倍、承認期限日を延期するか
			postData['expand_rate_approve_expire_date'] = ExpandRateApproveExpireDate;
			// 言語設定
			postData['hl'] = SATERAITO_LANG
			postData['token'] = MyUtil.getToken()

			// 質問を投稿
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/postquestion', function(response){

				// メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[postquestion](' + aNumRetry + ')' + err);

					// エラーの場合、falseでコールバックをキック
					callback(false);
					return;
				}

				var jsonData = response.data;

				// コールバックをキック
				callback(true);
			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * _postQuestionOid
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {string} aQuestionDetail
		 * @param {string} IsStopAutoApproveWithoutAnswer
		 * @param {string} ExpandRateApproveExpireDate
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_postQuestionOid: function(aDocId, aQandAName, aQuestionDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			OidMiniMessage.showNormalMiniMessage(MyLang.getMsg('UPDATING'));

			var postData = {};
			// ドキュメントID
			postData['doc_id'] = aDocId;
			// Q&A名
			postData['q_and_a_name'] = aQandAName;
			// 質問内容
			postData['question_detail'] = aQuestionDetail;
			// 「質問」文言
			postData['word_for_question'] = aWordForQuestion;
			// 回答のない質問がある場合は自動承認をしないフラグ
			postData['is_stop_auto_approve_without_answer'] = IsStopAutoApproveWithoutAnswer;
			// 回答にかかった時間の×何倍、承認期限日を延期するか
			postData['expand_rate_approve_expire_date'] = ExpandRateApproveExpireDate;
			// 言語設定
			postData['hl'] = SATERAITO_LANG

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/postquestion',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(true);
				},
				failure: function()
				{
					// 失敗時

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// falseでコールバックをキック
					callback(false);
				}
			});
		},

		/**
		 * requestQandAList
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {function} callback
		 */
		requestQandAList: function(aDocId, aQandAName, callback)
		{
			if (IS_OPENID_MODE) {
				QandA._requestQandAListOid(aDocId, aQandAName, callback);
			} else {
				QandA._requestQandAList(aDocId, aQandAName, callback);
			}
		},

		/**
		 * _requestQandAListOid
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestQandAListOid: function(aDocId, aQandAName, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getqandalist?doc_id=' + aDocId + '&q_and_a_name=' + encodeURIComponent(aQandAName) + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						QandA._requestQandAList(aDocId, aQandAName, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _requestQandAList
		 *
		 * @param {string} aDocId
		 * @param {string} aQandAName
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestQandAList: function(aDocId, aQandAName, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getqandalist?doc_id=' + aDocId + '&q_and_a_name=' + encodeURIComponent(aQandAName) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getqandalist](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							QandA._requestQandAList(aDocId, aQandAName, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// 読込中メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		}

	};

	ApproverList = {

		/**
		 * renderApproverList
		 *
		 * 一つの承認段階のなかの、全承認者を描画する
		 * 段階がin processの場合「申請中」と後ろにつけ、
		 * 段階がpassedの場合「承認済」または「回覧済み」と後ろに付ける
		 *
		 * @param {Array} aApproverCandidates
		 * @param {Array} aApprovers
		 * @param {String} aStatus
		 */
		renderApproverList: function(aDom, aApproverCandidates, aApprovers, aStatus, aApproveType, aApproveNumber, aNameInfo)
		{
			var approverNames = ApproverList.createApproverListHtml(aApproverCandidates, aApprovers, aStatus, aApproveType, aApproveNumber, aNameInfo);
			$(aDom).html(approverNames);
		},

		/**
		 * createApproverListHtml
		 *
		 * 一つの承認段階のなかの、全承認者を描画するHtmlを返す
		 *
		 * @param {Array} aApproverCandidates
		 * @param {Array} aApprovers
		 * @param {String} aStatus
		 * @param {string} aApproveType
		 * @param {number} aApproveNumber
		 * @param {Array} aNameInfo
		 * @return {String}
		 */
		createApproverListHtml: function(aApproverCandidates, aApprovers, aStatus, aApproveType, aApproveNumber, aNameInfo)
		{
			// 承認候補者のカンマ付きリストを作成
			var vHtml = '';
			Ext.each(aApproverCandidates, function(){

				var email = this;

				if (vHtml != '') {
					vHtml += ', ';
				}

				var in_process = '0';
				if (aStatus == WorkflowDoc.PROCESS_STATUS_IN_PROCESS) {
					in_process = '1';
				}

				//vHtml += '<span class="approver_name" email="' + email + '" title="' + email + '">' + WorkflowUser.getUserName(email) + '</span>';
				vHtml += '<span class="approver_name" email="' + email + '" title="' + email + '">';
				// 承認者名は、名前辞書にある場合、それを採用
				if (typeof(aNameInfo[email]) != 'undefined') {
					vHtml += Sateraito.Util.escapeHtml(aNameInfo[email]);
				} else {
					vHtml += Sateraito.Util.escapeHtml(WorkflowUser.getUserName(email));
				}
				vHtml += '</span>';
				vHtml += '<span class="approver_status" email="' + email + '" process_number="' + aApproveNumber + '" rendered="0" in_process="' + in_process + '" approve_type="' + aApproveType + '" ></span>';

/*

				if (aStatus == WorkflowDoc.STATUS_REJECTED) {
					// この決裁レベルが否決済みである場合、否決者の後ろに（否決済）と表示
					Ext.each(aApprovers, function(){
						var approver = '' + this;
						if (email == approver){
							vHtml += '（' + '<span style="color:brown;">' + WorkflowDoc.getStatusName(WorkflowDoc.STATUS_REJECTED, aApproveType) + '</span>' + '）';
						}
					});
				} else {
					// この決裁レベルが承認済みである場合、承認者名の後ろに（承認済）と表示
					// 一つしか要素がない場合はArrayにならないでobjectになってしまうのでArray変換する
					Ext.each(aApprovers, function(){

						var approver = '' + this;		// オブジェクトになっているので、文字列に変換しないと次のif文で不一致になる
						if (email == approver){
							vHtml += '（' + '<span style="color:green;">' + WorkflowDoc.getStatusName(WorkflowDoc.STATUS_PASSED, aApproveType) + '</span>' + '）';
						}
					});
				}
*/
			});
/*
			// この決裁レベルが決裁中の場合
			if (aStatus == WorkflowDoc.PROCESS_STATUS_IN_PROCESS) {
				// 全決裁者の後ろに「申請中」を追加
				vHtml += '（' + WorkflowDoc.getStatusName(WorkflowDoc.STATUS_IN_PROCESS, aApproveType) + '）';
				vHtml = '<span style="font-weight:bold;">' + vHtml + '</span>';
			}
*/

			return vHtml;
		}
	};

	WorkflowDoc = {

		APPROVE_TYPE_APPROVE: 'approve',
		APPROVE_TYPE_LOOK: 'look',

		PROCESS_STATUS_IN_PROCESS: 'in_process',

		STATUS_PASSED: 'passed',
		STATUS_FINAL_APPROVED: 'final_approved',
		STATUS_REJECTED: 'rejected',
		STATUS_SUBMITTED: 'submitted',
		STATUS_IN_PROCESS: 'in_process',

		DOC_STATUS_DRAFT: 'draft',
		DOC_STATUS_FINAL_APPROVED: 'final_approved',
		DOC_STATUS_REJECTED: 'rejected',
		DOC_STATUS_IN_PROCESS: 'in_process',
		DOC_STATUS_REMANDED: 'remanded',

		COMMENT_STATUS_UPDATED: 'updated',
		COMMENT_STATUS_REMANDED: 'remanded',
		COMMENT_STATUS_RESUBMITTED: 'resubmitted',

		docIds:{},			// key:form_id, value:doc_id
		relativeDocIds:{},	// key:doc_id, value:relative_doc_id
		relativeDocIdChains:{},	// key:doc_id, value:relative_doc_id_chain（list）
		updateMasterRows: [],	// key:doc_id, value:array
		docStatuses:{},			// key:doc_id, value:status（WorkflowDoc)
		openNotifications:{},	// key:doc_id, value:開封通知設定情報（現在のviewer_emailの設定のみ）…初期表示など用（更新時は「createOpenNotifications」から作成）

		/**
		 *
		 * この承認プロセスの承認者の開封通知状況を取得
		 * ※該当プロセスの開封通知情報を持ってない場合はnullを返す
		 *
		**/
		getOpenNotificationStatus: function(openNotifications, approve_number, user_email)
		{
			var open_status = null;
			var is_on_open_notification = false;
			if(typeof(openNotifications) != 'undefined' && typeof(openNotifications[approve_number]) != 'undefined'){
				if(typeof(openNotifications[approve_number]['target_approvers']) != 'undefined'){
					var target_approvers = openNotifications[approve_number]['target_approvers'];
					for(i = 0; i < target_approvers.length; i++){
						var target_approver = target_approvers[i];
						if(user_email.toLowerCase() == target_approver.toLowerCase()){
							is_on_open_notification = true;
							// 既存文書（申請後の文書）の場合は、開封状況がセットされているので取得
							if(typeof(openNotifications[approve_number]['open_status_info']) != 'undefined'){
								var open_status_info = openNotifications[approve_number]['open_status_info'];
								open_status = open_status_info[target_approver.toLowerCase()];
							}
							break;
						}
					}
				}
			}
			return [is_on_open_notification, open_status];
		},

		/**
		 *
		 * 画面上の状況から開封通知情報を作成（申請や承認時の更新用）	※開封状況、開封日時はセット不要
		 *
		**/
		createOpenNotifications: function(aTemplateId)
		{
			// 開封通知の情報を取得
			var openNotifications = null;
			$('#' + aTemplateId).find('span.approver_name_list').each(function(){
				var approver_name_list = $(this);
				// 開封通知ボタンのあるプロセスのみ処理（=ok_to_open_notificationなプロセス）…それ以外のプロセスの情報は更新しないということ
				approver_name_list.find('img.btn_open_notification').each(function(){
					var img = $(this);
					//var approve_number = parseInt(approver_name_list.attr('number'), 10);
					var approve_number = approver_name_list.attr('number');
					var email_lower = img.attr('email').toLowerCase();

					if(openNotifications == null){
						openNotifications = {};
					}

					var hash_pcs;
					if(typeof(openNotifications[approve_number]) != 'undefined'){
						hash_pcs = openNotifications[approve_number];
					}else{
						hash_pcs = {};
						openNotifications[approve_number] = hash_pcs;
					}
					var target_approvers;
					if(typeof(hash_pcs['target_approvers']) != 'undefined'){
						target_approvers = hash_pcs['target_approvers'];
					}else{
						target_approvers = [];
						hash_pcs['target_approvers'] = target_approvers;
					}
					if(img.attr('status') == 'on'){
						target_approvers.push(email_lower);
					}
				});
			});
			return openNotifications;
		},

		/**
		 * appendMasterRowForUpdate：申請、承認時に、更新するマスター情報を追加（実際の更新は申請、承認タイミング）
		 *
		 * @param {string} aDocId
		 * @param {string} aMasterCode
		 * @param {string} aDataKeyValue
		 * @param {string} aTargetApproveType: 処理するタイミングを指定.  値… submit=申請 final_approve=決裁 reject=否決
		 * @param {object} aUpdateData
		 * @param {object} aUpdateOption
		 * @param {boolean} aIsOverWrite: true…このレコードに関する設定を上書き（master_code, data_key, TargetApproveTypeをキーとする）
		 */
		appendMasterRowForUpdate: function(aDocId, aMasterCode, aDataKeyValue, aTargetApproveType, aUpdateData, aUpdateOption, aIsOverWrite)
		{
			if(typeof(aMasterCode) == 'undefined' || aMasterCode == ''){
				return;
			}
			if(typeof(aDataKeyValue) == 'undefined' || aDataKeyValue == ''){
				return;
			}
			if(typeof(aUpdateData) == 'undefined'){
				aUpdateData = {};
			}
			if(typeof(aUpdateOption) == 'undefined'){
				aUpdateOption = {};
			}
			if(typeof(aTargetApproveType) == 'undefined'){
				aTargetApproveType = '';
			}
			if(typeof(aIsOverWrite) == 'undefined'){
				aIsOverWrite = false;
			}

      var data_of_each_doc;
			if(typeof(WorkflowDoc.updateMasterRows[aDocId]) == 'undefined'){
				data_of_each_doc = [];
				WorkflowDoc.updateMasterRows[aDocId] = data_of_each_doc;
			}else{
				data_of_each_doc = WorkflowDoc.updateMasterRows[aDocId];
			}
			data_of_each_doc.push({
				master_code:aMasterCode
				,data_key:aDataKeyValue
				,update_data:aUpdateData
				,update_options:aUpdateOption
				,target_approve_type:aTargetApproveType
				,is_overwrite:aIsOverWrite
			});
		},

		initMasterRowForUpdate: function(aDocId)
		{
			if(typeof(WorkflowDoc.updateMasterRows[aDocId]) != 'undefined'){
				WorkflowDoc.updateMasterRows[aDocId] = [];
			}
		},

		getMasterRowForUpdate: function(aDocId)
		{
      var data_of_each_doc;
			if(typeof(WorkflowDoc.updateMasterRows[aDocId]) == 'undefined'){
				data_of_each_doc = [];
			}else{
				data_of_each_doc = WorkflowDoc.updateMasterRows[aDocId];
			}
			return data_of_each_doc;
		},

		/*
			シリアルＮｏ採番オブジェクト作成
		*/
		createSerialNoDef: function(aDocId){
			var template_body_id = 'template_body_new_doc';
			if(aDocId != ''){
				template_body_id = 'template_body_' + aDocId;
			}
			// 新規登録時
			else
			{
				template_body_id = 'template_body_new_doc';
			}
			var serialNoDef = [];
			$('#' + template_body_id).find(':input.serial_no').each(function(){
				var serialNo = $(this);
				var fieldToSet = $(serialNo).attr('name');
				var keyFields = $(serialNo).attr('key_fields');
				var prefixFields = $(serialNo).attr('prefix_fields');
				var suffixFields = $(serialNo).attr('suffix_fields');
				var numDigits = $(serialNo).attr('num_digits');
				var startFrom = $(serialNo).attr('start_from');
				var approveType = $(serialNo).attr('approve_type');

				var autoNoKey = '';
				if(typeof(keyFields) != 'undefined')
				{
					var keyFieldsSplited = keyFields.split(' ');
					Ext.each(keyFieldsSplited, function(){
						var v = $('#' + template_body_id).find(':input[name=' + this + ']').val();
						if(typeof(v) != 'undefined'){
							autoNoKey += v;
						}
					});
				}
				var prefixKey = '';
				if(typeof(prefixFields) != 'undefined')
				{
					var prefixFieldsSplited = prefixFields.split(' ');
					Ext.each(prefixFieldsSplited, function(){
						var v = $('#' + template_body_id).find(':input[name=' + this + ']').val();
						if(typeof(v) != 'undefined'){
							prefixKey += v;
						}
					});
				}
				var suffixKey = '';
				if(typeof(suffixFields) != 'undefined')
				{
					var suffixFieldsSplited = suffixFields.split(' ');
					Ext.each(suffixFieldsSplited, function(){
						var v = $('#' + template_body_id).find(':input[name=' + this + ']').val();
						if(typeof(v) != 'undefined'){
							suffixKey += v;
						}
					});
				}
				serialNoDef.push({
					'field_to_set': fieldToSet,
					'auto_no_key': autoNoKey,
					'prefix_key': prefixKey,
					'suffix_key': suffixKey,
					'num_digits': numDigits,
					'start_from': startFrom,
					'key_fields':typeof(keyFields) != 'undefined' ? keyFields : '',
					'prefix_fields':typeof(prefixFields) != 'undefined' ? prefixFields : '',
					'suffix_fields':typeof(suffixFields) != 'undefined' ? suffixFields : '',
					'approve_type': typeof(approveType) != 'undefined' ? approveType : ''
				});
			});
			return serialNoDef;
		},

		/*
			決裁番号オブジェクト作成
		*/
		createFinalApproveNoDef: function(aDocId){
			var template_body_id = 'template_body_new_doc';
			if(aDocId != ''){
				template_body_id = 'template_body_' + aDocId;
			}
			// 新規登録時
			else
			{
				template_body_id = 'template_body_new_doc';
			}
			var finalApproveNoDef = null;
			var finalApproveNo = $('#' + template_body_id).find(':input.final_approve_no');
			if (finalApproveNo.length > 0) {
				var fieldToSet = $(finalApproveNo).attr('name');
				var keyFields = $(finalApproveNo).attr('key_fields');
				var prefixFields = $(finalApproveNo).attr('prefix_fields');
				var suffixFields = $(finalApproveNo).attr('suffix_fields');
				var numDigits = $(finalApproveNo).attr('num_digits');
				var startFrom = $(finalApproveNo).attr('start_from');
				var issueWithReject;
				if (typeof($(finalApproveNo).attr('issue_with_reject')) == 'undefined') {
					issueWithReject = false;
				} else {
					issueWithReject = true;
				}

				var autoNoKey = '';
				if(keyFields) {
					var keyFieldsSplited = keyFields.split(' ');
					Ext.each(keyFieldsSplited, function(){
						var v = $('#' + template_body_id).find(':input[name=' + this + ']').val();
						if(typeof(v) != 'undefined'){
							autoNoKey += v;
						}
					});
				}
				var isExistPrefixKey = false;	// 初期はkey_fieldsをプレフィックスにも流用してしまっていたので互換性のために属性があるかどうかで判別する（属性があればOK）
				var prefixKey = '';
				if(typeof(prefixFields) != 'undefined')
				{
					isExistPrefixKey = true;
					var prefixFieldsSplited = prefixFields.split(' ');
					Ext.each(prefixFieldsSplited, function(){
						var v = $('#' + template_body_id).find(':input[name=' + this + ']').val();
						if(typeof(v) != 'undefined'){
							prefixKey += v;
						}
					});
				}
				var suffixKey = '';
				if(typeof(suffixFields) != 'undefined')
				{
					var suffixFieldsSplited = suffixFields.split(' ');
					Ext.each(suffixFieldsSplited, function(){
						var v = $('#' + template_body_id).find(':input[name=' + this + ']').val();
						if(typeof(v) != 'undefined'){
							suffixKey += v;
						}
					});
				}
				finalApproveNoDef = {
					'field_to_set': fieldToSet,
					'auto_no_key': autoNoKey,
					'prefix_key': prefixKey,
					'suffix_key': suffixKey,
					'is_exist_prefix_key':isExistPrefixKey,
					'num_digits': numDigits,
					'start_from': startFrom,
					'issue_with_reject':issueWithReject,
					'key_fields':typeof(keyFields) != 'undefined' ? keyFields : '',
					'prefix_fields':typeof(prefixFields) != 'undefined' ? prefixFields : '',
					'suffix_fields':typeof(suffixFields) != 'undefined' ? suffixFields : ''
				};
			}
			return finalApproveNoDef;
		},

		/*
			決裁日オブジェクト作成
		*/
		createFinalApproveDateDef: function(aDocId){
			var template_body_id = 'template_body_new_doc';
			if(aDocId != ''){
				template_body_id = 'template_body_' + aDocId;
			}
			// 新規登録時
			else
			{
				template_body_id = 'template_body_new_doc';
			}
			var finalApproveDateDef = null;
			var finalApproveDate = $('#' + template_body_id).find(':input.final_approve_date');
			if (finalApproveDate.length > 0) {
				var fieldToSet = $(finalApproveDate).attr('name');
				var issueWithReject;
				if (typeof($(finalApproveDate).attr('issue_with_reject')) == 'undefined') {
					issueWithReject = false;
				} else {
					issueWithReject = true;
				}
				finalApproveDateDef = {
					'field_to_set': fieldToSet,
					'issue_with_reject':issueWithReject
				};
			}
			return finalApproveDateDef;
		},


		/**
		 * checkDuplicateCoverDate
		 *
		 * ドキュメントにカバー期間が設定されている場合、過去に申請した同種の申請書のカバー期間と重複していないかどうかチェック
		 *
		 * @param {string} aDocId
		 * @param {string} aDocCoverDateFrom
		 * @param {string} aDocCoverDateTo
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		checkDuplicateCoverDate: function(aDocId, aDocCoverDateFrom, aDocCoverDateTo, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._checkDuplicateCoverDateOid(aDocId, aDocCoverDateFrom, aDocCoverDateTo, callback, aNumRetry);
			} else {
				WorkflowDoc._checkDuplicateCoverDate(aDocId, aDocCoverDateFrom, aDocCoverDateTo, callback, aNumRetry);
			}
		},

		/**
		 * _checkDuplicateCoverDateOid
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_checkDuplicateCoverDateOid: function(aDocId, aDocCoverDateFrom, aDocCoverDateTo, callback, aNumRetry)
		{
			var postData = {};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/checkduplicatecoverdateforsubmitteddoc?doc_cover_date_from=' + encodeURIComponent(aDocCoverDateFrom) + '&doc_cover_date_to=' + encodeURIComponent(aDocCoverDateTo) + '&doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG,
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData.result);
				},
				failure: function()
				{

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowDoc._checkDuplicateCoverDateOid(aDocId, aDocCoverDateFrom, aDocCoverDateTo, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _checkDuplicateCoverDate
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_checkDuplicateCoverDate: function(aDocId, aDocCoverDateFrom, aDocCoverDateTo, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/checkduplicatecoverdateforsubmitteddoc?doc_cover_date_from=' + encodeURIComponent(aDocCoverDateFrom) + '&doc_cover_date_to=' + encodeURIComponent(aDocCoverDateTo) + '&doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[checkduplicatecoverdateforsubmitteddoc](' + aNumRetry + ')' + err);

					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							WorkflowDoc.checkDuplicateCoverDate(aDocId, aDocCoverDateFrom, aDocCoverDateTo, callback, (aNumRetry + 1));
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				callback(jsonData.result);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * checkAttachFiles
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		checkAttachFiles: function(aDocId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._checkAttachFilesOid(aDocId, callback, aNumRetry);
			} else {
				WorkflowDoc._checkAttachFiles(aDocId, callback, aNumRetry);
			}
		},

		/**
		 * _checkAttachFilesOid
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_checkAttachFilesOid: function(aDocId, callback, aNumRetry)
		{
			var postData = {};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/checkattachfiles?doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG,
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowDoc._checkAttachFilesOid(aDocId, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _checkAttachFiles
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_checkAttachFiles: function(aDocId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/checkattachfiles?doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[checkattachfiles](' + aNumRetry + ')' + err);

					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							WorkflowDoc.checkAttachFiles(aDocId, callback, (aNumRetry + 1));
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestUpdateDoc
		 *
		 * @param {string} aDocId
		 * @param {Object} aDocValues
		 * @param {string} aApproverCommentObj ... 承認者コメントリストがある場合のみ
		 * @param {string} aDocComment
		 * @param {bool} aWithoutComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {Object} aOpenNotifications
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestUpdateDoc: function(aDocId, aDocValues, aApproverCommentObj, aDocComment, aWithoutComment, aUpdateApproveProcessList, aOpenNotifications, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._requestUpdateDocOid(aDocId, aDocValues, aApproverCommentObj, aDocComment, aWithoutComment, aUpdateApproveProcessList, aOpenNotifications, callback, aNumRetry);
			} else {
				WorkflowDoc._requestUpdateDoc(aDocId, aDocValues, aApproverCommentObj, aDocComment, aWithoutComment, aUpdateApproveProcessList, aOpenNotifications, callback, aNumRetry);
			}
		},

		/**
		 * _requestUpdateDocOid
		 *
		 * @param {string} aDocId
		 * @param {Object} aDocValues
		 * @param {string} aApproverCommentObj ... 承認者コメントリストがある場合のみ
		 * @param {string} aDocComment
		 * @param {bool} aWithoutComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {Object} aOpenNotifications
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestUpdateDocOid: function(aDocId, aDocValues, aApproverCommentObj, aDocComment, aWithoutComment, aUpdateApproveProcessList, aOpenNotifications, callback, aNumRetry)
		{
			var postData = {};
			// ドキュメントID
			postData['doc_id'] = aDocId;
			// 更新内容
			postData['doc_values'] = Ext.encode(aDocValues);
			// 承認者コメントリストの詳細内容
			if (aApproverCommentObj != null) {
				postData['approver_comment_detail'] = Ext.encode(aApproverCommentObj);
			}
			// 承認候補者を更新する場合にセット（管理画面からの編集用）
			if (aUpdateApproveProcessList != null) {
				postData['update_approve_process'] = Ext.encode(aUpdateApproveProcessList);
			}
			// 開封通知（TODO 更新時は未対応）
			//if (aOpenNotifications != null) {
			//	postData['open_notifications'] = Ext.encode(aOpenNotifications);
			//}

			// ユーザー名
			//postData['user_name'] = UserSetting.userSetting.family_name + ' ' + UserSetting.userSetting.given_name;
			if((typeof(UserSetting.userSetting.family_name) != 'undefined' && UserSetting.userSetting.family_name != '') || (typeof(UserSetting.userSetting.given_name) != 'undefined' && UserSetting.userSetting.given_name != '')){
				postData['user_name'] = UserSetting.userSetting.family_name + ' ' + UserSetting.userSetting.given_name;
			}else{
				postData['user_name'] = '';
			}
			// コメントレコードをインサートしないフラグ
			postData['without_comment'] = aWithoutComment;
			// 更新時もコメントできるように対応
			postData['doc_comment'] = aDocComment;
			// 言語設定
			postData['hl'] = SATERAITO_LANG

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/updatedoc',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(true);
				},
				failure: function()
				{
					// エラーの場合、falseでコールバックをキック
					callback(false);
				}
			});
		},

		/**
		 * _requestUpdateDoc
		 *
		 * @param {string} aDocId
		 * @param {Object} aDocValues
		 * @param {string} aApproverCommentObj ... 承認者コメントリストがある場合のみ
		 * @param {string} aDocComment
		 * @param {bool} aWithoutComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {Object} aOpenNotifications
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestUpdateDoc: function(aDocId, aDocValues, aApproverCommentObj, aDocComment, aWithoutComment, aUpdateApproveProcessList, aOpenNotifications, callback, aNumRetry)
		{
			var postData = {};
			// ドキュメントID
			postData['doc_id'] = aDocId;
			// 更新内容
			postData['doc_values'] = Ext.encode(aDocValues);
			// 承認者コメントリストの詳細内容
			if (aApproverCommentObj != null) {
				postData['approver_comment_detail'] = Ext.encode(aApproverCommentObj);
			}
			// 承認候補者を更新する場合にセット（管理画面からの編集用）
			if (aUpdateApproveProcessList != null) {
				postData['update_approve_process'] = Ext.encode(aUpdateApproveProcessList);
			}
			// 開封通知（TODO 更新時は未対応）
			//if (aOpenNotifications != null) {
			//	postData['open_notifications'] = Ext.encode(aOpenNotifications);
			//}

			// ユーザー名
			//postData['user_name'] = UserSetting.userSetting.family_name + ' ' + UserSetting.userSetting.given_name;
			if((typeof(UserSetting.userSetting.family_name) != 'undefined' && UserSetting.userSetting.family_name != '') || (typeof(UserSetting.userSetting.given_name) != 'undefined' && UserSetting.userSetting.given_name != '')){
				postData['user_name'] = UserSetting.userSetting.family_name + ' ' + UserSetting.userSetting.given_name;
			}else{
				postData['user_name'] = '';
			}
			// コメントレコードをインサートしないフラグ
			postData['without_comment'] = aWithoutComment;
			// 更新時もコメントできるように対応
			postData['doc_comment'] = aDocComment;
			// 言語設定
			postData['hl'] = SATERAITO_LANG
			postData['token'] = MyUtil.getToken()

			// 申請書を更新
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/updatedoc', function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[updatedoc](' + aNumRetry + ')' + err);
					// エラーの場合、falseでコールバックをキック
					callback(false);
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(true);
			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * changeDocStatus
		 *
		 * @param {string} aDocId
		 * @param {string} aStatus
		 * @param {string} aApproveType
		 * @param {string} aDocComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		changeDocStatus: function(aDocId, aStatus, aApproveType, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, aOpenNotifications, callback, aNumRetry)
		{
			if (typeof(aFinalApproveNoDef) == 'undefined') {
				aFinalApproveNoDef = null;
			}

			if (IS_OPENID_MODE) {
				WorkflowDoc._changeDocStatusOid(aDocId, aStatus, aApproveType, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, aOpenNotifications, callback, aNumRetry);
			} else {
				WorkflowDoc._changeDocStatus(aDocId, aStatus, aApproveType, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, aOpenNotifications, callback, aNumRetry);
			}
		},

		/**
		 * _changeDocStatusOid
		 *
		 * @param {string} aDocId
		 * @param {string} aStatus
		 * @param {string} aApproveType
		 * @param {string} aDocComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_changeDocStatusOid: function(aDocId, aStatus, aApproveType, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, aOpenNotifications, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			var postData = {
				'doc_id': aDocId,
				'doc_comment': aDocComment,
				'user_name': WorkflowUser.getUserName(LoginMgr.viewerEmail),
				'status': aStatus,
				'approve_type': aApproveType,
				'update_approve_process': Ext.encode(aUpdateApproveProcessList),
				'final_approve_no_def': Ext.encode(aFinalApproveNoDef),
				'serial_no_def': Ext.encode(aSerialNoDef),
				'update_master_data_def': Ext.encode(aUpdateMasterDataDef),
				'hl': SATERAITO_LANG,
				'open_notifications': aOpenNotifications != null ? Ext.encode(aOpenNotifications) : ''
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/changedocstatus',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					// 更新系はリトライしない 2013.02.21
					//if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
					if (aNumRetry < 1) {

						// リトライ
						WorkflowDoc._changeDocStatusOid(aDocId, aStatus, aApproveType, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, aOpenNotifications, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _changeDocStatus
		 *
		 * @param {String} aDocId
		 * @param {String} aStatus
		 * @param {string} aApproveType
		 * @param {string} aDocComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		_changeDocStatus: function(aDocId, aStatus, aApproveType, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, aOpenNotifications, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('UPDATING'));

			var postData = {
				'doc_id': aDocId,
				'doc_comment': aDocComment,
				'user_name': WorkflowUser.getUserName(LoginMgr.viewerEmail),
				'status': aStatus,
				'approve_type': aApproveType,
				'update_approve_process': Ext.encode(aUpdateApproveProcessList),
				'final_approve_no_def': Ext.encode(aFinalApproveNoDef),
				'serial_no_def': Ext.encode(aSerialNoDef),
				'update_master_data_def': Ext.encode(aUpdateMasterDataDef),
				'open_notifications': aOpenNotifications != null ? Ext.encode(aOpenNotifications) : '',
				'token': MyUtil.getToken(),
				'hl': SATERAITO_LANG
			};
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/changedocstatus', function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[changedocstatus](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else if(response.rc == 403){
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('MSG_CSRF_CHECK'), 10);
					}else{

						// 更新系はリトライしない 2013.02.21
						//if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						if (aNumRetry < 1) {
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('UPDATING') + ' ' + aNumRetry);
							// リトライ
							WorkflowDoc._changeDocStatus(aDocId, aStatus, aApproveType, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, aOpenNotifications, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_UPDATING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam(true, postData));
		},


		/**
		 * reSubmitDoc
		 *
		 * @param {string} aDocId
		 * @param {string} aDocComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		reSubmitDoc: function(aDocId, templateBody, docValues, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, callback, aNumRetry)
		{
			if (typeof(aFinalApproveNoDef) == 'undefined') {
				aFinalApproveNoDef = null;
			}

			if (IS_OPENID_MODE) {
				WorkflowDoc._reSubmitDocOid(aDocId, templateBody, docValues, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, callback, aNumRetry);
			} else {
				WorkflowDoc._reSubmitDoc(aDocId, templateBody, docValues, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, callback, aNumRetry);
			}
		},

		/**
		 * _reSubmitDocOid
		 *
		 * @param {string} aDocId
		 * @param {string} aDocComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_reSubmitDocOid: function(aDocId, templateBody, docValues, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			var postData = {
				'doc_id': aDocId,
				'doc_comment': aDocComment,
				'doc_values': Ext.encode(docValues),
				//'user_name': WorkflowUser.getUserName(LoginMgr.viewerEmail),
				'update_approve_process': Ext.encode(aUpdateApproveProcessList),
				'final_approve_no_def': Ext.encode(aFinalApproveNoDef),
				'serial_no_def': Ext.encode(aSerialNoDef),
				'update_master_data_def': Ext.encode(aUpdateMasterDataDef),
				'template_body': templateBody,
				'hl': SATERAITO_LANG
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/resubmitdoc',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					// 更新系はリトライしない 2013.02.21
					//if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
					if (aNumRetry < 1) {

						// リトライ
						WorkflowDoc._reSubmitDocOid(aDocId, templateBody, docValues, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _reSubmitDoc
		 *
		 * @param {String} aDocId
		 * @param {string} aDocComment
		 * @param {array} aUpdateApproveProcessList
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		_reSubmitDoc: function(aDocId, templateBody, docValues, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('UPDATING'));

			var postData = {
				'doc_id': aDocId,
				'doc_comment': aDocComment,
				//'user_name': WorkflowUser.getUserName(LoginMgr.viewerEmail),
				'doc_values': Ext.encode(docValues),
				'update_approve_process': Ext.encode(aUpdateApproveProcessList),
				'final_approve_no_def': Ext.encode(aFinalApproveNoDef),
				'serial_no_def': Ext.encode(aSerialNoDef),
				'update_master_data_def': Ext.encode(aUpdateMasterDataDef),
				'template_body': templateBody,
				'token': MyUtil.getToken(),
				'hl': SATERAITO_LANG
			};
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/resubmitdoc', function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[resubmitdoc](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else if(response.rc == 403){
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('MSG_CSRF_CHECK'), 10);
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('UPDATING') + ' ' + aNumRetry);

						// 更新系はリトライしない 2013.02.21
						//if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						if (aNumRetry < 1) {

							// リトライ
							WorkflowDoc._reSubmitDoc(aDocId, templateBody, docValues, aDocComment, aUpdateApproveProcessList, aFinalApproveNoDef, aSerialNoDef, aUpdateMasterDataDef, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_UPDATING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam(true, postData));
		},


		/**
		 * remandDocStatus:差し戻し
		 *
		 * @param {string} aDocId
		 * @param {number} aCurrentApproveNo
		 * @param {number} aRemandProcessNumber
		 * @param {string} aDocComment
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		remandDocStatus: function(aDocId, aCurrentApproveNo, aRemandProcessNumber, aDocComment, callback, aNumRetry)
		{
			if (typeof(aFinalApproveNoDef) == 'undefined') {
				aFinalApproveNoDef = null;
			}

			if (IS_OPENID_MODE) {
				WorkflowDoc._remandDocStatusOid(aDocId, aCurrentApproveNo, aRemandProcessNumber, aDocComment, callback, aNumRetry);
			} else {
				WorkflowDoc._remandDocStatus(aDocId, aCurrentApproveNo, aRemandProcessNumber, aDocComment, callback, aNumRetry);
			}
		},

		/**
		 * _remandDocStatusOid
		 *
		 * @param {string} aDocId
		 * @param {number} aCurrentApproveNo
		 * @param {number} aRemandProcessNumber
		 * @param {string} aDocComment
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_remandDocStatusOid: function(aDocId, aCurrentApproveNo, aRemandProcessNumber, aDocComment, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			var postData = {
				'doc_id': aDocId,
				'remand_process_number': aRemandProcessNumber,
				'current_approve_no': aCurrentApproveNo,
				'doc_comment': aDocComment,
				'hl': SATERAITO_LANG
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/remanddocstatus',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					// 更新系はリトライしない 2013.02.21
					//if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
					if (aNumRetry < 1) {

						// リトライ
						WorkflowDoc._remandDocStatusOid(aDocId, aCurrentApproveNo, aRemandProcessNumber, aDocComment, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _remandDocStatus
		 *
		 * @param {String} aDocId
		 * @param {number} aCurrentApproveNo
		 * @param {number} aRemandProcessNumber
		 * @param {string} aDocComment
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		_remandDocStatus: function(aDocId, aCurrentApproveNo, aRemandProcessNumber, aDocComment, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('UPDATING'));

			var postData = {
				'doc_id': aDocId,
				'remand_process_number': aRemandProcessNumber,
				'current_approve_no': aCurrentApproveNo,
				'doc_comment': aDocComment,
				'token': MyUtil.getToken(),
				'hl': SATERAITO_LANG
			};
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/remanddocstatus', function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[remanddocstatus](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else if(response.rc == 403){
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('MSG_CSRF_CHECK'), 10);
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('UPDATING') + ' ' + aNumRetry);

						// 更新系はリトライしない 2013.02.21
						//if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						if (aNumRetry < 1) {

							// リトライ
							WorkflowDoc._remandDocStatus(aDocId, aCurrentApproveNo, aRemandProcessNumber, aDocComment, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_UPDATING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * deleteDoc
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		deleteDoc: function(aDocId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._deleteDocOid(aDocId, callback, aNumRetry);
			} else {
				WorkflowDoc._deleteDoc(aDocId, callback, aNumRetry);
			}
		},

		/**
		 * _deleteDocOid
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_deleteDocOid: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			var postData = {
				'doc_id': aDocId,
				'user_name': WorkflowUser.getUserName(LoginMgr.viewerEmail),
				'hl': SATERAITO_LANG
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/deletedoc',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					if(jsonData.status == 'error'){
						var error_code = jsonData.error_code;
						var error_msg = '';
						if(error_code == 'ALREADY_DELETE_DOC'){
							error_msg = MyLang.getMsg('ERR_FAILED_DELETE_DOCUMENT_BY_ALREADY_DELETED');	// この文書は既に削除されています
						}else{
							error_msg = MyLang.getMsg('ERR_FAILED_DELETE_DOCUMENT');	// 申請書の削除中にエラーが発生しました
						}
						alert(error_msg);
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
						// コールバックをキック
						callback(false);
						return;
					}
					else{
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
						//alert('申請書を削除しました');
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('MSG_DELETE_DOCUNENT'));
						callback(true);
						return;
					}
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowDoc._deleteDoc(aDocId, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _deleteDoc
		 *
		 * @param {String} aDocId
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		_deleteDoc: function(aDocId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('DELETING'));

			var postData = {
				'doc_id': aDocId,
				'user_name': WorkflowUser.getUserName(LoginMgr.viewerEmail),
				'token': MyUtil.getToken(),
				'hl': SATERAITO_LANG
			};
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/deletedoc', function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[deletedoc](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else if(response.rc == 403){
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('MSG_CSRF_CHECK'), 10);
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RETRYING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							WorkflowDoc._deleteDoc(aDocId, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERR_FAILED_DELETE_DOCUMENT'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				if(jsonData.status == 'error'){
					var error_code = jsonData.error_code;
					var error_msg = '';
					if(error_code == 'ALREADY_DELETE_DOC'){
						error_msg = MyLang.getMsg('ERR_FAILED_DELETE_DOCUMENT_BY_ALREADY_DELETED');
					}else{
						error_msg = MyLang.getMsg('ERR_FAILED_DELETE_DOCUMENT');
					}
					alert(error_msg);
					// コールバックをキック
					callback(false);
					return;
				}
				else{
					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();
					Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('MSG_DELETE_DOCUNENT'));
				}

				// コールバックをキック
				callback(true);

			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * getStatusName
		 *
		 * @param {String} aStatus
		 * @param {string} aApproveType
		   @param {string} aDeputyEmail
		 */
		getStatusName: function(aStatus, aApproveType, aIsAutoApprove, aDeputyEmail)
		{
			var prefix_auto = '';
			if(aIsAutoApprove){
				prefix_auto = MyLang.getMsg('AUTO');	// 自動
			}

			if(typeof(aDeputyEmail) == 'undefined'){
				aDeputyEmail = '';
			}

			if (aStatus == WorkflowDoc.STATUS_PASSED && aApproveType == WorkflowDoc.APPROVE_TYPE_LOOK) {
				return prefix_auto + MyLang.getMsg('STATUS_LOOK_PASSED');	// 回覧済
			}

			if (aStatus == WorkflowDoc.STATUS_SUBMITTED) {
				return prefix_auto + MyLang.getMsg('STATUS_SUBMITTED');	// 申請済
			}
			if (aStatus == WorkflowDoc.STATUS_FINAL_APPROVED) {
				if(aDeputyEmail != ''){
					return prefix_auto + MyLang.getMsg('STATUS_FINAL_APPROVED_DEPUTY');	// 代理決裁済
				}else{
					return prefix_auto + MyLang.getMsg('STATUS_FINAL_APPROVED');	// 決裁済
				}
			}
			if (aStatus == WorkflowDoc.STATUS_PASSED) {
				if(aDeputyEmail != ''){
					return prefix_auto + MyLang.getMsg('STATUS_APPROVE_PASSED_DEPUTY');	// 代理承認済
				}else{
					return prefix_auto + MyLang.getMsg('STATUS_APPROVE_PASSED');	// 承認済
				}
			}
			if (aStatus == WorkflowDoc.STATUS_REJECTED) {
				if(aDeputyEmail != ''){
					return prefix_auto + MyLang.getMsg('STATUS_REJECTED_DEPUTY');	// 代理否決済
				}else{
					return prefix_auto + MyLang.getMsg('STATUS_REJECTED');	// 否決済
				}
			}
			if (aStatus == WorkflowDoc.COMMENT_STATUS_REMANDED) {
				if(aDeputyEmail != ''){
					return MyLang.getMsg('STATUS_REMANDED_DEPUTY');		// 代理差戻
				}else{
					return MyLang.getMsg('STATUS_REMANDED');		// 差戻
				}
			}
			if (aStatus == WorkflowDoc.DOC_STATUS_DRAFT) {
				return MyLang.getMsg('STATUS_DRAFT');	// 下書き
			}
			if (aStatus == WorkflowDoc.PROCESS_STATUS_IN_PROCESS) {
				if (aApproveType == WorkflowDoc.APPROVE_TYPE_LOOK) {
					return MyLang.getMsg('STATUS_IN_PROCESS_LOOK');		// 回覧中
				} else {
					return MyLang.getMsg('STATUS_IN_PROCESS');		// 申請中
				}
			}
			return '';
		},

		/**
		 * getShortStatusName
		 *
		 * @param {string} aStatus
		   @param {string} aApproveType
			 @param {bool} aIsAutoApprove
		   @param {string} aDeputyEmail
		 * @return {string}
		 */
		getShortStatusName: function(aStatus, aApproveType, aIsAutoApprove, aDeputyEmail)
		{
			var prefix_auto = '';
			if(aIsAutoApprove){
				prefix_auto = MyLang.getMsg('AUTO');	// 自動
			}

			if(typeof(aDeputyEmail) == 'undefined'){
				aDeputyEmail = '';
			}

			if (aStatus == WorkflowDoc.STATUS_PASSED && aApproveType == WorkflowDoc.APPROVE_TYPE_LOOK) {
				return prefix_auto + MyLang.getMsg('STATUS_SHORT_LOOK_PASSED');	// 回覧
			}

			if (aStatus == WorkflowDoc.STATUS_SUBMITTED) {
				return prefix_auto + MyLang.getMsg('STATUS_SHORT_SUBMITTED');	// '申請';
			}
			if (aStatus == WorkflowDoc.COMMENT_STATUS_RESUBMITTED) {
				return prefix_auto + MyLang.getMsg('STATUS_SHORT_RESUBMITTED');	// '再申請';
			}
			if (aStatus == WorkflowDoc.STATUS_FINAL_APPROVED) {
				if(aDeputyEmail != ''){
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_FINAL_APPROVED_DEPUTY');	// '代理決裁';
				}else{
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_FINAL_APPROVED');	// '決裁';
				}
			}
			if (aStatus == WorkflowDoc.DOC_STATUS_DRAFT) {
				return prefix_auto + MyLang.getMsg('STATUS_SHORT_DRAFT');	// '下書';
			}
			if (aStatus == WorkflowDoc.STATUS_PASSED) {
				if(aDeputyEmail != ''){
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_APPROVE_PASSED_DEPUTY');	// '代理承認';
				}else{
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_APPROVE_PASSED');	// '承認';
				}
			}
			if (aStatus == WorkflowDoc.STATUS_REJECTED) {
				if(aDeputyEmail != ''){
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_REJECTED_DEPUTY');	// '代理否決';
				}else{
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_REJECTED');	// '否決';
				}
			}
			if (aStatus == WorkflowDoc.STATUS_IN_PROCESS) {
				return prefix_auto + MyLang.getMsg('STATUS_SHORT_IN_PROCESS_LOOK');	// '保留';
			}
			if (aStatus == WorkflowDoc.COMMENT_STATUS_UPDATED) {
				return prefix_auto + MyLang.getMsg('STATUS_SHORT_IN_PROCESS');	// '更新';
			}
			if (aStatus == WorkflowDoc.COMMENT_STATUS_REMANDED) {
				if(aDeputyEmail != ''){
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_REMANDED_DEPUTY');	// '代理差戻';
				}else{
					return prefix_auto + MyLang.getMsg('STATUS_SHORT_REMANDED');	// '差戻';
				}
			}
			return '';
		},

		/**
		 * requestNewDocId
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestNewDocId: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getnewdocid?hl=' + SATERAITO_LANG, function(response) {

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getnewdocid](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							WorkflowDoc.requestNewDocId(callback, (aNumRetry + 1));
						} else {
							// １０回リトライしたがだめだった
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'), 10);
	//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));
						}
					}
					return;
				}

				var jsonData = response.data;

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestDocDetail
		 *
		 * @param {String} aDocId
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		requestDocDetail: function(aDocId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._requestDocDetailOid(aDocId, callback, aNumRetry);
			} else {
				WorkflowDoc._requestDocDetail(aDocId, callback, aNumRetry);
			}
		},

		/**
		 * _requestDocDetailOid
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestDocDetailOid: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getdocdetail?doc_id=' + aDocId + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowDoc._requestDocDetailOid(aDocId, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _requestDocDetail
		 *
		 * @param {String} aDocId
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		_requestDocDetail: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getdocdetail?doc_id=' + aDocId + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getdocdetail](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							WorkflowDoc._requestDocDetail(aDocId, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// 読込中メッセージを消去
							Sateraito.MiniMessage.clearMessage();

							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestCommentList
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestCommentList: function(aDocId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._requestCommentListOid(aDocId, callback, aNumRetry);
			} else {
				WorkflowDoc._requestCommentList(aDocId, callback, aNumRetry);
			}
		},

		/**
		 * _requestCommentListOid
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestCommentListOid: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getcommentlist?doc_id=' + aDocId + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowDoc._requestCommentListOid(aDocId, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _requestCommentList
		 *
		 * @param {string} aDocId
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestCommentList: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getcommentlist?doc_id=' + aDocId + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getcommentlist](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							WorkflowDoc._requestCommentList(aDocId, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// 読込中メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestOpenNotificationList：開封通知情報を取得
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestOpenNotificationList: function(aDocId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._requestOpenNotificationListOid(aDocId, callback, aNumRetry);
			} else {
				WorkflowDoc._requestOpenNotificationList(aDocId, callback, aNumRetry);
			}
		},

		/**
		 * _requestOpenNotificationListOid
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestOpenNotificationListOid: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getopennotificationlist?doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();
					// セット
					WorkflowDoc.openNotifications[aDocId] = jsonData;
					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);
					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						WorkflowDoc._requestOpenNotificationListOid(aDocId, callback, (aNumRetry + 1));

					} else {
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _requestOpenNotificationList
		 *
		 * @param {string} aDocId
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestOpenNotificationList: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getopennotificationlist?doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					// エラーメッセージ
					if(response.rc == 401){
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							WorkflowDoc._requestOpenNotificationList(aDocId, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// 読込中メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();
				// セット
				WorkflowDoc.openNotifications[aDocId] = jsonData;
				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestSendOpenNotification：開封通知処理
		 *
		 * @param {string} aDocId
		 * @param {string} aCurrentApproveNo
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestSendOpenNotification: function(aDocId, aCurrentApproveNo, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowDoc._requestSendOpenNotificationOid(aDocId, aCurrentApproveNo, callback, aNumRetry);
			} else {
				WorkflowDoc._requestSendOpenNotification(aDocId, aCurrentApproveNo, callback, aNumRetry);
			}
		},

		/**
		 * _requestSendOpenNotificationOid
		 *
		 * @param {string} aDocId
		 * @param {string} aCurrentApproveNo
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestSendOpenNotificationOid: function(aDocId, aCurrentApproveNo, callback, aNumRetry)
		{

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/sendopennotification?doc_id=' + encodeURIComponent(aDocId) + '&approve_number=' + encodeURIComponent(aCurrentApproveNo) + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// セット
					WorkflowDoc.openNotifications[aDocId] = jsonData;
					// コールバックをキック
					if(typeof(callback) !='undefined'){
						callback(jsonData);
					}
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);
					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						WorkflowDoc._requestSendOpenNotificationOid(aDocId, aCurrentApproveNo, callback, (aNumRetry + 1));

					} else {
						// 読込中メッセージを消去
						//OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _requestSendOpenNotification
		 *
		 * @param {string} aDocId
		 * @param {string} aCurrentApproveNo
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestSendOpenNotification: function(aDocId, aCurrentApproveNo, callback, aNumRetry)
		{

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/sendopennotification?doc_id=' + encodeURIComponent(aDocId) + '&approve_number=' + encodeURIComponent(aCurrentApproveNo) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					// エラーメッセージ
					if(response.rc == 401){
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							WorkflowDoc._requestSendOpenNotification(aDocId, aCurrentApproveNo, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// 読込中メッセージを消去
							//Sateraito.MiniMessage.clearMessage();
							//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				//Sateraito.MiniMessage.clearMessage();
				// セット
				WorkflowDoc.openNotifications[aDocId] = jsonData;
				// コールバックをキック
				if(typeof(callback) !='undefined'){
					callback(jsonData);
				}

			}, Sateraito.Util.requestParam());
		},

		// 添付ファイルをGoogleドライブでプレビューする
    openGoogleDocViewer: function(aElm){
      var file_id = $(aElm).attr('file_id');

			var app_id;
			if(typeof(APP_ID) == 'undefined'){
				app_id = LoginMgr.appId;
			}else{
				app_id = APP_ID;
			}

			// ワンタイムトークンを取得
			WorkflowUser.requestOneTimeToken(app_id, function(jsonData){
				var token = jsonData.token;
	      var google_doc_viewer_link = 'http://drive.google.com/viewer?hl=' + SATERAITO_LANG + '&url=' + encodeURIComponent(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + app_id + '/attach/previewattachedfile?file_id=' + encodeURIComponent(file_id) + '&ot_token=' + encodeURIComponent(token) + '&hl=' + SATERAITO_LANG);
  	    window.open(google_doc_viewer_link);
			});
    }

	};

	WorkflowUser = {

		userListLoadingStatus: 0,	// 0=ロード前 1=ロード中 2=ロード完了
		userList: [],
//		domainUserList: [],

//		/**
//		 * addUser
//		 *
//		 * @param {String} aUserEmail
//		 * @param {String} aUserName
//		 * @param {Bool} aIsDomainUser
//		 */
//		addUser: function(aUserEmail, aUserName, aIsDomainUser)
//		{
//			if (typeof(aIsDomainUser) == 'undefined') aIsDomainUser = false;
//
//			WorkflowUser.userList.push({
//				'user_email' : aUserEmail,
//				'user_name' : aUserName
//			});
//
//			if (aIsDomainUser) {
//				WorkflowUser.domainUserList.push({
//					'user_email' : aUserEmail,
//					'user_name' : aUserName
//				});
//			}
//		},

//		/**
//		 * setListByJson
//		 *
//		 * @param {Object} aJsondata
//		 */
//		setListByJson: function(aJsondata)
//		{
//			// ユーザー一覧配列にセット
//			WorkflowUser.userList = [];
//			$.each(aJsondata, function(i, user){
//				var userEmail = user.user_email;
//				var userName = user.family_name + user.given_name;
//				if (user.family_name == null && user.given_name == null) {
//					userName = userEmail;
//				}
//				WorkflowUser.addUser(userEmail, userName, true);
//			});
//		},

//		/**
//		 * setUserName
//		 *
//		 * @param {String} aUserEmail
//		 * @param {String} aUserName
//		 */
//		setUserName: function(aUserEmail, aUserName)
//		{
//			var found = false;
//
//			$.each(WorkflowUser.userList, function(index){
//				if (this.user_email == aUserEmail) {
//
//					found = true;
//
//					// ユーザー一覧の名前をアップデート
//					WorkflowUser.userList[index].user_name = aUserName;
//
//					return false;
//				}
//			});
//
//			if (!found) {
//				WorkflowUser.addUser(aUserEmail, aUserName);
//			}
//		},

		/**
		 * requestUserList
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestUserList: function(callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowUser._requestUserListOid(callback, aNumRetry);
			} else {
				WorkflowUser._requestUserList(callback, aNumRetry);
			}
		},

		/**
		 * _requestUserList
		 *
		 * ユーザー一覧を取得
		 *
		 * @param {Object} callback コールバック関数
		 * @param {Number} aNumRetry リトライ回数
		 */
		_requestUserList: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getwfuserlist?hl=' + SATERAITO_LANG, function(response) {

				// ユーザー一覧を取得したときのイベント

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getwfuserlist](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							WorkflowUser._requestUserList(callback, (aNumRetry + 1));
						} else {
							// １０回リトライしたがだめだった
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('FAILED_TO_LOAD_USER_INFOMATION'), 10);
							WorkflowUser.userListLoadingStatus = 0;
						}
					}
					return;
				}

				WorkflowUser.userListLoadingStatus = 2;

				var jsonData = response.data;

				// ユーザー一覧をセット
//				WorkflowUser.setListByJson(jsonData);
				WorkflowUser.userList = jsonData;

				// コールバックをキック
				if(typeof(callback) != 'undefined'){
					callback(jsonData);
				}

			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestUserListOid
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestUserListOid: function(callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getwfuserlist?hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// ユーザー一覧をセット
//					WorkflowUser.setListByJson(jsonData);
					WorkflowUser.userList = jsonData;

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					if(typeof(callback) != 'undefined'){
						callback(jsonData);
					}
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowUser._requestUserListOid(callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},


		/**
		 * requestToken
		 *
		 * ユーザートークンの取得
		 *
		 * @param {Function} callback
		 */
		requestToken: function(callback)
		{
			if (IS_OPENID_MODE) {
				WorkflowUser._requestTokenOid(callback);
			} else {
				WorkflowUser._requestToken(callback);
			}
		},

		/**
		 * _requestToken
		 *
		 * ユーザートークンの取得（ガジェットIO版）
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestToken: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/gettoken?hl=' + SATERAITO_LANG, function(response) {

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					SateraitoUI.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						WorkflowUser._requestToken(callback, (aNumRetry + 1));
					} else {
						// １０回リトライしたがだめだった
						if (response.rc == 401) {
							// ガジェットタイムアウト
							SateraitoUI.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));
						} else {
							SateraitoUI.showTimerMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'), 10);
						}
					}

					return;
				}

				var jsondata = response.data;

				// コールバックをキック
				callback(jsondata);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestTokenOid
		 *
		 * ユーザートークンの取得（OpenID版）
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestTokenOid: function(callback, aNumRetry)
		{
			// 読込中メッセージを表示
			OidMiniMessage.showLoadingMessage();
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/gettoken?hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowUser._requestTokenOid(callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * requestOneTimeToken
		 *
		 * ワンタイムトークンの取得
		 *
		 * @param {Function} callback
		 */
		requestOneTimeToken: function(app_id, callback, aNumRetry)
		{

			// 添付ファイル領域とかだと IS_OPENID_MODE = False なのに iframe（=gadgetsじゃない）だったりするので、微妙だけど「gadgets」で判断してみる...
			//if (IS_OPENID_MODE) {
			if (typeof(gadgets) == 'undefined') {
				WorkflowUser._requestOneTimeTokenOid(app_id, callback);
			} else {
				WorkflowUser._requestOneTimeToken(app_id, callback);
			}
		},

		/**
		 * _requestOneTimeToken
		 *
		 * ワンタイムトークンの取得（ガジェットIO版）
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestOneTimeToken: function(app_id, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + app_id + '/getonetimetoken?hl=' + SATERAITO_LANG, function(response) {

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					//SateraitoUI.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						WorkflowUser._requestOneTimeToken(app_id, callback, (aNumRetry + 1));
					//} else {
						// １０回リトライしたがだめだった
						//if (response.rc == 401) {
						//	// ガジェットタイムアウト
						//	SateraitoUI.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));
						//} else {
						//	SateraitoUI.showTimerMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'), 10);
						//}
					}

					return;
				}

				var jsondata = response.data;

				// コールバックをキック
				callback(jsondata);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestOneTimeTokenOid
		 *
		 * ワンタイムトークンの取得（OpenID版）
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestOneTimeTokenOid: function(app_id, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			OidMiniMessage.showLoadingMessage();
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				//url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + app_id + '/oid/getonetimetoken?hl=' + SATERAITO_LANG,
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + app_id + '/oid/getonetimetoken?' + '&token=' + USER_TOKEN + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						WorkflowUser._requestOneTimeTokenOid(app_id, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * getUser
		 *
		 * @param {String} aUserEmail
		 * @return {Object}
		 */
		getUser: function(aUserEmail)
		{
			var ret = null;
			$.each(WorkflowUser.userList, function(i, user){
				if (user.user_email == aUserEmail) {
					ret = user;
					// ここの「return false」は、$.eachを抜けるためのもの
					return false;
				}
			});
			return ret;
		},

		/**
		 * getUserByKey
		 *
		 * @param {String} getUserByKey
		 * @param {String} aUserKeyCol: employee_id or user_email(default)
		 * @return {Object}
		 */
		getUserByKey: function(aUserKey, aUserKeyCol)
		{
			var ret = null;
			$.each(WorkflowUser.userList, function(i, user){
				if(aUserKeyCol == 'employee_id'){
					if (user.employee_id == aUserKey) {
						ret = user;
						// ここの「return false」は、$.eachを抜けるためのもの
						return false;
					}
				}else{
					if (user.user_email == aUserKey) {
						ret = user;
						// ここの「return false」は、$.eachを抜けるためのもの
						return false;
					}
				}
			});
			return ret;
		},

		/**
		 * getUserName
		 *
		 * メールアドレスよりユーザー名を返す
		 *
		 * @param {String} aUserEmail
		 * @return {String} ユーザー名
		 */
		getUserName: function(aUserEmail)
		{
			var user = WorkflowUser.getUser(aUserEmail);
			if (user == null) {
				return aUserEmail;
			}
			return user.family_name + ' ' + user.given_name;
//			return user.user_name;
		}
	};

	Department1 = {

		department1List: null,
		dataStore: null,

		/**
		 * createDataStore
		 */
		createDataStore: function()
		{
			return new Ext.data.ArrayStore({
				id: 'store_department_1',
				fields: [
					{name: 'department_1'}
				]
			});
		},

		/**
		 * requestDepartment1List
		 *
		 * @param {boolean} aCacheOk
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestDepartment1List: function(aCacheOk, callback, aNumRetry)
		{
			// キャッシュOKの場合、最新のデータは取りに行かない
			if (aCacheOk) {
				if (Department1.department1List != null) {
					callback(Department1.department1List);
					return;
				}
			}

			if (IS_OPENID_MODE) {
				Department1._requestDepartment1ListOid(aCacheOk, callback, aNumRetry);
			} else {
				Department1._requestDepartment1List(aCacheOk, callback, aNumRetry);
			}
		},

		/**
		 * _requestDepartment1List
		 *
		 * 部署名１リストを取得
		 *
		 * @param {Object} callback コールバック関数
		 * @param {Number} aNumRetry リトライ回数
		 */
		_requestDepartment1List: function(aCacheOk, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getdepartment1list?hl=' + SATERAITO_LANG, function(response) {

				// ユーザー一覧を取得したときのイベント

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getdepartment1list](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							Department1._requestDepartment1List(aCacheOk, callback, (aNumRetry + 1));
						} else {
							// １０回リトライしたがだめだった
	//						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('FAILED_TO_LOAD_USER_INFOMATION'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// キャッシュにセット
				Department1.department1List = jsonData;

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestDepartment1ListOid
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestDepartment1ListOid: function(aCacheOk, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getdepartment1list?hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// キャッシュにセット
					Department1.department1List = jsonData;

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						Department1._requestDepartment1ListOid(aCacheOk, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		}

	};

	MasterData = {

		dataStore: {},
		masterData: {},
		masterDef: {},
		masterRows: {},

		/**
		 * putToDatastore: 管理用
		 *
		 * @param {string} aMasterCode
		 * @param {Array} aJsonData
		 * @param {bool} aHaveMoreRows:true…「全て表示」をだす
		 */
		putToDatastore: function(aMasterCode, aJsonData, aAppendMode, aHaveMoreRows)
		{
			// データ追加
			var masterDatas = [];
			var lastDataKey = '';
			Ext.each(aJsonData, function(){
				masterDatas.push([
					this.master_code,
					this.data_key,
					this.attribute_1,
					this.attribute_2,
					this.attribute_3,
					this.attribute_4,
					this.attribute_5,
					this.attribute_6,
					this.attribute_7,
					this.attribute_8,
					this.attribute_9,
					this.attribute_10,
					this.attribute_11,
					this.attribute_12,
					this.attribute_13,
					this.attribute_14,
					this.attribute_15,
					this.attribute_16,
					this.attribute_17,
					this.attribute_18,
					this.attribute_19,
					this.attribute_20,
					this.attribute_21,
					this.attribute_22,
					this.attribute_23,
					this.attribute_24,
					this.attribute_25,
					this.attribute_26,
					this.attribute_27,
					this.attribute_28,
					this.attribute_29,
					this.attribute_30,
					this.attribute_31,
					this.attribute_32,
					this.attribute_33,
					this.attribute_34,
					this.attribute_35,
					this.attribute_36,
					this.attribute_37,
					this.attribute_38,
					this.attribute_39,
					this.attribute_40,
					this.attribute_41,
					this.attribute_42,
					this.attribute_43,
					this.attribute_44,
					this.attribute_45,
					this.attribute_46,
					this.attribute_47,
					this.attribute_48,
					this.attribute_49,
					this.attribute_50,
					this.comment
				]);
				lastDataKey = this.data_key;
			});

			if (aHaveMoreRows) {
				masterDatas.push([
					'__read_more',
					'<span class="link_cmd2" onclick="MasterData.requestAppendMasterAndPutToDatastore(\'' + lastDataKey + '\', \'' + aMasterCode + '\');">' + MyLang.getMsg('READ_MORE') + '</span>',
					''
				]);
			}


			// 「さらに表示」行を削除
			var rowIndex = MasterData.dataStore[aMasterCode].find('master_code', '__read_more');
			if (rowIndex != -1) {
				MasterData.dataStore[aMasterCode].removeAt(rowIndex);
			}

			// データストアにデータをロードし、グリッドに表示させる
			MasterData.dataStore[aMasterCode].loadData(masterDatas, aAppendMode);
		},

		/**
		 * requestAppendMasterAndPutToDatastore:「さらに表示」の処理。追加でマスターを取得してグリッドに表示（管理グリッド用）
		 *
		 * @param {string} aMasterCode
		 */
		requestAppendMasterAndPutToDatastore: function(aOlderThanDataKey, aMasterCode)
		{
			MasterData.requestMasterData(aMasterCode, '', false, true, true, aOlderThanDataKey, function(aJsonData, aHaveMoreRows){
				var aAppendMode = true;
				MasterData.putToDatastore(aMasterCode, aJsonData, aAppendMode, aHaveMoreRows);
			});
		},

		/**
		 * putToDatastoreForMasterSelectWindow: ユーザーのマスター選択ウインドウ用
		 *
		 * @param {string} aMasterCode
		 * @param {Array} aJsonData
		 * @param {bool} aHaveMoreRows:true…「全て表示」をだす
		 */
		putToDatastoreForMasterSelectWindow: function(aMasterCode, aSearchText, aColWidths, aLimitSelections, aJsonData, aAppendMode, aHaveMoreRows)
		{

			var colNames = [
					'master_code',
					'data_key',
					'attribute_1',
					'attribute_2',
					'attribute_3',
					'attribute_4',
					'attribute_5',
					'attribute_6',
					'attribute_7',
					'attribute_8',
					'attribute_9',
					'attribute_10',
					'attribute_11',
					'attribute_12',
					'attribute_13',
					'attribute_14',
					'attribute_15',
					'attribute_16',
					'attribute_17',
					'attribute_18',
					'attribute_19',
					'attribute_20',
					'attribute_21',
					'attribute_22',
					'attribute_23',
					'attribute_24',
					'attribute_25',
					'attribute_26',
					'attribute_27',
					'attribute_28',
					'attribute_29',
					'attribute_30',
					'attribute_31',
					'attribute_32',
					'attribute_33',
					'attribute_34',
					'attribute_35',
					'attribute_36',
					'attribute_37',
					'attribute_38',
					'attribute_39',
					'attribute_40',
					'attribute_41',
					'attribute_42',
					'attribute_43',
					'attribute_44',
					'attribute_45',
					'attribute_46',
					'attribute_47',
					'attribute_48',
					'attribute_49',
					'attribute_50',
					'comment'
				];

			// データ追加
			var masterDatas = [];
			var lastDataKey = '';
			Ext.each(aJsonData, function(){

				var okToPush = true;
				if (aLimitSelections.length > 0) {
					if (aLimitSelections.indexOf(this.data_key) != -1) {
						okToPush = true;
					} else {
						okToPush = false;
					}
				}

				if (okToPush) {
					var masterData = [];
					var data = this;
					Ext.each(colNames, function(){
						var colName = this;
						masterData.push(data[colName]);
					});
					masterDatas.push(masterData);
					lastDataKey = this.data_key;
				}
			});

			if (aHaveMoreRows) {

				// 「もっと見る」を表示する際にどのカラムに表示すべきかを決定するために列幅をチェック。。。

				var aLimitSelectionsJson = Ext.encode(aLimitSelections);
				var aColWidthsJson = Ext.encode(aColWidths);

				var readMoreRecord = [];
				readMoreRecord.push('__read_more');
				for(i = 1; i < colNames.length; i++){
					var colName = colNames[i];
					var colWidth = MasterWindow.getColWidth(aColWidths, colName);
					if (colWidth == 0) {
						readMoreRecord.push('');
					}else{
						readMoreRecord.push('<span class="link_cmd2" onclick="MasterData.requestAppendMasterAndPutToDatastoreForMasterSelectWindow(\'' + lastDataKey + '\', \'' + aMasterCode + '\', \'' + encodeURIComponent(aSearchText) + '\', \'' + encodeURIComponent(aColWidthsJson) + '\', \'' + encodeURIComponent(aLimitSelectionsJson) + '\');">' + MyLang.getMsg('READ_MORE') + '</span>');
						break;
					}
				}
				masterDatas.push(readMoreRecord);

			}

			// 「さらに表示」行を削除
			var rowIndex = MasterData.dataStore[aMasterCode].find('master_code', '__read_more');
			if (rowIndex != -1) {
				MasterData.dataStore[aMasterCode].removeAt(rowIndex);
			}

			// データストアにデータをロードし、グリッドに表示させる
			MasterData.dataStore[aMasterCode].loadData(masterDatas, aAppendMode);
		},



		/**
		 * requestAppendMasterAndPutToDatastoreForMasterSelectWindow:「さらに表示」の処理。追加でマスターを取得してグリッドに表示（マスター選択ボックス用）
		 *
		 * @param {string} aMasterCode
		 */
		requestAppendMasterAndPutToDatastoreForMasterSelectWindow: function(aOlderThanDataKey, aMasterCode, aSearchText, aColWidthsJson, aLimitSelectionsJson)
		{
			aLimitSelectionsJson = decodeURIComponent(aLimitSelectionsJson);
			aColWidthsJson = decodeURIComponent(aColWidthsJson);
			aSearchText = decodeURIComponent(aSearchText);
			var aLimitSelections = Ext.decode(aLimitSelectionsJson);
			var aColWidths = Ext.decode(aColWidthsJson);
			MasterData.requestMasterData(aMasterCode, aSearchText, false, false, true, aOlderThanDataKey, function(aJsonData, aHaveMoreRows){
				var aAppendMode = true;
				MasterData.putToDatastoreForMasterSelectWindow(aMasterCode, aSearchText, aColWidths, aLimitSelections, aJsonData, aAppendMode, aHaveMoreRows);
			});
		},

		/**
		 * createDataStore
		 *
		 * @param {string} aMasterCode
		 */
		createDataStore: function(aMasterCode)
		{
			return new Ext.data.ArrayStore({
				id: 'store_master_data_' + aMasterCode,
				fields: [
					{name: 'master_code'},
					{name: 'data_key'},
					{name: 'attribute_1'},
					{name: 'attribute_2'},
					{name: 'attribute_3'},
					{name: 'attribute_4'},
					{name: 'attribute_5'},
					{name: 'attribute_6'},
					{name: 'attribute_7'},
					{name: 'attribute_8'},
					{name: 'attribute_9'},
					{name: 'attribute_10'},
					{name: 'attribute_11'},
					{name: 'attribute_12'},
					{name: 'attribute_13'},
					{name: 'attribute_14'},
					{name: 'attribute_15'},
					{name: 'attribute_16'},
					{name: 'attribute_17'},
					{name: 'attribute_18'},
					{name: 'attribute_19'},
					{name: 'attribute_20'},
					{name: 'attribute_21'},
					{name: 'attribute_22'},
					{name: 'attribute_23'},
					{name: 'attribute_24'},
					{name: 'attribute_25'},
					{name: 'attribute_26'},
					{name: 'attribute_27'},
					{name: 'attribute_28'},
					{name: 'attribute_29'},
					{name: 'attribute_30'},
					{name: 'attribute_31'},
					{name: 'attribute_32'},
					{name: 'attribute_33'},
					{name: 'attribute_34'},
					{name: 'attribute_35'},
					{name: 'attribute_36'},
					{name: 'attribute_37'},
					{name: 'attribute_38'},
					{name: 'attribute_39'},
					{name: 'attribute_40'},
					{name: 'attribute_41'},
					{name: 'attribute_42'},
					{name: 'attribute_43'},
					{name: 'attribute_44'},
					{name: 'attribute_45'},
					{name: 'attribute_46'},
					{name: 'attribute_47'},
					{name: 'attribute_48'},
					{name: 'attribute_49'},
					{name: 'attribute_50'},
					{name: 'comment'},
					{name: 'created_date'}
				]
			});
		},

		/**
		 * requestDeleteMasterData
		 *
		 * @param {string} aMasterCode
		 * @param {function} callback
		 */
		requestDeleteMasterData: function(aMasterCode, callback)
		{
			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('UPDATING'));

			var postData = {
				'master_code': aMasterCode,
				'token': MyUtil.getToken(),
				'hl': SATERAITO_LANG
			};

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/deletemaster', function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[deletemaster]' + err);

					alert(MyLang.getMsg('ERROR_WHILE_UPDATING'));

					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * hasMasterDataCache
		 *
		 * @param {string} aMasterCode
		 * @return {boolean}
		 */
		hasMasterDataCache: function(aMasterCode)
		{
			// キャッシュをチェック
			if (typeof(MasterData.masterData[aMasterCode]) != 'undefined') {
				// キャッシュがあった
				return true;
			}
			return false;
		},

		/**
		 * requestMasterData
		 *
		 * マスターデータの取得
		 *
		 * @param {string} aMasterCode
		 * @param {string} aSearchText
		 * @param {boolean} aCacheOk
		 * @param {boolean} aAdminMode
		 * @param {boolean} aOnlyTopRecords
		 * @param {string} aOlderThanDataKey
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		requestMasterData: function(aMasterCode, aSearchText, aCacheOk, aAdminMode, aOnlyTopRecords, aOlderThanDataKey, callback, aNumRetry)
		{
			// キャッシュOKの場合
			if (aCacheOk) {

				// キャッシュをチェック

				if (typeof(MasterData.masterData[aMasterCode]) != 'undefined') {
					// キャッシュがあった
					callback(MasterData.masterData[aMasterCode]);
					return;
				}
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			if (IS_OPENID_MODE) {
				MasterData._requestMasterDataOid(aMasterCode, aSearchText, aCacheOk, aAdminMode, aOnlyTopRecords, aOlderThanDataKey, callback, aNumRetry);
			} else {
				MasterData._requestMasterData(aMasterCode, aSearchText, aCacheOk, aAdminMode, aOnlyTopRecords, aOlderThanDataKey, callback, aNumRetry);
			}

		},

		/**
		 * _requestMasterData
		 *
		 * マスターデータの取得
		 *
		 * @param {string} aMasterCode
		 * @param {string} aSearchText
		 * @param {boolean} aCacheOk
		 * @param {boolean} aAdminMode
		 * @param {boolean} aOnlyTopRecords
		 * @param {string} aOlderThanDataKey
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestMasterData: function(aMasterCode, aSearchText, aCacheOk, aAdminMode, aOnlyTopRecords, aOlderThanDataKey, callback, aNumRetry)
		{

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			var pageName = 'getmasterdata';
			if (aAdminMode) {
				pageName = 'getmasterdataadmin';
			}

			if(typeof(aCacheOk) == 'undefined'){
				aCacheOk = false;
			}

			if(typeof(aOnlyTopRecords) == 'undefined'){
				aOnlyTopRecords = false;
			}

			if(typeof(aOlderThanDataKey) == 'undefined'){
				aOlderThanDataKey = '';
			}

			if(typeof(aSearchText) == 'undefined'){
				aSearchText = '';
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/' + pageName + '?master_code=' + aMasterCode + '&onlytoprecords=' + encodeURIComponent(aOnlyTopRecords) + '&older_than_data_key=' + encodeURIComponent(aOlderThanDataKey) + '&search_keyword=' + encodeURIComponent(aSearchText) + '&v=3' + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[' + pageName + '](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							MasterData._requestMasterData(aMasterCode, aSearchText, aCacheOk, aAdminMode, aOnlyTopRecords, aOlderThanDataKey, callback, (aNumRetry + 1));
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}
				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				var jsonData = response.data;
				var masterDatas = jsonData.master_datas;
				var have_more_rows = jsonData.have_more_rows;

				// エラーチェック 2013.11.27
				if(jsonData.status == 'error'){
					if(jsonData.error_code == 'need_cached_data'){
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_GET_MASTER_DATA_BY_NEED_CACHED_DATA'), 10);
					}else{
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
					}
					return;
				}

				// キャッシュに保存（キャッシュできる場合、つまり全件取得した場合はキャッシュしておく）
				//if(aOnlyTopRecords == false){
				if((aOnlyTopRecords == false || have_more_rows == false) && aOlderThanDataKey == '' && aSearchText == ''){
					MasterData.masterData[aMasterCode] = masterDatas;
				}

				// コールバックをキック
				callback(masterDatas, have_more_rows);
			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestMasterDataOid
		 *
		 * マスターデータの取得
		 *
		 * @param {string} aMasterCode
		 * @param {string} aSearchText
		 * @param {boolean} aCacheOk
		 * @param {boolean} aAdminMode
		 * @param {boolean} aOnlyTopRecords
		 * @param {string} aOlderThanDataKey
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestMasterDataOid: function(aMasterCode, aSearchText, aCacheOk, aAdminMode, aOnlyTopRecords, aOlderThanDataKey, callback, aNumRetry)
		{

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			var pageName = 'getmasterdata';
			if (aAdminMode) {
				pageName = 'getmasterdataadmin';
			}

			if(typeof(aCacheOk) == 'undefined'){
				aCacheOk = false;
			}

			if(typeof(aOnlyTopRecords) == 'undefined'){
				aOnlyTopRecords = false;
			}

			if(typeof(aOlderThanDataKey) == 'undefined'){
				aOlderThanDataKey = '';
			}

			if(typeof(aSearchText) == 'undefined'){
				aSearchText = '';
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/' + pageName + '?master_code=' + aMasterCode + '&onlytoprecords=' + encodeURIComponent(aOnlyTopRecords) + '&older_than_data_key=' + encodeURIComponent(aOlderThanDataKey) + '&search_keyword=' + encodeURIComponent(aSearchText) + '&v=3' + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);
					var masterDatas = jsonData.master_datas;
					var have_more_rows = jsonData.have_more_rows;

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// キャッシュに保存（キャッシュできる場合、つまり全件取得した場合はキャッシュしておく）
					//if(aOnlyTopRecords == false){
					if((aOnlyTopRecords == false || have_more_rows == false) && aOlderThanDataKey == '' && aSearchText == ''){
						MasterData.masterData[aMasterCode] = masterDatas;
					}

					callback(masterDatas, have_more_rows);

				},
				failure: function()
				{
					// エラーメッセージ
					OidMiniMessage.showErrMiniMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						MasterData._requestMasterDataOid(aMasterCode, aSearchText, aCacheOk, aAdminMode, aOnlyTopRecords, aOlderThanDataKey, callback, (aNumRetry + 1));
					} else {
						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('ERROR_WHILE_LOADING'));
					}
				}
			});

		},

		/**
		 * requestMasterDataRow
		 *
		 * @param {string} aMasterCode
		 * @param {string} aDataKeyValue
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestMasterDataRow: function(aMasterCode, aDataKeyValue, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			if (IS_OPENID_MODE) {
				MasterData._requestMasterDataRowOid(aMasterCode, aDataKeyValue, callback, aNumRetry);
			} else {
				MasterData._requestMasterDataRow(aMasterCode, aDataKeyValue, callback, aNumRetry);
			}
		},

		/**
		 * _requestMasterDataRow
		 *
		 * @param {string} aMasterCode
		 * @param {string} aDataKeyValue
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestMasterDataRow: function(aMasterCode, aDataKeyValue, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			// 送信データ作成
			var postData = {
				'data_key': aDataKeyValue
			};

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getmasterdatarow?master_code=' + encodeURIComponent(aMasterCode) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getmasterdatarow](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							MasterData.requestMasterDataRow(aMasterCode, aDataKeyValue, callback, (aNumRetry + 1));
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);
			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * _requestMasterDataRowOid
		 *
		 * @param {string} aMasterCode
		 * @param {string} aDataKeyValue
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestMasterDataRowOid: function(aMasterCode, aDataKeyValue, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			// 送信データ作成
			var postData = {
				'data_key': aDataKeyValue
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getmasterdatarow?master_code=' + encodeURIComponent(aMasterCode) + '&hl=' + SATERAITO_LANG,
				params:postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					callback(jsonData);

				},
				failure: function()
				{
					// エラーメッセージ
					OidMiniMessage.showErrMiniMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						MasterData._requestMasterDataRowOid(aMasterCode, aDataKeyValue, callback, (aNumRetry + 1));
					} else {
						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('ERROR_WHILE_LOADING'));
					}
				}
			});
		},


		/**
		 * requestMasterReferenceChain
		 *
		 * マスター参照フィールド用のデータをプリロード（1つずつ処理してチェインする）
		 *
		 */
		requestMasterReferenceChain: function(aMasterDataKeys, callback, aMasterDataDic, idx)
		{
			if(typeof(idx) == 'undefined'){
				idx = 0;
			}
			if(aMasterDataKeys.length <= idx){
				callback();
				return;
			}
			if(typeof(aMasterDataDic) == 'undefined'){
				aMasterDataDic = {};
			}

			// 参照実行
			var aMasterDataKey = aMasterDataKeys[idx];
			// 参照するマスターコード
			var aMasterCode = aMasterDataKey['master_code'];
			// 参照するマスターキー値
			var dataKeyValue = aMasterDataKey['data_key'];

			var masterRowDic;
			if(typeof(MasterData.masterRows[aMasterCode]) == 'undefined'){
				masterRowDic = {};
				MasterData.masterRows[aMasterCode] = masterRowDic;
			}else{
				masterRowDic = MasterData.masterRows[aMasterCode];
			}
			if(typeof(masterRowDic[dataKeyValue]) == 'undefined'){
				// マスターがプリロード済みならそこに全件あるはずなのでそこから取得（そこになければないということ）
				if(typeof(MasterData.masterData[aMasterCode]) != 'undefined'){
					// プリロードマスターをハッシュに変換（毎回ループするのも非効率なので）
					var masterDataByKey;
					if(typeof(aMasterDataDic[aMasterCode]) == 'undefined'){
						masterDataByKey = {};
						Ext.each(MasterData.masterData[aMasterCode], function(){
							var aRow = this;
							masterDataByKey[aRow.data_key] = aRow;
						});
						aMasterDataDic[aMasterCode] = masterDataByKey;
					}else{
						masterDataByKey = aMasterDataDic[aMasterCode];
					}

					// プリロードしたマスターにあればセットなければ一応とりにいってみる
					if(typeof(masterDataByKey[dataKeyValue]) != 'undefined'){
						masterRowDic[dataKeyValue] = masterDataByKey[dataKeyValue];
					}else{
						MasterData.requestMasterDataRow(aMasterCode, dataKeyValue, function(aRow){
							masterRowDic[dataKeyValue] = aRow;
							if(aMasterDataKeys.length - 1 == idx){
								callback();
								return;
							}
							MasterData.requestMasterReferenceChain(aMasterDataKeys, callback, aMasterDataDic, idx+1);
						});
						return;
					}

					if(aMasterDataKeys.length - 1 == idx){
						callback();
						return;
					}
					MasterData.requestMasterReferenceChain(aMasterDataKeys, callback, aMasterDataDic, idx+1);
				}else{
					MasterData.requestMasterDataRow(aMasterCode, dataKeyValue, function(aRow){
						masterRowDic[dataKeyValue] = aRow;
						if(aMasterDataKeys.length - 1 == idx){
							callback();
							return;
						}
						MasterData.requestMasterReferenceChain(aMasterDataKeys, callback, aMasterDataDic, idx+1);
					});
					return;
				}
			}else{
				if(aMasterDataKeys.length - 1 == idx){
					callback();
					return;
				}
				MasterData.requestMasterReferenceChain(aMasterDataKeys, callback, aMasterDataDic, idx+1);
			}
		},

		/**
		 * requestMasterDef
		 *
		 * @param {string} aMasterCode
		 * @param {boolean} aCacheOk
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		requestMasterDef: function(aMasterCode, aCacheOk, callback, aNumRetry)
		{
			// キャッシュOKの場合、最新のデータは取りに行かない
			if (aCacheOk) {
				if (typeof(MasterData.masterDef[aMasterCode]) != 'undefined') {
					callback(MasterData.masterDef[aMasterCode]);
					return;
				}
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			if (IS_OPENID_MODE) {
				MasterData._requestMasterDefOid(aMasterCode, aCacheOk, callback, aNumRetry);
			} else {
				MasterData._requestMasterDef(aMasterCode, aCacheOk, callback, aNumRetry);
			}
		},

		/**
		 * _requestMasterDefOid
		 *
		 * @param {string} aMasterCode
		 * @param {boolean} aCacheOk
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestMasterDefOid: function(aMasterCode, aCacheOk, callback, aNumRetry)
		{

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getmasterdef?master_code=' + encodeURIComponent(aMasterCode) + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();
					// 保存
					MasterData.masterDef[aMasterCode] = jsonData;

					callback(jsonData);

				},
				failure: function()
				{
					// エラーメッセージ
					OidMiniMessage.showErrMiniMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						DocDetailWindow._requestMasterDefOid(aMasterCode, aCacheOk, callback, (aNumRetry + 1));
					} else {
						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('ERROR_WHILE_LOADING'));
					}
				}
			});
		},

		/**
		 * _requestMasterDef
		 *
		 *
		 * @param {string} aMasterCode
		 * @param {boolean} aCacheOk
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestMasterDef: function(aMasterCode, aCacheOk, callback, aNumRetry)
		{

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getmasterdef?master_code=' + encodeURIComponent(aMasterCode) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getmasterdef](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							// リトライ
							MasterData.requestMasterDef(aMasterCode, aCacheOk, callback, (aNumRetry + 1));
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// 保存
				MasterData.masterDef[aMasterCode] = jsonData;

				callback(jsonData);

			}, Sateraito.Util.requestParam());

		},


		/**
		 * requestMasterDefList
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestMasterDefList: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getmasterlist?hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getmasterlist](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							MasterData.requestMasterDefList(callback, (aNumRetry + 1));
						} else {
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				callback(jsonData);

			}, Sateraito.Util.requestParam());
		}
	};

	MasterWindow = {

		/**
		 * masterSelectFormButtonClick
		 *
		 * @param {element} aButtonElement
		 * @param {string} aDocId ... 新規ドキュメントの場合は、'new_doc'
		 */
		masterSelectFormButtonClick: function(aButtonElement, aDocId)
		{
			//
			// マスター選択ウィンドウの幅指定
			//
			var windowWidth = $(aButtonElement).attr('window_width');
			if (typeof(windowWidth) == 'undefined' || windowWidth == null || windowWidth == '') {
				// no option
			} else {
				if (isNaN(windowWidth)) {
					windowWidth = '';
				}
			}

			//
			// マスター選択ウィンドウの高さ指定
			//
			var windowHeight = $(aButtonElement).attr('window_height');
			if (typeof(windowHeight) == 'undefined' || windowHeight == null || windowHeight == '') {
				// no option
			} else {
				if (isNaN(windowHeight)) {
					windowHeight = '';
				}
			}

			//
			// 選択時のフィールドへの値のアサイン
			//
			var assign = $(aButtonElement).attr('assign');
			var assigns = assign.split(';');
			var arrayAssigns = [];
			Ext.each(assigns, function(){
				var colonString = '' + this;
				var colonStringSplited = colonString.split(':');
				arrayAssigns.push({
					colName: colonStringSplited[0],
					inputNameToApplyValue: colonStringSplited[1]
				});
			});

			//
			// 表示時のカラム幅
			//
			// マスター一覧グリッドの個々のカラム幅を指定
			//
			var arrayColWidth = [];
			var col_width = $(aButtonElement).attr('col_width');
			if (typeof(col_width) == 'undefined') {
				// no option
			} else {
				var col_widths = col_width.split(';');
				Ext.each(col_widths, function(){
					var colonString = '' + this;
					var colonStringSplited = colonString.split(':');
					arrayColWidth.push({
						colName: colonStringSplited[0],
						colWidth: colonStringSplited[1]
					});
				});
			}

			//
			// 表示制限
			//
			// データのキーを列挙して、そのデータ以外は表示させないようにする
			//
			// 例）
			//  <button class="sateraito_master_select" limit_selection="100 200 300">
			//
			var limitSelection = $(aButtonElement).attr('limit_selection');
			var arrayLimitSelection = [];
			if (typeof(limitSelection) == 'undefined' || limitSelection == null || limitSelection == '') {
				// no option
			} else {
				var limitSelections = limitSelection.split(' ');
				Ext.each(limitSelections, function(){
					arrayLimitSelection.push('' + this);
				});
			}

			// 呼び出すマスターのマスターコード
			var masterCode = $(aButtonElement).attr('master_code');

			// マスター選択ウィンドウを表示
			MasterWindow.showWindow(masterCode, arrayAssigns, arrayColWidth, arrayLimitSelection, aDocId, windowWidth, windowHeight, function(aSelectedMasterRow){

				// マスターの行のどれかを選択し、アサインに値を入れた後のコールバック

				//
				// マスター選択時イベントハンドラをキック
				//

				var window = Ext.getCmp('doc_detail_window_' + aDocId);
				if (typeof(window.wfEventHandler) != 'undefined') {
					if (typeof(window.wfEventHandler['onMasterSelected']) == 'function') {
						var handler = window.wfEventHandler['onMasterSelected'];
						handler(aButtonElement, aSelectedMasterRow);
					}
				}
			});
		},

		/**
		 * onSelectClick
		 *
		 * @param {string} aMasterCode
		 * @param {array} aAssigns
		 */
		onSelectClick: function(aMasterCode, aAssigns, aDocId, masterSelectedCallback)
		{
			var grid = Ext.ComponentMgr.get('master_data_grid_' + aMasterCode);
			var sm = grid.selModel;
			var record = sm.getSelected();
			if (typeof(record) != 'undefined') {

				// 選択されたマスターデータをアサインされたフィールドにセットする
				var dataKey = record.data.data_key;
				Ext.each(aAssigns, function(){

					var colName = this.colName;
					var inputNameToApplyValue = this.inputNameToApplyValue;

					var selectedColValue = record.data[colName];

//					$('#template_body_' + aDocId).find('input[name=' + inputNameToApplyValue + ']').val(selectedColValue);
//					$('#template_body_' + aDocId).find('input[name=' + inputNameToApplyValue + ']').each(function(){
					$('#template_body_' + aDocId).find(':input[name=' + inputNameToApplyValue + ']').each(function(){
						var element = this;
						if ($(element).hasClass('number')) {
							// 数値クラスの場合
							selectedColValue = NumUtil.addComma(NumUtil.removeComma(selectedColValue));
							$(element).val(selectedColValue);
						} else if ($(element).is('textarea')) {
							// テキストエリアの場合
							$(element).val(selectedColValue).trigger('autosize.resize');
						} else if ($(element).is(':checkbox')) {
							// チェックボックスの場合
							if((',' + selectedColValue + ',').indexOf(',' + $(element).val() + ',') >= 0){
								$(element).attr('checked', 'checked');
							}else{
								$(element).removeAttr('checked');
							}
						} else {
							$(element).val(selectedColValue);
						}
					});
				});

				// 計算実行
				Calc.calcAll('template_body_' + aDocId);
				// マスターリファレンス実行
				FieldConvert.masterReferenceAll('template_body_' + aDocId);

				// ウィンドウを閉じる
				Ext.ComponentMgr.get('master_window_' + aMasterCode).close();

				// コールバックをキック
				masterSelectedCallback(record.data);
			}
		},

		/**
		 * onSearchClick
		 *
		 * @param {string} aMasterCode
 		 * @param {array} aLimitSelections 表示制限（data_key値の配列）
		 */
		onSearchClick: function (aMasterCode, aColWidths, aLimitSelections)
		{
			var searchText = Ext.ComponentMgr.get('search_keyword').getValue();

			// 表示をクリア
			var cmp = Ext.ComponentMgr.get('master_data_grid_' + aMasterCode);
			if(!cmp)
			{
				alert(MyLang.getMsg('MSG_NOT_REGIST_THE_MASTER') + 'master_code=[' + aMasterCode + ']');
				return;
			}

			var store = cmp.getStore();
			store.removeAll();

			// サーバーサイド処理に対応（Ajaxで取得） 2013.11.26
			if(typeof(MasterData.masterData[aMasterCode]) == 'undefined'){

				MasterData.requestMasterData(aMasterCode, searchText, false, false, true, '', function(aJsonData, aHaveMoreRows){
					MasterData.putToDatastoreForMasterSelectWindow(aMasterCode, searchText, aColWidths, aLimitSelections, aJsonData, false, aHaveMoreRows);
				});

			// 従来通りキャッシュ内で処理
			}else{

				// レコード
				var MyDataRecord = Ext.data.Record.create([
						{name: 'master_code'},
						{name: 'data_key'},
						{name: 'attribute_1'},
						{name: 'attribute_2'},
						{name: 'attribute_3'},
						{name: 'attribute_4'},
						{name: 'attribute_5'},
						{name: 'attribute_6'},
						{name: 'attribute_7'},
						{name: 'attribute_8'},
						{name: 'attribute_9'},
						{name: 'attribute_10'},
						{name: 'attribute_11'},
						{name: 'attribute_12'},
						{name: 'attribute_13'},
						{name: 'attribute_14'},
						{name: 'attribute_15'},
						{name: 'attribute_16'},
						{name: 'attribute_17'},
						{name: 'attribute_18'},
						{name: 'attribute_19'},
						{name: 'attribute_20'},
						{name: 'attribute_21'},
						{name: 'attribute_22'},
						{name: 'attribute_23'},
						{name: 'attribute_24'},
						{name: 'attribute_25'},
						{name: 'attribute_26'},
						{name: 'attribute_27'},
						{name: 'attribute_28'},
						{name: 'attribute_29'},
						{name: 'attribute_30'},
						{name: 'attribute_31'},
						{name: 'attribute_32'},
						{name: 'attribute_33'},
						{name: 'attribute_34'},
						{name: 'attribute_35'},
						{name: 'attribute_36'},
						{name: 'attribute_37'},
						{name: 'attribute_38'},
						{name: 'attribute_39'},
						{name: 'attribute_40'},
						{name: 'attribute_41'},
						{name: 'attribute_42'},
						{name: 'attribute_43'},
						{name: 'attribute_44'},
						{name: 'attribute_45'},
						{name: 'attribute_46'},
						{name: 'attribute_47'},
						{name: 'attribute_48'},
						{name: 'attribute_49'},
						{name: 'attribute_50'},
						{name: 'created_date'}
				]);

				// 検索対象配列
				var arrayToSearch = MasterData.masterData[aMasterCode];

				if (searchText == '') {
					// 全件表示
					Ext.each(arrayToSearch, function(){
						var okToPush = true;
						if (aLimitSelections && aLimitSelections.length > 0) {
							if (aLimitSelections.indexOf(this.data_key) != -1) {
								okToPush = true;
							} else {
								okToPush = false;
							}
						}

						if (okToPush) {
							var newRecord = new MyDataRecord({
								master_code: this.master_code,
								data_key: this.data_key,
								attribute_1: this.attribute_1,
								attribute_2: this.attribute_2,
								attribute_3: this.attribute_3,
								attribute_4: this.attribute_4,
								attribute_5: this.attribute_5,
								attribute_6: this.attribute_6,
								attribute_7: this.attribute_7,
								attribute_8: this.attribute_8,
								attribute_9: this.attribute_9,
								attribute_10: this.attribute_10,
								attribute_11: this.attribute_11,
								attribute_12: this.attribute_12,
								attribute_13: this.attribute_13,
								attribute_14: this.attribute_14,
								attribute_15: this.attribute_15,
								attribute_16: this.attribute_16,
								attribute_17: this.attribute_17,
								attribute_18: this.attribute_18,
								attribute_19: this.attribute_19,
								attribute_20: this.attribute_20,
								attribute_21: this.attribute_21,
								attribute_22: this.attribute_22,
								attribute_23: this.attribute_23,
								attribute_24: this.attribute_24,
								attribute_25: this.attribute_25,
								attribute_26: this.attribute_26,
								attribute_27: this.attribute_27,
								attribute_28: this.attribute_28,
								attribute_29: this.attribute_29,
								attribute_30: this.attribute_30,
								attribute_31: this.attribute_31,
								attribute_32: this.attribute_32,
								attribute_33: this.attribute_33,
								attribute_34: this.attribute_34,
								attribute_35: this.attribute_35,
								attribute_36: this.attribute_36,
								attribute_37: this.attribute_37,
								attribute_38: this.attribute_38,
								attribute_39: this.attribute_39,
								attribute_40: this.attribute_40,
								attribute_41: this.attribute_41,
								attribute_42: this.attribute_42,
								attribute_43: this.attribute_43,
								attribute_44: this.attribute_44,
								attribute_45: this.attribute_45,
								attribute_46: this.attribute_46,
								attribute_47: this.attribute_47,
								attribute_48: this.attribute_48,
								attribute_49: this.attribute_49,
								attribute_50: this.attribute_50

							});
							store.add(newRecord);
						}
					});
					return;
				}

				// キャッシュOKでリクエストしたので、キャッシュされているはず
				Ext.each(arrayToSearch, function(){
					var okToPush = true;
					if (aLimitSelections && aLimitSelections.length > 0) {
						if (aLimitSelections.indexOf(this.data_key) != -1) {
							okToPush = true;
						} else {
							okToPush = false;
						}
					}

					if (okToPush) {
						if (this.data_key.indexOf(searchText) != -1
							|| this.attribute_1.indexOf(searchText) != -1
							|| this.attribute_2.indexOf(searchText) != -1
							|| this.attribute_3.indexOf(searchText) != -1
							|| this.attribute_4.indexOf(searchText) != -1
							|| this.attribute_5.indexOf(searchText) != -1
							|| this.attribute_6.indexOf(searchText) != -1
							|| this.attribute_7.indexOf(searchText) != -1
							|| this.attribute_8.indexOf(searchText) != -1
							|| this.attribute_9.indexOf(searchText) != -1
							|| this.attribute_10.indexOf(searchText) != -1
							|| this.attribute_11.indexOf(searchText) != -1
							|| this.attribute_12.indexOf(searchText) != -1
							|| this.attribute_13.indexOf(searchText) != -1
							|| this.attribute_14.indexOf(searchText) != -1
							|| this.attribute_15.indexOf(searchText) != -1
							|| this.attribute_16.indexOf(searchText) != -1
							|| this.attribute_17.indexOf(searchText) != -1
							|| this.attribute_18.indexOf(searchText) != -1
							|| this.attribute_19.indexOf(searchText) != -1
							|| this.attribute_20.indexOf(searchText) != -1
							|| this.attribute_21.indexOf(searchText) != -1
							|| this.attribute_22.indexOf(searchText) != -1
							|| this.attribute_23.indexOf(searchText) != -1
							|| this.attribute_24.indexOf(searchText) != -1
							|| this.attribute_25.indexOf(searchText) != -1
							|| this.attribute_26.indexOf(searchText) != -1
							|| this.attribute_27.indexOf(searchText) != -1
							|| this.attribute_28.indexOf(searchText) != -1
							|| this.attribute_29.indexOf(searchText) != -1
							|| this.attribute_30.indexOf(searchText) != -1
							|| this.attribute_31.indexOf(searchText) != -1
							|| this.attribute_32.indexOf(searchText) != -1
							|| this.attribute_33.indexOf(searchText) != -1
							|| this.attribute_34.indexOf(searchText) != -1
							|| this.attribute_35.indexOf(searchText) != -1
							|| this.attribute_36.indexOf(searchText) != -1
							|| this.attribute_37.indexOf(searchText) != -1
							|| this.attribute_38.indexOf(searchText) != -1
							|| this.attribute_39.indexOf(searchText) != -1
							|| this.attribute_40.indexOf(searchText) != -1
							|| this.attribute_41.indexOf(searchText) != -1
							|| this.attribute_42.indexOf(searchText) != -1
							|| this.attribute_43.indexOf(searchText) != -1
							|| this.attribute_44.indexOf(searchText) != -1
							|| this.attribute_45.indexOf(searchText) != -1
							|| this.attribute_46.indexOf(searchText) != -1
							|| this.attribute_47.indexOf(searchText) != -1
							|| this.attribute_48.indexOf(searchText) != -1
							|| this.attribute_49.indexOf(searchText) != -1
							|| this.attribute_50.indexOf(searchText) != -1) {

							// キーワードにマッチした
							var newRecord = new MyDataRecord({
								master_code: this.master_code,
								data_key: this.data_key,
								attribute_1: this.attribute_1,
								attribute_2: this.attribute_2,
								attribute_3: this.attribute_3,
								attribute_4: this.attribute_4,
								attribute_5: this.attribute_5,
								attribute_6: this.attribute_6,
								attribute_7: this.attribute_7,
								attribute_8: this.attribute_8,
								attribute_9: this.attribute_9,
								attribute_10: this.attribute_10,
								attribute_11: this.attribute_11,
								attribute_12: this.attribute_12,
								attribute_13: this.attribute_13,
								attribute_14: this.attribute_14,
								attribute_15: this.attribute_15,
								attribute_16: this.attribute_16,
								attribute_17: this.attribute_17,
								attribute_18: this.attribute_18,
								attribute_19: this.attribute_19,
								attribute_20: this.attribute_20,
								attribute_21: this.attribute_21,
								attribute_22: this.attribute_22,
								attribute_23: this.attribute_23,
								attribute_24: this.attribute_24,
								attribute_25: this.attribute_25,
								attribute_26: this.attribute_26,
								attribute_27: this.attribute_27,
								attribute_28: this.attribute_28,
								attribute_29: this.attribute_29,
								attribute_30: this.attribute_30,
								attribute_31: this.attribute_31,
								attribute_32: this.attribute_32,
								attribute_33: this.attribute_33,
								attribute_34: this.attribute_34,
								attribute_35: this.attribute_35,
								attribute_36: this.attribute_36,
								attribute_37: this.attribute_37,
								attribute_38: this.attribute_38,
								attribute_39: this.attribute_39,
								attribute_40: this.attribute_40,
								attribute_41: this.attribute_41,
								attribute_42: this.attribute_42,
								attribute_43: this.attribute_43,
								attribute_44: this.attribute_44,
								attribute_45: this.attribute_45,
								attribute_46: this.attribute_46,
								attribute_47: this.attribute_47,
								attribute_48: this.attribute_48,
								attribute_49: this.attribute_49,
								attribute_50: this.attribute_50

							});
							store.add(newRecord);
						}
					}
				});
			}
		},

		/**
		 * getColWidth
		 *
		 * @param {array} aColWidths
		 * @param {string} aColName
		 */
		getColWidth: function(aColWidths, aColName)
		{
			var colWidth = 100;
			Ext.each(aColWidths, function(){
				if ('' + this.colName == aColName) {
					colWidth = parseInt(this.colWidth, 10);
					if (isNaN(colWidth)) {
						colWidth = 100;
					}
					return false;
				}
			});

			return colWidth;
		},

		/**
		 * createMasterDataGrid
		 *
		 * マスターデータ用グリッド（備考欄は生成しない）
		 *
		 * @param {Object} aMasterDef マスター定義
		 * @param {array} aAssigns
		 * @param {array} aColWidths
		 * @param {array} aLimitSelections 表示制限（data_key値の配列）
		 * @return {Ext.grid.GridPanel} マスターデータ用グリッド
		 */
		createMasterDataGrid: function(aMasterDef, aAssigns, aColWidths, aLimitSelections, aDocId, masterSelectedCallback)
		{
			// データストア定義
			if (typeof(MasterData.dataStore[aMasterDef.master_code]) == 'undefined') {
				MasterData.dataStore[aMasterDef.master_code] = MasterData.createDataStore(aMasterDef.master_code);
			}

			var cols = [];

			// キー項目
			var hidden = false;
			if (MasterWindow.getColWidth(aColWidths, 'data_key') == 0) {
				hidden = true;
			}
			cols.push({
				id: 'data_key',
				header: aMasterDef.data_key_name,
				width: MasterWindow.getColWidth(aColWidths, 'data_key'),
				menuDisabled: true,
				sortable: true,
				hidden: hidden,
				renderer: MyPanel.vhForMasterGrid,
				dataIndex: 'data_key'
			});
			// 値
			for (var i = 1; i <= 20; i++) {
				var attributeName = aMasterDef['attribute_' + i + '_name'];
				if (attributeName && attributeName != '') {

					// 属性名がセットされていた場合

					var colWidth = MasterWindow.getColWidth(aColWidths, 'attribute_' + i);
					var hidden = false;
					if (colWidth == 0) {
						hidden = true;
					}
					cols.push({
						id: 'attribute' + i,
						header: attributeName,
						width: colWidth,
						hidden: hidden,
						menuDisabled: true,
						sortable: true,
		        renderer: MyPanel.vhForMasterGrid,
						dataIndex: 'attribute_' + i
					});
				}
			}

			return new Ext.grid.GridPanel({
				id: 'master_data_grid_' + aMasterDef.master_code,
				bodyStyle: 'background-color:white;',
				columns: cols,
				store: MasterData.dataStore[aMasterDef.master_code],
				plain: true,
				stripeRows: true,
				listeners: {
					'rowdblclick': function(grid, row, e)
					{
						MasterWindow.onSelectClick(aMasterDef.master_code, aAssigns, aDocId, masterSelectedCallback);
					},
					'afterrender': function()
					{
						// マスター一覧を読み込み
						var searchText = '';
						// 従来通りクライアント側で処理
						if(typeof(MasterData.masterData[aMasterDef.master_code]) != 'undefined'){
							MasterData.requestMasterData(aMasterDef.master_code, searchText, true, false, false, '', function(aJsonData, aHaveMoreRows){
								MasterData.putToDatastoreForMasterSelectWindow(aMasterDef.master_code, searchText, aColWidths, aLimitSelections, aJsonData, false, aHaveMoreRows);
							});
						// サーバーサイドで処理するようにする対応 2013.11.26
						}else{
							// キャッシュしないようにはしたが、せっかく前回取得した結果がそのままstoreにあるのでその場合はこのタイミングで取得はしない
							if(typeof(MasterData.dataStore[aMasterDef.master_code]) == 'undefined' || MasterData.dataStore[aMasterDef.master_code].data.length <= 0){
								MasterData.requestMasterData(aMasterDef.master_code, searchText, false, false, true, '', function(aJsonData, aHaveMoreRows){
									MasterData.putToDatastoreForMasterSelectWindow(aMasterDef.master_code, searchText, aColWidths, aLimitSelections, aJsonData, false, aHaveMoreRows);
								});
							}
						}
					}
				}
			});
		},

		/**
		 * showWindow
		 *
		 * マスター参照用ウィンドウを表示する
		 *
		 * @param {string} aMasterCode
		 * @param {array} aAssigns
		 * @param {array} aColWidths
		 * @param {array} aLimitSelections
		 */
		showWindow: function(aMasterCode, aAssigns, aColWidths, aLimitSelections, aDocId, aWindowWidth, aWindowHeight, masterSelectedCallback)
		{
			// 既に表示されていたら、前面に出す
			var existingWindow = Ext.ComponentMgr.get('master_window_' + aMasterCode);
			if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
				existingWindow.toFront();
				return;
			}

			// キャッシュOKでマスター定義を取得
			MasterData.requestMasterDef(aMasterCode, true, function(aMasterDef){

				// 既に表示されていたら、前面に出す
				var existingWindow = Ext.ComponentMgr.get('master_window_' + aMasterCode);
				if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
					existingWindow.toFront();
					return;
				}

				var grid = MasterWindow.createMasterDataGrid(aMasterDef, aAssigns, aColWidths, aLimitSelections, aDocId, masterSelectedCallback);
				var buttons = [];
				// 選択ボタン
				buttons.push({
					text: MyLang.getMsg('SELECT'),
					handler: function()
					{
						MasterWindow.onSelectClick(aMasterCode, aAssigns, aDocId, masterSelectedCallback);
					}
				});
				// キャンセルボタン
				buttons.push({
					text: MyLang.getMsg('CANCEL'),
					handler: function(){
						Ext.ComponentMgr.get('master_window_' + aMasterCode).close();
					}
				});
				// キーワード入力フィールド
				var inputBox = new Ext.form.TextField({
					id: 'search_keyword',
					listeners: {
						'specialkey': function(f, e){
							if (e.getKey() == e.ENTER) {
								MasterWindow.onSearchClick(aMasterCode, aColWidths, aLimitSelections);
							}
						}
					}
				});
				// 検索ボタン
				var searchButton = new Ext.Button({
					text: MyLang.getMsg('SEARCH'),
					handler: function(){
						MasterWindow.onSearchClick(aMasterCode, aColWidths, aLimitSelections);
					}
				});

				inputBox.region = 'center';
				searchButton.region = 'east';

				var searchPanel = new Ext.Panel({
					height: 30,
					layout: 'border',
					items: [inputBox, searchButton]
				});

				searchPanel.region = 'north';
				grid.region = 'center';

				var windowWidth = 600;
				if (!isNaN(aWindowWidth)) {
					windowWidth = parseInt(aWindowWidth, 10);
				}
				var windowHeight = SateraitoUI.getWindowHeightWithUserPrefs(300);
				if (!isNaN(aWindowHeight)) {
					windowHeight = parseInt(aWindowHeight, 10);
				}

				var detailWindow = new Ext.Window({
					id: 'master_window_' + aMasterCode,
					width: windowWidth,
					height: windowHeight,
					title: aMasterDef.master_name,
					plain: true,
					autoScroll: false,
					modal: true,
					layout: 'border',
					items: [searchPanel, grid],
					buttons: buttons
				});
				detailWindow.show();
				// ウインドウの移動範囲を制約
				detailWindow.dd.constrainTo(Ext.getBody());

			});
		}
	};

  /**
	 * コメントにファイルを添付するウィンドウ
	 */
	AttachFileToCommentWindow = {

		/**
		 * showWindow
		 *
		 * コメントにファイルを添付ウィンドウを表示する
		 *
		 * @param {string} aDocId
		 * @param {string} aCommentId
		 * @param {function} callback
		 */
		showWindow: function(aDocId, aCommentId, callback)
		{
			// 読込中メッセージを表示
			var writeiframe = function(token){

				var vHtml = '';
				if (IS_OPENID_MODE) {
					vHtml += '<iframe src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/oid/attachfiletocomment';
				} else {
					vHtml += '<iframe src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/attachfiletocomment';
				}
				vHtml += '?token=' + token;
				vHtml += '&doc_id=' + aDocId;
				vHtml += '&hl=' + SATERAITO_LANG;
				vHtml += '&is_print_window=' + (IS_PRINT_WINDOW ? '1' : '0');
				vHtml += '&comment_id=' + aCommentId + '"';


				vHtml += ' style="width:99%;height:98%;border: 1px solid #b5b8c8;">';
				vHtml += '</iframe>';

				var formPanel = new Ext.Panel({
					autoWidth: true,
					autoScroll: false,
					html: vHtml
				});

				var buttons = [];
				buttons.push({
					text: MyLang.getMsg('MSG_CLOSE'),
					handler: function()
					{
						Ext.getCmp('file_attach_to_comment_window').close();
					}
				});

				// 詳細ウィンドウ
				var detailWindow = new Ext.Window({
					id: 'file_attach_to_comment_window',
					width: 600,
					height: 130,
					modal: true,
					bodyStyle: 'background-color:white;',
					title: MyLang.getMsg("DOC_COMMENT_ATTACHMENT_TITLE"),
					plain: true,
					autoScroll: false,
					layout: 'fit',
					items: [formPanel],
					buttons: buttons
				});

				// ウィンドウを開く
				detailWindow.show();
				// ウインドウの移動範囲を制約
				detailWindow.dd.constrainTo(Ext.getBody());

				var test = function(e){
					if (e.origin == SATERAITO_MY_SITE_URL) {

						var window = Ext.getCmp('file_attach_to_comment_window');
						if (window) {
							window.close();
						}

						if (('' + e.data) == 'new_file_attached') {
							// 新規ファイルを添付した
							callback(true);
						}
					}
				};

				if (window.addEventListener) {
					// IE以外
					window.addEventListener('message', test, false);
				} else if (window.attachEvent) {
					// IE8
					window.attachEvent('onmessage', test);
				}
			};

			if (IS_OPENID_MODE) {
				writeiframe('');
			} else {
				WorkflowUser.requestToken(function(aJsonData){
					var token = aJsonData.token;
					writeiframe(token);
				});
			}
		}
	};

	Calc = {

		/**
		 * checkAllFieldsCalced
		 *
		 * 全計算クラス項目の計算処理が終わっているかどうかのチェック
		 *
		 * @param {string} aTemplateBodyId
		 */
		checkAllFieldsCalced: function(aTemplateBodyId)
		{
			var is_all_fields_calced = true;
			var targetFields;
			targetFields = $('#' + aTemplateBodyId).find('input.multi[calced=0]');
			if(targetFields.length > 0){
				is_all_fields_calced = false;
			}
			targetFields = $('#' + aTemplateBodyId).find('input.divide[calced=0]');
			if(targetFields.length > 0){
				is_all_fields_calced = false;
			}
			targetFields = $('#' + aTemplateBodyId).find('input.sum[calced=0]');
			if(targetFields.length > 0){
				is_all_fields_calced = false;
			}
			targetFields = $('#' + aTemplateBodyId).find('input.diff[calced=0]');
			if(targetFields.length > 0){
				is_all_fields_calced = false;
			}
			return is_all_fields_calced;
		},

		/**
		 * calcAll
		 *
		 * @param {string} aTemplateBodyId 'template_body_' で始まる文字列
		 */
		calcAll: function(aTemplateBodyId)
		{
			// 全ての計算フィールドの計算済みフラグを落とす
			$('#' + aTemplateBodyId).find('input.multi').attr('calced', '0');
			$('#' + aTemplateBodyId).find('input.divide').attr('calced', '0');
			$('#' + aTemplateBodyId).find('input.sum').attr('calced', '0');
			$('#' + aTemplateBodyId).find('input.diff').attr('calced', '0');
			// 計算実行
			Calc.calcSum(aTemplateBodyId);
			Calc.calcDiff(aTemplateBodyId);
			Calc.calcMulti(aTemplateBodyId);
			Calc.calcDivide(aTemplateBodyId);
		},

		/**
		 * calcSumField
		 *
		 * @param {dom} aNodeOfSumClass
		 */
		calcSumField: function(aNodeOfSumClass, aTemplateBodyId)
		{
			if ($(aNodeOfSumClass).attr('calced') == '1') {
				// このフィールドが計算済みの場合、計算しない
				return;
			}
			var fields = $(aNodeOfSumClass).attr('fields');
			var fieldsSplited = fields.split(' ');

			// 小数点対応
			// 有効小数点以下桁数
			var decimalPlaceStr = $(aNodeOfSumClass).attr('decimal_place');
			var decimalPlace = typeof(decimalPlaceStr) != 'undefined' && !isNaN(decimalPlaceStr) ? parseInt(decimalPlaceStr, 10) : 0;
			// 丸めタイプ
			var roundType = $(aNodeOfSumClass).attr('round_type');

			var answer = null;
			Ext.each(fieldsSplited, function(){
				// 参照先が計算結果フィールドの場合、計算済みかチェックする
				var nodeToGetValue = $('#' + aTemplateBodyId).find('[name=' + this + ']')[0];
				if ($(nodeToGetValue).is('input.sum')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcSumField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.diff')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDiffField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.multi')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcMultiField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.divide')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDivideField(nodeToGetValue, aTemplateBodyId);
					}
				}
				// 計算実行
				var fieldValue = $('#' + aTemplateBodyId).find('[name=' + this + ']').val();
				if (typeof(fieldValue) == 'undefined') {
					// 足さない
					return true;
				}
				if (fieldValue.trim() == '') {
					// 足さない
					return true;
				}
				if (isNaN(parseFloat(NumUtil.removeComma(fieldValue), 10))) {
					// 足さない
					return true;
				}
				// 足す
				if (answer == null) {
					answer = 0;
				}
				// 小数＆丸め対応…最後に丸めるのでここで切り捨てはしない
				//answer = answer + Math.floor(parseFloat(NumUtil.removeComma(fieldValue), 10));
				//answer = answer + parseFloat(NumUtil.removeComma(fieldValue), 10);
				answer = Calc.sum(answer, parseFloat(NumUtil.removeComma(fieldValue), 10));

			});
			// 表示する
			if (answer == null) {
				$(aNodeOfSumClass).val('');
			} else {

				// 小数点以下切り捨てし、表示する ⇒　小数＆丸め対応（fieldsとnumberの計算を全てして最後に四捨五入などの処理）
				//$(aNodeOfSumClass).val(NumUtil.addComma('' + Math.floor(answer)));
				$(aNodeOfSumClass).val(NumUtil.addComma('' + Calc.round(answer, decimalPlace, roundType)));

			}
			// 計算済みフラグを立てる
			$(aNodeOfSumClass).attr('calced', '1');
		},

		/**
		 * calcSum
		 *
		 * sumクラスのフィールドを計算する
		 * 例）<input class="sum" fields="field_name1 field_name2">
		 */
		calcSum: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input.sum').each(function(){
				Calc.calcSumField(this, aTemplateBodyId);
			});
		},

		/**
		 * calcDiffField
		 *
		 * @param {dom} aNodeOfDiffClass
		 */
		calcDiffField: function(aNodeOfSumClass, aTemplateBodyId)
		{
			if ($(aNodeOfSumClass).attr('calced') == '1') {
				// このフィールドが計算済みの場合、計算しない
				return;
			}
			var fields = $(aNodeOfSumClass).attr('fields');
			var fieldsSplited = fields.split(' ');

			// 小数点対応
			// 有効小数点以下桁数
			var decimalPlaceStr = $(aNodeOfSumClass).attr('decimal_place');
			var decimalPlace = typeof(decimalPlaceStr) != 'undefined' && !isNaN(decimalPlaceStr) ? parseInt(decimalPlaceStr, 10) : 0;
			// 丸めタイプ
			var roundType = $(aNodeOfSumClass).attr('round_type');

			var answer = null;
			Ext.each(fieldsSplited, function(obj, i){
				// 参照先が計算結果フィールドの場合、計算済みかチェックする
				var nodeToGetValue = $('#' + aTemplateBodyId).find('[name=' + this + ']')[0];
				if ($(nodeToGetValue).is('input.sum')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcSumField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.diff')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDiffField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.multi')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcMultiField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.divide')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDivideField(nodeToGetValue, aTemplateBodyId);
					}
				}
				// 計算実行
				var fieldValue = $('#' + aTemplateBodyId).find('[name=' + this + ']').val();
				if (typeof(fieldValue) == 'undefined') {
					// 足さない
					return true;
				}
				if (fieldValue.trim() == '') {
					// 足さない
					return true;
				}
				if (isNaN(parseFloat(NumUtil.removeComma(fieldValue), 10))) {
					// 足さない
					return true;
				}
				// 減算
				if (i == 0) {
					answer = parseFloat(NumUtil.removeComma(fieldValue), 10);
				}else{
					// 小数＆丸め対応…最後に丸めるのでここで切り捨てはしない
					//answer = Calc.diff(answer, parseFloat(NumUtil.removeComma(fieldValue), 10));
					answer = Calc.diff(answer == null ? 0 : answer, parseFloat(NumUtil.removeComma(fieldValue), 10));
				}

			});
			// 表示する
			if (answer == null) {
				$(aNodeOfSumClass).val('');
			} else {

				// 小数点以下切り捨てし、表示する ⇒　小数＆丸め対応（fieldsとnumberの計算を全てして最後に四捨五入などの処理）
				//$(aNodeOfSumClass).val(NumUtil.addComma('' + Math.floor(answer)));
				$(aNodeOfSumClass).val(NumUtil.addComma('' + Calc.round(answer, decimalPlace, roundType)));

			}
			// 計算済みフラグを立てる
			$(aNodeOfSumClass).attr('calced', '1');

		},

		/**
		 * calcDiff
		 *
		 * diffクラスのフィールドを計算する
		 * 例）<input class="diff" fields="field_name1 field_name2">
		 */
		calcDiff: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input.diff').each(function(){
				Calc.calcDiffField(this, aTemplateBodyId);
			});
		},

		/**
		 * calcMultiField
		 *
		 * @param {dom} aNodeOfMultiClass
		 */
		calcMultiField: function(aNodeOfMultiClass, aTemplateBodyId)
		{
			if ($(aNodeOfMultiClass).attr('calced') == '1') {
				// このフィールドが計算済みの場合、計算しない
				return;
			}
			var fields = $(aNodeOfMultiClass).attr('fields');
			var fieldsSplited = fields.split(' ');
			// 小数点対応
			// 有効小数点以下桁数
			var decimalPlaceStr = $(aNodeOfMultiClass).attr('decimal_place');
			var decimalPlace = typeof(decimalPlaceStr) != 'undefined' && !isNaN(decimalPlaceStr) ? parseInt(decimalPlaceStr, 10) : 0;
			// 丸めタイプ
			var roundType = $(aNodeOfMultiClass).attr('round_type');

			var answer = null;
			Ext.each(fieldsSplited, function(){
				// 参照先が計算結果フィールドの場合、計算済みかチェックする
				var nodeToGetValue = $('#' + aTemplateBodyId).find('[name=' + this + ']')[0];
				if ($(nodeToGetValue).is('input.sum')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcSumField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.diff')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDiffField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.multi')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcMultiField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.divide')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDivideField(nodeToGetValue, aTemplateBodyId);
					}
				}

				// 計算実行
				var fieldValue = $(nodeToGetValue).val();
				if (typeof(fieldValue) == 'undefined') {
					// 答えはなし
					answer = null;
					return false;
				}
				if (fieldValue.trim() == '') {
					// 答えはなし
					answer = null;
					return false;
				}
				if (isNaN(parseFloat(NumUtil.removeComma(fieldValue), 10))) {
					// 答えはなし
					answer = null;
					return false;
				}
				// 計算
				if (answer == null) {
					answer = 1;
				}
				//answer = answer * parseFloat(NumUtil.removeComma(fieldValue), 10);
				answer = Calc.multi(answer, parseFloat(NumUtil.removeComma(fieldValue), 10));
			});
			// 値をセット
			if (answer == null) {
				$(aNodeOfMultiClass).val('');
			} else {
				// 計算実行
				var number = $(aNodeOfMultiClass).attr('number');
				if (typeof(number) != 'undefined') {
					if (number != null) {
						if (number.trim() != '') {
							if (!isNaN(parseFloat(number))) {
								// 小数＆丸め対応…最後に丸めるのでここではやらない
								//answer = Math.floor(answer * parseFloat(number));
								//answer = answer * parseFloat(number);
								answer = Calc.multi(answer, parseFloat(number));
							}
						}
					}
				}
				// 小数点以下切り捨てし、表示する ⇒　小数＆丸め対応（fieldsとnumberの計算を全てして最後に四捨五入などの処理. 計算途中での桁落ち等の考慮必要？）
				//$(aNodeOfMultiClass).val(NumUtil.addComma('' + Math.floor(answer)));
				$(aNodeOfMultiClass).val(NumUtil.addComma('' + Calc.round(answer, decimalPlace, roundType)));
			}
			// 計算済みフラグを立てる
			$(aNodeOfMultiClass).attr('calced', '1');
		},

		/**
		 * calcMulti
		 *
		 * multiクラスのフィールドを計算する
		 * 例）<input class="multi" fields="field_name1 field_name2" number="1.05">
		 */
		calcMulti: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input.multi').each(function(){
				Calc.calcMultiField(this, aTemplateBodyId);
			});
		},

		/**
		 * calcDivideField
		 *
		 * @param {dom} aNodeOfDivideClass
		 */
		calcDivideField: function(aNodeOfDivideClass, aTemplateBodyId)
		{
			if ($(aNodeOfDivideClass).attr('calced') == '1') {
				// このフィールドが計算済みの場合、計算しない
				return;
			}
			var fields = $(aNodeOfDivideClass).attr('fields');
			var fieldsSplited = fields.split(' ');
			// 小数点対応
			// 有効小数点以下桁数
			var decimalPlaceStr = $(aNodeOfDivideClass).attr('decimal_place');
			var decimalPlace = typeof(decimalPlaceStr) != 'undefined' && !isNaN(decimalPlaceStr) ? parseInt(decimalPlaceStr, 10) : 0;
			// 丸めタイプ
			var roundType = $(aNodeOfDivideClass).attr('round_type');

			var answer = null;
			Ext.each(fieldsSplited, function(){
				// 参照先が計算結果フィールドの場合、計算済みかチェックする
				var nodeToGetValue = $('#' + aTemplateBodyId).find('[name=' + this + ']')[0];
				if ($(nodeToGetValue).is('input.sum')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcSumField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.diff')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDiffField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.multi')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcMultiField(nodeToGetValue, aTemplateBodyId);
					}
				}
				if ($(nodeToGetValue).is('input.divide')) {
					if ($(nodeToGetValue).attr('calced') != '1') {
						Calc.calcDivideField(nodeToGetValue, aTemplateBodyId);
					}
				}
				// 計算実行
				var fieldValue = $(nodeToGetValue).val();
				if (typeof(fieldValue) == 'undefined') {
					// 答えはなし
					answer = null;
					return false;
				}
				if (fieldValue.trim() == '') {
					// 答えはなし
					answer = null;
					return false;
				}
				var floatValue = parseFloat(NumUtil.removeComma(fieldValue), 10);
				if (isNaN(floatValue) || floatValue == 0) {
					// 答えはなし
					answer = null;
					return false;
				}
				// 計算
				if (answer == null) {
					answer = floatValue;
				}else{
					answer = Calc.divide(answer, floatValue);
				}
			});
			// 値をセット
			if (answer == null) {
				$(aNodeOfDivideClass).val('');
			} else {
				// 計算実行
				var number = $(aNodeOfDivideClass).attr('number');
				if (typeof(number) != 'undefined') {
					if (number != null) {
						if (number.trim() != '') {
							if (!isNaN(parseFloat(number))) {
								answer = Calc.divide(answer, parseFloat(number));
							}
						}
					}
				}
				// 小数点以下切り捨てし、表示する ⇒　小数＆丸め対応（fieldsとnumberの計算を全てして最後に四捨五入などの処理. 計算途中での桁落ち等の考慮必要？）
				$(aNodeOfDivideClass).val(NumUtil.addComma('' + Calc.round(answer, decimalPlace, roundType)));
			}
			// 計算済みフラグを立てる
			$(aNodeOfDivideClass).attr('calced', '1');
		},

		/**
		 * calcDivide
		 *
		 * divideクラスのフィールドを計算する
		 * 例）<input class="divide" fields="field_name1 field_name2" number="1.05">
		 */
		calcDivide: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input.divide').each(function(){
				Calc.calcDivideField(this, aTemplateBodyId);
			});
		},

		/**
		 * sum
		 *
		 * IEEE754精度問題を考慮した加算
		 */
		sum: function(aVal1, aVal2){

			var str1 = '' + NumUtil.removeComma(aVal1);
			var str2 = '' + NumUtil.removeComma(aVal2);

			var shift_amount1 = str1.indexOf('.') >= 0 ? str1.length - str1.indexOf('.') - 1 : 0;
			var shift_amount2 = str2.indexOf('.') >= 0 ? str2.length - str2.indexOf('.') - 1 : 0;

			var shift_amount = shift_amount1 > shift_amount2 ? shift_amount1 : shift_amount2;
			aVal1 = Calc.shiftDecimalPlace(str1, shift_amount);
			aVal2 = Calc.shiftDecimalPlace(str2, shift_amount);

			return (aVal1 + aVal2) / Math.pow(10, shift_amount);
		},

		/**
		 * diff
		 *
		 * IEEE754精度問題を考慮した減算
		 */
		diff: function(aVal1, aVal2){

			var str1 = '' + NumUtil.removeComma(aVal1);
			var str2 = '' + NumUtil.removeComma(aVal2);

			var shift_amount1 = str1.indexOf('.') >= 0 ? str1.length - str1.indexOf('.') - 1 : 0;
			var shift_amount2 = str2.indexOf('.') >= 0 ? str2.length - str2.indexOf('.') - 1 : 0;

			var shift_amount = shift_amount1 > shift_amount2 ? shift_amount1 : shift_amount2;
			aVal1 = Calc.shiftDecimalPlace(str1, shift_amount);
			aVal2 = Calc.shiftDecimalPlace(str2, shift_amount);

			return (aVal1 - aVal2) / Math.pow(10, shift_amount);
		},

		/**
		 * multi
		 *
		 * IEEE754精度問題を考慮した乗算
		 */
		multi: function(aVal1, aVal2){

			var str1 = '' + NumUtil.removeComma(aVal1);
			var str2 = '' + NumUtil.removeComma(aVal2);

			var shift_amount1 = str1.indexOf('.') >= 0 ? str1.length - str1.indexOf('.') - 1 : 0;
			var shift_amount2 = str2.indexOf('.') >= 0 ? str2.length - str2.indexOf('.') - 1 : 0;

			aVal1 = Calc.shiftDecimalPlace(str1, shift_amount1);
			aVal2 = Calc.shiftDecimalPlace(str2, shift_amount2);

			return (aVal1 * aVal2) / Math.pow(10, shift_amount1 + shift_amount2);
		},

		/**
		 * divide
		 *
		 * IEEE754精度問題を考慮した除算
		 */
		divide: function(aVal1, aVal2){

			var str1 = '' + NumUtil.removeComma(aVal1);
			var str2 = '' + NumUtil.removeComma(aVal2);

			var shift_amount1 = str1.indexOf('.') >= 0 ? str1.length - str1.indexOf('.') - 1 : 0;
			var shift_amount2 = str2.indexOf('.') >= 0 ? str2.length - str2.indexOf('.') - 1 : 0;

			aVal1 = Calc.shiftDecimalPlace(str1, shift_amount1);
			aVal2 = Calc.shiftDecimalPlace(str2, shift_amount2);

			var result;
			if(shift_amount1 > shift_amount2){
				result = (aVal1 / aVal2) / Math.pow(10, shift_amount1 - shift_amount2);
			}else if(shift_amount1 < shift_amount2){
				result = (aVal1 / aVal2) * Math.pow(10, shift_amount2 - shift_amount1);
			}else{
				result = aVal1 / aVal2;
			}
			return result;
		},

		/**
			小数点をシフトする（100かけたりするとIEEE754精度の問題で誤差が生じるので）
		*/
		shiftDecimalPlace: function(aVal, aShift)
		{
			var aStr = '' + parseFloat(aVal, 10);
			for(i = 0; i < aShift; i++){
				var placeIdx = aStr.indexOf('.');
				if(placeIdx < 0){
					aStr += '0';
				}else if(placeIdx == aStr.length - 1){
					aStr = aStr.replace('.', '0');
				}else if(placeIdx == aStr.length - 2){
					aStr = aStr.replace('.', '');
				}else{
					aStr = aStr.replace('.', '');
					aStr = aStr.substring(0, placeIdx+1) + '.' + aStr.substring(placeIdx+1);
				}
			}
			return parseFloat(aStr, 10);
		},

		/**
		 * round
		 *
		 * 四捨五入、切り上げ、切り捨て計算
		 */
		round: function(aVal, aDecimalPlace, aRoundType)
		{
			aVal = parseFloat(aVal);
			aDecimalPlace =parseInt(aDecimalPlace, 10);
			var result = aVal;
			// 丸め桁数分シフト
			if(aDecimalPlace > 0){
				// IEEE754の規格により66.99 * 100 のような計算でも6699 にはならないためtoFixedを追加
				//result = result * Math.pow(10, aDecimalPlace);
				result = Calc.shiftDecimalPlace(result, aDecimalPlace);
			}

			switch(aRoundType){
				case 'round':		// 四捨五入「round」
					result = Math.round(result);
					break;
				case 'round_up':		// 切り上げ「round_up」
					result = Math.ceil(result);
					break;
				default:		// 切り捨て「round_down」（デフォルト）
					result = Math.floor(result);
					break;
			}
			// 丸め桁数を元に戻す
			if(aDecimalPlace > 0){
				result = result / Math.pow(10, aDecimalPlace);
			}
			return result;
		}


	};

	FieldConvert = {

		/**
		 * bindMasterReferenceChangeEvent
		 *
		 * @param {string} aTemplateBodyId
		 */
		bindMasterReferenceChangeEvent: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find(':input.master_reference').each(function(){
				var element = this;
				// 参照するマスター
				var masterCode = $(element).attr('master_code');
				// マスターのキーが入力されるinputエレメントのname
				var dataKeyField = $(element).attr('data_key_field');

				// 参照元変更時イベントハンドラ
				$('#' + aTemplateBodyId).find(':input[name=' + dataKeyField + ']').change(function(){
					FieldConvert.masterReferenceAll(aTemplateBodyId);
				});
			});
		},

		/**
		 * masterReferenceAll
		 *
		 * マスター参照フィールドの参照実行
		 *
		 * @param {string} aTemplateBodyId
		 */
		masterReferenceAll: function(aTemplateBodyId)
		{
			// 参照実行
			$('#' + aTemplateBodyId).find(':input.master_reference').each(function(){
				var element = this;
				// フィールド名
				var name = $(element).attr('name');
				// 参照するマスター
				var masterCode = $(element).attr('master_code');
				// マスターのキーが入力されるinputエレメントのname
				var dataKeyField = $(element).attr('data_key_field');
				// 参照するマスターキー値
				var dataKeyValue = $('#' + aTemplateBodyId).find(':input[name=' + dataKeyField + ']').val();
				// 自分のvalueにセットするマスターのフィールド
				var masterAttribute = $(element).attr('master_attribute');
				MasterData.requestMasterDataRow(masterCode, dataKeyValue, function(aRow){

					if (typeof(aRow[masterAttribute]) == 'undefined') {
						// 該当マスターデータがなかったので空欄にする
						$(element).val('');
					} else {
						// 該当マスターデータがあったので、セットする
						$(element).val(aRow[masterAttribute]);
					}

					// テキストエリアの場合
					if ($(element).is('textarea')) {
						$(element).trigger('autosize.resize');
					}

				});
			});
		},

		/**
		 * masterReferenceAllByPreLoadData
		 *
		 * マスター参照フィールドの参照実行
		 *
		 * @param {string} aTemplateBodyId
		 */
		masterReferenceAllByPreLoadData: function(aTemplateBodyId)
		{
			// 参照実行
			$('#' + aTemplateBodyId).find(':input.master_reference').each(function(){
				var element = this;
				// フィールド名
				var name = $(element).attr('name');
				// 参照するマスター
				var masterCode = $(element).attr('master_code');
				// マスターのキーが入力されるinputエレメントのname
				var dataKeyField = $(element).attr('data_key_field');
				// 参照するマスターキー値
				var dataKeyValue = $('#' + aTemplateBodyId).find(':input[name=' + dataKeyField + ']').val();
				// 自分のvalueにセットするマスターのフィールド
				var masterAttribute = $(element).attr('master_attribute');

				if(typeof(MasterData.masterRows[masterCode]) != 'undefined' && typeof(MasterData.masterRows[masterCode][dataKeyValue]) != 'undefined' && typeof(MasterData.masterRows[masterCode][dataKeyValue][masterAttribute]) != 'undefined'){
					// 該当マスターデータがあったので、セットする
					$(element).val(MasterData.masterRows[masterCode][dataKeyValue][masterAttribute]);
				}else{
					// 該当マスターデータがなかったので空欄にする
					$(element).val('');
				}
				// テキストエリアの場合
				if ($(element).is('textarea')) {
					$(element).trigger('autosize.resize');
				}

			});
		},

		/**
		 * bindUserSelectButtonEvent
		 *
		 * @param {string} aTemplateBodyId
		 */
		bindUserSelectButtonEvent: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input[type=button].user_select_button').unbind('click',false)
			$('#' + aTemplateBodyId).find('input[type=button].user_select_button').bind('click', function(){
				var processNumber = $(this).attr('process_number');
				UserSelectWindow.showWindow(processNumber, aTemplateBodyId);
			});

			// 再申請プロセスかどうか
			var inReSubmitProcess = false;
			var doc_id = '';
			if(aTemplateBodyId != 'template_body_new_doc'){
				doc_id = aTemplateBodyId.substring('template_body_'.length, aTemplateBodyId.length);
				if($('#' + aTemplateBodyId).find('#in_resubmit_process_' + doc_id).val() == '1'){
					inReSubmitProcess = true;
				}
			}

			// 新規の場合のみの処理（差し戻し再申請の場合も）
			if (aTemplateBodyId == 'template_body_new_doc' || inReSubmitProcess) {
				// もし「ok_to_show_process_number」が指定されていた場合、新規作成時は表示しない
				// --> その承認段階が来たら、表示するため
				$('#' + aTemplateBodyId).find('input[type=button].user_select_button').each(function(){
					var okToShowProcessNumber = $(this).attr('ok_to_show_process_number');
					if (okToShowProcessNumber == null) {
						// no option
					} else {
						// 指定されていたので、新規作成時に表示しない
						$(this).hide();
					}
				});
			}
		},

		/**
		 * bindClearApproverButtonEvent
		 *
		 * @param {string} aTemplateBodyId
		 */
		bindClearApproverButtonEvent: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input[type=button].clear_approver_button').unbind('click', false)
			$('#' + aTemplateBodyId).find('input[type=button].clear_approver_button').bind('click', function(){
				var processNumber = $(this).attr('process_number');
				var inputProcessElement = $('#' + aTemplateBodyId).find('input[name=process][number=' + processNumber + ']');
				ApproverCandidate.setNewApprovers(inputProcessElement, [], aTemplateBodyId);
			});

			// 再申請プロセスかどうか
			var inReSubmitProcess = false;
			var doc_id = '';
			if(aTemplateBodyId != 'template_body_new_doc'){
				doc_id = aTemplateBodyId.substring('template_body_'.length, aTemplateBodyId.length);
				if($('#' + aTemplateBodyId).find('#in_resubmit_process_' + doc_id).val() == '1'){
					inReSubmitProcess = true;
				}
			}

			// 新規の場合のみの処理（差し戻し再申請の場合も）
			if (aTemplateBodyId == 'template_body_new_doc' || inReSubmitProcess) {
				// もし「ok_to_show_process_number」が指定されていた場合、新規作成時は表示しない
				// --> その承認段階が来たら、表示するため
				$('#' + aTemplateBodyId).find('input[type=button].clear_approver_button').each(function(){
					var okToShowProcessNumber = $(this).attr('ok_to_show_process_number');
					if (okToShowProcessNumber == null) {
						// no option
					} else {
						// 指定されていたので、新規作成時に表示しない
						$(this).hide();
					}
				});
			}
		},

		/**
		 * bindMasterSelectButtonEvent
		 *
		 * マスター選択ボタンのクリックイベントをバインド
		 *
		 * ボタンの属性
		 *
		 * フォームのフィールドへの値アサイン
		 * assign="data_key:shizai_code1;attribute_1:shizai_name1;attribute_2:shizai_tanka1" limit_selection="10101 10102"
		 *   data_key ... マスター側のカラム名
		 *   shizai_code1 ... inputのname
		 *   limit_selection ... スペースで区切って列挙した値だけ表示
		 *
		 * カラム幅定義（デフォルト100px）
		 * col_width="attribute_1:110;attribute2:120"

		 * @param {string} aTemplateBodyId
		 * @param {string} aDocId ... 新規ドキュメントの場合は'new_doc'
		 */
		bindMasterSelectButtonEvent: function(aTemplateBodyId, aDocId)
		{
			$('#' + aTemplateBodyId).find('input[type=button].sateraito_master_select').unbind('click',false)
			$('#' + aTemplateBodyId).find('input[type=button].sateraito_master_select').bind('click', function(){
				MasterWindow.masterSelectFormButtonClick(this, aDocId);
			});
		},

		/**
		 * bindEventToGoogleCalendarButtonEvent
		 *
		 * Googleカレンダーの予定作成画面を開くボタンのクリックイベントをバインド
		 *
		 * ボタンの属性
		 * class="add_to_google_calendar"
		 * 予定情報を取得するフィールド情報
		 * 	data_fields="title:doc_title;location:location;details:exp;from:event_from;to:event_to"
		 * @param {string} aTemplateBodyId
		 * @param {string} aDocId ... 新規ドキュメントの場合は'new_doc'
		 */
		bindEventToGoogleCalendarButtonEvent: function(aTemplateBodyId, aDocId)
		{
			var set_on_click = function(input_type, obj){

				var data_fields = $(obj).attr('data_fields');
				var fields = data_fields.split(';');
				var arrayFields = {};
				Ext.each(fields, function(){
					var colonString = '' + this;
					var colonStringSplited = colonString.split(':');
					arrayFields[colonStringSplited[0]] = colonStringSplited[1];
				});

				var dates = '';

				var from_d = null;
				var to_d = null;
				var is_exist_from_hhmm = false;
				var is_exist_to_hhmm = false;
				if(typeof(arrayFields['from']) != 'undefined' && arrayFields['from'] != ''){
					$('#' + aTemplateBodyId).find(':input[name=' + arrayFields['from'] + ']').each(function(){
						var str_dat = $(this).val();	// yyyy-mm-dd or yyyy-mm-dd hh:mm 形式
						var dateFormat = new DateFormat('yyyy-MM-dd');
						from_d = dateFormat.parse(str_dat);
						if(from_d == null){
							dateFormat = new DateFormat('yyyy-MM-dd HH:mm:ss');
							from_d = dateFormat.parse(str_dat);
							is_exist_from_hhmm = true;
						}
					});
				}
				if(typeof(arrayFields['to']) != 'undefined' && arrayFields['to'] != ''){
					$('#' + aTemplateBodyId).find(':input[name=' + arrayFields['to'] + ']').each(function(){
						var str_dat = $(this).val();	// yyyy-mm-dd or yyyy-mm-dd hh:mm 形式
						var dateFormat = new DateFormat('yyyy-MM-dd');
						to_d = dateFormat.parse(str_dat);
						if(to_d == null){
							dateFormat = new DateFormat('yyyy-MM-dd HH:mm:ss');
							to_d = dateFormat.parse(str_dat);
							is_exist_to_hhmm = true;
						}
					});
				}

				// UTC標準時に変換
				if(from_d != null){
					if(is_exist_from_hhmm){
						from_d = new Date(from_d.getUTCFullYear(), from_d.getUTCMonth(), from_d.getUTCDate(), from_d.getUTCHours(), from_d.getUTCMinutes(), from_d.getUTCSeconds());
//					}else{
//						from_d = new Date(from_d.getUTCFullYear(), from_d.getUTCMonth(), from_d.getUTCDate(), 0, 0, 0);
					}
				}
				if(to_d != null){
					if(is_exist_to_hhmm){
						to_d = new Date(to_d.getUTCFullYear(), to_d.getUTCMonth(), to_d.getUTCDate(), to_d.getUTCHours(), to_d.getUTCMinutes(), to_d.getUTCSeconds());
					}else{
						//to_d = new Date(to_d.getUTCFullYear(), to_d.getUTCMonth(), to_d.getUTCDate(), 0, 0, 0);
						to_d.setTime(to_d.getTime() + 24 * 60 * 60 * 1000);	// 時分指定なしの場合は一日たしとく（終日指定の場合に一日ずれるので）
					}
				}

				if(from_d == null && to_d != null){
					if(is_exist_to_hhmm){
						// from を to の一時間前にする
						from_d = new Date();
						from_d.setTime(to_d.getTime() - 1 * 60 * 60 * 1000);
					}else{
						from_d = to_d;
					}
				}else if(from_d != null && to_d == null){
					if(is_exist_from_hhmm){
						// to を from の一時間あとにする
						to_d = new Date();
						to_d.setTime(from_d.getTime() + 1 * 60 * 60 * 1000);
					}else{
						to_d = from_d;
					}
				}

				if(from_d != null && to_d != null){
					var from;
					var to;
					if(is_exist_from_hhmm && is_exist_to_hhmm){
						from = '' + from_d.getFullYear() + ('0' + (from_d.getMonth() + 1)).slice(-2) + ('0' + from_d.getDate()).slice(-2) + 'T' + ('0' + from_d.getHours()).slice(-2) + ('0' + from_d.getMinutes()).slice(-2) + ('0' + from_d.getSeconds()).slice(-2) + 'Z';
						to = '' + to_d.getFullYear() + ('0' + (to_d.getMonth() + 1)).slice(-2) + ('0' + to_d.getDate()).slice(-2) + 'T' + ('0' + to_d.getHours()).slice(-2) + ('0' + to_d.getMinutes()).slice(-2) + ('0' + to_d.getSeconds()).slice(-2) + 'Z';
					}else{
						from = '' + from_d.getFullYear() + ('0' + (from_d.getMonth() + 1)).slice(-2) + ('0' + from_d.getDate()).slice(-2);
						to = '' + to_d.getFullYear() + ('0' + (to_d.getMonth() + 1)).slice(-2) + ('0' + to_d.getDate()).slice(-2);
					}
					dates = from + '/' + to;
				}else{
					dates = '';
				}

				var title = '';
				if(typeof(arrayFields['title']) != 'undefined' && arrayFields['title'] != ''){
					$('#' + aTemplateBodyId).find(':input[name=' + arrayFields['title'] + ']').each(function(){
						title = $(this).val();
					});
				}
				var details = '';
				if(typeof(arrayFields['details']) != 'undefined' && arrayFields['details'] != ''){
					$('#' + aTemplateBodyId).find(':input[name=' + arrayFields['details'] + ']').each(function(){
						details = $(this).val();
					});
				}
				var location = '';
				if(typeof(arrayFields['location']) != 'undefined' && arrayFields['location'] != ''){
					$('#' + aTemplateBodyId).find(':input[name=' + arrayFields['location'] + ']').each(function(){
						location = $(this).val();
					});
				}

				// ※空を渡すとうまく作成ページが開かないので空じゃない場合だけクエリーをセット
				// datesは、渡すならFROM～TO両方渡さないとだめみたいなので、デフォルトでFROM～TOを1時間として調整する
				var url = 'https://www.google.com/calendar/event?action=TEMPLATE&trp=false';
				if(title != ''){
					url = url + '&text=' + encodeURIComponent(title);
				}
				if(dates != ''){
					url = url + '&dates=' + encodeURIComponent(dates);
				}
				if(details != ''){
					url = url + '&details=' + encodeURIComponent(details);
				}
				if(location != ''){
					url = url + '&location=' + encodeURIComponent(location);
				}
				window.open(url);

			};
			$('#' + aTemplateBodyId).find('input[type=button].add_to_google_calendar').each(function(){
				var obj = this;
				$(obj).attr('src', SATERAITO_MY_SITE_URL + '/images/calendar_plus_ja.gif');
				$(obj).unbind('click',false)
				$(obj).bind('click', function(){
					set_on_click('button', obj);
				});
			});
			$('#' + aTemplateBodyId).find('img.add_to_google_calendar').each(function(){
				var obj = this;
				$(obj).attr('src', SATERAITO_MY_SITE_URL + '/images/calendar_plus_ja.gif');
				$(obj).attr('style', 'cursor:pointer;');
				$(obj).unbind('click', false);
				$(obj).bind('click', function(){
					set_on_click('img', obj);
				});
			});
		},

		/**
		 * bindClearButtonEvent
		 *
		 * クリアーボタンのクリックイベントをバインド
		 *
		 * @param {string} aTemplateBodyId
		 */
		bindClearButtonEvent: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('input[type=button].clear_button').unbind('click',false)
			$('#' + aTemplateBodyId).find('input[type=button].clear_button').bind('click', function(){
				var names = $(this).attr('fields');
				var namesArray = names.split(' ');
				Ext.each(namesArray, function(){
					var name = '' + this;
					//$('#' + aTemplateBodyId).find('input[name=' + name + ']').val('');
					$('#' + aTemplateBodyId).find(':input[name=' + name + ']').val('');
				});
			});
		},

		/**
		 * fillDataToMasterList
		 *
		 * マスター参照が設定されているselectエレメントに値をセット
		 * 新規申請書作成時に値がセットされた状態で雛形がドキュメントに保存されるため、新規申請書作成時だけこの関数はコールされる
		 *
		 * @param {string} aTemplateBodyId
		 * @param {object} aDefaultValues:後続の初期値セット処理が「MasterData.requestMasterData」のAjax完了ハンドラの前に処理される場合があるのでここでもセットしておく
		 */
		fillDataToMasterList: function(aTemplateBodyId, aDefaultValues, setDefaultValueToOneField)
		{
			var templateBody = $('#' + aTemplateBodyId);
			var templateBodyInputs = templateBody.find(':input');

			var masterCodes = [];  // 参照するマスター一覧
			templateBody.find('select.master_list').each(function(){
				// 参照するマスター
				var masterCode = $(this).attr('master_code');
				if (masterCodes.indexOf(masterCode) == -1) {
					masterCodes.push(masterCode);
				}
			});
			Ext.each(masterCodes, function(){
				var masterCode = '' + this;
				MasterData.requestMasterData(masterCode, '', true, false, false, '', function(aMasterData, aHaveMoreRows){
					// マスター取得後

					// ドキュメントにセット
					templateBody.find('select.master_list[master_code=' + masterCode + ']').each(function(){
						var element = this;
						Ext.each(aMasterData, function(){
							var dataKey = this.data_key;
							var attribute1 = this.attribute_1;
							$(element).append('<option value="' + dataKey + '">' + Sateraito.Util.escapeHtml(attribute1));
						});
						// デフォルト値をセット
						var key = $(element).attr('name');
						var value = aDefaultValues[key];
						if(typeof(value) != 'undefined'){
							setDefaultValueToOneField(templateBodyInputs, key, value);
						}
					});
					// クラスを削除
					templateBody.find('select.master_list[master_code=' + masterCode + ']').removeClass('master_list');
					// テンプレートにもセット（新規作成時）
					if (aTemplateBodyId == 'template_body_new_doc') {
						$('#template_body_to_submit').find('select.master_list[master_code=' + masterCode + ']').each(function(){
							var element = this;
							Ext.each(aMasterData, function(){
								var dataKey = this.data_key;
								var attribute1 = this.attribute_1;
								$(element).append('<option value="' + dataKey + '">' + Sateraito.Util.escapeHtml(attribute1));
							});
						});
						// クラスを削除
						$('#template_body_to_submit').find('select.master_list[master_code=' + masterCode + ']').removeClass('master_list');
					}

				});
			});
		},

		/**
		 * dateFieldConvert
		 *
		 * @param {string} aTemplateBodyId
		 * @param {object} aBasicForm
		 */
		dateFieldConvert: function(aTemplateBodyId, aBasicForm)
		{
			$('#' + aTemplateBodyId).find('input.date').each(function(){

				var element = this;

				//FieldConvert._dateFieldConvert('template_body_' + aDocId, basicForm, element);
				// いったん親divのなかにdisplay:noneがないかチェックし、あればshow
				var hiddenDivElements = $(element).parents('div:hidden');
				//var hiddenDivElements = $(element).parents(':hidden');
				$(hiddenDivElements).show();
				// 日付入力コントロールにコンバート
				FieldConvert._dateFieldConvert(aTemplateBodyId, aBasicForm, element);
				// もう一回隠す
				$(hiddenDivElements).hide();

			});
		},

		/**
		 * _dateFieldConvert
		 *
		 * @param {string} aTemplateBodyId
		 * @param {object} aBasicForm
		 * @param {dom} aElementToConvert
		 */
		_dateFieldConvert: function(aTemplateBodyId, aBasicForm, aElementToConvert)
		{
			var oldClass = $(aElementToConvert).attr('class');

			var elementType = $(aElementToConvert).attr('type');
			if (typeof(elementType) == 'undefined') {
				elementType = 'text';
			}
			if (elementType == 'text' || elementType == '') {
				// 名前
				var fieldName = $(aElementToConvert).attr('name');
				// 値
				var value = $(aElementToConvert).val();
				if (typeof(value) == 'undefined' || value == null) {
					value = '';
				}
				// disabled属性
				var disabled = false;
				if ($(aElementToConvert).attr('disabled')) {
					disabled = true;
				}
				// readonly属性
				var readOnly = false;
				if ($(aElementToConvert).attr('readonly')) {
					readOnly = true;
				}
				// mandatory_msg属性
				var mandatory_msg = $(aElementToConvert).attr('mandatory_msg');
				if (typeof(mandatory_msg) == 'undefined' || mandatory_msg == null) {
					mandatory_msg = '';
				}
				// list_key属性
				var list_key = $(aElementToConvert).attr('list_key');
				if (typeof(list_key) == 'undefined' || list_key == null) {
					list_key = '';
				}
				// disp属性
				var disp = $(aElementToConvert).attr('disp');
				if (typeof(disp) == 'undefined' || disp == null) {
					disp = '';
				}
				// 描画領域を作成
				$(aElementToConvert).after('<div style="display:inline-block;" id="date_field_render_area_' + aTemplateBodyId + '_' + fieldName + '" ></div>');
				var dateField = new Ext.form.DateField({
					//id: 'template_body_new_doc_' + fieldName,
					id: aTemplateBodyId + '_' + fieldName,
					name: fieldName,
					invalidText: MyLang.getMsg('VC_INVALID_DATE_FORMAT'),
					renderTo: 'date_field_render_area_' + aTemplateBodyId + '_' + fieldName,
					readOnly: readOnly,
					disabled: disabled,
					value: value,
					format: 'Y-m-d'
				});
				// basicFormによるvalidateを可能にするため、add
				aBasicForm.add(dateField);
				// 本日日付が指定されていたら、セット
				if ($(aElementToConvert).is('.today_date')) {
					// サーバー時間をセットするように変更
					//dateField.setValue(Sateraito.DateUtil.getTodayStr());
					SateraitoWF.getToday(function(jsonData){
						dateField.setValue(jsonData.today);
					});
				}
				$('#date_field_render_area_' + aTemplateBodyId + '_' + fieldName).find('input[name=' + fieldName + ']').addClass(oldClass).attr('mandatory_msg', mandatory_msg).attr('list_key', list_key).attr('disp', disp);
				$(aElementToConvert).remove();
			}
		},

		/**
		 * numberFieldConvert
		 *
		 * @param {string} aTemplateBodyId
		 * @param {object} aBasicForm
		 */
		numberFieldConvert: function(aTemplateBodyId, aBasicForm)
		{
			$('#' + aTemplateBodyId).find('input.number').each(function(){
				var element = this;
				//FieldConvert._numberFieldConvert(aTemplateBodyId, aBasicForm, element);
				// いったん親divのなかにdisplay:noneがないかチェックし、あればshow
				var hiddenDivElements = $(element).parents('div:hidden');
				//var hiddenDivElements = $(element).parents(':hidden');
				$(hiddenDivElements).show();
				// 日付入力コントロールにコンバート
				FieldConvert._numberFieldConvert(aTemplateBodyId, aBasicForm, this);
				// もう一回隠す
				$(hiddenDivElements).hide();
			});
		},

		/**
		 * _numberFieldConvert
		 *
		 * @param {string} aTemplateBodyId
		 * @param {object} aBasicForm
		 * @param {dom} aElementToConvert
		 */
		_numberFieldConvert: function(aTemplateBodyId, aBasicForm, aElementToConvert)
		{
			var oldClass = $(aElementToConvert).attr('class');

			var elementType = $(aElementToConvert).attr('type');
			if (typeof(elementType) == 'undefined') {
				elementType = 'text';
			}

			if (elementType == 'text' || elementType == '') {
				// 名前
				var fieldName = $(aElementToConvert).attr('name');
				// 値
				var value = $(aElementToConvert).val();
				if (typeof(value) == 'undefined' || value == null) {
					value = '';
				}
				// readonly属性
				var readOnly = false;
				if ($(aElementToConvert).attr('readonly')) {
					readOnly = true;
				}
				// disabled属性
				var disabled = false;
				if ($(aElementToConvert).attr('disabled')) {
					disabled = true;
				}
				// fields属性
				var fields = $(aElementToConvert).attr('fields');
				if (typeof(fields) == 'undefined' || fields == null) {
					fields = '';
				}
				// number属性
				var number = $(aElementToConvert).attr('number');
				if (typeof(number) == 'undefined' || number == null) {
					number = '';
				}
				// number_type属性
				var numberType = $(aElementToConvert).attr('number_type');
				if (typeof(numberType) == 'undefined' || numberType == null) {
					numberType = '';
				}
				// decimal_place属性
				var decimalPlace = $(aElementToConvert).attr('decimal_place');
				if (typeof(decimalPlace) == 'undefined' || decimalPlace == null) {
					decimalPlace = '';
				}
				// round_type属性
				var roundType = $(aElementToConvert).attr('round_type');
				if (typeof(roundType) == 'undefined' || roundType == null) {
					roundType = '';
				}
				// mandatory_msg属性
				var mandatory_msg = $(aElementToConvert).attr('mandatory_msg');
				if (typeof(mandatory_msg) == 'undefined' || mandatory_msg == null) {
					mandatory_msg = '';
				}
				// list_key属性
				var list_key = $(aElementToConvert).attr('list_key');
				if (typeof(list_key) == 'undefined' || list_key == null) {
					list_key = '';
				}
				// disp属性
				var disp = $(aElementToConvert).attr('disp');
				if (typeof(disp) == 'undefined' || disp == null) {
					disp = '';
				}

				// 入力チェック正規表現
				var maskRe;
				switch(numberType){
					case 'FLOAT':	// 小数
						maskRe = '[0-9,\-.]';
						break;
					default:	// INTEGER:整数（整数）
						maskRe = '[0-9,\-]';
						break;
				}

				// 幅
				var width = $(aElementToConvert).width();
				// 描画領域を作成
				$(aElementToConvert).after('<div style="display:inline-block;" id="number_field_render_area_' + aTemplateBodyId + '_' + fieldName + '"></div>');
				var numberField = new Ext.form.TextField({
					id: aTemplateBodyId + '_' + fieldName,
					//maskRe: new RegExp('[0-9,]'),
					//maskRe: new RegExp('[0-9,\-]'),
					maskRe: new RegExp(maskRe),		// 小数点対応（厳密なチェックではないが、厳密なチェックにすると手入力できなくなってしまうので...）
					name: fieldName,
					invalidText: MyLang.getMsg('VC_INVALID_NUMERIC_FORMAT'),
					renderTo: 'number_field_render_area_' + aTemplateBodyId + '_' + fieldName,
					width: width,
					value: value,
					readOnly: readOnly,
					disabled: disabled,
					validator: function(value)
					{
						// カンマを取り除く
						var commaRemovedValue = NumUtil.removeComma(value);
						if (isNaN(commaRemovedValue)) {
							return MyLang.getMsg('VC_INVALID_NUMERIC_FORMAT2');
						} else {
							return true;
						}
					},
					listeners: {
						focus: function(field)
						{
							// カンマを取り除く
							var commaRemovedValue = NumUtil.removeComma(field.getRawValue());
							field.setRawValue(commaRemovedValue);
						},
						change: function(field)
						{
							// いったんカンマを取り除く
							var commaRemovedValue = NumUtil.removeComma(field.getRawValue());
							// カンマを付ける
							if (!isNaN(commaRemovedValue)) {
								var commaAddedValue = NumUtil.addComma(commaRemovedValue);
								field.setRawValue(commaAddedValue);
							}
						}
					}
				});
				// basicFormによるvalidateを可能にするため、add
				aBasicForm.add(numberField);

				$('#number_field_render_area_' + aTemplateBodyId + '_' + fieldName).find('input[name=' + fieldName + ']')
					.addClass(oldClass)
					.attr('fields', fields)
					.attr('number', number)
					.attr('number_type', numberType)
					.attr('decimal_place', decimalPlace)
					.attr('round_type', roundType)
					.attr('list_key', list_key)
					.attr('disp', disp)
					.attr('mandatory_msg', mandatory_msg);

				$(aElementToConvert).remove();
			}
		}
	};

	DocDetailWindow = {

		wfEventHandler: {},

		/**
		 * bindSectionClassHandler
		 *
		 * 「section_area」クラスの開閉用イベントハンドラ（クリック時のハンドラ）をバインドする
		 */
		bindSectionClassHandler: function()
		{
			// セクションエリアの開閉用イベントハンドラ
			$(document).on('click', 'div.section_area_title', function(){
				var element = this;
				var sectionArea = $(element).parent('div.section_area');
				var img = $(sectionArea).find('img.section_arrow_img');
				var showHideArea = $(sectionArea).find('div.section_show_hide_area');
				var display = $(showHideArea).css('display');
				if (display == 'none') {
					$(showHideArea).show('normal');
					$(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowDown.gif');
				} else {
					$(showHideArea).hide('normal');
					$(img).attr('src', SATERAITO_MY_SITE_URL + '/images/arrowRight.gif');
				}
			});
		},


		/**
		 * bindDownloadAttachedFileLink
		 *
		 * ダウンロードリンクのイベントハンドラをバインド
		 * span.download_attached_fileとa.download_attached_fileの２種類がある
		 */
		bindDownloadAttachedFileLink: function()
		{
			// 先にトークンを取得してクリックイベントのなかでコールバックを起こさない（ポップアップがブロックされるため）
/* マルチドメインの場合にうまく動かないので変更 2014.06.19
			if (IS_OPENID_MODE) {
				DocDetailWindow._bindDownloadAttachedFileLink('');
			}else{
*/
				WorkflowUser.requestToken(function(aJsonData){
					var token = aJsonData.token;
					DocDetailWindow._bindDownloadAttachedFileLink(token);
				});
/*
			}
*/
		},

		/**
		 * _bindDownloadAttachedFileLink
		 *
		 * ダウンロードリンクのイベントハンドラをバインド
		 * span.download_attached_fileとa.download_attached_fileの２種類がある
		 */
		_bindDownloadAttachedFileLink: function(token)
		{
			$('.download_attached_file').unbind('click', false)
			$('.download_attached_file').bind('click', function(){
				var element = this;
				var fileId = $(element).attr('file_id');
				var is_comment_attach = $(element).attr('is_comment_attach');
                if (typeof (is_comment_attach) == 'undefined')  is_comment_attach = '';

				// pdfかどうかを判別
				var isPdf = false;
				if ($(element).attr('is_pdf') == '1') {
					isPdf = true;
				}

       // 公開ドキュメントコメントツリーの添付ファイルかどうか
        var isCommentAttach = '0';
        if ($(element).attr('is_comment_attach') == '1') {
          isCommentAttach = '1';
        }

				//var downloadUrl = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/downloadattachedfile?file_id=' + fileId + '&token=' + token + '&is_comment_attach=' + encodeURIComponent(is_comment_attach);
				var tokenUrl = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/downloadattachedfile';
				var oidUrl = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/oid/downloadattachedfile';
        var params = '';
        params += '?file_id=' + encodeURIComponent(fileId);
        params += '&is_comment_attach=' + encodeURIComponent(isCommentAttach);
        params += '&hl=' + SATERAITO_LANG;
				if (isPdf) {
					window.open(oidUrl + params + '&inline=1');
				} else {
          // PDF以外の場合
          if (Sateraito.Util.isSmartPhone()) {
            //// スマートフォンの場合、OpenID認証を使う
            //if (MyUtil.isMultiDomainSetting()) {
            //  params += '&target_google_apps_domain=' + MyUtil.getViewEmailDomainPart();
            //}
            window.open(oidUrl + params);
          } else {
            // PCの場合、トークン認証のダウンロードを開始
            params += '&token=' + encodeURIComponent(token);
            if ($('#dummy_frame').size() == 0) {
              $('body').append('<iframe id="dummy_frame" style="width:0px;height:0px;display:block;border: none;position: relative;"></iframe>');
            }
						if(IS_OPENID_MODE){
							// サブドメインの場合にうまくいかないので変更 2014.06.19
						  //$('#dummy_frame').attr('src', oidUrl + params);
						  $('#dummy_frame').attr('src', tokenUrl + params);
						}else{
						  $('#dummy_frame').attr('src', tokenUrl + params);
						}
          }
				}
			});
		},

		/**
		 * validateForm
		 *
		 * フォームの入力値チェック
		 *
		 * @return {boolean}
		 */
		validateForm: function(aDocId, action_type)
		{
			// 必須入力フィールドに関するチェック
			var haveError = false;
			$('#template_body_' + aDocId).find(':input.mandatory').each(function(){
				var element = this;
				var name = $(element).attr('name');
				var type = $(element).attr('type');
				var mandatory_msg = $(element).attr('mandatory_msg');

				var is_mandatory = false;

				// ラジオボタンの場合
				if (type == 'radio') {
					if(!($('#template_body_' + aDocId).find(':input[name=' + name + ']').is(':checked'))){
						is_mandatory = true;
						if(!mandatory_msg || mandatory_msg == ''){
							mandatory_msg = MyLang.getMsg('VC_NEED_FOR_RADIO');
						}
					}
				}
				// チェックボックスの場合
				else if (type == 'checkbox') {
					if(!($('#template_body_' + aDocId).find(':input[name=' + name + ']').is(':checked'))){
						is_mandatory = true;
						if(!mandatory_msg || mandatory_msg == ''){
							mandatory_msg = MyLang.getMsg('VC_NEED_FOR_CHECKBOX');
						}
					}
				}
				else{
					if ($(element).val() == '') {
						is_mandatory = true;
						if(!mandatory_msg || mandatory_msg == ''){
							mandatory_msg = MyLang.getMsg('VC_NEED');
						}
					}
				}

				if (is_mandatory) {
					alert(mandatory_msg);
					(function(){
						$(element).focus();
					}).defer(700);
					haveError = true;
					return false;
				}
			});

			if (haveError) {
				return;
			}

			var basicForm = Ext.ComponentMgr.get('form_panel_' + aDocId).getForm();
			var valid = true;
			basicForm.items.each(function(field){
				if (!field.validate()) {
					field.focus();
					valid = false;
				}
			});
			if (!valid) {
				return false;
			}

			//
			// onFormValidateイベントハンドラをキック
			// falseが返ってきたら、submitしない
			//
			var window = Ext.getCmp('doc_detail_window_' + aDocId);
			if (typeof(window.wfEventHandler) != 'undefined') {
				if (typeof(window.wfEventHandler['onFormValidate']) == 'function') {
					var handler = window.wfEventHandler['onFormValidate'];
					var ret = handler(action_type);
					return ret;
				}
			}

			if(!Calc.checkAllFieldsCalced('template_body_' + aDocId)){
				alert(MyLang.getMsg('MSG_NOAVAILABLE_SUBMIT_WITHOUT_CALC'));
				return false;
			}

			return true;
		},

		_getUpdateDocValues: function(aDocId, aOkToUpdateField)
		{

			// チェックボックス動作タイプ
			var checkbox_behavior = $('#template_body_' + aDocId).find('input[type=hidden][name=workflow_template_setting]').attr('checkbox_behavior');

			// 更新可能なドキュメントフィールドをチェック
			var docValues = {};
			Ext.each(aOkToUpdateField, function(){

				var fieldName = '' + this;

				// 同一nameフィールド複数対応
				//var element = $('#template_body_' + aDocId).find(':input[name=' + fieldName + ']');
				var elements = $('#template_body_' + aDocId).find(':input[name=' + fieldName + ']');
				for(elements_idx = 0; elements_idx < elements.length; elements_idx++){
					var element = elements[elements_idx];

					//if (element.length > 0) {
					var name = $(element).attr('name');
					var value = $(element).val();
					var type = $(element).attr('type');

					// ラジオボタンの場合
					if (type == 'radio') {
						value = $('#template_body_' + aDocId).find('input[name=' + name + ']:checked').val();
					}
					// チェックボックスの場合
					if (type == 'checkbox') {
						// チェックボックスの場合
						if(checkbox_behavior == 'VALUE_ATTR'){
							if($(element).is(':checked')){
								value = typeof($(element).attr('value')) != 'undefined' ? $(element).attr('value') : true;
							}else{
								value = null;
							}
						// 従来通りの挙動
						}else{
							value = $(element).is(':checked');
						}
					}
					// numberクラスを持っている場合、カンマを取り除く
					// 計算系フィールドも追加 2014.07.18
					//if ($(element).hasClass('number')) {
					if ($(element).hasClass('number') || $(element).hasClass('sum') || $(element).hasClass('diff') || $(element).hasClass('multi') || $(element).hasClass('divide')) {
						value = NumUtil.removeComma(value);
					}
					// 値のセット
					if ($(element).is('.do_not_save')) {
						// inputタグがdo_not_saveクラスを持っていた場合、保存しない
					}else if (typeof(name) == 'undefined') {
						// nameのないボタンなど不要な値をjsonにセットしないように
					} else {
						// checkboxでVALUE_ATTRの場合
						if (type == 'checkbox' && checkbox_behavior == 'VALUE_ATTR') {
							if(value != null){
								if(typeof(docValues[name]) != 'undefined'){
									docValues[name] = docValues[name] + (docValues[name] != '' ? ',' : '') + value;
								}else{
									docValues[name] = value;
								}
							}else{
								// 全てチェックOFFでもキーはセットしておく必要があるので
								if(typeof(docValues[name]) == 'undefined'){
									docValues[name] = '';
								}
							}
						// 従来通りの挙動
						}else{
							docValues[name] = value;
						}
					}
				}
			});
			return docValues;
		},

		/**
		 * updateDocFields
		 *
		 * ドキュメントの特定のフィールドについてアップデートする
		 * また、承認者コメントリストがある場合、それもアップデートする
		 *
		 * @param {string} aDocId
		 * @param {object} aOkToUpdateField
		 * @param {bool} aWithoutComment:true…コメントレコードはインサートしない（承認処理などと同タイミングの場合など）
		 * @param {bool} aWithoutApproverCandidates:true…承認候補者は更新しない（承認処理などと同タイミングの場合など）
		 * @param {function} callback
		 */
		updateDocFields: function(aDocId, aOkToUpdateField, aWithoutComment, aWithoutApproverCandidates, aOpenNotifications, callback)
		{
			var docValues = DocDetailWindow._getUpdateDocValues(aDocId, aOkToUpdateField);

			// 承認者コメントリストをチェック
			var approverCommentObj = null;
			var approverCommentDetail = $('#template_body_' + aDocId).find('div.approver_comment_form').find('textarea[name=approver_comment_detail]').val() || null;
			if (approverCommentDetail != null) {
				var approverCommentProcessNumber = $('#template_body_' + aDocId).find('div.approver_comment_form').find('textarea[name=approver_comment_detail]').attr('process_number');
				approverCommentObj = {
					'approver_comment_detail': approverCommentDetail,
					'process_number': parseInt(approverCommentProcessNumber, 10)
				};
			}

			// 更新でもコメント入れられる
			var docComment = Ext.ComponentMgr.get('doc_comment_' + aDocId).getValue();

			// 承認者が変更された場合のアップデートデータを作成
			var updateApproveProcessList = [];
			if(!aWithoutApproverCandidates){
				$('#template_body_' + aDocId).find('input[name=process]').each(function(){
					if ($(this).attr('updated') == '1') {
						// プロセス番号
						var approveNumber = parseInt($(this).attr('number'), 10);
						// 承認者リスト
						var approver_with_comma = $(this).val();
						var approver_with_comma_splited = approver_with_comma.split(',');
						if (approver_with_comma.trim() == '') {
							approver_with_comma_splited = [];
						}
						updateApproveProcessList.push({
							approver: approver_with_comma_splited,
							number : approveNumber
						});
					}
				});
			}

			// ドキュメントのアップデートを送信
			WorkflowDoc.requestUpdateDoc(aDocId, docValues, approverCommentObj, docComment, aWithoutComment, updateApproveProcessList, aOpenNotifications, function(aIsOk){
				callback(aIsOk);
			});
		},

		/**
		 * checkMyProcessIn
		 *
		 * @param {Object} aProcess
		 * @param {string} aUserEmail
		 */
		checkMyProcessIn: function(aProcess, aUserEmail)
		{
			var retObj = {
				inApproveProcess: false,
				inViewProcess: false
			};
			if (aProcess.approver_candidates.indexOf(aUserEmail) != -1) {
				// 自分はこのプロセスの候補者にいる
				if (aProcess.approvers.indexOf(aUserEmail) != -1) {
					// 自分はこのプロセスを処理済みだ
					// no option
				} else {
					// プロセス処理済みではない
					if(aProcess.status == WorkflowDoc.PROCESS_STATUS_IN_PROCESS) {
						// 自分はこのプロセスをペンディングしている
						if (aProcess.approve_type == WorkflowDoc.APPROVE_TYPE_APPROVE) {
							// このプロセスは承認中プロセスだ
							retObj.inApproveProcess = true;
						} else if (aProcess.approve_type == WorkflowDoc.APPROVE_TYPE_LOOK) {
							// このプロセスは回覧中プロセスだ
							retObj.inViewProcess = true;
						}
					}
				}
			}
			return retObj;
		},

		/**
		 * createPrevButton
		 *
		 * @param {string} aDocId
		 */
		createPrevButton: function(aDocId)
		{
			return new Ext.Button({
				iconCls: 'page-prev',
				handler: function(){
					// 前へボタン
					var tabSet = Ext.ComponentMgr.get('tab_set');
					var activeTabGrid = tabSet.getActiveTab();
					if (LoginMgr.isAdminMode()) {
						activeTabGrid = Ext.ComponentMgr.get('search_result_grid');
					}
					var sm = activeTabGrid.selModel;
					var store = activeTabGrid.getStore();
					// findは前方一致とのことなので変更
					//var currentDocIndex = store.find('doc_id', aDocId);
					var currentDocIndex = store.findExact('doc_id', aDocId);
					if (currentDocIndex != -1) {
						if (currentDocIndex > 0) {
							var prevDocIndex = currentDocIndex - 1;
							var prevDocRecord = store.getAt(prevDocIndex);
							if (typeof(prevDocRecord) != 'undefined') {
								var prevDocId = prevDocRecord.data.doc_id;
								var closeWindowInstance = Ext.ComponentMgr.get('doc_detail_window_' + aDocId);
								DocDetailWindow.showWindow(prevDocId, closeWindowInstance);
								sm.selectRow(prevDocIndex);
							}
						}
					}
				}
			});
		},

		/**
		 * createNextButton
		 *
		 * @param {string} aDocId
		 */
		createNextButton: function(aDocId)
		{
			return new Ext.Button({
				iconCls: 'page-next',
				handler: function(){
					// 次へボタン
					var tabSet = Ext.ComponentMgr.get('tab_set');
					var activeTabGrid = tabSet.getActiveTab();
					if (LoginMgr.isAdminMode()) {
						activeTabGrid = Ext.ComponentMgr.get('search_result_grid');
					}
					var sm = activeTabGrid.selModel;
					var store = activeTabGrid.getStore();
					// findは前方一致とのことなので変更
					//var currentDocIndex = store.find('doc_id', aDocId);
					var currentDocIndex = store.findExact('doc_id', aDocId);
					if (currentDocIndex != -1) {
						var nextDocIndex = currentDocIndex + 1;
						var nextDocRecord = store.getAt(nextDocIndex);
						if (typeof(nextDocRecord) != 'undefined') {
							var nextDocId = nextDocRecord.data.doc_id;
							var closeWindowInstance = Ext.ComponentMgr.get('doc_detail_window_' + aDocId);
							DocDetailWindow.showWindow(nextDocId, closeWindowInstance);
							sm.selectRow(nextDocIndex);
						}
					}
				}
			});
		},

		/**
		 * createUpdateButton
		 *
		 * @param {string} aDocId
		 * @param {array} aOkToUpdateField
		 * @param {boolean} isCloseAfterUpdate:更新後閉じるかどうか
		 */
		createUpdateButton: function(btnId, aDocId, aOkToUpdateField, isCloseAfterUpdate)
		{
			return new Ext.Button({
				id: btnId,
				diabled: true,
				text: MyLang.getMsg('MSG_UPDATE'),
				handler: function()
				{
					// 入力値チェック
					if (!DocDetailWindow.validateForm(aDocId, 'update')) {
						return;
					}

					// ボタンをいったんDisable
					SateraitoUI.changeEnabledComponents(false);

					var ret = confirm(MyLang.getMsg('MSG_CONFIRM_PRE_UPDATE_DOC'));
					if (!ret) {
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}

					// 開封通知の情報を取得
					var openNotifications = WorkflowDoc.createOpenNotifications('template_body_' + aDocId);
					DocDetailWindow.updateDocFields(aDocId, aOkToUpdateField, false, false, openNotifications, function(aIsOk){
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);

						if (aIsOk) {
							alert(MyLang.getMsg('MSG_UPDATE_DOCUNENT'));
							if(isCloseAfterUpdate && !IS_OPENID_MODE){
								// 詳細ウィンドウを閉じる
								Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
							}
						} else {
							alert(MyLang.getMsg('ERROR_WHILE_UPDATING'));
						}
					});
				}
			});
		},


		/**
		 * createReSubmitButton
		 *
		 * 再申請ボタンのインスタンスを返す（再申請…申請者まで差し戻された申請を再度申請）
		 *
		 * @param {string} aDocId
		 */
		createReSubmitButton: function(btnId, aDocId, aOkToUpdateField, page_type)
		{
			if (typeof(aOkToUpdateField) == 'undefined') {
				aOkToUpdateField = [];
			}
			return new Ext.Button({
				id: btnId,
				diabled: true,
				text: MyLang.getMsg('MSG_RESUBMIT'),
				handler: function()
				{
					// 「承認」と「否決」などのボタンをDisable
					SateraitoUI.changeEnabledComponents(false);

					// 入力値チェック
					if (!DocDetailWindow.validateForm(aDocId, 'resubmit')) {
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}

					var process = function(aDuplicateChecked, aAttachFilesChecked){

						if (typeof(aDuplicateChecked) == 'undefined') {
							aDuplicateChecked = false;
						}

						if (typeof(aAttachFilesChecked) == 'undefined') {
							aAttachFilesChecked = false;
						}


						//
						// ドキュメントのカバー期間のチェック
						//
						var docCoverDateFrom = $('#template_body_' + aDocId).find(':input[name=doc_cover_date_from]').val();
						var docCoverDateTo = $('#template_body_' + aDocId).find(':input[name=doc_cover_date_to]').val();
						if (docCoverDateFrom != null && docCoverDateTo != null && docCoverDateFrom != '' && docCoverDateTo != '') {

							if (!aDuplicateChecked) {
								WorkflowDoc.checkDuplicateCoverDate(aDocId, docCoverDateFrom, docCoverDateTo, function(aResult){
									if (aResult) {
										// チェックOK
										process(true, aAttachFilesChecked);
									} else {
										// チェックNG
										alert(MyLang.getMsg('MSG_DUPLICATE_COVER_DATE_TERM'));
										// ボタンをEnable
										SateraitoUI.changeEnabledComponents(true);
										return;
									}
								});
								return;
							}
						}



						// 添付ファイル関連チェック
						if (!aAttachFilesChecked) {
							WorkflowDoc.checkAttachFiles(aDocId, function(jsondata){
								if (jsondata.result) {
									// チェックOK
									process(aDuplicateChecked, true);
								} else {
									// チェックNG
									if(jsondata.result_code == 'ATTACHFILE_REQUIRED'){
										alert(MyLang.getMsg('VC_REQUIRED_ATTACH_FILE'));
									}else{
										alert(jsondata.msg);
									}
									// ボタンをEnable
									SateraitoUI.changeEnabledComponents(true);
									return;
								}
							});
							return;
						}

						var ret = confirm(MyLang.getMsg('MSG_CONFIRM_PRE_RESUBMIT_DOC'));
						if (!ret) {
							// ボタンをEnable
							SateraitoUI.changeEnabledComponents(true);
							return;
						}

						// 再申請時イベントハンドラをキック
						$('#template_body_' + aDocId).find('input[type=hidden][name=workflow_doc_before_resubmit_handler]').each(function(){
							var handlerElement = this;
							var workflowDocBeforeReSubmitHandler = handlerElement.onclick;
							if (typeof(workflowDocBeforeReSubmitHandler) == 'function') {
								workflowDocBeforeReSubmitHandler($('#template_body_' + aDocId).parents('form')[0]);
							}
						});


						// 承認者が変更された場合のアップデートデータを作成
						var updateApproveProcessList = [];
						$('#template_body_' + aDocId).find('input[name=process]').each(function(){
							if ($(this).attr('updated') == '1') {
								// プロセス番号
								var approveNumber = parseInt($(this).attr('number'), 10);
								// 承認者リスト
								var approver_with_comma = $(this).val();
								var approver_with_comma_splited = approver_with_comma.split(',');
								if (approver_with_comma.trim() == '') {
									approver_with_comma_splited = [];
								}
								updateApproveProcessList.push({
									approver: approver_with_comma_splited,
									number : approveNumber
								});
							}
						});

						// 更新対象のフィールド値を取得
						var docValues = DocDetailWindow._getUpdateDocValues(aDocId, aOkToUpdateField);
						// 再申請でもコメント入れられる
						//var docComment = Ext.ComponentMgr.get('doc_comment').getValue();
						var docComment = Ext.ComponentMgr.get('doc_comment_' + aDocId).getValue();

						// 最終承認番号が定義されていたら、その定義（※自動承認対応に伴い、申請時に文書テーブルに保持するようにしたが、互換性のためここでも依然として渡しておく。受け側では文書テーブルになければこちらを使用）
						// ⇒承認者の部署コードなどを使って採番体系を分けたい場合があるので、ここで渡された値を優先して使用するように変更（毎回文書テーブルも更新）
						var finalApproveNoDef = WorkflowDoc.createFinalApproveNoDef(aDocId);
						// シリアルＮｏ採番定義
						var serialNoDef = WorkflowDoc.createSerialNoDef(aDocId);

						// 今回追加するマスター更新設定
						var updateMasterDataDef = WorkflowDoc.getMasterRowForUpdate(aDocId);

						// 再申請時もHTMLを更新する（これまでは新規申請時のみだった。ほんとは承認、否決等のタイミングでも実施したいがとりあえず再申請時に実施）
						var templateBody = $('#template_body_to_changedocstatus_' + aDocId).html();

						WorkflowDoc.reSubmitDoc(aDocId, templateBody, docValues, docComment, updateApproveProcessList, finalApproveNoDef, serialNoDef, updateMasterDataDef, function(jsonData){

							if(typeof(jsonData) != 'undefined' && jsonData.status == 'error'){
								var error_code = jsonData.error_code;
								var error_msg = '';
								if(error_code == 'NOEXIST_TARGET_DOC'){
									error_msg = MyLang.getMsg('ERR_FAILED_GET_TARGET_DOC');
								}else{
									error_msg = MyLang.getMsg('ERR_RESUBMIT_DOC');
								}
								alert(error_msg);
							}
							else{
								if (IS_OPENID_MODE) {
									OidMiniMessage.showNormalMiniMessage(MyLang.getMsg('MSG_RESUBMIT_DOCUNENT'), (1000 * 10));
								}
							}

							if (IS_OPENID_MODE) {
								// 詳細ウィンドウを閉じて開く
								Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
								// コンテキスチャルガジェットから開いた際にアクション後に最大化しなかったので対応 2012/10/22 T.ASAO
								// DocDetailWindow.showWindow(aDocId);
								DocDetailWindow.showWindow(aDocId, null, page_type);
							} else {
								// 全グリッドをリロード
								MyPanel.reloadAllGrid();
								// 詳細ウィンドウを閉じる
								Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
							}
						});
					};

					process(false);

				}
			});
		},

		/**
		 * createLookedButton
		 *
		 * 「回覧して閉じる」ボタンのインスタンスを返す
		 *
		 * @param {string} aDocId
		 */
		createLookedButton: function(btnId, aDocId, aOkToUpdateField, page_type)
		{
			if (typeof(aOkToUpdateField) == 'undefined') {
				aOkToUpdateField = [];
			}

			var buttonText = MyLang.getMsg('MSG_LOOK_AND_CLOSE');
			if (IS_OPENID_MODE) {
				buttonText = MyLang.getMsg('MSG_LOOK');
			}

			return new Ext.Button({
				id: btnId,
				diabled: true,
				text: buttonText,
				handler: function()
				{

					// 「回覧して閉じる」ボタンをDisable
					SateraitoUI.changeEnabledComponents(false);

					// メイン処理
					var look = function(){
						var ret = confirm(MyLang.getMsg('MSG_CONFIRM_PRE_LOOK_DOC'));		// 申請書を回覧します。よろしいですか？
						if (!ret) {
							// ボタンをEnable
							SateraitoUI.changeEnabledComponents(true);
							return;
						}

						// 承認者が変更された場合のアップデートデータを作成
						var updateApproveProcessList = [];
						$('#template_body_' + aDocId).find('input[name=process]').each(function(){
							if ($(this).attr('updated') == '1') {
								// プロセス番号
								var approveNumber = parseInt($(this).attr('number'), 10);
								// 承認者リスト
								var approver_with_comma = $(this).val();
								var approver_with_comma_splited = approver_with_comma.split(',');
								if (approver_with_comma.trim() == '') {
									approver_with_comma_splited = [];
								}
								updateApproveProcessList.push({
									approver: approver_with_comma_splited,
									number : approveNumber
								});
							}
						});

						// 最終承認番号が定義されていたら、その定義（※自動承認対応に伴い、申請時に文書テーブルに保持するようにしたが、互換性のためここでも依然として渡しておく。受け側では文書テーブルになければこちらを使用）
						var finalApproveNoDef = WorkflowDoc.createFinalApproveNoDef(aDocId);
						// シリアルＮｏ採番定義
						var serialNoDef = WorkflowDoc.createSerialNoDef(aDocId);
						// 今回追加するマスター更新設定
						var updateMasterDataDef = WorkflowDoc.getMasterRowForUpdate(aDocId);
						//var docComment = Ext.ComponentMgr.get('doc_comment').getValue();
						var docComment = Ext.ComponentMgr.get('doc_comment_' + aDocId).getValue();
						// 開封通知の情報を取得
						var openNotifications = WorkflowDoc.createOpenNotifications('template_body_' + aDocId);

						var processLook = function(){

							WorkflowDoc.changeDocStatus(aDocId, WorkflowDoc.STATUS_PASSED, WorkflowDoc.APPROVE_TYPE_LOOK, docComment, updateApproveProcessList, finalApproveNoDef, serialNoDef, updateMasterDataDef, openNotifications, function(jsonData){

								if(typeof(jsonData) != 'undefined' && jsonData.status == 'error'){
									var error_code = jsonData.error_code;
									var error_msg = '';
									if(error_code == 'NOEXIST_TARGET_WA'){
										error_msg = MyLang.getMsg('ERR_FAILED_LOOK_DOC_BY_ALREADY_DEALED');	// この申請は別の承認者によって既に処理されているため回覧処理できません。
									}else if(error_code == 'NOEXIST_TARGET_DOC'){
										error_msg = MyLang.getMsg('ERR_FAILED_GET_TARGET_DOC');
									}else{
										error_msg = MyLang.getMsg('ERR_LOOK_DOC');
									}
									alert(error_msg);
								}
								else{
									if (IS_OPENID_MODE) {
										OidMiniMessage.showNormalMiniMessage(MyLang.getMsg('MSG_LOOK_DOCUNENT'), (1000 * 10));
									}
								}

								if (IS_OPENID_MODE) {
									// 詳細ウィンドウを閉じて開く
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
									// コンテキスチャルガジェットから開いた際にアクション後に最大化しなかったので対応 2012/10/22 T.ASAO
									// DocDetailWindow.showWindow(aDocId);
									DocDetailWindow.showWindow(aDocId, null, page_type);
								} else {
									// 全グリッドをリロード
									MyPanel.reloadAllGrid();
									// 詳細ウィンドウを閉じる
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
								}
							});
						};


						// 更新フィールドがあれば、更新
						if (aOkToUpdateField.length > 0 || DocDetailWindow.isApproverCommentDictExists(aDocId)) {
							DocDetailWindow.updateDocFields(aDocId, aOkToUpdateField, true, true, null, function(aIsOk){
								if (aIsOk) {
									processLook();
								} else {
									// ボタンをEnable
									SateraitoUI.changeEnabledComponents(true);
									alert(MyLang.getMsg('ERROR_WHILE_UPDATING'));
									return;
								}
							});
						} else {
							processLook();
						}
					};

					// ここから処理↓（上のはメソッド）
					// 入力値チェック
					if (!DocDetailWindow.validateForm(aDocId, 'look')) {
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}

					var viewerEmail = LoginMgr.getViewerEmail();

					// 未回答の回答がないかをチェック
					var is_exist_mandatory_q_and_a = false;
					$('#template_body_' + aDocId).find('div.q_and_a').each(function(){

						// 回覧のために必須のq_and_aのみ処理
						var is_mandatory_for_look = $(this).hasClass('mandatory_for_look');
						var is_mandatory_for_self_look = $(this).hasClass('mandatory_for_self_look');
						if(is_mandatory_for_look || is_mandatory_for_self_look){
							is_exist_mandatory_q_and_a = true;
							var wordForQuestion = $(this).attr('word_for_question');
							if (typeof(wordForQuestion) == 'undefined') {
								wordForQuestion = MyLang.getMsg('QUESTION');
							}
							// Q&A名称
							var QandAName = $(this).attr('name');

							QandA.requestQandAList(aDocId, QandAName, function(aQandAList){
								var is_exist_empty_answer = false;

								Ext.each(aQandAList, function(){
									var entry = this;

									if (typeof(entry.question_detail) != 'undefined' && entry.question_detail != '' && !(typeof(entry.answer_detail) != 'undefined' && entry.answer_detail != '')) {
										if(is_mandatory_for_look){
											is_exist_empty_answer = true;
											alert(MyLang.getMsg('CANNOT_APPROVE_BECAUSE_EXIST_NOTANSWER_QUESTION') + ';' + wordForQuestion);
											// ボタンをEnable
											SateraitoUI.changeEnabledComponents(true);
											return;
										}else if(is_mandatory_for_self_look){
											// 自分自身が質問したもののみ（TODO 代理承認者はどうする？）
											if(entry.question_email == viewerEmail){
												is_exist_empty_answer = true;
												alert(MyLang.getMsg('CANNOT_APPROVE_BECAUSE_EXIST_NOTANSWER_QUESTION') + ';' + wordForQuestion);
												// ボタンをEnable
												SateraitoUI.changeEnabledComponents(true);
												return;
											}
										}
									}
								});

								// チェックがOKなら回覧処理
								if(!is_exist_empty_answer){
									look();
								}
							});
						}
					});
					// 回答必須のQAが一つもなければ↑の処理に入らないのでここで回覧処理を行う
					if(!is_exist_mandatory_q_and_a){
						look();
					}

				}
			});
		},

		/**
		 * createApproveButton
		 *
		 * 承認ボタンのインスタンスを返す
		 *
		 * @param {string} aDocId
		 */
		createApproveButton: function(btnId, aDocId, aOkToUpdateField, page_type)
		{
			if (typeof(aOkToUpdateField) == 'undefined') {
				aOkToUpdateField = [];
			}
			return new Ext.Button({
				id: btnId,
				diabled: true,
				text: MyLang.getMsg('MSG_APPROVE'),
				handler: function()
				{
					// 「承認」と「否決」などのボタンをDisable
					SateraitoUI.changeEnabledComponents(false);

					// 承認メイン処理
					var approve = function(){

						var ret = confirm(MyLang.getMsg('MSG_CONFIRM_PRE_APPROVE_DOC'));	// 申請書を承認します。よろしいですか？
						if (!ret) {
							// ボタンをEnable
							SateraitoUI.changeEnabledComponents(true);
							return;
						}

						//
						// 申請書Approve時イベントハンドラをキック
						//
						$('#template_body_' + aDocId).find('input[type=hidden][name=workflow_doc_before_approve_handler]').each(function(){
							var handlerElement = this;
							var workflowDocBeforeApproveHandler = handlerElement.onclick;
							if (typeof(workflowDocBeforeApproveHandler) == 'function') {
								workflowDocBeforeApproveHandler($('#template_body_' + aDocId).parents('form')[0]);
							}
						});

						// 承認者が変更された場合のアップデートデータを作成
						var updateApproveProcessList = [];
						$('#template_body_' + aDocId).find('input[name=process]').each(function(){
							if ($(this).attr('updated') == '1') {
								// プロセス番号
								var approveNumber = parseInt($(this).attr('number'), 10);
								// 承認者リスト
								var approver_with_comma = $(this).val();
								var approver_with_comma_splited = approver_with_comma.split(',');
								if (approver_with_comma.trim() == '') {
									approver_with_comma_splited = [];
								}
								updateApproveProcessList.push({
									approver: approver_with_comma_splited,
									number : approveNumber
								});
							}
						});

						//var docComment = Ext.ComponentMgr.get('doc_comment').getValue();
						var docComment = Ext.ComponentMgr.get('doc_comment_' + aDocId).getValue();

						// 最終承認番号が定義されていたら、その定義（※自動承認対応に伴い、申請時に文書テーブルに保持するようにしたが、互換性のためここでも依然として渡しておく。受け側では文書テーブルになければこちらを使用）
						// ⇒承認者の部署コードなどを使って採番体系を分けたい場合があるので、ここで渡された値を優先して使用するように変更（毎回文書テーブルも更新）
						var finalApproveNoDef = WorkflowDoc.createFinalApproveNoDef(aDocId);
						// シリアルＮｏ採番定義
						var serialNoDef = WorkflowDoc.createSerialNoDef(aDocId);
						// 今回追加するマスター更新設定
						var updateMasterDataDef = WorkflowDoc.getMasterRowForUpdate(aDocId);
						// 開封通知の情報を取得
						var openNotifications = WorkflowDoc.createOpenNotifications('template_body_' + aDocId);

						var processApprove = function(){


							WorkflowDoc.changeDocStatus(aDocId, WorkflowDoc.STATUS_PASSED, WorkflowDoc.APPROVE_TYPE_APPROVE, docComment, updateApproveProcessList, finalApproveNoDef, serialNoDef, updateMasterDataDef, openNotifications, function(jsonData){

								if(typeof(jsonData) != 'undefined' && jsonData.status == 'error'){
									var error_code = jsonData.error_code;
									var error_msg = '';
									if(error_code == 'NOEXIST_TARGET_WA'){
										error_msg = MyLang.getMsg('ERR_FAILED_APPROVE_DOC_BY_ALREADY_DEALED');	// この申請は別の承認者によって既に処理されているため承認できません。
									}else if(error_code == 'NOEXIST_TARGET_DOC'){
										error_msg = MyLang.getMsg('ERR_FAILED_GET_TARGET_DOC');
									}else{
										error_msg = MyLang.getMsg('ERR_APPROVE_DOC');
									}
									alert(error_msg);
								}
								else{
									if (IS_OPENID_MODE) {
										OidMiniMessage.showNormalMiniMessage(MyLang.getMsg('MSG_APPROVE_DOCUNENT'), (1000 * 10));
									}
								}

								if (IS_OPENID_MODE) {
									// 詳細ウィンドウを閉じて開く
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
									// コンテキスチャルガジェットから開いた際にアクション後に最大化しなかったので対応 2012/10/22 T.ASAO
									// DocDetailWindow.showWindow(aDocId);
									DocDetailWindow.showWindow(aDocId, null, page_type);
								} else {
									// 全グリッドをリロード
									MyPanel.reloadAllGrid();
									// 詳細ウィンドウを閉じる
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
								}
							});
						};

						// 更新フィールドがあれば、更新
						if (aOkToUpdateField.length > 0 || DocDetailWindow.isApproverCommentDictExists(aDocId)) {
							DocDetailWindow.updateDocFields(aDocId, aOkToUpdateField, true, true, null, function(aIsOk){
								if (aIsOk) {
									processApprove();
								} else {
									// ボタンをEnable
									SateraitoUI.changeEnabledComponents(true);
									alert(MyLang.getMsg('ERROR_WHILE_UPDATING'));
									return;
								}
							});
						} else {
							processApprove();
						}

					};

					// ここから処理↓（上のはメソッド）

					// 入力値チェック
					if (!DocDetailWindow.validateForm(aDocId, 'approve')) {
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}

					var viewerEmail = LoginMgr.getViewerEmail();

					// 未回答の回答がないかをチェック
					var is_exist_mandatory_q_and_a = false;
					$('#template_body_' + aDocId).find('div.q_and_a').each(function(){

						// 承認のために必須のq_and_aのみ処理
						var is_mandatory_for_approve = $(this).hasClass('mandatory_for_approve');
						var is_mandatory_for_self_approve = $(this).hasClass('mandatory_for_self_approve');
						if(is_mandatory_for_approve || is_mandatory_for_self_approve){
							is_exist_mandatory_q_and_a = true;
							var wordForQuestion = $(this).attr('word_for_question');
							if (typeof(wordForQuestion) == 'undefined') {
								wordForQuestion = MyLang.getMsg('QUESTION');
							}
							// Q&A名称
							var QandAName = $(this).attr('name');

							QandA.requestQandAList(aDocId, QandAName, function(aQandAList){
								var is_exist_empty_answer = false;

								Ext.each(aQandAList, function(){
									var entry = this;

									if (typeof(entry.question_detail) != 'undefined' && entry.question_detail != '' && !(typeof(entry.answer_detail) != 'undefined' && entry.answer_detail != '')) {
										if(is_mandatory_for_approve){
											is_exist_empty_answer = true;
											alert(MyLang.getMsg('CANNOT_APPROVE_BECAUSE_EXIST_NOTANSWER_QUESTION') + ';' + wordForQuestion);
											// ボタンをEnable
											SateraitoUI.changeEnabledComponents(true);
											return;
										}else if(is_mandatory_for_self_approve){
											// 自分自身が質問したもののみ（TODO 代理承認者はどうする？）
											if(entry.question_email == viewerEmail){
												is_exist_empty_answer = true;
												alert(MyLang.getMsg('CANNOT_APPROVE_BECAUSE_EXIST_NOTANSWER_QUESTION') + ';' + wordForQuestion);
												// ボタンをEnable
												SateraitoUI.changeEnabledComponents(true);
												return;
											}
										}
									}
								});

								// チェックがOKなら承認処理
								if(!is_exist_empty_answer){
									approve();
								}
							});
						}
					});
					// 回答必須のQAが一つもなければ↑の処理に入らないのでここで承認処理を行う
					if(!is_exist_mandatory_q_and_a){
						approve();
					}

				}
			});
		},

		/**
		 * createRejectButton
		 *
		 * 否決するボタン
		 *
		 * @param {string} aDocId
		 */
		createRejectButton: function(btnId, aDocId, aOkToUpdateField, page_type)
		{
			if (typeof(aOkToUpdateField) == 'undefined') {
				aOkToUpdateField = [];
			}
			return new Ext.Button({
				id: btnId,
				diabled: true,
				text: MyLang.getMsg('MSG_REJECT'),
				handler: function()
				{
					// 「承認」と「否決」のボタンをDisable
					SateraitoUI.changeEnabledComponents(false);

					// 否決メイン処理
					var reject = function(){

						var ret = confirm(MyLang.getMsg('MSG_CONFIRM_PRE_REJECT_DOC'));	// 申請書を否決します。よろしいですか？
						if (!ret) {
							// ボタンをEnable
							SateraitoUI.changeEnabledComponents(true);
							return;
						}

						//
						// 申請書Reject時イベントハンドラをキック
						//
						$('#template_body_' + aDocId).find('input[type=hidden][name=workflow_doc_before_reject_handler]').each(function(){
							var handlerElement = this;
							var workflowDocBeforeRejectHandler = handlerElement.onclick;
							if (typeof(workflowDocBeforeRejectHandler) == 'function') {
								workflowDocBeforeRejectHandler($('#template_body_' + aDocId).parents('form')[0]);
							}
						});


						// 承認者が変更された場合のアップデートデータを作成
						var updateApproveProcessList = [];
						$('#template_body_' + aDocId).find('input[name=process]').each(function(){
							if ($(this).attr('updated') == '1') {
								// プロセス番号
								var approveNumber = parseInt($(this).attr('number'), 10);
								// 承認者リスト
								var approver_with_comma = $(this).val();
								var approver_with_comma_splited = approver_with_comma.split(',');
								if (approver_with_comma.trim() == '') {
									approver_with_comma_splited = [];
								}
								updateApproveProcessList.push({
									approver: approver_with_comma_splited,
									number : approveNumber
								});
							}
						});

						// 最終承認番号が定義されていたら、その定義（※自動承認対応に伴い、申請時に文書テーブルに保持するようにしたが、互換性のためここでも依然として渡しておく。受け側では文書テーブルになければこちらを使用）
						var finalApproveNoDef = WorkflowDoc.createFinalApproveNoDef(aDocId);
						// シリアルＮｏ採番定義
						var serialNoDef = WorkflowDoc.createSerialNoDef(aDocId);
						// 今回追加するマスター更新設定
						var updateMasterDataDef = WorkflowDoc.getMasterRowForUpdate(aDocId);
						// 開封通知の情報を取得
						var openNotifications = WorkflowDoc.createOpenNotifications('template_body_' + aDocId);

						var processReject = function(){

							WorkflowDoc.changeDocStatus(aDocId, WorkflowDoc.STATUS_REJECTED, WorkflowDoc.APPROVE_TYPE_APPROVE, docComment, updateApproveProcessList, finalApproveNoDef, serialNoDef, updateMasterDataDef, openNotifications, function(jsonData){
								if(typeof(jsonData) != 'undefined' && jsonData.status == 'error'){
									var error_code = jsonData.error_code;
									var error_msg = '';
									if(error_code == 'NOEXIST_TARGET_WA'){
										error_msg = MyLang.getMsg('ERR_FAILED_REJECT_DOC_BY_ALREADY_DEALED');	// この申請は別の承認者によって既に処理されているため否決処理できません。
									}else if(error_code == 'NOEXIST_TARGET_DOC'){
										error_msg = MyLang.getMsg('ERR_FAILED_GET_TARGET_DOC');
									}else{
										error_msg = MyLang.getMsg('ERR_REJECT_DOC');
									}
									alert(error_msg);
								}
								else{
									if (IS_OPENID_MODE) {
										OidMiniMessage.showNormalMiniMessage(MyLang.getMsg('MSG_REJECT_DOCUNENT'), (1000 * 10));
									}
								}

								if (IS_OPENID_MODE) {
									// 詳細ウィンドウを閉じて開く
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
									// コンテキスチャルガジェットから開いた際にアクション後に最大化しなかったので対応 2012/10/22 T.ASAO
									// DocDetailWindow.showWindow(aDocId);
									DocDetailWindow.showWindow(aDocId, null, page_type);
								} else {
									// 全グリッドをリロード
									MyPanel.reloadAllGrid();
									// ボタンをEnable（他のウィンドウのボタンまでDisabledになっているので復活しとく）
									SateraitoUI.changeEnabledComponents(true);
									// 詳細ウィンドウを閉じる
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
								}
							});
						};

						// 更新フィールドがあれば、更新
						if (aOkToUpdateField.length > 0 || DocDetailWindow.isApproverCommentDictExists(aDocId)) {
							DocDetailWindow.updateDocFields(aDocId, aOkToUpdateField, true, true, null, function(aIsOk){
								if (aIsOk) {
									processReject();
								} else {
									// ボタンをEnable
									SateraitoUI.changeEnabledComponents(true);
									alert(MyLang.getMsg('ERROR_WHILE_UPDATING'));
									return;
								}
							});
						} else {
							processReject();
						}
					};

					// ここから処理↓（上のはメソッド）

					// 入力値チェック
					if (!DocDetailWindow.validateForm(aDocId, 'reject')) {
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}

					// コメント欄の入力値
					//var docComment = Ext.ComponentMgr.get('doc_comment').getValue();
					var docComment = Ext.ComponentMgr.get('doc_comment_' + aDocId).getValue();

					if (docComment.trim() == '') {
						alert(MyLang.getMsg('EXP_ABOUT_INPUT_COMMENT_WITH_REJECT'));		// 否決する場合はコメント欄に否決理由を記入して下さい
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}


					var viewerEmail = LoginMgr.getViewerEmail();

					// 未回答の回答がないかをチェック
					var is_exist_mandatory_q_and_a = false;
					$('#template_body_' + aDocId).find('div.q_and_a').each(function(){

						// 否決のために必須のq_and_aのみ処理
						var is_mandatory_for_reject = $(this).hasClass('mandatory_for_reject');
						var is_mandatory_for_self_reject = $(this).hasClass('mandatory_for_self_reject');
						if(is_mandatory_for_reject || is_mandatory_for_self_reject){
							is_exist_mandatory_q_and_a = true;
							var wordForQuestion = $(this).attr('word_for_question');
							if (typeof(wordForQuestion) == 'undefined') {
								wordForQuestion = MyLang.getMsg('QUESTION');
							}
							// Q&A名称
							var QandAName = $(this).attr('name');

							QandA.requestQandAList(aDocId, QandAName, function(aQandAList){
								var is_exist_empty_answer = false;

								Ext.each(aQandAList, function(){
									var entry = this;

									if (typeof(entry.question_detail) != 'undefined' && entry.question_detail != '' && !(typeof(entry.answer_detail) != 'undefined' && entry.answer_detail != '')) {
										if(is_mandatory_for_reject){
											is_exist_empty_answer = true;
											alert(MyLang.getMsg('CANNOT_REJECT_BECAUSE_EXIST_NOTANSWER_QUESTION') + ';' + wordForQuestion);
											// ボタンをEnable
											SateraitoUI.changeEnabledComponents(true);
											return;
										}else if(is_mandatory_for_self_reject){
											// 自分自身が質問したもののみ（TODO 代理承認者はどうする？）
											if(entry.question_email == viewerEmail){
												is_exist_empty_answer = true;
												alert(MyLang.getMsg('CANNOT_REJECT_BECAUSE_EXIST_NOTANSWER_QUESTION') + ';' + wordForQuestion);
												// ボタンをEnable
												SateraitoUI.changeEnabledComponents(true);
												return;
											}
										}
									}
								});

								// チェックがOKなら否決処理
								if(!is_exist_empty_answer){
									reject();
								}
							});
						}
					});
					// 回答必須のQAが一つもなければ↑の処理に入らないのでここで否決処理を行う
					if(!is_exist_mandatory_q_and_a){
						reject();
					}

				}
			});
		},

		/**
		 * createRemandButton
		 *
		 * 差し戻しするボタン
		 *
		 * @param {string} aDocId
		 */
		createRemandButton: function(btnId, aDocId, aOkToUpdateField, page_type)
		{

			if (typeof(aOkToUpdateField) == 'undefined') {
				aOkToUpdateField = [];
			}

			return new Ext.Button({
				id: btnId,
				diabled: true,
				text: MyLang.getMsg('MSG_REMAND'),
				handler: function()
				{
					// 「承認」と「否決」のボタンをDisable
					SateraitoUI.changeEnabledComponents(false);

					// メイン処理
					var remand = function(currentApproveNo, remandProcessNumber, docComment){

						// 差し戻し選択ダイアログにまとめる
						//var ret = confirm(MyLang.getMsg('MSG_CONFIRM_PRE_REMAND_DOC'));	// 申請書を差し戻しします。よろしいですか？
						//if (!ret) {
						//	// ボタンをEnable
						//	SateraitoUI.changeEnabledComponents(true);
						//	return;
						//}

						// 申請書Remand時イベントハンドラをキック
						$('#template_body_' + aDocId).find('input[type=hidden][name=workflow_doc_before_remand_handler]').each(function(){
							var handlerElement = this;
							var workflowDocBeforeRemandHandler = handlerElement.onclick;
							if (typeof(workflowDocBeforeRemandHandler) == 'function') {
								workflowDocBeforeRemandHandler($('#template_body_' + aDocId).parents('form')[0]);
							}
						});


						// 承認者が変更された場合のアップデートデータを作成
						var updateApproveProcessList = [];
						$('#template_body_' + aDocId).find('input[name=process]').each(function(){
							if ($(this).attr('updated') == '1') {
								// プロセス番号
								var approveNumber = parseInt($(this).attr('number'), 10);
								// 承認者リスト
								var approver_with_comma = $(this).val();
								var approver_with_comma_splited = approver_with_comma.split(',');
								if (approver_with_comma.trim() == '') {
									approver_with_comma_splited = [];
								}
								updateApproveProcessList.push({
									approver: approver_with_comma_splited,
									number : approveNumber
								});
							}
						});

						// 最終承認番号が定義されていたら、その定義（※自動承認対応に伴い、申請時に文書テーブルに保持するようにしたが、互換性のためここでも依然として渡しておく。受け側では文書テーブルになければこちらを使用）
						//var finalApproveNoDef = WorkflowDoc.createFinalApproveNoDef(aDocId);
						// シリアルＮｏ採番定義
						//var serialNoDef = WorkflowDoc.createSerialNoDef(aDocId);
						// 今回追加するマスター更新設定
						var updateMasterDataDef = WorkflowDoc.getMasterRowForUpdate(aDocId);


						var processRemand = function(){

							WorkflowDoc.remandDocStatus(aDocId, currentApproveNo, remandProcessNumber, docComment, function(jsonData){
								if(typeof(jsonData) != 'undefined' && jsonData.status == 'error'){
									var error_code = jsonData.error_code;
									var error_msg = '';
									if(error_code == 'ALREADY_FINAL_APPROVED'){
										error_msg = MyLang.getMsg('ERR_FAILED_REMAND_DOC_BY_ALREADY_FINAL_APPROVED');
									}else if(error_code == 'ALREADY_REJECTED'){
										error_msg = MyLang.getMsg('ERR_FAILED_REMAND_DOC_BY_ALREADY_REJECTED');
									}else if(error_code == 'DENY_REMAND'){
										error_msg = MyLang.getMsg('ERR_FAILED_REMAND_DOC_BY_DENIED');
									}else if(error_code == 'NOEXIST_TARGET_DOC'){
										error_msg = MyLang.getMsg('ERR_FAILED_GET_TARGET_DOC');
									}else{
										error_msg = MyLang.getMsg('ERR_REMAND_DOC');
									}
									alert(error_msg);
								}
								else{
									if (IS_OPENID_MODE) {
										OidMiniMessage.showNormalMiniMessage(MyLang.getMsg('MSG_REMAND_DOCUNENT'), (1000 * 10));
									}
								}

								if (IS_OPENID_MODE) {
									// 詳細ウィンドウを閉じて開く
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
									// コンテキスチャルガジェットから開いた際にアクション後に最大化しなかったので対応 2012/10/22 T.ASAO
									// DocDetailWindow.showWindow(aDocId);
									DocDetailWindow.showWindow(aDocId, null, page_type);
								} else {
									// 全グリッドをリロード
									MyPanel.reloadAllGrid();
									// ボタンをEnable（他のウィンドウのボタンまでDisabledになっているので復活しとく）
									SateraitoUI.changeEnabledComponents(true);
									// 詳細ウィンドウを閉じる
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
								}
							});
						};

						// 更新フィールドがあれば、更新
						if (aOkToUpdateField.length > 0 || DocDetailWindow.isApproverCommentDictExists(aDocId)) {
							DocDetailWindow.updateDocFields(aDocId, aOkToUpdateField, true, true, null, function(aIsOk){
								if (aIsOk) {
									processRemand();
								} else {
									// ボタンをEnable
									SateraitoUI.changeEnabledComponents(true);
									alert(MyLang.getMsg('ERROR_WHILE_UPDATING'));
									return;
								}
							});
						} else {
							processRemand();
						}

					};

					// ここから処理↓（上のはメソッド）

					// 入力値チェック
					if (!DocDetailWindow.validateForm(aDocId, 'remand')) {
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}

					// コメント欄の入力値
					//var docComment = Ext.ComponentMgr.get('doc_comment').getValue();
					var docComment = Ext.ComponentMgr.get('doc_comment_' + aDocId).getValue();

					if (docComment.trim() == '') {
						alert(MyLang.getMsg('EXP_ABOUT_INPUT_COMMENT_WITH_REMAND'));
						// ボタンをEnable
						SateraitoUI.changeEnabledComponents(true);
						return;
					}

					//var viewerEmail = LoginMgr.getViewerEmail();


					// 差し戻しステップ番号を選択
					var currentApproveNo = $('#template_body_' + aDocId).find('input[name=process][current_approving=1]').attr('number');

					//var remand_process_number_datas = [];
					//remand_process_number_datas.push(['__noselect', MyLang.getMsg('MSG_INDICATE_REMAND_PROCESS_NUMBER')]);
					//remand_process_number_datas.push([0, MyLang.getMsg('REMAND_TARGET_SUBMITTER')]);


					var vHtml = '';
					vHtml += '<div style="font-size:13px;padding:10px;">';
					vHtml += '<h1>' + MyLang.getMsg('SELECT_REMAND_PROCESS_NUMBER') + '</h1>';

					vHtml += '<p style="margin:10px;">';
					vHtml += MyLang.getMsg('MSG_CONFIRM_PRE_REMAND_DOC') + '<br>';
					vHtml += '</p>';

					vHtml += '<table class="detail" style="width:99%">';
					vHtml += '<tr>';
					vHtml += '<td style="width:30%" class="detail_name">';
					vHtml += MyLang.getMsg('REMAND_PROCESS_NUMBER');
					vHtml += '</td>';
					vHtml += '<td style="width:70%" class="detail_value">';
					vHtml += '<select id="remand_process_number_' + aDocId + '" style="width:100%;" >';

					vHtml += '<option value="0" >' + MyLang.getMsg('REMAND_TARGET_SUBMITTER') + '</option>';
					if(typeof(currentApproveNo) != 'undefined' && !isNaN(currentApproveNo)){
						currentApproveNo = parseInt(currentApproveNo, 10);
						for(var i = 1; i < currentApproveNo; i++){
							var approve_disp = $('#template_body_' + aDocId).find('input[name=process][number=' + i + ']').attr('disp');
							if(typeof(approve_disp) == 'undefined' || approve_disp == ''){
								vHtml += '<option value="' + i + '" >' + MyLang.getMsg('REMAND_TARGET_APPROVER') + ' ' + i + '</option>';
							}else{
								vHtml += '<option value="' + i + '" >' + approve_disp + '</option>';
							}
						}
					}
					vHtml += '</select>';
					vHtml += '</td>';
					vHtml += '</tr>';
					vHtml += '</table>';

					vHtml += '</div>';

					var selectProcessPanel = new Ext.Panel({
						autoWidth: true,
						autoScroll: false,
						html:vHtml
					});

					var buttons = [];
					buttons.push({
						text: MyLang.getMsg('MSG_REMAND'),
						handler: function()
						{
							//var remandProcessNumber = Ext.ComponentMgr.get('remand_process_number_' + aDocId).getValue();
							var remandProcessNumber = $('#remand_process_number_' + aDocId).val();
							if(typeof(remandProcessNumber) == 'undefined' || remandProcessNumber == '__noselect' || isNaN(remandProcessNumber)){
								alert(MyLang.getMsg('VC_INDICATE_REMAND_PROCESS_NUMBER'));
							}else{
								Ext.ComponentMgr.get('select_remand_process_' + aDocId).close();
								remand(parseInt(currentApproveNo, 10), parseInt(remandProcessNumber, 10), docComment);
							}
						}
					});
					buttons.push({
						text: MyLang.getMsg('MSG_CLOSE'),
						handler: function()
						{
							Ext.ComponentMgr.get('select_remand_process_' + aDocId).close();
							SateraitoUI.changeEnabledComponents(true);
						}
					});

					// ウィンドウ
					var selectProcessWindow = new Ext.Window({
						id: 'select_remand_process_' + aDocId,
						width: 400,
						//height: SateraitoUI.getWindowHeightWithUserPrefs(100),
						autoHeight:true,
						bodyStyle: 'background-color:white;',
						title: MyLang.getMsg('SELECT_REMAND_PROCESS_NUMBER'),
						plain: true,
						autoScroll: false,
						layout: 'fit',
						items: [selectProcessPanel],
						listeners:{
							close:function(){
								SateraitoUI.changeEnabledComponents(true);
							}
						},
						buttons: buttons
					});

					// ウィンドウを開く
					selectProcessWindow.show();
					// ウインドウの移動範囲を制約
					selectProcessWindow.dd.constrainTo(Ext.getBody());


				}
			});
		},

		/**
		 * createDeleteButton
		 *
		 * @param {string} aDocId
		 */
		createDeleteButton: function(btnId, aDocId)
		{
			return new Ext.Button({
				id: btnId,
				diabled: true,
				text: MyLang.getMsg('MSG_DELETE'),
				handler: function()
				{
					var ret = confirm(MyLang.getMsg('MSG_CONFIRM_PRE_DELETE_DOC'));	// この申請書を削除します。よろしいですか？
					if (!ret) {
						return;
					}

					// ボタンをいったんDisable
					SateraitoUI.changeEnabledComponents(false);

					WorkflowDoc.deleteDoc(aDocId, function(isOk){
						if(isOk){
							// ボタンをEnable（他のウィンドウのボタンまでDisabledになっているので復活しとく）
							SateraitoUI.changeEnabledComponents(true);
							if (IS_OPENID_MODE) {
								// 詳細ウィンドウを閉じる
								Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
							} else {
								// 全グリッドをリロード
								MyPanel.reloadAllGrid();
								// 詳細ウィンドウを閉じる
								Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
							}
						}
					});
				}
			});
		},

		/**
		 * createCommentPanel
		 *
		 * コメントパネル
		 */
		createCommentPanel: function(aDocId)
		{
			return new Ext.Panel({
				id: 'comment_panel_' + aDocId,
				hidden: true,
				height: 60,
				layout: 'border',
				border: false,
				items: [
				new Ext.Panel({
						region: 'west',
						html: '<div style="font-family:arial, tahoma, verdana, helvetica;font-size:12px;margin:5px;">' + MyLang.getMsg('COMMENT') + '</div>',
						width: 150
					}),
					new Ext.form.TextArea({
						region: 'center',
						//id: 'doc_comment',
						id: 'doc_comment_' + aDocId
						//maxLength: 100,
						//maxLengthText: MyLang.getMsg('EXP_COMMENT')
					})
				]
			});
		},

		/**
		 * createFileListHtml
		 *
		 * @param {Array} aFileList
		 */
		createFileListHtml: function(aFileList)
		{
			var vHtml = '';
			Ext.each(aFileList, function(){
				var row = this;
				vHtml += '<span class="download_file_link link_cmd2" file_id="' + row.file_id + '">';
				vHtml += row.file_name;
				vHtml += '</span>';
				vHtml += '<br />';
			});
			return vHtml;
		},

		/**
		 * toDocLink
		 *
		 * 申請書詳細画面を表示するリンクを作る
		 *
		 * @param {string} aDocTitle
		 * @param {string} aDocId
		 * @return {string} html
		 */
		toDocLink: function(aDocTitle, aDocId)
		{
			if (aDocTitle == null) {
				aDocTitle = '';
			}
			var vHtml = '';
			vHtml += '<span class="link_cmd2" dummy_for_sort="' + Sateraito.Util.escapeHtml(aDocTitle) + '" onclick="DocDetailWindow.showWindow(\'' + aDocId + '\')">';
			vHtml += Sateraito.Util.escapeHtml(aDocTitle);
			vHtml += '</span>';
			return vHtml;
		},

		/**
		 * toDraftDocLink
		 *
		 * 下書き申請書詳細画面を表示するリンクを作る
		 *
		 * @param {string} aDocTitle
		 * @param {string} aDocId
		 * @return {string} html
		 */
		toDraftDocLink: function(aDocTitle, aDocId)
		{
			if (aDocTitle == null) {
				aDocTitle = '';
			}
			var vHtml = '';
			vHtml += '<span class="link_cmd2" dummy_for_sort="' + Sateraito.Util.escapeHtml(aDocTitle) + '" onclick="NewDocWindow.showDraftDocWindow(\'' + aDocId + '\')">';
			vHtml += Sateraito.Util.escapeHtml(aDocTitle);
			vHtml += '</span>';
			return vHtml;
		},

		/**
		 * isApproverCommentDictExists
		 *
		 * @param {string} aDocId
		 */
		isApproverCommentDictExists: function(aDocId)
		{
			var elementLength = $('#template_body_' + aDocId).find('div.approver_comment_form').find('textarea[name=approver_comment_detail]').size();
			if (elementLength > 0) {
				return true;
			}
			return false;
		},

		/**
		 * renderApproverCommentDict
		 *
		 * ドキュメント内コメントリスト領域を描画
		 *
		 * @param {string} aDocId
		 * @param {number} aCurrentProcessNumber
		 * @param {boolean} aAllowInput .. 入力OKモードかどうか
		 */
		renderApproverCommentDict: function(aDocId, aCurrentProcessNumber, aAllowInput)
		{
			$('#template_body_' + aDocId).find('div.approver_comment_list').each(function(){
				var processNumber = $(this).attr('process_number');
				// 現在の承認者番号（aCurrentProcessNumber）によらず、表示はさせるように変更。制御するのは入力できるかどうかの部分
				//if (typeof(processNumber) == 'undefined' || processNumber == null || processNumber == '' || aCurrentProcessNumber != processNumber) {
				if (typeof(processNumber) == 'undefined' || processNumber == null || processNumber == '') {
					// no option
					// プロセス番号が指定されていない場合、表示しない
				} else {
					DocDetailWindow._renderApproverCommentDict(aDocId, aCurrentProcessNumber, processNumber, this, aAllowInput);
				}
			});
		},

		/**
		 * _renderApproverCommentDict
		 *
		 * @param {string} aDocId
		 * @param {string} aCurrentProcessNumber
		 * @param {string} aProcessNumber
		 * @param {dom} aCommentListElement
		 * @param {boolean} aAllowInput ... 入力を許可するかどうか
		 */
		_renderApproverCommentDict: function(aDocId, aCurrentProcessNumber, aProcessNumber, aCommentListElement, aAllowInput)
		{
			ApproverCommentDict.requestApproverCommentDict(aDocId, aProcessNumber, function(aApproverCommentDict){

				var viewerEmail = LoginMgr.getViewerEmail();

				var vHtml = '';
				vHtml += '<table class="approver_comment_list" style="width:100%">';
				vHtml += '<tr>';
				vHtml += '<th style="width:10%">' + MyLang.getMsg('FLD_APPROVER_COMMENT_NAME') + '</th>';	// 氏名
				vHtml += '<th style="width:90%">' + MyLang.getMsg('FLD_APPROVER_COMMENT_OPINION') + '</th>';	// 意見
				vHtml += '</tr>';
				Ext.iterate(aApproverCommentDict, function(key, value){
					var approverEmail = key;
					var approverCommentDetail = value;

					vHtml += '<tr>';

					// 氏名
					vHtml += '<td nowrap>';
					//vHtml += '<span title="' + approverEmail + '">';
					//vHtml += WorkflowUser.getUserName(approverEmail);
					vHtml += '<span title="' + Sateraito.Util.escapeHtml(approverEmail) + '">';
					vHtml += Sateraito.Util.escapeHtml(WorkflowUser.getUserName(approverEmail));
					vHtml += '</span>';
					vHtml += '</td>';

					// 意見欄
					vHtml += '<td>';
					if (approverEmail == viewerEmail && aAllowInput && aCurrentProcessNumber == aProcessNumber) {
						// 入力OKモードで、本人が開いている場合
						vHtml += '<div class="approver_comment_form">';
						vHtml += '<textarea name="approver_comment_detail" process_number="' + aProcessNumber + '" rows="4" style="width:100%">';
						if (typeof(approverCommentDetail) != 'undefined') {
							var escapedCommentDetail = Sateraito.Util.escapeHtml(approverCommentDetail);
							vHtml += escapedCommentDetail;
						}
						vHtml += '</textarea>';
//						vHtml += '<input type="button" class="approver_comment_button" doc_id="' + aDocId + '" value="保存">';
						vHtml += '</div>';
					} else {
						if (typeof(approverCommentDetail) != 'undefined') {
							var escapedCommentDetail = Sateraito.Util.escapeHtml(approverCommentDetail);
							vHtml += Sateraito.Util.enterToBr(escapedCommentDetail);
						}
					}
					vHtml += '</td>';
					vHtml += '</tr>';
				});
				vHtml += '</table>';

				$(aCommentListElement).html(vHtml);
			});
		},

		/**
		 * renderQandA
		 *
		 * Q&A領域を描画
		 *
		 * @param {string} aDocId
		 * @param {string} aDocDetail
		 * @param {string} aCurrentApproveNo
		 */
		renderQandA: function(aDocId, aDocDetail, aCurrentApproveNo)
		{
			var aAuthorEmail = aDocDetail.author_email;
			$('#template_body_' + aDocId).find('div.q_and_a').each(function(){
				// Q&A名称
				var QandAName = $(this).attr('name');
				if (QandAName == null) {
					QandAName = 'default';
				}
				var wordForQuestion = $(this).attr('word_for_question');
				if (typeof(wordForQuestion) == 'undefined') {
					wordForQuestion = '';
				}
				if (wordForQuestion == null) {
					wordForQuestion = '';
				}
				var IsStopAutoApproveWithoutAnswerAttr = $(this).attr('is_stop_auto_approve_without_answer');
				var IsStopAutoApproveWithoutAnswer;
				if (typeof(IsStopAutoApproveWithoutAnswerAttr) == 'undefined') {
					IsStopAutoApproveWithoutAnswer = false;
				} else {
					IsStopAutoApproveWithoutAnswer = true;
				}
				var ExpandRateApproveExpireDate = parseInt($(this).attr('expand_rate_approve_expire_date'), 0);

				//
				// 質問ができるプロセス番号
				//
				// プロセス2と3のときだけ質問できる場合、<div class="q_and_a" enable_only_process_number="2 3">と書く
				//
				var enableOnlyProcessNumberRaw = $(this).attr('enable_only_process_number');
				var enableOnlyProcessNumber = [];
				if (typeof(enableOnlyProcessNumberRaw) == 'undefined' || enableOnlyProcessNumberRaw == null || enableOnlyProcessNumberRaw == '') {
					// no option
				} else {
					enableOnlyProcessNumber = enableOnlyProcessNumberRaw.split(' ');
				}
				// 質問投稿ができるかどうか
				var okToPost = true;
				if (enableOnlyProcessNumber.length > 0) {
					okToPost = false;
					Ext.each(enableOnlyProcessNumber, function(){
						var processNumber = this;
						if (!isNaN(processNumber)) {
							if (aCurrentApproveNo == parseInt(processNumber, 10)) {
								okToPost = true;
								return false;
							}
						}
					});
				}
				// 最大質問回数
				var maxPostQuestionRaw = $(this).attr('max_post_question');
				var maxPostQuestion = 0;
				if (typeof(maxPostQuestionRaw) == 'undefined' || maxPostQuestionRaw == null || maxPostQuestionRaw == '') {
					// no option
				} else {
					if (!isNaN(maxPostQuestionRaw)) {
						maxPostQuestion = parseInt(maxPostQuestionRaw, 10);
					}
				}

				// 決裁、否決後も質問、回答ボックスを表示するオプション 2014.05.29
				var IsEnableWithFinalApprovedOrRejectedAttr = $(this).attr('is_enable_with_final_approved_or_rejected');
				var IsEnableWithFinalApprovedOrRejected;
				if (typeof(IsEnableWithFinalApprovedOrRejectedAttr) == 'undefined') {
					IsEnableWithFinalApprovedOrRejected = false;
				} else {
					IsEnableWithFinalApprovedOrRejected = true;
				}

				DocDetailWindow._renderQandA(aDocId, aDocDetail, QandAName, this, wordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, okToPost, maxPostQuestion, IsEnableWithFinalApprovedOrRejected);
			});
		},

		/**
		 * _renderQandA
		 *
		 * @param {string} aDocId
		 * @param {string} aDocDetail
		 * @param {string} aQandAName
		 * @param {dom} aQandADom
		 * @param {string} aWordForQuestion
		 * @param {string} IsStopAutoApproveWithoutAnswer
		 * @param {string} ExpandRateApproveExpireDate
		 * @param {bool} aOkToPost
		 * @param {number} aMaxPostQuestion .. 最大質問回数、無制限の場合0
		 * @param {string} IsEnableWithFinalApprovedOrRejected…決裁、否決後も質問、回答欄を表示するオプション
		 */
		_renderQandA: function(aDocId, aDocDetail, aQandAName, aQandADom, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, aOkToPost, aMaxPostQuestion, IsEnableWithFinalApprovedOrRejected)
		{
			var aAuthorEmail = aDocDetail.author_email;
			var aGhostWriterEmail = aDocDetail.ghost_writer;
			var viewerEmail = LoginMgr.getViewerEmail();

			if (typeof(aWordForQuestion) == 'undefined') {
				aWordForQuestion = MyLang.getMsg('QUESTION');
			}
			if (aWordForQuestion == '') {
				aWordForQuestion = MyLang.getMsg('QUESTION');
			}

			if (typeof(aOkToPost) == 'undefined') {
				aOkToPost = true;
			}

			QandA.requestQandAList(aDocId, aQandAName, function(aQandAList){

				var authorMode = false;
				// 代理申請者も回答できるように対応
				//if (LoginMgr.getViewerEmail() == aAuthorEmail) {
				if (viewerEmail == aAuthorEmail || (aGhostWriterEmail != '' && viewerEmail == aGhostWriterEmail)) {
					authorMode = true;
				}
				var myQuestionCnt = 0;
				var vHtml = '';
				vHtml += '<table class="q_and_a" style="width:100%">';
				vHtml += '<tr>';
				vHtml += '<th style="width:10%">' + MyLang.getMsg('FLD_QA_NAME') + '</th>';
				vHtml += '<th style="width:40%">' + aWordForQuestion + '</th>';
				vHtml += '<th style="width:40%">' + MyLang.getMsg('FLD_QA_ANSWER') + '</th>';
				vHtml += '</tr>';
				Ext.each(aQandAList, function(){
					var entry = this;

					if (entry.question_email == LoginMgr.getViewerEmail()) {
						myQuestionCnt++;
					}

					vHtml += '<tr>';

					// 氏名
					vHtml += '<td nowrap>';
					//vHtml += '<span title="' + entry.question_email + '">';
					//vHtml += WorkflowUser.getUserName(entry.question_email);
					vHtml += '<span title="' + Sateraito.Util.escapeHtml(entry.question_email) + '">';
					vHtml += Sateraito.Util.escapeHtml(WorkflowUser.getUserName(entry.question_email));
					vHtml += '</span>';
					vHtml += '</td>';

					// 質問欄
					vHtml += '<td>';
					var escapedQuestionDetail = '';
					if (typeof(entry.question_detail) != 'undefined') {
						escapedQuestionDetail = Sateraito.Util.escapeHtml(entry.question_detail);
					}
					vHtml += Sateraito.Util.enterToBr(escapedQuestionDetail);
					vHtml += '</td>';

					// 回答欄
					vHtml += '<td>';
					var escapedAnswerDetail = '';
					if (typeof(entry.answer_detail) != 'undefined') {
						escapedAnswerDetail = Sateraito.Util.escapeHtml(entry.answer_detail);
					}
					// 決裁後も質問、回答を有効にするオプション対応
					//if (authorMode && !IS_PRINT_WINDOW && (aDocDetail.status != 'final_approved' && aDocDetail.status != 'rejected')) {
					if (authorMode && !IS_PRINT_WINDOW && (IsEnableWithFinalApprovedOrRejected || (aDocDetail.status != 'final_approved' && aDocDetail.status != 'rejected'))) {
						if (escapedAnswerDetail.trim() == '') {
							// 回答未入力の場合、入力ボックスを表示
							vHtml += '<div class="answer_form">';
							vHtml += '<textarea name="answer_detail" rows="4" style="width:100%">';
							vHtml += '</textarea>';
							vHtml += '<input type="button" class="answer_button" doc_id="' + aDocId + '" q_and_a_name="' + aQandAName + '" question_no="' + entry.question_no + '" is_stop_auto_approve_without_answer="' + IsStopAutoApproveWithoutAnswer + '" expand_rate_approve_expire_date="' + ExpandRateApproveExpireDate + '" value="回答送信">';
							vHtml += '</div>';
						} else {
							vHtml += Sateraito.Util.enterToBr(escapedAnswerDetail);
						}
					} else {
						vHtml += Sateraito.Util.enterToBr(escapedAnswerDetail);
					}
					vHtml += '</td>';

					vHtml += '</tr>';
				});
				// 質問欄
				// 質問欄も決裁済の場合は表示しないように変更＆決裁後も質問、回答を有効にするオプション対応 2014.05.29
				//if (!authorMode && aOkToPost && !IS_PRINT_WINDOW) {
				if (!authorMode && aOkToPost && !IS_PRINT_WINDOW && (IsEnableWithFinalApprovedOrRejected || (aDocDetail.status != 'final_approved' && aDocDetail.status != 'rejected'))) {
					if (aMaxPostQuestion == 0 || (myQuestionCnt < aMaxPostQuestion)) {
						vHtml += '<tr>';
						vHtml += '<td>' + UserSetting.getUserName() + '</td>';
						vHtml += '<td>';
						vHtml += '<div class="question_form">';
						vHtml += '<textarea name="question_detail" rows="4" style="width:100%"></textarea>';
						vHtml += '<input type="button" class="question_button" doc_id="' + aDocId + '" q_and_a_name="' + aQandAName + '" is_stop_auto_approve_without_answer="' + IsStopAutoApproveWithoutAnswer + '" expand_rate_approve_expire_date="' + ExpandRateApproveExpireDate + '" value="' + aWordForQuestion + '送信">';
						vHtml += '</div>';
						vHtml += '</td>';
						vHtml += '<td></td>';
						vHtml += '</tr>';
					}
				}
				vHtml += '</table>';

				$(aQandADom).html(vHtml);

				//
				// 質問ボタンクリック時ハンドラ
				//
				$('#template_body_' + aDocId).find('input[type=button][q_and_a_name=' + aQandAName + '].question_button').click(function(){
					$(this).attr('disabled', 'disabled');
					var docId = $(this).attr('doc_id');
					var QandAName = $(this).attr('q_and_a_name');
					var questionDetail = $(this).parents('div.question_form').find('textarea[name=question_detail]').val();
					var IsStopAutoApproveWithoutAnswerAttr = $(this).attr('is_stop_auto_approve_without_answer');
					var IsStopAutoApproveWithoutAnswer;
					if (typeof(IsStopAutoApproveWithoutAnswerAttr) == 'undefined') {
						IsStopAutoApproveWithoutAnswer = false;
					} else {
						IsStopAutoApproveWithoutAnswer = true;
					}
					var ExpandRateApproveExpireDate = parseInt($(this).attr('expand_rate_approve_expire_date'), 0);

					// 必須チェック
					if(!questionDetail || questionDetail == '')
					{
						alert(MyLang.getMsg('VC_NOTINPUT_QUESTION') + ':' + aWordForQuestion);
						$(this).removeAttr('disabled');
						return;
					}
					QandA.postQuestion(docId, QandAName, questionDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, function(){
						DocDetailWindow._renderQandA(docId, aDocDetail, aQandAName, aQandADom, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, aOkToPost, aMaxPostQuestion, IsEnableWithFinalApprovedOrRejected);
					});
				});

				//
				// 回答ボタンクリック時ハンドラ
				//
				$('#template_body_' + aDocId).find('input[type=button][q_and_a_name=' + aQandAName + '].answer_button').click(function(){
					$(this).attr('disabled', 'disabled');
					var docId = $(this).attr('doc_id');
					var QandAName = $(this).attr('q_and_a_name');
					var questionNo = $(this).attr('question_no');
					var answerDetail = $(this).parents('div.answer_form').find('textarea[name=answer_detail]').val();
					var IsStopAutoApproveWithoutAnswerAttr = $(this).attr('is_stop_auto_approve_without_answer');
					var IsStopAutoApproveWithoutAnswer;
					if (typeof(IsStopAutoApproveWithoutAnswerAttr) == 'undefined') {
						IsStopAutoApproveWithoutAnswer = false;
					} else {
						IsStopAutoApproveWithoutAnswer = true;
					}
					var ExpandRateApproveExpireDate = parseInt($(this).attr('expand_rate_approve_expire_date'), 0);

					// 必須チェック
					if(!answerDetail || answerDetail == '')
					{
						alert(MyLang.getMsg('VC_EMPTY_QA_ANSWER'));
						$(this).removeAttr('disabled');
						return;
					}
					QandA.postAnswer(docId, QandAName, questionNo, answerDetail, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, function(){
						DocDetailWindow._renderQandA(docId, aDocDetail, aQandAName, aQandADom, aWordForQuestion, IsStopAutoApproveWithoutAnswer, ExpandRateApproveExpireDate, aOkToPost, aMaxPostQuestion, IsEnableWithFinalApprovedOrRejected);
					});
				});

			});
		},

		/**
		 * renderCommentList
		 *
		 * コメント・履歴欄・決裁ルート内のステータス表記を表示
		 *
		 * @param {string} aDocId
		 */
		renderCommentList: function(aDocId)
		{
			// コメント一覧を取得
			WorkflowDoc.requestCommentList(aDocId, function(aCommentList){

				//// １．コメント表示
				// 最近のコメントから古いコメントへループ
				Ext.each(aCommentList, function(){

					// コメントを表示
					var commentEntry = this;
					var shortStatusName = WorkflowDoc.getShortStatusName(commentEntry.status, commentEntry.approve_type, commentEntry.is_auto_approve, commentEntry.deputy_approver);
					var vHtml = '';
					vHtml += '<div style="margin:5px;">';
					vHtml += commentEntry.created_date;
					if (commentEntry.ghost_writer != '') {
						// 代理申請の場合
						vHtml += '<span title="' + Sateraito.Util.escapeHtml(commentEntry.ghost_writer) + '">' + Sateraito.Util.escapeHtml(commentEntry.ghost_writer_name) + '</span>';
						vHtml += '(<span title="' + Sateraito.Util.escapeHtml(commentEntry.user_email) + '">' + Sateraito.Util.escapeHtml(commentEntry.user_name) + '</span>' + MyLang.getMsg('OF_GHOST_WRITE2') + ')';
					}else if (commentEntry.deputy_approver != '') {
						// 代理承認の場合
						vHtml += ' <span title="' + Sateraito.Util.escapeHtml(commentEntry.user_email) + '">' + Sateraito.Util.escapeHtml(commentEntry.user_name) + '</span>';
						//vHtml += '(' + shortStatusName + ')';
						vHtml += '(<span title="' + Sateraito.Util.escapeHtml(commentEntry.deputy_approver) + '">' + Sateraito.Util.escapeHtml(commentEntry.deputy_approver_name) + '</span>' + MyLang.getMsg('OF') + shortStatusName + ')';
					} else {
						// 通常申請
						vHtml += ' <span title="' + Sateraito.Util.escapeHtml(commentEntry.user_email) + '">' + Sateraito.Util.escapeHtml(commentEntry.user_name) + '</span>';
						vHtml += '(' + shortStatusName + ')';
					}
					vHtml += '<p>' + Sateraito.Util.enterToBr(Sateraito.Util.escapeHtml(commentEntry.comment)) + '</p>';
					vHtml += '</div>';
					$('#comment_area_' + aDocId).append(vHtml);

					// 決裁ルートのステータス表記（例：（承認済） など）もここで行うように変更（ルート単位ではなくステータスや承認日など承認者ごとの情報を反映したいため）
					// 対象のspanエリアを取得
					if(!commentEntry.is_remanded){		// ※差し戻しされた承認者情報は使わない
						var area_approver_status = $('#template_body_' + aDocId).find('span.approver_status[email="' + Sateraito.Util.jQEscape(commentEntry.user_email) + '"][process_number="' + Sateraito.Util.jQEscape(commentEntry.approve_number) + '"]');
						if(typeof(area_approver_status) != 'undefined'){
							var statusName = WorkflowDoc.getStatusName(commentEntry.status, commentEntry.approve_type, commentEntry.is_auto_approve, commentEntry.deputy_approver);
							var createdDateSplited = commentEntry.created_date.split(' ');
							// この決裁レベルが否決済みである場合、否決者の後ろに（否決済）と表示
							if (commentEntry.status == WorkflowDoc.STATUS_REJECTED) {
								$(area_approver_status).text('（' + createdDateSplited[0] + ' ' + statusName + '）');
								$(area_approver_status).css('color', 'blue');
								$(area_approver_status).css('font-weight', 'bold');
								$(area_approver_status).attr('rendered', '1');
							// この決裁レベルが承認済みである場合、承認者名の後ろに（承認済）と表示
							} else if (commentEntry.status == WorkflowDoc.STATUS_PASSED) {
								$(area_approver_status).text('（' + createdDateSplited[0] + ' ' + statusName + '）');
								$(area_approver_status).css('color', 'green');
								$(area_approver_status).css('font-weight', 'bold');
								$(area_approver_status).attr('rendered', '1');
							// この決裁レベルが決裁済みである場合、承認者名の後ろに（決裁済）と表示
							} else if (commentEntry.status == WorkflowDoc.STATUS_FINAL_APPROVED) {
								$(area_approver_status).text('（' + createdDateSplited[0] + ' ' + statusName + '）');
								$(area_approver_status).css('color', 'red');
								$(area_approver_status).css('font-weight', 'bold');
								$(area_approver_status).attr('rendered', '1');
							}

							// 被代理承認者の部分にもなんかセット
							if(typeof(commentEntry.deputy_approver) != 'undefined' && commentEntry.deputy_approver != ''){
								var area_deputy_approver_status = $('#template_body_' + aDocId).find('span.approver_status[email="' + Sateraito.Util.jQEscape(commentEntry.deputy_approver) + '"][process_number="' + Sateraito.Util.jQEscape(commentEntry.approve_number) + '"]');
								if(typeof(area_deputy_approver_status) != 'undefined'){
									$(area_deputy_approver_status).text('（' + createdDateSplited[0] + ' ' + MyLang.getMsg('PASSIVE') + statusName + '）');
									$(area_deputy_approver_status).css('color', 'brown');
									$(area_deputy_approver_status).css('font-weight', 'bold');
									$(area_deputy_approver_status).attr('rendered', '1');
								}
							}
						}
					}
				});

				$('#template_body_' + aDocId).find('span.approver_status[rendered="0"][in_process="1"]').each(function(){
					// 現在実行中の承認番号なら（申請中）等と表示
					var area_approver_status = this;
					$(area_approver_status).text('（' + WorkflowDoc.getStatusName(WorkflowDoc.STATUS_IN_PROCESS, $(area_approver_status).attr('approve_type'), false) + '）');
					$(area_approver_status).css('font-weight', 'bold');
					$(area_approver_status).attr('rendered', '1');
				});

				//// ２．ハンコ表示

				// ハンコ表示欄のフラグを初期化
				$('canvas').each(function(){
					$(this).attr('rendered', '0');
				});
				var reversedCommentList = aCommentList.reverse();
				// 古いコメントから最近のコメントへループ
				Ext.each(aCommentList, function(){

					var commentEntry = this;
					var statusName = WorkflowDoc.getShortStatusName(commentEntry.status, commentEntry.approve_type, commentEntry.is_auto_approve, commentEntry.deputy_approver);

					// 「更新」はハンコを表示しないように対応
					if(commentEntry.status == WorkflowDoc.COMMENT_STATUS_UPDATED){

					} else if (commentEntry.status == WorkflowDoc.STATUS_SUBMITTED) {
						// ハンコを表示（申請）
						$('#template_body_' + aDocId).find('canvas[process=' + WorkflowDoc.STATUS_SUBMITTED + '][rendered=0]').each(function(){
							var canvas = this;
							var radius = 35;
							var createdDateSplited = commentEntry.created_date.split(' ');
							Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
							$(this).attr('rendered', '1');
							return false;  // eachループを抜ける
						});
						// ハンコを表示（申請）…auto canvas
						$('#template_body_' + aDocId).find('canvas[process=auto][rendered=0]').each(function(){
							var canvas = this;
							var radius = 35;
							var createdDateSplited = commentEntry.created_date.split(' ');
							Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
							$(this).attr('rendered', '1');
							return false;  // eachループを抜ける
						});
					} else if (commentEntry.status == WorkflowDoc.COMMENT_STATUS_RESUBMITTED) {
						// ハンコを表示（再申請）
						$('#template_body_' + aDocId).find('canvas[process=' + WorkflowDoc.STATUS_SUBMITTED + '][rendered=0]').each(function(){
							var canvas = this;
							var radius = 35;
							var createdDateSplited = commentEntry.created_date.split(' ');
							Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
							$(this).attr('rendered', '1');
							return false;  // eachループを抜ける
						});
						// ハンコを表示（再申請）…auto canvas ※再申請は該当processがないので取り急ぎautoの場合だけ表示
						$('#template_body_' + aDocId).find('canvas[process=auto][rendered=0]').each(function(){
							var canvas = this;
							var radius = 35;
							var createdDateSplited = commentEntry.created_date.split(' ');
							Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
							$(this).attr('rendered', '1');
							return false;  // eachループを抜ける
						});
					} else {
						// ハンコを表示（承認・否決・差し戻し）
						var hankoRendered = false;
						$('#template_body_' + aDocId).find('canvas[process_number=' + commentEntry.approve_number + '][rendered=0]').each(function(){
							var canvas = this;
							var radius = 35;
							var createdDateSplited = commentEntry.created_date.split(' ');
							Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
							$(this).attr('rendered', '1');
							hankoRendered = true;
							return false; // eachループを抜ける
						});
						// ハンコを表示（承認・否決・差し戻し）…auto canvas
						var hankoRenderedAuto = false;
						$('#template_body_' + aDocId).find('canvas[process=auto][rendered=0]').each(function(){
							var canvas = this;
							var radius = 35;
							var createdDateSplited = commentEntry.created_date.split(' ');
							Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
							$(this).attr('rendered', '1');
							hankoRenderedAuto = true;
							return false; // eachループを抜ける
						});

						// ハンコを表示しなかった
						if (!hankoRendered) {
							if ($('#template_body_' + aDocId).find('canvas[process_number=' + commentEntry.approve_number + '][rendered=1]').size() > 0) {
								// 描画済みのハンコがあって、ハンコが表示できなかった場合
								// 最後の描画エリアを複製し、ハンコを表示
								var lastRenderedHankoElement = $('#template_body_' + aDocId).find('canvas[process_number=' + commentEntry.approve_number + '][rendered=1]:last');
								var style = $(lastRenderedHankoElement).attr('style');
								var width = $(lastRenderedHankoElement).attr('width');
								var height = $(lastRenderedHankoElement).attr('height');
								$(lastRenderedHankoElement).after('<canvas process_number="' + commentEntry.approve_number + '" width="' + width + '" height="' + height + '" style="' + style + '" rendered="0">');
								var canvas = $('#template_body_' + aDocId).find('canvas[process_number=' + commentEntry.approve_number + '][rendered=0]')[0];
								// ハンコ表示欄を初期化
								if (typeof(uu) != 'undefined' && typeof(uu.canvas) != 'undefined')
								{
									$(canvas).addClass('vml');
									uu.canvas.init();
								}
								var radius = 35;
								var createdDateSplited = commentEntry.created_date.split(' ');
								Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
								// this だとコピー元のcanvasなので修正 2012/10/19
								//$(this).attr('rendered', '1');
								$(canvas).attr('rendered', '1');
							}
						}
/*
						if (!hankoRenderedAuto) {
							if ($('#template_body_' + aDocId).find('canvas[process=auto][rendered=1]').size() > 0) {
								// 描画済みのハンコがあって、ハンコが表示できなかった場合
								// 最後の描画エリアを複製し、ハンコを表示
								var lastRenderedHankoElement = $('#template_body_' + aDocId).find('canvas[process=auto][rendered=1]:last');
								var style = $(lastRenderedHankoElement).attr('style');
								var width = $(lastRenderedHankoElement).attr('width');
								var height = $(lastRenderedHankoElement).attr('height');
								$(lastRenderedHankoElement).after('<canvas process="auto" width="' + width + '" height="' + height + '" style="' + style + '" rendered="0">');
								var canvas = $('#template_body_' + aDocId).find('canvas[process=auto][rendered=0]')[0];
								// ハンコ表示欄を初期化
								if (typeof(uu) != 'undefined' && typeof(uu.canvas) != 'undefined')
								{
									$(canvas).addClass('vml');
									uu.canvas.init();
								}

								var radius = 35;
								var createdDateSplited = commentEntry.created_date.split(' ');
								Hanko.renderHanko(radius, canvas, statusName, createdDateSplited[0], commentEntry.user_name);
								$(canvas).attr('rendered', '1');
							}
						}
*/
					}

					// レンダリングタイミングの問題か、うまくいかないので、足りない場合は先に次のハンコのために枠だけ作っておく（とりあえずautoだけ）
					if ($('#template_body_' + aDocId).find('canvas[process=auto][rendered=0]').size() <= 0) {
						var lastRenderedHankoElement = $('#template_body_' + aDocId).find('canvas[process=auto][rendered=1]:last');
						var style = $(lastRenderedHankoElement).attr('style');
						var width = $(lastRenderedHankoElement).attr('width');
						var height = $(lastRenderedHankoElement).attr('height');
						$(lastRenderedHankoElement).after('<canvas process="auto" width="' + width + '" height="' + height + '" style="' + style + '" rendered="0">');
						var canvas = $('#template_body_' + aDocId).find('canvas[process=auto][rendered=0]')[0];
						// ハンコ表示欄を初期化
						if (typeof(uu) != 'undefined' && typeof(uu.canvas) != 'undefined')
						{
							$(canvas).addClass('vml');
							uu.canvas.init();
						}
						Hanko.renderWaku(canvas);
					}

				});

				// レンダリングされていない、auto版の枠を削除
				$('#template_body_' + aDocId).find('canvas[process=auto][rendered=0]').hide();

				// レンダリングされていない枠の大きさを整備
				$('#template_body_' + aDocId).find('canvas[rendered=0]').each(function(){
					var canvas = this;
					Hanko.renderWaku(canvas);
					//$(this).attr('rendered', '1');
				});

				if (IS_OPENID_MODE) {
					// 印刷ウィンドウを開く表示の場合、大きさ調整
					var cmp_detail_window = Ext.ComponentMgr.get('doc_detail_window_' + aDocId);
					if(typeof(cmp_detail_window) != 'undefined'){
						var innerWindowHeight = $('#template_body_' + aDocId).height();
						var calibration = 120;
						cmp_detail_window.setHeight(innerWindowHeight + calibration);
					}
				}
			});
		},

		/**
		 * renderAttachmentFileList
		 *
		 * 添付ファイル領域を描画
		 *
		 * @param {string} aDocId
		 * @param {string} okToAttachFile
		 */
		renderAttachmentFileList: function(aDocId, okToAttachFile)
		{
			//
			// step6.  添付ファイルを表示
			//
			var is_ok_to_attachfile;
			if(IS_PRINT_WINDOW){
				is_ok_to_attachfile = '0';
			}else{
				is_ok_to_attachfile = okToAttachFile ? '1' : '0';
			}

			// サブドメインがうまくいかないので全てFalseで 2014.06.19
/*
			if (IS_OPENID_MODE) {
				// 高さ変更 60px ⇒ 120px 2013.06.05
				//$('#attached_file_render_area_detail_' + aDocId).html('<iframe style="width:100%;height:60px;" src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/attachfilelist?doc_id=' + aDocId + '&is_editable=' + is_ok_to_attachfile + '&hl=' + SATERAITO_LANG + '">');
				$('#attached_file_render_area_detail_' + aDocId).html('<iframe style="width:100%;height:120px;border:solid 1px;border-color:#b5b8c8;" src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/oid/attachfilelist?doc_id=' + encodeURIComponent(aDocId) + '&is_editable=' + is_ok_to_attachfile + '&hl=' + SATERAITO_LANG + '">');
			} else {
*/
				WorkflowUser.requestToken(function(aJsonData){
					var token = aJsonData.token;
					// 高さ変更 60px ⇒ 120px 2013.06.05
					//$('#attached_file_render_area_detail_' + aDocId).html('<iframe style="width:100%;height:60px;" src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attachfilelist?token=' + token + '&doc_id=' + aDocId + '&is_editable=' + is_ok_to_attachfile + '&hl=' + SATERAITO_LANG + '">');
					$('#attached_file_render_area_detail_' + aDocId).html('<iframe style="width:100%;height:120px;border:solid 1px;border-color:#b5b8c8;" src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/attachfilelist?token=' + encodeURIComponent(token) + '&doc_id=' + aDocId + '&is_editable=' + is_ok_to_attachfile + '&hl=' + SATERAITO_LANG + '">');

				});
/*
			}
*/
		},


		/**
		 * renderClassChecklistWithComment
		 *
		 * コメント欄機能を描画
		 *
		 * @param {string} aDocId
		 * @param {Object} aDocDetail
		 */
		renderClassChecklistWithCommentPublish: function(aDocId, aDocDetail, aTemplate)
		{
			// @_@ edited: tan@vn.sateraito.co.jp
      var enableDocComment = false;
      if(aTemplate.enable_doc_comment == true){
         enableDocComment = true;
      }

      // check published
			if (enableDocComment == true) {
				// 表示
				DocCommentPublic.renderPublicCommentArea(aDocDetail.doc_id);

				$('#comment_tree_title_table_' + aDocId).show();
			} else {
				// 非表示
				$('#comment_tree_title_table_' + aDocId).hide();
			}

		},


		/**
		 * showInputFields
		 */
		showInputFields: function(aOkToUpdateField, aDocId, inReSubmitProcess, inAdminEditProcess)
		{
			var basicForm = Ext.ComponentMgr.get('form_panel_' + aDocId).getForm();

			Ext.each(aOkToUpdateField, function(){

				// 更新可能フィールドを表示する

				var fieldName = '' + this;

				var element = $('#template_body_' + aDocId).find(':input[name=' + fieldName + ']');
				var elementName = $(element).attr('name');
				if (typeof(elementName) == 'undefined') {
					elementName = '';
				}

				// 未定義はtextにする
				var elementType = $(element).attr('type');
				if (typeof(elementType) == 'undefined') {
					elementType = 'text';
				}
				elementType = elementType.toLowerCase();

				// コンボボックスの場合
				if ($(element).is('select')) {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// ボックスを表示
					$(element).show();
					if(!inReSubmitProcess && !inAdminEditProcess){
						$(element).removeAttr('disabled');
					}
				}
				// テキストエリアの場合
				else if ($(element).is('textarea')) {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストエリアを表示
					$(element).show();
/*
					// スクロールが必須だとどうしても表示用のtextareaとの横幅の整合性が合わないのでここにもautosizeをセットする
					$(element).show(0, function(){
						$(element).autosize();
					});
*/
					if(!inReSubmitProcess && !inAdminEditProcess){
						$(element).removeAttr('disabled');
					}
				}
				// チェックボックスの場合
				else if (elementType == 'checkbox') {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// ボックスを表示
					$(element).show();
					if(!inReSubmitProcess && !inAdminEditProcess){
						$(element).removeAttr('disabled');
					}
				}
				// ラジオボックスの場合
				else if (elementType == 'radio') {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// ボックスを表示
					$(element).show();
					if(!inReSubmitProcess && !inAdminEditProcess){
						$(element).removeAttr('disabled');
					}
				}
				// テキストボックスの場合
				else if ($(element).is('input') && elementType == 'text') {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストボックスを表示
					$(element).show();
					if(!inReSubmitProcess && !inAdminEditProcess){
						$(element).removeAttr('disabled');
					}

					// 数値クラスの場合
					if ($(element).hasClass('number')) {
						//FieldConvert._numberFieldConvert('template_body_' + aDocId, basicForm, element);
						// いったん親divのなかにdisplay:noneがないかチェックし、あればshow
						var hiddenDivElements = $(element).parents('div:hidden');
						//var hiddenDivElements = $(element).parents(':hidden');
						$(hiddenDivElements).show();
						// 日付入力コントロールにコンバート
						FieldConvert._numberFieldConvert('template_body_' + aDocId, basicForm, element);
						// もう一回隠す
						$(hiddenDivElements).hide();
					}

					// 日付クラスの場合
					if ($(element).hasClass('date')) {
						//FieldConvert._dateFieldConvert('template_body_' + aDocId, basicForm, element);
						// いったん親divのなかにdisplay:noneがないかチェックし、あればshow
						var hiddenDivElements = $(element).parents('div:hidden');
						//var hiddenDivElements = $(element).parents(':hidden');
						$(hiddenDivElements).show();
						// 日付入力コントロールにコンバート
						FieldConvert._dateFieldConvert('template_body_' + aDocId, basicForm, element);
						// もう一回隠す
						$(hiddenDivElements).hide();
					}
				}

				// HTML5で増えたインプットタイプに対応 2013/06/28
				else if ($(element).is('input') && $.inArray(elementType, ['date','datetime','datetime-local','month','week','time','number','range','search','tel','url','email','color']) >= 0) {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストボックスを表示
					$(element).show();
					if(!inReSubmitProcess && !inAdminEditProcess){
						$(element).removeAttr('disabled');
					}
				}

				else if (elementType == 'button') {
					// マスター選択ボタンの場合、表示する
					if ($(element).is('.sateraito_master_select')) {
						$(element).show();
					}
					// クリアーボタンの場合も、表示する
					if ($(element).is('.clear_button')) {
						$(element).show();
					}
				}
			});

			// 足し算・掛け算フィールドの変更ハンドラをセット
			$('#template_body_' + aDocId).find(':input').change(function(){
				Calc.calcAll('template_body_' + aDocId);
			});

			// クリアーボタンのイベントハンドラをセット
			FieldConvert.bindClearButtonEvent('template_body_' + aDocId);
		},

		/**
		 * renderDocApprover
		 *
		 * 承認候補者を取得して表示
		 * 承認状況に応じて、「承認」「回覧して閉じる」「更新」等のボタンも表示
		 *
		 * @param {string} aDocId
		 */
		renderDocApprover: function(aDocId, aDocDetail, aTemplate, page_type, renderprocess)
		{
			// 承認候補者を取得

			// 下書きならDocから承認者を取得
			var approverValues = null;
			if (aDocDetail.status == 'draft'){
				if(aDocDetail.approver_values == null || aDocDetail.approver_values == '') {
					// no option
				} else {
					approverValues = Ext.decode(aDocDetail.approver_values);
				}
			}

			var aApproverValues = approverValues;
			// 下書き申請書の場合
			if(aApproverValues != null){
				$('#template_body_' + aDocId).find('input[name=process]').each(function(){

					var element = this;
					var number = $(this).attr('number');

					// テキスト表示されてしまうので、非表示設定
					$(this).hide();

					Ext.each(aApproverValues, function(){
						var approverValue = this;
						if (number == '' + approverValue.number) {

							// ドラフト保存時に設定した承認者を発見

							var approverList = approverValue.value.split(',');

							// 画面に表示
							ApproverCandidate.addApprover(element, approverList, 'template_body_' + aDocId);
						}
					});
				});

				// 画面表示系の処理（IE8遅延対策）
				(renderprocess).defer(100);

				//
				// 添付ファイル領域を表示
				//
				if(!aTemplate.is_disable_attach_files){
					DocDetailWindow.renderAttachmentFileList(aDocId, false);
				}
				//
				// step7. 決済履歴・コメントを表示
				//
				DocDetailWindow.renderCommentList(aDocId);

				//
				// マスター参照ボタン処理
				//
				FieldConvert.bindMasterSelectButtonEvent('template_body_' + aDocId, aDocId);


				//
				// Googleカレンダー予定作成画面表示ボタン処理
				//
				FieldConvert.bindEventToGoogleCalendarButtonEvent('template_body_' + aDocId, aDocId);



			}else{

				// 管理者編集プロセスかどうか
				var inAdminEditProcess = false;
				if($('#template_body_' + aDocId).find('#in_admin_edit_process_' + aDocId).val() == '1'){
					inAdminEditProcess = true;
				}

				// 再申請プロセスかどうか
				var inReSubmitProcess = false;
				if($('#template_body_' + aDocId).find('#in_resubmit_process_' + aDocId).val() == '1'){
					inReSubmitProcess = true;
				}

				// 名前情報
				var name_info = {};
				if(typeof(aDocDetail.name_info) != 'undefined' && aDocDetail.name_info != '')
				{
					name_info = Ext.decode(aDocDetail.name_info);
				}

				DocDetailWindow.requestDocApprover(aDocId, function(aJsonData){

					// 承認者候補を取得後の処理

					var currentApproveNo = null;	// 現在実行中の承認番号
					var inApproveProcess = false;
					var inViewProcess = false;
					var okToUpdateDoc = false;
					var okToUpdateField = [];
					//var isExistOtherInputField = false;	// okToUpdate関連以外に入力ボックスがあるかどうか…更新ボタン制御などに使用 ⇒ やっぱり不要！！
					var meAllocatedProcessNumbers = [];  // 自分が参加している承認プロセス番号
					var isExistAlreadyApprovers = false;	// 一人でも回覧、承認済のユーザがいるかどうか（削除ボタン表示判定で使用）

					// 各プロセスループ
					Ext.each(aJsonData, function(item, index){

						var process = this;

						if(typeof(process.approvers) != 'undefined' && process.approvers.length > 0){
							isExistAlreadyApprovers = true;
						}

						// 各承認プロセスごとのdom領域に、承認者の一覧を描画する

						// 名前描画領域
						var dom = $('#template_body_' + aDocId).find('span.approver_name_list[name=process][number=' + process.approve_number + ']');
						// 名前を描画
						ApproverList.renderApproverList(dom, process.approver_candidates, process.approvers, process.status, process.approve_type, process.approve_number, name_info);
						// inputエレメントにvalueをセット
						var target_process_input = $('#template_body_' + aDocId).find('input[name=process][number=' + process.approve_number + ']');
						target_process_input.attr('value', Sateraito.Util.myImplode(process.approver_candidates));

						// 管理画面編集時、未来のプロセスの承認者は管理者が変更できるように対応2014.02.23
						if(inAdminEditProcess){
							if(typeof(process.status) == 'undefined' || process.status == null || process.status == '')
							{
								target_process_input.attr('ok_to_admin_edit', '1');
								dom.after('<input type="button" class="user_select_button" process_number="' + process.approve_number + '" value="' + MyLang.getMsg('ADD_APPROVER_BTN') + '" for_admin_edit >&nbsp;<input type="button" class="clear_approver_button" process_number="' + process.approve_number + '" value="' + MyLang.getMsg('CLEAR_APPROVER_BTN') + '" for_admin_edit >&nbsp;');
							}
						}

						// 自分は今プロセスのペンディング中かチェック
						if(!IS_ADMIN_CONSOLE){
							var viewerEmail = LoginMgr.getViewerEmail();
							var myProcessIn = DocDetailWindow.checkMyProcessIn(process, viewerEmail);
							if (myProcessIn.inApproveProcess) {
								currentApproveNo = process.approve_number;
								inApproveProcess = true;
							} else if (myProcessIn.inViewProcess) {
								currentApproveNo = process.approve_number;
								inViewProcess = true;
							}
							// 代理承認者についても、自分が今プロセスのペンディング中かチェック
							if (!process.no_agency) {
								if (UserSetting.userSetting.whose_deputy_approver_i_am && UserSetting.userSetting.whose_deputy_approver_i_am.length > 0) {
									Ext.each(UserSetting.userSetting.whose_deputy_approver_i_am, function(){
										var deputyEmail = '' + this;
										var myProcessIn = DocDetailWindow.checkMyProcessIn(process, deputyEmail);
										if (myProcessIn.inApproveProcess) {
											currentApproveNo = process.approve_number;
											inApproveProcess = true;
										} else if (myProcessIn.inViewProcess) {
											currentApproveNo = process.approve_number;
											inViewProcess = true;
										}
									});
								}
							}
							// 自分がドキュメントの修正可能かチェック
							if (process.approver_candidates.indexOf(viewerEmail) != -1) {

								// 自分はこのプロセスの候補者にいる

								// 自分所属プロセス番号を控える
								if (meAllocatedProcessNumbers.indexOf(process.approve_number) == -1) {
									meAllocatedProcessNumbers.push(process.approve_number);
								}

								if (process.ok_to_update.length > 0) {
									// このプロセスのok_to_updateに何か指定されている
									if(currentApproveNo == process.approve_number)
									{
										okToUpdateDoc = true;
										okToUpdateField = okToUpdateField.concat(process.ok_to_update);
									}
								}
							}
							// 代理承認者についても、ドキュメントの修正可能かチェック
							if (!process.no_agency) {
								if (UserSetting.userSetting.whose_deputy_approver_i_am && UserSetting.userSetting.whose_deputy_approver_i_am.length > 0) {
									Ext.each(UserSetting.userSetting.whose_deputy_approver_i_am, function(){
										var deputyEmail = '' + this;
										if (process.approver_candidates.indexOf(deputyEmail) != -1) {

											// 自分はこのプロセスの候補者にいる

											// 自分所属プロセス番号を控える
											if (meAllocatedProcessNumbers.indexOf(process.approve_number) == -1) {
												meAllocatedProcessNumbers.push(process.approve_number);
											}
											if (process.ok_to_update.length > 0) {
												// このプロセスのok_to_updateに何か指定されている
												if(currentApproveNo == process.approve_number)
												{
													okToUpdateDoc = true;
													okToUpdateField = okToUpdateField.concat(process.ok_to_update);
												}
											}
										}
									});
								}
							}
						}

					});


					var okToAttachFile = false;	// 現在の承認者が添付ファイルを編集（追加、削除）できるかどうか
					var isNoReject = false;						// 否決できないプロセスかどうか
					var isNoRemand = !aTemplate.allow_remand;						// 差し戻しできないプロセスかどうか

					// 各プロセスループ後
					// 管理者が編集するボタンで開いた場合
					// 申請者が差し戻し申請を開いた場合
					if(inAdminEditProcess || inReSubmitProcess){

						okToAttachFile = true;
						isNoReject = true;
						isNoRemand = true;
						okToUpdateDoc = true;
						okToUpdateField = [];
						// ※編集可能項目をセット
						var docValues = Ext.decode(aDocDetail.doc_values);
						Ext.iterate(docValues, function(key, value){
							if(key != 'doc_no'){
								okToUpdateField.push(key);
							}
						});

						$('#template_body_' + aDocId).find('input[name=process]').each(function(){
							var okToRemoveProcessNo = $(this).attr('ok_to_remove');
							var okToOpenNotificationProcessNo = $(this).attr('ok_to_open_notification');
							var okToAdminEdit = $(this).attr('ok_to_admin_edit');
							var removableProcessNo = $(this).attr('number');	// この番号の承認者を削除できる

							// 通知設定許可の場合
							if(!IS_PRINT_WINDOW && !inAdminEditProcess && typeof(okToOpenNotificationProcessNo) != 'undefined'){
								$('#template_body_' + aDocId).find('span.approver_name_list[number=' + removableProcessNo + ']').find('span.approver_name').each(function(){
									var email = $(this).attr('email');
									var vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_off.png" class="btn_open_notification" email="' + email + '" status="off" style="padding-left:2px;height:14px;cursor:pointer;" onclick="ApproverCandidate.toggleOpenNotificationButton(' + removableProcessNo + ', \'' + email + '\', \'template_body_' + aDocId + '\');" title="' + MyLang.getMsg('OPEN_NOTIFICATION_OFF') + '">';
									$(this).after(vHtml);
								});
							}

							// 承認者削除許可の場合
							if(!IS_PRINT_WINDOW && ((!inAdminEditProcess && typeof(okToRemoveProcessNo) != 'undefined') || (inAdminEditProcess && okToAdminEdit == '1'))){
								$('#template_body_' + aDocId).find('span.approver_name_list[number=' + removableProcessNo + ']').find('span.approver_name').each(function(){
									var email = $(this).attr('email');
									var vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/btn_delete.png" style="cursor:pointer;" onclick="ApproverCandidate.removeApprover(' + removableProcessNo + ', \'' + email + '\', \'template_body_' + aDocId + '\');">';
									$(this).after(vHtml);
								});
							}
						});
					}
					// 承認者、回覧者が開いた場合
					else if (currentApproveNo != null) {

						// 今自分がこのプロセスを承認中の場合
						$('#template_body_' + aDocId).find('input[name=process][number=' + currentApproveNo + ']').attr('current_approving', '1');

						// 承認者削除許可の場合
						if(!IS_PRINT_WINDOW){
							$('#template_body_' + aDocId).find('input[name=process]').each(function(){

								//
								// 承認者が削除できる場合その２
								//
								// 属性 ok_to_remove_process_number
								//
								// 例）<input name="process" number="2" ok_to_remove_process_number="1">
								//   --> 第一承認のときに、第二承認者を削除できる
								//
								var okToRemoveProcessNo = $(this).attr('ok_to_remove_process_number');	// このプロセス番号を実行中の場合、承認者を削除できる
								var removableProcessNo = $(this).attr('number');	// この番号の承認者を削除できる

								// 複数対応
								if(typeof(okToRemoveProcessNo) != 'undefined'){
									var okToRemoveProcessNos = okToRemoveProcessNo.split(' ');	// このプロセス番号を実行中の場合、承認者を削除できる
									Ext.each(okToRemoveProcessNos, function(){
										var checkApproveNo = this;
										if (checkApproveNo == currentApproveNo) {
											$('#template_body_' + aDocId).find('span.approver_name_list[number=' + removableProcessNo + ']').find('span.approver_name').each(function(){
												var email = $(this).attr('email');
												var vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/btn_delete.png" style="cursor:pointer;" onclick="ApproverCandidate.removeApprover(' + removableProcessNo + ', \'' + email + '\', \'template_body_' + aDocId + '\');">';
												$(this).after(vHtml);
											});
											return;
										}
									});
								}

							});
						}

						// 添付ファイルが追加、削除できるかどうかを取得
						var ok_to_attachfile = $('#template_body_' + aDocId).find('input[name=process][number=' + currentApproveNo + ']').attr('ok_to_attachfile');
						if (typeof(ok_to_attachfile) != 'undefined' && ok_to_attachfile != null) {
							okToAttachFile = true;
						}

						// 否決ができないステップかどうかのフラグを取得
						var no_reject = $('#template_body_' + aDocId).find('input[name=process][number=' + currentApproveNo + ']').attr('no_reject');
						if (typeof(no_reject) != 'undefined' && no_reject != null) {
							isNoReject = true;
						}

						// 差し戻しができないステップかどうかのフラグを取得
						var no_remand = $('#template_body_' + aDocId).find('input[name=process][number=' + currentApproveNo + ']').attr('no_remand');
						if (typeof(no_remand) != 'undefined' && no_remand != null) {
							isNoRemand = true;
						}

						// ok_to_updateの他に入力ボックスがないかをチェック（更新ボタン表示制御のため）
/* 意見欄などで更新ボタンが出るのはやっぱりまずいのでコメントアウト
						// 意見欄があれば
						$('#template_body_' + aDocId).find('div.approver_comment_list').each(function(){
							var processNumber = $(this).attr('process_number');
							if (typeof(processNumber) != 'undefined' && processNumber == currentApproveNo) {
								isExistOtherInputField = true;
								return;
							}
						});
*/
					}

					// 開封通知の表示制御
					if(!inAdminEditProcess){

						// この文書の開封通知設定情報
						var openNotifications = WorkflowDoc.openNotifications[aDocId];

						// 各承認プロセスを処理してアイコン表示
						$('#template_body_' + aDocId).find('input[name=process]').each(function(){

							var okToOpenNotificationProcessNo = $(this).attr('ok_to_open_notification_process_number');	// このプロセス番号を実行中の場合、開封通知ボタンを表示できる
							var processNo = $(this).attr('number');
							// 現在、開封通知をOn/Offできるプロセスかどうか
							var isOkToOpenNotificationProcessNo = false;
							if(typeof(okToOpenNotificationProcessNo) != 'undefined'){
								var okToOpenNotificationProcessNos = okToOpenNotificationProcessNo.split(' ');
								Ext.each(okToOpenNotificationProcessNos, function(){
									var checkApproveNo = this;
									if (checkApproveNo == currentApproveNo) {
										isOkToOpenNotificationProcessNo = true;
										return;
									}
								});
							}


							$('#template_body_' + aDocId).find('span.approver_name_list[number=' + processNo + ']').find('span.approver_name').each(function(){
								var email = $(this).attr('email');

								// このプロセスの開封状況情報を取得
								var result = WorkflowDoc.getOpenNotificationStatus(openNotifications, processNo, email);
								var is_on_open_notification = result[0];
								var open_status = result[1];

								// On/Offしてよい承認プロセスか、本プロセスの開封通知情報を持っていればアイコン表示
								if(!IS_PRINT_WINDOW && (isOkToOpenNotificationProcessNo || open_status != null)){
									var vHtml;
									// On/Offしてよい承認プロセスならリンク
									if(isOkToOpenNotificationProcessNo){
										// 既に開封済み
										if(open_status != null && open_status.status == 'opened'){
											vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_opened.png" class="btn_open_notification" email="' + email + '" status="' + (is_on_open_notification ? 'on' : 'off') + '" style="padding-left:2px;height:14px;" title="' + MyLang.getMsg('DOC_OPEN_DATE') + ':' + Sateraito.DateUtil.timeShorten(open_status.doc_open_date) + '" >';
										// 通知設定=ON
										}else if(is_on_open_notification){
											vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_on.png" class="btn_open_notification" email="' + email + '" status="on" style="padding-left:2px;height:14px;cursor:pointer;"  onclick="ApproverCandidate.toggleOpenNotificationButton(' + processNo + ', \'' + email + '\', \'template_body_' + aDocId + '\');" title="' + MyLang.getMsg('OPEN_NOTIFICATION_ON') + '">';
										// 通知設定=OFF
										}else{
											vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_off.png" class="btn_open_notification" email="' + email + '" status="off" style="padding-left:2px;height:14px;cursor:pointer;"  onclick="ApproverCandidate.toggleOpenNotificationButton(' + processNo + ', \'' + email + '\', \'template_body_' + aDocId + '\');" title="' + MyLang.getMsg('OPEN_NOTIFICATION_OFF') + '">';
										}
									// On/Offプロセスとして開いていない場合（アクティブな承認タイミングでない承認/回覧者、申請者、承認プロセス完了後、など）
									}else if(open_status != null){
										if(open_status.status == 'opened'){
											vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_opened.png" class="btn_open_notification" email="' + email + '" status="' + (is_on_open_notification ? 'on' : 'off') + '" style="padding-left:2px;height:14px;" title="' + MyLang.getMsg('DOC_OPEN_DATE') + ':' + Sateraito.DateUtil.timeShorten(open_status.doc_open_date) + '" >';
										// 通知設定=ON
										}else if(is_on_open_notification){
											vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_closed.png" class="btn_open_notification" email="' + email + '" status="on" style="padding-left:2px;height:14px;" title="' + MyLang.getMsg('OPEN_NOTIFICATION_CLOSED') + '" >';
										//// 通知設定=OFF
										//}else{
										//	vHtml = '<img src="' + SATERAITO_MY_SITE_URL + '/images/open_notification_off.png" class="btn_open_notification" email="' + email + '" status="off" style="padding-left:2px;height:14px;" title="' + MyLang.getMsg('OPEN_NOTIFICATION_OFF') + '" >';
										}
									}
									$(this).after(vHtml);
								}
							});


						});
					}

					//
					// プロセス番号により表示する領域を表示
					//
					$('#template_body_' + aDocId).find('.show_by_process_number').each(function(){
						var element = this;
						var processNumberWithSpace = $(element).attr('process_number');
						if (typeof(processNumberWithSpace) == 'undefined' || processNumberWithSpace == null || processNumberWithSpace == '') {
							// no option
						} else {
							var processNumbers = processNumberWithSpace.split(' ');
							Ext.each(processNumbers, function(){
								var processNumberOfElement = '' + this;
								Ext.each(meAllocatedProcessNumbers, function(){
									var meProcessNumber = '' + this;
									if (processNumberOfElement == meProcessNumber) {
										// プロセス番号が一致した
										$(element).show();
									}
								});
							});
						}
					});

					//
					// プロセス番号により表示する領域を表示（現在のプロセスにのみ表示）
					//
					$('#template_body_' + aDocId).find('.show_by_current_process_number').each(function(){
						var element = this;
						var processNumberWithSpace = $(element).attr('process_number');
						if (typeof(processNumberWithSpace) == 'undefined' || processNumberWithSpace == null || processNumberWithSpace == '') {
							// no option
						} else {
							var processNumbers = processNumberWithSpace.split(' ');
							Ext.each(processNumbers, function(){
								var processNumberOfElement = '' + this;
								if(currentApproveNo == processNumberOfElement){
									// プロセス番号が一致した
									$(element).show();
								}
							});
						}
					});

					//
					// step7. 決済履歴・コメントを表示
					//
					DocDetailWindow.renderCommentList(aDocId);

					//
					// step8. Q&A領域を表示
					//
					DocDetailWindow.renderQandA(aDocId, aDocDetail, currentApproveNo);

					//
					// 添付ファイル領域を表示
					//
					if(!aTemplate.is_disable_attach_files){
						DocDetailWindow.renderAttachmentFileList(aDocId, okToAttachFile);
					}
					//
					// 変更可能なフィールドがある場合、inputを表示
					//
					if (!IS_PRINT_WINDOW && okToUpdateDoc) {
						// 自分が更新可能なフィールドがある場合
						DocDetailWindow.showInputFields(okToUpdateField, aDocId, inReSubmitProcess, inAdminEditProcess);
					}

					//// コメント入力欄を表示
					if (inApproveProcess || inViewProcess || inReSubmitProcess || inAdminEditProcess) {
						// 承認・否決ボタン、回覧ボタンを表示する場合、コメント入力欄も表示
						Ext.ComponentMgr.get('comment_panel_' + aDocId).show();
					}

					//
					// ok_to_show_process_number」が指定されているボタンを表示
					//
					if (!IS_PRINT_WINDOW) {
						$('input[type=button]').each(function(){
							var target_button = this;
							var okToShowProcessNumber = $(target_button).attr('ok_to_show_process_number');
							if (okToShowProcessNumber == null || typeof(okToShowProcessNumber) == 'undefined') {
								// no option
							} else {

								// 複数対応
								var okToShowProcessNumbers = okToShowProcessNumber.split(' ');
								Ext.each(okToShowProcessNumbers, function(){
									var okToShowProcessNumber = this;
									// 指定されていたので、表示
									if (okToShowProcessNumber == currentApproveNo) {
										$(target_button).show();
										return;
									}
								});
							}
						});
					}

					//// step6. Window上部、下部のボタン表示

					var createToolBar = function(aTemplate, tb, approve_button_id, reject_button_id, delete_button_id, looked_button_id, update_button_id, remand_button_id, resubmit_button_id, open_print_link_id)
					{
						if (!IS_OPENID_MODE) {

							// ガジェット内に表示の場合

							// 前へボタン
							tb.add(DocDetailWindow.createPrevButton(aDocId));
							// 次へボタン
							tb.add(DocDetailWindow.createNextButton(aDocId));
						}

						// 印刷専用フォーム対応
						var items = [];
						var is_exist_print_items = false;
						items.push(['', MyLang.getMsg('USER_DEFAULT_PRINT_LAYOUT')]);
						if(typeof(aTemplate.template_body_for_print) != 'undefined' && aTemplate.template_body_for_print != ''){
							var template_body_for_print_json = Ext.decode(aTemplate.template_body_for_print);
							Ext.each(template_body_for_print_json, function(data){
								if(data.title != ''){
									items.push([data.layout_id, data.title]);
									is_exist_print_items = true;
								}
							});
						}

						// 「印刷ウィンドウで開く」リンク
						if(is_exist_print_items){
							tb.add({
								 xtype: 'combo'
								,mode: 'local'
								,name:'print_layout_' + aDocId
								,value:''
								,store: new Ext.data.ArrayStore({
									fields: ['Value', 'Disp'],
									data: items
								})
								,valueField: 'Value'
								,displayField: 'Disp'
								,typeAhead: true
								,triggerAction: 'all'
								,lazyRender:false
								,selectOnFocus:true
								,autoWidth:true
								,editable:false
								,listeners: {
									'change': function()
									{
										$('#' + open_print_link_id + '_' + aDocId).attr('href', SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/docprint/' + aDocId + '?hl=' + SATERAITO_LANG + '&layout=' + encodeURIComponent(this.value));
									}
								}

							});

							tb.add({
								html: '&nbsp;',
								xtype: 'label'
							});
						}

						tb.add({
							// 印刷専用フォーム対応
							//text: '<a href="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/docprint/' + aDocId + '" target="_blank">' + MyLang.getMsg('CLICK_HERE_TO_OPEN_PRINT_WINDOW') + '</a>',
							text: '<a href="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/docprint/' + aDocId + '?hl=' + SATERAITO_LANG + '" id="' + encodeURIComponent(open_print_link_id) + '_' + aDocId + '" target="_blank">' + MyLang.getMsg('CLICK_HERE_TO_OPEN_PRINT_WINDOW') + '</a>',

							xtype: 'tbtext'
						});

						// ここから右側ボタン
						tb.add({xtype: 'tbfill'});

						// 承認、否決、差し戻しボタン
						if (inApproveProcess && !IS_ADMIN_CONSOLE) {
							tb.add(DocDetailWindow.createApproveButton(approve_button_id, aDocId, okToUpdateField, page_type));
							if(!isNoReject){
								tb.add(DocDetailWindow.createRejectButton(reject_button_id, aDocId, okToUpdateField, page_type));
							}
							if(!isNoRemand){
								tb.add(DocDetailWindow.createRemandButton(remand_button_id, aDocId, okToUpdateField, page_type));
							}
						}
						// 「回覧済みにして閉じる」ボタン
						if (inViewProcess && !IS_ADMIN_CONSOLE) {
							tb.add(DocDetailWindow.createLookedButton(looked_button_id, aDocId, okToUpdateField, page_type));
						}
						// 更新ボタン
						// 意見欄などで更新ボタンが出るのはやっぱりまずいので変更
						//if (okToUpdateDoc || isExistOtherInputField) {
						if (okToUpdateDoc && !inReSubmitProcess) {					// 再申請の場合は専用のボタンを出すので
							var isCloseAfterUpdate = inAdminEditProcess;
							tb.add(DocDetailWindow.createUpdateButton(update_button_id, aDocId, okToUpdateField, isCloseAfterUpdate));
						}
						// 再申請ボタン（申請者まで差し戻された申請を再度申請する）
						if(inReSubmitProcess && !IS_ADMIN_CONSOLE)
						{
							tb.add(DocDetailWindow.createReSubmitButton(resubmit_button_id, aDocId, okToUpdateField, page_type));
						}
						// コピー新規ボタン
						var viewer_email = LoginMgr.getViewerEmail();
						if(page_type != 'g' && !IS_OPENID_MODE && !IS_ADMIN_CONSOLE && !aTemplate.is_prohibit_reapply)
						{
							if (viewer_email == aDocDetail.author_email || (aDocDetail.ghost_writer != '' && viewer_email == aDocDetail.ghost_writer)) {
								tb.add({
									text: MyLang.getMsg('MSG_REAPPLY'),
									handler: function()
									{
										Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
										var ghost_writer = '';
										if(typeof(aDocDetail.ghost_writer) != 'undefined' && aDocDetail.ghost_writer != ''){
											ghost_writer = aDocDetail.author_email;
										}
										// 本来の申請者が「コピーして再作成」を押したときには代理とならないように制御（どちらにしても代理にするなら改めて設定等を見て選択ボックスを出すべきだがそれは次フェーズ） 2014.10.22
										if (ghost_writer.toLowerCase() == viewer_email.toLowerCase()){
											ghost_writer = '';
										}
										// 再申請時には常に最新のテンプレート（Body）を使うように変更
										NewDocWindow.showWindow(aDocDetail.template_id, Ext.decode(aDocDetail.doc_values), null, aDocDetail.route_body, '', null, ghost_writer, true, aDocDetail.doc_id, '');
									}
								});
							}
						}
						// 管理者による変更機能ボタン
						if(page_type != 'g' && !IS_OPENID_MODE && IS_ADMIN_CONSOLE && !inAdminEditProcess)
						{
							tb.add({
								text: MyLang.getMsg('MSG_EDIT'),
								handler: function()
								{
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
									DocDetailWindow.showWindow(aDocId, null, page_type, '', true);
								}
							});
						}
						// 「削除」ボタン
						// 削除許可範囲… 申請をどこまで申請者に削除させるか. APPLY:申請済 APPROVE:承認/否決済 FINAL_APPROVE:決裁済 Empty:削除させない
						if (viewer_email == aDocDetail.author_email || (aDocDetail.ghost_writer != '' && viewer_email == aDocDetail.ghost_writer)) {
							var delete_doc_type = aTemplate.delete_doc_type;
							var isDeleteOk = false;

							// 申請中（誰も承認や回覧を開始していないもの）なら削除可能
							if(delete_doc_type == 'APPLY'){
								isDeleteOk = aDocDetail.status == WorkflowDoc.DOC_STATUS_IN_PROCESS && !isExistAlreadyApprovers;
							// 決裁前なら削除可能（承認中、回覧中、否決、差し戻し）
							}else if(delete_doc_type == 'APPROVE'){
								isDeleteOk = aDocDetail.status == WorkflowDoc.DOC_STATUS_IN_PROCESS || aDocDetail.status == WorkflowDoc.DOC_STATUS_REJECTED || aDocDetail.status == WorkflowDoc.DOC_STATUS_REMANDED;
							// 決裁済でも削除可能
							}else if(delete_doc_type == 'FINAL_APPROVE'){
								isDeleteOk = true;
							}

							if (isDeleteOk && !IS_ADMIN_CONSOLE) {
								tb.add(DocDetailWindow.createDeleteButton(delete_button_id, aDocId));
							}
						}

						// 閉じるボタン
						// ContextGadgetの場合は閉じるボタンを表示しない 2012.05.29
						// OpenIDモード（メールリンクをクリックした詳細ウィンドウなど）の場合は閉じるボタンを表示しない 2013.06.17
						if(page_type != 'g' && !IS_OPENID_MODE)
						{
							var textClose = MyLang.getMsg('MSG_CLOSE');
							if ((inApproveProcess || inViewProcess) && !IS_ADMIN_CONSOLE) {
								textClose = MyLang.getMsg('CANCEL');
							}
							tb.add({
								text: textClose,
								handler: function()
								{
									if ((inApproveProcess || inViewProcess) && !IS_ADMIN_CONSOLE) {
										var ret = confirm(MyLang.getMsg('MSG_CONFIRM_CLOSE_WINDOW_WITH_DELETE_CURRENT_DOCUMENT'));	// 入力、変更途中の内容を破棄し、このウィンドウを閉じます。よろしいですか？
										if (!ret) {
											return;
										}
									}
									Ext.ComponentMgr.get('doc_detail_window_' + aDocId).close();
								}
							});
						}
						// ボタンを描画
						tb.doLayout();
					};
					var tbtop = Ext.ComponentMgr.get('button_toptoolbar_' + aDocId);
					var tbfoot = Ext.ComponentMgr.get('button_toolbar_' + aDocId);

					if(tbtop){
						createToolBar(aTemplate, tbtop, 'approve_button2', 'reject_button2', 'delete_button2', 'looked_button2', 'update_button2', 'remand_button2', 'resubmit_button2', 'open_print_link2');
					}
					if(tbfoot){
						createToolBar(aTemplate, tbfoot, 'approve_button', 'reject_button', 'delete_button', 'looked_button', 'update_button', 'remand_button', 'resubmit_button', 'open_print_link');
					}

					//
					// 承認者意見欄領域を表示
					//
					DocDetailWindow.renderApproverCommentDict(aDocId, currentApproveNo, !IS_PRINT_WINDOW && (inApproveProcess || inViewProcess));

					//// 印刷ウィンドウ表示の場合、大きさ調整

					if (IS_OPENID_MODE) {
						var cmp_detail_window = Ext.ComponentMgr.get('doc_detail_window_' + aDocId);
						if(typeof(cmp_detail_window) != 'undefined'){
							var innerWindowHeight = $('#template_body_' + aDocId).height();
							var calibration = 120;
							cmp_detail_window.setHeight(innerWindowHeight + calibration);
						}
					}


					var defer_func = function(){

						// 各項目の値のセット
						renderprocess();

						// 各項目の値のセット「renderprocess」が終わった後に動かしたいからここで
						Ext.each(aJsonData, function(item, index){

							var process = this;

							// class="approve_expire_date"指定のフィールドに承認期限日をセット 2012/07/31
							var approve_expire_date_fields = $('#template_body_' + aDocId).find('input.approve_expire_date[target_process_number=' + process.approve_number + ']').each(function(){

								// readonly 等セットしていない場合（手動でセットするイメージの場合）、値が入っていることがある。その場合は上書きしないようにしてみる
								if($(this).val() == '' && process.approve_expire_date){
									// 自分秒までではなく、年月日までとする（自動承認バッチが日次単位なので）
									approve_expire_date = process.approve_expire_date
									approve_expire_date = approve_expire_date.split(' ')[0]
									$(this).val(approve_expire_date);
									// 同名のspanにもセット
									$('#template_body_' + aDocId).find('span[name=' + $(this).attr('name') + ']').text(approve_expire_date);
								}
							});

						});
					};

					// 画面表示系の処理（IE8遅延対策）
					(defer_func).defer(100);

					//
					// マスター参照ボタン処理
					//
					// ボタンの属性
					//
					// フォームのフィールドへの値アサイン
					// assign="data_key:shizai_code1;attribute_1:shizai_name1;attribute_2:shizai_tanka1" limit_selection="10101 10102"
					//   data_key ... マスター側のカラム名
					//   shizai_code1 ... inputのname
					//   limit_selection ... スペースで区切って列挙した値だけ表示
					//
					// カラム幅定義（デフォルト100px）
					// col_width="attribute_1:110;attribute2:120"
					FieldConvert.bindMasterSelectButtonEvent('template_body_' + aDocId, aDocId);

					//
					// Googleカレンダー予定作成画面表示ボタン処理
					//
					FieldConvert.bindEventToGoogleCalendarButtonEvent('template_body_' + aDocId, aDocId);

					// 開封通知をリクエストする
					if(!IS_PRINT_WINDOW){
						//var currentApproveNo = $('#template_body_' + aDocId).find('input[name=process][current_approving=1]').attr('number');
						if(currentApproveNo != null){
							WorkflowDoc.requestSendOpenNotification(aDocId, currentApproveNo);
						}
					}


				});
			}
		},

		/**
		 * requestDocApprover
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestDocApprover: function(aDocId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				DocDetailWindow._requestDocApproverOid(aDocId, callback, aNumRetry);
			} else {
				DocDetailWindow._requestDocApprover(aDocId, callback, aNumRetry);
			}
		},

		/**
		 * _requestDocApproverOid
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestDocApproverOid: function(aDocId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getdocapprover?doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					callback(jsonData);

				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						DocDetailWindow._requestDocApproverOid(aDocId, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));
					}
				}
			});
		},

		/**
		 * requestDocApprover
		 *
		 * 申請書に紐づいている承認者情報を取得
		 *
		 * @param {String} aDocId
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		_requestDocApprover: function(aDocId, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getdocapprover?doc_id=' + encodeURIComponent(aDocId) + '&hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getdocapprover](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

							// リトライ
							DocDetailWindow._requestDocApprover(aDocId, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった
							// 読込中メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsonData);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * showWindow
		 *
		 * 詳細ウィンドウを表示する
		 *
		 * @param {String} aDocId
		 * @param {Window Object} aCloseWindowInstanceOnShow
		 * @param {string} page_type:g=from contextual gadget.
		 */
		showWindow: function(aDocId, aCloseWindowInstanceOnShow, page_type, render_area_id, inAdminEditProcess)
		{
			if (WorkflowUser.userListLoadingStatus == 2) {
				// ユーザー一覧がロードされている
				DocDetailWindow._showWindow(aDocId, aCloseWindowInstanceOnShow, page_type, render_area_id, inAdminEditProcess);
			} else {
				// ユーザー一覧がロードされていないので、まずロードする
				WorkflowUser.requestUserList(function(){
					DocDetailWindow._showWindow(aDocId, aCloseWindowInstanceOnShow, page_type, render_area_id, inAdminEditProcess);
				});
			}
		},

		/**
		 * _showWindow
		 *
		 * 詳細ウィンドウを表示する
		 *
		 * @param {String} aDocId
		 * @param {Window Object} aCloseWindowInstanceOnShow
		 * @param {string} page_type:g=from contextual gadget.
		 */
		_showWindow: function(aDocId, aCloseWindowInstanceOnShow, page_type, render_area_id, inAdminEditProcess)
		{
			// 既に表示されていたら、前面に出す
			var existingWindow = Ext.ComponentMgr.get('doc_detail_window_' + aDocId);
			if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
				existingWindow.toFront();
				// 消去ウィンドウが指定されていたら、消去
				if (aCloseWindowInstanceOnShow && typeof(aCloseWindowInstanceOnShow) != 'undefined') {
					aCloseWindowInstanceOnShow.close();
				}
				return;
			}

			// ドキュメント詳細を取得

			WorkflowDoc.requestDocDetail(aDocId, function(aDocDetail){

				// 消去ウィンドウが指定されていたら、消去
				if (aCloseWindowInstanceOnShow && typeof(aCloseWindowInstanceOnShow) != 'undefined') {
					aCloseWindowInstanceOnShow.close();
				}

				// 既に表示されていたら、前面に出す
				var existingWindow = Ext.ComponentMgr.get('doc_detail_window_' + aDocId);
				if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
					existingWindow.toFront();
					return;
				}

				// このドキュメントが既に削除されていたらメッセージを出して終了
				if(typeof(aDocDetail.template_id) == 'undefined'){
					alert(MyLang.getMsg('MSG_ALREADY_DELETE_DOC_OR_ACCESS_DENIED'));	// この申請書は既に削除されているかアクセス権がありません。
					return;
				}

				var main_process = function(aTemplate, aSubmitterUserSetting){

					// ダブルクリック対応のため、ここでもチェック
					var existingWindow = Ext.ComponentMgr.get('doc_detail_window_' + aDocId);
					if (!(typeof(existingWindow) == 'undefined' || existingWindow == null)) {
						existingWindow.toFront();
						// 消去ウィンドウが指定されていたら、消去
						if (aCloseWindowInstanceOnShow && typeof(aCloseWindowInstanceOnShow) != 'undefined') {
							aCloseWindowInstanceOnShow.close();
						}
						return;
					}

					// 申請書を表示するパネル
					var vHtml = '';
					// 更新するためのテンプレート内容
					// 下に移動
					//vHtml += '<div id="template_body_to_changedocstatus_' + aDocId + '" style="display:none;">' + aDocDetail.template_body + '</div>';
					vHtml += '<div id="template_body_' + aDocId + '" class="main_body" style="font-size:13px;padding:0px;">';
					vHtml += '<input type="hidden" id="in_resubmit_process_' + aDocId + '" class="do_not_save" value="0" ></input>';
					vHtml += '<input type="hidden" id="in_admin_edit_process_' + aDocId + '" class="do_not_save" value="0" ></input>';
					vHtml += '<div class="document_back">';
					vHtml += '<div class="document_body">';

					// 上のタイトル部
					//vHtml += '<table border="0" cellpadding="0" cellspacing="0" width="100%" >';
//					vHtml += '<table border="0" cellpadding="0" cellspacing="0" width="740" >';
					vHtml += '<table border="0" cellpadding="0" cellspacing="0" class="header_table">';
					//vHtml += '<tr background="' + SATERAITO_MY_SITE_URL + '/images/header_bg02.gif">';
					vHtml += '<tr background="' + SATERAITO_MY_SITE_URL + '/images/header_bga02.gif">';
					vHtml += '<td width="49" height="40">';
					//vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/header_mark.gif" border="0">';
					vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/header_marka.gif" border="0">';
					vHtml += '</td>';
					//vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bg01_long.gif" nowrap width="673" height="40" style="background-repeat:no-repeat; background-color:transparent; allowtransparency:true;" >';
//					vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bga01.gif" nowrap width="685" height="40" >';
					vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bga01.gif" class="header_bga01" nowrap height="40" >';
					vHtml += '<font size="4" color="#ffffff" face="メイリオ,Meiryo,Hiragino Kaku Gothic Pro,ヒラギノ角ゴ Pro W3,ＭＳ Ｐゴシック">';
					vHtml += '<b class="template_name"></b></font>';
					vHtml += '</td>';
					//vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bg02.gif" height="40">&nbsp;</td>';
					vHtml += '<td background="' + SATERAITO_MY_SITE_URL + '/images/header_bga02.gif" width="6" height="40" ></td>';
					vHtml += '</tr>';
					vHtml += '</table>';

					vHtml += '<div class="document_form">';
					vHtml += aDocDetail.template_body;
					// 承認ルート
					vHtml += '<div id="route_body" class="route_body" >';
					if(aDocDetail.route_body){
						vHtml += aDocDetail.route_body;
					}
					vHtml += '</div>';	// end route_body
					vHtml += '</div>';	// end document_form
					// 添付ファイル一覧エリア
					vHtml += '<div style="font-size:13px;margin:5px;padding:5px;border-top:solid 1px silver;" id="attached_file_render_area_detail_' + aDocId + '" class="attachment_area" >';
					vHtml += '</div>';

					// 公開コメント欄
					vHtml += '<div id="comment_tree_title_table_' + aDocId + '" style="font-size:13px;margin:5px;padding:5px;border-top:solid 1px silver;" >';
					vHtml += '<table style="margin:0px">';
					vHtml += '<tr>';
					vHtml += '<td>' + MyLang.getMsg("DOC_COMMENT") +  ':</td>';
					vHtml += '</tr>';
					vHtml += '</table>';
					vHtml += '<div id="comment_tree_area_' + aDocId + '" class="comment_tree" style="margin:0px 10px 10px 10px;">';
					vHtml += '</div>';
					vHtml += '</div>';

					// コメント表示エリア
					vHtml += '<div style="font-size:13px;margin:5px;padding:5px;border-top:solid 1px silver;" id="comment_area_' + aDocId + '" class="comment_area" >';
					vHtml += '</div>';

					vHtml += '</div>';
					vHtml += '</div>';
					vHtml += '</div>';
					// ↑から移動. jQueryで、 var str_display = $(form).find('.xxxx').css('display'); のような記述で表示状態を取得した際に、↓ではなく本来のエレメントの状態が取得できるように（とりあえずの対応）
					vHtml += '<div id="template_body_to_changedocstatus_' + aDocId + '" style="display:none;">' + aDocDetail.template_body + '</div>';

					var formPanel = new Ext.form.FormPanel({
						bodyStyle: 'background-color:white;',
						layout: 'fit',
						id: 'form_panel_' + aDocId,
						formId: 'form_' + aDocId,
						autoScroll: true,
						html: vHtml
					});

					WorkflowDoc.docIds[formPanel.formId] = aDocId;	// フォームIDにマッピングする形で文書IDを保持しておく
					WorkflowDoc.relativeDocIds[aDocId] = aDocDetail.relative_doc_id;	// この文書自体のIDにマッピングする形で関連した元文書IDを保持しておく
					if(typeof(aDocDetail.relative_doc_id_chain) != 'undefined' && aDocDetail.relative_doc_id_chain.length > 0){
						WorkflowDoc.relativeDocIdChains[aDocId] = aDocDetail.relative_doc_id_chain;	// この文書自体のIDにマッピングする形で関連した元文書IDを保持しておく
					}
					WorkflowDoc.initMasterRowForUpdate(aDocId);

					formPanel.region = 'center';

					// コメントを書き込むパネル
					var commentPanel = DocDetailWindow.createCommentPanel(aDocId);
					commentPanel.region = 'south';


					// ブラウザのページタイトルに題名などを表示（詳細、印刷ウインドウ）
					if(IS_OPENID_MODE){
						document.title = (typeof(aDocDetail.doc_title) != 'undefined' && aDocDetail.doc_title != '' ? (aDocDetail.doc_title + ' - ') : '') + aTemplate.template_name;
					}

					if(IS_PRINT_WINDOW){
						var printPanel = new Ext.Panel({
								//items:[formPanel, commentPanel]
								items:[formPanel]
							});
						printPanel.render(render_area_id);
					}
					else{
						var items = [formPanel];

						items.push(commentPanel);

						// トップのツールバー（ボタングループ）
						var tbtop = new Ext.Toolbar({
							id: 'button_toptoolbar_' + aDocId,
							items: []
						});
						// ツールバー（ボタングループ）
						var tb = new Ext.Toolbar({
							id: 'button_toolbar_' + aDocId,
							items: []
						});

						var is_closable;
						// OPENIDモードでも×ボタンを出すように変更（showRelativeDocWindowで開かれたウインドウが閉じられないため）
						if(IS_OPENID_MODE){
							//is_closable = false;
							is_closable = true;
						}else{
							is_closable = page_type != 'g' ? true : false;
						}

						// 詳細ウィンドウを生成
						var detailWindow = new Ext.Window({
							id: 'doc_detail_window_' + aDocId,
							width: 800,
							height: SateraitoUI.getWindowHeightWithUserPrefs(600),
							//maximizable: page_type == 'g' ? false : true,
							maximizable: true,
/*
							listeners: {
								'afterlayout': function()
								{
									//Sateraito.Util.console('afterlayout');
									//detailWindow.maximize();
								}
								,'afterrender': function()
								{
									//Sateraito.Util.console('afterrender');
									if(!IS_PRINT_WINDOW){
										if (page_type == 'g' || !IS_OPENID_MODE) {
											// 最大化表示
											if (page_type == 'g' || WorkflowTemplate.isTemplateShowAsMaxWindow(aDocDetail.template_id)) {
												(function(){
													detailWindow.maximize();
												}).defer(page_type == 'g' ? 2500 : 100);
											}
										}
									}
								}
							},
*/
							closable: is_closable,
							title: aDocDetail.template_name,
							plain: true,
							autoScroll: page_type == 'g' ? true : false,
							layout: 'border',
							items: items,
							buttonAlign: 'left',
							tbar: tbtop,
							fbar: tb
						});
						// 別画面表示の場合、左上に詰めて表示
						if (IS_OPENID_MODE) {
							detailWindow.x = 0;
							detailWindow.y = 0;
						}

						// 詳細ウィンドウを開く
						detailWindow.show();
						// ウインドウの移動範囲を制約
						detailWindow.dd.constrainTo(Ext.getBody());
					}

					// 申請者（代理申請の場合も本来の申請者）のUserSettingをセット
					UserSetting.submitterSetting[formPanel.formId] = aSubmitterUserSetting;

					// 管理者による編集プロセスかどうかのフラグをセット
					if(inAdminEditProcess){
						$('#template_body_' + aDocId).find('#in_admin_edit_process_' + aDocId).val('1');
					}

					// 再申請プロセスかどうかのフラグをセット
					var inReSubmitProcess = false;
					if(!IS_ADMIN_CONSOLE && (aDocDetail.status == WorkflowDoc.DOC_STATUS_REMANDED && (LoginMgr.viewerEmail == aDocDetail.author_email || (aDocDetail.ghost_writer != '' && LoginMgr.viewerEmail == aDocDetail.ghost_writer)))){
						$('#template_body_' + aDocId).find('#in_resubmit_process_' + aDocId).val('1');
						inReSubmitProcess = true;
					}

					// ハンコ表示欄を初期化
					if (typeof(uu) != 'undefined' && typeof(uu.canvas) != 'undefined')
					{
						$('#template_body_' + aDocId).find('canvas').each(function(){
							$(this).addClass('vml');
						});
						uu.canvas.init();
					}

					//
					// step1. 新規入力時だけ表示（show_only_creating_doc）クラスを非表示に設定
					//
					$('#template_body_' + aDocId).find('.show_only_creating_doc').hide();

					//
					// クラス「div.section_area」の処理
					//
					$('#template_body_' + aDocId).find('div.section_area').each(function(){
						var innerHtml = $(this).html();
						var sectionTitle = $(this).attr('section_title');
						if (typeof(sectionTitle) == 'undefined') {
							sectionTitle = '';
						}
						var vHtml = '';
						vHtml += '<div class="section_area_title">';
						vHtml += '<img class="section_arrow_img" src="' + SATERAITO_MY_SITE_URL + '/images/arrowDown.gif" />';
						vHtml += sectionTitle + '</div>';
						vHtml += '<div class="section_show_hide_area" >' + innerHtml + '</div>';
						$(this).html(vHtml);
					});

					//
					// step2. input/textareaタグを非表示にし、spanタグで置き換える
					//
					//
					// 承認者の定義
					//
					//   <input name="process" number="1" approver="boss_mail_all;job_title:センター長">
					//    ... nameは必ず「process」
					//        numberは1から始まる連番
					//        approverに承認者を絞り込む条件を定義、「;」で複数付けるとAND条件になる
					// 入力欄の定義
					//   <input type="text" name="example">
					//   nameは何でもいい。name=doc_titleの場合、入力値は一覧の「題名」に表示される
					//
					$('#template_body_' + aDocId).find(':input').each(function(){

						var element = this;
						var elementName = $(element).attr('name');
						if (typeof(elementName) == 'undefined') {
							elementName = '';
						}
						var elementType = $(element).attr('type');
						if (typeof(elementType) == 'undefined') {
							elementType = 'text';
						}
						elementType= elementType.toLowerCase();

						// もともと非表示扱いかどうか
						//var is_display_none = false;
						var str_display = $(element).css('display');
						if(typeof(str_display) != 'undefined' && str_display.toLowerCase() == 'none'){
							//is_display_none = true;
							$(element).attr('is_display_none', 'on');
						}

						if ($(element).is('button')) {
							// no option
						} else if ($(element).is('select')) {

							// コンボボックスの場合
							// 詳細、印刷画面では選択文字列だけをセットするようにする
							var vHtml = '<span class="sateraito_doc_value" name="' + elementName + '"';
							vHtml += '></span>';
							$(element).after(vHtml);
							// inputエレメントを非表示にする
							$(element).hide();

						} else if ($(element).is('textarea')) {
							var vHtml = '<span class="sateraito_doc_value" name="' + elementName + '"';
							vHtml += '></span>';
							$(element).after(vHtml);
							// inputエレメントを非表示にする
							$(element).hide();

						} else {

							if (elementType == 'button') {

								// ボタンの場合
								// 差し戻し再申請
								if(inReSubmitProcess){

								// 管理者の編集時
								}else if(inAdminEditProcess){
									// 部署より追加ボタンも非表示にする
									if ($(element).is('.department_1_select_button')) {
										$(element).hide();
									}
									// ユーザー一覧より追加ボタンも非表示にする
									if ($(element).is('.user_select_button')) {
										$(element).hide();
									}
									// 承認者クリアボタンも非表示する
									if ($(element).is('.clear_approver_button')) {
										$(element).hide();
									}
								}else{
									// マスター選択ボタンの場合、inputエレメントを非表示にする
									if ($(element).is('.sateraito_master_select')) {
										$(element).hide();
									}
									// 部署より追加ボタンも非表示にする
									if ($(element).is('.department_1_select_button')) {
										$(element).hide();
									}
									// ユーザー一覧より追加ボタンも非表示にする
									if ($(element).is('.user_select_button')) {
										$(element).hide();
									}
									// 承認者クリアボタンも非表示する
									if ($(element).is('.clear_approver_button')) {
										$(element).hide();
									}
									// クリアボタンも非表示する
									if ($(element).is('.clear_button')) {
										$(element).hide();
									}
								}

							} else if (elementType == 'radio') {

								// ラジオボタンの場合
								// inputエレメントをDisabledにする
								// 詳細、印刷画面では画像で表示するようにする
								var vHtml = '<span class="sateraito_doc_value" name="' + elementName + '"';
								vHtml += '></span>';
								$(element).after(vHtml);
								// inputエレメントを非表示にする
								$(element).hide();

							} else if (elementType == 'checkbox') {

								// チェックボックスの場合
								// 詳細、印刷画面では画像で表示するようにする
								var vHtml = '<span class="sateraito_doc_value" name="' + elementName + '"';
								vHtml += '></span>';
								$(element).after(vHtml);
								// inputエレメントを非表示にする
								$(element).hide();

							} else if (elementType == 'hidden') {

								// hiddenの場合
								// 何も表示しない

							} else {

								//
								// textの場合
								//
								// inputエレメントに対応したspanエレメントを作成

								if (elementName.toLowerCase() == 'process') {

									//
									// processエレメント（承認者定義）の場合
									//

									var approveNumber = $(element).attr('number');
									var vHtml = '';
									vHtml += '<span class="approver_name_list" name="' + elementName + '" number="' + approveNumber + '">';
									vHtml += '</span>';
									$(element).after(vHtml);
									// inputエレメントを非表示にする
									$(element).hide();

								} else {

									//
									// 通常のtextエレメントの場合
									//

									var vHtml = '<span class="sateraito_doc_value" name="' + elementName + '"';
									vHtml += '></span>';
									$(element).after(vHtml);
									// inputエレメントを非表示にする
									$(element).hide();
								}
							}
						}
					});

					//
					// step3. ドキュメントの値をセット
					//
					// IE8対策で遅延実行
					var renderprocess = function(){
						var docValues = Ext.decode(aDocDetail.doc_values);
						var templateBody = $('#template_body_' + aDocId);
						var templateBodyInputs = templateBody.find(':input');
						var templateBodyDocValues = templateBody.find('span.sateraito_doc_value');
						Ext.iterate(docValues, function(key, value){

							//Sateraito.Util.console('key=' + key + ' value=' + value);

							// 値セットルーチン
							// 同一nameフィールド複数対応
							//var element = templateBodyInputs.filter('[name=' + key + ']');
							var elements = templateBodyInputs.filter('[name=' + key + ']');
							for(elements_idx = 0; elements_idx < elements.length; elements_idx++){
								var element = elements[elements_idx];

								// 値を表示
								if ($(element).is('input')) {

									// inputの場合

									// エレメントのタイプを確認
									var elementType = $(element).attr('type');
									if (typeof(elementType) == 'undefined') {
										elementType = 'text';
									}
									elementType = elementType.toLowerCase();

									if (elementType == 'radio') {

										// radioボタンの場合
										$('#template_body_' + aDocId).find(':input[name=' + key + ']').removeAttr('checked');
										$('#template_body_' + aDocId).find(':input[name=' + key + ']').val([value]);

										// 印刷画面用に画像でセット。該当の「span.sateraito_doc_value」がなければスルーされるのでOK
										$('#template_body_' + aDocId).find(':input[name=' + key + ']').each(function(){
											if($(this).attr('is_display_none') != 'on'){
												if ($(this).attr('checked')) {
													$(this).next('span.sateraito_doc_value').html('<img src="' + SATERAITO_MY_SITE_URL + '/images/radio_on.png" border="0">');
												} else {
													$(this).next('span.sateraito_doc_value').html('<img src="' + SATERAITO_MY_SITE_URL + '/images/radio_off.png" border="0">');
												}
											}
										});

									} else if (elementType == 'checkbox') {

										// チェックボックスの場合
										if (value == true) {
											$(element).attr('checked', 'checked');
										}else if (value == false) {
											$(element).removeAttr('checked');
										// VALUE_ATTR用
										} else if((',' + value + ',').indexOf(',' + $(element).val() + ',') >= 0){
											$(element).attr('checked', 'checked');
										}else{
											$(element).removeAttr('checked');
										}

										// 印刷画面用に画像でセット。該当の「span.sateraito_doc_value」がなければスルーされるのでOK
										if($(element).attr('is_display_none') != 'on'){
											if($(element).is(':checked')){
												$(element).next('span.sateraito_doc_value').html('<img src="' + SATERAITO_MY_SITE_URL + '/images/check_on.png" border="0">');
											} else {
												$(element).next('span.sateraito_doc_value').html('<img src="' + SATERAITO_MY_SITE_URL + '/images/check_off.png" border="0">');
											}
										}
									} else if (elementType == 'hidden') {

										// hiddenの場合
										$(element).val(value);
										//$(element).attr('raw_value', value);	// ※未使用＆セキュリティホールになるためコメントアウト 2012/08/06

									} else {

										// それ以外の場合（textの場合）
										// 計算系フィールドも追加 2014.07.18
										//if ($(element).hasClass('number')) {
										if ($(element).hasClass('number') || $(element).hasClass('sum') || $(element).hasClass('diff') || $(element).hasClass('multi') || $(element).hasClass('divide')) {
											// numberクラスの場合コンマを付ける
											value = NumUtil.addComma(NumUtil.removeComma(value));
										}
										var escapedValue = Sateraito.Util.escapeHtml(value);
		//								$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + key + ']').html(Sateraito.Util.enterToBr(escapedValue));
		//								templateBody.find('span.sateraito_doc_value[name=' + key + ']').html(Sateraito.Util.enterToBr(escapedValue));
										templateBodyDocValues.filter('[name=' + key + ']').html(Sateraito.Util.enterToBr(escapedValue));
										$(element).val(value);
										//$(element).attr('raw_value', value);	// ※未使用＆セキュリティホールになるためコメントアウト 2012/08/06
									}

								} else if ($(element).is('select')) {

									// コンボボックスの場合
									$(element).val(value);
									// 印刷画面用に表示文字列をラベルとしてセット。該当の「span.sateraito_doc_value」がなければスルーされるのでOK
									//var disp_value = $(element).find('option[value="' + value + '"]').text().trim();
									var disp_value = $(element).find('option[value="' + Sateraito.Util.jQEscape(value) + '"]').text().trim();
									templateBodyDocValues.filter('[name=' + key + ']').html(Sateraito.Util.enterToBr(Sateraito.Util.escapeHtml(disp_value)));

								} else if ($(element).is('textarea')) {

									// テキストエリアの場合
									var escapedValue = Sateraito.Util.escapeHtml(value);
									// テキストエリアの詳細、印刷表示はテキストエリアのまま行う

									// 従来版
									//$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + key + ']').html(Sateraito.Util.enterToBr(escapedValue));

									// 印刷ボックスで一行に入る文字数を入力時と一緒にするため、textareaを使用
									var new_textarea = $(element).clone(true).removeAttr('name').attr('readonly', 'readonly');
									new_textarea.css('border-color', '#FFF #FFF #FFF #FFF');	// 詳細ページの雰囲気づくり
									new_textarea.css('border-style', 'solid 0px');
									new_textarea.css('padding-left', '0px');
									new_textarea.css('overflow', 'hidden');		// これがないとフル行数表示した時に右側スクロールバー分幅が一瞬小さくなり折り返しが発生する
									//new_textarea.text(value);
									new_textarea.val(value);		// IE改行問題のため
									new_textarea.show();
		/*
									new_textarea.show(0, function(){
										new_textarea.autosize();
									});
		*/
									(function(){
										new_textarea.autosize();
										new_textarea.val(value);		// IE改行問題のため
										//new_textarea.css('overflow-y','scroll');
									}).defer(100);	// textareaの描画が完了してないと適切にサイズ調整してくれないので（TODO 全角と半角でも微妙）
									$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + key + ']').append(new_textarea);

									$(element).val(value);
									//$(element).attr('raw_value', value);	// ※未使用＆セキュリティホールになるためコメントアウト 2012/08/06

								}
							}
						});

						// renderDocApproverの中からここに移動
						//
						// 新規または既存申請書ロードイベントハンドラをキック
						//
						$('#template_body_' + aDocId).find('input[type=hidden][name=workflow_doc_load_handler]').each(function(){
							var handlerElement = this;
							var workflowDocLoadHandler = handlerElement.onclick;
							if (typeof(workflowDocLoadHandler) == 'function') {
								if(typeof($('#template_body_' + aDocId).parents('form')[0]) != 'undefined'){
									workflowDocLoadHandler($('#template_body_' + aDocId).parents('form')[0]);
								}
							}
						});
						//
						// 既存申請書ロードイベントハンドラをキック
						//
						$('#template_body_' + aDocId).find('input[type=hidden][name=existing_workflow_doc_load_handler]').each(function(){
							var handlerElement = this;
							var existingWorkflowDocLoadHandler = handlerElement.onclick;
							if (typeof(existingWorkflowDocLoadHandler) == 'function') {
								if(typeof($('#template_body_' + aDocId).parents('form')[0]) != 'undefined'){
									existingWorkflowDocLoadHandler($('#template_body_' + aDocId).parents('form')[0]);
								}
							}
						});

						// 差し戻しされた申請書を再申請のために開いた際のロードイベントハンドラをキック
						if(inReSubmitProcess){
							$('#template_body_' + aDocId).find('input[type=hidden][name=resubmit_workflow_doc_load_handler]').each(function(){
								var handlerElement = this;
								var reSubmitWorkflowDocLoadHandler = handlerElement.onclick;
								if (typeof(reSubmitWorkflowDocLoadHandler) == 'function') {
									if(typeof($('#template_body_' + aDocId).parents('form')[0]) != 'undefined'){
										reSubmitWorkflowDocLoadHandler($('#template_body_' + aDocId).parents('form')[0]);
									}
								}
							})
						}


						//detailWindow.show();
					};

					//(renderprocess).defer(100);	// renderDocApproverの中で処理

					//
					// step4. 承認者の候補を取得し、セット
					//
					DocDetailWindow.renderDocApprover(aDocId, aDocDetail, aTemplate, page_type, renderprocess);

					//
					// 公開コメント欄機能…掲示板/回覧版から移植
					//
		      DocDetailWindow.renderClassChecklistWithCommentPublish(aDocId, aDocDetail, aTemplate);

					//
					// step5. 申請書名をCSSクラス「template_name」のテキストにセット
					//
					$('#template_body_' + aDocId).find('.template_name').text(aDocDetail.template_name);

					// DocDetailWindow.renderDocApprover 内でレンダリングするように変更.※承認者の添付権限に対応するため 2012/08/13
					////
					//// step6.  添付ファイルを表示
					////
					//if (IS_OPENID_MODE) {
					//	$('#attached_file_render_area_detail_' + aDocId).html('<iframe style="width:100%;height:60px;" src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/oid/attachfilelist?doc_id=' + aDocId + '">');
					//} else {
					//	WorkflowUser.requestToken(function(aJsonData){
					//		var token = aJsonData.token;
					//		$('#attached_file_render_area_detail_' + aDocId).html('<iframe style="width:100%;height:60px;" src="' + SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/attachfilelist?token=' + token + '&doc_id=' + aDocId + '">');
					//	});
					//}

					// DocDetailWindow.renderDocApprover 内でレンダリングするように変更.※承認者ごとのステータスや承認日の表記に対応するため 2012/08/29
					//
					// step7. 決済履歴・コメントを表示
					//
					//DocDetailWindow.renderCommentList(aDocId);

					//
					// step9. 最終決裁済み以外の場合は、表示領域を非表示設定（クラス hide_if_not_final_approved）
					//
					if (aDocDetail.status == WorkflowDoc.STATUS_FINAL_APPROVED) {
						// no option
					} else {
						$('#template_body_' + aDocId).find('.hide_if_not_final_approved').hide();
					}

					//
					// step10. 本人以外の場合は、表示領域を非表示設定（クラス hide_if_not_author）
					//
					if (LoginMgr.getViewerEmail() == aDocDetail.author_email) {
						// no option
					} else {
						$('#template_body_' + aDocId).find('.hide_if_not_author').hide();
					}

					//
					// step10.2 本人あるいは代理申請者以外の場合は、表示領域を非表示設定（クラス hide_if_not_author_or_ghost_writer）
					//
					if (LoginMgr.getViewerEmail() == aDocDetail.author_email || (aDocDetail.ghost_writer != '' && LoginMgr.getViewerEmail() == aDocDetail.ghost_writer)) {
						// no option
					} else {
						$('#template_body_' + aDocId).find('.hide_if_not_author_or_ghost_writer').hide();
					}

					//
					// step10.3. 決裁者以外の場合は、表示領域を非表示設定（クラス hide_if_not_final_approver）
					//
					if (LoginMgr.getViewerEmail() == aDocDetail.final_approver_or_rejector_email) {
						// no option
					} else {
						$('#template_body_' + aDocId).find('.hide_if_not_final_approver').hide();
					}


					//
					// step11. 部署名から追加ボタン処理
					//
					// ボタンの属性
					//
					// name="department_1_select_button" process_number="3"
					//   process_number ... 部署名から承認/回覧者を追加するプロセス番号
					//
					Department1SelectWindow.bindButtonClickEvent('template_body_' + aDocId);

					//
					// step12. ユーザー一覧から追加ボタン処理
					//
					// ボタンの属性
					//
					// name="user_select_button" process_number="3"
					//   process_number ... ユーザー一覧から承認/回覧者を追加するプロセス番号
					//
					FieldConvert.bindUserSelectButtonEvent('template_body_' + aDocId);


					//
					// step13. 承認者クリアボタン処理
					//
					// class="clear_approver_button" process_number="3"
					//  process_number ... 承認者をクリアするプロセス番号
					//
					FieldConvert.bindClearApproverButtonEvent('template_body_' + aDocId);

					//
					// step14. マスター参照フィールド処理
					//
					// マスター参照フィールドがあれば、参照元が変更されると実際にマスターを参照して値をセットする
					//
					FieldConvert.bindMasterReferenceChangeEvent('template_body_' + aDocId);

					//
					// step15. 最大表示するテンプレートの場合、最大化表示(ガジェットモードの場合のみ)
					// ※Contextualガジェットの場合は最大化 2012.05.29
					//
					if(!IS_PRINT_WINDOW){
						if (page_type == 'g' || !IS_OPENID_MODE) {
							// 最大化表示
							if (page_type == 'g' || WorkflowTemplate.isTemplateShowAsMaxWindow(aDocDetail.template_id)) {
								(function(){
									detailWindow.restore();
									detailWindow.maximize();
								}).defer(page_type == 'g' ? 3000 : 100);
								//detailWindow.on('render', function(){detailWindow.maximize();});
							}
						}
					}
				};


				// 次の処理をキックする非同期処理のための関数
				var aCurrentWorkflowTemplate;
				var aSubmitterUserSetting;
				var pallaFinishedCount = 0;
				var NUM_PROCEED_PALLA_FINISHED_COUNT = 3;  // 並列度：カウンターがこれに達した時に次の処理をキックする
				var proceedByPallaFinishedCount = function(){
					pallaFinishedCount++;
					if (pallaFinishedCount >= NUM_PROCEED_PALLA_FINISHED_COUNT) {

						// マスタープリロード
						var preloadMasterCodes = WorkflowTemplate.getPreloadMasterCodesOnExistingDoc(aCurrentWorkflowTemplate);
						if (preloadMasterCodes.length == 0) {
							main_process(aCurrentWorkflowTemplate, aSubmitterUserSetting);
							return;
						}

						var numMasterToPreload = preloadMasterCodes.length;
						var numPreloaded = 0;
						Ext.each(preloadMasterCodes, function(){
							var masterCode = '' + this;
							SateraitoWF.requestMasterData(masterCode, function(aResults){
								numPreloaded++;
								if (numPreloaded == numMasterToPreload) {
									main_process(aCurrentWorkflowTemplate, aSubmitterUserSetting);
									return;
								}
							});
						});
					}
				};

				// テンプレートをロード --> パラレルキック処理
				WorkflowTemplate.requestTemplateForLoadDoc(aDocDetail.template_id, function(aTemplate){
					aCurrentWorkflowTemplate = aTemplate;
					// 続きの処理をキック
					proceedByPallaFinishedCount();
				});

				// 開封通知設定一覧をロード --> パラレルキック処理
				WorkflowDoc.requestOpenNotificationList(aDocDetail.doc_id, function(aData){
					// 続きの処理をキック
					proceedByPallaFinishedCount();
				});

				// 申請者の情報を取得…「getSubmitterUserInfo」で使用するため --> パラレルキック処理
				UserSetting.requestUserSetting(function(aStatus, aSetting){
					// 既に存在しない場合もあるのでここではアラートは出さない
					aSubmitterUserSetting = aSetting;
					// 続きの処理をキック
					proceedByPallaFinishedCount();
				}, aDocDetail.author_email);


			});
		}
	};



	WorkflowConfig = {

		docListConfig: null,

		getColumnTitle: function(doc_list_config, column_id){
			var default_title = WorkflowConfig.getDefaultColumnTitle(column_id, false);
			var title = default_title;
			if(typeof(doc_list_config) != 'undefined'){
				var custom_title;
				Ext.each(doc_list_config, function(){
					var column = this;
					if(column.column_id == column_id){
						custom_title = column.column_title;
						return;
					}
				});
				if(typeof(custom_title) != 'undefined' && custom_title != ''){
					title = custom_title;
				}
			}
			return title;
		},

		// 標準の項目
		getNotmalColumnIds: function(){
			return ['submit_date', 'template_name', 'author_name', 'status', 'doc_no', 'doc_title', 'final_approve_no', 'final_approved_or_rejected_date', 'final_approver_or_rejector'];
		},

		getDefaultColumnTitle: function(column_id, isDraft){
			var default_title = '';
			switch(column_id){
				case 'created_date':
					default_title = !isDraft ? MyLang.getMsg('FLD_APPLY_DATE') : MyLang.getMsg('FLD_SAVE_DATE');
					break;
				case 'submit_date':
					default_title = !isDraft ? MyLang.getMsg('FLD_APPLY_DATE') : MyLang.getMsg('FLD_SAVE_DATE');
					break;
				case 'template_name':
					default_title = MyLang.getMsg('FLD_TEMPLATE_NAME');
					break;
				case 'author_name':
					default_title = MyLang.getMsg('FLD_AUTHOR_NAME');
					break;
				case 'status':
					default_title = MyLang.getMsg('FLD_STATUS');
					break;
				case 'doc_no':
					default_title = MyLang.getMsg('FLD_DOC_NO');
					break;
				case 'doc_title':
					default_title = MyLang.getMsg('FLD_DOC_TITLE');
					break;
				case 'ghost_writer':
					default_title = MyLang.getMsg('FLD_GHOST_WRITER');
					break;
				case 'ghost_writer_name':
					default_title = MyLang.getMsg('FLD_GHOST_WRITER_NAME');
					break;
				case 'final_approve_no':
					default_title = MyLang.getMsg('FLD_FINAL_APPROVE_NO');
					break;
				case 'final_approved_or_rejected_date':
					default_title = MyLang.getMsg('FLD_FINAL_APPROVED_OR_REJECTED_DATE');
					break;
				case 'final_approver_or_rejector':
					default_title = MyLang.getMsg('FLD_FINAL_APPROVER_OR_REJECTOR');
					break;
			}
			return default_title;
		},

		/**
		 * requestAdminConsoleListConfig
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestDocListConfig: function(callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				WorkflowConfig._requestDocListConfigOid(callback, aNumRetry);
			} else {
				WorkflowConfig._requestDocListConfig(callback, aNumRetry);
			}
		},

		/**
		 * _requestDocListConfigOid
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestDocListConfigOid: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/getdoclistconfig?hl=' + SATERAITO_LANG,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);
					WorkflowConfig.docListConfig = jsonData;
					callback(jsonData);
				},
				failure: function()
				{
					// 失敗時
					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						WorkflowConfig._requestDocListConfigOid(callback, (aNumRetry + 1));

					} else {
					}
				}
			});
		},

		/**
		 * _requestDocListConfig
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestDocListConfig: function(callback, aNumRetry)
		{

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				Sateraito.MiniMessage.showLoadingMessage();
			}

			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/getdoclistconfig?hl=' + SATERAITO_LANG, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[getdoclistconfig](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						// 全画面ロードマスクを消去
						DisplayMgr.hideLoadMask();
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{
						Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

						if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
							// リトライ
							WorkflowConfig._requestDocListConfig(callback, (aNumRetry + 1));
						} else {
							// 全画面ロードマスクを消去
							DisplayMgr.hideLoadMask();
							// エラーメッセージ
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}

				var jsonData = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				var jsonData = response.data;
				var doc_list_config = jsonData.doc_list_config;
				//var doc_list_custom_columns = jsonData.doc_list_custom_columns;

				WorkflowConfig.docListConfig = doc_list_config;
				// コールバックをキック
				callback(doc_list_config);

			}, Sateraito.Util.requestParam());
		}

	};

	NumUtil = {

		// (すべての変数に格納する値は0オリジンとする)
		addComma: function(x) { // 引数の例としては 95839285734.3245
			var s = "" + x; // 確実に文字列型に変換する。例では "95839285734.3245"
			var p = s.indexOf("."); // 小数点の位置を0オリジンで求める。例では 11
			if (p < 0) { // 小数点が見つからなかった時
				p = s.length; // 仮想的な小数点の位置とする
			}
			var r = s.substring(p, s.length); // 小数点の桁と小数点より右側の文字列。例では ".3245"
			for (var i = 0; i < p; i++) { // (10 ^ i) の位について
				var c = s.substring(p - 1 - i, p - 1 - i + 1); // (10 ^ i) の位のひとつの桁の数字。例では "4", "3", "7", "5", "8", "2", "9", "3", "8", "5", "9" の順になる。
				if (c < "0" || c > "9") { // 数字以外のもの(符合など)が見つかった
					r = s.substring(0, p - i) + r; // 残りを全部付加する
					break;
				}
				if (i > 0 && i % 3 == 0) { // 3 桁ごと、ただし初回は除く
					r = "," + r; // カンマを付加する
				}
				r = c + r; // 数字を一桁追加する。
			}
			return r; // 例では "95,839,285,734.3245"
		},

		/**
		 * removeComma
		 */
		removeComma: function(aNumString)
		{
			if (typeof(aNumString) == 'undefined') {
				return '';
			}
			if (aNumString == null) {
				return '';
			}
			value = '' + aNumString;
			return value.split(',').join('');
		}
	};

	/**
	 * その他の設定
	 */
	OtherSetting = {



		/**
		 * requestOtherSetting
		 *
		 * その他の設定の取得
		 *
		 * @param {Function} callback
		 */
		requestOtherSetting: function(callback)
		{
			if (IS_OPENID_MODE) {
				OtherSetting._requestOtherSettingOid(callback);
			} else {
				OtherSetting._requestOtherSetting(callback);
			}
		},

		/**
		 * _requestOtherSetting
		 *
		 * ガジェットIO版
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestOtherSetting: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			SateraitoUI.showLoadingMessage();

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/othersetting/getothersetting';
			gadgets.io.makeRequest(url, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					SateraitoUI.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						OtherSetting._requestOtherSetting(callback, (aNumRetry + 1));
					} else {
						// １０回リトライしたがだめだった
						DisplayMgr.hideLoadMask();
						if (response.rc == 401) {
							// ガジェットタイムアウト
							SateraitoUI.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));
						} else {
							SateraitoUI.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}

					return;
				}

				// 読込中メッセージを消去
				SateraitoUI.clearMessage();

				var jsondata = response.data;
				// コールバックをキック
				callback(jsondata);
			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestOtherSettingOid
		 *
		 * OpenID版
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestOtherSettingOid: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			OidMiniMessage.showLoadingMessage();

			// リクエスト
			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/othersetting/oid/getothersetting';
			Ext.Ajax.request({
				url: url,
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						(function(){
							OtherSetting._requestOtherSettingOid(callback, (aNumRetry + 1));
						}).defer(1000);

					} else {
						// １０回リトライしてもだめだった
						DisplayMgr.hideLoadMask();
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * requestUpdateOtherSettingAdmin
		 *
		 * その他の設定を保存
		 *
		 * @param {object} aSetting
		 * @param {Function} callback
		 */
		requestUpdateOtherSettingAdmin: function(aSetting, callback)
		{
			// 更新中メッセージを表示
			SateraitoUI.showLoadingMessage(MyLang.getMsg('UPDATING'));

			var postData = aSetting;

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/othersetting/updateothersettingadmin';
			gadgets.io.makeRequest(url, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					// 更新系は失敗したときはリトライしない（複数行の作成を回避するため）
					// 読込中メッセージを消去
					SateraitoUI.clearMessage();

					// コールバックをキック
					callback(false);
					return;
				}

				// 読込中メッセージを消去
				SateraitoUI.clearMessage();

				// コールバックをキック
				callback(true);

			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * requestUpdateImpersonateEmail
		 *
		 * 現在ログイン中のユーザーを、Directory APIコール用の管理者メールアドレスとしてシステムに保存する（実行関数）
		 *
		 * @param {function} callback
		 */
		requestUpdateImpersonateEmail: function(callback)
		{
			if (IS_OPENID_MODE) {
				OtherSetting._requestUpdateImpersonateEmailOid(callback);
			}
			else {
				OtherSetting._requestUpdateImpersonateEmail(callback);
			}
		},

		/**
		 * _requestUpdateImpersonateEmail
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestUpdateImpersonateEmail: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			SateraitoUI.showLoadingMessage();

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/othersetting/updateimpersonateemail';
			gadgets.io.makeRequest(url, function(response){

				// 読込中メッセージを消去
				SateraitoUI.clearMessage();

				if (!response.data) {
					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);
					SateraitoUI.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);
					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						OtherSetting._requestUpdateImpersonateEmail(callback, (aNumRetry + 1));
					} else {
						// エラーメッセージ
						if(response.rc == 401){
							SateraitoUI.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						}else{
							SateraitoUI.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}
				// コールバックをキック
				var jsondata = response.data;
				callback(jsondata);
			}, Sateraito.Util.requestParam(true, {}));
		},

		/**
		 * requestIsUserAdminOAuth2
		 *
		 * ログイン中のユーザーが新Google Apps Marketplace経由でインストールをしていて、かつGoogleApps特権管理者である場合、
		 * コールバックオブジェクトobj.is_admin_oauth2=trueとなる
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestIsUserAdminOAuth2: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			SateraitoUI.showLoadingMessage();

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/datafetcher/isuseradminoauth2';
			gadgets.io.makeRequest(url, function(response){

				// 読込中メッセージを消去
				SateraitoUI.clearMessage();

				if (!response.data) {
					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);
					SateraitoUI.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);
					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						OtherSetting._requestUpdateImpersonateEmail(callback, (aNumRetry + 1));
					} else {
						// エラーメッセージ
						if(response.rc == 401){
							SateraitoUI.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						}else{
							SateraitoUI.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
					return;
				}
				// コールバックをキック
				var jsondata = response.data;
				callback(jsondata);
			}, Sateraito.Util.requestParam());
		},

		/**
		 * _requestUpdateImpersonateEmailOid
		 *
		 * @param {Function} callback
		 * @param {number} aNumRetry
		 */
		_requestUpdateImpersonateEmailOid: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
				// 読込中メッセージを表示
				OidMiniMessage.showLoadingMessage();
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/othersetting/oid/updateimpersonateemail',
				method: 'POST',
				timeout: 1000 * 120,
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);
					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();
					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);
					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						// リトライ
						OtherSetting._requestUpdateImpersonateEmailOid(callback, (aNumRetry + 1));
					} else {
						// １０回リトライしてもだめだった
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * updateImpersonateEmail
		 *
		 * 現在ログイン中のユーザーを、Directory APIコール用の管理者メールアドレスとしてシステムに保存する
		 */
		updateImpersonateEmail: function()
		{
			OtherSetting.requestUpdateImpersonateEmail(function(){
				Ext.Msg.show({
					title: MyLang.getMsg('WORKFLOW'),
					icon: Ext.MessageBox.INFO,
					msg: MyLang.getMsg('SETTING_SAVED'),
					buttons: Ext.Msg.OK
				});
			});
		}
	};


	DisplayMgr = {

		loadMask: null,
		_isLoadMaskShown: false,

		/**
		 * adjustByViewportWidth
		 *
		 * 幅の大きさをビューポートの幅と比較し、大きすぎたらビューポートの幅を返す
		 *
		 * @param {number} aWidth
		 * @return {number} aWidthがビューポートの幅より大きい場合、ビューポートの幅を返す
		 */
		adjustByViewportWidth: function(aWidth)
		{
			var retWidth = aWidth;

			Ext.ComponentMgr.all.each(function(aComponent){
				if (aComponent.isXType('viewport')) {
					if (aComponent.getWidth() < aWidth) {
						retWidth = aComponent.getWidth();
						return false;
					}
				}
			});

			return retWidth;
		},

		/**
		 * adjustByViewportHeight
		 *
		 * 高さパラメータをビューポートの高さと比較し、大きすぎたらビューポートの高さを返す
		 *
		 * @param {number} aHeight
		 * @return aHeightがビューポートの高さより大きい場合、ビューポートの高さを返す
		 */
		adjustByViewportHeight: function(aHeight)
		{
			var retHeight = aHeight;

			Ext.ComponentMgr.all.each(function(aComponent){
				if (aComponent.isXType('viewport')) {
					if (aComponent.getHeight() < aHeight) {
						retHeight = aComponent.getHeight();
						return false;
					}
				}
			});

			return retHeight;
		},

		/**
		 * showLoadMask
		 *
		 * 全画面ロードマスクを表示し、フラグを立てる
		 */
		showLoadMask: function()
		{
			DisplayMgr.loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg: MyLang.getMsg('LOADING')
			})
			DisplayMgr.loadMask.show();
			DisplayMgr._isLoadMaskShown = true;
		},

		/**
		 * hideLoadMask
		 *
		 * 全画面ロードマスクを消し、フラグを落とす
		 */
		hideLoadMask: function()
		{
			if (DisplayMgr.loadMask != null) {
				DisplayMgr.loadMask.hide();
			}
			DisplayMgr._isLoadMaskShown = false;
		},

		/**
		 * isLoadMaskShown
		 *
		 * 全画面ロードマスクが表示中かどうか確認
		 *
		 * @return {boolean} 全画面ロードマスクが表示中ならtrue
		 */
		isLoadMaskShown: function()
		{
			return DisplayMgr._isLoadMaskShown;
		},

		/**
		 * toSpanWithTitle
		 *
		 * @param {string} aName
		 * @param {string} aEmail
		 */
		toSpanWithTitle: function(aName, aEmail)
		{
			if (aName == null) {
				aName = '';
			}
			if (aEmail == null) {
				aEmail = '';
			}
			//return '<span dummy_for_sort="' + aName + '" title="' + aEmail + '">' + aName + '</span>';
			return '<span dummy_for_sort="' + Sateraito.Util.escapeHtml(aName) + '" title="' + Sateraito.Util.escapeHtml(aEmail) + '">' + Sateraito.Util.escapeHtml(aName) + '</span>';
		},

		/**
		 * openPopup
		 *
		 * @param {String} aUrl
		 */
		openPopup: function (aUrl)
		{
			var popup = window.open(aUrl, MyLang.getMsg('SIGN_IN'));
			// Check every 1000 ms if the popup is closed.
			finishedInterval = setInterval(function() {
				// If the popup is closed, we've either finished OpenID, or the user closed it. Verify with the server in case the
				// user closed the popup.
				if (popup.closed) {
					LoginMgr.checkUser(SATERAITO_MY_SITE_URL, SATERAITO_GOOGLE_APPS_DOMAIN);
					clearInterval(finishedInterval);
				}
			}, 1000);
		}
	};

	CsvExportMgr = {
		// ファイルをダウンロード（取得できるまで定期的にチェック）
		_downloadFileOid : function(request_token, timeout_ms, callback)
		{
			// 開始時間
			var st = new Date().getTime();

			// ダウンロードされるまで定期的にチェック（5秒ごとに）
			$.timer(5000, function(timer){

				// ファイルチェック
				Ext.Ajax.request({
					url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid/checkcsvtaskstatus?request_token=' + encodeURIComponent(request_token) + '&hl=' + SATERAITO_LANG,
					success: function(response, options)
					{
						var jsonData = Ext.decode(response.responseText);

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();

						// ファイルあり
						if(jsonData.status == 'SUCCESS'){
							// ダウンロード
							location.href = jsondata.download_url;
							timer.stop();
							// コールバックをキック
							callback(true, jsonData.code);
						}
						// エラー
						else if(jsonData.status == 'FAILED')
						{
							timer.stop();
							// コールバックをキック
							callback(false, jsonData.code);
						}
						// ファイルなし（まだできていないので引き続きチェック）
						else
						{
							// タイムアウトチェック
							var passed_ms = Math.floor(new Date().getTime() - st);
							var isTimeout = timeout_ms >= 0 && passed_ms > timeout_ms;
							if(isTimeout)
							{
								timer.stop();
								// コールバックをキック
								callback(false, jsonData.code);
							}
						}
					},
					failure: function()
					{
						timer.stop();
						// コールバックをキック
						callback(false, '');
					}
				});

			});

		},

		// ファイルをダウンロード（取得できるまで定期的にチェック）
		_downloadFile : function(request_token, timeout_ms, callback)
		{
			// 開始時間
			var st = new Date().getTime();

			// ダウンロードされるまで定期的にチェック（5秒ごとに）
			$.timer(5000, function(timer){

				// ファイルチェック
				var postData = {
				};
				gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/checkcsvtaskstatus?request_token=' + encodeURIComponent(request_token) + '&hl=' + SATERAITO_LANG, function(response){

					if (!response.data) {

						// response error
						var err = response.errors[0];
						Sateraito.Util.console('[checkcsvtaskstatus]' + err);

						// エラーメッセージ
						if(response.rc == 401){
							//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
							Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
						}
						timer.stop();
						callback(false, '');
						return;
					}

					var jsonData = response.data;
					// リトライしない
					// ファイルあり
					if(jsonData.status == 'SUCCESS'){
						timer.stop();
						// ダウンロード
						//location.href = jsonData.download_url
						WorkflowUser.requestToken(function(jsonData2){
							var download_url = jsonData.download_url;
							if(download_url.indexOf('?') < 0){
								download_url = download_url + '?' + 'token=' + encodeURIComponent(jsonData2.token);
							}else{
								download_url = download_url + '&' + 'token=' + encodeURIComponent(jsonData2.token);
							}
							$('#dummy_frame').attr('src', download_url);
						});;
						// コールバックをキック
						callback(true, jsonData.code);
					}
					// エラー
					else if(jsonData.status == 'FAILED')
					{
						timer.stop();
						// コールバックをキック
						callback(false, jsonData.code);
					}
					// ファイルなし（まだできていないので引き続きチェック）
					else
					{
						// タイムアウトチェック
						var passed_ms = Math.floor(new Date().getTime() - st);
						var isTimeout = timeout_ms >= 0 && passed_ms > timeout_ms;
						if(isTimeout)
						{
							timer.stop();
							// コールバックをキック
							callback(false, jsonData.code);
						}
					}
				}, Sateraito.Util.requestParam(true, postData));

			});

		},

		/**
		 * exportCsv
		 *
		 * @param {string} aExportUrl
		 * @param {bool} aIsAdmin:管理者としてのエクスポートか
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		exportCsv: function(aExportUrl, aIsAdmin, callback, aNumRetry)
		{

			if (IS_OPENID_MODE) {
				CsvExportMgr._exportCsvOid(aExportUrl, aIsAdmin, callback, aNumRetry);
			} else {
				CsvExportMgr._exportCsv(aExportUrl, aIsAdmin, callback, aNumRetry);
			}
		},

		/**
		 * _exportCsvOid
		 *
		 * @param {string} aExportUrl
		 * @param {bool} aIsAdmin:管理者としてのエクスポートか
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_exportCsvOid: function(aExportUrl, aIsAdmin, callback, aNumRetry)
		{
			// 読込中メッセージを表示
			if (!DisplayMgr.isLoadMaskShown()) {
				OidMiniMessage.showLoadingMessage();
			}

			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			var postData = {
				'is_admin': aIsAdmin,
				'hl': SATERAITO_LANG
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/oid' + aExportUrl,
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					var jsonData = Ext.decode(response.responseText);

					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					// CSVの作成が終わるまで定期的にチェックし終わったらダウンロード（最大 300秒まつ）
					CsvExportMgr._downloadFileOid(jsonData.request_token, 300000, callback);

				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					// リトライしない
					//if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
					if (aNumRetry < 1) {

						// リトライ
						CsvExportMgr._exportCsvOid(aExportUrl, aIsAdmin, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
//						OidMiniMessage.showErrMiniMessage(MyLang.getMsg('FAILED_TO_LOAD_SETTINGS'));

						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _exportCsv
		 *
		 * @param {String} aExportUrl
		 * @param {bool} aIsAdmin:管理者としてのエクスポートか
		 * @param {Function} callback
		 * @param {Number} aNumRetry
		 */
		_exportCsv: function(aExportUrl, aIsAdmin, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('EXPORTING'));

			var postData = {
				'is_admin': aIsAdmin,
				'hl': SATERAITO_LANG
			};
			gadgets.io.makeRequest(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + aExportUrl, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console('[exportcsv](' + aNumRetry + ')' + err);

					// エラーメッセージ
					if(response.rc == 401){
						//Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('ERROR_TIMEOUT'));	// タイムアウトメッセージは消さない
					}else{

						// リトライしない
						if (aNumRetry < 1) {

							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);
							// リトライ
							CsvExportMgr._exportCsv(aExportUrl, aIsAdmin, callback, (aNumRetry + 1));

						} else {
							// １０回リトライしたがだめだった

							// メッセージを消去
							Sateraito.MiniMessage.clearMessage();
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_EXPORTING'), 10);
						}
						callback(false, '');
					}
					return;
				}

				var jsonData = response.data;

				// CSVの作成が終わるまで定期的にチェックし終わったらダウンロード（最大 300秒まつ）
				CsvExportMgr._downloadFile(jsonData.request_token, 300000, callback);

			}, Sateraito.Util.requestParam(true, postData));
		}

	};

  /**
	 * 公開文書に追加できるコメントを管理するモジュール
	 * 返信コメントもできる他、ファイルも添付可能
	 */
	DocCommentPublic = {

		/**
		 * addNewCommentPublic
		 *
		 * コメントの追加を実行します
		 *
		 * @param {Object} ボタンエレメント
		 */
		addNewCommentPublic: function(aElement)
		{
			// 最終確認メッセージ表示
			Ext.Msg.show({
				icon: Ext.MessageBox.QUESTION,
				msg: MyLang.getMsg('DOC_COMMENT_ADD_MSG'),
				buttons: Ext.Msg.OKCANCEL,
				fn: function(buttonId)
				{
					if (buttonId == 'ok') {
						DocCommentPublic._addNewCommentPublic(aElement);
					}
				}
			});
		},

		/**
		 * _addNewCommentPublic
		 *
		 * @param {Object} aElement
		 */
		_addNewCommentPublic: function(aElement)
		{
			var docId = $(aElement).attr('doc_id');
			var newCommentId = $(aElement).attr('new_comment_id');
			var replyToCommentId = $(aElement).attr('reply_to_comment_id');
			var comment = Ext.getCmp('comment_tree_textarea_' + docId + '_' + replyToCommentId).getRawValue();
			// コメントとキャンセルの２つのボタンをdisable
			$('#comment_tree_textarea_buttons_render_area_' + docId + '_' + replyToCommentId).find(':input').attr('disabled', 'disabled');

			DocCommentPublic.requestAddNewComment(newCommentId, docId, replyToCommentId, comment, function(){
				// コメントとキャンセルの２つのボタンをenable
				$('#comment_tree_textarea_buttons_render_area_' + docId + '_' + replyToCommentId).find(':input').removeAttr('disabled');
				Ext.Msg.show({
					icon: Ext.MessageBox.INFO,
					msg: MyLang.getMsg("DOC_COMMENT_ADD_SUCCESS"),
					buttons: Ext.Msg.OK,
					fn: function()
					{
						if (replyToCommentId == '__not_set') {
							// ルート下コメントの追加だった場合
							// 新しいコメントIDを取得
							DocCommentPublic.requestNewCommentId(function(aNewCommentId){
								// コメント入力ボックスをクリア
								Ext.getCmp('comment_tree_textarea_' + docId + '_' + replyToCommentId).setValue('');
								// ファイル添付リンクのコメントID値を新規にする
								$('span.comment_file_attach_link[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').attr('comment_id', aNewCommentId);
								$('div.comment_attached_file_list_render_area[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').attr('comment_id', aNewCommentId);
								$('div.comment_attached_file_list_render_area[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').html('');
								// ボタンのコメントID値を新規にする
								$('#comment_tree_textarea_buttons_render_area_' + docId + '_' + replyToCommentId).find(':input[reply_to_comment_id=' + replyToCommentId + ']').attr('new_comment_id', aNewCommentId);
							});

						}
						// コメントツリー部を再描画
						DocCommentPublic.renderCommentTree(docId);
					}
				});
			});
		},

    /**
		 * addNewCommentPublicPlusSM
		 *
		 * コメントの追加を実行します
		 *
		 * @param {Object} ボタンエレメント
		 */
		addNewCommentPublicPlusSM: function(aElement)
		{
			// 最終確認メッセージ表示
			Ext.Msg.show({
				icon: Ext.MessageBox.QUESTION,
				msg: MyLang.getMsg('DOC_COMMENT_ADD_SEND_MAIL_MSG'),
				buttons: Ext.Msg.OKCANCEL,
				fn: function(buttonId)
				{
					if (buttonId == 'ok') {
						DocCommentPublic._addNewCommentPublicPlusSM(aElement);
					}
				}
			});
		},

		/**
		 * _addNewCommentPublicPlusSM
		 *
		 * @param {Object} aElement
		 */
		_addNewCommentPublicPlusSM: function(aElement)
		{
			var docId = $(aElement).attr('doc_id');
			var newCommentId = $(aElement).attr('new_comment_id');
			var replyToCommentId = $(aElement).attr('reply_to_comment_id');
			var comment = Ext.getCmp('comment_tree_textarea_' + docId + '_' + replyToCommentId).getRawValue();
      var isSendMail = true;

			// コメントとキャンセルの２つのボタンをdisable
			$('#comment_tree_textarea_buttons_render_area_' + docId + '_' + replyToCommentId).find(':input').attr('disabled', 'disabled');

			DocCommentPublic.requestAddNewCommentPlusSM(newCommentId, docId, replyToCommentId, comment, isSendMail, function(){
				// コメントとキャンセルの２つのボタンをenable
				$('#comment_tree_textarea_buttons_render_area_' + docId + '_' + replyToCommentId).find(':input').removeAttr('disabled');
				Ext.Msg.show({
					icon: Ext.MessageBox.INFO,
					msg: MyLang.getMsg("DOC_COMMENT_ADD_SUCCESS"),
					buttons: Ext.Msg.OK,
					fn: function()
					{
						if (replyToCommentId == '__not_set') {
							// ルート下コメントの追加だった場合
							// 新しいコメントIDを取得
							DocCommentPublic.requestNewCommentId(function(aNewCommentId){
								// コメント入力ボックスをクリア
								Ext.getCmp('comment_tree_textarea_' + docId + '_' + replyToCommentId).setValue('');
								// ファイル添付リンクのコメントID値を新規にする
								$('span.comment_file_attach_link[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').attr('comment_id', aNewCommentId);
								$('div.comment_attached_file_list_render_area[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').attr('comment_id', aNewCommentId);
								$('div.comment_attached_file_list_render_area[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').html('');
								// ボタンのコメントID値を新規にする
								$('#comment_tree_textarea_buttons_render_area_' + docId + '_' + replyToCommentId).find(':input[reply_to_comment_id=' + replyToCommentId + ']').attr('new_comment_id', aNewCommentId);
							});

						}
						// コメントツリー部を再描画
						DocCommentPublic.renderCommentTree(docId);
					}
				});
			});
		},

		/**
		 * attachFileToComment
		 *
		 * 新規コメントにファイルを添付するウィンドウを表示する
		 *
		 * @param {Object} aElement
		 */
		attachFileToComment: function(aElement)
		{
			var docId = $(aElement).attr('doc_id');
			var commentId = $(aElement).attr('comment_id');

			AttachFileToCommentWindow.showWindow(docId, commentId, function(){

				// ファイルが添付された場合

				DocCommentPublic.refreshAttachFileList(docId, commentId);

			});
		},

		/**
		 * cancelCommentPublic
		 *
		 * キャンセルボタンがクリックされた時の処理
		 * ルートレベルのコメント追加の場合、コメント入力ボックスは消さずに内容と添付ファイルのクリアだけおこなう
		 * 返信用のコメント入力ボックスの場合、コメント入力ボックスを画面から削除する
		 *
		 * @param {Object} aElement .. キャンセルボタンエレメント
		 */
		cancelCommentPublic: function(aElement)
		{
			var docId = $(aElement).attr('doc_id');
			var newCommentId = $(aElement).attr('new_comment_id');
			var replyToCommentId = $(aElement).attr('reply_to_comment_id');

			if (replyToCommentId == '__not_set') {

				// ルートレベルのコメント入力ボックスの場合

				// コメント入力ボックスをクリア
				Ext.getCmp('comment_tree_textarea_' + docId + '_' + replyToCommentId).setValue('');
				// コメント入力ボックスの高さを元に戻す
				Ext.getCmp('comment_tree_textarea_' + docId + '_' + replyToCommentId).setHeight(DocCommentPublic.DEFAULT_TEXTAREA_HEIGHT);
				// ファイル添付リンクのエリアをクリアする
				$('div.comment_attached_file_list_render_area[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').html('');
				// 「コメント」ボタンをdisableにする
				$('#comment_tree_textarea_buttons_render_area_' + docId + '_' + replyToCommentId).find(':input.comment_button').attr('disabled', 'disabled');
			} else {

				// 返信用のコメント入力ボックスの場合

				// コメント入力ボックスを削除する
				$('div.comment_reply_render_area[doc_id=' + docId + '][reply_to_comment_id=' + replyToCommentId + ']').remove();
				// もとの「返信」リンクを表示する
				$('span.comment_reply_link[doc_id=' + docId + '][comment_id=' + replyToCommentId + ']').show();
			}
		},

		/**
		 * createReplyCommentArea
		 *
		 * 返信コメント入力エリアを作成する
		 * 「返信」リンクをクリックしたらキックされる
		 *
		 * @param {Object} aElement ... 「返信する」ボタンエレメント
		 */
		createReplyCommentArea: function(aElement)
		{
			DocCommentPublic.requestNewCommentId(function(aNewCommentId){
				var docId = $(aElement).attr('doc_id');
				var commentId = $(aElement).attr('comment_id');

				// テキストボックス描画用領域のhtml
				var vHtml = DocCommentPublic.createCommentBoxHtml(docId, aNewCommentId, commentId);
				// 返信ボタンを非表示にし、テキストボックス描画領域のhtmlを表示
				$(aElement).hide();
				$(aElement).parent('p.comment_footer[comment_id=' + commentId + ']').after('<div class="comment_reply_render_area" style="margin-left:20px;margin-top:15px;" doc_id="' + docId + '" reply_to_comment_id="' + commentId + '">' + vHtml + '</div>');

				// テキストボックスを描画
				DocCommentPublic.renderCommentBox(docId, commentId);
			});
		},

		/**
		 * createCommentBoxHtml
		 *
		 * コメント入力ボックスを描画するための領域をコメントボタンを含んだhtmlを返す
		 *
		 * @param {string} aDocId
		 * @param {string} aNewCommentId
		 * @param {string} aReplyToCommentId
		 */
		createCommentBoxHtml: function(aDocId, aNewCommentId, aReplyToCommentId)
		{
			var vHtml = '';
			vHtml += '<table style="width:100%">';
			vHtml += '<tr>';
			vHtml += '<td id="comment_tree_textarea_add_new_render_area_' + aDocId + '_' + aReplyToCommentId + '" style="width:50%;"></td>';
			vHtml += '<td style="vertical-align:top;">';
			// ファイルの添付リンク
			vHtml += '<span class="link_cmd comment_file_attach_link"';
			vHtml += ' style="margin-left:5px;"';
			vHtml += ' onclick="DocCommentPublic.attachFileToComment(this);" doc_id="' + aDocId + '" reply_to_comment_id="' + aReplyToCommentId + '" comment_id="' + aNewCommentId + '">';
			vHtml += '<img src="' + SATERAITO_MY_SITE_URL + '/images/clip.png" style="vertical-align:middle;">';
			vHtml += MyLang.getMsg('DOC_ATTACHMENT_FILE') + '</span>';
			// ファイル一覧表示部
			vHtml += '<div style="margin:5px;" class="comment_attached_file_list_render_area" doc_id="' + aDocId + '" reply_to_comment_id="' + aReplyToCommentId + '" comment_id="' + aNewCommentId + '">';
			vHtml += '</div>';
			vHtml += '</td>';
			vHtml += '</tr>';
			vHtml += '</table>';

			vHtml += '<div id="comment_tree_textarea_buttons_render_area_' + aDocId + '_' + aReplyToCommentId + '" style="margin-bottom:5px;margin-top:5px;">';
			vHtml += '<input type="button" class="comment_button" value="' + MyLang.getMsg('DOC_COMMENT') + '" doc_id="' + aDocId + '" new_comment_id="' + aNewCommentId + '" reply_to_comment_id="' + aReplyToCommentId + '"';
			vHtml += ' onclick="DocCommentPublic.addNewCommentPublic(this);" disabled>';
			vHtml += '&nbsp;';

      vHtml += '<input type="button" class="comment_button" value="' + MyLang.getMsg("POST_COMMENT_PLUS_SEND_MAIL") + '" doc_id="' + aDocId + '" new_comment_id="' + aNewCommentId + '" reply_to_comment_id="' + aReplyToCommentId + '"';
			vHtml += ' onclick="DocCommentPublic.addNewCommentPublicPlusSM(this);" disabled>';
			vHtml += '&nbsp;';

			vHtml += '<input type="button"  value="' + MyLang.getMsg('CANCEL') + '" doc_id="' + aDocId + '" new_comment_id="' + aNewCommentId + '" reply_to_comment_id="' + aReplyToCommentId + '"';
			vHtml += ' onclick="DocCommentPublic.cancelCommentPublic(this);">';
			vHtml += '</div>';
			return vHtml;
		},

		/**
		 * deleteAttachedFile
		 *
		 * コメント追加前の添付ファイルを削除する
		 *
		 * @param {Object} aElement .. 削除ボタンエレメント
		 */
		deleteAttachedFile: function(aElement)
		{
			var docId = $(aElement).attr('doc_id');
			var commentId = $(aElement).attr('comment_id');
			var fileId = $(aElement).attr('file_id');

			// コメントの添付ファイルを削除するリクエスト
			DocCommentPublic.requestDeleteCommentAttachedFile(docId, commentId, fileId, function(){
				// コメントの添付ファイル一覧表示をリフレッシュ
				DocCommentPublic.refreshAttachFileList(docId, commentId);
			});
		},

		/**
		 * openMailWindow
		 *
		 * @param {Object} aElement
		 */
		openMailWindow: function(aElement)
		{
			var email = $(aElement).attr('email');
			var userName = $(aElement).attr('user_name');

			var vUrl;
			if (Sateraito.Util.isSmartPhone() == true) {
				vUrl = 'https://mail.google.com/mail/mu/mp/333/#co/to=';
			} else {
				vUrl = 'https://mail.google.com/a/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/?view=cm&fs=1&tf=1&su=&to=';
			}
			vUrl += '"' + userName + '" <' + email + '>';
			var encodedHref = encodeURI(vUrl);
			window.open(encodedHref);
		},

		/**
		 * refreshAttachFileList
		 *
		 * 添付ファイル一覧を再描画
		 *
		 * @param {string} aDocId
		 * @param {string} aCommentId
		 */
		refreshAttachFileList: function(aDocId, aCommentId)
		{
			DocCommentPublic.requestCommentAttachedFileList(aDocId, aCommentId,  function(aResult){

				// 添付されたファイルを一覧に表示

				var vHtml = '';
				Ext.each(aResult, function(){
					var fileEntry = this;
					var fileNameSplited = ('' + fileEntry.file_name).split('.');
					var isPdf = '0';
					if (fileNameSplited[fileNameSplited.length - 1].toLowerCase() == 'pdf') {
						isPdf = '1';
					}
					vHtml += '<span class="link_cmd download_attached_file" file_id="' + fileEntry.file_id + '" downloadable="1" is_pdf="' + isPdf + '" is_comment_attach="1">';
					vHtml += fileEntry.file_name
					vHtml += '</span>&nbsp;';
          vHtml += '<img title="' + MyLang.getMsg('PREVIEW_ON_GOOGLE_DRIVE') + '" onclick="WorkflowDoc.openGoogleDocViewer(this);" file_id="' + fileEntry.file_id + '"  src="' + SATERAITO_MY_SITE_URL + '/images/preview.gif" style="cursor:pointer;width:15px;height:15px; vertical-align: bottom;" class="info" >&nbsp;';
					vHtml += '<input type="button" value="' + MyLang.getMsg('DELETE_FILE') + '" doc_id="' + aDocId + '" comment_id="' + aCommentId + '" file_id="' + fileEntry.file_id + '"';
					vHtml += ' onclick="DocCommentPublic.deleteAttachedFile(this);">';
					vHtml += '<br>';
				});
				$('div.comment_attached_file_list_render_area[doc_id=' + aDocId + '][comment_id=' + aCommentId + ']').html(vHtml);
			});
		},

		/**
		 * renderCommentTree
		 *
		 * 既存コメントのツリーを表示
		 *
		 * @param {string} aDocId
		 */
		renderCommentTree: function(aDocId)
		{
			// あるコメントの子コメントを取得する関数
			var getChildCommentEntry = function(aAllCommentList, aCommentId){
				var ret = [];
				Ext.each(aAllCommentList, function(){
					var commentEntry = this;
					if (('' + commentEntry.reply_to_comment_id) == aCommentId) {
						ret.push(commentEntry);
					}
				});
				return ret;
			};

			// コメントエントリーからhtmlを取得する関数
			var getCommentHtml = function(commentEntry, indent){
				var vHtml = '';
				vHtml += '<div class="comment_entry" comment_id="' + commentEntry.comment_id + '" style="margin-left:' + indent + 'px;margin-bottom:10px;background-color:#F8F8F8;padding:5px;">';
				// 名前とメールアドレス、投稿時刻
				vHtml += '<p>';
				vHtml += '<span style="font-weight:bold;" title="' + Sateraito.Util.escapeHtml(commentEntry.author_email) + '">';
				vHtml += Sateraito.Util.escapeHtml(commentEntry.author_name);
				vHtml += '</span>';
				vHtml += '&nbsp;';
				vHtml += '<span class="link_cmd" email="' + Sateraito.Util.escapeHtml(commentEntry.author_email) + '" user_name="' + Sateraito.Util.escapeHtml(commentEntry.author_name) + '" onclick="DocCommentPublic.openMailWindow(this);">';
				vHtml += Sateraito.Util.escapeHtml(commentEntry.author_email) + '</span>';
				vHtml += '&nbsp;&nbsp;&nbsp;' + Sateraito.Util.enterToBr(commentEntry.created_date);
				vHtml += '</p>';
				// コメント本文
				// IEで改行されない場合があるので
				//vHtml += '<p style="margin:8px;">';
				vHtml += '<p style="margin:8px;word-break:break-all;">';
				vHtml += Sateraito.Util.enterToBr(Sateraito.Util.escapeHtml(commentEntry.comment));
				vHtml += '</p>';
				// 返信リンク
				vHtml += '<p class="comment_footer" comment_id="' + commentEntry.comment_id + '">';
				if(!IS_PRINT_WINDOW){
					vHtml += '<span class="link_cmd comment_reply_link" onclick="DocCommentPublic.createReplyCommentArea(this);" doc_id="' + aDocId + '" comment_id="' + commentEntry.comment_id + '">';
					vHtml += MyLang.getMsg('DOC_COMMENT_REPLY') + '</span>';
				}
				// 添付ファイル
				if (commentEntry.attached_files.length > 0) {
					vHtml += '&nbsp;&nbsp;' + MyLang.getMsg('DOC_ATTACHMENT_FILE_DOWNLOAD') + '：&nbsp;';
					Ext.each(commentEntry.attached_files, function(){
						var attachedFile = this;
						var fileNameSplited = ('' + attachedFile.file_name).split('.');
						var isPdf = '0';
						if (fileNameSplited[fileNameSplited.length - 1].toLowerCase() == 'pdf') {
							isPdf = '1';
						}
						vHtml += '<span class="link_cmd download_attached_file" file_id="' + attachedFile.file_id + '" downloadable="1" is_pdf="' + isPdf + '" is_comment_attach="1">';
						vHtml += attachedFile.file_name + '</span>&nbsp;&nbsp;';
						vHtml += '<img title="' + MyLang.getMsg('PREVIEW_ON_GOOGLE_DRIVE') + '" onclick="WorkflowDoc.openGoogleDocViewer(this);" file_id="' + attachedFile.file_id + '"  src="' + SATERAITO_MY_SITE_URL + '/images/preview.gif" style="cursor:pointer;width:15px;height:15px; vertical-align: bottom;" class="info" >&nbsp;';
					});
				}
				vHtml += '</p>';
				vHtml += '</div>';
				return vHtml;
			};

			// commentIdの子コメントを描画
			var renderTree = function(aAllCommentList, aCommentId, indent){
				// 子コメントを抽出
				var childComments = getChildCommentEntry(aAllCommentList, aCommentId);
				Ext.each(childComments, function(){
					var commentEntry = this;
					var vHtml = getCommentHtml(commentEntry, indent);
					$('#comment_tree_render_area_' + aDocId).append(vHtml);
					// 子コメントを描画
					renderTree(aAllCommentList, commentEntry.comment_id, (indent + 20));
				});
			};

			// いったんコメントツリー全体をクリア
			$('#comment_tree_render_area_' + aDocId).html('');

			DocCommentPublic.requestComments(aDocId, function(aAllCommentList){
				renderTree(aAllCommentList, '__not_set', 0);
			});
		},

		/**
		 * renderPublicCommentArea
		 *
		 * 公開ドキュメントコメント一覧を描画する
		 *
		 * @param {string} aDocId ... 自分のドキュメントID
		 */
		renderPublicCommentArea: function(aDocId)
		{
			var replyToCommentId = '__not_set';
			var vHtml = '';
			DocCommentPublic.requestNewCommentId(function(aNewCommentId){

				// 新規コメント追加ボックス表示エリアhtmlを取得
				var vHtml = '';
				if(!IS_PRINT_WINDOW){
					vHtml += DocCommentPublic.createCommentBoxHtml(aDocId, aNewCommentId, replyToCommentId);
				}

				// 既存コメント表示エリア
				vHtml += '<div id="comment_tree_render_area_' + aDocId + '"></div>';
				// htmlを描画
				$('#comment_tree_area_' + aDocId).html(vHtml);
				// コメント入力ボックスをレンダリング
				if(!IS_PRINT_WINDOW){
					DocCommentPublic.renderCommentBox(aDocId, replyToCommentId);
				}
				// 既存コメントツリーをレンダリング
				DocCommentPublic.renderCommentTree(aDocId);
			});
		},

		DEFAULT_TEXTAREA_HEIGHT: 30,

		/**
		 * renderCommentBox
		 *
		 * コメント入力用テキストボックスを描画する
		 *
		 * @param {string} aDocId
		 * @param {string} aReplyToCommentId
		 */
		renderCommentBox: function(aDocId, aReplyToCommentId)
		{
			// コメント追加エリアをレンダリング
			var textarea = new Ext.form.TextArea({
				id: 'comment_tree_textarea_' + aDocId + '_' + aReplyToCommentId,
				emptyText: MyLang.getMsg('DOC_ADD_COMMENT'),
				grow: true,
				renderTo: 'comment_tree_textarea_add_new_render_area_' + aDocId + '_' + aReplyToCommentId,
				width: 400,
				growMin: DocCommentPublic.DEFAULT_TEXTAREA_HEIGHT,
				enableKeyEvents: true,
				docId: aDocId,
				replyToCommentId: aReplyToCommentId,
				enableOrDisableButtons: function(aTextarea)
				{
					// キーが押された時に「コメント」ボタンをenable/disable切替する
					var docId = aTextarea.docId;
					var textValue = ('' + aTextarea.getRawValue()).trim();
					if (textValue == '') {
						$('#comment_tree_textarea_buttons_render_area_' + aDocId + '_' + aReplyToCommentId).find(':input.comment_button').attr('disabled', 'disabled');
					} else {
						$('#comment_tree_textarea_buttons_render_area_' + aDocId + '_' + aReplyToCommentId).find(':input.comment_button').removeAttr('disabled');
					}
				},
				listeners: {
					blur: function(e)
					{
						var textarea = this;
						textarea.enableOrDisableButtons(textarea);
					},
					keyup: function(e)
					{
						var textarea = this;
						textarea.enableOrDisableButtons(textarea);
					}
				}
			});
		},

		/**
		 * requestCommentAttachedFileList
		 *
		 * コメントに添付されたファイルの一覧を取得
		 *
		 * @param {string} aDocId
		 * @param {string} aCommentId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestCommentAttachedFileList: function(aDocId, aCommentId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				DocCommentPublic._requestCommentAttachedFileListOid(aDocId, aCommentId, callback, aNumRetry);
			//} else if (IS_TOKEN_MODE) {
			//	DocCommentPublic._requestCommentAttachedFileListToken(aDocId, aCommentId, callback, aNumRetry);
			} else {
				DocCommentPublic._requestCommentAttachedFileList(aDocId, aCommentId, callback, aNumRetry);
			}
		},

		/**
		 * _requestCommentAttachedFileListOid
		 */
		_requestCommentAttachedFileListOid: function(aDocId, aCommentId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
				// 読込中メッセージを表示
				OidMiniMessage.showLoadingMessage();
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/oid/getcommentattachedfilelist?doc_id=' + encodeURIComponent(aDocId) + '&comment_id=' + encodeURIComponent(aCommentId) + '&hl=' + SATERAITO_LANG,
				method: 'GET',
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);
					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();
					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						DocCommentPublic._requestCommentAttachedFileListOid(aDocId, aCommentId, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},

		/**
		 * _requestCommentAttachedFileList
		 *
		 * @param {string} aDocId
		 * @param {string} aCommentId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestCommentAttachedFileList: function(aDocId, aCommentId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
				// 読込中メッセージを表示
				Sateraito.MiniMessage.showLoadingMessage();
			}

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/getcommentattachedfilelist?doc_id=' + encodeURIComponent(aDocId) + '&comment_id=' + encodeURIComponent(aCommentId) + '&hl=' + SATERAITO_LANG;
			gadgets.io.makeRequest(url, function(response) {

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						DocCommentPublic._requestCommentAttachedFileList(aDocId, aCommentId, callback, (aNumRetry + 1));
					} else {
						// １０回リトライしたがだめだった

						// 読込中メッセージを消去
						Sateraito.MiniMessage.clearMessage();

						// エラーメッセージ
						if(response.rc == 401){
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						}else{
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}

					return;
				}

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				var jsondata = response.data;
				// コールバックをキック
				callback(jsondata);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestNewCommentId
		 *
		 * 新しいコメントIDをリクエストする
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestNewCommentId: function(callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				DocCommentPublic._requestNewCommentIdOid(callback, aNumRetry);
//			} else if (IS_TOKEN_MODE) {
//				DocCommentPublic._requestNewCommentIdToken(callback, aNumRetry);
			} else {
				DocCommentPublic._requestNewCommentId(callback, aNumRetry);
			}
		},

		/**
		 * _requestNewCommentIdOid
		 */
		_requestNewCommentIdOid: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/oid/getnewcommentid',
				method: 'GET',
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);
					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();
					// コールバックをキック
					callback(jsondata.new_comment_id);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						DocCommentPublic._requestNewCommentIdOid(callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},
    /**
		 * _requestNewCommentIdToken
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
/*
		_requestNewCommentIdToken: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/token/getnewcommentid?token=' + USER_TOKEN,
				method: 'GET',
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);
					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();
					// コールバックをキック
					callback(jsondata.new_comment_id);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						DocCommentChecklist._requestNewCommentIdToken(callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
						// 読込中メッセージを消去
						Sateraito.MiniMessage.clearMessage();
					}
				}
			});
		},
*/
		/**
		 * _requestNewCommentId
		 *
		 * 新規コメントIDを取得
		 *
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestNewCommentId: function(callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/getnewcommentid';

			gadgets.io.makeRequest(url, function(response) {

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {
						DocCommentPublic._requestNewCommentId(callback, (aNumRetry + 1));
					} else {
						// １０回リトライしたがだめだった
						Sateraito.MiniMessage.showTimerMessage(Sateraito.Lang.getMsg('FAILED_TO_LOAD_SETTINGS'), 10);
					}

					return;
				}

				var jsondata = response.data;

				// コールバックをキック
				callback(jsondata.new_comment_id);

			}, Sateraito.Util.requestParam());
		},

		/**
		 * requestAddNewComment
		 *
		 * 新規コメントを追加
		 *
		 * @param {string} aDocId
		 * @param {string} aReplyToCommentId
		 * @param {string} aComment
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestAddNewComment: function(aNewCommentId, aDocId, aReplyToCommentId, aComment, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				DocCommentPublic._requestAddNewCommentOid(aNewCommentId, aDocId, aReplyToCommentId, aComment, callback, aNumRetry);
//			} else if(IS_TOKEN_MODE){
//        DocCommentPublic._requestAddNewCommentToken(aNewCommentId, aDocId, aReplyToCommentId, aComment, callback, aNumRetry);
      } else {
				DocCommentPublic._requestAddNewComment(aNewCommentId, aDocId, aReplyToCommentId, aComment, callback, aNumRetry);
			}
		},

		/**
		 * _requestAddNewComment
		 *
		 * 新規コメントを追加(ガジェットIO版)
		 *
		 * @param {string} aDocId
		 * @param {string} aReplyToCommentId
		 * @param {string} aComment
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestAddNewComment: function(aNewCommentId, aDocId, aReplyToCommentId, aComment, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('NOW_UPDATING'));

			var postData = {
				comment_id: aNewCommentId,
				doc_id: aDocId,
				reply_to_comment_id: aReplyToCommentId,
				comment: aComment,
        hl: SATERAITO_LANG
			};

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/addnewcomment';
			gadgets.io.makeRequest(url, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					// リトライしない

					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();

					// エラーメッセージ
					Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg("ADD_NEW_COMMENT_ERR_MSG"), 10);

					// エラー終了の場合、コールバックはコールしない

					return;
				}

				var jsondata = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsondata);

			}, Sateraito.Util.requestParam(true, postData));
		},
    /**
		 * _requestAddNewCommentOid
		 *
		 * @param {string} aNewCommentId
		 * @param {string} aDocId
		 * @param {string} aReplyToCommentId
		 * @param {string} aComment
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestAddNewCommentOid: function(aNewCommentId, aDocId, aReplyToCommentId, aComment, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			OidMiniMessage.showLoadingMessage(MyLang.getMsg('NOW_UPDATING'));

			var postData = {
				comment_id: aNewCommentId,
				doc_id: aDocId,
        reply_to_comment_id: aReplyToCommentId,
				comment: aComment,
        hl: SATERAITO_LANG
			};
			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/oid/addnewcomment',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					var jsondata = Ext.decode(response.responseText);
					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// エラーメッセージ
					OidMiniMessage.showNormalMiniMessage(MyLang.getMsg("ADD_NEW_COMMENT_ERR_MSG"), 10);

					// エラー終了の場合、コールバックはコールしない
				}
			});
		},
		/**
		 * _requestAddNewCommentToken
		 */

    /**
		 * requestAddNewCommentPlusSM
		 *
		 * 新規コメントを追加
		 *
		 * @param {string} aDocId
		 * @param {string} aReplyToCommentId
		 * @param {string} aComment
		 * @param {string} aIsSendMail
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestAddNewCommentPlusSM: function(aNewCommentId, aDocId, aReplyToCommentId, aComment, aIsSendMail, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				DocCommentPublic._requestAddNewCommentPlusSMOid(aNewCommentId, aDocId, aReplyToCommentId, aComment, aIsSendMail, callback, aNumRetry);
//			} else if(IS_TOKEN_MODE){
//        DocCommentPublic._requestAddNewCommentPlusSMToken(aNewCommentId, aDocId, aReplyToCommentId, aComment, aIsSendMail, callback, aNumRetry);
      } else {
				DocCommentPublic._requestAddNewCommentPlusSM(aNewCommentId, aDocId, aReplyToCommentId, aComment, aIsSendMail, callback, aNumRetry);
			}
		},

		/**
		 * _requestAddNewCommentPlusSM
		 *
		 * 新規コメントを追加(ガジェットIO版)
		 *
		 * @param {string} aDocId
		 * @param {string} aReplyToCommentId
		 * @param {string} aComment
		 * @param {string} aIsSendMail
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestAddNewCommentPlusSM: function(aNewCommentId, aDocId, aReplyToCommentId, aComment, aIsSendMail, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('NOW_UPDATING'));

			var postData = {
				comment_id: aNewCommentId,
				doc_id: aDocId,
				reply_to_comment_id: aReplyToCommentId,
				comment: aComment,
        is_send_mail: aIsSendMail,
        hl: SATERAITO_LANG
			};

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/addnewcomment';
			gadgets.io.makeRequest(url, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					// リトライしない

					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();

					// エラーメッセージ
					Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg("ADD_NEW_COMMENT_ERR_MSG"), 10);

					// エラー終了の場合、コールバックはコールしない

					return;
				}

				var jsondata = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsondata);

			}, Sateraito.Util.requestParam(true, postData));
		},

    /**
		 * _requestAddNewCommentPlusSMOid
		 */
		_requestAddNewCommentPlusSMOid: function(aNewCommentId, aDocId, aReplyToCommentId, aComment, aIsSendMail, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			OidMiniMessage.showLoadingMessage(MyLang.getMsg('NOW_UPDATING'));

			var postData = {
				comment_id: aNewCommentId,
				doc_id: aDocId,
				reply_to_comment_id: aReplyToCommentId,
				comment: aComment,
        is_send_mail: aIsSendMail,
        hl: SATERAITO_LANG
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/oid/addnewcomment',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();

					var jsondata = Ext.decode(response.responseText);
					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// エラーメッセージ
					OidMiniMessage.showNormalMiniMessage(MyLang.getMsg("ADD_NEW_COMMENT_ERR_MSG"), 10);

					// エラー終了の場合、コールバックはコールしない
				}
			});
		},

		/**
		 * requestDeleteCommentAttachedFile
		 *
		 * コメントに添付したファイルの削除をリクエストする
		 *
		 * @param {string} aDocId
		 * @param {string} aCommentId
		 * @param {string} aFileId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestDeleteCommentAttachedFile: function(aDocId, aCommentId, aFileId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				DocCommentPublic._requestDeleteCommentAttachedFileOid(aDocId, aCommentId, aFileId, callback, aNumRetry);
//			} else if(IS_TOKEN_MODE){
//        DocCommentPublic._requestDeleteCommentAttachedFileToken(aDocId, aCommentId, aFileId, callback, aNumRetry);
      } else {
				DocCommentPublic._requestDeleteCommentAttachedFile(aDocId, aCommentId, aFileId, callback, aNumRetry);
			}
		},

		/**
		 * _requestDeleteCommentAttachedFileOid
		 */
		_requestDeleteCommentAttachedFileOid: function(aDocId, aCommentId, aFileId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			OidMiniMessage.showLoadingMessage(MyLang.getMsg('NOW_UPDATING'));

			var postData = {
				doc_id: aDocId,
				comment_id: aCommentId,
				file_id: aFileId,
				'hl': SATERAITO_LANG
			};

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/oid/deletecommentattachedfile',
				method: 'POST',
				params: postData,
				success: function(response, options)
				{
					// 更新中メッセージを消去
					OidMiniMessage.clearMessage();

					var jsondata = Ext.decode(response.responseText);
					// コールバックをキック
					var deferTime = 1000;
          (function(){
            callback(jsondata);
          }).defer(deferTime);
				},
				failure: function()
				{
					// エラーメッセージ
					OidMiniMessage.showNormalMiniMessage(MyLang.getMsg("DELETE_COMMENT_ATTACHED_FILE_ERR_MSG"), 10);

					// エラー終了の場合、コールバックはコールしない
				}
			});
		},

		/**
		 * _requestDeleteCommentAttachedFile
		 */
		_requestDeleteCommentAttachedFile: function(aDocId, aCommentId, aFileId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 更新中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage(MyLang.getMsg('NOW_UPDATING'));

			var postData = {
				doc_id: aDocId,
				comment_id: aCommentId,
				file_id: aFileId,
				'hl': SATERAITO_LANG
			};

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach/deletecommentattachedfile';
			gadgets.io.makeRequest(url, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					// リトライしない

					// 読込中メッセージを消去
					Sateraito.MiniMessage.clearMessage();

					// エラーメッセージ
					Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg("DELETE_COMMENT_ATTACHED_FILE_ERR_MSG"), 10);

					// エラー終了の場合、コールバックはコールしない

					return;
				}

				var jsondata = response.data;

				// 更新中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				var deferTime = 1000;
        (function(){
          callback(jsondata);
        }).defer(deferTime);

			}, Sateraito.Util.requestParam(true, postData));
		},

		/**
		 * requestComments
		 *
		 * 公開ドキュメントに付加されたコメントを取得
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		requestComments: function(aDocId, callback, aNumRetry)
		{
			if (IS_OPENID_MODE) {
				DocCommentPublic._requestCommentsOid(aDocId, callback, aNumRetry);
//			} else if (IS_TOKEN_MODE) {
//				DocCommentPublic._requestCommentsToken(aDocId, callback, aNumRetry);
			} else {
				DocCommentPublic._requestComments(aDocId, callback, aNumRetry);
			}
		},

		/**
		 * _requestCommentsOid
		 */
		_requestCommentsOid: function(aDocId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// リクエスト
			Ext.Ajax.request({
				url: SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/oid/getcomments?doc_id=' + aDocId,
				method: 'GET',
				success: function(response, options)
				{
					var jsondata = Ext.decode(response.responseText);
					// 読込中メッセージを消去
					OidMiniMessage.clearMessage();
					// コールバックをキック
					callback(jsondata);
				},
				failure: function()
				{
					// 失敗時
					Sateraito.Util.console('retrying ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						DocCommentPublic._requestCommentsOid(aDocId, callback, (aNumRetry + 1));

					} else {

						// １０回リトライしたがだめだった
						// 読込中メッセージを消去
						OidMiniMessage.clearMessage();
					}
				}
			});
		},


		/**
		 * _requestComments
		 *
		 * @param {string} aDocId
		 * @param {function} callback
		 * @param {number} aNumRetry
		 */
		_requestComments: function(aDocId, callback, aNumRetry)
		{
			if (typeof(aNumRetry) == 'undefined') {
				aNumRetry = 1;
			}

			// 読込中メッセージを表示
			Sateraito.MiniMessage.showLoadingMessage();

			var url = SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/commentpublish/getcomments?doc_id=' + aDocId;
			gadgets.io.makeRequest(url, function(response){

				if (!response.data) {

					// response error
					var err = response.errors[0];
					Sateraito.Util.console(err);

					Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('RELOADING') + ' ' + aNumRetry);

					if (aNumRetry < Sateraito.EventController.MAX_RETRY) {

						// リトライ
						DocCommentPublic._requestComments(aDocId, callback, (aNumRetry + 1));

					} else {
						// １０回リトライしたがだめだった

						// 読込中メッセージを消去
						Sateraito.MiniMessage.clearMessage();

						// エラーメッセージ
						if(response.rc == 401){
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_TIMEOUT'), 60 * 60 * 24);
						}else{
							Sateraito.MiniMessage.showTimerMessage(MyLang.getMsg('ERROR_WHILE_LOADING'), 10);
						}
					}
				}

				var jsondata = response.data;

				// 読込中メッセージを消去
				Sateraito.MiniMessage.clearMessage();

				// コールバックをキック
				callback(jsondata);

			}, Sateraito.Util.requestParam());
		}
	};



	/**
	 * その他便利機能
	 */
	MyUtil = {

		/**
		 * isValidAppId
		 *
		 * @param {string} aAppId
		 */
		isValidAppId: function(aAppId)
		{
			// 開始文字がアルファベットで、
			// 文字種がアルファベット及び数字、アンダーバー、ハイフンかどうかチェック
			var re = new RegExp('^[a-zA-Z][a-zA-Z0-9_\-]+$');
			if (!re.test(aAppId)) {
				return false;
			}
			// アンダーバー５つが含まれていないかどうかチェック
			var splited = aAppId.split('_____');
			if (splited.length > 1) {
				return false;
			}

			return true;
		},

		getToken: function(){
			return USER_TOKEN;
		},

		setToken: function(token){
			USER_TOKEN = token;
		}
	};


  /**
	 * その他便利機能
	 */
	MyUtil = {

		/**
		 * isValidAppId
		 *
		 * @param {string} aAppId
		 */
		isValidAppId: function(aAppId)
		{
			// 開始文字がアルファベットで、
			// 文字種がアルファベット及び数字、アンダーバー、ハイフンかどうかチェック
			var re = new RegExp('^[a-zA-Z][a-zA-Z0-9_\-]+$');
			if (!re.test(aAppId)) {
				return false;
			}
			// アンダーバー５つが含まれていないかどうかチェック
			var splited = aAppId.split('_____');
			if (splited.length > 1) {
				return false;
			}

			return true;
		}
	};

  DocDetailWindow = {
    init: function(aDocId){
      // convert field
      var okToUpdateField = [];
      $('#template_body_' + aDocId).find('*').each(function(){
        var element = this;
        var name = $(element).attr('name');
        if (typeof(name) == 'undefined' || name == null || name == '') {
          // no operation
        } else if (name.toLowerCase() == 'process') {
          // 承認プロセスも、編集対象ではない
        } else {
          okToUpdateField.push(name);
        }
      });

      DocDetailWindow.showInputFields(okToUpdateField, aDocId);

      //
      // マスター参照ボタン処理
      //
      // ボタンの属性
      //
      // フォームのフィールドへの値アサイン
      // assign="data_key:shizai_code1;attribute_1:shizai_name1;attribute_2:shizai_tanka1" limit_selection="10101 10102"
      //   data_key ... マスター側のカラム名
      //   shizai_code1 ... inputのname
      //   limit_selection ... スペースで区切って列挙した値だけ表示
      //
      // カラム幅定義（デフォルト100px）
      // col_width="attribute_1:110;attribute2:120"
      FieldConvert.bindMasterSelectButtonEvent('template_body_' + aDocId, aDocId);

      //
      // Googleカレンダー予定作成画面表示ボタン処理
      //
      FieldConvert.bindEventToGoogleCalendarButtonEvent('template_body_' + aDocId, aDocId);

    },
    /**
		 * showInputFields
		 */
		showInputFields: function(aOkToUpdateField, aDocId, inReSubmitProcess, inAdminEditProcess)
		{
			var basicForm = Ext.ComponentMgr.get('form_panel_' + aDocId).getForm();

			Ext.each(aOkToUpdateField, function(){

				// 更新可能フィールドを表示する

				var fieldName = '' + this;

				var element = $('#template_body_' + aDocId).find(':input[name=' + fieldName + ']');
				var elementName = $(element).attr('name');
				if (typeof(elementName) == 'undefined') {
					elementName = '';
				}

				// 未定義はtextにする
				var elementType = $(element).attr('type');
				if (typeof(elementType) == 'undefined') {
					elementType = 'text';
				}
				elementType = elementType.toLowerCase();

				// コンボボックスの場合
				if ($(element).is('select')) {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// ボックスを表示
					$(element).show();
//					if(!inReSubmitProcess && !inAdminEditProcess){
//						$(element).removeAttr('disabled');
//					}
				}
				// テキストエリアの場合
				else if ($(element).is('textarea')) {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストエリアを表示
					$(element).show();
/*
					// スクロールが必須だとどうしても表示用のtextareaとの横幅の整合性が合わないのでここにもautosizeをセットする
					$(element).show(0, function(){
						$(element).autosize();
					});
*/
//					if(!inReSubmitProcess && !inAdminEditProcess){
//						$(element).removeAttr('disabled');
//					}
				}
				// チェックボックスの場合
				else if (elementType == 'checkbox') {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// ボックスを表示
					$(element).show();
//					if(!inReSubmitProcess && !inAdminEditProcess){
//						$(element).removeAttr('disabled');
//					}
				}
				// ラジオボックスの場合
				else if (elementType == 'radio') {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// ボックスを表示
					$(element).show();
//					if(!inReSubmitProcess && !inAdminEditProcess){
//						$(element).removeAttr('disabled');
//					}
				}
				// テキストボックスの場合
				else if ($(element).is('input') && elementType == 'text') {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストボックスを表示
					$(element).show();
//					if(!inReSubmitProcess && !inAdminEditProcess){
//						$(element).removeAttr('disabled');
//					}

					// 数値クラスの場合
					if ($(element).hasClass('number')) {
						FieldConvert._numberFieldConvert('template_body_' + aDocId, basicForm, element);
					}

					// 日付クラスの場合
					if ($(element).hasClass('date')) {
						//FieldConvert._dateFieldConvert('template_body_' + aDocId, basicForm, element);
						// いったん親divのなかにdisplay:noneがないかチェックし、あればshow
						var hiddenDivElements = $(element).parents('div:hidden');
						$(hiddenDivElements).show();
						// 日付入力コントロールにコンバート
						FieldConvert._dateFieldConvert('template_body_' + aDocId, basicForm, element);
						// もう一回隠す
						$(hiddenDivElements).hide();
					}
				}

				// HTML5で増えたインプットタイプに対応 2013/06/28
				else if ($(element).is('input') && $.inArray(elementType, ['date','datetime','datetime-local','month','week','time','number','range','search','tel','url','email','color']) >= 0) {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストボックスを表示
					$(element).show();
					if(!inReSubmitProcess && !inAdminEditProcess){
						$(element).removeAttr('disabled');
					}
				}

				else if (elementType == 'button') {
					// マスター選択ボタンの場合、表示する
					if ($(element).is('.sateraito_master_select')) {
						$(element).show();
					}
					// クリアーボタンの場合も、表示する
					if ($(element).is('.clear_button')) {
						$(element).show();
					}
				}
			});

			// 足し算・掛け算フィールドの変更ハンドラをセット
			$('#template_body_' + aDocId).find(':input').change(function(){
				Calc.calcAll('template_body_' + aDocId);
			});

			// クリアーボタンのイベントハンドラをセット
			FieldConvert.bindClearButtonEvent('template_body_' + aDocId);
		}
  };
})();