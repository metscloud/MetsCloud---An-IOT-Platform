var db =require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
const { ObjectID } = require('bson')
const mqtt = require("mqtt");


module.exports={

    publishSecondaryKeyToDevice:(defaultTopic,secKey)=>{
        const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
          });
          
        client.on("connect", () => 
        {
 
                client.publish(defaultTopic, JSON.stringify(secKey));
                console.log('Success');
                client.end()
                console.log(secKey);
                return new Promise(async(resolve,reject)=>{
                    db.get().collection(collection.USER_CREADATIONALS).updateOne({"secondary_key":secKey},
                    {
                        $set:{
                            "firstConnect":true
                        }
                    }
                    ).then((response)=>{
                        resolve(response)
                    })
                })
       
          });
       
    },
    publishCountToDevice:(userId)=>
    {
        return new Promise(async(resolve,reject)=>{
            let secondaryKey=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})
            let topic=secondaryKey.secondary_key
            await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({userID:userId}).then((res)=>
            {   
                let count='uArt_3 '+res.uartMode.length
                
                const client = mqtt.connect("mqtt://localhost:1883", {
                    clientId: " ",
                  });
                  client.on("connect", () => {
                    
                    client.publish(topic, JSON.stringify(count));
                    console.log('sented to topic : '+topic+'   message : '+count);
                    client.end()
                  })
               
              })
             
            

        })
      

    }
    
}
//