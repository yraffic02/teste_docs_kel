require("dotenv").config();
const sequelize = require("./config/database");
const logger = require("./shared/logger");

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info("Worker: Database connected");

    require("./workers/documentWorker");
    logger.info("Worker listening for jobs");
  } catch (err) {
    logger.error("Worker failed to start", { error: err.message });
    process.exit(1);
  }
}

start();
