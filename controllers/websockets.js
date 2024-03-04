const Location = require("../models/location.js");

module.exports = (wss)=>{
    wss.on("connection", (ws)=>{
        ws.on("message", (message)=>{
            let data = JSON.parse(message);

            switch(data.action){
                case "getTables": getTables(ws, data.location); break;
            }
        });
    });

    const getTables = (ws, location)=>{
        Location.findOne({identifier: location})
            .then((location)=>{
                ws.send(JSON.stringify(location));
            })
            .catch((err)=>{
                console.error(err);
            });
    }
}
