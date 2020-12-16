
Ext.ucf.popup_group_list = function(){

	return {
		/*
		 * title: 表示するポップアップのタイトル
		 * target_name: 作成するDivタグの名称
		 * action: ボタン押下時に事項するメソッド JSON
		 */
		createGroupListWindow : function(title,target_name,action)
		{
			var editeddata;
			var isValid = true;
			var grouplist = new Ext.FormPanel({
			//	labelWidth: 45, // label settings here cascade unless overridden
				url:'save-form.php',
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
						text: _msg.ADD_SELECTED_GROUPS,
						handler: function(){
							var tree =  document.getElementById('GroupTree');
							if(tree)
							{
								var elements = document.getElementsByName('CKS');
								var groups = new Array();
								for (var i = 0; i < elements.length; i++) {
									if(elements[i].name == 'CKS')
									{
										if(elements[i].checked)
										{
											var group_unique_id = elements[i].value
											var group_id = ''
											var group_name = ''
											
											groupNodes = elements[i].parentNode.childNodes;
											for(var j = 0; j < groupNodes.length; j++)
											{
												if(groupNodes[j].tagName == 'A')
												{
													
													group_id = $(groupNodes[j]).attr('rel');
													group_name = groupNodes[j].innerHTML;
												}
											}
											groups.push({unique_id:group_unique_id, group_id: group_id, group_name: group_name})	
										}
									}
								}
								action(groups);
								editwindow.close();
							}
						}
					},{
						text: _msg.VMSG_CLEAR,
						handler: function(){
							// 選択の解除
							var tree =  document.getElementById('GroupTree');
							if(tree)
							{
								var elements = $(tree).find(':checkbox');
						//		var elements = $(tree).get('CKS');

								for (var i = 0; i < elements.length; i++) {
									if(elements[i].name == 'CKS')
									{
										if(elements[i].checked)
										{
											elements[i].checked = false;
										}
									}
								}
							}
						}
					},{
						text: _msg.VMSG_CLOSE,
						handler: function(){
							editwindow.close();
						}
					}
				]
			});


			var editwindow
				{
				editwindow = new Ext.Window({
						title:title,
						layout:'fit',
						modal:true,
						width:350,
						height:450,
						plain: true,
						autoDestory:true,
						items: grouplist
					});
				};

			editwindow.show(this);
			editwindow.dd.constrainTo(Ext.getBody());

		},

		setTree : function(target_name,script)
		{
			if(script == undefined)
			{
				script = _vurl + 'group/tree'
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
				script = _vurl + 'group/tree'
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
														, anchor_type: 'GROUP_LINK'
														, baseCSSClass: 'jqueryUcfTree2'
			},

			// アイテムがクリックされたときの処理（カテゴリ以外のアイテム）
			function(rel, rel2, lowest_level)
			{ 
			});
		},
		setTree3 : function(target_name,script)
		{
			if(script == undefined)
			{
				script = _vurl + 'group/tree'
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
														, checkboxHidden: false
														, anchor_type: 'EXPAND'
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
