let express = require('express');
let router = express.Router();
let bizUser = require('../biz/bizUser.js');
let bizLbor = require('../biz/bizLbor.js');
let bizRqst = require('../biz/bizRqst.js');
let bizCmmt = require('../biz/bizCmmt.js');
let uploadtutil = require('./uploadutil.js');

/* GET home page. 验证express框架是否就绪的web页面*/
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express你好' });
});
router.get('/users', function(req, res, next) {
    res.send('/users access ok');
});

/* 用来验证post、get请求，业务模块封装以及数据库访问的样例*/
router.post('/user/insert'  , bizUser.insert);
router.get('/user/findall'  , bizUser.findAll);
router.get('/user/detail/:Id', bizUser.detail);
router.get('/user/remove/:Id', bizUser.remove);
//router.post('/user/update/:Id', bizUser.update);

/* 学习后端框架期间的样例代码 */
router.get('/login', require('./login'));

router.get('/user', require('./user'));
router.get('/r_cleaning', require('./r_cleaning'));
router.all('/tunnel', require('./tunnel'));


/*找工APP相关模块的service*/
router.get('/rqst-list', bizRqst.list);//查询需求单
router.get('/rqst-edit', bizRqst.edit); //新增、更新时使用此方法

router.get('/cmmt-list', bizCmmt.list); //查询评价（按订单、被评价人、评价人）
router.get('/cmmt-edit', bizCmmt.edit); //新增、更新时使用此方法


router.get('/lbor-detl', bizLbor.detl);//LB详情
router.get('/lbor-edit', bizLbor.edit);//LB编辑

router.get('/login2', bizUser.login2);//登录获取用户的openid
router.get('/user-chck', bizUser.chck);//用户检查
router.get('/user-edit', bizUser.edit);//用户注册和信息修改

router.get('/user-mbck', bizUser.mbck);//手机号唯一性检查
router.get('/user-mbsc', bizUser.mbsc);//获取动态码

router.get('/addrs2', bizUser.addrList);//常用地址查询
router.post('/addrs2', bizUser.addrEdit2);//常用地址更新

router.post('/addrs', bizUser.addrsEdit);//常用地址更新
router.get('/addrs', bizUser.addrsEdit);//常用地址查询


/*文件上传模块的核心代码*/
router.post('/upload',uploadtutil.single('avatar'),function(req,res,next){
    if(req.file){
        //console.log('4444444444444'+JSON.stringify(req.file));
        //console.log('4444444444455'+JSON.stringify(req.file.filename));
        //将上传后的文件名作为应答发送给前端程序，用于显示。
        res.send(req.file.filename);
    }
});

module.exports = router;
