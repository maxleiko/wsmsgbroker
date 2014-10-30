// Created by leiko on 29/10/14 14:57
var util        = require('util'),
    events      = require('events'),
    WebSocket   = require('ws'),
    unregister  = require('./actions/server/unregister');

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
        var action = require('./actions/server/'+msg.action);
        if (action instanceof Function) {
            try {
                action(this, ws, msg);
            } catch (err) {
                this.emit('error', err);
            }
        } else {
            this.emit('error', new Error('"action" module must be Functions (action "'+msg.action+'" is a '+typeof action+')'));
            //this.log.error(this.toString(), '"'+this.getName()+'" malformed action "'+msg.action+'"');
        }
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            this.emit('error', new Error('unknown action "'+msg.action+'"'));
            //this.log.warn(this.toString(), '"'+this.getName()+'" unknown action "'+msg.action+'"');
        } else {
            console.log(err.stack);
            this.emit('error', 'unable to parse message (only JSON-encoded messages are handled)');
            //this.log.error(this.toString(), '"'+this.getName()+'" unable to parse message (only support JSON-encoded messages)');
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
    this.ack2ws[ack] = ws;
    this.ws2ack[ws] = ack;

    this.ack2timeout[ack] = setTimeout(function () {
        // Free ack after a TTL of 1 hour if client didn't answer
        delete this.ack2ws[ack];
        delete this.ws2ack[ws];
        delete this.ack2timeout[ack];
    }.bind(this), this.ttl);
};

Server.prototype._forgetAck = function (ack) {
    clearTimeout(this.ack2timeout[ack]);
    var ws = this.ack2ws[ack];
    delete this.ws2ack[ws];
    delete this.ack2ws[ack];
    delete this.ack2timeout[ack];
};

module.exports = Server;