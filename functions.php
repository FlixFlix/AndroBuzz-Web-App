<?php
/**
 * Created by PhpStorm.
 * User: Felix
 * Date: 7/30/2018
 * Time: 11:36 PM
 */
require_once __DIR__ . '/config.php';

function send_to_device( $messageDbKey, $command, $clientId ) {


	$regId = $clientId;

	require_once __DIR__ . '/firebase.php';
	require_once __DIR__ . '/push.php';

	$firebase = new Firebase();
	$push     = new Push();

	$command = isset( $command ) ? $command : '';

	$push->setCommand( $command );
	$push->setMessageDbKey( $messageDbKey );

	$json     = $push->getPush();

	$response = $firebase->send( $regId, $json );
	return $response;

}
function androbuzz() {
	$post_data       = $_POST;
	$encoded_message = $post_data[ 'command' ];
	$message         = json_decode( $encoded_message );
	$start_time      = microtime( TRUE );
	$precise_time    = DateTime::createFromFormat( 'U.u', microtime( TRUE ) );
	$messageDbKey    = substr(
		$precise_time->setTimeZone( new DateTimeZone( 'America/Chicago' ) )
		             ->format( 'Y-m-d/H:i:s-u' ),
		0,
		- 3
	);

	$firebase_response = send_to_device( $messageDbKey, $message->command, $message->clientId );

	$response                        = [];
	$response[ 'firebase_response' ] = $firebase_response;
	$end_time                        = microtime( TRUE );

	$response[ 'firebase_ping' ] = strval( round( ( $end_time - $start_time ) * 1000 ) );
	$response[ 'command' ]       = $message->command;
	$response[ 'clientId' ]      = $message->clientId;
	$response[ 'messageDbKey' ]  = $messageDbKey;
	file_put_contents( 'log.txt', "send_to_device(): " . gettype( $response ) . PHP_EOL, FILE_APPEND );
	file_put_contents( 'log.txt', 'send_to_device() response: ' . PHP_EOL . json_encode( $response, JSON_PRETTY_PRINT ) . PHP_EOL . PHP_EOL, FILE_APPEND );
	echo json_encode( $response );
}

// This function will retrieve a list of registered devices
function getRegisteredDevices() {
	require_once __DIR__ . '/firebase.php';

	$firebase = new Firebase();
	$clientsJson = $firebase->getJson('clients');
	$clients = json_decode($clientsJson, true);
	$devices = []; // all devices in the database
	$i = 0;
//	file_put_contents('log.txt', $clientsJson);
	foreach($clients as $key => $value){
		$devices[ $i ] = [
			"deviceKey" => $key,
			"regToken"  => (array_key_exists( 'regToken', $value ) ? $value[ 'regToken' ] : "No registration token"),
			"model"     => $clients[ $key ][ 'model' ],
			"number"    => $clients[ $key ][ 'number' ],
			"name"      => $clients[ $key ][ 'name' ],
			"regDate"   => $clients[ $key ][ 'regDate' ],
			"brand"     => $clients[ $key ][ 'brand' ],
			// Please store phone name too: Settings > General > About Phone > Name
		];
		$i++;
	}
	$return = $devices;

	echo json_encode( $return );
}

// This function will be executed when the select element changes
function getCurrentDevice() {
	$current_device = [
		"reg_id" => "dwZ4ktuEVNw:APA91bFNsFR6glr9mnlTvQdR0Tijw2PJfH1zPWpnYdksNdX-91voQy5hEJV5SWmnAvaJ4hOifvrFLYrc0VufLosERB-ZukszxTKMvEHxgYq3Yq6rs0Qk8y10U5Rbged9V6CI8BucqWk4",
		"model"  => "LGE LG-M150",
		"number" => "773-555-1234",
	];

	$return = $current_device;

	echo json_encode( $return );
}

// This function will be executed when the select element changes
function changeCurrentDevice() {
	$data           = $_POST;
	$encoded_device = $data[ "device" ];
	$device         = json_decode( $encoded_device );

	// Set in firebase the new default device that will be receiving messages.
	// e.g. set_device()

}


function is_ajax() {
	return isset( $_SERVER[ "HTTP_X_REQUESTED_WITH" ] ) && strtolower( $_SERVER[ "HTTP_X_REQUESTED_WITH" ] ) == "xmlhttprequest";
}

if ( is_ajax() ) {
	if ( isset( $_POST[ "action" ] ) && ! empty( $_POST[ "action" ] ) ) { //Checks if action value exists
		$action = $_POST[ "action" ];
		$action();
		die();
	}
}

