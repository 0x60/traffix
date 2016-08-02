app.controller('IEServiceCtrl', ['$scope','CurrentServices',function($scope, CurrentServices) {
	// TODO: make this dynamic
	// configuration
	var CONFIG = {
		assets: [
			1000000018,
			1000000019,
			1000000020,
			1000000021,
			1000000022,
			1000000023,
			1000000024,
			1000000025,
			1000000026,
			1000000027,
			1000000028,
			1000000029
		],
		assetLocations: {
			"1000000018": [ 32.711653, -117.157314 ],
			"1000000019": [ 32.712668, -117.157546 ],
			"1000000020": [ 32.711664, -117.156404 ],
			"1000000021": [ 32.712514, -117.158185 ],
			"1000000022": [ 32.712695, -117.157313 ],
			"1000000023": [ 32.712513, -117.157283 ],
			"1000000024": [ 32.712471, -117.158423 ],
			"1000000025": [ 32.711628, -117.156618 ],
			"1000000026": [ 32.711421, -117.157264 ],
			"1000000027": [ 32.713758, -117.155512 ],
			"1000000028": [ 32.713765, -117.156406 ],
			"1000000029": [ 32.713744, -117.157333 ]
		},
		showPitneyBowes: true,
		timerLimit: 3000,
		footerHeight: 80,
		headerHeight: 60,
		thingsToLoad: [
			false, // map
			false, // accident chart
			false, // accidents
			false, // streetlights
			false, // pedestrian heat maps
			false // car heatmaps
		],
		timeUnit: 'hour'
	};

	$( document ).ready( function() {
		initMap();
		getPitneyTokenAndPlot();
	} );

	// inital
	$scope.isLoading = true;

	$scope.cameraStatus = true;
	$scope.accidentStatus = true;
	$scope.pedestrianStatus = true;
	$scope.carStatus = true;
	$scope.showGraph = false;

	$scope.hoursEndRange = 3;

	$scope.trafficData = [];
	$scope.pedestrianData = [];

	// map stuff
	var map;

	var camerasLayer;
	var accidentsLayer;
	var pedestriansLayer;
	var carsLayer;

	var carlocations = {
		counts: {},
		speeds: {},
		processed: 0,
		timer: undefined,
		mapoptions: {
			maxZoom: 15,
			radius: 10,
			blur: 30,
			gradient: {
		        0.2: 'blue',
		        0.6: 'cyan',
		        1.0: 'lime'
		    }
		}
	}

	var pedestrianlocations = {
		counts: {},
		processed: 0,
		timer: undefined,
		mapoptions: {
			maxZoom: 15,
			radius: 10,
			blur: 30,
			gradient: {
		        0.2: 'yellow',
		        0.6: 'orange',
		        1.0: 'red'
		    }
		}
	}

	var cameralocations = {
		geojson: [],
		counter: 0,
		timer: undefined,
		imageCounter: 0
	};

	var accidentslocations = {
		geojson: [],
		counter: 0,
		timer: undefined
	};

	function initMap() {
		// make map height of screen
		document.getElementById("map").style.height = ( window.innerHeight - CONFIG.footerHeight - CONFIG.headerHeight ) + "px";

		// init map
		L.mapbox.accessToken = 'pk.eyJ1IjoidHVuZ2FsYmVydDk5IiwiYSI6ImNpcXhkbGplbTAxZnhmdm1nMjkycnE5ZjYifQ.nPjdhFFlu1agC8JmquUkkw';

		map = L.mapbox.map( 'map' ).setView( [32.712053, -117.157479], 16 );
		L.tileLayer('https://api.mapbox.com/styles/v1/tungalbert99/ciqxdskwv0007c4ktiubhssd4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVuZ2FsYmVydDk5IiwiYSI6ImNpcXhkbGplbTAxZnhmdm1nMjkycnE5ZjYifQ.nPjdhFFlu1agC8JmquUkkw').addTo(map);

		camerasLayer = L.mapbox.featureLayer().addTo( map );
		accidentsLayer = L.mapbox.featureLayer().addTo( map );
		pedestriansLayer = L.heatLayer( [], pedestrianlocations.mapoptions ).addTo( map );
		carsLayer = L.heatLayer( [], carlocations.mapoptions ).addTo( map );

		// disable zoom
		// map.touchZoom.disable();
		// map.doubleClickZoom.disable();
		// map.scrollWheelZoom.disable();
		// map.keyboard.disable();

		initChart();

		// trigger map loaded
		CONFIG.thingsToLoad[ 0 ] = true;
		checkAllLoaded();
	}

	function initChart() {
		// accidents per year chart
		$.get( "assets/accidents_SanDiego.txt", function( data ) {
			// get json
			var accidentsTime = {};
			var data = JSON.parse( data );

			// iterate through items
			for( var i = 0; i < data.length; i++ ) {
				var d = new Date(data[i]['time']);

				if(d === 'Invalid Date')
					continue;

				var year = d.getFullYear();

				// ensure year is not NaN
				if(isNaN(year))
					continue;

				year = year.toString();

				// ensure year exists and add accident to year
				if( ! accidentsTime[ year ] ) accidentsTime[ year ] = 0;
				accidentsTime[ year ]++;
			}

			var years = Object.keys(accidentsTime);
			var myData = [];

			for(var i = 0; i < years.length; i++){
				myData.push(accidentsTime[years[i]]);
			}

			var ctx = document.getElementById("myChart");
			var myChart = new Chart(ctx, {
			    type: 'line',
			    data: {
			      labels: years,
	    			datasets: [
			        	{
			            label: "# of Fatal Accidents",
			            fill: false,
			            lineTension: 0,
			            backgroundColor: "rgba(75,192,192,0.4)",
			            borderColor: "rgba(75,192,192,1)",
			            borderCapStyle: 'butt',
			            borderDash: [],
			            borderDashOffset: 0.0,
			            borderJoinStyle: 'miter',
			            pointBorderColor: "rgba(75,192,192,1)",
			            pointBackgroundColor: "#fff",
			            pointBorderWidth: 1,
			            pointHoverRadius: 5,
			            pointHoverBackgroundColor: "rgba(75,192,192,1)",
			            pointHoverBorderColor: "rgba(220,220,220,1)",
			            pointHoverBorderWidth: 2,
			            pointRadius: 1,
			            pointHitRadius: 10,
			            data: myData,
			            spanGaps: false,
			        	}]
			    },
			    options: {
			        scales: {
			            yAxes: [{
			                ticks: {
			                    beginAtZero:true
			                }
			            }]
			        },
			        responsive: false,
			        maintainAspectRatio: false
			    }
			});

			// trigger accident chart loaded
			CONFIG.thingsToLoad[ 1 ] = true;
			checkAllLoaded();
		} );
	}

	function plotStreetlights() {
		// get request
		$.get( "assets/sandiegocameras.json", function( data ) {
			var data = data[ "_embedded" ][ "assets" ];

			// iterate through items
			for( var i = 0; i < data.length; i++ ) {

				var co = data[ i ][ "coordinates" ][ "P1" ];
				co = co.split( "," ).reverse();

				// create
				cameralocations.geojson.push( {
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": co
					},
					"properties": {
						"title": "GE smart LED Streetlight",
						"description": "",
						"marker-color": "#3ca0d3",
						"marker-size": "large",
						"marker-symbol": "camera",
						"image": "",
						"images": [],
						"assetnumber": data[ i ][ "_links" ][ "self" ][ "href" ].match(/assets\/([0-9]+)/)[ 1 ]
					}
				} );

				cameralocations.counter++;
				cameralocations.imageCounter++;
			}

			$scope.getCameraAddress();
			$scope.getCameraImage();

			cameralocations.timer = setInterval( checkCameraGeoJsonDone, CONFIG.timerLimit );

			// trigger streetlights loaded
			CONFIG.thingsToLoad[ 3 ] = true;
			checkAllLoaded();
		} );
	}

	function plotAccidents() {
		$.get( "assets/accidents_SanDiego.txt", function( data ) {
			// get json
			var data = JSON.parse( data );

			// iterate through items
			for( var i = 0; i < data.length; i++ ) {

				// create
				accidentslocations.geojson.push( {
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [ data[ i ].location[ 1 ], data[ i ].location[ 0 ]]
					},
					"properties": {
						"title": "Accident at " + data[ i ].locationName,
						"description": "Involved: " + data[ i ].vehicles + " vehicle(s), " + data[ i ].persons + " person(s), " + data[ i ].pedestrians + " pedestrian(s), " + data[ i ].fatalities + " fatalities, " + data[ i ].drunkenPersons + " drunk. " + data[ i ].time,
						"marker-color": "#ffa0d3",
						"marker-size": "large",
						"marker-symbol": "car"
					}
				} );

				accidentslocations.counter++;
			}

			$scope.getAccidentsAddress();

			accidentslocations.timer = setInterval( checkAccidentsGeoJsonDone, CONFIG.timerLimit );

			// trigger accidents loaded
			CONFIG.thingsToLoad[ 2 ] = true;
			checkAllLoaded();
		} );

	}

	$scope.hoursChanged = function() {
		$( "input[type=range]" )[ 0 ].disabled = true;

		carsLayer.setLatLngs( [] );
		pedestriansLayer.setLatLngs( [] );

		CONFIG.thingsToLoad[ 5 ] = true;
		CONFIG.thingsToLoad[ 4 ] = true;

		$scope.isLoading = true;
		$( ".loading" ).text( "Loading..." );

		fetchUAA();
	};

	// Whenever this controller is loaded, it will give a call to below method.
	fetchUAA();

	/**
	* Below method will make a call to UAA Oauth Service and fetch the uaa token.
	* This uaa token will be further used to call other IE APIs.
	*/

	function fetchUAA() {
		CurrentServices.getUAAToken().then(function(data){
			$scope.uaaToken = data['access_token'];
		}).then(function(){
			// populate the start time, end time and size to give calls to apis.
			var endTime = moment.now();
			var startTime = moment(endTime).subtract( $scope.hoursEndRange, CONFIG.timeUnit ).valueOf();
			$scope.endTime = endTime;
			$scope.startTime = startTime;

			// get pedestrian data for each asset
			for(var i = 0; i < CONFIG.assets.length; i++){
				pedestrianlocations.counts[ CONFIG.assets[ i ] ] = 0;
				carlocations.counts[ CONFIG.assets[ i ] ] = 0;

				pedestrianlocations.processed++;
				carlocations.processed++;

				$scope.getPedestrianData( startTime, endTime, CONFIG.assets[ i ] );
		        $scope.getTrafficData( startTime, endTime, CONFIG.assets[ i ] );
			}

			// check when to render the heatmaps
			pedestrianlocations.timer = setInterval( checkPedestriansProcessed, CONFIG.timerLimit );
			carlocations.timer = setInterval( checkCarsProcessed, CONFIG.timerLimit );
		});
	};

	/**
	* Below method will make a call to traffic event Service and
	* populates the response data in scope object.
	*/
	$scope.getTrafficData = function(startTime, endTime, assetNumber) {
		// make sure we dont get NaNs
		if( isNaN( carlocations.counts[ assetNumber ] ) ) carlocations.counts[ assetNumber ] = 0;
		if( isNaN( carlocations.speeds[ assetNumber ] ) ) carlocations.speeds[ assetNumber ] = 0;

		CurrentServices.getTrafficData($scope.uaaToken, startTime, endTime, assetNumber).then(function(data) {
		    if (data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
		        for (var i = 0; i < data._embedded.events.length; i++) {
		            var event = data._embedded.events[i];
		            if (event && event.measures) {
		            	var objectData = {
		            		count: 0,
		            		speed: 0
		            	};

		                for (var idx = 0; idx < event.measures.length; idx++) {
		                    var measure = event.measures[idx];
		                    if (measure.tag === 'speed') {
		                        objectData.speed = parseInt( measure.value ); // in MPH
		                    } else if (measure.tag === 'vehicleCount') {
		                        objectData.count = parseInt( measure.value );
		                    }
		                }

		                carlocations.counts[ assetNumber ] += objectData.count;
		                carlocations.speeds[ assetNumber ] += objectData.speed * objectData.count;
		            }
		        }

		        if (data._links && data._links["next-page"]) {
		            var url = data._links["next-page"]["href"];
		            var newStartTime = url.substring(url.indexOf("start-ts=") + 9, url.indexOf("&end-ts"));
		            if (newStartTime !== 0) {
		                var newEndTime = url.substring(url.indexOf("end-ts=") + 7, url.indexOf("&size"));
		                $scope.getTrafficData(newStartTime, newEndTime, assetNumber);
		                carlocations.processed++;
		            }
		        }
		    }

		    carlocations.processed--;
		}, function(err) {
		    carlocations.processed--;
		});
	};

	/**
	* Below method will make a call to pedestrian event Service and
	* populates the response data in scope object.
	*/
	$scope.getPedestrianData = function( startTime, endTime, assetNumber ) {
		CurrentServices.getPedestrianData($scope.uaaToken, startTime, endTime, assetNumber).then(function(data) {
		    if (data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
		        for (var i = 0; i < data._embedded.events.length; i++) {
		            var event = data._embedded.events[i];
		            var objectData = {};
		            objectData.time = moment(event.timestamp).format('MMM Do YYYY, h:mm:ss a');
		            objectData['location'] = event['location-uid'];
		            if (event && event.measures && event.measures.length > 0) {
		                var measure = event.measures[0];
		                if (measure.tag && measure.tag === 'SFCNT') {
		                    pedestrianlocations.counts[ assetNumber ] += measure.value;
		                }
		            }
		        }

		        if (data._links && data._links["next-page"]) {
		            var url = data._links["next-page"]["href"];
		            var newStartTime = url.substring(url.indexOf("start-ts=") + 9, url.indexOf("&end-ts"));
		            if (newStartTime != 0) {
		                var newEndTime = url.substring(url.indexOf("end-ts=") + 7, url.indexOf("&size"));
		                $scope.getPedestrianData(newStartTime, newEndTime, assetNumber);
		                pedestrianlocations.processed++;
		            } 
		        }
		    }
		    pedestrianlocations.processed--;
		}, function(err) {
		    // something went wrong
		    pedestrianlocations.processed--;
		});
	};

	/**
	* Below method will make a call to public safety event Service and
	* populates the response data in scope object.
	*/
	$scope.getPublicSafetyData = function(startTime, endTime, assetNumber) {
		var publicSafetyData = {};

		CurrentServices.getPublicSafetyData($scope.uaaToken, startTime, endTime, assetNumber).then(function(data){
			if(data && data._embedded && data._embedded.medias) {
				var eventsLen =  data._embedded.medias.length;
				for (var eventsIdx = 0; eventsIdx < eventsLen; eventsIdx++) {
					var event = data._embedded.medias[eventsIdx];
					if(event['media-type'] === 'IMAGE') {
						publicSafetyData.imageUrl = event.url;
						break;
					}
				}
				publicSafetyData.imageUrl = publicSafetyData.imageUrl.replace(/^http:\/\//i, 'https://');

				CurrentServices.getImage($scope.uaaToken, publicSafetyData.imageUrl).then(function(data){
					publicSafetyData.imageToDisplay = data;
				}, function() {
					if(!publicSafetyData.imageToDisplay) {
						console.log( "no image to display" );
						publicSafetyData.imageToDisplay = 'images/parking_location.png';
					}
				});
			}
		});

		$scope.publicSafetyData = publicSafetyData;
	};

	/**
	* Below method will make a call to parking event Service and
	* populates the response data in scope object.
	*/
	$scope.getParkingData = function(startTime, endTime, size) {
		var parkingData = {};
		CurrentServices.getParkingData($scope.uaaToken, startTime, endTime, size).then(function(data){
			if(data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
					var event = data._embedded.events[0];
					parkingData.time = moment(event.timestamp).format('MMM Do YYYY, h:mm:ss a');
					parkingData['location'] = event['location-uid'];
					if(event['event-type'] === 'PKOUT') {
						parkingData.lastEvent = 'Car Out';
					} else {
						parkingData.lastEvent = 'Car In';
					}
			}
		});

		$scope.parkingData = parkingData;
	};

	/**
	* Below method will make a call to environmental Service and
	* populates the response data in scope object.
	*/
	$scope.getEnvironmentalData = function(startTime, endTime, size) {
		$scope.evnData = {};

		// Below is call to environmental occupancy service.
		CurrentServices.getEnvOccupancy($scope.uaaToken, startTime, endTime, size).then(function(data){
			if(data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
					var event = data._embedded.events[0];
					if(event.measures && event.measures.length > 0) {
						var occuMeasure = event.measures[0];
						if(occuMeasure.tag === 'OCCUPANCY') {
							$scope.evnData.occupancy = occuMeasure.value;
						}
					}
			}
		});

		// Below is call to environmental temparature service.
		CurrentServices.getEnvTemp($scope.uaaToken, startTime, endTime, size).then(function(data){
			if(data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
					var event = data._embedded.events[0];
					if(event.measures && event.measures.length > 0) {
						var tempMeasure = event.measures[0];
						if(tempMeasure.tag === 'TEMP') {
							$scope.evnData.temp = tempMeasure.value + '° C';
						}
					}
			}
		});

		// Below is call to environmental light level service.
		CurrentServices.getEnvLight($scope.uaaToken, startTime, endTime, size).then(function(data){
			if(data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
					var event = data._embedded.events[0];
					if(event.measures && event.measures.length > 0) {
						var lightMeasure = event.measures[0];
						if(lightMeasure.tag === 'LIGHT_LEVEL') {
							$scope.evnData.light = lightMeasure.value + ' lux';
						}
					}
			}
		});
	};

	/**
	* Below method will make a call to Indoor Positioning Service and
	* populates the response data in scope object.
	*/
	$scope.getIndoorPositioningData = function(startTime, endTime) {
		$scope.indoorData = {};

		// Below is call to historical path service.
		CurrentServices.getHistoricalPath($scope.uaaToken, startTime, endTime).then(function(data){
			$scope.indoorData.pathData = {};
			if(data && data.properties) {
				if(data.properties.length <= 0) {
					data.properties.push({'device-id':'P_8','session-id':'a3787d86-12d7-43a2-a3c6-f9ff4262c4ce','sesion-start':1461173320795,'session-end':1461174825795,'path-weight':{'Entry-Exit':1,'':118,'Zone-2':114,'Zone-1':66}},{'device-id':'P_8','session-id':'92111662-d561-4e02-b926-bb7e6cd1feb0','sesion-start':1461175225473,'session-end':1461175235474,'path-weight':{'Entry-Exit':3}});
				}
				var prop = data.properties[0];
				var device = prop['device-id'];
				var sessionStartTime = moment(prop['sesion-start']).format('MMM Do YYYY, h:mm:ss a');
				var sessionEndTime = moment(prop['sesion-end']).format('MMM Do YYYY, h:mm:ss a');
				var zones = [];
				if(prop['path-weight']) {
					if(prop['path-weight']['Zone-1']) {
						zones.push('Zone-1: '+ prop['path-weight']['Zone-1'] + ' sec');
					}
					if(prop['path-weight']['Zone-2']) {
						zones.push('Zone-2: '+ prop['path-weight']['Zone-2'] + ' sec');
					}
				}
				$scope.indoorData.pathData.details = device + '; ' + sessionStartTime + ' - ' + sessionEndTime + ';';
				$scope.indoorData.pathData.zones = zones;
			}
		});

		// Below is call to historical position service.
		CurrentServices.getHistoricalPosition($scope.uaaToken, startTime, endTime).then(function(data){
			$scope.indoorData.positionData = {};
			if(data && data.properties) {
				if(data.properties.length <= 0) {
					data.properties.push({'x':40,'y':454,'z':0,'weight':6,'time-stamp':1461173320786});
				}
				var prop = data.properties[0];
				$scope.indoorData.positionData = '(' +  prop.x + ', '+ prop.y + ', '+ prop.z + '); ' + moment(prop['time-stamp']).format('MMM Do YYYY, h:mm:ss a') + '; ' + prop.weight + ' sec';
			}
		});

		// Below is call to historical dwell time service.
		CurrentServices.getHistoricalDwellTime($scope.uaaToken, startTime, endTime).then(function(data){
			$scope.indoorData.dwellTimeData = [];
			if(data && data.properties) {
				if(angular.equals({}, data.properties)) {
					data.properties ={'Zone-0':721,'Zone-4':214,'Zone-3':407,'Zone-2':305,'Zone-1':400,'Zone-5':14,'Entry-Exit':68};
				}
				var prop = data.properties;
				for (var item in prop) {
					if (item.startsWith('Zone-')) {
						$scope.indoorData.dwellTimeData.push(item + ': ' + prop[item] + ' sec');
					}
				}
			}
		});
	};

	/**
	 * Below method is utility for getting the direction based on the degree.
	 *  East = 337.5 – 22.5 deg
	 *  Northeast = 22.5-67.5 deg
	 *  North = 67.5-112.5 deg
	 *  Northwest = 112.5 – 157.5 deg
	 *  West = 157.5-202.5 deg
	 *  Southwest = 202.5-247.5 deg.
	 *  South = 247.5-292.5 deg
	 *  Southeast = 292.5-337.5 deg.
	 */
	 $scope._getDirectionByDegree = function(degree) {
		 var returnDirection = '';
		 if (degree !== undefined && degree !== null) {
			 switch (true) {
				 case degree >= 337.5 || degree < 22.5:
					 returnDirection = 'East';
					 break;
				 case degree >= 22.5 && degree < 67.5:
					 returnDirection = 'Northeast';
					 break;
				 case degree >= 67.5 && degree < 112.5:
					 returnDirection = 'North';
					 break;
				 case degree >= 112.5 && degree < 157.5:
					 returnDirection = 'Northwest';
					 break;
				 case degree >= 157.5 && degree < 202.5:
					 returnDirection = 'West';
					 break;
				 case degree >= 202.5 && degree < 247.5:
					 returnDirection = 'Southwest';
					 break;
				 case degree >= 247.5 && degree < 292.5:
					 returnDirection = 'South';
					 break;
				 case degree >= 292.5 && degree < 337.5:
					 returnDirection = 'Southeast';
					 break;
			 }
		 }
		 return returnDirection;
	}

	function checkCameraGeoJsonDone() {
		if( cameralocations.counter <= 0 && cameralocations.imageCounter <= 0 ) {
			// add to map
			camerasLayer.on( 'layeradd', function( e ) {
				var marker = e.layer,
					feature = marker.feature;

				// generate content
				var content = '<h2>' + feature.properties.title + '<\/h2>' + '<p>' + feature.properties.address + '<\/p>' + '<p>' + feature.properties.description + '<\/p>' + '<h3>Recent Images:<\/h3>';

				content += '<div class="img-cont">';
				for( var i = 0; i < feature.properties.images.length; i++ )
					content += '<div class="img-holder"><a href="' + feature.properties.images[ i ] + '" target="_blank"><img src=' + feature.properties.images[ i ] + '></a></div>';
				content += '</div>';

				marker.bindPopup( content );
			} );

			camerasLayer.setGeoJSON( cameralocations.geojson );

			// stop checking
			clearInterval( cameralocations.timer );

		} else {
			console.log( "cameras left: " + cameralocations.counter );
			console.log( "cameras images left: " + cameralocations.imageCounter );
		}
	}

	function checkAccidentsGeoJsonDone() {
		if( accidentslocations.counter <= 0 ) {
			// add to map
			accidentsLayer.on( 'layeradd', function( e ) {
				var marker = e.layer,
					feature = marker.feature;
				var content = '<h2>' + feature.properties.title + '<\/h2>' + '<p>' + feature.properties.address + '<\/p>' + '<p>' + feature.properties.description + '<\/p>';
				marker.bindPopup( content );
			} );

			accidentsLayer.setGeoJSON( accidentslocations.geojson );

			// stop checking
			clearInterval( accidentslocations.timer );
		} else {
			console.log( "accidents left: " + accidentslocations.counter );
		}
	}

	$scope.getCameraAddress = function() {
		if( CONFIG.showPitneyBowes ) {
			cameralocations.geojson.forEach( function( listItem, index ) {
				var latitude = listItem.geometry.coordinates[ 1 ];
				var longitude = listItem.geometry.coordinates[ 0 ];

				CurrentServices.getPitneyAddress( $scope.pitneyToken, latitude, longitude ).then( function( data ) {
					var address = data.location[ 0 ].address;
					cameralocations.geojson[ index ].properties.address = address.formattedAddress;
					cameralocations.counter--;
				}, function( err ) {
					cameralocations.geojson[ index ].properties.address = "PitneyBowes Error";
					cameralocations.counter--;
				} );
			} );
		} else {
			cameralocations.geojson.forEach( function( listItem, index ) {
				cameralocations.geojson[ index ].properties.address = "PitneyBowes Error";
				cameralocations.counter--;
			} );
		}
	};

	$scope.getCameraImage = function() {
		cameralocations.geojson.forEach( function( listItem, index ) {
			var sTime = $scope.startTime;
			var eTime = $scope.endTime;
			var aNumber = listItem.properties.assetnumber;

			var imageURL;
			var imageURLs = [];

			CurrentServices.getPublicSafetyData( $scope.uaaToken, sTime, eTime, aNumber ).then( function( data ) {
				// get camera data
				if( data && data._embedded && data._embedded.medias ) {
					// we have camera data
					// find events
					var eventsLen =  data._embedded.medias.length;
					for (var eventsIdx = 0; eventsIdx < eventsLen; eventsIdx++) {
						var event = data._embedded.medias[eventsIdx];
						if(event['media-type'] === 'IMAGE') {
							imageURL = event.url;
							imageURLs.push( event.url );
						}
					}

					// replace http with https
					// get image from our reverse proxy
					imageURL = imageURL.replace(/^http:\/\//i, 'https://');
					CurrentServices.getImage( $scope.uaaToken, imageURL ).then( function( data ) {
						cameralocations.imageCounter--;
						cameralocations.geojson[ index ].properties.image = data;
					}, function( err ) {
						cameralocations.imageCounter--;
					} );

					// now do it for the list
					for( var i = 0; i < imageURLs.length; i++ ) {
						cameralocations.imageCounter++;

						imageURLs[ i ] = imageURLs[ i ].replace(/^http:\/\//i, 'https://');
						CurrentServices.getImage( $scope.uaaToken, imageURLs[ i ] ).then( function( data ) {
							cameralocations.imageCounter--;
							cameralocations.geojson[ index ].properties.images.push( data );
						}, function( err ) {
							cameralocations.imageCounter--;
						} );
					}
				} else {
					// no camera data
					cameralocations.imageCounter--;
				}
			});
		} );
	};

	$scope.getAccidentsAddress = function() {
		if( CONFIG.showPitneyBowes ) {
			accidentslocations.geojson.forEach( function( listItem, index ) {
				var latitude = listItem.geometry.coordinates[ 1 ];
				var longitude = listItem.geometry.coordinates[ 0 ];
				CurrentServices.getPitneyAddress( $scope.pitneyToken, latitude, longitude ).then( function( data ) {
					var address = data.location[ 0 ].address;
					accidentslocations.geojson[ index ].properties.address = address.formattedAddress;
					accidentslocations.counter--;
				}, function( err ) {
					accidentslocations.geojson[ index ].properties.address = "PitneyBowes Error";
					accidentslocations.counter--;
				} );
			} );
		} else {
			accidentslocations.geojson.forEach( function( listItem, index ) {
				accidentslocations.geojson[ index ].properties.address = "PitneyBowes Error";
				accidentslocations.counter--;
			} );
		}
	};

	function getPitneyTokenAndPlot() {
		CurrentServices.getPitneyBowesToken().then(function(data){
			$scope.pitneyToken = data['access_token'];
		}).then(function(){
				plotAccidents();
				plotStreetlights();
		});
	}

	$scope.toggleCameraState = function(cameraStatus){
		if( ! cameraStatus ) {
			map.removeLayer( camerasLayer );
		} else {
			map.addLayer( camerasLayer );
		}
	}

	$scope.toggleAccidentState = function(accidentStatus){
		if( ! accidentStatus ) {
			map.removeLayer( accidentsLayer );
		} else {
			map.addLayer( accidentsLayer );
		}
	}

	$scope.showGraph = false;

	$scope.toggleGraph = function(show){
		if(!show){
			showGraph = true;
		}
		else{
			showGraph = false;
		}
	}

	/**
	 * Heatmap Stuff
	 */

	function checkPedestriansProcessed() {
		if( pedestrianlocations.processed <= 0 ) {
			// stop checking
			clearInterval( pedestrianlocations.timer );

			// add to map
			var temparray = [];

			for( var i = 0; i < CONFIG.assets.length; i++ ) {
				var assetnum = CONFIG.assets[ i ];
				var count = pedestrianlocations.counts[ assetnum ];

				if( count >= 0 ) {
					// only work on counts > 0
					var lat = CONFIG.assetLocations[ assetnum ][ 0 ];
					var lng = CONFIG.assetLocations[ assetnum ][ 1 ];

					for( var j = count; j > 0; j-- ) {
						var tlat = lat;
						var tlng = lng;

						if( Math.random() > 0.5 ) {
							tlat += ( ( Math.random() - 0.5 ) * 0.001 );
							tlng += ( ( Math.random() - 0.5 ) * 0.00001 );
						} else {
							tlat += ( ( Math.random() - 0.5 ) * 0.00001 );
							tlng += ( ( Math.random() - 0.5 ) * 0.001 );
						}

						temparray.push( [ tlat, tlng, Math.random() * 0.2 ] );
					}
				}
			}

			pedestriansLayer.setLatLngs( temparray );

			// trigger pedestrian heat map loaded
			CONFIG.thingsToLoad[ 4 ] = true;
			checkAllLoaded();
		} else {
			console.log( "pedestrian locations left: " + pedestrianlocations.processed );
		}
	}

	$scope.togglePedestrianState = function( pedestrianStatus ){
		if( ! pedestrianStatus ) {
			map.removeLayer( pedestriansLayer );
		} else {
			map.addLayer( pedestriansLayer );
		}
	}

	function checkCarsProcessed() {
		if( carlocations.processed <= 0 ) {
			// stop checking
			clearInterval( carlocations.timer );

			// add to map
			var temparray = [];

			var maxcount = 0;
			for( var i = 0; i < CONFIG.assets.length; i++ ) {
				var assetnum = CONFIG.assets[ i ];
				var count = carlocations.counts[ assetnum ];
				if( count > maxcount ) maxcount = count;
			}

			for( var i = 0; i < CONFIG.assets.length; i++ ) {
				var assetnum = CONFIG.assets[ i ];
				var count = carlocations.counts[ assetnum ];
				var speed = carlocations.speeds[ assetnum ];
				var avgspeed = speed / count;

				// only work on counts > 0
				// make sure is number lmao
				if( count > 0 && ! isNaN( avgspeed ) ) {
					var lat = CONFIG.assetLocations[ assetnum ][ 0 ];
					var lng = CONFIG.assetLocations[ assetnum ][ 1 ];

					for( var j = count; j > 0; j-- ) {
						var tlat = lat;
						var tlng = lng;

						if( Math.random() > 0.5 ) {
							tlat += ( ( Math.random() - 0.5 ) * 0.0002 * avgspeed );
							tlng += ( ( Math.random() - 0.5 ) * 0.000002 * avgspeed );
						} else {
							tlat += ( ( Math.random() - 0.5 ) * 0.000002 * avgspeed );
							tlng += ( ( Math.random() - 0.5 ) * 0.0002 * avgspeed );
						}

						temparray.push( [ tlat, tlng, count / maxcount * 0.2 ] );
					}
				} else {
					console.warn( "average speed is NaN or count is 0" );
				}
			}

			carsLayer.setLatLngs( temparray );

			// trigger cars heat map loaded
			CONFIG.thingsToLoad[ 5 ] = true;
			checkAllLoaded();
		} else {
			console.log( "cars locations left: " + carlocations.processed );
		}
	}

	$scope.toggleCarState = function( carStatus ){
		if( ! carStatus ) {
			map.removeLayer( carsLayer );
		} else {
			map.addLayer( carsLayer );
		}
	}

	/**
	 * Helper Functions
	 */
	function checkAllLoaded() {
		for( var i = 0; i < CONFIG.thingsToLoad.length; i++ ) {
			if( ! CONFIG.thingsToLoad[ i ] ) {
				return false;
			}
		}

		$scope.isLoading = false;
		$( ".loading" ).text( "Showing data from the past " + $scope.hoursEndRange + " " + CONFIG.timeUnit + "s" );
		$( "input[type=range]" )[ 0 ].disabled = false;
	}
}]);