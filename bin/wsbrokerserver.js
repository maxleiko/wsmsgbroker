#!/usr/bin/env node
var WSMsgBroker = require('../index');

var argv = process.argv.slice(2);
var server = new WSMsgBroker.Server(argv[0], argv[1]);
console.log('WSMsgBroker server listening on '+server.wss.options.host+':'+server.wss.options.port+server.wss.options.path);
server.on('registered', function (id) { console.log(' + '+id); });
server.on('unregistered', function (id) { console.log(' - '+id); });