Ext.ucf.element_selector = function(Record,data_key,columns,records,selected_keys,input_params){

	var params = {
		addBtnText: input_params.addBtnText || 'add'
		,removeBtnText: input_params.removeBtnText || 'remove'
		,addAllBtnText: input_params.addAllBtnText || 'add all'
		,removeAllBtnText: input_params.removeAllBtnText || 'remove all'
		,upBtnText: input_params.upBtnText || 'up'
		,downBtnText: input_params.downBtnText || 'down'
		,ListViewWidth: input_params.ListViewWidth || 200
		,ListViewHeight: input_params.ListViewHeight || 250
	};

	var reader;
	var store_src;
	var store_dst;
	var list_view_src;
	var list_view_dst;
	var panel;

	// 
	var refresh = function(skeys)
	{

		var records_dst = [];
		var records_src = [];

		var hash_keys = [];
		var hash_keys2 = [];
		Ext.each(skeys, function(key,idx){
			hash_keys[key] = '';
			hash_keys2[idx] = key;
		});

		//key:key_value value:record object
		var hash_records = [];

		Ext.each(records, function(record, idx){
			// set to distination hash.
			if(record.get(data_key) != undefined && hash_keys[record.get(data_key)] != undefined)
			{
				hash_keys[record.get(data_key)] = record;
			}
			// set to source hash.
			else
			{
				records_src.push(record);
			}
		});

		// sort selected_store.
		Ext.each(hash_keys2, function(key,idx){
			if(hash_keys[key] != '')
			{	
				records_dst.push(hash_keys[key]);
			}
		});	

		var jsons;

		jsons = Ext.ucf.toJson(records_dst);
		var records_json_dst = {};
		records_json_dst['root'] = jsons;
		records_json_dst['total'] = jsons.length;
		records_json_dst['success'] = true;
		records_json_dst['records'] = records_dst;

		jsons = Ext.ucf.toJson(records_src);
		var records_json_src = {};
		records_json_src['root'] = jsons;
		records_json_src['total'] = jsons.length;
		records_json_src['success'] = true;
		records_json_src['records'] = records_src;


		store_src.loadData(records_json_src, false);
		store_dst.loadData(records_json_dst, false);
	};

	var get_current_selected_keys = function()
	{
		var current_skeys = [];

		for(var i = 0; i < store_dst.data.length; i++)
		{
			var record = store_dst.data.get(i);
			current_skeys.push(record.get(data_key));
		}

		return current_skeys;
	};

	var add_items = function()
	{
		var skeys = get_current_selected_keys();

		var selected_records = list_view_src.getSelectedRecords();

		for(i = 0; i < selected_records.length; i++)
		{
			var selected_record = selected_records[i];
			skeys.push(selected_record.get(data_key));
		}

		refresh(skeys);
	};

	var add_all_items = function()
	{
		var skeys = get_current_selected_keys();

		var hash_exist_key = [];
		for(i = 0; i < skeys.length; i++)
		{
			hash_exist_key[skeys[i]] = '';
		}

		for(i = 0; i < records.length; i++)
		{
			var record = records[i];
			if(hash_exist_key[record.get(data_key)] != '')
			{
				skeys.push(record.get(data_key));
			}
		}

		refresh(skeys);
	};

	var remove_items = function()
	{
		var skeys = get_current_selected_keys();
		var selected_records = list_view_dst.getSelectedRecords();

		var hash_remove = [];
		for(i = 0; i < selected_records.length; i++)
		{
			var selected_record = selected_records[i];
			hash_remove[selected_record.get(data_key)] = '';
			//skeys.remove(selected_record.get(data_key));
		}

		var new_skeys = [];
		Ext.each(skeys, function(key){
			if(hash_remove[key] == undefined)
			{
				new_skeys.push(key);
			}
		});

		refresh(new_skeys);
	};

	var remove_all_items = function()
	{
		refresh([]);
	};

	var up_items = function()
	{
		var skeys = get_current_selected_keys();
		var selected_indexes = list_view_dst.getSelectedIndexes();
		selected_indexes.sort(function(a,b) {return a-b;});

		var is_up = false;
		if(selected_indexes.length > 0 && selected_indexes[0] > 0)
		{
			var hash_selected = [];
			for(i = 0; i < selected_indexes.length; i++)
			{
				var selected_record = list_view_dst.store.getAt(selected_indexes[i]);
				hash_selected[selected_record.get(data_key)] = '';
			}


			Ext.each(skeys, function(key,idx){
				if(hash_selected[key] != undefined)
				{
					var temp_key = skeys[idx - 1];
					skeys[idx] = temp_key;
					skeys[idx - 1] = key;
					is_up = true;
				}
			});
		}
		if(is_up)
		{
			refresh(skeys);
		}
		// keep selected status.
		var ary = [];
		Ext.each(selected_indexes, function(index){
			ary.push(is_up ? index - 1 : index);
		});
		list_view_dst.select(ary);
	};

	var down_items = function()
	{
		var skeys = get_current_selected_keys();
		var selected_indexes = list_view_dst.getSelectedIndexes();
		selected_indexes.sort(function(a,b) {return a-b;});

		var is_down = false;
		if(selected_indexes.length > 0 && selected_indexes[selected_indexes.length - 1] < skeys.length - 1)
		{
			var hash_selected = [];
			for(i = selected_indexes.length - 1; i >= 0; i--)
			{
				var selected_record = list_view_dst.store.getAt(selected_indexes[i]);
				hash_selected[selected_record.get(data_key)] = '';
			}

			for(idx = skeys.length - 1; idx >= 0; idx--){
				var key = skeys[idx];
				if(hash_selected[key] != undefined)
				{
					var temp_key = skeys[idx + 1];
					skeys[idx] = temp_key;
					skeys[idx + 1] = key;
					is_down = true;
				}
			}
		}

		if(is_down)
		{
			refresh(skeys);
		}

		// keep selected status.
		var ary = [];
		Ext.each(selected_indexes, function(index){
			ary.push(is_down ? index + 1 : index);
		});
		list_view_dst.select(ary);
	};

	
	return {

		getCurrentSelectedKeys : function()
		{
			return get_current_selected_keys();
		},
		makePanel : function() 
		{


			var records_json_dst = {};
			records_json_dst['root'] = [];
			records_json_dst['total'] = 0;
			records_json_dst['success'] = true;
			records_json_dst['records'] = records;

			var records_json_src = {};
			records_json_src['root'] = [];
			records_json_src['total'] = 0;
			records_json_src['success'] = true;
			records_json_src['records'] = records;

			reader = new Ext.data.JsonReader({
							idProperty: data_key,
							root:'root',
							totalProperty:'total',
							successProperty:'success'
			       }, Record
				);

			store_src = new Ext.data.Store({
				reader: reader,
				data: records_json_src
			  });

			store_dst = new Ext.data.Store({
				reader: reader,
				data: records_json_dst
			  });

			list_view_src = new Ext.ListView({
				store: store_src,
				width: params.ListViewWidth,
				height:params.ListViewHeight,
				autoHeight: true,
				multiSelect: true,
				simpleSelect: true,
				columnResize:false,
				columnSort:false,
				columns: columns
			});
			
			list_view_dst = new Ext.ListView({
				store: store_dst,
				width: params.ListViewWidth,
				height:params.ListViewHeight,
				autoHeight: true,
				multiSelect: true,
				simpleSelect: true,
				columnResize:false,
				columnSort:false,
				columns: columns
			});
			
			// add button.
			var btn_select = new Ext.Button({
				cls:'x-btn-small',
				text:'&nbsp;&nbsp;&nbsp;&nbsp;' + params.addBtnText + '&nbsp;&nbsp;&nbsp;&nbsp;',
				handler:function(){
					add_items();
				}
			});
			
			// remove button.
			var btn_remove = new Ext.Button({
				cls:'x-btn-small',
				text:'&nbsp;&nbsp;&nbsp;&nbsp;' + params.removeBtnText + '&nbsp;&nbsp;&nbsp;&nbsp;',
				handler:function(){
					remove_items();
				}
			});
			
			// all add button.
			var btn_add_all = new Ext.Button({
				cls:'x-btn-small',
				text:'&nbsp;&nbsp;&nbsp;&nbsp;' + params.addAllBtnText + '&nbsp;&nbsp;&nbsp;&nbsp;',
				handler:function(){
					add_all_items();
				}
			});
			// all remove button.
			var btn_remove_all = new Ext.Button({
				cls:'x-btn-small',
				text:'&nbsp;&nbsp;&nbsp;&nbsp;' + params.removeAllBtnText + '&nbsp;&nbsp;&nbsp;&nbsp;',
				handler:function(){
					remove_all_items();
				}
			});
			
			var panel_select_buttons = new Ext.Panel({
				border:false,
				frame:false,
		//		layout:'vbox',
		//		width:'90%',
				padding:5,
				layoutConfig: {
				},
				items:[btn_select,{xtype:'spacer',width:'5px'},btn_remove,{xtype:'spacer',width:'5px'},btn_add_all,{xtype:'spacer',width:'5px'},btn_remove_all],
				defaults:{border:false,frame:false}
			});

			// up button.
			var btn_up = new Ext.Button({
				cls:'x-btn-medium',
				text:'&nbsp;&nbsp;' + params.upBtnText + '&nbsp;&nbsp;',
				handler:function(){
					up_items();
				}
			});
			
			// down button.
			var btn_down = new Ext.Button({
				cls:'x-btn-medium',
				text:'&nbsp;&nbsp;' + params.downBtnText + '&nbsp;&nbsp;',
				handler:function(){
					down_items();
				}
			});
			

			var panel_updown_buttons = new Ext.Panel({
				border:false,
				frame:false,
		//		layout:'vbox',
		//		width:'90%',
//				padding:5,
				layoutConfig: {
				},
				items:[btn_up,btn_down],
				defaults:{border:false,frame:false}
			});

			
			// main panel
			panel = new Ext.Panel({
				border:false,
				frame:false,
				layout:'hbox',
				width:'90%',
//				autoHeight:true,
				padding:5,
		//		columns:5,
				layoutConfig: {
				},
				items:[list_view_src,{xtype:'spacer',width:'20px'},panel_select_buttons,{xtype:'spacer',width:'20px'},list_view_dst,{xtype:'spacer',width:'20px'},panel_updown_buttons],
				defaults:{border:false,frame:false}
			});

			// init elements
			refresh(selected_keys);

			return panel;
		},
		reset : function() 
		{
			refresh(selected_keys);
		}
		
	};
}