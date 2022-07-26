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
const connector=require('./connectorForUserData')
var mqttKeyStore=require('../helpers/mqttKeysStore')
let newD=[]
exports.newDC =[this.newDC];


////_________________________________ Helpers for user-helpers_________________________________
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function idSearcher (array,id){
    for (let i=0;i<=array.length-1;i++)
    {
        
        if(array[i].Id===id)
        {
            console.log('ID FOUND');
            return i
        }
    }
}



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
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
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
                primary_key:[userData.key],
                secondary_key_publish:[secKey],
                secondary_key_subscribe:["$sub"+secKey],
                defaultTopic:[moveDefaultTopic.defaultTopic],
                deviceNames:[userData.nameOfDevice],
                firstConnect:[false],
                liveMode:'uart',
                numberOfDevices:1,
                pinsUsed:[0]
 
            }
            let objSec={
                secondary_key_subscribe:"$sub"+secKey,

            }
         
            newD.push(obj.secondary_key_subscribe)
           obj.password=await bcrypt.hash(obj.password,10)
           console.log('encrypted successfully.....');
            db.get().collection(collection.USER_CREADATIONALS).insertOne(obj).then((data)=>{
                console.log('user signup details stored to database.');
                
                resolve(obj)
            })
            mqttKeyStore.addKeysToCollection(["$sub"+secKey])
            // db.get().collection(collection.SUB_TOPICS).insertOne(objSec).then((data)=>{
            //     console.log('added to subscribe topics');
                
            //     resolve(objSec)
            // })
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
            console.log("Deleting the key..... : " + recivedKey);
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
            let keys={
                secondary_key_publish:secondaryKey.secondary_key_publish,
                secondary_key_subscribe:secondaryKey.secondary_key_subscribe
            }
            resolve(keys)
        })

    },
    uartAndProgrammingModeStore:(userId,data,deviceId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(deviceId);
            let user=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({deviceId:deviceId})
            console.log(user);
            let userData=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})
            console.log(userData);
            // let maxCount=userData.numberOfDevices*6
            // console.log("MAX :"+maxCount)
            // console.log("USED"+userData.pinsUsed)
           let deviceData= await connector.connecter("deviceId",deviceId,userId)
           let pos=deviceData.pos

    
      
           console.log(deviceData);
           let maxCount=6
         
         if(user)
        {
           
            if( deviceData.pinsUsed+1<=maxCount)
            {
                console.log("CONDITION SATISFIEDDDDDDDDDDD>>>>>>>>>>>>>");
                console.log(userData);
               
     
     
                let id=keygen.password();
                let obj={
                    Id:id,
                    parameter:data.parameter,
                    nickname:data.nickname,
                    values:[]
                }
     
                db.get().collection(collection.UART_SUBSCRIPTIONS).updateOne({ deviceId:deviceId},
                {
                    $push: { uartMode: obj }
                }
               ).then((response)=>{
                resolve(response)
              })
              let newValue=userData.pinsUsed[pos]+1
              await db.get().collection(collection.USER_CREADATIONALS).updateOne({_id:userData._id}, { $set: { ["pinsUsed." + pos]: newValue} }).then((response)=>{
             resolve(response)
         
               })
     

            }
            else{
                console.log("LIMIT REACHED FOR DEVICE.....ADD NEW DEVICE OR DELETE PINS");
            }
           
          
        }

         else
            {
            let id=keygen.password();
            let obj=
            {
                userID:userId,
                deviceId:deviceId,
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
            let newValue=userData.pinsUsed[pos]+1
            await db.get().collection(collection.USER_CREADATIONALS).updateOne({_id:userData._id}, { $set: { ["pinsUsed." + pos]: newValue} }).then((response)=>{
           resolve(response)
       
             })

        }
  
        })
    },
    getAllSecKeys:()=>{
        return new Promise(async(resolve,reject)=>{
            let keys=await db.get().collection(collection.SUB_TOPICS).find({}).toArray()
            // console.log(keys);
            let keysToSubscribe=[]
            for(let i=0;i<=keys.length-1;i++)
            {
                let data=keys[i].secondary_key_subscribe
                keysToSubscribe.push(data)


            }
            console.log("");
            console.log("");
            console.log("                        >>>>>>>>>      T    O    P    I   C   S        <<<<<<<<<<<<  " );
            console.log("");
            console.log("");
            console.log("                                              No.of topics :   "+keysToSubscribe.length +"                                    ");
            console.log("");
             for (let index = 0; index < keysToSubscribe.length; index++) {
               console.log(keysToSubscribe[index]);
               
             }
        
            // let finalKeys=[]
            // let fixedFinal=[]
            // let length=keys.length
            // for(let i=0; i<=length-1;i++)
            // {
                
            //     let temp=keys[i].secondary_key_subscribe
            //     console.log(temp);
            //     finalKeys.push(temp)
                 
            // }
            // console.log('####### TOPICS ARE #######');
            // for(let j=0;j<=finalKeys.length-1;j++)
            // {
            //     let array=finalKeys[j]
            //     for(k=0;k<=array.length-1;k++)
            //     {
            //         fixedFinal.push(array[k])
            //     }


            // }
            // console.log(fixedFinal);
            // resolve({fixedFinal)

            resolve(keysToSubscribe)
        })

    },
 
    getUartSubscribtions:(id,deviceId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(deviceId);
            let length=deviceId.length
            console.log(length);
            let data=[]

      
            
            // let uartData= {
            //     deviceIds:[],
            //     data:[data1,data2,data2,dataa3,data4,daata5,data6,0,0,0,]


            // }
            for(let i=0;i<=length-1;i++)
            {
               data[i]=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({userID:id,deviceId:deviceId[i]})
                 
              
            }
            console.log("PRINTING >>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<>>>>>>>>>><<<<<<<");
            for(let i=0;i<=data.length-1;i++)
            {
              console.log(data[i]);
                 
              
            }
       
 
            resolve(data)
        })

    },
    deleteUartParameter:(userId,deleteId,deviceId)=>{
        return new Promise(async(resolve,reject)=>{
            let data=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({deviceId:deviceId})
            let location=idSearcher(data.uartMode,deleteId)
            let userData=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})
            let deviceData= await connector.connecter("deviceId",deviceId,userId)
            let pos=deviceData.pos
            console.log(location);
            let array=data.uartMode
            array.splice(location,1)
            console.log('######');
            console.log(array);
            // await db.get().collection(collection.UART_SUBSCRIPTIONS).deleteOne({userID:userId})
            // let obj={
            //     userID:data.userID,
            //     uartMode:array
            // }
            // await db.get().collection(collection.UART_SUBSCRIPTIONS).insertOne(obj).then((res)=>{
            //     console.log('DONE');
            //     resolve(res)
            // })  
            await db.get().collection(collection.UART_SUBSCRIPTIONS).update({deviceId:deviceId},{$pull:{'uartMode':{Id:deleteId}}}).then((res)=>{
                console.log('DONE');
                resolve(res)
            }) 

            let newValue=userData.pinsUsed[pos]-1
            await db.get().collection(collection.USER_CREADATIONALS).updateOne({_id:userData._id}, { $set: { ["pinsUsed." + pos]: newValue} }).then((response)=>{
           resolve(response)
       
             })
             
        })


    },
  
    getValues:(userId,id,deviceId)=>{
    
    return new Promise(async(resolve,reject)=>{
        let data=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({deviceId:deviceId})
        let location=idSearcher(data.uartMode,id)
        let array=data.uartMode
        let newArray=array[location].values
        resolve(newArray)
    })
},

liveModeChanger:(id,mode)=>{

            return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_CREADATIONALS).updateOne({_id:objectId(id)}, {
                $set:{
                    "liveMode":mode
                }
            }).then((response)=>{
             
                resolve({status:true})

            })
          
       
    })
},

settingPinToOptions:(pin)=>{
    return new Promise(async(resolve,reject)=>{
          await db.get().collection(collection.SENSORS).find({pinNumber:pin}).toArray().then((pinData)=>{
              resolve(pinData)

            })
    })
},
keyTaker:(Name)=>{

        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.SENSORS).findOne({name:Name}).then((response)=>{
              resolve(response)
            })
        })

},
secondaryKeyTaker:(deviceId="2371QhglSxfX",userId)=>{
    return new Promise(async(resolve,reject)=>{
        let deviceData= await connector.connecter("deviceId",deviceId,userId)
        console.log(deviceData);
        resolve(deviceData.secondary_key_publish)
       
    })
},

proModeDataMaker:(onOrOff,onDuration,offDuration)=>
{
  
      
        if(onOrOff)
        {
            onOrOff='1'
        }
        else{
            onOrOff='0'
        }
        let data='MD'+`${onOrOff}`+'N'+`${onDuration}`+'F'+`${offDuration}`
        return data

},
proPwmDataMaker:(timePeriod,dutyCycle)=>{

    let data='WMP'+`${timePeriod}`+'C'+`${dutyCycle}`
    return data

},

deviceUpdater:(userId,data)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.USER_CREADATIONALS).updateOne({_id:objectId(userId)},{ $inc: { numberOfDevices: 1} }).then(async(response)=>{
            console.log("NEW DEVICE ADDED SUCCESSFULLY");
       
     
        let generatedKey=keygen.password();
        let rnumber=random.int((min = 1000), (max = 9999))
         var secKey=rnumber+generatedKey
        await db.get().collection(collection.USER_CREADATIONALS).updateMany({_id:objectId(userId)},{ $push: {primary_key: data.serialNo}}).then(async(response)=>{
            console.log("NEW DEVICE ADDED TO PRIMARY KEY SET");

        await db.get().collection(collection.USER_CREADATIONALS).updateMany({_id:objectId(userId)},{ $push: {pinsUsed: 0}}).then(async(response)=>{
            console.log("NEW DEVICE ADDED TO PIN  SET");
       
        await db.get().collection(collection.USER_CREADATIONALS).updateMany({_id:objectId(userId)},{ $push: {deviceNames: data.nickname}}).then(async(response)=>{
             console.log("NEW DEVICE NAME ADDED TO NAMES  SET");

        await db.get().collection(collection.USER_CREADATIONALS).updateMany({_id:objectId(userId)},{ $push: {secondary_key_publish: secKey}}).then(async(response)=>{
                console.log("NEW DEVICE ADDED TO SECONDARY PUBLISH  KEY SET");
                

        await db.get().collection(collection.USER_CREADATIONALS).updateMany({_id:objectId(userId)},{ $push: {secondary_key_subscribe: "$sub"+secKey}}).then(async(response)=>{
                console.log("NEW DEVICE ADDED TO SECONDARY SUBSCRIBE  KEY SET");
                mqttKeyStore.addKeysToCollection(["$sub"+secKey])
       

        await db.get().collection(collection.USER_CREADATIONALS).updateMany({_id:objectId(userId)},{ $push: {firstConnect:false}}).then(async(response)=>{
                console.log("NEW DEVICE ADDED TO FIRST CONNECT");
                
                
        let dtopic=await db.get().collection(collection.KEYS).findOne({key:data.serialNo})

        await db.get().collection(collection.USER_CREADATIONALS).updateMany({_id:objectId(userId)},{ $push: {defaultTopic:dtopic.defaultTopic}}).then((response)=>{
                console.log("NEW DEVICE ADDED TO Default Topic");
            

                db.get().collection(collection.KEYS).deleteOne({key:data.serialNo}).then((response)=>{
         
                    resolve(response)
                    console.log("key deleted....");
                })

                
    
                })
            })

            })
        })
    })
        })
        })
           })


    })
   

},


idCheckerInSubscribeTopicArray:()=>{
    let value="sub4387GGsRH9v6"
    let userId="62a2f8470ab53c80853d9e76"
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.USER_CREADATIONALS).find({
          _id: objectId(userId),
          secondary_key_subscribe: { $in: [value] },
        })
        .count();
      


    })


},


connecter:(nameOfKey,key,userId)=>{
    // haveing a sub function to find the position of the element in the array
    return new Promise(async(resolve,reject)=>{
         let position
         let obj
        let user=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})
        
        if(nameOfKey==="primary")
        {
            position=locator(user.primary_key,key)
             obj={
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position]
            }

        }
        else if(nameOfKey==="sec_pub")
        {
            position=locator(user.secondary_key_publish,key)
             obj={
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position]
            }
            
        }
        else if(nameOfKey==="sec_sub")
        {
            position=locator(user.secondary_key_subscribe,key)
             obj={
                primary_key:user.primary_key[position],
                secondary_key_publish:user.secondary_key_publish[position],
                secondary_key_subscribe:user.secondary_key_subscribe[position],
                defaultTopic:user.defaultTopic[position],
                firstConnect:user.firstConnect[position]
            }
            
        }
       else  if(nameOfKey==="dt")
        {
            position=locator(user.defaultTopic,key)
            obj={
               primary_key:user.primary_key[position],
               secondary_key_publish:user.secondary_key_publish[position],
               secondary_key_subscribe:user.secondary_key_subscribe[position],
               defaultTopic:user.defaultTopic[position],
               firstConnect:user.firstConnect[position]
           }
            
        }
       else if(nameOfKey==="fconnect")
        {
            position=locator(user.firstConnect,key)
            obj={
               primary_key:user.primary_key[position],
               secondary_key_publish:user.secondary_key_publish[position],
               secondary_key_subscribe:user.secondary_key_subscribe[position],
               defaultTopic:user.defaultTopic[position],
               firstConnect:user.firstConnect[position]
           }
            
        }
        else{
            console.log("wrong " + nameOfKey);
        }
        resolve(obj)
    })






},
getDevices:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let devices=await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(userId)})

      
        resolve(devices.primary_key)
    })
}

}
