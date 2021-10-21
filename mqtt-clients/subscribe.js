var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
/////
const mqtt = require("mqtt");
const { response } = require('express');
var userHelpers=require('../helpers/user-helpers')
module.exports={

    lifeTimeSubscriber:()=>{
     
        
        const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
            
          });
          //  var topic=["myTopic","test","aaab","bbb","ccc","ddd","eee",]
          client.on("connect", async function () {
             let topic= await userHelpers.getAllSecKeys()
            client.subscribe(topic);
          });
          client.on("message", function (topic, message) {
            console.log("TOPIC ::"+topic);
            context = message.toString();
            console.log("MESSAGE ::"+context);
            return new Promise(async(resolve,reject)=>{
              let obj=
              {
                secondaryKey:topic,
                data:context
              }
             
              await db.get().collection(collection.TEST).insertOne(obj).then((response)=>{
                console.log("######## D O N E ######");
              })
            })
          });


    }
}

////