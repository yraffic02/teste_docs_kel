const bcrypt = require("bcryptjs");
const { User } = require("../models");

async function list(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["created_at", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha obrigatórios" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password_hash,
      role: role || "operator",
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    await user.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
