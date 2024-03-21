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
    tables: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
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
            }
        }]
   }]
});

module.exports = mongoose.model("location", LocationSchema);
