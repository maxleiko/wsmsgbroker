// Created by leiko on 13/10/14 16:04

/**
 * This 'answer' action processes received answers
 * @param server
 * @param ws
 * @param msg
 */
module.exports = function (server, ws, msg) {
    if (msg.ack && typeof msg.message !== 'undefined') {
        if (server.ack2ws[msg.ack]) {
            // no answer have been given yet
            var clientId = server.ws2id[server.ack2ws[msg.ack]];
            var askerWs = server.id2ws[clientId];
            if (askerWs) {
                askerWs.send(JSON.stringify({
                    action: 'answer',
                    ack: msg.ack,
                    message: msg.message,
                    from: server.ws2id[ws.broker_uuid]
                }));
            }
            server._forgetAck(msg.ack);
        }
    } else {
        server.emit('error', new Error('Unable to parse "answer" message (msg.ack or msg.message are undefined)'));
    }
};