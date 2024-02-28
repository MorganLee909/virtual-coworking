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

