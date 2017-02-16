var mongo=require("./mongo");
var mongourl="mongodb://localhost:27017/login";
var bcrypt = require('bcryptjs');
var hash;

function signin(msg, callback)
{
	console.log("Inside sign in method");
	var res={};
	msg.session={};
	var uname = msg.username;
	var pass = msg.password;
	
	//server side validation
	if(uname!="" && pass!=""){
	
		mongo.connect(mongourl, function(){
				console.log('Connected to mongo at: ' + mongourl);
				
				var coll = mongo.collection('login');

				coll.findOne({email: uname},function(err,user){
					if(user)
					{
						bcrypt.compare(pass, user.password, function(err, resValid) {
							
							if(resValid){
								
							console.log("Encrypted Password:" + user.password);	
							// This way subsequent requests will know the user is logged in.
							msg.session.username = user.email;
							msg.session.userHandle = user.userHandle;
							msg.session.fName = user.fName;
							msg.session.lName = user.lName;
							msg.session.city = user.address.city;
							msg.session.state = user.address.state;
							msg.session.dob = user.dob;						
							msg.session.following = user.following;
							msg.session.followers = user.followers;
							
							console.log(msg.session.username + " is the session");
							
							res.code = "200";
							res.value = "Succes Login";	
							res.session = msg.session;
							}
							else
								console.log("Error in encryption");
						});
					}//end if(user)
					else
					{
						res.code="401";
						res.value="Failed login";
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
}//end signin

function signupuser(msg, callback){
	
	var res={};
	msg.session={};
	var email = msg.email;
	var pass = msg.password;
	
	var salt = bcrypt.genSaltSync(10);
	hash = bcrypt.hashSync(pass, salt);

	//server side validation
	if(msg.email!="" && msg.password!="" && msg.fname!="" && msg.lname!="" && msg.userHandle!="" && msg.dob!=""){
	
	mongo.connect(mongourl,function(){
			console.log('Connected to mongo at: ' + mongourl);
			
			var coll = mongo.collection('login');
			//Verifying if user exists 
			coll.findOne({email: email, password:pass}, function(err, user){
				console.log("Checking if user exists.....");
				if (user) 
				{
					console.log("User already exists");
					res.code="400";
					res.value="User Exists";
				} 
				else {
						console.log("Inserting User");
						coll.insert({
							
							  "email" : msg.email,
							  "fName" : msg.fname,
							  "lName" : msg.lname,
							  "password" : hash,
							  "userHandle" : msg.userHandle,
							  "dob" : msg.dob,
							  "contact" : msg.contact,
							  "address" : {"city" : msg.locCity, "state" : msg.locState},
							  "following":[],
							  "followers":[]
							}, function(err, user){
								if (user) {
									// This way subsequent requests will know the user is logged in
									
									console.log("Valid Sign Up..");
									console.log("Render login page...");
									res.code="200";
									res.value="Valid signup";
									
								} else {
									console.log("Invalid sign up");
									res.code="401";
									res.value="Invalid signup";
								}
							});
				}//end else	
				callback(null, res);
			});//end findOne
	});
	mongo.close();
	}//end if to check for null values
	else {
		console.log("Invalid sign up");
		res.code="401";
		res.value="Invalid signup";
	}	
	callback(null, res);
}//end signupuser

function handle_request(msg, callback){
	
	var res = {};
	console.log("In handle request:"+ msg.username);
	
	if(msg.username === "test@email.com" && msg.password === "test"){
		res.code = "200";
		res.value = "Succes Login";
	}
	else{
		res.code = "401";
		res.value = "Failed Login";
	}
	callback(null, res);
}

exports.signin = signin;
exports.signupuser = signupuser;
exports.handle_request = handle_request;