'use strict';

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let log = ut.logger(__filename);

module.exports.edit = function (req, res, err) {

    let p = JSON.parse(req.query.rdata);
    /**
     * CRUD的操作类别根据前端发送请求前的参数设置
     * C：p中没有reqID，后端需要生成reqID，并补充到p的参数中。记录状态前端页面加载时设置为默认值(rdst)
     * R：调用后端的xxxlist方法
     * U：p中包括reqID和所有的业务字段，直接将p作为更新字段列表执行updateOne
     * D：p中仅包括reqID和rdst=0，直接将p作为更新字段列表执行updateOne
     */
    log.debug('请求参数:', p, req.query, req.params, req.body);

    let openId = p.openId;

    //如果请求中没有reqId，则说明是新增请求，则生成reqId
    if (openId === '') {
        log.error('openId');
        throw Error('openId');
    }

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('tomato');
            let t = require('assert');
            coll.updateOne(
                {'openId': openId},
                {
                    $set: {nickName: p.nickName},  //业务数据
                    $push: {tomatos: {$each: [p.tomato], $position: 0}}, //用$each和$position关键字将数据插入第一个元素。
                    $currentDate: {'updt': true} //更新时间字段
                },
                {upsert: true, w: 1}, function (err, r) {
                    t.equal(null, err);
                    log.debug('更新番茄钟信息', r.result);

                    db.close();
                    res.send('ok');
                });
        });


    } catch (err) {
        log.error(err);
    }

};

/**
 * 参考user-list的翻页查询算法
 * @param req
 * @param res
 * @param err
 */
module.exports.list = function (req, res, err) {

    try {
        let p = req.query || req.params;
        log.debug(p, typeof(p), typeof(p.query));
        let cond = JSON.parse(p.cond);


        ut.info('查询条件cond:', cond);
        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('tomato');

            //流程：定位记录->用$slice操作符截取数组中的数据->取得结果集中的第一个元素->应答给前端
            coll.find(cond.query, {tomatos: {$slice: [cond.skip, cond.limit]}}).sort({'updt': -1}).toArray(function (err, docs) {
                log.debug(docs);

                if (docs.length === 0)
                    res.send('no');
                else
                    res.send(JSON.stringify(docs[0].tomatos)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。

                db.close();
            });
        });

    } catch (err) {
        log.error(err);
    }

};
