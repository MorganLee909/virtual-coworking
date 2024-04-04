module.exports = {
    rendered: false,
    meetingDiv: document.getElementById("meeting"),

    render: function(){
        if(!this.rendered){
            this.rendered = true;

            //Retrieve and build user/tables
            this.populateLocations();

            //Add Location component
            this.addLocation(user.defaultLocation);

            //Add OfficeDisplay component
            this.addOfficeDisplay();
        }
    },

    addLocation: function(locationId){
        let location = document.createElement("location-comp");
        location.id = `location_${locationId}`;
        document.getElementById("homePage").appendChild(location);
    },

    changeLocation: function(){
        let locationId = document.getElementById("locationSelect").value;

        let oldLocation = document.getElementById(`location_${user.currentLocation}`);
        oldLocation.parentElement.removeChild(oldLocation);

        let offices = document.querySelector("office-display-comp");
        if(offices) offices.parentElement.removeChild(offices);

        user.currentLocation = locationId;
        this.addOfficeDisplay();

        this.addLocation(locationId);
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
    },

    addOfficeDisplay: function(){
        let officeDisplay = document.createElement("office-display-comp");
        document.getElementById("homePage").appendChild(officeDisplay);
    }
}
