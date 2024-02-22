module.exports = (app)=>{
    const views = `${__dirname}/views`;

    app.get("/", (req, res)=>res.sendFile(`${views}/landing.html`));
    app.get("/signup", (req, res)=>{res.sendFile(`${views}/signup.html`)});

    //USERS
    app.post("/dd")
}
