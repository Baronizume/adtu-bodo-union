require("dotenv").config();
const mongoose = require("mongoose");
const Media = require("./models/Media");

async function cleanup() {
    await mongoose.connect(process.env.MONGODB_URI);

    const ids = [
        "6ac7b614b05409cd48e0940a",
        "6ac7b731b05409cd48e0940b"
    ];

    const result = await Media.deleteMany({
        _id: { $in: ids },
        path: { $regex: "^/uploads/" }
    });

    console.log("Old local records deleted:", result.deletedCount);
    await mongoose.disconnect();
}

cleanup().catch(error => {
    console.error(error);
    process.exit(1);
});
