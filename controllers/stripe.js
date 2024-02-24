const User = require("../models/user.js");

const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);
const jwt = require("jsonwebtoken");

module.exports = {
    checkoutSession: function(req, res){
        stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{
                price: "price_1On7CgI8NTnuAPIlq2ATM9Xl",
                quantity: 1
            }],
            ui_mode: "embedded",
            return_url: `${req.protocol}://${req.get("host")}/stripe/finished?session_id={CHECKOUT_SESSION_ID}`
        })
            .then((response)=>{
                return res.json(response.client_secret);
            })
            .catch((err)=>{
                console.error(err);
                res.json({
                    error: true,
                    message: "Internal server error"
                });
            });
    },

    finished: function(req, res){
        let session = {};
        let custommer = {};

        stripe.checkout.sessions.retrieve(req.query.session_id)
            .then((response)=>{
                session = response;
                let token = req.headers.authorization.split(" ")[1];
                let userData = jwt.verify(token, process.env.JWT_SECRET);

                let customer = stripe.customers.retrieve(session.customer);
                let user = User.findOne({_id: userData._id})
                return Promise.all([customer, user]);
            })
            .then((response)=>{
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
                res.json({
                    status: session.status,
                    paymentStatus: session.payment_status,
                    customerEmail: customer.email
                });
            })
            .catch((err)=>{
                console.error(err);
            });
    }
}
