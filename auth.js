const User = require("./models/user.js");

const checkStripeAccount = require("./controllers/checkStripeAccount.js");

const jwt = require("jsonwebtoken");

module.exports = {
    auth: function(req, res, next){
        let userData = {};
        try{
            let token = req.headers.authorization.split(" ")[1];
            userData = jwt.verify(token, process.env.JWT_SECRET);
        }catch(e){
            return res.json({
                error: true,
                message: "Authorization"
            });
        }

        User.findOne({_id: userData._id})
            .then((user)=>{
                res.locals.user = user;
                if(user.status.includes("email")) throw "token";
                if(userData.session !== user.session) throw "token";
                if(user.status === "payment" && !req.body.payment) throw "payment";
                if(user.expiration <= new Date()) return checkStripeAccount(user);

                next();
                throw "done";
            })
            .then((response)=>{
                if(response){
                    next();
                }else{
                    throw "payment";
                }
            })
            .catch((err)=>{
                switch(err){
                    case "token": return res.json({
                        error: true,
                        message: "bad token"
                    });
                    case "payment": return res.json({
                        error: true,
                        message: "payment"
                    });
                    case "done": break;
                    default:
                        console.error(err);
                        return res.json({
                            error: true,
                            message: "Invalid user token"
                        });
                }
            });
    },

    wsAuth: async function(token){
        let userData = {};
        try{
            userData = jwt.verify(token, process.env.JWT_SECRET);
        }catch(e){
            console.error(e);
        }

        let user = await User.findOne({_id: userData._id});
        if(user.status !== "active") return false;
        return user;
    }
}
