module.exports = (io, socket) => {
    const createOrder = (payload) => {
        console.log("+++++=====__+_++");
      // ...
    }
  
    const readOrder = (orderId, callback) => {
      // ...
    }
  
    socket.on("loop", createOrder);
    socket.on("order:read", readOrder);
  }
// module.exports={


//     test:()=>{
//         io.emit('fromServer', 'reloaded');

//     }
// }