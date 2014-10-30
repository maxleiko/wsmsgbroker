// Created by leiko on 13/10/14 16:04

/**
 * This 'answer' action processes received messages
 * @param server
 * @param ws
 * @param msg
 */
module.exports = function (server, ws, msg) {
    if (msg.ack && typeof msg.message !== 'undefined') {
        var destWs = server.ack2ws[msg.ack];
        destWs.send(JSON.stringify({
            action: 'answer',
            ack: msg.ack,
            message: msg.message,
            from: server.ws2id[ws]
        }));
        server._forgetAck(msg.ack);
    } else {
        server.emit('error', new Error('Unable to parse "answer" message (msg.ack or msg.message are undefined)'));
    }
};