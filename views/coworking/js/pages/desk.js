const html = `
<h1>My Profile</h1>

<div class="avatarManage">
    <img id="avatarIcon">
    
    <div class="avatarManageText">
        <p>For a better user experience we encourage you to upload your real picture</p>

        <button id="uploadPictureBtn">Upload Your Picture</button>
    </div>
</div>

<div class="nameContainer">
    <label>First Name
        <input id="firstNameChange" type="text" placeholder="First Name">
    </label>

    <label>Last Name
        <input id="lastNameChange" type="text" placeholder="Last Name">
    </label>
</div>

<label>Email
    <input id="emailChange" type="email" placeholder="Email">
</label>

<label>Password
    <p id="passChangeNote">*Updating your password will log you out of all devices (including this one)</p>
    <input id="passwordChange" type="password" placeholder="Password">
</label>

<a class="payment" href="https://billing.stripe.com/p/login/test_9AQeWH64Fgm00rSaEE" target="_blank">
    <svg width="26" height="24" viewBox="0 0 26 24" fill="none">
<path d="M0.566211 3.75793V3.75792C0.566161 2.92585 0.910794 2.12198 1.53495 1.5116C2.15896 0.901368 3.0151 0.531253 3.92951 0.481052L4.14564 0.475391H21.7681C22.6852 0.475344 23.5651 0.798576 24.2281 1.37506C24.8898 1.9504 25.2851 2.73353 25.3388 3.5631L25.3449 3.761V15.3664C25.345 16.1985 25.0003 17.0024 24.3762 17.6128C23.7522 18.223 22.8961 18.5931 21.9816 18.6433L21.7655 18.649H4.14302C3.22592 18.649 2.34608 18.3258 1.68302 17.7493C1.02128 17.1739 0.626073 16.3908 0.572308 15.5612L0.566211 15.3633V3.75793ZM23.2271 7.24048V7.04048H23.0271H2.88408H2.68408V7.24048V15.3664V15.3664C2.68413 15.7047 2.81895 16.0283 3.05827 16.2765C3.29718 16.5242 3.62353 16.6799 3.97412 16.718L3.97409 16.7182L3.9847 16.7188L4.132 16.727L4.13198 16.7273H4.14302H21.7681C22.121 16.7272 22.4638 16.6079 22.7313 16.3886C22.9992 16.1689 23.1737 15.8632 23.2166 15.5276L23.217 15.5276L23.2178 15.5152L23.2266 15.3794L23.2271 15.3794V15.3664V7.24048ZM20.393 11.198L20.3988 11.2043L20.4051 11.2102C20.6021 11.3918 20.7093 11.6346 20.7093 11.8839C20.7093 12.1332 20.6021 12.3759 20.4051 12.5576L20.3989 12.5633L20.3932 12.5695L18.4573 14.6833C18.3613 14.7739 18.2461 14.847 18.1178 14.8978C17.9874 14.9494 17.8467 14.9768 17.7039 14.9779C17.5611 14.9791 17.4198 14.954 17.2884 14.9044C17.1571 14.8548 17.0387 14.782 16.9399 14.6909C16.8412 14.5999 16.7641 14.4925 16.7122 14.3756C16.6603 14.2587 16.6345 14.1341 16.6357 14.0089C16.6369 13.8837 16.665 13.7595 16.7191 13.6434L16.5378 13.5589L16.7191 13.6434C16.7733 13.5272 16.8525 13.421 16.953 13.3315L16.953 13.3315L16.9562 13.3286L17.1072 13.1881L17.4799 12.8417H16.971H11.4154C11.1295 12.8417 10.8583 12.7368 10.6607 12.5546C10.4637 12.373 10.3564 12.1302 10.3564 11.8808C10.3564 11.6315 10.4637 11.3887 10.6607 11.207C10.8583 11.0248 11.1295 10.92 11.4154 10.92H16.9723H17.4842L17.1079 10.5729L16.9556 10.4325L16.9555 10.4324C16.7583 10.2508 16.6509 10.008 16.6509 9.75855C16.6508 9.50913 16.758 9.26627 16.955 9.08448C17.1525 8.90219 17.4237 8.79722 17.7097 8.79713C17.9926 8.79704 18.2613 8.8997 18.4585 9.07842L20.393 11.198ZM2.68408 4.91878V5.11878H2.88408H23.0271H23.2271V4.91878V3.75793C23.2271 3.39154 23.0691 3.04378 22.7939 2.79006L22.6583 2.93709L22.7939 2.79006C22.5193 2.53684 22.15 2.39709 21.7681 2.39709H4.14302C3.76108 2.39709 3.39185 2.53684 3.11724 2.79006C2.84208 3.04378 2.68408 3.39154 2.68408 3.75793V4.91878Z" fill="#C2C2C2" stroke="#FAFAFA" stroke-width="0.4"/>
</svg>

    <p>Manage Billing and Subscription</p>
</a>
`;

const css = `
*{margin:0;padding:0;box-sizing:border-box;}

:host{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    padding: 55px 0;
}

h1{
    color: #2f2f33;
    font-size: 23px;
    font-weight: 700;
}

.avatarManage{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 420px;
}

#avatarIcon{
    cursor: pointer;
    height: 110px;
    width: 110px;
    border-radius: 8px;
}

.avatarManageText{
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 280px;
    height: 100%;
    font-size: 14px;
}

.avatarManageText button{
    font-weight: 600;
    color: #4f4f50;
    margin-top: 15px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
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
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.25) inset;
    padding-left: 15px;
}

.nameContainer{
    display: flex;
}

.nameContainer label{
    width: 200px;
    margin: 0 12px;
}

#passChangeNote{
    font-size: 10px;
    color: black;
}

.payment{
    display: flex;
    font-size: 14px;
    font-weight: 600;
    color: #4f4f50;
    text-decoration: none;
}

.payment svg{
    display: flex;
    align-items: center;
}

.payment p{
    margin: 0 0 0 18px;
}
`;

class DeskPage extends HTMLElement{
    constructor(){
        super();

        const template = document.createElement("template");
        template.innerHTML = `<style>${css}</style>${html}`;
        this.shadow = this.attachShadow({mode: "open"});
        this.shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback(){
        let firstName = this.shadow.querySelector("#firstNameChange");
        let lastName = this.shadow.querySelector("#lastNameChange");
        let email = this.shadow.querySelector("#emailChange");
        let password = this.shadow.querySelector("#passwordChange");
        let avatar = this.shadow.querySelector("#avatarIcon");

        password.value = "**********";

        firstName.addEventListener("change", ()=>{this.updateProfile("firstName", firstName.value, "First Name")});
        lastName.addEventListener("change", ()=>{this.updateProfile("lastName", lastName.value, "Last name")});
        email.addEventListener("change", ()=>{this.updateProfile("email", email.value, "Email")});
        password.addEventListener("change", ()=>{this.updateProfile("password", password.value, "Password")});
        avatar.addEventListener("click", this.chooseProfilePhoto);
        this.shadow.querySelector("#uploadPictureBtn").addEventListener("click", this.chooseProfilePhoto);
    }

    get firstName(){
        return this._firstName;
    }

    set firstName(value){
        this.shadow.querySelector("#firstNameChange").value = value;
        this._firstName = value;
    }

    get lastName(){
        return this._lastName;
    }

    set lastName(value){
        this.shadow.querySelector("#lastNameChange").value = value;
        this._lastName = value;
    }

    get email(){
        return this._email;
    }

    set email(value){
        this.shadow.querySelector("#emailChange").value = value;
        this._email = value;
    }

    get avatar(){
        return this._avatar;
    }

    set avatar(value){
        this.shadow.querySelector("#avatarIcon").src= value;
        this._avatar = value;
    }

    updateProfile(field, value, fieldName){
        let data = {};
        data[field] = value;

        fetch("/user/profile", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
            },
            body: JSON.stringify(data)
        })
            .then(r=>r.json())
            .then((response)=>{
                if(response.error){
                    requestError(response.message);
                }else if(field === "password"){
                    localStorage.removeItem("coworkToken");
                    window.location.href = "/user/login";
                }else{
                    createBanner("green", `${fieldName} has been updated`);
                    if(field === "firstName") this.updateIcon();
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    }

    chooseProfilePhoto(){
        let input = document.createElement("input");
        input.type = "file";
        input.click();

        input.addEventListener("change", ()=>{
            let data = new FormData();
            data.append("image", input.files[0]);

            fetch("/user/profile/image", {
                method: "post",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("coworkToken")}`
                },
                body: data
            })
                .then(r=>r.json())
                .then((response)=>{
                    if(response.error){
                        createBanner("red", response.message);
                    }else{
                        user.avatar = response;
                        document.getElementById("avatarIcon").src = user.avatar;
                        createBanner("green", "Profile image updated");
                        let data = {
                            token: localStorage.getItem("coworkToken"),
                            action: "updateIcon",
                            location: user.currentLocation
                        };

                        socket.send(JSON.stringify(data));
                    }
                })
                .catch((err)=>{
                    createBanner("red", "Server error");
                });
        });
    }

    updateIcon(){
        let data = {
            token: localStorage.getItem("coworkToken"),
            action: "updateIcon",
            location: user.currentLocation
        };

        socket.send(JSON.stringify(data));
    }

}

customElements.define("desk-page", DeskPage);
