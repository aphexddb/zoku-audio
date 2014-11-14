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

module.exports = internals.ZokuAudio = function (options) {

  Hoek.assert(this.constructor === internals.ZokuAudio, 'ZokuAudio must be instantiated using new');

  // Create a new audio engine
  var engine = internals.engine = CoreAudio.createNewAudioEngine();

  // set options
  engine.setOptions(options || internals.defaults.coreAudio);


};

internals.ZokuAudio.prototype.addAudioCallback = function (callback) {
  callback(internals.engine);
};
