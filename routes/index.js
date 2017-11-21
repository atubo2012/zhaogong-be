var express = require('express');
var router = express.Router();
var bizUser = require('../biz/bizUser.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express你好' });
});
router.get('/users', function(req, res, next) {
    res.send('/users access ok');
});

router.post('/user/insert'  , bizUser.insert);
router.get('/user/findall'  , bizUser.findAll);
router.get('/user/detail/:Id', bizUser.detail);
router.get('/user/remove/:Id', bizUser.remove);
router.post('/user/update/:Id', bizUser.update);


router.get('/login', require('./login'));
router.get('/user', require('./user'));
router.get('/r_cleaning', require('./r_cleaning'));
router.all('/tunnel', require('./tunnel'));

module.exports = router;
