var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  email:{type:String,unique:true,lowercase:true},
  password:{type:String},
  profile:{
    name:{type:String,default:''},
    Age:{type:Number}
  }
});

UserSchema.pre('save',function (next) {
  var user = this;
  bcrypt.genSalt(12,function (err,salt) {
    if(err) return next(err);
    bcrypt.hash(user.password,salt,null,function (err,hash) {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});


UserSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password,this.password);
}

module.exports = mongoose.model('User',UserSchema);
