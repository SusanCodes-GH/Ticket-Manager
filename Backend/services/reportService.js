import { db, FieldValue } from '../config/firebaseAdmin.js';

export const getDashboardData = async () => {
  const [ticketsSnapshot, usersSnapshot, activitiesSnapshot] = await Promise.all([
    db.collection('tickets').get(),
    db.collection('users').get(),
    db.collection('activities').orderBy('createdAt', 'desc').limit(10).get()
  ]);

  const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const activities = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const userMap = {};
  users.forEach(u => { userMap[u.uid || u.id] = u.name || u.email || 'Unknown'; });

  const totalTickets = tickets.length;
  let openTickets = 0;
  let inProgressTickets = 0;
  let resolvedTickets = 0;
  let closedTickets = 0;

  const statusCounts = {};
  const priorityCounts = {};
  const userTicketCounts = {};

  tickets.forEach(t => {
    const status = t.status ? t.status.toLowerCase() : 'open';
    const priority = t.priority ? t.priority.toLowerCase() : 'medium';

    if (status === 'open') openTickets++;
    else if (status === 'in-progress') inProgressTickets++;
    else if (status === 'resolved') resolvedTickets++;
    else if (status === 'closed') closedTickets++;

    statusCounts[status] = (statusCounts[status] || 0) + 1;
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;

    if (t.assignedTo) {
      if (!userTicketCounts[t.assignedTo]) {
        userTicketCounts[t.assignedTo] = { assigned: 0, resolved: 0, open: 0 };
      }
      userTicketCounts[t.assignedTo].assigned++;
      if (status === 'resolved' || status === 'closed') {
        userTicketCounts[t.assignedTo].resolved++;
      }
      if (status === 'open' || status === 'in-progress') {
        userTicketCounts[t.assignedTo].open++;
      }
    }
  });

  const statusDistribution = ['open', 'in-progress', 'resolved', 'closed'].map(s => ({
    status: s,
    count: statusCounts[s] || 0
  }));

  const priorityDistribution = ['low', 'medium', 'high', 'critical'].map(p => ({
    priority: p,
    count: priorityCounts[p] || 0
  }));

  const teamPerformance = Object.entries(userTicketCounts).map(([uid, counts]) => ({
    userId: uid,
    name: userMap[uid] || uid,
    assigned: counts.assigned,
    resolved: counts.resolved,
    open: counts.open,
    completionRate: counts.assigned > 0 ? Math.round((counts.resolved / counts.assigned) * 100) : 0
  }));

  teamPerformance.sort((a, b) => b.assigned - a.assigned);

  const enrichedActivitiesPromises = activities.map(async (a) => {
    let ticketTitle = '';
    try {
      const ticketDoc = await db.collection('tickets').doc(a.ticketId).get();
      if (ticketDoc.exists) {
        ticketTitle = ticketDoc.data().title || '';
      }
    } catch {
    }
    return {
      activityId: a.activityId || a.id,
      action: a.action,
      userId: a.userId,
      ticketId: a.ticketId,
      ticketTitle,
      userName: userMap[a.userId] || 'Unknown',
      createdAt: a.createdAt
    };
  });

  const recentActivities = await Promise.all(enrichedActivitiesPromises);

  const kpiCards = {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    totalTeamMembers: users.filter(u => u.role !== 'admin').length
  };

  return {
    kpiCards,
    statusDistribution,
    priorityDistribution,
    teamPerformance,
    recentActivities
  };
};

export const getTicketTrend = async (days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const snapshot = await db.collection('tickets')
    .where('createdAt', '>=', since)
    .orderBy('createdAt', 'asc')
    .get();

  const dailyCounts = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    dailyCounts[key] = 0;
  }

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.createdAt) {
      let dateStr;
      if (typeof data.createdAt === 'string') {
        dateStr = data.createdAt.split('T')[0];
      } else if (data.createdAt._seconds) {
        dateStr = new Date(data.createdAt._seconds * 1000).toISOString().split('T')[0];
      } else if (data.createdAt.toDate) {
        dateStr = data.createdAt.toDate().toISOString().split('T')[0];
      } else {
        return;
      }
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    }
  });

  return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
};
