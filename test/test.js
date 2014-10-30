var WSBroker = require('../index');

var server = new WSBroker.Server(9050);
server.on('error', function (err) {
    throw err;
});
var client0 = new WSBroker('client0', 'localhost', 9050);
var client1 = new WSBroker('client1', 'localhost', 9050);

setTimeout(function () {
    client0.send([5, 3], 'client1', function (from, answer) {
        console.log('client0 got answer>', from, answer);
    });
    client0.send({foo: 'bar', baz: 'potato'}, 'client1');
    client1.on('message', function (msg, sender) {
        console.log('client1>', msg);
        if (sender) {
            sender.send('ok');
        }
    });
}, 1000);