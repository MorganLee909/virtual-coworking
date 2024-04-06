const html = ``;

const css = `
:host{
    display: flex;
}

location-comp{
    width: 75%;
}
`;

class HomePage extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));

        this.rendered = false;
    }

    addLocation(locationId){
        let oldLocation = this.shadow.querySelector(`#location_${user.currentLocation}`);
        if(oldLocation) oldLocation.destroy();
        let oldOfficeDisplay = this.shadow.querySelector("office-display-comp");
        if(oldOfficeDisplay) oldOfficeDisplay.destroy();

        user.currentLocation = locationId;
        let location = document.createElement("location-comp");
        location.id = `location_${locationId}`;
        this.shadow.appendChild(location);
        this.addOfficeDisplay();
    }

    addOfficeDisplay(){
        let officeDisplay = document.createElement("office-display-comp");
        this.shadow.appendChild(officeDisplay);
    }

    updateTables(tables){
        this.shadow.querySelector("location-comp").updateTables(tables);
    }
}

customElements.define("home-page", HomePage);
