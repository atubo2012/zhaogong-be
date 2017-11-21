'use strict';

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');

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
            ut.debug(rdata);
        }
        //查询
        else if ('GET' === req.method) {
            userInfo = JSON.parse(req.query.userInfo);
            ut.debug(userInfo);
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
                console.log('已记录访问日志：' + userInfo.nickName);
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
                ut.debug('地址信息查询操作....');
                coll.findOne(
                    {'nickName': userInfo.nickName},
                    function (err, r) {
                        t.equal(null, err);
                        ut.debug(r);
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
 * 用户访问首页时的检查
 *
 */
module.exports.chck = function (req, res, err) {

    let p = JSON.parse(req.query.userInfo);
    let MongoClient = require('mongodb').MongoClient;


    try {

        //1、记录访问日志
        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('accesslog');
            let t = require('assert');

            //生成日期、组合成访问日志
            let accessLog = {ct: new Date(), action: 'check'};
            Object.assign(accessLog, p);
            ut.info('记录访问日志......',accessLog);

            coll.insertOne(accessLog, function (err, r) {
                t.equal(null, err);
                t.equal(1, r.result.n);
                ut.info('记录访问日志完成');
            });
        });

        //2、判断用户是否为新用户
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let t = require('assert');
            let coll = db.collection('user');

            //todo：（1）与测试环境后台联调期间，要将用户的openid作为用户id保存到数据库，目前是根据用户的昵称保存。
            //todo：（2）findOneAndUpdate函数优化以下代码
            coll.find({"nickName": p.nickName}).toArray(function (err, docs) {

                //如user表中有记录，且角色字段不是空，则返回用户的信息，以便前端将界面切换到对应角色的。
                if (docs.length > 0 && docs[0].role !== '') {
                    //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                    res.send(JSON.stringify(docs[0]));
                    db.close();
                }
                else {
                    //无此用户则在user表中创建一条用户信息
                    MongoClient.connect(cf.dbUrl, function (err, db) {
                        let coll = db.collection('user');
                        let t = require('assert');

                        //创建用户角色时默认为''
                        Object.assign(p, {role: ''});
                        coll.updateOne({'nickName': p.nickName}, {$set: p}, {upsert: true, w: 1}, function (err, r) {
                            t.equal(null, err);
                            t.equal(1, r.result.n);
                            db.close();

                            //当前用户是新用户，给前端返回0，表示用户是新用户
                            res.send('0');
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
        console.log(err);
        db.close();
    }
};