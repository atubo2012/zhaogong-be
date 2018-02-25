let crypto = require('crypto');


/**
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/signature.html
 * 本类用于后端程序对加密的用户数据进行解密，获得openid和unionid时使用
 */


/**
 * 构造函数
 * @param appId         小程序申请时分配的appId
 * @param sessionKey    微信开放接口返回的session_key。(api.weixin.qq.com/sns/jscode2session)
 * @constructor
 */
function WXBizDataCrypt(appId, sessionKey) {
    this.appId = appId;
    this.sessionKey = sessionKey;
}

/**
 * 定义函数的方法，使用decipheriv算法解密
 *
 * @param encryptedData     被加密后的数据
 * @param iv                对session_key解密时需要的初始向量
 * @returns {*}             解密后的数据明文（以对象类型返回），appId用来与明文中watermarker中的appid比较，如果不同则说明问和密文不匹配。
 */
WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
    // base64 decode
    let sessionKey = new Buffer(this.sessionKey, 'base64');
    encryptedData = new Buffer(encryptedData, 'base64');


    iv = new Buffer(iv, 'base64');

    let decoded = null;
    try {
        // 解密
        let decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true);

        decoded = decipher.update(encryptedData, 'binary', 'utf8');
        decoded += decipher.final('utf8');

        decoded = JSON.parse(decoded)

    } catch (err) {
        throw new Error('Illegal Buffer')
    }

    if (decoded.watermark.appid !== this.appId) {
        throw new Error('Illegal Buffer')
    }

    return decoded;
};

module.exports = WXBizDataCrypt;