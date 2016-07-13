// Traffix App

var traffixApp = angular.module('traffixApp', []);

traffixApp.controller('MainController', ['$scope', '$rootScope', '$http',
function ($scope, $rootScope, $http) {

	$scope.icons = [
		{"Alert":["images/warningImage.png", "images/warningImageHover.png"]}, 
		{"Potential Hotspots": ["images/potentialHotspots.png", "images/potentialHotspotsHover.png"]},
		{"Settings": ["images/settings.png", "images/settingsHover.png"]}
	];



}]);