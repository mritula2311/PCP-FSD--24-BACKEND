import mongoose from 'mongoose';
import dns from 'node:dns';

// Some local resolvers (VPN/proxy/warp) fail SRV lookups used by mongodb+srv.
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('Missing DATABASE_URL or MONGO_URI environment variable');
    }

    let conn;
    try {
      conn = await mongoose.connect(mongoUri);
    } catch (firstError) {
      const isSrvDnsError =
        typeof firstError?.message === 'string' &&
        firstError.message.toLowerCase().includes('querysrv');

      if (!isSrvDnsError) {
        throw firstError;
      }

      console.warn('SRV DNS lookup failed. Retrying MongoDB connection once...');
      conn = await mongoose.connect(mongoUri);
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
