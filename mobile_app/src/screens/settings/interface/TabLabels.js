import React from 'react';
import { Switch, Text, View } from 'react-native';
import styles from '../styles';

export default function TabLabels({ settings, updateSetting }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Show Tab Labels</Text>
      <Switch
        value={settings.showTabLabels}
        onValueChange={(value) => updateSetting('showTabLabels', value)}
      />
    </View>
  );
} 