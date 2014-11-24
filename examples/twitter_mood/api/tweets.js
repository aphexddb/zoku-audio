'use strict';

// Load modules

var config = require('../config');
var Util = require('util');
var Twit = require('twit');
var Hoek = require('hoek');
var Sentiment = require('sentiment');
var Ws = require('ws').Server;

// Declare internals

var internals = {
  streamOptions: {
    track: ['edm','drop','noise','bass'], // What to filter in the stream
    language: 'en'
  },
  T: null,
  stream: null,
  tweetBroadcastCallback: null,
  scores: [],
  scoreCnt: 10,
  sharedMood: {}
};

// Api code

// convert sentiment to 0-1 range
var convertRange = function(input) {
  var inputLow = -9.0;
  var inputHigh = 9.0;
  var outputLow = -1.0;
  var outputHigh = 1.0;
  return ((input - inputLow) / (inputHigh - inputLow)) * (outputHigh - outputLow) + outputLow;
}

var initTwitter = function() {

  // Require Twitter tokens/keys set as environment variables
  try {
    Hoek.assert(config.twitter.TWITTER_CONSUMER_KEY !== undefined, 'TWITTER_CONSUMER_KEY must be configured or set as ENV variable');
    Hoek.assert(config.twitter.TWITTER_CONSUMER_SECRET !== undefined, 'TWITTER_CONSUMER_SECRET must be configured or set as ENV variable');
    Hoek.assert(config.twitter.TWITTER_ACCESS_TOKEN !== undefined, 'TWITTER_ACCESS_TOKEN must be configured or set as ENV variable');
    Hoek.assert(config.twitter.TWITTER_ACCESS_TOKEN_SECRET !== undefined, 'TWITTER_ACCESS_TOKEN_SECRET must be configured or set as ENV variable');
  }
  catch(e) {
    internals.server.log(['tweets_api','error'],e);
    process.exit();
  }

  // Twitter client
  internals.T = new Twit({
    consumer_key: config.twitter.TWITTER_CONSUMER_KEY
    , consumer_secret: config.twitter.TWITTER_CONSUMER_SECRET
    , access_token: config.twitter.TWITTER_ACCESS_TOKEN
    , access_token_secret: config.twitter.TWITTER_ACCESS_TOKEN_SECRET
  });

  // Open stream with filters
  internals.stream = internals.T.stream('statuses/filter', internals.streamOptions);

  // on each Tweet, update our mood based on sentiment
  internals.stream.on('tweet', handleTweetEvent);

};

// convert sentiment to 0-1 range
var convertRange = function(input) {
  var inputLow = -9.0;
  var inputHigh = 9.0;
  var outputLow = -1.0;
  var outputHigh = 1.0;
  return ((input - inputLow) / (inputHigh - inputLow)) * (outputHigh - outputLow) + outputLow;
}

// action to take when tweet form stream is recieved
var handleTweetEvent = function (tweet) {
  // create tweet object
  var tweetObj = {
    text: tweet.text,
    user: tweet.user.screen_name,
    geo: tweet.geo,
    coordinates: tweet.coordinates,
    filter: internals.streamOptions.track
  };

  // calculate raw score based on senitment
  tweetObj.sentiment = Sentiment(tweet.text).score;
  tweetObj.rawScore = convertRange(tweetObj.sentiment);

  // calculate average score from last # of "scoreCnt" scores
  internals.scores.push(tweetObj.rawScore);
  if (internals.scores.length > internals.scoreCnt) {
    internals.scores.shift();
  }
  var totalScore = internals.scores.reduce(function(prevVal, currVal, index, array) {
    return prevVal + currVal;
  });
  tweetObj.avgScore = convertRange(totalScore / internals.scores.length);

  // update the shared mood object
  internals.sharedMood.rawScore = tweetObj.rawScore;
  internals.sharedMood.avgScore = tweetObj.avgScore;

  // if callback exists, call it!
  if (internals.tweetBroadcastCallback !== null) {
    internals.tweetBroadcastCallback(tweetObj);
  }
};

// restart the Twitter stream with new terms
var changeFilterTerms = function(terms) {
  internals.streamOptions.track = terms;
  internals.server.log(['tweets_api'], 'Restarting Twitter stream to use new terms');
  internals.stream.stop();
  internals.stream.start();
};

// start websocket server
var start = function(server) {
  internals.server = server;
  var clientId = 0;
  var wss = new Ws({port: config.ws.port}, function() {

    // setup websocket broadcast function
    wss.broadcast = function broadcast(data) {
      for(var i in this.clients) {
        this.clients[i].send(data);
      }
    };

    // setup our boradcast callback function
    internals.tweetBroadcastCallback = function(tweetObj) {
      wss.broadcast(JSON.stringify(tweetObj));
    };

    // open connection to twitter
    initTwitter();
    internals.server.log(['tweets_api'], 'websocket server started at: http://'+wss._server.address().address+':'+wss._server.address().port);
  });


  // init websocket on each client connection
  wss.on('connection', function(ws) {
    var thisId = ++clientId;
    internals.server.log(['tweets_api'], Util.format('websocket client #%d connected', thisId));

    ws.on('message', function(message) {
      internals.server.log(['tweets_api'], Util.format('websocket client #%d sent: %s', thisId, message));
      var msg = JSON.parse(message);

      // change serach terms
      if (msg.terms !== undefined) {
        internals.server.log(['tweets_api'], Util.format('websocket client #%d requested to use search terms: %s', thisId, JSON.stringify(msg.terms)));
        changeFilterTerms(msg.terms);
      }
    });

    ws.on('close', function() {
      internals.server.log(['tweets_api'], Util.format('websocket client #%d disconnected', thisId));
    });

    ws.on('error', function(e) {
      internals.server.log(['tweets_api'], Util.format('websocket client #%d error: %s', thisId, e.message));
    });

  });

  return internals.sharedMood;

};

module.exports.start = start;
