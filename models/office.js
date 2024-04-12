const mongoose = require("mongoose");

const OfficeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    identifier: {
        type: String,
        required: true
    },
    tables:[{
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
                required: false
            }
        }]
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    users: [{
        status: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }],
    location: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model("office", OfficeSchema);
