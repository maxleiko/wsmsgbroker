var WSBroker = require('../index');

var server = new WSBroker.Server(9050);
server.on('error', function (err) {
    throw err;
});
var client0 = new WSBroker('client0', 'localhost', 9050);
var client1 = new WSBroker('client1', 'localhost', 9050);
var client2 = new WSBroker('client2', 'localhost', 9050);

setTimeout(function () {
    client0.send([5, 3], ['client1', 'client2'], function (from, answer) {
        console.log('client0 got answer>', from, answer);
    });
    client1.on('message', function (msg, sender) {
        console.log('client1>', msg);
        setTimeout(function () {
            sender.send('ok1');
        }, 0);
    });

    client2.on('message', function (msg, sender) {
        console.log('client2>', msg);
        setTimeout(function () {
            sender.send('ok2');
        }, 0);
    });
}, 1000);

setTimeout(function () {
    client0.on('unregistered', function (id) {
        console.log(id, 'unregistered');
        client0.close();
        client1.close();
        server.close();
    });
    client0.unregister();
}, 2000);