const html = ``;

const css = `
:host{
    min-height: 100%;
}
`;

class Office extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    set currentOffice(value){
        if(this._currentOffice !== value) this.getOffice(value);
        this._currentOffice = value;
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
                    this.addLocation(office);
                    this.data = office; 
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    addLocation(office){
        let oldLocation = this.shadow.querySelector("location-comp");
        if(oldLocation) this.shadow.removeChild(oldLocation);

        let location = document.createElement("location-comp");
        location.id = `office_${office._id}`;
        location.name = office.name;
        location.identifier = office.name;
        location.tables = office.tables;
        location.type = "office";
        this.shadow.appendChild(location);
    }
}

customElements.define("office-page", Office);
