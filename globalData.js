'use strict';

/**
 * 后端程序使用的全局区域
 * @type {{session: {}}}
 */
module.exports = {
    session : {}, //供前端使用的session，用户登录后在其中创建一条记录。定期清理。
};


