module.exports = {
    rendered: false,
    meetingDiv: document.getElementById("meeting"),

    render: function(){
        if(!this.rendered){
            this.rendered = true;

            //Retrieve and build user/tables
            this.populateLocations();

            //Add Location component
            let location = document.createElement("location-comp");
            location.id = `location_${user.defaultLocation}`;
            document.getElementById("homePage").appendChild(location);

            //Set video player frame controls
            document.getElementById("closeTag").addEventListener("click", ()=>{this.closeMeeting(this.meetingDiv)});
            document.getElementById("expandTag").addEventListener("click", this.fullScreen);
            this.dragElement(this.meetingDiv, document.getElementById("dragTag"));
        }
    },

    changeLocation: function(){
        let locationId = document.getElementById("locationSelect").value;
        let data = {
            action: "changeLocation",
            token: localStorage.getItem("coworkToken"),
            location: locationId
        }
        socket.send(JSON.stringify(data));
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

    initIframeAPI: function(jwt, table){
        const options = {
            roomName: `vpaas-magic-cookie-05680c1c54f04789935526e7e06a717b/${table}`,
            jwt: jwt,
            height: "100%",
            width: "100%",
            parentNode: document.getElementById("meeting"),
            configOverwrite: {
                toolbarButtons: [
                    'camera',
                    'chat',
                    'closedcaptions',
                    'desktop',
                    'download',
                    'embedmeeting',
                    'etherpad',
                    'feedback',
                    'filmstrip',
                    'fullscreen',
                    'hangup',
                    'help',
                    'highlight',
                    'microphone',
                    'noisesuppression',
                    'participants-pane',
                    'profile',
                    'raisehand',
                    'recording',
                    'security',
                    'select-background',
                    'settings',
                    'shareaudio',
                    'sharedvideo',
                    'shortcuts',
                    'stats',
                    'tileview',
                    'toggle-camera',
                    'videoquality',
                    'whiteboard',
                ]
            }
        };

        api = new JitsiMeetExternalAPI("8x8.vc", options);
        api.addListener("videoConferenceLeft", (data)=>{this.closeMeeting(this.meetingDiv)});
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
