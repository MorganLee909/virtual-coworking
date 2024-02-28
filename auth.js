const User = require("./models/user.js");

const jwt = require("jsonwebtoken");

module.exports = {
    auth: function(req, res, next){
        let userData = {};
        try{
            let token = req.headers.authorization.split(" ")[1];
            userData = jwt.verify(token, process.env.JWT_SECRET);
        }catch(e){
            console.error(e);
            return res.redirect("/user/login");
        }

        User.findOne({_id: userData._id})
            .then((user)=>{
                if(user.status.includes("email")) throw "email";
                if(user.status === "payment") throw "payment";

                res.locals.user = user;
                next();
            })
            .catch((err)=>{
                switch(err){
                    case "email": return res.redirect("/");
                    case "payment": return res.redirect("/stripe/checkout");
                    default:
                        console.error(err);
                        return res.json({
                            error: true,
                            message: "Invalid user token"
                        });
                }
            });
    }
}
