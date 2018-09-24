<?php
class Firebase {

    // sending push message to single user by firebase reg id
    public function send($to, $message) {
        $fields = array(
	        'to'       => $to,
	        'priority' => 'high',
	        'data'     => $message,
        );
		$return = $this->sendPushNotification($fields);
	    return $return;
    }

    // function makes curl request to firebase servers
    private function sendPushNotification($fields) {
        
        require_once __DIR__ . '/config.php';

        // Set POST variables
        $url = 'https://fcm.googleapis.com/fcm/send';

        $headers = array(
            'Authorization: key=' . FIREBASE_API_KEY,
            'Content-Type: application/json'
        );
        // Open connection
        $ch = curl_init();

        // Set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_URL, $url);

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Disabling SSL Certificate support temporarly
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

        // Execute post
        $result = curl_exec($ch);

	    if ($result === FALSE) {
        	file_put_contents('log.txt', PHP_EOL . date('F j, Y, g:i:s a').' CURL error: '.curl_error($ch), FILE_APPEND);
            die('Curl failed: ' . curl_error($ch));
        }

        // Close connection
        curl_close($ch);

        return json_decode($result);
    }

    public function getJson($path){
        require_once __DIR__ . '/config.php';

        // Set POST variables
        $url = DEFAULT_DB_URL . '/' . $path . '.json';
        // $headers = array(
        //     'Authorization: key=' . FIREBASE_API_KEY,
        //     'Content-Type: application/json'
        // );
        // Open connection
        $ch = curl_init();

        // Set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_URL, $url);

        // curl_setopt($ch, CURLOPT_POST, true);
        // curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Disabling SSL Certificate support temporarly
         curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        // curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

        // Execute post
        $result = curl_exec($ch);
        if ($result === FALSE) {
            die('Curl failed: ' . curl_error($ch));
        }

        // Close connection
        curl_close($ch);

        return $result;
    }

	public function getDevices() {
		return self::getJson( '' ); // root of db
	}
}

?>