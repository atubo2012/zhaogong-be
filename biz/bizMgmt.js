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
    log.debug('请求参数1:', p, p.tomato.id, req.query, req.params, req.body);

    let openId = p.openId;
    let isNew = false;

    //如果请求中没有id，则说明是新增请求，则生成reqId
    if (!p.tomato.id) {
        p.tomato.id = ut.getId32('');
        isNew = true;//表示是新增记录
    }

    try {
        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('biz');
            let t = require('assert');

            log.info(p);

            //新增模式下，将记录以第一个元素加入到数组
            if (isNew) {
                coll.updateOne(
                    {'openId': openId},
                    {
                        $set: {
                            nickName: p.nickName,
                        },
                        //$push:{'tomatos': p.tomato},
                        $push: {tomatos: {$each: [p.tomato], $position: 0}},
                        $currentDate: {'updt': true},//更新时间字段

                    },
                    {upsert: true, w: 1}, function (err, r) {
                        t.equal(null, err);
                        log.debug('更新biz1', r.result);

                        db.close();
                        res.send('ok');
                    });
            }
            //修改模式下，先删除指定id的数组元素，然后再将修改有的元素值加入到数组，作为第一个元素
            else {
                // coll.updateOne(
                //     {'openId': openId},
                //     {
                //         $set: {"tomatos.$[elm]": p.tomato},
                //         $currentDate: {'updt': true}
                //     },
                //     {
                //         arrayFilters: [{"elm.id": p.tomato.id}],
                //         multi: true
                //     },
                //
                //     {upsert: true, w: 1}, function (err, r) {
                //         t.equal(null, err);
                //         log.debug('更新biz2', r.result);
                //
                //         db.close();
                //         res.send('ok');
                //     });

                coll.updateOne(
                    {'openId': openId},
                    {
                        $pull: {tomatos: {id: p.tomato.id}}, //删除指定id的数组元素。
                    },
                    function (err, r) {
                        t.equal(null, err);
                        log.debug('删除元素成功', r.result);

                        //若不是删除操作，则将更新后的商品类别记录增加列表中
                        if (p.tomato.stat !== 'bs_delete') {
                            coll.updateOne(
                                {'openId': openId},
                                {
                                    $push: {tomatos: {$each: [p.tomato], $position: 0}},//向数组中添加元素
                                    $currentDate: {'updt': true}
                                }, function (err, r) {
                                    t.equal(null, err);
                                    log.debug('更新成功', r.result);
                                    //将当前的tomato成员，添加到bizcatalog表中，根据id字段upsert
                                    //bizcatalog专供客户查询时检索商品
                                    _updateBizCatalog(Object.assign(p.tomato, {supplier_id: p.openId}));


                                    db.close();
                                    res.send('ok');
                                })
                        } else {
                            _deleteBizCatalog(p.tomato);
                            db.close();
                            res.send('删除成功');
                        }
                    });
            }
        });


    } catch (err) {
        log.error(err);
    }

};

/**
 * 从bizcatalog表中删除记录
 * @param bizcatalog
 * @private
 */
let _deleteBizCatalog = function (bizcatalog) {
    log.debug('_deleteBizCatalog1', bizcatalog);
    let MongoClient = require('mongodb').MongoClient;

    try {
        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('bizcatalog');
            let t = require('assert');
            coll.deleteOne(
                {'id': bizcatalog.id},
                {w: 1}, function (err, r) {
                    log.debug('_deleteBizCatalog2', r.result);
                    db.close();
                });
        });

    } catch (err) {
        log.error(err);
    }
};

let _updateBizCatalog = function (bizcatalog) {
    log.debug('_updateBizCatalog1', bizcatalog);
    let MongoClient = require('mongodb').MongoClient;

    /**
     * TODO:如果是删除功能，则要将bizcatalog的记录设置为删除
     */
    try {
        MongoClient.connect(cf.dbUrl, function (err, db) {
            let coll = db.collection('bizcatalog');
            let t = require('assert');
            coll.updateOne(
                {'id': bizcatalog.id},
                {
                    $set: bizcatalog,
                    $currentDate: {'updt': true},//更新时间字段
                },
                {upsert: true, w: 1}, function (err, r) {
                    t.equal(null, err);
                    log.debug('_updateBizCatalog2', r.result);
                    db.close();
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
        log.info('查询条件cond1:');
        log.debug(p, typeof(p), typeof(p.query));
        log.info('查询条件cond2:');
        let cond = JSON.parse(p.cond);


        log.info('查询条件cond:', cond);
        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('biz');

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

module.exports.bizcataloglist = function (req, res, err) {

    try {
        let p = req.query || req.params;
        log.info('查询条件cond1:');
        log.debug(p, typeof(p), typeof(p.query));

        let cond = JSON.parse(p.cond);
        log.info('查询条件cond:2', cond);


        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('bizcatalog');

            //流程：定位记录->用$slice操作符截取数组中的数据->取得结果集中的第一个元素->应答给前端
            coll.find(cond.query)
                .sort(cond.sort)
                .skip(cond.skip)
                .limit(cond.limit)
                .toArray(function (err, docs) {
                    log.debug(docs);

                    if (docs.length === 0)
                        res.send('no');
                    else
                        res.send(JSON.stringify(docs)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。

                    db.close();
                });
        });

    } catch (err) {
        log.error(err);
    }

};

module.exports.bizQuery = function (req, res, err) {

    try {
        let rdata = req.query.rdata || req.params.rdata;
        log.info('bizQuery()1:', rdata, typeof(rdata));

        let cond = JSON.parse(rdata).cond;
        log.info('bizQuery()2:', cond);


        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('bizcatalog');

            //流程：定位记录->用$slice操作符截取数组中的数据->取得结果集中的第一个元素->应答给前端
            coll.find(cond)
                .toArray(function (err, docs) {
                    log.debug('bizQuery()3:', docs);

                    if (docs.length === 0)
                        res.send('no');
                    else
                        res.send(JSON.stringify(docs[0])); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。

                    db.close();
                });
        });

    } catch (err) {
        log.error(err);
    }
};

module.exports.orderlist = function (req, res, err) {

    try {
        let p = req.query || req.params;
        log.info('查询条件cond1:');
        log.debug(p, typeof(p), typeof(p.query));

        let cond = JSON.parse(p.cond);
        log.info('查询条件cond:2', cond);


        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrl, function (err, db) {

            let coll = db.collection('rqst');

            //流程：定位记录->用$slice操作符截取数组中的数据->取得结果集中的第一个元素->应答给前端
            coll.find(cond.query)
                .sort(cond.sort)
                .skip(cond.skip)
                .limit(cond.limit)
                .toArray(function (err, docs) {
                    log.debug(docs);

                    if (docs.length === 0)
                        res.send('no');
                    else
                        res.send(JSON.stringify(docs)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。

                    db.close();
                });
        });

    } catch (err) {
        log.error(err);
    }

};
