
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        // Existing cover image
        image: {
            type: String,
            default: ""
        },

        // Gallery photos
        photos: {
            type: [String],
            default: []
        },

        // Gallery videos
        videos: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Event", eventSchema);
