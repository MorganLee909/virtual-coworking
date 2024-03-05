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
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            avatar: {
                type: String,
                required: true,
                default: "/image/profileIcon.png"
            }
        }]
   }]
});

module.exports = mongoose.model("location", LocationSchema);
