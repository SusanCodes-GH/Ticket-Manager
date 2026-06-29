import { db, auth, FieldValue } from '../config/firebaseAdmin.js';

export const getUsersByWorkspace = async (workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const snapshot = await db.collection('users')
    .where('workspaceId', '==', workspaceId)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (uid, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');

  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const user = { id: userDoc.id, ...userDoc.data() };

  if (user.workspaceId !== workspaceId) {
    throw new Error('User not found');
  }

  return user;
};

export const createTeamMember = async ({ name, email, password, department, createdBy, workspaceId }) => {
  if (!workspaceId) throw new Error('workspaceId is required');
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
    workspaceId: workspaceId,
    createdAt: FieldValue.serverTimestamp()
  };

  await db.collection('users').doc(userRecord.uid).set(userData);

  return { id: userRecord.uid, ...userData };
};

export const updateUser = async (uid, data, workspaceId) => {
  const existing = await getUserById(uid, workspaceId);

  const updateData = { ...data };

  delete updateData.uid;
  delete updateData.role;
  delete updateData.workspaceId;
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

export const deleteUser = async (uid, workspaceId) => {
  if (!workspaceId) throw new Error('workspaceId is required');
  const userDoc = await db.collection('users').doc(uid).get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const user = { id: userDoc.id, ...userDoc.data() };

  if (user.workspaceId !== workspaceId) {
    throw new Error('User not found');
  }

  await auth.deleteUser(uid);
  await db.collection('users').doc(uid).delete();

  return { message: 'User deleted successfully' };
};
