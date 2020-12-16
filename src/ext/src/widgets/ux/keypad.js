/**
* KeyPad Ext JS extensions
* Ext.ux.form.KeypadField
* Ext.ux.KeyPad
* Ext.ux.menu.KeyPad
* version 1.1.3
*
* last updated 2010/08/03
* copyright info@plasmasphere.net http://www.plasmasphere.net/
*/
Ext.ns('Ext.ux');
Ext.ns('Ext.ux.form');
Ext.ns('Ext.ux.menu');
Ext.ux.form.KeypadField = Ext.extend(Ext.form.TwinTriggerField, {
	trigger1Class: 'x-form-clear-trigger',
//	trigger2Class: 'x-form-keypad-trigger',
	hideTrigger1: true,
	keyMode: 'QWERTY',
	enableBS: false,

	initComponent: function(){
		Ext.ux.form.KeypadField.superclass.initComponent.call(this);
		this.addEvents(
			"beforepush",
			"push",
			"beforeclear",
			"clear"
		);
		this.on({
			scope: this,
			afterrender: this.formReadonly
		});
	},

	onRender: function(container, position){
		this.autoEl = {
			tag: 'div',
			cls: this.itemCls
		};
		Ext.ux.form.KeypadField.superclass.onRender.call(this, container, position);
		this.el.on({
			scope: this,
			click: this.onTrigger2Click
		});
		if(Ext.isEmpty(this.menu)){
			this.menu = new Ext.ux.menu.KeyPadMenu();
		}
		if(Ext.isIE) {
			this.menu.on("show", function(){
				this.menu.el.setWidth(this.menu.picker.menuSize[0]);
				this.menu.el.setHeight(this.menu.picker.menuSize[1]);
				this.menu.picker.el.setWidth(this.menu.picker.menuSize[0]);
				this.menu.picker.el.setHeight(this.menu.picker.menuSize[1]);
				var pos = this.el.getXY();
				this.menu.el.setLeftTop(pos[0], pos[1] + this.getHeight());
			}, this);
		}
		this.onFocus();
		Ext.apply(this.menu.picker,  {
			keys : this.keys,
			keyMode: this.keyMode,
			enableDel: this.enableDel
		}, this.initialConfig);
		this.menu.on("beforehide", function(){
			var t = Ext.EventObject.getTarget();
			if(t.id==this.id) {
				return false;
			}
		}, this);
		if(this.enableBS) {
			this.on({
				scope: this,
				specialkey: function(f, e) {
					if(e.getKey() == e.BACKSPACE){
						this.onBackspace();
					}
				}
			});
		}
	},

	onTrigger1Click: function(){
		if( this.fireEvent("beforeclear", this, this.getValue() ) !== false ) {
			this.setValue('');
			this.triggers[0].hide();
			this.fireEvent("clear", this);
		}
	},

	onTrigger2Click: function(){
		if(this.disabled){
			return;
		}
		if(!this.menu.isVisible()) {
			this.menu.show(this.el, "tl-bl?");
			this.menu.on('push', this.onPush, this);
		}
	},

	onPush: function(m, d) {
		if( this.fireEvent("beforepush", this, this.getValue() ) !== false ) {
			if( Ext.isDefined(this.menu.picker.isSpecialKey(d)) ) {
				this[ this.menu.picker.isSpecialKey(d).name || "emptyFn" ]();
			} else {
				if(this.shift === true) { d = unescape(d).toUpperCase(); }
				this.setValue(this.getValue() + d);
				this.triggers[0].show();
			}
			this.el.focus();
			this.fireEvent('push', d);
		}
		if( Ext.isEmpty(this.getValue()) ) { this.triggers[0].hide(); }
	},

	//private
	onBackspace: function() {
		this.setValue( this.getValue().substr(0, this.getValue().length-(Ext.isIE?0:1)) );
	},

	onSpace: function() {
		this.setValue( this.getValue() + ' ' );
	},

	onShift: Ext.emptyFn,

	emptyFn: Ext.emptyFn,

	// private
	formReadonly: function(){
		this.el.dom.setAttribute('readonly','readonly');
	}
});
Ext.reg('keypadfield', Ext.ux.form.KeypadField);


Ext.ux.KeyPad = Ext.extend(Ext.Component, {
	itemCls: 'x-keypad',
	clickEvent: 'click',
	autoRender: true,

	separator: ',',
	keyMode: 'QWERTY',

	// private
	initComponent: function(){
		Ext.ux.KeyPad.superclass.initComponent.call(this);
		this.addEvents(
			'push'
		);

		// private
		this.specialKey = {
			'keypad-sp': {
				fn: this.onSpace,
				text: '&nbsp;',
				name: "onSpace",
				widthMultiplication: 4
			},
			'keypad-space': {
				fn: this.onSpace,
				text: '&nbsp;',
				name: "onSpace",
				widthMultiplication: 4
			},
			'keypad-bs': {
				fn: this.onBackspace,
				text: 'BS',
				name: "onBackspace",
				widthMultiplication: 1
			},
			'keypad-backspace': {
				fn: this.onBackspace,
				text: 'BackSpace',
				name: "onBackspace",
				widthMultiplication: 3
			},
//			keypad.rt: ,
//			keypad.return: ,
			'keypad-st': {
				fn: this.onShift,
				text: 'ST',
				name: "onShift",
				widthMultiplication: 1
			},
			'keypad-shift': {
				fn: this.onShift,
				text: 'Shift',
				name: "onShift",
				widthMultiplication: 2
			},
			'keypad-dt': {
				fn: Ext.emptyFn,
				text: 'DT',
				name: "",
				widthMultiplication: 1
			},
			'keypad.delete': {
				fn: Ext.emptyFn,
				text: 'Delete',
				name: "",
				widthMultiplication: 2
			}
		};

		this.symbolTransChars = {
			'QWERTY+US': {
				'\'': '~',
				'1': '!',
				'2': '@',
				'3': '#',
				'4': '$',
				'5': '%',
				'6': '^',
				'7': '&amp;',
				'8': '*',
				'9': '(',
				'0': ')',
				'-': '_',
				'=': '+',
				'[': '{',
				']': '}',
				'\\': '|',
				';': ':',
				'\'': '"',
				',': '&lt;',
				'.': '&gt;',
				'/': '?'
			},
			'QWERTY+JIS': {
				'1': '!',
				'2': '"',
				'3': '#',
				'4': '$',
				'5': '%',
				'6': '&amp;',
				'7': '\'',
				'8': '(',
				'9': ')',
				'-': '=',
				'^': '~',
				'\\': '|',
				'@': '`',
				'[': '{',
				';': '+',
				':': '*',
				']': '}',
				',': '&gt;',
				'.': '&lt;',
				'/': '?'
			}
		};

		this.specialTransChars = {
			' ': {
				code: ' ',
				name: '&nbsp;'
			},
			'"': {
				code: '&#34;',
				name: '&quot;'
			},
			'&': {
				code: '&#38;',
				name: '&amp;'
			},
			'<': {
				code: '&#60;',
				name: '&lt;'
			},
			'>': {
				code: '&#62;',
				name: '&gt;'
			}
		}

		if(this.handler){
			this.on('push', this.handler, this.scope, true);
		}
	},

	initTemplate: function() {
		var keys = [];
		for( var i = 0; i < this.keys.length; i++ ) {
			var sp = this.keys[i].split(this.separator);
			for(var j = 0; j < sp.length; j++) {
				if(sp[j].match(/^String\.fromCharCode/)) {
					sp[j] = eval(sp[j]);
				}
			}
			keys.push( sp );
		}
		var t = this.tpl || new Ext.XTemplate(
			'<div class="x-keypad">',
				'<tpl for=".">',
					'<div class="x-keypad-item">',
						'<tpl for=".">',
							'<tpl if="values != \' \' && values != \'  \'">',
							'<table class="x-btn x-keypad-btn">',
								'<tbody class="x-btn-small x-btn-icon-small-left">',
									'<tr>',
										'<td class="x-btn-tl"><i>&nbsp;</i></td>',
										'<td class="x-btn-tc"></td>',
										'<td class="x-btn-tr"><i>&nbsp;</i></td>',
									'</tr>',
									'<tr>',
										'<td class="x-btn-ml"><i>&nbsp;</i></td>',
										'<td class="x-btn-mc">',
											'<em><button class="button-{.}">{.}</button></em>',
										'<td class="x-btn-mr"><i>&nbsp;</i></td>',
									'</tr>',
									'<tr>',
										'<td class="x-btn-bl"><i>&nbsp;</i></td>',
										'<td class="x-btn-bc"></td>',
										'<td class="x-btn-br"><i>&nbsp;</i></td>',
									'</tr>',
								'</tbody>',
							'</table>',
							'</tpl>',
							'<tpl if="values == \' \'">',
								'<div class="x-keypad-halfspace">&nbsp;</div>',
							'</tpl>',
							'<tpl if="values == \'  \'">',
								'<div class="x-keypad-space">&nbsp;</div>',
							'</tpl>',
						'</tpl>',
					'</div>',
				'</tpl>',
			'</div>'
		);
		t.overwrite(this.el, keys);
		if(Ext.isIE) {
			this.menuSize = [this.el.getWidth(), this.el.getHeight()];
		}
		this.initSpecialKey();
	},

	// private
	onRender: function(container, position){
		this.autoEl = {
			tag: 'div',
			cls: this.itemCls
		};
		Ext.ux.KeyPad.superclass.onRender.call(this, container, position);

		if( Ext.isEmpty(this.keys) ) {
			switch(this.keyMode) {
				default:
					this.keyMode = "QWERTY";
					this.keys = [
						'q,w,e,r,t,y,u,i,o,p,keypad-bs',
						' ,a,s,d,f,g,h,j,k,l',
						' , ,z,x,c,v,b,n,m,keypad-shift'
					];
					break;
				case "QWERTY":
					this.keys = [
						'q,w,e,r,t,y,u,i,o,p,keypad-bs',
						' ,a,s,d,f,g,h,j,k,l',
						' , ,z,x,c,v,b,n,m,keypad-shift'
					];
					break;
				case "TENKEY":
					this.keys = [
						'7,8,9,keypad-bs',
						'4,5,6',
						'1,2,3',
						'0,00,.'
					];
					break;
				case "FULL":
					this.keys = [
						'q,w,e,r,t,y,u,i,o,p,keypad-bs,  ,7,8,9',
						' ,a,s,d,f,g,h,j,k,l,  ,  , ,4,5,6',
						' , ,z,x,c,v,b,n,m,keypad-shift,  ,  ,1,2,3',
						'  ,  ,  , ,keypad-space,  ,  ,  ,  , ,0,00'
					];
					break;
				case "QWERTY+US":
					this.keys = [
						'\',1,2,3,4,5,6,7,8,9,0,-,=,keypad-bs',
						' ,q,w,e,r,t,y,u,i,o,p,[,],\'',
						'  ,a,s,d,f,g,h,j,k,l,;,\'',
						'  , ,z,x,c,v,b,n,m,String.fromCharCode(44),.,/,keypad-shift'
					];
					break;
				case "QWERTY+JIS":
					this.keys = [
						'1,2,3,4,5,6,7,8,9,0,-,^,String.fromCharCode(92),keypad-bs',
						' ,q,w,e,r,t,y,u,i,o,p,@,[',
						'  ,a,s,d,f,g,h,j,k,l,;,:,]',
						'  , ,z,x,c,v,b,n,m,String.fromCharCode(44),.,/,_,keypad-shift'
					];
					break;
			}
		}

		this.initTemplate();
		this.mon(this.el, this.clickEvent, this.onPush, this, {delegate: 'table'});
		if(this.clickEvent != 'click'){
			this.mon(this.el, 'click', Ext.emptyFn, this, {delegate: 'table', preventDefault: true});
		}
		this.mon(this.el, 'mouseover', this.onMouseover, this, { delegate: 'table' });
		this.mon(this.el, 'mouseout', this.onMouseout, this, { delegate: 'table' });
	},

	initSpecialKey: function(){
		for(var i in this.specialKey) {
			if(this.el.child('button.button-'+i)) {
				this.el.child('button.button-'+i).update(this.specialKey[i].text);
				this.el.child('button.button-'+i).parent('table').setWidth(30 * this.specialKey[i].widthMultiplication);
				this.el.child('button.button-'+i).on('click', this.specialKey[i].fn, this);
			}
		}
	},

	isSpecialKey: function(key) {
		for(var i in this.specialKey) {
			if(i==key.toLowerCase()) {
				return this.specialKey[i];
			}
		}
	},

	onPush: function(e, t) {
		e.preventDefault();
		if(!this.disabled){
			var c = Ext.get(t).child( 'button' ).dom.className.match(/(?:^|\s)button-(.*)(?:\s|$)/)[1];
			if(!c.match(/keypad\-/)) {
				c = Ext.get(t).child( 'button' ).getAttribute('innerHTML');
			}
			this.fireEvent( 'push', this, (this.isShiftTggle()) ? this.specialKeyTrans(c.toUpperCase()) : this.specialKeyTrans(c) );
		}
	},

	onMouseover: function(e, t) {
		e.preventDefault();
		if(!this.disabled){
			Ext.get(t).addClass('x-btn-over');
		}
	},

	onMouseout: function(e, t) {
		e.preventDefault();
		if(!this.disabled){
			Ext.get(t).removeClass('x-btn-over');
		}
	},

	// private
	afterRender: function(){
		Ext.ux.KeyPad.superclass.afterRender.call(this);
		if(this.value){
			var s = this.value;
			this.value = null;
		}
	},

	onBackspace: Ext.emptyFn,

	onSpace: Ext.emptyFn,

	onShift: function() {
		var shift = this.el.child('button.button-keypad-shift') || this.el.child('button.button-keypad-st');
		if(this.isShiftTggle()) {
			shift.parent('table.x-btn table.x-btn-pressed').removeClass('x-btn-pressed');
			this.fontToggle('toLowerCase');
			this.symbolTrans('toLowerCase');
		} else {
			shift.parent('table.x-btn').addClass('x-btn-pressed');
			this.fontToggle('toUpperCase');
			this.symbolTrans('toUpperCase');
		}
	},

	getEnableToggleButton: function() {
		var unable = Ext.query('button[class^=button-keypad]', this.el.dom);
		var enable = Ext.query('button[class^=button-]', this.el.dom);
		var buttons = []
		var flag = true;
		for( var j = 0; j < enable.length; j++ ) {
			for( var i = 0; i < unable.length; i++) {
				if(unable[i].className==enable[j].className) {
					flag = false;
					break;
				}
			}
			if(flag) {
				buttons.push(enable[j]);
			}
			flag = true;
		}
		return buttons;
	},

	fontToggle: function(to) {
		var enable = this.getEnableToggleButton();
		if(!Ext.isEmpty(enable)) {
			for(var i = 0; i < enable.length; i++) {
				var el = Ext.get(enable[i]);
				el.update(el.getAttribute('innerHTML')[to]());
			}
		}
	},

	isShiftTggle: function() {
		var shift = this.el.child('button.button-keypad-shift') || this.el.child('button.button-keypad-st');
		if(!Ext.isEmpty(shift) && shift.parent('table.x-btn table.x-btn-pressed')) {
			return true;
		} else {
			return false;
		}
	},

	symbolTrans: function(to) {
		if(this.keyMode=='QWERTY+US'||this.keyMode=='QWERTY+JIS') {
			var enable = this.getEnableToggleButton();
			if(!Ext.isEmpty(enable)) {
				for(var i = 0; i < enable.length; i++) {
					var el = Ext.get(enable[i]);
					for(var j in this.symbolTransChars[this.keyMode]) {
						if(to=='toUpperCase') {
							if(j==el.getAttribute('innerHTML')) {
								el.update(this.symbolTransChars[this.keyMode][el.getAttribute('innerHTML')]);
							}
						} else if(to=='toLowerCase') {
							if(this.symbolTransChars[this.keyMode][j]==el.getAttribute('innerHTML')) {
								el.update(j);
							}
						}
					}
				}
			}
		}
	},

	specialKeyTrans: function(key) {
		var c = key;
		if(key.match(/^&[a-z]+?;$/i) || key.match(/^&#[0-9]+?;$/)) {
			for(var i in this.specialTransChars) {
				if(key.toLowerCase()==this.specialTransChars[i].name || key.toLowerCase()==this.specialTransChars[i].code) {
					c = i;
				}
			}
		}
		return c;
	}
});
Ext.reg('keypad', Ext.ux.KeyPad);

Ext.ux.menu.KeyPadMenu = Ext.extend(Ext.menu.Menu, {
	enableScrolling: false,
	hideOnClick: true,
	cls: 'x-keypad-menu',

	initComponent: function(){
		if(this.strict = (Ext.isIE7 && Ext.isStrict)){
			this.on('show', this.onShow, this, {single: true, delay: 20});
		}
		Ext.apply(this, {
			plain: true,
			showSeparator: false,
			items: this.picker = new Ext.ux.KeyPad(Ext.applyIf({
				internalRender: this.strict || !Ext.isIE,
				ctCls: 'x-menu-keypad-item',
				id: this.pickerId
			}, this.initialConfig))
		});
		this.picker.purgeListeners();
		Ext.ux.menu.KeyPadMenu.superclass.initComponent.call(this);
		this.relayEvents( this.picker, [ 'push' ] );
		this.on( 'show', this.picker.focus, this.picker);
		if(this.handler){
			this.on( 'push', this.handler, this.scope || this );
		}
	},

	menuHide : function() {
		if(this.hideOnClick){
			this.hide(true);
		}
	},

	onShow: function() {
		var el = this.picker.getEl();
		el.setWidth(el.getWidth()); //nasty hack for IE7 strict mode
	}
});
Ext.reg('keypadmenu', Ext.ux.menu.KeyPadMenu);
