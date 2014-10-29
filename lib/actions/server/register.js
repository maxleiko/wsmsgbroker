// Created by leiko on 13/10/14 16:04
module.exports = function (server, ws, msg) {
    if (msg.id) {
        server.id2ws[msg.id] = ws;
        server.ws2id[ws] = msg.id;
        ws.send(JSON.stringify({
            action: 'registered',
            id: msg.id
        }));
    } else {
        throw new Error('Unable to parse "register" message (msg.id is undefined)');
    }
};