# Offline/Sync - Conflict Resolution Guide

## Overview

This document addresses potential conflicts between the current refresh token implementation and the new offline/sync features from commits 7f4f5e0, 95532b4, and 725b569.

---

## Conflict 1: Dual Token Refresh Mechanisms

### Current Implementation (in `src/core/api.ts`)

**Mechanism**: Axios response interceptor
```typescript
// Automatic refresh on 401 error
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh token and retry
      const newToken = await refreshTokenFromServer();
      originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

**Characteristics**:
- ✅ Automatic and transparent
- ✅ Handles request queuing
- ✅ Prevents multiple simultaneous refreshes
- ❌ Only works when online
- ❌ Doesn't handle offline scenarios

### Offline Implementation (in `src/data/services/SyncService.tsx`)

**Mechanism**: Manual refresh in sync service
```typescript
// Manual refresh when syncing offline submissions
private async refreshTokenOffline(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  // Save new token
  return response.data.token;
}
```

**Characteristics**:
- ✅ Handles offline scenarios
- ✅ Explicit control
- ❌ Duplicate refresh logic
- ❌ Potential race conditions

### Conflict Scenarios

**Scenario 1: Concurrent Refresh Attempts**
```
Timeline:
1. Request A fails with 401
2. Interceptor starts refresh
3. SyncService also tries to refresh
4. Both send refresh requests simultaneously
5. Server processes both, invalidates first token
6. One refresh fails
```

**Scenario 2: Token Expiration During Offline Sync**
```
Timeline:
1. User goes offline
2. Token expires
3. SyncService tries to sync
4. Interceptor can't refresh (offline)
5. SyncService tries to refresh (offline)
6. Both fail
7. Submissions stuck in queue
```

**Scenario 3: Stale Token in Interceptor**
```
Timeline:
1. SyncService refreshes token
2. Saves new token to SecureStore
3. Interceptor still has old token in memory
4. Interceptor uses old token
5. Request fails with 401
```

### Resolution Strategy

**Option 1: Interceptor-First (Recommended)**

Keep current interceptor, add offline fallback in SyncService:

```typescript
// In src/core/api.ts - NO CHANGES NEEDED
// Interceptor handles online refresh automatically

// In src/data/services/SyncService.tsx
async syncSubmissions(): Promise<{ success: number; failed: number }> {
  for (const submission of pendingSubmissions) {
    try {
      // Try to sync - interceptor will handle refresh if needed
      const response = await apiClient.post(
        `/evaluations/quizz/${submission.quizzId}/submit`,
        { reponses: submission.reponses }
      );
      // Success
      await this.quizzRepo.markSubmissionAsSynced(submission.id);
    } catch (error: any) {
      // If 401 and offline, try manual refresh
      if (error.response?.status === 401 && !isOnline) {
        const newToken = await this.refreshTokenOffline();
        if (newToken) {
          // Retry with new token
          try {
            const retryResponse = await apiClient.post(
              `/evaluations/quizz/${submission.quizzId}/submit`,
              { reponses: submission.reponses }
            );
            await this.quizzRepo.markSubmissionAsSynced(submission.id);
          } catch (retryError) {
            // Still failed, queue for later
            await this.quizzRepo.incrementSubmissionRetries(submission.id, retryError.message);
          }
        }
      } else {
        // Other error, queue for retry
        await this.quizzRepo.incrementSubmissionRetries(submission.id, error.message);
      }
    }
  }
}
```

**Advantages**:
- ✅ Minimal changes to current code
- ✅ Leverages existing interceptor
- ✅ Clear separation of concerns
- ✅ No race conditions

**Disadvantages**:
- ❌ Slight code duplication
- ❌ Two refresh paths

**Implementation**:
1. Keep `src/core/api.ts` as-is
2. Add `refreshTokenOffline()` to SyncService
3. Use it only as fallback for offline scenarios

---

**Option 2: Centralized Refresh (Alternative)**

Move all refresh logic to SyncService:

```typescript
// In src/core/api.ts
// Remove refresh logic from interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Delegate to SyncService
      const syncService = SyncService.getInstance();
      const newToken = await syncService.refreshToken();
      
      if (newToken) {
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// In src/data/services/SyncService.tsx
async refreshToken(): Promise<string | null> {
  if (this.isRefreshing) {
    // Wait for ongoing refresh
    return new Promise((resolve) => {
      this.refreshQueue.push(resolve);
    });
  }

  this.isRefreshing = true;
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    
    const newToken = response.data.token;
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, newToken);
    
    // Notify waiting requests
    this.refreshQueue.forEach(resolve => resolve(newToken));
    this.refreshQueue = [];
    
    return newToken;
  } catch (error) {
    this.refreshQueue.forEach(resolve => resolve(null));
    this.refreshQueue = [];
    return null;
  } finally {
    this.isRefreshing = false;
  }
}
```

**Advantages**:
- ✅ Single source of truth
- ✅ Easier to debug
- ✅ Consistent behavior

**Disadvantages**:
- ❌ Requires modifying interceptor
- ❌ Circular dependency (api.ts depends on SyncService)
- ❌ More complex

**Recommendation**: Use Option 1 (Interceptor-First)

---

## Conflict 2: Network Detection

### Current Implementation

**Status**: No network detection in current codebase

**Impact**: 
- App assumes always online
- No offline UI feedback
- No offline-specific handling

### Offline Implementation

**Required**: `@react-native-community/netinfo`

**Usage**:
```typescript
import NetInfo from '@react-native-community/netinfo';

// Check current state
const state = await NetInfo.fetch();
const isOnline = state.isConnected && state.isInternetReachable;

// Listen for changes
const unsubscribe = NetInfo.addEventListener(state => {
  const isOnline = state.isConnected && state.isInternetReachable;
});
```

### Resolution

**Action**: Add network detection hook

**File**: `src/presentation/hooks/useNetworkStatus.ts`

```typescript
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial state
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected === true && state.isInternetReachable === true);
    });

    // Listen for changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected === true && state.isInternetReachable === true;
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
}
```

**Integration**:
- No conflicts with current code
- Used by SyncService and UI components
- Optional for existing features

---

## Conflict 3: Database Initialization Timing

### Current Implementation

**Status**: App initializes immediately

**Flow**:
```
App Start
  ↓
AuthProvider
  ↓
RootLayoutNav
  ↓
Navigation Logic
```

### Offline Implementation

**Required**: Database initialization before auth check

**Flow**:
```
App Start
  ↓
AppInitializer (NEW)
  ├─ Initialize SQLiteDatabase
  ├─ Run migrations
  └─ Clean old data
  ↓
AuthProvider
  ↓
RootLayoutNav
  ↓
Navigation Logic
```

### Conflict Scenarios

**Scenario 1: Auth Check Before DB Ready**
```
Timeline:
1. App starts
2. AuthProvider checks stored token
3. Database not ready yet
4. Navigation logic runs
5. Database initialization completes
6. Inconsistent state
```

**Scenario 2: Long Initialization Delay**
```
Timeline:
1. App starts
2. Database initialization takes 5 seconds
3. User sees blank screen
4. Poor UX
```

### Resolution

**Action**: Add AppInitializer wrapper with loading screen

**File**: `src/app/_layout.tsx`

```typescript
interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const db = SQLiteDatabase.getInstance();
      await db.init();
      await db.migrateUserTable();
      
      const syncService = SyncService.getInstance();
      await syncService.cleanOldData();
      
      setDbReady(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!dbReady) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppInitializer>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppInitializer>
  );
}
```

**Advantages**:
- ✅ Database ready before auth check
- ✅ User sees loading screen
- ✅ Errors handled gracefully
- ✅ No race conditions

**Integration**:
- Wrap AuthProvider with AppInitializer
- Show loading screen during init
- Handle errors with retry option

---

## Conflict 4: Storage Keys Collision

### Current Implementation

**Storage Keys** (in `src/core/constants.ts`):
```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
} as const;
```

### Offline Implementation

**New Storage Keys** (in SyncService):
```typescript
// Potential keys:
'@last_sync'
'@sync_status'
'@pending_submissions'
```

### Conflict Scenarios

**Scenario 1: Key Collision**
```
If offline implementation uses same keys:
- '@auth_token' used by both auth and sync
- Data corruption possible
```

**Scenario 2: Storage Quota**
```
AsyncStorage has limited quota (~5-10MB)
- Auth tokens: ~1KB
- User data: ~10KB
- Sync queue: ~100KB
- Database: ~50MB (SQLite, not AsyncStorage)
```

### Resolution

**Action 1**: Use namespaced keys

```typescript
// In src/core/constants.ts
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  
  // Sync (NEW)
  LAST_SYNC: '@sync_last_sync',
  SYNC_STATUS: '@sync_status',
} as const;
```

**Action 2**: Use SQLite for large data

```typescript
// Don't store in AsyncStorage:
// - Sync queue (use SQLite)
// - Pending submissions (use SQLite)
// - Draft answers (use SQLite)

// Only store in AsyncStorage:
// - Last sync time (small)
// - Sync status (small)
// - User preferences (small)
```

**Integration**:
- Update STORAGE_KEYS in constants.ts
- Use SQLite for all large data
- Use AsyncStorage only for small metadata

---

## Conflict 5: Auto-Sync Service Lifecycle

### Commit 7f4f5e0 Implementation

**AutoSyncService**: Aggressive background syncing
```typescript
- Network listener (immediate sync on reconnect)
- App state listener (sync on foreground)
- Periodic sync (every 2 minutes)
- Minimum 30-second interval between attempts
```

**Issues**:
- ❌ Battery drain
- ❌ Network usage
- ❌ Too aggressive

### Commit 95532b4 Refactoring

**Changes**:
- Removed AutoSyncService
- Removed periodic sync
- Removed app state listener
- Kept network listener (implicit in useOfflineSync)

**Rationale**:
- Manual sync + network-triggered sync sufficient
- Reduces background activity
- Better battery life

### Recommendation

**Use Commit 95532b4 Approach**:

1. **Don't implement AutoSyncService**
2. **Use useOfflineSync hook instead**:
   - Detects network reconnection
   - Triggers sync automatically
   - Provides manual sync button
   - No periodic sync

**Implementation**:
```typescript
// In screens that need sync
export function AccueilScreen() {
  const { isOnline, isSyncing, sync } = useOfflineSync();

  return (
    <View>
      {!isOnline && <OfflineBanner />}
      {isSyncing && <SyncingIndicator />}
      <Button onPress={sync} title="Sync Now" />
      {/* Screen content */}
    </View>
  );
}
```

---

## Conflict 6: Refresh Token Endpoint Compatibility

### Current Implementation

**Endpoint**: `/auth/refresh`

**Request**:
```typescript
POST /auth/refresh
{
  refreshToken: "..."
}
```

**Response**:
```typescript
{
  token: "...",
  refreshToken: "..."
}
```

### Offline Implementation

**Expected**: Same endpoint and format

**Potential Issues**:
- ❌ Backend might not support refresh endpoint
- ❌ Different request/response format
- ❌ Rate limiting on refresh endpoint

### Resolution

**Action 1**: Verify backend supports refresh

```bash
# Test refresh endpoint
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "..."}'
```

**Action 2**: If not supported, implement fallback

```typescript
// In SyncService
async refreshTokenOffline(): Promise<string | null> {
  try {
    // Try standard refresh
    const response = await apiClient.post('/auth/refresh', {
      refreshToken: await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN)
    });
    return response.data.token;
  } catch (error) {
    // Fallback: Force re-login
    console.warn('⚠️ Refresh failed, user needs to re-login');
    return null;
  }
}
```

**Action 3**: Update backend if needed

```javascript
// Backend: Add refresh endpoint if missing
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const newToken = jwt.sign(
      { userId: decoded.userId },
      TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      token: newToken,
      refreshToken: refreshToken // Or generate new one
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

## Conflict 7: Sync Service Dependencies

### Current Implementation

**Dependencies**:
- axios (apiClient)
- expo-secure-store
- @react-native-async-storage/async-storage

### Offline Implementation

**New Dependencies**:
- expo-sqlite
- @react-native-community/netinfo

**Potential Issues**:
- ❌ Version conflicts
- ❌ Platform compatibility
- ❌ Build issues

### Resolution

**Action**: Verify dependency compatibility

```bash
# Check for conflicts
npm ls

# Install with specific versions
npm install expo-sqlite@~16.0.10 @react-native-community/netinfo@^11.4.1
```

**Compatibility Matrix**:
```
expo-sqlite ~16.0.10
  ├─ Requires: expo ~54.0.x
  └─ Compatible: React Native 0.81.x

@react-native-community/netinfo ^11.4.1
  ├─ Requires: React Native 0.60+
  └─ Compatible: React Native 0.81.x

Current versions:
  ├─ expo: ~54.0.30 ✅
  ├─ react-native: 0.81.5 ✅
  └─ All compatible ✅
```

---

## Summary of Resolutions

| Conflict | Current | Offline | Resolution |
|----------|---------|---------|-----------|
| Token Refresh | Interceptor | Manual | Use Option 1: Interceptor-first with offline fallback |
| Network Detection | None | Required | Add useNetworkStatus hook |
| DB Initialization | Immediate | Delayed | Add AppInitializer wrapper |
| Storage Keys | Limited | Expanded | Use namespaced keys + SQLite |
| Auto-Sync | None | Aggressive | Use simplified approach (95532b4) |
| Refresh Endpoint | Assumed | Required | Verify backend support |
| Dependencies | Existing | New | Verify compatibility |

---

## Implementation Order

1. **First**: Add dependencies (package.json)
2. **Second**: Create useNetworkStatus hook
3. **Third**: Create SQLiteDatabase
4. **Fourth**: Create SyncService with offline refresh (Option 1)
5. **Fifth**: Create AppInitializer wrapper
6. **Sixth**: Add UI components
7. **Seventh**: Test all conflict scenarios

---

## Testing Conflict Scenarios

### Test 1: Concurrent Refresh Attempts
```typescript
// Simulate:
1. Go online
2. Make request that fails with 401
3. Immediately make another request that fails with 401
4. Verify only one refresh attempt
5. Verify both requests succeed after refresh
```

### Test 2: Token Expiration Offline
```typescript
// Simulate:
1. Go offline
2. Mock token expiration
3. Try to sync
4. Verify offline refresh works
5. Verify sync succeeds
```

### Test 3: Database Initialization Race
```typescript
// Simulate:
1. Start app
2. Immediately check auth state
3. Verify database is ready
4. Verify no race conditions
```

### Test 4: Storage Quota
```typescript
// Simulate:
1. Fill AsyncStorage with data
2. Try to store sync status
3. Verify graceful handling
4. Verify SQLite used for large data
```

### Test 5: Network Reconnection
```typescript
// Simulate:
1. Go offline
2. Make changes
3. Go online
4. Verify auto-sync triggers
5. Verify no duplicate syncs
```

