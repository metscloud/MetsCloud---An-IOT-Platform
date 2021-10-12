/////
const mqtt = require("mqtt");
module.exports={

    sentingSecondaryKey:()=>{
        const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
          });
          
          client.on("connect", function () {
            client.subscribe("myTopic");
          });
          client.on("message", function (topic, message) {
            context = message.toString();
            console.log(context);
          });


    }
}

////