const controller = require("../../controllers/stripe.js");

const User = require("../../models/user.js");

const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);
const jwt = require("jsonwebtoken");

module.exports = (app)=>{
    app.post("/stripe/checkout-session", async (req, res)=>{
        try{
            const token = req.headers.authorization.split(" ")[1];
            const userData = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({_id: userData._id});
            const data = controller.createCheckoutSession(user, req.body.prices, req.protocol, req.get("host"));
            const session = await stripe.checkout.sessions.create(data);
            res.json({
                error: false,
                url: session.url
            });
        }catch(e){
            controller.handleError(e);
        }
    });

    app.get("/stripe/finished*", async (req, res)=>{
        try{
            const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
            let [customer, user] = await Promise.all([
                stripe.customers.retrieve(session.customer),
                User.findOne({"stripe.customerId": session.customer})
            ]);
            if(session.payment_status === "paid" && session.status === "complete"){
                user = controller.provisionUser(user, customer, req.query.type);
            }
            user.save();
            switch(user.type){
                case "basic": return res.redirect("/dashboard");
                case "office": return res.redirect("/office/setup");
            }
        }catch(e){
            controller.handleError(e);
        }
    });
}
