<?php

/**
 * @author Ahmed Al-Bayati
 */
class Push {

	private $command;

    private $messageDbKey;

    function __construct() {
        
    }

	public function setCommand( $command ) {
		$this->command = $command;
    }

	public function setMessageDbKey( $messageDbKey ) {
		$this->messageDbKey = $messageDbKey;
    }

    public function getPush() {
	    $res                          = [];
	    $res[ 'data' ][ 'command' ]   = $this->command;
	    $res[ 'data' ][ 'timestamp' ] = date( 'Y-m-d G:i:s P' );
	    $res[ 'data' ][ 'messageDbKey' ]  = $this->messageDbKey;

	    return $res;
    }

}
