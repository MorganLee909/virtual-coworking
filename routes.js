const user = require("./controllers/user.js");
const stripe = require("./controllers/stripe.js");
const newsletter = require("./controllers/newsletter.js");
const location = require("./controllers/location.js")
const {auth}= require("./auth.js");

module.exports = (app)=>{
    const views = `${__dirname}/views`;

    app.get("/", (req, res)=>res.sendFile(`${views}/landing.html`));
    app.get("/user/signup", (req, res)=>{res.sendFile(`${views}/signup.html`)});
    app.get("/user/login", (req, res)=>{res.sendFile(`${views}/login.html`)});
    app.get("/dashboard", (req, res)=>{res.sendFile(`${views}/coworking/index.html`)});
    app.get("/email/unconfirmed", (req, res)=>{res.sendFile(`${views}/unconfirmedEmail.html`)});
    app.get("/stripe/checkout", (req, res)=>{res.sendFile(`${views}/stripeCheckout.html`)});
    app.get("/js/dashboard.js", (req, res)=>{res.sendFile(`${views}/build/js/dashboard.js`)});
    app.get("/css/dashboard.css", (req, res)=>{res.sendFile(`${views}/build/css/dashboard.css`)});

    //USERS
    app.post("/user", user.create);
    app.get("/user", auth, user.getUser);
    app.get("/email/code/:email/:code", user.confirmEmail);
    app.get("/email/resend", user.resendEmail);
    app.post("/user/login", user.login);
    app.get("/user/password/email", (req, res)=>{res.sendFile(`${views}/passwordEmail.html`)});
    app.post("/user/password/email", user.passwordEmail);
    app.get("/user/password/reset*", (req, res)=>{res.sendFile(`${views}/passwordReset.html`)});
    app.post("/user/password/reset", user.passwordReset);
    app.post("/user/profile", auth, user.updateProfile);
    app.post("/user/profile/image", auth, user.updateProfilePhoto);

    //NEWSLETTER
    app.post("/newsletter/join", newsletter.join);

    //LOCATION
    app.post("/location/table/join", auth, location.joinTable);

    //STRIPE
    app.post("/stripe/checkout-session", auth, stripe.checkoutSession);
    app.get("/stripe/finished*", stripe.finished);

    //IMAGES
    app.get("/image/:image", (req, res)=>{res.sendFile(`${views}/image/${req.params.image}`)});
    app.get("/image/profile/:image", (req, res)=>{res.sendFile(`${appRoot}/profilePhoto/${req.params.image}`)});
}
