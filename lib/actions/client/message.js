// Created by leiko on 13/10/14 16:37

/**
 * This 'message' action processes received messages
 * @param client
 * @param serverConn
 * @param msg
 */
module.exports = function(client, serverConn, msg) {

  if (msg.ack) {
    client.emit('message', msg.message, {
      send: function(response) {
        serverConn.send(JSON.stringify({
          action: 'answer',
          ack: msg.ack,
          message: response,
          from: client.id
        }));
      }
    });

  } else {
    client.emit('message', msg.message);
  }
};
