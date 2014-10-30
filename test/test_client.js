// Created by leiko on 29/10/14 14:58
var expect = require('chai').expect;

var WSMsgBroker = require('../index');

describe('WSMsgBroker tests', function () {
    var server = new WSMsgBroker.Server(9050);
    var client0, client1;

    it('should create and register a new WSMsgBroker client "client0" on the server', function (done) {
        client0 = new WSMsgBroker('client0', 'localhost', 9050);
        client0.on('registered', function () {
            done();
        });
    });

    it('should create and register a new WSMsgBroker client "client1" on the server', function (done) {
        client1 = new WSMsgBroker('client1', 'localhost', 9050);
        client1.on('registered', function () {
            done();
        });
    });

    it('should send "foo" to "client1" and get a "bar" answer', function (done) {
        client1.on('message', function fooHandler(msg, sender) {
            sender.send('bar');
            client1.off('message', fooHandler);
        });

        client0.send([5, 3], 'client1', function (from, answer) {
            expect(from).to.equal('client1');
            expect(answer).to.equal('bar');
            done();
        });
    });

    it('should send "potato" to "client1" and "wrong" (but wrong is not registered yet so does nothing)', function (done) {
        client1.on('message', function (msg) {
            expect(msg).to.equal('potato');
            done();
        });

        client0.send('potato', ['client1', 'wrong']);
    });
});

