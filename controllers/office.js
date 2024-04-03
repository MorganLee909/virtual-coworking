const Office = require("../models/office.js");

module.exports = {
    /*
    GET: get all offices for a specific location
    req.params.locationId = String
    response = [Office]
     */
    getOffices: function(req, res){
        Office.find({location: req.params.locationId}, {_id: 1, name: 1})
            .then((office)=>{
                res.json(office);
            })
            .catch((err)=>{
                console.error(err);
                res.json({
                    error: true,
                    message: "Server error"
                });
            });
    },

    /*
    GET: get data for a specific office
    req.params.officeId = String
    response = Office
     */
    getOffice: function(req, res){
        Office.find({location: req.params.locationId})
            .then((office)=>{
                let isUser = false;
                for(let i = 0; i < office.users.length; i++){
                    if(office.users[i].toString() === res.locals.user._id.toString()){
                        isUser = true;
                        break;
                    }
                }
                if(!isUser) throw "auth";
                
                res.json(office);
            })
            .catch((err)=>{
                switch(err){
                    case "auth": return res.json({
                        error: true,
                        message: "auth"
                    });
                    default:
                        console.error(err);
                        return res.json({
                            error: true,
                            message: "Server error";
                        });
                }
            });
    }
}
