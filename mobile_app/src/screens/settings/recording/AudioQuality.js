import React from 'react';
import { Switch, Text, View } from 'react-native';
import styles from '../styles';

export default function AudioQuality({ settings, updateSetting }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>High Quality Audio</Text>
      <Switch
        value={settings.highQualityAudio}
        onValueChange={(value) => updateSetting('highQualityAudio', value)}
      />
    </View>
  );
} 