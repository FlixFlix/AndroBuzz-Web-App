<?php
/**
 * Created by PhpStorm.
 * User: Felix
 * Date: 7/30/2018
 * Time: 11:36 PM
 */

function loge( $text ) {
	file_put_contents( 'log.txt', date( "Y/m/d H:m:s" ) . ' ' . (string) $text . PHP_EOL, FILE_APPEND );
}

require_once __DIR__ . '/config.php';
function sendToDevice( $messageDbKey, $command, $clientId, $timestamp ) {
	require_once __DIR__ . '/firebase.php';
	require_once __DIR__ . '/messageModel.php';

	$regId    = $clientId;
	$command  = isset( $command ) ? $command : '';
	$firebase = new Firebase();
	$push     = new MessageModel();

	$push->setCommand( $command );
	$push->setMessageDbKey( $messageDbKey );
	$push->setTimeStamp( $timestamp );

	return $firebase->send( $regId, $push->getPush() );
}

function androbuzz() {
	$post_data       = $_POST;
	$encoded_message = $post_data[ 'command' ];
	$message         = json_decode( $encoded_message );
	$start_time      = microtime( TRUE );
	$messageDbKey    = str_replace( " ", "/", substr( $message->timeStamp, 0, 10 ) ) . "/" . str_replace( ".", "-", substr( $message->timeStamp, 11, 12 ) );
	$firebase_response = sendToDevice( $messageDbKey, $message->command, $message->clientId, $message->timeStamp );

	$response                        = [];
	$response[ 'firebase_response' ] = $firebase_response;
	$end_time                        = microtime( TRUE );

	$response[ 'firebase_ping' ] = strval( round( ( $end_time - $start_time ) * 1000 ) );
	$response[ 'command' ]       = $message->command;
	$response[ 'clientId' ]      = $message->clientId;
	$response[ 'messageDbKey' ]  = $messageDbKey;
	echo json_encode( $response );
}

// This function will retrieve a list of registered devices
function getRegisteredDevices() {
	require_once __DIR__ . '/firebase.php';

	$firebase = new Firebase();
	$clientsJson = $firebase->getJson('');
	$devices = json_decode($clientsJson, true);
	foreach ( $devices as $key => $device ) {
		unset( $device[ 'messages' ] );
		$device[ 'deviceKey' ] = $key;
		$devices[ $key ]       = $device;
	}
	echo json_encode( $devices );
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

