var express = require('express');
var router = express.Router();
var blogAdminHelpers=require('../helpers/blog-admin-helpers');
var blogUserHelpers=require('../helpers/blog-user-helpers')
var adminHelpers=require('../helpers/admin-helpers')
var storeProductHelper=require('../helpers/store-product-helpers')
var storeAdminHelpers=require('../helpers/store-admin-helpers')
var broker=require('../mqtt-broker/broker-aedes')


/* GET users listing. */
router.get('/', function(req, res, next) {
  let clients=broker.connectedClients()
  let numberClients=broker.numberOfConnectedClients()
  let sta=broker.masterDeviceStatus()
  console.log(sta);
 res.render('admin',{admin:true,clients,numberClients})
});
router.get('/key',(req,res)=>{
  adminHelpers.keyViewer().then((allKeys)=>{
    res.render('key-details',{admin:true,allKeys})
  })
})
router.post('/generatekey',(req,res)=>{
  for(let i=0;i<req.body.number;i++)
  {
    adminHelpers.keyGenarator()
  }
  console.log(req.body);
  res.redirect('/')
})
//////////// b l o g
router.get('/view-blogs', function(req, res, next) {
  blogUserHelpers.blogViewer().then((blogs)=>{
   res.render('blog/admin/blog-admin',{admin:true,blogs});
 
  })
  
 });
 router.post('/add-blog',(req,res)=>{
  blogAdminHelpers.blogadder(req.body)
   res.redirect('/admin')
 
 })
 router.get('/edit-blog/:id',async(req,res)=>{
   console.log(req.params.id);
   let blogs=await blogAdminHelpers.blogViewer(req.params.id)
   res.render('blog/admin/blog-edit-blogs',{admin:true,blogs})
   
 })
 
 router.post('/update-blog/:id',(req,res)=>{
  blogAdminHelpers.updateBlog(req.params.id,req.body).then((response)=>{
     res.redirect('/admin')
   })
 
 })
 router.get('/delete-blog/:id',(req,res)=>{
  blogAdminHelpers.deleteBlog(req.params.id).then((response)=>{
   console.log("Deleted succcessfully....");
   res.redirect('/admin')
 })
 })
 router.get('/view-data',(req,res)=>{
  blogAdminHelpers.viewEmails().then((email)=>{
   res.render('blog/admin/blog-view-emails',{admin:true,email})
 })
 
 })
 router.get('/edit-comments/:id',async(req,res)=>{
   console.log(req.params.id);
   let blogs=await blogAdminHelpers.blogViewer(req.params.id)
   res.render('blog/admin/blog-edit-comments',{admin:true,blogs})
   
 })
 router.post('/update-comments/:id',(req,res)=>{
   console.log(req.body);
   var arraySize=req.body.email.length
   var checker=req.body.email
   console.log(typeof checker);
   if (typeof checker=='string')
   {
     arraySize=1
     var ifChecker=true
   }else{
     console.log("more than 1");
   }
   for(let i=0;i<arraySize;i++)
   {
    blogAdminHelpers.updateComments(req.params.id,i,req.body,ifChecker)
   .then((response)=>{
     
   })
 }
   res.redirect('/admin')
 })
 router.get('/view-enquiry',(req,res)=>{
  blogUserHelpers.enquiryViewer().then((enquiry)=>{
     res.render('blog/admin/blog-enquiry-viewer',{admin:true,enquiry})
   })
 })
 router.get('/subscribe',(req,res)=>{
  blogAdminHelpers.subscribeViewer().then((subscribe)=>{
     res.render('blog/admin/blog-subscribe-viewer',{admin:true,subscribe})
   })
 })
 router.post('/delete-comment/:id',(req,res)=>{
   console.log(req.body);
   console.log(req.params.id);
   blogAdminHelpers.deleteComment(req.params.id,req.body).then((response)=>{
     res.redirect('/admin')
   })
 })
 ////////////########## S T O R E #######/////
 router.get('/view-products', function(req, res, next) {
  storeProductHelper.getAllProducts().then((products)=>{
     
      console.log(products);
      res.render('store/admin/view-products',{admin:true,products})
  
})
})


router.get('/add-product',function(req,res){

res.render('store/admin/add-product',{admin:true})
})
router.post('/add-product',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
  storeProductHelper.addproduct(req.body,(id)=>
  {

      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
          if(!err){
              res.render('store/admin/add-product')
          }else{
              console.log(err);
          }
      })
      
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId);
  storeProductHelper.deleteProduct(proId).then((response)=>(
      res.redirect('/admin/')
  ))

})
router.get('/edit-product/:id',async(req,res)=>{
  let product=await storeProductHelper.getProductDetails(req.params.id)
  console.log('taking data from database...');
  console.log(product);
  res.render('admin/edit-product',{admin:true,product})
})

router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
  storeProductHelper.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/admin')
      if(req.files.Image){
          let image=req.files.Image
          image.mv('./public/product-images/'+id+'.jpg')


      }
  })
})
router.get('/get-users',(req,res)=>{
  storeAdminHelpers.getAllUsers().then((users)=>{
      console.log(users);
      res.render('admin/get-users',{admin:true,users})
  })
})

router.get('/delete-user/:id',(req,res)=>{
  let id=req.params.id
  userHelpers.deleteUser(id).then((response)=>{
      res.redirect('/admin/get-users')
  })

}

)

router.get('/admin-signup',(req,res)=>{
  console.log(' rendering signup page...');
  res.render('admin/signup') 
  console.log('signup page loaded successfully....');
})
router.post('/admin-signup',(req,res)=>{
  console.log('submitting sign up page requests...');
  userHelpers.adminSignup(req.body).then((response)=>{
    console.log(response);
    req.session.loggedIn=true
    req.session.admin=response
    res.redirect('/')
  })


})



router.get('/admin-login',(req,res)=>{
  
  res.render('admin/login',{admin:true})
})
router.post('/login',(req,res)=>{
  console.log('submitting login page requestes...');
  console.log(req.body);
  storeAdminHelpers.adminLogin(req.body).then((response)=>
  {
    if(response.status==true){
      req.session.loggedIn=true
      req.session.admin=response.admin
      res.redirect('/get-users',{admin:true})
    }else{
      req.session.loginErr="Invalied Username or Password"
      res.redirect('/admin/login',{admin:true})
    }
  })
})
router.get('/sales',(req,res)=>{
    var type=120
    res.render('admin/sales',{admin:true,type})
})
router.get('/add-sensors',async(req,res)=>{
  await adminHelpers.getSensors().then((sensors)=>{
    res.render('add-sensors',{admin:true,sensors})
  
  })

  
})
router.post('/add-new-sensors',(req,res)=>{
  console.log(req.body);
  adminHelpers.addSensors(req.body).then((response)=>{
    console.log(response);
    res.redirect('/admin/add-sensors')
  })
 
  
})
router.get('/delete-sensor/:id',(req,res)=>{
  let id=req.params.id
  adminHelpers.deleteSensor(id).then((response)=>{
    res.redirect('/admin/add-sensors')
  })
})

router.get('/edit-sensor/:id',(req,res)=>{
adminHelpers.sensorDataToEdit(req.params.id).then((data)=>{
  console.log('oooooo');
  let dataToEdit=data[0]
  res.render('edit-sensor',{admin:true,dataToEdit})
})
})
router.post('/edit-sensorddata/:id',(req,res)=>{
  console.log(req.params.id);
  console.log(req.body);
  adminHelpers.editSensorDetails(req.params.id,req.body).then((res)=>{
    console.log('DONE');
  })

})

router.get('/testing',(req,res)=>{

  adminHelpers.getTesting().then((data)=>{
    console.log(data);
    res.render('testing',{admin:true,data})
  })
})

router.post('/searchfortopics',(req,res)=>{
console.log(req.body);
adminHelpers.searchTopics(req.body).then((data)=>{
  console.log("IS NOT THERE :"+data);
  console.log(data);
  res.render('searchNonTopic',{admin:true,data})

})
})

router.get('/cleardata',(req,res)=>{
  adminHelpers.clearData().then((data)=>{
    console.log(data);
    res.redirect('/admin/testing')
  })
})

router.get('/soil',(req,res)=>{
  res.render('soil',{admin:true})
})

router.get('/closeMQTTserver',(req,res)=>{
  // need to set authetication for this process
  broker.closeMQTTserver()
  
  res.redirect(req.get('referer'));

})

module.exports = router;



