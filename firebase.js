import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Upload a local file (uri) to Firebase Storage and return the download URL
 * @param {string} path - storage path (e.g., `profiles/{uid}.jpg`)
 * @param {string} uri - local file URI
 * @returns {Promise<string>} download URL
 */
export const uploadFile = async (path, uri) => {
  try {
    // fetch the file from local filesystem and get blob
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storageRef(storage, path);
    await uploadBytes(ref, blob);
    const url = await getDownloadURL(ref);
    return url;
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw error;
  }
};

// ===== FIRESTORE UTILITIES =====

/**
 * Get a single document by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} Document data or null if not found
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error(`Error fetching document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get all documents from a collection
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Array>} Array of documents with IDs
 */
export const getCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Add a new document to a collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Document data
 * @returns {Promise<string>} Document ID
 */
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Set/Create a document with a specific ID
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @param {boolean} merge - If true, merge with existing data
 * @returns {Promise<void>}
 */
export const setDocument = async (collectionName, docId, data, merge = false) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: new Date(),
      },
      { merge }
    );
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Fields to update
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Query documents with filters
 * @param {string} collectionName - Name of the collection
 * @param {Array} constraints - Array of Firestore constraints OR simple
 *   objects in the form { field, operator, value }
 * @returns {Promise<Array>} Matching documents
 */
export const queryDocuments = async (collectionName, constraints = []) => {
  try {
    let firestoreConstraints = [];

    // Permite dois formatos:
    // 1) constraints já prontos do Firestore (where, orderBy, limit, ...)
    // 2) objetos simples { field, operator, value }
    if (Array.isArray(constraints) && constraints.length > 0) {
      firestoreConstraints = constraints.map((c) => {
        if (
          c &&
          typeof c === "object" &&
          "field" in c &&
          "operator" in c &&
          "value" in c
        ) {
          // Converte para where(field, operator, value)
          return where(c.field, c.operator, c.value);
        }
        // Já é um constraint nativo
        return c;
      });
    }

    const baseCollection = collection(db, collectionName);
    const qRef = firestoreConstraints.length
      ? query(baseCollection, ...firestoreConstraints)
      : baseCollection;

    const querySnapshot = await getDocs(qRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    throw error;
  }
};

export default app;
