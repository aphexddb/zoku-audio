## Using this library

    var ZokuAudio = require('zoku-audio');

### TwitterMood

This maintains a realtime mood of Twitter based on search terms. The "Mood" is a float that ranges from `0.0` (sad) to `1.0` (happy) based on [sentiment](https://github.com/thisandagain/sentiment). It's intended to be used as input for other processes.

Example use

    // Mood value to be updated
    var sharedMoodObj = { MOOD: 0.5 };
    
    ZokuAudio.TwitterMood(sharedMoodObj, {
      track: ['#ferguson','protest','cop','thug','saint louis'],
      language: 'en'
    });

    // Now you can pass the MOOD around..
    console.log(sharedMoodObj.MOOD);

### AudioPort

This is a simple wrapper for [node-core-audio](https://github.com/ZECTBynmo/node-core-audio). Pass it callbacks with `addAudioCallback`. See below for example use.

**WARNING**: Do all I/O and meaningful operations outside this callback as it will execute on the AudioPort thread and lag out your audio!


    var AudioPort = new ZokuAudio.AudioPort();

    // add a core audio callback
    AudioPort.addAudioCallback(function(engine) {

      var sample = 0;

      engine.addAudioCallback(function(buffer) {
          var output = [];
          for (var i = 0; i < buffer.length; i++, sample++) {

              // Pan two sound-waves back and forth, opposing
              var val1 = Math.sin(sample * 110.0 * 2 * Math.PI / 44100.0) * 0.25, val2 = Math.sin(sample * 440.0 * 2 * Math.PI / 44100.0) * 0.25;
              var pan1 = Math.sin(1 * Math.PI * sample / 44100.0), pan2 = 1 - pan1;

              var sine = val1 * pan2 + val2 * pan1;

              output.push(sine); //left channel
              output.push(sine); //right channel
          }
          return output;
      });

    });
