import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from './src/screens/Home';
import Biblioteca from './src/screens/Biblioteca';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0d14" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a0d14',
            borderTopColor: '#1f293d',
            height: 60,
            paddingBottom: 6,
          },
          tabBarActiveTintColor: '#00f0ff', 
          tabBarInactiveTintColor: '#62697a',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Descobrir') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Minha Caixa') {
              iconName = focused ? 'cube' : 'cube-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Descobrir" component={Home} />
        <Tab.Screen name="Minha Caixa" component={Biblioteca} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}