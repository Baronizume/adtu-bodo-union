const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const eventsRouter = require("./routes/events");
const uploadRouter = require("./routes/upload");

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// FRONTEND MEDIA DIRECTORY
// =====================================================

const mediaDirectory = path.join(
    __dirname,
    "..",
    "frontend",
    "media"
);


// =====================================================
// SERVE FRONTEND MEDIA
// =====================================================

app.use(
    "/media",
    express.static(mediaDirectory)
);


// =====================================================
// API ROUTES
// =====================================================

app.use(
    "/api/events",
    eventsRouter
);

app.use(
    "/api/upload",
    uploadRouter
);


// =====================================================
// ROOT
// =====================================================

app.get("/", function (req, res) {

    res.json({
        message:
            "ADTU Bodo Union API is running"
    });

});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    function (req, res) {

        res.json({
            status: "OK",
            service:
                "ADTU Bodo Union Backend"
        });

    }
);


// =====================================================
// MEDIA TEST
// =====================================================

app.get(
    "/api/media-test",
    function (req, res) {

        res.json({

            success: true,

            mediaDirectory:
                mediaDirectory,

            photosDirectory:
                path.join(
                    mediaDirectory,
                    "rwnswndri",
                    "photos"
                ),

            videosDirectory:
                path.join(
                    mediaDirectory,
                    "rwnswndri",
                    "videos"
                )

        });

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    function (
        error,
        req,
        res,
        next
    ) {

        console.error(
            "Server error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Internal server error."

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    function () {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "ADTU BODO UNION BACKEND"
        );

        console.log(
            "======================================"
        );

        console.log(
            `Server running at http://localhost:${PORT}`
        );

        console.log(
            "Media:",
            mediaDirectory
        );

        console.log(
            "Photos:",
            path.join(
                mediaDirectory,
                "rwnswndri",
                "photos"
            )
        );

        console.log(
            "Videos:",
            path.join(
                mediaDirectory,
                "rwnswndri",
                "videos"
            )
        );

        console.log(
            "Upload API: /api/upload"
        );

        console.log(
            "======================================"
        );

        console.log("");

    }
);