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

    app.get("/office/:officeId", auth, async (req, res)=>{
        try{
            const office = await Office.findOne({_id: req.params.officeId});
            const isAuthorized = controller.userIsAuthorized(office.users, res.locals.user._id.toString());
            if(!isAuthorized) throw "unauthorizedUser";

            res.json(office);
        }catch(e){
            res.json(controller.handleError(e));
        }
    });

    app.post("/office/:officeId/table", auth, async (req, res)=>{
        try{
            let office = await Office.findOne({_id: req.params.officeId});
            if(!controller.isOfficeOwner(office, res.locals.user)) throw "notOwner";
            office = controller.createNewTable(office);
            await office.save();
            res.json(office);
        }catch(e){
            res.json(controller.handleError(e));
        }
    });
}
