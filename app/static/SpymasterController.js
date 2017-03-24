var spymaster = angular.module('spymaster', ['ngRoute']);

spymaster.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
	$routeProvider.
		when("/spymaster/:game_id", {
			templateUrl: 'spymaster_body.html',
			controller: 'SpymasterController'
		});
		$locationProvider.html5Mode(true);
}]);

spymaster.controller('SpymasterController', ['$scope', '$routeParams',
	function SpymasterController($scope, $routeParams) {
		var POSITIONS = [
			{x: 255, y: 460}, {x: 348, y: 460}, {x: 442, y: 460}, {x: 535, y: 460}, {x: 630, y: 460},
			{x: 255, y: 553}, {x: 348, y: 553}, {x: 442, y: 553}, {x: 535, y: 553}, {x: 630, y: 553},
			{x: 255, y: 646}, {x: 348, y: 646}, {x: 442, y: 646}, {x: 535, y: 646}, {x: 630, y: 646},
			{x: 255, y: 741}, {x: 348, y: 741}, {x: 442, y: 741}, {x: 535, y: 741}, {x: 630, y: 741},
			{x: 255, y: 835}, {x: 348, y: 835}, {x: 442, y: 835}, {x: 535, y: 835}, {x: 630, y: 835}
		];

		jQuery.get("/game_data/" + $routeParams.game_id, function(response) {
			placeColors(response.data.split("").reverse().join(""));
		});

		var ctx = document.getElementById('spymasterCard').getContext('2d');
		var placeColors = function(grid) {
			var imgRed = new Image();
			var imgBlue = new Image();
			var imgAssassin = new Image();
			imgRed.onload = function() {
				for (var i = 0; i < grid.length; i++) {
					var position = POSITIONS[i];
					if (grid[i] === "0") {
						ctx.drawImage(imgRed, position.x, position.y, 94, 90);
					}
				}
			};
			imgBlue.onload = function() {
				for (var i = 0; i < grid.length; i++) {
					var position = POSITIONS[i];
					if (grid[i] === "1") {
						ctx.drawImage(imgBlue, position.x, position.y, 94, 90);
					}
				}
			};
			imgAssassin.onload = function() {
				for (var i = 0; i < grid.length; i++) {
					var position = POSITIONS[i];
					if (grid[i] === '3') {
						ctx.drawImage(imgAssassin, position.x, position.y, 94, 90);
					}
				}
			};
			imgRed.src = "static/images/red_square.png";
			imgBlue.src = "static/images/blue_square.png";
			imgAssassin.src = "static/images/assassin_square.png";
		}
	}
]);