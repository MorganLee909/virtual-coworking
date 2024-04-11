
const html = `
    <footer>
        <p class="contactUs">
            <a href="mailto:support@cosphere.work">Contact Us</a>
        </p>
        © Copyright 2024 CoSphere – All rights reserved.
    </footer>
`;

const css = `

    footer{
        color: var(--darkGray);
        font-family: "Open Sans";
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 29px;
        padding-bottom: 20px;
        text-align: center;
    }

    footer a {
        color: var(--darkGray);
        cursor: pointer;
        text-decoration: none;
    }

    footer a:hover {
        color: var(--primary);
    }

    .contactUs{
        font-weight: 600;
        padding-top: 40px;
    }
`;

class MyFooterElement extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
;
    }
}

customElements.define('my-footer-element', MyFooterElement);
