var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var index = require('./routes/index');
var users = require('./routes/users');
//加载商品列表路由
var goods = require('./routes/goods');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//使用ejs引擎
app.engine('.html',ejs.__express	);
app.set('view engine', 'html');
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//登录拦截
app.use((req,res,next) => {
	if (req.cookies.userId) {
		next();
	}else{
		//添加拦截白名单
		if (req.originalUrl == '/users/login' || req.originalUrl == '/users/logout'|| req.path == '/goods') { //req.path拿根路径，不是完整的，originalUrl是完整路径。
			next();
		}else{
			res.json({
				status:'10001',
				msg:'当前未登录',
				result:''
			});
		}
	}
})
app.use('/', index);//访问/时，加载index路由
app.use('/users', users);//访问/users时，加载users路由
//使用商品列表路由
app.use('/goods',goods);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
