const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
    extracted_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "documents",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Document;
