'use strict';

var Util = require('util');
var server = require('./server');
var Config = require('./config');
var Tweets = require('./api/tweets');
var Osc = require('./api/osc');
var Oscillator = require('oscillators');
var ZokuAudio = require('../../lib/index.js');

server.start(function () {

  // start upstream websocket server
  var sharedMood = Tweets.start(server);

  // start OSC TCP emitter
  var oscMoodCallback = Osc.start(server);

  // attach the tweet callback
  Tweets.setCallback(oscMoodCallback);

/*
  // create audio connection
  var AudioPort = new ZokuAudio.AudioPort();

  // add a core audio callback
  AudioPort.addAudioCallback(function(engine) {

    var sample = 0;
    var sampleFrequency = 44100.0; // 44.1 kHz sample rate
    var toneHz = 440.0;

    engine.addAudioCallback(function(buffer) {
      var output = [];

      // set time values based on mood (-1.0 to 1.0)
      var defaultTime = 0.0;
      var avgMoodTime = defaultTime;
      var rawMoodTime = defaultTime;
      if (sharedMood.avgScore !== undefined) {
        avgMoodTime = sharedMood.avgScore;
      }
      if (sharedMood.rawScore !== undefined) {
        rawMoodTime = sharedMood.rawScore;
      }

      for (var i = 0; i < buffer.length; i++, sample++) {

        // make some simple frequencies based on the sample value
        var sine = Oscillator.sine(avgMoodTime, sample);
        var sine2 = Oscillator.sine(rawMoodTime, sample);

        // manually create sine wave tone using raw mood
        var sine3 = Math.sin(sample * toneHz * 2 * Math.PI / sampleFrequency * rawMoodTime);

        // create output buffer
        output.push(sine); //left channel
        output.push(sine3); //right channel

      }
      return output;
    });

    server.log(['zoku-audio'], 'Added audio callback to generate tones from mood');

  });
  */

  server.log(['zoku-audio'], Util.format('web server started at:', server.info.uri));
});
