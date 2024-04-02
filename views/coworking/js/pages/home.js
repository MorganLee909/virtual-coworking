module.exports = {
    rendered: false,
    meetingDiv: document.getElementById("meeting"),

    render: function(){
        if(!this.rendered){
            this.rendered = true;

            //Retrieve and build user/tables
            this.populateLocations();

            //Add Location component
            let location = document.createElement("location-comp");
            location.id = `location_${user.defaultLocation}`;
            document.getElementById("homePage").appendChild(location);
        }
    },

    changeLocation: function(){
        let locationId = document.getElementById("locationSelect").value;
        let data = {
            action: "changeLocation",
            token: localStorage.getItem("coworkToken"),
            location: locationId
        }
        socket.send(JSON.stringify(data));
    },

    populateLocations: function(){
        fetch("/location", {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r=>r.json())
            .then((response)=>{
                if(response.error){
                    createBanner("red", response.message);
                }else{
                    let locations = document.getElementById("locationSelect");

                    for(let i = 0; i < response.length; i++){
                        let option = document.createElement("option");
                        option.value = response[i]._id;
                        option.textContent = response[i].name;
                        locations.appendChild(option);
                    }
                }

                document.getElementById("locationSelect").addEventListener("change", this.changeLocation.bind(this));
            })
            .catch((err)=>{
                createBanner("red", "Server error");
            });
    }
}
