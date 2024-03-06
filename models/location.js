const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    identifier: {
        type: String,
        required: true
    },
    currentUsers: {
        type: Number,
        required: true,
        default: 0
    },
    tables: [{
        name: String,
        tableNumber: String,
        occupants: [{
            seatNumber: {
                type: Number,
                required: true
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: false
            },
            name: {
                type: String,
                required: false
            },
            avatar: {
                type: String,
                required: false,
                default: "/image/profileIcon.png"
            }
        }]
   }]
});

module.exports = mongoose.model("location", LocationSchema);
