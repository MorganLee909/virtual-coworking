const express = require("express");
const app = express();
const server = require("http").createServer(app);
const Websocket = require("ws");
const mongoose = require("mongoose");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const esbuild = require("esbuild");
const https = require("https");
const fs = require("fs");
global.wss = new Websocket.Server({server: server});

const {wsAuth} = require("./auth.js");
const {leaveTable} = require("./controllers/manageTables.js");
const {getLocation} = require("./controllers/location.js");

let mongoString = "mongodb://127.0.0.1:27017/coworking";

global.privateKey = fs.readFileSync("./private.pem", "utf8");
global.appRoot = __dirname;

let esbuildOptions = {
    entryPoints: [
        `${__dirname}/views/coworking/js/dashboard.js`,
        `${__dirname}/views/coworking/css/dashboard.css`
    ],
    bundle: true,
    minify: false,
    keepNames: true,
    outdir: `${__dirname}/views/build/`,
    define: {
        "process.env.SITE": JSON.stringify(process.env.SITE),
        "process.env.WS": JSON.stringify(process.env.NODE_ENV === "production" ? "wss" : "ws")
    }
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

    wss = new Websocket.Server({server: httpsServer});
}

mongoose.connect(mongoString);
esbuild.buildSync(esbuildOptions);

app.use(compression());
app.use(express.json());
app.use(fileUpload({
    limits: {fileSize: 15 * 1024 * 1024}
}));

//require("./controllers/websockets.js").incoming(wss);
require("./routes.js")(app);

if(process.env.NODE_ENV === "production"){
    httpsServer.listen(process.env.HTTPS_PORT);
}
server.listen(process.env.PORT);

wss.on("connection", (ws)=>{
    ws.on("message", (message)=>{
        let data = JSON.parse(message);
        wsAuth(data.token)
            .then((user)=>{
                if(!user) throw "auth";
                switch(data.action){
                    case "getLocation": getLocation(data.location, ws, user); break;
                    case "participantLeft": leaveTable(data.room, user._id.toString()); break;
                }
            })
            .catch((err)=>{
                console.error(err);
            });
    });

    ws.on("close", ()=>{
        leaveTable(ws.location, ws.user);
        console.log(`${ws.user} closed at ${new Date()}`);
    });

    ws.on("pong", ()=>{
        ws.isAlive = true;
    });
});

const ping = setInterval(()=>{
    wss.clients.forEach((client)=>{
        if(client.isAlive === false){
            client.terminate();
            console.log(`${client.user} closed at ${new Date()}`);
            leaveTable(client.location, client.user);
        }

        client.isAlive = false;
        client.ping();
    })
}, 30000);
