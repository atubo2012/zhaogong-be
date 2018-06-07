'use strict';
let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let globalData = require('../globalData.js');
let log = ut.logger(__filename);

let iconv = require('iconv-lite');
let cryptoMO = require('crypto');
let xml2js = require('xml2js');

/**
 * 功能：微信支付统一下单处理
 *
 * 参考：
 * 1、微信支付总体流程：https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=7_4&index=3
 * 2、处理流程：
 *      （1）根据openId、订单号向微信支付服务器申请prepay_id
 *      （2）获得prepay_id后将收到的数据签名，将5+s(5个参数和签名)应答给小程序
 *      （3）小程序收到应答后，调用wx.requestPayment函数，用户支付成功后，MP为用户展现支付结果页面
 *      （4）支付成功后
 * 3、接口参数：https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_1&index=1
 *
 * @param req1
 * @param res1
 * @param err
 */
module.exports.pay = function (req1, res1, err) {
    let param = req1.query || req1.params;
    let openid = param.openid;
    log.debug('统一支付请求:', param);


    /**
     * 准备统一下单的参数
     */

        //例行字段
    let spbill_create_ip = req1.ip.replace(/::ffff:/, '');//'115.159.128.224';//'127.0.0.1'; // 获取客户端ip
    let notify_url = cf.wxPay.notify_url; // 支付成功的回调地址  可访问 不带参数
    let nonce_str = '';
    ut.getRandom((r) => {
        nonce_str = r;
    }); // 随机字符串
    let timestamp = Math.round(new Date().getTime() / 1000); // 当前时间


    //业务字段
    let body = param.body;           //商品描述，必须包含商家名称和销售商品的类目。如：腾讯-游戏
    let out_trade_no = param.out_trade_no;   //商户订单号，从body中截取订单号（req表的REQ开头的流水号）。TODO从前端获取
    let total_fee = param.total_fee;      //商户价格，从前端传入
    let attach = param.attach;
    let product_id = param.product_id;    //商品ID

    //组包
    let bodyData = '<xml>';
    bodyData += '<appid>' + cf.wxPay.appId + '</appid>';  // 小程序ID
    bodyData += '<body>' + body + '</body>'; // 商品描述
    bodyData += '<mch_id>' + cf.wxPay.Mch_id + '</mch_id>'; // 商户号
    bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
    bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
    bodyData += '<openid>' + openid + '</openid>'; // 用户标识
    bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
    bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
    bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
    bodyData += '<product_id>' + product_id + '</product_id>'; // 总金额 单位为分
    bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
    bodyData += '<attach>' + attach + '</attach>'; // 交易类型 小程序取值如下：JSAPI
    // 签名
    let sign = paysignjsapi(
        cf.wxPay.appId,//appid
        body,
        cf.wxPay.Mch_id,
        nonce_str,
        notify_url,
        openid,
        out_trade_no,
        spbill_create_ip,
        total_fee
    );
    bodyData += '<sign>' + sign + '</sign>';
    bodyData += '</xml>';

    try {
        const https = require('https');
        const options = {
            host: 'api.mch.weixin.qq.com',
            port: '443',
            path: '/pay/unifiedorder',
            method: 'POST',
            body: bodyData
        };

        const req2 = https.request(options, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            let chunks = [];
            res.on('data', function (data) {
                chunks.push(data);
            });

            res.on('end', function () {
                let decodedContent = iconv.decode(Buffer.concat(chunks), 'utf-8');
                console.log('统一下单应答=', decodedContent);
                let ret = {};

                if (res.statusCode === 200) {
                    xml2js.parseString(decodedContent, function (err, result) {
                        console.log('result=', result)
                        if (result.xml.return_code[0] === 'SUCCESS') {
                            ret.msg = '操作成功';
                            ret.status = '100';
                            ret.out_trade_no = out_trade_no;  // 商户订单号
                            // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
                            ret.nonceStr = result.xml.nonce_str[0];     // 随机字符串
                            ret.timestamp = timestamp.toString();       // 时间戳
                            ret.package = 'prepay_id=' + result.xml.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
                            ret.paySign = paysignjs(cf.wxPay.appId, ret.nonceStr, ret.package, 'MD5', timestamp); // 签名
                            res1.end(JSON.stringify(ret));
                        } else {
                            ret.msg = result.xml.return_msg[0];
                            ret.status = '102';
                            res1.end(JSON.stringify(ret));
                        }
                    });
                } else {
                    res1.end(JSON.stringify(ret));
                }
            });
        });

        req2.on('error', (e) => {
            console.error(e);
        });
        req2.write(bodyData);
        req2.end();
    } catch (e) {
        res1.send(e);
        console.error(e)
    }

};

function paysignjsapi(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee) {
    let ret = {
        appid: appid,
        body: body,
        mch_id: mch_id,
        nonce_str: nonce_str,
        notify_url: notify_url,
        openid: openid,
        out_trade_no: out_trade_no,
        spbill_create_ip: spbill_create_ip,
        total_fee: total_fee,
        trade_type: 'JSAPI'
    };

    let str = ut.obj2queryString(ret);
    console.log('paysign string', str);
    str = str + '&key=' + cf.wxPay.Mch_key;

    let md5Str = cryptoMO.createHash('md5').update(str).digest('hex');
    console.log('paysign md5Str', md5Str);

    md5Str = md5Str.toUpperCase();
    console.log('paysign up md5Str', md5Str);

    return md5Str;
}

/**
 * 微信支付回调函数，在调用成功后向业务服务器发送的请求
 * @param req1
 * @param res1
 * @param err
 */
module.exports.paycb = function (req1, res1, err) {
    log.info('微信支付回调:', req1.qurey, req1.params);
    //TODO此处应该将回到结果和时间戳更新到订单中，以便对账。
};

/**
 * 支付应答的简明验证
 * 官文参考：https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=4_3#
 * @param appid
 * @param nonceStr
 * @param pkg
 * @param signType
 * @param timeStamp
 * @returns {*}
 */
function paysignjs(appid, nonceStr, pkg, signType, timeStamp) {
    let ret = {
        appId: appid,
        nonceStr: nonceStr,
        package: pkg,
        signType: signType,
        timeStamp: timeStamp
    };
    let str = raw1(ret);
    str = str + '&key=' + cf.wxPay.Mch_key;
    return cryptoMO.createHash('md5').update(str).digest('hex');
}

/**
 * 将对象按照字母表顺序转换成查询字符串
 * @param args
 * @returns {string}
 */
function raw1(args) {
    let keys = Object.keys(args);
    keys = keys.sort()
    let newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });

    let str = '';
    for (let k in newArgs) {
        str += '&' + k + '=' + newArgs[k];
    }
    str = str.substr(1);
    return str;
}