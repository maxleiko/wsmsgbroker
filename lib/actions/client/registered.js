'use strict';

/**
 * This 'registered' action acknowledge that the server has registered the user
 * @param client
 */
module.exports = function(client) {
  client.emit('registered');
};
