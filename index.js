var util = require('util');
var http = require('http');
var url = require('url');
var rp = require('request-promise');
var EventEmitter = require('events').EventEmitter;

var fbChatBot = function (path, port, verifyToken, accessToken) {

    var self = this;

    this.sendTextMessage = sendTextMessage;
    this.subscribe = subscribe;

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
    http.createServer(function (request, response) {
        var parsedUrl = url.parse(request.url, true);
        if (parsedUrl.pathname === path) {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            if (request.method === "GET") {
                //Webhook verification
                if (parsedUrl.query['hub.verify_token'] === verifyToken) {
                    response.end(parsedUrl.query['hub.challenge']);
                } else {
                    response.end('Error, wrong validation token');
                }

            } else if (request.method === "POST") {
                var body = '';
                request.on('data', function (data) {
                    body += data;
                });
                request.on('end', function () {
                    var postBody = JSON.parse(body);
                    postBody.entry.forEach(messagingEvents => {
                        messagingEvents.forEach(event => {
                            var sender = event.sender.id;
                            var recipient = event.recipient.id;
                            var timestamp = event.timestamp;
                            //Authentication
                            if (event.optin) {
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
                            if (event.postback) {
                                emitMessageReceivedEvents('postback', sender, recipient, event.postback.payload, event);
                            }
                        });
                    });

                });
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end('post received');
            }
        }
    }).listen(port);

    function subscribe() {
        return rp({
            url: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
            qs: { access_token: accessToken },
            method: 'POST',
        });
    }

    function sendMessage(senderId, messageData) {
        return rp({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: accessToken },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: messageData,
            }
        });
    }

    function sendTextMessage(sender, text) {
        var messageData = {
            text: text
        };
        return sendMessage(sender, messageData);
    }

};

// extend the EventEmitter class using our fbChatBot class
util.inherits(fbChatBot, EventEmitter);

// we specify that this module is a refrence to the fbChatBot class
module.exports = fbChatBot;
