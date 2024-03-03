const homePage = require("./pages/home.js");

const pages = document.querySelectorAll(".page");

changePage = (page)=>{
    for(let i = 0; i < pages.length; i++){
        pages[i].style.display = "none";
    }

    document.getElementById(`${page}page`).style.display = "flex";

    switch(page){
        case "home": homePage.render(); break;
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

homePage.render();
