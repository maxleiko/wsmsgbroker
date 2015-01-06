// Created by leiko on 05/11/14 18:15
var WSMsgBroker = require('../index');
var randomstring = require('randomstring');
var chalk = require('chalk');

var server = new WSMsgBroker.Server(9050);

var nbClients = process.argv[2] || 5;
var clients = [];
var expected = {};

for (var i=0; i < nbClients; i++) {
    clients.push(new WSMsgBroker('client'+i, 'localhost', 9050));
}

var count = 0;

function answerHandler(asker, msg) {
    return function (responseFrom, answer) {
        var test = expected[asker.id+'_'+msg];
        if (test.from === asker.id && test.send === answer && test.to === responseFrom) {
            count++;
            if (count >= nbClients) {
                console.log(chalk.green('Ok with')+' '+nbClients+' '+chalk.green('clients'));
                console.log(server.ack2ws, 'must be empty');
                console.log(server.ws2ack, 'must be empty');
                console.log(server.ack2timeout, 'must be empty');
                process.exit(1);
            }
        } else {
            console.log(chalk.red('NOK'), {
                asker: asker.id,
                message: test.send,
                response: answer,
                answerer: responseFrom
            });
            process.exit(1);
        }
    };
}

function getRandomClientId() {
    return 'client' + Math.floor(Math.random() * nbClients);
}

clients.forEach(function (client) {
    client.on('message', function (msg, response) {
        // echo it back
        response.send(msg);
    });
});

console.log('wait a bit for the clients to connect...');
setTimeout(function () {
    for (i in clients) {
        function send() {
            var randomMsg = randomstring.generate(2);
            var dest = getRandomClientId();
            if (dest != clients[i].id) {
                expected[clients[i].id+'_'+randomMsg] = {
                    from: clients[i].id,
                    send: randomMsg,
                    to: dest
                };
                clients[i].send(randomMsg, dest, answerHandler(clients[i], randomMsg));
            } else {
                send();
            }
        }
        send();
    }
}, 1000);