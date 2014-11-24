'use strict';

/**
 * @ngdoc function
 * @name twitterMoodApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the twitterMoodApp
 */
angular.module('twitterMoodApp')

.factory('TweetService', ['$rootScope', '$timeout',
function ($rootScope, $timeout) {

  var socketUrl = 'ws://localhost:8081/ws/tweets';
  var ws = null;
  var callbackTweet = null;
  var callbackOnline = null;
  var online = false;

  // We return this object to anything injecting our service
  var Service = {};

  // Seconds to rety connection
  var reconnectInterval = 5 * 1000;

  // websocket info
  var readyStates = {
    0: 'websocket connection is not yet open',
    1: 'websocket connection is open and ready to communicate',
    2: 'websocket connection is in the process of closing',
    3: 'websocket connection is closed or couldn\'t be opened'
  };

  var reconnect = function() {
    connect();
  };

  var connect = function() {
    // Create our websocket object with the address to the websocket
    ws = new WebSocket(socketUrl);

    ws.onopen = function(){
      var readyState = event.currentTarget.readyState;
      console.log('Tweets -',readyStates[readyState]);
      callbackOnline(true);
      online = true;
    };

    ws.onclose = function() {
      console.log('Twitter Mood: websocket connection closed, will attempt to reconnect in',reconnectInterval/1000,'seconds');
      $timeout(reconnect, reconnectInterval);
      callbackOnline(false);
      online = false;
    };

    ws.onmessage = function(message) {
      callbackTweet(JSON.parse(message.data));
    };

    /*
    ws.onerror = function(event) {
      var readyState = event.currentTarget.readyState;
      console.log('Tweets -',readyStates[readyState]);
    };
    */

  };

  Service.setOnlineCallback = function(callback) {
    callbackOnline = callback;
  };

  Service.setCallback = function(callback) {
    callbackTweet = callback;
    connect();
  };

  Service.send = function(request) {
    if (online) {
      ws.send(JSON.stringify(request));
    } else {
      console.log('Twitter Mood: unable to change terms, offline');
    }
  };

  return Service;

}])

.controller('TweetsCtrl', ['$scope', 'TweetService',
function ($scope, TweetService) {

  $scope.terms = 'edm,drop,noise,bass';
  $scope.smooth = true;
  $scope.score = 0.5;
  $scope.tweets = [];
  $scope.online = false;
  var tweetCount = 10;
  var hues = [];
  var tweetColorHue = 0; // default hue

  // create an array from range begin to end
  var createRange = function(begin, end) {
    if (typeof end === undefined) {
      end = begin; begin = 0;
    }
    var result = [], modifier = end > begin ? 1 : -1;
    for ( var i = 0; i <= Math.abs(end - begin); i++ ) {
      result.push(begin + i * modifier);
    }
    return result;
  };

  // list of hue colors to tweet
  hues = createRange(0,360);

  // find a random hue
  var changetweetColorHue = function() {
    //return '#'+Math.floor(Math.random()*16777215).toString(16);
    tweetColorHue = hues[Math.floor(Math.random()*hues.length)];
  };
  changetweetColorHue();

  var opposingColor = function(hue) {
    var opposing = hue + 180;
    if (opposing > 360) {
      opposing = opposing - 360;
    }
    return opposing;
  };

  // Tweet service

  TweetService.setOnlineCallback(function(online) {
    $scope.$apply(function () {
      $scope.online = online;
    });
  });

  TweetService.setCallback(function(tweetObj) {
    $scope.$apply(function () {
      // set colors
      tweetObj.primaryColor = tweetColorHue;
      tweetObj.secondaryColor = opposingColor(tweetColorHue);

      // if we get a tweet, we are online
      $scope.online = true;

      // get geolocation if available
      var latLong = null;
      if (tweetObj.geo !== null) {
        latLong = {
          latitude: tweetObj.geo.coordinates[0],
          longitude: tweetObj.geo.coordinates[1]
        };
      }

      // load tweets for page
      $scope.tweets.push(tweetObj);
      if ($scope.tweets.length > tweetCount) {
        $scope.tweets.shift();
      }

      // generate a score for the page
      if ($scope.smooth) {
        $scope.score = parseFloat(tweetObj.avgScore).toFixed(3);
      } else {
        $scope.score = parseFloat(tweetObj.rawScore).toFixed(3);
      }

    });
  });

  var parseTerms = function(terms) {
    var termArr = [];
    if (terms !== undefined) {
      terms.split(',').forEach(function(element) {
        termArr.push(element.trim());
      });
    }
    return termArr;
  };

  $scope.changeTerms = function() {
    changetweetColorHue();
    var terms = parseTerms($scope.terms);
    TweetService.send({terms:terms});
  };

}]);
