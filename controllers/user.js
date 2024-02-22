const User = require("../models/user.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        if(!req.body.email){
            return res.json({
                error: true,
                message: "Invalid email address"
            });
        }
        let email = req.body.email.toLowerCase();

        if(req.body.password.length < 10){
            return res.json({
                error: true,
                message: "Password must contain at least 10 characters"
            });
        }
        if(req.body.password !== req.body.confirmPassword){
            return res.json({
                error: true,
                message: "Passwords do not match"
            });
        }

        User.findOne({email: email})
            .then((user)=>{
                if(user){
                    return res.json({
                        error: true,
                        message: "User with this email already exists"
                    });
                }

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
                let token = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }, process.env.JWT_SECRET);

                res.json(token);
            })
            .catch((err)=>{
                console.error(err);
                res.redirect("/dashboard");
            });
    }
}
