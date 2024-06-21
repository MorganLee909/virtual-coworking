const controller = require("../../controllers2/emailing.js");

module.exports = (app)=>{
    app.post("/newsletter/join", async (req, res)=>{
        try{
            await controller.joinNewsletter(
                req.body.email,
                req.body.firstName,
                req.body.lastname
            );
            res.json({});
        }catch(e){
            res.json(controller.handleError(e));
        }
    });
}
