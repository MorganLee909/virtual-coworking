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

    //OFFICE
    app.get("/office/invite/new/:officeId/:invitedId", (req, res)=>{res.sendFile(`${views}/officeRegister.html`)});
    app.get("/office/setup", (req, res)=>{res.sendFile(`${views}/officeSetup.html`)});

    //HOME PAGES
    app.get("/", (req, res)=>{res.sendFile(`${views}/landing.html`)});
    app.get("/user/signup", (req, res)=>{res.sendFile(`${views}/signup.html`)});
    app.get("/user/login", (req, res)=>{res.sendFile(`${views}/login.html`)});
    app.get("/email/unconfirmed", (req, res)=>{res.sendFile(`${views}/unconfirmedEmail.html`)});
    app.get("/stripe/checkout", (req, res)=>{res.sendFile(`${views}/stripeCheckout.html`)});

    //IMAGES
    app.get("/image/:image", (req, res)=>{res.sendFile(`${views}/image/${req.params.image}`)});
    app.get("/image/profile/:image", (req, res)=>{res.sendFile(`${appRoot}/profilePhoto/${req.params.image}`)});

    //404
    app.get("*", (req, res)=>{res.sendFile(`${views}/404.html`)});
}
