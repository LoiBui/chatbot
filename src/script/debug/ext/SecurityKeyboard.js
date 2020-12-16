
Ext.ucf.security_keyboard = function(){

	return {
		makeSecurityKeyboard : function(element,id,strKeyType,isFormReadOnly,isFilter,strKeys1,strKeys2,strKeys3,strKeys4) 
		{
			/*
			 * element: 書き込み先DIVタグelement
			 * id: 作成したキーボードのname
			 * strKeyType: キーボードのタイプ QWERTY,QWERTY+JIS,QWERTY+US,TENKEY,FULL,RANDOMの何れかが入る
			 * isFormReadOnly: trueの場合、セキュリティーキーボード以外の書き込みを受け付けない。
			 * isFilter: trueの場合、入力した値が「●」で表記される。
			 * strKeys1～4: キーボードのタイプがRANDOMの時に使用されるキー
			 */

			Ext.QuickTips.init();
			var keypad;
			var strInputType = "text";

			if(isFilter){
				strInputType = "password";
			}

			// strKeysの存在チェック
			if(!strKeys1) strKeys1 = "";
			if(!strKeys2) strKeys2 = "";
			if(!strKeys3) strKeys3 = "";
			if(!strKeys4) strKeys4 = "";

			if(isFormReadOnly){
				keypad = new Ext.ux.form.KeypadField({
					// IE,Google ChromeにてBS押下時の挙動がおかしくなるため削除
					// enableBS: true		// キーボードからの入力を制御中、バックスペースキーの入力を許可する。
					 width: 150				// 
					,name: id
					,inputType: strInputType
					,keys: []
					,onTrigger1Click: function(){
						if( this.fireEvent("beforeclear", this, this.getValue() ) !== false ) {
							 // 値を入力すると表示される「×」ボタンの挙動設定
							// 押下時に値が全消去される為、削除。キーボードが閉じられるのみの挙動に
							this.setValue(this.value);
							this.triggers[0].hide();
							this.fireEvent("clear", this);
						}
					}
					,onBackspace: function() {
						// BS押下時の挙動設定
						// IEで挙動がおかしかった為、IE6でのみ発生するように修正
						this.setValue( this.getValue().substr(0, this.getValue().length-(Ext.isIE6?0:1)) );
					}
				});
			}
			else
			{
				keypad = new Ext.ux.form.KeypadField({
					// IE,Google ChromeにてBS押下時の挙動がおかしくなるため削除
					// enableBS: true		// キーボードからの入力を制御中、バックスペースキーの入力を許可する。
					 width: 150				// 
					,name: id
					,formReadonly:  function(){}
					,inputType: strInputType
					,keys: []
					,onTrigger1Click: function(){
						if( this.fireEvent("beforeclear", this, this.getValue() ) !== false ) {
							 // 値を入力すると表示される「×」ボタンの挙動設定
							// 押下時に値が全消去される為、削除。キーボードが閉じられるのみの挙動に
							this.setValue(this.value);
							this.triggers[0].hide();
							this.fireEvent("clear", this);
						}
					}
					,onBackspace: function() {
						// BS押下時の挙動設定
						// IEで挙動がおかしかった為、IE6でのみ発生するように修正
						this.setValue( this.getValue().substr(0, this.getValue().length-(Ext.isIE6?0:1)) );
					}
				});
			}

			switch(strKeyType)
			{
				case 'RANDOM':
					if(Ext.isIE8 || Ext.isIE9)
					{
						keypad.keys = [
								 strKeys1
								,strKeys2
								,strKeys3
								,strKeys4
								,' '
								,' '
								,' '
						];
					}
					else
					{
					keypad.keys = [
								 strKeys1
								,strKeys2
								,strKeys3
								,strKeys4
						];
					}
					break;
				case 'QWERTY':
				case 'QWERTY+JIS':
				case 'QWERTY+US':
				case 'TENKEY':
				case 'FULL':
				default:
					keypad.keyMode = strKeyType;
					break;
			}

			keypad.render(element);
		},
		init : function(){
		}
	};
}();
