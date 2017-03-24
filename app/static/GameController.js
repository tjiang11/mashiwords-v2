var codenames = angular.module('codenames', ['ngRoute', 'angularModalService']);

codenames.config(['$locationProvider', '$routeProvider',
	function config($locationProvider, $routeProvider) {

	}
]);

codenames.controller('GameController', ['$scope', 'ModalService', 'colorTrackerService', 'customWordService', 'gridTrackerService',
	function GameController($scope, ModalService, colorTrackerService, customWordService, gridTrackerService) {
		var ctrl = this;
		ctrl.timerRunning = false;
		ctrl.timeOut = false;
		customWordService.init();
		var DEFAULT_WORDS = [];
		ctrl.grid = [];
		jQuery.get("static/res/default_words", function(data) {
			ctrl.cards = [];
			var allWords = data.split("\n");
			DEFAULT_WORDS = angular.copy(allWords);
			var numCards = 25;
			var wordsDict = {};
			while (numCards > 0) {
				var randomIndex = Math.floor(Math.random() * allWords.length);
				if (!(randomIndex in wordsDict) && allWords[randomIndex].length > 0) {
					wordsDict[randomIndex] = true;
					ctrl.cards.push({
						word: allWords[randomIndex],
						index: numCards - 1});
					numCards--;
				}
			}
			$scope.$apply();
		});

		jQuery.post("/create_game", function(response) {
			console.log("Creating game...");
			console.log(response.data);
			for (var i = 0; i < response.data.grid.length; i++) {
				ctrl.grid.push(response.data.grid[i]);
			}
			gridTrackerService.setGrid(ctrl.grid);
			console.log(ctrl.grid);
		});

		ctrl.colorSelected = '';

		ctrl.changeColor = function(color) {
			console.log("click");
			ctrl.colorSelected = color;
			colorTrackerService.changeColors(color);
		};

		ctrl.openSpymasterCard = function() {
			open('spymaster.html');
		};

		ctrl.showComplex = function() {
			ModalService.showModal({
				templateUrl: "custom-words-modal.html",
				controller: "ComplexController",
				inputs: {
					title: "Custom Words"
		      	}
		    }).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					customWordService.extractWords(function(customWords) {
						ctrl.cards = [];
						var numCards = 25;
						var wordsDict = {};
						while (numCards > 0) {
							var randomIndex = Math.floor(Math.random() * customWords.length);
							if (!(randomIndex in wordsDict) && customWords[randomIndex].length > 0) {
								wordsDict[randomIndex] = true;
								ctrl.cards.push(customWords[randomIndex])
								numCards--;
							}
						}
						$scope.$apply();
					});
				});
			});
		};

		ctrl.showInfo = function() {
			ModalService.showModal({
				templateUrl: "info-modal.html",
				controller: "InfoController",
				inputs: {
					title: "How to Play"
				}
			}).then(function(modal) {
				modal.element.modal();
			});
		};

		var timerInterval;
		ctrl.startTimer = function() {
			ctrl.timeOut = false;
			ctrl.timerRunning = true;
			clearInterval(timerInterval);
			console.log("start timer");
			var elem = document.getElementById('timerJuice');
			elem.style.width = 0;
			var width = 1;
			timerInterval = setInterval(function() {
				width++;
				elem.style.width = width + '%';
				if (width === 100) {
					clearInterval(timerInterval);
					ctrl.timerRunning = false;
					ctrl.timeOut = true;
				}
			}, 1200);
		};

		ctrl.stopTimer = function() {
			ctrl.timeOut = false;
			ctrl.timerRunning = false;
			console.log("stop timer");
			var elem = document.getElementById('timerJuice');
			var width = 0;
			elem.style.width = 0;
			clearInterval(timerInterval);
		};
	}
]);

codenames.controller('ComplexController', [
	'$scope', '$element', 'title', 'close', 'customWordService',
	function($scope, $element, title, close, customWordService) {
		$scope.name = null;
		$scope.age = null;
		$scope.title = title;
		$scope.customWordService = customWordService;
	  
		$scope.close = function() {
	 		close({
	    	name: $scope.name,
	    	age: $scope.age
	    	}, 500);
		};

	  	$scope.cancel = function() {
	    	$element.modal('hide');
	  	};
	}
]);

codenames.controller('InfoController', [function() {}
]);

codenames.component('codenamesCard', {
    templateUrl: 'codenames_card.html',
	controller: function($scope, colorTrackerService, gridTrackerService) {
		this.color = '';
		this.colorAgent = '';
		this.colored = true;
		// this.changeColor = function() {
		// 	console.log(this.index);
		// 	console.log(gridTrackerService.getCurrentGrid());
		// 	if (this.color === colorTrackerService.getCurrentColor()) {
		// 		this.color = '';
		// 		this.colorAgent = '';
		// 	} else {
		// 		this.color = colorTrackerService.getCurrentColor();
		// 		if (this.color === 'RED' || this.color === 'BLUE' || this.color === 'CIV') {
		// 			this.colorAgent = Math.random() < .5 ? this.color + '1' : this.color + '2';
		// 		} else {
		// 			this.colorAgent = '';
		// 		}
		// 	}
		// };
		this.reveal = function() {
			var color = gridTrackerService.getCurrentGrid()[this.index];
			switch (color) {
				case "0": this.colorAgent = 'RED1'; break;
				case "1": this.colorAgent = 'BLUE2'; break;
				case "2": this.colorAgent = 'CIV1'; break;
				case "3": this.color = 'ASSASSIN'; break;
			}
		}
	},
	controllerAs: 'ctrl',
	bindings: {
		content: '=',
		index: '='
	}
});

codenames.factory('colorTrackerService', function() {
	this.currentColor = '';
	return {
		changeColors: function(newColor) {
			this.currentColor = newColor;
		},
		getCurrentColor: function() {
			return this.currentColor;
		}
	};
});

codenames.factory('gridTrackerService', function() {
	this.currentGrid = '';
	return {
		setGrid: function(newGrid) {
			this.currentGrid = newGrid;
		},
		getCurrentGrid: function() {
			return this.currentGrid;
		}
	}
});

codenames.factory('customWordService', function() {
	return {
		init: function() {
			this.customWords = [];
		},
		loadCustomWordFile: function(file) {
			this.customWordFile = file;
		},
		getCustomWordFileName: function() {
			return this.customWordFile.name;
		},
		getCustomWords: function() {
			return this.customWords;
		},
		extractWords: function(callback) {
			var reader = new FileReader();
			console.log("extracting");
			reader.onload = function(loadEvent) {
				var data = loadEvent.target.result;
				var newWords = data.split("\n");
				for (var i = 0; i < newWords.length; i++) {
					if (newWords[i] === '') {
						newWords.splice(i, 1);
						i--;
					}
				}
				this.customWords = newWords;
				console.log(this.customWords);
				callback(this.customWords);
			};
			reader.readAsText(this.customWordFile);
		},
		extractWordsFromFile: function(data) {
			var newWords = data.split("\n");
			for (var i = 0; i < newWords.length; i++) {
				if (newWords[i] === '') {
					newWords.splice(i, 1);
					i--;
				}
			}
			this.customWords = newWords;
		}
	}
});

codenames.directive("fileread", ['customWordService', function (customWordService) {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                customWordService.loadCustomWordFile(changeEvent.target.files[0]);
            });
        }
    }
}]);