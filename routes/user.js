var express = require('express');
const { response } = require('../app');
var router = express.Router();
var objectId=require('mongodb').ObjectID
const { ObjectID } = require('bson')
var userHelpers=require('../helpers/user-helpers')
var subscribe=require('../mqtt-clients/subscribe')
var publish=require('../mqtt-clients/publish')
var sensorDataUart=require('../static-data/sensorData-uart')
var sensorDataProgrammingMode=require('../static-data/sensorData-programmingMode')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    console.warn("User already logged in");
    next()
  }
  else{
    res.render('login')
  }
}
router.get('/catching',(req,res)=>{
  res.render('catching')

})
router.post('/generatekey',(req,res)=>{
  userHelpers.keyGenaratorCatching().then((response)=>{
    res.redirect(req.get('referer'));
  })
})

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index',{admin:false});

});
// router.get('/:id', (req, res)=> {
//   console.log(req.params.id);
//   userHelpers.checkCachingData(req.params.id).then((response)=>{
//     console.log('CATCH ID FOUNDED');
//     console.log(response);
//     res.json(response);
//   })

 

// });
router.get('/signup', function(req, res, next) {
  res.render('signup',{admin:false});
});
router.post('/signup',(req,res)=>{
  console.log(req.body);
  userHelpers.keyValidator(req.body.key).then((status)=>{
    if(status.status)
    {
      console.log('KEY  FOUND IN DB ###');
      userHelpers.doSignup(req.body).then((response)=>{
        userHelpers.keyDeleter(req.body.key)
        console.log('key deleted');
        res.redirect('/')
      })
    }
    else{
      console.log("#################### NO KEY FOUND  #############");
      res.redirect('/')
    }
  })
  
})
router.get('/login',(req,res)=>{
  userHelpers.getAllSecKeys()
  res.render('login',{admin:false})

})
  router.post('/login',async(req,res)=>{
    console.log('submitting login page requestes...');
    console.log(req.body);
    userHelpers.doLogin(req.body).then(async(response)=>{
      let uartStatus=false
      let dataUart
      let option1
      let option2
      let option3
      let option4
      let option5

      //status checker
      if(response.status)
      {
        // req.session.loggedIn=true
        req.session.user=response.user
        let firstConnect=false
        if(response.user.firstConnect===true)
        {
          firstConnect=true
        }
        else
        {
          firstConnect=false
        }

        console.log(response.user);
        let data=
        {
          email:response.user.email,
          dtopic:response.user.defaultTopic,
          liveMode:response.user.liveMode,
        }
        console.log(data);

       
        if(response.user.liveMode==='uart')
        {
          uartStatus=true
          console.log(uartStatus);
          console.log(req.session.user._id);
          let a=req.session.user._id     
           await userHelpers.getUartSubscribtions(objectId(a).toString()).then((response)=>
          {
         
            if(response)
            { 
               dataUart=response.uartMode
               console.log(dataUart);
        
            }
            else
            {
              console.log('Failed to fetch data');
              
            }
            })


        }
        else
        {
          option1=await userHelpers.settingPinToOptions('1')
          option2=await userHelpers.settingPinToOptions('2')
          option3=await userHelpers.settingPinToOptions('3')
          option4=await userHelpers.settingPinToOptions('4')
          option5=await userHelpers.settingPinToOptions('5')
          
        }
        res.render('account',{data,firstConnect,uartStatus,dataUart,option1,option2,option3,option4,option5})
      }
      else
      {
        req.session.loginErr="Invalied Username or Password"
        res.redirect('/')
      }
    })
  })
  router.get('/connect/:id',(req,res)=>{
    userHelpers.pickSecondaryKey(req.params.id).then((secKey)=>{
      publish.publishSecondaryKeyToDevice(req.params.id,secKey)

      
      })
 
 
  
  })

  router.get('/uart',(req,res)=>{
    userHelpers.getUartSubscribtions(req.session.user._id).then((response)=>{
    if(response)
    { 
      let data=response.uartMode
      res.render('uart',{data})
    }else{
      res.render('uart')
    }
    })
  })

  router.post('/uart-submit',async(req,res)=>{
    let urtParameter=req.body
     await userHelpers.uartAndProgrammingModeStore(req.session.user._id,urtParameter)
     publish.publishCountToDevice(req.session.user._id).then((status)=>{
      res.redirect(req.get('referer'));
     })
   
  })
  router.get('/uart-delete-parameter/:id',async(req,res)=>{
    console.log(req.params.id);
   await userHelpers.deleteUartParameter(req.session.user._id,req.params.id)
   publish.publishCountToDevice(req.session.user._id).then((status)=>{
    res.redirect('/uart')
  })
 
  
  })
  router.get('/uart-view-parameter/:id',(req,res)=>{
    console.log(req.params.id);
    userHelpers.getValues(req.session.user._id,req.params.id).then((response)=>{
    console.log(response);
    if(response)
    {
      let data=response
      let type='line'
      res.render('view-parameter',{data,type})
    }else{
      res.render('view-parameter')
    }

    })
  })


  router.get('/selected-uart',(req,res)=>{

    userHelpers.liveModeChanger(req.session.user._id,'uart').then((data)=>{
  
   
     if(data.status)
     {
      res.redirect(req.get('referer'));
      
     }
     else
     {
      console.log('failed to update the live mode');
     }
    })
  })


  router.get('/selected-programming',(req,res)=>{
    userHelpers.liveModeChanger(req.session.user._id,'pro').then(async(data)=>{
      if(data.status)
      {
        res.redirect(req.get('referer'));
      }
      else
      {
       console.log('failed to update the live mode');
      }
     })

  })
  router.get('/programmingmode',async(req,res)=>{
    let option1=await userHelpers.settingPinToOptions('1')
    let option2=await userHelpers.settingPinToOptions('2')
    let option3=await userHelpers.settingPinToOptions('3')
    let option4=await userHelpers.settingPinToOptions('4')
    let option5=await userHelpers.settingPinToOptions('5')
    res.render('pro',{option1,option2,option3,option4,option5})
  })
  router.post('/pro-submit',async(req,res)=>
  {
    let data=req.body
     arrayData=[]
     console.log(typeof data.parameter1);

    if(data.parameter1 != 'none')
    {
      await userHelpers.keyTaker(data.parameter1).then((response)=>{
      console.log(response);
      arrayData.push(response.key)
    })
    }
    else
    {
      let pin='0'
      arrayData.push(pin)
    }
    
      if(data.parameter2 != 'none')
      {
        await userHelpers.keyTaker(data.parameter2).then((response)=>{
        console.log(response);
        arrayData.push(response.key)
      })
    
      }
      else
      {
        let pin='0'
        arrayData.push(pin)
      }
    if(data.parameter3 != 'none')
    {
      await userHelpers.keyTaker(data.parameter3).then((response)=>{
      console.log(response);
      arrayData.push(response.key)
  })
  
    }
    else
    {
      let pin='0'
      arrayData.push(pin)
    }
      if(data.parameter4 != 'none')
      {
        await userHelpers.keyTaker(data.parameter4).then((response)=>{
        console.log(response);
        arrayData.push(response.key)
 })
      }
      else
      {
        let pin='0'
        arrayData.push(pin)
      }

    if(data.parameter5 != 'none')
    {
      await userHelpers.keyTaker(data.parameter5).then((response)=>{
      console.log(response);
      arrayData.push(response.key)
    })
  
    }
    else
    {
      let pin='0'
      arrayData.push(pin)
    }
    console.log(arrayData);
    userHelpers.secondaryKeyTaker(req.session.user._id).then((secKey)=>{
      console.log(secKey);
      let pin1=false
      let led1=false
      let pin2=false
      let led2=false
      let pin3=false
      let led3=false
      let pin4=false
      let led4=false
      let pin5=false
      let led5=false
      let pwm2=false
      let pwm3=false
      let pwm4=false
      let pwm5=false
      
      if(data.parameter2!='none')
      {
         pin2=true
         if(data.parameter2=='led')
        {
          led2=true
        }
        if(data.parameter2=='pwm')
        {
          pwm2=true
        }
      }
      if(data.parameter3!='none')
      {
         pin3=true
         if(data.parameter3=='led')
        {
          led3=true
        }
        if(data.parameter3=='pwm')
        {
          pwm3=true
        }
      }
      if(data.parameter4!='none')
      {
         pin4=true
         if(data.parameter4=='led')
        {
          led4=true
        }
        if(data.parameter4=='pwm')
        {
          pwm4=true
        }
      }
      if(data.parameter5!='none')
      {
        pin5=true
        if(data.parameter5=='led')
        {
          led5=true
        }
        if(data.parameter5=='pwm')
        {
          pwm5=true
        }
         
      }
      publish.publishPinValuesToDevice(secKey,arrayData).then((status)=>{
        res.render('pro-spec',{pin1,pin2,pin3,pin4,pin5,led1,led2,led3,led4,led5,pwm2,pwm3,pwm4,pwm5,arrayData})
      })
    })
    })
    
    router.post('/calculation-submit',(req,res)=>{
      console.log(req.body);

      // here the status is to indicate the led is on/off
      let status2=false
      let status3=false
      let status4=false
      let status5=false
      let dataForPublishToDevice=['0']
      let pwmData=['0']

      // PIN 2
      if(req.body.onOrOff2)
      {
        if(req.body.onOrOff2=='ON')
        {
          status2=true
        }
        let d=userHelpers.proModeDataMaker(status2,req.body.onDuration2,req.body.offDuration2)
          dataForPublishToDevice.push(d)
        console.log(dataForPublishToDevice); 
      }
      else
      {
        dataForPublishToDevice.push('0')
      }
      if(req.body.timePeriod2)
      {
        let data=userHelpers.proPwmDataMaker(req.body.timePeriod2,req.body.dutyCycle2)
        pwmData.push(data)
      }
      else
      {
        pwmData.push('0')
      }

       // PIN 3
       if(req.body.onOrOff3)
       {
         if(req.body.onOrOff3=='ON')
         {
           status3=true
         }
         let d=userHelpers.proModeDataMaker(status3,req.body.onDuration3,req.body.offDuration3)
           dataForPublishToDevice.push(d)
         console.log(dataForPublishToDevice); 
       }
       else
       {
        dataForPublishToDevice.push('0')
      }
      if(req.body.timePeriod3)
      {
        let data=userHelpers.proPwmDataMaker(req.body.timePeriod3,req.body.dutyCycle3)
        pwmData.push(data)
      }
      else
      {
        pwmData.push('0')
      }

        // PIN 4
      if(req.body.onOrOff4)
      {
        if(req.body.onOrOff4=='ON')
        {
          status4=true
        }
        let d=userHelpers.proModeDataMaker(status4,req.body.onDuration4,req.body.offDuration4)
          dataForPublishToDevice.push(d)
        console.log(dataForPublishToDevice); 
      }
      else
      {
        dataForPublishToDevice.push('0')
      }
      if(req.body.timePeriod4)
      {
        let data=userHelpers.proPwmDataMaker(req.body.timePeriod4,req.body.dutyCycle4)
        pwmData.push(data)
      }
      else
      {
        pwmData.push('0')
      }

       // PIN 5
       if(req.body.onOrOff5)
       {
         if(req.body.onOrOff5=='ON')
         {
           status5=true
         }
         let d=userHelpers.proModeDataMaker(status5,req.body.onDuration5,req.body.offDuration5)
           dataForPublishToDevice.push(d)
         console.log(dataForPublishToDevice); 
       }
       else
       {
        dataForPublishToDevice.push('0')
      }
      if(req.body.timePeriod5)
      {
        let data=userHelpers.proPwmDataMaker(req.body.timePeriod5,req.body.dutyCycle5)
        pwmData.push(data)
      }
      else
      {
        pwmData.push('0')
      }
      console.log(req.body.keys);
      console.log(dataForPublishToDevice);
      console.log(pwmData);
      let fin=req.body.keys
      let finData=fin.split(",")
      for(let i=0;i<=4;i++)
      {
        if(finData[i]=='led')
        {
       
          finData[i]=dataForPublishToDevice[i]
          console.log(dataForPublishToDevice[i]);
        }
        if(finData[i]=='pwm')
        {
          finData[i]=pwmData[i]
        }
  
    
      }
      console.log('FINALLLLLLLLL');
      console.log(finData);
      console.log(JSON.stringify(finData));
     
       publish.publishProModeDataLedToDevice(req.session.user._id,finData).then((status)=>{
         console.log('DOne');

       })
    })
  
    


  

module.exports = router;
