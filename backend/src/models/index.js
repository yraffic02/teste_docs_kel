const User = require("./User");
const Document = require("./Document");
const ExtractedPattern = require("./ExtractedPattern");
const XmlImport = require("./XmlImport");
const AuditLog = require("./AuditLog");

Document.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(Document, { foreignKey: "created_by", as: "documents" });

ExtractedPattern.belongsTo(Document, { foreignKey: "document_id", as: "document" });
Document.hasMany(ExtractedPattern, { foreignKey: "document_id", as: "extracted_patterns" });

XmlImport.belongsTo(Document, { foreignKey: "document_id", as: "document" });
Document.hasOne(XmlImport, { foreignKey: "document_id", as: "xml_import" });

AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = { User, Document, ExtractedPattern, XmlImport, AuditLog };
