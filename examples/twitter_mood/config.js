var os = require('os');
var pkg = require('./package');
var GoodConsole = require('good-console');

// get config from environment
var env = process.env.NODE_ENV || process.env.ENV || 'development';
var port = process.env.PORT || 8080;
var wsPort = 8081;

module.exports = {
  'app': {
    'path': './html/dist'
  },
  'api': {
    'base': '/api',
    'port': port
  },
  'ws': {
    'port': wsPort
  },
  'twitter': {
    'TWITTER_CONSUMER_KEY': process.env.TWITTER_CONSUMER_KEY,
    'TWITTER_CONSUMER_SECRET': process.env.TWITTER_CONSUMER_SECRET,
    'TWITTER_ACCESS_TOKEN': process.env.TWITTER_ACCESS_TOKEN,
    'TWITTER_ACCESS_TOKEN_SECRET': process.env.TWITTER_ACCESS_TOKEN_SECRET
  },
  'package': pkg,
  'env': env,
  'port': port,
  'good': {
    opsInterval: 1000,
    reporters: [{
      reporter: GoodConsole,
      args:[{ log: '*', request: '*' }]
    }]
  }
};
