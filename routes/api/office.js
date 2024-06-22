const Office = require("../../models/office.js");
const User = require("../../models/user.js");

const controller = require("../../controllers2/office.js");
const sendEmail = require("../../controllers/sendEmail.js");
const inviteExistingMember = require("../../email/inviteExistingMember.js");
const inviteNewMember = require("../../email/inviteNewMember.js");
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

    app.get("/office/:officeId/members", auth, async (req, res)=>{
        try{
            const office = await Office.findOne({_id: req.params.officeId});
            if(!controller.isOfficeOwner(office, res.locals.user)) throw "notOwner";
            const members = controller.splitMembersByVerification(office);
            members.verified = await User.find({_id: members.verified}, {
                email: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
                status: 1
            });
            res.json(members.verified.concat(members.unverified));
        }catch(e){
            res.json(controller.handleError(e));
        }
    });

    app.post("/office", auth, async (req, res)=>{
        try{
            const office = controller.createOffice(
                req.body.name,
                res.locals.user._id,
                req.body.location
            );
            await office.save();
            res.json({
                error: false,
                url: "/dashboard"
            });
        }catch(e){
            res.json(controller.handleError(e));
        }
    });

    app.post("/office/:officeId/member", auth, async (req, res)=>{
        try{
            const userProm = User.findOne({email: req.body.email.toLowerCase()});
            const officeProm = Office.findOne({owner: res.locals.user._id});
            const data = await Promise.all([userProm, officeProm]);
            const office = controller.createMember(data[1], data[0], req.body.email);
            await office.save();
            
            let link = "";
            let html = "";
            if(data[0]){
                link = `${req.protocol}://${req.get("host")}/office/invite/${office._id}/${data[0]._id}`;
                html = inviteExistingMember(link, res.locals.user.firstName, office.name);
            }else{
                link = `${req.protocol}://${req.get("host")}/user/signup`;
                html = inviteNewMember(link, res.locals.user.firstName, office.name);
            }
            sendEmail(
                req.body.email.toLowerCase(),
                "You have been invited to a CoSphere office!",
                html
            );
            
            res.json({
                error: false,
                message: `An invitation has been sent to ${req.body.email.toLowerCase()}`
            });
        }catch(e){
            res.json(controller.handleError(e));
        }
    });
}
