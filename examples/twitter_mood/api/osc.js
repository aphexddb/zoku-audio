'use strict';

// Load modules

var osc = require('osc-min');
var dgram = require('dgram');
var config = require('../config');

// Declare internals

var internals = {
  port: config.osc.port
};

internals.sendMood = function(sharedMood) {
  var buf = osc.toBuffer({
    timetag: 12345,
    elements: [
    {
      address: "/mood/raw",
      args: parseFloat(sharedMood.rawScore)
    }, {
      address: "/mood/avg",
      args: parseFloat(sharedMood.avgScore)
    }, {
      address: "/tweet",
      args: [
        String(sharedMood.user),
        String(sharedMood.text)
      ]
    }
    ]
  });

  internals.udp.send(buf, 0, buf.length, internals.port, "localhost");
};

// Api code

var start = function(server) {

  internals.server = server;

  internals.udp = dgram.createSocket('udp4');

  internals.server.log(['osc'], 'mood emitter sending OSC data to http://localhost:'+internals.port);

  return internals.sendMood;

};

module.exports.start = start;
