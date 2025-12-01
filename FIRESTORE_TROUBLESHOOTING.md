# 🧪 Firestore Troubleshooting Guide

## ❌ Common Issues & Solutions

---

## 1. **"Permission denied" Error**

### ❌ Error Message:
```
FirebaseError: Missing or insufficient permissions.
```

### 🔍 Cause:
- Firestore security rules not published
- User not authenticated
- Rules don't match the operation

### ✅ Solution:

**Step 1**: Check Firestore Rules
```
Go to Firebase Console → Firestore → Rules
```

**Step 2**: Publish Correct Rules
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /pets/{petId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.ownerId;
    }
  }
}
```

**Step 3**: Click "Publish"

✅ Try again!

---

## 2. **User Not Authenticated**

### ❌ Error Message:
```
Error: User not authenticated
```

### 🔍 Cause:
- `getCurrentUser()` returns null
- User session expired
- App restarted before saving auth state

### ✅ Solution:

**Check Current User:**
```typescript
import { getCurrentUser } from '../services/authService';

const user = getCurrentUser();
console.log('Current user:', user);

if (!user) {
  console.log('User not authenticated!');
  // Redirect to login
}
```

**Save Auth State Persistently:**
```typescript
// App will automatically persist auth state
// Just ensure useAuth hook is used in root layout

import { useAuth } from './hooks/useAuth';

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  // Auth state will persist across app restarts
}
```

✅ Auth state persists automatically!

---

## 3. **Collections Don't Exist**

### ❌ Error Message:
```
Collection not showing in Firebase Console
```

### 🔍 Cause:
- Collection auto-creates on first document
- Data hasn't been saved yet
- Wrong collection name

### ✅ Solution:

**Collections auto-create when:**
```typescript
// 1. User registers
await registerUser(email, password, name);
// → Creates: users/{userId}

// 2. Pet is registered
await addDocument('pets', petData);
// → Creates: pets/{petId}
```

**Check Console:**
```
1. Register a user in the app
2. Go to Firebase Console → Firestore
3. collections should appear automatically
```

✅ Collections auto-create!

---

## 4. **Data Not Saving to Firestore**

### ❌ Problem:
```
Data seems to save but doesn't appear in Firestore
```

### 🔍 Cause:
- Async operation not awaited
- Function failed silently
- Wrong collection/document name

### ✅ Solution:

**Always Await:**
```typescript
// ❌ WRONG - doesn't wait
addDocument('pets', petData);
router.replace('/homeScreen');

// ✅ CORRECT - waits for save
await addDocument('pets', petData);
router.replace('/homeScreen');
```

**Check Error:**
```typescript
try {
  const petId = await addDocument('pets', {
    ownerId: user.uid,
    name: 'Fluffy',
  });
  console.log('✅ Saved with ID:', petId);
} catch (error) {
  console.error('❌ Error:', error.message);
  Alert.alert('Error', error.message);
}
```

**Verify in Console:**
```
1. Try the operation
2. Check browser console for errors
3. Go to Firebase Console → Firestore
4. Look for the document
```

✅ Add error handling!

---

## 5. **Query Returns No Results**

### ❌ Problem:
```
queryDocuments() returns empty array
```

### 🔍 Cause:
- Wrong field name in where clause
- Wrong value in where clause
- Data not saved with that field

### ✅ Solution:

**Check Field Names:**
```typescript
// ❌ WRONG - typo in field name
const pets = await queryDocuments('pets', [
  where('ownerID', '==', user.uid)  // Should be 'ownerId'
]);

// ✅ CORRECT
const pets = await queryDocuments('pets', [
  where('ownerId', '==', user.uid)
]);
```

**Verify Data Structure:**
```
Go to Firebase Console → Firestore → pets
Click on a document and check field names match exactly
```

**Debug Query:**
```typescript
const user = getCurrentUser();
console.log('Current user ID:', user?.uid);

const pets = await queryDocuments('pets', [
  where('ownerId', '==', user.uid)
]);
console.log('Pets found:', pets.length);
console.log('Pets data:', pets);
```

✅ Check field names!

---

## 6. **Authentication Fails**

### ❌ Error Message:
```
Error logging in
Error registering
```

### 🔍 Common Causes:
- Invalid email format
- Password too short (< 6 chars)
- User already exists
- Firebase Auth not enabled

### ✅ Solution:

**Check Firebase Auth:**
```
1. Go to Firebase Console
2. Click "Authentication"
3. Enable "Email/Password" provider
```

**Validate Before Submit:**
```typescript
const handleRegister = async () => {
  // ✅ Check email format
  if (!email.includes('@')) {
    Alert.alert('Invalid email');
    return;
  }

  // ✅ Check password length
  if (password.length < 6) {
    Alert.alert('Password must be at least 6 characters');
    return;
  }

  // ✅ Check passwords match
  if (password !== confirmPassword) {
    Alert.alert('Passwords do not match');
    return;
  }

  try {
    await registerUser(email, password, displayName);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
```

**Common Firebase Errors:**
```typescript
try {
  await loginUser(email, password);
} catch (error: any) {
  if (error.message.includes('user-not-found')) {
    Alert.alert('User not found');
  } else if (error.message.includes('wrong-password')) {
    Alert.alert('Wrong password');
  } else if (error.message.includes('invalid-email')) {
    Alert.alert('Invalid email');
  } else {
    Alert.alert('Error', error.message);
  }
}
```

✅ Validate before submit!

---

## 7. **Timestamps Issues**

### ❌ Problem:
```
createdAt and updatedAt showing wrong format
```

### 🔍 Cause:
- JavaScript Date vs Firestore Timestamp
- Timezone differences
- Old data without timestamps

### ✅ Solution:

**Firestore Auto-Adds Timestamps:**
```typescript
// ✅ AUTOMATIC - firebase.js adds these
const petId = await addDocument('pets', {
  name: 'Fluffy',
  // firebase.js automatically adds:
  // - createdAt: new Date()
  // - updatedAt: new Date()
});
```

**Read Timestamps:**
```typescript
const pet = await getDocument('pets', petId);
console.log('Created:', pet.createdAt.toDate()); // Convert to JS Date
console.log('Updated:', pet.updatedAt.toDate());
```

**Display Formatted:**
```typescript
const formatDate = (timestamp: any) => {
  return timestamp?.toDate?.()?.toLocaleDateString() || 'N/A';
};

<Text>{formatDate(pet.createdAt)}</Text>
```

✅ Timestamps auto-handled!

---

## 8. **Images/Files Not Saving**

### ❌ Problem:
```
Image URLs not saving to Firestore
```

### 🔍 Cause:
- Firebase Storage not configured
- Just storing local file paths
- Missing Firebase Storage integration

### ✅ Solution:

**Current Implementation (Local Paths):**
```typescript
// Currently stores local file paths
const petId = await addDocument('pets', {
  images: ['/path/to/local/image.jpg']
});
```

**To Use Firebase Storage (Future):**
```typescript
// Step 1: Upload to Firebase Storage
const uploadImage = async (imageUri: string) => {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  const ref = ref(storage, `images/${Date.now()}`);
  await uploadBytes(ref, blob);
  
  const url = await getDownloadURL(ref);
  return url; // ✅ Returns public URL
};

// Step 2: Save URL to Firestore
const imageUrl = await uploadImage(imageUri);
await addDocument('pets', {
  images: [imageUrl]
});
```

For now, images save as local paths. Implement Firebase Storage later!

---

## 9. **Real-time Updates Not Working**

### ❌ Problem:
```
Changes in Firestore don't reflect in app immediately
```

### 🔍 Cause:
- Not using onSnapshot listener
- Only using single fetch queries
- Listener not set up correctly

### ✅ Solution:

**Current Implementation (Manual Refresh):**
```typescript
// Fetches once when screen opens
useEffect(() => {
  const loadPets = async () => {
    const pets = await queryDocuments('pets', [
      where('ownerId', '==', user.uid)
    ]);
    setUserPets(pets);
  };
  loadPets();
}, []);
```

**To Enable Real-time (Future):**
```typescript
import { onSnapshot, query, collection, where } from 'firebase/firestore';

useEffect(() => {
  const q = query(
    collection(db, 'pets'),
    where('ownerId', '==', user.uid)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const pets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUserPets(pets);
  });
  
  return () => unsubscribe();
}, [user.uid]);
```

Real-time updates require onSnapshot. Manual refresh works for now!

---

## 10. **Offline Functionality Issues**

### ❌ Problem:
```
App stops working when offline
```

### 🔍 Cause:
- No offline persistence configured
- Network request fails without error handling
- Firestore not enabled for offline

### ✅ Solution:

**Add Error Handling:**
```typescript
const loadPets = async () => {
  try {
    const pets = await queryDocuments('pets', [
      where('ownerId', '==', user.uid)
    ]);
    setUserPets(pets);
  } catch (error) {
    if (error.code === 'failed-precondition') {
      Alert.alert('Offline', 'No internet connection');
    } else {
      Alert.alert('Error', 'Failed to load pets');
    }
  }
};
```

**Enable Offline Persistence (Firebase SDK config):**
```typescript
// In firebase.js
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .catch(err => {
    if (err.code == 'failed-precondition') {
      console.log('Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.log('Browser not supported');
    }
  });
```

✅ Add offline support!

---

## 🔍 Debugging Checklist

### Before asking for help:

- [ ] Check Firebase Console → Firestore → Data exists?
- [ ] Check Firebase Console → Authentication → User exists?
- [ ] Check browser console → Any error messages?
- [ ] Check Firestore Rules → Are they published?
- [ ] Check field names → Exact match with code?
- [ ] Check user.uid → Is getCurrentUser() returning user?
- [ ] Check network → Is internet connection working?
- [ ] Check async/await → Are operations awaited?

---

## 📋 Testing Procedures

### 1. **Test Registration**
```
1. Open app → Click Register
2. Fill email, password (min 6 chars), name
3. Click Register
4. Check Firebase Console → Authentication
5. New user should appear ✅
6. Check Firestore → users collection
7. New document should exist ✅
```

### 2. **Test Login**
```
1. Open app → Click Login
2. Use registered email/password
3. Should redirect to home screen ✅
4. Check auth state in browser console
5. getCurrentUser() should return user ✅
```

### 3. **Test Pet Registration**
```
1. After login → Go to Register Pet
2. Fill all fields
3. Click Register
4. Check Firestore → pets collection
5. New pet should have ownerId field ✅
6. Go to home screen
7. Your pet should appear in list ✅
```

### 4. **Test Security Rules**
```
1. Get User A's token
2. Try to update User B's profile
3. Should get "Permission denied" ✅
4. Try to update own profile
5. Should succeed ✅
```

---

## 📞 Getting Help

If you encounter an issue:

1. **Check the error message** - Very specific
2. **Look in this guide** - Most common issues covered
3. **Check browser console** - F12 → Console tab
4. **Check Firebase Console** - Verify data exists
5. **Add console.log()** - Debug step by step

---

## 🎯 Quick Fixes

```typescript
// 1. User not found?
if (!getCurrentUser()) {
  router.replace('/welcome');
}

// 2. Data not saving?
try {
  await addDocument(...);
  Alert.alert('Success', 'Saved!');
} catch (error) {
  Alert.alert('Error', error.message);
}

// 3. Query empty?
console.log('User ID:', getCurrentUser()?.uid);
console.log('Results:', await queryDocuments(...));

// 4. Auth failing?
// Check email format and password length

// 5. Permission denied?
// Check Firestore Rules are published
```

---

**Most issues are resolved by checking the error message and Firestore Rules!** 🔧
