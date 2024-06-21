const axios = require("axios");
const queryString = require("querystring");

const sendEmail = require("../controllers/sendEmail.js");

const joinNewsletter = async (email, firstName, lastName)=>{
    email = email.toLowerCase();

    await axios({
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
            name: `${firstName} ${lastName}`,
            upsert: true,
            subscribed: true
        })
    });

    const html = `<p>New user, ${firstName} ${lastName} (${email}) has subscribed to the newsletter</p>`;
    sendEmail("ivan@cosphere.work", "New newsletter subscriber", html);
}

const handleError = (error)=>{
    console.error(err);
    return {
        error: true,
        message: "Server error"
    };
}

module.exports = {
    joinNewsletter,
    handleError
};
