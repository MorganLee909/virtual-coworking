const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);

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
    }
}
