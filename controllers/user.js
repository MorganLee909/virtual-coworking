const User = require("../models/user.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const queryString = require("querystring");
const confirmationEmail = require("../email/confirmationEmail.js");

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
        let email = req.body.email.toLowerCase();
        if(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email) === false){
            return res.json({
                error: true,
                message: "Invalid email address"
            });
        }

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
                let confirmationCode = Math.floor(Math.random() * 1000000).toString();
                confirmationCode = confirmationCode.padStart(6, "0");

                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(req.body.password, salt);

                let newUser = new User({
                    email: email,
                    password: hash,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    status: `email-${confirmationCode}`
                });

                axios({
                    method: "post",
                    url: "https://api.mailgun.net/v3/mg.leemorgan.dev/messages",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: "api",
                        password: process.env.MAILGUN_KEY
                    },
                    data: queryString.stringify({
                        from: "Lee Morgan <lee@leemorgan.dev>",
                        to: email,
                        subject: "Virtual Coworking email confirmation",
                        html: confirmationEmail(newUser.firstName, `${req.protocol}://${req.get("host")}/email/code/${email}/${confirmationCode}`)
                    })
                });

                return newUser.save();
            })
            .then((user)=>{
                return res.json({
                    error: false,
                    message: "Please check your inbox to confirm your email"
                });
            })
            .catch((err)=>{
                console.error(err);
                res.redirect("/dashboard");
            });
    }
}
