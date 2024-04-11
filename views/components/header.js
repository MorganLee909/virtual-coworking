
const html = `
    <header>
        <div>
            <a href="/" alt="Home Page">
                <img src="/image/text-logo.svg" class="logo" alt="CoSphere Logo"/>
            </a>
        </div>

        <a href='/user/signup' class="loginSignUpTitle" alt="Sign Up">
            <svg class="iconLogin" width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <g id="signInIcon">
                <path id="Vector" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M9.86712 5.73882C9.69029 5.91587 9.59096 6.15588 9.59096 6.40612C9.59096 6.65636 9.69029 6.89637 9.86712 7.07342L12.3475 9.55378L3.05685 9.55378C2.8064 9.55378 2.56622 9.65327 2.38913 9.83036C2.21204 10.0074 2.11255 10.2476 2.11255 10.4981C2.11255 10.7485 2.21204 10.9887 2.38913 11.1658C2.56622 11.3429 2.8064 11.4424 3.05685 11.4424L12.3475 11.4424L9.86712 13.9227C9.70032 14.1017 9.60951 14.3385 9.61383 14.5831C9.61815 14.8278 9.71725 15.0612 9.89026 15.2342C10.0633 15.4072 10.2967 15.5063 10.5413 15.5106C10.786 15.5149 11.0227 15.4241 11.2017 15.2573L15.2937 11.1654L15.9622 10.4981L15.2949 9.83077L11.203 5.73882C11.1153 5.65107 11.0112 5.58146 10.8966 5.53396C10.782 5.48647 10.6591 5.46202 10.5351 5.46202C10.411 5.46202 10.2882 5.48647 10.1735 5.53396C10.0589 5.58146 9.95482 5.65107 9.86712 5.73882ZM13.1294 17.4229C12.8789 17.4229 12.6387 17.5224 12.4616 17.6995C12.2845 17.8766 12.1851 18.1168 12.1851 18.3672C12.1851 18.6177 12.2845 18.8579 12.4616 19.0349C12.6387 19.212 12.8789 19.3115 13.1294 19.3115L17.2213 19.3115C17.8892 19.3115 18.5297 19.0462 19.0019 18.574C19.4741 18.1017 19.7394 17.4612 19.7394 16.7934L19.7394 4.20276C19.7394 3.53491 19.4741 2.89441 19.0019 2.42217C18.5297 1.94993 17.8892 1.68463 17.2213 1.68463L13.1294 1.68463C12.8789 1.68463 12.6387 1.78412 12.4616 1.96121C12.2845 2.1383 12.1851 2.37849 12.1851 2.62893C12.1851 2.87937 12.2845 3.11956 12.4616 3.29665C12.6387 3.47374 12.8789 3.57323 13.1294 3.57323L17.2213 3.57323C17.3883 3.57323 17.5484 3.63955 17.6665 3.75761C17.7845 3.87567 17.8508 4.0358 17.8508 4.20276L17.8508 16.7934C17.8508 16.9604 17.7845 17.1205 17.6665 17.2385C17.5484 17.3566 17.3883 17.4229 17.2213 17.4229L13.1294 17.4229Z"/>
                </g>
            </svg>
            Sign Up
        </a>
    </header>
`;

const css = `
    *{margin:0;padding:0;box-sizing:border-box;}

    header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 80px;
        width: 100%;
        margin: 13px 0;
        padding: 26px;
    }

    .logo{
        margin-top: 6px;
        height: 80px;
    }

    .loginSignUpTitle{
        align-items: center;
        display: flex;
        flex-wrap: nowrap;
        color: var(--grey);
        font-family: "Open Sans";
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        cursor: pointer;
        margin-right: 12px;
    }

    .loginSignUpTitle:hover{
        color: var(--primary);
    }

    .loginSignUpTitle:hover .loginIcon {
        fill: var(--primary);
    }

    .loginSignUpTitle > a{
        margin-right: 35px;
    }

    .iconLogin{
        margin-right: 8px;
        fill: var(--grey);
    }

    a{
        color: var(--darkGray);
        cursor: pointer;
        text-decoration: none;
    }

    a:hover{
        color: var(--primary);
    }

    @media screen and (max-width: 750px) {

    header{
        padding: 0;
        margin: 0;
        margin-bottom: 20px;
    }

    .loginSignUpTitle{
        margin-right: 0px;
    }

    .logo{
        margin-top: 6px;
        height: 60px;
    }

}

`;

class MyHeaderElement extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({ mode: 'closed' });
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
;
    }
}

customElements.define('my-header-element', MyHeaderElement);
