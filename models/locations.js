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

    }]
});
