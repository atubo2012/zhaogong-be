'use strict';

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');

module.exports.edit = function (req, res, err) {

    let p = JSON.parse(req.query.rdata);
    /**
     * CRUD的操作类别根据前端发送请求前的参数设置
     * C：p中没有reqID，后端需要生成reqID，并补充到p的参数中。记录状态前端页面加载时设置为默认值(rdst)
     * R：调用后端的xxxlist方法
     * U：p中包括reqID和所有的业务字段，直接将p作为更新字段列表执行updateOne
     * D：p中仅包括reqID和rdst=0，直接将p作为更新字段列表执行updateOne
     */

    console.log('请求参数:'+JSON.stringify(p));


    //如果请求中没有reqId，则说明是新增请求，则生成reqId
    if (p.reqId === '') {
        //p['reqId'] = (new Date().getTime()).toFixed(0);
        p['reqId'] = ut.getId('REQ');
        console.log('生成reqId=' + p['reqId']);
    }

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('rqst');
            let t = require('assert');

            coll.updateOne(
                {'reqId': p.reqId},
                {
                    $set: p,  //业务数据
                    $currentDate: {'updt': true} //更新时间字段
                },
                {
                    upsert: true,
                    w: 1
                }, function (err, r) {
                    t.equal(null, err);
                    console.log(JSON.stringify(r));
                    db.close();
                    res.send('ok');
                });
        });


    } catch (err) {
        console.log(err);
    }

};


module.exports.list = function (req, res, err) {

    let p = req.query;

    console.log(req.query);

    try {

        //查询条件，默认是全量查询
        let cond = {};

        //如果请求中有userInfo，则按照userInfo查询
        if (typeof(p.reqId) !== 'undefined') {
            console.log('按照reqId查询：' + p.reqId);
            cond['reqId'] = p.reqId;
        }

        //如果请求中有userInfo，则按照userInfo查询
        // if (typeof(p.nickName) !== 'undefined') {
        //
        //     console.log('按照用户查询：' + p.nickName);
        //     cond['userInfo.nickName'] = p.nickName;
        //
        // }

        console.log('查询条件cond:' + JSON.stringify(cond));
        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('rqst');

            coll.find(cond).toArray(function (err, docs) {
                res.send(JSON.stringify(docs)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                db.close();
            });
        });

    } catch (err) {
        console.log(err);
    }

};


module.exports.remove = function (req, res, err) {
    let p = JSON.parse(req.query.rdata);
    p['recordStatus']='0';

    console.log('将要删除：' + JSON.stringify(p));

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {
            console.log("Connection successfully to server");

            let coll = db.collection('rqst');
            let t = require('assert');

            coll.updateOne(
                {'reqId': p.reqId},
                {
                    $set: p,  //业务数据
                    $currentDate: {'updt': true} //更新时间字段
                },
                {
                    upsert: true,
                    w: 1
                }, function (err, r) {
                    t.equal(null, err);
                    console.log(JSON.stringify(r));
                    db.close();
                    res.send('ok');
                });
        });


    } catch (err) {
        console.log(err);
    }
};

module.exports.update = function (req, res, err) {

};
