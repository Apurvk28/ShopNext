import mongoose from "mongoose";

const connectDB = async () => {
    const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    try {
        const conn = await mongoose.connect(primaryUri, {
            serverSelectionTimeoutMS: 4000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`\n======================================================`);
        console.error(`[DATABASE WARNING] Could not connect to primary MongoDB Atlas.`);
        console.error(`Reason: ${error.message}`);
        console.error(`Tip: Check MongoDB Atlas Network Access whitelist for your current IP.`);
        console.error(`======================================================\n`);

        // If primary Atlas URI failed, fallback to local MongoDB so the application remains functional
        if (primaryUri && primaryUri.includes("mongodb+srv://")) {
            console.log("Attempting connection to local MongoDB fallback (mongodb://127.0.0.1:27017/shopnext)...");
            try {
                const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/shopnext", {
                    serverSelectionTimeoutMS: 3000,
                });
                console.log(`Connected to Local MongoDB: ${localConn.connection.host} (db: shopnext)`);
                return;
            } catch (localErr) {
                console.error("Local MongoDB fallback failed:", localErr.message);
            }
        }
        process.exit(1);
    }
};

export default connectDB;
