$(function () {
	var template = _.template($("#t-result-table").html()),
		$rt = $('#result-table');
	
	$('#loading-button').button().click(function () {
		$(this).button('loading');
		$('#alert').hide();
	});
	
	$('#form').submit(function () {
		var form = $(this),
			conf = {
				team: form.find('[name="team"]').val(),
				check: form.find('[name="check"]').val(),
				round: form.find('[name="round"]').val()
			};
		var worker = new Worker('js/round.js');
		worker.onmessage = function (oEvent) {
			var result = JSON.parse(oEvent.data);
			if (result[0] === true) {
				$rt.html(template({
					rounds: parseInt(conf.round),
					checks: parseInt(conf.check),
					data: result[1]
				}));
				$('#loading-button').button('complete');
			} else {
				alert('failed!');
			}
		};
		worker.postMessage(JSON.stringify(conf));
		return false;
	})
});