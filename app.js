var MatchGame = angular.module("MatchGame", ['ngAnimate']);;

MatchGame.controller('MainCtrl', ['$scope','matchService', '$timeout','$window', function ($scope, matchService, $timeout, $window) {

	
	

	$scope.resetGame = function() {
	
		$window.location.reload();
		/*	matchService.setCount(0);
			matchService.setKey();	
			$scope.$broadcast("init"); 
			//shuffleArray($scope.cards);*/
		//	$scope.cards = [];
	}


	$scope.$watch('countService.getCount()', function() {
			if (matchService.getCount() >= 2) {
				console.log("RESETING...");
				
				$timeout(function() {
					
					var key = matchService.getKey();
					$scope.$broadcast("solved", key);
					
					matchService.setKey();	
					matchService.setCount(0);
					$scope.$broadcast("reset"); 
				
					if (matchService.getMatch() < ( $scope.cards.length /2)) {
						matchService.nextTurn();
						$scope.attempts = matchService.getTurn();
					}
					else {
							
							
							var timeout =500;
							angular.forEach($scope.cards, function(card) {


								$timeout(function() { $scope.$broadcast("remove", card.key); },timeout);
								timeout=timeout+100;
								

						
							})
							
										
					$(".score").html("nice").hide().fadeIn(1000, function() {
							$('.score').fadeOut(2000, function() {

								$scope.resetGame();	
							});
							
						})//animate({fontSize: "500px"}, 300)
						

					}
				},600)

			}
	});

	var shuffleArray = function(array) {
	    var m = array.length, t, i;
	  	
	    // While there remain elements to shuffle
	    while (m) {
	      // Pick a remaining element…
	      i = Math.floor(Math.random() * m--);
	  
	      // And swap it with the current element.
	      t = array[m];
	      array[m] = array[i];
	      array[i] = t;
	    }
		return array;
	};

$scope.countService =matchService;
	$scope.attempts = matchService.getTurn();
	$scope.reset=false;
	matchService.setCount(0);

	$scope.cards = [
			{text: "\u00D7", key: '1', image: 'assets/nodejs.png'},
			{text: "\u00D7", key: '2', image: 'assets/angular.png'},
			{text: "\u00D7", key: '3', image: 'assets/jquery.png'},
			{text: "\u00D7", key: '4', image: 'assets/emberjs.png'},
			{text: "\u00D7", key: '5', image: 'assets/js.png'},
			{text: "\u00D7", key: '6', image: 'assets/backbonejs.png'},
			{text: "\u00D7", key: '7', image: 'assets/css3.png'},
			{text: "\u00D7", key: '8', image: 'assets/html5.png'}
	];
			
	var tempCards = $scope.cards;

	angular.forEach(tempCards, function(card) {
		$scope.cards.push({text:card.text, key:card.key, image:card.image});
	})

	shuffleArray($scope.cards);
}]);


// Match Service:  Use to communicate between cards. Keeps track of current turn, correct matches count and which card is currently flipped.
MatchGame.factory('matchService', [function () {
	var count=0;
	var selectedKey;
	var turns = 1;
	var matches =0;


	// setCount: sets the current card being fliped. 1st guess or 2nd guess
	var setCount = function(val) {
		count = val;
	}

	// getCount: returns the amount of cards that have been fliped this turn, 1 or 2.
	var getCount = function() {
		return count;
	}

	// setKey: sets the currently card that has been flipped - used to determine matches. 
	var setKey = function(key) {
		selectedKey = key;
	};

	// getKey: gets the current card that has been flipped.
	var getKey = function() {
		return selectedKey;
	};

	// getMatch: returns the number of matches found
	var getMatch = function() {
		return matches;
	};

	// anotherMatch: called when a match is found.
	var anotherMatch = function() {
		matches++;
	};

	// getTurn: returns total amount of turns so far
	var getTurn = function() {
		return turns;
	};

	// nextTurn: called after each turn, use to increase the turn counter
	var nextTurn = function() {
		turns++;
	};

	
	return {
		setCount:setCount,
		getCount:getCount,
		setKey : setKey,
		getKey : getKey,
		getMatch : getMatch,
		anotherMatch : anotherMatch,
		getTurn : getTurn,
		nextTurn : nextTurn

	};
}])


/*
		$scope.$on("init", function(e) {
			$scope.showCard = false;
			$scope.solved = false;
			console.log("INIT "+$scope.q.showCard);
			//	$scope.showCard=false;
		})
*/

MatchGame.directive('cards', ['matchService', function (matchService) {
	var controller = function($scope)  {
		$scope.showCard = false;
		$scope.solved = false;
		$scope.solvedBorder = false;
		$scope.remove = false;
		 


		// checkIn: called when a card is clicked. If 2 guesses haven't already been made, showCard becomes true and the card is flipped.
		$scope.checkIn =function() {
				 if (Number(matchService.getCount())<2) {
				 	$scope.showCard=true;
				 }	
		};
		
		// triggered by checkIn when showCard changes from false -> true
		$scope.$watch('showCard', function() {
			if ($scope.showCard) {
					if (matchService.getKey()) {									// if the user has already made a guess				
						 if ($scope.q.key === matchService.getKey()) {					// if the guess matches the previous guess
						 		console.log("WIN");
						 		matchService.anotherMatch()									// the user has created a match
						 }
						 else {															// if the guess doesn't match the previous guess
						 		console.log("YOU LOSE");
						 		matchService.setKey();										// clear the current key - elsewhere the current turn will be reset
						 }
					}
					else {
						matchService.setKey($scope.q.key);							// if the user hasn't made a guess, record currently guessed card
					}
					console.log("fliped - " +$scope.q.key);
					var count = matchService.getCount();
					count++;
					matchService.setCount(count);									// increase count - aka the number of cards currently flipped
			}
		});

		// when 'solved' is boardcasted, check provided key against current scope key. 
		$scope.$on("solved", function(e, key) {
				if (key === $scope.q.key) {					// if the key is a match card is already solved
					$scope.solved = true;					// since card is solved, set solved so card doesn'tt reset when 'reset' is triggered
					$scope.solvedBorder = "solved";			// sets card border color to show its solved
				}
    	});

		// when 'reset' is boardcasted, reset controller varaibles 
		$scope.$on("reset", function(e) {
			if($scope.solved === false) {			// as long as scoped card isn't solved yet
				console.log("Cards RESET.");
				$scope.showCard=false;
				$scope.solvedBorder=false;


			}
    	});


		$scope.$on("remove", function(e, key) {
				if (key === $scope.q.key) {
					 $scope.remove=true;
				}
    	});    	


	};
	return {
		restrict: 'E',
		scope:true,
		controller: controller,	
		link: function(scope,element,attrs) {
			
			element.on('mouseenter',function() {
				
				//console.log(this);  	//element
				//console.log($(this));	//jQuery object of element
				//console.log(element);	//jQuery object of element
				element.find('.front').css("background-color","#6666FF").css("color","white");		
			});

			element.on('mouseleave',function() {
				element.find('.front').css("background-color","white").css("color", "#6666FF");
			});

			attrs.$observe('solved', function(newValue, oldValue) {   //scope.$watch('solvedBorder', function(newValue) {
				if (newValue === "solved") {
					element.find('.back').addClass('solved');
				}
			});

			scope.$watch('remove', function(newValue) {
				if (newValue) {
					element.find('.back').slideUp();
					element.find('.front').slideUp();
				}
			
			});

		}
	};
}]);


MatchGame.directive('andydrew', [function () {
	return {
		restrict: 'E',
		
		template: "<ul style='list-style-type: none'></ul>",
		link: function (scope, element, attrs) {
		


			$("<li><a></a></li>")
			    .find("a")
			        .attr("href", "https://github.com/andrewdamelio")
			        .html("andydrew")
			     .end()
			    .appendTo("ul");

/*			element.find('li').last().on('mouseenter', function() {
					console.log("COOOL!");
			})	
			*/
		}
	};
}])



MatchGame.animation('.card-animation', function() {
	TweenLite.set('.cardWrapper',{perspective:800});
	TweenLite.set('.card', {transformStyle: 'preserve-3d'});
	TweenLite.set('.back', {rotationY: '-180'});
	TweenLite.set(['.back', '.front'], { backfaceVisibility: 'hidden'});
	return {
		beforeAddClass: function(element, className, done) {
			if (className == 'answer') {
				TweenLite.to(element.find('.card'), .5,
	 			 {rotationY:180, ease:Back.easeOut, onComplete: done});
			}
			else {
				done();
			}
		},

		beforeRemoveClass: function(element, className, done) {
			if (className == 'answer') {
				TweenLite.to(element.find('.card'), .5,
	 			 {rotationY:0, ease:Back.easeOut, onComplete: done});
			}
			else {
				done();
			}
		}
	}

});



