require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const cloudinary = require("./cloudinary");

const Event = require("./models/Event");

const Media = require("./models/Media");


/* ==================================================
   APP CONFIGURATION
================================================== */

const app = express();

const PORT =
    process.env.PORT || 5000;

const NODE_ENV =
    process.env.NODE_ENV || "development";


/* ==================================================
   PATH CONFIGURATION
================================================== */

const FRONTEND_PATH =
    path.join(__dirname, "../frontend");

const UPLOADS_PATH =
    path.join(__dirname, "../uploads");

const PHOTOS_PATH =
    path.join(UPLOADS_PATH, "photos");

const VIDEOS_PATH =
    path.join(UPLOADS_PATH, "videos");


/* ==================================================
   CREATE UPLOAD DIRECTORIES
================================================== */

[
    UPLOADS_PATH,
    PHOTOS_PATH,
    VIDEOS_PATH
].forEach((directory) => {

    if (!fs.existsSync(directory)) {

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );

    }

});


/* ==================================================
   MIDDLEWARE
================================================== */

app.use(
    cors()
);

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);


/* ==================================================
   REQUEST LOGGER
================================================== */

app.use(
    (req, res, next) => {

        console.log(
            `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
        );

        next();

    }
);


/* ==================================================
   STATIC FRONTEND
================================================== */

app.use(
    express.static(
        FRONTEND_PATH
    )
);


/* ==================================================
   STATIC UPLOADS
================================================== */

app.use(
    "/uploads",
    express.static(
        UPLOADS_PATH
    )
);


/* ==================================================
   MULTER MEMORY STORAGE
================================================== */

const storage =
    multer.memoryStorage();


/* ==================================================
   FILE FILTER
================================================== */

function fileFilter(
    req,
    file,
    callback
) {

    const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "image/gif"
    ];


    const allowedVideos = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo"
    ];


    if (
        allowedImages.includes(
            file.mimetype
        ) ||
        allowedVideos.includes(
            file.mimetype
        )
    ) {

        callback(
            null,
            true
        );

    }
    else {

        callback(
            new Error(
                "Unsupported file type."
            )
        );

    }

}


/* ==================================================
   MULTER CONFIGURATION
================================================== */

const upload =
    multer({

        storage:
            storage,

        fileFilter:
            fileFilter,

        limits: {

            fileSize:
                100 * 1024 * 1024

        }

    });

/* ==================================================
   HEALTH CHECK
================================================== */

app.get(
    "/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "ADTU Bodo Union backend is running.",

            database:
                mongoose.connection.readyState === 1
                    ? "connected"
                    : "disconnected",

            environment:
                NODE_ENV

        });

    }
);


/* ==================================================
   API STATUS
================================================== */

app.get(
    "/api",
    (req, res) => {

        res.json({

            success: true,

            message:
                "ADTU Bodo Union API is running.",

            endpoints: {

                events:
                    "/api/events",

                health:
                    "/health"

            }

        });

    }
);


/* ==================================================
   ADMIN LOGIN PAGE
================================================== */

app.get(
    "/admin/login",
    (req, res) => {

        res.sendFile(
            path.join(
                FRONTEND_PATH,
                "admin-login.html"
            )
        );

    }
);


/* ==================================================
   ADMIN DASHBOARD PAGE
================================================== */

app.get(
    "/admin/dashboard",
    (req, res) => {

        res.sendFile(
            path.join(
                FRONTEND_PATH,
                "admin.html"
            )
        );

    }
);


/* ==================================================
   EVENT API
================================================== */


/* ==================================================
   GET ALL EVENTS

   GET /api/events
================================================== */

app.get(
    "/api/events",
    async (req, res) => {

        try {

            const events =
                await Event
                    .find()
                    .sort({
                        createdAt: -1
                    });


            res.json({

                success: true,

                count:
                    events.length,

                data:
                    events

            });

        }
        catch (error) {

            console.error(
                "Get events error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load events.",

                error:
                    error.message

            });

        }

    }
);


/* ==================================================
   CREATE EVENT

   POST /api/events
================================================== */

app.post(
    "/api/events",
    async (req, res) => {

        try {

            const {
                title,
                description,
                date,
                location,
                image
            } = req.body;


            /* ------------------------------------------
               VALIDATION
            ------------------------------------------ */

            if (
                !title ||
                !description ||
                !date ||
                !location
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Title, description, date and location are required."

                });

            }


            /* ------------------------------------------
               CREATE EVENT
            ------------------------------------------ */

            const event =
                new Event({

                    title:
                        title.trim(),

                    description:
                        description.trim(),

                    date:
                        date,

                    location:
                        location.trim(),

                    image:
                        image || ""

                });


            const savedEvent =
                await event.save();


            /* ------------------------------------------
               SUCCESS
            ------------------------------------------ */

            res.status(201).json({

                success: true,

                message:
                    "Event created successfully.",

                data:
                    savedEvent

            });

        }
        catch (error) {

            console.error(
                "Create event error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to create event.",

                error:
                    error.message

            });

        }

    }
);


/* ==================================================
   GET SINGLE EVENT

   GET /api/events/:id
================================================== */

app.get(
    "/api/events/:id",
    async (req, res) => {

        try {

            const event =
                await Event.findById(
                    req.params.id
                );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }


            res.json({

                success: true,

                data:
                    event

            });

        }
        catch (error) {

            console.error(
                "Get single event error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load event.",

                error:
                    error.message

            });

        }

    }
);


/* ==================================================
   UPDATE EVENT

   PUT /api/events/:id
================================================== */

app.put(
    "/api/events/:id",
    async (req, res) => {

        try {

            const {
                title,
                description,
                date,
                location,
                image
            } = req.body;


            /* ------------------------------------------
               VALIDATION
            ------------------------------------------ */

            if (
                !title ||
                !description ||
                !date ||
                !location
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Title, description, date and location are required."

                });

            }


            /* ------------------------------------------
               UPDATE EVENT
            ------------------------------------------ */

            const updatedEvent =
                await Event.findByIdAndUpdate(

                    req.params.id,

                    {

                        title:
                            title.trim(),

                        description:
                            description.trim(),

                        date:
                            date,

                        location:
                            location.trim(),

                        image:
                            image || ""

                    },

                    {

                        new: true,

                        runValidators: true

                    }

                );


            /* ------------------------------------------
               EVENT NOT FOUND
            ------------------------------------------ */

            if (!updatedEvent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }


            /* ------------------------------------------
               SUCCESS
            ------------------------------------------ */

            res.json({

                success: true,

                message:
                    "Event updated successfully.",

                data:
                    updatedEvent

            });

        }
        catch (error) {

            console.error(
                "Update event error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update event.",

                error:
                    error.message

            });

        }

    }
);


/* ==================================================
   DELETE EVENT

   DELETE /api/events/:id
================================================== */

app.delete(
    "/api/events/:id",
    async (req, res) => {

        try {

            const deletedEvent =
                await Event.findByIdAndDelete(
                    req.params.id
                );


            if (!deletedEvent) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Event deleted successfully.",

                data:
                    deletedEvent

            });

        }
        catch (error) {

            console.error(
                "Delete event error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to delete event.",

                error:
                    error.message

            });

        }

    }
);

/* ==================================================
   PHOTO UPLOAD TO CLOUDINARY
================================================== */

app.post(
    "/api/upload/photos",
    upload.array(
        "photos",
        50
    ),
    async (req, res) => {

        try {

            if (
                !req.files ||
                !req.files.length
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No photos were uploaded."

                });

            }


            const eventId =
                req.body.eventId;


            /* ------------------------------------------
               VALIDATE EVENT ID
            ------------------------------------------ */

            if (!eventId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."

                });

            }


            /* ------------------------------------------
               CHECK EVENT
            ------------------------------------------ */

            const event =
                await Event.findById(
                    eventId
                );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }


            /* ------------------------------------------
               UPLOAD PHOTOS TO CLOUDINARY
            ------------------------------------------ */

            const uploadedMedia = [];


            for (
                const file
                of req.files
            ) {

                const result =
                    await new Promise(
                        (resolve, reject) => {

                            const stream =
                                cloudinary.uploader.upload_stream(
                                    {
                                        folder:
                                            `adtu-bodo-union/events/${eventId}/photos`,

                                        resource_type:
                                            "image"
                                    },

                                    (
                                        error,
                                        result
                                    ) => {

                                        if (error) {

                                            reject(
                                                error
                                            );

                                        }
                                        else {

                                            resolve(
                                                result
                                            );

                                        }

                                    }
                                );


                            stream.end(
                                file.buffer
                            );

                        }
                    );

                console.log("CLOUDINARY VIDEO RESULT:");
                console.log(result);
                uploadedMedia.push({

                    eventId:
                        eventId,

                    type:
                        "photo",

                    originalName:
                        file.originalname,

                    filename:
                        result.public_id ||
                        result.asset_id ||
                        file.originalname,

                    path:
                        result.secure_url

                });

            }


            /* ------------------------------------------
               SAVE MEDIA RECORDS TO MONGODB
            ------------------------------------------ */
            console.log("UPLOADED MEDIA:");
            console.log(uploadedMedia);
            const savedMedia =
                await Media.insertMany(
                    uploadedMedia
                );


            /* ------------------------------------------
               SUCCESS
            ------------------------------------------ */

            res.status(201).json({

                success: true,

                message:
                    `${savedMedia.length} photo(s) uploaded successfully.`,

                count:
                    savedMedia.length,

                files:
                    savedMedia

            });

        }
        catch (error) {

            console.error(
                "Photo upload error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Photo upload failed.",

                error:
                    error.message

            });

        }

    }
);

/* ==================================================
   VIDEO UPLOAD TO CLOUDINARY
================================================== */

app.post(
    "/api/upload/videos",
    upload.array(
        "videos",
        20
    ),
    async (req, res) => {

        try {

            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No videos were uploaded."
                });

            }

            const eventId =
                req.body.eventId;


            /* ------------------------------------------
               VALIDATE EVENT ID
            ------------------------------------------ */

            if (!eventId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Event ID is required."
                });

            }


            /* ------------------------------------------
               CHECK EVENT
            ------------------------------------------ */

            const event =
                await Event.findById(
                    eventId
                );

            if (!event) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Event not found."
                });

            }


            /* ------------------------------------------
               UPLOAD VIDEOS
               TO CLOUDINARY
            ------------------------------------------ */

            const uploadedMedia = [];

            for (
                const file
                of req.files
            ) {

                const result =
                    await new Promise(
                        (resolve, reject) => {

                            const stream =
                                cloudinary.uploader.upload_stream(
                                    {
                                        folder:
                                            `adtu-bodo-union/events/${eventId}/videos`,

                                        resource_type:
                                            "video"
                                    },

                                    (
                                        error,
                                        result
                                    ) => {

                                        if (error) {

                                            reject(
                                                error
                                            );

                                        } else {

                                            resolve(
                                                result
                                            );

                                        }

                                    }
                                );

                            stream.end(
                                file.buffer
                            );

                        }
                    );


                /* --------------------------------------
                   CREATE MEDIA RECORD
                -------------------------------------- */

                uploadedMedia.push({

                    eventId:
                        eventId,

                    type:
                        "video",

                    originalName:
                        file.originalname,

                    filename:
                        String(
                            result.public_id ||
                            file.originalname
                        ),

                    path:
                        String(
                            result.secure_url
                        )

                });

            }


            /* ------------------------------------------
               SAVE TO MONGODB
            ------------------------------------------ */

            const savedMedia =
                await Media.insertMany(
                    uploadedMedia
                );


            /* ------------------------------------------
               SUCCESS
            ------------------------------------------ */

            return res.status(201).json({

                success: true,

                message:
                    `${savedMedia.length} video(s) uploaded successfully.`,

                count:
                    savedMedia.length,

                files:
                    savedMedia

            });

        }
        catch (error) {

            console.error(
                "Video upload error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Video upload failed.",

                error:
                    error.message

            });

        }

    }
);

/* ==================================================
   MEDIA LIST
================================================== */

app.get(
    "/api/media/:type",
    (req, res) => {

        try {

            const type =
                req.params.type;


            let directory;


            if (type === "photos") {

                directory =
                    PHOTOS_PATH;

            }
            else if (type === "videos") {

                directory =
                    VIDEOS_PATH;

            }
            else {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid media type."

                });

            }


            if (!fs.existsSync(directory)) {

                return res.json({

                    success: true,

                    count: 0,

                    files: []

                });

            }


            const files =
                fs.readdirSync(
                    directory
                );


            const fileList =
                files.map(
                    (file) => {

                        return {

                            filename:
                                file,

                            url:
                                `/uploads/${type}/${file}`

                        };

                    }
                );


            res.json({

                success: true,

                count:
                    fileList.length,

                files:
                    fileList

            });

        }
        catch (error) {

            console.error(
                "Media list error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load media.",

                error:
                    error.message

            });

        }

    }
);

// ==================================================
// GET MEDIA FOR A SPECIFIC EVENT
// ==================================================

app.get(
    "/api/media/event/:eventId",
    async (req, res) => {

        try {

            const eventId =
                req.params.eventId;


            // Check if event exists
            const event =
                await Event.findById(eventId);


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message: "Event not found."

                });

            }


            // Get all media for this event
            const media =
                await Media
                    .find({ eventId: eventId })
                    .sort({ createdAt: -1 });


            // Separate photos
            const photos =
                media
                    .filter(
                        item =>
                            item.type === "photo"
                    )
                    .map(item => ({

                        _id: item._id,

                        originalName:
                            item.originalName,

                        filename:
                            item.filename,

                        url:
                            item.path,

                        createdAt:
                            item.createdAt

                    }));


            // Separate videos
            const videos =
                media
                    .filter(
                        item =>
                            item.type === "video"
                    )
                    .map(item => ({

                        _id: item._id,

                        originalName:
                            item.originalName,

                        filename:
                            item.filename,

                        url:
                            item.path,

                        createdAt:
                            item.createdAt

                    }));


            res.json({

                success: true,

                eventId: eventId,

                photos: photos,

                videos: videos

            });

        }

        catch (error) {

            console.error(
                "Event media error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load event media.",

                error:
                    error.message

            });

        }

    }
);

/* ==================================================
   EVENT MEDIA COUNT
================================================== */

app.get(
    "/api/upload/event/:eventId",
    async (req, res) => {

        try {

            const eventId =
                req.params.eventId;


            /* ------------------------------------------
               CHECK EVENT
            ------------------------------------------ */

            const event =
                await Event.findById(
                    eventId
                );


            if (!event) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Event not found."

                });

            }


            /* ------------------------------------------
               COUNT PHOTOS
            ------------------------------------------ */

            const photoCount =
                await Media.countDocuments({

                    eventId:
                        eventId,

                    type:
                        "photo"

                });


            /* ------------------------------------------
               COUNT VIDEOS
            ------------------------------------------ */

            const videoCount =
                await Media.countDocuments({

                    eventId:
                        eventId,

                    type:
                        "video"

                });


            /* ------------------------------------------
               SUCCESS
            ------------------------------------------ */

            res.json({

                success: true,

                eventId:
                    eventId,

                photoCount:
                    photoCount,

                videoCount:
                    videoCount

            });

        }
        catch (error) {

            console.error(
                "Event media count error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load media counts.",

                error:
                    error.message

            });

        }

    }
);


/* ==================================================
   MULTER ERROR HANDLER
================================================== */

app.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "File upload error.",

                error:
                    error.message

            });

        }


        if (error) {

            console.error(
                "Server error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Internal server error."

            });

        }


        next();

    }
);


/* ==================================================
   404 HANDLER
================================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


/* ==================================================
   GLOBAL ERROR HANDLER
================================================== */

app.use(
    (error, req, res, next) => {

        console.error(
            "Global error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error.",

            error:
                error.message

        });

    }
);


/* ==================================================
   MONGODB CONNECTION
================================================== */

mongoose
    .connect(
        process.env.MONGODB_URI
    )
    .then(
        () => {

            console.log(
                "MongoDB connected successfully"
            );

        }
    )
    .catch(
        (error) => {

            console.error(
                "MongoDB connection failed:",
                error.message
            );

        }
    );


/* ==================================================
   START SERVER
================================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Campus Connect server running on port ${PORT}`
        );

        console.log(
            `ADTU Bodo Union server running on http://localhost:${PORT}`
        );

        console.log(
            `Frontend: ${FRONTEND_PATH}`
        );

        console.log(
            `Uploads: ${UPLOADS_PATH}`
        );

    }
);