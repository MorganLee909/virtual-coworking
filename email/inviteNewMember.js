module.exports = (link, inviter, office)=>{
    return `<h1>You have been invited to join an office on CoSphere!</h1>
<p>${inviter} has invited you to join their office: ${office}.</p>
<p>On CoSphere you can join others working from home or remotely to collaborate together. With this invitation you will have access to join our general rooms with all other members as well as the office specifically for ${office}.</p>
<p>Since you have been invited to join an office, your membership will be paid for by the owner of the office and will cost you nothing as long as you are a part of that office. To accept this invitation simply click on the link below to get started.</p>
<a href="${link}">${link}</a>`
}
