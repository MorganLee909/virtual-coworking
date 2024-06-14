const deskPage = require("./pages/desk.js");

require("./pages/home.js");
require("./pages/desk.js");
require("./pages/office.js");

require("./components/header.js");
require("./components/location.js");
require("./components/table.js");
require("./components/occupant.js");
require("./components/meeting.js");
require("./components/officeDisplay.js");
require("./components/officeMembers.js");
require("./components/member.js");
require("./components/addMember.js");
require("./components/modal.js");

const pages = document.querySelectorAll(".page");

window.user = {};
window.socket = {};

const isMobile = ()=>{
    const match = window.matchMedia("(pointer:coarse)");
    return match && match.matches;
}

changePage = (page)=>{
    for(let i = 0; i < pages.length; i++){
        pages[i].style.display = "none";
    }

    document.querySelector(`${page}-page`).style.display = "flex";
    let header = document.querySelector("header-comp");
    header.status = page;
}

createBanner = (color, message)=>{
    let banner = document.getElementById("banner");

    banner.style.background = color;
    banner.style.display = "flex";
    banner.querySelector("p").textContent = message;

    setTimeout(()=>{
        banner.style.display = "none";
    }, 5000);
}

requestError = (message)=>{
    switch(message){
        case "payment": window.location.href = "/stripe/checkout"; break;
        case "token":
            localStorage.removeItem("coworkToken");
            window.location.href = "/user/login";
            break;
        case "Authorization":
            localStorage.removeItem("coworkToken");
            window.location.href = "/user/login";
            break;
        case "email":
            localStorage.removeItem("coworkToken");
            window.location.href = "/email/unconfirmed";
        default:
            createBanner("red", message);
    }
}

const activateWebsocket = ()=>{
    socket = new WebSocket(`ws://localhost:8000`);
    socket.addEventListener("open", ()=>{
        let data = {
            action: "status",
            token: localStorage.getItem("coworkToken"),
            location: user.currentLocation
        };
        socket.send(JSON.stringify(data));
    });

    socket.addEventListener("message", (event)=>{
        let data = JSON.parse(event.data);

        let location = {};
        switch(data.action){
            case "status":
                document.getElementById("extraConnection").style.display = "flex";
                document.getElementById("container").style.display = "none";
                document.querySelector("header .headerRight").style.display = "none";
                socket.close(3001);
                break;
            case "participantJoined":
                document.querySelector("home-page").updateTables(data.location.tables);
                break;
            case "participantLeft":
                document.querySelector("home-page").updateTables(data.location.tables);
                break;
            case "updateIcon":
                location = document.getElementById(`location_${data.location}`);
                location.updateIcon(data.table, data.user, data.avatar, data.name);
                break;
        }
    });
}

const getUser = ()=>{
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
                window.user.currentLocation = user.defaultLocation;
                activateWebsocket();
                document.querySelector("home-page").addLocation(user.currentLocation);

                let desk = document.querySelector("desk-page")
                desk.firstName = user.firstName;
                desk.lastName = user.lastName;
                desk.email = user.email;
                desk.avatar = user.avatar;
                desk.currentLocation = user.defaultLocation;

                let header = document.querySelector("header-comp");
                header.currentLocation = user.defaultLocation;
            }
        })
        .catch((err)=>{
            requestError(err.message);
        });
}

if(isMobile()){
    document.getElementById("container").style.display = "none";
    document.getElementById("mobileContainer").style.display = "flex";
    document.querySelector(".headerRight").style.display = "none";
}else{
    getUser();
}
