module.exports = {
    rendered: false,
    tableTemplate: document.getElementById("tablesTemplate").content.children[0],
    meetingDiv: document.getElementById("meeting"),

    render: function(){
        if(!this.rendered){
            this.rendered = true;

            //Retrieve and build user/tables
            this.getUser();
            this.populateLocations();

            //Set video player frame controls
            document.getElementById("closeTag").addEventListener("click", ()=>{this.closeMeeting(this.meetingDiv)});
            document.getElementById("expandTag").addEventListener("click", this.fullScreen);
            this.dragElement(this.meetingDiv, document.getElementById("dragTag"));
        }
    },

    changeLocation: function(){
        this.closeMeeting(this.meetingDiv);
        socket.close(3001, "changeLocation");

        locationData._id = document.getElementById("locationSelect").value;
        this.activateWebsocket();
    },

    populateLocations: function(){
        fetch("/location", {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r=>r.json())
            .then((response)=>{
                if(response.error){
                    createBanner("red", response.message);
                }else{
                    let locations = document.getElementById("locationSelect");

                    for(let i = 0; i < response.length; i++){
                        let option = document.createElement("option");
                        option.value = response[i]._id;
                        option.textContent = response[i].name;
                        locations.appendChild(option);
                    }
                }

                document.getElementById("locationSelect").addEventListener("change", this.changeLocation.bind(this));
            })
            .catch((err)=>{
                createBanner("red", "Server error");
            });
    }, 

    activateWebsocket: function(){
        socket = new WebSocket(`ws://localhost:8000`);
        socket.addEventListener("open", ()=>{
            let data = {
                token: localStorage.getItem("coworkToken"),
                location: locationData ? locationData._id : user.defaultLocation,
                action: "getLocation"
            };

            socket.send(JSON.stringify(data));
        });

        socket.addEventListener("message", (event)=>{
            let data = JSON.parse(event.data);

            switch(data.action){
                case "participantJoined":
                    this.compareTables(locationData.tables, data.location.tables, data.location.identifier);
                    locationData = data.location;
                    break;
                case "participantLeft":
                    this.compareTables(locationData.tables, data.location.tables);
                    locationData = data.location;
                    break;
                case "getLocation":
                    let tables = locationData ? locationData.tables : [];
                    this.compareTables(tables, data.location.tables);
                    locationData = data.location;
                    document.getElementById("locationSelect").value = locationData._id;
                    document.getElementById("locationTitle").textContent = locationData.name;
                    break;
                case "updateIcon":
                    this.updateIcon(data.user, data.name, data.avatar);
                    break;
            }
        });

        socket.closeListener = socket.addEventListener("close", (event)=>{
            if(event.code !== 3001){
                setTimeout(()=>{
                    createBanner("red", "Disconnected from server, attempting to reconnect...");
                    this.activateWebsocket();
                }, 5000)
            }
        });
    },

    initIframeAPI: function(jwt, table){
        const options = {
            roomName: `vpaas-magic-cookie-05680c1c54f04789935526e7e06a717b/${table}`,
            jwt: jwt,
            height: "100%",
            width: "100%",
            parentNode: document.getElementById("meeting"),
        };

        api = new JitsiMeetExternalAPI("8x8.vc", options);
        api.addListener("videoConferenceLeft", (data)=>{this.closeMeeting(this.meetingDiv)});
    },

    tableFull: function(tableNumber){
        for(let i = 0; i < locationData.tables.length; i++){
            if(locationData.tables[i].tableNumber === tableNumber){
                for(let j = 0; j < locationData.tables[i].occupants.length; j++){
                    if(!locationData.tables[i].occupants[j].userId) return false;
                }
            }
        }
        return true;
    },

    joinTable: function(locationIdentifier, tableNumber){
        let table = document.querySelector(`[data-table="${tableNumber}"]`);
        if(this.tableFull(tableNumber)){
            createBanner("red", "All seats are occupied at this table");
            return;
        }

        this.meetingDiv.style.display = "flex";

        let api = {};

        fetch("/location/table/join", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            },
            body: JSON.stringify({room: `${locationData.identifier}-${tableNumber}`})
        })
            .then(r=>r.json())
            .then((response)=>{
                if(response.error){
                    requestError(response.message);
                }else{
                    this.initIframeAPI(response, `${locationData.identifier}-${tableNumber}`);
                    document.getElementById("homeBlocker").style.display = "flex";
                    table.classList.add("joinedTable");
                }
            })
            .catch((err)=>{
                requestError(response.message);
            });
    },

    dragElement: function(moveElem, clickElem){
        let positions = [];
        
        const dragMouseDown = (e)=>{
            e = e || window.event;
            e.preventDefault();

            positions[2] = e.clientX;
            positions[3] = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        const elementDrag = (e)=>{
            e = e || window.event;
            e.preventDefault();

            positions[0] = positions[2] - e.clientX;
            positions[1] = positions[3] - e.clientY;
            positions[2] = e.clientX;
            positions[3] = e.clientY;

            moveElem.style.top = `${moveElem.offsetTop - positions[1]}px`;
            moveElem.style.left = `${moveElem.offsetLeft - positions[0]}px`;
        }

        const closeDragElement = ()=>{
            document.onmouseup = null;
            document.onmousemove = null;
        }

        clickElem.onmousedown = dragMouseDown;
    },

    closeMeeting: function(meetingDiv){
        let iframe = meetingDiv.querySelector("iframe");
        if(iframe) meetingDiv.removeChild(iframe);
        meetingDiv.style.display = "none";

        document.getElementById("homeBlocker").style.display = "none";
        let joinedTable = document.querySelector(".table.joinedTable");
        if(joinedTable) joinedTable.classList.remove("joinedTable");

        socket.send(JSON.stringify({
            action: "participantLeft",
            location: locationData._id,
            token: localStorage.getItem("coworkToken")
        }));
    },

    fullScreen: function(event){
        let fs = event.target.getAttribute("data-fs");
        let meetingDiv = document.getElementById("meeting");
        if(fs === "false"){
            meetingDiv.style.height = "100%";
            meetingDiv.style.width = "100%";
            meetingDiv.style.top = "0";
            meetingDiv.style.left = "0";
            event.target.setAttribute("data-fs", "true");
            event.target.parentElement.classList.add("fullscreen");
        }else{
            meetingDiv.style.height = "50%";
            meetingDiv.style.width = "50%";
            meetingDiv.style.top = "25%";
            meetingDiv.style.left = "25%";
            event.target.setAttribute("data-fs", "false");
            event.target.parentElement.classList.remove("fullscreen");
        }
    },

    getUser: function(){
        fetch("/user", {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((user)=>{
                if(user.error){
                    requestError(user.message);
                }else{
                    window.user = user;
                    this.activateWebsocket();
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    },

    compareTables: function(existing, updated, locationIdentifier){
        existing.sort((a, b) => a.tableNumber > b.tableNumber ? 1 : -1);
        updated.sort((a, b) => a.tableNumber > b.tableNumber ? 1 : -1);
        let maxTables = existing.length > updated.length ? existing.length : updated.length;
        for(let i = 0; i < maxTables; i++){
            if(!existing[i]){
                this.addTable(updated[i], locationIdentifier);

                for(let j = 0; j < updated[i].occupants.length; j++){
                    if(updated[i].occupants[j].userId){
                        this.addOccupant(updated[i].tableNumber, updated[i].occupants[j]);
                    }
                }

            }else if(!updated[i]){
                this.removeTable(existing[i]);
            }else{
                for(let j = 0; j < existing[i].occupants.length; j++){
                    if(existing[i].occupants[j].userId !== updated[i].occupants[j].userId){
                        if(!existing[i].occupants[j].userId){
                            this.addOccupant(updated[i].tableNumber, updated[i].occupants[j]);
                        }else if(!updated[i].occupants[j].userId){
                            this.removeOccupant(updated[i].tableNumber, updated[i].occupants[j].seatNumber, existing[i].occupants[j].userId);
                        }
                    }
                }
            }
        }
    },

    addTable: function(newTable, locationIdentifier){
        let table = this.tableTemplate.cloneNode(true);
        table.setAttribute("data-table", newTable.tableNumber);
        table.querySelector(".tableTitle").textContent = newTable.name;
        table.addEventListener("click", ()=>{
            this.joinTable(locationIdentifier, newTable.tableNumber);
        });
        document.getElementById("tables").appendChild(table);
    },

    removeTable: function(table){
        let tableElem = document.querySelector(`[data-table="${table.tableNumber}"]`);
        tableElem.parentElement.removeChild(tableElem);
    },

    addOccupant: function(tableNumber, occupant){
        let table = document.querySelector(`[data-table="${tableNumber}"]`);
        let seat = table.querySelectorAll(".occupant")[occupant.seatNumber];
        seat.classList.add("noBorder");
        seat.querySelector("p").textContent = occupant.name;
        let image = document.createElement("img");
        image.src = occupant.avatar;
        seat.appendChild(image);
        seat.setAttribute("data-user", occupant.userId);
    },

    removeOccupant: function(tableNumber, seatNumber, user){
        let seat = document.querySelector(`[data-user="${user}"]`);
        seat.removeAttribute("data-user");
        seat.removeChild(seat.querySelector("img"));
        seat.querySelector("p").textContent = "";
    },

    updateIcon: function(user, name, avatar){
        let tables = locationData.tables;

        for(let i = 0; i < tables.length; i++){
            let found = false;
            for(let j = 0; j < tables[i].occupants.length; j++){
                if(user === tables[i].occupants[j].userId){
                    tables[i].occupants[j].name = name;
                    tables[i].occupants[j].avatar = avatar;
                    found = true;
                    break;
                }
            }
            if(found) break;
        }

        let icon = document.querySelector(`[data-user="${user}"]`);
        icon.querySelector("p").textContent = name;
        icon.querySelector("img").src = avatar;
    }
}
