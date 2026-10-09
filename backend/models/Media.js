const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },

        type: {
            type: String,
            enum: ["photo", "video"],
            required: true
        },

        originalName: {
            type: String,
            required: true
        },

        filename: {
            type: String,
            required: true
        },

        path: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Media", mediaSchema);