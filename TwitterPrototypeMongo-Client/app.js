
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , login = require('./routes/login')
  , profile = require('./routes/profile')
  , dashboard = require('./routes/dashboard')
  , path = require('path')
  //Importing the 'client-sessions' module
  , session = require('client-sessions');

//URL for the sessions collections in mongoDB
	var mongoSessionConnectURL = "mongodb://localhost:27017/login";
	var expressSession = require("express-session");
	var mongoStore = require("connect-mongo")(expressSession);
	var mongo = require("./routes/mongo");


var app = express();

//configure the sessions with our application
app.use(expressSession({
	secret: 'cmpe273_teststring',
	resave: false,  //don't save session if unmodified
	saveUninitialized: false,	// don't create session until something stored
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,
	store: new mongoStore({
	url: mongoSessionConnectURL
	})
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// GET
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/homepage',login.redirectToHomepage);
app.get('/loginRoute', login.redirectToLogin);
app.get('/signUpRoute', login.redirectToSignUp);
app.get('/login', login.login);
app.get('/signup', login.signup);
app.get('/profile', login.profile);
app.get('/routeDashboard', profile.routeDashboard);
app.get('/dashboard', profile.dashboard);
app.get('/retrieveTweet', profile.retrieveTweet);
app.get('/retrieveAllTweets', dashboard.retrieveAllTweets);
app.get('/logout',login.logout);


//POST
app.post('/checklogin',login.checklogin);
app.post('/signUpUser',login.signUpUser);
app.post('/insertTweet', profile.insertTweet);
app.post('/addRetweet', dashboard.addRetweet);

//connect to the mongo collection session and then createServer
mongo.connect(mongoSessionConnectURL, function(){
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);
	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});  
});
