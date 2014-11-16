// Load modules

var Os = require('os');
var Hoek = require('hoek');
var CoreAudio = require("node-core-audio");

// Declare internals

var internals = {
  defaults: {

    // CoreAudio options
    coreAudio: {

      // Works on a OSX Laptop
      inputChannels: 1,
      outputChannels: 2,
      interleaved: true
    }
  }
};

module.exports = internals.AudioPort = function (options) {

  Hoek.assert(this.constructor === internals.AudioPort, 'AudioPort must be instantiated using new');

  // Create a new audio engine
  var engine = internals.engine = CoreAudio.createNewAudioEngine();

  // set options
  engine.setOptions(options || internals.defaults.coreAudio);


};

internals.AudioPort.prototype.addAudioCallback = function (callback) {
  callback( internals.engine );
};

internals.AudioPort.prototype.writeBuffer = function (buffer) {
  internals.engine.write( buffer );
};
