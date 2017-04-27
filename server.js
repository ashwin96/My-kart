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
app.use(express.static(__dirname+'/Public'));
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cookieparser());
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:config.secretKey,
}));
app.use(flash());
app.engine('ejs',ejsengine);
app.set('view engine','ejs');
app.use(mainroute);
app.use(userroutes);

app.listen(config.port,function (err) {
  if(err)
    console.log(err);
  else
    console.log("Server running at port "+config.port);
});
