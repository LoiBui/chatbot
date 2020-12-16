
// 新Bing用
var ucf_strength = function(){
	
	var _intLimit = 28;
	var eleTarget;
	var _div_id;
	var _label_id;

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
		createPasswordStrength : function(strDivId, strTargetId, strLabelId, isSetOnKeyUp, intWidth, params)
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
			
			// 指定のdivタグのクラスと文言をセット

			eleTarget = document.getElementById(strTargetId);
			_div_id = strDivId;
			_label_id = strLabelId;
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

			$('#' + _div_id).removeClass('strength01');
			$('#' + _div_id).removeClass('strength02');
			$('#' + _div_id).removeClass('strength03');
			$('#' + _div_id).removeClass('strength04');
			$('#' + _div_id).removeClass('strength05');

			var intResult = CheckPower(CheckTypeCount(eleTarget.value),intLength);
			if(intLength < 8)
			{
				$('#' + _div_id).addClass('strength01');
				$('#' + _label_id).html(_strDispWeak);
			}
			else
			{
				
				if(intResult < 9)
				{
					$('#' + _div_id).addClass('strength01');
					$('#' + _label_id).html(_strDispWeak);
				}
				else if(intResult < 16)
				{
					$('#' + _div_id).addClass('strength03');
					$('#' + _label_id).html(_strDispGood);
				}
				else
				{
					$('#' + _div_id).addClass('strength05');
					$('#' + _label_id).html(_strDispStrong);
				}
			}
		},
		init : function(){
		}
	};
};

