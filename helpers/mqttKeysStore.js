var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
var keygen = require("keygenerator");
var random=require('random')
// var firstDataCreation=false
module.exports={

addKeysToCollection:(keys)=>{
    console.log(keys);
    // let keysToStore
    // for(let i=0;i<=keys.length-1;i++)
    // {
    //     let obj={
    //         key:keys[i]
    //     }
    //  keysToStore.push(obj)



    // }
    // console.log(keysToStore);
    return new Promise((resolve,reject)=>{
        // if(firstDataCreation)
        // {
            db.get().collection(collection.MQTT_KEYS).updateOne(
                { name: "MetsCloudKeys" },
                { $push: { subscribeKeys: { $each: keys } } }
             ).then((response)=>{
                firstDataCreation=true
                resolve(response)
                console.log("< < Keys added to  MetsCloud successfully > > ");
            })
            
        // }
        // else
        // {
            // let firstObj={
            //     name:"MetsCloudKeys",
            //     subscribeKeys:[]
            // }
            
            // db.get().collection(collection.MQTT_KEYS).insertOne(firstObj).then((response)=>{
            //     firstDataCreation=true
            //     resolve(response)
            // })
            // db.get().collection(collection.MQTT_KEYS).updateOne(
            //     { name: "MetsCloudKeys" },
            //     { $push: { subscribeKeys: { $each: keys } } }
            //  ).then((response)=>{
            //     firstDataCreation=true
            //     resolve(response)
            //     console.log("Keys added to  MetsCloud successfully---2m ");
            // })

        // }
    })

},
getAllKeysOfMetsCloud:()=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.MQTT_KEYS).findOne({name:"MetsCloudKeys"}).then((response)=>{
          resolve(response.subscribeKeys)
        })
    })


}




}