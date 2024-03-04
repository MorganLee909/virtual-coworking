const express = require("express");
const app = express();
const server = require("http").createServer(app);
const Websocket = require("ws");
const mongoose = require("mongoose");
const compression = require("compression");
const esbuild = require("esbuild");
const https = require("https");
const fs = require("fs");
const wss = new Websocket.Server({server: server});

let mongoString = "mongodb://127.0.0.1:27017/coworking";

global.privateKey = fs.readFileSync("./private.pem", "utf8");

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
    }, app);

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

require("./controllers/websockets.js")(wss);
require("./routes.js")(app);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT);
}
server.listen(process.env.PORT);
