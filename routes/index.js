let express = require('express');
let router = express.Router();

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let log = ut.logger(__filename);
let bizUser = require('../biz/bizUser.js');
let uploadtutil = require('./uploadutil.js');

let bizLbor = require('../biz/bizLbor.js');
let bizRqst = require('../biz/bizRqst.js');
let bizCmmt = require('../biz/bizCmmt.js');
let bizPay = require('../biz/bizPay.js');
let bizServMsg = require('../biz/bizServMsg.js');
let bizTomato = require('../biz/bizTomato.js');
let bizBamboo = require('../biz/bizBamboo.js');


/* GET home page. 验证express框架是否就绪的web页面*/
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express你好' });
});
router.get('/users', function(req, res, next) {
    res.send('/users access ok');
});
router.get('/RuWr1VprNj.txt', express.static('./public/RuWr1VprNj.txt'));




/* 用来验证post、get请求，业务模块封装以及数据库访问的样例*/
router.post('/user/insert'  , bizUser.insert);
router.get('/user/findall'  , bizUser.findAll);
router.get('/user/detail/:Id', bizUser.detail);
router.get('/user/remove/:Id', bizUser.remove);
//router.post('/user/update/:Id', bizUser.update);

/* 学习后端框架期间的样例代码 */
router.get('/login', require('./login'));
router.get('/user', require('./user'));
router.all('/tunnel', require('./tunnel'));

/*找工APP相关模块的service*/
router.get('/rqst-list', bizRqst.list);//查询需求单
router.get('/rqst-edit', bizRqst.edit); //新增、更新时使用此方法

router.get('/cmmt-list', bizCmmt.list); //查询评价（按订单、被评价人、评价人）
router.get('/cmmt-edit', bizCmmt.edit); //新增、更新时使用此方法


router.get('/lbor-detl', bizLbor.detl);//LB详情
router.get('/lbor-edit', bizLbor.edit);//LB编辑
router.get('/lbor-list', bizLbor.list);//LB编辑

router.get('/login2', bizUser.login2);//登录获取用户的openid
router.get('/user-chck', bizUser.chck);//用户检查
router.get('/user-edit', bizUser.edit);//用户注册和信息修改
router.get('/user-list', bizUser.list);//用户注册和信息修改

router.get('/tomato-edit', bizTomato.edit);
router.get('/tomato-list', bizTomato.list);
router.get('/bamboo-list', bizBamboo.list);

router.get('/user-mbck', bizUser.mbck);//手机号唯一性检查
router.get('/user-mbsc', bizUser.mbsc);//获取动态码

router.get('/addrs2', bizUser.addrList);//常用地址查询
router.post('/addrs2', bizUser.addrEdit2);//常用地址更新

router.post('/addrs', bizUser.addrsEdit);//常用地址更新
router.get('/addrs', bizUser.addrsEdit);//常用地址查询

router.all('/wxpay', bizPay.pay);//支付
router.all('/wxpaycb', bizPay.paycb);//支付回调测试
router.all('/wxpayquery', bizPay.payquery);//支付结果查询

router.all('/msgpush', bizServMsg.msgpush);//客服信息推送。由微信服务器收到客户消息后会发送到本接口

router.all('/stat-push', bizServMsg.statpush);//客服信息推送。由微信服务器收到客户消息后会发送到本接口


router.get('/uploadrm', function (req, res, next) {

    let rmfile = JSON.parse(req.query.rdata).rmfile;
    rmfile = process.env.SI_ZG_UPLOAD_DIR + rmfile.substring(rmfile.indexOf('upload/'));

    if (rmfile) {
        let fs = require('fs');
        try {
            fs.unlink(rmfile);
            log.debug('删除文件:' + rmfile);
            res.send('删除成功');
        } catch (e) {
            log.error('删除文件时错误:' + rmfile);
            res.send('删除失败:' + rmfile);
        }
    }
});

/*文件上传模块的核心代码*/
router.post('/upload',uploadtutil.single('avatar'),function(req,res,next){
    if(req.file){
        //将上传后的文件名作为应答发送给前端程序，用于显示。
        res.send(req.file.filename);
    }
});

/**
 router.post('/msgpush', function (req, res, next) {
    try{
            console.log(req.query,req.params,req.body);
            res.send('success');
            let http = require('https');

            const postData = JSON.stringify({
                "touser":req.body.FromUserName,
                "msgtype":"text",
                "text":
                    {
                        "content":"Hello World"
                    }
            });
            const options = {
                host: 'api.weixin.qq.com',
                port: '443',
                path: '/cgi-bin/message/custom/send?access_token=zhaogongisperfect',
                method: 'POST',
            };


        const tokenOptions = {
            host: 'api.weixin.qq.com',
            port: '443',
            path: '/api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+cf.appId+'&secret='+cf.secret,
            method: 'GET',
        };

        let ret0 = [];
        const req0 = http.request(tokenOptions,(res0)=>{
            res0.on('data', (chunk) => {
                ret0.push(chunk);
                console.log(`token BODY: ${chunk}`);
            });
            res0.on('end', () => {
                console.log('result:',Buffer.concat(ret0));
                console.log('No more data in response.');
            });
        });


        const req1 = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            let ret = [];
            res.on('data', (chunk) => {
                ret.push(chunk);
                console.log(`BODY: ${chunk}`);
            });
            res.on('end', () => {
                console.log('result:',Buffer.concat(ret));
                console.log('No more data in response.');
            });
        });
        req1.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });
        req1.write(postData);
        req1.end();

    }catch(e){
        console.error(e);
    }

});

 router.get('/msgpush', function (req, res, next) {
    try{
        //console.log(req.query,req.query.signature);

        let p = req.query;
        let signature = p.signature;
        let timestamp = p.timestamp;
        let nonce = p.nonce;

        console.log('p=',p);
        let very = [timestamp, nonce,"zhaogongisperfect"];
        let data = very.sort();

        console.log('data=',data);
        let str = '';
        for (let i = 0; i < data.length; i++) {
            str += data[i];
        }
        console.log('str=',str);

        let sha1 = require('sha1');
        let verySign=sha1(str);
        console.log('verSign=',verySign);
        if (signature === verySign) {
            console.log('verSign=sign');
            res.body=req.query.echostr;
            res.end(req.query.echostr);
        }else{
            console.log('verSign!=sign');
            res.body={'msg':'valid error'};
        }
    }catch(e){
        console.error(e);
    }

});
 */

module.exports = router;
