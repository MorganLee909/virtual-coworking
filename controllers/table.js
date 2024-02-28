const jwt = require("jsonwebtoken");
const fs = require("fs");
const crypto = require("crypto");

module.exports = {
    /*
     * POST: create JWT for user to join a table
     * req.body = {
     *      room: String
     * }
     * response: JWT
     */
    joinTable: function(req, res){
        let nbf = new Date();
        nbf.setDate(nbf.getDate() - 10);
        nbf = nbf.getTime();
        nbf = Math.floor(nbf / 1000);

        let exp = new Date();
        exp.setDate(exp.getDate() + 1);
        exp = exp.getTime();

        let options = {
            algorithm: "RS256",
            header: {
                kid: process.env.JAAS_API_KEY,
                alg: "RS256"
            }
        }

        let token = jwt.sign({
            aud: "jitsi",
            context: {
                user: {
                    id: res.locals.user._id,
                    name: res.locals.user.firstName,
                    email: res.locals.user.email,
                    moderator: false
                },
                features: {
                    livestreaming: false,
                    recording: false,
                    transcription: false,
                    "sip-inbound-call": false,
                    "sip-outbound-call": false,
                    "inbound-call": false,
                    "outbound-call": false
                }
            },
            iss: "chat",
            nbf: nbf,
            room: "*",
            exp: exp,
            sub: process.env.JAAS_APP_ID
        }, privateKey, options);

        return res.json(token);
    }
}
