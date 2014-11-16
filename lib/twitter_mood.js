// Load modules

var Twit = require('twit');
var Hoek = require('hoek');
var Sentiment = require('sentiment');
var Colors = require('colors');

// Declare internals

var internals = {
  defaults: {

    // What to filter in the stream
    streamOptions: {
      track: ['love', 'hate'],
      language: 'en'
    },

  },

  listLen: 10, // keep avg of last 10 scores to even it out
  moodScoreList: [0.0],
  maxSentiment: 9.0, // max sentiment
  minSentiment: -9.0, // min sentiment
  displayLen: 50
};

module.exports = internals.TwitterMood = function (sharedMoodObj, _streamOptions) {

  var logMood = function(m, msg) {

    // fancy colors
    var mTxt = '';
    if (m >= 0.8) {
      mTxt = Colors.green(m);
    } else if (m < 0.8 && m >= 0.6) {
      mTxt = Colors.gray(m);
    } else if (m < 0.6 && m >= 0.4) {
      mTxt = Colors.white(m);
    } else if (m < 0.4 && m >= 0.2) {
      mTxt = Colors.magenta(m);
    } else if (m < 0.2) {
      mTxt = Colors.red(m);
    } else {
      console.log('unknown score:',m);
      mTxt = Colors.blue('?');
    }

    var substr = msg.substring(0, internals.displayLen).replace(/\r|\n/, " ");
    console.log('Twitter MOOD: %s - %s%s',mTxt,substr,'...');

  };

  // Require Twitter tokens/keys set as environment variables
  Hoek.assert(process.env.TWITTER_CONSUMER_KEY !== undefined, 'TWITTER_CONSUMER_KEY must be set');
  Hoek.assert(process.env.TWITTER_CONSUMER_SECRET !== undefined, 'TWITTER_CONSUMER_SECRET must be set');
  Hoek.assert(process.env.TWITTER_ACCESS_TOKEN !== undefined, 'TWITTER_ACCESS_TOKEN must be set');
  Hoek.assert(process.env.TWITTER_ACCESS_TOKEN_SECRET !== undefined, 'TWITTER_ACCESS_TOKEN_SECRET must be set');

  // filtering options
  var streamOptions = _streamOptions || internals.defaults.streamOptions;

  var T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY
    , consumer_secret: process.env.TWITTER_CONSUMER_SECRET
    , access_token: process.env.TWITTER_ACCESS_TOKEN
    , access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  })

  var stream = T.stream('statuses/filter', streamOptions);

  console.log('Twitter MOOD: watching for tweets related to:',streamOptions.track);

  // on each Tweet, update our mood based on sentiment
  stream.on('tweet', function (tweet) {

    // simple sentiment analysis using AFINN-111 wordlist
    var s = Sentiment(tweet.text);

    internals.moodScoreList.push(s.score);

    // the mood is the average sentiment score
    var totalScore = internals.moodScoreList.reduce(function(prevVal, currVal, index, array) {
      return prevVal + currVal;
    });
    var scoreAvg = totalScore / internals.moodScoreList.length;

    // level off our averaging array
    if (internals.moodScoreList.length > internals.listLen) {
      internals.moodScoreList.pop();
    }

    // Normalization mood by scaling between 0 and 1
    sharedMoodObj.MOOD = (scoreAvg - internals.minSentiment) / (internals.maxSentiment - internals.minSentiment);

    // output
    logMood(sharedMoodObj.MOOD, tweet.text);

  });


};
