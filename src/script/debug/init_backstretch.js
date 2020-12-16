$(function() {
	var $window = $(window), $wrapper = $('#wrapper'), $contents = $('#contents'), $mypagebox = $('#mypagebox'), fullscreen_flag = _is_fullscreen, is_hide_blind = _is_hide_blind, img_count = 0, img_arry = _bgpicary, iH = window.innerHeight;

	$(window).on('load', function() {
		resize_main();
		$wrapper.backstretch(img_arry[img_count], {
			speed : 0
		});

		// Pause the slideshow
		if(!fullscreen_flag){
			$wrapper.backstretch('pause');
			iH = window.innerHeight;
		}else{
		  var toggle_fullscreen = $('#toggle_fullscreen');
			toggleFullScreen(toggle_fullscreen);
		}

	});


	function toggleFullScreen(toggle_fullscreen){
		if(is_hide_blind){
			return;
		}
		if (fullscreen_flag) {
			toggle_fullscreen.find('img').attr('src', toggle_fullscreen.find('img').attr('src').replace('_enable', '_disable'));
			$('#newsbox,#footer').slideUp();
			$('#contents').css({
				'height' : $window.height()
			});
			$wrapper.backstretch('resize');
		} else {
			toggle_fullscreen.find('img').attr('src', toggle_fullscreen.find('img').attr('src').replace('_disable', '_enable'));
			$('#newsbox,#footer').slideDown();
			$('#contents').css({
				'height' : $window.height() - 30
			});
			$wrapper.backstretch('resize');
		}
		return false;
	}

	/*
	 * resize
	 */
	$(window).on('resize', function(event) {
		resize_main();
	});

	function resize_main() {
		if(is_hide_blind){
			return;
		}
		var wW = $window.width(), wH = $window.height();
		if (!fullscreen_flag) {
			$contents.css({
				'height' : wH - 30
			});
		} else {
			$contents.css({
				'height' : '100%'
			});
		}
		if ($mypagebox.size() != 0) {
			$mypagebox.css({
				'margin-top' : -($mypagebox.height() / 2 + 49)
			})
		}
		//$wrapper.backstretch('resize');
	}


	$('form').find('input').on({
		'focus' : function(e) {
			$wrapper.css({
				'height' : iH
			});
			// これがあると /resize のHTTPリクエストが飛んでしまうためコメントアウト 2014.12.25
			//$wrapper.backstretch('resize');
		},
		'blur' : function(e) {
			$wrapper.css({
				'height' : '100%'
			});
		}
	});

	/*
	 * click
	 */
	$('#toggle_fullscreen').on('click', function() {
		var $this = $(this);
		fullscreen_flag = !fullscreen_flag;
		return toggleFullScreen($this);
	});
	$('#arrow_next').on('click', function() {
		img_count++;
		if (img_count == img_arry.length) {
			img_count = 0;
		}
		$wrapper.backstretch(img_arry[img_count], {
			speed : 0
		});
		return false;
	});
	$('#arrow_prev').on('click', function() {
		img_count--;
		if (img_count == 0) {
			img_count = img_arry.length - 1;
		}
		$wrapper.backstretch(img_arry[img_count], {
			speed : 0
		});
		return false;
	});

	var $mypage_list = $('#mypage_list');
	if ($mypage_list.size() != 0) {
		$mypage_list.find('span').on('click', function() {
			return false;
		});
	}

});

//useragent
var _ua = (function() {
	var userAgent = window.navigator.userAgent.toLowerCase();
	var appVersion = window.navigator.appVersion.toLowerCase();
	if (userAgent.indexOf('opera') != -1) {
		return 'opera';
	} else if (userAgent.indexOf('msie') != -1) {
		if (appVersion.indexOf('msie 6.') != -1) {
			return 'ie6';
		} else if (appVersion.indexOf('msie 7.') != -1) {
			return 'ie7';
		} else if (appVersion.indexOf('msie 8.') != -1) {
			return 'ie8';
		} else if (appVersion.indexOf('msie 9.') != -1) {
			return 'ie9';
		} else {
			return 'ie';
		}
	} else if (userAgent.indexOf('chrome') != -1) {
		return 'chrome';
	} else if (userAgent.indexOf('safari') != -1) {
		return 'safari';
	} else if (userAgent.indexOf('gecko') != -1) {
		return 'gecko';
	} else {
		return false;
	}
})();

if (_ua == 'ie6') {
	//alert('このサイトを快適に閲覧いただくためには、最新のブラウザをご利用ください。');
}

