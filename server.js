var express = require('express');
var mongoose = require('mongoose');
var app = express();
var morgan = require('morgan');
var bodyparser = require('body-parser');
var User = require('./models/user');
var ejsengine = require('ejs-mate');
var ejs = require('ejs');
var cookieparser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var mongostore = require('connect-mongo')(session);
var passport = require('passport');
var category = require('./models/category');
var cartsize = require('./middleware/middleware');


var config = require('./config/config');
mongoose.connect(config.database,function(err){
  if(err)
    console.log(err);
  else {
    console.log("Database successfully connected");
  }
});
var mainroute = require('./routes/main');
var userroutes = require('./routes/user');
var adminroutes = require('./routes/admin');
var apiroutes = require('./api/api');

app.use(express.static(__dirname+'/Public'));
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cookieparser());
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:config.secretKey,
  store: new mongostore({url:config.database,autoReconnect:true})
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req,res,next) {
  res.locals.user = req.user;
  //res.locals.cart = cartsize.cartval;
  next();
});

app.use(function (req,res,next) {
  cartsize(req,res,next);
});
app.use(function (req,res,next) {
  category.find({},function (err,category) {
    if(err) return next(err);
    res.locals.categories = category;
    next();
  })
})
app.engine('ejs',ejsengine);
app.set('view engine','ejs');

app.use(mainroute);
app.use(userroutes);
app.use(adminroutes);
app.use('/api',apiroutes);

app.listen(config.port,function (err) {
  if(err)
    console.log(err);
  else
    console.log("Server running at port "+config.port);
});
