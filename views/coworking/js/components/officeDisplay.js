let html = ``;

let css = ``;

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
                        office.addEventListener("click", ()=>{changePage(page, offices[i]._id)});
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
