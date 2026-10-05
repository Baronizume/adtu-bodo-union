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

const NODE_ENV =
    process.env.NODE_ENV || "development";

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

fs.mkdirSync(
    photosPath,
    {
        recursive: true
    }
);

fs.mkdirSync(
    videosPath,
    {
        recursive: true
    }
);

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
    (req, res, next) => {

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
// SERVE UPLOADED MEDIA
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
// MULTER FILE NAME
// =====================================================

function createSafeFilename(
    originalName
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

    return (
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
// PHOTO STORAGE
// =====================================================

const photoStorage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                callback
            ) {

                callback(
                    null,
                    photosPath
                );
            },

        filename:
            function (
                req,
                file,
                callback
            ) {

                callback(
                    null,
                    createSafeFilename(
                        file.originalname
                    )
                );
            }
    });

// =====================================================
// VIDEO STORAGE
// =====================================================

const videoStorage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                callback
            ) {

                callback(
                    null,
                    videosPath
                );
            },

        filename:
            function (
                req,
                file,
                callback
            ) {

                callback(
                    null,
                    createSafeFilename(
                        file.originalname
                    )
                );
            }
    });

// =====================================================
// FILE FILTERS
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
// MULTER CONFIGURATION
// =====================================================

const uploadPhotos =
    multer({

        storage:
            photoStorage,

        fileFilter:
            photoFileFilter,

        limits: {

            files: 50,

            // 25 MB per photo
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

            // 500 MB per video
            fileSize:
                500 * 1024 * 1024
        }
    });

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "ADTU Bodo Union backend is running.",

            environment:
                NODE_ENV,

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
    (req, res) => {

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
// ADMIN LOGIN PAGE
// =====================================================

app.get(
    "/admin/login",
    (req, res) => {

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
    (req, res) => {

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
// PHOTO UPLOAD
// =====================================================

app.post(
    "/api/upload/photos",

    uploadPhotos.array(
        "photos",
        50
    ),

    async function (
        req,
        res
    ) {

        try {

            // -----------------------------------------
            // EVENT ID
            // -----------------------------------------

            const eventId =
                req.body.eventId;

            if (!eventId) {

                // Remove files if event ID missing
                if (req.files) {

                    for (
                        const file of req.files
                    ) {

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
                }

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."
                });
            }

            // -----------------------------------------
            // FILES
            // -----------------------------------------

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

            // -----------------------------------------
            // RESPONSE FILE DATA
            // -----------------------------------------

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
                    "Photos uploaded successfully.",

                eventId:
                    eventId,

                count:
                    uploadedFiles.length,

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

    async function (
        req,
        res
    ) {

        try {

            // -----------------------------------------
            // EVENT ID
            // -----------------------------------------

            const eventId =
                req.body.eventId;

            if (!eventId) {

                if (req.files) {

                    for (
                        const file of req.files
                    ) {

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
                }

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."
                });
            }

            // -----------------------------------------
            // FILES
            // -----------------------------------------

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

            // -----------------------------------------
            // RESPONSE FILE DATA
            // -----------------------------------------

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
                    "Videos uploaded successfully.",

                eventId:
                    eventId,

                count:
                    uploadedFiles.length,

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
// MEDIA LIST
// =====================================================

app.get(
    "/api/media/:type",
    function (
        req,
        res
    ) {

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
                        function (
                            filename
                        ) {

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
    function (
        req,
        res
    ) {

        res.sendFile(
            path.join(
                frontendPath,
                "index.html"
            )
        );
    }
);

// =====================================================
// MULTER / UPLOAD ERROR HANDLER
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
// 404 HANDLER
// =====================================================

app.use(
    function (
        req,
        res
    ) {

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
// GLOBAL ERROR HANDLER
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
// START SERVER
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
