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
        console.log("getting office");
    }
}

customElements.define("office-page", Office);
