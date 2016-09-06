'use strict';

var CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = function () {
  var id = '';
  for( var i=0; i < 20; i++ ) {
    id += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return id;
};
