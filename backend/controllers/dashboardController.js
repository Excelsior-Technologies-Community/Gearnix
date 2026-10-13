const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboardService');

/**
 * GET /api/dashboard — admin dashboard statistics.
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  return success(res, { message: 'Dashboard stats', data: { stats } });
});

module.exports = { getStats };
