var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require('body-parser'); //对post请求的请求体进行解析
var cors = require('cors') //跨域资源中间件



var app = express();

//用于解析post请求传来的数据
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

//用于获取Authorization属性
app.use(cors({
  allowedHeaders:true,
  allowMethods:['GET','POST','PUT','DELETE'],
  exposedHeaders:['Authorization']
}))


//获取用户信息路由模块
var usersRouter = require("./routes/users");
app.use("/users", usersRouter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));



// 中间件  处理 404 错误
app.use(function ( req, res, next) {
    res.status(404).send('Not found!')
})
// 中间件 处理 500 错误
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
