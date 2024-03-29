$ = jQuery.noConflict();
jQuery(document).ready(function($) {
	$(document).on('click', '.photonic-helper input[type="button"]', function() {
		$('.photonic-waiting').show();
		var formValues = $('#photonic-helper-form').serialize();
		var result = $(this).closest('.photonic-helper-area').find('.result');
		var nextToken = $(this).data('photonicToken') === undefined ? '' : '&nextPageToken=' + $(this).data('photonicToken');
		$.post(ajaxurl, "action=photonic_invoke_helper&helper=" + this.id + '&' + formValues + nextToken, function(data) {
			if (data.trim().length >= 3 && data.trim().substr(0,3) === '<tr') {
				$($(result).find('input[type="button"]')[0]).closest('tr').remove();
				$(result).find('table').append($(data));
			}
			else {
				$(result).html(data);
			}
			$('.photonic-waiting').hide();
		});
	});

	window.photonicSaveToken = function photonicSaveToken(e) {
		e.preventDefault();
		$('.photonic-waiting').show();
		var provider = $(this).data('photonicProvider');
		var nonce =  $(this).data('photonicNonce');
		var token = $('#' + provider + '-token').text();
		var tokenSecret = $('#' + provider + '-token-secret').text();
		var tokenExpiresIn = $('#' + provider + '-token-expires-in').val();
		var tokenClientId = $('#' + provider + '-token-client-id').val();
		var tokenUser = $('#' + provider + '-token-user').text();
		var args = {'action': 'photonic_save_token', 'provider': provider, 'token': token, 'secret': tokenSecret, 'expires_in': tokenExpiresIn, 'client_id': tokenClientId, 'user': tokenUser, '_ajax_nonce': nonce };
		$.post(ajaxurl, args, function (data) {
			window.location.replace(data);
		});
	};

	window.photonicParseUrl = function (url, prop) {
		var params = {};
		var search = decodeURIComponent( url.slice( url.indexOf( '?' ) + 1 ) );
		var definitions = search.split( '&' );

		definitions.forEach( function( val, key ) {
			var parts = val.split( '=', 2 );
			params[ parts[ 0 ] ] = parts[ 1 ];
		} );

		return ( prop && prop in params ) ? params[ prop ] : params;
	};

	$('.photonic-google-refresh').click(function(e) {
		e.preventDefault();
		var $clicked = $(this);
		$('.photonic-waiting').show();
		var provider = 'google';
		var result = $('#' + provider + '-result');
		var args = {'action': 'photonic_obtain_token', 'provider': provider, 'code': $('#photonic-' + provider + '-oauth-code').val(), 'state': $('#photonic-' + provider + '-oauth-state').val(), '_ajax_nonce': $clicked.data('photonicNonce') };
		$.post(ajaxurl, args, function(data) {
			data = $.parseJSON(data);
			$clicked.remove();
			$("<span class='button photonic-helper-button-disabled'>" +
				(Photonic_Admin_JS.obtain_token === undefined ? 'Step 2: Obtain Token' : Photonic_Admin_JS.obtain_token) +
				'</span>').insertBefore(result);
			$(result).html('<strong>Refresh Token:</strong> <code id="' + provider + '-token">' + data['refresh_token'] + '</code>');
            var a = $("<a href='#' class='button button-primary photonic-save-token' data-photonic-provider='" + provider + "' data-photonic-nonce='" + data['nonce'] +"'>Save Token</a>");
			a.insertAfter(result);
            a.on('click', photonicSaveToken);
			$('.photonic-waiting').hide();
		});
	});

	$('.photonic-zenfolio-delete').click(function(e) {
		e.preventDefault();
		var $clicked = $(this);
		$('.photonic-waiting').show();
		var result = $('#zenfolio-result');
		var args = {'action': 'photonic_delete_token', 'provider': 'zenfolio', '_ajax_nonce': $(this).data('photonicNonce')};
		$.post(ajaxurl, args, function(data) {
			$clicked.remove();
			$(result).html('<strong>Stored authentication credentials deleted</strong>');
			$('.photonic-waiting').hide();
		});
	});

	$('.photonic-token-request').click(function(e) {
		e.preventDefault();
		$('.photonic-waiting').show();
		var args = {'action': 'photonic_obtain_token', 'provider': $(this).data('photonicProvider'), '_ajax_nonce': $(this).data('photonicNonce') };
		$.post(ajaxurl, args, function(data) {
			window.location.replace(data);
		});
	});

	$("[data-photonic-provider='zenfolio']").click(function(e) {
		e.preventDefault();
		$('.photonic-waiting').show();
		var args = {'action': 'photonic_obtain_token', 'provider': $(this).data('photonicProvider'), 'password': $('[name="zenfolio-password"]').val(), '_ajax_nonce': $(this).data('photonicNonce')};
		$.post(ajaxurl, args, function(data) {
			$('#zenfolio-result').html(data);
			$('.photonic-waiting').hide();
		});
	});

	$('.photonic-save-token').on('click', photonicSaveToken);

	$(document).on('click', '.photonic-shortcode-replace', function(e) {
		e.preventDefault();
		var params = photonicParseUrl($(this).attr('href'));
		var args = {'action': 'replace_shortcode_individual', 'photonic_post_id': params.photonic_post_id};
		var input = $('<input>').attr('type', 'hidden').attr('name', 'action').val('replace_shortcode_individual');
		var $form = $('form[name="photonic-helper-form"]');
		$form.append(input);

		input = $('<input>').attr('type', 'hidden').attr('name', 'photonic_post_id').val(params.photonic_post_id);
		$form.append(input);
		$form.submit();
	});

	$('button.photonic-notice-dismiss').click(function(e) {
		e.preventDefault();
		var $clicked = $(this);
		var $notice = $clicked.parents('.notice');
		var dismissible = $clicked.attr('data-photonic-dismissible');
		var args = { action: 'photonic_dismiss_warning', dismissible: dismissible, _ajax_nonce: $clicked.data('photonicNonce') };
		$.post(ajaxurl, args, function(data) {
			var response = JSON.parse(data);
			response = Object.keys(response);
			if (response.indexOf(dismissible) > -1) {
				$notice.fadeOut();
			}
		});
	});
});
