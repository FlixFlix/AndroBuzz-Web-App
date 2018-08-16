let msgSymbols = [
	'⇄', 'A', 'B', 'C', 'D', '➟', '🔊&#xFE0E;', '↺'
];

function formatPhoneNumber( s ) {
	if ( s[0] == '1' ) {
		s = s.substr( 1 );
	}
	var s2 = ("" + s).replace( /\D/g, '' );
	var m = s2.match( /^(\d{3})(\d{3})(\d{4})$/ );
	return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
}

// Initialize Firebase
function initFirebaseConfig() {
	let url = window.location.hostname + window.location.pathname;
	let config = {};
	switch ( url ) {
		case 'androbuzz.iredesigned.com/':
			config.apiKey = "AIzaSyClbcP5VcyQnl93OplUJHsQbAJikiDfJec";
			config.databaseURL = "https://androbuzz-prod.firebaseio.com/"
			break;
		case 'androbuzz.iredesigned.com/dev':
		case 'ab.test/':
			config.apiKey = "AIzaSyAc286y-5g5WL4vtSgCsmEV_afxYyO_kYM";
			config.databaseURL = "https://androbuzz-dev.firebaseio.com/"
			break;
		default:
			alert( 'Unknown host!' );
	}
	return config;
}



$( 'document' ).ready( function() {
	firebase.initializeApp( initFirebaseConfig() );

	let view = {};
	let messageList = $( '#consoleDiv' );
	let mv = $( '#main-view' );
	function getPhones() {
		let request = {
			'action': 'getRegisteredDevices',
		};
		$.ajax( {
			type: 'POST',
			dataType: 'json',
			url: 'functions.php',
			data: request,
			success: function( devices ) {
				console.log( devices );
				// here we create the dropdown options
				let dropdownHTML = '';
				let totalPhones = devices.length;
				for ( let i = 0; i < totalPhones; i++ ) {
					dropdownHTML += '<li><a title="Registered on ' + devices[i]['regDate'] + '\nRegistration token: ' + devices[i]['regToken'] + '" class="dropDownItem"' + 'data-token="' + devices[i]['regToken'] + '"' + 'href="javascript:void(0);">' +
						'<span class="dropdownName">' + devices[i]['name'] + '</span>' +
						'<span class="dropdownNumber"><span>' + devices[i]['brand'] + ' ' + devices[i]['model'] + '</span>' + formatPhoneNumber( devices[i]['number'] ) + '</span>' +
						'</a></li>';
				}
				dropdownHTML += '<li class="divider"></li>';
				dropdownHTML += '<li><a class="dropdown-item" href="javascript:setDefaultPhone">Set as default (not working yet)</a></li>';
				view['registered-phones'] = dropdownHTML;

				redraw();

				$(".dropDownItem").click(function(){
					let regToken = $(this).attr('data-token');
					for ( let i = 0; i < devices.length; i++ ) {
						if ( devices[i]['regToken'] === regToken ) {
							client = devices[i];
							clientToken = regToken;
						}
					}
					view['device-name'] = client['name'] + '&nbsp;&bull;&nbsp;' + formatPhoneNumber( client['number'] );
					view['make-model'] = client['brand'] + '&nbsp;' + client['model'];
					redraw();

					$( '#NOP' ).click();
					$('.panel-heading > .dropdown').remove();
					$( '.btn-disabled' ).removeClass( 'btn-disabled' ).addClass( 'btn-primary' );
					$( '.panel-body, .panel-footer, .abc, .float-bottom' ).removeClass( 'fadedOut' );
				});
			},
			error: function( e ) {
				redraw( 'status', 'Error retrieving devices\n' + e.responseText );
			}
		} );
	}

	getPhones();

	function redraw( field, value ) {
		let windowHeight = $( window ).height();
		$( '#main-view' ).css( 'height', windowHeight + 'px' );

		if ( field === undefined || value === undefined ) {
			mv.find( '[data-label]' ).each( function() {
				$( this ).html( view[$( this ).attr( 'data-label' )] );
			} );
			mv.find( '[data-title]' ).each( function() {
				$( this ).attr( 'title', view[$( this ).attr( 'data-title' )] );
			} );
		} else {
			$( '#main-view' ).find( "[data-label=" + field + "]" ).html( value );
		}
	}

	$( '.action' ).click( function() {
		let command = $( this ).attr( 'name' );
		redraw( 'status', 'Sending message... ' + command );
		let currentTime = new Date(),
			hours = currentTime.getHours(),
			minutes = currentTime.getMinutes(),
			seconds = currentTime.getSeconds();
		if ( minutes < 10 ) {
			minutes = "0" + minutes;
		}
		if ( seconds < 10 ) {
			seconds = "0" + seconds;
		}
		let timestamp = hours + ':' + minutes + ':' + seconds;
		let start_time = Date.now();

		// Prepare data
		let json = { 'command': command, 'clientId': clientToken };
		let request = {
			'action': 'androbuzz',
			'command': JSON.stringify( json )
		};

		// Send to our server, which will then send to Firebase and return a response.
		request = $( this ).serialize() + '&' + $.param( request );
		$.ajax( {
			type: 'POST',
			dataType: 'json',
			url: 'functions.php',
			data: request,
			success: function( data ) {
				if ( data['firebase_response']['success'] !== 1 ) {
					redraw( 'status', 'Firebase error: ' + data['firebase_response']['results'][0]['error'] );
					console.log( data );
					return;
				}
				let total_ping = Date.now() - start_time,
					firebase_ping = data['firebase_ping'],
					server_ping = total_ping - firebase_ping;
				view['ping'] = (server_ping) + 'ms + ' + data['firebase_ping'] + 'ms';
				view['status'] = '<strong>' + command + '</strong> sent. Waiting for delivery confirmation...';
				view['last-message'] = '<span class="action_pill panel">' + msgSymbols[data['command']] + '</span>&nbsp;<span id=timer>0</span> ';
				seconds = 0; // Start counter

				let timeOut = setTimeout(function(){
					dataRef.off();
					redraw( 'status', 'Operation timed out. Ready.' );
				}, 15000 );

				redraw();

				let dataRef = database.ref( 'clients/' + client['deviceKey'] + '/messages/' + data['messageDbKey'] );
				dataRef.on( 'value', function( snapshotJson ) {
					if ( snapshotJson.val() !== null ) {
						snapshot = snapshotJson.val();

						messageList.append( '<span class="bzzz' + command + '">' + msgSymbols[command] + '</span>' ).on( 'click', 'span', function() {
							$( this ).animate( { width: 0 }, function() {
								$( this ).remove();
							} );
						} );
						messageList.find( 'span:last-child' ).attr( 'title', timestamp );
						device_ping = Date.now() - start_time - server_ping;

						signalStrength = snapshot['signal'];
						$( '.signal-strength' ).attr( 'data-bars', signalStrength );
						$( '.signal-strength' ).attr( 'title', signalStrength );
						view['signal-strength'] = signalStrength;
						batteryLevel = snapshot['batteryLevel'];
						view['battery-level'] = batteryLevel + "%";

						view['ping'] = $( '[data-label=ping]' ).html() + ' + ' + device_ping + 'ms';
						view['status'] = 'Ready';

						redraw();

						$( '.action' ).blur();
						clearTimeout(timeOut);
						dataRef.off();
					}
				});

			},
			error: function( e ) {
				redraw( 'data-status', e.responseText );
			}
		} );
		return false;
	} );
} );

let seconds = 0;
setInterval( function() {
	if ( seconds < 60 )
		$( '#timer' ).html( seconds + 's ago' );
	else
		$( '#timer' ).html( Math.floor(seconds / 60) + ' minutes ago' );
	++seconds;
}, 1000 );

let database,
	deviceKey,
	client,
	clientId,
	clientToken,
	server_ping = 1,
	firebase_ping = 1,
	start_time = 1,
	devices,
	batteryLevel,
	signalStrength;

$( window ).on( 'load', function() {
	database = firebase.database();
	$( '#CLEAR' ).on( 'click', function() {
		$( '#consoleDiv' ).find( 'span' ).slideUp( 'normal', function() {
			$( this ).remove();
		} );
	} );

	// $( '#dropdownMenu1' ).click( function() {
	// 	$( '.panel-body, .panel-footer, .abc, .float-bottom' ).addClass( 'fadedOut' );
	// } );

	$( '#dropdownMenu1' ).click();

} );
