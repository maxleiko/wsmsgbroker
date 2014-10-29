// Created by leiko on 13/10/14 16:04

/**
 * This 'registered' action acknowledge that the server has registered the user
 * @param client
 */
module.exports = function (client) {
    client.emit('registered');
};