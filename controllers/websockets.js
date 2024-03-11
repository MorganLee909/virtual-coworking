const Location = require("../models/location.js");

const {leaveTable} = require("./manageTables.js");
let wss = {};

module.exports = {
    incoming: (server)=>{
        wss = server;
        wss.on("connection", (ws)=>{
            ws.on("message", (message)=>{
                let data = JSON.parse(message);

                switch(data.action){
                    case "setLocation": ws.location = data.location; break;
                    case "participantLeft": leaveTable(); break;
                }
            });
        });
    },

    send: function(location, data){
        wss.clients.forEach((client)=>{
            if(client.location === location){
                client.send(JSON.stringify(data));
            }
        });
    }
}
