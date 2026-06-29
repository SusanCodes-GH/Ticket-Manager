import * as ticketService from '../services/ticketService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getTickets = async (req, res) => {
  try {
    // console.log('[TICKET_CTRL] getTickets called. Role:', req.user.role, 'workspaceId:', req.user.workspaceId);
    // console.log('[TICKET_CTRL] Query params:', JSON.stringify(req.query));

    if (req.user.role === 'team') {
      const tickets = await ticketService.getTicketsForUser(req.user.uid, req.user.workspaceId);
      // console.log('[TICKET_CTRL] getTicketsForUser returned', tickets.length, 'tickets');
      return successResponse(res, tickets, 'Tickets retrieved successfully');
    }

    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.department) filters.department = req.query.department;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;

    const tickets = await ticketService.getAllTickets(filters, req.user.workspaceId);
    // console.log('[TICKET_CTRL] getAllTickets returned', tickets.length, 'tickets');
    return successResponse(res, tickets, 'Tickets retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getUnassignedTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getUnassignedTickets(req.user.workspaceId);
    const enriched = tickets.map(ticket => ({
      id: ticket.ticketId || ticket.id,
      title: ticket.title,
      reporterName: '',
      reporterId: ticket.createdBy,
      department: ticket.department,
      priority: ticket.priority,
      createdAt: ticket.createdAt
    }));
    return successResponse(res, enriched, 'Unassigned tickets retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await ticketService.getTicketById(id, req.user.workspaceId);

    if (req.user.role === 'team' && ticket.assignedTo !== req.user.uid && ticket.createdBy !== req.user.uid) {
      return errorResponse(res, 'Access denied. You can only view your assigned or created tickets.', 403);
    }

    const comments = await ticketService.getComments(id);
    const activities = await ticketService.getActivities(id);

    return successResponse(res, { ...ticket, comments, activities }, 'Ticket retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return errorResponse(res, 'Title and description are required.', 400);
    }

    const ticket = await ticketService.createTicket(req.body, req.user.uid, req.user.workspaceId);
    return successResponse(res, ticket, 'Ticket created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'team') {
      const existing = await ticketService.getTicketById(id, req.user.workspaceId);

      if (existing.assignedTo !== req.user.uid && existing.createdBy !== req.user.uid) {
        return errorResponse(res, 'Access denied. You can only edit your assigned or created tickets.', 403);
      }

      const allowedFields = {};
      if (req.body.status) allowedFields.status = req.body.status;

      const ticket = await ticketService.updateTicket(id, allowedFields, req.user.uid, req.user.workspaceId);
      return successResponse(res, ticket, 'Ticket updated successfully');
    }

    const ticket = await ticketService.updateTicket(id, req.body, req.user.uid, req.user.workspaceId);
    return successResponse(res, ticket, 'Ticket updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ticketService.deleteTicket(id, req.user.workspaceId);
    return successResponse(res, result, 'Ticket deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, priority } = req.body;

    if (!assignedTo) {
      return errorResponse(res, 'AssignedTo (UID) is required.', 400);
    }

    const ticket = await ticketService.assignTicket(id, assignedTo, priority, req.user.uid, req.user.workspaceId);
    return successResponse(res, ticket, 'Ticket assigned successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required.', 400);
    }

    if (req.user.role === 'team') {
      const existing = await ticketService.getTicketById(id, req.user.workspaceId);

      if (existing.assignedTo !== req.user.uid && existing.createdBy !== req.user.uid) {
        return errorResponse(res, 'Access denied. You can only update your assigned or created tickets.', 403);
      }
    }

    const ticket = await ticketService.updateStatus(id, status, req.user.uid, req.user.workspaceId);
    return successResponse(res, ticket, 'Ticket status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return errorResponse(res, 'Comment text is required.', 400);
    }

    if (req.user.role === 'team') {
      const existing = await ticketService.getTicketById(id, req.user.workspaceId);

      if (existing.assignedTo !== req.user.uid && existing.createdBy !== req.user.uid) {
        return errorResponse(res, 'Access denied. You can only comment on your assigned or created tickets.', 403);
      }
    }

    const result = await ticketService.addComment(id, req.user.uid, comment, req.user.workspaceId);
    return successResponse(res, result, 'Comment added successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getTicketComments = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await ticketService.getTicketById(id, req.user.workspaceId);

    if (req.user.role === 'team' && ticket.assignedTo !== req.user.uid && ticket.createdBy !== req.user.uid) {
      return errorResponse(res, 'Access denied.', 403);
    }

    const comments = await ticketService.getComments(id);
    return successResponse(res, comments, 'Comments retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};
