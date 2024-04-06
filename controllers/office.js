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
        Office.findOne({_id: req.params.officeId})
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
                            message: "Server error"
                        });
                }
            });
    },

    /*
    POST: create new table for an office
    req.params.officeId = String ID
    response = {}
     */
    createTable: function(req, res){
        console.log(req.params);
        Office.findOne({_id: req.params.officeId})
            .then((office)=>{
                if(office.owner.toString() !== res.locals.user._id.toString()) throw "owner";

                let newTable = {
                    type: "general",
                    occupants: []
                };

                for(let i = 0; i < 6; i++){
                    newTable.occupants.push({seatNumber: i});
                }

                office.tables.push(newTable);

                console.log(office);
                return office.save();
            })
            .then((office)=>{
                return res.json(office);
            })
            .catch((err)=>{
                switch(err){
                    case "owner": return res.json({
                        error: true,
                        message: "Invalid permissions"
                    });
                    default:
                        console.error(err);
                        res.json({
                            error: true,
                            message: "Server error"
                        });
                }
            });
    }
}
