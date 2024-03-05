module.exports = {
    render: function(){
        this.rendered = false;
        this.tableTemplate = document.getElementById("tablesTemplate").content.children[0];
        this.occupantTemplate = document.getElementById("occupantTemplate").content.children[0];
        this.location = "";

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
            const socket = new WebSocket(`ws://localhost:8000`);
            socket.addEventListener("open", ()=>{
                let data = {
                    token: localStorage.getItem("coworkToken"),
                    location: "NY-001",
                    action: "setLocation"
                };

                socket.send(JSON.stringify(data));
            });

            socket.addEventListener("message", (event)=>{
                let data = JSON.parse(event.data);

                switch(data.action){
                    case "participantJoined": this.updateTables(data.tables); break;
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
        fetch(`/location/65e625ade66c75c547c1597b`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((location)=>{
                this.location = location.identifier;

                this.updateTables(location.tables);
            })
            .catch((err)=>{
                console.log(err);
            });
    },

    updateTables: function(tables){
        let existingTables = document.querySelectorAll(".table");
        for(let i = 0; i < tables.length; i++){
            let table = null;
            for(let j = 0; j < existingTables.length; j++){
                if(existingTables[j].getAttribute("data-table") === tables[i].tableNumber) table = existingTables[j];
            }
            if(!table) table = this.createTable(tables[i].tableNumber, tables[i].name);
            this.setTableOccupants(table, tables[i].occupants);
        }
    },

    createTable: function(tableNumber, tableName){
        let table = this.tableTemplate.cloneNode(true);
        table.setAttribute("data-table", tableNumber);
        table.querySelector("p").textContent = tableName;
        table.querySelector("button").addEventListener("click", ()=>{
            this.joinTable(`${this.location}-${tableNumber}`);
        });
        document.getElementById("tables").appendChild(table);

        return table;
     },

    setTableOccupants: function(table, occupants){
        let occupantDivs = table.querySelectorAll(".occupant");
        
        for(let i = 0; i < occupants.length; i++){
            let occupant = Array.from(occupantDivs).find(a => a.getAttribute("data-user") === occupants[i].userId);
            if(!occupant){
                occupant = this.occupantTemplate.cloneNode(true);
                occupant.setAttribute("data-user", occupants[i].userId);
                occupant.querySelector(".name").textContent = occupants[i].name;
                table.appendChild(occupant);
            }
        }

        for(let i = 0; i < occupantDivs.length; i++){
            let occupant = occupants.find(a => a.userId === occupantDivs[i].getAttribute("data-user"));
            if(!occupant) occupantDivs[i].parentElement.removeChild(occupantDivs[i]);
        }

        return table;
    }
}
