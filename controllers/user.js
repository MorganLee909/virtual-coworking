const User = require("../models/user.js");

const passwordResetEmail = require("../email/passwordResetEmail.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const queryString = require("querystring");
const confirmationEmail = require("../email/confirmationEmail.js");
const uuid = require("crypto").randomUUID;

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
    create: function(req, res){
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
                    url: "https://api.mailgun.net/v3/mg.cosphere.work/messages",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: "api",
                        password: process.env.MAILGUN_KEY
                    },
                    data: queryString.stringify({
                        from: "CoSphere <support@cosphere.work>",
                        to: email,
                        subject: "Virtual Coworking email confirmation",
                        html: confirmationEmail(newUser.firstName, `${req.protocol}://${req.get("host")}/email/code/${email}/${confirmationCode}`)
                    })
                });

                return newUser.save();
            })
            .then((user)=>{
                let token = jwt.sign({
                    _id: user._id,
                    email: user.email
                }, process.env.JWT_SECRET);

                return res.json({
                    error: false,
                    message: "Please check your inbox to confirm your email",
                    token: token
                });
            })
            .catch((err)=>{
                console.error(err);
                res.redirect("/dashboard");
            });
    },

    confirmEmail: function(req, res){
        User.findOne({email: req.params.email.toLowerCase()})
            .then((user)=>{
                if(!user) throw "code";
                if(user.status === "payment") throw "payment";
                if(user.status === "active") throw "active";
                let code = user.status.split("-");
                if(req.params.code !== code[1]) throw "code";

                user.status = "payment";

                return user.save();
            })
            .then((user)=>{
                res.redirect("/stripe/checkout");
            })
            .catch((err)=>{
                switch(err){
                    case "code": return res.redirect("/email/unconfirmed");
                    case "payment": return res.redirect("/stripe/checkout");
                    case "active": return res.redirect("/dashboard");
                    default:
                        console.error(err);
                        return res.redirect("/email/unconfirmed");
                }
            });
    },

    /*
     * POST: Login the user
     * req.body = {
     *      email: String
     *      password: String
     *      jwt: String (if already logged in)
     * }
     * response: JWT
     */
    login: function(req, res){
        let email = req.body.email.toLowerCase();
        User.findOne({email: email})
            .then((user)=>{
                if(!user) throw "user";
                
                if(bcrypt.compareSync(req.body.password, user.password)){
                    let token = jwt.sign({
                        _id: user._id,
                        email: user.email
                    }, process.env.JWT_SECRET);
                    return res.json(token);
                }else{
                    console.error("pass bad");
                    throw "pass";
                }
            })
            .catch((err)=>{
                switch(err){
                    case "user": return res.json({
                        error: true,
                        message: "User with this email address does not exist"
                    });
                    case "pass": return res.json({
                        error: true,
                        message: "Email and password do not match"
                    });
                    default:
                        console.error(err);
                        return res.json({
                            error: true,
                            message: "Internal server error"
                        });
                }
            })
    },

    /*
     POST: send reset password email
     req.body.email = String
     response = String
     */
    passwordEmail: function(req, res){
        let email = req.body.email.toLowerCase();

        User.findOne({email: email})
            .then((user)=>{
                if(!user) throw "email";
                user.resetCode = uuid();
                return user.save();
            })
            .then((user)=>{
                return axios({
                    method: "post",
                    url: "https://api.mailgun.net/v3/mg.cosphere.work/messages",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    auth: {
                        username: "api",
                        password: process.env.MAILGUN_KEY
                    },
                    data: queryString.stringify({
                        from: "CoSphere <support@cosphere.work>",
                        to: email,
                        subject: "CoSphere password reset",
                        html: passwordResetEmail(email, user.resetCode)
                    })
                });
            })
            .then((response)=>{
                res.json("Password reset email has been sent if account exists");
            })
            .catch((err)=>{
                switch(err){
                    case "email": break;
                    default:
                        console.error(err);
                        res.json({
                            error: true,
                            message: "Internal server error"
                        });
                }
            })
    }
}
