const { Op, fn, col, literal } = require("sequelize");
const { Document, ExtractedPattern } = require("../models");
const { stringify } = require("csv-stringify/sync");

async function getQuantityByPeriod(startDate, endDate) {
  const where = {};
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at[Op.gte] = new Date(startDate);
    if (endDate) where.created_at[Op.lte] = new Date(endDate);
  }

  const rows = await Document.findAll({
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [fn("COUNT", col("id")), "count"],
    ],
    where,
    group: [fn("DATE", col("created_at"))],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true,
  });

  return rows;
}

async function getQuantityByStatus(startDate, endDate) {
  const where = {};
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at[Op.gte] = new Date(startDate);
    if (endDate) where.created_at[Op.lte] = new Date(endDate);
  }

  const rows = await Document.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    where,
    group: ["status"],
    raw: true,
  });

  return rows;
}

async function getQuantityByMimeType(startDate, endDate) {
  const where = {};
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at[Op.gte] = new Date(startDate);
    if (endDate) where.created_at[Op.lte] = new Date(endDate);
  }

  const rows = await Document.findAll({
    attributes: ["mime_type", [fn("COUNT", col("id")), "count"]],
    where,
    group: ["mime_type"],
    raw: true,
  });

  return rows;
}

async function getPatternStats() {
  const rows = await ExtractedPattern.findAll({
    attributes: ["type", [fn("COUNT", col("id")), "count"]],
    group: ["type"],
    raw: true,
  });

  return rows;
}

function toCsv(data) {
  if (!data || data.length === 0) return "";
  const keys = Object.keys(data[0]);
  return stringify(data, { header: true, columns: keys });
}

module.exports = {
  getQuantityByPeriod,
  getQuantityByStatus,
  getQuantityByMimeType,
  getPatternStats,
  toCsv,
};
