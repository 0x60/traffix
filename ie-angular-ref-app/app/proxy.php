<?php
	error_reporting( E_ALL );
	ini_set( 'display_errors', 1 );
	// reverse proxy for calls that don't work
	// params: URL, Authorization, Predix-Zone-Id
	/*
		Accept-Encoding:gzip, deflate, sdch, br
		Accept-Language:en-US,en;q=0.8,es;q=0.6
		Access-Control-Request-Headers:accept, authorization, predix-zone-id
		Access-Control-Request-Method:GET

		Response Headers
		Access-Control-Allow-Headers:Authorization,Predix-Zone-Id
		Access-Control-Allow-Methods:GET, POST, PUT, DELETE
		Access-Control-Allow-Origin:*
		Access-Control-Max-Age:1728000
		Cache-Control:no-cache, no-store, max-age=0, must-revalidate
		Expires:0
		Pragma:no-cache
	*/

	$request_url = $_GET[ "url" ];
	$auth = $_SERVER[ "HTTP_Authorization" ];
	$pzi = $_SERVER[ "HTTP_Predix_Zone_Id" ];

	// get file data
	preg_match( '/.+\/(.+)/', $request_url, $matches );
	$filename = 'images/' . $matches[ 1 ] . '.jpg';
	$fp = fopen( dirname(__FILE__) . '/' . $filename, 'w+' );


	// curl get
	$request_headers = array(
		"Authorization: " . $auth,
		"Predix-Zone-Id: " . $pzi,
		"Origin: " . $_SERVER[ "HTTP_ORIGIN" ],
		"Referer: " . $_SERVER[ "HTTP_REFERER" ],
		"Accept: */*",
		"DNT: 1" );

	$ch = curl_init(); 
	curl_setopt( $ch, CURLOPT_URL, $request_url ); 
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
	curl_setopt( $ch, CURLOPT_HTTPHEADER, $request_headers );
	curl_setopt( $ch, CURLOPT_FILE, $fp );
	curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
	curl_exec( $ch );
	curl_close( $ch );

	// close file
	fclose( $fp );

	// output
	header( "Content-Type: text/plain" );
	header( "Access-Control-Allow-Headers: Authorization,Predix-Zone-Id" );
	header( "Access-Control-Allow-Origin: https://traffix.run.aws-usw02-pr.ice.predix.io" );

	// get name
	echo $filename;