module.exports = (app)=>{
    app.get("/user/password/email", (req, res)=>{res.sendFile(`${views}/passwordEmail.html`)});
    app.get("/user/password/reset*", (req, res)=>{res.sendFile(`${views}/passwordReset.html`)});
}
