var util = require('util');
var Twit = require('twit');
var Sentiment = require('sentiment');
var ZokuAudio = require('../index.js');



var TwitterMood = function(mood, startingWatchList) {

  // terms to listen for in firehose
  var watchList = startingWatchList || ['love', 'hate'];

  var T = new Twit({
      consumer_key: process.env.TWITTER_CONSUMER_KEY
    , consumer_secret: process.env.TWITTER_CONSUMER_SECRET
    , access_token: process.env.TWITTER_ACCESS_TOKEN
    , access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  })

  var totalScore = 0;
  var eventCount = 0;
  var rawMood = mood;
  var stream = T.stream('statuses/filter', { track: watchList });

  stream.on('tweet', function (tweet) {

    // simple sentiment analysis using AFINN-111 wordlist
    var s = Sentiment(tweet.text);
    totalScore = totalScore + s.score;
    eventCount = eventCount + 1;

    // the mood is the average sentiment score
    rawMood = totalScore / eventCount;

    // Normalization mood by scaling between 0 and 1
    eMax = 5.0;
    eMin = -5.0;
    //mood = (rawMood - eMin) / (eMax - eMin);
    mood = (s.score - eMin) / (eMax - eMin);

    // share the love
    console.log(util.format("[%s] %s", mood, tweet.text));
  });

};

console.log('Experimenting with Twitter mood.');

var MOOD = 1.0;
var moodTerms = ['comet','singularity'];
var twitterMood = new TwitterMood(MOOD, moodTerms);

var Audio = new ZokuAudio.Audio();

// add a core audio callback
Audio.addAudioCallback(function(engine) {

  function saw (t,x) {
    // TODO - do SOMETHING interesting with this!!
    return 1-2*(t%(1/x))*x;
  }

  var sample = 0;
  var ampBuffer = new Float32Array(4000);

  engine.addAudioCallback(function(buffer) {
      var output = [];
      for (var i = 0; i < buffer.length; i++, sample++) {

          // Pan two sound-waves back and forth, opposing
          var val1 = Math.sin(sample * 110.0 * 2 * Math.PI / 44100.0) * 0.25, val2 = Math.sin(sample * 440.0 * 2 * Math.PI / 44100.0) * 0.25;
          var pan1 = Math.sin(1 * Math.PI * sample / 44100.0), pan2 = 1 - pan1;

          // TODO - do SOMETHING interesting with this!!
          var sawtooth = saw(MOOD,sample/1000);
          var sine = val1 * pan2 + val2 * pan1;

          output.push(sawtooth); //left channel
          output.push(sine); //right channel

          //Save microphone input into rolling buffer
          ampBuffer[sample%ampBuffer.length] = buffer[i];
      }
      return output;
  });

});
