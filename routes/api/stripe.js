const controller = require("../../controllers2/stripe.js");

const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);

module.exports = (app)=>{
    app.post("/stripe/checkout-session", auth, async (req, res)=>{
        try{
            const data = controller.createCheckoutSession();
            const session = await stripe.checkout.sessions.create(data);
            res.json({
                error: false,
                url: session.url
            });
        }catch(e){
            controller.handleError(e);
        }
    });
}
