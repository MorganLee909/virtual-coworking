const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);

const createCheckoutSession = (user, prices, protocol, host)=>{
    let trial = {trial_period_days: 7};
    let subType = "basic";
    if(prices.length > 1){
        trial = {};
        subType = "office";
    };

    return {
        customer: user.stripe.customerId,
        mode: "subscription",
        line_items: prices,
        subscription_data: trial,
        ui_mode: "hosted",
        success_url: `${protocol}://${host}/stripe/finished?session_id={CHECKOUT_SESSION_ID}&type=${subType}`
    };
}

const provisionUser = (user, customer, type)=>{
    if(type === "basic"){
        let expiration = new Date();
        expiration.setDate(expiration.getDate() + 7);

        user.expiration = expiration;
        user.status = "active";
        user.type = "basic";
    }else if(type === "office"){
        user.status = "active";
        user.type = "office";
    }

    return user;
}

const checkStripeAccount = async (user)=>{
    const subscription = await stripe.subscriptions.retrieve(user.stripe.subscriptionId);
    const stripeData = new Date(subscription.current_period_end * 1000);
    const userData = new Date(user.expiration);

    if(stripeDate > userDate){
        user.expiration = stripeDate;
        return true;
    }

    return false;
}

const handleError = (error)=>{
    const response = {
        error: true,
        message: ""
    };

    switch(error){
        default:
            console.error(error);
            response.message = "Server error";
    }

    return response;
}

module.exports = {
    createCheckoutSession,
    provisionUser,
    checkStripeAccount,
    handleError
};
