var util = require('util');
var Oscillator = require('oscillators');
var ZokuAudio = require('../index.js');

console.log('Experimenting with Twitter mood.');

var sharedMoodObj = { MOOD: 0.5 };
ZokuAudio.TwitterMood(sharedMoodObj, {
  track: ['#ferguson','protest','cop','thug','saint louis'],
  language: 'en'
});

// Convert the mood from 0.0-1.0 range to -1.0,1.0 range so oscillators play nice
var normalizeMood = function(m) {
  var moodMin = 0.0;
  var moodMax = 1.0;
  var sinMin = -1.0;
  var sinMax = 1.0;
  return (((m - moodMin) * (sinMax - sinMin)) / (moodMax - moodMin)) + sinMin;
};

var AudioPort = new ZokuAudio.AudioPort();
var ampBuffer = new Float32Array(4000); // microphone buffer

// add a core audio callback
AudioPort.addAudioCallback(function(engine) {

  var sample = 0;

  engine.addAudioCallback(function(buffer) {
      var output = [];
      var mood = normalizeMood(sharedMoodObj.MOOD)

      for (var i = 0; i < buffer.length; i++, sample++) {

          // Pan two sound-waves back and forth, opposing
          var val1 = Math.sin(sample * 110.0 * 2 * Math.PI / 44100.0) * 0.25, val2 = Math.sin(sample * 440.0 * 2 * Math.PI / 44100.0) * 0.25;
          var pan1 = Math.sin(1 * Math.PI * sample / 44100.0), pan2 = 1 - pan1;
          var smooth_sine = val1 * pan2 + val2 * pan1;

          // make some simple frequencies based on the sample value
          var saw = Oscillator.saw(mood, sample);
          var square = Oscillator.square(mood, sample);
          var triangle = Oscillator.triangle(mood, sample);
          var sine = Oscillator.sine(mood, sample);

          // create output buffer
          output.push(triangle); //left channel
          output.push(smooth_sine); //right channel

          // TODO - actually use this - save microphone input into rolling buffer
          ampBuffer[sample%ampBuffer.length] = buffer[i];

      }
      return output;
  });

});
