const Location = require("../models/location.js");

const sendToLocation = (locationId, data)=>{
    wss.clients.forEach((client)=>{
        if(client.location === locationId){
            client.send(JSON.stringify(data));
        }
    });
}

module.exports = {
    updateIcon: function(user, locationId){
        Location.findOne({_id: locationId})
            .then((location)=>{
                for(let i = 0; i < location.tables.length; i++){
                    let found = false;
                    for(let j = 0; j < location.tables[i].occupants.length; j++){
                        if(user._id.toString() === location.tables[i].occupants[j].userId.toString()){
                            location.tables[i].occupants[j].name = user.firstName;
                            location.tables[i].occupants[j].avatar = user.avatar;
                            found = true;
                            break;
                        }
                    }
                    if(found) break;
                }

                return location.save();
            })
            .then((location)=>{
                let data = {
                    action: "updateIcon",
                    user: user._id,
                    name: user.firstName,
                    avatar: user.avatar
                };

                sendToLocation(locationId, data);
            })
            .catch((err)=>{
                console.error(err);
            });
    },

    changeLocation: function(ws, locationId){
        ws.location = locationId;

        Location.findOne({_id: locationId})
            .then((location)=>{
                let data = {
                    action: "changeLocation",
                    location: location
                };

                ws.send(JSON.stringify(data));
            })
            .catch((err)=>{
                console.error(err);
            });
    }
}
