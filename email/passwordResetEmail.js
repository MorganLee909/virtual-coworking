module.exports = (email, code)=>{
    let link = `https://cosphere.work/user/password/reset?email=${email}&code=${code}`;

    return `
<p>A password reset has been requested for this email address. Please click on the link below to reset your password. If you did not initiate this request, then you may safely ignore this email.</p>

<a href=${link}>${link}</a>`;
}
