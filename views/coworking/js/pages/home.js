const html = ``;

const css = `
    :host{
        display: flex;
    }

    location-comp{
        width: 75%;
    }

    office-display-comp{
        width: 25%;
        min-width: 200px;
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
        let location = document.createElement("location-comp");
        location.id = `location_${locationId}`;
        this.shadow.appendChild(location);
        this.addOfficeDisplay();
    }

    addOfficeDisplay(){
        let officeDisplay = document.createElement("office-display-comp");
        this.shadow.appendChild(officeDisplay);
    }
}

customElements.define("home-page", HomePage);
