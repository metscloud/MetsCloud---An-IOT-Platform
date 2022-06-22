var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
var keygen = require("keygenerator");
var random=require('random')
const { response } = require('express');
const { number } = require('keygenerator/lib/keygen');
var sensorDataProgrammingMode=require('../static-data/sensorData-programmingMode');
const async = require('hbs/lib/async');
const userHelpers=require('../helpers/user-helpers')





function locator(array,key)
{
    for(let i=0;i<=array.length-1;i++)
    {
        if(array[i]===key)
        {
            return(i)
        }
      
    }
}



module.exports={




connecter:(nameOfKey,key,userId)=>{
    // haveing a sub function to find the position of the element in the array
    return new Promise(async(resolve,reject)=>{
         let position
         let obj
        let user=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})
        
        if(nameOfKey==="primary")
        {
            position=locator(user.primary_key,key)
            console.log(position);
             obj={
                pos:position,
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position],
                deviceName:user.deviceNames[position],
                firstConnect:user.pinsUsed[position],
                pinsUsed:user.pinsUsed[position]
            }

        }
        else if(nameOfKey==="sec_pub")
        {
            position=locator(user.secondary_key_publish,key)
             obj={
                pos:position,
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position],
                deviceName:user.deviceNames[position],
                firstConnect:user.pinsUsed[position],
                pinsUsed:user.pinsUsed[position]
            }
            
        }
        else if(nameOfKey==="sec_sub")
        {
            position=locator(user.secondary_key_subscribe,key)
             obj={
                pos:position,
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position],
                deviceName:user.deviceNames[position],
                firstConnect:user.pinsUsed[position],
                pinsUsed:user.user.pinsUsed[position]
            }
            
        }
       else  if(nameOfKey==="dt")
        {
            position=locator(user.defaultTopic,key)
            obj={
                pos:position,
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position],
                deviceName:user.deviceNames[position],
                firstConnect:user.pinsUsed[position],
                pinsUsed:user.pinsUsed[position]
           }
            
        }
       else if(nameOfKey==="fconnect")
        {
            position=locator(user.firstConnect,key)
            obj={
                pos:position,
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position],
                deviceName:user.deviceNames[position],
                firstConnect:user.pinsUsed[position],
                pinsUsed:user.pinsUsed[position]
           }
            
        }

        else if(nameOfKey==="deviceId")
        {
            position=locator(user.primary_key,key)
            obj={
                pos:position,
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position],
                deviceName:user.deviceNames[position],
                firstConnect:user.pinsUsed[position],
                pinsUsed:user.pinsUsed[position]
           }

        }
        else{
            console.log("wrong " + nameOfKey);
        }
        resolve(obj)
    })






}






}