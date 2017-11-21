let multer = require('multer');
let md5 =require('md5');
let ulfnm = '';
let ut = require('../utils/utils.js');
let storage = multer.diskStorage({

    //文件上传后保存的路径
    destination: './public/upload',

    //文件命名函数：即使是相同的文件也会分别命名
    filename: function(req,file,cb){

        let fileFormat = (file.originalname).split('.');

        let _md5info = md5(JSON.stringify(file));
        ut.debug('文件对象信息：',file);

        ut.debug('文件md5信息：',_md5info);

        ulfnm = file.fieldname+'-'+_md5info+'.'+fileFormat[fileFormat.length - 1];
        cb(null,ulfnm);
    }
});

let uploadutil = multer({
    storage:storage,
    //其他设置参考limits:{}
});

module.exports = uploadutil;