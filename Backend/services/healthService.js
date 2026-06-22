import { db, FieldValue } from '../config/firebaseAdmin.js';

export const checkFirestore = async () => {
  const docRef = db.collection('system_checks').doc();

  await docRef.set({
    status: 'healthy',
    timestamp: FieldValue.serverTimestamp()
  });

  const snapshot = await docRef.get();

  return snapshot.exists;
};
