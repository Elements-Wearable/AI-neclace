import React, { useEffect } from 'react';
import { Alert, Platform, Switch, Text, View } from 'react-native';
import logger from '../../../utils/logger';
import styles from '../styles';

export default function DebugMode({ settings, updateSetting }) {
  // Monitor debug mode changes and log accordingly
  useEffect(() => {
    if (settings.debugMode) {
      logger.info('Debug mode state changed to:', settings.debugMode);
    }
  }, [settings.debugMode]);

  const testLogging = async () => {
    // Initial test logs
    logger.info('System info', { platform: Platform.OS, version: Platform.Version });
    logger.debug('Initial debug test message');
    logger.warn('Test warning message');
    
    // Add a delay to simulate time passing
    await new Promise(resolve => setTimeout(resolve, 1000));
    logger.debug('Debug message after 1s');
    logger.info('Info message after 1s');
    
    // Another delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    logger.debug('Final debug message after 2s');
    logger.error('Test error message');
  };

  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Debug Mode</Text>
      <Switch
        value={settings.debugMode}
        onValueChange={async (value) => {
          try {
            if (value) {
              await logger.createNewLogFile();
              logger.debug('Debug mode enabled');
              await testLogging();
            } else {
              logger.debug('Debug mode disabled');
              await logger.closeCurrentLogFile();
            }
            updateSetting('debugMode', value);
          } catch (error) {
            console.error('Failed to handle debug mode change:', error);
            Alert.alert('Error', 'Failed to handle debug mode change');
          }
        }}
      />
    </View>
  );
} 