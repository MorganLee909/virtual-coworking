const Office = require("../../models/office.js");

const controller = require("../../controllers2/office.js");
const {auth} = require("../../auth.js");

module.exports = (app)=>{
    app.get("/office/location/:locationId", auth, async (req, res)=>{
        try{
            const offices = await Office.find({location: req.params.locationId}, {_id: 1, name: 1});
            res.json(offices);
        }catch(e){
            res.json(controller.handleError(e));
        }
    });
}
