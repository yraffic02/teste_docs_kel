const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const XmlImport = sequelize.define(
  "XmlImport",
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
    xml_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    xml_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "xml_imports",
    timestamps: true,
    createdAt: "imported_at",
    updatedAt: false,
  }
);

module.exports = XmlImport;
