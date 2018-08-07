let messages = [
	'⇄', 'A', 'B', 'C', 'D', '➟', '🔊&#xFE0E;', '↺'
];

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

function formatPhoneNumber( s ) {
	if ( s[0] == '1' ) {
		s = s.substr( 1 );
	}
	var s2 = ("" + s).replace( /\D/g, '' );
	var m = s2.match( /^(\d{3})(\d{3})(\d{4})$/ );
	return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
}


$( 'document' ).ready( function() {
	let view = {};
	let messageList = $( '#consoleDiv' );
	let mv = $( '#main-view' );


	function setDevice( reg_id ) {
		console.log( 'clicked ' + reg_id );
	}

	function getPhones() {
		let request = {
			'action': 'getRegisteredDevices',
		};
		$.ajax( {
			type: 'POST',
			dataType: 'json',
			url: 'functions.php',
			data: request,
			success: function( data ) {
				// here we create the dropdown options
				let dropdownHTML = '';
				allDevices = data;
				let totalPhones = data.length;
				for ( let i = 0; i < totalPhones; i++ ) {
					dropdownHTML += '<li><a class="dropDownItem"' + 'id="' + data[i]['reg_id'] + '"' + 'href="javascript:void(0);">' +
						'<span class="dropdownName">' + data[i]['name'] + '</span>' +
						'<span class="dropdownNumber"><span>' + data[i]['brand'] + ' ' + data[i]['model'] + '</span>' + formatPhoneNumber( data[i]['number'] ) + '</span>' +
						'</a></li>';
				}
				dropdownHTML += '<li class="divider"></li>';
				dropdownHTML += '<li><a class="dropdown-item" href="javascript:setDefaultPhone">Set as default (not working yet)</a></li>';

				view['registered-phones'] = dropdownHTML;
				redraw();
				$(".dropDownItem").click(function(){
					console.log( 'clicked' );
					let regId = $(this).attr("id");
					clientId = regId;
					for(let i=0; i<allDevices.length; i++){
						if(allDevices[i]["reg_id"] === clientId){
							clientJson = allDevices[i];
						}
					}
					// view['client_id'] = clientId;
					view['device'] = clientJson['name'];
					redraw();
					$( '#NOP' ).click();
					$('.panel-heading > .dropdown').remove();
					$( '.btn-disabled' ).removeClass( 'btn-disabled' ).addClass( 'btn-primary' );
				});
			}
		} );
	}

	getPhones();

	function redraw( field, value ) {
		let windowHeight = $( window ).height();
		$( '#main-view' ).css( 'max-height', windowHeight + 'px' );

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
		let message = $( this ).attr( 'name' );
		redraw( 'status', 'Sending message... ' + message );
		let currentTime = new Date(),
			hours = currentTime.getHours(),
			minutes = currentTime.getMinutes();
		seconds = currentTime.getSeconds();
		if ( minutes < 10 ) {
			minutes = "0" + minutes;
		}
		if ( seconds < 10 ) {
			seconds = "0" + seconds;
		}
		let timestamp = hours + ':' + minutes + ':' + seconds;
		start_time = Date.now();

		// Prepare data
		let json = { "message": message, "clientId": clientId };
		let request = {
			'action': 'androbuzz',
			'message': JSON.stringify(json)
		};
		request = $( this ).serialize() + '&' + $.param( request );
		// Send to PHP
		$.ajax( {
			type: 'POST',
			dataType: 'json',
			url: 'functions.php',
			data: request,
			success: function( data ) {
				// console.log("androBuzz response: " + JSON.stringify(data));
				if(data['response'] == "null") return;
				let msg = JSON.parse(data['response'].substring(1, data['response'].length-1));
				total_ping = Date.now() - start_time;
				firebase_ping = data['firebase_ping'];
				server_ping = total_ping - firebase_ping;
				view['ping'] = (server_ping) + 'ms + ' + data['firebase_ping'] + 'ms';

				let msgId = data['messageId'];
				// let msgId = data['battery'];
				view['response'] = msgId;
				view['status'] = '<strong>' + message + '</strong> sent. Waiting for delivery confirmation...';
				view['client_id'] = data['clientId'];
				if ( clientJson !== null ) {
					// view['device'] = clientJson['name'];
					// when device name works in the database, use this line instead of the one below

					view['device'] = clientJson['name'] + '&nbsp;&bull;&nbsp;' + clientJson['brand'] + '&nbsp;' + clientJson['model'] + '&nbsp;&bull;&nbsp;' + formatPhoneNumber(clientJson['number']);
				}

				view['message'] = '<span class="action_pill panel">' + messages[data['message']] + '</span>&nbsp;<span id=timer>0</span> ';
				seconds = 0;

				view['message_id'] = 'msgId: ' + msgId;

				let dataref = database.ref('messages/' + clientId + '/' + data['messageId']);

				let timeOut = setTimeout(function(){
					dataref.off();
					redraw( 'status', 'Operation timed out. Ready.' );
				}, 15000 );


				dataref.on('value', function(snapshot) {
					if ( snapshot.val() !== null ) {
						messageList.append( '<span class="bzzz' + message + '">' + messages[message] + '</span>' ).on( 'click', 'span', function() {
							$( this ).animate( { width: 0 }, function() {
								$( this ).remove();
							} );
						} );
						//view['battery-level'] = ?????????????????????['battery'] + '%';
						messageList.find( 'span:last-child' ).attr( 'title', timestamp );
						device_ping = Date.now() - start_time - server_ping;
						if(snapshot.child("signalStrength").val() != null){
							signalStrength = snapshot.child("signalStrength").val();
							redraw( 'signal-strength', signalStrength);
						}
						if(snapshot.child("batteryLevel").val() != null){
							batteryLevel = snapshot.child("batteryLevel").val();
							redraw( 'battery-level', batteryLevel + "%");
						}
						
						redraw( 'ping', $( '[data-label=ping]' ).html() + ' + ' + device_ping + 'ms' );
						redraw( 'status', 'Ready' );
						$( '.action' ).blur();
						clearTimeout(timeOut);
						dataref.off();
					}
				});

				redraw();
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

firebase.initializeApp( initFirebaseConfig() );
let database = firebase.database(),
	clientId,
	clientJson,
	server_ping = 1,
	firebase_ping = 1,
	start_time = 1,
	allDevices,
	batteryLevel,
	signalStrength;

$( window ).on( 'load', function() {
	// setTimeout( function() {
	// 	$( "#NOP" ).click();
	// }, 1000 ); // Test connection and initialize view



	$( "#CLEAR" ).on( 'click', function() {
		$( '#consoleDiv' ).find( 'span' ).slideUp( "normal", function() {
			$( this ).remove();
		} );
	} );
} );