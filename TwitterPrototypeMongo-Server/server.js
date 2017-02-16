//super simple rpc server example
var amqp = require('amqp')
, util = require('util');

var express = require('express');
var http=require('http');
var mongoSessionConnectURL = "mongodb://localhost:27017/sessions";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo= require('./services/mongo');

var login = require('./services/login');
var tweet = require('./services/tweet');
var cnn = amqp.createConnection({host:'127.0.0.1'});

cnn.on('ready', function(){
console.log("Server connection established");

	cnn.queue('login_queue', function(q){
		console.log("listening on login_queue");
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: " + JSON.stringify(message));
			util.log("DeliveryInfo: " + JSON.stringify(deliveryInfo));
			
			//To handle login
			 if(message.oper === "signin")
			 { 
				login.signin(message, function(err,res){
					//return index sent
					console.log("inside login.signin");
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					});
				});
			 }	
			 else{				 
				 login.signupuser(message, function(err,res){
						//return index sent
					 	console.log("inside login.signup");
						cnn.publish(m.replyTo, res, {
							contentType:'application/json',
							contentEncoding:'utf-8',
							correlationId:m.correlationId
						});
				 });
			 }
		});//end of subscribe
	}); //end for login_queue 
	
	
	cnn.queue('tweet_queue', function(q){
		console.log("listening on tweet_queue");
		
		q.subscribe(function(message, headers, deliveryInfo, m){
			util.log(util.format( deliveryInfo.routingKey, message));
			util.log("Message: " + JSON.stringify(message));
			util.log("DeliveryInfo: " + JSON.stringify(deliveryInfo));
			
			//To handle login
			 if(message.oper == 'insert'){ 
				tweet.insert(message, function(err,res){
					//return index sent
					console.log("inside tweet.insert");
					cnn.publish(m.replyTo, res, {
						contentType:'application/json',
						contentEncoding:'utf-8',
						correlationId:m.correlationId
					});
				});
			 }	
			 else if(message.oper == 'retrieveAll'){
				 tweet.retrieveAll(message, function(err,res){
						//return index sent
						console.log("inside tweet.retrieveAll");
						cnn.publish(m.replyTo, res, {
							contentType:'application/json',
							contentEncoding:'utf-8',
							correlationId:m.correlationId
						});
					});
			 }
			 else if(message.oper == 'addRetweet'){
				 tweet.addRetweet(message, function(err,res){
						//return index sent
						console.log("inside tweet.addRetweet");
						cnn.publish(m.replyTo, res, {
							contentType:'application/json',
							contentEncoding:'utf-8',
							correlationId:m.correlationId
						});
					});
			 }
			 else{				 
				 tweet.retrieve(message, function(err,res){
						//return index sent
					 	console.log("inside tweet.retrieve");
						cnn.publish(m.replyTo, res, {
							contentType:'application/json',
							contentEncoding:'utf-8',
							correlationId:m.correlationId
						});
				 });
			 }
		});//end of subscribe
	}); //end for tweet_queue		
});//end connection