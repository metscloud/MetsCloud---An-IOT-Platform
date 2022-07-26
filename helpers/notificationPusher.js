
var nodemailer = require('nodemailer');






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



  sentSms:(message)=>{
    let Topic="$ad5%12Zz91qAo:`Q`"
    const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
          });
          
        client.on("connect", () => 
        {
 
                client.publish(Topic, message);
                console.log('Message  sented to the  device ');
                client.end()
                
       
          });


    }




}