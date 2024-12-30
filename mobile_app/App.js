import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import { SETTINGS_KEY, THEME_OPTIONS } from './src/config/constants';
import logger from './src/utils/logger';

import TabNavigator from './src/screens/navigation/TabNavigator';

export default function App() {
  const [settings, setSettings] = useState({
    showTabLabels: true,
    tabBarAnimation: true,
    theme: THEME_OPTIONS.SYSTEM,
  });
  const [isLoading, setIsLoading] = useState(true);
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
    logger.debug('App initialized');
    return () => {
      logger.debug('Cleaning up app intervals');
      clearInterval(interval);
    }
  }, []);

  const loadSettings = async () => {
    try {
      logger.debug('Loading app settings');
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        global.debugMode = parsedSettings.debugMode;
        logger.debug('App settings loaded:', parsedSettings);
      }
    } catch (error) {
      logger.error('Error loading app settings:', error);
    }
  };

  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />;
  }

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
