var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var userRouter = require('./routes/user');
var session=require('express-session')
var db=require('./config/connection')
var adminRouter = require('./routes/admin');
var blogRouter=require('./routes/blog')
var storeRouter=require('./routes/store')
var broker=require('./mqtt-broker/broker-aedes')
var fileUpload=require('express-fileupload')

var app = express();

// view engine setup
console.log('________________________________________________________ SEVER UP ON port:3000________________________________________________________');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layouts',partialsDir:__dirname+'/views/partials'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:"key",cookie:{maxAge:600000}}))
app.use(express.static(path.join(__dirname, 'public')));

db.connect((err)=>{
  if(err) console.log('connection failed'+err);
  else console.log('connected to database (PORT : 27017)');
})

broker.startBroker()

app.use('/', userRouter);
app.use('/admin', adminRouter)
app.use('/blog', blogRouter);
app.use('/store',storeRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
