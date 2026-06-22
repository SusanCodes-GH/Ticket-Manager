import { db, FieldValue } from '../config/firebaseAdmin.js';

const DEFAULTS = {
  theme: 'system',
  emailNotifications: true,
  inAppNotifications: true,
};

export const getSettings = async (uid) => {
  const doc = await db.collection('userSettings').doc(uid).get();

  if (!doc.exists) {
    return { userId: uid, ...DEFAULTS };
  }

  return { id: doc.id, ...doc.data() };
};

export const updateSettings = async (uid, data) => {
  const allowed = ['theme', 'emailNotifications', 'inAppNotifications'];
  const updateData = { updatedAt: FieldValue.serverTimestamp() };

  for (const key of allowed) {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  }

  updateData.userId = uid;

  await db.collection('userSettings').doc(uid).set(updateData, { merge: true });

  const doc = await db.collection('userSettings').doc(uid).get();
  return { id: doc.id, ...doc.data() };
};
