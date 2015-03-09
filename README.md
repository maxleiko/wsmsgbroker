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

## Client.send(msg, dest, callback)
**msg**: {Mixed} The thing you want to send (/!\ it HAS TO be serializable by JSON.stringify(...))  
**dest**: {String|Array} Your message receiver(s) (determined by the `id` used at the creation of the client)  
**callback**: [optional] {Function} if set, it will allow a receiver to answer (fastest wins)  

### Protocol
**clients -> server**  
Clients can initiate 4 **actions** with the servers:
 - register
 - unregister
 - send
 - answer

**server -> clients**  
Servers can answer with 4 **actions** to the clients:
 - answer
 - message
 - registered
 - unregistered

**WSMsgBroker** expects **JSON-encoded** strings to be send accross the network  
Below is the list of JSON-encoded **clients -> server** actions

`register` - register a client on the server
 - `"id"` a unique ID that identifies this client on the server

```json
{
    "action": "register",
    "id": <AN_ID>
}
```

`unregister` - unregister a client from a server
```json
{
    "action": "unregister"
}
```

`send` - send a message to one (or more clients)
 - `"dest"` must be a string or an array of strings

```json
{
    "action": "send",
    "dest": [ <AN_ID>, <ANOTHER_ID> ],
    "message": <A_MSG>
}
```

`answer` - send an answer to a received message
```json
{
    "action": "answer",
    "message": <A_MSG>
}
```

_____________________________

Below is the list of JSON-encoded **server -> clients** actions

`message` - this client received a message
```json
{
    "action": "message",
    "message": <A_MSG>,
    "from": <SENDER_ID>
}
```

`answer` - received when someone answered to a message
```json
{
    "action": "answer",
    "message": <A_MSG>,
    "from": <ANSWER_SENDER_ID>
}
```

`registered` - received when the server has successfully registered this client
```json
{
    "action": "registered",
    "id": <AN_ID>
}
```

`unregistered` - received when the server has successfully unregistered this client
```json
{
    "action": "unregistered",
    "id": <AN_ID>
}
```
