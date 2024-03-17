const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);

module.exports = async (user)=>{
    try{
        let subscription = await stripe.subscriptions.retrieve(user.stripe.subscriptionId);
        let stripeDate = new Date(subscription.current_period_end * 1000);
        let userDate= new Date(user.expiration);

        if(stripeDate > userDate){
            user.expiration = stripeDate;
            return true;
        }

        return false;
    }catch(e){
        console.error(err);
    }
}
