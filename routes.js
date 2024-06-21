const stripe = require("./controllers/stripe.js");
const office = require("./controllers/office.js");
const {auth}= require("./auth.js");

module.exports = (app)=>{
    const views = `${__dirname}/views`;

    //OFFICE
    //app.get("/office/location/:locationId", auth, office.getOffices);
    //app.get("/office/:officeId", auth, office.getOffice);
    //app.post("/office/:officeId/table", auth, office.createTable);
    app.get("/office/:officeId/members", auth, office.getMembers);
    app.post("/office", auth, office.create);
    app.post("/office/:officeId/member", auth, office.addMember);
    app.get("/office/invite/new/:officeId/:invitedId", (req, res)=>{res.sendFile(`${views}/officeRegister.html`)});
    app.get("/office/invite/:officeId/:invitedId", office.acceptInvitation);
    app.delete("/office/:office/member/:member", auth, office.removeMember);

    //STRIPE
    app.post("/stripe/checkout-session", auth, stripe.checkoutSession);
    app.get("/stripe/finished*", stripe.finished);
}
