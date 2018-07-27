'use strict';
let http = require('https');

let cf = require('../beconfig.js');
let ut = require('../utils/utils.js');
let globalData = require('../globalData.js');
let log = ut.logger(__filename);

/**
 * 接收用户发来的客服消息，并进行应答。应答内容为客服微信号图片。
 * @param req
 * @param res
 * @param err
 */
module.exports.msgpush = function (req, res, err) {
    try {
        log.debug(req.query, req.params, req.body);
        res.send('success');

        //如希望发送文本消息，则在req.end()方法中使用postData
        const postData = JSON.stringify({
            "touser": req.body.FromUserName,
            "msgtype": "text",
            "text": {"content": "您好，客服微信号为：wanxinsh2017,也可以扫描以下二维码与客服联系！"}
        });

        //如希望发送图片消息，则在req.end()方法中使用postData
        const postData2 = JSON.stringify({
            "touser": req.body.FromUserName,
            "msgtype": "image",
            "image": {"media_id": "hjQWaxgl-o6EzYHTK7D4-FkDZbSdS0RTKlrjFGbMJGMRgr1RAqDnkpsSUMh3tAyt"}
        });

        //如希望发送链接卡片消息，则在req.end()方法中使用postData3
        const postData3 = JSON.stringify({
            "touser": req.body.FromUserName,
            "msgtype": "link",
            "link":
                {
                    "title": "Happy Day",
                    "description": "Is Really A Happy Day",
                    "url": 'www.sina.com.cn',
                    "thumb_url": "www.baidu.com"
                }
        });


        let token = globalData.access_token;

        //TODO:options应该放到全局变量中统一管理
        //request方法应该被封装，access_token应该被保存在session中，当快过期的时候，就更新。
        const options = {
            host: 'api.weixin.qq.com',
            port: '443',
            path: '/cgi-bin/message/custom/send?access_token=' + token,
            method: 'POST',
        };
        // const req1 = http.request(options, (res) => {
        //     log.debug(`STATUS: ${res.statusCode}`);
        //     log.debug(`HEADERS: ${JSON.stringify(res.headers)}`);
        //     res.setEncoding('utf8');
        //     let ret = [];
        //     res.on('data', (chunk) => {
        //         ret.push(chunk);
        //         log.debug(`BODY: ${chunk}`);
        //     });
        //     res.on('end', () => {
        //         log.debug('result:', ret.join(''));
        //     });
        // });
        // req1.on('error', (e) => {
        //     log.error(`problem with request: ${e.message}`);
        // });
        // req1.on('uncaughtException', (e) => {
        //     log.error(`problem with request: ${e.message}`);
        // });
        // req1.end(postData2);

        ut.httpRequest('https', options, postData2, (result) => {

        });
    } catch (e) {
        console.error(e);
    }

};