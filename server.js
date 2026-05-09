import dotenv from 'dotenv';
import dns from 'node:dns';
dotenv.config();

import connectDB from './src/config/db.js';
import app from './src/app.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
