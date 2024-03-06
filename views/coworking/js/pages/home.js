module.exports = {
    render: function(){
        this.rendered = false;
        this.tableTemplate = document.getElementById("tablesTemplate").content.children[0];
        this.location = {};

        if(this.rendered === false){
            this.rendered = true;
            this.meetingDiv = document.getElementById("meeting");
            
            //Add listeners to join table buttons
            let tables = document.querySelectorAll(".table");
            for(let i = 0; i < tables.length; i++){
                tables[i].querySelector("button").addEventListener("click", ()=>{
                    this.joinTable(tables[i].getAttribute("data-table"));
                });
            }

            //Retrieve and build tables
            this.getLocation();

            //Create websocket
            const socket = new WebSocket(`ws://${process.env.SITE}`);
            socket.addEventListener("open", ()=>{
                let data = {
                    token: localStorage.getItem("coworkToken"),
                    location: "NY-01",
                    action: "setLocation"
                };

                socket.send(JSON.stringify(data));
            });

            socket.addEventListener("message", (event)=>{
                let data = JSON.parse(event.data);
                console.log(data);

                switch(data.action){
                    case "participantJoined":
                        this.compareTables(this.location.tables, data.location.tables);
                        this.location = data.location;
                        break;
                }
            });

            //Set video player frame controls
            document.getElementById("meeting").addEventListener("dblclick", this.fullScreen);
            this.dragElement(this.meetingDiv);
        }
    },

    initIframeAPI: function(jwt, table){
        const options = {
            roomName: `vpaas-magic-cookie-05680c1c54f04789935526e7e06a717b/${table}`,
            jwt: jwt,
            height: "100%",
            width: "100%",
            parentNode: document.getElementById("meeting")
        };

        api = new JitsiMeetExternalAPI("8x8.vc", options);
        api.addListener("videoConferenceLeft", (data)=>{
            this.meetingDiv.style.display = "none";
            while(this.meetingDiv.children.length > 0){
                this.meetingDiv.removeChild(this.meetingDiv.firstChild);
            }
        });
    },

    joinTable: function(table){
        this.meetingDiv.style.display = "flex";

        let api = {};

        fetch("/location/table/join", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            },
            body: JSON.stringify({
                room: "table-one"
            })
        })
            .then(r=>r.json())
            .then((response)=>{
                if(response.error){

                }else{
                    this.initIframeAPI(response, table);
                }
            })
            .catch((err)=>{
                console.log(err);
            });
    },

    dragElement: function(elem){
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

            elem.style.top = `${elem.offsetTop - positions[1]}px`;
            elem.style.left = `${elem.offsetLeft - positions[0]}px`;
        }

        const closeDragElement = ()=>{
            document.onmouseup = null;
            document.onmousemove = null;
        }

        elem.onmousedown = dragMouseDown;
    },

    fullScreen: function(event){
        let fs = event.target.getAttribute("data-fs");
        if(fs === "false"){
            event.target.style.height = "100%";
            event.target.style.width = "100%";
            event.target.style.top = "0";
            event.target.style.left = "0";
            event.target.setAttribute("data-fs", "true");
        }else{
            event.target.style.height = "50%";
            event.target.style.width = "50%";
            event.target.style.top = "25%";
            event.target.style.left = "25%";
            event.target.setAttribute("data-fs", "false");
        }
    },

    getLocation: function(){
        fetch(`/location/65e8a530763e59e0d77e861c`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((location)=>{
                this.compareTables([], location.tables);
                this.location.tables = location.tables;
            })
            .catch((err)=>{
                console.log(err);
            });
    },

    compareTables: function(existing, updated){
        existing.sort((a, b) => a.tableNumber > b.tableNumber ? 1 : -1);
        updated.sort((a, b) => a.tableNumber > b.tableNumber ? 1 : -1);
        let maxTables = existing.length > updated.length ? existing.length : updated.length;
        for(let i = 0; i < maxTables; i++){
            if(!existing[i]){
                this.addTable(updated[i]);

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
                            this.removeOccupant(updated[i].tableNumber, updated[i].occupants[j].seatNumber);
                        }
                    }
                }
            }
        }
    },

    addTable: function(newTable){
        let table = this.tableTemplate.cloneNode(true);
        table.setAttribute("data-table", newTable.tableNumber);
        table.querySelector(".tableCenter p").textContent = newTable.tableName;
        table.querySelector(".tableCenter button").addEventListener("click", ()=>{
            this.joinTable(`${this.location.identifier}-${newTable.tableNumber}`);
        });
        document.getElementById("tables").appendChild(table);
    },

    removeTable: function(table){
        document.querySelector(`[data-table="${table.tableNumber}"]`);
    },

    addOccupant: function(tableNumber, occupant){
        let table = document.querySelector(`[data-table="${tableNumber}"]`);
        let seat = table.querySelectorAll(".occupant")[occupant.seatNumber];
        seat.querySelector("p").textContent = occupant.name;
        seat.setAttribute("data-user", occupant.userId);
    },

    removeOccupant: function(tableNumber, seatNumber){
        let seat = document.querySelector(`[data-user=${user}]`);
        seat.removeAttribute("data-user");
        seat.querySelector("p").textContent = "";
    }
}
