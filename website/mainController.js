// Traffix App
var traffixApp = angular.module('traffixApp', ['rzModule', 'ngResource']);

traffixApp.controller('MainController', ['$scope', '$rootScope', '$resource', '$http',
	function ($scope, $rootScope, $resource, $http, $sce) {

	$scope.icons = {"alert": ["images/warningImage.png", "images/warningImageHover.png"], 
					"hotspots": ["images/potentialHotspots.png", "images/potentialHotspotsHover.png"],
					"settings": ["images/settings.png", "images/settingsHover.png"]
				   };

	$scope.slider = {
	    value: 10,
	    options: {
	        showSelectionBar: true
	    }
	};

	//Based on the slider setting, we get the corresponding data from our SQL table

	//This is just dummy data for now
	$scope.current_incidents = [{'intersection':'Pacific Highway & W Broadway'}, 
								{'intersection':'W Broadway & State St.'},
								{'intersection':'W Ash St. & India St.'},
								{'intersection':'Front St. & Beach St.'}];

	// Panels
	$scope.showPanelGraph = false;
	$scope.showPanelStats = false;


	//Functions need for this app
	$scope.toTrustedHTML = function(html) {
        return $sce.trustAsHtml(html);
    };

    $scope.testFunction = function(){
    	var newList = $resource('/test');

        $scope.someHTML = newList.get();
        console.log($scope.someHTML);
    };

}]);

var map;

$(document).ready(function() {

	setTimeout(hide_splash, 2000);

	function hide_splash(){
		$("#splash_screen").fadeOut(500);
		// $scope.$broadcast('rzSliderForceRender');

		document.getElementById("map").style.height = window.innerHeight + "px";

		L.mapbox.accessToken = 'pk.eyJ1IjoidHVuZ2FsYmVydDk5IiwiYSI6ImNpcXhkbGplbTAxZnhmdm1nMjkycnE5ZjYifQ.nPjdhFFlu1agC8JmquUkkw';

		map = L.mapbox.map('map')
		  .setView([32.7157, -117.1611], 13);

		L.tileLayer('https://api.mapbox.com/styles/v1/tungalbert99/ciqxdskwv0007c4ktiubhssd4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVuZ2FsYmVydDk5IiwiYSI6ImNpcXhkbGplbTAxZnhmdm1nMjkycnE5ZjYifQ.nPjdhFFlu1agC8JmquUkkw').addTo(map);


		// add accidents
		add_accidents();
	}

});

function add_accidents() {
	// get request
	$.get( "assets/sandiegocameras.json", function( data ) {
		var data = data[ "_embedded" ][ "assets" ];
		var geojson = [];

		// iterate through items
		for( var i = 0; i < data.length; i++ ) {
			console.log( data[ i ] );

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
					"marker-symbol": "car"
				}
			} );
		}

		// add to map
		var myLayer = L.mapbox.featureLayer().setGeoJSON(geojson).addTo(map);
	} );
	/*
	$.get( "assets/accidents_SanDiego.txt", function( data ) {
		// get json
		var data = JSON.parse( data );
		var geojson = [];

		// iterate through items
		for( var i = 0; i < data.length; i++ ) {
			console.log( data[ i ] );

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
					"marker-color": "#3ca0d3",
					"marker-size": "large",
					"marker-symbol": "car"
				}
			} );
		}

		// add to map
		var myLayer = L.mapbox.featureLayer().setGeoJSON(geojson).addTo(map);
	} );
	*/
}