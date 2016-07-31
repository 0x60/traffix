var map;
var footerHeight = 100;

function initMap() {
	// make map height of screen
	document.getElementById("map").style.height = ( window.innerHeight - footerHeight ) + "px";

	// init map
	L.mapbox.accessToken = 'pk.eyJ1IjoidHVuZ2FsYmVydDk5IiwiYSI6ImNpcXhkbGplbTAxZnhmdm1nMjkycnE5ZjYifQ.nPjdhFFlu1agC8JmquUkkw';

	map = L.mapbox.map('map')
	.setView([32.7157, -117.1611], 13);

	L.tileLayer('https://api.mapbox.com/styles/v1/tungalbert99/ciqxdskwv0007c4ktiubhssd4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVuZ2FsYmVydDk5IiwiYSI6ImNpcXhkbGplbTAxZnhmdm1nMjkycnE5ZjYifQ.nPjdhFFlu1agC8JmquUkkw').addTo(map);
}

function plotCameras() {
	// get request
	$.get( "assets/sandiegocameras.json", function( data ) {
		var data = data[ "_embedded" ][ "assets" ];
		var geojson = [];

		// iterate through items
		for( var i = 0; i < data.length; i++ ) {

			var co = data[ i ][ "coordinates" ][ "P1" ];

			// create
			geojson.push( {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": co.split( "," ).reverse()
				},
				"properties": {
					"title": "Accident at",
					"description": "LOCATION_PRETTY ",
					"marker-color": "#3ca0d3",
					"marker-size": "large",
					"marker-symbol": "camera"
				}
			} );
		}

		// add to map
		var myLayer = L.mapbox.featureLayer().setGeoJSON(geojson).addTo(map);
	} );
}

function plotAccidents() {
	$.get( "assets/accidents_SanDiego.txt", function( data ) {
		// get json
		var data = JSON.parse( data );
		var geojson = [];

		// iterate through items
		for( var i = 0; i < data.length; i++ ) {

			// create
			geojson.push( {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [ data[ i ].location[ 1 ], data[ i ].location[ 0 ]]
				},
				"properties": {
					"title": "Accident at " + data[ i ].locationName,
					"description": "LOCATION_PRETTY " + data[ i ].vehicles + " involved.",
					"marker-color": "#ffa0d3",
					"marker-size": "large",
					"marker-symbol": "car"
				}
			} );
		}

		// add to map
		var myLayer = L.mapbox.featureLayer().setGeoJSON(geojson).addTo(map);
	} );

}