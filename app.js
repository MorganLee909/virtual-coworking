const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const https = require("https");
const fs = require("fs");

const app = express();
let mongoString = "mongodb://127.0.0.1:27017/coworking";

if(process.env.NODE_ENV === "production"){
    httpsServer = https.createServer({
        key: fs.readFileSync("", "utf8"),
        cert: fs.readFileSync("", "utf8")
    });

    app.user((req, res, nex)=>{
        if(req.secure === true){
            next();
        }else{
            res.redirect(`https://${req.headers.host}${req.url}`);
        }
    });

    mongoString = `mongodb://website:${process.env.MONGODB_PASS}@127.0.0.1:27017/coworking?authSource=admin`;
}

mongoose.connect(mongoString);

app.use(compression());
app.use(express.json());

require("./routes.js")(app);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT);
}
app.listen(process.env.PORT);
