const homePage = require("./pages/home.js");
const deskPage = require("./pages/desk.js");

const pages = document.querySelectorAll(".page");

let user = {};

changePage = (page)=>{
    for(let i = 0; i < pages.length; i++){
        pages[i].style.display = "none";
    }

    document.getElementById(`${page}Page`).style.display = "flex";

    switch(page){
        case "home": homePage.render(); break;
        case "desk": deskPage.render(); break;
    }
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
        default:
            createBanner("red", message);
    }
}

//BUTTONS
document.getElementById("deskBtn").addEventListener("click", ()=>{changePage("desk")});
document.getElementById("coworkingBtn").addEventListener("click", ()=>{changePage("home")});
document.getElementById("logoutBtn").addEventListener("click", ()=>{
    localStorage.removeItem("coworkToken");
    window.location.href = "/";
});

homePage.render();
