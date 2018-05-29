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
    oaCfQQSms: {
        appid: process.env.SI_ZG_APPID_QQSMS,
        appkey: process.env.SI_ZG_APPKEY_QQSMS
    },

    //腾讯小程序开发者ID
    oaCfXcx: {
        appId: process.env.SI_ZG_APPID_XCX,
        secret: process.env.SI_ZG_APPSE_XCX
    },

    //第三方OPENAPI服务集
    OA_URL_WX_CODE2SESSION: 'api.weixin.qq.com/sns/jscode2session',//https://mp.weixin.qq.com/debug/wxadoc/dev/api/signature.html

    SESSION_EXPIRED: 30 * 60,//会话有效期（60表示秒）

    //log4js的配置
    logConfig: {
        appenders: {
            out: {type: 'stdout'},
            app: {type: 'file', filename: '/root/.pm2/logs/zg.log', maxLogSize: 2048000, backups: 3, compress: true},
        },
        categories: {
            default: {appenders: ['out', 'app'], level: 'debug'},
            utils: {appenders: ['out', 'app'], level: 'debug'}
        }
    },

    /**
     * 通知类别与规则。
     * 命名规范：
     * N_通知类事件，U用户类|O订单类
     * 使用时需要传递的其他参数：用户信息、业务关键信息
     * 埋点-ut.通知-ZgEmitter.on()执行事件->解析notifyRules（
     * 根据通知的Key值
     */

    notifyRules: {

        //用户类事件
        'N_UACCES': {desc: '有用户访问', wechat: true, sms: true, room: '找工MP管理群'},
        'N_UNEWUS': {desc: '新用户访问', wechat: true, sms: true, room: '找工MP管理群'},
        'N_UIDUPD': {desc: '工人更新档期', wechat: true, sms: true, room: '找工MP管理群'},
        'N_UIFUPD': {desc: '用户信息修改', wechat: true, sms: true, room: '找工MP管理群'},
        'N_ROCNFM': {desc: '审核通过', wechat: true, sms: true, room: '找工MP管理群'},

        //业务流程类事件
        'wait': {desc: '客户发布新订单', wechat: true, sms: true, room: '找工MP管理群'},
        'get': {desc: '工人上单', wechat: true, sms: true, room: '找工MP管理群'},
        'lbor-cancel': {desc: '工人取消', wechat: true, sms: true, room: '找工MP管理群'},
        'clnt-cancel': {desc: '客户取消', wechat: true, sms: true, room: '找工MP管理群'},
        'start': {desc: '工人开工', wechat: true, sms: true, room: '找工MP管理群'},
        'finish': {desc: '工人完工', wechat: true, sms: true, room: '找工MP管理群'},
        'close': {desc: '客户关闭订单', wechat: false, room: '找工MP管理群'},
        'delete': {desc: '客户删除订单', wechat: false, room: '找工MP管理群'},
        'lcmmt': {desc: '工人点评', wechat: true, sms: true, room: '找工MP管理群'},
        'ccmmt': {desc: '客户点评', wechat: true, sms: true, room: '找工MP管理群'},

        //系统类事件
        'N_SUEXPT': {desc: '未知异常发生', wechat: true, sms: true, room: '找工MP管理群'},
    }

};
