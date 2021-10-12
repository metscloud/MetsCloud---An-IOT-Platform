var db =require('../config/connection')
var collection= require('../config/collections')
var objectId=require('mongodb').ObjectID
const { response } = require('../app')
const { commentAdder } = require('./user-helpers')


module.exports={

blogadder:(blog)=>{
    return new Promise ((resolve,reject)=>{
        db.get().collection(collection.BLOGS_COLLECTIONS).insertOne(blog).then((data)=>{
            console.log('Blog added successfully');
            resolve(data)
        })
    })
},

blogViewer:(blogId)=>{

    return new Promise((resolve,reject)=>{
        console.log(blogId);
        db.get().collection(collection.BLOGS_COLLECTIONS).findOne({_id:objectId(blogId)}).then((blogs)=>{
            resolve(blogs)
         
        })
      
    })
  
  },
  updateBlog:(blogId,data)=>{
      return new Promise((resolve,reject)=>{
          db.get().collection(collection.BLOGS_COLLECTIONS).updateOne({_id:objectId(blogId)},
          {
              $set:{
                  heading:data.heading,
                  blog:data.blog
              }
          }).then((response)=>{
              resolve(response)
          })
      })
  },
  deleteBlog:(blogId)=>{
      return new Promise(async(resolve,reject)=>{
          await db.get().collection(collection.BLOGS_COLLECTIONS).deleteOne({_id:objectId(blogId)}).then((response)=>{
              resolve(blogId)
          })
      })
  }, 
  viewEmails:()=>{
      return new Promise((resolve,reject)=>{
          db.get().collection(collection.EMAILIDS_COLLECTED).find().toArray().then((emails)=>{
              resolve(emails)
          })
      })
  },
  updateComments:(blogId,position,data,checker)=>{
    return new Promise(async(resolve,reject)=>{
        console.log(position);
        console.log(blogId);
        console.log( data);
        if(checker)
        {
            await db.get().collection(collection.BLOGS_COLLECTIONS).updateOne({"comments.email":data.email,_id:objectId(blogId)},
        {
            $set:{
                "comments.$.message":data.message
            }
        })
        .then((response)=>{
            resolve(response)
        })

        }
        else
        {
            await db.get().collection(collection.BLOGS_COLLECTIONS).updateOne({"comments.email":data.email[position],_id:objectId(blogId)},
        {
            $set:{
                "comments.$.message":data.message[position]
            }
        })
    
        
        .then((response)=>{
            resolve(response)
        })

        }
      
    })

  },
  subscribeViewer:()=>{
      return new Promise(async(resolve,reject)=>{
          await db.get().collection(collection.SUBSCRIBE).find().toArray().then((data)=>{
              resolve(data)
          })

      })
  },
  deleteComment:(id,data)=>{
      return new Promise((resolve,reject)=>{
          db.get().collection(collection.BLOGS_COLLECTIONS).deleteOne({_id:objectId(id),"comments.email":data.email}).then((response)=>{
              resolve(response)
          })
      })
  }
  


}