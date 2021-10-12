var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
var keygen = require("keygenerator");
var random=require('random')
const { response } = require('express')
module.exports={



    doSignup:(userData)=>{
        return new  Promise(async(resolve,reject)=>{
            console.log('encrypting the password......');
            let generatedKey=keygen.password();
            let rnumber=random.int((min = 1000), (max = 9999))
             var secKey=rnumber+generatedKey
             var moveDefaultTopic=await db.get().collection(collection.KEYS).findOne({key:userData.key})
            let obj={
                email:userData.email,
                password:userData.password,
                ph:userData.ph,
                primary_key:userData.key,
                secondary_key:secKey,
                defaultTopic:moveDefaultTopic.defaultTopic
 
            }
           obj.password=await bcrypt.hash(obj.password,10)
           console.log('encrypted successfully.....');
            db.get().collection(collection.USER_CREADATIONALS).insertOne(obj).then((data)=>{
                console.log('user signup details stored to database.');
                resolve(data)
            })
        })
    },
    

    keyValidator:(recivedKey)=>{
        return new Promise(async(resolve,reject)=>{
            let status=false
           let device= await db.get().collection(collection.KEYS).findOne({key:recivedKey})
           if(device)
           {
               resolve({status:true})
           }else{
               resolve({status:false})
           }
        })
    },
    keyDeleter:(recivedKey)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.KEYS).deleteOne({key:recivedKey}).then((response)=>{
                resolve(response)
            })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            console.log('comparing e mail  with the database e mail....');
            let user=await db.get().collection(collection.USER_CREADATIONALS).findOne({email:userData.Email})
            if(user){
                console.log('decrypting the password....');
                console.log('comparing with database password.....');
               bcrypt.compare(userData.Password,user.password).then((status)=>{
                    if(status)
                    {
                        console.log("login success.....");
                        response.user=user
                        response.status=true
                        response.user=user
                        resolve(response)
                    }else{
                        console.log("login failed....");
                        resolve({status:false})
                    }
                    
                })
            }else{
                console.log("login failed....");
                resolve({status:false})
           }
        })
    },
    pickSecondaryKey:(dTopic)=>{
        return new Promise(async(resolve,reject)=>{
            let secondaryKey=await db.get().collection(collection.USER_CREADATIONALS).findOne({defaultTopic:dTopic})
            resolve(secondaryKey.secondary_key)
        })

    }
 

}