'use strict';
/**
 * 功能：
 * 本文件作为所有常用utility类函数的主文件。
 * 小程序端用的utils函数，应该直接复制于本文件中的函数。
 *
 * 场景：
 * 本文件中的函数，被业务模块中使用，并在不同的应用中复用。
 *
 * 样例：
 * XXX模块中XXX功能
 *
 * 流程、算法：
 *
 * 测试：
 * 使用在ide中使用test.js测试。
 * 执行测试前取消测试代码前的//注释
 *
 *
 *
 * 规范：
 * 1、函数定义
 * 2、函数导出：exports
 * 3、函数的测试程序
 * 4、注释风格：
 *  (1)函数之间用/**分割，并两行
 *  (2)测试程序与函数定义之间用//分割
 *
 */


/**
 * 本文件中使用的全局性参数
 */
let cf = require('../beconfig.js');
let globalData = require('../globalData.js');


/**
 * 日志句柄。后端程序可以通过let log = ut.logger(__filename)的方式获得日志句柄。
 * 默认的日志级别为debug，投产后为info。
 * utils中公用函数的日志，使用trace级别。
 */
let log4js = require('log4js');
log4js.configure(cf.logConfig);
let logger = function (name) {
    return log4js.getLogger(name);
};
exports.logger = function (name) {
    return logger(name);
};
let l = logger('utils');    //本程序中使用的log句柄，供本文件中的函数使用。
//
// l.debug('log测试');
//


/**
 * 会话有效期检查函数。
 * 当前端在每次向后端发起请求时，后端要校验session3rd是否超时，如未超时则更新ut属性，如超时则从globalData中删除该会话id对应的session记录
 * 检查是否存在session状态，并更新session的时间
 * @param session3rdKey 会话id，由后端程序生成、前端程序登录后保存在客户端本地。
 */
let checkSession = function (session3rdKey) {

    let ret = null;
    let now = new Date().getTime();
    let s = globalData.session[session3rdKey];
    l.trace('checkSession', globalData);

    if (s) {
        let then = new Date(s.ut).getTime();
        l.trace(session3rdKey + '对应的会话存在', 'now', now, 'then', then, '时间差', (now - then) / 1000 + '秒');

        if ((now - then) / 1000 >= cf.SESSION_EXPIRED) {
            l.trace('因会话超时，将删除该session!');
            delete globalData.session[session3rdKey];
            //l.trace('删除后的session:',globalData);
            ret = false;
        } else {
            l.trace('会话未超时，将刷新会话内的时间!');
            globalData.session[session3rdKey].ut = new Date(now).toLocaleString();
            //l.trace('更新后的session:',globalData);
            ret = true;
        }
    } else {
        ret = false;
    }

    //遍历所有的会话，清理超时会话
    let sessions = globalData.session;
    for (let key in sessions) {
        let then = new Date(sessions[key].ut).getTime();
        if ((now - then) / 1000 >= cf.SESSION_EXPIRED) {
            //l.trace('因会话超时，将删除'+key+'对应的session!');
            delete sessions[key];
            //l.trace('删除后的globalData.session',globalData.session);
        }
    }
    return ret;
};
exports.checkSession = function (session3rdKey) {
    return checkSession(session3rdKey);
};


/**
 * 生成随机数的，windows环境下，生成date.gettime的数字；linux下根据设备文件生成
 * @param cb
 */
let getRandom = function (cb) {
    let random = null;
    let cmd = null;
    let exec = require('child_process').exec;
    let os = require('os');

    l.trace('生成随机数的OS类别:', os.type());

    if (os.type() === 'Linux') {
        cmd = 'head -n1 /dev/urandom|md5sum|head -c16';
        exec(cmd, function (error, stdout, stderr) {
            random = stdout;
            cb(random);
        });
    } else {
        random = new Date().getTime().toString();
        cb(random);
    }
};
exports.getRandom = function (cb) {
    return getRandom(cb);
};
// getRandom(function(random){
//     l.info('生成随机数',random);
// });


/**
 * 以http或https方式发起get请求，应答结果由回调函数处理
 * @param httpType http或https
 * @param url 请求链接，https:// 之后的内容
 * @param cb 回调函数
 */
let httpxReq = function (httpType, url, cb) {
    let https = require(httpType);
    let iconv = require("iconv-lite");

    //l.trace('url:',url);
    let _url = httpType + '://' + url;
    //api.weixin.qq.com/sns/oauth2/access_token?appid="+cf.appId+"&secret="+cf.secret+"&code="+req.query.code+"&grant_type=authorization_code";


    https.get(_url, function (res) {
        let datas = [];
        let size = 0;

        res.on('data', function (data) {
            datas.push(data);
            size += data.length;
            //process.stdout.write(data);
        });
        res.on("end", function () {
            let buff = Buffer.concat(datas, size);
            let result = iconv.decode(buff, "utf8");//转码//let result = buff.toString();//不需要转编码,直接tostring
            //l.trace(result);
            cb(result);
        });
    }).on("error", function (err) {
        l.error(err, 'hahah');
    });
};
exports.httpReq = function (url, cb) {
    return httpxReq('http', url, cb)
};
exports.httpsReq = function (url, cb) {
    return httpxReq('https', url, cb)
};

/**
 * 发送http请求
 * @param httpType
 * @param options ：{host: 'www.baidu.com', path: '/', port: '443', method: 'GET'}
 * @param sendData
 * @param encode
 * @param cb
 */
let httpRequest = function (httpType, options, sendData, cb, encode) {
    let http = require(httpType);
    let iconv = require("iconv-lite");
    const req1 = http.request(options, (res) => {
        let size = 0;

        l.trace(`STATUS: ${res.statusCode}`);
        l.trace(`HEADERS: ${JSON.stringify(res.headers)}`);

        let ret = [];
        res.on('data', (chunk) => {
            ret.push(chunk);
            size += chunk.length;
            l.trace(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            let buff = Buffer.concat(ret, size);
            let result = iconv.decode(buff, encode ? encode : 'utf8');
            l.trace('result:', result);
            cb(result);
        });
    });
    req1.on('error', (e) => {
        l.error(`httpRequest:problem with request: ${e}`);
    });
    req1.on('uncaughtException', (e) => {
        l.error(`httpRequest: uncaughtException: ${e}`);
    });
    req1.end(sendData);
};
// httpRequest('https',{host:'www.baidu.com' ,path:'/','port':'443',method:'GET'},'',(result)=>{
//     l.info('httpRequesttest',result);
// });

exports.httpRequest = function (httpType, options, sendData, cb) {
    return httpRequest(httpType, options, sendData, cb);
};

/**
 * 刷新AccessToken
 */
exports.refreshAT = function () {
    this.httpRequest('https', {
        host: 'api.weixin.qq.com',
        path: '/cgi-bin/token?grant_type=client_credential&appid=' + cf.appId + '&secret=' + cf.secret,
        port: '443',
        method: 'GET',
    }, '', (result) => {
        globalData['access_token'] = JSON.parse(result).access_token;
        l.info('access_token is updated:' + globalData.access_token);
    })
};


let fmd = function (date, style) {
    let y = date.getFullYear();
    let M = "0" + (date.getMonth() + 1);
    M = M.substring(M.length - 2);
    let d = "0" + date.getDate();
    d = d.substring(d.length - 2);
    let h = "0" + date.getHours();
    h = h.substring(h.length - 2);
    let m = "0" + date.getMinutes();
    m = m.substring(m.length - 2);
    let s = "0" + date.getSeconds();
    s = s.substring(s.length - 2);
    return style.replace('yyyy', y).replace('MM', M).replace('dd', d).replace('hh', h).replace('mm', m).replace('ss', s);
};


let log = function (level, levelDesc, args) {
    if (logLevel.LEVEL <= level) {
        let now = fmd(new Date(), 'hhmmss');

        //l.trace(now + '-['+levelDesc+']:========================================================');
        for (let i = 0; i < args.length; i++) {
            //若配置为前端使用的日志，则直接打印对象，便于查看。若配置为后端使用的日志，则将内容格式化后输出
            if ('front' === logLevel.TYPE) {
                l.trace(args[i]);
            } else if ('backend' === logLevel.TYPE) {
                l.trace(JSON.stringify(args[i], null, '\t'));
            }
        }
        l.trace(now + '-[' + levelDesc + ']:==========================================================');
    }
};
let logLevel = {    //日志界别
    FATAL: 5,
    ERROR: 4,
    WARN: 3,
    INFO: 2,
    DEBUG: 1,
    LEVEL: 1, //生产环境中需要排查问题时，可以将LEVEL调低到1，正常生产情况下LEVEL应为3或2
    TYPE: 'backend' //front表示前端日志，直接输出对象；backend表示服务端日志，需要将对象转成字符串
};
exports.error = function (desc, obj) {
    log(logLevel.ERROR, 'error', arguments);
};
exports.warn = function (desc, obj) {
    log(logLevel.WARN, ' warn', arguments);
};
exports.info = function (desc, obj) {
    log(logLevel.INFO, ' info', arguments);
};
exports.debug = function () {
    log(logLevel.DEBUG, 'debug', arguments);
};


/**
 * 根据时间戳生成ID序号。适合并发量较小的应用使用。
 * 针对并发量较大的场景，可以考虑使用数据库的自增字段获得ID。
 * @param idPrefix  业务实体的前缀，建议用四位字母。如需求单可以使用RQST
 */
exports.getId = function (idPrefix) {
    return getId(idPrefix)
};
let getId = function (idPrefix) {
    let ts = (new Date().getTime()).toFixed(0) + '-' + randomString('4');
    return idPrefix + ts;
};

// let id = getId('A');
// l.trace(id);


/**
 * request请求日志。在后端程序的入口服务中，先调用该程序。
 * @param req
 * @param res
 * @param err
 */
// exports.reqLog = function (req, res, err) {
//     return reqLog(req, res, err)
// };
// let reqLog = function (req, res, err) {
//     l.trace(getCc('S'));
//     l.trace('req.url:');
//     l.trace(req.url);
//     l.trace('req.query:');
//     l.trace(req.query);
//     l.trace(getCc('-'));
//     l.trace('req.body:');
//     l.trace(req.body);
//     l.trace(getCc('E'));
// };

/**
 * 在右方补齐空格
 * @param str
 * @returns {string}
 */
let getRf = function (str) {
    let ret = str;
    let ROWLENGTH = 100;
    if (str.length < ROWLENGTH) {
        for (let i = 0; i < (ROWLENGTH - str.length); i++) {
            ret = ret.concat(' ');
        }
    }
    return '[' + ret + ']';
};
// l.trace(getRf('abc'));


/**
 * 在左方补齐空格
 * @param str
 * @returns {string}
 */
let getLf = function (str) {
    let ret = str;
    let ROWLENGTH = 100;
    if (str.length < ROWLENGTH) {
        for (let i = 0; i < (ROWLENGTH - str.length); i++) {
            ret = ' '.concat(ret);
        }
    }
    return '[' + ret + ']';
};
// l.trace(getLf('abc'));


/**
 * 在一行中打印一定长度的指定字符串。
 * 主要应用在日志输出程序中，便于查看。
 * @param str 字符内容
 * @returns {*}
 */
let getCc = function (str) {
    let ret = '';
    let ROWLENGTH = 100;
    for (let i = 0; i < ROWLENGTH; i++) {
        ret = ret.concat(str);
    }
    return ret;
};
// l.trace(getCc('-'));


/**
 * 将对象格式化成字符
 * @param obj
 */
let prtObj = function (obj) {

    let str = getCc('S') + '\n';
    if (typeof(obj) === 'object') {

        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = obj[key];

            if (typeof(value) === 'object') {
                str = str.concat(key, ':', JSON.stringify(value));
            } else {
                str = str.concat(key, ':', value, '\n');
            }
        }
    }

    return str + '\n' + getCc('E');
};
// l.trace(prtObj({'a1':'b1','a2':'b2','a3':[{'c1':'c2'},{'d1':'d2'}]}));


/**
 * 手机号是否合法
 * @param str
 * @returns {boolean}
 */
let isPoneAvailable = function (str) {
    let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;   //另一个校验规则：/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/
    return myreg.test(str)
};
exports.isPoneAvailable = function (str) {
    return isPoneAvailable(str);
};
// l.info('手机号码测试',isPoneAvailable('13386222037'));


/**
 * 腾讯云短信发送服务
 */

/**
 * 短信发送函数
 * @param tpltId        短信模板ID，//短信模板的“ID”字段值，参考https://console.cloud.tencent.com/sms/smsContent/1400055205/0/10
 * @param phoneNumbers  接收短信的号码（文本数组），如：["17701826978", "18616257890"]
 * @param params        短信内容占位符（文本数组），如：["验证码002033", "有效期"]，params的元素个数，应与模板中的占位符数量相同，不能多也不能少。
 */
let sendSms = function (tpltId, phoneNumbers, params) {
    let QcloudSms = require("qcloudsms_js");
    let appid = cf.oaCfQQSms.appid;
    let appkey = cf.oaCfQQSms.appkey;

    let qcloudsms = QcloudSms(appid, appkey);

    //用来演示的回调函数
    function callback(err, res, resData) {
        if (err)
            l.error("短信发送错误: ", err);
        else
            l.trace("短信发送应答: ", resData);
    }

    //多条发送的demo
    let msender = qcloudsms.SmsMultiSender();   //多条发送的对象
    msender.sendWithParam("86", phoneNumbers, tpltId, params, "", "", "", callback);
};
exports.sendSms = function (tpltId, phoneNumbers, params) {
    return sendSms(tpltId, phoneNumbers, params);
};
//sendSms(88752,['17701826978'],['1234','60']);


let randomString = function (len) {
    len = len || 32;    //这个默认复制的方式很帅
    let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd.toUpperCase();
};
exports.randomString = function (len) {
    return randomString(len);
};
//console.log(randomString(4));

/**
 * 向指定的ws服务器发送event事件。此函数因为没有关闭，所以会保持连接，仅作为验证，尚未在zg应用中使用
 * 技术参考：https://socket.io/docs/client-api/#socket-emit-eventname-args-ack
 * @param url
 * @param message 消息内容
 */
let socketSend = function (url, message) {
    let socket = require('socket.io-client')(url);
    l.trace('send message');
    socket.emit('event', message);

};
exports.socketSend = function (url, message) {
    return socketSend(url, message);
};
//socketSend('http://localhost:3000','this is from utils');


/**
 * 功能：触发一个事件，由监听器对事件进行处理
 * 算法：
 * 1、应用、系统相关的状态、活动在埋点处发出事件，由事件处理函数对外进行通知
 * 2、www启动时，安装时间生成器emt，emt在utils中被引用，进而可被各个业务模块使用
 * 场景：
 * 1、业务流程中的埋点，关键场景，如上单、开工、完工等。在db.close()方法后、res.send()前调用。
 * 2、系统异常时的埋点。在catch中调用
 * @param argsObject ：形如{data:p,type:'N_UIFUPD'}的参数
 */
exports.notify = function (argsObject) {
    global.emt.emit('notify', argsObject);
};


/**
 * 功能：将对象转换成“查询字符串”，查询参数按照字母表排序
 *
 * 场景：对拟支付订单的信息进行签名。
 *
 * @param args         订单数据
 * @returns {string}   查询字符串
 */
exports.obj2queryString = function (args) {
    return obj2queryString(args);
};

let obj2queryString = function (args) {
    let keys = Object.keys(args);
    keys = keys.sort();
    let newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    let str = '';
    for (let k in newArgs) {
        str += '&' + k + '=' + newArgs[k];
    }
    str = str.substr(1);

    l.trace('对象->String:', str);
    return str;
};

exports.paysignjsapi2 = function paysignjsapi2(payApplyInfo) {

    let str = obj2queryString(payApplyInfo);
    str = str + '&key=' + cf.wxPay.Mch_key;
    l.trace('paysign2 string', str);

    let md5Str = require('crypto').createHash('md5').update(str).digest('hex');
    l.trace('paysign2 md5Str', md5Str);

    md5Str = md5Str.toUpperCase();
    l.trace('paysign2 up md5Str', md5Str);

    return md5Str;
};

exports.wxpayArray2Object = function wxpayArray2Object(wxpayArray) {

    let ret = {};
    let keys = Object.keys(wxpayArray);
    keys = keys.sort();
    keys.forEach(function (key) {
        ret[key.toLowerCase()] = wxpayArray[key][0];
    });
    return ret;
};

/**
 * 功能：将形如$0,$1的占位符，替换成话术
 * 场景：向用户发送通知类信息时
 * @param jsonData JSON格式的数据
 * @param fields 话术中包含的数据字段(数组)，按照先后顺序
 * @param words  话术模板
 * @returns {*}
 */
exports.getSpeakSpec = function (jsonData, fields, words) {
    let ret = words;
    for (let i = 0; i < fields.length; i++) {
        let a = '$' + i;
        let item = fields[i];

        //若列名中有星号，则对内容中的数字进行脱敏处理。
        if (item.indexOf('*') >= 0) {
            item = item.replace('*', '');
            ret = ret.replace(a, jsonData[item].replace(/[\d]/g, '*'));
        } else {
            ret = ret.replace(a, jsonData[item]);
        }

    }
    return ret;
};