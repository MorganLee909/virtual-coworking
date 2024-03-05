module.exports = (location)=>{
    let emptyTables = [];
    let fullTables = [];
    let tableNumbers = [];
    for(let i = 0; i < location.tables.length; i++){
        if(location.tables[i].occupants.length === 0) emptyTables.push(i);
        if(location.tables[i].occupants.length >= 5) fullTables.push(i);
        tableNumbers.push(locations.tables[i].tableNumber);
    }
    tableNumbers.sort();

    if(fullTables.length === location.tables.length && emptyTables.length === 0){
        let newTable = 1;
        while(true){
            if(tableNumbers.includes(newTable)){
                newTable++;
            }else{
                break;
            }
        }

        location.tables.push({
            name: `Table ${newTable}`,
            tableNumber: newTable,
            occupants: []
        });
    }else if(fullTables.length === location.tables.length && emptyTables.length > 1){
        for(let i = 1; i < emptyTables.length; i++){
            if(location.tables.length <= 3) break;
            location.tables.splice(emptyTables[i], 1);
        }
    }else if(fullTable.length < location.tables.length && emptyTables.length > 0){
        for(let i = 0; i < emptyTables.length; i++){
            if(location.tables.length <= 3) break;
            location.tables.splice(emptyTables[i], 1);
        }
    }

    location.tables.sort((a, b) => a.tableNumber > b.tableNumber ? 1 : -1);

    return location;
}