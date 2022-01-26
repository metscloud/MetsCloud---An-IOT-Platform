var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
var keygen = require("keygenerator");
var random=require('random')
const { response } = require('express');
const { number } = require('keygenerator/lib/keygen');
var sensorDataProgrammingMode=require('../static-data/sensorData-programmingMode')


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
                primary_key:userData.key,
                secondary_key:secKey,
                defaultTopic:moveDefaultTopic.defaultTopic,
                firstConnect:false,
                liveMode:'uart'
 
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
    deleteUartParameter:(userId,deleteId)=>{
        return new Promise(async(resolve,reject)=>{
            let data=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({userID:userId})
            let location=idSearcher(data.uartMode,deleteId)
            console.log(location);
            let array=data.uartMode
            array.splice(location,1)
            console.log('######');
            console.log(array);
            await db.get().collection(collection.UART_SUBSCRIPTIONS).deleteOne({userID:userId})
            let obj={
                userID:data.userID,
                uartMode:array
            }
            await db.get().collection(collection.UART_SUBSCRIPTIONS).insertOne(obj).then((res)=>{
                console.log('DONE');
                resolve(res)
            })   
             
        })


    },
  
    getValues:(userId,id)=>{
    
    return new Promise(async(resolve,reject)=>{
        let data=await db.get().collection(collection.UART_SUBSCRIPTIONS).findOne({userID:userId})
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
secondaryKeyTaker:(id)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.USER_CREADATIONALS).findOne({_id:objectId(id)}).then((response)=>{
            resolve(response.secondary_key)
        })
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

}


}