const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    expiration: {
        type: Date,
        required: false
    },
    createdDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    stripe: {
        customerId: String,
        productId: String,
        subscriptionId: String,
        subscriptionStatus: String
    },
    resetCode: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        default: "/image/profileIcon.png",
        required: true
    }
});

module.exports = mongoose.model("user", UserSchema);
