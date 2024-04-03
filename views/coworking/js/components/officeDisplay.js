let html = ``;

let css = `
:host{
    display: flex;
    flex-direction: column;
    width: 70px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
}

button{
    background: none;
    border: 1px solid black;
    border-right: none;
    margin-bottom: 5px;
    cursor: pointer;
}

button:hover{
    background: rgb(220, 220, 220);
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
        fetch(`/office/${user.currentLocation}`, {
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
                        office.addEventListener("click", ()=>{changePage("office", offices[i]._id)});
                        office.textContent = offices[i].name;
                        this.shadow.appendChild(office);
                    }
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }
}

customElements.define("office-display-comp", OfficeDisplay);
