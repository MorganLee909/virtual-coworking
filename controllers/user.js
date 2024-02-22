const User = require("../models/user.js");

const bcrypt = require("bcryptjs");

module.exports = {
    /*
     * POST: create new user
     * req.body = {
     *     email: String
     *     password: String
     *     confirmPassword: String
     *     firstName: String
     *     lastName: String
     * }
     * redirect = /dashboard
    */
    create: (req, res)=>{
        if(!req.body.email) return res.redirect("/user/signup");
        let email = req.body.email.toLowerCase();

        if(req.body.password.length < 10) return res.redirect("/user/signup");
        if(req.body.password !== req.body.confirmPassword) return res.redirect("/user/signup");

        User.findOne({email: email})
            .then((user)=>{
                if(user) return res.redirect("/user/signup");

                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(req.body.password, salt);

                let newUser = new User({
                    email: email,
                    password: hash,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName
                });

                return newUser.save();

            })
            .then((user)=>{
                res.redirect("/dashboard");
            })
            .catch((err)=>{
                console.error(err);
                res.redirect("/dashboard");
            });
    }
}
