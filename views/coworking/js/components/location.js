const html = `
<button id="addTable" style="display: none">
    <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>

    <p>Add New Table</p>
</button>`;

const css = `
:host{
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    flex-grow: 3;
    height: 100%;
    width: 100%;
    position: relative;
}

#homeBlocker{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 2;
}

#addTable{
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border: 2px solid #dadada;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    color: #4F4F50;
    height: 120px;
    width: 190px;
}

#addTable:hover{
    border: 3px solid #718ef0;
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
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        if(this.type === "office"){
            this.updateTables(this.tables);
        }else{
            this.getLocation();
        }

        this.shadow.querySelector("#addTable").addEventListener("click", this.addOfficeTable.bind(this));
    }

    set officeOwner(value){
        if(value){
            this.shadow.querySelector("#addTable").style.display = "flex";
        }
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
            let table = this.shadow.querySelector(`#table_${newTables[i]._id}`);
            if(!table){
                table = document.createElement("table-comp");
                table.setAttribute("id", `table_${newTables[i]._id}`);
                table.occupants = newTables[i].occupants;
                table.type = newTables[i].type;
                table.locationIdentifier = this.identifier;
                table.parentShadow = this.shadow;
                this.shadow.insertBefore(table, this.shadow.lastChild);
            }

            table.occupants = newTables[i].occupants;
            table.updateOccupants();
        }

        for(let i = 0; i < this.tables.length; i++){
            let match = newTables.find(t => t._id === this.tables[i]._id);
            if(!match) this.removeChild(document.getElementById(this.tables[i]._id));
        }

        this.tables = newTables;
    }

    updateIcon(tableId, userId, avatar, name){
        let table = this.shadow.querySelector(`#table_${tableId}`);
        table.updateIcon(userId, avatar, name);
    }

    addOfficeTable(){
        let id = this.id.split("_")[1];
        fetch(`/office/${id}/table`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((office)=>{
                console.log(office);
                if(office.error){
                    requestError(office.message);
                }else{
                    this.tables = office.tables;
                    this.updateTables(office.tables);
                }
            })
            .catch((err)=>{
                requestError(err);
            });
    }

    destroy(){
        this.getRootNode().host.shadow.removeChild(this);
    }
}

customElements.define("location-comp", Location);
