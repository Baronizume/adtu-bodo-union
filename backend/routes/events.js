const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Event = require("../models/Event");

// ==========================================
// GET ALL EVENTS FROM MONGODB
// GET /api/events
// ==========================================
router.get("/", async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: 1, createdAt: -1 })
            .lean();

        return res.status(200).json(events);
    } catch (error) {
        console.error("Get events error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load events."
        });
    }
});

// ==========================================
// CREATE A NEW EVENT IN MONGODB
// POST /api/events
// ==========================================
router.post("/", async (req, res) => {
    try {
        const { title, description, date, location, image } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof description !== "string" || !description.trim() ||
            !date ||
            typeof location !== "string" || !location.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, description, date and location are required."
            });
        }

        const newEvent = await Event.create({
            title: title.trim(),
            description: description.trim(),
            date,
            location: location.trim(),
            image: typeof image === "string" ? image.trim() : ""
        });

        return res.status(201).json({
            success: true,
            message: "Event added successfully to MongoDB.",
            data: newEvent
        });
    } catch (error) {
        console.error("Create event error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create event."
        });
    }
});

// ==========================================
// DELETE A MONGODB EVENT
// DELETE /api/events/:id
// ==========================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid MongoDB event ID."
            });
        }

        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully."
        });
    } catch (error) {
        console.error("Delete event error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete event."
        });
    }
});

module.exports = router;
