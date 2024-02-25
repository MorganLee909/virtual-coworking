const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const esbuild = require("esbuild");
const https = require("https");
const fs = require("fs");

const app = express();
let mongoString = "mongodb://127.0.0.1:27017/coworking";

let esbuildOptions = {
    entryPoints: [
        `${__dirname}/views/coworking/js/dashboard.js`,
        `${__dirname}/views/coworking/css/dashboard.css`
    ],
    bundle: true,
    minify: false,
    keepNames: true,
    outdir: `${__dirname}/views/build/`
};

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

    esbuildOptions.minify = true;
    esbuildOptions.keepNames = false;
}

mongoose.connect(mongoString);
esbuild.buildSync(esbuildOptions);

app.use(compression());
app.use(express.json());

require("./routes.js")(app);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT);
}
app.listen(process.env.PORT);
