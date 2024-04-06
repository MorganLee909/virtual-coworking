let html = ``;

let css = `
:host{
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
}

button{
    background: none;
    margin: 35px 0;
    cursor: pointer;
    height: 175px;
    width: 175px;
    border: 3px solid #dadada;
    border-radius: 20px;
    box-shadow: 9.56px 16.39px 13.65px 0px #00000017;
    font-size: 14px;
    color: #888888;
    position: relative;
}

button:hover{
    border: 3px solid #718ef0;
}

.enterTitle{
    display: none;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: -23px;
    right: calc(50% - 40px);
    height: 20px;
    width: 80px;
    border-radius: 9px;
    background: #719ef0;
    color: white;
    font-size: 12px;
}

button:hover .enterTitle{
    display: flex;
}
`;

class OfficeDisplay extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        fetch(`/office/location/${user.currentLocation}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((offices)=>{
                if(offices.error){
                    requestError(offices.message);
                }else{
                    for(let i = 0; i < offices.length; i++){
                        let office = document.createElement("button");
                        //office.addEventListener("click", ()=>{changePage("office", offices[i]._id)});
                        office.addEventListener("click", ()=>{this.getOffice(offices[i]._id)})
                        office.textContent = offices[i].name;
                        this.shadow.appendChild(office);

                        let enterTitle = document.createElement("p");
                        enterTitle.textContent = "Enter";
                        enterTitle.classList.add("enterTitle");
                        office.appendChild(enterTitle);
                    }
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    getOffice(officeId){
        fetch(`/office/${officeId}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((office)=>{
                if(office.error){
                    createBanner("red", "This office is private");
                }else{
                    let officePage = document.querySelector("office-page");
                    officePage.data = office;
                    changePage("office");
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    destroy(){
        this.getRootNode().host.shadow.removeChild(this);
    }
}

customElements.define("office-display-comp", OfficeDisplay);
