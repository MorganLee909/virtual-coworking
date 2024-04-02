const {wsAuth} = require("./auth.js");
const {leaveTable} = require("./controllers/manageTables.js");
const user = require("./controllers/user.js");
const location = require("./controllers/location.js");

const closeExtraConnection = (clients, newClient, userId, location)=>{
    let exists = false;
    clients.forEach((client)=>{
        if(client.user === userId){
            newClient.send(JSON.stringify({action: "status"}));
            newClient.close(3001);
            exists = true;
        }
    });

    if(!exists){
        newClient.user = userId;
        newClient.location = location
    }
}

module.exports = (wss)=>{
    wss.on("connection", (client)=>{
        client.on("message", (message)=>{
            let data = JSON.parse(message);
            wsAuth(data.token)
                .then((user)=>{
                    if(!user) throw "auth";

                    console.log(data);
                    switch(data.action){
                        case "status": closeExtraConnection(wss.clients, client, user._id.toString(), data.location); break;
                        case "getLocation": location.getLocation(data.location, client, user); break;
                        case "participantLeft": leaveTable(data.location, user._id.toString()); break;
                        case "updateIcon": user.updateIcon(user, data.location, wss.clients); break;
                        case "changeLocation": location.changeLocation(client, data.location); break;
                    }
                })
                .catch((err)=>{
                    console.error(err);
                });
        });

        client.on("close", (code)=>{
            if(code === 3001) return;
            leaveTable(client.location, client.user);
        });

        client.on("pong", ()=>{
            client.isAlive = true;
        })
    });

    const ping = setInterval(()=>{
        wss.clients.forEach((client)=>{
            if(client.isAlive === false){
                client.terminate();
                leaveTable(client.location, client.user);
            }

            client.isAlive = false;
            client.ping();
        });
    }, 30000);
}
