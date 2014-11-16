var ZokuAudio = require('../index.js');

console.log('Experimenting with waves mood.');

var Audio = new ZokuAudio.Audio();
var Wave = ZokuAudio.Wave;



//Audio.writeBuffer(inputBuffer);

var sqBuffer = Wave.square(0.5);

Audio.addAudioCallback(function(engine) {

  function processAudio( inputBuffer ) {
    console.log('Channels: ',inputBuffer.length);
    console.log('Channel 0 has',inputBuffer[0].length,'samples');
    console.log('Channel 1 has',inputBuffer[1].length,'samples');

    inputBuffer = sqBuffer
    for (var i=0; i<1024; ++i) {
      inputBuffer[0][i] = sqBuffer[i];
    }
    return inputBuffer;
  }

  engine.addAudioCallback( processAudio );

});
