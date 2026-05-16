module.exports = {
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_in_prod",
  jwtExpiresIn: "8h",
  roles: ["operator", "manager", "admin"],
};
