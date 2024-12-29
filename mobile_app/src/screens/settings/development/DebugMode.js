import React from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import logger from '../../../utils/logger';
import styles from '../styles';

export default function DebugMode({ settings, updateSetting }) {
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