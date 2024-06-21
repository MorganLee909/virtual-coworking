const user = require("./controllers/user.js");
const stripe = require("./controllers/stripe.js");
const newsletter = require("./controllers/newsletter.js");
const location = require("./controllers/location.js")
const office = require("./controllers/office.js");
const {auth}= require("./auth.js");

module.exports = (app)=>{
    const views = `${__dirname}/views`;

    //Landing app
    app.get("/landing", (req, res)=>{res.sendFile(`${views}/landing/index.html`)});
    app.get("/landing/landing.js", (req, res)=>{res.sendFile(`${views}/build/landing/js/index.js`)});
    app.get("/landing/landing.css", (req, res)=>{res.sendFile(`${views}/build/landing/css/index.css`)});

    app.get("/", (req, res)=>res.sendFile(`${views}/landing.html`));
    app.get("/user/signup", (req, res)=>{res.sendFile(`${views}/signup.html`)});
    app.get("/user/login", (req, res)=>{res.sendFile(`${views}/login.html`)});
    app.get("/dashboard", (req, res)=>{res.sendFile(`${views}/coworking/index.html`)});
    app.get("/email/unconfirmed", (req, res)=>{res.sendFile(`${views}/unconfirmedEmail.html`)});
    app.get("/stripe/checkout", (req, res)=>{res.sendFile(`${views}/stripeCheckout.html`)});
    app.get("/js/dashboard.js", (req, res)=>{res.sendFile(`${views}/build/coworking/js/dashboard.js`)});
    app.get("/css/dashboard.css", (req, res)=>{res.sendFile(`${views}/build/coworking/css/dashboard.css`)});
    app.get("/office/setup", (req, res)=>{res.sendFile(`${views}/officeSetup.html`)});

    //NEWSLETTER
    app.post("/newsletter/join", newsletter.join);

    //LOCATION
    app.post("/location/table/join", auth, location.joinTable);
    app.get("/location/:locationId", auth, location.getOne);
    app.get("/location", auth, location.getAll);

    //OFFICE
    app.get("/office/location/:locationId", auth, office.getOffices);
    app.get("/office/:officeId", auth, office.getOffice);
    app.post("/office/:officeId/table", auth, office.createTable);
    app.get("/office/:officeId/members", auth, office.getMembers);
    app.post("/office", auth, office.create);
    app.post("/office/:officeId/member", auth, office.addMember);
    app.get("/office/invite/new/:officeId/:invitedId", (req, res)=>{res.sendFile(`${views}/officeRegister.html`)});
    app.get("/office/invite/:officeId/:invitedId", office.acceptInvitation);
    app.delete("/office/:office/member/:member", auth, office.removeMember);

    //STRIPE
    app.post("/stripe/checkout-session", auth, stripe.checkoutSession);
    app.get("/stripe/finished*", stripe.finished);

    //IMAGES
    app.get("/image/:image", (req, res)=>{res.sendFile(`${views}/image/${req.params.image}`)});
    app.get("/image/profile/:image", (req, res)=>{res.sendFile(`${appRoot}/profilePhoto/${req.params.image}`)});

    app.get("*", (req, res)=>{res.sendFile(`${views}/404.html`)});
}
