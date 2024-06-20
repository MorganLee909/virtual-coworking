const User = require("../../models/user.js");
const Office = require("../../models/office.js");
const Location = require("../../models/location.js");
const user = require("../../controllers2/user.js");

const sendEmail = require("../../controllers/sendEmail.js");
const confirmationEmail = require("../../email/confirmationEmail.js");

const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);

module.exports = (app)=>{
    /*
    POST: create new user
    req.body = {
        email: String
        password: String
        confirmPassword: String
        firstName: String
        lastName: String
    }
    */
    app.post("/user", async (req, res)=>{
        try{
            const email = req.body.email.toLowerCase();
            const matchingUserProm = User.findOne({email: req.body.email});
            const officesProm = Office.find({users: {$elemMatch: {email: email}}});
            const stripCustomerProm = stripe.customers.create({email: email});
            const locationProm = Location.findOne({}, {_id: 1});

            let matchingUser, userOffices, stripeCustomer, location;
            [matchingUser, userOffices, stripeCustomer, location] = await Promise.all([
                matchingUserProm,
                officesProm,
                stripCustomerProm,
                locationProm
            ]);

            //Data Validation
            if(!user.isValidEmail(email)) throw "badEmail";
            if(!user.passwordsMatch(req.body.password, req.body.confirmPassword)) throw "passwordMatch";
            if(!user.passwordValidLength(req.body.password)) throw "shortPassword";
            if(matchingUser) throw "userExists";

            let newUser = {};
            if(userOffices.length > 0){
                newUser = user.createOfficeUser({
                    ...req.body,
                    email: email
                }, location, stripeCustomer);
                let offices = user.activateOfficeUser(email, newUser._id, userOffices);
                Promise.all(offices.map(o => o.save()));
            }else{
                let confirmationCode = user.confirmationCode();
                newUser = user.createUser({
                    ...req.body,
                    email: email
                }, location, stripeCustomer, confirmationCode);

                let html = confirmationEmail(
                    newUser.firstName,
                    `${req.protocol}://${req.get("host")}/email/code/${email}/${confirmationCode}`
                );
                sendEmail(email, "CoSphere email verification", html);
            }

            newUser = await newUser.save();
            const token = jwt.sign({
                _id: newUser._id,
                email: newUser.email,
                session: newUser.session
            }, process.env.JWT_SECRET);
            res.json({
                error: false,
                message: "Please check your inbox to verify your email",
                token: token
            });
        }catch(e){
            res.json(user.handleError(e));
        }
    });

    app.get("/user", auth, ()=>{
        res.locals.user.password = undefined;
        res.locals.user.stripe = undefined;

        res.json(res.locals.user);
    });
}
