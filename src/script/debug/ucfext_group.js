/**
 * GroupNode
 */
GroupNode = Ext.extend(Ext.tree.TreeNode, {
	
	constructor: function(config){
		
		config = Ext.apply({
			leaf: false,
			expandable: true,
			isChildUserNodeAppended: false,
			isChildGroupNodeAppended: false,  // 動的LTモードのときのみ使用
			listeners: {
				'expand': function(aNode)
				{
					// アペンド済みの場合、終了
					if (aNode.attributes['isChildUserNodeAppended']) return;
					
					var groupId = aNode.attributes['group_id'];
					
					// ロード済みでない場合
					// グループメンバーを取得
					var aGroupMembers = [{}];
					// 子グループノードをアペンド
					aNode.appendGroupNode(aGroupMembers, groupId);
					// アペンド済みフラグを立てる
					aNode.attributes['isChildUserNodeAppended'] = true;
				},
				
				'click': function(Node, e)
				{
					var groupId = Node.attributes['group_id'];
					
					// 選択されたグループIDをプリファレンスに保存
					GadgetPrefs.setDefaultGroupId(groupId);
					
					if (GroupDataBulkDownload.dynamicLtMode) {
						
						// 動的LTモードの場合
						
						if (AppsGroup.getGroupMemberLoadingStatus(groupId) == 2) {
							
							// グリッドにアドレス帳を表示
							SharedContact.refreshGridByGroupId(groupId);
							
						} else {
							// グループメンバーを取得
							AppsGroup.requestGroupMembersFromLT(groupId, function(aGroupMembers){
								
								// グループメンバーを内部DBにセット
								AppsGroup.setGroupMemberData(aGroupMembers, groupId);
								
								// グリッドにアドレス帳を表示
								SharedContact.refreshGridByGroupId(groupId);
							});
						}
					} else {
						
						// グリッドにアドレス帳を表示
						SharedContact.refreshGridByGroupId(groupId);
					}
					
				}
			}
		}, config);

		GroupNode.superclass.constructor.call(this, config);
		
		if (GroupDataBulkDownload.dynamicLtMode) {
			// バルクデータの動的取得モードの場合
			// 子グループノードはここでは生成しない
		} else {
			// グループノードは、インスタンス生成時に子グループを検索し、
			// 子グループノードのインスタンスを生成して自分のChild Nodeに設定する
			var groupId = config.group_id;
			var newMaxLevel = config.maxLevel - 1;
			var childGroupIds = AppsGroup.getChildGroupIds(groupId);
			var nodeMyself = this;
			if (newMaxLevel > 0) {
				$.each(childGroupIds, function(){
					var childGroupId = this;
					if (!AppsGroup.isHiddenGroup(childGroupId)) {
						var groupName = AppsGroup.getGroupName(childGroupId);
						nodeMyself.appendChild(new GroupNode({
							'text': groupName,
							'group_id': childGroupId,
							'maxLevel': newMaxLevel
						}));
					}
				});
			}
		}
	},
	
	/**
	 * appendGroupNode
	 *
	 * @param {GroupNode} aNode
	 * @param {string} groupId
	 */
	appendGroupNode: function(aNode, groupId)
	{
		var newMaxLevel = aNode.attributes['maxLevel'] - 1;
		
		// 子グループを取得
		var childGroupIds = AppsGroup.getChildGroupIds(groupId);
		
		// 子グループをアペンド
		if (newMaxLevel > 0) {
			$.each(childGroupIds, function(){
				var childGroupId = this;
				if (!AppsGroup.isHiddenGroup(childGroupId)) {
					var groupName = AppsGroup.getGroupName(childGroupId);
					aNode.appendChild(new GroupNode({
						'text': groupName,
						'group_id': childGroupId,
						'maxLevel': newMaxLevel
					}));
				}
			});
		}
		// アペンド済みフラグを立てる
		aNode.attributes['isChildGroupNodeAppended'] = true;
	}
});

Ext.ucf.group = function(){

    return {
			DatO365SyncFlag: [['', ''], ['ACTIVE', _msg.IN_TARGET]],
			init: function(){}
    };

}();

if(jQuery) (function($){
	
	// 組織（グループ）ツリー
	$.extend($.fn, {
		orgTree: function(o, click, load) {
			// Defaults
			if( !o ) var o = {};
			if( o.root == undefined ) o.root = '/';
			if( o.script == undefined ) o.script = '';
			if( o.folderEvent == undefined ) o.folderEvent = 'click';
			if( o.expandSpeed == undefined ) o.expandSpeed= 500;
			if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
			if( o.expandEasing == undefined ) o.expandEasing = null;
			if( o.collapseEasing == undefined ) o.collapseEasing = null;
			if( o.multiFolder == undefined ) o.multiFolder = true;
			if( o.expandFirstDeep == undefined) o.expandFirstDeep = false;
			if( o.checkboxHandler == undefined) o.checkboxHandler = undefined;
			if( o.loadMessage == undefined ) o.loadMessage = _msg.LOADING;
			if( o.checkboxHidden == undefined ) o.checkboxHidden = false;
			if( o.anchor_type == undefined ) o.anchor_type = '';
			if( o.baseCSSClass == undefined ) o.baseCSSClass = 'jqueryUcfTree';
			
			$(this).each( function() {
				
				function showTree(c, t) {
					$(c).addClass('wait');
					$(".jqueryUcfTree.start").remove();

					var handleAfterProcess = function(response){
						var jsondata = jQuery.parseJSON(response.responseText);
						var code = (jsondata && jsondata.code) ? jsondata.code : '';
						if (code != 0) 
						{
							if (jsondata.msg == '')
							{
								Ext.ucf.dispSysErrMsg();
							}
							else{
								Ext.ucf.flowMsg('{{lang.VMSG_MSG_ERROR}}', jsondata.msg);
							}
							return;
						}

						$(c).find('.start').html('');
						$(c).removeClass('wait').append(jsondata.html ? jsondata.html : '');	// TODO JSONに変えよう
						if( o.root == t )
							$(c).find('UL:hidden').show();
						else
							$(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
						// 既に下位データを保持していることを示すclass値をセット
						if( !$(c).hasClass('already') )
						{
							$(c).addClass('already');	
						}

						// チェックボックスクリック時のイベントハンドラ追加
						if(o.checkboxHandler)
						{
							$(c).find('UL LI INPUT').each(function(){
								$(this).click(function(){o.checkboxHandler(this);});
							});
						}

						// 初期表示時に第一階層を展開するなら
						if(o.expandFirstDeep && o.root == t )
						{
							$(c).find('UL LI').each(function(){
								showTree($(this), $(this).find('A.folder,A.expand').attr('rel'));
								$(this).removeClass('collapsed').addClass('expanded');
							});
						}
						//loadの処理が存在する場合実行
						if(load){
							load();	// Ajaxの呼び出しが完了時に行う処理。
						}
						bindTree(c);
					}
					// AJAXコール
				  Ext.Ajax.request({ 
				    url: o.script,
				    method: 'POST', 
				    params: {key: t,checkbox_hidden_flag:o.checkboxHidden ? 'HIDDEN' : '', anchor_type:o.anchor_type, baseCSSClass:o.baseCSSClass}, 
				    success: handleAfterProcess, 
				    failure: handleAfterProcess
				  }); 

				}
				
				function bindTree(t) {
					$(t).find('LI A.folder,LI A.expand').bind(o.folderEvent, function() {
						if( $(this).parent().hasClass('collapsed') ) {
							// Expand
							if( !o.multiFolder ) {
								$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
								$(this).parent().parent().find('LI.category').removeClass('expanded').addClass('collapsed');
							}
							// 末端以外の場合のみ処理
							if( $(this).attr('lowest_level') != 'on')
							{
								// 一度も取得したノードだけ取得処理を行う
								if( !$(this).parent().hasClass('already') )
								{
									$(this).parent().find('UL').remove(); // cleanup
									showTree( $(this).parent(), escape($(this).attr('rel')) );
								}
								// 一度取得したノードは開くだけにする（チェックボックスなどの状態保持のため）
								else
								{
									if( o.root == $(this).attr('rel') )
										$(this).parent().find('UL:hidden').show();
									else
										$(this).parent().find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
								}
								$(this).parent().removeClass('collapsed').addClass('expanded');
							}
						} else {
							// Collapse
							$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
							$(this).parent().removeClass('expanded').addClass('collapsed');
						}
						click($(this).attr('rel'), $(this).attr('rel2'), $(this).attr('lowest_level'));	// ここのパラメータがフロントイベントハンドラの引数となる
						return false;
					});
					// Prevent A from triggering the # on non-click events
					if( o.folderEvent.toLowerCase != 'click' ) $(t).find('LI A.folder,LI A.expand').bind('click', function() { return false; });
				}
				// Loading message
				$(this).html('<ul class="jqueryUcfTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
				// Get the initial file list

				showTree( $(this), escape(o.root) );
			});
		}
		
	});

	
})(jQuery);

