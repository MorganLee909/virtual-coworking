module.exports = {
    render: function(){
        this.rendered = false;

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
            this.buildTables();

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
                    case "participantJoined": this.addToTable(data); break;
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

    buildTables: function(){
        fetch(`/location/65e625ade66c75c547c1597b`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((location)=>{
                let tablesDiv = document.getElementById("tables");
                let template = document.getElementById("tablesTemplate").content.children[0];

                for(let i = 0; i < location.tables.length; i++){
                    let table = template.cloneNode(true);
                    table.setAttribute("data-table", `${location.identifier}-${location.tables[i].id}`);
                    table.querySelector("p").textContent = location.tables[i].name;
                    table.querySelector("button").addEventListener("click", ()=>{
                        this.joinTable(table.getAttribute("data-table"));
                    });
                    tablesDiv.appendChild(table);
                }
            })
            .catch((err)=>{
                console.log(err);
            });
    },

    addToTable: function(data){
        console.log(data);
        console.log("adding user to table");
    }
}
