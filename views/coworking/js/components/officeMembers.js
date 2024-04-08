const html = `
<header>
    <button id="backBtn">
        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000"><path d="M15 6L9 12L15 18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <p>Back to Office</p>
    </button>

    <button id="addMemberBtn">
        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>

        <p>Add member</p>
    </button>
</header>

<div id="members"></div>
`;

const css = `
:host{
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    height: calc(100vh - 110px);
    width: 100%;
    background: #fafafa;
}

header{
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0 35px;
    box-sizing: border-box;
}

header button{
    display: flex;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
}

#members{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 815px;
    margin: 0 auto;
    width: 75%;
    height: 100%;
}
`;

class OfficeMembers extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.shadow.querySelector("#backBtn").addEventListener("click", this.destroy.bind(this));
        this.getMembers();
    }

    getMembers(){
        fetch(`office/${this._id}/members`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            }
        })
            .then(r=>r.json())
            .then((members)=>{
                if(members.error){
                    requestError(members.message);
                }else{
                    this.displayMembers(members);
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    displayMembers(members){
        console.log(members);
        let membersDiv = this.shadow.querySelector("#members");
        for(let i = 0; i < members.length; i++){
            console.log(i);
            let member = document.createElement("member-comp");
            member.data = members[i];
            membersDiv.appendChild(member);
        }
    }

    destroy(){
        this.getRootNode().host.shadow.removeChild(this);
    }
}

customElements.define("office-members-comp", OfficeMembers);
