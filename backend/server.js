const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const app = express();

// =====================================================
// CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// =====================================================
// PATHS
// =====================================================

const frontendPath = path.join(
    __dirname,
    "..",
    "frontend"
);

const uploadsPath = path.join(
    __dirname,
    "..",
    "uploads"
);

const photosPath = path.join(
    uploadsPath,
    "photos"
);

const videosPath = path.join(
    uploadsPath,
    "videos"
);

// =====================================================
// CREATE DIRECTORIES
// =====================================================

fs.mkdirSync(photosPath, {
    recursive: true
});

fs.mkdirSync(videosPath, {
    recursive: true
});

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
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

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use(
    function (req, res, next) {

        console.log(
            `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
        );

        next();
    }
);

// =====================================================
// SERVE FRONTEND
// =====================================================

app.use(
    express.static(frontendPath)
);

// =====================================================
// SERVE UPLOADS
// =====================================================

app.use(
    "/uploads",
    express.static(
        uploadsPath,
        {
            maxAge: "1d"
        }
    )
);

// =====================================================
// SAFE EVENT ID
// =====================================================

function createSafeEventId(eventId) {

    return String(eventId || "unknown")
        .replace(
            /[^a-zA-Z0-9-_]/g,
            "_"
        );
}

// =====================================================
// SAFE FILE NAME
// =====================================================

function createSafeFilename(
    originalName,
    eventId
) {

    const extension =
        path.extname(
            originalName
        ).toLowerCase();

    const originalBaseName =
        path.basename(
            originalName,
            extension
        );

    const safeBaseName =
        originalBaseName
            .replace(
                /[^a-zA-Z0-9-_]/g,
                "_"
            )
            .substring(
                0,
                100
            );

    const safeEventId =
        createSafeEventId(
            eventId
        );

    return (
        safeEventId +
        "-" +
        Date.now() +
        "-" +
        Math.round(
            Math.random() * 1e9
        ) +
        "-" +
        safeBaseName +
        extension
    );
}

// =====================================================
// PHOTO FILTER
// =====================================================

function photoFileFilter(
    req,
    file,
    callback
) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {

        callback(
            null,
            true
        );

    } else {

        callback(
            new Error(
                "Only JPG, JPEG, PNG, WEBP and GIF photos are allowed."
            ),
            false
        );
    }
}

// =====================================================
// VIDEO FILTER
// =====================================================

function videoFileFilter(
    req,
    file,
    callback
) {

    const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-m4v"
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {

        callback(
            null,
            true
        );

    } else {

        callback(
            new Error(
                "Only MP4, WEBM, MOV and M4V videos are allowed."
            ),
            false
        );
    }
}

// =====================================================
// PHOTO STORAGE
// =====================================================

const photoStorage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            callback
        ) {

            callback(
                null,
                photosPath
            );
        },

        filename: function (
            req,
            file,
            callback
        ) {

            callback(
                null,
                createSafeFilename(
                    file.originalname,
                    req.body.eventId
                )
            );
        }
    });

// =====================================================
// VIDEO STORAGE
// =====================================================

const videoStorage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            callback
        ) {

            callback(
                null,
                videosPath
            );
        },

        filename: function (
            req,
            file,
            callback
        ) {

            callback(
                null,
                createSafeFilename(
                    file.originalname,
                    req.body.eventId
                )
            );
        }
    });

// =====================================================
// MULTER
// =====================================================

const uploadPhotos =
    multer({

        storage:
            photoStorage,

        fileFilter:
            photoFileFilter,

        limits: {

            files: 50,

            fileSize:
                25 * 1024 * 1024
        }
    });

const uploadVideos =
    multer({

        storage:
            videoStorage,

        fileFilter:
            videoFileFilter,

        limits: {

            files: 10,

            fileSize:
                500 * 1024 * 1024
        }
    });

// =====================================================
// HEALTH
// =====================================================

app.get(
    "/health",
    function (req, res) {

        res.status(200).json({

            success: true,

            message:
                "ADTU Bodo Union backend is running.",

            environment:
                NODE_ENV,

            port:
                PORT,

            timestamp:
                new Date().toISOString()
        });
    }
);

// =====================================================
// API STATUS
// =====================================================

app.get(
    "/api",
    function (req, res) {

        res.json({

            success: true,

            name:
                "ADTU Bodo Union Backend",

            status:
                "online",

            environment:
                NODE_ENV
        });
    }
);

// =====================================================
// PHOTO UPLOAD
// =====================================================

app.post(
    "/api/upload/photos",

    uploadPhotos.array(
        "photos",
        50
    ),

    function (req, res) {

        try {

            const eventId =
                req.body.eventId;

            if (!eventId) {

                if (req.files) {

                    req.files.forEach(
                        function (file) {

                            try {

                                fs.unlinkSync(
                                    file.path
                                );

                            } catch (error) {

                                console.error(
                                    "Could not remove file:",
                                    error
                                );
                            }
                        }
                    );
                }

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."
                });
            }

            const files =
                req.files || [];

            if (
                files.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No photos uploaded."
                });
            }

            const uploadedFiles =
                files.map(
                    function (file) {

                        return {

                            originalName:
                                file.originalname,

                            filename:
                                file.filename,

                            mimetype:
                                file.mimetype,

                            size:
                                file.size,

                            eventId:
                                eventId,

                            url:
                                `/uploads/photos/${encodeURIComponent(
                                    file.filename
                                )}`
                        };
                    }
                );

            console.log(
                `Uploaded ${files.length} photo(s) for event ${eventId}`
            );

            return res.status(200).json({

                success: true,

                message:
                    `${files.length} photo(s) uploaded successfully.`,

                eventId:
                    eventId,

                count:
                    files.length,

                files:
                    uploadedFiles
            });

        } catch (error) {

            console.error(
                "PHOTO UPLOAD ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Photo upload failed."
            });
        }
    }
);

// =====================================================
// VIDEO UPLOAD
// =====================================================

app.post(
    "/api/upload/videos",

    uploadVideos.array(
        "videos",
        10
    ),

    function (req, res) {

        try {

            const eventId =
                req.body.eventId;

            if (!eventId) {

                if (req.files) {

                    req.files.forEach(
                        function (file) {

                            try {

                                fs.unlinkSync(
                                    file.path
                                );

                            } catch (error) {

                                console.error(
                                    "Could not remove file:",
                                    error
                                );
                            }
                        }
                    );
                }

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."
                });
            }

            const files =
                req.files || [];

            if (
                files.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No videos uploaded."
                });
            }

            const uploadedFiles =
                files.map(
                    function (file) {

                        return {

                            originalName:
                                file.originalname,

                            filename:
                                file.filename,

                            mimetype:
                                file.mimetype,

                            size:
                                file.size,

                            eventId:
                                eventId,

                            url:
                                `/uploads/videos/${encodeURIComponent(
                                    file.filename
                                )}`
                        };
                    }
                );

            console.log(
                `Uploaded ${files.length} video(s) for event ${eventId}`
            );

            return res.status(200).json({

                success: true,

                message:
                    `${files.length} video(s) uploaded successfully.`,

                eventId:
                    eventId,

                count:
                    files.length,

                files:
                    uploadedFiles
            });

        } catch (error) {

            console.error(
                "VIDEO UPLOAD ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Video upload failed."
            });
        }
    }
);

// =====================================================
// EVENT MEDIA
// =====================================================

app.get(
    "/api/upload/event/:eventId",
    function (req, res) {

        try {

            const eventId =
                req.params.eventId;

            if (!eventId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."
                });
            }

            const safeEventId =
                createSafeEventId(
                    eventId
                );

            // -----------------------------------------
            // PHOTOS
            // -----------------------------------------

            const allPhotos =
                fs.readdirSync(
                    photosPath
                );

            const eventPhotos =
                allPhotos.filter(
                    function (filename) {

                        return filename.startsWith(
                            safeEventId + "-"
                        );
                    }
                );

            // -----------------------------------------
            // VIDEOS
            // -----------------------------------------

            const allVideos =
                fs.readdirSync(
                    videosPath
                );

            const eventVideos =
                allVideos.filter(
                    function (filename) {

                        return filename.startsWith(
                            safeEventId + "-"
                        );
                    }
                );

            return res.status(200).json({

                success: true,

                eventId:
                    eventId,

                photoCount:
                    eventPhotos.length,

                videoCount:
                    eventVideos.length,

                photos:
                    eventPhotos.map(
                        function (filename) {

                            return {

                                filename:
                                    filename,

                                url:
                                    `/uploads/photos/${encodeURIComponent(
                                        filename
                                    )}`
                            };
                        }
                    ),

                videos:
                    eventVideos.map(
                        function (filename) {

                            return {

                                filename:
                                    filename,

                                url:
                                    `/uploads/videos/${encodeURIComponent(
                                        filename
                                    )}`
                            };
                        }
                    )
            });

        } catch (error) {

            console.error(
                "EVENT MEDIA ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not load event media."
            });
        }
    }
);

// =====================================================
// ALL MEDIA
// =====================================================

app.get(
    "/api/media/:type",
    function (req, res) {

        try {

            const type =
                req.params.type;

            let directory;

            if (
                type === "photos"
            ) {

                directory =
                    photosPath;

            } else if (
                type === "videos"
            ) {

                directory =
                    videosPath;

            } else {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid media type."
                });
            }

            const files =
                fs
                    .readdirSync(
                        directory
                    )
                    .map(
                        function (filename) {

                            return {

                                filename:
                                    filename,

                                url:
                                    `/uploads/${type}/${encodeURIComponent(
                                        filename
                                    )}`
                            };
                        }
                    );

            return res.json({

                success: true,

                count:
                    files.length,

                files:
                    files
            });

        } catch (error) {

            console.error(
                "MEDIA LIST ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Could not load media."
            });
        }
    }
);

// =====================================================
// HOME PAGE
// =====================================================

app.get(
    "/",
    function (req, res) {

        res.sendFile(
            path.join(
                frontendPath,
                "index.html"
            )
        );
    }
);

// =====================================================
// ADMIN LOGIN
// =====================================================

app.get(
    "/admin/login",
    function (req, res) {

        res.sendFile(
            path.join(
                frontendPath,
                "admin",
                "login.html"
            )
        );
    }
);

// =====================================================
// ADMIN DASHBOARD
// =====================================================

app.get(
    "/admin/dashboard",
    function (req, res) {

        res.sendFile(
            path.join(
                frontendPath,
                "admin",
                "admin-dashboard.html"
            )
        );
    }
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

app.use(
    function (
        error,
        req,
        res,
        next
    ) {

        if (
            error instanceof
            multer.MulterError
        ) {

            console.error(
                "MULTER ERROR:",
                error
            );

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(413).json({

                    success: false,

                    message:
                        "File is too large."
                });
            }

            if (
                error.code ===
                "LIMIT_FILE_COUNT"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Too many files uploaded."
                });
            }

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "File upload error."
            });
        }

        if (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Upload failed."
            });
        }

        next();
    }
);

// =====================================================
// 404
// =====================================================

app.use(
    function (req, res) {

        if (
            req.originalUrl.startsWith(
                "/api/"
            )
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API endpoint not found."
            });
        }

        return res.status(404).send(
            "Page not found."
        );
    }
);

// =====================================================
// GLOBAL ERROR
// =====================================================

app.use(
    function (
        error,
        req,
        res,
        next
    ) {

        console.error(
            "SERVER ERROR:",
            error
        );

        if (
            res.headersSent
        ) {

            return next(
                error
            );
        }

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Internal server error."
        });
    }
);

// =====================================================
// START
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    function () {

        console.log(
            "====================================="
        );

        console.log(
            "ADTU BODO UNION BACKEND"
        );

        console.log(
            "====================================="
        );

        console.log(
            `Environment: ${NODE_ENV}`
        );

        console.log(
            `Port: ${PORT}`
        );

        console.log(
            `Frontend: ${frontendPath}`
        );

        console.log(
            `Uploads: ${uploadsPath}`
        );

        console.log(
            `Photos: ${photosPath}`
        );

        console.log(
            `Videos: ${videosPath}`
        );

        console.log(
            "====================================="
        );
    }
);
