# fb-chatbot
NPM module that helps you build a chatbot.

### Getting Started
1. Follow step 1 from the [Messenger Quickstart](https://developers.facebook.com/docs/messenger-platform/quickstart).
2. Create a black NodeJS app. Add the following code. (Make sure you enter a sane `verify_token`)
  ```
  var fbChatBot = require('fb-chatbot');
  
  var bot = new fbChatBot('/webhook/', 3000, '<random verify_token>', '', true);
  
  bot.subscribe(function(error, response, body) {
  	console.log(error);
  	console.log(body);
  });
  
  bot.on('message', function(message) {
  	console.log(message);
  });
  ```
3. Deploy on a HTTPS server. [ngrok](https://ngrok.com/) works great for testing, but you can deploy it pretty much anywhere.
4. [Setup your webhook](https://developers.facebook.com/docs/messenger-platform/quickstart#setup_webhook) in your fb developer console on the "Messenger" tab. While setting up, enter the correct url and the `verify_token` from your code. When you click on "Verify and Save", it should give a success indicator. If not, check that your server is running, and is deployed via HTTPS, and the URL and `verify_token` are correct.
5. Generate a page access token from your developer console on the "Messenger" tab. Copy this token. Modify your code to add in this token:
  ```
  var fbChatBot = require('fb-chatbot');
  
  var bot = new fbChatBot('/webhook/', 3000, '<random verify_token>', '<page access_token>', true);
  
  bot.subscribe(function(error, response, body) {
  	console.log(error);
  	console.log(body);
  });
  
  bot.on('message', function(message) {
  	console.log(message);
  });
  ```
  Redeploy your server. You do not need to manually subscribe your app.
6. You can now start receiving messages. Send a message to your page, and the message object should appear in your console.
7. Reply to messages. Modify your code to this to reply a standard phrase on every message.
  ```
  var fbChatBot = require('fb-chatbot');
  
  var bot = new fbChatBot('/webhook/', 3000, '<random verify_token>', '<page access_token>', true);
  
  bot.subscribe(function(error, response, body) {
  	console.log(error);
  	console.log(body);
  });
  
  bot.on('message', function(message) {
  	bot.sendTextMessage(message.sender, 'Hello! You are chatting with a bot', function(error, response, body) {
		  console.log(error);
		  console.log(body);
	  });
  });
  ```

## How to use
### 1. Initialize
  
  ```
  var fbChatBot = require('fb-chatbot');
  //var bot = new fbChatBot('<webhook url>', <server port>, <fb webhook verify token>, <fb page access token> , true); 
  var bot = new fbChatBot('/webhook/', 3000, process.env.FB_WEBHOOK_VERIFY_TOKEN, process.env.FB_ACCESS_TOKEN, true); 
  ```
### 2. Receive messages
You can receive messages by listening to specific events:
Any type of message received

```
bot.on('message', function(message) {
	console.log(message);
});
```

Any type of message received from specific user

```
    bot.on('[senderid]->message', function(message) {
  	  console.log(message);
    });
```
    
Example:

```
    bot.on('111122223333->message', function(message) {
  	  console.log(message);
    });
```
    
Any type of message received for specific page

```
    bot.on('message->[page_id]', function(message) {
  	  console.log(message);
    });
```

Example:

```
    bot.on('message->111122223333', function(message) {
  	  console.log(message);
    });
```
    
Text Message received

```
    bot.on('text', function(message) {
      console.log(message);
    });
```
  
Text message received from specific user

 ```
    bot.on('[senderid]->text', function(message) {
      console.log(message);
    });
```
    
Example:

```
    bot.on('111122223333->text', function(message) {
      console.log(message);
    });
```
    
Text message received for specific page

```
    bot.on('text->[page_id]', function(message) {
      console.log(message);
    });
```
    
Example:

```
    bot.on('text->111122223333', function(message) {
      console.log(message);
    });
```
    
Attachment received

```
    bot.on('attachment', function(message) {
      console.log(message);
    });
```
  
Attachment received from specific user

```
    bot.on('[senderid]->attachment', function(message) {
      console.log(message);
    });
```
    
Example:

```
    bot.on('111122223333->attachment', function(message) {
      console.log(message);
    });
```
    
Attachment received for specific page

```
    bot.on('attachment->[page_id]', function(message) {
      console.log(message);
    });
```
    
Example:

```
    bot.on('attachment->111122223333', function(message) {
      console.log(message);
    });
```

### 3. Send messages

Messages are sent using the Facebook Graph API.
```
bot.sendTextMessage(<sender>, <text>, function(error, response, body) {
		
});
```
Example:
```
bot.on('text', function (event) {
	console.log('Text received:' + event.data + ' from:' + event.sender);
	bot.sendTextMessage(event.sender, "Hello you said " + event.data, function(error, response, body) {
		console.log(error);
		console.log(body);
	});
});
```
