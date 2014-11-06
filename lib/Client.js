// Created by leiko on 29/10/14 14:57
var events      = require('events'),
    util        = require('util'),
    uuid        = require('node-uuid'),
    chalk       = require('chalk'),
    WebSocket   = require('ws');

/**
 *
 * @param id WSMsgBroker id used to register this client on the server
 * @param host server host
 * @param port server port
 * @constructor
 */
function Client(id, host, port, path) {
    this.id = id;
    path = path || '';
    this.ack2callback = {};

    if (path.substr(0, 1) !== '/') { path = '/' + path; }
    this.conn = new WebSocket('ws://'+host+':'+port+path);

    this.conn.on('open', function () {
        this._openHandler();
        this.emit('open');
    }.bind(this));
    this.conn.on('message', function (msg) {
        this._messageHandler(msg);
    }.bind(this));
    this.conn.on('close', function (e) {
        this.emit('close', e);
    }.bind(this));
    this.conn.on('error', function (e) {
        this.emit('error', e);
    }.bind(this));
}

util.inherits(Client, events.EventEmitter);

Client.prototype._openHandler = function () {
    this.conn.send(JSON.stringify({
        action: 'register',
        id: this.id
    }));
};

/**
 *
 * @param data
 * @private
 */
Client.prototype._messageHandler = function (data) {
    var msg = data;
    if (typeof data === 'object') { msg = data.data; }

    try {
        msg = JSON.parse(msg);
//        console.log(chalk.bold.blue(this.id));
//        console.log(JSON.stringify(msg, null, 2));
        var action = require('./actions/client/'+msg.action);
        if (action instanceof Function) {
            try {
                action(this, this.conn, msg);
            } catch (err) {
                console.log(err.message);
            }
        } else {
            console.log('"action" module must be Functions (action "'+msg.action+'" is a '+typeof action+')');
        }
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.log('unknown action "'+msg.action+'"');
        } else {
            console.log('unable to parse message (only JSON-encoded messages are handled)');
        }
    }
};

/**
 *
 * @param data
 * @param {String|Array} dest
 * @param {Function} [callback]
 */
Client.prototype.send = function (data, dest, callback) {
    var msg = {
        action: 'send',
        message: data,
        dest: dest
    };

    if (callback) {
        if (callback instanceof Function) {
            msg.ack = uuid();
            this.ack2callback[msg.ack] = callback;
        } else {
            throw new Error('Client.send(data, callback) expects "callback" to be a Function');
        }
    }

    this.conn.send(JSON.stringify(msg));
};

Client.prototype.unregister = function () {
    this.conn.send(JSON.stringify({
        action: 'unregister',
        id: this.id
    }));
};

Client.prototype.close = function () {
    if (this.conn) {
        this.conn.close();
    }
};

Client.prototype.off = function (eventName, eventHandler) {
    this.removeListener(eventName, eventHandler);
};

module.exports = Client;