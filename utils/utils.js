'use strict';

let fmd = function(date, style) {
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

//日志级别
let logLevel = {
    FATAL:5,
    ERROR:4,
    WARN:3,
    INFO:2,
    DEBUG:1,
    LEVEL:1, //生产环境中需要排查问题时，可以将LEVEL调低到1，正常生产情况下LEVEL应为3或2
    TYPE:'backend' //front表示前端日志，直接输出对象；backend表示服务端日志，需要将对象转成字符串
};
exports.error = function (desc, obj) {
    log(logLevel.ERROR,'error',arguments);
};
exports.warn = function (desc, obj) {
    log(logLevel.WARN,' warn',arguments);
};
exports.info = function (desc, obj) {
    log(logLevel.INFO,' info',arguments);
};
exports.debug = function () {
    log(logLevel.DEBUG,'debug',arguments);
};

let log = function(level,levelDesc,args) {
    if (logLevel.LEVEL <= level) {
        let now = fmd(new Date(), 'hhmmss');

        console.log(now + '-['+levelDesc+']:========================================================');
        for (let i = 0; i < args.length; i++) {
            //若配置为前端使用的日志，则直接打印对象，便于查看。若配置为后端使用的日志，则将内容格式化后输出
            if('front'===logLevel.TYPE){
                console.log(args[i]);
            }else if('backend'===logLevel.TYPE){
                console.log(JSON.stringify(args[i],null,'\t'));
            }
        }
        console.log(now + '-['+levelDesc+']:^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    }
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
    let ts = (new Date().getTime()).toFixed(0);
    return idPrefix + ts;
};


/**
 * request请求日志。在后端程序的入口服务中，先调用该程序。
 * @param req
 * @param res
 * @param err
 */
exports.reqLog = function (req, res, err) {
    return reqLog(req, res, err)
};
let reqLog = function (req, res, err) {
    console.log(getCc('S'));
    console.log('req.url:');
    console.log(req.url);
    console.log('req.query:');
    console.log(req.query);
    console.log(getCc('-'));
    console.log('req.body:');
    console.log(req.body);
    console.log(getCc('E'));
};

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


/**
 * 自测代码
 */
// let id = getId('A');
// console.log(id);
//
//  console.log(getLf('abc'));
//  console.log(getRf('abc'));
// console.log(getCc('-'));
//
// console.log(prtObj({'a1':'b1','a2':'b2','a3':[{'c1':'c2'},{'d1':'d2'}]}));

