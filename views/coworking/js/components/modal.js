const html = `
<p class="message"</p>
<div class="buttons">
    <button class="cancel">Cancel</button>
    <button class="confirm">Confirm</button>
</div>
`;

const css = `
:host{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 350px;
    width: 500px;
    position: fixed;
    top: calc(50% - 175px);
    left: calc(50% - 250px);
    background: white;
    z-index: 2;
    box-shadow: 0 0 5px black;
    padding: 35px;
    box-sizing: border-box;
    text-align: center;
    font-size: 22px;
}

.buttons{
    display: flex;
}

button{
    width: 150px;
    height: 50px;
    margin: 35px;
    border-radius: 3px;
    background: linear-gradient(300deg, #3581C1 33.58%, #50A2E7 54.2%, #3581C1 75.24%);
    box-shadow: 0px 20px 18px 0px rgba(25, 115, 197, 0.15);
    font-size: 16px;
    color: white;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none;
}
`;

class Modal extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.shadow.querySelector(".cancel").addEventListener("click", this.destroy.bind(this));
        this.shadow.querySelector(".confirm").addEventListener("click", this.confirm.bind(this));
    }

    set title(title){
        this._title = title;
        let titleElem = document.createElement("h1");
        titleElem.textContent = title;
        this.shadow.insertBefore(titleElem, this.shadow.firstChild);
    }

    set message(message){
        this._message = message;
        this.shadow.querySelector(".message").textContent = message;
    }

    confirm(){
        this.getRootNode().host.confirmRemove();
    }

    destroy(){
        this.getRootNode().host.shadow.removeChild(this);
    }
}

customElements.define("modal-comp", Modal);
