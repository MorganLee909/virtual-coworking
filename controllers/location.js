const jwt = require("jsonwebtoken");

//PRIVATE
/**
 * Create a new table of a certain size
 * Currently only creates a general type table
 *
 * @param {Number} tableSize - Number of seats at the table
 * @return {Table} - Newly created table to be added to the location
 */
const createTable = (tableSize)=>{
    const newTable = {
        type: "general",
        occupants: []
    };

    for(let i = 0; i < tableSize; i++){
        newTable.occupants.push({seatNumber: i});
    }

    return newTable;
}

/**
 * Determine whether tables need to be removed for each type
 * Call 'createTable' to add a table or return the table that should be removed
 *
 * @param {[Table]} allTables - List of all tables for the location
 * @param {[Table]} tables - List of all tables of the current type
 * @param {[Table]} empty - List of empty tables of the current type
 * @param {[Table]} full - List of full tables (more than 5 people) of the current type
 * @return {Table} - Table to be removed, if any
 */
const addRemoveTables = (allTables, tables, empty, full)=>{
    if(full.length === tables.length) allTables.push(createTable(6));
    if(allTables.length > 3){
        if(full.length < table.length && empty.length > 0) return empty[0];
    }
}

/**
 * Determine how many full and empty tables for each type
 * For each type, pass the data to 'addRemoveTables' to handle adding tables
 * Remove the necessary tables
 *
 * @param {Location} location - Location object containing the tables
 * @return {Location} - Location object with updated tables
 */
const manageTables = (location)=>{
    const tables = {};
    for(let i = 0; i < location.tables.length; i++){
        const type = location.tables[i].type;

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

    const types = Object.keys(tables);
    let toRemove = [];
    for(let i = 0; i < types.length; i++){
        const result = addRemoveTables(
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

//PUBLIC
/**
 * Create Jitsi web token for the user
 *
 * @param {object} user - Object containing at least: ID, first name and email
 * @param {string} location - Location ID
 * @param {table} table - Table ID
 * @return {JWT} - Jitsi web token
 */
const createToken = (user, location, table)=>{
    let nbf = new Date();
    nbf.setDate(nbf.getDate() - 10);
    nbf = nbf.getTime();
    nbf = Math.floor(nbf / 1000);

    let exp = new Date();
    exp.setDate(exp.getDate() + 1);
    exp = exp.getTime();

    const options = {
        algorithm: "RS256",
        header: {
            kid: process.env.JAAS_API_KEY,
            alg: "RS256"
        }
    };
    
    return jwt.sign({
        aud: "jitsi",
        context: {
            user: {
                id: user._id,
                name: user.firstName,
                email: user.email,
                moderator: false
            },
            features: {
                livestreaming: false,
                recording: false,
                transcription: false,
                "sip-inbound-call": false,
                "sip-outbound-call": false,
                "inbound-call": false,
                "outbound-call": false
            }
        },
        iss: "chat",
        nbf: nbf,
        room: `${location}-${table}`,
        exp: exp,
        sub: process.env.JAAS_APP_ID
    }, privateKey, options);
}

const joinTable = (user, location, tableId)=>{
    for(let i = 0; i < location.tables.length; i++){
        if(location.tables[i]._id.toString() === tableId){
            const seat = location.tables[i].occupants.find(o => !o.userId);
            seat.userId = user._id;
            seat.name = user.firstName;
            seat.avatar = user.avatar;
            break;
        }
    }

    manageTables(location);

    const data = {
        location: location,
        action: "participantJoined"
    };
    const locationString = location._id.toString();
    wss.clients.forEach((client)=>{
        if(client.location === locationString){
            client.send(JSON.stringify(data));
        }
    });

    return location;
}

const leaveTable = async (location, userId)=>{
    location = await Location.findOne({_id: location});
    
    let found = false;
    for(let i = 0; i < location.tables.length; i++){
        for(let j = 0; j < locatin.tables[i].occupants.length; j++){
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

    location = await location.save();
    const data = {
        location: location,
        action: "participantLeft"
    };
    wss.clients.forEach((client)=>{
        if(client.location === location._id.toString()){
            client.send(JSON.stringify(data));
        }
    });
}

const handleError = (error)=>{
    console.error(error);
    return res.json({
        error: true,
        message: "Server error"
    });
}

module.exports = {
    createToken,
    joinTable,
    leaveTable,
    handleError
};
