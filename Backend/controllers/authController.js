import * as authService from '../services/authService.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required.', 400);
    }

    const user = await authService.registerAdmin({ name, email, password, department });

    sendWelcomeEmail({ name, email })
      .catch(err => console.error('[EMAIL] Welcome email failed:', err.message));

    return successResponse(res, user, 'Admin registered successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorResponse(res, 'ID token is required.', 400);
    }

    const result = await authService.login(idToken);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.uid);
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const logout = async (req, res) => {
  try {
    const result = await authService.logout();
    return successResponse(res, result, 'Logged out successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
