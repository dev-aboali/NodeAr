const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database , { useNewUrlParser: true });

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('connected to mongo');
  });
// db.on('error', function(error) {
//    console.log(error);
// });
// Live cloud Should beprocess.env.PORT, process.env.IP
const port = 3000;

// load pug engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// add Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
}));

// passport config
require('./config/passport')(passport);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null ;
    next();
});


// Load Connect flash middleware
app.use(require('connect-flash')());

// Set public folder 
app.use(express.static(path.join(__dirname, 'public')));

let Articles = require('./models/article.js');

app.get("/", function(req,res) {

    Articles.find({}, function(err, articles){
        if(err) {
            console.log(err);
        } else{ 
            res.render('index', {
                title: 'Home',
                articles: articles
            });
        }
    });
   
});

//Route files
let articles = require('./routes/articles');
app.use('/articles', articles);

// app.use('/', routes);
let user = require('./routes/users');
app.use('/users', user);

app.listen(port, function(){
    console.log('Server is Running...');
});

