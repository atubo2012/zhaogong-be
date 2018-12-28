let express = require('express');
let router = express.Router();

let globalData = require('../globalData.js');
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
let bizMgmt = require('../biz/bizMgmt.js');
let bizThirdSvs = require('../biz/bizThirdSvs.js');


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

router.all('/biz-edit', bizMgmt.edit);              //业务类别管理
router.all('/biz-list', bizMgmt.list);              //业务类别查询
router.all('/bizcatalog-list', bizMgmt.bizcataloglist);//业务种类清单，客户查询清单时展示
router.all('/biz-query', bizMgmt.bizQuery);         //根据id查询某个业务大类
router.all('/order-list', bizMgmt.orderlist);       //查询动态配置商品相关的订单
router.all('/city-list', bizThirdSvs.cityList);    //rsr城市列表查询

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
 * 生成二维码服务
 * 参考：
 * （1）官方文档：https://developers.weixin.qq.com/miniprogram/dev/api/qrcode.html
 * （2）非官案例：
 *      https://blog.csdn.net/fz250052/article/details/80380355
 *      https://blog.csdn.net/yemuxia_sinian/article/details/81981164
 */
router.get('/gen-qrcode2', function (req, res, next) {
    let rdata = JSON.parse(req.query.rdata);
    log.info('qrcode rp:', rdata);

    try {
        if (rdata.scene.length > 32) {
            throw 'scene参数的长度超出了最大限制32个字符。';
        }
        let body = {
            page: rdata.page,//二维码默认打开小程序页面
            scene: rdata.scene,//打开页面时携带的参数
            width: rdata.width,
            auto_color: rdata.auto_color,
        };
        log.info('qrcode body rp:', body);

        ut.httpRequest4Qrcode('https', {
            host: 'api.weixin.qq.com',
            path: '/wxa/getwxacodeunlimit?access_token=' + globalData.access_token,
            port: '443',
            method: 'POST'
        }, JSON.stringify(body), (result) => {

            //后缀4位随机数，以区分A、B、C三类场景
            //let file_name = 'qrcode_'+rdata.userInfo.uid+'_'+ut.randomString(4)+'.png';
            let file_name = 'qrcode_' + body.scene.replace(/&/g, '_') + '.png';//文件名根据scene中的值来命名，便于识别
            let file_name_with_path = process.env.SI_ZG_UPLOAD_DIR + 'upload/' + file_name;
            log.info('/gen-qrcode :' + file_name, file_name_with_path);

            let fs = require('fs');
            fs.writeFileSync(file_name_with_path, result);
            res.end(file_name);
        });

    } catch (e) {
        log.error(e);
        res.end('error gen-qrcode');
    }
});

router.get('/gen-qrcode', function (req, res, next) {
    let rdata = JSON.parse(req.query.rdata);
    log.info('qrcode rp:', rdata);

    try {
        if (rdata.scene.length > 32) {
            throw 'scene参数的长度超出了最大限制32个字符。';
        }
        let body = {
            page: rdata.page,//二维码默认打开小程序页面
            scene: rdata.scene,//打开页面时携带的参数
            width: rdata.width,
            auto_color: rdata.auto_color,
        };
        ut.genQrCode(body, rdata.userInfo.uid, (file_name) => {
            res.end(file_name);
        });


    } catch (e) {
        log.error(e);
        res.end('error gen-qrcode');
    }
});

module.exports = router;
