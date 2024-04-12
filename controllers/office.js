const Office = require("../models/office.js");
const User = require("../models/user.js");

const sendEmail = require("./sendEmail.js");
const inviteExistingMember = require("../email/inviteExistingMember.js");

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

                return User.find({_id: office.users}, {
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
            users: [res.locals.user._id],
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
        let userProm = User.find({email: req.body.email.toLowerCase()});
        let officeProm = Office.find({owner: res.locals.user._id});

        Promise.all([userProm, officeProm]);
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
                        inviteExistingMember(link,res.locals.user.name, response[0].name)
                    );

                    res.json({
                        error: false,
                        message: `An invitation has been sent to ${req.body.email.toLowerCase()}`
                    });
                }else{
                    console.log("non-user inviation");
                }
            })
            .catch((err)=>{
                console.error(err);
                res.json({
                    error: true,
                    message: "Server error";
                });
            });
    }
}
