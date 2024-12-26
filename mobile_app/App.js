import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SETTINGS_KEY } from './src/config/constants';

import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [settings, setSettings] = useState({
    showTabLabels: true,
    tabBarAnimation: true,
  });

  useEffect(() => {
    loadSettings();
    const interval = setInterval(loadSettings, 300);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#eee',
            paddingBottom: 5,
            paddingTop: 5,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            paddingBottom: 5,
            display: settings.showTabLabels ? 'flex' : 'none',
          },
          tabBarShowLabel: settings.showTabLabels,
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Record" 
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={focused ? 'mic' : 'mic-outline'} 
                  size={32} 
                  color={focused ? '#6200ee' : color}
                />
              </View>
            ),
          }}
        />
        <Tab.Screen 
          name="Summary" 
          component={SummaryScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'document-text' : 'document-text-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'time' : 'time-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'settings' : 'settings-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
  }
});
