const html = `
<header>
    <button id="backBtn">
        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000"><path d="M15 6L9 12L15 18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <p>Back to Office</p>
    </button>

    <button id="addMemberBtn">
        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000"><path d="M6 12H12M18 12H12M12 12V6M12 12V18" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>

        <p id="addMemberBtn">Add member</p>
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
    z-index: 2;
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
    align-items: center;
    max-width: 815px;
    margin: 0 auto;
    width: 75%;
    overflow: auto;
    box-sizing: border-box;
    padding: 5px;
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
        this.shadow.querySelector("#addMemberBtn").addEventListener("click", this.addMember.bind(this));
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
            .then((office)=>{
                if(office.error){
                    requestError(office.message);
                }else{
                    this.displayMembers(office.users, office.members);
                }
            })
            .catch((err)=>{
                console.log(err);
                requestError(err.message);
            });
    }

    displayMembers(members, memberData){
        let membersDiv = this.shadow.querySelector("#members");

        while(membersDiv.children.length > 0){
            membersDiv.removeChild(membersDiv.firstChild);
        }

        for(let i = 0; i < members.length; i++){
            if(members[i].userId){
                for(let j = 0; j < memberData.length; j++){
                    if(members[i].userId === memberData[j]._id){
                        members[i].member = memberData[j];
                        break;
                    }
                }
            }

            let member = document.createElement("member-comp");
            member.data = members[i];
            member.office = this._id;
            membersDiv.appendChild(member);
        }
    }

    addMember(){
        let addMemberComp = document.createElement("add-member-comp");
        addMemberComp.office = this._id;
        this.shadow.appendChild(addMemberComp);
    }

    destroy(){
        this.getRootNode().host.shadow.removeChild(this);
    }
}

customElements.define("office-members-comp", OfficeMembers);
