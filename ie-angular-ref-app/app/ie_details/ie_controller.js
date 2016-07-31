app.controller('IEServiceCtrl', ['$scope','CurrentServices',function($scope, CurrentServices) {
    initMap();
    plotAccidents();
    plotCameras();

    // predix stuff
    var startingAsset = 1000000018;
    var numAssets = 12;
    $scope.assetNumbers = [];
    $scope.trafficData = [];
    $scope.pedestrianData = [];
    $scope.arrayOfCoord = [{"latitude": 34.59667, "longitude": -86.96556}];
    $scope.arrayOfAddress = [];

    for(var i = 0; i < numAssets; i++){
      $scope.assetNumbers.push(startingAsset + i);
    }

    // Whenever this controller is loaded, it will give a call to below method.
    fetchUAA();

    fetchPitney();

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
        var startTime = moment(endTime).subtract(1, 'week').valueOf();

        $scope.getTrafficData(startTime, endTime, startingAsset);
        $scope.getPedestrianData(startTime, endTime, '1000000027');

        // change the size for parking and public safety calls.
        size = 200;
        $scope.getPublicSafetyData(startTime, endTime, startingAsset);

      });
    };

    /**
    * Below method will make a call to traffic event Service and
    * populates the response data in scope object.
    */
    $scope.getTrafficData = function(startTime, endTime, assetNumber) {

      CurrentServices.getTrafficData($scope.uaaToken, startTime, endTime, assetNumber).then(function(data){
        if(data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
          for(var i = 0; i < data._embedded.events.length; i++) {
            var event = data._embedded.events[i];
            var objectData = {};
            if(event && event.measures) {
              for(var idx = 0; idx < event.measures.length; idx++) {
                var measure = event.measures[idx];
                if(measure.tag === 'direction') {
                  objectData.direction = $scope._getDirectionByDegree(measure.value);
                } else if (measure.tag === 'speed') {
                  objectData.speed = measure.value + ' MPH';
                } else if (measure.tag === 'vehicleCount') {
                  objectData.count = measure.value;
                }
              }
            }
            objectData.location_uid = event[ "location-uid" ];
            objectData.vehicle = event["properties.vehicle-type"];

            objectData.date = new Date(event["timestamp"]);

            $scope.trafficData.push(objectData);
          }
        }

        if(data._links["next-page"]) {
          var url = data._links["next-page"]["href"];
          var newStartTime = url.substring(url.indexOf("start-ts=") + 9, url.indexOf("&end-ts"));
          if(newStartTime !== 0){
            var newEndTime = url.substring(url.indexOf("end-ts=") + 7, url.indexOf("&size"));
            $scope.getTrafficData(newStartTime, newEndTime, assetNumber);
          }
        }
        else{
          return;
        }
          

      });

    };

    /**
    * Below method will make a call to pedestrian event Service and
    * populates the response data in scope object.
    */
    $scope.getPedestrianData = function(startTime, endTime, assetNumber) {

      CurrentServices.getPedestrianData($scope.uaaToken, startTime, endTime, assetNumber).then(function(data){
        if(data && data._embedded && data._embedded.events && data._embedded.events.length > 0) {
          for(var i = 0; i < data._embedded.events.length; i++) {
            var event = data._embedded.events[i];
            var objectData = {};
            objectData.time = moment(event.timestamp).format('MMM Do YYYY, h:mm:ss a');
            objectData['location'] = event['location-uid'];
            if(event && event.measures && event.measures.length > 0) {
              var measure = event.measures[0];

              if(measure.tag && measure.tag === 'SFCNT') {
                objectData.count = measure.value;
              }
            }

            $scope.pedestrianData.push(objectData);
          }

          if(data._links["next-page"]) {
            var url = data._links["next-page"]["href"];
            var newStartTime = url.substring(url.indexOf("start-ts=") + 9, url.indexOf("&end-ts"));
            if(newStartTime !== 0){
              var newEndTime = url.substring(url.indexOf("end-ts=") + 7, url.indexOf("&size"));
              $scope.getPedestrianData(newStartTime, newEndTime, assetNumber);
            }
          }
        }
      });

    };

    /**
    * Below method will make a call to public safety event Service and
    * populates the response data in scope object.
    */
    $scope.getPublicSafetyData = function(startTime, endTime, assetNumber) {
      var publicSafetyData = {};
      CurrentServices.getPublicSafetyData($scope.uaaToken, startTime, endTime, assetNumber).then(function(data){
        console.log(data);
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

    function fetchPitney(arrayCoord) {
      CurrentServices.getPitneyBowesToken().then(function(data){
        $scope.pitneyToken = data['access_token'];
        console.log($scope.pitneyToken);
      }).then(function(){
        for(var i = 0; i < arrayCoord.length; i++){
          var location = arrayCoord[i];
          arrayOfAddress.push($scope.getAddress(location.latitude, location.longitude));
        }
      });
    };

    $scope.getAddress = function(latitude, longitude){
      CurrentServices.getPitneyAddress($scope.pitneyToken, latitude, longitude).then(function(data){
        var address = data.location[0].address;
        console.log(address);
        return {'mainAddress': address.mainAddressLine, 'cityStateZip': address.addressLastLine};
      });
    };
}]);
