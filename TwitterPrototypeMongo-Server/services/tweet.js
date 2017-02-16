var mongo=require("./mongo");
var mongourl="mongodb://localhost:27017/login";

function retrieve(msg, callback)
{
	console.log("Inside tweet retrieve method");
	var res={};
	var email = msg.email;
	
	//server side validation
	if(email!= ""){
	
		mongo.connect(mongourl,function(){
				console.log('Connected to mongo at: ' + mongourl);
				
				var coll = mongo.collection('tweets');

				coll.find({email: email, isCreator:1}).toArray(function(err,rows){
					if(rows)
					{
						res.code = "200";
						res.value = "Success Retrieval";	
						console.log("Rows: " + rows);
						res.userTweets = rows;
					}
					else
					{
						res.code="401";
						res.value="Failed Retrieval";
					}
					callback(null, res);
				});	
			});
		mongo.close();
	}
	else
	{
		res.code="401";
		res.value="Failed login";
	}
	callback(null, res);
}//end retrieve

function insert(msg, callback){
	
	var res={};
	msg.session={};

	console.log("Inside insert function in tweet.js");
	//server side validation
	if(msg.tweetId!="" && msg.tweetData!=""){
	
	mongo.connect(mongourl,function(){
			console.log('Connected to mongo at: ' + mongourl);
			
			var coll = mongo.collection('tweets');
			
			console.log("Inserting Tweets");
				coll.insert({
					"email" : msg.email,
					"fName" : msg.fname,
					"lName" : msg.lname,
					"userHandle" : msg.userHandle,
					"tweetId" : msg.tweetId,
			 		"tweetData" : msg.tweetData,
			 		"hashtagData" : msg.hashtagData,
			 		"isCreator" : msg.isCreator,
			 		"currentTimestamp": msg.currentTimestamp					
					}, function(err, result){
							if (result) {
								res.code="200";
								res.value="Tweet Inserted";								
							} 
							else {									
								res.code="401";
								res.value="Tweet not Inserted";
							}
						});
				
				callback(null, res);
	});//end connect
	mongo.close();
	}//end if to check for null values
	else {
		res.code="401";
		res.value="Tweet not Inserted";
	}	
	callback(null, res);
}//end insert


function retrieveAll(msg, callback)
{
	console.log("Inside tweet retrieve all method");
	var res={};
	var following;
	var tweetsByFollowing = [];
	var email = msg.email;
	
	//server side validation
	if(email!= ""){
	
		mongo.connect(mongourl, function(){
				console.log('Connected to mongo at: ' + mongourl);
				
				var coll = mongo.collection('login');

				//Verifying if user is following anyone 
				coll.findOne({email: email}, function(err, user){
					console.log("Checking if user is following anyone.....");
					if (user.following.length == 0) 
					{
						console.log("User is not following anyone");
						res.code = "401";
						res.value = "User not following anyone";
					} 
					else {
							console.log("Retrieving Following Users tweets");
							following = user.following;
							console.log("List of following: " + following);
							coll = mongo.collection('tweets');
							
							
							coll.find({}, {sort: [['currentTimestamp','desc']]}).toArray(function(err, results){
									if (results) {	
									
											for(var j=0; j<results.length;j++){
												for(var i=0; i<following.length; i++){
													if(results[j].email == following[i]){
														if(results[j].isCreator == 1)
															tweetsByFollowing.push(results[j]);	
													}
													
												}//end for i													

												if(email == results[j].email){
													if(results[j].isCreator == 0)
														tweetsByFollowing.push(results[j]);
												}
											}//end for j	
									} 
							});
							
							res.code = "200";
							res.value = "Retrieve following tweets";
							res.tweetsByFollowing = tweetsByFollowing;
					}//end else	
					callback(null, res);
				});//end findOne
				
				
			});//end mongo connect
		mongo.close();
	}
	else
	{
		res.code="401";
		res.value="Failed login";
	}//end else for server side validation
	callback(null, res);
}//end retrieveAll


function addRetweet(msg,callback)
{
	console.log("Inside add rewteet implementation");
    mongo.connect(mongourl, function() {
        var res = {};
        
        var coll = mongo.collection('tweets');
        coll.findOne({tweetId : msg.tweetId},function(err, tweet){
        	        	
        	console.log("Trying retweet");
            if(!err)
            {
            	console.log("Retrieved tweet to retweet");
                var tweetData = tweet.tweetData;
                var hashtagData = tweet.hashtagData;
                coll.insert({
                	"email" : msg.email,
					"fName" : msg.fName,
					"lName" : msg.lName,
					"userHandle" : msg.userHandle,
					"tweetId" : msg.tweetId,
			 		"tweetData" : tweetData,
			 		"hashtagData" : hashtagData,
			 		"isCreator" : 0,
			 		"currentTimestamp": msg.currentTimestamp,
			 		"originalFname" : tweet.fName,
            	    "originalLname" : tweet.lName,
            		"originaluserHandle" : tweet.userHandle
                },function(err, result){
                    if(!err)
                    {
                    	res.code = "200";
						res.value = "Retweeted successfully";		
                    }
                    else
                    {
                        console.log("Error While Inserting ReTweeted Comment");
                        res.code = "401";
						res.value = "Retweet failed";
                    }
                });
            }           
        });
        callback(null, res);
    });
    mongo.close();
}



exports.retrieve = retrieve;
exports.insert = insert;
exports.retrieveAll = retrieveAll;
exports.addRetweet = addRetweet;