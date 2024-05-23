module.exports = (link, inviter, office)=>{
    return `<h1>You have been invited to join an office!</h1>
<p>${inviter} has invited you to join their office: ${office}.</p>
<h2>What does this mean for you?</h2>
<p>You will continue to have access to all features that you previously had access to, including all public tables and locations. However, you will now be able to access the "${office}" office.<p>
<p>Upon accepting the invitation, your access fee will be paid by the owner of the office. If you are currently paying for a subscription, then the payments will be canceled and a prorated amount will be refunded to you.</p>
<p>Simply click the link below to accept the invitation. If you do not wish to accept, then you may ignore this email and your account will remain unchanged.</p>
<a href="${link}">${link}</a>`;
}
