'use strict';
/**
 * 全局参数
 */
module.exports = {

    //数据库参数
    dbUrl: 'mongodb://100td:27117/' + process.env.DBNAME,

    //找工小程序的保密信息
    appId:'wx887e4e9e1c47b47d',                 //小程序的appid
    secret:'ac8b39a41258a5e776d5cf4e0b751116',  //小程序的secret

    //腾讯云SMS开发者ID
    oaCfQQSms :{
        appid :1400055205,
        appkey:"58762ca09c9d267881fe980b6a5615df"
    },

    //腾讯小程序开发者ID
    oaCfXcx :{
        appid :'wx887e4e9e1c47b47d',
        appkey:"ac8b39a41258a5e776d5cf4e0b751116"
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
