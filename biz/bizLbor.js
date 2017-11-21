'use strict';
let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');

module.exports.edit = function (req, res, err) {

    //前后台之间用rdata作为参数名，rdata意为remote data，即远程数据。
    let p = JSON.parse(req.query.rdata);


    try {
        ut.debug(p);

        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('lbor');
            let t = require('assert');

            coll.updateOne({'userInfo.nickName': p.userInfo.nickName}, p, {upsert: true, w: 1}, function (err, r) {
                t.equal(null, err);
                t.equal(1, r.result.n);
                db.close();
                res.send('ok');
            });

        });

    } catch (err) {
        res.send('error:'+err.message);
        console.log('================' + err.message);
    }
};

module.exports.detl = function (req, res, err) {

    let p = JSON.parse(req.query.userInfo);
    console.log(JSON.stringify(p));

    let resMsg = '应答信息：';

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('lbor');

            coll.find({"userInfo.nickName": p.nickName}).toArray(function (err, docs) {

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
        console.log('================' + err.message);
    }
};

module.exports.list = function (req, res, err) {

};

module.exports.remove = function (req, res, err) {
    res.send('ok');
};

