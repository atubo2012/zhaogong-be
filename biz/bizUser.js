'use strict';

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let globalData = require('../globalData.js');
let log = ut.logger(__filename);


/**
 * 短信认证码生成
 * @param req
 * @param res
 * @param err
 */
module.exports.mbsc = function (req, res, err) {

    //前后台之间用rdata作为参数名，rdata意为remote data，即远程数据。
    let p = JSON.parse(req.query.rdata);
    log.debug('将更新的用户信息', p);

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('user');
            let t = require('assert');

            coll.updateOne(
                {'openId': p.openId},
                {
                    $set: p,                        //将被更新的业务数据
                    $currentDate: {'updt': true}    //更新时间字段
                },
                {upsert: true, w: 1}, function (err, r) {
                    t.equal(null, err);
                    t.equal(1, r.result.n);
                    db.close();
                    res.send('ok');
                });

        });

    } catch (err) {
        res.send('error:' + err.message);
        console.log('================' + err.message);
    }
};


/**
 * 手机号唯一性检查
 * @param req
 * @param res
 * @param err
 */
module.exports.mbck = function (req, res, err) {

    //前后台之间用rdata作为参数名，rdata意为remote data，即远程数据。
    let p = JSON.parse(req.query.rdata);
    log.debug('手机号唯一性检查', p);
    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('user');
            let t = require('assert');

            coll.find({
                $and: [{'mobile': p.mobile}, {'openId': {$ne: p.openId}}]
            }).toArray(function (err, docs) {
                log.debug('openId=' + p.openId + '的记录为', docs);

                //如user表中已有记录，说明手机号已被占用。
                if (docs.length > 0) {
                    res.send(JSON.stringify({msg:'该手机号已被占用，请使用其他手机号。',code:'1'}));
                } else {
                    //手机号如未被占用，则调用第三方api，给手机号发送短信验证码。
                    ut.sendSms(88752,[''+p.mobile+''],['【'+p.smsCode+'】','【'+60+'】']);
                    res.send(JSON.stringify({msg:'请注意查收短信验证码！',code:'0'}));
                }
                db.close();
            });
        })
    } catch (err) {
        res.send('error:' + err.message);
        log.error(err);
    }
};

/**
 * 用户信息修改
 * @param req
 * @param res
 * @param err
 */
module.exports.edit = function (req, res, err) {

    //前后台之间用rdata作为参数名，rdata意为remote data，即远程数据。
    let p = JSON.parse(req.query.rdata);

    log.debug('将更新的用户信息', p);
    try {


        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('user');
            let t = require('assert');

            coll.updateOne(
                {'openId': p.openId},
                {
                    $set: p,                        //将被更新的业务数据
                    $currentDate: {'updt': true}    //更新时间字段
                },
                {upsert: true, w: 1}, function (err, r) {
                    t.equal(null, err);
                    t.equal(1, r.result.n);
                    db.close();
                    res.send('ok');
                });

        });

    } catch (err) {
        res.send('error:' + err.message);
        console.log('================' + err.message);
    }
};

/**
 * 用户常用地址修改
 * @param req
 * @param res
 * @param err
 */
module.exports.addrEdit2 = function (req, res, err) {
    try {

        ut.reqLog(req, res, err);


        let userInfo; //用户信息
        let rdata;//业务信息


        //创建、更新
        if ('POST' === req.method) {
            rdata = req.body.rdata;
            log.debug('rdata=', rdata);
        }

        let p = rdata;

        log.debug('p.addrId=' + p.addrId);


        //如果请求中没有addrId，则说明是新增请求，则生成Id
        if (typeof(p.addrId) === 'undefined') {
            p['addrId'] = ut.getId('ADDR');
            log.debug('生成addrId=' + p['addrId']);
        }

        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('addr');
            let t = require('assert');

            coll.updateOne(
                {'addrId': p.addrId},
                {
                    $set: p,  //业务数据
                    $currentDate: {'updt': true} //更新时间字段
                },
                {
                    upsert: true,
                    w: 1
                }, function (err, r) {
                    t.equal(null, err);
                    log.debug(JSON.stringify(r));
                    db.close();
                    res.send('ok');
                });
        });
    } catch (err) {
        log.error(err);
    }


};
module.exports.addrList = function (req, res, err) {

    try {

        let p = req.query;
        let cond = JSON.parse(p.cond);
        Object.assign(cond.query, {'rdst': '1'});

        log.debug(req.query);


        ut.info('查询条件cond:', cond);
        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('addr');

            coll.find(cond.query).sort({'updt': -1}).skip(cond.skip).limit(cond.limit).toArray(function (err, docs) {
                res.send(JSON.stringify(docs)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                db.close();
            });
        });

    } catch (err) {
        log.error(err);
    }

};

/**
 * 用户联系地址管理
 * @param req
 * @param res
 * @param err
 */
module.exports.addrsEdit = function (req, res, err) {
    try {

        ut.reqLog(req, res, err);


        let userInfo; //用户信息
        let rdata;//业务信息


        //创建、更新
        if ('POST' === req.method) {
            userInfo = req.body.userInfo;
            rdata = req.body.rdata;
            log.debug(rdata);
        }
        //查询
        else if ('GET' === req.method) {
            userInfo = JSON.parse(req.query.userInfo);
            log.debug(userInfo);
        }


        let MongoClient = require('mongodb').MongoClient;

        //1、记录行为日志
        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('accesslog');
            let t = require('assert');

            //生成日期、组合成访问日志
            let accessLog = {ct: new Date(), action: 'addrsEdit'};
            Object.assign(accessLog, userInfo, rdata);
            //console.log(JSON.stringify(accessLog));

            coll.insertOne(accessLog, function (err, r) {
                t.equal(null, err);
                t.equal(1, r.result.n);
                log.debug('已记录访问日志：' + userInfo.nickName);
                db.close();
            });
        });

        //2、判断用户是否为新用户
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let t = require('assert');
            let coll = db.collection('user');

            //创建、更新
            if ('POST' === req.method) {
                coll.updateOne({'nickName': userInfo.nickName}, {$set: {'addrs': rdata}}, {
                    upsert: true,
                    w: 1
                }, function (err, r) {
                    t.equal(null, err);
                    t.equal(1, r.result.n);
                    db.close();
                    res.send('ok');
                });
            }
            //查询
            else if ('GET' === req.method) {
                log.debug('地址信息查询操作....');
                coll.findOne(
                    {'nickName': userInfo.nickName},
                    function (err, r) {
                        t.equal(null, err);
                        log.debug(r);
                        db.close();
                        res.send(JSON.stringify(r.addrs));
                    });
            }

        });
    } catch (err) {
        ut.error(err);
        db.close();
    }
};

/**
 * 根据code获取session_key，并生成3rd_session
 * @param req
 * @param res2
 * @param err
 */
module.exports.login2 = function (req, res2, err) {

    let https = require("https");
    let iconv = require("iconv-lite");

    //参数获取
    log.debug('login2收到请求参数', req.query);

    let url = cf.OA_URL_WX_CODE2SESSION +
        '?appid=' + cf.appId +
        '&secret=' + cf.secret +
        '&js_code=' + req.query.code +
        '&grant_type=authorization_code';


    //调用微信服务获得
    ut.httpsReq(url, function (result) {
        let r = JSON.parse(result);
        log.debug('oa:api.weixin.qq.com/sns/jscode2session:', r);

        //参数准备
        let session_key = r.session_key;
        let iv = req.query.iv;
        let encryptedData = req.query.encryptedData;

        //业务处理1：解密，获得openid等敏感信息的明文
        let WXBizDataCrypt = require('../utils/WXBizDataCrypt');
        let pc = new WXBizDataCrypt(cf.appId, session_key);
        let data = pc.decryptData(encryptedData, iv);
        log.debug('解密后 data: ', data, typeof(data));


        //业务处理2：生成session3rd
        ut.getRandom(function (random) {
            let now = new Date().toLocaleString();
            //log.debug('生成的随机数值：',random);
            //将生成的session信息保存在后端，并应答给前端
            let session3rdKey = random;
            globalData.session[session3rdKey] = {
                's': session_key + ']][[' + data.openId,
                'ct': now,
                'openId': data.openId,
                'ut': now
            };
            log.debug('生成' + session3rdKey + '后:', globalData.session);

            //每次生成新会话后，联动清理一次超时会话，避免后端内存消耗过大。
            ut.checkSession(session3rdKey);

            //应答前端
            res2.send({'session3rdKey': session3rdKey, 'ct': now, 'openId': data.openId});//TODO:好好复习，居然可以给前端发送对象
        });

    });

};
/**
 * 用户访问首页时的处理：
 * 1、记录访问日志
 * 2、检查用户是否为新用户。新用户则在user表中创建一条记录，老用户则返回用户的角色(TODO：手机号等相关信息)给前端。
 */
module.exports.chck = function (req, res, err) {


    let p = JSON.parse(req.query.userInfo);
    log.debug('校验用户是否为新用户,收到参数', p);
    let MongoClient = require('mongodb').MongoClient;


    try {

        //1、记录访问日志
        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('accesslog');
            let t = require('assert');

            //生成日期、组合成访问日志
            let accessLog = {ct: new Date(), action: 'check'};
            Object.assign(accessLog, p);

            coll.insertOne(accessLog, function (err, r) {
                t.equal(null, err);
                t.equal(1, r.result.n);
            });
        });




        //2、判断用户是否为新用户
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let t = require('assert');
            let coll = db.collection('user');


            coll.find({"openId": p.openId}, {_id: 0}).toArray(function (err, docs) {

                log.debug('openId=' + p.openId + '的记录为', docs);

                //如user表中有记录，且角色字段不是空，则返回用户的信息，以便前端将界面切换到对应角色的。
                if (docs.length > 0 /**&& docs[0].role !== ''**/) {
                    //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                    res.send(JSON.stringify(docs[0]));
                    db.close();
                } else {
                    //如user表中无此用户，则在user表中创建一条信息
                    MongoClient.connect(cf.dbUrl, function (err, db) {
                        let coll = db.collection('user');
                        let t = require('assert');

                        //将手机号、role等信息设置为空，表明用户尚未注册，此处的注册表示未对手机号绑定，未确定角色。
                        Object.assign(p, {role: ''}, {mobile: ''}, {headImage: p.avatarUrl}, {sign: ''});

                        coll.updateOne(
                            {'openId': p.openId},                   //filter
                            {$set: p, $currentDate: {'updt': true}}, //update
                            {upsert: true, w: 1},                   //option
                            function (err, r) {                     //callback
                                log.debug('新增的用户信息', r.result.upserted);
                                t.equal(null, err);
                                t.equal(1, r.result.n);
                                db.close();

                                //当前用户是新用户，给前端返回0，表示用户是新用户
                                //res.send('0');
                                res.send(JSON.stringify(p));
                            });

                    });
                }

            });

            //update返回一个数组，findOneAndUpdate返回一条记录。
            // coll.findOneAndUpdate(
            //     {"nickName": p.nickName},
            //     p,
            //     {upsert: true, w: 1},
            //     function (err, r) {
            //         t.equal(null, err);
            //         t.equal(1, r.lastErrorObject.n);
            //
            //         console.log(r);
            //         db.close();
            //
            //         if (r.length > 0 && r[0].role !== '') {
            //             //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
            //             res.send(JSON.stringify(r[0]));
            //         } else {
            //             res.send('0');
            //         }
            // });
        });
    } catch (err) {
        log.error(err);
        db.close();
    }
};


/**
 * 学习express时的练习函数
 * @param req
 * @param res
 * @param err
 */
module.exports.insert = function (req, res, err) {
    res.send('ok');
};

module.exports.findAll = function (req, res, err) {
    res.render('index', {title: 'findAll', Id: 'findall'});
};


module.exports.detail = function (req, res, err) {
    res.render('index', {title: 'Detail', Id: req.params.Id});
};

module.exports.remove = function (req, res, err) {
    res.send('ok');
};