require("dotenv").config();
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const { User, AuditLog } = require("../models");

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existing = await User.findOne({ where: { email: "admin@sistema.com" } });
    if (existing) {
      console.log("Seed already run.");
      return;
    }

    const hash = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Administrador",
      email: "admin@sistema.com",
      password_hash: hash,
      role: "admin",
    });

    await User.create({
      name: "Operador Padrão",
      email: "operator@sistema.com",
      password_hash: hash,
      role: "operator",
    });

    await User.create({
      name: "Gestor Padrão",
      email: "manager@sistema.com",
      password_hash: hash,
      role: "manager",
    });

    await AuditLog.create({
      user_id: admin.id,
      action: "seed",
      entity: "user",
      entity_id: admin.id,
    });

    console.log("Seed complete. Users: admin@sistema.com, operator@sistema.com, manager@sistema.com (pw: admin123)");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
