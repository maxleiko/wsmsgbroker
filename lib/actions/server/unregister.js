'use strict';

var WebSocket = require('ws'); // jshint ignore:line

module.exports = function (server, ws) {
    var id = server.ws2id[ws.broker_uuid];
    if (id) {
        delete server.ws2id[ws.broker_uuid];
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
