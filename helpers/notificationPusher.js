
var nodemailer = require('nodemailer');
var db =require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
const { ObjectID } = require('bson')
const mqtt = require("mqtt");
const connector=require('../helpers/connectorForUserData')







module.exports={


sentEmail:(toMail,subject,body)=>{
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bimalboby007@gmail.com',
      pass: 'zgliqvavgdhnocdj'
    }
  });
  
  var mailOptions = {
    from: 'bimalboby007@gmail.com',
    to: toMail,
    subject: subject,
    text: body
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
    },



  sentSms:(message,ph)=>{
    let Topic="sms"
    let data ={
      PhNo:ph,
      Message:message
    }
    console.log(ph);
    const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
          });
          
        client.on("connect", () => 
        {
 
                client.publish(Topic, JSON.stringify(data));
                console.log(typeof JSON.stringify(data));
                console.log('Message  sent to sent an sms from device ');
                client.end()
                
       
          });


    },
    call:(message,ph)=>{
      let Topic="call"
      let data ={
        PhNo:ph,
        Message:message
      }
      console.log(ph);
      const client = mqtt.connect("mqtt://localhost:1883", {
              clientId: " ",
            });
            
          client.on("connect", () => 
          {
   
                  client.publish(Topic, JSON.stringify(data));
                  console.log(typeof JSON.stringify(data));
                  console.log('Message sent to make a call  ');
                  client.end()
                  
         
            });
  
  
      },




}