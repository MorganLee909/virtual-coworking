const axios = require("axios");
const queryString = require("querystring");

module.exports = {
    /*
    POST: subscribe to newsletter
    req.body = {
        firstName: String
        lastName: String
        email: String
    }
    response = {}
     */
    join: function(req, res){
        let email = req.body.email.toLowerCase();

        axios({
            method: "post",
            url: `https://api.mailgun.net/v3/lists/newsletter@mg.cosphere.work/members`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            auth: {
                username: "api",
                password: process.env.MAILGUN_KEY
            },
            data: queryString.stringify({
                address: email,
                name: `${req.body.firstName} ${req.body.lastName}`,
                upsert: true,
                subscribed: true
            })
        })
            .then((response)=>{
                res.json({});
            })
            .catch((err)=>{
                console.error(err);
                res.json({
                    error: true,
                    message: "Internal server error"
                });
            });

        axios({
            method: "post",
            url: `https://api.mailgun.net/v3/mg.cosphere.work/messages`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            auth: {
                username: "api",
                password: process.env.MAILGUN_KEY
            },
            data: queryString.stringify({
                from: "CoSphere <support@cosphere.work>",
                to: "ivan@cosphere.work",
                subject: "New newsletter subscriber",
                html: `<p>New user, ${req.body.firstName} ${req.body.lastName} (${email}) has subscribed to the newsletter`
            })
        }).catch((err)=>{console.error(err)});
    }
}
