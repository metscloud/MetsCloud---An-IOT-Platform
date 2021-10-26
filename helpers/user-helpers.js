var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
var keygen = require("keygenerator");
var random=require('random')
const { response } = require('express');
const { number } = require('keygenerator/lib/keygen');
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
                defaultTopic:moveDefaultTopic.defaultTopic,
                firstConnect:false
 
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

    },
    uartAndProgrammingModeStore:(userId,data)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({userID:userId})
            if(user)
            {
                let id=keygen.password();
                let obj={
                    Id:id,
                    parameter:data.parameter,
                    nickname:data.nickname,
                    values:[]
                }

                db.get().collection(collection.UART_SUBSCRIPTIONS).updateOne({ userID: userId },
                {
                    $push: { uartMode: obj }
                }
            ).then((response)=>{
                resolve(response)
            })
            }
            else
            {
            let id=keygen.password();
            let obj=
            {
                userID:userId,
                uartMode:[
                   {
                    Id:id,
                    parameter:data.parameter,
                    nickname:data.nickname,
                    values:[]
                   }
                ]
             

            }
            await db.get().collection(collection.UART_SUBSCRIPTIONS).insertOne(obj).then((response)=>{
                resolve(response)
            })
        }
        
        })
    },
    getAllSecKeys:()=>{
        return new Promise(async(resolve,reject)=>{
            let keys=await db.get().collection(collection.USER_CREADATIONALS).find({}).project({_id:0,email:0,password:0,defaultTopic:0,firstConnect:0, primary_key:0,ph:0,}).toArray()
            let finalKeys=[]
            let length=keys.length
            for(let i=0; i<=length-1;i++)
            {
                
                let temp=keys[i].secondary_key
                finalKeys.push(temp)
                 
            }
            console.log('####### TOPICS ARE #######');
            console.log(finalKeys);
            resolve(finalKeys)
        })

    },
 
    getUartSubscribtions:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let data=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({userID:id})
            resolve(data)
        })

    },
    idSearcher:(array,id)=>{
        for (let i=0;i<=array.length-1;i++)
        {
            
            if(array[i].Id===id)
            {
                return i
            }
            
        }
    }


}