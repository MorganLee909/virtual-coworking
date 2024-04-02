const html = `
<div id="controlTab">
    <svg id="closeTag" stroke-width="1.5" viewBox="0 0 24 24" fill="none" color="#000000">
        <path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>

    <svg id="expandTag" data-fs="false" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.87859 0.393512C5.87859 0.194519 5.71727 0.0332031 5.51828 0.0332031H1.91096C1.11499 0.0332031 0.469727 0.678466 0.469727 1.47444V5.13242C0.469727 5.33142 0.631042 5.49273 0.830036 5.49273C1.02903 5.49273 1.19034 5.33142 1.19034 5.13242V1.47444C1.19034 1.07645 1.51298 0.753821 1.91096 0.753821H5.51828C5.71727 0.753821 5.87859 0.592506 5.87859 0.393512ZM11.2755 0.753821C11.0765 0.753821 10.9152 0.592506 10.9152 0.393512C10.9152 0.194519 11.0765 0.0332031 11.2755 0.0332031H14.8821C15.6781 0.0332031 16.3233 0.678467 16.3233 1.47444V5.13242C16.3233 5.33142 16.162 5.49273 15.963 5.49273C15.764 5.49273 15.6027 5.33142 15.6027 5.13242V1.47444C15.6027 1.07645 15.2801 0.753821 14.8821 0.753821H11.2755ZM10.9152 15.5265C10.9152 15.3275 11.0765 15.1662 11.2755 15.1662H14.8821C15.2801 15.1662 15.6027 14.8436 15.6027 14.4456V10.8896C15.6027 10.6906 15.764 10.5293 15.963 10.5293C16.162 10.5293 16.3233 10.6906 16.3233 10.8896V14.4456C16.3233 15.2415 15.6781 15.8868 14.8821 15.8868H11.2755C11.0765 15.8868 10.9152 15.7255 10.9152 15.5265ZM0.830036 10.5293C1.02903 10.5293 1.19034 10.6906 1.19034 10.8896V14.4456C1.19034 14.8436 1.51298 15.1662 1.91096 15.1662H5.51828C5.71727 15.1662 5.87859 15.3275 5.87859 15.5265C5.87859 15.7255 5.71727 15.8868 5.51828 15.8868H1.91096C1.11499 15.8868 0.469727 15.2415 0.469727 14.4456V10.8896C0.469727 10.6906 0.631042 10.5293 0.830036 10.5293Z" fill="white"/>
    </svg> 

    <svg id="dragTag" width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path d="M10.1313 2.79206L8.50032 1.16113M8.50032 1.16113L6.86939 2.79206M8.50032 1.16113V15.8395M8.50032 15.8395L10.1313 14.2086M8.50032 15.8395L6.86939 14.2086M14.2086 10.1313L15.8395 8.50032M15.8395 8.50032L14.2086 6.86939M15.8395 8.50032H1.16113M1.16113 8.50032L2.79206 10.1313M1.16113 8.50032L2.79206 6.86939" stroke="white" stroke-width="0.720618" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <div id="homeBlocker"></div>
</div>
`;

const css = `
:host{
    position: fixed;
    top: 25%;
    left: 25%;
    height: 50%;
    width: 50%;
    background: black;
    z-index: 3;
    overflow: visible;
}

:host.fullscreen{
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}

#controlTab{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 65px;
    width: 25px;
    position: absolute;
    bottom: 0;
    right: -25px;
    background: #2f2f2f;
    border-radius: 0 2px 2px 0;
}

#controlTab > *{
    cursor: pointer;
}

#controlTab > *:hover{
    background: #525252;
}

:host.fullscreen #controlTab{
    flex-direction: row;
    top: 0;
    right: 0;
    height: 50px;
    width: 100px;
}

:host.fullscreen #controlTab > *{
    height: 35px;
    width: 35px;
}

:host.fullscreen #dragTag{
    display: none;
}

#homeBlocker{
    height: 100%;
    width: 100%;
    z-index: 2;
    position: absolute;
    top: 0;
    bottom: 0;
}

iframe.resize{
    resize: both;
    overflow: auto;
}
`;

/*
locationIdentifier = Meeting identifier for the location
table = DOM element of table this meeting is part of
token = Jitsi JWT
 */
class Meeting extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "closed"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        this.initIframeAPI()
        this.isFullscreen = false;

        this.shadow.querySelector("#closeTag").addEventListener("click", this.closeMeeting);
        this.shadow.querySelector("#expandTag").addEventListener("click", this.fullscreen);
        this.dragElement(this.shadow.querySelector("#dragTag"));
    }

    initIframeAPI(){
        let table = `${this.locationIdentifier}-${this.table.id.split("_")[1]}`;
        const options = {
            roomName: `vpaas-magic-cookie-05680c1c54f04789935526e7e06a717b/${table}`,
            jwt: this.token,
            height: "100%",
            width: "100%",
            parentNode: this,
            configOverwrite: {
                toolbarButtons: [
                    'camera',
                    'chat',
                    'closedcaptions',
                    'desktop',
                    'download',
                    'embedmeeting',
                    'etherpad',
                    'feedback',
                    'filmstrip',
                    'fullscreen',
                    'hangup',
                    'help',
                    'highlight',
                    'microphone',
                    'noisesuppression',
                    'participants-pane',
                    'profile',
                    'raisehand',
                    'recording',
                    'security',
                    'select-background',
                    'settings',
                    'shareaudio',
                    'sharedvideo',
                    'shortcuts',
                    'stats',
                    'tileview',
                    'toggle-camera',
                    'videoquality',
                    'whiteboard',
                ]
            }
        };

        let api = new JitsiMeetExternalAPI("8x8.vc", options);
        api.addListener("videoConferenceLeft", (data)=>{this.closeMeeting()});
    }

    closeMeeting(){
        this.table.leaveTable();

        this.parentElement.removeChild(this);
    }

    fullScreen(){
        this.classList.toggle("fullscreen");
    }

    dragElement(clickElem){
        let positions = [];

        const dragMouseDown = (e)=>{
            e = e || window.event;
            e.preventDefault();

            positions[2] = e.clientX;
            positions[3] = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        const elementDrag = (e)=>{
            e = e || window.event;
            e.preventDefault();

            positions[0] = positions[2] - e.clientX;
            positions[1] = positions[3] - e.clientY;
            positions[2] = e.clientX;
            positions[3] = e.clientY;

            this.style.top = `${this.offsetTop - positions[1]}px`;
            this.style.left = `${this.offsetLeft - positions[0]}px`;
        }

        const closeDragElement = ()=>{
            document.onmouseup = null;
            document.onmousemove = null;
        }

        clickElem.onmousedown = dragMouseDown;
    }
}

customElements.define("meeting-comp", Meeting);
