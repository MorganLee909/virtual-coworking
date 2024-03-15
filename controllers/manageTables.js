const Location = require("../models/location.js");
const User = require("../models/user.js");

const createTable = (tableNumbers, tableSize)=>{
    let newTableNumber = 1;
    while(true){
        if(tableNumbers.includes(newTableNumber)){
            newTableNumber++;
        }else{
            break;
        }
    }

    let newTable = {
        name: `Table ${newTableNumber}`,
        tableNumber: newTableNumber,
        occupants: []
    };

    for(let i = 0; i < tableSize; i++){
        newTable.occupants.push({seatNumber: i});
    }

    return newTable;
}

const removeTable = (tables, emptyTables)=>{
    tables.splice(emptyTables[0], 1);
}

const manageTables = (location)=>{
    let emptyTables = [];
    let fullTables = [];
    let tableNumbers = [];
    for(let i = 0; i < location.tables.length; i++){
        if(!location.tables[i].occupants.some(o => o.userId)) emptyTables.push(i);
        if(location.tables[i].occupants.filter(o => o.userId).length >= 5) fullTables.push(i);
        tableNumbers.push(location.tables[i].tableNumber);
    }
    tableNumbers.sort();

    if(fullTables.length === location.tables.length && emptyTables.length === 0){
        location.tables.push(createTable(tableNumbers, 6));
    }else if(emptyTables.length > 1 && location.tables.length > 3){
        removeTable(location.tables, emptyTables);
    }else if(fullTables.length < location.tables.length && emptyTables.length > 0 && location.tables.length > 3){
        removeTable(location.tables, emptyTables);
    }

    location.tables.sort((a, b) => a.tableNumber > b.tableNumber ? 1 : -1);

    return location;
}

const joinTable = (roomName, user)=>{
    let roomParts = roomName.split("-");
    let locationString = `${roomParts[0]}-${roomParts[1]}`;
    let table = parseInt(roomParts[2]);

    Location.findOne({identifier: locationString})
        .then((location)=>{
            for(let i = 0; i < location.tables.length; i++){
                if(parseInt(location.tables[i].tableNumber) === table){
                    let seat = location.tables[i].occupants.find(o => !o.userId);
                    seat.userId = user._id;
                    seat.name = user.firstName;
                    seat.avatar = user.avatar;
                }
            }

            manageTables(location);
            return location.save();
        })
        .then((location)=>{
            let data = {
                location: location,
                action: "participantJoined"
            };
            wss.clients.forEach((client)=>{
                if(client.location === location._id.toString()){
                    client.send(client.send(JSON.stringify(data)));
                }
            })
        })
        .catch((err)=>{
            console.error(err);
        });
}

const leaveTable = (location, userId)=>{
    //let roomParts = roomName.split("-");
    //let locationString = `${roomParts[0]}-${roomParts[1]}`;
    //let table = "";
    try{
        table = parseInt(roomParts[2]);
    }catch(e){}

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
