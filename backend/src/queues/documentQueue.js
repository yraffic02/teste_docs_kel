const Queue = require("bull");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const documentQueue = new Queue("document-processing", redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

documentQueue.on("error", (err) => {
  console.error("Queue error:", err.message);
});

module.exports = documentQueue;
