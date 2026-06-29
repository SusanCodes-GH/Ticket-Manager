import * as userService from '../services/userService.js';
import * as settingsService from '../services/settingsService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings(req.user.uid);
    return successResponse(res, settings, 'Settings retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateSettings(req.user.uid, req.body);
    return successResponse(res, settings, 'Settings updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateOwnProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    const user = await userService.updateUser(req.user.uid, { name, department }, req.user.workspaceId);
    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsersByWorkspace(req.user.workspaceId);
    return successResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id, req.user.workspaceId);
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required.', 400);
    }

    const user = await userService.createTeamMember({ name, email, password, department, createdBy: req.user.uid, workspaceId: req.user.workspaceId });
    return successResponse(res, user, 'Team member created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body, req.user.workspaceId);
    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id, req.user.workspaceId);
    return successResponse(res, result, 'User deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
