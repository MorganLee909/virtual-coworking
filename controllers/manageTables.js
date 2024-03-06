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

module.exports = (location)=>{
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
