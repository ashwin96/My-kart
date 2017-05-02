var router = require('express').Router();
var Category = require('../models/category');

router.get('/add-category',function (req,res) {
    res.render('admin/add-category',{message:req.flash('Success')});
});

router.post('/add-category',function (req,res,next) {
    var category = new Category();
    category.name = req.body.name;
    category.save(function (err) {
        if(err) return next(err);
        req.flash('Success','Successfully added category');
        return res.redirect('/add-category');
    });
})

module.exports = router;
