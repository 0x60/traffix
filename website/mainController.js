// Traffix App
var traffixApp = angular.module('traffixApp', ['rzModule']);

traffixApp.controller('MainController', function ($scope, $rootScope, $http, $sce) {

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


	//Functions need for this app
	$scope.toTrustedHTML = function(html) {
        return $sce.trustAsHtml(html);
    };
});

$(document).ready(function() {

	setTimeout(hide_splash, 2000);

	function hide_splash(){
		$("#splash_screen").fadeOut(500);
		$("#content").fadeIn(500);
		$scope.$broadcast('rzSliderForceRender');
	}
});