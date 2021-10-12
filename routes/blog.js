const { response } = require('express');
var express = require('express');
const adminHelpers = require('../helpers/blog-admin-helpers');
var router = express.Router();
var userHelpers=require('../helpers/blog-user-helpers')

// Middleware
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}
//



/* GET home page. */
router.get('/', function(req, res, next) {
  userHelpers.blogViewer().then((blogs)=>{
  userHelpers.mostViwed().then((mostViewed)=>{

  
  res.render('blog/user/blog-index', {admin:false,blogs,mostViewed});
  })
})
 
});
router.get('/read-blog/:id',(req,res)=>{
  let id=req.params.id
  userHelpers.clickCounter(id)
  userHelpers.readAblog(req.params.id).then((blog)=>{
    console.log(blog.comments);
    let category=blog.category
    userHelpers.recomendations(category).then((catBlogs)=>{
      console.log(catBlogs);
      console.log(catBlogs.length);
      ////
      for(i=0;i<catBlogs.length;i++)
      {
        if(catBlogs[i]._id==id)
        {
          var deleteValue=i

        }else{
          console.log("not found");
        }
        
      }
      catBlogs.splice(deleteValue,1)
      /////
      res.render('blog/user/blog-read-blog',{admin:false,blog,catBlogs})
    })

  })
})
router.post('/submit-comment/:id',(req,res)=>{
  userHelpers.emailCollector(req.body)
  userHelpers.commentAdder(req.params.id,req.body).then((response)=>{
    res.redirect('/');
  })
})
router.post('/enquiry',(req,res)=>{
  console.log(req.body);
  userHelpers.emailCollector(req.body)
  userHelpers.enquiryCollector(req.body).then((response)=>{
    res.redirect('/')
  })
})
  router.post('/subscribe',(req,res)=>{
    userHelpers.subscribe(req.body).then((response)=>{
      res.redirect('/')
    })
  })



router.get('/like-blog/:id',(req,res)=>{
  userHelpers.likeBlog(req.params.id).then((response)=>{
    res.redirect('/')
  })

})
router.get('/login',(req,res)=>{
  res.render('login')
})
router.get('/signup',(req,res)=>{
  res.render('signup')
})
router.post('/signup',(req,res)=>{
  console.log(req.body);
  userHelpers.doSignup(req.body).then((response)=>{
    res.redirect('/login')
  })
})
router.post('/login', function(req, res, next) {
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response)=>{
    console.log(response.user._id);
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalied Username or Password"
      res.redirect('/login')
    }
  })
  
  
  
  });
module.exports = router;
