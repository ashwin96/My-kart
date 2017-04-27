var router = require('express').Router();
var User = require('../models/user');
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
                res.redirect('/home');
              }
          })
        }
    })
});

module.exports = router;
