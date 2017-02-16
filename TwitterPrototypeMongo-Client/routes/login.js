/**
 * Routes file for Login
 */

var ejs = require("ejs");
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/login";
var mq_client = require('../rpc/client');
	
//Redirects to the log in page
exports.redirectToLogin = function(req,res)
{
	console.log("Redirect made to login page...");
	res.send({status:"200"});
};

exports.login = function(req,res)
{
	console.log("Render login page...");
	res.render('login');
};

//Redirects to the log in page
exports.redirectToSignUp = function(req,res)
{
	console.log("Redirect made to signup page...");
	res.send({status:"200"});
};

exports.signup = function(req,res)
{
	console.log("Render signup page...");
	res.render('signup');
};


//Check login - called when '/checklogin' POST call given from AngularJS module in login.ejs
exports.checklogin = function(req,res)
{
	// These two variables come from the form on the views/login.ejs page
	var username = req.param("username");
	var password = req.param("password");
	
	//JSON object to send to queue
	var msg_payload = {"username": username, "password": password, "oper": "signin"};
		
	console.log("In POST Request Client = UserName: "+ username +" "+password);
	
	mq_client.make_request('login_queue', msg_payload, function(err,results){
		
		console.log("Result returned from server: " + results.session.username + " " + results.session.userHandle);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login");
				req.session.username = results.session.username;
				req.session.userHandle = results.session.userHandle;
				req.session.fName = results.session.fName;
				req.session.lName = results.session.lName;
				req.session.city = results.session.city;
				req.session.state = results.session.state;
				req.session.dob = results.session.dob;
				req.session.following = results.session.following;
				req.session.followers = results.session.followers;
				
				res.send({"login":"Success"});
			}
			else {    
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};


//Redirects to the homepage
exports.redirectToHomepage = function(req,res)
{
	//Checks before redirecting whether the session is valid
	if(req.session.username)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render("homepage",{username:req.session.username});
	}
	else
	{
		res.redirect('/');
	}
};

//Logout the user - invalidate the session
exports.logout = function(req,res)
{
	req.session.destroy();
	res.redirect('/');
};

//Redirects to the profile page
exports.profile = function(req,res)
{
	console.log("Redirect to Profile page in login JS file...");
	res.render('profile');
};

exports.signUpUser = function(req, res){
	
	var email = req.body.serverData.email;
	var firstName = req.body.serverData.firstName;
	var lastName = req.body.serverData.lastName;
	var password = req.body.serverData.password;
	var userHandle = req.body.serverData.userHandle;
	var dob = req.body.serverData.dob;
	var contactNo = req.body.serverData.usrTel || null;
	var locationCity = req.body.serverData.locationCity || null;
	var locationState = req.body.serverData.locationState || null;
	
	var msg_payload={"email":email, 
					 "fname":firstName, 
					 "lname":lastName, 
					 "password":password, 
					 "userHandle":userHandle, 
					 "dob":dob, 
					 "contact":contactNo,
					 "locCity":locationCity,
					 "locState":locationState,
					 "oper":"signupuser"};
	
	mq_client.make_request('login_queue', msg_payload, function(err,results){
		console.log("Sign Up Results: " + results.code + " " + results.value);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("Valid Sign Up");
				res.send({"signup":"Success"});
			}
			else if (results.code == 401) {    
				console.log("Invalid Sign Up");
				res.send({"signup":"Fail"});
			}
			else {
				console.log("User Exists");
				res.send({"signup":"Exists"});
			}
			
		}  
	});
	
};