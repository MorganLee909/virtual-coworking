const joinTable = (table)=>{
    let meetingDiv = document.getElementById("meeting");
    meetingDiv.style.display = "flex";
    
    let api = {};

    fetch("/table/join", {
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
                initIframeAPI(response);
            }
        })
        .catch((err)=>{
            console.log(err);
        });

    const initIframeAPI = (jwt)=>{
        const domain = "8x8.vc";
        const options = {
            roomName: `vpaas-magic-cookie-05680c1c54f04789935526e7e06a717b/${table}`,
            jwt: jwt,
            height: "100%",
            width: "100%",
            parentNode: document.getElementById("meeting")
        };
        api = new JitsiMeetExternalAPI(domain, options);
        api.addListener("videoConferenceLeft", (data)=>{
            meetingDiv.style.display = "none";
            while(meetingDiv.children.length > 0){
                meetingDiv.removeChild(meetingDiv.firstChild);
            }
        });
    }   
}

let tables = document.querySelectorAll(".table");
for(let i = 0; i < tables.length; i++){
    tables[i].querySelector("button").addEventListener("click", ()=>{
        joinTable(tables[i].getAttribute("data-table"));
    });
}

const socket = new WebSocket('ws://localhost:8000');
socket.addEventListener("open", ()=>{
    socket.send("Hello from client 1");
});

socket.addEventListener("message", (event)=>{
    console.log(event.data);
});

const dragElement = (elem)=>{
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

        elem.style.top = (elem.offsetTop - positions[1]) + "px";
        elem.style.left = (elem.offsetLeft - positions[0]) + "px";
    }

    const closeDragElement = ()=>{
        document.onmouseup = null;
        document.onmousemove = null;
    }

    let positions = [];
    elem.onmousedown = dragMouseDown;
}

const fullScreen = (event)=>{
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
}

document.getElementById("meeting").addEventListener("dblclick", fullScreen);
dragElement(document.getElementById("meeting"));
