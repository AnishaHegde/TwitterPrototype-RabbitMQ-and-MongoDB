/**
 * http://usejsdoc.org/
 */

var ejs = require("ejs");
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/login";
var mq_client = require('../rpc/client');

// Generate Random Ids to insert as Tweet Id in database
function IDGenerator() {
	 
	 this.length = 8;
	 this.timestamp =+ new Date;
	 
	 var _getRandomInt = function( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	 };
	 
	 this.generate = function() {
		 var ts = this.timestamp.toString();
		 var parts = ts.split( "" ).reverse();
		 var id = "";
		 
		 for( var i = 0; i < this.length; ++i ) {
			var index = _getRandomInt( 0, parts.length - 1 );
			id += parts[index];	 
		 }
		 
		 return id;
	 };	 
}


//Render a route to dashboard
exports.routeDashboard = function(req,res)
{
	console.log("Route made to dashboard page...");
	res.send({"statusCode":"200"});
};

// Render dashboard
exports.dashboard = function(req,res)
{
	console.log("Render dashboard page...");
	res.render('twitterdashboard');
};


// Insert Tweets in Database
exports.insertTweet = function(req, res)
{
	console.log("Inside Insert tweet");
	var email, uhandle, tweetTextId, fName, lName,tweetData, hashtags, isCreator, currentDate;

	email = req.session.username;
	uhandle = req.session.userHandle;
	fName = req.session.fName;
	lName = req.session.lName;
	
	var generator = new IDGenerator();
	tweetTextId = generator.generate();
	tweetData = req.param("tweetText");
	hashtags = req.param("hashTagList");
	isCreator = 1;
	currentDate = new Date();
	
	if(hashtags.length == 0){
		hashtags = [];
	}
	
	//JSON object to send to queue
	var msg_payload = {"email":email, 
			 		   "fname":fName, 
			 		   "lname":lName, 
			 		   "userHandle":uhandle, 
			 		   "tweetId":tweetTextId,
			 		   "tweetData":tweetData,
			 		   "hashtagData":hashtags,
			 		   "isCreator":isCreator,
			 		   "currentTimestamp":currentDate,
			 		   "oper":"insert"
						};
	
		mq_client.make_request('tweet_queue', msg_payload, function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == 200){
					console.log("Tweet Inserted");				
					res.send({"insert":"Success"});
				}
				else {    
					
					console.log("Tweet failed to Insert");
					res.send({"insert":"Fail"});
				}
			}  
		});	
};


exports.retrieveTweet = function(req, res)
{
	console.log("Inside retrieve tweet");
	var email = req.session.username;
	console.log("Email: " + email);
	var uhandle = req.session.userHandle;
	console.log("Userhandle: " + uhandle);
	var fName = req.session.fName;
	console.log("FName: " + fName);
	var lName = req.session.lName;
	console.log("LName: " + lName);
	var city = req.session.city;
	console.log("City: " + city);
	var state = req.session.state;
	console.log("State: " + state);
	var dob = req.session.dob;
	console.log("DOB: " + dob);
	var followers = req.session.followers.length;
	var following = req.session.following.length;

	var msg_payload = {"email":email, "oper":"retrieve"};
	
	mq_client.make_request('tweet_queue', msg_payload, function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Tweets Retrieved Client");
				console.log("Tweet Data: " + results.userTweets);
				res.send({"email":email, "uhandle":uhandle, "fName":fName, "lName":lName, "city":city, "state":state, "dob":dob, "followers":followers, "following":following,"tweetData":results.userTweets});
			}
			else {    
				
				console.log("No Tweet Found");
				res.send({"email":email, "uhandle":uhandle, "fName":fName, "lName":lName, "city":city, "state":state, "dob":dob, "followers":followers, "following":following});
			}
		}  
	});
};
