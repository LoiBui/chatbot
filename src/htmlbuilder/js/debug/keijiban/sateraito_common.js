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

		/**
		 * showDocument
		 *
		 * @param {string} aDocId
		 */
		showDocument: function(aDocId)
		{
			if (IS_OPENID_MODE) {
				// OpenIDモードの場合
				if (location.href.indexOf('docprint')) {
					// 印刷モードの場合
					window.open(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/docprint2/' + aDocId + '?hl=' + SATERAITO_LANG + '&token=' + LoginMgr.token);
				} else {
					// 印刷モード以外の場合
					window.open(SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/docdetail2/' + aDocId + '?hl=' + SATERAITO_LANG + '&token=' + LoginMgr.token);
				}
			} else {
				var option = {
					hideNextPrevButton: true
				};
				var closeWindowInstanceOnShow = null;
				var pageType = null;
				var isForPrint = false;
				var renderAreaId = '';
				DocDetailWindow.showWindow(aDocId, closeWindowInstanceOnShow, pageType, isForPrint, renderAreaId, option);
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
		 * dateDiff
		 *
		 * @param {string} aDateSmall YYYY-MM-DD
		 * @param {string} aDateBig YYYY-MM-DD
		 * @return {number}
		 */
		dateDiff: function(aDateSmall, aDateBig)
		{
			if (typeof(aDateSmall) == 'undefined' || typeof(aDateBig) == 'undefined') {
				return null;
			}
			if (typeof(aDateSmall) == null || typeof(aDateBig) == null) {
				return null;
			}
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
		 * disableFormElement
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		disableFormElement: function(aForm, aName)
		{
			$(aForm).find('div.main_body').find(':input[name=' + aName + ']').attr('disabled', 'disabled');
		},

		/**
		 * enableFormElement
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		enableFormElement: function(aForm, aName)
		{
			$(aForm).find('div.main_body').find(':input[name=' + aName + ']').removeAttr('disabled');
		},

		/**
		 * setFormValue
		 *
		 * @param {Object} aForm
		 * @param {string} aName
		 */
		setFormValue: function(aForm, aName, aValue)
		{
			// numberクラスの場合は、カンマを自動でつける
			if ($(aForm).find('div.main_body').find(':input[name=' + aName + ']').hasClass('number')) {
				aValue = NumUtil.addComma(NumUtil.removeComma(aValue));
			}
			$(aForm).find('div.main_body').find(':input[name=' + aName + ']').attr('value', aValue);
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
			var formValue = $(aForm).find('div.main_body').find(':input[name=' + aName + ']').val();
			return formValue;
		},

		/**
		 * getForm
		 *
		 * @param {Object} aObj 呼び出し元オブジェクト
		 */
		getForm: function(aObj)
		{

      console.log($(aObj));
			console.log($(aObj).parents('form'));
			return $(aObj).parents('form')[0];
		},

		/**
		 * showNewDocWindow
		 *
		 * @param {string} aTemplateName
		 * @param {Object} aDefaultValues
		 */
		showNewDocWindow: function(aTemplateName, aDefaultValues)
		{
			var templateId = WorkflowTemplate.getTemplateIdByName(aTemplateName);
			if (templateId == '') {
				return false;
			}
			NewDocWindow.showWindow(templateId, aDefaultValues);
			return true;
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
		}
	};

	/**
	 * SateraitoUI
	 *
	 * 画面系共通API
	 */
	SateraitoUI = {

		/**
		 * clearMessage
		 *
		 * メッセージ表示領域をクリアする
		 * ガジェットからもOpenID画面からも共通して呼び出せる
		 */
		clearMessage: function()
		{
			if (IS_OPENID_MODE || IS_TOKEN_MODE) {
				// OpenIDモードまたはトークンモードの場合
				_OidMiniMessage.clearMessage();
			} else {
				// ガジェットモードの場合
				Sateraito.MiniMessage.clearMessage();
			}
		},

		/**
		 * showLoadingMessage
		 *
		 * 読込中メッセージを表示する
		 * ガジェットからもOpenID画面からも共通して呼び出せる
		 *
		 * @param {string} aMessageText
		 */
		showLoadingMessage: function(aMessageText)
		{
			if (typeof(aMessageText) == 'undefined') {
				aMessageText = MyLang.getMsg('LOADING');
			}

			if (IS_OPENID_MODE || IS_TOKEN_MODE) {
				_OidMiniMessage.showLoadingMessage(aMessageText);
			} else {
				Sateraito.MiniMessage.showLoadingMessage(aMessageText);
			}
		},

		/**
		 * showTimerMessage
		 *
		 * 時間が経つと自動的に消えるメッセージを表示
		 * ガジェットからもOpenID画面からも共通して呼び出せる
		 *
		 * @param {string} aMessageText
		 * @param {number} aTime
		 */
		showTimerMessage: function(aMessageText, aTime)
		{
			if (IS_OPENID_MODE || IS_TOKEN_MODE) {
				_OidMiniMessage.showTimerMessage(aMessageText, aTime);
			} else {
				Sateraito.MiniMessage.showTimerMessage(aMessageText, aTime);
			}
		},

		/**
		 * changeEnabledComponents
		 *
		 * @param {string} aDocId
		 * @param {array} aOkToUpdateField
		 */
		changeEnabledComponents : function(isEnabled){
			var cmpIds = ['approve_button', 'reject_button', 'approve_button2', 'reject_button2', 'update_button', 'update_button2', 'looked_button', 'btn_submit_new_doc', 'btn_save_as_draft_doc', 'btn_delete_draft_doc'];
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
	 * フォーム上数値計算用モジュール
	 */
	Calc = {

		/**
		 * calcAll
		 *
		 * @param {string} aTemplateBodyId 'template_body_' で始まる文字列
		 */
		calcAll: function(aTemplateBodyId)
		{
			// 全ての計算フィールドの計算済みフラグを落とす
			$('#' + aTemplateBodyId).find('input.multi').attr('calced', '0');
			$('#' + aTemplateBodyId).find('input.sum').attr('calced', '0');
			$('#' + aTemplateBodyId).find('input.diff').attr('calced', '0');
			// 計算実行
			Calc.calcSum(aTemplateBodyId);
			Calc.calcDiff(aTemplateBodyId);
			Calc.calcMulti(aTemplateBodyId);
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
				answer = answer + Math.floor(parseFloat(NumUtil.removeComma(fieldValue), 10));
			});
			// 表示する
			if (answer == null) {
				$(aNodeOfSumClass).val('');
			} else {
				$(aNodeOfSumClass).val(NumUtil.addComma('' + Math.floor(answer)));
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
			var answer = null;
			var arg1 = null;
			var arg2 = null;
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
				// 計算実行
				var fieldValue = $('#' + aTemplateBodyId).find('[name=' + this + ']').val();
				if (typeof(fieldValue) == 'undefined') {
					// 引かない
					return true;
				}
				if (fieldValue.trim() == '') {
					// 引かない
					return true;
				}
				if (isNaN(parseFloat(NumUtil.removeComma(fieldValue), 10))) {
					// 引かない
					return true;
				}
				// 引く
				if (i == 0) {
					arg1 = Math.floor(parseFloat(NumUtil.removeComma(fieldValue), 10));
				}
				if (i == 1) {
					arg2 = Math.floor(parseFloat(NumUtil.removeComma(fieldValue), 10));
				}
			});
			if (arg1 == null && arg2 == null) {
				// no option
			} else {
				if (arg1 == null) arg1 = 0;
				if (arg2 == null) arg2 = 0;
				answer = arg1 - arg2;
			}
			// 表示する
			if (answer == null) {
				$(aNodeOfSumClass).val('');
			} else {
				$(aNodeOfSumClass).val(NumUtil.addComma('' + Math.floor(answer)));
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
				answer = answer * parseFloat(NumUtil.removeComma(fieldValue), 10);
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
								// 小数点以下切り捨て
								answer = Math.floor(answer * parseFloat(number));
							}
						}
					}
				}
				// 小数点以下切り捨てし、表示する
				$(aNodeOfMultiClass).val(NumUtil.addComma('' + Math.floor(answer)));
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
		}
	};

  FieldConvert = {
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
					$('#' + aTemplateBodyId).find(':input[name=\'' + arrayFields['from'] + '\']').each(function(){
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
					$('#' + aTemplateBodyId).find(':input[name=\'' + arrayFields['to'] + '\']').each(function(){
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
					$('#' + aTemplateBodyId).find(':input[name=\'' + arrayFields['title'] + '\']').each(function(){
						title = $(this).val();
					});
				}
				var details = '';
				if(typeof(arrayFields['details']) != 'undefined' && arrayFields['details'] != ''){
					$('#' + aTemplateBodyId).find(':input[name=\'' + arrayFields['details'] + '\']').each(function(){
						details = $(this).val();
					});
				}
				var location = '';
				if(typeof(arrayFields['location']) != 'undefined' && arrayFields['location'] != ''){
					$('#' + aTemplateBodyId).find(':input[name=\'' + arrayFields['location'] + '\']').each(function(){
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
//				$(obj).live('click', function(){
//					set_on_click('button', obj);
//				});
				$(obj).on('click', function(){
					set_on_click('button', obj);
				});
			});
			$('#' + aTemplateBodyId).find('img.add_to_google_calendar').each(function(){
				var obj = this;
				$(obj).attr('src', SATERAITO_MY_SITE_URL + '/images/calendar_plus_ja.gif');
//				$(obj).attr('style', 'cursor:pointer;');
				$(obj).css('cursor', 'pointer');
//				$(obj).live('click', function(){
//					set_on_click('img', obj);
//				});
				$(obj).on('click', function(){
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
      var elms = $('#' + aTemplateBodyId).find('input[type=button].clear_button');
      $.each(elms,function(){
//        $(this).live('click', function(){
        $(this).on('click', function(){
          var names = $(this).attr('fields');
          var namesArray = names.split(' ');
          Ext.each(namesArray, function(){
            var name = '' + this;
            $('#' + aTemplateBodyId).find(':input[name=' + name + ']').val('');
          });
        });
      })

		},

		/**
		 * dateFieldConvertAll
		 *
		 * @param {string} aTemplateBodyId
		 * @param {object} aBasicForm
		 */
		dateFieldConvertAll: function(aTemplateBodyId, aBasicForm)
		{
			$('#' + aTemplateBodyId).find('input.date').each(function(){

				var element = this;

				FieldConvert.dateFieldConvertEach(aTemplateBodyId, aBasicForm, element);
			});
		},

		/**
		 * dateFieldConvertEach
		 *
		 * @param {string} aTemplateBodyId
		 * @param {object} aBasicForm
		 * @param {dom} aElementToConvert
		 */
		dateFieldConvertEach: function(aTemplateBodyId, aBasicForm, aElementToConvert)
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
				// 描画領域を作成
				$(aElementToConvert).after('<div style="display:inline-block;" id="date_field_render_area_' + aTemplateBodyId + '_' + fieldName + '"></div>');
				var dateField = new Ext.form.DateField({
					id: 'template_body_new_doc_' + fieldName,
					name: fieldName,
					invalidText: MyLang.getMsg('INPUT_CHECK_ERR_MSG1'),
					renderTo: 'date_field_render_area_' + aTemplateBodyId + '_' + fieldName,
					readOnly: readOnly,
					disabled: disabled,
					value: value,
					format: 'Y-m-d'
				});
				// basicFormによるvalidateを可能にするため、add
				aBasicForm.add(dateField);
//				// 本日日付が指定されていたら、セット
//				if ($(aElementToConvert).is('.today_date')) {
//					dateField.setValue(Sateraito.DateUtil.getTodayStr());
//				}
				$('#date_field_render_area_' + aTemplateBodyId + '_' + fieldName).find('input[name=' + fieldName + ']').addClass(oldClass);
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
				FieldConvert._numberFieldConvert(aTemplateBodyId, aBasicForm, this);
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
				// 幅
				var width = $(aElementToConvert).width();
				// 描画領域を作成
				$(aElementToConvert).after('<div style="display:inline-block;" id="number_field_render_area_' + aTemplateBodyId + '_' + fieldName + '"></div>');
				var numberField = new Ext.form.TextField({
					id: aTemplateBodyId + '_' + fieldName,
					maskRe: new RegExp('[0-9,]'),
					name: fieldName,
					invalidText: MyLang.getMsg('INPUT_CHECK_ERR_MSG4'),
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
							return MyLang.getMsg('INPUT_CHECK_ERR_MSG5');
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
					.attr('fields', fields);
				$(aElementToConvert).remove();
			}
		},

		/**
		 * richTextFieldConvert
		 *
		 * "richtext"クラスを持つtextareaフィールドをExtのリッチテキストエディターに変換する
		 * ドキュメント内の全リッチテキストクラスをもったtextareaを変換する
		 *
		 * @param {string} aTemplateBodyId
		 */
		richTextFieldConvert: function(aTemplateBodyId)
		{
			$('#' + aTemplateBodyId).find('textarea.richtext').each(function(){

				var element = this;

				FieldConvert._richTextFieldConvert(aTemplateBodyId, element);
			});
		},

		/**
		 * _richTextFieldConvert
		 *
		 * "richtext"クラスを持つtextareaフィールドをExtのリッチテキストエディターに変換する
		 * ドキュメント内の指定されたエレメントのみ変換する
		 *
		 * @param {string} aTemplateBodyId
		 * @param {Object} aElement
		 */
		_richTextFieldConvert: function(aTemplateBodyId, aElement)
		{
			var fieldName = $(aElement).attr('name');
			var originalValue = $(aElement).val();

			//
			// リッチテキスト内インラインイメージの処理が必要
			//
			//AppsUser.requestToken(function(aJsondata){

				//
				// step1. リッチテキスト内インラインイメージを処理する
				//
				//var token = aJsondata.token;

				// ダミー領域を生成
				$('body').append('<div id="dummy_for_inline_img" style="display:none;">' + originalValue + '</div>');
				// 新しいファイルIDを使ってインラインイメージ処理
				$('#dummy_for_inline_img').find('img.inline_img').each(function(){
					var elementImg = this;
					var fileId = $(this).attr('file_id');
					if (fileId == null || fileId == '') {
						// no operation
					} else {
						//$(elementImg).attr('src', SATERAITO_MY_SITE_URL + '/' + SATERAITO_GOOGLE_APPS_DOMAIN + '/' + LoginMgr.appId + '/attach2/downloadattachedfile?file_id=' + fileId + '&token=' + token);
					}
				});
				// インラインイメージ処理後のhtml
				originalValue = $('#dummy_for_inline_img').html();
				// ダミー領域を削除
				$('#dummy_for_inline_img').remove();

				//
				// step2. Extリッチテキストエディターの描画領域を作成
				//
				$(aElement).after('<div id="richtext_field_render_area_' + aTemplateBodyId + '_' + fieldName + '"></div>');

				// Extリッチテキストエディターを生成
				var htmlEditor = new Ext.form.HtmlEditor({
					renderTo: 'richtext_field_render_area_' + aTemplateBodyId + '_' + fieldName,
					id: 'richtext_field_' + aTemplateBodyId + '_' + fieldName,
					name: fieldName,
					cls: 'richtext',
					fontFamilies: [
						'Arial',
						'Courier New',
						'Tahoma',
						'Times New Roman',
						'Verdana',
						'ＭＳ Ｐゴシック',
						'ＭＳ Ｐ明朝',
						'ＭＳ ゴシック',
						'ＭＳ 明朝'
					],
					defaultFont: 'Arial',
					value: originalValue,
					width: $(aElement).width(),
					height: $(aElement).height(),
					listeners: {
						initialize: function(component)
						{
							var editorBody = component.getEditorBody();
							if (editorBody) {
								editorBody.style.fontFamily = 'Arial';
							}
						}
					}
				});
				// 元のエレメントを削除
				$(aElement).remove();
			//});
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
    },
    /**
		 * showInputFields
		 *
		 * 編集可能なフィールドに対して、編集可能なようにinputフィールドを表示する
		 *
		 * @param {array} aOkToUpdateField
		 * @param {string} aDocId
		 */
		showInputFields: function(aOkToUpdateField, aDocId)
		{
			var basicForm = Ext.getCmp('form_panel_' + aDocId).getForm();

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

				// テキストエリアの場合
				if ($(element).is('textarea')) {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストエリアを表示
					$(element).show();
					$(element).removeAttr('disabled');

					// リッチテキストクラスの場合
					if ($(element).hasClass('richtext')) {
						// リッチテキスト入力コントロールにコンバート
						FieldConvert._richTextFieldConvert('template_body_' + aDocId, element);
					}
				}
				// チェックボックスの場合
				if (elementType == 'checkbox') {
					$(element).removeAttr('disabled');
				}
				// テキストボックスの場合
				if ($(element).is('input') && elementType == 'text') {
					// 表示部を消す
					$('#template_body_' + aDocId).find('span.sateraito_doc_value[name=' + fieldName + ']').hide();
					// テキストボックスを表示
					$(element).show();
					$(element).removeAttr('disabled');

					// 数値クラスの場合
					if ($(element).hasClass('number')) {
						// 数値入力コントロールにコンバート
						FieldConvert._numberFieldConvert('template_body_' + aDocId, basicForm, element);
					}

					// 日付クラスの場合
					if ($(element).hasClass('date')) {
						// 日付入力コントロールにコンバート
						FieldConvert.dateFieldConvertEach('template_body_' + aDocId, basicForm, element);
					}
				}

				// ラジオボタンの場合
				if (elementType == 'radio') {
					$('#template_body_' + aDocId).find(':input[name=' + fieldName + ']').removeAttr('disabled');
				}

				// コンボボックスの場合
				if ($(element).is('select')) {
					$(element).removeAttr('disabled');
				}

				if (elementType == 'button') {
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