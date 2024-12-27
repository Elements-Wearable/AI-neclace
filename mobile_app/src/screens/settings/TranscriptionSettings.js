import React from 'react';
import { Switch, Text, View } from 'react-native';
import styles from './styles';

export default function TranscriptionSettings({ settings, updateSetting }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transcription</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Auto Speaker Detection</Text>
        <Switch
          value={settings.autoSpeakerDetection}
          onValueChange={(value) => updateSetting('autoSpeakerDetection', value)}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Smart Formatting</Text>
        <Switch
          value={settings.smartFormatting}
          onValueChange={(value) => updateSetting('smartFormatting', value)}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Auto Punctuation</Text>
        <Switch
          value={settings.autoPunctuation}
          onValueChange={(value) => updateSetting('autoPunctuation', value)}
        />
      </View>
    </View>
  );
} 