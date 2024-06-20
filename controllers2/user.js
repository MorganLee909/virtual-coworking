const User = require("../models/user.js");

const uuid = require("crypto").randomUUID;
const stripe = require("stripe")(process.env.COSPHERE_STRIPE_KEY);
const bcrypt = require("bcryptjs");

//PRIVATE
const hashPass = (password)=>{
    let salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

//PUBLIC
/**
 * Decides if given string is a valid email address
 *
 * @param {string} email - Email address to verify
 * @return {boolean} true if valid, false otherwise
 */
const isValidEmail = (email)=>{
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

/**
 * Determines whether two passwords are a match
 *
 * @param {string} password - Password given
 * @param {string} confirmPassword - Confirmation of password
 * @return {boolean} True if passwords are equal
 */
const passwordsMatch = (password, confirmPassword)=>{
    return password === confirmPassword;
}

/**
 * Determines if password is sufficient length
 *
 * @param {string} password - Password given
 * @return {boolean} True if password length greater than 10
 */
const passwordValidLength = (password)=>{
    return password.length >= 10;
}

/**
 * Creates a code for email verification
 *
 * @return {string} - email confirmation code
 */
const confirmationCode = ()=>{
    let confirmationCode = Math.floor(Math.random() * 1000000).toString();
    confirmationCode = confirmationCode.padStart(6, "0");
    return confirmationCode;
}

/**
 * Creates a new standard user
 *
 * @param {object} userData - User data including email, password, first/last name
 * @param {string} stripeCustomer - Customer ID for new stripe user
 * @return {User} - New User object
 */
const createUser = (userData, locationId, stripeCustomer, confirmationCode)=>{
    let newUser = new User({
        email: userData.email,
        password: hashPass(userData.password),
        firstName: userData.firstName,
        lastName: userData.lastName,
        status: `email-${confirmationCode}`,
        stripe: {customerId: stripeCustomer.id},
        defaultLocation: locationId,
        session: uuid()
    });

    return newUser;
}

/**
 * Creates a new user that has been invited to an office
 *
 * @param {object} userData - Data for user. Email, password, first/last name.
 * @param {string} locationId - ID for the user's default location.
 * @param {string} stripeCustomer - Object for the newly created stripe customer.
 * @return {User} Newly created User object
 */
const createOfficeUser = (userData, locationId, stripeCustomer)=>{
    let user = new User({
        email: userData.email,
        password: hashPass(userData.password),
        firstName: userData.firstName,
        lastName: userData.lastName,
        status: "active",
        stripe: {customerId: stripeCustomer.id},
        defaultLocation: locationId,
        session: uuid()
    });

    return user;
}

/**
 * Update the user as active in all offices they are a member of
 *
 * @param {string} userEmail - email of user
 * @param {string} userId - Mongo ID for user
 * @param {[Office]} offices - Array of offices user is a member of
 * @return {[Office]} Array of offices, updated
 */
const activateOfficeUser = (userEmail, userId, offices)=>{
    let saves = [];
    for(let i = 0; i < offices.length; i++){
        let user = offices[i].users.find(u => u.email === userEmail);

        user.status = "active";
        user.userId = userId;
        user.email = undefined;
    }

    return offices;
}

const handleError = (error)=>{
    let response = {
        error: true,
        message: ""
    };

    switch(error){
        case "badEmail": response.message = "Invalid email address"; break;
        case "passwordMatch": response.message = "Passwords do not match"; break;
        case "shortPassword": response.message = "Password must contain at least 10 characers"; break;
        case "userExists": response.message = "User with this email already exists"; break;
        default:
            console.error(error);
            response.message = "Server error";
    }

    return response;
}

module.exports = {
    isValidEmail,
    passwordsMatch,
    passwordValidLength,
    confirmationCode,
    createUser,
    createOfficeUser,
    activateOfficeUser,
    handleError
};
