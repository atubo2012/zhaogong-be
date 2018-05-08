'use strict';
/**
 * 全局参数
 * 敏感类信息，如密码、appid、秘钥等应通过环境变量保存，以免提交到VCS中被他人误用。
 * 运行类参数，与性能有关的信息，可以明文方式写入本文件。
 */
module.exports = {

    //数据库参数
    dbUrl: 'mongodb://' + process.env.SI_ZG_DBURL,

    //找工小程序的保密信息
    appId: process.env.SI_ZG_APPID_XCX,                 //小程序的appid
    secret: process.env.SI_ZG_APPSE_XCX,  //小程序的secret

    //腾讯云SMS开发者ID
    oaCfQQSms :{
        appid: process.env.SI_ZG_APPID_QQSMS,
        appkey: process.env.SI_ZG_APPKEY_QQSMS
    },

    //腾讯小程序开发者ID
    oaCfXcx :{
        appId: process.env.SI_ZG_APPID_XCX,
        secret: process.env.SI_ZG_APPSE_XCX
    },

    //第三方OPENAPI服务集
    OA_URL_WX_CODE2SESSION:'api.weixin.qq.com/sns/jscode2session',//https://mp.weixin.qq.com/debug/wxadoc/dev/api/signature.html

    SESSION_EXPIRED:600,//会话有效期（秒）

    //log4js的配置
    logConfig:{
        appenders: {
            out:{type: 'stdout'},
            app:{type:'file', filename:'/root/.pm2/logs/zg.log', maxLogSize:2048000, backups:3,compress:true},
        },
        categories:{
            default:{appenders:['out','app'],level:'debug'},
            utils: {appenders: ['out', 'app'], level: 'trace'}
        }
    }

};
