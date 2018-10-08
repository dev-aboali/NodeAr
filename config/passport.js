const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Config = require('./database');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {

 	

	passport.use(new LocalStrategy(
  		//local strategy
	  	function(username, password, done) {
	  		let query = { username: username };
	  		password = password.trim();

		    User.findOne(query, function (err, user) {

		     if (!user) {
		        return done(null, false, { message: 'Not Found' });
		      }	
		      if (err) { return done(err); }
		      

		      	bcrypt.compare(password, user.password, function(err, match) {
   				 	if(err) throw err;
   				 	if(match) {
   				 		return done(null, user);
   				 	} else { 
   				 		return done(null, false, { message: 'Incorrect username/password.' });	
   				 	}
				});
		 

		    });
  }
));
	passport.serializeUser(function(user, done) {
				done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
		    done(err, user);
		});
	});
}

