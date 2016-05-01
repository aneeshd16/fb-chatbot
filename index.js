var util = require('util');
var http = require('http');
var url = require('url');
var request = require('request');
var EventEmitter = require('events').EventEmitter;

var fbChatBot = function(path, port, verify_token, access_token, debug) {

    var self = this;

    this.sendTextMessage = sendTextMessage;
    this.subscibe = subscibe;

    //Clean path
    if (path.substr(-1) === '/') {
        path = path.substr(0, path.length - 1);
    }

    var emitMessageReceivedEvents = function (eventName, sender, recipient, data, timestamp, event) {

        var eventData = {
            sender: sender,
            recipient: recipient,
            data: data,
            timestamp: timestamp,
            eventObject: event
        };

        //Global event
        self.emit(eventName, eventData);
        //Sender event
        self.emit(sender + '->' + eventName, eventData);
        //Recipient event
        self.emit(eventName + '->' + recipient, eventData);
    }

    //HTTP Server for listening to webhook
    http.createServer(function(request, response) {
        var parsedUrl = url.parse(request.url, true);
        if (parsedUrl.pathname === path) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            if (request.method === "GET") {
                //Webhook verification
                if (parsedUrl.query['hub.verify_token'] === verify_token) {
                    response.end(parsedUrl.query['hub.challenge']);
                } else {
                    response.end('Error, wrong validation token');
                }

            } else if (request.method === "POST") {
                var body = '';
                request.on('data', function(data) {
                    body += data;
                });
                request.on('end', function() {
                    var postBody = JSON.parse(body);
                    for (var k = 0; k < postBody.entry.length; k++) {
                        var messaging_events = postBody.entry[k].messaging;
                        for (i = 0; i < messaging_events.length; i++) {
                            var event = messaging_events[i];
                            var sender = event.sender.id;
                            var recipient = event.recipient.id;
                            var timestamp = event.timestamp;
                            //Authentication
                            if(event.optin) {
                                emitMessageReceivedEvents('authenticated', sender, recipient, event.optin, timestamp, event);
                            }
                            //Receive Messages
                            if (event.message) {
                                emitMessageReceivedEvents('message', sender, recipient, event.message, timestamp, event);
                                if (event.message.text) {
                                    emitMessageReceivedEvents('text', sender, recipient, event.message.text, timestamp, event);
                                }
                                if (event.message.attachments) {
                                    for (var j = 0; j < event.message.attachments.length; j++) {
                                        emitMessageReceivedEvents('attachment', sender, recipient, event.message.attachments[j], timestamp, event);
                                    }
                                }
                            }
                            //Receive Postback
                            if(event.postback) {
                                emitMessageReceivedEvents('postback', sender, recipient, event.postback.payload, event);
                            }
                        }
                    }
                });
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end('post received');
            }
        }
    }).listen(port);

    // console.log('Server running at localhost:' + port);
    this.subscibe = function(callback) {
    	request({
    		url: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
    		qs: { access_token: access_token },
    		method: 'POST',
    	}, callback);
    }

    function sendMessage(senderId, messageData, callback) {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: access_token },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: messageData,
            }
        }, callback);
    }

    function sendTextMessage(sender, text, callback) {
        var messageData = {
            text: text
        };
        sendMessage(sender, messageData, callback);
    }

};

// extend the EventEmitter class using our fbChatBot class
util.inherits(fbChatBot, EventEmitter);

// we specify that this module is a refrence to the fbChatBot class
module.exports = fbChatBot;
