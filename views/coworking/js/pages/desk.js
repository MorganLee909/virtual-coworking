module.exports = {
    firstName: document.getElementById("firstNameChange"),
    lastName: document.getElementById("lastNameChange"),
    email: document.getElementById("emailChange"),
    password: document.getElementById("passwordChange"),
    avatar: document.getElementById("avatarIcon"),
    rendered: false,

    render: function(){
        this.firstName.value = user.firstName;
        this.lastName.value = user.lastName;
        this.email.value = user.email;
        this.password.value = "**********";
        this.avatar.src = user.avatar;

        if(!this.rendered){
            this.firstName.addEventListener("change", ()=>{this.updateProfile("firstName", this.firstName.value, "First Name")});
            this.lastName.addEventListener("change", ()=>{this.updateProfile("lastName", this.lastName.value, "Last name")});
            this.email.addEventListener("change", ()=>{this.updateProfile("email", this.email.value, "Email")});
            this.password.addEventListener("change", ()=>{this.updateProfile("password", this.password.value, "Password")});

            this.avatar.addEventListener("click", this.chooseProfilePhoto);
            document.getElementById("uploadPictureBtn").addEventListener("click", this.chooseProfilePhoto);

            this.rendered = true;
        }
    },

    updateProfile: function(field, value, fieldName){
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
                }
            })
            .catch((err)=>{
                requestError(err.message);
            });
    },

    chooseProfilePhoto: function(){
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
                    }
                })
                .catch((err)=>{
                    createBanner("red", "Server error");
                });
        });
    }
}
