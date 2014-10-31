// Created by leiko on 29/10/14 16:03
var WebSocket = require('ws');

module.exports = function (server, ws) {
    var id = server.ws2id[ws.upgradeReq.headers['sec-websocket-key']];
    if (id) {
        delete server.ws2id[ws.upgradeReq.headers['sec-websocket-key']];
        delete server.id2ws[id];
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                action: 'unregistered',
                id: id
            }));
        }
        server.emit('unregistered', id);
    }
};