# Offline/Sync Implementation Guide

## Quick Reference

### Files to Create (in order)
1. `mobile-student/src/data/database/SQLiteDatabase.ts`
2. `mobile-student/src/data/repositories/OfflineQuizRepository.ts`
3. `mobile-student/src/data/repositories/OfflineUserRepository.ts`
4. `mobile-student/src/presentation/hooks/useNetworkStatus.ts`
5. `mobile-student/src/data/services/SyncService.tsx`
6. `mobile-student/src/presentation/hooks/useOfflineSync.ts`
7. `mobile-student/src/presentation/components/SyncStatusBanner.tsx`

### Files to Modify
1. `mobile-student/package.json` - Add dependencies
2. `mobile-student/src/app/_layout.tsx` - Add AppInitializer
3. `mobile-student/src/core/api.ts` - Optional: Add offline refresh handling

### Optional Debug Files
1. `mobile-student/src/app/debug/db.tsx`
2. `mobile-student/src/app/debug/UserDebug.tsx`

---

## Step-by-Step Implementation

### Step 1: Update Dependencies

**File**: `mobile-student/package.json`

**Add to dependencies:**
```json
{
  "@react-native-community/netinfo": "^11.4.1",
  "expo-sqlite": "~16.0.10"
}
```

**Update existing:**
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

**Command to install:**
```bash
npm install @react-native-community/netinfo expo-sqlite
```

---

### Step 2: Create SQLiteDatabase

**File**: `mobile-student/src/data/database/SQLiteDatabase.ts`

**Source**: From commit 7f4f5e0

**Key Points**:
- Singleton pattern
- 8 tables for offline data
- Migration support
- Debug utilities

**Integration Notes**:
- No modifications needed
- Copy as-is from commit 7f4f5e0

---

### Step 3: Create OfflineQuizRepository

**File**: `mobile-student/src/data/repositories/OfflineQuizRepository.ts`

**Source**: From commit 7f4f5e0

**Key Points**:
- Manages quiz/evaluation offline storage
- Tracks sync status
- Handles draft answers
- Manages submission queue

**Integration Notes**:
- No modifications needed
- Copy as-is from commit 7f4f5e0

---

### Step 4: Create OfflineUserRepository

**File**: `mobile-student/src/data/repositories/OfflineUserRepository.ts`

**Source**: From commit 7f4f5e0

**Key Points**:
- Caches user profile data
- Supports profile updates

**Integration Notes**:
- No modifications needed
- Copy as-is from commit 7f4f5e0

---

### Step 5: Create Network Status Hook

**File**: `mobile-student/src/presentation/hooks/useNetworkStatus.ts` (NEW)

**Purpose**: Detect online/offline status

**Implementation**:
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
      console.log('🌐 Network status:', online ? 'ONLINE' : 'OFFLINE');
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
}
```

**Integration Notes**:
- Simple wrapper around NetInfo
- Used by other hooks and components
- No external dependencies beyond NetInfo

---

### Step 6: Create SyncService

**File**: `mobile-student/src/data/services/SyncService.tsx`

**Source**: From commit 7f4f5e0 with modifications

**Key Modifications for Offline Token Refresh**:

```typescript
// Add this method to handle offline token refresh
private async refreshTokenOffline(): Promise<string | null> {
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      console.warn('⚠️ No refresh token available for offline sync');
      return null;
    }

    // Try to refresh using the API client
    // This will use the current token if available
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    
    if (response.data?.token) {
      // Save new tokens
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      if (response.data.refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
      }
      return response.data.token;
    }
  } catch (error) {
    console.error('❌ Offline token refresh failed:', error);
    return null;
  }
}

// Modify syncSubmissions to handle token refresh
async syncSubmissions(): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  try {
    const pendingSubmissions = await this.quizzRepo.getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        // Try to sync
        const response = await apiClient.post(
          `/evaluations/quizz/${submission.quizzId}/submit`,
          { reponses: submission.reponses }
        );

        if (response.data) {
          // Mark as synced
          await this.quizzRepo.markSubmissionAsSynced(submission.id);
          success++;
        }
      } catch (error: any) {
        // If 401, try to refresh token
        if (error.response?.status === 401) {
          const newToken = await this.refreshTokenOffline();
          if (newToken) {
            // Retry with new token
            try {
              const retryResponse = await apiClient.post(
                `/evaluations/quizz/${submission.quizzId}/submit`,
                { reponses: submission.reponses }
              );
              if (retryResponse.data) {
                await this.quizzRepo.markSubmissionAsSynced(submission.id);
                success++;
                continue;
              }
            } catch (retryError) {
              // Fall through to error handling
            }
          }
        }

        // Handle error
        failed++;
        await this.quizzRepo.incrementSubmissionRetries(
          submission.id,
          error.message || 'Erreur inconnue'
        );
      }
    }
  } catch (error) {
    console.error('❌ Erreur générale sync soumissions:', error);
  }

  return { success, failed };
}
```

**Integration Notes**:
- Copy from commit 7f4f5e0
- Add offline token refresh handling above
- Import SecureStore and STORAGE_KEYS
- Import apiClient from core/api

---

### Step 7: Create useOfflineSync Hook

**File**: `mobile-student/src/presentation/hooks/useOfflineSync.ts`

**Source**: From commit 725b569

**Implementation**:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { SyncService } from '../../data/services/SyncService';
import { useNetworkStatus } from './useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

export function useOfflineSync() {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    failed: 0,
    lastSync: null as number | null,
  });

  const syncService = SyncService.getInstance();

  // Auto-sync when connection restored
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('📡 Connection detected, triggering auto-sync...');
        setTimeout(() => {
          syncService.syncAll();
        }, 2000); // 2-second delay for stability
      }
    });
    return () => unsubscribe();
  }, []);

  // Load sync status
  const loadSyncStatus = useCallback(async () => {
    const status = await syncService.getSyncStatus();
    setSyncStatus(status);
  }, []);

  // Manual sync
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) {
      console.log('⏸️ Sync impossible: offline or already syncing');
      return { success: false, message: 'Hors ligne ou synchronisation en cours' };
    }

    setIsSyncing(true);
    try {
      const result = await syncService.syncAll();
      
      if (result.success > 0) {
        await syncService.setLastSyncTime();
      }

      await loadSyncStatus();

      return {
        success: true,
        message: `${result.success} tâche(s) synchronisée(s)`,
        details: result,
      };
    } catch (error: any) {
      console.error('❌ Erreur synchronisation:', error);
      return {
        success: false,
        message: error.message || 'Erreur de synchronisation',
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, loadSyncStatus]);

  // Auto-sync when connection restored and items pending
  useEffect(() => {
    if (isOnline && syncStatus.pending > 0) {
      console.log('📡 Connection detected, auto-syncing...');
      const timer = setTimeout(() => {
        sync();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncStatus.pending, sync]);

  // Load status on mount
  useEffect(() => {
    loadSyncStatus();
  }, [loadSyncStatus]);

  return {
    isOnline,
    isSyncing,
    syncStatus,
    sync,
    refreshStatus: loadSyncStatus,
  };
}
```

**Integration Notes**:
- Copy from commit 725b569
- Depends on useNetworkStatus
- Depends on SyncService

---

### Step 8: Create SyncStatusBanner Component

**File**: `mobile-student/src/presentation/components/SyncStatusBanner.tsx`

**Source**: From commit 7f4f5e0

**Purpose**: Visual feedback for sync status

**Key Features**:
- Shows sync status (syncing, pending, failed)
- Displays last sync time
- Manual sync button
- Color-coded indicators

**Integration Notes**:
- Copy from commit 7f4f5e0
- Customize colors to match app theme
- Optional but recommended for UX

---

### Step 9: Modify App Layout

**File**: `mobile-student/src/app/_layout.tsx`

**Changes**:

1. **Add imports**:
```typescript
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SQLiteDatabase } from '../data/database/SQLiteDatabase';
import { SyncService } from '../data/services/SyncService';
```

2. **Add AppInitializer component**:
```typescript
interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>('Initialisation...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🔧 Initializing application...');
      
      setStep('Initializing database...');
      const db = SQLiteDatabase.getInstance();
      await db.init();

      setStep('Checking schema...');
      await db.migrateUserTable();

      setStep('Cleaning old data...');
      const syncService = SyncService.getInstance();
      await syncService.cleanOldData();

      if (__DEV__) {
        await db.debugSchema();
      }

      console.log('✅ Application initialized successfully');
      setDbReady(true);
    } catch (err: any) {
      console.error('❌ Initialization error:', err);
      setError(err.message || 'Initialization error');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.errorHint}>Please restart the application</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3A5689" />
        <Text style={styles.loadingText}>{step}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});
```

3. **Wrap RootLayout with AppInitializer**:
```typescript
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

**Integration Notes**:
- AppInitializer shows loading screen during DB init
- Non-blocking - doesn't prevent auth check
- Handles errors gracefully

---

### Step 10: Optional - Add Debug Screens

**File**: `mobile-student/src/app/debug/db.tsx`

**Source**: From commit 7f4f5e0

**Purpose**: Database debugging in development

**Features**:
- View all tables
- View schemas
- View record counts
- Clear tables
- Export data

**Integration Notes**:
- Development only
- Add to app.json debug section
- Remove before production

---

## Integration Checklist

### Phase 1: Dependencies & Setup
- [ ] Update package.json with new dependencies
- [ ] Run `npm install`
- [ ] Create SQLiteDatabase.ts
- [ ] Create OfflineQuizRepository.ts
- [ ] Create OfflineUserRepository.ts
- [ ] Create useNetworkStatus.ts

### Phase 2: Core Services
- [ ] Create SyncService.tsx with offline token refresh
- [ ] Create useOfflineSync.ts
- [ ] Test SyncService initialization

### Phase 3: UI Integration
- [ ] Create SyncStatusBanner.tsx
- [ ] Modify app/_layout.tsx with AppInitializer
- [ ] Test app startup with database initialization

### Phase 4: Testing
- [ ] Test offline data caching
- [ ] Test sync on reconnection
- [ ] Test token refresh offline
- [ ] Test concurrent sync prevention
- [ ] Test error recovery

### Phase 5: Optimization
- [ ] Remove aggressive auto-sync if needed
- [ ] Optimize database queries
- [ ] Performance testing
- [ ] Battery drain testing

---

## Testing Scenarios

### Scenario 1: Offline Quiz Submission
1. Go online, download quiz
2. Go offline
3. Submit quiz
4. Verify submission saved locally
5. Go online
6. Verify submission synced

### Scenario 2: Token Refresh Offline
1. Go online, login
2. Wait for token to expire (or mock expiration)
3. Go offline
4. Try to sync
5. Verify offline token refresh works
6. Verify sync succeeds

### Scenario 3: Network Reconnection
1. Go offline
2. Make changes (submit quiz, etc.)
3. Go online
4. Verify auto-sync triggers
5. Verify all changes synced

### Scenario 4: Sync Failure & Retry
1. Go offline
2. Submit quiz
3. Go online with bad connection
4. Verify sync fails
5. Verify retry logic works
6. Verify max retries (3) respected

---

## Troubleshooting

### Issue: Database initialization hangs
**Solution**: Check SQLiteDatabase.init() for errors in console

### Issue: Sync not triggering on reconnection
**Solution**: Verify NetInfo listener is set up correctly

### Issue: Token refresh fails offline
**Solution**: Ensure refresh token is stored in SecureStore

### Issue: Duplicate sync attempts
**Solution**: Check isSyncing flag in SyncService

### Issue: Database locked errors
**Solution**: Ensure only one sync operation at a time

---

## Performance Considerations

### Database Optimization
- Use indexes on frequently queried columns
- Batch insert operations
- Clean old data regularly

### Network Optimization
- Implement exponential backoff for retries
- Batch sync operations
- Compress data if needed

### Memory Optimization
- Limit sync queue size
- Clean up old submissions
- Use pagination for large datasets

---

## Security Considerations

### Token Management
- Always use SecureStore for tokens
- Implement token expiration checks
- Clear tokens on logout

### Data Privacy
- Encrypt sensitive data in database
- Implement data retention policies
- Clear cache on logout

### Network Security
- Use HTTPS only
- Validate SSL certificates
- Implement request signing if needed

