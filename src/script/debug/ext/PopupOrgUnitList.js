
Ext.ucf.popup_orgunit_list = function(){

	return {
		/*
		 * title: 表示するポップアップのタイトル
		 * target_name: 作成するDivタグの名称
		 */
		createOrgUnitListWindow : function(title,target_name)
		{
			var editwindow;
			var editeddata;
			var isValid = true;
			var orgunitlist = new Ext.FormPanel({
			//	labelWidth: 45, // label settings here cascade unless overridden
				//url:'save-form.php',
				frame:true,
				width: 300,
				height: 'auto',
				layout:'form',
				defaults: {
					layout: 'form',
					border: false,
					collapsible: false,
					bodyStyle: 'padding:0px;margin:0px;'
				},
				data:'',
				items: [{
					xtype:'fieldset',
					title: '',
					autoHeight:true,
					defaults: {width: 300},
					defaultType: 'container',
					frame:true,
					layout:'form',
					items :[{
						autoEl: 'div',
						cls: 'orgTree',
						layout: 'form',
						name: target_name,
						style: "padding: 2px;",
						id: target_name,
						allowBlank: false
					}]
				}],
				buttons: [{
						text: _msg.VMSG_CLOSE,
						handler: function(){
							editwindow.close();
						}
					}
				]
			});


			{
			editwindow = new Ext.Window({
					title:title,
					layout:'fit',
					modal:true,
					width:350,
					height:450,
					plain: true,
					autoDestory:true,
					items: orgunitlist
				});
			};

			editwindow.show(this);
			editwindow.dd.constrainTo(Ext.getBody());

			return editwindow;
		},

		setTree : function(target_name,script)
		{
			if(script == undefined)
			{
				script = _vurl + 'orgunit/tree'
			}
			// 組織ツリー
			$('#' + target_name).orgTree({
													 	root: '/'
														, folderEvent: 'click'
														, script: script
														, expandSpeed: 0
														, collapseSpeed: 0
														, multiFolder: true
														, expandFirstDeep: false
														, loadMessage: _msg.LOADING
			},
			// アイテムがクリックされたときの処理（カテゴリ以外のアイテム）
			function(rel, rel2, lowest_level)
			{ 
			});
		},
		setTree2 : function(target_name,script)
		{
			if(script == undefined)
			{
				script = _vurl + 'orgunit/tree'
			}
			// 組織ツリー
			$('#' + target_name).orgTree({
													 	root: '/'
														, folderEvent: 'click'
														, script: script
														, expandSpeed: 0
														, collapseSpeed: 0
														, multiFolder: true
														, expandFirstDeep: false
														, loadMessage: _msg.LOADING
														, checkboxHidden: true
														, anchor_type: 'ORGUNIT_LINK'
														, baseCSSClass: 'jqueryUcfTree2'
			},

			// アイテムがクリックされたときの処理（カテゴリ以外のアイテム）
			function(rel, rel2, lowest_level)
			{ 
			});
		},
		setTreeForOneSelect : function(target_name, script, click_anchor_link_funcname)
		{
			if(script == undefined || script == '')
			{
				script = _vurl + 'orgunit/tree'
			}
			// 組織ツリー
			$('#' + target_name).orgTree({
													 	root: '/'
														, folderEvent: 'click'
														, script: script
														, expandSpeed: 0
														, collapseSpeed: 0
														, multiFolder: true
														, expandFirstDeep: true
														, loadMessage: _msg.LOADING
														, checkboxHidden: true
														, anchor_type: 'ORGUNIT_LINK2'
														, click_anchor_link_funcname: click_anchor_link_funcname
														, baseCSSClass: 'jqueryUcfTree2'
			},

			// アイテムがクリックされたときの処理（カテゴリ以外のアイテム）
			function(rel, rel2, lowest_level)
			{ 
			});
		},
		init : function(){
		}
	};
}();
