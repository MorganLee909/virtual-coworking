const html = ``;

const css = ``;

class Office extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    set _id(value){
        this.id = value;
        this.getOffice(value);
    }

    getOffice(id){
        fetch(`/office/${id}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((office)=>{
                if(office.error){
                    requestError(err.message);
                }else{
                    this.data = office; 
                    let location = document.createElement("location-comp");
                    location.id = `office_${office._id}`;
                    location.name = office.name;
                    location.identifier = office.name;
                    location.tables = office.tables;
                    location.type = "office";
                    this.shadow.appendChild(location);
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }
}

customElements.define("office-page", Office);
