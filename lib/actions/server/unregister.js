// Created by leiko on 29/10/14 16:03
module.exports = function (server, ws) {
    var id = server.ws2id[ws];
    if (id) {
        delete server.ws2id[ws];
        delete server.id2ws[id];
        server.emit('unregistered', id);
    } else {
        server.emit('error', new Error('Unable to parse "unregister" message (msg.id is undefined)'));
    }
};