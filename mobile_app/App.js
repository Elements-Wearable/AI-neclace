import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { SETTINGS_KEY } from './src/config/constants';

import TabNavigator from './src/screens/navigation/TabNavigator';

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
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <TabNavigator settings={settings} />
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
