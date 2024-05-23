const Office = require("../models/office.js");
const User = require("../models/user.js");

const sendEmail = require("./sendEmail.js");
const inviteExistingMember = require("../email/inviteExistingMember.js");

const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);
const uuid = require("crypto").randomUUID;

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
                    if(office.users[i].userId.toString() === res.locals.user._id.toString()){
                        if(office.users[i].status !== "active") throw "auth";
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
    response = Office
     */
    createTable: function(req, res){
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
    },

    /*
    GET: get information for all members of an office
    re.params.officeId = String Id
    response = [User]
     */
    getMembers: function(req, res){
        Office.findOne({_id: req.params.officeId})
            .then((office)=>{
                if(office.owner.toString() !== res.locals.user._id.toString()) throw "owner";

                let users = [];
                for(let i = 0; i < office.users.length; i++){
                    users.push(office.users[i].userId);
                }

                return User.find({_id: users}, {
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    avatar: 1,
                    status: 1
                });
            })
            .then((users)=>{
                res.json(users);
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
            })
    },

    /*
    POST: Create new office
    req.body = {
        name: String
        location: String Id
    }
    response = {url: String}
     */
    create: function(req, res){
        let newOffice = new Office({
            name: req.body.name,
            identifier: req.body.name.replaceAll(" ", "-"),
            tables: [{
                type: "general",
                occupants: []
            }],
            owner: res.locals.user._id,
            users: [{
                status: "active",
                userId: res.locals.user._id
            }],
            location: req.body.location
        });

        newOffice.save()
            .then((office)=>{
                res.json({url: "/dashboard"});
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
    POST: add a new office member
    req.body.email= String
     */
    addMember: function(req, res){
        let userProm = User.findOne({email: req.body.email.toLowerCase()});
        let officeProm = Office.findOne({owner: res.locals.user._id});

        Promise.all([userProm, officeProm])
            .then((response)=>{
                if(response[0]){
                    response[1].users.push({
                        status: "awaiting",
                        userId: response[0]._id
                    });

                    let link = `${req.protocol}://${req.get("host")}/office/invite/${response[1]._id}/${response[0]._id}`;

                    sendEmail(
                        response[0].email,
                        "You have been invited to join a CoSphere office!",
                        inviteExistingMember(link, res.locals.user.firstName, response[1].name)
                    );

                    res.json({
                        error: false,
                        message: `An invitation has been sent to ${req.body.email.toLowerCase()}`
                    });

                    response[1].save().catch((err)=>{console.error(err)});
                }else{
                    stripe.customers.create({email: req.body.email.toLowerCase()})
                        .then((customer)=>{
                            let newUser = new User({
                                email: req.body.email.toLowerCase(),
                                password: "undefined",
                                firstName: "temp",
                                lastName: "temp",
                                status: "awaiting",
                                stripe: {
                                    customerId: customer.id,
                                    subscriptionStatus: "active",
                                    type: "office"
                                },
                                defaultLocation: response[1]._id,
                                session: uuid()
                            });

                            return newUser.save();
                        })
                        .then((user)=>{
                            let link = `${req.protocol}://${req.get("host")}/office/invite/new/${response[1]._id/${user._id}}`;
                            
                            sendEmail(
                                user.email,
                                "You have been invited to join a CoSphere office!",
                                inviteNewMember(link, res.locals.user.firstName, response[1].name)
                            );

                            res.json({
                                error: false,
                                message: `An invitation has been sent to ${req.body.email.toLowerCase()}`
                            });
                        })
                        .catch((err)=>{
                            console.error(err);
                            res.json({
                                error: true,
                                message: "Unable to invite new member"
                            });
                        });
                }
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
    GET: accept office member invitation
    req.params = {
        officeId: String ID
        invitedId: String ID
    }
    redirect: /dashboard
     */
    acceptInvitation: function(req, res){
        let userProm = User.findOne({_id: req.params.invitedId});
        let officeProm = Office.findOne({_id: req.params.officeId});

        let activeUsers = 0;

        Promise.all([userProm, officeProm])
            .then((response)=>{
                if(!response[0])throw "noUser";
                if(!response[1]) throw "auth";

                let officeUser = {};
                for(let i = 0; i < response[1].users.length; i++){
                    if(response[1].users[i].userId.toString() === response[0]._id.toString()){
                        if(response[1].users[i].status === "active") throw "active";
                        response[1].users[i].status = "active";
                    }
                    if(response[1].users[i].status === "active") activeUsers++;
                }

                //Update user
                stripe.subscriptions.cancel(response[0].stripe.subscriptionId).catch((err)=>{console.error(err)});


                //Update office
                response[1].save().catch((err)=>{console.error(err)});
                return User.findOne({_id: response[1].owner});
            })
            .then((owner)=>{
                let items = {
                    price: process.env.OFFICE_MEMBER_PRICE,
                    quantity: activeUsers
                };
                
                stripe.subscriptions.update(owner.stripe.subscriptionId, {items: items})
                    .catch((err)=>{console.error(err)});

                res.redirect("/dashboard");
            })
            .catch((err)=>{
                switch(err){
                    case "noUser": return res.redirect("/user/office/register");
                    case "auth": return res.redirect("/user/login");
                    case "active": return res.redirect("/dashboard");
                    default:
                        console.error(err);
                        return res.redirect("/");
                }
            });
    }
}
