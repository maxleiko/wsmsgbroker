// Created by leiko on 13/10/14 16:04
var WebSocket = require('ws');

/**
 * This 'send' action processes received messages
 * @param server
 * @param ws
 * @param msg
 */
module.exports = function (server, ws, msg) {

    /**
     * Re-wraps incoming 'send' message into a 'message' message to the specified destination
     * @param id
     */
    function send(id) {
        if (msg.ack) { server._rememberAck(msg.ack, ws.upgradeReq.headers['sec-websocket-key']); }

        var destWs = server.id2ws[id];
        if (destWs && destWs.readyState === WebSocket.OPEN) {
            destWs.send(JSON.stringify({
                action: 'message',
                message: msg.message,
                ack: msg.ack,
                from: server.ws2id[ws.upgradeReq.headers['sec-websocket-key']]
            }));
        } else {
            // TODO maybe we should say something about the fact that we didn't send the message
        }
    }

    if (msg.dest && msg.message) {
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
    } else {
        server.emit('error', new Error('Unable to parse "send" message (msg.dest or msg.message are undefined)'));
    }
};