require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const Media = require("./models/Media");

async function backup() {
    await mongoose.connect(process.env.MONGODB_URI);

    const ids = [
        "6ac7b614b05409cd48e0940a",
        "6ac7b731b05409cd48e0940b"
    ];

    const records = await Media.find({
        _id: { $in: ids }
    }).lean();

    fs.writeFileSync(
        "old-media-backup.json",
        JSON.stringify(records, null, 2)
    );

    console.log("Backup saved:", records.length, "records");
    await mongoose.disconnect();
}

backup().catch(error => {
    console.error(error);
    process.exit(1);
});
