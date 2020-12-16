/**
 * Hack for ExtJS Grid layout problem for Chrome 19, 20
 *
 * http://www.sencha.com/forum/archive/index.php/t-198124.html?s=782e3297b3794980e855431bf90e6172
 */
Ext.chromeVersion = Ext.isChrome ? parseInt(( /chrome\/(\d{2})/ ).exec(navigator.userAgent.toLowerCase())[1],10) : NaN;
Ext.override(Ext.grid.ColumnModel, {
	getTotalWidth : function(includeHidden) {
		if (!this.totalWidth) {
			var boxsizeadj = (Ext.isChrome && Ext.chromeVersion > 18 ? 2 : 0);
			this.totalWidth = 0;
			for (var i = 0, len = this.config.length; i < len; i++) {
				if (includeHidden || !this.isHidden(i)) {
					this.totalWidth += (this.getColumnWidth(i) + boxsizeadj);
				}
			}
		}
		return this.totalWidth;
	}
});

/**
 * Fix for bug on HtmlEditor (FontSize Chrome case) mentioned at:
 * http://www.sencha.com/forum/showthread.php?124460-htmleditor-fontsize-google-chrome&p=678151#post678151
 */
Ext.override(Ext.form.HtmlEditor, {
    adjustFont: function(btn){
        var adjust = btn.getItemId() == 'increasefontsize' ? 1 : -1,
            doc = this.getDoc(),
            v = parseInt(doc.queryCommandValue('FontSize') || 2, 10);
            v = Math.max(1, v+adjust) + (Ext.isSafari ? 'px' : 0);
        this.execCmd('FontSize', v);
    //},
    }		// edit by T.ASAO 2017.02.08
});