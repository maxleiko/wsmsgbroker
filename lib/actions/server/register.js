'use strict';

var shortid = require('../../shortid');

module.exports = function (server, ws, msg) {
    if (msg.id) {
        server.id2ws[msg.id] = ws;
        ws.broker_uuid = shortid();
        server.ws2id[ws.broker_uuid] = msg.id;
        ws.send(JSON.stringify({
            action: 'registered',
            id: msg.id
        }));
        server.emit('registered', msg.id);
    } else {
        server.emit('error', new Error('Unable to parse "register" message (msg.id is undefined)'));
    }
};
