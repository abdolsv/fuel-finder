const Station = require('../models/Station');
const PriceReport = require('../models/PriceReport');

exports.listReports = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const { rows, count } = await PriceReport.findAndCountAll({
      include: [{ model: Station, attributes: ['id', 'name', 'brand', 'address'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({ total: count, limit, offset, reports: rows });
  } catch (err) {
    console.error('Error in listReports:', err);
    res.status(500).json({ error: 'Failed to fetch price reports' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await PriceReport.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Price report not found' });

    await report.destroy();
    res.json({ message: 'Price report deleted' });
  } catch (err) {
    console.error('Error in deleteReport:', err);
    res.status(500).json({ error: 'Failed to delete price report' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [stationCount, reportCount] = await Promise.all([
      Station.count(),
      PriceReport.count(),
    ]);

    const stationsWithReports = await PriceReport.aggregate('stationId', 'DISTINCT', {
      plain: false,
    });
    const stationsWithReportsCount = stationsWithReports.length;

    res.json({
      totalStations: stationCount,
      totalPriceReports: reportCount,
      stationsWithNoReports: stationCount - stationsWithReportsCount,
    });
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
