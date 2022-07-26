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
    console.log("______________________   FROM ID SEARCH     ______________________ ");
    console.log(array)
    console.log(id);;
    console.log("______________________ ______________________ ______________________ ");
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
        
            let obj={
                // nameOfBusiness:data.nameOfBusiness,
                // categoryOfBusiness:data.categoryOfBusiness,
                // sizeOfBusiness:data.sizeOfBusiness,
                // registredBusiness:data.registred,
                // noOfEmployees:data.noOfEmployees,
                // emailOfBusiness:data.emailOfBusiness,
                // phOfBusiness:data.phOfBusiness,
                // addressOfBusiness:data.addressOfBusiness,

                // nameOfOwner:data.nameOfOwner,
                // emailOfOwner:data.emailOfOwner,
                // phOfOwner:data.phOfOwner,

                publicID:rnumber,
                inviteTokensProjectManager:[],
                inviteTokensSupervisor:[],
                projectManager:[],
                supervisor:[],
                addedToDashboard:[],
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
                   console.log(data);
                resolve(data)
  
                console.log("Token created  by "+tokenBy+" for "+ tokenFor );
              })
      })


    },

///////////////??#####???#?#?#?#?#?#?#?#??#?#?!    d  d d d d
//datas,userId, add this to function parameter
    addNewEmployee:(addedBy,addedPerson)=>{
        // here the abouve datas is actually data ....
        // it is givrn like that only for the api testing
        let data={
            email:"bimalboby007@gmail.com",
            token:"9229gKjLaT9X",
            publicID:8929776
        }
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
            
         let publicID= await db.get().collection(higherDbLocation).findOne({publicID:data.publicID})
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
                        // nameOfSupervisor:data.nameOfSupervisor,
                        // tockenID:data.tockenID,
                        // email:data.email,
                        // ph:data.ph,
                        // address:data.address,
                        // businessPublicId:data.businessPublicId,
    
    
    
                        
                        addedToDashboard:[],
                        accessLevel:3,
                        publicID:data.publicID,

                        devices:[],
                        numberOfDevices:0,
                        sharedCharts:[]
    
    
                    }

                }
                else if(dataForm==='projectManager')
                {
                     obj={
                        // nameOfProjectManager:data.nameOfProjectManager,
                        // tockenID:data.tockenID,
                        // email:data.email,
                        // ph:data.ph,
                        // address:data.address,
                        // businessPublicId:data.businessPublicId,
    
    
    
                        inviteTokensSupervisor:[],
                        supervisor:[],
                        addedToDashboard:[],
                        accessLevel:2,
                        publicID:data.publicID,

                       
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
         
            resolve(res)
          
         
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
                      await db.get().collection(higherDbLocation).updateOne({publicID:data.publicID},
                      {
                          $push: querry
                      }
                     ).then((res)=>{
                         console.log("Assigned to "+addedBy);
                        resolve(res)
                        /////
       
                     db.get().collection(higherDbLocation).updateOne({publicID:data.publicID},deleteQuerry).then((res)=>{
                            console.log('deleted the token id..');
                            resolve(res)
                            console.log(res);
                        }) 
                        
                        /////
          
                      })
              })
              
              

              }else{
                  console.log("No permission to signUp to this company >>>[  INVALID TOKEN ID OR EMAIL OR COMPANY ID  ]");
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
            console.log(chartData);
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
               console.log(data);
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
      
           let data= await db.get().collection(dbLocation).findOne({_id:objectId(userId)})
           let ids=data.sharedCharts

           let finalSharedData=[]
           let querry
           let idOfSharedCharts=[]
           let deviceIdOFSharedCharts=[]
            console.log(ids.length);
           for(let i=0;i<= ids.length-1;i++)
           {
            querry= {
                deviceId:ids[i].deviceId,
                iiotData:{$elemMatch:{Id : ids[i].chartId}}
                 }
                 idOfSharedCharts.push(ids[i].chartId)
                 deviceIdOFSharedCharts.push(ids[i].deviceId)
                 console.log(querry);
                 let d= await db.get().collection(collection.CHART_DATA_IIOT).findOne(querry)
                 finalSharedData.push(d)

           }
           let final=[]
        for(let i=0;i<=finalSharedData.length-1;i++)
        {
            let a=finalSharedData[i]
            console.log(a);
                console.log("___________________");
                console.log(a.iiotData[i]);
                let pos=idSearcherLoadSharedChart(a.iiotData,idOfSharedCharts[i])
                console.log(a.iiotData[pos]);
                final.push(a.iiotData[pos])

        }
          console.log("****************************************************************************************************************");
        
          console.log(final); 
          resolve(finalSharedData)
        })

    },



// Make sure to change the datas to the data ...It is for testing api
    addDevice:(userID,ownedBy)=>{
        let data={
            primary_key:'asdd',
            defaultTopic:"dfs",
            deviceNames:"dsf",





        }

        return new Promise(async(resolve,reject)=>{
            let dbLocation
            // Validity check
            let validity=await userHelpers.keyValidator(data.key)
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
                resolve(response)
            })
            mqttKeyStore.addKeysToCollection(["$iiot"+secKey])

        })

    },
    //add data as a parameter ...for testing it  left as this
    addSensor:(userId,deviceId,to,max,chartDataStore)=>{
        data={
            parameter:'ddeeedd',
            nickname:'e4455'

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
             resolve(response)
                console.log(response);
               })
           

        }
  
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

