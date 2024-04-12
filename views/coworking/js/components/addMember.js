const html = `
<h1>Add member to office</h1>
<p>*Each member will add $35 to your bill once they accept the invitation</p>

<label>New User Email
    <input id="newMemberEmail" type="email" placeholder="Email">
</label>

<button id="addMemberBtn">Add Member</button>

<button id="cancelBtn">Cancel</button>
`;

const css = `
:host{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    height: 100%;
    width: 100%;
    background: #fafafa;
}

label{
    display: flex;
    flex-direction: column;
    color: #7a7a7a;
    font-size: 14px;
    width: 420px;
}

input{
    height: 50px;
    font-size: 16px;
    border-radius: 2px;
    border: 1px solid #d4d4d4;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25) inset;
    padding-left: 15px;
    background: white;
}

button{
    border-radius: 3px;
    background: linear-gradient(300deg, #3581C1 33.58%, #50A2E7 54.2%, #3581C1 75.24%);
    box-shadow: 0px 20px 18px 0px rgba(25, 115, 197, 0.15);
    padding: 13px 0;
    width: 420px;
    color: white;
    border: none;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    margin: 10px 0;
}

#cancelBtn{
    background: red;
}

button:hover{
    background: linear-gradient(300deg, #3581C1 16.77%, #50A2E7 62.02%, #3581C1 82.83%);
    box-shadow: 0px 0px 18px 0px rgba(25, 115, 197, 0.21);
}
`;

class AddMember extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.shadow.querySelector("#cancelBtn").addEventListener("click", this.destroy.bind(this));
        this.shadow.querySelector("#addMemberBtn").addEventListener("click", this.addMember.bind(this));
    }

    addMember(){
        let email = this.shadow.querySelector("#newMemberEmail").value;
        console.log("fetching");
        fetch(`/office/${this.office}/member`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            },
            body: JSON.stringify({email: email})
        })
            .then(r=>r.json())
            .then((response)=>{
                console.log(response);
                if(response.error){
                    requestError(response.message);
                }else{
                    createBanner("green", `Invitation email sent to ${email}`);
                    this.getRootNode().host.getMembers();
                    this.destroy();
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    destroy(){
        this.getRootNode().host.shadow.removeChild(this);
    }
}

customElements.define("add-member-comp", AddMember);
