<?php

class MessageModel {

	private $command;

    private $messageDbKey;

    private $timeStamp;

    function __construct() {
        
    }

	public function setCommand( $command ) {
		$this->command = $command;
    }

	public function setMessageDbKey( $messageDbKey ) {
		$this->messageDbKey = $messageDbKey;
    }

	public function setTimeStamp( $timeStamp ) {
		$this->timeStamp = $timeStamp;
    }

    public function getPush() {
	    $res                          = [];
	    $res[ 'data' ][ 'command' ]   = $this->command;
	    $res[ 'data' ][ 'timestamp' ] = $this->timeStamp;
	    $res[ 'data' ][ 'messageDbKey' ]  = $this->messageDbKey;

	    return $res;
    }

}
