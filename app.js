require('./globals');
require('./setup-qcloud-sdk');
require('./utils/test');    //便于实验室test.js的程序能在nodejs不手动重启的情况下验证。

let ut = require('./utils/utils.js');
let log = ut.logger(__filename);

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');


let index = require('./routes/index');
let users = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//console.log('ccccc',process.env);

//session校验中间件，避免后端程序中每行都要增加此项内容
app.use(function (req, res, next) {
    try {

        //ut.reqLog(req, res, next);
		log.debug('0000000000000000000000000000000000',req._remoteAddress);

        //如果是登录请求，则继续执行后续逻辑
        if (req.originalUrl.indexOf('/login2') === 0) {
            log.trace('SESSION:收到登录请求，不进行session校验。');
            next();
        }
        //如果不是登录请求，则校验会话，若会话过期，则直接应答
        else if (!ut.checkSession(req.get('session3rdKey'))) {
            log.trace('SESSION:非登录请求，会话已超时，应答中将head.RTCD设置为超时。');
            res.set('RTCD', 'RTCD_SESSION_TIMEOUT');
            res.send('');
        }
        //如果会话未过期，则继续执行后续逻辑
        else {
            log.trace('SESSION:会话未过期，放行。');
            next();
        }

    }
    catch (e) {
        log.error(e);
    }

});

//uploads是url中的访问路径，public/upload则是服务器端的相对路径。
//以这种模式访问：http://localhost/uploads/avatar-3f91e492f204743d15259da44f16e903.jpg
app.use('/uploads', express.static(path.join(__dirname, 'public/upload')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
