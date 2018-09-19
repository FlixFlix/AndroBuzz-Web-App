<?php
/**
 * Created by PhpStorm.
 * User: Felix
 * Date: 7/30/2018
 * Time: 11:36 PM
 */
require_once __DIR__ . '/config.php';

function sendToDevice( $messageDbKey, $command, $clientId, $timestamp ) {


	$regId = $clientId;

	require_once __DIR__ . '/firebase.php';
	require_once __DIR__ . '/messageModel.php';

	$firebase = new Firebase();
	$push     = new MessageModel();

	$command = isset( $command ) ? $command : '';

	$push->setCommand( $command );
	$push->setMessageDbKey( $messageDbKey );
	$push->setTimeStamp( $timestamp );

	$json     = $push->getPush();

	$response = $firebase->send( $regId, $json );
	return $response;

}
function androbuzz() {
	$post_data       = $_POST;
	$encoded_message = $post_data[ 'command' ];
	$message         = json_decode( $encoded_message );
	$start_time      = microtime( TRUE );
	$messageDbKey    = str_replace( " ", "/", substr( $message->timeStamp, 0, 10 ) ) . "/" . str_replace( ".", "-", substr( $message->timeStamp, 11, 12 ) );
//	file_put_contents( 'log.txt', "messageDbKey " . $messageDbKey . PHP_EOL, FILE_APPEND );
//	file_put_contents( 'log.txt', 'Full Request: ' . PHP_EOL . json_encode( $post_data, JSON_PRETTY_PRINT ) . PHP_EOL . PHP_EOL, FILE_APPEND );
	$firebase_response = sendToDevice( $messageDbKey, $message->command, $message->clientId, $message->timeStamp );

	$response                        = [];
	$response[ 'firebase_response' ] = $firebase_response;
	$end_time                        = microtime( TRUE );

	$response[ 'firebase_ping' ] = strval( round( ( $end_time - $start_time ) * 1000 ) );
	$response[ 'command' ]       = $message->command;
	$response[ 'clientId' ]      = $message->clientId;
	$response[ 'messageDbKey' ]  = $messageDbKey;
//	file_put_contents( 'log.txt', "send_to_device(): " . gettype( $response ) . PHP_EOL, FILE_APPEND );
//	file_put_contents( 'log.txt', 'send_to_device() response: ' . PHP_EOL . json_encode( $response, JSON_PRETTY_PRINT ) . PHP_EOL . PHP_EOL, FILE_APPEND );
	echo json_encode( $response );
}

// This function will retrieve a list of registered devices
function getRegisteredDevices() {
	require_once __DIR__ . '/firebase.php';

	$firebase = new Firebase();
	$clientsJson = $firebase->getJson('');
	$devices = json_decode($clientsJson, true);
	$i = 0;
//	foreach($devices as $key=>$device) {unset($device['messages']);}
//	foreach($devices as $key => $device){
//		file_put_contents( 'log.txt', implode(',',array_keys($device)) . PHP_EOL, FILE_APPEND );
//		foreach(array_keys($device) as $aaaa => $sjkhdjk){
//
//		}
//		$devices[ $i ] = [
//			"deviceKey"   => $key,
//			"regToken"    => (array_key_exists( 'regToken', $device ) ? $device[ 'regToken' ] : "regToken"),
//			"model"       => (array_key_exists( 'model', $device ) ? $device[ 'model' ] : "model"),
//			"number"      => (array_key_exists( 'number', $device ) ? $device[ 'number' ] : "number"),
//			"name"        => (array_key_exists( 'name', $device ) ? $device[ 'name' ] : "name"),
//			"regDate"     => (array_key_exists( 'regDate', $device ) ? $device[ 'regDate' ] : "regDate"),
//			"brand"       => (array_key_exists( 'brand', $device ) ? $device[ 'brand' ] : "brand"),
//			"carrier"     => ( array_key_exists( 'carrier', $device ) ? $device[ 'carrier' ] : "carrier" ),
//			"deactivated" => ( array_key_exists( 'deactivated', $device ) ? $device[ 'deactivated' ] : "" ),
//		];
//		$i++;
//	}
	$return = $devices;

	echo json_encode( $return );
}

// This function will be executed when the select element changes
function getCurrentDevice() {
	$current_device = [
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

