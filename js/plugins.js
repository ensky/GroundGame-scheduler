// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());
// place any jQuery/helper plugins in here, instead of separate, slower script files.

// AjaxQueue
(function($){
		// jQuery on an empty object, we are going to use this as our Queue
		var ajaxQueue = $({});

		$.ajaxQueue = function(ajaxOpts){
				// hold the original complete function
				var oldComplete = ajaxOpts.complete;

				// queue our ajax request
				ajaxQueue.queue(function(next) {

						// create a complete callback to fire the next event in the queue
						ajaxOpts.complete = function() {
								// fire the original complete if it was there
								if (oldComplete) oldComplete.apply(this, arguments);

								next(); // run the next query in the queue
						};

						// run the query
						$.ajax(ajaxOpts);
				});
		};
})(jQuery);

// Error
window.error = function () {
	var $alert = $('#alert'),
		$alert_text = $('#alert-text');
	$(".alert").find('button.close').click(function () {
		$(this).parent().hide();
	});
	// $alert.find('button.close').click(function () {
		// $alert.hide();
	// });
	return function (err, type) {
		if ( !type ) {
			type = 'error';
		}
		$alert_text.text(err);
		$alert.attr('class', "alert alert-"+type);
		$alert.show();
	};
} ();

// API
window.API = function () {
	var ajax_error = function (jqXHR, textStatus, errorThrown) {
		json = $.parseJSON(jqXHR.responseText);
		if (json && json.http && json.http.msg) {
			error(json.http.msg);
		} else {
			error(errorThrown); 
		}
	};
	var ajax_success = function (success) {
		return function (jsonText) {
			json = jsonText.http ? jsonText : $.parseJSON(jsonText);
			if ( json !== null && json.http && json.http.code == 200 ) {
				success(json.data);
			} else {
				if ( json ) {
					ajax_error({
						responseText: jsonText,
						status: json.http.code
					}, 'error', json.http.msg);
				} else {
					ajax_error({
						responseText: "不明原因錯誤",
						status: 500
					}, 'error', "不明原因錯誤");
				}
			}
		};
	};		
	var ajax = function (opt, sync) {
		if ( sync === true ) {
			$.ajaxQueue(opt);
		} else {
			$.ajax(opt);
		}
	};
	
	var r = function (url, success, sync) {
		url = BASE_URL +'api/'+ url;
		var opt = {
			url: url,
			success: ajax_success(success),
			error: ajax_error
		};
		ajax(opt, sync);
	};
	
	var c = function (url, data, success, sync) {
		url = BASE_URL +'api/'+ url;
		var opt = {
			url: url,
			type: 'POST',
			data: data,
			success: ajax_success(success),
			error: ajax_error
		};
		ajax(opt, sync);
	};
	
	var u = function (url, data, success, sync) {
		url = BASE_URL +'api/'+ url;
		var opt = {
			url: url,
			type: 'PUT',
			data: data,
			success: ajax_success(success),
			error: ajax_error
		};
		ajax(opt, sync);
	};
	
	var d = function (url, success, sync) {
		url = BASE_URL +'api/'+ url;
		var opt = {
			url: url,
			type: 'DELETE',
			success: ajax_success(success),
			error: ajax_error
		};
		ajax(opt, sync);
	};
	
	return {
		c:c,
		r:r,
		u:u,
		d:d,
	};
} ();

// AjaxForm
window.AjaxForm = window.AjaxForm || {};
$('form.AjaxForm').live('submit', function () {
	var el = $(this),
		method = el.attr('method'),
		url = el.attr('data-api'),
		callback = el.attr('data-callback');
	switch ( method.toUpperCase() ) {
		case 'GET':
			method = 'r';
			API[method](url, AjaxForm[callback]);
			break;
		case 'POST':
			method = 'c';
			API[method](url, el.serialize(), AjaxForm[callback]);
			break;
		case 'PUT':
			method = 'u';
			API[method](url, el.serialize(), AjaxForm[callback]);
			break;
		case 'DELETE':
			method = 'd';
			API[method](url, AjaxForm[callback]);
			break;
	}
	return false;
});
