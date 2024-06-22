const User = require("../models/user.js");
const Office = require("../models/office.js");

const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);

module.exports = {
    /*
     POST: Create stripe checkout session for a user payment
     req.body.prices = [{
        price: String ID
        quantity: Number
     }]
     redirect = session.url
     */
    checkoutSession: function(req, res){
        let trial = {trial_period_days: 7};
        let subType = "basic";
        if(req.body.prices.length > 1){
            trial = {};
            subType="office";
        }

        stripe.checkout.sessions.create({
            customer: res.locals.user.stripe.customerId,
            mode: "subscription",
            line_items: req.body.prices,
            subscription_data: trial,
            ui_mode: "hosted",
            success_url: `${req.protocol}://${req.get("host")}/stripe/finished?session_id={CHECKOUT_SESSION_ID}&type=${subType}`
        })
            .then((session)=>{
                res.json({
                    error: false,
                    url: session.url
                });
            })
            .catch((err)=>{
                console.error(err);
                res.json({
                    error: true,
                    message: "Stripe error"
                });
            });
    },

    finished: function(req, res){
        let session = {};

        let provisionBasic = (user, customer)=>{
            let expiration = new Date();
            expiration.setDate(expiration.getDate() + 7);

            user.expiration = expiration;
            user.status = "active";
            user.type = "basic";
            return user;
        }

        let provisionOffice = (user, customer)=>{
            user.status = "active";
            user.type = "office";
            return user;
        }

        stripe.checkout.sessions.retrieve(req.query.session_id)
            .then((response)=>{
                session = response;

                let customer = stripe.customers.retrieve(session.customer);
                let user = User.findOne({"stripe.customerId": response.customer});
                return Promise.all([customer, user]);
            })
            .then((response)=>{
                let user = response[1];
                user.stripe.customerId = response[0]._id;
                user.stripe.productId = "";
                user.stripe.subscriptionId = session.subscription;

                if(session.payment_status === "paid" && session.status === "complete"){
                    if(req.query.type === "basic"){
                        user = provisionBasic(user, response[0]);
                    }else if(req.query.type === "office"){
                        user = provisionOffice(user, response[0]);
                    }
                }

                return user.save();
            })
            .then((user)=>{
                if(user.type === "basic"){
                    res.redirect("/dashboard");
                }else if(user.type === "office"){
                    res.redirect("/office/setup");
                }
            })
            .catch((err)=>{
                console.error(err);
            });
    }
}
