import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SyncStatusBanner } from '../../presentation/components/SyncStatusBanner';
import { SQLiteDatabase } from '../../data/database/SQLiteDatabase';

export default function TabLayout() {
  useEffect(() => {
    const checkStuckSubmissions = async () => {
      try {
        const db = SQLiteDatabase.getInstance();
        const rows = await db.executeQuery(
          'SELECT COUNT(*) as count FROM submissions WHERE retry_count >= 3 AND synced = 0'
        );
        const count = rows[0]?.count ?? 0;
        if (count > 0) {
          Alert.alert(
            'Soumissions non synchronisées',
            `${count} soumission(s) n'ont pas pu être envoyées après plusieurs tentatives. Vérifiez votre connexion et relancez l'application.`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.warn('⚠️ Erreur vérification soumissions bloquées:', error);
      }
    };

    checkStuckSubmissions();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SyncStatusBanner />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#3A5689',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="accueil"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="quizz"
          options={{
            title: 'Quizz',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="quiz" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="historique"
          options={{
            title: 'Historique',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="history" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="user" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="notifications" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
