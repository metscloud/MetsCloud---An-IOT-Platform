var db =require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
const { ObjectID } = require('bson')
const mqtt = require("mqtt");
const connector=require('../helpers/connectorForUserData')


module.exports={

    publishSecondaryKeyToDevice:(defaultTopic,secKey)=>{
        const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
          });
          
        client.on("connect", () => 
        {
 
                client.publish(defaultTopic, JSON.stringify(secKey));
                console.log('Secondary key published to device ON default Topic');
                client.end()
                console.log(secKey);
                console.log(defaultTopic);
                
       
          });
       
    },
    publishCountToDevice:(userId,deviceId)=>
    {
        return new Promise(async(resolve,reject)=>{
            // find the position and the n take the  key according to the positions
            let deviceData= await connector.connecter("deviceId",deviceId,userId)
            let pos=deviceData.pos
            let secondaryKey=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})
            let topic=secondaryKey.secondary_key_publish[pos]
            await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({deviceId:deviceId}).then((res)=>
            {   
                let count='uArt_3 '+res.uartMode.length
                
                const client = mqtt.connect("mqtt://localhost:1883", {
                    clientId: " ",
                  });
                  client.on("connect", () => {
                    
                    client.publish(topic, JSON.stringify(count));
                    console.log('sented to topic : '+topic+'   message : '+count);
                    client.end()
                   resolve({status:true})
                  })
               
              })
             
            

        })
      

    },
    publishPinValuesToDevice:(topic,data)=>{
        return new Promise(async(resolve,reject)=>{
            const client = mqtt.connect("mqtt://localhost:1883", {
                    clientId: " ",
                  });
                  client.on("connect", () => {
                    
                    client.publish(topic, JSON.stringify(data));
                    console.log('sented to topic : '+topic+'   message : '+data);
                    client.end()
                   resolve({status:true})
                  })

        })
    },
    publishProModeDataLedToDevice:(userId,data)=>
    {
        return new Promise(async(resolve,reject)=>{
            let secondaryKey=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})
            let topic=secondaryKey.secondary_key_publish
            data='Pmode '+`${data[0]} `+`${data[1]} `+`${data[2]} `+`${data[3]} `+`${data[4]}`
         
                
                const client = mqtt.connect("mqtt://localhost:1883", {
                    clientId: " ",
                  });
                  client.on("connect", () => {
                    
                    client.publish(topic, JSON.stringify(data));
                    console.log('sented to topic : '+topic+'   message : '+data);
                    client.end()
                   resolve({status:true})
                  
               
              })
             
            

        })
      

    }
    
}

//