'use strict';

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let log = ut.logger(__filename);


/**
 * 根据前端传入的参数，从第三方获取数据
 * @param req
 * @param res
 * @param err
 */
module.exports.cityList = function (req, res, err) {
    try {
        let p = req.query || req.params;
        log.debug('入参：', p, typeof(p));

        let ret = Object.keys(cf.cities);
        log.debug('出参：', ret);

        res.send(JSON.stringify(ret)); //将后端将数据以JSON字符串方式返回，前端以query.data获取数据。

    } catch (err) {
        log.error(err);
    }
};
