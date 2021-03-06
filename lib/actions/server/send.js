'use strict';

var WebSocket = require('ws'); // jshint ignore:line

/**
 * This 'send' action processes received messages
 * @param server
 * @param ws
 * @param msg
 */
module.exports = function (server, ws, msg) {
    var err = null;

    /**
     * Re-wraps incoming 'send' message into a 'message' message to the specified destination
     * @param id
     */
    function send(id) {
        if (msg.ack) { server._rememberAck(msg.ack, ws.broker_uuid); }

        var destWs = server.id2ws[id];
        if (destWs) {
            if (destWs.readyState === WebSocket.OPEN) {
                destWs.send(JSON.stringify({
                    action: 'message',
                    message: msg.message,
                    ack: msg.ack,
                    from: server.ws2id[ws.broker_uuid]
                }));
            } else {
                err = new Error('Unable to send message. Client "'+id+'" disconnected');
                server.emit('error', err);
            }
        } else {
            server.emit('warn', new Error('Unable to send message. Client "'+id+'" unknown'));
        }
    }

    if (typeof msg.dest === 'undefined' || typeof msg.message === 'undefined') {
        server.emit('error', new Error('Unable to parse "send" message (msg.dest or msg.message are undefined)'));
    } else {
        if (typeof msg.dest === 'object' && msg.dest instanceof Array) {
            // msg.dest is an array of IDs
            msg.dest.forEach(function (id) {
                send(id);
            });

        } else if (Object.prototype.toString.call(msg.dest) === '[object String]') {
            // msg.dest is a String
            send(msg.dest);

        } else {
            server.emit('error', new Error('Unable to parse "send" message (msg.dest must be an array of string IDs or a string)'));
        }
    }
};
