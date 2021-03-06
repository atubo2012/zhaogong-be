'use strict';

/**
 * TODO：在后端程序中，将以下三个变量补全，并规范日志。
 */
let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let log = ut.logger(__filename);

module.exports.edit = function (req, res, err) {

    //前后台之间用rdata作为参数名，rdata意为remote data，即远程数据。
    let p = JSON.parse(req.query.rdata);

    log.debug(req, res, err);
    try {


        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('lbor');
            let t = require('assert');

            coll.updateOne({'userInfo.openId': p.userInfo.openId}, p, {upsert: true, w: 1}, function (err, r) {
                t.equal(null, err);
                t.equal(1, r.result.n);
                db.close();

                ut.notify({data: p.userInfo, type: 'N_UIDUPD'});
                res.send('ok');
            });

        });

    } catch (err) {
        res.send('error:'+err.message);
        log.error('edit',err);
    }
};

module.exports.detl = function (req, res, err) {

    let p = JSON.parse(req.query.userInfo);
    log.debug(JSON.stringify(p));

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('lbor');

            coll.find({"userInfo.openId": p.openId}).toArray(function (err, docs) {

                if(docs.length>0)
                {
                    //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                    res.send(JSON.stringify(docs[0]));
                }
                else{
                    res.send('0');
                }
                db.close();
            });
        });
    } catch (err) {
        log.error('detl' + err);
    }
};

module.exports.list = function (req, res, err) {

    try {
        let p = req.query || req.params;
        log.debug(p, typeof(p), typeof(p.query));
        let cond = JSON.parse(p.cond);


        ut.info('查询条件cond:', cond);
        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('rqst');

            coll.find(cond.query).sort({'updt': -1}).skip(cond.skip).limit(cond.limit).toArray(function (err, docs) {
                log.debug(docs);
                res.send(JSON.stringify(docs)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                db.close();
            });
        });

    } catch (err) {
        log.error(err);
    }
};

module.exports.remove = function (req, res, err) {
    res.send('ok');
};

