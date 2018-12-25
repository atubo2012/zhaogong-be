'use strict';

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let log = ut.logger(__filename);


/**
 * 参考univ-list的翻页查询算法
 * @param req
 * @param res
 * @param err
 */
module.exports.list = function (req, res, err) {

    try {
        let p = req.query || req.params;
        log.debug(p, typeof(p), typeof(p.query));
        let cond = JSON.parse(p.cond);

        log.debug('查询条件cond:', cond, typeof(cond));


        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(cf.dbUrlBb, function (err, db) {

            //let coll = db.collection('ljshesf_result');
            let coll = db.collection(cond.coll);


            coll.find(cond.query).sort(cond.sort).skip(cond.skip).limit(cond.limit).toArray(function (err, docs) {
                //log.debug(docs);

                if (docs && docs.length === 0)
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
