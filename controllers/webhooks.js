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
                    let seat = response[1].tables[i].occupants.find(o => !o.userId);
                    seat.userId = body.data.id;
                    seat.name = response[0].firstName;
                    avatar = "/image/profileIcon.png";
                }
            }

            return response[1].save();
        })
        .then((location)=>{
            location = {...location};
            location._doc.action = "participantJoined";
            websocketSend(location._doc.identifier, location._doc);
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
