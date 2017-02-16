/**
 * New node file
 */
var request = require('request')
, express = require('express')
,assert = require("assert")
,http = require("http");

describe('http tests', function(){

	it('should return the login if the url is correct', function(done){
		http.get('http://localhost:3000/login', function(res) {
			assert.equal(200, res.statusCode);
			done();
		})
	});

	it('should not return the profile page if the url is wrong', function(done){
		http.get('http://localhost:3000/profile', function(res) {
			assert.equal(404, res.statusCode);
			done();
		})
	});
	
	it('should not return the dashboard page if the url is wrong', function(done){
		http.get('http://localhost:3000/dashboard', function(res) {
			assert.equal(404, res.statusCode);
			done();
		})
	});

	it('should render profile page', function(done) {
		request.post(
			    'http://localhost:3000/checklogin',
			    { form: { username: 'anishahegde@hotmail.com',password:'test' } },
			    function (error, response, body) {
			    	assert.equal(200, response.statusCode);
			    	done();
			    }
			);
	  });
});