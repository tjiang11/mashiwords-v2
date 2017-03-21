var spymaster = angular.module('spymaster', []);

spymaster.controller('SpymasterController', ['$scope',
	function SpymasterController($scope) {
		var POSITIONS = [
			{x: 255, y: 460}, {x: 348, y: 460}, {x: 442, y: 460}, {x: 535, y: 460}, {x: 630, y: 460},
			{x: 255, y: 553}, {x: 348, y: 553}, {x: 442, y: 553}, {x: 535, y: 553}, {x: 630, y: 553},
			{x: 255, y: 646}, {x: 348, y: 646}, {x: 442, y: 646}, {x: 535, y: 646}, {x: 630, y: 646},
			{x: 255, y: 741}, {x: 348, y: 741}, {x: 442, y: 741}, {x: 535, y: 741}, {x: 630, y: 741},
			{x: 255, y: 835}, {x: 348, y: 835}, {x: 442, y: 835}, {x: 535, y: 835}, {x: 630, y: 835}
		];

		var placeColors = function() {
			var numRed = 9;
			var numBlue = 8;
			var numAssassin = 1;
			var placed = {};
			while (numRed > 0) {
				var randomIndex = Math.floor(Math.random() * 25);
				if (!(randomIndex in placed)) {
					placed[randomIndex] = 'red';
					numRed--;
				}
			}
			while (numBlue > 0) {
				var randomIndex = Math.floor(Math.random() * 25);
				if (!(randomIndex in placed)) {
					placed[randomIndex] = 'blue';
					numBlue--;
				}
			}
			while (numAssassin > 0) {
				var randomIndex = Math.floor(Math.random() * 25);
				if (!(randomIndex in placed)) {
					placed[randomIndex] = 'assassin';
					numAssassin--;
				}
			}

			var returnColors = [];
			for (var placement in placed) {
				returnColors[placement] = placed[placement];
			}
			return returnColors;
		};
		var colors = placeColors();

		var ctx = document.getElementById('spymasterCard').getContext('2d');

		var imgRed = new Image();
		var imgBlue = new Image();
		var imgAssassin = new Image();
		imgRed.onload = function() {
			for (var i = 0; i < colors.length; i++) {
				var position = POSITIONS[i];
				if (colors[i] === 'red') {
					ctx.drawImage(imgRed, position.x, position.y, 94, 90);
				}
			}
		};
		imgBlue.onload = function() {
			for (var i = 0; i < colors.length; i++) {
				var position = POSITIONS[i];
				if (colors[i] === 'blue') {
					ctx.drawImage(imgBlue, position.x, position.y, 94, 90);
				}
			}
		};
		imgAssassin.onload = function() {
			for (var i = 0; i < colors.length; i++) {
				var position = POSITIONS[i];
				if (colors[i] === 'assassin') {
					ctx.drawImage(imgAssassin, position.x, position.y, 94, 90);
				}
			}
		};
		imgRed.src = "static/images/red_square.png";
		imgBlue.src = "static/images/blue_square.png";
		imgAssassin.src = "static/images/assassin_square.png";


	}
]);