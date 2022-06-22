var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
var publish=require('../mqtt-clients/publish')
const mqtt = require("mqtt");
const { response } =  require('express');
var userHelpers=require('../helpers/user-helpers');
const { log } = require('debug');
var adminHelpers=require('../helpers/admin-helpers');
var broker=require('../mqtt-broker/broker-aedes')

//Broker
const aedes = require("aedes")();
const server = require("net").createServer(aedes.handle);
const port = 1883;






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
            clientId: "Server Client",

            
          });

          

          client.on("connect", async function () {
       
             let topic= await userHelpers.getAllSecKeys()

 
            client.subscribe(topic.finalKeys);
       
            //for testing mqtt capacity and speed
         
            const array=[]



                });

          client.on("message", function (topic, message)
           {
         
            console.log("TOPIC ::"+topic);
            context = message.toString();
            console.log("MESSAGE ::"+context)
            console.log(typeof context);

 ////////////////////////////  //  _________Process after recieving a message________ //////////////////////////////////////////


 // KEY CONFORMATION

          if( context===2 )
          {
            console.log('Conformation recieved ');
          
            return new Promise(async(resolve,reject)=>
            {
           
              db.get().collection(collection.USER_CREADATIONALS).updateOne({"secondary_key_subscribe":topic},
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

         

          else if(broker.masterDeviceStatus()===true)
          {
            if(context==='Sn_no?')
            {
              //add data from DB

            }

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

 
          else
          {
            console.log("nn 1");
             
              return new Promise(async(resolve,reject)=>{
                let user=await db.get().collection(collection.USER_CREADATIONALS).findOne({secondary_key_subscribe:topic})
              
                let userId=user._id.toString()
                let primaryKey=await userHelpers.connecter("sec_sub",topic,userId)
                // primaryKey.primary_key

               
                  dataAdder(userId,context)
                
              
                
              })

            }

  ///////////////  ////////////// ///////////////////////////  ///////////////  ////////////// ///////////////////////////  ///////////////  ////////////// ///////////////////////////
          });
          
    },
  
    






}

////
