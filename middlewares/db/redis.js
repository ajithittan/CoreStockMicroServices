const redis = require('redis');

require('dotenv').config()

console.log("process.env.REDIS_SESSION_STORE}",process.env.REDIS_SESSION_STORE)
const redisClient = redis.createClient({url: process.env.REDIS_SESSION_STORE});

module.exports = redisClient;