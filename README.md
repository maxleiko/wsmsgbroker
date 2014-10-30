WSMsgBroker
===========

WebSocket message broker using native WebSocket implementation and a lightweight full-JSON encoded protocol scheme

### Client API
```js
var WSMsgBroker = require('wsmsgbroker');

// assuming you have a WSMsgBroker.Server running at ws://localhost:9042/foo
var client0 = new WSMsgBroker('client0', 'localhost', 9042, 'foo');
var client1 = new WSMsgBroker('client1', 'localhost', 9042, 'foo');

client1.on('registered', function () {
  client1.on('message', function (msg, response) {
    console.log('client1 received > '+msg);
    response.send('Hi to you too, sir.');
  });

  client0.send('Hi there', 'client1', function (from, answer) {
    console.log('client0 received an answer from '+from+' > '+answer);
    
    // but you can also send messages without callback
    // resulting in "response" to be null for the receiver :)
    client0.send({complex: 'thing'}, 'client1');
  });
});
```
