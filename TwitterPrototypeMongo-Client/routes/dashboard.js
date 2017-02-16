
var ejs = require("ejs");
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/login";
var mq_client = require('../rpc/client');


exports.retrieveAllTweets = function(req,res)
{
	
	var email = req.session.username;
	var uhandle = req.session.userHandle;
	var fName = req.session.fName;
	var lName = req.session.lName;
	var followers = req.session.followers.length;
	var following = req.session.following.length;
	
	console.log("In Dashboard Email: " + email);
	
	var msg_payload = {"email":email, "oper":"retrieveAll"};
	
	mq_client.make_request('tweet_queue', msg_payload, function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Tweets Retrieved Followers");
				
				for(var i=0; i<results.tweetsByFollowing.length; i++)
					console.log("Tweet Data: " + results.tweetsByFollowing[i]);
				
				res.send({"email":email, "uhandle":uhandle, "fName":fName, "lName":lName, "followers":followers, "following":following, "tweetsByFollowing":results.tweetsByFollowing});
			}
			else {    
				
				console.log("Not following anyone-In dashboard.js");
				res.send({"email":email, "uhandle":uhandle, "fName":fName, "lName":lName, "followers":followers, "following":following});
			}
		}  
	});
};

exports.addRetweet = function(req, res)
{
	var email = req.session.username;
	var userHandle = req.session.userHandle;
	var fName = req.session.fName;
	var lName = req.session.lName;
	
	var currTweetId = req.param("tweetId");
	
	console.log("In Dashboard Retweet with Tweet Id: " + currTweetId);
	
	var msg_payload = {"tweetId":currTweetId, "email":email, "userHandle":userHandle, "fName":fName, "lName":lName, "currentTimestamp":new Date(), "oper":"addRetweet"};
	
	mq_client.make_request('tweet_queue', msg_payload, function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				res.send({"retweet":"Success"});
			}
			else {    
				res.send({"retweet":"Error"});
			}
		}  
	});
};
