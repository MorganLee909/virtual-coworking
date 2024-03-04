const user = require("./controllers/user.js");
const stripe = require("./controllers/stripe.js");
const location = require("./controllers/location.js")
const webhooks = require("./controllers/webhooks.js");
const auth = require("./auth.js").auth;

module.exports = (app)=>{
    const views = `${__dirname}/views`;

    app.get("/", (req, res)=>res.sendFile(`${views}/landing.html`));
    app.get("/user/signup", (req, res)=>{res.sendFile(`${views}/signup.html`)});
    app.get("/user/login", (req, res)=>{res.sendFile(`${views}/login.html`)});
    app.get("/dashboard", (req, res)=>{res.sendFile(`${views}/coworking/index.html`)});
    app.get("/email/confirmation", (req, res)=>{res.sendFile(`${views}/emailConfirmation.html`)}); // Remove this, go straight to checkout
    app.get("/email/unconfirmed", (req, res)=>{res.sendFile(`${views}/unconfirmedEmail.html`)});
    app.get("/stripe/checkout", (req, res)=>{res.sendFile(`${views}/stripeCheckout.html`)});
    app.get("/stripe/finished*", (req, res)=>{res.sendFile(`${views}/stripeFinished.html`)});
    app.get("/js/dashboard.js", (req, res)=>{res.sendFile(`${views}/build/js/dashboard.js`)});
    app.get("/css/dashboard.js", (req, res)=>{res.sendFile(`${views}/build/css/dashboard.css`)});

    //USERS
    app.post("/user", user.create);
    app.get("/email/code/:email/:code", user.confirmEmail);
    app.post("/user/login", user.login);

    //TABLES
    app.post("/location/table/join", auth, location.joinTable);
    app.get("/location/:location", auth, location.getTables);

    //WEBHOOKS
    app.post("/jitsi/webhook", webhooks.handle);

    //STRIPE
    app.get("/stripe/checkout-session", stripe.checkoutSession);
    app.get("/stripe/payment-status*", stripe.finished);

    //IMAGES
    app.get("/image/:image", (req, res)=>{res.sendFile(`${views}/image/${req.params.image}`)});
}
