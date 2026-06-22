import { db, FieldValue } from '../config/firebaseAdmin.js';

const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

const logActivity = async (action, userId, ticketId) => {
  const activityRef = db.collection('activities').doc();
  await activityRef.set({
    activityId: activityRef.id,
    action,
    userId,
    ticketId,
    createdAt: FieldValue.serverTimestamp()
  });
};

export const getAllTickets = async (filters = {}) => {
  let query = db.collection('tickets');

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
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTicketsForUser = async (uid) => {
  const [assignedSnapshot, createdSnapshot] = await Promise.all([
    db.collection('tickets').where('assignedTo', '==', uid).get(),
    db.collection('tickets').where('createdBy', '==', uid).get()
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

export const getUnassignedTickets = async () => {
  const [nullSnapshot, emptySnapshot] = await Promise.all([
    db.collection('tickets').where('assignedTo', '==', null).get(),
    db.collection('tickets').where('assignedTo', '==', '').get()
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

export const getTicketById = async (ticketId) => {
  const ticketDoc = await db.collection('tickets').doc(ticketId).get();

  if (!ticketDoc.exists) {
    throw new Error('Ticket not found');
  }

  return { id: ticketDoc.id, ...ticketDoc.data() };
};

export const createTicket = async (data, userId) => {
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
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await ticketRef.set(ticketData);

  await logActivity('ticket_created', userId, ticketRef.id);

  const createdDoc = await ticketRef.get();
  return { id: createdDoc.id, ...createdDoc.data() };
};

export const updateTicket = async (ticketId, data, userId) => {
  const ticketDoc = await db.collection('tickets').doc(ticketId).get();

  if (!ticketDoc.exists) {
    throw new Error('Ticket not found');
  }

  const updateData = { ...data };

  delete updateData.ticketId;
  delete updateData.createdAt;
  delete updateData.createdBy;

  updateData.updatedAt = FieldValue.serverTimestamp();

  await db.collection('tickets').doc(ticketId).update(updateData);

  await logActivity('ticket_updated', userId, ticketId);

  const updatedDoc = await db.collection('tickets').doc(ticketId).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

export const deleteTicket = async (ticketId) => {
  const ticketDoc = await db.collection('tickets').doc(ticketId).get();

  if (!ticketDoc.exists) {
    throw new Error('Ticket not found');
  }

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

export const assignTicket = async (ticketId, assignedTo, priority, userId) => {
  const ticketDoc = await db.collection('tickets').doc(ticketId).get();

  if (!ticketDoc.exists) {
    throw new Error('Ticket not found');
  }

  const userDoc = await db.collection('users').doc(assignedTo).get();

  if (!userDoc.exists) {
    throw new Error('Assignee not found');
  }

  const userData = userDoc.data()

  const updateData = {
    assignedTo: assignedTo,
    assignedToName: userData.name,
    updatedAt: FieldValue.serverTimestamp()
  };

  if (priority) {
    updateData.priority = priority;
  }

  await db.collection('tickets').doc(ticketId).update(updateData);

  await logActivity('ticket_assigned', userId, ticketId);

  const updatedDoc = await db.collection('tickets').doc(ticketId).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

export const updateStatus = async (ticketId, status, userId) => {
  if (!TICKET_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${TICKET_STATUSES.join(', ')}`);
  }

  const ticketDoc = await db.collection('tickets').doc(ticketId).get();

  if (!ticketDoc.exists) {
    throw new Error('Ticket not found');
  }

  await db.collection('tickets').doc(ticketId).update({
    status,
    updatedAt: FieldValue.serverTimestamp()
  });

  await logActivity('ticket_status_changed', userId, ticketId);

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

export const addComment = async (ticketId, userId, comment) => {
  const ticketDoc = await db.collection('tickets').doc(ticketId).get();

  if (!ticketDoc.exists) {
    throw new Error('Ticket not found');
  }

  const commentRef = db.collection('comments').doc();
  const commentData = {
    commentId: commentRef.id,
    ticketId,
    userId,
    comment,
    createdAt: FieldValue.serverTimestamp()
  };

  await commentRef.set(commentData);

  await logActivity('comment_added', userId, ticketId);

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
