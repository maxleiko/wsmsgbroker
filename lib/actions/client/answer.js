// Created by leiko on 13/10/14 16:04

/**
 * This 'answer' action processes received messages
 * @param client
 * @param serverConn
 * @param msg
 */
module.exports = function (client, serverConn, msg) {
    client.ack2callback[msg.ack](msg.from, msg.message);
};