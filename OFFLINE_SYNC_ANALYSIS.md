# Mobile Student - Offline/Sync Functionality Analysis

## Executive Summary

This document analyzes the current state of the mobile-student project and three key commits (7f4f5e0, 95532b4, 725b569) from `origin/front-etud` that implement offline/sync capabilities. These features are **NOT currently in the main codebase** and represent significant architectural additions.

---

## 1. CURRENT STATE OF MOBILE-STUDENT PROJECT

### 1.1 Current Architecture

**Technology Stack:**
- **Framework**: Expo/React Native with Expo Router
- **State Management**: React Context (useAuth hook)
- **Storage**: 
  - Secure tokens: `expo-secure-store`
  - User preferences: `@react-native-async-storage/async-storage`
- **API Communication**: Axios with interceptors
- **Authentication**: JWT-based with refresh token mechanism

**Current Project Structure:**
```
mobile-student/src/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── on_boarding/       # Onboarding flow
│   ├── quiz/              # Quiz detail screen
│   └── _layout.tsx        # Root layout with navigation
├── core/
│   ├── api.ts             # Axios instance with interceptors
│   ├── config.ts          # API configuration
│   ├── constants.ts       # App constants
│   ├── di/                # Dependency injection
│   ├── services/          # Core services (push notifications, error handling)
│   └── types/             # TypeScript types
├── data/
│   ├── datasources/       # API data sources
│   └── repositories/      # Repository implementations
├── domain/
│   ├── entities/          # Domain models
│   ├── repositories/      # Repository interfaces
│   └── usecases/          # Business logic
└── presentation/
    ├── components/        # Reusable UI components
    └── hooks/             # Custom React hooks
```

### 1.2 Current Authentication & API Integration

**Authentication Flow:**
1. User logs in with matricule + password
2. Backend returns: `token`, `refreshToken`, `utilisateur`
3. Tokens stored in `expo-secure-store` (secure)
4. User data stored in `AsyncStorage`

**API Interceptors (in `src/core/api.ts`):**
- **Request Interceptor**: Automatically adds JWT token to headers
- **Response Interceptor**: 
  - Handles 401 errors with automatic token refresh
  - Implements queue for failed requests during refresh
  - Cleans up storage on refresh failure

**Current Limitations:**
- ❌ No offline support
- ❌ No local database
- ❌ No data caching
- ❌ No sync queue for failed requests
- ❌ No background sync capability

---

## 2. COMMIT ANALYSIS: OFFLINE/SYNC FEATURES

### 2.1 Commit 7f4f5e0: "FEAT: mode online / offline" (Jan 4, 03:04)

**Purpose**: Introduces comprehensive offline/sync infrastructure

**Files Added/Modified:**

#### A. Database Layer
**File**: `src/data/database/SQLiteDatabase.ts` (NEW - 157 lines)

**Key Features:**
- Singleton pattern for database instance
- SQLite database initialization with `expo-sqlite`
- Schema with 8 tables:
  - `users` - Cached user data
  - `courses` - Cached course information
  - `evaluations` - Quiz evaluations with status
  - `quizzes` - Quiz details
  - `questions` - Quiz questions
  - `answers` - Draft answers (local storage)
  - `submissions` - Completed quizzes awaiting sync
  - `sync_queue` - General sync tasks queue

**Critical Methods:**
```typescript
- init(): Promise<void>                    // Initialize DB
- createTables(): Promise<void>            // Create schema
- migrateUserTable(): Promise<void>        // Handle schema migrations
- executeQuery(query, params): Promise<any[]>
- executeUpdate(query, params): Promise<any>
- clearAll(): Promise<void>
- debugSchema(): Promise<void>             // Dev debugging
```

**Schema Highlights:**
- Timestamps: `synced_at`, `updated_at` for tracking sync status
- Foreign keys with CASCADE delete
- Indexes on frequently queried columns
- `synced` flag (0/1) to track sync status

#### B. Repository Layer
**File**: `src/data/repositories/OfflineQuizRepository.ts` (NEW - 273 lines)

**Key Features:**
- Manages all offline quiz/evaluation data
- Implements local CRUD operations
- Tracks sync status

**Main Methods:**
```typescript
// Courses
- saveCourse(course): Promise<void>
- getCourse(courseId): Promise<any | null>

// Evaluations
- saveEvaluations(evaluations): Promise<void>
- getAllEvaluations(): Promise<Evaluation[]>
- getEvaluation(evaluationId): Promise<Evaluation | null>
- updateEvaluationStatus(evaluationId, status): Promise<void>

// Quiz Details
- saveQuizDetails(quizz): Promise<void>
- getQuizDetails(quizzId): Promise<Quizz | null>
- hasQuizDetails(quizzId): Promise<boolean>

// Questions
- saveQuestions(questions): Promise<void>
- getQuestions(quizzId): Promise<QuizzQuestion[]>

// Answers (Draft Responses)
- saveAnswer(questionId, quizzId, content): Promise<void>
- getAnswers(quizzId): Promise<any[]>
- deleteAnswers(quizzId): Promise<void>

// Submissions (Completed Quizzes)
- saveSubmission(quizzId, evaluationId, responses): Promise<void>
- getPendingSubmissions(): Promise<any[]>
- markSubmissionAsSynced(submissionId): Promise<void>
- incrementSubmissionRetries(submissionId, error): Promise<void>
```

**File**: `src/data/repositories/OfflineUserRepository.ts` (NEW - 226 lines)

**Key Features:**
- Manages cached user data
- Stores complete user profile locally

**Main Methods:**
```typescript
- saveUser(user): Promise<void>
- getUser(userId): Promise<any | null>
- updateUserProfile(userId, updates): Promise<void>
- getAllUsers(): Promise<any[]>
```

#### C. Sync Service
**File**: `src/data/services/SyncService.tsx` (NEW - 319 lines)

**Purpose**: Core synchronization engine

**Key Features:**
- Singleton pattern
- Manages data download and upload
- Handles retry logic
- Tracks sync status

**Main Methods:**
```typescript
// Download
- downloadAllData(userId): Promise<{success, message}>
  * Downloads evaluations
  * Downloads quiz details for active quizzes
  * Downloads user info

// Upload
- syncSubmissions(): Promise<{success, failed}>
  * Sends pending quiz submissions
  * Updates evaluation status
  * Cleans up draft answers

// General Sync
- syncAll(): Promise<{success, failed}>
  * Orchestrates all sync operations
  * Prevents concurrent syncs

// Status
- getSyncStatus(): Promise<{pending, failed, lastSync}>
- setLastSyncTime(): Promise<void>
- cleanOldData(): Promise<void>
```

**Sync Queue Management:**
- Stores failed operations in `sync_queue` table
- Implements retry logic (max 3 attempts)
- Tracks error messages

#### D. Auto-Sync Service
**File**: `src/data/services/AutoSyncService.ts` (NEW - 210 lines)

**Purpose**: Automatic background synchronization

**Key Features:**
- Monitors network connectivity
- Monitors app state (foreground/background)
- Periodic sync every 2 minutes
- Minimum 30-second interval between sync attempts

**Triggers:**
1. Network connection restored
2. App returns to foreground
3. Periodic check (2 minutes)
4. Manual force sync

**Main Methods:**
```typescript
- start(): void                           // Start auto-sync
- stop(): void                            // Stop auto-sync
- forceSyncNow(): Promise<{success, failed}>
```

#### E. UI Components
**File**: `src/presentation/components/SyncStatusBanner.tsx` (NEW - 105 lines)

**Purpose**: Visual feedback for sync status

**Features:**
- Shows sync status (syncing, pending, failed)
- Displays last sync time
- Manual sync button
- Color-coded status indicators

#### F. Custom Hooks
**File**: `src/presentation/hooks/useAutoSync.tsx` (NEW - 82 lines)

**Purpose**: React hook for auto-sync integration

**Features:**
```typescript
- useAutoSync(): {
    isOnline: boolean
    isSyncing: boolean
    syncStatus: {pending, failed, lastSync}
    sync(): Promise<{success, message, details}>
    refreshStatus(): Promise<void>
  }
```

**Auto-sync Behavior:**
- Triggers sync when connection restored
- Monitors pending items
- Provides manual sync capability

#### G. Modified Files

**File**: `src/app/_layout.tsx` (MODIFIED)

**Changes:**
- Added `AppInitializer` component wrapper
- Initializes SQLiteDatabase on app startup
- Runs schema migrations
- Cleans old sync data
- Shows loading screen during initialization
- Starts AutoSyncService when user authenticates

**New Code:**
```typescript
export function AppInitializer({ children }) {
  // 1. Initialize SQLiteDatabase
  // 2. Run migrations
  // 3. Clean old data
  // 4. Show loading screen
}

// In RootLayoutNav:
useEffect(() => {
  if (isAuthenticated && !isLoading) {
    autoSyncService.start();
  } else {
    autoSyncService.stop();
  }
}, [isAuthenticated, isLoading]);
```

**File**: `src/presentation/hooks/useAuth.tsx` (MODIFIED)

**Changes:**
- Added background initialization of push notifications
- Added background fetch of complete student info
- Improved logging

**File**: `src/app/(tabs)/accueil.tsx` (MODIFIED - 241 lines)

**Changes:**
- Integrated offline/online mode detection
- Shows sync status banner
- Handles offline data display
- Implements manual sync trigger

**File**: `src/app/(tabs)/profil.tsx` (MODIFIED - 170 lines)

**Changes:**
- Offline profile display
- Sync status integration

**File**: `src/app/(tabs)/quizz.tsx` (MODIFIED - 84 lines)

**Changes:**
- Offline quiz list display
- Sync status integration

**File**: `src/app/debug/UserDebug.tsx` (NEW - 248 lines)

**Purpose**: Debug screen for development

**Features:**
- View cached user data
- View sync status
- Manual sync trigger
- Clear database

**File**: `src/app/debug/db.tsx` (NEW - 404 lines)

**Purpose**: Database debug screen

**Features:**
- View all database tables
- View table schemas
- View record counts
- Clear specific tables
- Export data

**File**: `app.json` (MODIFIED)

**Changes:**
- Added debug screens to app configuration

**File**: `eas.json` (MODIFIED)

**Changes:**
- EAS build configuration updates

---

### 2.2 Commit 95532b4: "FEAT: synchronisation" (Jan 4, 10:48)

**Purpose**: Refactor and simplify sync implementation

**Files Modified:**

#### Changes Summary:
- **Removed**: `AutoSyncService.ts` (210 lines)
- **Removed**: `useAutoSync.tsx` (82 lines)
- **Modified**: `src/app/_layout.tsx` (30 lines changed)
- **Modified**: `src/app/(tabs)/accueil.tsx` (241 lines changed)

**Key Changes:**

1. **Removed AutoSyncService**
   - Simplifies sync logic
   - Removes periodic sync (2-minute interval)
   - Removes app state listener
   - Removes network listener

2. **Simplified App Layout**
   - Removes AutoSyncService initialization
   - Keeps database initialization
   - Keeps AppInitializer component

3. **Simplified Accueil Screen**
   - Removes auto-sync hook
   - Keeps manual sync capability
   - Keeps offline/online detection

**Rationale**: 
- AutoSyncService was too aggressive with background syncing
- Manual sync + network-triggered sync is sufficient
- Reduces battery drain and network usage

---

### 2.3 Commit 725b569: "FEAT: synchronisation envoie quizz en mode offline" (Jan 4, 14:07)

**Purpose**: Add offline quiz submission capability

**Files Modified:**

#### A. New Hook
**File**: `src/presentation/hooks/useOfflineSync.ts` (NEW - 11 lines)

**Purpose**: Simplified sync hook for offline quiz submission

**Features:**
```typescript
export function useOfflineSync() {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    failed: 0,
    lastSync: null
  });

  // Auto-sync when connection restored
  useEffect(() => {
    if (state.isConnected && state.isInternetReachable) {
      SyncService.getInstance().syncAll();
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    syncStatus,
    sync,
    refreshStatus
  };
}
```

**Key Behavior:**
- Detects network connection changes
- Automatically syncs when connection restored
- Provides manual sync capability

#### B. Dependencies
**File**: `package.json` (MODIFIED)

**New Dependencies:**
```json
{
  "@react-native-community/netinfo": "^11.4.1",
  "expo-sqlite": "~16.0.10"
}
```

**Version Changes:**
- `@react-native-async-storage/async-storage`: "1.24.0" → "^2.2.0"
- `expo`: "~54.0.30" → "~54.0.20"
- Various other minor version adjustments

#### C. App Layout
**File**: `src/app/_layout.tsx` (MODIFIED - 5 lines)

**Changes:**
- Adds `useOfflineSync` hook initialization
- Triggers sync on network connection

---

## 3. CURRENT REFRESH TOKEN IMPLEMENTATION

### 3.1 Current Implementation (in `src/core/api.ts`)

**Mechanism:**
```typescript
// Response interceptor handles 401 errors
if (error.response?.status === 401 && !originalRequest._retry) {
  if (isRefreshing) {
    // Queue request while refresh in progress
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(token => {
      originalRequest.headers['Authorization'] = 'Bearer ' + token;
      return apiClient(originalRequest);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken
    });

    const { token: newToken, refreshToken: newRefreshToken } = response.data;

    // Save new tokens
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, newToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

    // Process queued requests
    processQueue(null, newToken);

    // Retry original request
    originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
    return apiClient(originalRequest);

  } catch (refreshError) {
    // Refresh failed - logout
    processQueue(refreshError, null);
    
    // Clear storage
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}
```

**Key Features:**
- ✅ Automatic token refresh on 401
- ✅ Request queuing during refresh
- ✅ Prevents multiple simultaneous refresh attempts
- ✅ Cleans up on refresh failure
- ✅ Secure token storage

---

## 4. POTENTIAL CONFLICTS & INTEGRATION ISSUES

### 4.1 Conflicts with Current Refresh Token Implementation

**Issue 1: Dual Token Refresh Mechanisms**
- **Current**: Axios interceptor handles refresh automatically
- **Offline Commits**: SyncService also has refresh logic
- **Risk**: Race conditions, duplicate refresh attempts

**Issue 2: Offline Sync During Token Refresh**
- **Problem**: If token expires while offline, sync queue can't refresh
- **Impact**: Queued submissions will fail permanently
- **Solution**: Need to handle offline token refresh gracefully

**Issue 3: Network Detection**
- **Current**: No network detection in main app
- **Offline Commits**: Requires `@react-native-community/netinfo`
- **Risk**: Dependency not in current package.json

### 4.2 Missing Dependencies

**Required for Offline/Sync Features:**
```json
{
  "@react-native-community/netinfo": "^11.4.1",
  "expo-sqlite": "~16.0.10"
}
```

**Current Status**: ❌ NOT in current package.json

### 4.3 Architecture Conflicts

**Issue 1: Database Initialization Timing**
- **Current**: App initializes immediately
- **Offline**: Needs AppInitializer wrapper
- **Risk**: Timing issues with auth state

**Issue 2: Auto-Sync Service Lifecycle**
- **Current**: No background services
- **Offline (7f4f5e0)**: AutoSyncService with multiple listeners
- **Offline (95532b4)**: Removed AutoSyncService
- **Recommendation**: Use 95532b4 approach (simpler)

**Issue 3: Storage Keys**
- **Current**: Uses STORAGE_KEYS constants
- **Offline**: Adds new storage keys for sync status
- **Risk**: Key collision if not properly namespaced

---

## 5. WHAT'S MISSING VS WHAT EXISTS

### 5.1 Current Codebase (Exists ✅)

- ✅ JWT authentication with refresh tokens
- ✅ Secure token storage (expo-secure-store)
- ✅ API interceptors for automatic token injection
- ✅ Automatic token refresh on 401
- ✅ Request queuing during token refresh
- ✅ User context with login/logout
- ✅ Dependency injection container
- ✅ Error handling service
- ✅ Push notification service
- ✅ Async storage for user preferences

### 5.2 Offline/Sync Features (Missing ❌)

- ❌ SQLite local database
- ❌ Offline data caching
- ❌ Sync queue for failed requests
- ❌ Background sync service
- ❌ Network connectivity detection
- ❌ Offline/online mode UI
- ❌ Sync status tracking
- ❌ Draft answer storage
- ❌ Quiz submission queue
- ❌ Debug screens for database

### 5.3 Partial Implementation

- ⚠️ AsyncStorage (exists but not used for offline data)
- ⚠️ Error handling (exists but not integrated with sync)

---

## 6. INTEGRATION STRATEGY

### 6.1 Recommended Approach

**Phase 1: Foundation (Commit 7f4f5e0 + Modifications)**
1. Add missing dependencies to package.json
2. Implement SQLiteDatabase with schema
3. Implement OfflineQuizRepository
4. Implement OfflineUserRepository
5. Implement SyncService (core sync logic)
6. Add AppInitializer to _layout.tsx
7. Add network detection hook

**Phase 2: Simplification (Commit 95532b4 approach)**
1. Skip AutoSyncService (too aggressive)
2. Use manual sync + network-triggered sync
3. Simplify app layout
4. Reduce background activity

**Phase 3: UI Integration (Commit 725b569)**
1. Add useOfflineSync hook
2. Add SyncStatusBanner component
3. Integrate into main screens
4. Add manual sync buttons

### 6.2 Conflict Resolution

**For Refresh Token Conflicts:**
```typescript
// Option 1: Keep current interceptor, add offline fallback
// - Interceptor handles online refresh
// - SyncService queues offline submissions
// - When online, SyncService syncs queue

// Option 2: Centralize refresh in SyncService
// - Remove refresh from interceptor
// - All refresh goes through SyncService
// - More complex but cleaner

// Recommendation: Option 1 (minimal changes)
```

**For Network Detection:**
```typescript
// Add useNetworkStatus hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    return unsubscribe;
  }, []);
  
  return { isOnline };
}
```

**For Database Initialization:**
```typescript
// Keep AppInitializer but make it non-blocking
// Show splash screen during init
// Don't block auth state check
```

---

## 7. CRITICAL FILES TO INTEGRATE

### 7.1 Must-Have Files (from 7f4f5e0)

1. **`src/data/database/SQLiteDatabase.ts`**
   - Core database implementation
   - No modifications needed

2. **`src/data/repositories/OfflineQuizRepository.ts`**
   - Quiz/evaluation offline storage
   - No modifications needed

3. **`src/data/repositories/OfflineUserRepository.ts`**
   - User data offline storage
   - No modifications needed

4. **`src/data/services/SyncService.tsx`**
   - Core sync engine
   - **MODIFICATION NEEDED**: Handle offline token refresh

5. **`src/presentation/hooks/useNetworkStatus.ts`** (NEW)
   - Network detection
   - Required dependency: `@react-native-community/netinfo`

### 7.2 Should-Have Files (from 7f4f5e0)

1. **`src/presentation/components/SyncStatusBanner.tsx`**
   - UI feedback for sync status
   - Optional but recommended

2. **`src/app/debug/db.tsx`**
   - Database debugging
   - Development only

3. **`src/app/debug/UserDebug.tsx`**
   - User data debugging
   - Development only

### 7.3 Nice-to-Have Files (from 725b569)

1. **`src/presentation/hooks/useOfflineSync.ts`**
   - Simplified sync hook
   - Wrapper around SyncService

### 7.4 Modified Files

1. **`src/app/_layout.tsx`**
   - Add AppInitializer wrapper
   - Initialize database on startup
   - Start sync on authentication

2. **`package.json`**
   - Add `@react-native-community/netinfo`
   - Add `expo-sqlite`
   - Update async-storage version

3. **`src/core/api.ts`**
   - **OPTIONAL**: Add offline fallback for token refresh
   - Current implementation should work as-is

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Setup
- [ ] Add dependencies to package.json
- [ ] Create `src/data/database/SQLiteDatabase.ts`
- [ ] Create `src/data/repositories/OfflineQuizRepository.ts`
- [ ] Create `src/data/repositories/OfflineUserRepository.ts`
- [ ] Create `src/presentation/hooks/useNetworkStatus.ts`

### Phase 2: Core Services
- [ ] Create `src/data/services/SyncService.tsx`
- [ ] Add offline token refresh handling
- [ ] Create `src/presentation/hooks/useOfflineSync.ts`

### Phase 3: UI Integration
- [ ] Create `src/presentation/components/SyncStatusBanner.tsx`
- [ ] Modify `src/app/_layout.tsx` with AppInitializer
- [ ] Modify `src/app/(tabs)/accueil.tsx` for offline display
- [ ] Modify `src/app/(tabs)/quizz.tsx` for offline display
- [ ] Modify `src/app/(tabs)/profil.tsx` for offline display

### Phase 4: Testing & Debug
- [ ] Create `src/app/debug/db.tsx`
- [ ] Create `src/app/debug/UserDebug.tsx`
- [ ] Test offline data caching
- [ ] Test sync on reconnection
- [ ] Test token refresh offline

### Phase 5: Optimization
- [ ] Remove aggressive auto-sync (follow 95532b4)
- [ ] Optimize database queries
- [ ] Add error recovery
- [ ] Performance testing

---

## 9. RISK ASSESSMENT

### High Risk
- 🔴 Token refresh during offline sync
- 🔴 Database schema migrations
- 🔴 Concurrent sync operations

### Medium Risk
- 🟡 Network detection reliability
- 🟡 Storage quota limits
- 🟡 Sync queue cleanup

### Low Risk
- 🟢 UI integration
- 🟢 Debug screens
- 🟢 Manual sync triggers

---

## 10. SUMMARY

**Current State**: 
- ✅ Solid authentication with refresh tokens
- ❌ No offline support
- ❌ No data caching
- ❌ No sync queue

**Proposed Solution**:
- Integrate SQLite database layer
- Implement SyncService for offline/online sync
- Add network detection
- Integrate UI components
- Handle token refresh offline

**Key Conflicts**:
- Dual token refresh mechanisms (resolvable)
- Missing dependencies (easy fix)
- Architecture timing issues (manageable)

**Recommendation**:
- Follow commit 7f4f5e0 for core infrastructure
- Follow commit 95532b4 for simplified sync (skip AutoSyncService)
- Follow commit 725b569 for UI integration
- Add offline token refresh handling
- Test thoroughly before production

