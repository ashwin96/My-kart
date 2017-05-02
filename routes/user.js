var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportconf = require('../config/passport');

router.get('/login',function (req,res,err) {
  if(req.user) return res.redirect('/home');
  res.render('accounts/login',{message:req.flash('loginMessage')});
});
router.post('/login',passport.authenticate('local-login',{
    successRedirect:'/profile',
    failureRedirect:'/login',
    failureFlash:true
}));
router.get('/logout',function (req,res,err) {
  req.logout();
  res.redirect('/home');
})
router.get('/profile',function (req,res,next) {
  User.findOne({id:req.user.id},function (err,user) {
    if(err)
      res.redirect('/login');
    res.render('accounts/profile',{user:req.user});
  });
});


router.get('/signup',function (req,res,err) {
    res.render('accounts/signup',{
      errors:req.flash('errors')
    });
});
router.post('/signup',function (req,res,err) {
    var user = new User();
    user.profile.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    User.findOne({email:req.body.email},function (err,existingUser) {
        if(existingUser){
          console.log("Email already exists");
          req.flash('errors',"Email already exists");
          return res.redirect('/signup');
        }
        else {
          user.save(function (err,user) {
              if(err)
                return next(err);
              else {
                req.logIn(user,function (err) {
                  if(err) return next(err);
                  res.redirect('/home');
                })
              }
          })
        }
    })
});

module.exports = router;
