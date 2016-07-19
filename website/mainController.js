// Traffix App
var traffixApp = angular.module('traffixApp', ['rzModule']);

traffixApp.controller('MainController', function ($scope, $rootScope, $http) {

	$scope.icons = [
		{"Alert":["images/warningImage.png", "images/warningImageHover.png"]}, 
		{"Potential Hotspots": ["images/potentialHotspots.png", "images/potentialHotspotsHover.png"]},
		{"Settings": ["images/settings.png", "images/settingsHover.png"]}
	];

	$scope.slider = {
	    value: 10,
	    options: {
	        showSelectionBar: true
	    }
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