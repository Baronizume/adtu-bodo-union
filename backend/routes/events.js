const express = require("express");

const router = express.Router();

let events = [];

router.get("/", (req, res) => {
    res.json(events);
});

router.get("/:id", (req, res) => {

    const event = events.find(
        event => event.id === req.params.id
    );

    if (!event) {

        return res.status(404).json({
            message: "Event not found"
        });

    }

    res.json(event);

});

router.post("/", (req, res) => {

    const {
        id,
        name,
        description,
        date
    } = req.body;

    if (!id || !name || !date) {

        return res.status(400).json({
            message: "id, name and date are required"
        });

    }

    const event = {

        id,

        name,

        description:
            description || "",

        date,

        url:
            `/events/event.html?id=${id}`

    };

    events.push(event);

    res.status(201).json(event);

});

module.exports = router;
