var router = require('express').Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var stripe = require('stripe')('sk_test_26UzfHZI7nOUa5zm91gwKiRL');

Product.createMapping(function (err,mapping) {
    if(err){
      console.log(err);
    }
    else {
      console.log("mapping creted");
      console.log(mapping);
    }
});
function paginate(req,res,next) {
  var perpage = 9;
  var page = req.params.page;
  Product
    .find()
    .skip(perpage*page)
    .limit(perpage)
    .populate('category')
    .exec(function (err,products) {
      if(err) return next(err);
      Product.count().exec(function (err,count) {
      if(err) return next(err);
      res.render('main/product-main',{
        products:products,
        pages:count/perpage
      });
    });
  });
}

var stream = Product.synchronize();
var count = 0;
stream.on('data',function(){
  count++;
})
stream.on('close',function(){
  console.log("Indexed "+count+" documents");
})
stream.on('error',function (){
  console.log(err);
})
router.get('/home',function (req,res) {
  res.redirect('/');
})

router.get('/',function (req,res,next) {
  if(req.user){
    paginate(req,res,next);
  }
  else
  res.render('main/home');
});
router.get('/page/:page',function (req,res,next) {
    paginate(req,res,next);
})

router.get('/about',function (req,res) {
  res.render('main/about');
});

router.post('/search',function (req,res) {
  res.redirect('/search?q='+req.body.q);
});

router.get('/search',function (req,res,next) {
    if(req.query.q){
      Product.search({
        query_string:{query:req.query.q}
      },function (err,result) {
        if(err) return next(err);
        var data = result.hits.hits.map(function(hit){
          return hit;
        });
        res.render('main/search-result',{
          query:req.query.q,
          data:data
        });
      });
    }
});
router.post('/product/:id',function (req,res,next) {
    Cart.findOne({owner:req.user.id},function (err,cart) {
        cart.items.push({
          item: req.body.product_id,
          quantity:parseInt(req.body.quantity),
          price:parseFloat(req.body.price)
        });
        console.log(req.body.product_id);
        cart.total = (parseFloat(cart.total)+parseFloat(req.body.price)).toFixed(2);
        cart.save(function (err) {
          if(err) next(err);
          return res.redirect('/cart');
        })
    })
})

router.get('/products/:id',function (req,res,next) {
  Product
    .find({category:req.params.id})
    .populate('category')
    .exec(function (err,products) {
        if(err) return next(err);
        res.render('main/category',{
          products:products
        });
    });
});
router.get('/cart',function (req,res,next) {
    Cart
      .findOne({owner:req.user.id})
      .populate('items.item')
      .exec(function (err,usercart) {
          if(err) return next(err);
          res.render('main/cart',{
            usercart:usercart,
            message:req.flash('remove')
          });
       });
});
router.post('/remove',function (req,res,next) {
  Cart.findOne({owner:req.user.id},function (err,cart) {
    if(err) return next(err);
    cart.items.pull(String(req.body.item));
    cart.total = (parseFloat(cart.total)-parseFloat(req.body.price)).toFixed(2);
    cart.save(function (err,done) {
      if(err)return next(err);
      req.flash('remove','Successfully removed product');
      res.redirect('/cart');
    });
  });
});
router.post('/payment',function (req,res,next) {
  var StripeToken = req.body.stripeToken;
  var curCharge = Math.round(req.body.stripeMoney*100);
  stripe.customers.create({
    source:StripeToken
  }).then(function (customer) {
      return stripe.charges.create({
        amount:curCharge,
        currency:'inr',
        customer:customer.id
      });
  });
  res.redirect('/profile');
});

router.get('/product/:id',function (req,res,next) {
  Product.findOne({_id:req.params.id},function (err,product) {
    if(err) return next(err);
    res.render('main/product',{
      product:product
    });
  });
});
module.exports = router;
