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

homePage.render();
