const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // agar older mongoose version ho toh (ab default hai)
      // useFindAndModify: false, // deprecated in recent versions
    });

    console.log('✅ MongoDB connection is open');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};

// Listen for ongoing connection errors after initial connection
  mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

// Listen for disconnection event and attempt reconnect
    mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
  // Mongoose will automatically try to reconnect with useUnifiedTopology:true
});

process.on('SIGINT', async () => {
  // Close MongoDB connection gracefully on app termination (Ctrl+C)
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

                 module.exports = connectDB;
