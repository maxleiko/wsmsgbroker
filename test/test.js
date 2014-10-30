var WSBroker = require('../index');

var server = new WSBroker.Server(9050);
var client0 = new WSBroker('client0', 'localhost', 9050);
var client1 = new WSBroker('client1', 'localhost', 9050);

setTimeout(function () {
    client0.send([5, 3], 'client1');
    client0.send({foo: 'bar', baz: 'potato'}, 'client1');
    client1.on('message', function (msg) {
        console.log('client1>', msg);
    });
}, 1000);