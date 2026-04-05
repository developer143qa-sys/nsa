const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // clean, no deprecated options
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ Initial MongoDB connection failed:', err.message);
    // Retry after 5 seconds instead of exiting immediately
    setTimeout(connectDB, 5000);
  }
};

// Log ongoing connection errors
mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

// Log disconnections
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

// Close connection gracefully on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB connected successfully');
//   } catch (err) {
//     console.error('❌ Initial MongoDB connection failed:', err.message);
//     console.log('⏳ Retrying in 5 seconds...');
//     setTimeout(connectDB, 5000); // Retry every 5 seconds
//   }
// };

// // Listen for connection errors
// mongoose.connection.on('error', (err) => {
//   console.error(`❌ MongoDB connection error: ${err.message}`);
// });

// // Listen for disconnection
// mongoose.connection.on('disconnected', () => {
//   console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
// });

// // Close connection gracefully on app termination
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   console.log('MongoDB connection closed due to app termination');
//   process.exit(0);
// });

// module.exports = connectDB;