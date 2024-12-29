import React from 'react';
import { Switch, Text, View } from 'react-native';
import styles from '../styles';

export default function SmartFormatting({ settings, updateSetting }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Smart Formatting</Text>
      <Switch
        value={settings.smartFormatting}
        onValueChange={(value) => updateSetting('smartFormatting', value)}
      />
    </View>
  );
} 