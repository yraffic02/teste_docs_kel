require("dotenv").config();
const sequelize = require("../config/database");
const models = require("../models");

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    await sequelize.sync({ alter: true });
    console.log("All models synchronized.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
