//
const mqtt = require("mqtt");
module.exports={

    publishSecondaryKeyToDevice:(defaultTopic,secKey)=>{
        const client = mqtt.connect("mqtt://localhost:1883", {
            clientId: " ",
          });
          
        client.on("connect", () => {
            // setInterval(() => {
                
                client.publish(defaultTopic, secKey);
                console.log('Success');
                client.end()
                

             
            // }, 3000);
          });
    }
}
//