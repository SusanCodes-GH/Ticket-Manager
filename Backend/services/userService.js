import { db, auth, FieldValue } from '../config/firebaseAdmin.js';

export const getUsersByCreator = async (adminUid) => {
  const snapshot = await db.collection('users')
    .where('createdBy', '==', adminUid)
    .get();

  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const adminDoc = await db.collection('users').doc(adminUid).get();
  if (adminDoc.exists) {
    users.push({ id: adminDoc.id, ...adminDoc.data() });
  }

  return users;
};

export const getUserById = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  return { id: userDoc.id, ...userDoc.data() };
};

export const createTeamMember = async ({ name, email, password, department, createdBy }) => {
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: name
  });

  const userData = {
    uid: userRecord.uid,
    name,
    email,
    role: 'team',
    department: department || '',
    status: 'active',
    createdBy: createdBy || null,
    createdAt: FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(userRecord.uid).set(userData);

  return { id: userRecord.uid, ...userData };
};

export const updateUser = async (uid, data) => {
  const updateData = { ...data };

  delete updateData.uid;
  delete updateData.role;
  delete updateData.createdAt;

  if (updateData.email) {
    await auth.updateUser(uid, { email: updateData.email });
  }

  if (updateData.name) {
    await auth.updateUser(uid, { displayName: updateData.name });
  }

  await db.collection('users').doc(uid).update(updateData);

  const updatedDoc = await db.collection('users').doc(uid).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

export const deleteUser = async (uid) => {
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  await auth.deleteUser(uid);
  await db.collection('users').doc(uid).delete();

  return { message: 'User deleted successfully' };
};
