let msgSymbols = [
	'<i class="fal fa-exchange"></i>',
	'A', 'B', 'C', 'D',
	'<i class="fal fa-forward"></i>',
	'<i class="fal fa-volume-up"></i>',
	'<i class="fal fa-sync"></i>',
	'8',
	'<i title="disconnected" data-title="bluetooth-icon" class="fab fa-bluetooth"></i>',
];
let //symbolSending = '<i class="fas fa-hourglass fa-spin"></i>',
	symbolSending = '<span class=loader></span>',
	symbolDelivered = '<i class="fal fa-check icon-delivery-status"></i>',
	symbolSkipped = '<i class="fal fa-forward icon-delivery-status"></i>',
	symbolError = '<i class="fal fa-exclamation-triangle icon-delivery-status"></i>';
let database,
	seconds,
	start_time,
	timestamp,
	client,
	firebase_ping = 1,
	batteryLevel,
	signal,
	lastSkipped = false,
	$statusConsole,
	$statusConsoleContainer,
	view,
	$mainView,

	// Progress indicator
	$statusConsolePositioner,
	pillWidth,
	progress = 0,
	segmentLengths = [24, 24, 16, 20],
	currentSegment = 0;

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
			// config.apiKey = "AIzaSyClbcP5VcyQnl93OplUJHsQbAJikiDfJec";
			// config.databaseURL = "https://androbuzz-prod.firebaseio.com/" // PROD
			// break;
		case 'androbuzz.iredesigned.com/dev':
		case 'ab.test/':
			config.apiKey = "AIzaSyAc286y-5g5WL4vtSgCsmEV_afxYyO_kYM";
			config.databaseURL = "https://androbuzz-dev.firebaseio.com/"; // DEV
			break;
		default:
			// alert( 'Unknown host!' );
			config.apiKey = "AIzaSyAc286y-5g5WL4vtSgCsmEV_afxYyO_kYM";
			config.databaseURL = "https://androbuzz-dev.firebaseio.com/"; // DEV
	}
	return config;
}

function initializeVars() {
	view = {};
	$mainView = $( '#main-view' );
	$statusConsole = $( '#console' );
	$statusConsoleContainer = $( '.console-container' );
	$statusConsolePositioner = $( '.positioner' );
	pillWidth = ($statusConsole.width() + 4) / 10;
}

// Retrieve registered devices from database
function getPhones() {
	let request = {
		'action': 'getRegisteredDevices',
	};
	$.ajax( {
		type: 'POST',
		dataType: 'json',
		url: 'functions.php',
		data: request,
		success: function( devicesObject ) {

			// Convert object to associative array
			let devices = Object.keys( devicesObject ).map( function( key ) {
				let singleDevice = devicesObject[key];
				return singleDevice;
			} );

			// Create the dropdown options
			let dropdownHTML = '';
			devices.forEach( function( device ) {
				if (device['deactivated'] !== "true") {
					dropdownHTML += '<li>' +
						'<a title="Registered on ' + device['regDate'] + '\nRegistration token: ' + device['regToken']
						+ '" class="dropDownItem"'
						+ 'data-token="' + device['regToken'] + '"'
						+ 'data-deviceKey="' + device['deviceKey'] + '"'
						+ 'href="javascript:void(0);">' +
						'<span class="dropdownName">' + device['name'] + '</span>' +
						'<span class="dropdownNumber"><span>' + device['brand'] + ' ' + device['model'] + '</span>' + formatPhoneNumber( device['number'] ) + '</span>' +
						'</a>' +
						'</li>' +
						'<li class="divider"></li>';
				}

			} );
			dropdownHTML += '<li><a class="dropDownItem" href="javascript:setDefaultPhone">Set as default (not working yet)</a></li>';

			view['registered-phones'] = dropdownHTML;
			view['status'] = '';
			redraw();

			$( '.registered-phones li:nth-child(1) a' ).click();

			// Bind phone change event
			$( '.dropDownItem' ).click( function() {
				client = devicesObject[$( this ).attr( 'data-deviceKey' )];
				initDeviceListener();

				view['device-name'] = client['name'];
				view['device-details'] = client['brand'] + ' ' + client['model'];
				view['carrier'] = client['carrier'];
				redraw();

				$( '[name="0"]' ).click();
				$( '.panel-heading > .dropdown' ).hide();
				$( '.btn-disabled' ).removeClass( 'btn-disabled' );
				$( '.abc button' ).addClass( 'btn-primary' );
				$( '.panel-body, .panel-footer, .abc, .float-bottom' ).removeClass( 'fadedOut' );
			} );

			// Open dropdown once devices are loaded
			$( '#dropdownMenu1' ).show().click();
		},
		error: function( e ) {
			redraw( 'error', 'Error retrieving devices\n<pre>' + e.responseText + '</pre>' );
		}
	} );
}

function handleFirebaseResponse( data ) {
	if ( data['firebase_response']['success'] !== 1 ) {
		redraw( 'error', 'Firebase error. See console for details.\n' + data['firebase_response']['results'][0]['error'] );
		console.log( data );
		return;
	}
	let total_ping = Date.now() - start_time,
		firebase_ping = data['firebase_ping'],
		server_ping = total_ping - firebase_ping,
		device_ping = 0,
		command = data['command'];
	view['ping'] = (server_ping) + '+' + data['firebase_ping'];
	view['status'] = '<strong>' + command + '</strong> sent to server...';
	view['last-message'] = msgSymbols[data['command']];
	$( '.action_pill' ).attr( { "data-command": command, "class": "action_pill " + command } );

	let timeOut = setTimeout( function() {
		dataRef.off();
		redraw( 'status', 'Possibly undelivered.' );
		redraw( 'command-' + command, msgSymbols[command] + symbolError );
	}, 25000 );

	redraw();

	// Waiting for delivery confirmation
	let dataRef = database.ref( client['deviceKey'] + '/messages/' + data['messageDbKey'] );
	dataRef.on( 'value', function( snapshotJson ) {
		if ( snapshotJson.val() !== null ) {
			snapshot = snapshotJson.val();
			view['last-message'] = msgSymbols[data['command']];

			// Add message pills
			addPill( command, timestamp );

			// Check if it was skipped due to
			if ( snapshot['extras'] && snapshot['extras'].indexOf( "skipped" ) !== -1 ) {
				lastSkipped = true;
				redraw( 'status', 'Too soon! Skipped.' );
				$.when( removePill( "skipping" ) ).then( function() {
					addPill( "5", timestamp );
				} );
			} else lastSkipped = false;

			let signal = JSON.parse( snapshot['signal'] );
			signalInfo = snapshot['signalInfo'];
			$( '.signal-strength' ).attr( 'data-bars', signal.bars );
			batteryLevel = snapshot['batteryLevel'];
			device_ping = Date.now() - start_time - server_ping;

			// Status indicators
			view['signal-info'] = JSON.stringify( signal, null, 2 );
			view['signal-dbm'] = signal.dbm + " dBm " + signal.type.toUpperCase();
			view['bluetooth-name'] = signal.bt;
			view['bluetooth-icon'] = signal.route;
			if ( signal.oncall == "true" ) view['call-active'] = signal.oncall; else view['call-active'] = "false";

			// view['signal-type'] = signal.type;
			view['battery-level'] = batteryLevel + "%";

			// todo calculate exact ping based on time delivered vs time sent
			// todo vibration animation on pill plus negative delay based on actual delivery
			// todo bluetooth connection disconnection
			view['ping'] = $( '[data-info=ping]' ).html() + '+' + device_ping;
			view['status'] = 'Delivered';
			let timeDelivered = new Date( snapshot['timeDelivered'] );
			updateChart( [server_ping, firebase_ping, device_ping] );
			$( '.battery__indicator .level' ).width( batteryLevel + "%" );

			let suffix;
			if ( lastSkipped ) suffix = symbolSkipped; else suffix = symbolDelivered;
			// view['command-' + command] = msgSymbols[command] + suffix;
			redraw('command-' + command, msgSymbols[command] + suffix);

			redraw();
			$( '.action' ).blur();
			clearTimeout( timeOut );
			dataRef.off();
		}
	} );

}

// Execute command: send to server
function actionCommand( el ) {
	let command = el.attr( 'name' );
	redraw( 'status', 'Sending message... ' + command );
	redraw( 'error', '' );
	redraw( 'command-' + command, symbolSending );
	seconds = 0;
	let currentTime = new Date(),
		timestampOffsetHours = Math.floor( currentTime.getTimezoneOffset() / 60 ).toString(),
		timestampOffsetMinutes = (currentTime.getTimezoneOffset() % 60).toString(),
		timestampOffsetString = "-" + timestampOffsetHours.padStart( 2, "0" ) + timestampOffsetMinutes.padStart( 2, "0" );
	;

	timestamp = $.format.date( currentTime, "yyyy-MM-dd HH:mm:ss.SSS" );
	start_time = Date.now();

	// Prepare data
	let json = {
		'command': command,
		'clientId': client['regToken'],
		'timeStamp': timestamp + timestampOffsetString
	};
	let request = {
		'action': 'androbuzz',
		'command': JSON.stringify( json ),
	};

	// Send to our server, which will then send to Firebase and return a response.
	request = $.param( request );
	$.ajax( {
		type: 'POST',
		dataType: 'json',
		url: 'functions.php',
		data: request,
		success: function( data ) {
			handleFirebaseResponse( data );
		},
		error: function( e ) {
			redraw( 'error', '<pre>' + e.responseText + '</pre>' );
		}
	} );

	$( '.icon-delivery-status' ).remove();
	return false;
}

// Update fields
function redraw( field, value ) {
	let windowHeight = $( window ).height();
	$mainView = $( '#main-view' );
	if ( $( 'body' ).hasClass( 'body-fullscreen' ) ) {
		// ABC buttons will occupy entire screen
		$( '.abc' ).css( 'height', windowHeight );
		$mainView.css( 'height', 'auto' );
		// $( '.abc' ).scrollTop( 0 );
		$( 'html, body' ).animate( { scrollTop: $( '.abc' ).offset().top }, 'fast' );
	} else {
		$mainView.css( 'height', windowHeight + 'px' );
		$( 'html, body' ).animate( { scrollTop: 0 }, 'fast' );
	}
	if ( field === undefined || value === undefined ) {
		$mainView.find( '[data-info]' ).each( function() {
			$( this ).html( view[$( this ).attr( 'data-info' )] );
		} );
		$mainView.find( '[data-title]' ).each( function() {
			$( this ).attr( 'title', view[$( this ).attr( 'data-title' )] );
		} );
	} else {
		$( '#main-view' ).find( "[data-info=" + field + "]" ).html( value );
	}
}

// Add and remove commands to history
function addPill( command, timestamp ) {
	let symbol = msgSymbols[command];
	if ( symbol == null ) symbol = command;
	let $lastPill = $( '<span style="width: 0" data-command=' + command + ' class=buzz title="' + timestamp + '">' + symbol + '</span>' );
	$.when( $lastPill.appendTo( $statusConsole ) ).then( scrollHistory() );
	$lastPill.click( function() {
		removePill( $( this ) );
	} );
	$lastPill.animate( { width: pillWidth }, 500, "linear" );
	$( '.action_pill' ).css( 'width', pillWidth );
	updateProgress();
}
function removePill( $pill ) {
	if ( $pill === "skipping" ) {
		// We're removing the last TWO commands
		let $lastTwoPills = $statusConsole.find( '.buzz' ).slice( -2 );
		$lastTwoPills.animate( { width: 0 }, 500, "linear", function() {
			$( this ).remove();
			updateProgress();
			scrollHistory();
		} );
	} else {
		$pill.animate( { width: 0 }, 500, "linear", function() {
			$( this ).remove();
			updateProgress();
			scrollHistory();
		} );
	}
}
function scrollHistory() {
	let numberOfCommands = $statusConsole.find( '.buzz' ).length;
	let positionerPosition = -4;
	if ( numberOfCommands >= 10 ) {
		positionerPosition = (10 - numberOfCommands) * pillWidth - 4;
	}
	$statusConsolePositioner.animate( { "margin-left": positionerPosition }, 500, "linear" );
}

// Timer function
setInterval( function() {
	if ( seconds < 60 )
		$( '#timer' ).html( seconds + 's ago' );
	else
		$( '#timer' ).html( Math.floor(seconds / 60) + ' minutes ago' );
	++seconds;
}, 1000 );

// Update progress bar
function updateProgress() {
	progress = $( '#console' ).find( '[data-command=1],[data-command=2],[data-command=3],[data-command=4]' ).length;
	$( 'progress' ).attr( 'value', progress );
	$( 'progress' ).attr( 'max', segmentLengths[currentSegment] );
	$( '.progress-info' ).css( { 'right': $( 'progress' ).width() * (Math.max( segmentLengths[currentSegment] - progress, 0 )) / segmentLengths[currentSegment] + 'px' } );
	redraw( "progress-info", progress + "/" + segmentLengths[currentSegment] );
}

// Ping chart graph using chartist.js
let chart,
	chartData = {
		series: [
			Array(),
			Array(),
			Array()
		],
	},
	chartOptions = {
		lineSmooth: Chartist.Interpolation.simple(),
		showPoint: false,
		showLine: false,
		showArea: true,
		fullWidth: true,
		showLabel: false,
		axisX: {
			showGrid: false,
			showLabel: false,
			offset: 0
		},
		axisY: {
			showGrid: false,
			showLabel: false,
			offset: 0
		},
		chartPadding: 0,
		low: 0
	};
function initChart() {
	chart = new Chartist.Line( '.ct-chart', chartData, chartOptions );
	chart.on( 'draw', function( context ) {
		// First we want to make sure that only do something when the draw event is for bars. Draw events do get fired for labels and grids too.
		if ( context.type === 'line' ) {
			// With the Chartist.Svg API we can easily set an attribute on our bar that just got drawn
			context.element.attr( {
				// Now we set the style attribute on our bar to override the default color of the bar. By using a HSL colour we can easily set the hue of the colour dynamically while keeping the same saturation and lightness. From the context we can also get the current value of the bar. We use that value to calculate a hue between 0 and 100 degree. This will make our bars appear green when close to the maximum and red when close to zero.
				style: 'stroke: hsl(' + Math.floor( Chartist.getMultiValue( context.value ) / max * 100 ) + ', 50%, 50%);'
			} );
		}
	} );
}
function updateChart( pingSet ) {
	for ( let i = 0; i <= 2; i++ ) {
		chartData.series[i].push( parseInt( pingSet[i] ) );
		if ( chartData.series[i].length > 10 )
			chartData.series[i].shift();
	}
	chart.update( chartData );
}

// Button functions
function bindButtonFunctions() {

	// Command buttons
	$( '.action' ).click( function() {
		actionCommand( $( this ) );
	} );

	// Not used
	$( '#CLEAR' ).on( 'click', function() {
		$( '#console' ).find( 'span' ).slideUp( 'normal', function() {
			$( this ).remove();
		} );
	} );

	// Select segment
	$( '.segment .btn' ).click( function() {
		$( '.segment .btn' ).removeClass( 'active' );
		$( this ).addClass( 'active' );
		currentSegment = $( this ).index();
		updateProgress();
	} );

	// Fullscreen button
	$( '.fullscreen.btn' ).click( function() {
		$( 'body' ).removeClass( 'active' );
		if ( $( this ).hasClass( 'active' ) ) {
			$( this ).removeClass( 'active' );
			$( 'body' ).removeClass( 'body-fullscreen' );
		} else {
			$( this ).addClass( 'active' );
			$( 'body' ).addClass( 'body-fullscreen' );
		}
		redraw();
	} );

	// Manually add last command to progress. Useful for when no delivery confirmation is obtained but we know it arrived anyway.
	$( '.action_pill_container' ).click( function() {
		addPill( parseInt( $( '.action_pill' ).attr( 'data-command' ) ), 'added manually' );
		updateProgress();
	} );
}

// Message listener for device-initiated communications
function initDeviceListener() {

}

function deviceListener() {

}

// On ready
$( document ).ready( function() {
	firebase.initializeApp( initFirebaseConfig() );
	database = firebase.database();
	initializeVars();
	getPhones();
	bindButtonFunctions();
	updateProgress();
	initChart();
} );

// On load
$( window ).on( 'load', function() {

	// Temp for dev
	setTimeout( function() {
	}, 333 );
} );


