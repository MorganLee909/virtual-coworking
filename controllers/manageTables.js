const Location = require("../models/location.js");
const User = require("../models/user.js");

const createTable = (tableSize)=>{
    let newTable = {
        type: "general",
        occupants: []
    };

    for(let i = 0; i < tableSize; i++){
        newTable.occupants.push({seatNumber: i});
    }

    return newTable;
}

const addRemoveTables = (allTables, tables, empty, full)=>{
    if(full.length === tables.length) allTables.push(createTable(6));
    if(full.length < tables.length && empty.length > 0) return empty[0];
}

const manageTables = (location)=>{
    let tables = {};
    for(let i = 0; i < location.tables.length; i++){
        let type = location.tables[i].type;

        if(!tables[type]){
            tables[type] = {
                all: [],
                empty: [],
                full: []
            }
        }

        tables[type].all.push(i);
        if(!location.tables[i].occupants.some(o=>o.userId)) tables[type].empty.push(i);
        if(location.tables[i].occupants.filter(o=>o.userId).length >=5) tables[type].full.push(i);
    }

    let types = Object.keys(tables);
    let toRemove = [];
    for(let i = 0; i < types.length; i++){
        let result = addRemoveTables(
            location.tables,
            tables[types[i]].all,
            tables[types[i]].empty,
            tables[types[i]].full
        );

        if(result) toRemove.push(result);
    }

    let offset = 0;
    for(let i = 0; i < toRemove.length; i++){
        location.tables.splice(toRemove[i-offset], 1);
        offset++;
    }

    return location;
}

const joinTable = (user, locationIdentifier, tableId)=>{
    Location.findOne({identifier: locationIdentifier})
        .then((location)=>{
            for(let i = 0; i < location.tables.length; i++){
                if(location.tables[i]._id.toString() === tableId){
                    let seat = location.tables[i].occupants.find(o => !o.userId);
                    seat.userId = user._id;
                    seat.name = user.firstName;
                    seat.avatar = user.avatar;
                }
                break;
            }

            manageTables(location);
            return location.save();
        })
        .then((location)=>{
            let data = {
                location: location,
                action: "participantJoined"
            };
            let locationString = location._id.toString();
            wss.clients.forEach((client)=>{
                if(client.location === locationString){
                    client.send(JSON.stringify(data));
                }
            })
        })
        .catch((err)=>{
            console.error(err);
        });
}

const leaveTable = (location, userId)=>{
    Location.findOne({_id: location})
        .then((location)=>{
            let found = false;
            for(let i = 0; i < location.tables.length; i++){
                for(let j = 0; j < location.tables[i].occupants.length; j++){
                    if(location.tables[i].occupants[j].userId?.toString() === userId){
                        let seat = location.tables[i].occupants[j];
                        seat.userId = undefined;
                        seat.name = undefined;
                        seat.avatar = undefined;
                        found = true;
                        break;
                    }
                }
                if(found) break;
            }

            manageTables(location);
            return location.save();
        })
        .then((location)=>{
            let data = {
                location: location,
                action: "participantLeft"
            };
            wss.clients.forEach((client)=>{
                if(client.location === location._id.toString()){
                    client.send(JSON.stringify(data));
                }
            })
        })
        .catch((err)=>{
            console.error(err);
        });
}

module.exports = {
    joinTable,
    leaveTable
};
