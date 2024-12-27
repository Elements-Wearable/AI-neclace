import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import { SETTINGS_KEY, THEME_OPTIONS } from './src/config/constants';

import TabNavigator from './src/screens/navigation/TabNavigator';

export default function App() {
  const [settings, setSettings] = useState({
    showTabLabels: true,
    tabBarAnimation: true,
    theme: THEME_OPTIONS.SYSTEM,
  });
  const systemColorScheme = useColorScheme();
  
  const activeTheme = React.useMemo(() => {
    if (settings.theme === THEME_OPTIONS.SYSTEM) {
      return systemColorScheme;
    }
    return settings.theme;
  }, [settings.theme, systemColorScheme]);

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
    <SafeAreaView style={[styles.container, 
      { backgroundColor: activeTheme === 'dark' ? '#000' : '#fff' }
    ]}>
      <NavigationContainer
        theme={{
          dark: activeTheme === 'dark',
          colors: {
            primary: '#6200ee',
            background: activeTheme === 'dark' ? '#000' : '#fff',
            card: activeTheme === 'dark' ? '#1a1a1a' : '#fff',
            text: activeTheme === 'dark' ? '#fff' : '#000',
            border: activeTheme === 'dark' ? '#333' : '#eee',
            notification: '#6200ee',
          },
        }}
      >
        <TabNavigator settings={settings} />
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
