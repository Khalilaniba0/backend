const mongoose = require('mongoose');
module.exports.connectToMongoDB = async () => {
    mongoose.connect(process.env.url_db , ).then(() => {
        console.log('Connected to MongoDB successfully');
    }).catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
};
