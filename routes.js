const user = require("./controllers/user.js");

module.exports = (app)=>{
    const views = `${__dirname}/views`;

    app.get("/", (req, res)=>res.sendFile(`${views}/landing.html`));
    app.get("/user/signup", (req, res)=>{res.sendFile(`${views}/signup.html`)});
    app.get("/dashboard", (req, res)=>{res.sendFile(`${views}/dashboard.html`)});
    app.get("/email/confirmation", (req, res)=>{res.sendFile(`${views}/emailConfirmation.html`)});

    //USERS
    app.post("/user", user.create);
}
