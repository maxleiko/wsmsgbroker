// Created by leiko on 29/10/14 16:03
module.exports = function (server, ws) {
    var id = server.ws2id[ws.upgradeReq.headers['sec-websocket-key']];
    if (id) {
        delete server.ws2id[ws.upgradeReq.headers['sec-websocket-key']];
        delete server.id2ws[id];
        server.emit('unregistered', id);
    }
};