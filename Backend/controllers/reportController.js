import * as reportService from '../services/reportService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getDashboard = async (req, res) => {
  try {
    const data = await reportService.getDashboardData(req.user.workspaceId);
    return successResponse(res, data, 'Dashboard data retrieved successfully');
  } catch (error) {
    console.error('getDashboard error:', error);
    return errorResponse(res, error.message || 'Failed to load dashboard data', 500);
  }
};

export const getTicketTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const data = await reportService.getTicketTrend(days, req.user.workspaceId);
    return successResponse(res, data, 'Trend data retrieved successfully');
  } catch (error) {
    console.error('getTicketTrend error:', error);
    return errorResponse(res, error.message || 'Failed to load trend data', 500);
  }
};
