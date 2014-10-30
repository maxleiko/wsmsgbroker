// Created by leiko on 13/10/14 16:04

/**
 * This 'answer' action processes received messages
 * @param client
 * @param serverConn
 * @param msg
 */
module.exports = function (client, serverConn, msg) {
    var callback = client.ack2callback[msg.ack];
    if (callback instanceof Function) {
        if (msg.from && msg.message) {
            callback(msg.from, msg.message);
        } else {
            client.emit('error', new Error('Unable to parse "answer" message (msg.from or msg.message are undefined)'));
        }
    } else {
        client.emit('error', new Error('Unable to find callback method for '+client.id+' and ack = '+msg.ack));
    }
};