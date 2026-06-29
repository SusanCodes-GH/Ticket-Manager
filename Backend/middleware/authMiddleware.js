import { auth, db } from '../config/firebaseAdmin.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return errorResponse(res, 'User not found.', 404);
    }

    const userData = userDoc.data();
    // console.log('[AUTH] Decoded token UID:', decodedToken.uid);
    // console.log('[AUTH] Firestore user doc:', JSON.stringify({ ...userData, createdAt: undefined, updatedAt: undefined }));
    // console.log('[AUTH] workspaceId from DB:', userData.workspaceId);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userData
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token.', 401);
  }
};
