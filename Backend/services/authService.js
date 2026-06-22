import { db, auth, FieldValue } from '../config/firebaseAdmin.js';

export const registerAdmin = async ({ name, email, password, department }) => {
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: name
  });

  const userData = {
    uid: userRecord.uid,
    name,
    email,
    role: 'admin',
    department: department || '',
    status: 'active',
    createdAt: FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(userRecord.uid).set(userData);

  return { id: userRecord.uid, ...userData };
};

export const login = async (idToken) => {
  const decodedToken = await auth.verifyIdToken(idToken);

  const userDoc = await db.collection('users').doc(decodedToken.uid).get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const user = { id: userDoc.id, ...userDoc.data() };

  return { token: idToken, user };
};

export const getMe = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  return { id: userDoc.id, ...userDoc.data() };
};

export const logout = async () => {
  return { message: 'Logged out successfully' };
};
