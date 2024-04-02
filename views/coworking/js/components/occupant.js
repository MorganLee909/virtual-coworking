const html = `
<p class="name"</p>
<img class="avatar">
`;

const css = `
:host{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 55px;
    width: 75px;
    border-radius: 8px;
    background: rgba(105, 105, 105, 0.2);
    margin: 0 35px;
    color: black;
    position: relative;
    border: 1px solid rgba(167, 167, 167, 0.2);
}

:host.noBorder img{
    border: none;
}

.name{
    position: absolute;
    bottom: -50%;
    left: 0;
    width: 100%;
    text-align: center;
}

:host.goldBorder{
    border: 3px solid gold;
}

img{
    height: 100%;
    width: 100%;
    border-radius: 5px;
    border: 2px solid rgba(167, 167, 167, 0.2);
}
`;

/*
id = <occupant_ID>
userId = User Id
name = User firstName
avatar = User avatar link
 */
class Occupant extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "closed"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    set name(value){
        this.name = value;
        this.querySelector(".name").textContent = this.name;
    }

    set avatar(value){
        this.avatar = value;
        this.querySelector("img").src = this.avatar;
    }

    emptySelf(){
        this.id = undefined;
        this.userId = undefined;
        this.name = undefined;
        this.avatar = undefined;

        this.querySelector(".name").textContent = "";
        this.querySelector("img").src = "";
    }
}

customElements.define("occupant-comp", Occupant);
