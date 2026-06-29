import { db, FieldValue } from '../config/firebaseAdmin.js';

const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

const logActivity = async (action, userId, ticketId, workspaceId) => {
  const activityRef = db.collection('activities').doc();
  await activityRef.set({
    activityId: activityRef.id,
    action,
    userId,
    ticketId,
    workspaceId,
    createdAt: FieldValue.serverTimestamp()
  });
};

export const getAllTickets = async (filters = {}, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  console.log('[TICKET_SVC] getAllTickets called with workspaceId:', workspaceId, 'filters:', JSON.stringify(filters));
  let query = db.collection('tickets');

  query = query.where('workspaceId', '==', workspaceId);

  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }

  if (filters.assignedTo) {
    query = query.where('assignedTo', '==', filters.assignedTo);
  }

  if (filters.priority) {
    query = query.where('priority', '==', filters.priority);
  }

  if (filters.department) {
    query = query.where('department', '==', filters.department);
  }

  const snapshot = await query.get();
  console.log('[TICKET_SVC] Query returned', snapshot.docs.length, 'tickets');
  if (snapshot.docs.length > 0) {
    console.log('[TICKET_SVC] First ticket workspaceId:', snapshot.docs[0].data().workspaceId);
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTicketsForUser = async (uid, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const [assignedSnapshot, createdSnapshot] = await Promise.all([
    db.collection('tickets')
      .where('workspaceId', '==', workspaceId)
      .where('assignedTo', '==', uid).get(),
    db.collection('tickets')
      .where('workspaceId', '==', workspaceId)
      .where('createdBy', '==', uid).get()
  ]);

  const ticketMap = new Map();

  assignedSnapshot.docs.forEach(doc => {
    ticketMap.set(doc.id, { id: doc.id, ...doc.data() });
  });

  createdSnapshot.docs.forEach(doc => {
    if (!ticketMap.has(doc.id)) {
      ticketMap.set(doc.id, { id: doc.id, ...doc.data() });
    }
  });

  return Array.from(ticketMap.values());
};

export const getUnassignedTickets = async (workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const [nullSnapshot, emptySnapshot] = await Promise.all([
    db.collection('tickets')
      .where('workspaceId', '==', workspaceId)
      .where('assignedTo', '==', null).get(),
    db.collection('tickets')
      .where('workspaceId', '==', workspaceId)
      .where('assignedTo', '==', '').get()
  ]);

  const ticketMap = new Map();

  nullSnapshot.docs.forEach(doc => {
    ticketMap.set(doc.id, { id: doc.id, ...doc.data() });
  });

  emptySnapshot.docs.forEach(doc => {
    if (!ticketMap.has(doc.id)) {
      ticketMap.set(doc.id, { id: doc.id, ...doc.data() });
    }
  });

  return Array.from(ticketMap.values());
};

export const getTicketById = async (ticketId, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');

  const ticketDoc = await db.collection('tickets').doc(ticketId).get();

  if (!ticketDoc.exists) {
    throw new Error('Ticket not found');
  }

  const ticket = { id: ticketDoc.id, ...ticketDoc.data() };

  if (ticket.workspaceId !== workspaceId) {
    throw new Error('Ticket not found');
  }

  return ticket;
};

export const createTicket = async (data, userId, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const ticketRef = db.collection('tickets').doc();
  const timestamp = FieldValue.serverTimestamp();

  const ticketData = {
    ticketId: ticketRef.id,
    title: data.title,
    description: data.description,
    createdBy: userId,
    creator: data.creator,
    assignedTo: data.assignedTo || null,
    status: 'open',
    priority: data.priority || 'medium',
    department: data.department || '',
    workspaceId,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await ticketRef.set(ticketData);

  await logActivity('ticket_created', userId, ticketRef.id, workspaceId);

  const createdDoc = await ticketRef.get();
  return { id: createdDoc.id, ...createdDoc.data() };
};

export const updateTicket = async (ticketId, data, userId, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const ticket = await getTicketById(ticketId, workspaceId);

  const updateData = { ...data };

  delete updateData.ticketId;
  delete updateData.workspaceId;
  delete updateData.createdAt;
  delete updateData.createdBy;

  updateData.updatedAt = FieldValue.serverTimestamp();

  await db.collection('tickets').doc(ticketId).update(updateData);

  await logActivity('ticket_updated', userId, ticketId, workspaceId);

  const updatedDoc = await db.collection('tickets').doc(ticketId).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

export const deleteTicket = async (ticketId, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const ticket = await getTicketById(ticketId, workspaceId);

  const commentsSnapshot = await db.collection('comments')
    .where('ticketId', '==', ticketId)
    .get();

  const activitiesSnapshot = await db.collection('activities')
    .where('ticketId', '==', ticketId)
    .get();

  const batch = db.batch();

  commentsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  activitiesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  batch.delete(db.collection('tickets').doc(ticketId));

  await batch.commit();

  return { message: 'Ticket deleted successfully' };
};

export const assignTicket = async (ticketId, assignedTo, priority, userId, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const ticket = await getTicketById(ticketId, workspaceId);

  const userDoc = await db.collection('users').doc(assignedTo).get();

  if (!userDoc.exists) {
    throw new Error('Assignee not found');
  }

  const userData = userDoc.data()

  if (userData.workspaceId !== workspaceId) {
    throw new Error('Cannot assign tickets to users outside your workspace.');
  }

  const updateData = {
    assignedTo: assignedTo,
    assignedToName: userData.name,
    updatedAt: FieldValue.serverTimestamp()
  };

  if (priority) {
    updateData.priority = priority;
  }

  await db.collection('tickets').doc(ticketId).update(updateData);

  await logActivity('ticket_assigned', userId, ticketId, workspaceId);

  const updatedDoc = await db.collection('tickets').doc(ticketId).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

export const updateStatus = async (ticketId, status, userId, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  if (!TICKET_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${TICKET_STATUSES.join(', ')}`);
  }

  const ticket = await getTicketById(ticketId, workspaceId);

  await db.collection('tickets').doc(ticketId).update({
    status,
    updatedAt: FieldValue.serverTimestamp()
  });

  await logActivity('ticket_status_changed', userId, ticketId, workspaceId);

  const updatedDoc = await db.collection('tickets').doc(ticketId).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

export const getComments = async (ticketId) => {
  const snapshot = await db.collection('comments')
    .where('ticketId', '==', ticketId)
    .orderBy('createdAt', 'asc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addComment = async (ticketId, userId, comment, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const ticket = await getTicketById(ticketId, workspaceId);

  const commentRef = db.collection('comments').doc();
  const commentData = {
    commentId: commentRef.id,
    ticketId,
    userId,
    comment,
    workspaceId,
    createdAt: FieldValue.serverTimestamp()
  };

  await commentRef.set(commentData);

  await logActivity('comment_added', userId, ticketId, workspaceId);

  const createdDoc = await commentRef.get();
  return { id: createdDoc.id, ...createdDoc.data() };
};

export const getActivities = async (ticketId) => {
  const snapshot = await db.collection('activities')
    .where('ticketId', '==', ticketId)
    .orderBy('createdAt', 'asc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
