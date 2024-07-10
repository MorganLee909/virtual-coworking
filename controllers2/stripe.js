const createCheckoutSession = (user, prices)=>{
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
        success_url: `${req.protocol}://${req.get("host")}/stripe/finished?session_id={CHECKOUT_SESSION_ID}&type=${subType}`
    };
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
    handleError
};
