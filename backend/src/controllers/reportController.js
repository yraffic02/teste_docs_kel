const reportService = require("../services/reportService");
const xlsxService = require("../services/xlsxService");
const redis = require("../config/redis");

const CACHE_TTL = 300;

async function getCachedOrFetch(cacheKey, fetchFn) {
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  const data = await fetchFn();
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
  return data;
}

async function byPeriod(req, res, next) {
  try {
    const { startDate, endDate, format } = req.query;
    const cacheKey = `report:period:${startDate || ""}:${endDate || ""}`;
    const data = await getCachedOrFetch(cacheKey, () =>
      reportService.getQuantityByPeriod(startDate, endDate)
    );
    sendReport(res, data, format);
  } catch (err) {
    next(err);
  }
}

async function byStatus(req, res, next) {
  try {
    const { startDate, endDate, format } = req.query;
    const cacheKey = `report:status:${startDate || ""}:${endDate || ""}`;
    const data = await getCachedOrFetch(cacheKey, () =>
      reportService.getQuantityByStatus(startDate, endDate)
    );
    sendReport(res, data, format);
  } catch (err) {
    next(err);
  }
}

async function byMimeType(req, res, next) {
  try {
    const { startDate, endDate, format } = req.query;
    const cacheKey = `report:mime:${startDate || ""}:${endDate || ""}`;
    const data = await getCachedOrFetch(cacheKey, () =>
      reportService.getQuantityByMimeType(startDate, endDate)
    );
    sendReport(res, data, format);
  } catch (err) {
    next(err);
  }
}

async function patterns(req, res, next) {
  try {
    const cacheKey = "report:patterns";
    const data = await getCachedOrFetch(cacheKey, () =>
      reportService.getPatternStats()
    );
    sendReport(res, data, req.query.format);
  } catch (err) {
    next(err);
  }
}

function sendReport(res, data, format) {
  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=report.csv");
    return res.send(reportService.toCsv(data));
  }
  if (format === "xlsx") {
    const buffer = xlsxService.generateReport(data);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
    return res.send(buffer);
  }
  res.json(data);
}

module.exports = { byPeriod, byStatus, byMimeType, patterns };
