var db =require('../config/connection')
var collection= require('../config/collections')
const mongodb=require('mongodb')
var objectId=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
var keygen = require("keygenerator");
var random=require('random')
var userHelpers=require('../helpers/user-helpers')
const binary=mongodb.Binary
var mqttKeyStore=require('../helpers/mqttKeysStore')
const fileUpload = require('express-fileupload')
const path = require("path");
const puppeteer = require("puppeteer");
 
const fs = require("fs-extra");
 
const hbs = require("handlebars");
const { password } = require('keygenerator/lib/keygen')
const { resolve } = require('path')
const async = require('hbs/lib/async')
////MAke sure to uncomment all data
function idSearcher (array,id){
    console.log("______________________   FROM ID SEARCH     ______________________ ");
    console.log(array)
    console.log(id);;
    console.log("______________________ ______________________ ______________________ ");
    for (let i=0;i<=array.length-1;i++)
    {
        
        if(array[i].primary_key===id)
        {
            console.log('ID FOUND');
            return i
        }
    }
}
function idSearcherLoadSharedChart (array,id){
    // console.log("______________________   FROM ID SEARCH     ______________________ ");
    // console.log(array)
    // console.log(id);;
    // console.log("______________________ ______________________ ______________________ ");
    for (let i=0;i<=array.length-1;i++)
    {
        
        if(array[i].Id===id)
        {
            console.log('ID FOUND');
            return i
        }
    }
}
module.exports={


    signUpBusinessOwner:(data)=>{
        return new Promise(async(resolve,reject)=>{
            
            let rnumber=random.int((min = 1000000), (max = 9999999))
            let accessControlID
            let aa='123'
            let pass=await bcrypt.hash(aa,10)
            let l='testbo@gmail.com'
         

        
            let obj={
                // nameOfBusiness:data.nameOfBusiness,
                // categoryOfBusiness:data.categoryOfBusiness,
                // sizeOfBusiness:data.sizeOfBusiness,
                // registredBusiness:data.registred,
                // noOfEmployees:data.noOfEmployees,
                // emailOfBusiness:data.emailOfBusiness,
                // phOfBusiness:data.phOfBusiness,
                // addressOfBusiness:data.addressOfBusiness,

                 userName:" George Mathews",
                 designation:'bo',
                 organization:'ITC  pvt Ltd',

                // emailOfOwner:data.emailOfOwner,
                // phOfOwner:data.phOfOwner,

                publicID:rnumber,
                password:pass,
                email:l,
                inviteTokensProjectManager:[],
                inviteTokensSupervisor:[],
                projectManager:[],
                supervisor:[],
                addedToDashboard:[],
                chartIds:[],
                accessLevel:1,


                devices:[],
                numberOfDevices:0,
                sharedCharts:[]

            }
            
           await  db.get().collection(collection.IIOT_BUSINESS_OWNER).insertOne(obj).then((res)=>{
         
                resolve(res)
                accessControlID=res.insertedId.toString() 
             
            })
            let accessControlObj={
                userId:accessControlID,
                accessLevel:1
            }
            
           await db.get().collection(collection.ACCESS_CONTROL).insertOne(accessControlObj).then((res)=>{
          console.log("Business Owner signuped successfully");
                resolve(res)

              
             
            })
            let dash={
                userName:"null",
                organization:"null",
                userId:accessControlID,
                //bo,pm,sv,d
                designation:"null",
                noOfPm:"null",
                pmImprovement:"null",
                svImprovement:"null",
                deviceImprovement:"null",
                noOfSv:"null",
                devices:"null",
                

            }
          
            
            
        })
        

    },
    doLogin:(userData,loc)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let dbLocation
            let response={}

            if(loc=='businessOwner')
            {
                dbLocation=collection.IIOT_BUSINESS_OWNER

            }
            else if(loc=='projectManager')
            {
                dbLocation=collection.IIOT_PROJECT_MANAGER

            }
            else if(loc=='supervisor')
            {
                dbLocation=collection.IIOT_SUPERVISOR

            }
            else{
                console.log('ERROR PASSED TO FUNCTION');
            }
            console.log('comparing e mail  with the database e mail....');
            console.log(dbLocation);
            let user=await db.get().collection(dbLocation).findOne({email:userData.email})
            
            if(user){
                console.log('decrypting the password....');
                console.log('comparing with database password.....');
               bcrypt.compare(userData.password,user.password).then((status)=>{
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
    dashboardData:(id,loc)=>{
        let dash
        return new Promise(async(resolve,reject)=>{
            if(loc==='projectManager')
            {
               dbLocation =collection.IIOT_PROJECT_MANAGER
            }
            else if(loc==='supervisor')
            {
                dbLocation=collection.IIOT_SUPERVISOR
            }
            else if(loc==='businessOwner')
            {
                dbLocation=collection.IIOT_BUSINESS_OWNER

            }
            else{
                console.log("ERROR PASSED TO FUNCTION AS PARAMETER");
            }
            await db.get().collection(dbLocation).findOne({ _id:objectId(id)}).then((res)=>{
                    console.log(res);
            if(loc==='businessOwner')
            {
                 dash={
                    userName:res.userName,
                    organization:res.organization,
                
                    //bo,pm,sv,d
                    designation:"bo",
                    noOfPm:res.projectManager.length,
                    pmImprovement:"0",
                    svImprovement:"0",
                    deviceImprovement:"0",
                    noOfSv:res.supervisor.length,
                    devices:res.devices.length,
                    
    
                }
            }
            else if(loc==='supervisor')
            {
                dash={
                    userName:res.nameOfSupervisor,
                    organization:res.organization,
                
                    //bo,pm,sv,d
                    designation:"su",
                    deviceImprovement:"0",
                    devices:res.devices.length,
                    
    
                }
            }
            else if(loc==='projectManager')
            {
                dash={
                    userName:res.nameOfProjectManager,
                    organization:res.organization,
                
                    //bo,pm,sv,d
                    designation:"pm",
               
                    svImprovement:"0",
                    deviceImprovement:"0",
                    noOfSv:res.supervisor.length,
                    devices:res.devices.length,
                    
    
                }
       

            }
            else{
                console.log("ERROR PASSED TO FUNCTION AS PARAMETER");
            }
            console.log(dash);
                      resolve(dash)
                    
                   
                  })

        })

    },

    createToken:(tokenBy,mail,userId,tokenFor)=>{
       
        let dbLocation
        let querry
        let generatedKey=keygen.password();
        let rnumber=random.int((min = 1000), (max = 9999))
        let tokenKey=rnumber+generatedKey
        let obj={
            email:mail,
            token:tokenKey
        }
        if(tokenBy==='businessOwner' && tokenFor==='supervisor')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
            querry={
                inviteTokensSupervisor:obj
            }
        }
       else if(tokenBy==='businessOwner' && tokenFor==='projectManager')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
            querry={
                inviteTokensProjectManager:obj
            }

        }
        else if(tokenBy==='projectManager' && tokenFor==='supervisor')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
            querry={
                inviteTokensSupervisor:obj
            }
        }
        else{
            console.log("ERROR PASSED TO THE FUNCTION CHECK [ CREATE TOCKEN ROUTS ]");
        }
        console.log(dbLocation);
      
        console.log(obj);
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(dbLocation).updateOne({ _id:objectId(userId)},
                {
                    $push: querry
                }
               ).then((data)=>{
                   
                 db.get().collection(dbLocation).findOne({ _id:objectId(userId)}).then((d)=>{

                    resolve({publicId:d.publicID,tokenID:tokenKey})
                })
  
                console.log("Token created  by "+tokenBy+" for "+ tokenFor );
              })
      })


    },

///////////////??#####???#?#?#?#?#?#?#?#??#?#?!    d  d d d d
//datas,userId, add this to function parameter
    addNewEmployee:(addedBy,addedPerson,data)=>{
        // here the abouve datas is actually data ....
        // it is givrn like that only for the api testing
        // let data={
        //     email:"bimalboby007@gmail.com",
        //     token:"3552uZeFDDEJ",
        //     publicID:3399359
        // }
        console.log("--------");
        console.log(data);
        let id
       let tockenEmailStatus=false
       let businessPublicIdStatus=false
       let higherDbLocation
       let newDbLocation
       let dataForm
       let obj
       let querry
       let deleteQuerry
       if(addedBy==='businessOwner' &&  addedPerson==='projectManager')
       {
        higherDbLocation=collection.IIOT_BUSINESS_OWNER
        newDbLocation=collection.IIOT_PROJECT_MANAGER
        dataForm='projectManager'
        querry= {
            inviteTokensProjectManager:{$elemMatch:{email : data.email, token : data.token}}
        }
        deleteQuerry={
            $pull:{'inviteTokensProjectManager':{token:data.token}}
        }
        

       }
       else if(addedBy==='businessOwner' &&  addedPerson==='supervisor')
       {
       
        higherDbLocation=collection.IIOT_BUSINESS_OWNER
        newDbLocation=collection.IIOT_SUPERVISOR
        dataForm='supervisor'
        querry= {
            inviteTokensSupervisor:{$elemMatch:{email : data.email, token : data.token}}
        }
        deleteQuerry={
            $pull:{'inviteTokensSupervisor':{token:data.token}}
        }

       }
       else if(addedBy==='projectManager' &&  addedPerson==='supervisor')
       {
        higherDbLocation=collection.IIOT_PROJECT_MANAGER
        newDbLocation=collection.IIOT_SUPERVISOR
        dataForm='supervisor'
     
        querry= {
            inviteTokensSupervisor:{$elemMatch:{email : data.email, token : data.token}}
        }
        deleteQuerry={
            $pull:{'inviteTokensSupervisor':{token:data.token}}
        }
        

       }

// VALIDATING THE TOKEN AND EMAIL
        return new Promise(async(resolve,reject)=>{
           let tokenFromDB= await db.get().collection(higherDbLocation).findOne(querry)
          
           if(tokenFromDB)
           {
            tockenEmailStatus=true
           }

         let publicID= await db.get().collection(higherDbLocation).findOne({publicID: parseInt(data.publicid)})
         
         console.log(publicID);
         if(publicID)
            {
                businessPublicIdStatus=true
            }
              if(tockenEmailStatus && businessPublicIdStatus)
              {
//  FORMING DATA  IF VALID
                if(dataForm==='supervisor')
                {
                    obj={
                        nameOfSupervisor:data.dname,
                        
                        designation:'su',
                        organization:publicID.organization,
       
                    
                        email:data.email,
                        password:await bcrypt.hash(data.password,10),
                        ph:data.phno,
                        token:data.token,
                        chartIds:[],
                   
                        businessPublicId:parseInt(data.publicid),
    
    
    
                        
                        addedToDashboard:[],
                        accessLevel:3,
                      

                        devices:[],
                        numberOfDevices:0,
                        sharedCharts:[]
    
    
                    }

                }
                else if(dataForm==='projectManager')
                {
                     obj={
                        nameOfProjectManager:data.dname,
                        designation:'pm',
   
                        organization:publicID.organization,
                        email:data.email,
                        password:await bcrypt.hash(data.password,10),
                        ph:data.phno,
                        token:data.token,
                        chartIds:[],
                   
                        businessPublicId:parseInt(data.publicid),
    
    
    
                        inviteTokensSupervisor:[],
                        supervisor:[],
                        addedToDashboard:[],
                        accessLevel:2,
                        publicID:parseInt(data.publicid),

                       
                        devices:[],
                        numberOfDevices:0,
                        sharedCharts:[]
    
    
                    }

                }
                
// CREATING REQUIRED MEMBER
                return new Promise(async(resolve,reject)=>{
                    await db.get().collection(newDbLocation).insertOne(obj).then((res)=>{
                        
                        console.log(res.insertedId.toString() );
                        id=res.insertedId.toString() 
                        console.log(addedPerson+ "  Added  Successfully "+ "by " + addedBy);

          
                      })
                       let pmObj={
                        userId:id

                       }
                      let accessControlObj={
                          userId:id,
                          accessLevel:obj.accessLevel

                          
                      }
                       
           await db.get().collection(collection.ACCESS_CONTROL).insertOne(accessControlObj).then((res)=>{
         
            resolve({res:true})
          
         
        })
// CONNECTING IT TO THE HIGHER LEVEL
                    if(addedBy==='businessOwner' && addedPerson==='projectManager')
                    {
                        querry={
                            projectManager: pmObj

                        }

                    }
                    else if(addedBy==='businessOwner' && addedPerson==='supervisor')
                    {
                        querry={
                            supervisor: pmObj

                        }

                    }
                    else if(addedBy==='projectManager' && addedPerson==='supervisor')
                    {
                        querry={
                            supervisor: pmObj

                        }

                    }
                      await db.get().collection(higherDbLocation).updateOne({publicID:parseInt(data.publicid)},
                      {
                          $push: querry
                      }
                     ).then((res)=>{
                         console.log("Assigned to "+addedBy);
                        resolve(res)
                        /////
       
                     db.get().collection(higherDbLocation).updateOne({publicID:parseInt(data.publicid)},deleteQuerry).then((res)=>{
                            console.log('deleted the token id..');
                            resolve(res)
                            console.log(res);
                        }) 
                        
                        /////
          
                      })
              })
              
              

              }else{
                  console.log("No permission to signUp to this company >>>[  INVALID TOKEN ID OR EMAIL OR COMPANY ID  ]");
                  resolve(false)
              }
      
            })
    },
    
    shareChart:(chartId,deviceId,shareTo,shareToUserId)=>{
        let dbLocation
        let querry
        return new Promise(async(resolve,reject)=>{
            if(shareTo==='projectManager')
            {
               dbLocation =collection.IIOT_PROJECT_MANAGER
            }
            else if(shareTo==='supervisor')
            {
                dbLocation=collection.IIOT_SUPERVISOR
            }
            else if(shareTo==='businessOwner')
            {
                dbLocation=collection.IIOT_BUSINESS_OWNER

            }
            else{
                console.log("ERROR PASSED TO FUNCTION AS PARAMETER");
            }
            querry= {
                deviceId:deviceId,
                iiotData:{$elemMatch:{Id : chartId}}
            }
            let chartData=await db.get().collection(collection.CHART_DATA_IIOT).findOne(querry)
            // console.log(chartData);
            let data={
                deviceId:chartData.deviceId,
                chartId:chartId
            }
            let querryToPushSharedChartData={
                sharedCharts:data
            }
            await db.get().collection(dbLocation).updateOne({ _id:objectId(shareToUserId)},
            {
                $push: querryToPushSharedChartData
            }
           ).then((data)=>{
            //    console.log(data);
            resolve(data)

            console.log("Chart of ID: "+chartId+" of the device "+ deviceId+" shared to the "+ shareTo );
          })
        })


    },

    loadDataFromSharedChart:(userId,chartOf)=>{
        return new Promise(async(resolve,reject)=>{
            let dbLocation
            if(chartOf==='projectManager')
            {
               dbLocation =collection.IIOT_PROJECT_MANAGER
            }
            else if(chartOf==='supervisor')
            {
                dbLocation=collection.IIOT_SUPERVISOR
            }
            else if(chartOf==='businessOwner')
            {
                dbLocation=collection.IIOT_BUSINESS_OWNER

            }
            else{
                console.log("ERROR PASSED TO FUNCTION AS PARAMETER");
            }
      
           let data= await db.get().collection(dbLocation).findOne({_id:objectId(userId)})// search with id and device id 
           let ids=data.sharedCharts

           let finalSharedData=[]
           let querry
           let idOfSharedCharts=[]
           let deviceIdOFSharedCharts=[]
            // console.log(ids.length);
           for(let i=0;i<= ids.length-1;i++)
           {
            querry= {
                deviceId:ids[i].deviceId,
                iiotData:{$elemMatch:{Id : ids[i].chartId}}
                 }
                 idOfSharedCharts.push(ids[i].chartId)
                 deviceIdOFSharedCharts.push(ids[i].deviceId)
                //  console.log(querry);
                 let d= await db.get().collection(collection.CHART_DATA_IIOT).findOne(querry)
                 finalSharedData.push(d)

           }
           let final=[]
        for(let i=0;i<=finalSharedData.length-1;i++)
        {
            let a=finalSharedData[i]
            // console.log(a);
                // console.log("___________________");
                console.log(a.iiotData[i]);
                let pos=idSearcherLoadSharedChart(a.iiotData,idOfSharedCharts[i])
                // console.log(a.iiotData[pos]);
                final.push(a.iiotData[pos])

        }
          console.log("****************************************************************************************************************");
        
        //   console.log(final); 
          resolve(finalSharedData)
        })

    },



// Make sure to change the datas to the data ...It is for testing api
    addDevice:(userID,ownedBy,d)=>{
    let data
       

        return new Promise(async(resolve,reject)=>{
            let dbLocation
            // Validity check
            let validity=await userHelpers.keyValidator(d.sno)
            console.log(validity);
            if(validity.status==true){

            
             data={
                primary_key:d.sno,
                defaultTopic:validity.defaultTopic,
                deviceNames:d.nickname,
    
    
    
    
    
             }
            }
            else{
                resolve({status:"error"})
                
            }
            //selecting the collection to insert
            if(ownedBy==='businessOwner')
            {
                dbLocation=collection.IIOT_BUSINESS_OWNER
              
            
            }
            else if (ownedBy==='projectManager')
            {
                dbLocation=collection.IIOT_PROJECT_MANAGER
                console.log(dbLocation);

            }
            else if (ownedBy==='supervisor')
            {
                dbLocation=collection.IIOT_SUPERVISOR
                console.log(dbLocation);
            }
            else{
                console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
            }
            let querry
            let obj
            let generatedKey=keygen.password();
            let rnumber=random.int((min = 1000), (max = 9999))
             var secKey=rnumber+generatedKey
            obj={
                primary_key:data.primary_key,
                secondary_key_publish:secKey,
                secondary_key_subscribe:"$iiot"+secKey,
                defaultTopic:data.defaultTopic,
                deviceNames:data.deviceNames,
                firstConnect:false,
                pinsUsed:0





            }
            querry={
                devices:obj
            }
            // Addding to the DB
            db.get().collection(dbLocation).updateOne({ _id:objectId(userID)},
            {
                $push: querry
            }
           ).then((response)=>{
             console.log('Device added successfully');
                resolve({status:"success"})
            })
            mqttKeyStore.addKeysToCollection(["$iiot"+secKey])

        })

    },
    
    viewProjectManagers:(id)=>{
  
        return new Promise(async(resolve,reject)=>{
            let data=[]
            await db.get().collection(collection.IIOT_BUSINESS_OWNER).findOne({ _id:objectId(id)}).then((response)=>{
             console.log('FOUND...');
             for(let i=0;i<response.projectManager.length;i++)
             {
                console.log(response.projectManager[i].userId);
                data.push(response.projectManager[i].userId)

             }
             console.log(data);
            
                resolve(data)
            })

        })
        
    },
    viewSupervisors:(id,pos)=>{
        let dbLocation
        if(pos==='businessOwner')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
          
        
        }
        else if (pos==='projectManager')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
          

        }
     
        else{
            console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        }
        return new Promise(async(resolve,reject)=>{
            let data=[]
            await db.get().collection(dbLocation).findOne({ _id:objectId(id)}).then((response)=>{
             console.log('FOUND...');
             for(let i=0;i<response.supervisor.length;i++)
             {
                console.log(response.supervisor[i].userId);
                data.push(response.supervisor[i].userId)

             }

            
                resolve(data)
            })

        })
        
    },

    dataOfProjectManagers:(array)=>{
        return new Promise(async(resolve,reject)=>{
            let data=[]
            for(let i=0;i<array.length;i++)
            {
           let a= await db.get().collection(collection.IIOT_PROJECT_MANAGER).findOne({ _id:objectId(array[i])})
           data.push(a)
            }
            console.log(data);
            resolve(data)

        })


    },
    dataOfSupervisors:(array,pos)=>{
        let dbLocation=collection.IIOT_SUPERVISOR
        
        // if(pos==='businessOwner')
        // {
        //     dbLocation=collection.IIOT_BUSINESS_OWNER
          
        
        // }
        // else if (pos==='projectManager')
        // {
        //     dbLocation=collection.IIOT_PROJECT_MANAGER
        //     console.log(dbLocation);

        // }
     
        // else{
        //     console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        // }
        return new Promise(async(resolve,reject)=>{
            let data=[]
            for(let i=0;i<array.length;i++)
            {
           let a= await db.get().collection(dbLocation).findOne({ _id:objectId(array[i])})
           console.log(a);
           data.push(a)
            }
            console.log(data);
            resolve(data)

        })


    },
    deviceData:(id,pos)=>{
        let dbLocation

        if(pos==='businessOwner')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
          
        
        }
        else if (pos==='projectManager')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
            console.log(dbLocation);

        }
        else if (pos==='supervisor')
        {
            dbLocation=collection.IIOT_SUPERVISOR
            console.log(dbLocation);

        }
     
        else{
            console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        }
  
        return new Promise(async(resolve,reject)=>{
            let deviceIds=[]
            let deviceNames=[]
            let devices=[]
            await db.get().collection(dbLocation).findOne({ _id:objectId(id)}).then((response)=>{
             console.log('FOUND...');

             for(let i=0;i<response.devices.length;i++)
             {
                
                deviceIds.push(response.devices[i].primary_key)
                deviceNames.push(response.devices[i].deviceNames)
                devices.push(response.devices[i])

             }
            
            
                resolve({deviceIds,devices,deviceNames})
            })

        })
        
    },
    dataOfDevices:(array)=>{
        let dbLocation=collection.CHART_DATA_IIOT
       console.log(array);
       console.log(dbLocation);
        return new Promise(async(resolve,reject)=>{
            let data=[]
            for(let i=0;i<array.length;i++)
            {
           let a= await db.get().collection(dbLocation).findOne({ deviceId:array[i]})

           data.push(a)
            }

            resolve(data)

        })


    },
    dataCleanerforChart:(array)=>{
        for(let i=0;i<array.length;i++)
        {
        
         for(let j=0;j<array[i].iiotData.length;j++)
         {

            for(let k=0;k<array[i].iiotData[j].values.length;j++)
            {
   
               console.log(array[i].iiotData[j].values[k].value);
   
            }

         }

      
        }

    },
  
    //add data as a parameter ...for testing it  left as this
    addSensor:(userId,deviceId,to,max,chartDataStore,d)=>{
        data={
            parameter:d.type,
            nickname:d.nickname

        }
        let dbLocation
        if(to==='businessOwner')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
          
        
        }
        else if (to==='projectManager')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
            console.log(dbLocation);

        }
        else if (to==='supervisor')
        {
            dbLocation=collection.IIOT_SUPERVISOR
            console.log(dbLocation);
        }
        else{
            console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        }
        return new Promise(async(resolve,reject)=>{
            console.log(deviceId);
            console.log(dbLocation);
            let chartCollection=await db.get().collection(chartDataStore).findOne({deviceId:deviceId})
            let user=await db.get().collection(dbLocation).findOne({"devices.primary_key":deviceId})
            console.log(user);
            let dataPos=idSearcher(user.devices,deviceId)
            console.log(user.devices[dataPos]);
            let deviceData=user.devices[dataPos]



            // let maxCount=userData.numberOfDevices*6
            // console.log("MAX :"+maxCount)
            // console.log("USED"+userData.pinsUsed)
         

    
      
           console.log(deviceData);
           let maxCount=max
           console.log(max);
         
         if(chartCollection)
        {
           
            if( deviceData.pinsUsed+1<=maxCount)
            {
                console.log("CONDITION SATISFIEDDDDDDDDDDD>>>>>>>>>>>>>");
                
               
     
     
                let id=keygen.password();
                let obj={
                    Id:id,
                    parameter:data.parameter,
                    nickname:data.nickname,
                    values:[]
                }
     
                db.get().collection(chartDataStore).updateOne({ deviceId:deviceId},
                {
                    $push: { iiotData: obj }
                }
               ).then((response)=>{
                console.log(obj.Id+"))))))))))))O");
                let id={
                    id:obj.Id,
                    deviceId:deviceId
                }
                db.get().collection(dbLocation).updateOne({ _id:objectId(userId)},
                    {
                        $push: { chartIds: id }
                    }
                   ).then((res)=>{
    
                    
                 console.log(res);
                  })

                resolve(response)
              })
              let newValue=deviceData.pinsUsed+1
              console.log(newValue);
              let querry= {
                _id:objectId(userId),
                devices:{$elemMatch:{primary_key : deviceId}}
                 }
                 console.log(querry);
             let a= await db.get().collection(dbLocation).update(querry,{ $set: 
                {
                    "devices.$.pinsUsed" : newValue
                } 
             })
             .then((response)=>{
             resolve(response)
                console.log(response);
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
                iiotData:[
                   {
                    Id:id,
                    parameter:data.parameter,
                    nickname:data.nickname,
                    min:[],
                    max:[],
                    alert:false,
                    values:[]
                   }
                ]
             

            }
            await db.get().collection(chartDataStore).insertOne(obj).then((response)=>{
                resolve(response)
            
            })
            let newValue=deviceData.pinsUsed+1
            let querry= {
                _id:objectId(userId),
                devices:{$elemMatch:{primary_key : deviceId}}
                 }
                 console.log(querry);
             let a= await db.get().collection(dbLocation).update(querry,{ $set: 
                {
                    "devices.$.pinsUsed" : newValue
                } 
             })
             .then((response)=>{
              
                let i={
                    id:obj.Id,
                    deviceId:deviceId
                }
                db.get().collection(dbLocation).updateOne({ _id:objectId(userId)},
                    {
                        $push: { chartIds: i }
                    }
                   ).then((res)=>{
    
                    
                 console.log(res);
                  })
             resolve(response)
                console.log(response);
               })
           

        }
  
        })
    
    },  
    
    getDevices:(id,des)=>
    {
        return new Promise(async(resolve,reject)=>{
        let dbLocation
        let ids=[]
        let name=[]
        if(des==='businessOwner')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
            //from bo //su
            //po //su
            //su
            
               await db.get().collection(dbLocation).findOne({ _id:objectId(id)}).then(async(data)=>
               {
                
                for (let i = 0; i < data.devices.length; i++)
                 {
                  
                  
                   ids.push(data.devices[i].primary_key)
                   name.push(data.devices[i].deviceNames)

                    
                }
           
                // let obj={
                //     ids:ids,
                //     name:name
                // }
                //   console.log(obj);

                // checking for SV from BO

                if(data.supervisor.length!=0)
                {
                    let userIdOfSupervisors=[]
           
                    for (let i = 0; i < data.supervisor.length; i++)
                     {
                   
                        userIdOfSupervisors.push(data.supervisor[i].userId)
                    
                  
                    }
                    console.log(userIdOfSupervisors);
                    for (let j = 0; j < userIdOfSupervisors.length; j++) 
                    {
                         await db.get().collection(collection.IIOT_SUPERVISOR).findOne({ _id:objectId(userIdOfSupervisors[j])}).then((data)=>{
              
                            if(data.devices.length!=0)
                            {
                                
                                ids.push(data.devices[j].primary_key)
                                name.push(data.devices[j].deviceNames)
                         
                            }

                        })
                        
                        
                    }
                    console.log(ids);


                }
                 // checking for PM from BO
                 if(data.projectManager.length!=0)
                {
                    let userIdOfProjectManager=[]
                    let supervisorsUnderProjectManagers=[]

                    for (let i = 0; i < data.projectManager.length; i++)
                     {
            
                        userIdOfProjectManager.push(data.projectManager[i].userId)
                  
                    }
        
                    for (let j = 0; j < userIdOfProjectManager.length; j++) 
                    {
                        await db.get().collection(collection.IIOT_PROJECT_MANAGER).findOne({ _id:objectId(userIdOfProjectManager[j])}).then((data)=>{
                       
                            if(data.devices.length!=0)
                            {
                                ids.push(data.devices[j].primary_key)
                                name.push(data.devices[j].deviceNames)
                            }
                    

                        })
                        
                    }
                   for (let v = 0; v < userIdOfProjectManager.length; v++) {
                    await   db.get().collection(collection.IIOT_PROJECT_MANAGER).findOne({ _id:objectId(userIdOfProjectManager[v])}).then((data)=>{
            
                        if(data.devices.length!=0)
                        {
                            ids.push(data.devices[v].primary_key)
                            name.push(data.devices[v].deviceNames)
                        }
                        if(data.supervisor.length!=0)
                        {
                            for (let k = 0; k < data.supervisor.length; k++) 
                            {
                                
                                    supervisorsUnderProjectManagers.push(data.supervisor[k].userId)
                                
                                
                            }
                        }
                    

                    })
                    
                   }
                    // devices of supervisors under Pm
                    for (let z = 0; z < supervisorsUnderProjectManagers.length; z++) 
                    {
                        await db.get().collection(collection.IIOT_SUPERVISOR).findOne({ _id:objectId(supervisorsUnderProjectManagers[z])}).then((data)=>{
                   
                            if(data.devices.length!=0)
                            {
                                ids.push(data.devices[z].primary_key)
                                name.push(data.devices[z].deviceNames)
                            }

                        })
                        
                    }


                }



               })
               resolve({ids:ids,name:name})

       
           
                 


        }
        else if (des==='projectManager')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
            let supervisorsUnderProjectManagers=[]
            await db.get().collection(dbLocation).findOne({ _id:objectId(id)}).then((data)=>
               {

                for (let i = 0; i < data.devices.length; i++)
                 {

                  
                   ids.push(data.devices[i].primary_key)
                   name.push(data.devices[i].deviceNames)

                    
                }
            })
            
            await db.get().collection(dbLocation).then(async(data)=>{
                      // checking for PM from BO
              
                         if(data.supervisor.length!=0)
                         {
                             for (let k = 0; k < data.supervisor.length; k++) 
                             {
                                 
                                     supervisorsUnderProjectManagers.push(data.supervisor[k].userId)
                                 
                                 
                             }
                         }
                     
 
                   
                     // devices of supervisors under Pm
                     for (let z = 0; z < supervisorsUnderProjectManagers.length; z++) 
                     {
                        await db.get().collection(collection.IIOT_SUPERVISOR).findOne({ _id:objectId(supervisorsUnderProjectManagers[z])}).then((data)=>{
          
                             if(data.devices.length!=0)
                             {
                                 ids.push(data.devices[z].primary_key)
                                 name.push(data.devices[z].deviceNames)
                             }
 
                         })
                         
                     }
 
 
                 
                })
          
            
                resolve({ids:ids,name:name})

        }
        else if (des==='supervisor')
        {
            dbLocation=collection.IIOT_SUPERVISOR
            await db.get().collection(dbLocation).findOne({ _id:objectId(id)}).then((data)=>
            {

             for (let i = 0; i < data.devices.length; i++)
              {
     
               
                ids.push(data.devices[i].primary_key)
                name.push(data.devices[i].deviceNames)

                 
             }
         })
         resolve({ids:ids,name:name})
         

        }
        else{
            console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        }
        
    })

    },

    getSensors:(id)=>{
        let ids=[]
        let name=[]
        return new Promise(async(resolve,reject)=>{
         console.log("IDDD");
          console.log(id);
           await db.get().collection(collection.CHART_DATA_IIOT).findOne({ deviceId:id}).then((data)=>{

        
             console.log(data.iiotData);
             for (let i = 0; i < data.iiotData.length; i++) 
             {
                  ids.push(data.iiotData[i].Id)
                  name.push(data.iiotData[i].nickname)
                  
             }
             resolve({ids,name})

             
        })
        })


    },





    chartData:(id,chartId)=>{
        return new Promise(async(resolve,reject)=>{
        let dbLocation=collection.CHART_DATA_IIOT
    //     console.log("0000000000");
    //    console.log(id);
    //    console.log(chartId);
       console.log("0000000000");
            await db.get().collection(dbLocation).findOne({userID:id}).then((response)=>{
                if(response)
                {
                    console.log(response.iiotData);
                    console.log(chartId);
                    let pos= idSearcherLoadSharedChart(response.iiotData,chartId)
                    // console.log("_____#_#_#_#_##");
                     console.log(response.iiotData[pos]);

              

                 resolve(response.iiotData[pos])
                }else{
                    console.log("No data ");
                }
                  
             })
         })

    },
    addToDashboard:(userId,chartId,des)=>{
        let dbLocation
        if(des==='businessOwner')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
          
        
        }
        else if (des==='projectManager')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
         

        }
        else if (des==='supervisor')
        {
            dbLocation=collection.IIOT_SUPERVISOR

        }
        else{
            console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        }
        return new Promise(async(resolve,reject)=>{
      
       
            await db.get().collection(dbLocation).updateOne({ _id:objectId(userId)},
            {
                $push: { addedToDashboard: chartId }
            }
           ).then((res)=>{
                 resolve(res)
             })
         })

    },
    chartIds:(id,des,select)=>{
        let dbLocation
        if(des==='businessOwner')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
          
        
        }
        else if (des==='projectManager')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
         

        }
        else if (des==='supervisor')
        {
            dbLocation=collection.IIOT_SUPERVISOR

        }
        else{
            console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        }
        return new Promise(async(resolve,reject)=>{
      
           
                await db.get().collection(dbLocation).findOne({_id:objectId(id)}).then((response)=>{
                    if(select==='dashboard')
                    {
                      
                        resolve(response.addedToDashboard)
                    }
                    else if(select==='device')
                    {
                        resolve(response.chartIds.map(({id}) => id))
                    }
                    else
                    {
                        console.log("ERROR PASSED IN SELECT PARAMETER !!!!! ");
                    }
                     resolve(response.chartIds.map(({id}) => id))
                 })
             })
    

    },
   

    removeFromHome:(id,chartId,des)=>{
        let dbLocation
        let deleteQuerry
        if(des==='businessOwner')
        {
            dbLocation=collection.IIOT_BUSINESS_OWNER
          
        
        }
        else if (des==='projectManager')
        {
            dbLocation=collection.IIOT_PROJECT_MANAGER
         

        }
        else if (des==='supervisor')
        {
            dbLocation=collection.IIOT_SUPERVISOR

        }
        else{
            console.log("ERROR IN THE FUNCTION TO ADD THE DEVICE IN IIOT [ CHECK THE FUNCTION PARAMETERS PASSED ]");
        }
        return new Promise(async(resolve,reject)=>{
       deleteQuerry={
        $pull:{'addedToDashboard':{id:chartId}}
    }
           
                await db.get().collection(dbLocation).updateOne({_id:objectId(id)},deleteQuerry).then((res)=>{
                    resolve({status:true})
                })
             })
            },
    


    storeReport:(file)=>{
        return new Promise(async(resolve,reject)=>{
       
           await db.get().collection(collection.STORE_PDF).insertOne(file).then((response)=>{
         console.log(response);
                resolve(response)
            })
        })
        

    },
    createPdf:()=>{
        return new Promise((resolve, reject) => {
//PENDING
// data retriveal,template style

            const data = {
                "users": [
                    {
                      "name": "KANE WILLIAMSON",
                      "age": 32,
                      "country": "NEW ZEALAND"
                    },
                    {
                      "name": "ROSS TAYLOR",
                      "age": 38,
                      "country": "NEW ZEALAND"
                    },
                    {
                      "name": "TOM LATHAM",
                      "age": 31,
                      "country": "NEW ZEALAND"
                    },
                    {
                      "name": "TIM SOUTHEE",
                      "age": 33,
                      "country": "NEW ZEALAND"
                    }
                  ]

            }
            const compile = async function (templateName, data) {
                const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
                const html = await fs.readFile(filePath, 'utf8');
                console.log(html)
                return hbs.compile(html)(data);
            };
            
            (async function () { 
                let pdf
            
                try {
            
                    const browser = await puppeteer.launch();
            
                    const page = await browser.newPage();
            
                    console.log(data)
            
                    const content = await compile('index', data);
            
                    console.log(content)
            
                    await page.setContent(content);
                        a='./routes/vv.pdf'
                    pdf= await page.pdf({
                        path: a,
                        format: 'A4',
                        printBackground: true
                    })
            
                    console.log("done creating pdf");
           
                    await browser.close();
            
                    // process.exit();
                    
                } catch (e) {
                    console.log(e);
                }
                resolve(pdf)
            
            })();
          
          
            
        })

    }

}

