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
var subscribe=require('./mqtt-clients/subscribe')
var fileUpload=require('express-fileupload');

var connectedSocketClients=[]
var userIds=[]


var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;




const cors=require('cors')
// const socket = require("socket.io");
// const io = socket(3000,{ 
//   cors: {
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST"]
// }});




const userHelpers = require('./helpers/user-helpers');



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
app.use(cors())
app.use(fileUpload())
db.connect((err)=>{
  if(err) console.log('connection failed'+err);
  else console.log('connected to database (PORT : 27017)');
})

broker.startBroker()
subscribe.lifeTimeSubscriber()

//Sockets..........................................

// socketServer.startSocketServer()



//
function userCreator(socketIds,client){
  let socketUsers=[]
  for (let i = 0; i < socketIds.length; i++) 
  {
    let user ={
      socketId:socketIds[i],
      clientId:client[i]

    } 
    socketUsers.push(user)
    
  }
  return socketUsers
 
}


// https://socket.io/docs/v4/server-application-structure/

  
  socketApi.io.sockets.on('ooo', (data)=>{
      console.log(data);
  });
  console.log(">>><><><><><><><>< <><><><><><><<");
  console.log(">>><><><><><><><>< <><><><><><><<");
  console.log(">>><><><><><><><>< <><><><><><><<");
  console.log(">>><><><><><><><>< <><><><><><><<");
  console.log(">>><><><><><><><>< <><><><><><><<");
  console.log(">>><><><><><><><>< <><><><><><><<");


// io.on("connection", (socket) =>
// {
// // send a message to the client
// console.log(' user connected '+socket.id);

// connectedSocketClients.push(socket.id)
// console.log(connectedSocketClients);
// socket.emit('fromServer',"success")

// socket.on('join',(data)=>{
//   console.log(data);
//   userIds.push(data.userId)
//   console.log(userIds);
//   let a=userCreator(connectedSocketClients,userIds)
//   console.log("SOCKET USERS");
//   console.log(a);

// })



// socket.on('disconnect', function(socket)
// {
// console.log( socket.id);
// let  v=connectedSocketClients.indexOf(socket.id)
// console.log(v);
// connectedSocketClients.splice(`${v}`)
// console.log(connectedSocketClients);
// })

// socket.on('message', function(msg)
// {
// console.log(msg)
//    setInterval(async()=>{
//        let s=random.int((min = 0), (max = 10)) 
//       let ms=await db.get().collection(collection.KEYS).find().toArray()
//        console.log(ms[s].key);
//                socket.emit('fromServer', ms[s].key+"llll")

//    }, 1000);

// })


// })




// app.use(function(req, res, next) {
//   req.io = io;
//   next();
// });

//production
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  app.use('/', userRouter);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//dev
// app.use(express.static(path.join(__dirname, 'testbuild')));

// app.get('/', function (req, res) {
//   app.use('/', userRouter);
//   res.sendFile(path.join(__dirname, 'testbuild', 'index.html'));
// });



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

io.sockets.on('ooo', (data)=>{
  console.log(data);
});
console.log(">>><><><><><><><>< <><><><><><><<");
console.log(">>><><><><><><><>< <><><><><><><<");
console.log(">>><><><><><><><>< <><><><><><><<");
console.log(">>><><><><><><><>< <><><><><><><<");
console.log(">>><><><><><><><>< <><><><><><><<");
console.log(">>><><><><><><><>< <><><><><><><<");

module.exports =socketApi;

module.exports = app;

