module.exports = (firstName, office)=>{
    return `
<p>Hello ${firstName}. This email has been sent to notify you that you have been removed from ${office} office. If you would like to continue using CoSphere then you may purchase a subscription. Just log in again and you will be redirected to payment.

Thank you for using CoSphere and we hope to see you again soon!
    `;
}
