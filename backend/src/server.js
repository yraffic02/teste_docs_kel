const app = require("./app");
const sequelize = require("./config/database");
const logger = require("./shared/logger");

const PORT = parseInt(process.env.PORT, 10) || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    logger.info("Database connected");

    await sequelize.sync();
    logger.info("Models synchronized");

    app.listen(PORT, () => {
      logger.info(`API server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err.message });
    process.exit(1);
  }
}

start();
