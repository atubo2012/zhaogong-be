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

    log.debug('请求参数：', p);

    //如果请求中没有reqId，则说明是新增请求，则生成reqId
    if (p.reqId === '') {
        //p['reqId'] = (new Date().getTime()).toFixed(0);
        p['reqId'] = ut.getId('REQ');
        p['c2CLNT'] = {};
        p['c2LBOR'] = {};
        log.debug('生成reqId后',p);
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
                    log.debug(JSON.stringify(r));
                    t.equal(null, err);
                    db.close();

                    ut.notify({data: p, type: p.stat});
                    res.send('ok');
                });
        });
    } catch (err) {
        log.error(err);
    }
};


/**
 * 需求单查询列表。分为4类：
 * 1、lbor查看所有需求单list（TODO:查看自己附近的需求单）， 前端设置查询条件：{翻页参数}
 * 2、lbor看自己的需求单list（功能入口在我的模块中），前端设置查询条件：{'lborInfo.openId':openId}
 * 3、clnt看自己的需求单list（功能入口在我的模块中），前端设置查询条件：{'clntInfo.openId':openId}
 * 4、clnt查看某条需求单，edit备用（功能入口是点击我的需求单时进入），前设置查询条件：{'reqId':reqId}
 */
module.exports.list = function (req, res, err) {

    let p = req.query;

    log.debug('需求单list，前端传入的参数：',p);

    try {

        //查询条件，默认是全量查询
        let cond = {};

        //如果请求中有reqId，则按照reqId查询单条
        if (typeof(p.reqId) !== 'undefined') {
            log.debug('按照reqId查询：' + p.reqId);
            cond['reqId'] = p.reqId;

            //TODO:如果是单条查询，则在应答中增加评价记录，便于展现和隐藏“评价按钮”
        }else
        {
            cond = p;
        }
        log.debug('查询条件cond:' + JSON.stringify(cond));
        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('rqst');

            coll.find( Object.assign(cond )).sort({'updt':-1}).toArray(function (err, docs) {
                res.send(JSON.stringify(docs)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                db.close();
            });
        });

    } catch (err) {
        log.error(err);
    }

};


module.exports.remove = function (req, res, err) {
    let p = JSON.parse(req.query.rdata);
    p['recordStatus']='0';

    log.debug('将要删除：' + JSON.stringify(p));

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {
            log.debug("Connection successfully to server");

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
                    log.debug(JSON.stringify(r));
                    db.close();
                    res.send('ok');
                });
        });


    } catch (err) {
        log.error(err);
    }
};

module.exports.update = function (req, res, err) {

};
