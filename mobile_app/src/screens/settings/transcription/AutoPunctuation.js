import React from 'react';
import { Switch, Text, View } from 'react-native';
import styles from '../styles';

export default function AutoPunctuation({ settings, updateSetting }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Auto Punctuation</Text>
      <Switch
        value={settings.autoPunctuation}
        onValueChange={(value) => updateSetting('autoPunctuation', value)}
      />
    </View>
  );
} 