module.exports = {
    rendered: false,

    render: function(){
        if(!this.rendered){
            let firstName = document.getElementById("firstNameChange");
            let lastName = document.getElementById("lastNameChange");
            let email = document.getElementById("emailChange");
            let password = document.getElementById("passwordChange");

            firstName.addEventListener("change", ()=>{this.updateProfile("firstName", firstName.value, "First Name")});
            lastName.addEventListener("change", ()=>{this.updateProfile("lastName", lastName.value, "Last name")});
            email.addEventListener("change", ()=>{this.updateProfile("email", email.value, "Email")});
            password.addEventListener("change", ()=>{this.updateProfile("password", password.value, "Password")});

            document.getElementById("avatarIcon").addEventListener("click", this.chooseProfilePhoto);
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
                    createBanner("red", response.message);
                }else{
                    createBanner("green", "Your profile has been updated");
                    createBanner("green", `${fieldName} has been updated`);
                }
            })
            .catch((err)=>{
                createBanner("red", "Server error");
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
                        console.log(response);
                    }
                })
                .catch((err)=>{
                    createBanner("red", "Server error");
                });
        });
    }
}
