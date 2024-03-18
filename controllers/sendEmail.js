const axios = require("axios");
const queryString = require("querystring");

module.exports = (to, subject, html)=>{
    return axios({
        method: "post",
        url: "https://api.mailgun.net/v3/mg.cosphere.work/messages",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        auth: {
            username: "api",
            password: process.env.MAILGUN_KEY,
        },
        data: queryString.stringify({
            from: "CoSphere <support@cosphere.work>",
            to: to,
            subject: subject,
            html: html
        })
    }).catch((err)=>{console.error(err)});
}
