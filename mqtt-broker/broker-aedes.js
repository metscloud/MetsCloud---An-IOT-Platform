
var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
var connectedClients=[]
const aedes = require("aedes")();
const server = require("net").createServer(aedes.handle);
const port = 1883;





module.exports={
  connectedClients:()=>{
    return connectedClients
  },
  numberOfConnectedClients:()=>{
    return aedes.connectedClients

  },
  closeMQTTserver:()=>{
    aedes.close(()=>{
      console.log('MQTT server closed');
    })

  },
 
  
  
  
  
  
  startBroker:()=>
  


{

    
    server.listen(port, () => {
      console.log(`MQTT Server Running on : http://localhost:${port}`);
    });

    aedes.on("client",async function (client) {
      console.log(`______Client Connected_____:  ${client.id}`)
      connectedClients.push(client.id)
    
          })
     
    
    aedes.on("clientDisconnect", async function (client) {
      console.log(`Client Disconnected:  ${client.id}`);
      let  v=connectedClients.indexOf(client.id)
      connectedClients.splice(`${v}`)
      console.log('Connected Clients  :::::   '+connectedClients);

    });
}

}
 



