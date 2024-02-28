const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const esbuild = require("esbuild");
const https = require("https");
const fs = require("fs");

const app = express();
let mongoString = "mongodb://127.0.0.1:27017/coworking";

//global.privateKey = fs.readFileSync("./cosphere.key.pub", "utf8");
global.privateKey = fs.readFileSync("./private.pem", "utf8");
//privateKey = privateKey.replaceAll("\n", "");
//privateKey = privateKey.replace("-----END RSA PRIVATE KEY-----", "");
//privateKey = privateKey.replace("-----BEGIN RSA PRIVATE KEY-----", "");

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
        key: fs.readFileSync("/etc/letsencrypt/live/cosphere.work/privkey.pem", "utf8"),
        cert: fs.readFileSync("/etc/letsencrypt/live/cosphere.work/fullchain.pem", "utf8")
    });

    app.use((req, res, next)=>{
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
    console.log(`Serving on port ${process.env.HTTPS_PORT}`);
    httpsServer.listen(process.env.HTTPS_PORT);
}
app.listen(process.env.PORT);
