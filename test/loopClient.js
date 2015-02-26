// Created by leiko on 26/02/2015 10:55
var WSMsgBroker = require('../index');
var randomstring = require('randomstring');
var chalk = require('chalk');

var client0 = new WSMsgBroker(process.argv[2], 'localhost', 9050);

var count = 0;
var MAX_COUNT = 150;

function sendMsg(client) {
    client0.send(randomstring.generate(5)+'_'+(count++), client, function (from, msg) {
        console.log('Response from '+chalk.blue(from)+' with '+chalk.gray(msg));
    });
}

client0.on('message', function (msg, response) {
    console.log(chalk.green(process.argv[2])+' << '+msg);
    if (count >= MAX_COUNT) {
        process.exit();
    }
    response.send('ok');
    sendMsg(process.argv[3]);
});

setTimeout(function () {
    sendMsg(process.argv[3]);
}, 1000);