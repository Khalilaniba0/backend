const mongoose = require('mongoose');
module.exports.connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.url_db);
        console.log('Connected to MongoDB successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};
