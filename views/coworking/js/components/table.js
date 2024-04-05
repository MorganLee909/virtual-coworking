const html = `
<p class="joinTitle">Join</p>

<occupant-comp seatnumber="0"></occupant-comp>
<occupant-comp seatnumber="1"></occupant-comp>
<occupant-comp seatnumber="2"></occupant-comp>
<occupant-comp seatnumber="3"></occupant-comp>
<occupant-comp seatnumber="4"></occupant-comp>
<occupant-comp seatnumber="5"></occupant-comp>
`;

const css = `
:host{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    height: 325px;
    width: 500px;
    border: 3px solid #dadada;
    background: white;
    box-shadow: 10px 18px 15px 0 rgba(0, 0, 0, 0.09);
    border-radius: 21px;
    position: relative;
    cursor: pointer;
    margin: 35px;
}

:host(:hover){
    border: 3px solid #718ef0;
}

:host(.joinedTable){
    border: 3px solid #719ef0;
}

.joinTitle{
    display: none;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: -23px;
    right: calc(50% - 40px);
    height: 20px;
    width: 80px;
    border-radius: 9px;
    background: #719ef0;
    color: white;
    font-size: 12px;
}

:host(:hover) .joinTitle{
    display: flex;
}
`;

class Table extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.updateOccupants();

        this.addEventListener("click", this.joinTable);
    }

    updateOccupants(){
        for(let i = 0; i < this.occupants.length; i++){
            let seat = this.shadow.querySelector(`[seatnumber="${this.occupants[i].seatNumber}"]`);
            if(!seat) continue;
            if(this.occupants[i].userId && seat.id !== `occupant_${this.occupants[i].userId}`){
                seat.id = `occupant_${this.occupants[i]._id}`;
                seat.userId = this.occupants[i].userId;
                seat.name = this.occupants[i].name;
                seat.avatar = this.occupants[i].avatar;
            }else if(seat.userId && !this.occupants[i].userId){
                seat.emptySelf();
            }
        }
    }

    tableFull(){
        let seats = this.shadow.querySelectorAll("occupant-comp");
        for(let i = 0; i < seats.length; i++){
            if(!seats[i].userId) return false;
        }
        return true;
    }

    joinTable(){
        if(this.tableFull()){
            createBanner("red", "All seats are occupied at this table");
            return;
        }

        fetch("/location/table/join", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            },
            body: JSON.stringify({
                location: this.locationIdentifier,
                table: this.id.split("_")[1]
            })
        })
            .then(r=>r.json())
            .then((response)=>{
                if(response.error){
                    requestError(response.message);
                }else{
                    let blocker = document.createElement("div");
                    blocker.id = "homeBlocker";
                    blocker.setAttribute("id", "homeBlocker");
                    this.parentShadow.appendChild(blocker);

                    let homePageElem = document.getElementById("homePage");
                    let meeting = document.createElement("meeting-comp");
                    meeting.table = this;
                    meeting.token = response;
                    meeting.locationIdentifier = this.locationIdentifier;
                    meeting.close = ()=>{this.removeMeeting(meeting, blocker)};
                    this.parentShadow.appendChild(meeting);

                    this.classList.add("joinedTable");
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    removeMeeting(meeting, blocker){
        let shadowParent = this.getRootNode().host.shadow;
        shadowParent.removeChild(meeting);
        shadowParent.removeChild(blocker);
    }

    leaveTable(){
        this.classList.remove("joinedTable");

        socket.send(JSON.stringify({
            action: "participantLeft",
            token: localStorage.getItem("coworkToken"),
            location: user.currentLocation
        }));
    }

    updateIcon(userId, avatar, name){
        let occupants = this.shadow.querySelectorAll("occupant-comp");

        for(let i = 0; i < occupants.length; i++){
            if(occupants[i].userId === userId){
                occupants[i].updateIcon(avatar, name);
                break;
            }
        }
    }
}

customElements.define("table-comp", Table);
