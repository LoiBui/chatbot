
Ext.ucf.acnt = function(){
		var datO365SyncFlag = [['', ''], ['ACTIVE', _msg.IN_TARGET]];
		var _profile_ids_called = {};
		var _profile_ids_errored = {};
		var _profile_ids = {};
		
		var datLoginLockFlag = [['', ''], ['LOCK', _msg.VMSG_LOCKING]];

    return {
			DatAccountStopFlag: [['STOP', _msg.ACCOUNT_STOP_STOP], ['', _msg.ACCOUNT_STOP_ACTIVE]],
			DatLoginLockFlag: datLoginLockFlag,
			viewHelper:function(id, value, cmp){
				var is_html = false;
				var result = value;
				if(id == 'password'){
					if(value != '')
					{
						result = '******************';
					}
					else
					{
						result = _msg.VMSG_NOINDICATE_PASSWORD;
					}
				}else if(id == 'password1'){
					if(value != '')
					{
						result = '******************';
					}
					else
					{
						result = _msg.VMSG_NOINDICATE_PASSWORD;
					}
				}else if(id == 'matrixauth_pin_code'){
					if(value != '')
					{
						result = '****';
					}
					else
					{
						result = _msg.VMSG_NOINDICATE_PASSWORD;
					}
				}else if(id == 'account_stop_flag'){
					result = value == 'STOP' ? _msg.ACCOUNT_STOP_STOP : _msg.ACCOUNT_STOP_ACTIVE;
				}else if(id == 'next_password_change_flag'){
					result = value == 'ACTIVE' ? _msg.VMSG_PASSWORDNEXTCHANGEFLAG : _msg.MSG_NO_SETTING;
				}else if(id == 'login_lock_flag'){
					result = value == 'LOCK' ? _msg.VMSG_LOCKING : _msg.VMSG_LOCKING_OFF;
				}else if(id == 'access_authority'){
					var ary_disp = [];
					var access_authority = value;
					if(access_authority != '')
					{
						ary_access_authority = access_authority.split(',');
						Ext.each(ary_access_authority, function(one_access_authority){
							var disp = '';
							switch(one_access_authority){
								case 'ADMIN':
									disp = _msg.ACCESS_AUTHORITY_ADMIN;
									break;
								case 'OPERATOR':
									disp = _msg.ACCESS_AUTHORITY_OPERATOR;
									break;
								case 'MANAGER':
									disp = _msg.ACCESS_AUTHORITY_MANAGER;
									break;
								default:
									disp = one_access_authority;
									break;
							}
							ary_disp.push(disp);
						});
					}
					result = ary_disp.join(' ');
				}else if(id == 'delegate_function'){
					var ary_disp = [];
					var delegate_function = value;
					if(delegate_function != '')
					{
						ary_delegate_function = delegate_function.split(',');
						Ext.each(ary_delegate_function, function(one_delegate_function){
							var disp = '';
							switch(one_delegate_function){
								case 'OPERATOR':
									disp = _msg.DELEGATE_FUNCTION_OPERATOR_CONFIG;
									break;
								case 'USER':
									disp = _msg.DELEGATE_FUNCTION_USER_CONFIG;
									break;
								case 'GROUP':
									disp = _msg.DELEGATE_FUNCTION_GROUP_CONFIG;
									break;
//								case 'BUSINESSRULE':
//									disp = _msg.DELEGATE_FUNCTION_BUSINESSRULE_CONFIG;
//									break;
                                case 'POSTMESSAGE':
									disp = _msg.DELEGATE_FUNCTION_POSTMESSAGE_CONFIG;
									break;
//                               case 'TEMPLATE':
//									disp = _msg.DELEGATE_FUNCTION_TEMPLATE_CONFIG;
//									break;
                               case 'SEARCH':
									disp = _msg.DELEGATE_FUNCTION_SEARCH_CONFIG;
									break;
							   default:
									disp = one_delegate_function;
									break;
							}
							ary_disp.push(disp);
						});
					}
					result = ary_disp.join(' ');
				}
				
				return {value:result, is_html:is_html};
			},

			init: function(){}

    };


}();

