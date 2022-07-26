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
var mqttKeyStore=require('../helpers/mqttKeysStore')
var connector=require('../helpers/connectorForUserData')
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

  function dataAdder (userId,ak,dbLocation)
  {
    return new Promise(async(resolve,reject)=>{
      let array=[]
      console.log(dbLocation);
        let data=await db.get().collection(dbLocation).findOne({userID:userId})
        console.log(data);
        if(dbLocation===collection.UART_SUBSCRIPTIONS)
        {
          array=data.uartMode
        }
        else if (dbLocation===collection.CHART_DATA_IIOT)
        {
          array=data.iiotData

        }
          else{
            console.log("ERROR PASSED TO FUNCTION");
          }
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
        await db.get().collection(dbLocation).deleteOne({userID:userId})
        let obj
        if(dbLocation===collection.UART_SUBSCRIPTIONS)
        {
           obj={
            userID:data.userID,
            deviceId:data.deviceId,
            uartMode:array
        }
        }
        else if (dbLocation===collection.CHART_DATA_IIOT)
        {
           obj={
            userID:data.userID,
            deviceId:data.deviceId,
            iiotData:array
        }

        }
          else{
            console.log("ERROR PASSED TO FUNCTION");
          }
        
        await db.get().collection(dbLocation).insertOne(obj).then((res)=>{
            console.log('DONE');
        })   
       
    })

}
function dataAdderOfDevice(message,userId,dbLocation)
{
  return new Promise(async(resolve,reject)=>{
    let array=[]
    let idOfEachChart=[]
   
    console.log(dbLocation);
    console.log("-___--___--_--");
      let data=await db.get().collection(dbLocation).findOne({userID:userId})
      console.log(data);
      for (let index = 0; index <=data.iiotData.length-1; index++) {
        let idtakingLoop= data.iiotData[index].Id
        console.log(idtakingLoop);
        idOfEachChart.push(idtakingLoop)
        
      }
      console.log("__________&&*&^*&^*&^*&^*^*______");
      console.log(idOfEachChart);
      if(dbLocation===collection.UART_SUBSCRIPTIONS)
      {
        array=data.uartMode
      }
      else if (dbLocation===collection.CHART_DATA_IIOT)
      {
        array=data.iiotData

      }
        else{
          console.log("ERROR PASSED TO FUNCTION");
        }
      // only for testing purpose
    //  let ak=[18,34,24]
    message.split(',')
    console.log(message);
    var arry = JSON.parse("[" + message + "]");
    console.log(typeof arry);
    for(let i=0;i<=arry.length-1;i++)
    {
      if(arry[i]===00)
      {
     console.log("NO VALUE");
      }else{
        let obj={
          value:arry[i],
          date:new Date()
        }
        let querry
        querry={
          "iiotData.$.values":obj
      }
        await db.get().collection(dbLocation).update({userID:userId ,"iiotData.Id":idOfEachChart[i]},
          {
            $push: querry
        })

      }
      
    }
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
       
            //  let topic= await userHelpers.getAllSecKeys()
            let topic=await mqttKeyStore.getAllKeysOfMetsCloud()
             console.log(topic);

 
            client.subscribe(topic);
          
           
       
            //for testing mqtt capacity and speed
         
            const array=[]



                });

          client.on("message", function (topic, message)
           {
         
            console.log("TOPIC ::"+topic);
            context = message.toString();
            console.log("MESSAGE ::"+context)
            console.log(typeof context);
            // let ads=context
            // console.log(ad);

 ////////////////////////////  //  _________Process after recieving a message________ //////////////////////////////////////////

// IIOT SESSION


 let session = topic.slice(0, 5);
 let dbLocation=[]

 if(session==='$iiot')
 {
  
   // TAKING USER ID
   dbLocation=[collection.IIOT_SUPERVISOR,collection.IIOT_PROJECT_MANAGER,collection.IIOT_BUSINESS_OWNER]
   return new Promise(async(resolve,reject)=>
   {
     let querry
     let data
     let userId
     let correctLocation
     for(let i=0;i<=dbLocation.length-1;i++)
     {
     
       if(data!=null)
       {
         break
  
       }
       querry= {
        devices:{$elemMatch:{secondary_key_subscribe : topic}}
        }
       data=await db.get().collection(dbLocation[i]).findOne(querry)
       console.log(dbLocation[i]);
       correctLocation=dbLocation[i]
       if(data)
       {
        console.log(data._id.toString());
        userId=data._id.toString()
        // dataAdder(userId,context,collection.CHART_DATA_IIOT)

       }
       else{
         console.log("Not found in " +dbLocation[i] );
       }
      
     
  
  
     }
     if(context==='krs')
     {
      let querry= {
        _id:objectId(userId),
        devices:{$elemMatch:{secondary_key_subscribe : topic}}
         }
         console.log(querry);
         console.log(correctLocation);
     let a= await db.get().collection(correctLocation).update(querry,{ $set: 
        {
            "devices.$.firstConnect" : true
        } 
     })
     .then((response)=>{
     resolve(response)
        console.log(response);
       })
       
     }
     else
     {
      // dataAdder(userId,context,collection.CHART_DATA_IIOT)
    
      dataAdderOfDevice(context,userId,collection.CHART_DATA_IIOT)

     }


    })
    

 }
 
 
 
  




 // KEY CONFORMATION
 
 
        
    

          if(  context==='krs'  )
          {
            console.log('Conformation recieved ');
          
            return new Promise(async(resolve,reject)=>
            {
             // let positionToUpdate= await connector.connecter('dt')
             //connect it and get thh position to update the first connect 
             //use this link
             //https://stackoverflow.com/questions/23547340/mongodb-how-to-update-array-element-by-index-number
           
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

               
                  dataAdder(userId,context,collection.UART_SUBSCRIPTIONS)

                
              
                
              })

            }

  ///////////////  ////////////// ///////////////////////////  ///////////////  ////////////// ///////////////////////////  ///////////////  ////////////// ///////////////////////////
          });
          
    },
  
    






}

////
