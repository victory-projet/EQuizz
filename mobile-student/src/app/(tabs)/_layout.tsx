import React from 'react'
import { Tabs } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function _layout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="accueil"
                options={{
                    title: 'Accueil',
                    tabBarActiveTintColor: '#3A5689',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="home" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="quizz"
                options={{
                    title: 'Quizz',
                    tabBarActiveTintColor: '#3A5689',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="edit-note" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    title: 'Profil',
                    tabBarActiveTintColor: '#3A5689',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}