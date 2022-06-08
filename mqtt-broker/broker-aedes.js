
var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
var connectedClients=[]
var masterDevice=false
const aedes = require("aedes")();
const server = require("net").createServer(aedes.handle);
const port = 1883;
const mqtt = require("mqtt");
const cors=require('cors')
const socket = require("socket.io")(server);
const app = require('../app');








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
  masterDeviceStatus:()=>{
    return masterDevice

  },
 
  
  
  
  
  
  startBroker:()=>
{

    
    server.listen(port, () => {
      console.log(`MQTT Server Running on : http://localhost:${port}`);
    });

    aedes.on("client",async function (client) {
      console.log(`______Client Connected_____:  ${client.id}`)
  
      if(client.id==="hi" )
      {
        console.log(">>>>>>>>>>>>    Master Device CONNECTED  <<<<<<<<");
        masterDevice=true
        
        
      }
      connectedClients.push(client.id)
    
          })
     
    
    aedes.on("clientDisconnect", async function (client) {
      console.log(`Client Disconnected:  ${client.id}`);
      if(client.id==="hi" )
      {
        console.log(">>>>>>>>>>>>    Master Device CONNECTED  <<<<<<<<");
        masterDevice=false
        
      }
      let  v=connectedClients.indexOf(client.id)
      connectedClients.splice(`${v}`)
      console.log('Connected Clients  :::::   '+connectedClients);

    });
}

}
 



