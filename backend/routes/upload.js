const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();


// =====================================================
// MEDIA DIRECTORIES
// =====================================================

const mediaDirectory = path.resolve(
    __dirname,
    "../../frontend/media"
);

const photosDirectory = path.join(
    mediaDirectory,
    "rwnswndri",
    "photos"
);

const videosDirectory = path.join(
    mediaDirectory,
    "rwnswndri",
    "videos"
);


// =====================================================
// CREATE DIRECTORIES
// =====================================================

fs.mkdirSync(
    photosDirectory,
    {
        recursive: true
    }
);

fs.mkdirSync(
    videosDirectory,
    {
        recursive: true
    }
);


console.log("");
console.log("======================================");
console.log("UPLOAD DIRECTORIES");
console.log("======================================");
console.log("Media:", mediaDirectory);
console.log("Photos:", photosDirectory);
console.log("Videos:", videosDirectory);
console.log("======================================");
console.log("");


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
// GET DESTINATION
// =====================================================

function getDestination(
    type,
    mimetype
) {

    // Explicit photo upload
    if (type === "photo") {

        return photosDirectory;

    }


    // Explicit video upload
    if (type === "video") {

        return videosDirectory;

    }


    // Automatic detection
    if (
        mimetype &&
        mimetype.startsWith("video/")
    ) {

        return videosDirectory;

    }


    return photosDirectory;

}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: function (
        req,
        file,
        callback
    ) {

        const type =
            String(
                req.body.type || ""
            ).toLowerCase();


        const destination =
            getDestination(
                type,
                file.mimetype
            );


        console.log("");
        console.log(
            "Receiving file:",
            file.originalname
        );

        console.log(
            "MIME:",
            file.mimetype
        );

        console.log(
            "Type:",
            type || "auto"
        );

        console.log(
            "Destination:",
            destination
        );


        callback(
            null,
            destination
        );

    },


    filename: function (
        req,
        file,
        callback
    ) {

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


        console.log(
            "Saving as:",
            filename
        );


        callback(
            null,
            filename
        );

    }

});


// =====================================================
// FILE FILTER
// =====================================================

function fileFilter(
    req,
    file,
    callback
) {

    const type =
        String(
            req.body.type || ""
        ).toLowerCase();


    console.log("");
    console.log(
        "Checking file:",
        file.originalname
    );

    console.log(
        "MIME type:",
        file.mimetype
    );

    console.log(
        "Requested type:",
        type || "auto"
    );


    // =================================================
    // PHOTO
    // =================================================

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
                    "This file is an image, but the upload type is not photo."
                )
            );

        }


        return callback(
            null,
            true
        );

    }


    // =================================================
    // VIDEO
    // =================================================

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
                    "This file is a video, but the upload type is not video."
                )
            );

        }


        return callback(
            null,
            true
        );

    }


    // =================================================
    // UNSUPPORTED
    // =================================================

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

    storage: storage,

    fileFilter: fileFilter,

    limits: {

        // Maximum 500 MB per file
        fileSize:
            500 * 1024 * 1024

    }

});


// =====================================================
// HELPER: CREATE FILE RESPONSE
// =====================================================

function createFileResponse(
    file,
    type
) {

    const folder =
        type === "video"
            ? "videos"
            : "photos";


    return {

        name:
            file.filename,

        originalName:
            file.originalname,

        type:
            type,

        size:
            file.size,

        mimetype:
            file.mimetype,

        url:
            `/media/rwnswndri/${folder}/${encodeURIComponent(
                file.filename
            )}`

    };

}


// =====================================================
// MAIN UPLOAD ENDPOINT
//
// FRONTEND CURRENTLY CALLS:
//
// POST /api/media/upload
//
// FormData:
// file = selected file
// type = photo OR video
//
// =====================================================

router.post(
    "/media/upload",

    upload.single("file"),

    function (
        req,
        res
    ) {

        try {

            console.log("");
            console.log(
                "======================================"
            );

            console.log(
                "MEDIA UPLOAD REQUEST"
            );

            console.log(
                "======================================"
            );


            // No file
            if (
                !req.file
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "No file was uploaded."

                });

            }


            const requestedType =
                String(
                    req.body.type || ""
                ).toLowerCase();


            let type =
                requestedType;


            // Detect type if not supplied
            if (
                !type
            ) {

                if (
                    req.file.mimetype.startsWith(
                        "video/"
                    )
                ) {

                    type =
                        "video";

                } else {

                    type =
                        "photo";

                }

            }


            const uploaded =
                createFileResponse(
                    req.file,
                    type
                );


            console.log(
                "Upload successful:",
                uploaded
            );


            return res.status(200).json({

                success:
                    true,

                message:
                    `${type === "photo" ? "Photo" : "Video"} uploaded successfully.`,

                file:
                    uploaded,

                files:
                    [
                        uploaded
                    ]

            });

        } catch (error) {

            console.error(
                "MEDIA UPLOAD ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Media upload failed."

            });

        }

    }
);


// =====================================================
// PHOTO UPLOAD ENDPOINT
//
// POST /api/upload/photos
//
// FormData field:
// photos
//
// =====================================================

router.post(
    "/photos",

    upload.array(
        "photos",
        100
    ),

    function (
        req,
        res
    ) {

        try {

            const files =
                req.files || [];


            console.log(
                "Photos received:",
                files.length
            );


            const uploaded =
                files.map(
                    function (
                        file
                    ) {

                        return createFileResponse(
                            file,
                            "photo"
                        );

                    }
                );


            return res.status(200).json({

                success:
                    true,

                message:
                    `${uploaded.length} photo(s) uploaded successfully.`,

                files:
                    uploaded

            });

        } catch (error) {

            console.error(
                "PHOTO UPLOAD ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Photo upload failed."

            });

        }

    }
);


// =====================================================
// VIDEO UPLOAD ENDPOINT
//
// POST /api/upload/videos
//
// FormData field:
// videos
//
// =====================================================

router.post(
    "/videos",

    upload.array(
        "videos",
        20
    ),

    function (
        req,
        res
    ) {

        try {

            const files =
                req.files || [];


            console.log(
                "Videos received:",
                files.length
            );


            const uploaded =
                files.map(
                    function (
                        file
                    ) {

                        return createFileResponse(
                            file,
                            "video"
                        );

                    }
                );


            return res.status(200).json({

                success:
                    true,

                message:
                    `${uploaded.length} video(s) uploaded successfully.`,

                files:
                    uploaded

            });

        } catch (error) {

            console.error(
                "VIDEO UPLOAD ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Video upload failed."

            });

        }

    }
);


// =====================================================
// LIST PHOTOS
//
// GET /api/upload/photos
//
// =====================================================

router.get(
    "/photos",

    function (
        req,
        res
    ) {

        try {

            const files =
                fs.readdirSync(
                    photosDirectory
                );


            const photoFiles =
                files.filter(
                    function (
                        file
                    ) {

                        const extension =
                            path.extname(
                                file
                            ).toLowerCase();


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
                );


            const result =
                photoFiles.map(
                    function (
                        file
                    ) {

                        return {

                            name:
                                file,

                            type:
                                "photo",

                            url:
                                `/media/rwnswndri/photos/${encodeURIComponent(
                                    file
                                )}`

                        };

                    }
                );


            return res.json(
                result
            );

        } catch (error) {

            console.error(
                "PHOTO LIST ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Could not read photo directory."

            });

        }

    }
);


// =====================================================
// LIST VIDEOS
//
// GET /api/upload/videos
//
// =====================================================

router.get(
    "/videos",

    function (
        req,
        res
    ) {

        try {

            const files =
                fs.readdirSync(
                    videosDirectory
                );


            const videoFiles =
                files.filter(
                    function (
                        file
                    ) {

                        const extension =
                            path.extname(
                                file
                            ).toLowerCase();


                        return [
                            ".mp4",
                            ".webm",
                            ".mov",
                            ".m4v"
                        ].includes(
                            extension
                        );

                    }
                );


            const result =
                videoFiles.map(
                    function (
                        file
                    ) {

                        return {

                            name:
                                file,

                            type:
                                "video",

                            url:
                                `/media/rwnswndri/videos/${encodeURIComponent(
                                    file
                                )}`

                        };

                    }
                );


            return res.json(
                result
            );

        } catch (error) {

            console.error(
                "VIDEO LIST ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Could not read video directory."

            });

        }

    }
);


// =====================================================
// DELETE PHOTO
//
// DELETE /api/upload/photos/:filename
//
// =====================================================

router.delete(
    "/photos/:filename",

    function (
        req,
        res
    ) {

        try {

            const filename =
                path.basename(
                    req.params.filename
                );


            const filePath =
                path.join(
                    photosDirectory,
                    filename
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Photo not found."

                });

            }


            fs.unlinkSync(
                filePath
            );


            return res.json({

                success:
                    true,

                message:
                    "Photo deleted successfully."

            });

        } catch (error) {

            console.error(
                "PHOTO DELETE ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Could not delete photo."

            });

        }

    }
);


// =====================================================
// DELETE VIDEO
//
// DELETE /api/upload/videos/:filename
//
// =====================================================

router.delete(
    "/videos/:filename",

    function (
        req,
        res
    ) {

        try {

            const filename =
                path.basename(
                    req.params.filename
                );


            const filePath =
                path.join(
                    videosDirectory,
                    filename
                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Video not found."

                });

            }


            fs.unlinkSync(
                filePath
            );


            return res.json({

                success:
                    true,

                message:
                    "Video deleted successfully."

            });

        } catch (error) {

            console.error(
                "VIDEO DELETE ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Could not delete video."

            });

        }

    }
);


// =====================================================
// MULTER / UPLOAD ERROR HANDLER
// =====================================================

router.use(
    function (
        error,
        req,
        res,
        next
    ) {

        console.error("");
        console.error(
            "======================================"
        );

        console.error(
            "UPLOAD ERROR:"
        );

        console.error(
            error
        );

        console.error(
            "======================================"
        );


        // Multer error
        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "File is too large. Maximum size is 500 MB."

                });

            }


            return res.status(400).json({

                success:
                    false,

                message:
                    `Upload error: ${error.message}`

            });

        }


        // File type error
        if (
            error
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Upload failed."

            });

        }


        next();

    }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;
