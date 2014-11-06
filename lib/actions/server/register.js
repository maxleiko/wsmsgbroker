// Created by leiko on 13/10/14 16:04
var uuid = require('node-uuid');

module.exports = function (server, ws, msg) {
    if (msg.id) {
        server.id2ws[msg.id] = ws;
        ws.broker_uuid = uuid();
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