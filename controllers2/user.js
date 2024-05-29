const User = require("../models/user.js");

const uuid = require("crypto").randomUUID;
const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);
const bcrypt = require("bcryptjs");

const activateOfficeUser = (userEmail, userId, offices)=>{
    let saves = [];
    for(let i = 0; i < offices.length; i++){
        let user = offices[i].users.find(u => u.email === userEmail);

        user.status = "active";
        user.userId = userId;
        user.email = undefined;

        saves.push(offices[i].save());
    }

    Promise.all(saves);
}

const createOfficeUser = async (userData, locationId)=>{
    const stripeCustomer = await stripe.customers.create({email: userData.email});

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(userData.password, salt);

    let newUser = new User({
        email: userData.email,
        password: hash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        status: "active",
        stripe: {customerId: stripeCustomer.id},
        defaultLocation: locationId,
        session: uuid()
    });

    return await newUser.save();
}

module.exports = {
    createOfficeUser,
    activateOfficeUser
};
