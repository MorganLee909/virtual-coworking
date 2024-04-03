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
    }
}
