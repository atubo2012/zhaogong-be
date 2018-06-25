
/**
 * 本程序是体验javascript特性或openapi的的实验室文件(lib)。
 *
 * 用途：
 * 1、体验新特性
 * 2、作为教程素材
 *
 * 规范：
 * 1、新特性先在本文件中调试
 * 2、针对有通用性的功能，可以封装成函数，在utils.js中暴露，以便其他模块使用。本文件中的同类函数仍然保留，但是在注释中应说明utils中封装的函数名
 * 3、同一时间，只启用一个特性，用来测试。
 * 4、注释风格，参考utils的注释风格。
 */

let cf = require('../beconfig.js');
let ut = require('./utils.js');
let log = ut.logger(__filename);

/**
 * 获得环境变量信息，可以从process.env.NODE_ENV中获取process.json配置的NODE_ENV等类似的环境变量
 */
//console.log('aaaaa',process.env);


/**
 * 生成制定长度的随机字符串
 * @param len 要生成的字符串长度
 */
// function randomString(len) {
//     len = len || 32;    //这个默认复制的方式很帅
//     let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
//     let maxPos = chars.length;
//     let pwd = '';
//     for (let i = 0; i < len; i++) {
//         pwd += chars.charAt(Math.floor(Math.random() * maxPos));
//     }
//     return pwd.toUpperCase();
// }
// console.log(randomString(4));


/**
 * 腾讯云短信发送服务
 * @type {*|createQcloudSms}
 */
// let QcloudSms = require("qcloudsms_js");
// let appid = cf.oaCfQQSms.appid;
// let appkey = cf.oaCfQQSms.appkey;
// let templId = 88752;    //短信模板的“ID”字段值，参考https://console.cloud.tencent.com/sms/smsContent/1400055205/0/10
// let phoneNumbers = ["17701826978", "18616257890"];//需接收短信的手机号列表
//
// let qcloudsms = QcloudSms(appid, appkey);
// //用来演示的回调函数
// function callback(err, res, resData) {
//     console.log('应答err：',err);
//     if (err)
//         console.log("错误: ", err);
//     else
//         console.log("应答数据: ", resData);
// }
//
// //多条发送的demo
// let msender = qcloudsms.SmsMultiSender();   //多条发送的对象
// let params = ["【002033】", "【深圳01】"];//params的元素个数，应与模板中的占位符数量相同，不能多也不能少。
// msender.sendWithParam("86", phoneNumbers, templId, params, "", "", "", callback);


/**
 * 替换地址中的数字敏感字符
 * @type {string}
 */
// let add = '南京西路256号3层702室';
// console.log(add.replace(/[\d]/g, '*'));



/**
 * 日期格式
  */
// console.log(1,new Date().toUTCString());
// console.log(2,new Date().toLocaleString());     //2018-2-23 20:51:02
// console.log(3,new Date().toDateString());
// console.log(4,new Date().toTimeString());
// console.log(5,new Date().toLocaleDateString()); //2018-2-23
// console.log(6,new Date().toLocaleTimeString()); //20:51:02
// console.log(7,new Date());                      //2018-02-23T12:51:02.560Z
// console.log(8,new Date().toString());



/**
 * log4js
 */
// let log4js = require('log4js');
// let path = require('path');
//
// let log = log4js.getLogger(path.basename(__filename));
// log.level = 'trace';
// log.fatal('hahah....');
// // log.level = 'trace';
// // log.trace('哈哈1');
// // log.debug('哈哈2');
// // log.info('哈哈3');
// // log.warn('哈哈4');
// // log.error('哈哈4');
// // log.fatal('哈哈5');
//
//
// log4js.configure({
//     appenders: {
//         out:{type: 'stdout'},
//         appc:{type:'file', filename:'log4jsc.log', maxLogSize:2048000, backups:3,compress:true}
//     },
//     categories:{
//         default:{appenders:['out'],level:'debug'},
//         app:{appenders:['appc'],level:'trace'},
//         fname:{appenders:['out'],level:'trace'}
//     }
// });
//
// let flog = log4js.getLogger(path.basename(__filename));
// let olog = log4js.getLogger('other');
// let clog = log4js.getLogger('app');
//
//
// let i = 0;
// while (i < 10) {
//     // flog.info('flog的内容');
//     // olog.info('olog哈哈哈');
//     clog.trace('clog is here');
//
//     let a = {aaa:'aaa1',bbb:'bbb1'};
//     flog.info('flog ....',new Date(),a);
//     olog.error('olog error');
//     i++;
// }


/**
 * 根据不同的操作系统生成随机数
 * @param cb
 */
// let getRandom = function (cb) {
//     let ret = null;
//     let cmd = null;
//     let exec = require('child_process').exec;
//     let os = require('os');
//
//     console.log(os.type());
//
//     if(os.type()==='Linux'){
//
//         cmd = 'head -n1 /dev/urandom|md5sum|head -c16';
//         exec(cmd, function(error, stdout, stderr) {
//             ret =stdout;
//             cb(ret);
//         });
//     }else{
//         ret = new Date().getTime();
//         cb(ret);
//     }
//
// };
// getRandom(console.log);


//==================================================
// require('./utils.js').httpReq('api.weixin.qq.com/sns/oauth2/access_token',
//     function(result){
//         console.log('2222',result);
//         console.log('hahhaha');
//     });
//===================================================
// let WXBizDataCrypt = require('./WXBizDataCrypt');
//
// let appId = cf.oaCfXcx.appId;
// let sessionKey = 'tiihtNczf5v6AKRyjwEUhQ==';
// let encryptedData =
//     'CiyLU1Aw2KjvrjMdj8YKliAjtP4gsMZM'+
//     'QmRzooG2xrDcvSnxIMXFufNstNGTyaGS'+
//     '9uT5geRa0W4oTOb1WT7fJlAC+oNPdbB+'+
//     '3hVbJSRgv+4lGOETKUQz6OYStslQ142d'+
//     'NCuabNPGBzlooOmB231qMM85d2/fV6Ch'+
//     'evvXvQP8Hkue1poOFtnEtpyxVLW1zAo6'+
//     '/1Xx1COxFvrc2d7UL/lmHInNlxuacJXw'+
//     'u0fjpXfz/YqYzBIBzD6WUfTIF9GRHpOn'+
//     '/Hz7saL8xz+W//FRAUid1OksQaQx4CMs'+
//     '8LOddcQhULW4ucetDf96JcR3g0gfRK4P'+
//     'C7E/r7Z6xNrXd2UIeorGj5Ef7b1pJAYB'+
//     '6Y5anaHqZ9J6nKEBvB4DnNLIVWSgARns'+
//     '/8wR2SiRS7MNACwTyrGvt9ts8p12PKFd'+
//     'lqYTopNHR1Vf7XjfhQlVsAJdNiKdYmYV'+
//     'oKlaRv85IfVunYzO0IKXsyl7JCUjCpoG'+
//     '20f0a04COwfneQAGGwd5oa+T8yO5hzuy'+
//     'Db/XcxxmK01EpqOyuxINew==';
//
// let iv = 'r7BXXKkLb8qrSNn05n0qiA==';
//
// let pc = new WXBizDataCrypt(appId, sessionKey);
//
// let data = pc.decryptData(encryptedData , iv);
//
// console.log('解密后 data: ', data,typeof(data));
//==============================================================


// 解密后的数据为
//
// data = {
//   "nickName": "Band",
//   "gender": 1,
//   "language": "zh_CN",
//   "city": "Guangzhou",
//   "province": "Guangdong",
//   "country": "CN",
//   "avatarUrl": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
//   "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
//   "watermark": {
//     "timestamp": 1477314187,
//     "appid": "xxxxxxxx"
//   }
// }

// ut.httpsReq('www.sojson.com/open/api/weather/json.shtml?city=上海',
//     (result) => {
//         console.log(result);
//         let r = JSON.parse(result);
//     }
// );

let body = ''

// const https = require('https');
//
// const options = {
//     host: 'api.mch.weixin.qq.com',
//     port:'443',
//     path:'/pay/unifiedorder',
//     method: 'POST',
// };
//
// const req = https.request(options, (res) => {
//     console.log('statusCode:', res.statusCode);
//     console.log('headers:', res.headers);
//
//     res.on('data', (d) => {
//         process.stdout.write(d);
//     });
// });
//
// req.on('error', (e) => {
//     console.error(e);
// });
// req.end();


// let param = {'openid':'aasdfsdfsopenid','body':'body1223232'}
// let xml2js = require('xml2js');
// let bodyOfRqst = ['openid', 'body', 'total_fee', 'product_id', 'out_trade_no'];
// let bodyDataObj = {
//     'appid': 'aaa1',
//     'mch_id': 'aaa2',
//     'nonce_str': 'aaa3',
//     'notify_url': 'aaa4',
//     'spbill_create_ip': 'aaa5',
//     'trade_type': 'JSAPI'
// };
// bodyOfRqst.map((item, index, arr) => {
//     bodyDataObj[item] = param[item]
// });
// bodyDataObj['sign']=ut.paysignjsapi2(bodyDataObj);
// let  builder = new xml2js.Builder({'rootName':'xml','headless':true});
// let  xml = builder.buildObject(bodyDataObj);
// log.debug('xml builded:============================',xml);

console.log(ut.wxpayArray2Object({return_code: ['success'], return_msg: ['ok']}));


let jsonData = {'clfn': '孙倩', 'sex': '先生', 'uprice': '34', 'dura': '5', '*addr': '天山西路', 'osdt': 'aaab', 'ostm': 'bbb'};
let fields = ['clfn', 'sex', 'uprice', 'dura', '*addr', 'osdt', 'ostm'];
let words = '客户$0$1发布订单：$2元1小时，做$3小时，地点$4，上门时间$5 $6';
// function getSpeakSpec(fields,words) {
//     for(let i = 0;i<fields.length;i++){
//         let a = '$'+i;
//         //console.log(words);
//         words = words.replace(a,fields[i])
//     }
//
//     console.log(words);
// }

