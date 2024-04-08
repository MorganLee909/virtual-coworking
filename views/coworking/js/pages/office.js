const html = `
<header>
    <button id="backBtn">
        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000"><path d="M15 6L9 12L15 18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <p>Back to Coworking</p>
    </button>

    <button id="manageMembersBtn">
        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>

        <p>Manage Members</p>
    </button>
</header>
`;

const css = `
*{margin:0;padding:0;box-sizing:border-box;}

:host{
    display: flex;
    flex-direction: column;
    min-height: 100%;
    position: relative;
}

header{
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 50px;
    padding: 0 35px;
}

header button{
    display: flex;
    align-items: center;
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
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

    connectedCallback(){
        this.shadow.querySelector("#backBtn").addEventListener("click", ()=>{changePage("home")});
        this.shadow.querySelector("#manageMembersBtn").addEventListener("click", this.showMembers.bind(this));
    }

    get data(){
        return this._data;
    }

    set data(value){
        this.setLocation(value);
        this._data = value;
        document.querySelector("header-comp").officeTitle = value.name;
    }

    set currentOffice(value){
        if(this._currentOffice !== value) this.getOffice(value);
        this._currentOffice = value;
    }

    setLocation(office){
        let oldLocation = this.shadow.querySelector("location-comp");
        if(oldLocation) this.shadow.removeChild(oldLocation);

        let location = document.createElement("location-comp");
        location.id = `office_${office._id}`;
        location.name = office.name;
        location.identifier = office.name;
        location.tables = office.tables;
        location.type = "office";
        if(user._id === office.owner) location.officeOwner = true;
        this.shadow.appendChild(location);
    }

    showMembers(){
        let omComp = document.createElement("office-members-comp");
        omComp._id = this.data._id;
        this.shadow.appendChild(omComp);
    }
}

customElements.define("office-page", Office);
