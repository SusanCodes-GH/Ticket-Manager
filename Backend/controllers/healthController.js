import * as healthService from '../services/healthService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const healthCheck = async (req, res) => {
  try {
    const connected = await healthService.checkFirestore();

    if (!connected) {
      return res.status(503).json({
        success: false,
        firestore: 'disconnected'
      });
    }

    return successResponse(res, {
      firestore: 'connected',
      projectId: process.env.FIREBASE_PROJECT_ID
    }, 'System healthy');
  } catch (error) {
    return res.status(503).json({
      success: false,
      firestore: 'disconnected'
    });
  }
};
