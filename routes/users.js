const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// load user model
let User = require('../models/user.js');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
});

// registeration form 
router.get('/register', function(req,res){
    res.render('register',{
        title: 'Sign Up'
    });
});

// Login form 
router.get('/login', function(req,res){
    res.render('login',{
        title: 'Login'
    });
});

// login form submition
router.post('/login', function(req, res, next) {
    passport.authenticate('local', { 
                                   successRedirect: '/',
                                   failureRedirect: '/users/login',       
                                   failureFlash: true 
                        })(req,res,next);
});

//logout 

router.get('/logout', function(req,res){
    req.logout();
    req.flash('success', "You're Logged out!");
    res.redirect('/users/login');
});

//submit registeration form
router.post('/register',[
    check('name').isLength({min:1}).trim().withMessage('Your name is required'),
    check('email').isLength({min:1}).trim().withMessage('Email is required'),
    check('username').isLength({min:1}).trim().withMessage('Username is required'),
    check('password','Password must be at least 4 charactars').isLength({ min: 4 })
        .custom( (value, {req}) => {
            if (value !== req.body.password2) {
                // trow error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
   ], (req , res, next) => {

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        confirm: req.body.password2,
    });

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors);
        res.render('register',
        { 
            user:user,
            errors: errors.mapped()
        });
    } else {

            bcrypt.hash(user.password, 10, function(err, hash) {
                if(err) {
                    console.log(error);
                    return;
                } else {
                    user.password = hash;
                    user.save(function(err){
                        if(err) {
                            console.log(err);
                            return;
                        } else {
                            req.flash('success',"You're now registered");
                            res.redirect('/users/login');
                        }
                    });   
                }
            });

        
    }

    
});


const users = module.exports = router;