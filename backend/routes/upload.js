const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();


// =====================================================
// BASE MEDIA DIRECTORY
// =====================================================

const mediaDirectory = path.resolve(
    __dirname,
    "../../frontend/media"
);


// =====================================================
// ALLOWED FILE TYPES
// =====================================================

const allowedPhotos = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif"
];

const allowedVideos = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-m4v"
];


// =====================================================
// SAFE EVENT ID
// =====================================================

function safeEventId(eventId) {

    if (!eventId) {
        throw new Error("Event ID is required.");
    }

    const safe = String(eventId)
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_");

    if (!safe) {
        throw new Error("Invalid event ID.");
    }

    return safe;
}


// =====================================================
// GET EVENT DIRECTORY
// =====================================================

function getEventDirectory(eventId, type) {

    const safeId = safeEventId(eventId);

    const folder =
        type === "video"
            ? "videos"
            : "photos";

    const directory = path.join(
        mediaDirectory,
        safeId,
        folder
    );

    fs.mkdirSync(directory, {
        recursive: true
    });

    return directory;
}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: function(req, file, callback) {

        try {

            const type =
                String(
                    req.body.type || ""
                ).toLowerCase();

            let actualType = type;

            if (!actualType) {

                actualType =
                    file.mimetype.startsWith("video/")
                        ? "video"
                        : "photo";

            }

            const destination =
                getEventDirectory(
                    req.body.eventId,
                    actualType
                );

            console.log("");
            console.log("UPLOAD");
            console.log("Event ID:", req.body.eventId);
            console.log("File:", file.originalname);
            console.log("Type:", actualType);
            console.log("Destination:", destination);

            callback(null, destination);

        } catch (error) {

            callback(error);

        }

    },


    filename: function(req, file, callback) {

        const extension =
            path.extname(
                file.originalname
            );

        const originalName =
            path.basename(
                file.originalname,
                extension
            );

        const safeName =
            originalName
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                )
                .replace(
                    /_+/g,
                    "_"
                );

        const filename =
            `${Date.now()}-${safeName}${extension}`;

        callback(
            null,
            filename
        );

    }

});


// =====================================================
// FILE FILTER
// =====================================================

function fileFilter(req, file, callback) {

    const type =
        String(
            req.body.type || ""
        ).toLowerCase();


    if (
        allowedPhotos.includes(
            file.mimetype
        )
    ) {

        if (
            type &&
            type !== "photo"
        ) {

            return callback(
                new Error(
                    "This file is an image."
                )
            );

        }

        return callback(
            null,
            true
        );

    }


    if (
        allowedVideos.includes(
            file.mimetype
        )
    ) {

        if (
            type &&
            type !== "video"
        ) {

            return callback(
                new Error(
                    "This file is a video."
                )
            );

        }

        return callback(
            null,
            true
        );

    }


    callback(
        new Error(
            "Unsupported file type: " +
            file.mimetype
        )
    );

}


// =====================================================
// MULTER
// =====================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            500 * 1024 * 1024

    }

});


// =====================================================
// FILE RESPONSE
// =====================================================

function createFileResponse(
    file,
    eventId,
    type
) {

    const safeId =
        safeEventId(eventId);

    const folder =
        type === "video"
            ? "videos"
            : "photos";


    return {

        name:
            file.filename,

        originalName:
            file.originalname,

        type,

        size:
            file.size,

        mimetype:
            file.mimetype,

        url:
            `/media/${encodeURIComponent(
                safeId
            )}/${folder}/${encodeURIComponent(
                file.filename
            )}`

    };

}


// =====================================================
// PHOTO UPLOAD
//
// POST /api/upload/photos
//
// FormData:
// eventId
// photos
//
// =====================================================

router.post(
    "/photos",

    upload.array(
        "photos",
        100
    ),

    function(req, res) {

        try {

            if (!req.body.eventId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."

                });

            }


            const files =
                req.files || [];


            if (!files.length) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No photos were uploaded."

                });

            }


            const uploaded =
                files.map(
                    file =>
                        createFileResponse(
                            file,
                            req.body.eventId,
                            "photo"
                        )
                );


            return res.json({

                success: true,

                message:
                    `${uploaded.length} photo(s) uploaded successfully.`,

                files: uploaded

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
//
// POST /api/upload/videos
//
// FormData:
// eventId
// videos
//
// =====================================================

router.post(
    "/videos",

    upload.array(
        "videos",
        20
    ),

    function(req, res) {

        try {

            if (!req.body.eventId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."

                });

            }


            const files =
                req.files || [];


            if (!files.length) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No videos were uploaded."

                });

            }


            const uploaded =
                files.map(
                    file =>
                        createFileResponse(
                            file,
                            req.body.eventId,
                            "video"
                        )
                );


            return res.json({

                success: true,

                message:
                    `${uploaded.length} video(s) uploaded successfully.`,

                files: uploaded

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
// GET EVENT MEDIA
//
// GET /api/upload/event/:eventId
//
// =====================================================

router.get(
    "/event/:eventId",

    function(req, res) {

        try {

            const eventId =
                safeEventId(
                    req.params.eventId
                );


            const photosDirectory =
                getEventDirectory(
                    eventId,
                    "photo"
                );

            const videosDirectory =
                getEventDirectory(
                    eventId,
                    "video"
                );


            function readFiles(
                directory,
                type
            ) {

                if (
                    !fs.existsSync(
                        directory
                    )
                ) {

                    return [];

                }


                const files =
                    fs.readdirSync(
                        directory
                    );


                return files
                    .filter(
                        function(file) {

                            const extension =
                                path.extname(
                                    file
                                ).toLowerCase();


                            if (
                                type === "photo"
                            ) {

                                return [
                                    ".jpg",
                                    ".jpeg",
                                    ".png",
                                    ".webp",
                                    ".gif"
                                ].includes(
                                    extension
                                );

                            }


                            return [
                                ".mp4",
                                ".webm",
                                ".mov",
                                ".m4v"
                            ].includes(
                                extension
                            );

                        }
                    )
                    .map(
                        function(file) {

                            return {

                                name: file,

                                type,

                                url:
                                    `/media/${encodeURIComponent(
                                        eventId
                                    )}/${type === "video"
                                        ? "videos"
                                        : "photos"
                                    }/${encodeURIComponent(
                                        file
                                    )}`

                            };

                        }
                    );

            }


            const photos =
                readFiles(
                    photosDirectory,
                    "photo"
                );


            const videos =
                readFiles(
                    videosDirectory,
                    "video"
                );


            return res.json({

                success: true,

                eventId,

                photos,

                videos,

                photoCount:
                    photos.length,

                videoCount:
                    videos.length

            });

        } catch (error) {

            console.error(
                "EVENT MEDIA ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Could not load event media."

            });

        }

    }
);


// =====================================================
// LIST ALL PHOTOS FOR EVENT
// =====================================================

router.get(
    "/photos/:eventId",

    function(req, res) {

        try {

            const eventId =
                safeEventId(
                    req.params.eventId
                );

            const directory =
                getEventDirectory(
                    eventId,
                    "photo"
                );


            if (
                !fs.existsSync(
                    directory
                )
            ) {

                return res.json([]);

            }


            const files =
                fs.readdirSync(
                    directory
                );


            const result =
                files
                    .filter(
                        file =>
                            [
                                ".jpg",
                                ".jpeg",
                                ".png",
                                ".webp",
                                ".gif"
                            ].includes(
                                path.extname(
                                    file
                                ).toLowerCase()
                            )
                    )
                    .map(
                        file => ({

                            name: file,

                            type: "photo",

                            url:
                                `/media/${encodeURIComponent(
                                    eventId
                                )}/photos/${encodeURIComponent(
                                    file
                                )}`

                        })
                    );


            return res.json(result);

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    "Could not read photos."

            });

        }

    }
);


// =====================================================
// LIST ALL VIDEOS FOR EVENT
// =====================================================

router.get(
    "/videos/:eventId",

    function(req, res) {

        try {

            const eventId =
                safeEventId(
                    req.params.eventId
                );

            const directory =
                getEventDirectory(
                    eventId,
                    "video"
                );


            if (
                !fs.existsSync(
                    directory
                )
            ) {

                return res.json([]);

            }


            const files =
                fs.readdirSync(
                    directory
                );


            const result =
                files
                    .filter(
                        file =>
                            [
                                ".mp4",
                                ".webm",
                                ".mov",
                                ".m4v"
                            ].includes(
                                path.extname(
                                    file
                                ).toLowerCase()
                            )
                    )
                    .map(
                        file => ({

                            name: file,

                            type: "video",

                            url:
                                `/media/${encodeURIComponent(
                                    eventId
                                )}/videos/${encodeURIComponent(
                                    file
                                )}`

                        })
                    );


            return res.json(result);

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    "Could not read videos."

            });

        }

    }
);


// =====================================================
// DELETE PHOTO
// =====================================================

router.delete(
    "/photos/:eventId/:filename",

    function(req, res) {

        try {

            const eventId =
                safeEventId(
                    req.params.eventId
                );

            const filename =
                path.basename(
                    req.params.filename
                );


            const filePath =
                path.join(
                    getEventDirectory(
                        eventId,
                        "photo"
                    ),
                    filename
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Photo not found."

                });

            }


            fs.unlinkSync(
                filePath
            );


            return res.json({

                success: true,

                message:
                    "Photo deleted successfully."

            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    "Could not delete photo."

            });

        }

    }
);


// =====================================================
// DELETE VIDEO
// =====================================================

router.delete(
    "/videos/:eventId/:filename",

    function(req, res) {

        try {

            const eventId =
                safeEventId(
                    req.params.eventId
                );

            const filename =
                path.basename(
                    req.params.filename
                );


            const filePath =
                path.join(
                    getEventDirectory(
                        eventId,
                        "video"
                    ),
                    filename
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Video not found."

                });

            }


            fs.unlinkSync(
                filePath
            );


            return res.json({

                success: true,

                message:
                    "Video deleted successfully."

            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    "Could not delete video."

            });

        }

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

router.use(
    function(error, req, res, next) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "File is too large. Maximum size is 500 MB."

                });

            }


            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Upload failed."

        });

    }
);


module.exports = router;
