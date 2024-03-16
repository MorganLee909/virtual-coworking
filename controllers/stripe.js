const User = require("../models/user.js");

const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);
const jwt = require("jsonwebtoken");

module.exports = {
    /*
     POST: Create stripe checkout session for a user payment
     req.body.price = String
     redirect = session.url
     */
    checkoutSession: function(req, res){
        stripe.checkout.sessions.create({
            customer: res.locals.user.stripe.customerId,
            mode: "subscription",
            line_items: [{
                price: req.body.price,
                quantity: 1
            }],
            ui_mode: "hosted",
            success_url: `${req.protocol}://${req.get("host")}/stripe/finished?session_id={CHECKOUT_SESSION_ID}`
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
        let custommer = {};

        stripe.checkout.sessions.retrieve(req.query.session_id)
            .then((response)=>{
                session = response;

                let customer = stripe.customers.retrieve(session.customer);
                let user = User.findOne({"stripe.customerId": response.customer});
                return Promise.all([customer, user]);
            })
            .then((response)=>{
                console.log(response);
                customer = response[0];
                response[1].stripe.customerId = customer.id;
                response[1].stripe.productId = "price_1On7CgI8NTnuAPIlq2ATM9Xl";
                response[1].stripe.subscriptionId = session.subscription;
                if(session.payment_status === "paid" && session.status === "complete"){
                    let expiration = new Date();
                    expiration.setMonth(expiration.getMonth() + 1);

                    response[1].expiration = expiration;
                    response[1].status = "active";
                }

                return response[1].save();
            })
            .then((user)=>{
                res.redirect("/dashboard");
            })
            .catch((err)=>{
                console.error(err);
            });
    }
}
