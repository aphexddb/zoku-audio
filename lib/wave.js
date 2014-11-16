
// code ideas from: http://stackoverflow.com/questions/203890/creating-sine-or-square-wave-in-c-sharp
module.exports.square = function (value, sampleRate, frequency) {

  // default sample rate and frequency
  var _sampleRate = sampleRate || 8000;
  var _frequency = frequency || 1000;

  // Make array starting at 0, go to i length
  var makeRange = function(i) {
    return i ? makeRange(i-1).concat(i-1):[]
  }

  var buffer = makeRange(_sampleRate);
  var amplitude = 0.25 * Number.MAX_VALUE;
  for (var n = 0; n < buffer.length; n++)
  {
    buffer[n] = amplitude * Math.sin((2 * Math.PI * n * _frequency) / _sampleRate);
  }

  return buffer;

};
