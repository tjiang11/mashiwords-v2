var codenames = angular.module('codenames', ['ngRoute', 'angularModalService', 'ui-notification']);

codenames.config(['$locationProvider', '$routeProvider',
	function config($locationProvider, $routeProvider) {

	}
]);

codenames.controller('GameController', [
	'$scope', '$rootScope', 'ModalService', 'colorTrackerService',
	'customWordService', 'gridTrackerService', 'cardCountService',
	'Notification',
	function GameController(
		$scope, $rootScope, ModalService, colorTrackerService,
		customWordService, gridTrackerService, cardCountService,
		Notification) {
		var ctrl = this;
		ctrl.cardCountService = cardCountService.model;
		ctrl.baseUrl = window.location.origin;
		ctrl.timerRunning = false;
		ctrl.timeOut = false;
		customWordService.init();
		var DEFAULT_WORDS = [];
		ctrl.grid = [];
		ctrl.gameCode = 'undefined';
		ctrl.dataLoaded = false;
		jQuery.get("static/res/default_words", function(data) {
			var allWords = data.split("\n");
			DEFAULT_WORDS = angular.copy(allWords);
			pickWords(allWords);
		});

		var pickWords = function(allWords) {
			ctrl.cards = [];
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
		};

		jQuery.post("/create_game", function(response) {
			console.log("Creating game...");
			console.log(response.data);
			ctrl.gameCode = response.data.id;
			for (var i = 0; i < response.data.grid.length; i++) {
				ctrl.grid.push(response.data.grid[i]);
			}
			gridTrackerService.setGrid(ctrl.grid);
			console.log(ctrl.grid);
			ctrl.dataLoaded = true;
		});

		ctrl.colorSelected = '';

		ctrl.changeColor = function(color) {
			console.log("click");
			ctrl.colorSelected = color;
			colorTrackerService.changeColors(color);
		};

		ctrl.showCustomWordsModal = function() {
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
								ctrl.cards.push({
									word: customWords[randomIndex],
									index: numCards - 1
								});
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


		ctrl.startNewRound = function() {
			$.ajax({
				url: '/new_round/' + ctrl.gameCode,
				method: 'PUT',
				data: {},
				success: function(response) {
					cardCountService.reset();
					$rootScope.$broadcast('new-round');
					ctrl.grid = [];
					for (var i = 0; i < response.data.length; i++) {
						ctrl.grid.push(response.data[i]);
					}
					gridTrackerService.setGrid(ctrl.grid);
					$scope.$digest();
					pickWords(DEFAULT_WORDS);
					Notification('New round started. Please have the spymaster refresh.');
				}
			});
		}

		ctrl.changeSpymasterCard = function() {
			$.ajax({
				url: '/new_round/' + ctrl.gameCode,
				method: 'PUT',
				data: {},
				success: function(response) {
					cardCountService.reset();
					$rootScope.$broadcast('new-round');
					ctrl.grid = [];
					for (var i = 0; i < response.data.length; i++) {
						ctrl.grid.push(response.data[i]);
					}
					gridTrackerService.setGrid(ctrl.grid);
					$scope.$digest();
					Notification.success('Spymaster card changed. Please have the spymaster refresh.');
				}
			});
		}
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
	controller: function($scope, colorTrackerService, gridTrackerService,
		cardCountService) {
		var codenamesCard = this;
		this.color = '';
		this.reveal = function() {
			var color = gridTrackerService.getCurrentGrid()[this.index];
			if (this.color === '') {
				var agentNo = Math.random() < .5 ? '1' : '2';
				switch (color) {
					case "0": 
						this.color = 'RED' + agentNo; 
						cardCountService.model.mash += 1;
						break;
					case "1": 
						this.color = 'BLUE' + agentNo; 
						cardCountService.model.dora += 1;
						break;
					case "2": 
						this.color = 'CIV' + agentNo; 
						cardCountService.model.push += 1;
						break;
					case "3":
						this.color = 'ASSASSIN';
						cardCountService.model.assa += 1;
						break;
				}
			} else {
				this.color = '';
				switch(color) {
					case "0":
						cardCountService.model.mash -= 1;
						break;
					case "1":
						cardCountService.model.dora -= 1;
						break;
					case "2":
						cardCountService.model.push -= 1;
						break;
					case "3":
						cardCountService.model.assa -= 1;
						break;
				}
			}
		}

		$scope.$on('new-round', function(event, args) {
			codenamesCard.color = '';
			$scope.$digest();
		});
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

codenames.service('cardCountService', function() {
	var cardCountService = this;
	cardCountService.model = {
		mash: 0,
		dora: 0,
		push: 0,
		assa: 0
	};
	cardCountService.reset = function() {
		cardCountService.model.mash = 0;
		cardCountService.model.dora = 0;
		cardCountService.model.push = 0;
		cardCountService.model.assa = 0;
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