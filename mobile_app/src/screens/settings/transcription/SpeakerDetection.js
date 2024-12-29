import React from 'react';
import { Switch, Text, View } from 'react-native';
import styles from '../styles';

export default function SpeakerDetection({ settings, updateSetting }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Auto Speaker Detection</Text>
      <Switch
        value={settings.autoSpeakerDetection}
        onValueChange={(value) => updateSetting('autoSpeakerDetection', value)}
      />
    </View>
  );
} 