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
    next()
  }
  else{
    res.render('store/user/login')
  }
}


/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index',{admin:false});

});
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
  router.post('/login',(req,res)=>{
    console.log('submitting login page requestes...');
    console.log(req.body);
    userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        let firstConnect=false
        if(response.user.firstConnect===true)
        {
          firstConnect=true
        }else{
          firstConnect=false
        }
        console.log(response.user);
        let data={
          email:response.user.email,
          dtopic:response.user.defaultTopic,
          liveMode:response.user.liveMode,
          

        }

        
        res.render('account',{data,firstConnect})
      }else{
        req.session.loginErr="Invalied Username or Password"
        res.redirect('/')
      }
    })
  })
  router.get('/connect/:id',verifyLogin,(req,res)=>{
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
       res.redirect('/uart')
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
    console.log(req.session.user._id);
    userHelpers.liveModeChanger(req.session.user._id,'uart').then((res)=>{
     console.log(res);
     if(res.status)
     {
      console.log('Successfully updated the live mode to UART MODE');
     }else{
      console.log('failed to update the live mode');
     }
    })
  })
  router.get('/selected-programming',(req,res)=>{
    userHelpers.liveModeChanger(req.session.user._id,'pro').then((res)=>{
      console.log(res);
      if(res.status)
      {
       console.log('Successfully updated the live mode to PROGRAMMING MODE');
      }else{
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
         if(data.parameter2=='aaa')
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
         if(data.parameter3=='lm35')
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
         if(data.parameter4=='yddddd')
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
        if(data.parameter5=='pdf')
        {
          led5=true
        }
        if(data.parameter5=='pwm')
        {
          pwm5=true
        }
         
      }
      publish.publishPinValuesToDevice(secKey,arrayData).then((status)=>{
        res.render('pro-spec',{pin1,pin2,pin3,pin4,pin5,led1,led2,led3,led4,led5,pwm2,pwm3,pwm4,pwm5})
      })
    })
    })
    
    router.post('/calculation-submit',(req,res)=>{
      console.log(req.body);
      let status2=false
      let status3=false
      let status4=false
      let status5=false
      let dataForPublishToDevice=[]

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
       publish.publishProModeDataLedToDevice(req.session.user._id,dataForPublishToDevice).then((status)=>{
         console.log('DOne');

       })
    })
  
    


  

module.exports = router;
