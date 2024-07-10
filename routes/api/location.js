const Location = require("../../models/location.js");

const controller = require("../../controllers/location.js");
const {auth} = require("../../auth.js");

module.exports = (app)=>{
    app.post("/location/table/join", auth, async (req, res)=>{
        try{
            let location = await Location.findOne({identifier: req.body.location});

            const jitsiToken = controller.createToken(
                res.locals.user,
                req.body.location,
                req.body.table
            );

            location = controller.joinTable(res.locals.user, location, req.body.table);
            await location.save();

            res.json(jitsiToken);
        }catch(e){
            res.json(controller.handleError(e));
        }
    });

    app.get("/location/:locationId", auth, async (req, res)=>{
        try{
            const location = await Location.findOne({_id: req.params.locationId});
            res.json(location);
        }catch(e){
            res.json(controller.handleError(e));
        }
    });

    app.get("/location", auth, async (req, res)=>{
        try{
            const locations = await Location.find({}, {_id: 1, name: 1});
            res.json(locations);
        }catch(e){
            console.log(e);
            res.json(controller.handleError(e));
        }
    });
}
