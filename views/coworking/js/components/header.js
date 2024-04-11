const html = `
<a href="/">
    <img src="/image/text-logo.svg" alt="CoSphere logo with text"/>
</a>

<select id="locationSelect" class="center home"></select>

<h1 id="officeTitle" class="center office"></h1>

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

h1{
    font-size: 27px;
    font-weight: bold;
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

    get officeTitle(){
        return this._officeTitle;
    }

    set officeTitle(value){
        this._officeTitle = value;
        this.shadow.querySelector("#officeTitle").textContent = value;
    }

    get status(){
        return this._status;
    }

    set status(value){
        this._status = value;

        let center = this.shadow.querySelectorAll(".center");
        for(let i = 0; i < center.length; i++){
            center[i].style.display = "none";
        }

        let pageElements = this.shadow.querySelectorAll(`.${value}`);
        for(let i = 0; i < pageElements.length; i++){
            pageElements[i].style.display = "flex";
        }
    }

    get currentLocation(){
        return this._currentLocation;
    }

    set currentLocation(value){
        this.shadow.querySelector("#locationSelect").value = value;
        this._currentLocation = value;
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

                    locationSelect.value = this._currentLocation;
                    locationSelect.addEventListener("change", this.changeLocation.bind(this));

                    document.querySelector("desk-page").locations = locations;
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    changeLocation(){
        let locationId = this.shadow.querySelector("#locationSelect").value;
        document.querySelector("home-page").addLocation(locationId);
    }
}

customElements.define("header-comp", Header);
