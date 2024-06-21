module.exports = (app)=>{
    const views = `${process.cwd()}/views`;

    //MAIN APPLICATION FILES
    app.get("/dashboard", (req, res)=>{res.sendFile(`${views}/coworking/index.html`)});
    app.get("/js/dashboard.js", (req, res)=>{res.sendFile(`${views}/build/coworking/js/dashboard.js`)});
    app.get("/css/dashboard.css", (req, res)=>{res.sendFile(`${views}/build/coworking/css/dashboard.css`)});

    //LANDING APPLICATION FILES
    app.get("/landing", (req, res)=>{res.sendfile(`${views}/landing/index.html`)});
    app.get("/landing/landing.js", (req, res)=>{res.sendFile(`${views}/build/landing/js/index.js`)});
    app.get("/landing/landing.css", (req, res)=>{res.sendFile(`${views}/build/landing/css/index.css`)});

    //USER
    app.get("/user/password/email", (req, res)=>{res.sendFile(`${views}/passwordEmail.html`)});
    app.get("/user/password/reset*", (req, res)=>{res.sendFile(`${views}/passwordReset.html`)});

    //HOME PAGES
    app.get("/", (req, res)=>{res.sendFile(`${views}/landing.html`)});
    app.get("/user/signup", (req, res)=>{res.sendFile(`${views}/signup.html`)});
    app.get("/user/login", (req, res)=>{res.sendFile(`${views}/login.html`)});
    app.get("/email/unconfirmed", (req, res)=>{res.sendFile(`${views}/unconfirmedEmail.html`)});
    app.get("/stripe/checkout", (req, res)=>{res.sendFile(`${views}/stripeCheckout.html`)});
    app.get("/office/setup", (req, res)=>{res.sendFile(`${views}/officeSetup.html`)});
}