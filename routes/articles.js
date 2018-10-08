
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
// load article model
let Articles = require('../models/article.js');

// load User model
let User = require('../models/user.js');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
});
// add_article page
router.get("/add", confirmAuthincated, function(req,res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

//get single article
router.get('/:id', function(req,res){
    Articles.findById(req.params.id, function(err,article){
        User.findById(article.author, function(err,user){
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});


//load edit form 
router.get('/edit/:id', function(req,res){
    Articles.findById(req.params.id, function(err,article){
        if(article.author != req.user._id) {
            req.flash('danger', 'Not Authorized!');
            res.redirect('/');
        }
        res.render('edit_article', {
            article: article,
            title: 'Edit Article'
        });
    });
});


// add submit post route
router.post("/add",  confirmAuthincated, 
    [
        check('title').isLength({min:1}).trim().withMessage('Title required'),
        // check('author').isLength({min:1}).trim().withMessage('Author required'),
        check('body').isLength({min:1}).trim().withMessage('Body required')
    ], (req , res, next) => {

    let article = new Articles();
    article.title = req.body.title ;
    article.author = req.user._id ;
    article.body = req.body.body ;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors);
        res.render('add_article',
        { 
            article:article,
            errors: errors.mapped()
        });
    } else {
        article.save(function(err){
            if(err) {
                console.log(err);
                return;
            } else{
                req.flash('success','Article Added');
                res.redirect('/');
            }
        })
    }

    
});

// update submit post route
router.post("/edit/:id", 
    [
        check('title').isLength({min:1}).trim().withMessage('Title required'),
        check('author').isLength({min:1}).trim().withMessage('Author required'),
        check('body').isLength({min:1}).trim().withMessage('Body required')
    ], function(req , res, next){
        let article = {};
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;
        let query = {_id: req.params.id};

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors);
            res.render('add_article',
            { 
                article:article,
                errors: errors.mapped()
            });
        } else {

            Articles.updateOne(query,article,function(err){
                if(err) {
                    console.log(err);
                    return;
                } else{
                    req.flash('success','Article Updated');
                    res.redirect('/');
                }
            })

        }

   
});

// delete article

router.delete('/:id', function(req,res){
    if(!req.user._id) {
        res.status(500).send();
    }
    let query = {_id:req.params.id};

    Articles.findById(req.params.id, function(err, article){
        if(article.author != req.user._id) {
            res.status(500).send();
        } else {
            Articles.deleteOne(query, function(err){
                if(err){
                    console.log(err);
                    return;
                }
                res.send('Deleted');
            });
        }
    }) ;
    
});

//Access controls
function confirmAuthincated(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

const articles = module.exports = router;