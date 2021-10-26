var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
var publish=require('../mqtt-clients/publish')
const mqtt = require("mqtt");
const { response } = require('express');
var userHelpers=require('../helpers/user-helpers')
module.exports={

    lifeTimeSubscriber:()=>{
     
        
        const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
            
          });
          client.on("connect", async function () {
             let topic= await userHelpers.getAllSecKeys()
            client.subscribe(topic);
          });
          client.on("message", function (topic, message) {
            console.log("TOPIC ::"+topic);
            context = message.toString();
            console.log("MESSAGE ::"+context);
            // return new Promise(async(resolve,reject)=>{
            //   let obj=
            //   {
            //     secondaryKey:topic,
            //     data:context
            //   }
             
            //   await db.get().collection(collection.TEST).insertOne(obj).then((response)=>{
            //     console.log("######## D O N E ######");
            //   })
            // })


            // need to work with the structure
               return new Promise(async(resolve,reject)=>{
             
              let user=await db.get().collection(collection.USER_CREADATIONALS).findOne({secondary_key:topic})
              let userId=user._id.toString()
              let data=await db.get().collection(collection.UART_SUBSCRIPTIONS).updateOne({userID:userId},
                {
                  $push: {"uartMode.$[].values": context  }
                  
                 
              }
            
                )
           
              
            })
          });


    }
}

////