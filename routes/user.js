var express = require('express');
const { response } = require('../app');
var router = express.Router();
var userHelpers=require('../helpers/user-helpers')
var subscribe=require('../mqtt-clients/subscribe')
var publish=require('../mqtt-clients/publish')
var sensorData=require('../data/sensor-data')

/* GET home page. */
router.get('/', function(req, res, next) {
   let test=sensorData.temperature().LOCAL.akkkk[4].aa
   console.log(test);
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
  res.render('login',{admin:false})

})
  router.post('/login',(req,res)=>{
    console.log('submitting login page requestes...');
    console.log(req.body);
    userHelpers.doLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        console.log(response.user);
        let data={
          email:response.user.email,
          dtopic:response.user.defaultTopic

        }
        res.render('account',{data})
      }else{
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

module.exports = router;
