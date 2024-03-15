module.exports = {
    rendered: false,
    tableTemplate: document.getElementById("tablesTemplate").content.children[0],
    meetingDiv: document.getElementById("meeting"),
    location: null,
    socket: {},

    render: function(){
        if(!this.rendered){
            this.rendered = true;

            //Retrieve and build tables
            this.getUser();

            //Set video player frame controls
            document.getElementById("expandTag").addEventListener("click", this.fullScreen);
            this.dragElement(this.meetingDiv, document.getElementById("dragTag"));
        }
    },

    activateWebsocket: function(){
        this.socket = new WebSocket(`ws://localhost:8000`);
        this.socket.addEventListener("open", ()=>{
            let data = {
                token: localStorage.getItem("coworkToken"),
                location: this.location ? this.location._id : user.defaultLocation,
                action: "getLocation"
            };

            this.socket.send(JSON.stringify(data));
        });

        this.socket.addEventListener("message", (event)=>{
            let data = JSON.parse(event.data);

            switch(data.action){
                case "participantJoined":
                    console.log("participantJoined");
                    this.compareTables(this.location.tables, data.location.tables, data.location.identifier);
                    this.location = data.location;
                    break;
                case "participantLeft":
                    this.compareTables(this.location.tables, data.location.tables);
                    this.location = data.location;
                    break;
                case "getLocation":
                    let tables = this.location ? this.location.tables : [];
                    this.compareTables(tables, data.location.tables);
                    this.location = data.location;
                    break;
            }
        });

        this.socket.addEventListener("close", (event)=>{
            setTimeout(()=>{
                createBanner("red", "Disconnected from server, attempting to reconnect...");
                this.activateWebsocket();
            }, 5000)
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
        api.addListener("videoConferenceLeft", (data)=>{
            this.meetingDiv.style.display = "none";

            let iframe = this.meetingDiv.querySelector("iframe");
            this.meetingDiv.removeChild(iframe);

            document.getElementById("homeBlocker").style.display = "none";
            document.querySelector(".table.joinedTable").classList.remove("joinedTable");
            this.socket.send(JSON.stringify({
                action: "participantLeft",
                room: data.roomName,
                token: localStorage.getItem("coworkToken")
            }));
        });
    },

    tableFull: function(tableNumber){
        for(let i = 0; i < this.location.tables.length; i++){
            if(this.location.tables[i].tableNumber === tableNumber){
                for(let j = 0; j < this.location.tables[i].occupants.length; j++){
                    if(!this.location.tables[i].occupants[j].userId) return false;
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
            body: JSON.stringify({room: `${this.location.identifier}-${tableNumber}`})
        })
            .then(r=>r.json())
            .then((response)=>{
                if(response.error){
                    requestError(response.message);
                }else{
                    this.initIframeAPI(response, `${this.location.identifier}-${tableNumber}`);
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
    }
}
