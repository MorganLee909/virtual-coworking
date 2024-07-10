const Office = require("../../models/office.js");
const User = require("../../models/user.js");

const controller = require("../../controllers2/office.js");
const sendEmail = require("../../controllers/sendEmail.js");
const inviteExistingMember = require("../../email/inviteExistingMember.js");
const inviteNewMember = require("../../email/inviteNewMember.js");
const memberRemoved = require("../../email/memberRemoved.js");
const {auth} = require("../../auth.js");

const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);
const ObjectId = require("mongoose").Types.ObjectId;

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
            let office = await Office.aggregate([
                {$match: {_id: new ObjectId(req.params.officeId)}},
                {$lookup: {
                    from: "users",
                    localField: "users.userId",
                    foreignField: "_id",
                    as: "members",
                    pipeline: [{$project: {
                        email: 1,
                        firstName: 1,
                        lastName: 1,
                        avatar: 1,
                        status: 1
                    }}]
                }}
            ]);
            if(!controller.isOfficeOwner(office[0], res.locals.user)) throw "notOwner";
            res.json(office[0]);
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

    app.get("/office/invite/:officeId/:invitedId", async (req, res)=>{
        try{
            const [user, office] = await Promise.all([
                User.findOne({_id: req.params.invitedId}),
                Office.findOne({_id: req.params.officeId})
            ]);
            const owner = await User.findOne({_id: office.owner});
            const officeSub = await stripe.subscriptions.retrieve(owner.stripe.subscriptionId);

            if(!user || !office) throw "badInvitation";
            const updatedOffice = controller.activateUser(office, user._id.toString());

            let promises = [stripe.subscriptions.retrieve(owner.stripe.subscriptionId), null];
            if(user.stripe.subscriptionId){
                promises[1] = stripe.subscriptions.cancel(user.stripe.subscriptionId);
                user.stripe.subscriptionId = undefined;
            }
            const [ownerSub, userSub] = await Promise.all(promises);
            const activeUsers = controller.countActiveUsers(updatedOffice);
            const items = controller.getSubscriptionItems(ownerSub, activeUsers);
            
            await Promise.all([
                stripe.subscriptions.update(owner.stripe.subscriptionId, items),
                office.save()
            ]);

            res.redirect("/dashboard");
        }catch(e){
            res.json(controller.handleError(e));
        }
    });

    app.delete("/office/:office/member/:member", auth, async (req, res)=>{
        try{
            const [office, ownerSub] = await Promise.all([
                Office.findOne({_id: req.params.office}),
                stripe.subscriptions.retrieve(res.locals.user.stripe.subscriptionId)
            ]);
            if(!controller.isOfficeOwner(office, res.locals.user)) throw "notOwner";

            const data = controller.removeMember(office, req.params.member);
            const updatedOffice = data.office;
            const userEmail = data.email;
            const activeUsers = controller.countActiveUsers(office);
            const items = controller.getSubscriptionItems(ownerSub, activeUsers);
            stripe.subscriptions.update(res.locals.user.stripe.subscriptionId, items);
            const member = await User.findOne({email: userEmail});
            let saves = [updatedOffice.save()];
            if(member){
                sendEmail(
                    userEmail,
                    `You have been removed from ${updatedOffice.name} office`,
                    memberRemoved(member.firstName, updatedOffice.name)
                );
                const otherOffices = await Office.find({users: {$elemMatch: {email: member.email}}});
                if(otherOffices.length === 0) member.status = "inactive";
                saves.push(member.save());
            }
            await Promise.all(saves);

            res.json({error: false});
            //Update frontend to send memberId instead of userId for req.params.member
            //Update backend to always add and keep email as part of member object
            
        }catch(e){
            res.json(controller.handleError(e));
        }
    });
}
