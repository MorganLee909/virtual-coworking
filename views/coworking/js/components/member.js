const html = `
    <img>

    <p class="name"></p>

    <p class="email"></p>

    <p class="status"></p>

    <button class="remove">
        <svg width="24px" height="24px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" color="#000000"><path d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 6L15.375 6M3 6L8.625 6M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6L15.375 6" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </button>
`;

const css = `
:host{
    display: flex;
    align-items: center;
    background: white;
    box-shadow: 2px 4px 12px 0px #00000030;
    height: 58px;
    width: 100%;
}

img{
    height: 100%;
}

.name{
    width: 20%;
    padding-left: 35px;
    box-sizing: border-box;
}

.email{
    width: 50%;
}

.status{
    width: 15%;
}

.remove{
    background: none;
    border: none;
    cursor: pointer;
}
`;

class Member extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.shadow.querySelector("img").src = this.data.avatar ? this.data.avatar : "/image/profileIcon.png";
        this.shadow.querySelector(".name").textContent = this.data.firstName ? this.data.firstName : "";
        this.shadow.querySelector(".email").textContent = this.data.email;
        this.shadow.querySelector(".status").textContent = this.data.status;
    }
}

customElements.define("member-comp", Member);
