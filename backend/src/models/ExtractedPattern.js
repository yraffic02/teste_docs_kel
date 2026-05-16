const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ExtractedPattern = sequelize.define(
  "ExtractedPattern",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    document_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("cpf", "cnpj", "currency", "date", "name", "client", "value", "total_value"),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "extracted_patterns",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = ExtractedPattern;
