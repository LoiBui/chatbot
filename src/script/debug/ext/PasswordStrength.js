
var ucf_password_strength = function(){
	
	var _intLimit = 28;
	var proPassword;
	var eleTarget;

	var _strDispWeak = _msg.WEAK;
	var _strDispGood = _msg.NORMAL;
	var _strDispStrong = _msg.STRONG;

	return {
		/*
		 * strDivId: 書き込み先DIVタグのID
		 * strTargetId: 強度チェックを行いたい対象のID
		 * isSetOnKeyUp: onkeydownにイベントをセットするか
		 * intWidth: 強度を示すバーの長さ
		 */
		createPasswordStrength : function(strDivId, strTargetId, isSetOnKeyUp, intWidth, params)
		{
			var intWidthSet;
			if(intWidth && intWidth > 0){
				intWidthSet = intWidth;
			}else{
				intWidthSet = 200;
			}

			if(params && params['disp_weak'] && params['disp_weak'] != '')
			{
				_strDispWeak = params['disp_weak'];
			}
			if(params && params['disp_good'] && params['disp_good'] != '')
			{
				_strDispGood = params['disp_good'];
			}
			if(params && params['disp_strong'] && params['disp_strong'] != '')
			{
				_strDispStrong = params['disp_strong'];
			}
			
			// 指定のdivタグへ値をセット
			proPassword = new Ext.ProgressBar({
			text:'',
			value:0,
			id:strDivId,
			width:intWidthSet
			});
			proPassword.render(strDivId)
			proPassword.show();

			eleTarget = document.getElementById(strTargetId);

			// onkeyupにイベントをセット
			if(isSetOnKeyUp)
			{
				eleTarget.onkeyup = this.passwordCheck;
			}
			this.passwordCheck();
		},
		passwordCheck : function()
		{
			var intLength = eleTarget.value.length;
			var ext =  document.getElementById(proPassword.id);

			var CheckTypeCount = function(strTarget)
			{
				var intCount = 0;
				if(strTarget.match(/[a-z]/))
				{
					intCount++;
				}
				if(strTarget.match(/[A-Z]/))
				{
					intCount++;
				}
				if(strTarget.match(/[0-9]/))
				{
					intCount++;
				}
				if(strTarget.match(/.*[-@/[\]^_{|}~].*/))
				{
					intCount++;
				}
				return intCount;
			};

			var CheckPower = function(intTypeCount, intLength)
			{
				var intCount = 0;

				if(intLength == 0)
				{
					return 0;
				}
				intCount = intLength;

				if(intLength > 7)
				{
					switch(intTypeCount.toString())
					{
						case "1":
							intCount+=0;
							if(intCount > 8)
							{
								intCount = 8;
							}
							break;
						case "2":
							intCount+=4;
							if(intCount > 15)
							{
								intCount = 15;
							}
							break;
						case "3":
						case "4":
							intCount+=8;
							if(intCount > _intLimit)
							{
								intCount = _intLimit;
							}
							break;
					}
				}
				return intCount;
			};

			var intResult = CheckPower(CheckTypeCount(eleTarget.value),intLength);
			if(intLength < 8)
			{
				ext.className = "red";
				proPassword.updateProgress(intResult / _intLimit, _strDispWeak);
			}
			else
			{
				
				if(intResult < 9)
				{
					ext.className = "red";
					proPassword.updateProgress(intResult / _intLimit, _strDispWeak);
				}
				else if(intResult < 16)
				{
					ext.className = "";
					proPassword.updateProgress(intResult / _intLimit, _strDispGood);
				}
				else
				{
					ext.className = "green";
					proPassword.updateProgress(intResult / _intLimit, _strDispStrong);
				}
			}
		},
		init : function(){
		}
	};
};

