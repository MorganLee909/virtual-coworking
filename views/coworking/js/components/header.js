const html = `
<a href="/">
    <img src="/image/text-logo.svg" alt="CoSphere logo with text"/>
</a>

<select id="locationSelect"></select>

<div class="headerRight">
    <button class="buttonLink" id="logoutBtn">Logout</button>

    <button class="buttonLink" id="coworkingBtn">Coworking</button>

    <button class="buttonLink" id="deskBtn">My Desk</button>
</div>
`;

const css = `
:host{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 75px;
    width: 100%;
}

.buttonLink{
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 600;
    color: #7a7a7a;
    cursor: pointer;
}

.buttonLink:hover{
    color: #8c8c8c;
}

a, img{
    height: 100%;
}

select{
    background: white;
    border: none;
    font-size: 26px;
}
`;

class Header extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.shadow.querySelector("#logoutBtn").addEventListener("click", ()=>{
            localStorage.removeItem("coworkToken");
            window.location.href = "/";
        });
        this.shadow.querySelector("#coworkingBtn").addEventListener("click", ()=>{changePage("home")});
        this.shadow.querySelector("#deskBtn").addEventListener("click", ()=>{changePage("desk")});

        this.populateLocations();
    }

    get status(){
        return this._status;
    }

    set status(value){
        this._status = value;

        switch(value){
            case "home":
                this.shadow.querySelector("#locationSelect").style.display = "flex";
                break;
            case "desk":
                this.shadow.querySelector("#locationSelect").style.display = "flex";
                break;
            case "office":
                this.shadow.querySelector("#locationSelect").style.display = "none";
                break;
        }
    }

    populateLocations(){
        fetch("/location", {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((locations)=>{
                if(locations.error){
                    requestError(locations.message);
                }else{
                    let locationSelect = this.shadow.querySelector("#locationSelect");
                    for(let i = 0; i < locations.length; i++){
                        let option = document.createElement("option");
                        option.textContent = locations[i].name;
                        option.value = locations[i]._id;
                        locationSelect.appendChild(option);
                    }

                    locationSelect.addEventListener("change", this.changeLocation.bind(this));
                }
            })
            .catch((err)=>{
                console.log(err);
                requestError(err.message);
            });
    }

    changeLocation(){
        let locationId = this.shadow.querySelector("#locationSelect").value;
        document.querySelector("home-page").addLocation(locationId);
    }
}

customElements.define("header-comp", Header);
