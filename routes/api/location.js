const controller = require("../../controllers2/location.js");
const {auth} = require("../../auth.js");

module.exports = (app)=>{
    app.post("/location/table/join", auth, (req, res)=>{
        const jitsiToken = controller.createToken(
            res.locals.user,
            req.body.location,
            req.body.table
        );

        controller.joinTable(res.locals.user, req.body.location, req.body.table);

        res.json(jitsiToken);
    });
}
