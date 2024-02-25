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

        if(user.status.includes("email")) return res.redirect("/");
        if(user.status === "payment") return res.redirect("/stripe/checkout");

        User.findOne({_id: userData._id})
            .then((user)=>{
                res.locals.user = user;
                next();
            })
            .catch((err)=>{
                console.error(err);
                return res.json({
                    error: true,
                    message: "Invalid user token"
                });
            });
    }
}
