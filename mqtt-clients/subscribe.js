var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
var publish=require('../mqtt-clients/publish')
const mqtt = require("mqtt");
const { response } =  require('express');
var userHelpers=require('../helpers/user-helpers');
const { log } = require('debug');
var adminHelpers=require('../helpers/admin-helpers');




   //__________________________S U P P O R T E R S____________________________________________
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////

  function dataAdder (userId,ak)
  {
    return new Promise(async(resolve,reject)=>{
        let data=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({userID:userId})
        let array=data.uartMode
        // only for testing purpose
      //  let ak=[18,34,24]
      ak.split(',')
      console.log(ak);
      var arry = JSON.parse("[" + ak + "]");
      console.log(arry);
        //
        dataArray=[]
        console.log(array.length);
        for(let i=0; i<=array.length-1;i++)
        {
           let temp=arry[i]
           if (temp=='-777.777')
           {
                console.log('Empty POSITION  at '+i);
           }
           else
           {
            array[i].values.push(temp)
           }
        }
        console.log('}}}}}}');
        console.log(array); 
        await db.get().collection(collection.UART_SUBSCRIPTIONS).deleteOne({userID:userId})
        let obj={
            userID:data.userID,
            uartMode:array
        }
        await db.get().collection(collection.UART_SUBSCRIPTIONS).insertOne(obj).then((res)=>{
            console.log('DONE');
        })             
    })

}

  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// ////// //////
  module.exports=
  {

    lifeTimeSubscriber:()=>
          {
           
            const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
            
          });

          client.on("connect", async function () {
            //  let topic= await userHelpers.getAllSecKeys()
            //  console.log(topic.catchKeysIds);
            //  console.log(topic.finalKeys);
            // client.subscribe(topic.finalKeys);

            //for testing mqtt capacity and speed
            
            const array=[]


            for (let index = 0; index < 10000; index++) 

            {
              let temp= index.toString()
               array.push(temp);
    
            }
                console.log(array);
                client.subscribe(array);
                });

          client.on("message", function (topic, message)
           {
            // for testing

             let obj={
               Topic:topic,
               MES: message.toString()
             }
             adminHelpers.testing(obj).then((res)=>{
               console.log('done');
             })
         
  
            //
            console.log("TOPIC ::"+topic);
            context = message.toString();
            console.log("MESSAGE ::"+context)

 ////////////////////////////  //  _________Process after recieving a message________ //////////////////////////////////////////


 // KEY CONFORMATION
          if(context==='krs')
          {
            console.log('Conformation recieved ');
          
            return new Promise(async(resolve,reject)=>
            {
           
              db.get().collection(collection.USER_CREADATIONALS).updateOne({"secondary_key":topic},
              {
                  $set:{
                      "firstConnect":true
                  }
              }
              ).then(()=>{
                  resolve({status:true})
                  console.log('Secondary key successfully recieved in device...');
              })
          })
        
          }


// MODE CHECKING
          else if(context==='MODE?')
          {
            return new Promise(async(resolve,reject)=>
            {
              let user=await db.get().collection(collection.USER_CREADATIONALS).findOne({"secondary_key":topic})
              let mode=user.liveMode
              console.log('Mode :'+mode);
              console.log('senting mode....');
              client.publish(topic, JSON.stringify(mode));
              console.log('sented to topic : '+topic+'   message : '+mode);
            })
          }

 //catching
else if(context==='catch')
{

}

          else
          {
             console.log('Data recieved');
              return new Promise(async(resolve,reject)=>{
                let user=await db.get().collection(collection.USER_CREADATIONALS).findOne({secondary_key:topic})
                let userId=user._id.toString()
                if(context==='"pro"'|| context==='"uart"')
                {
                  console.log('Recieved message published from MODE?');
                  console.log('skipping....');
                }
                else
                {
                  dataAdder(userId,context)
                }
              
                
              })

            }

  ///////////////  ////////////// ///////////////////////////  ///////////////  ////////////// ///////////////////////////  ///////////////  ////////////// ///////////////////////////
          });
          
    },
  
    






}

////
