var watson = require('watson-developer-cloud');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('dotenv').config();
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var passportLocalMongoose = require('passport-local-mongoose');
var session = require('express-session');
var mongoose = require('mongoose')

var db = require('./models/db')

var routes = require('./routes/index');
var users = require('./routes/users');
var homes = require('./routes/homes');
var sessions = require('./routes/sessions');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());


app.use('/', routes);
app.use('/users', users);
app.use('/homes', homes);
app.use('/sessions', sessions);


var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

// Create the service wrapper
var personalityInsights = watson.personality_insights({
  version: 'v2',
  username: process.env.IBM_USERNAME || 'mongodb://localhost:27017/roommate-finder',
  password: process.env.IBM_PASSWORD || 'mongodb://localhost:27017/roommate-finder'
});

app.get('/', function(req, res) {
  res.render('index', { ct: req._csrfToken });
});

app.post('/user/profile', function(req, res, next) {
  console.log(req);
  
  var parameters = extend(req.body, { acceptLanguage : i18n.lng() });

  personalityInsights.profile(parameters, function(err, profile) {
    if (err)
      return next(err);
    else
      console.log(res);
      return res.json(profile);
  });
});