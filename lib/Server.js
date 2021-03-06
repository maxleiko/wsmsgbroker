'use strict';

var util        = require('util'),
    events      = require('events'),
    WebSocket   = require('ws'), // jshint ignore:line
    answer      = require('./actions/server/answer'),
    register    = require('./actions/server/register'),
    send        = require('./actions/server/send'),
    unregister  = require('./actions/server/unregister');

var actions = {
    answer: answer,
    register: register,
    send: send,
    unregister: unregister
};

/**
 *
 * @param port
 * @param path
 * @constructor
 */
function Server(port, path) {
    this.ttl = 1000*60*60; // 1 hour
    this.id2ws = {};
    this.ws2id = {};
    this.ack2ws = {};
    this.ws2ack = {};
    this.ack2timeout = {};

    path = path || '';
    if (path.substr(0, 1) !== '/') { path = '/' + path; }

    this.wss = new WebSocket.Server({ port: port, path: path });
    this.wss.on('connection', function (ws) {
        this._connectionHandler(ws);
        this.emit('connection');
    }.bind(this));
}

util.inherits(Server, events.EventEmitter);

Server.prototype.close = function () {
    try {
        this.wss.close();
    } catch (ignore) {
        /* no one cares */
    } finally {
        this.wss = null;
    }
};

/**
 *
 * @param ws
 * @private
 */
Server.prototype._connectionHandler = function (ws) {
    ws.on('message', function (msg) {
        this._messageHandler(ws, msg);
    }.bind(this));

    ws.on('close', function () {
        this._closeHandler(ws);
    }.bind(this));
};

/**
 *
 * @param ws
 * @param data
 * @private
 */
Server.prototype._messageHandler = function (ws, data) {
    var msg = data;
    if (typeof data === 'object') { msg = data.data; }

    try {
        msg = JSON.parse(msg);
        //console.log(chalk.bold.gray('server'));
        //console.log(JSON.stringify(msg, null, 2));
        if (actions[msg.action] instanceof Function) {
            try {
                actions[msg.action](this, ws, msg);
            } catch (err) {
                this.emit('error', err);
            }
        } else {
            this.emit('error', new Error('"action" module must be Functions (action "'+msg.action+'" is a '+typeof actions[msg.action]+')'));
        }
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            this.emit('error', new Error('unknown action "'+msg.action+'"'));
        } else if (err.type === 'unexpected_token') {
            this.emit('error', new Error('unable to parse message (only JSON-encoded messages are handled)'));
        } else {
            this.emit('error', err);
        }
    }
};

/**
 *
 * @param ws
 * @private
 */
Server.prototype._closeHandler = function (ws) {
    unregister(this, ws);
};

Server.prototype._rememberAck = function (ack, ws) {
    if (!this.ack2timeout[ack]) { this.ack2timeout[ack] = []; }

    this.ack2ws[ack] = ws;
    this.ws2ack[ws] = ack;

    this.ack2timeout[ack].push(setTimeout(function () {
        // Free ack after a TTL of 1 hour if client didn't answer
        delete this.ack2ws[ack];
        delete this.ws2ack[ws];
        if (this.ack2timeout[ack]) { this.ack2timeout[ack].forEach(clearTimeout); }
    }.bind(this), this.ttl));
};

Server.prototype._forgetAck = function (ack) {
    if (this.ack2timeout[ack]) { this.ack2timeout[ack].forEach(clearTimeout); }
    var wsId = this.ack2ws[ack];
    delete this.ws2ack[wsId];
    delete this.ack2ws[ack];
    delete this.ack2timeout[ack];
};

module.exports = Server;
