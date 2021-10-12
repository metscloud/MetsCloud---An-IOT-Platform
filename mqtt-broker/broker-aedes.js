module.exports={

    startBroker:()=>
{
    const aedes = require("aedes")();
    const server = require("net").createServer(aedes.handle);
    const port = 1883;
    
    server.listen(port, () => {
      console.log(`MQTT Server Running on : http://localhost:${port}`);
    });
    aedes.on("client", function (client) {
      console.log(`______Client Connected_____:  ${client.id}`);
    });
    aedes.on("clientDisconnect", function (client) {
      console.log(`Client Disconnected:  ${client.id}`);
    });
}

}
 



