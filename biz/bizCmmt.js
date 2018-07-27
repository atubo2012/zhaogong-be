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
    log.debug('请求参数:', p);

    let reqId = p.reqId;

    //如果请求中没有reqId，则说明是新增请求，则生成reqId
    if (reqId === '') {
        log.error('reqId为空');
        throw Error('reqId为空');
    }

    try {
        let MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('cmmt');
            let t = require('assert');
            coll.updateOne(
                {'reqId': reqId,'role':p.role},
                {
                    $set: p,  //业务数据
                    $currentDate: {'updt': true} //更新时间字段
                },
                {upsert: true, w: 1}, function (err, r) {
                    t.equal(null, err);
                    log.debug('更新评价表中的评价信息，处理结果', r.result);

                    //更新用户的印象标签信息
                    let coll2 = db.collection('user');
                    coll2.updateOne(
                        {'openId': p.assesseeOpenId},
                        {
                            $set: {'impItems': p.impItems}, //业务数据
                            $currentDate: {'updt': true}    //更新时间字段
                        },
                        {upsert: true, w: 1}, function (err, r) {
                            t.equal(null, err);
                            log.debug('更新用户的评价信息，处理结果', r.result);

                            //更新订单中的印象标签信息
                            let coll3 = db.collection('rqst');
                            let params = null;

                            delete p.reqId;
                            delete p.observerOpenId;
                            delete p.assesseeOpenId;

                            if(p.role==='CLNT'){
                                params = {'c2LBOR':p};
                            }else{
                                params = {'c2CLNT':p};
                            }

                            coll3.updateOne(
                                {'reqId': reqId},
                                {
                                    $set: params,  //业务数据
                                    $currentDate: {'updt': true} //更新时间字段
                                },
                                {upsert: true, w: 1}, function (err, r) {
                                    t.equal(null, err);
                                    log.debug('更新订单的评价信息，处理结果', r.result);

                                    db.close();
                                    res.send('ok');
                                })
                        })
                });
        });


    } catch (err) {
        log.error(err);
    }

};

/**
 * 用户评价查询中有3类情况，查询cmmt表的用户印象
 * 1、查看我收到的评价：{mode:tome,   assesseeOpenId:前端app.globalData.userInfo.openId}。list（前端功能入口在我的模块中）
 * 2、查看TA收到的评价，{mode:tohim,  assesseeOpenId:前端从页面参数中取得assesseeOpenId}  。 list（前端功能入口在阿姨详情中进入评价列表）
 * 3、查看我发出的评价，{mode:isend,  observerOpenId:前端app.globalData.userInfo.openId}。list（前端功能入口在我的模块中）
 * 4、查看TA发出的评价，{mode:hesend, observerOpenId:前端app.globalData.userInfo.openId}。list（前端功能入口在阿姨详情中进入评价列表）
 *
 * 用户印象中有两类情况，查询user表的用户印象。done
 * 1、查看他的印象，   {mode:hisimp, openId:前端从页面参数中取得assesseeOpenId}
 * 2、查看我的印象，   {mode:myimp,  openId:前端app.globalData.userInfo.openId}
 */
module.exports.list = function (req, res, err) {

    let p = req.query;
    log.debug('需求单list，前端传入的参数：', p);

    try {
        //查询条件，默认是全量查询
        let cond = p;
        let collection = '';

        //根据控制参数设置将从哪个collection中取数
        if (p.mode === 'hisimp' || p.mode === 'myimp') {
            collection = 'user';        //查询某个用户的印象标签

        } else if (                     //查询某个用户相关的评论信息，从cmmt表中查询
        p.mode === 'tome' ||        //我收到的：assesseeOpenId=openId
        p.mode === 'isend' ||       //我发出的：observerOpenId=openId
        p.mode === 'tota' ||        //ta收到的：assesseeOpenId=openId
        p.mode === 'tasend'         //ta发出的：observerOpenId=openId
        )
        {
            collection = 'cmmt';

            // collection = 'rqst';
            // //根据当前角色，设置查询条件
            // p.role==='CLNT'? cond['clntInfo.openId']=p.openId : cond['lborInfo.openId']=p.openId;
            //
            // //删除不必要的条件
            // delete cond.role;
            // delete cond.assesseeOpenId;
            // delete cond.openId;
        }else{
            log.error('mode的值非法:', p.mode);
            return;
        }

        //删除前端传入的控制类属性
        delete cond.mode;
        log.debug('查询条件cond:' + JSON.stringify(cond));

        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection(collection);

            coll.find(cond).sort({'updt': -1}).toArray(function (err, docs) {
                res.send(JSON.stringify(docs)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。
                db.close();
            });
        });

    } catch (err) {
        log.error(err);
    }

};
