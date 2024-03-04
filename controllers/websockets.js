const Location = require("../models/location.js");

module.exports = (wss)=>{
    wss.on("connection", (ws)=>{
        ws.on("message", (message)=>{
            let data = JSON.parse(message);
        });
    });
}
