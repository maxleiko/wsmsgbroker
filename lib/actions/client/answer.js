'use strict';

/**
 * This 'answer' action processes received messages
 * @param client
 * @param serverConn
 * @param msg
 */
module.exports = function (client, serverConn, msg) {
    var callback = client.ack2callback[msg.ack];
    if (callback instanceof Function) {
        if (typeof msg.from === 'undefined' || typeof msg.message === 'undefined') {
            client.emit('error', new Error('Unable to parse "answer" message (msg.from or msg.message are undefined)'));
        } else {
            callback(msg.from, msg.message);
        }
    } else {
        client.emit('error', new Error('Unable to find callback method for '+client.id+' and ack = '+msg.ack));
    }
};
