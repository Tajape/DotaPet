# 🏗️ Firestore Architecture & Data Flow Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DotaPet Mobile App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UI Screens                                                      │
│  ├── register.tsx ────────────────────────┐                 │
│  ├── login.tsx ────────────────────────┐  │                 │
│  ├── user-profile.tsx ──────────────────┼──┼──┐              │
│  ├── register-pet.tsx ──────────────────┼──┼──┤              │
│  ├── homeScreen.tsx ────────────────────┼──┼──┤              │
│  └── forgot-password.tsx ──────────────┐│  │  │              │
│                                         ││  │  │              │
│  Services                               ││  │  │              │
│  ├── authService.ts ◄────────┐          ││  │  │              │
│  │   ├── registerUser() ──────┼──┐      ││  │  │              │
│  │   ├── loginUser() ─────────┼──┼─┐    ││  │  │              │
│  │   └── resetPassword() ─────┼──┼─┼───┐││  │  │              │
│  │                             │  │ │   │││  │  │              │
│  └── firebase.js ◄────────────┘  │ │   │││  │  │              │
│      ├── addDocument() ──────────┼─┼───┼┼┼──┼──┼──┘              │
│      ├── getDocument() ──────────┼─┼───┼┼┼──┼──┘                 │
│      ├── updateDocument() ───────┼─┼───┼┼┼──┘                    │
│      ├── deleteDocument() ───────┼─┼───┼┼┘                       │
│      └── queryDocuments() ───────┼─┼───┼┘                        │
│                                  │ │   │                        │
│  Firebase SDK                    │ │   │                        │
│  ├── Auth ◄──────────────────────┘ │   │                        │
│  │   ├── createUserWithEmailAndPassword()                       │
│  │   ├── signInWithEmailAndPassword()                           │
│  │   └── sendPasswordResetEmail()                               │
│  │                                  │   │                        │
│  └── Firestore ◄──────────────────────┘   │                     │
│      ├── Collection Management             │                     │
│      └── Document Operations               │                     │
│                                            │                     │
└─────────────────────────────────────────────┼─────────────────────┘
                                              │
                      ┌───────────────────────┘
                      │
                      ▼
            ┌──────────────────────┐
            │   Firebase Console   │
            ├──────────────────────┤
            │                      │
            │  Authentication:     │
            │  ├── User accounts   │
            │  └── Auth tokens     │
            │                      │
            │  Firestore Database: │
            │  ├── users/          │
            │  ├── pets/           │
            │  └── adoptions/      │
            │                      │
            │  Rules & Policies    │
            └──────────────────────┘
```

---

## 📊 Data Flow: User Registration

```
┌──────────────────────────────────────────────────────────────────┐
│ USER REGISTRATION FLOW                                           │
└──────────────────────────────────────────────────────────────────┘

    register.tsx
    │
    │ User fills form:
    │ ├── email
    │ ├── password
    │ └── name
    │
    ▼
    handleRegister()
    │
    ▼
    registerUser(email, password, name)
    │  ┌─ authService.ts
    │  │
    │  ├─► 1. createUserWithEmailAndPassword()
    │  │      │
    │  │      └─► Firebase Auth
    │  │          ├── Validates credentials
    │  │          └── Creates auth user
    │  │
    │  ├─► 2. updateProfile(user, { displayName })
    │  │      │
    │  │      └─► Sets display name in Auth
    │  │
    │  ├─► 3. setDocument('users', uid, userData)
    │  │      │
    │  │      ├─ firebase.js
    │  │      │
    │  │      └─► Firestore
    │  │          └── CREATE users/{userId}
    │  │              ├── email: "..."
    │  │              ├── displayName: "..."
    │  │              ├── uid: "..."
    │  │              ├── createdAt: timestamp
    │  │              └── updatedAt: timestamp
    │  │
    │  └─► Returns user object
    │
    ▼
    Alert: "Success!"
    │
    ▼
    router.replace('/user-profile')
    
✅ User created in both Firebase Auth AND Firestore!
```

---

## 📊 Data Flow: Update User Profile

```
┌──────────────────────────────────────────────────────────────────┐
│ USER PROFILE UPDATE FLOW                                         │
└──────────────────────────────────────────────────────────────────┘

    user-profile.tsx
    │
    │ User fills form:
    │ ├── username
    │ ├── phone
    │ ├── location
    │ └── profileImage
    │
    ▼
    handleAddProfile()
    │
    ├─► 1. getCurrentUser()
    │      └─► Get current user ID from Auth
    │
    ▼
    2. updateDocument('users', userId, profileData)
    │  ┌─ firebase.js
    │  │
    │  └─► Firestore
    │      └── UPDATE users/{userId}
    │          ├── username: "..."
    │          ├── phone: "..."
    │          ├── location: "..."
    │          ├── profileImage: "..."
    │          └── updatedAt: timestamp
    │
    ▼
    Alert: "Profile updated!"
    │
    ▼
    router.replace('/homeScreen')

✅ User profile updated in Firestore!
```

---

## 📊 Data Flow: Register Pet

```
┌──────────────────────────────────────────────────────────────────┐
│ PET REGISTRATION FLOW                                            │
└──────────────────────────────────────────────────────────────────┘

    register-pet.tsx
    │
    │ User fills form:
    │ ├── name
    │ ├── breed
    │ ├── age
    │ ├── gender
    │ ├── size
    │ ├── images
    │ └── description
    │
    ▼
    handleSubmit()
    │
    ├─► 1. getCurrentUser()
    │      └─► Get current user ID from Auth
    │
    ▼
    2. addDocument('pets', petData)
    │  ┌─ firebase.js
    │  │
    │  └─► Firestore
    │      └── CREATE pets/{auto-generated-id}
    │          ├── ownerId: "{userId}"  ◄── LINKS TO USER!
    │          ├── name: "..."
    │          ├── breed: "..."
    │          ├── age: number
    │          ├── gender: "..."
    │          ├── size: "..."
    │          ├── images: [...]
    │          ├── description: "..."
    │          ├── createdAt: timestamp
    │          └── updatedAt: timestamp
    │
    ▼
    Alert: "Pet registered!"
    │
    ▼
    router.replace('/homeScreen')

✅ Pet created in Firestore linked to current user!
```

---

## 📊 Data Flow: View User's Pets

```
┌──────────────────────────────────────────────────────────────────┐
│ VIEW PETS FLOW (HOME SCREEN)                                     │
└──────────────────────────────────────────────────────────────────┘

    homeScreen.tsx
    │
    │ useEffect(() => {
    │   loadPets()
    │ }, [])
    │
    ▼
    loadPets()
    │
    ├─► 1. getCurrentUser()
    │      └─► Get current user ID from Auth
    │
    ▼
    2. queryDocuments('pets', [where('ownerId', '==', userId)])
    │  ┌─ firebase.js
    │  │
    │  └─► Firestore Query
    │      ├── FROM: pets collection
    │      ├── WHERE: ownerId == "{current-user-id}"
    │      └── RETURNS: Only pets owned by current user!
    │
    ▼
    Firestore Response:
    │
    ├── pets/{petId1}
    │  ├── ownerId: "{userId}" ✅ MATCH!
    │  ├── name: "Fluffy"
    │  └── ...
    │
    ├── pets/{petId2}
    │  ├── ownerId: "{userId}" ✅ MATCH!
    │  ├── name: "Buddy"
    │  └── ...
    │
    └── [OTHER PETS IGNORED - different ownerId]
    │
    ▼
    setUserPets(pets)
    │
    ▼
    Render: {userPets.map(pet => <PetCard pet={pet} />)}

✅ Only current user's pets displayed!
```

---

## 🔐 Security Rules Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ FIRESTORE SECURITY RULES                                         │
└──────────────────────────────────────────────────────────────────┘

User Action → Firebase Request → Firestore Rules → Allow/Deny
              includes auth token

Example: User tries to update another user's profile

User A tries:
  updateDocument('users', 'USER_B_ID', data)
       │
       ▼
  Firebase sends:
    POST /firestore/update
    {
      collection: 'users',
      docId: 'USER_B_ID',
      auth: { uid: 'USER_A_ID' }
    }
       │
       ▼
  Firestore checks rules:
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
                            └─► USER_A_ID == USER_B_ID?
                                NO! ❌ DENY
    }
       │
       ▼
  Result: Permission denied ❌

User A tries correctly:
  updateDocument('users', 'USER_A_ID', data)
       │
       ▼
  Firebase sends:
    POST /firestore/update
    {
      collection: 'users',
      docId: 'USER_A_ID',
      auth: { uid: 'USER_A_ID' }
    }
       │
       ▼
  Firestore checks rules:
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
                            └─► USER_A_ID == USER_A_ID?
                                YES! ✅ ALLOW
    }
       │
       ▼
  Result: Update successful ✅
```

---

## 📁 Firestore Collection Structure (Visual)

```
FIRESTORE DATABASE (dotapet-ad2f8)
│
├── 📦 users/ (Collection)
│   │
│   ├── 📄 userId-1 (Document)
│   │   ├── email: "user1@example.com"
│   │   ├── displayName: "John"
│   │   ├── username: "johnpet"
│   │   ├── phone: "123456789"
│   │   ├── location: "São Paulo"
│   │   ├── profileImage: "https://..."
│   │   ├── createdAt: 2024-11-26T10:00:00Z
│   │   └── updatedAt: 2024-11-26T10:00:00Z
│   │
│   ├── 📄 userId-2 (Document)
│   │   ├── email: "user2@example.com"
│   │   ├── displayName: "Jane"
│   │   └── ...
│   │
│   └── 📄 userId-3
│       └── ...
│
├── 📦 pets/ (Collection)
│   │
│   ├── 📄 petId-1 (Document)
│   │   ├── ownerId: "userId-1" ──────────────┐
│   │   ├── name: "Fluffy"                     │
│   │   ├── breed: "Golden Retriever"         │
│   │   ├── age: 3                            │
│   │   ├── gender: "Macho"                   │
│   │   ├── size: "grande"                    │
│   │   ├── images: ["url1", "url2"]          │ Linked!
│   │   ├── description: "Friendly dog"       │
│   │   ├── createdAt: 2024-11-26T11:00:00Z   │
│   │   └── updatedAt: 2024-11-26T11:00:00Z   │
│   │                                          │
│   ├── 📄 petId-2 (Document)                 │
│   │   ├── ownerId: "userId-1" ──────────────┤ Same owner!
│   │   ├── name: "Buddy"                     │
│   │   └── ...                               │
│   │                                         │
│   ├── 📄 petId-3                            │
│   │   ├── ownerId: "userId-2" ──────────────┘ Different owner
│   │   └── ...
│   │
│   └── 📄 petId-4
│       └── ...
│
└── 📦 adoptions/ (Collection - Optional)
    │
    ├── 📄 adoptionId-1
    │   ├── petId: "petId-1"
    │   ├── adopterId: "userId-3"
    │   ├── status: "pending"
    │   └── ...
    │
    └── 📄 adoptionId-2
        └── ...
```

---

## 🔄 Complete User Journey

```
START
  │
  ▼
┌─────────────────┐
│  WELCOME SCREEN │
└─────────────────┘
  │
  ├─► Entrar (Login)
  │     │
  │     ▼
  │   ┌──────────────┐
  │   │ LOGIN SCREEN │
  │   └──────────────┘
  │     │
  │     ├─► loginUser() ──► Firebase Auth
  │     │                      │
  │     │                      └─► users/{userId} loaded
  │     │
  │     └─► ✅ HOME SCREEN
  │
  │
  └─► Cadastro (Register)
        │
        ▼
      ┌──────────────────┐
      │ REGISTER SCREEN  │
      └──────────────────┘
        │
        ├─► registerUser() ──► Firebase Auth + Firestore
        │                         │
        │                         ├─► Firebase Auth: User created
        │                         └─► Firestore: users/{userId} created
        │
        ▼
      ┌──────────────────┐
      │  PROFILE SCREEN  │
      └──────────────────┘
        │
        ├─► updateDocument() ──► Firestore
        │                         │
        │                         └─► users/{userId} updated
        │                             ├── username
        │                             ├── phone
        │                             └── location
        │
        ▼
      ┌────────────────────┐
      │ REGISTER PET SCREEN│
      └────────────────────┘
        │
        ├─► addDocument() ──► Firestore
        │                      │
        │                      └─► pets/{petId} created
        │                          ├── ownerId: userId
        │                          ├── name, breed, age, etc.
        │
        ▼
      ┌─────────────────┐
      │  HOME SCREEN    │
      └─────────────────┘
        │
        ├─► queryDocuments() ──► Firestore
        │                         │
        │                         └─► Get pets where ownerId == userId
        │
        ▼
      Show User's Pets
      │
      ├─► Edit Pet ──► updateDocument()
      │
      ├─► Delete Pet ──► deleteDocument()
      │
      └─► Logout ──► Clear Auth + Back to Welcome

END
```

---

## 🎯 Summary

This architecture ensures:
- ✅ Data persistence (Firestore)
- ✅ User authentication (Firebase Auth)
- ✅ Data isolation (Users only see their own data)
- ✅ Security (Rules prevent unauthorized access)
- ✅ Scalability (Cloud database)
- ✅ Real-time updates (optional)

All happening automatically in your app! 🚀
