const dns = require('dns');
const mongoose = require('mongoose');

const LOOPBACK_DNS = new Set(['127.0.0.1', '::1', '[::1]']);

const usePublicDnsIfNeeded = () => {
  const servers = dns.getServers();
  const onlyLoopback =
    servers.length > 0 &&
    servers.every((server) => LOOPBACK_DNS.has(server.split('%')[0]));

  if (onlyLoopback) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('DNS fallback: using 8.8.8.8 and 1.1.1.1');
  }
};

const connectDB = async () => {
  try {
    usePublicDnsIfNeeded();
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;