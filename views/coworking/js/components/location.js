const css = `
:host{
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    height: 100%;
    width: 100%;
}
`;

//id = "location_ID"
//name = location name
//identifier = location identifier for Jitsi
//tables = list of tables/data (Object)
class Location extends HTMLElement{
    constructor(){
        super();
        this.tables = [];

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>`;
        this.shadow = this.attachShadow({mode: "closed"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.getLocation();
    }

    getLocation(){
        fetch(`/location/${this.id.split("_")[1]}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((location)=>{
                if(location.error){
                    requestError(location.message);
                }else{
                    this.name = location.name;
                    this.identifier = location.identifier;
                    this.updateTables(location.tables);
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    updateTables(newTables){
        for(let i = 0; i < newTables.length; i++){
            let table = document.getElementById(newTables[i]._id);
            if(!table){
                table = document.createElement("table-comp");
                table.id = `table_${newTables[i]._id}`;
                table.occupants = newTables[i].occupants;
                table.type = newTables[i].type;
                table.locationIdentifier = this.identifier;
                this.shadow.appendChild(table);
            }
        }

        for(let i = 0; i < this.tables.length; i++){
            let match = newTables.find(t => t._id === this.tables[i]._id);
            if(!match) this.removeChild(document.getElementById(this.tables[i]._id));
        }

        this.tables = newTables;
    }
}

customElements.define("location-comp", Location);
