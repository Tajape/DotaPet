import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth, getDocument, setDocument, updateDocument } from "../firebase";

/**
 * Register a new user with email and password
 * @param email - User email
 * @param password - User password
 * @param displayName - User's display name
 * @returns User credential with user info
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await setDocument("users", user.uid, {
      email,
      displayName,
      uid: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  } catch (error: any) {
    throw new Error(error.message || "Error registering user");
  }
};

/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User credential with user info
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || "Error logging in");
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Error logging out");
  }
};

/**
 * Send password reset email
 * @param email - User email
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || "Error sending reset email");
  }
};

/**
 * Verify password reset code
 * @param code - Reset code from email
 * @returns User email associated with the code
 */
export const verifyResetCode = async (code: string) => {
  try {
    const email = await verifyPasswordResetCode(auth, code);
    return email;
  } catch (error: any) {
    throw new Error(error.message || "Invalid or expired code");
  }
};

/**
 * Confirm password reset with new password
 * @param code - Reset code from email
 * @param newPassword - New password
 */
export const confirmReset = async (code: string, newPassword: string) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error: any) {
    throw new Error(error.message || "Error resetting password");
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Get user profile from Firestore
 * @param uid - User ID
 */
export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDocument("users", uid);
    return userDoc;
  } catch (error: any) {
    throw new Error(error.message || "Error fetching user profile");
  }
};

/**
 * Update user profile in Firestore
 * @param uid - User ID
 * @param data - Profile data to update
 */
export const updateUserProfile = async (uid: string, data: any) => {
  try {
    await updateDocument("users", uid, data);
  } catch (error: any) {
    throw new Error(error.message || "Error updating user profile");
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Subscribe to authentication state changes
 * @param callback - Function to call when auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
