const express = require("express");
const cors = require("cors");
require("dotenv").config();

const eventsRouter = require("./routes/events");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/events", eventsRouter);

app.get("/", (req, res) => {
    res.json({
        message: "ADTU Bodo Union API is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        service: "ADTU Bodo Union Backend"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
