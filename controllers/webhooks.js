const Location = require("../models/location.js");
const User = require("../models/user.js");

const websocketSend = require("./websockets.js").send;

const participantJoined = (body)=>{
    let room = body.fqn.split("/")[1];
    let roomParts = room.split("-");
    let location = `${roomParts[0]}-${roomParts[1]}`;
    let table = parseInt(roomParts[2]);

    let userPromise = User.findOne({_id: body.data.id});
    let locationPromise = Location.findOne({identifier: location});
    let user = {};

    Promise.all([userPromise, locationPromise])
        .then((response)=>{
            user = response[0];
            for(let i = 0; i < response[1].tables.length; i++){
                if(parseInt(response[1].tables[i].tableNumber) === table){
                    response[1].tables[i].occupants.push({
                        userId: body.data.id,
                        name: response[0].firstName,
                        avatar: "/image/profileicon.png"
                    });
                }
            }

            return response[1].save();
        })
        .then((location)=>{
            let data = {
                action: "participantJoined",
                table: table,
                user: user._id,
                avatar: "/image/profileIcon.png",
                name: user.firstName
            };
            websocketSend(location.identifier, data);
        })
        .catch((err)=>{
            console.error(err);
        });
}

module.exports = {
    handle: function(req, res){
        switch(req.body.eventType){
            case "PARTICIPANT_JOINED": participantJoined(req.body); break;
        }

        res.json({});
    }
}
