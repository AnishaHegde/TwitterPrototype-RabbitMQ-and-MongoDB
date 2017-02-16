var MongoClient = require('mongodb').MongoClient;
var db;
var connected = false;
var pool = [];

/**
 * Creating a database pool with 10 database connections
 */
function createPool(dbConn){
	for(var i=0; i<10; i++)
		pool.push(dbConn);
}

/**
 * Connects to the MongoDB Database with the provided URL
 */
exports.connect = function(url, callback){
	
	if(!connected){
	    MongoClient.connect(url, function(err, _db){
	      if (err) { throw new Error('Could not connect: '+err); }
	      db = _db;
	      connected = true;
	      createPool(db);
	      console.log(connected +" is connected?");
	      callback(db);
	    });
	}
	else{
		//Checking if only single connection left in pool 
		if(pool.length == 1){
			connected = false;
			callback(pool.pop());
		}
		else{
			callback(pool.pop());
		}
	}
};

/**
 * Returns the collection on the selected database
 */
exports.collection = function(name){
    if (!connected) {
      throw new Error('Must connect to Mongo before calling "collection"');
    } 
    return db.collection(name);
  
};

/**
 * Returns the connection to the pool
 */
exports.close = function(){
	pool.push(db);
};